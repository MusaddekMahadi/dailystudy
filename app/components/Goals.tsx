"use client"

import { useState } from "react"
import { Target, Plus, Edit3, Trash2, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useData, type StudyGoal } from "./DataProvider"

export default function Goals() {
  const [showAddForm, setShowAddForm] = useState(false)
  const [newGoalType, setNewGoalType] = useState<"daily" | "weekly" | "monthly">("daily")
  const [newGoalHours, setNewGoalHours] = useState("")
  const [editingGoal, setEditingGoal] = useState<string | null>(null)

  const { studyGoals, setStudyGoals, getTodayProgress, getWeekProgress, getMonthProgress } = useData()

  const addGoal = () => {
    if (!newGoalHours || Number.parseFloat(newGoalHours) <= 0) return

    const newGoal: StudyGoal = {
      id: Date.now().toString(),
      type: newGoalType,
      targetHours: Number.parseFloat(newGoalHours),
      period: getCurrentPeriodStart(newGoalType),
      progress: 0,
    }

    setStudyGoals([...studyGoals, newGoal])
    setNewGoalHours("")
    setShowAddForm(false)
  }

  const deleteGoal = (id: string) => {
    setStudyGoals(studyGoals.filter((goal) => goal.id !== id))
  }

  const updateGoal = (id: string, updates: Partial<StudyGoal>) => {
    setStudyGoals(studyGoals.map((goal) => (goal.id === id ? { ...goal, ...updates } : goal)))
  }

  const getCurrentPeriodStart = (type: "daily" | "weekly" | "monthly") => {
    const now = new Date()
    switch (type) {
      case "daily":
        return new Date(now.getFullYear(), now.getMonth(), now.getDate())
      case "weekly":
        const startOfWeek = new Date(now)
        startOfWeek.setDate(now.getDate() - now.getDay())
        return new Date(startOfWeek.getFullYear(), startOfWeek.getMonth(), startOfWeek.getDate())
      case "monthly":
        return new Date(now.getFullYear(), now.getMonth(), 1)
    }
  }

  const getCurrentProgress = (type: "daily" | "weekly" | "monthly") => {
    switch (type) {
      case "daily":
        return getTodayProgress()
      case "weekly":
        return getWeekProgress()
      case "monthly":
        return getMonthProgress()
    }
  }

  const getProgressPercentage = (goal: StudyGoal) => {
    const currentProgress = getCurrentProgress(goal.type)
    const targetMinutes = goal.targetHours * 60
    return Math.min(100, (currentProgress / targetMinutes) * 100)
  }

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours > 0) {
      return `${hours}h ${mins}m`
    }
    return `${mins}m`
  }

  const getGoalPeriodText = (goal: StudyGoal) => {
    const now = new Date()
    switch (goal.type) {
      case "daily":
        return "today"
      case "weekly":
        return "this week"
      case "monthly":
        return "this month"
    }
  }

  const activeGoals = studyGoals.filter((goal) => {
    const periodStart = getCurrentPeriodStart(goal.type)
    return goal.period.getTime() === periodStart.getTime()
  })

  return (
    <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700 transition-colors duration-300">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-3">
          <Target className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
          Study Goals
        </h2>
        <Button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-indigo-600 hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          size="sm"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Goal
        </Button>
      </div>

      {/* Add Goal Form */}
      {showAddForm && (
        <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
          <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-3">Set New Goal</h3>
          <div className="flex gap-3">
            <Select
              value={newGoalType}
              onValueChange={(value: "daily" | "weekly" | "monthly") => setNewGoalType(value)}
            >
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
              </SelectContent>
            </Select>
            <Input
              placeholder="Hours (e.g., 2.5)"
              type="number"
              step="0.5"
              min="0.5"
              max="24"
              value={newGoalHours}
              onChange={(e) => setNewGoalHours(e.target.value)}
              className="flex-1"
            />
            <Button onClick={addGoal} disabled={!newGoalHours} className="bg-green-600 hover:bg-green-700">
              Add
            </Button>
            <Button onClick={() => setShowAddForm(false)} variant="outline">
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Goals List */}
      <div className="space-y-4">
        {activeGoals.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <Target className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No active goals set. Create your first study goal!</p>
          </div>
        ) : (
          activeGoals.map((goal) => {
            const currentProgress = getCurrentProgress(goal.type)
            const progressPercentage = getProgressPercentage(goal)
            const isCompleted = progressPercentage >= 100

            return (
              <div
                key={goal.id}
                className={`p-4 rounded-xl border-2 transition-all ${
                  isCompleted
                    ? "border-green-200 bg-green-50 dark:bg-green-900/20 dark:border-green-700"
                    : "border-gray-200 bg-white dark:bg-gray-800 dark:border-gray-600"
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-3 h-3 rounded-full ${
                        isCompleted ? "bg-green-500" : progressPercentage > 50 ? "bg-yellow-500" : "bg-gray-400"
                      }`}
                    />
                    <h3 className="font-semibold text-gray-800 dark:text-white capitalize">
                      {goal.type} Goal: {goal.targetHours}h {getGoalPeriodText(goal)}
                    </h3>
                  </div>

                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingGoal(goal.id)}
                      className="h-8 w-8 p-0 hover:bg-blue-100 dark:hover:bg-blue-900/20"
                    >
                      <Edit3 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteGoal(goal.id)}
                      className="h-8 w-8 p-0 hover:bg-red-100 dark:hover:bg-red-900/20 text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-3">
                  <div className="flex justify-between text-sm text-gray-600 dark:text-gray-300 mb-1">
                    <span>{formatTime(currentProgress)} studied</span>
                    <span>
                      {progressPercentage.toFixed(0)}% ({formatTime(goal.targetHours * 60 - currentProgress)} remaining)
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full transition-all duration-500 ${
                        isCompleted
                          ? "bg-green-500"
                          : progressPercentage > 75
                            ? "bg-yellow-500"
                            : progressPercentage > 50
                              ? "bg-blue-500"
                              : "bg-indigo-500"
                      }`}
                      style={{ width: `${Math.min(100, progressPercentage)}%` }}
                    />
                  </div>
                </div>

                {/* Achievement Badge */}
                {isCompleted && (
                  <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                    <TrendingUp className="w-4 h-4" />
                    <span className="text-sm font-medium">Goal achieved! 🎉</span>
                  </div>
                )}

                {/* Edit Form */}
                {editingGoal === goal.id && (
                  <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        step="0.5"
                        min="0.5"
                        max="24"
                        value={goal.targetHours}
                        onChange={(e) => updateGoal(goal.id, { targetHours: Number.parseFloat(e.target.value) || 0 })}
                        className="w-24"
                      />
                      <Button
                        onClick={() => setEditingGoal(null)}
                        size="sm"
                        className="bg-green-600 hover:bg-green-700"
                      >
                        Save
                      </Button>
                      <Button onClick={() => setEditingGoal(null)} size="sm" variant="outline">
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>

      {/* Quick Stats */}
      {activeGoals.length > 0 && (
        <div className="mt-6 p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl border border-indigo-200 dark:border-indigo-800">
          <h3 className="text-sm font-semibold text-indigo-800 dark:text-indigo-300 mb-2">Today's Progress</h3>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
                {formatTime(getTodayProgress())}
              </div>
              <div className="text-xs text-indigo-700 dark:text-indigo-300">Studied Today</div>
            </div>
            <div>
              <div className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
                {formatTime(getWeekProgress())}
              </div>
              <div className="text-xs text-indigo-700 dark:text-indigo-300">This Week</div>
            </div>
            <div>
              <div className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
                {activeGoals.filter((g) => getProgressPercentage(g) >= 100).length}
              </div>
              <div className="text-xs text-indigo-700 dark:text-indigo-300">Goals Achieved</div>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
