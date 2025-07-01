"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Play, Square, Edit, Trash2, BarChart3, Clock, Calendar, Repeat } from "lucide-react"
import { useTask } from "@/contexts/task-context"
import { ProgressModal } from "./progress-modal"

interface TaskTableProps {
  onEditTask: (taskId: string) => void
}

export function TaskTable({ onEditTask }: TaskTableProps) {
  const { state, startTask, stopTask, deleteTask } = useTask()
  const [showProgressModal, setShowProgressModal] = useState(false)
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null)

  const filteredTasks = useTask().getFilteredTasks()

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Complete":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Complete</Badge>
      case "In Progress":
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">In Progress</Badge>
      default:
        return <Badge variant="secondary">Not Started</Badge>
    }
  }

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      weekday: "short",
      month: "short",
      day: "numeric",
    }
    return new Date(dateString).toLocaleDateString(undefined, options)
  }

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`
  }

  const handleProgressClick = (taskId: string) => {
    setSelectedTaskId(taskId)
    setShowProgressModal(true)
  }

  const handleDeleteTask = (taskId: string) => {
    if (confirm("Are you sure you want to delete this task?")) {
      deleteTask(taskId)
    }
  }

  if (filteredTasks.length === 0) {
    return (
      <div className="text-center py-12">
        <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500 text-lg">No tasks found</p>
        <p className="text-gray-400 text-sm">Click "Add Task" to get started!</p>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-4">
        {filteredTasks
          .sort((a, b) => {
            // Sort by status (In Progress first), then by date
            if (a.status !== b.status) {
              if (a.status === "In Progress") return -1
              if (b.status === "In Progress") return 1
            }
            return a.date.localeCompare(b.date)
          })
          .map((task) => (
            <div
              key={task.id}
              className={`p-4 rounded-lg border transition-all duration-200 hover:shadow-md ${
                state.currentTaskId === task.id ? "bg-blue-50 border-blue-200 shadow-md" : "bg-white border-gray-200"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    {getStatusBadge(task.status)}
                    {task.recurrence !== "none" && (
                      <Repeat className="h-4 w-4 text-gray-400" title={`Repeats ${task.recurrence}`} />
                    )}
                  </div>

                  <h3 className="text-lg font-semibold text-gray-900 mb-1">{task.name}</h3>

                  {task.description && <p className="text-sm text-gray-600 mb-2">{task.description}</p>}

                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {formatDate(task.date)}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {formatTime(task.estimatedTime)}
                      {task.actualTime && (
                        <span className="text-blue-600 ml-1">({formatTime(task.actualTime)} actual)</span>
                      )}
                    </div>
                    {task.progress > 0 && <div className="text-green-600">{task.progress}% complete</div>}
                  </div>
                </div>

                <div className="flex items-center gap-2 ml-4">
                  <Button
                    size="sm"
                    variant={state.currentTaskId === task.id ? "destructive" : "default"}
                    onClick={() => {
                      if (state.currentTaskId === task.id) {
                        stopTask()
                      } else {
                        startTask(task.id)
                      }
                    }}
                    className="transition-all duration-200"
                  >
                    {state.currentTaskId === task.id ? <Square className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  </Button>

                  <Button size="sm" variant="outline" onClick={() => onEditTask(task.id)}>
                    <Edit className="h-4 w-4" />
                  </Button>

                  <Button size="sm" variant="outline" onClick={() => handleProgressClick(task.id)}>
                    <BarChart3 className="h-4 w-4" />
                  </Button>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDeleteTask(task.id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
      </div>

      {showProgressModal && selectedTaskId && (
        <ProgressModal
          taskId={selectedTaskId}
          onClose={() => {
            setShowProgressModal(false)
            setSelectedTaskId(null)
          }}
        />
      )}
    </>
  )
}
