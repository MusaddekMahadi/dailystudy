"use client"

import { Brain, Moon, Sun, Flame, Trophy, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useTheme } from "./ThemeProvider"
import { useStudy } from "./StudyProvider"

export default function Header() {
  const { theme, toggleTheme } = useTheme()
  const { studyStreak, getTodayStats } = useStudy()
  const todayStats = getTodayStats()

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours > 0) {
      return `${hours}h ${mins}m`
    }
    return `${mins}m`
  }

  return (
    <header className="mb-8" role="banner">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Brain className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                StudyFlow
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-300">Smart Study Management</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Today's Stats */}
          <div className="hidden sm:flex items-center gap-4 px-4 py-2 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-200/50 dark:border-gray-700/50">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-blue-500" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {formatTime(todayStats.studyTime)}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-green-500" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{todayStats.tasksCompleted}</span>
            </div>
            {studyStreak.currentStreak > 0 && (
              <div className="flex items-center gap-2">
                <Flame className="w-4 h-4 text-orange-500" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {studyStreak.currentStreak}
                </span>
              </div>
            )}
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={toggleTheme}
            className="rounded-full p-2 hover:bg-gray-200/50 dark:hover:bg-gray-700/50 backdrop-blur-sm"
            aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
          >
            {theme === "light" ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Stats */}
      <div className="sm:hidden flex items-center justify-center gap-6 p-4 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-200/50 dark:border-gray-700/50 mb-6">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-blue-500" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {formatTime(todayStats.studyTime)} today
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Trophy className="w-4 h-4 text-green-500" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{todayStats.tasksCompleted} done</span>
        </div>
        {studyStreak.currentStreak > 0 && (
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 text-orange-500" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {studyStreak.currentStreak} streak
            </span>
          </div>
        )}
      </div>
    </header>
  )
}
