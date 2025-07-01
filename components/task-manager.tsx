"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Plus } from "lucide-react"
import { TaskForm } from "./task-form"
import { TaskTable } from "./task-table"
import { useTask } from "@/contexts/task-context"

export function TaskManager() {
  const { state, dispatch } = useTask()
  const [showTaskForm, setShowTaskForm] = useState(false)
  const [editingTask, setEditingTask] = useState<string | null>(null)

  const handleViewChange = (view: "today" | "upcoming" | "recurring") => {
    dispatch({ type: "SET_VIEW", payload: view })
  }

  const handleEditTask = (taskId: string) => {
    setEditingTask(taskId)
    setShowTaskForm(true)
  }

  const handleCloseForm = () => {
    setShowTaskForm(false)
    setEditingTask(null)
  }

  return (
    <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div className="flex space-x-2">
            <Button
              variant={state.view === "today" ? "default" : "outline"}
              size="sm"
              onClick={() => handleViewChange("today")}
              className="transition-all duration-200"
            >
              Today
            </Button>
            <Button
              variant={state.view === "upcoming" ? "default" : "outline"}
              size="sm"
              onClick={() => handleViewChange("upcoming")}
              className="transition-all duration-200"
            >
              Upcoming
            </Button>
            <Button
              variant={state.view === "recurring" ? "default" : "outline"}
              size="sm"
              onClick={() => handleViewChange("recurring")}
              className="transition-all duration-200"
            >
              Recurring
            </Button>
          </div>
          <Button
            onClick={() => setShowTaskForm(true)}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Task
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <TaskTable onEditTask={handleEditTask} />

        {showTaskForm && <TaskForm editingTaskId={editingTask} onClose={handleCloseForm} />}
      </CardContent>
    </Card>
  )
}
