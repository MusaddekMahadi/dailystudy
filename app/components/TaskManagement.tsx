"use client"

import { useState } from "react"
import {
  Plus,
  Play,
  Pause,
  Clock,
  Trash2,
  Edit3,
  Filter,
  ChevronDown,
  Target,
  Calendar,
  Repeat,
  Loader2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { useData, type Task } from "./DataProvider"

type SortOption = "name" | "priority" | "progress" | "createdAt" | "scheduledDate"
type FilterOption = "all" | "completed" | "pending" | "active" | "today" | "overdue"

export default function TaskManagement() {
  const { tasks, setTasks } = useData()
  const [newTaskName, setNewTaskName] = useState("")
  const [newTaskDescription, setNewTaskDescription] = useState("")
  const [newTaskTime, setNewTaskTime] = useState("")
  const [newTaskPriority, setNewTaskPriority] = useState<"high" | "medium" | "low">("medium")
  const [newTaskDate, setNewTaskDate] = useState("")
  const [newTaskRecurring, setNewTaskRecurring] = useState(false)
  const [newTaskRecurringPattern, setNewTaskRecurringPattern] = useState<"daily" | "weekly" | "monthly">("daily")
  const [editingTask, setEditingTask] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<SortOption>("createdAt")
  const [filterBy, setFilterBy] = useState<FilterOption>("all")
  const [showFilters, setShowFilters] = useState(false)

  const addTask = () => {
    if (newTaskName.trim() && newTaskTime) {
      const newTask: Task = {
        id: Date.now().toString(),
        name: newTaskName.trim(),
        description: newTaskDescription.trim(),
        expectedTime: Number.parseInt(newTaskTime),
        actualTime: 0,
        isCompleted: false,
        progress: 0,
        isActive: false,
        priority: newTaskPriority,
        createdAt: new Date(),
        scheduledDate: newTaskDate ? new Date(newTaskDate) : undefined,
        isRecurring: newTaskRecurring,
        recurringPattern: newTaskRecurring ? newTaskRecurringPattern : undefined,
        completedSessions: [],
      }
      setTasks([...tasks, newTask])
      setNewTaskName("")
      setNewTaskDescription("")
      setNewTaskTime("")
      setNewTaskPriority("medium")
      setNewTaskDate("")
      setNewTaskRecurring(false)
    }
  }

  const deleteTask = (id: string) => {
    setTasks(tasks.filter((task) => task.id !== id))
  }

  const duplicateTask = (task: Task) => {
    const duplicatedTask: Task = {
      ...task,
      id: Date.now().toString(),
      name: `${task.name} (Copy)`,
      isCompleted: false,
      progress: 0,
      isActive: false,
      actualTime: 0,
      createdAt: new Date(),
      completedSessions: [],
    }
    setTasks([...tasks, duplicatedTask])
  }

  const toggleTaskCompletion = (id: string) => {
    setTasks(
      tasks.map((task) => {
        if (task.id === id) {
          const updatedTask = {
            ...task,
            isCompleted: !task.isCompleted,
            progress: !task.isCompleted ? 100 : task.progress,
          }

          // If task is recurring and being completed, create next occurrence
          if (!task.isCompleted && task.isRecurring && task.recurringPattern && task.scheduledDate) {
            const nextDate = new Date(task.scheduledDate)
            switch (task.recurringPattern) {
              case "daily":
                nextDate.setDate(nextDate.getDate() + 1)
                break
              case "weekly":
                nextDate.setDate(nextDate.getDate() + 7)
                break
              case "monthly":
                nextDate.setMonth(nextDate.getMonth() + 1)
                break
            }

            const nextTask: Task = {
              ...task,
              id: (Date.now() + 1).toString(),
              isCompleted: false,
              progress: 0,
              isActive: false,
              actualTime: 0,
              scheduledDate: nextDate,
              createdAt: new Date(),
              completedSessions: [],
            }

            setTasks((prev) => [...prev.map((t) => (t.id === id ? updatedTask : t)), nextTask])
            return updatedTask
          }

          return updatedTask
        }
        return task
      }),
    )
  }

  const updateTask = (id: string, updates: Partial<Task>) => {
    setTasks(tasks.map((task) => (task.id === id ? { ...task, ...updates } : task)))
  }

  const updateTaskProgress = (id: string, progress: number[]) => {
    setTasks(tasks.map((task) => (task.id === id ? { ...task, progress: progress[0] } : task)))
  }

  const startTaskTimer = (id: string) => {
    // Stop all other timers
    setTasks(tasks.map((task) => ({ ...task, isActive: false })))

    // Start this task's timer
    setTasks(tasks.map((task) => (task.id === id ? { ...task, isActive: true } : task)))

    const task = tasks.find((t) => t.id === id)
    if (task) {
      window.dispatchEvent(
        new CustomEvent("startTimer", {
          detail: { taskName: task.name },
        }),
      )
    }
  }

  const startPomodoroTimer = (id: string) => {
    // Stop all other timers
    setTasks(tasks.map((task) => ({ ...task, isActive: false })))

    // Start this task's timer
    setTasks(tasks.map((task) => (task.id === id ? { ...task, isActive: true } : task)))

    const task = tasks.find((t) => t.id === id)
    if (task) {
      window.dispatchEvent(
        new CustomEvent("startPomodoro", {
          detail: { taskName: task.name },
        }),
      )
    }
  }

  const stopTaskTimer = (id: string) => {
    setTasks(tasks.map((task) => (task.id === id ? { ...task, isActive: false } : task)))
    window.dispatchEvent(new CustomEvent("stopTimer"))
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800"
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-300 dark:border-yellow-800"
      case "low":
        return "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600"
    }
  }

  const sortTasks = (tasks: Task[]) => {
    return [...tasks].sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name)
        case "priority":
          const priorityOrder = { high: 3, medium: 2, low: 1 }
          return priorityOrder[b.priority] - priorityOrder[a.priority]
        case "progress":
          return b.progress - a.progress
        case "scheduledDate":
          if (!a.scheduledDate && !b.scheduledDate) return 0
          if (!a.scheduledDate) return 1
          if (!b.scheduledDate) return -1
          return a.scheduledDate.getTime() - b.scheduledDate.getTime()
        case "createdAt":
          return b.createdAt.getTime() - a.createdAt.getTime()
        default:
          return 0
      }
    })
  }

  const filterTasks = (tasks: Task[]) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    switch (filterBy) {
      case "completed":
        return tasks.filter((task) => task.isCompleted)
      case "pending":
        return tasks.filter((task) => !task.isCompleted)
      case "active":
        return tasks.filter((task) => task.isActive)
      case "today":
        return tasks.filter(
          (task) => task.scheduledDate && task.scheduledDate >= today && task.scheduledDate < tomorrow,
        )
      case "overdue":
        return tasks.filter((task) => task.scheduledDate && task.scheduledDate < today && !task.isCompleted)
      default:
        return tasks
    }
  }

  const filteredAndSortedTasks = sortTasks(filterTasks(tasks))

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    if (hours > 0) {
      return `${hours}h ${minutes}m`
    }
    return `${minutes}m`
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
  }

  const isOverdue = (task: Task) => {
    if (!task.scheduledDate || task.isCompleted) return false
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return task.scheduledDate < today
  }

  const isToday = (task: Task) => {
    if (!task.scheduledDate) return false
    const today = new Date()
    const taskDate = new Date(task.scheduledDate)
    return (
      today.getDate() === taskDate.getDate() &&
      today.getMonth() === taskDate.getMonth() &&
      today.getFullYear() === taskDate.getFullYear()
    )
  }

  return (
    <section className="mb-8" aria-labelledby="task-management-heading">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700 transition-colors duration-300">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
          <h2
            id="task-management-heading"
            className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-3"
          >
            <Clock className="w-6 h-6 text-indigo-600 dark:text-indigo-400" aria-hidden="true" />
            Task Management
          </h2>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
              aria-expanded={showFilters}
              aria-controls="filter-controls"
            >
              <Filter className="w-4 h-4 mr-2" />
              Filters
              <ChevronDown className={`w-4 h-4 ml-2 transition-transform ${showFilters ? "rotate-180" : ""}`} />
            </Button>
          </div>
        </div>

        {/* Filter and Sort Controls */}
        {showFilters && (
          <div id="filter-controls" className="mb-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="sort-select"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  Sort by
                </label>
                <Select value={sortBy} onValueChange={(value: SortOption) => setSortBy(value)}>
                  <SelectTrigger id="sort-select" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="createdAt">Date Created</SelectItem>
                    <SelectItem value="scheduledDate">Scheduled Date</SelectItem>
                    <SelectItem value="name">Name</SelectItem>
                    <SelectItem value="priority">Priority</SelectItem>
                    <SelectItem value="progress">Progress</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label
                  htmlFor="filter-select"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  Filter by
                </label>
                <Select value={filterBy} onValueChange={(value: FilterOption) => setFilterBy(value)}>
                  <SelectTrigger id="filter-select" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Tasks</SelectItem>
                    <SelectItem value="today">Due Today</SelectItem>
                    <SelectItem value="overdue">Overdue</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        )}

        {/* Add New Task */}
        <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
          <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-3">Add New Task</h3>
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                placeholder="Task name"
                value={newTaskName}
                onChange={(e) => setNewTaskName(e.target.value)}
                aria-label="Task name"
              />
              <Input
                placeholder="Expected time (minutes)"
                type="number"
                value={newTaskTime}
                onChange={(e) => setNewTaskTime(e.target.value)}
                aria-label="Expected time in minutes"
              />
            </div>

            <Textarea
              placeholder="Task description (optional)"
              value={newTaskDescription}
              onChange={(e) => setNewTaskDescription(e.target.value)}
              className="min-h-[80px]"
              aria-label="Task description"
            />

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Select
                value={newTaskPriority}
                onValueChange={(value: "high" | "medium" | "low") => setNewTaskPriority(value)}
              >
                <SelectTrigger aria-label="Task priority">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high">High Priority</SelectItem>
                  <SelectItem value="medium">Medium Priority</SelectItem>
                  <SelectItem value="low">Low Priority</SelectItem>
                </SelectContent>
              </Select>

              <Input
                type="date"
                value={newTaskDate}
                onChange={(e) => setNewTaskDate(e.target.value)}
                aria-label="Scheduled date"
              />

              <div className="flex items-center gap-2">
                <Checkbox
                  checked={newTaskRecurring}
                  onCheckedChange={(checked) => setNewTaskRecurring(checked as boolean)}
                  id="recurring-checkbox"
                />
                <label htmlFor="recurring-checkbox" className="text-sm text-gray-700 dark:text-gray-300">
                  Recurring
                </label>
              </div>
            </div>

            {newTaskRecurring && (
              <Select
                value={newTaskRecurringPattern}
                onValueChange={(value: "daily" | "weekly" | "monthly") => setNewTaskRecurringPattern(value)}
              >
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            )}

            <Button
              onClick={addTask}
              className="bg-indigo-600 hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              disabled={!newTaskName.trim() || !newTaskTime}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Task
            </Button>
          </div>
        </div>

        {/* Tasks List */}
        <div className="space-y-4">
          {filteredAndSortedTasks.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>
                {filterBy === "all"
                  ? "No tasks yet. Add your first task to get started!"
                  : `No ${filterBy} tasks found.`}
              </p>
            </div>
          ) : (
            filteredAndSortedTasks.map((task) => (
              <div
                key={task.id}
                className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                  task.isActive
                    ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 dark:border-indigo-400"
                    : task.isCompleted
                      ? "border-green-200 bg-green-50 dark:bg-green-900/20 dark:border-green-700"
                      : isOverdue(task)
                        ? "border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-700"
                        : isToday(task)
                          ? "border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20 dark:border-yellow-700"
                          : "border-gray-200 bg-white dark:bg-gray-800 dark:border-gray-600"
                }`}
              >
                <div className="flex flex-col gap-4">
                  <div className="flex items-start gap-3">
                    <Checkbox
                      checked={task.isCompleted}
                      onCheckedChange={() => toggleTaskCompletion(task.id)}
                      className="mt-1"
                      aria-label={`Mark ${task.name} as ${task.isCompleted ? "incomplete" : "complete"}`}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex-1">
                          <h4
                            className={`font-semibold text-lg ${
                              task.isCompleted
                                ? "line-through text-gray-500 dark:text-gray-400"
                                : "text-gray-800 dark:text-white"
                            }`}
                          >
                            {task.name}
                            {task.isActive && <Loader2 className="inline w-4 h-4 ml-2 animate-spin text-indigo-600" />}
                          </h4>
                          {task.description && (
                            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{task.description}</p>
                          )}
                        </div>

                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setEditingTask(task.id)}
                            className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                            aria-label={`Edit ${task.name}`}
                          >
                            <Edit3 className="w-3 h-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => duplicateTask(task)}
                            className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                            aria-label={`Duplicate ${task.name}`}
                          >
                            <Plus className="w-3 h-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteTask(task.id)}
                            className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity text-red-600"
                            aria-label={`Delete ${task.name}`}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600 dark:text-gray-300 mb-3">
                        <span>Expected: {task.expectedTime} min</span>
                        {task.actualTime > 0 && <span>Actual: {formatTime(task.actualTime)}</span>}
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(task.priority)}`}
                        >
                          {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                        </span>
                        {task.scheduledDate && (
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              isOverdue(task)
                                ? "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300"
                                : isToday(task)
                                  ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300"
                                  : "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300"
                            }`}
                          >
                            <Calendar className="w-3 h-3 inline mr-1" />
                            {formatDate(task.scheduledDate)}
                          </span>
                        )}
                        {task.isRecurring && (
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300">
                            <Repeat className="w-3 h-3 inline mr-1" />
                            {task.recurringPattern}
                          </span>
                        )}
                      </div>

                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                        <div className="flex items-center gap-2 flex-1">
                          <span className="text-sm text-gray-600 dark:text-gray-300 whitespace-nowrap">Progress:</span>
                          <div className="flex-1 min-w-[120px]">
                            <Slider
                              value={[task.progress]}
                              onValueChange={(value) => updateTaskProgress(task.id, value)}
                              max={100}
                              step={5}
                              className="w-full"
                              aria-label={`Progress for ${task.name}: ${task.progress}%`}
                            />
                          </div>
                          <span className="text-sm text-gray-600 dark:text-gray-300 min-w-[3ch]">{task.progress}%</span>
                        </div>

                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => (task.isActive ? stopTaskTimer(task.id) : startTaskTimer(task.id))}
                            className={`${
                              task.isActive
                                ? "bg-red-500 hover:bg-red-600 focus:ring-red-500"
                                : "bg-green-500 hover:bg-green-600 focus:ring-green-500"
                            } text-white focus:ring-2 focus:ring-offset-2`}
                            aria-label={`${task.isActive ? "Stop" : "Start"} timer for ${task.name}`}
                          >
                            {task.isActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => startPomodoroTimer(task.id)}
                            className="bg-indigo-500 hover:bg-indigo-600 text-white focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                            disabled={task.isActive}
                            aria-label={`Start Pomodoro for ${task.name}`}
                          >
                            <Target className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {task.isActive && (
                    <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                      <p className="text-sm text-indigo-700 dark:text-indigo-300 font-medium flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Timer is running for this task
                      </p>
                    </div>
                  )}

                  {/* Edit Form */}
                  {editingTask === task.id && (
                    <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border-t">
                      <h4 className="font-medium text-gray-800 dark:text-white mb-3">Edit Task</h4>
                      <div className="space-y-3">
                        <Input
                          value={task.name}
                          onChange={(e) => updateTask(task.id, { name: e.target.value })}
                          placeholder="Task name"
                        />
                        <Textarea
                          value={task.description}
                          onChange={(e) => updateTask(task.id, { description: e.target.value })}
                          placeholder="Task description"
                          className="min-h-[60px]"
                        />
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <Input
                            type="number"
                            value={task.expectedTime}
                            onChange={(e) =>
                              updateTask(task.id, { expectedTime: Number.parseInt(e.target.value) || 0 })
                            }
                            placeholder="Expected time (minutes)"
                          />
                          <Select
                            value={task.priority}
                            onValueChange={(value: "high" | "medium" | "low") =>
                              updateTask(task.id, { priority: value })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="high">High Priority</SelectItem>
                              <SelectItem value="medium">Medium Priority</SelectItem>
                              <SelectItem value="low">Low Priority</SelectItem>
                            </SelectContent>
                          </Select>
                          <Input
                            type="date"
                            value={task.scheduledDate ? task.scheduledDate.toISOString().split("T")[0] : ""}
                            onChange={(e) =>
                              updateTask(task.id, {
                                scheduledDate: e.target.value ? new Date(e.target.value) : undefined,
                              })
                            }
                          />
                        </div>
                        <div className="flex gap-3">
                          <Button onClick={() => setEditingTask(null)} className="bg-green-600 hover:bg-green-700">
                            Save Changes
                          </Button>
                          <Button onClick={() => setEditingTask(null)} variant="outline">
                            Cancel
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Task Statistics */}
        {tasks.length > 0 && (
          <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-3">Task Statistics</h3>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{tasks.length}</div>
                <div className="text-sm text-gray-600 dark:text-gray-300">Total</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {tasks.filter((t) => t.isCompleted).length}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300">Completed</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                  {tasks.filter((t) => !t.isCompleted && isToday(t)).length}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300">Due Today</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                  {tasks.filter((t) => isOverdue(t)).length}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300">Overdue</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {tasks.filter((t) => t.isRecurring).length}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300">Recurring</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
