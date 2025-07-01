"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Clock, Calendar, Target, TrendingUp } from "lucide-react"
import { useTask } from "@/contexts/task-context"

export function DashboardCards() {
  const { state } = useTask()

  const today = new Date().toISOString().split("T")[0]
  const todayTasks = state.tasks.filter((task) => task.date === today)

  // Calculate today's study time
  const todayEstimated = todayTasks.reduce((sum, task) => sum + task.estimatedTime, 0)
  const todayActual = todayTasks.reduce((sum, task) => sum + (task.actualTime || 0), 0)

  // Calculate weekly completion
  const completedTasks = state.tasks.filter((task) => task.status === "Complete").length
  const totalTasks = state.tasks.length
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

  // Calculate accuracy
  const tasksWithActualTime = state.tasks.filter((task) => task.actualTime)
  const accurateTasks = tasksWithActualTime.filter(
    (task) => task.actualTime && Math.abs(task.actualTime - task.estimatedTime) <= 10,
  ).length
  const accuracyRate =
    tasksWithActualTime.length > 0 ? Math.round((accurateTasks / tasksWithActualTime.length) * 100) : 0

  // Current task info
  const currentTask = state.currentTaskId ? state.tasks.find((t) => t.id === state.currentTaskId) : null

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours}h ${mins}m`
  }

  const formatActiveTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hours}h ${minutes}m ${secs}s`
  }

  return (
    <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
      {/* Time Tracking Card */}
      <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 hover:shadow-lg transition-all duration-300">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-blue-800">Today's Study</CardTitle>
          <Clock className="h-5 w-5 text-blue-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-900">{formatTime(todayActual)}</div>
          <p className="text-xs text-blue-700 mt-1">of {formatTime(todayEstimated)} planned</p>
        </CardContent>
      </Card>

      {/* Weekly Progress Card */}
      <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 hover:shadow-lg transition-all duration-300">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-green-800">Weekly Progress</CardTitle>
          <Calendar className="h-5 w-5 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-900">{completionRate}%</div>
          <p className="text-xs text-green-700 mt-1">tasks completed</p>
        </CardContent>
      </Card>

      {/* Current Task Card */}
      <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 hover:shadow-lg transition-all duration-300">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-purple-800">Current Task</CardTitle>
          <Target className="h-5 w-5 text-purple-600" />
        </CardHeader>
        <CardContent>
          <div className="text-lg font-medium text-purple-900 truncate">{currentTask ? currentTask.name : "None"}</div>
          <p className="text-xs text-purple-700 mt-1">
            {currentTask
              ? `${formatActiveTime(state.activeTaskSeconds)} / ${formatTime(currentTask.estimatedTime)}`
              : "0h 0m / 0h 0m"}
          </p>
        </CardContent>
      </Card>

      {/* Productivity Card */}
      <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200 hover:shadow-lg transition-all duration-300">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-orange-800">Accuracy</CardTitle>
          <TrendingUp className="h-5 w-5 text-orange-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-orange-900">{accuracyRate}%</div>
          <p className="text-xs text-orange-700 mt-1">time estimation accuracy</p>
        </CardContent>
      </Card>
    </section>
  )
}
