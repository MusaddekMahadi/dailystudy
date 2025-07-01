"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { useTask } from "@/contexts/task-context"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"

export function Analytics() {
  const { state } = useTask()

  // Generate daily study data for the past week
  const getDailyData = () => {
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
    const today = new Date()

    return days.map((day, index) => {
      const date = new Date(today)
      date.setDate(today.getDate() - (6 - index))
      const dateStr = date.toISOString().split("T")[0]

      const dayTasks = state.tasks.filter((task) => task.date === dateStr)
      const estimated = dayTasks.reduce((sum, task) => sum + task.estimatedTime, 0)
      const actual = dayTasks.reduce((sum, task) => sum + (task.actualTime || 0), 0)

      return {
        day,
        estimated,
        actual,
      }
    })
  }

  // Calculate accuracy data
  const getAccuracyData = () => {
    const tasksWithActualTime = state.tasks.filter((task) => task.actualTime)

    if (tasksWithActualTime.length === 0) {
      return [{ name: "No Data", value: 100, color: "#e5e7eb" }]
    }

    let accurate = 0
    let overestimated = 0
    let underestimated = 0

    tasksWithActualTime.forEach((task) => {
      const diff = Math.abs((task.actualTime || 0) - task.estimatedTime)
      const tolerance = task.estimatedTime * 0.1 // 10% tolerance

      if (diff <= tolerance) {
        accurate++
      } else if ((task.actualTime || 0) > task.estimatedTime) {
        underestimated++
      } else {
        overestimated++
      }
    })

    const total = tasksWithActualTime.length
    return [
      { name: "Accurate", value: Math.round((accurate / total) * 100), color: "#10b981" },
      { name: "Overestimated", value: Math.round((overestimated / total) * 100), color: "#f59e0b" },
      { name: "Underestimated", value: Math.round((underestimated / total) * 100), color: "#ef4444" },
    ]
  }

  // Calculate productivity metrics
  const getProductivityMetrics = () => {
    const completedTasks = state.tasks.filter((task) => task.status === "Complete")
    const totalEstimated = state.tasks.reduce((sum, task) => sum + task.estimatedTime, 0)
    const totalActual = state.tasks.reduce((sum, task) => sum + (task.actualTime || 0), 0)

    return {
      completionRate: state.tasks.length > 0 ? Math.round((completedTasks.length / state.tasks.length) * 100) : 0,
      timeEfficiency: totalEstimated > 0 ? Math.round((totalEstimated / Math.max(totalActual, 1)) * 100) : 100,
      averageTaskTime:
        completedTasks.length > 0
          ? Math.round(completedTasks.reduce((sum, task) => sum + (task.actualTime || 0), 0) / completedTasks.length)
          : 0,
    }
  }

  const dailyData = getDailyData()
  const accuracyData = getAccuracyData()
  const metrics = getProductivityMetrics()

  return (
    <div className="space-y-6">
      {/* Daily Study Trend */}
      <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Daily Study Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={dailyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip formatter={(value) => [`${value} min`, ""]} />
              <Bar dataKey="estimated" fill="#c7d2fe" name="Estimated" />
              <Bar dataKey="actual" fill="#4f46e5" name="Actual" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Time Estimation Accuracy */}
      <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Time Estimation Accuracy</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={accuracyData}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {accuracyData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `${value}%`} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-4 mt-4">
            {accuracyData.map((entry, index) => (
              <div key={index} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
                <span className="text-sm text-gray-600">{entry.name}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Productivity Metrics */}
      <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Productivity Metrics</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span>Task Completion Rate</span>
              <span>{metrics.completionRate}%</span>
            </div>
            <Progress value={metrics.completionRate} className="h-2" />
          </div>

          <div>
            <div className="flex justify-between text-sm mb-2">
              <span>Time Efficiency</span>
              <span>{metrics.timeEfficiency}%</span>
            </div>
            <Progress value={Math.min(metrics.timeEfficiency, 100)} className="h-2" />
          </div>

          <div className="pt-2 border-t">
            <div className="text-sm text-gray-600">
              Average Task Duration: <span className="font-medium">{metrics.averageTaskTime} minutes</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
