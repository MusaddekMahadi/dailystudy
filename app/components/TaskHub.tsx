"use client"

import { useState } from "react"
import {
  Plus,
  CheckCircle2,
  Circle,
  Clock,
  AlertTriangle,
  Calendar,
  Search,
  BookOpen,
  Zap,
  Target,
  Flame,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { useStudy, type Task } from "./StudyProvider"

type FilterType = "all" | "pending" | "completed" | "overdue" | "today"
type SortType = "priority" | "dueDate" | "created" | "subject"

export default function TaskHub() {
  const [showAddForm, setShowAddForm] = useState(false)
  const [filter, setFilter] = useState<FilterType>("all")
  const [sortBy, setSortBy] = useState<SortType>("priority")
  const [searchQuery, setSearchQuery] = useState("")

  // Form state
  const [newTask, setNewTask] = useState({
    title: "",
    subject: "",
    priority: "medium" as const,
    estimatedMinutes: 30,
    dueDate: "",
    type: "assignment" as const,
    difficulty: 3 as const,
  })

  const { tasks, addTask, updateTask, deleteTask } = useStudy()

  const handleAddTask = () => {
    if (!newTask.title.trim() || !newTask.subject.trim()) return

    addTask({
      title: newTask.title.trim(),
      subject: newTask.subject.trim(),
      priority: newTask.priority,
      estimatedMinutes: newTask.estimatedMinutes,
      actualMinutes: 0,
      isCompleted: false,
      progress: 0,
      dueDate: newTask.dueDate ? new Date(newTask.dueDate) : undefined,
      tags: [],
      difficulty: newTask.difficulty,
      type: newTask.type,
    })

    setNewTask({
      title: "",
      subject: "",
      priority: "medium",
      estimatedMinutes: 30,
      dueDate: "",
      type: "assignment",
      difficulty: 3,
    })
    setShowAddForm(false)
  }

  const toggleTaskComplete = (taskId: string) => {
    const task = tasks.find((t) => t.id === taskId)
    if (!task) return

    updateTask(taskId, {
      isCompleted: !task.isCompleted,
      progress: !task.isCompleted ? 100 : task.progress,
      completedAt: !task.isCompleted ? new Date() : undefined,
    })
  }

  const filteredAndSortedTasks = tasks
    .filter((task) => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        if (!task.title.toLowerCase().includes(query) && !task.subject.toLowerCase().includes(query)) {
          return false
        }
      }

      // Status filter
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const tomorrow = new Date(today)
      tomorrow.setDate(tomorrow.getDate() + 1)

      switch (filter) {
        case "pending":
          return !task.isCompleted
        case "completed":
          return task.isCompleted
        case "overdue":
          return task.dueDate && task.dueDate < today && !task.isCompleted
        case "today":
          return task.dueDate && task.dueDate >= today && task.dueDate < tomorrow
        default:
          return true
      }
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "priority":
          const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 }
          return priorityOrder[b.priority] - priorityOrder[a.priority]
        case "dueDate":
          if (!a.dueDate && !b.dueDate) return 0
          if (!a.dueDate) return 1
          if (!b.dueDate) return -1
          return a.dueDate.getTime() - b.dueDate.getTime()
        case "subject":
          return a.subject.localeCompare(b.subject)
        case "created":
          return b.createdAt.getTime() - a.createdAt.getTime()
        default:
          return 0
      }
    })

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/20 dark:text-red-300"
      case "high":
        return "bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/20 dark:text-orange-300"
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-300"
      case "low":
        return "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-300"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-700 dark:text-gray-300"
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "assignment":
        return <BookOpen className="w-4 h-4" />
      case "reading":
        return <BookOpen className="w-4 h-4" />
      case "practice":
        return <Zap className="w-4 h-4" />
      case "review":
        return <Target className="w-4 h-4" />
      case "project":
        return <Flame className="w-4 h-4" />
      case "exam-prep":
        return <AlertTriangle className="w-4 h-4" />
      default:
        return <Circle className="w-4 h-4" />
    }
  }

  const isOverdue = (task: Task) => {
    if (!task.dueDate || task.isCompleted) return false
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return task.dueDate < today
  }

  const isDueToday = (task: Task) => {
    if (!task.dueDate) return false
    const today = new Date()
    const taskDate = new Date(task.dueDate)
    return (
      today.getDate() === taskDate.getDate() &&
      today.getMonth() === taskDate.getMonth() &&
      today.getFullYear() === taskDate.getFullYear()
    )
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: date.getFullYear() !== new Date().getFullYear() ? "numeric" : undefined,
    })
  }

  const getDifficultyStars = (difficulty: number) => {
    return "★".repeat(difficulty) + "☆".repeat(5 - difficulty)
  }

  return (
    <section className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-3xl shadow-xl p-8 border border-gray-200/50 dark:border-gray-700/50">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Task Hub</h2>
            <p className="text-gray-600 dark:text-gray-300">Manage your assignments and goals</p>
          </div>
        </div>

        <Button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg hover:shadow-xl transition-all duration-200"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Task
        </Button>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm"
          />
        </div>

        <div className="flex gap-2">
          <Select value={filter} onValueChange={(value: FilterType) => setFilter(value)}>
            <SelectTrigger className="w-32 bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Tasks</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="today">Due Today</SelectItem>
              <SelectItem value="overdue">Overdue</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={(value: SortType) => setSortBy(value)}>
            <SelectTrigger className="w-32 bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="priority">Priority</SelectItem>
              <SelectItem value="dueDate">Due Date</SelectItem>
              <SelectItem value="subject">Subject</SelectItem>
              <SelectItem value="created">Created</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Add Task Form */}
      {showAddForm && (
        <div className="mb-6 p-6 bg-gray-50/50 dark:bg-gray-700/30 backdrop-blur-sm rounded-2xl border border-gray-200/50 dark:border-gray-600/50">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Add New Task</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                placeholder="Task title"
                value={newTask.title}
                onChange={(e) => setNewTask((prev) => ({ ...prev, title: e.target.value }))}
                className="bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm"
              />
              <Input
                placeholder="Subject"
                value={newTask.subject}
                onChange={(e) => setNewTask((prev) => ({ ...prev, subject: e.target.value }))}
                className="bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <Select
                value={newTask.priority}
                onValueChange={(value: "urgent" | "high" | "medium" | "low") =>
                  setNewTask((prev) => ({ ...prev, priority: value }))
                }
              >
                <SelectTrigger className="bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="urgent">🔴 Urgent</SelectItem>
                  <SelectItem value="high">🟠 High</SelectItem>
                  <SelectItem value="medium">🟡 Medium</SelectItem>
                  <SelectItem value="low">🟢 Low</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={newTask.type}
                onValueChange={(value: "assignment" | "reading" | "practice" | "review" | "project" | "exam-prep") =>
                  setNewTask((prev) => ({ ...prev, type: value }))
                }
              >
                <SelectTrigger className="bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="assignment">Assignment</SelectItem>
                  <SelectItem value="reading">Reading</SelectItem>
                  <SelectItem value="practice">Practice</SelectItem>
                  <SelectItem value="review">Review</SelectItem>
                  <SelectItem value="project">Project</SelectItem>
                  <SelectItem value="exam-prep">Exam Prep</SelectItem>
                </SelectContent>
              </Select>

              <Input
                type="number"
                placeholder="Est. minutes"
                value={newTask.estimatedMinutes}
                onChange={(e) => setNewTask((prev) => ({ ...prev, estimatedMinutes: Number(e.target.value) || 30 }))}
                className="bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm"
              />

              <Input
                type="date"
                value={newTask.dueDate}
                onChange={(e) => setNewTask((prev) => ({ ...prev, dueDate: e.target.value }))}
                className="bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm"
              />
            </div>

            <div className="flex items-center gap-4">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Difficulty: {getDifficultyStars(newTask.difficulty)}
              </label>
              <input
                type="range"
                min="1"
                max="5"
                value={newTask.difficulty}
                onChange={(e) =>
                  setNewTask((prev) => ({ ...prev, difficulty: Number(e.target.value) as 1 | 2 | 3 | 4 | 5 }))
                }
                className="flex-1 max-w-32"
              />
            </div>

            <div className="flex gap-3">
              <Button
                onClick={handleAddTask}
                className="bg-gradient-to-r from-green-500 to-emerald-600 text-white"
                disabled={!newTask.title.trim() || !newTask.subject.trim()}
              >
                Add Task
              </Button>
              <Button
                onClick={() => setShowAddForm(false)}
                variant="outline"
                className="bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Tasks List */}
      <div className="space-y-3">
        {filteredAndSortedTasks.length === 0 ? (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            <CheckCircle2 className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium mb-2">{filter === "all" ? "No tasks yet" : `No ${filter} tasks`}</h3>
            <p>
              {filter === "all"
                ? "Add your first task to get started!"
                : "Try adjusting your filters or add new tasks."}
            </p>
          </div>
        ) : (
          filteredAndSortedTasks.map((task) => (
            <div
              key={task.id}
              className={`p-4 rounded-2xl border transition-all duration-200 hover:shadow-lg ${
                task.isCompleted
                  ? "bg-green-50/50 dark:bg-green-900/10 border-green-200/50 dark:border-green-700/50"
                  : isOverdue(task)
                    ? "bg-red-50/50 dark:bg-red-900/10 border-red-200/50 dark:border-red-700/50"
                    : isDueToday(task)
                      ? "bg-yellow-50/50 dark:bg-yellow-900/10 border-yellow-200/50 dark:border-yellow-700/50"
                      : "bg-white/50 dark:bg-gray-700/30 border-gray-200/50 dark:border-gray-600/50"
              } backdrop-blur-sm`}
            >
              <div className="flex items-start gap-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleTaskComplete(task.id)}
                  className="p-1 h-auto mt-1 hover:bg-transparent"
                >
                  {task.isCompleted ? (
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                  ) : (
                    <Circle className="w-5 h-5 text-gray-400 hover:text-green-500 transition-colors" />
                  )}
                </Button>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <h3
                      className={`font-semibold text-lg ${
                        task.isCompleted
                          ? "line-through text-gray-500 dark:text-gray-400"
                          : "text-gray-800 dark:text-white"
                      }`}
                    >
                      {task.title}
                    </h3>

                    <div className="flex items-center gap-2">
                      {isOverdue(task) && <AlertTriangle className="w-4 h-4 text-red-500" />}
                      {isDueToday(task) && <Clock className="w-4 h-4 text-yellow-500" />}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    <Badge variant="outline" className={`${getPriorityColor(task.priority)} border`}>
                      {task.priority}
                    </Badge>

                    <Badge
                      variant="outline"
                      className="bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300"
                    >
                      {getTypeIcon(task.type)}
                      <span className="ml-1">{task.type}</span>
                    </Badge>

                    <Badge
                      variant="outline"
                      className="bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/20 dark:text-purple-300"
                    >
                      {task.subject}
                    </Badge>

                    {task.dueDate && (
                      <Badge
                        variant="outline"
                        className="bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-700 dark:text-gray-300"
                      >
                        <Calendar className="w-3 h-3 mr-1" />
                        {formatDate(task.dueDate)}
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-300">
                    <div className="flex items-center gap-4">
                      <span>Est: {task.estimatedMinutes}m</span>
                      {task.actualMinutes > 0 && <span>Actual: {Math.round(task.actualMinutes)}m</span>}
                      <span>Difficulty: {getDifficultyStars(task.difficulty)}</span>
                    </div>

                    {task.progress > 0 && (
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${task.progress}%` }}
                          />
                        </div>
                        <span className="text-xs">{task.progress}%</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Task Summary */}
      {tasks.length > 0 && (
        <div className="mt-8 p-6 bg-gradient-to-r from-indigo-50/50 to-purple-50/50 dark:from-indigo-900/10 dark:to-purple-900/10 rounded-2xl border border-indigo-200/50 dark:border-indigo-700/50 backdrop-blur-sm">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Task Overview</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{tasks.length}</div>
              <div className="text-sm text-gray-600 dark:text-gray-300">Total Tasks</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                {tasks.filter((t) => t.isCompleted).length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-300">Completed</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                {tasks.filter((t) => isDueToday(t) && !t.isCompleted).length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-300">Due Today</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                {tasks.filter((t) => isOverdue(t)).length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-300">Overdue</div>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
