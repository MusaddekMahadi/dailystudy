"use client"

import { useState } from "react"
import { BarChart3, TrendingUp, Brain, Target, Calendar, Award, AlertCircle, Lightbulb } from "lucide-react"
import { useStudy } from "./StudyProvider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"

export default function Analytics() {
  const [timeframe, setTimeframe] = useState<"week" | "month">("week")
  const { studySessions, getTodayStats, getWeekStats, getSubjectStats, studyStreak, getSmartRecommendations } =
    useStudy()

  const todayStats = getTodayStats()
  const weekStats = getWeekStats()
  const subjectStats = getSubjectStats()
  const recommendations = getSmartRecommendations()

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours > 0) {
      return `${hours}h ${mins}m`
    }
    return `${mins}m`
  }

  const getChartData = () => {
    const days = timeframe === "week" ? 7 : 30
    const data = []

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      date.setHours(0, 0, 0, 0)

      const nextDay = new Date(date)
      nextDay.setDate(nextDay.getDate() + 1)

      const daySessions = studySessions.filter((session) => session.startTime >= date && session.startTime < nextDay)

      const totalTime = daySessions.reduce((sum, session) => sum + session.duration, 0)

      data.push({
        date: date.toLocaleDateString("en-US", {
          weekday: timeframe === "week" ? "short" : undefined,
          month: timeframe === "month" ? "short" : undefined,
          day: "numeric",
        }),
        time: totalTime,
        sessions: daySessions.length,
      })
    }

    return data
  }

  const chartData = getChartData()
  const maxTime = Math.max(...chartData.map((d) => d.time), 1)

  return (
    <section className="mb-8">
      <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-3xl shadow-xl p-8 border border-gray-200/50 dark:border-gray-700/50">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg">
              <BarChart3 className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Study Analytics</h2>
              <p className="text-gray-600 dark:text-gray-300">Track your progress and insights</p>
            </div>
          </div>

          <Select value={timeframe} onValueChange={(value: "week" | "month") => setTimeframe(value)}>
            <SelectTrigger className="w-32 bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Last 7 Days</SelectItem>
              <SelectItem value="month">Last 30 Days</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Smart Recommendations */}
        {recommendations.length > 0 && (
          <div className="mb-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl border border-blue-200/50 dark:border-blue-700/50">
            <div className="flex items-center gap-3 mb-4">
              <Brain className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-300">Smart Insights</h3>
            </div>
            <div className="space-y-3">
              {recommendations.slice(0, 2).map((rec, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-white/50 dark:bg-gray-800/50 rounded-xl">
                  <div className="flex-shrink-0 mt-0.5">
                    {rec.type === "urgent" && <AlertCircle className="w-4 h-4 text-red-500" />}
                    {rec.type === "motivation" && <Target className="w-4 h-4 text-green-500" />}
                    {rec.type === "improvement" && <Lightbulb className="w-4 h-4 text-yellow-500" />}
                    {rec.type === "achievement" && <Award className="w-4 h-4 text-purple-500" />}
                    {rec.type === "wellness" && <Brain className="w-4 h-4 text-blue-500" />}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-700 dark:text-gray-300">{rec.message}</p>
                    {rec.action && (
                      <Button size="sm" variant="outline" className="mt-2 text-xs bg-transparent">
                        Take Action
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Key Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-2xl shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="w-6 h-6 opacity-80" />
              <span className="text-xs opacity-80">Today</span>
            </div>
            <div className="text-2xl font-bold">{formatTime(todayStats.studyTime)}</div>
            <div className="text-xs opacity-80">Study Time</div>
          </div>

          <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded-2xl shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <Target className="w-6 h-6 opacity-80" />
              <span className="text-xs opacity-80">Week</span>
            </div>
            <div className="text-2xl font-bold">{formatTime(weekStats.studyTime)}</div>
            <div className="text-xs opacity-80">Total Time</div>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-6 rounded-2xl shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <Calendar className="w-6 h-6 opacity-80" />
              <span className="text-xs opacity-80">Streak</span>
            </div>
            <div className="text-2xl font-bold">{studyStreak.currentStreak}</div>
            <div className="text-xs opacity-80">Days</div>
          </div>

          <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white p-6 rounded-2xl shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <Brain className="w-6 h-6 opacity-80" />
              <span className="text-xs opacity-80">Focus</span>
            </div>
            <div className="text-2xl font-bold">{weekStats.avgFocusScore.toFixed(1)}</div>
            <div className="text-xs opacity-80">Average</div>
          </div>
        </div>

        {/* Study Time Chart */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Study Time Trend</h3>
          <div className="bg-gray-50 dark:bg-gray-700/50 p-6 rounded-2xl">
            <div className="flex items-end justify-between h-48 gap-2">
              {chartData.map((day, index) => (
                <div key={index} className="flex flex-col items-center flex-1 h-full">
                  <div className="flex-1 flex flex-col justify-end w-full max-w-8">
                    <div
                      className="bg-gradient-to-t from-indigo-500 to-indigo-400 rounded-t-lg transition-all duration-500 hover:from-indigo-600 hover:to-indigo-500 min-h-[4px] cursor-pointer"
                      style={{
                        height: `${Math.max(4, (day.time / maxTime) * 160)}px`,
                      }}
                      title={`${formatTime(day.time)} - ${day.sessions} sessions`}
                    />
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-300 mt-2 text-center">{day.date}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Subject Breakdown */}
        {subjectStats.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Subject Breakdown</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {subjectStats.slice(0, 6).map((subject, index) => (
                <div key={subject.subject} className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-xl">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-800 dark:text-white">{subject.subject}</span>
                    <span className="text-sm text-gray-600 dark:text-gray-300">{formatTime(subject.time)}</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2 rounded-full transition-all duration-500"
                      style={{
                        width: `${(subject.time / subjectStats[0].time) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {studySessions.length === 0 && (
          <div className="text-center py-12">
            <BarChart3 className="w-16 h-16 mx-auto mb-4 text-gray-400 opacity-50" />
            <h3 className="text-lg font-medium text-gray-600 dark:text-gray-300 mb-2">No study data yet</h3>
            <p className="text-gray-500 dark:text-gray-400">Start a study session to see your analytics!</p>
          </div>
        )}
      </div>
    </section>
  )
}
