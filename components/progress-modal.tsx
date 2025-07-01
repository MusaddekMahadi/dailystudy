"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Slider } from "@/components/ui/slider"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useTask } from "@/contexts/task-context"

interface ProgressModalProps {
  taskId: string
  onClose: () => void
}

export function ProgressModal({ taskId, onClose }: ProgressModalProps) {
  const { state, updateTask } = useTask()
  const task = state.tasks.find((t) => t.id === taskId)

  const [progress, setProgress] = useState([0])
  const [actualTime, setActualTime] = useState("")
  const [notes, setNotes] = useState("")

  useEffect(() => {
    if (task) {
      setProgress([task.progress])
      setActualTime(task.actualTime?.toString() || "")
      setNotes(task.notes || "")
    }
  }, [task])

  const handleSave = () => {
    if (!task) return

    const updates: any = {
      progress: progress[0],
      notes: notes.trim(),
    }

    if (actualTime) {
      updates.actualTime = Number.parseInt(actualTime)
    }

    // Update status based on progress
    if (progress[0] >= 100) {
      updates.status = "Complete"
    } else if (progress[0] > 0) {
      updates.status = "In Progress"
    }

    updateTask(taskId, updates)
    onClose()
  }

  if (!task) return null

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Update Progress</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div>
            <Label className="text-sm font-medium">Task: {task.name}</Label>
          </div>

          <div className="space-y-3">
            <Label htmlFor="progress">Progress: {progress[0]}%</Label>
            <Slider id="progress" value={progress} onValueChange={setProgress} max={100} step={5} className="w-full" />
            <div className="flex justify-between text-xs text-gray-500">
              <span>0%</span>
              <span>50%</span>
              <span>100%</span>
            </div>
          </div>

          <div>
            <Label htmlFor="actualTime">Actual Time (minutes)</Label>
            <Input
              id="actualTime"
              type="number"
              min="1"
              value={actualTime}
              onChange={(e) => setActualTime(e.target.value)}
              placeholder="Enter actual time spent"
            />
          </div>

          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any notes about your progress..."
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
            >
              Save Progress
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
