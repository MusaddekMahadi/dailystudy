"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useTask } from "@/contexts/task-context"

interface TaskFormProps {
  editingTaskId?: string | null
  onClose: () => void
}

export function TaskForm({ editingTaskId, onClose }: TaskFormProps) {
  const { state, addTask, updateTask } = useTask()
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    date: new Date().toISOString().split("T")[0],
    estimatedTime: 30,
    recurrence: "none" as const,
    category: "",
    priority: "medium" as const,
  })

  const editingTask = editingTaskId ? state.tasks.find((t) => t.id === editingTaskId) : null

  useEffect(() => {
    if (editingTask) {
      setFormData({
        name: editingTask.name,
        description: editingTask.description || "",
        date: editingTask.date,
        estimatedTime: editingTask.estimatedTime,
        recurrence: editingTask.recurrence,
        category: editingTask.category || "",
        priority: editingTask.priority,
      })
    }
  }, [editingTask])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name.trim()) {
      alert("Please enter a task name")
      return
    }

    const taskData = {
      name: formData.name.trim(),
      description: formData.description.trim(),
      date: formData.date,
      estimatedTime: formData.estimatedTime,
      recurrence: formData.recurrence,
      category: formData.category.trim(),
      priority: formData.priority,
      actualTime: editingTask?.actualTime,
      elapsedTime: editingTask?.elapsedTime || 0,
      status: editingTask?.status || ("Not Started" as const),
      progress: editingTask?.progress || 0,
      notes: editingTask?.notes,
    }

    if (editingTaskId) {
      updateTask(editingTaskId, taskData)
    } else {
      addTask(taskData)
    }

    onClose()
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{editingTaskId ? "Edit Task" : "Add New Task"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Label htmlFor="name">Task Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter task name"
                required
              />
            </div>

            <div>
              <Label htmlFor="date">Date *</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="estimatedTime">Estimated Time (minutes) *</Label>
              <Input
                id="estimatedTime"
                type="number"
                min="1"
                value={formData.estimatedTime}
                onChange={(e) => setFormData({ ...formData, estimatedTime: Number.parseInt(e.target.value) || 30 })}
                required
              />
            </div>

            <div>
              <Label htmlFor="priority">Priority</Label>
              <Select
                value={formData.priority}
                onValueChange={(value: "low" | "medium" | "high") => setFormData({ ...formData, priority: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="recurrence">Recurrence</Label>
              <Select
                value={formData.recurrence}
                onValueChange={(value: "none" | "daily" | "weekly" | "monthly") =>
                  setFormData({ ...formData, recurrence: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Does not repeat</SelectItem>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="col-span-2">
              <Label htmlFor="category">Category</Label>
              <Input
                id="category"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                placeholder="e.g., Math, Science, Reading"
              />
            </div>

            <div className="col-span-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Optional description"
                rows={3}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
            >
              {editingTaskId ? "Update Task" : "Add Task"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
