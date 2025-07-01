"use client"

import { useState, useEffect, useRef } from "react"
import { Play, Pause, RotateCcw, Clock, Coffee, Target, SkipForward } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useData, type PomodoroSession } from "./DataProvider"

type PomodoroMode = "focus" | "break" | "long-break"

export default function TimeSection() {
  const [currentTime, setCurrentTime] = useState(new Date())
  const [timerSeconds, setTimerSeconds] = useState(0)
  const [isTimerRunning, setIsTimerRunning] = useState(false)
  const [currentTask, setCurrentTask] = useState<string>("")
  const [pomodoroMode, setPomodoroMode] = useState<PomodoroMode>("focus")
  const [pomodoroSettings, setPomodoroSettings] = useState({
    focusTime: 25,
    shortBreak: 5,
    longBreak: 15,
    sessionsUntilLongBreak: 4,
  })
  const [completedPomodoros, setCompletedPomodoros] = useState(0)
  const [currentSession, setCurrentSession] = useState<PomodoroSession | null>(null)
  const [isPomodoroMode, setIsPomodoroMode] = useState(false)

  const intervalRef = useRef<NodeJS.Timeout>()
  const startTimeRef = useRef<number>(0)
  const { addStudySession, updateTaskTime, tasks } = useData()

  // Load timer state from localStorage
  useEffect(() => {
    const savedTimer = localStorage.getItem("studyTimer")
    if (savedTimer) {
      const { seconds, isRunning, startTime, task, mode, isPomo, completed } = JSON.parse(savedTimer)
      setTimerSeconds(seconds)
      setCurrentTask(task || "")
      setPomodoroMode(mode || "focus")
      setIsPomodoroMode(isPomo || false)
      setCompletedPomodoros(completed || 0)

      if (isRunning && startTime) {
        const elapsed = Math.floor((Date.now() - startTime) / 1000)
        setTimerSeconds(seconds + elapsed)
        setIsTimerRunning(true)
        startTimeRef.current = startTime
      }
    }
  }, [])

  // Save timer state to localStorage
  useEffect(() => {
    const timerState = {
      seconds: timerSeconds,
      isRunning: isTimerRunning,
      startTime: startTimeRef.current,
      task: currentTask,
      mode: pomodoroMode,
      isPomo: isPomodoroMode,
      completed: completedPomodoros,
    }
    localStorage.setItem("studyTimer", JSON.stringify(timerState))
  }, [timerSeconds, isTimerRunning, currentTask, pomodoroMode, isPomodoroMode, completedPomodoros])

  // Update current time every second
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  // Timer logic with Pomodoro support
  useEffect(() => {
    if (isTimerRunning) {
      if (!startTimeRef.current) {
        startTimeRef.current = Date.now() - timerSeconds * 1000
      }

      intervalRef.current = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000)
        const targetTime = isPomodoroMode
          ? pomodoroMode === "focus"
            ? pomodoroSettings.focusTime * 60
            : pomodoroMode === "long-break"
              ? pomodoroSettings.longBreak * 60
              : pomodoroSettings.shortBreak * 60
          : Number.POSITIVE_INFINITY

        if (elapsed >= targetTime && isPomodoroMode) {
          // Pomodoro session complete
          handlePomodoroComplete()
        } else {
          setTimerSeconds(elapsed)
        }
      }, 1000)
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isTimerRunning, isPomodoroMode, pomodoroMode, pomodoroSettings])

  // Listen for timer events from task management
  useEffect(() => {
    const handleTimerStart = (event: CustomEvent) => {
      setCurrentTask(event.detail.taskName)
      setIsTimerRunning(true)
      setIsPomodoroMode(false)
      startTimeRef.current = Date.now() - timerSeconds * 1000
    }

    const handleTimerStop = () => {
      handleTimerStop()
    }

    const handlePomodoroStart = (event: CustomEvent) => {
      setCurrentTask(event.detail.taskName)
      setIsPomodoroMode(true)
      setPomodoroMode("focus")
      setTimerSeconds(0)
      setIsTimerRunning(true)
      startTimeRef.current = Date.now()
    }

    window.addEventListener("startTimer", handleTimerStart as EventListener)
    window.addEventListener("stopTimer", handleTimerStop)
    window.addEventListener("startPomodoro", handlePomodoroStart as EventListener)

    return () => {
      window.removeEventListener("startTimer", handleTimerStart as EventListener)
      window.removeEventListener("stopTimer", handleTimerStop)
      window.removeEventListener("startPomodoro", handlePomodoroStart as EventListener)
    }
  }, [timerSeconds])

  const handlePomodoroComplete = () => {
    const duration = Math.floor(timerSeconds / 60)

    // Record study session
    if (pomodoroMode === "focus") {
      addStudySession({
        taskId: tasks.find((t) => t.name === currentTask)?.id,
        date: new Date(),
        duration,
        type: "pomodoro",
      })

      if (currentTask) {
        const taskId = tasks.find((t) => t.name === currentTask)?.id
        if (taskId) {
          updateTaskTime(taskId, timerSeconds)
        }
      }

      setCompletedPomodoros((prev) => prev + 1)
    }

    // Auto-transition to next mode
    const nextMode = getNextPomodoroMode()
    setPomodoroMode(nextMode)
    setTimerSeconds(0)
    startTimeRef.current = Date.now()

    // Show notification
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification(`${pomodoroMode === "focus" ? "Focus" : "Break"} session complete!`, {
        body: `Time for a ${nextMode === "focus" ? "focus session" : "break"}`,
        icon: "/placeholder.svg?height=64&width=64",
      })
    }
  }

  const getNextPomodoroMode = (): PomodoroMode => {
    if (pomodoroMode === "focus") {
      return completedPomodoros % pomodoroSettings.sessionsUntilLongBreak ===
        pomodoroSettings.sessionsUntilLongBreak - 1
        ? "long-break"
        : "break"
    }
    return "focus"
  }

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const formatCurrentTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour12: true,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const handleTimerToggle = () => {
    if (isTimerRunning) {
      handleTimerStop()
    } else {
      setIsTimerRunning(true)
      if (!isPomodoroMode) {
        setCurrentTask("Manual Timer")
      }
      startTimeRef.current = Date.now() - timerSeconds * 1000
    }
  }

  const handleTimerStop = () => {
    if (isTimerRunning && timerSeconds > 0) {
      const duration = Math.floor(timerSeconds / 60)
      if (duration > 0) {
        addStudySession({
          taskId: currentTask ? tasks.find((t) => t.name === currentTask)?.id : undefined,
          date: new Date(),
          duration,
          type: isPomodoroMode ? "pomodoro" : "regular",
        })

        if (currentTask && currentTask !== "Manual Timer") {
          const taskId = tasks.find((t) => t.name === currentTask)?.id
          if (taskId) {
            updateTaskTime(taskId, timerSeconds)
          }
        }
      }
    }

    setIsTimerRunning(false)
    setCurrentTask("")
    startTimeRef.current = 0
  }

  const handleTimerReset = () => {
    setTimerSeconds(0)
    setIsTimerRunning(false)
    setCurrentTask("")
    setIsPomodoroMode(false)
    setPomodoroMode("focus")
    startTimeRef.current = 0
  }

  const startPomodoroSession = () => {
    setIsPomodoroMode(true)
    setPomodoroMode("focus")
    setTimerSeconds(0)
    setIsTimerRunning(true)
    setCurrentTask("Pomodoro Session")
    startTimeRef.current = Date.now()

    // Request notification permission
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission()
    }
  }

  const skipPomodoroSession = () => {
    const nextMode = getNextPomodoroMode()
    setPomodoroMode(nextMode)
    setTimerSeconds(0)
    startTimeRef.current = Date.now()
  }

  const getCurrentModeTime = () => {
    if (!isPomodoroMode) return 0
    switch (pomodoroMode) {
      case "focus":
        return pomodoroSettings.focusTime * 60
      case "break":
        return pomodoroSettings.shortBreak * 60
      case "long-break":
        return pomodoroSettings.longBreak * 60
    }
  }

  const getRemainingTime = () => {
    if (!isPomodoroMode) return 0
    return Math.max(0, getCurrentModeTime() - timerSeconds)
  }

  const getProgressPercentage = () => {
    if (!isPomodoroMode) return 0
    const total = getCurrentModeTime()
    return total > 0 ? (timerSeconds / total) * 100 : 0
  }

  return (
    <section className="mb-8" aria-labelledby="time-section-heading">
      <h2 id="time-section-heading" className="sr-only">
        Time and Timer Section
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Current Time Display */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700 transition-colors duration-300">
          <div className="flex items-center gap-3 mb-4">
            <Clock className="w-6 h-6 text-indigo-600 dark:text-indigo-400" aria-hidden="true" />
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white">Current Time</h3>
          </div>
          <div className="text-center">
            <time
              className="text-3xl md:text-4xl font-mono font-bold text-gray-800 dark:text-white mb-2 block"
              dateTime={currentTime.toISOString()}
            >
              {formatCurrentTime(currentTime)}
            </time>
            <div className="text-gray-600 dark:text-gray-300 text-sm md:text-base">{formatDate(currentTime)}</div>
          </div>
        </div>

        {/* Study Timer with Pomodoro */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700 transition-colors duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div
                className={`w-3 h-3 rounded-full transition-colors ${
                  isTimerRunning ? "bg-green-500 animate-pulse" : "bg-gray-400"
                }`}
                aria-hidden="true"
              />
              <h3 className="text-xl font-semibold text-gray-800 dark:text-white">
                {isPomodoroMode
                  ? `Pomodoro - ${pomodoroMode.charAt(0).toUpperCase() + pomodoroMode.slice(1)}`
                  : "Study Timer"}
              </h3>
            </div>

            {isPomodoroMode && (
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span className="text-sm text-gray-600 dark:text-gray-300">{completedPomodoros} completed</span>
              </div>
            )}
          </div>

          {/* Timer Display */}
          <div className="text-center mb-4">
            <div
              className="text-3xl md:text-4xl font-mono font-bold text-indigo-600 dark:text-indigo-400 mb-2"
              role="timer"
              aria-live="polite"
              aria-atomic="true"
            >
              {isPomodoroMode ? formatTime(getRemainingTime()) : formatTime(timerSeconds)}
            </div>

            {/* Progress Bar for Pomodoro */}
            {isPomodoroMode && (
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-4">
                <div
                  className={`h-2 rounded-full transition-all duration-1000 ${
                    pomodoroMode === "focus" ? "bg-red-500" : pomodoroMode === "break" ? "bg-green-500" : "bg-blue-500"
                  }`}
                  style={{ width: `${getProgressPercentage()}%` }}
                />
              </div>
            )}

            {/* Pomodoro Settings */}
            {!isTimerRunning && !isPomodoroMode && (
              <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Pomodoro Settings</h4>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <Select
                    value={pomodoroSettings.focusTime.toString()}
                    onValueChange={(value) =>
                      setPomodoroSettings((prev) => ({ ...prev, focusTime: Number.parseInt(value) }))
                    }
                  >
                    <SelectTrigger className="h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15">15m Focus</SelectItem>
                      <SelectItem value="25">25m Focus</SelectItem>
                      <SelectItem value="30">30m Focus</SelectItem>
                      <SelectItem value="45">45m Focus</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select
                    value={pomodoroSettings.shortBreak.toString()}
                    onValueChange={(value) =>
                      setPomodoroSettings((prev) => ({ ...prev, shortBreak: Number.parseInt(value) }))
                    }
                  >
                    <SelectTrigger className="h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5m Break</SelectItem>
                      <SelectItem value="10">10m Break</SelectItem>
                      <SelectItem value="15">15m Break</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select
                    value={pomodoroSettings.longBreak.toString()}
                    onValueChange={(value) =>
                      setPomodoroSettings((prev) => ({ ...prev, longBreak: Number.parseInt(value) }))
                    }
                  >
                    <SelectTrigger className="h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15">15m Long</SelectItem>
                      <SelectItem value="20">20m Long</SelectItem>
                      <SelectItem value="30">30m Long</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {/* Timer Controls */}
            <div className="flex justify-center gap-2 flex-wrap">
              {!isPomodoroMode ? (
                <>
                  <Button
                    onClick={handleTimerToggle}
                    className={`${
                      isTimerRunning
                        ? "bg-red-500 hover:bg-red-600 focus:ring-red-500"
                        : "bg-green-500 hover:bg-green-600 focus:ring-green-500"
                    } text-white transition-colors focus:ring-2 focus:ring-offset-2`}
                  >
                    {isTimerRunning ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
                    {isTimerRunning ? "Pause" : "Start"}
                  </Button>
                  <Button
                    onClick={startPomodoroSession}
                    className="bg-indigo-500 hover:bg-indigo-600 text-white focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    disabled={isTimerRunning}
                  >
                    <Target className="w-4 h-4 mr-2" />
                    Pomodoro
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    onClick={handleTimerToggle}
                    className={`${
                      isTimerRunning
                        ? "bg-red-500 hover:bg-red-600 focus:ring-red-500"
                        : "bg-green-500 hover:bg-green-600 focus:ring-green-500"
                    } text-white`}
                  >
                    {isTimerRunning ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
                    {isTimerRunning ? "Pause" : "Resume"}
                  </Button>
                  <Button
                    onClick={skipPomodoroSession}
                    variant="outline"
                    className="border-gray-300 dark:border-gray-600 bg-transparent"
                    disabled={!isTimerRunning}
                  >
                    <SkipForward className="w-4 h-4 mr-2" />
                    Skip
                  </Button>
                </>
              )}
              <Button
                onClick={handleTimerReset}
                variant="outline"
                className="border-gray-300 hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700 bg-transparent"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Currently Working On */}
      <div
        className={`mt-6 transition-all duration-300 ${
          currentTask ? "opacity-100 transform translate-y-0" : "opacity-0 transform -translate-y-2 pointer-events-none"
        }`}
        aria-live="polite"
      >
        <div
          className={`rounded-2xl shadow-lg p-4 text-center text-white ${
            isPomodoroMode
              ? pomodoroMode === "focus"
                ? "bg-gradient-to-r from-red-500 to-pink-600"
                : pomodoroMode === "break"
                  ? "bg-gradient-to-r from-green-500 to-teal-600"
                  : "bg-gradient-to-r from-blue-500 to-purple-600"
              : "bg-gradient-to-r from-indigo-500 to-purple-600"
          }`}
        >
          <p className="text-lg font-medium flex items-center justify-center gap-2">
            {isPomodoroMode && pomodoroMode !== "focus" && <Coffee className="w-5 h-5" />}
            {isPomodoroMode
              ? pomodoroMode === "focus"
                ? `Focusing on: ${currentTask}`
                : pomodoroMode === "break"
                  ? "Short break time! ☕"
                  : "Long break time! 🧘‍♂️"
              : `Currently working on: ${currentTask}`}
          </p>
        </div>
      </div>

      {!currentTask && (
        <div className="text-center text-gray-500 dark:text-gray-400 py-6 mt-6">
          <p>No active session - Start a timer or Pomodoro session to begin tracking your study time</p>
        </div>
      )}
    </section>
  )
}
