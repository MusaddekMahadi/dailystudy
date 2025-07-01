"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Play, Pause, Square, RotateCcw, Timer, Zap, Clock, Waves } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import { useStudy } from "./StudyProvider"

type StudyTechnique = "pomodoro" | "timeblock" | "flowtime" | "sprint"

interface TechniqueConfig {
  name: string
  description: string
  icon: React.ReactNode
  defaultDuration: number
  hasBreaks: boolean
  color: string
}

const techniques: Record<StudyTechnique, TechniqueConfig> = {
  pomodoro: {
    name: "Pomodoro",
    description: "25min focus + 5min break",
    icon: <Timer className="w-5 h-5" />,
    defaultDuration: 25,
    hasBreaks: true,
    color: "from-red-500 to-pink-600",
  },
  timeblock: {
    name: "Time Block",
    description: "Dedicated time blocks",
    icon: <Clock className="w-5 h-5" />,
    defaultDuration: 60,
    hasBreaks: false,
    color: "from-blue-500 to-cyan-600",
  },
  flowtime: {
    name: "Flow Time",
    description: "Natural work rhythm",
    icon: <Waves className="w-5 h-5" />,
    defaultDuration: 90,
    hasBreaks: false,
    color: "from-green-500 to-emerald-600",
  },
  sprint: {
    name: "Study Sprint",
    description: "Short intense bursts",
    icon: <Zap className="w-5 h-5" />,
    defaultDuration: 15,
    hasBreaks: false,
    color: "from-purple-500 to-violet-600",
  },
}

export default function StudyTimer() {
  const [technique, setTechnique] = useState<StudyTechnique>("pomodoro")
  const [duration, setDuration] = useState(25)
  const [timeLeft, setTimeLeft] = useState(25 * 60)
  const [isRunning, setIsRunning] = useState(false)
  const [isBreak, setIsBreak] = useState(false)
  const [currentSubject, setCurrentSubject] = useState("")
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null)
  const [focusRating, setFocusRating] = useState([4])
  const [distractions, setDistractions] = useState(0)
  const [completedPomodoros, setCompletedPomodoros] = useState(0)

  const intervalRef = useRef<NodeJS.Timeout>()
  const { addStudySession, tasks } = useStudy()

  // Load timer state
  useEffect(() => {
    const saved = localStorage.getItem("timerState")
    if (saved) {
      const state = JSON.parse(saved)
      setTechnique(state.technique || "pomodoro")
      setDuration(state.duration || 25)
      setTimeLeft(state.timeLeft || 25 * 60)
      setCurrentSubject(state.subject || "")
      setCompletedPomodoros(state.completedPomodoros || 0)
    }
  }, [])

  // Save timer state
  useEffect(() => {
    const state = {
      technique,
      duration,
      timeLeft,
      subject: currentSubject,
      completedPomodoros,
    }
    localStorage.setItem("timerState", JSON.stringify(state))
  }, [technique, duration, timeLeft, currentSubject, completedPomodoros])

  // Timer logic
  useEffect(() => {
    if (isRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleSessionComplete()
            return 0
          }
          return prev - 1
        })
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
  }, [isRunning, timeLeft])

  const handleSessionComplete = () => {
    setIsRunning(false)

    if (sessionStartTime && currentSubject) {
      const sessionDuration = Math.round((Date.now() - sessionStartTime.getTime()) / (1000 * 60))

      addStudySession({
        subject: currentSubject,
        technique,
        duration: sessionDuration,
        startTime: sessionStartTime,
        endTime: new Date(),
        focusRating: focusRating[0] as 1 | 2 | 3 | 4 | 5,
        completed: true,
        breaks: 0,
        distractions,
      })
    }

    if (technique === "pomodoro" && !isBreak) {
      setCompletedPomodoros((prev) => prev + 1)
      setIsBreak(true)
      setTimeLeft(5 * 60) // 5 minute break

      // Show notification
      if ("Notification" in window && Notification.permission === "granted") {
        new Notification("Pomodoro Complete! 🍅", {
          body: "Time for a 5-minute break!",
          icon: "/placeholder.svg?height=64&width=64",
        })
      }
    } else if (technique === "pomodoro" && isBreak) {
      setIsBreak(false)
      setTimeLeft(duration * 60)

      if ("Notification" in window && Notification.permission === "granted") {
        new Notification("Break Over! ⚡", {
          body: "Ready for another focused session?",
          icon: "/placeholder.svg?height=64&width=64",
        })
      }
    } else {
      // Other techniques
      if ("Notification" in window && Notification.permission === "granted") {
        new Notification("Study Session Complete! 🎉", {
          body: `Great work on your ${techniques[technique].name} session!`,
          icon: "/placeholder.svg?height=64&width=64",
        })
      }
    }
  }

  const startTimer = () => {
    if (!currentSubject.trim()) {
      alert("Please enter a subject to study!")
      return
    }

    setIsRunning(true)
    setSessionStartTime(new Date())

    // Request notification permission
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission()
    }
  }

  const pauseTimer = () => {
    setIsRunning(false)
  }

  const stopTimer = () => {
    if (isRunning && sessionStartTime && currentSubject) {
      const sessionDuration = Math.round((Date.now() - sessionStartTime.getTime()) / (1000 * 60))

      if (sessionDuration > 0) {
        addStudySession({
          subject: currentSubject,
          technique,
          duration: sessionDuration,
          startTime: sessionStartTime,
          endTime: new Date(),
          focusRating: focusRating[0] as 1 | 2 | 3 | 4 | 5,
          completed: false,
          breaks: 0,
          distractions,
        })
      }
    }

    setIsRunning(false)
    setTimeLeft(duration * 60)
    setSessionStartTime(null)
    setIsBreak(false)
  }

  const resetTimer = () => {
    setIsRunning(false)
    setTimeLeft(duration * 60)
    setSessionStartTime(null)
    setIsBreak(false)
    setDistractions(0)
  }

  const changeTechnique = (newTechnique: StudyTechnique) => {
    setTechnique(newTechnique)
    setDuration(techniques[newTechnique].defaultDuration)
    setTimeLeft(techniques[newTechnique].defaultDuration * 60)
    setIsBreak(false)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const getProgress = () => {
    const totalSeconds = duration * 60
    return ((totalSeconds - timeLeft) / totalSeconds) * 100
  }

  const currentTechnique = techniques[technique]

  return (
    <section className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-3xl shadow-xl p-8 border border-gray-200/50 dark:border-gray-700/50">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className={`p-3 rounded-2xl bg-gradient-to-r ${currentTechnique.color} text-white shadow-lg`}>
            {currentTechnique.icon}
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
              {isBreak ? "Break Time" : currentTechnique.name}
            </h2>
            <p className="text-gray-600 dark:text-gray-300 text-sm">
              {isBreak ? "Relax and recharge" : currentTechnique.description}
            </p>
          </div>
        </div>

        {/* Timer Display */}
        <div className="relative mb-8">
          <div className="text-6xl md:text-7xl font-mono font-bold text-gray-800 dark:text-white mb-4">
            {formatTime(timeLeft)}
          </div>

          {/* Progress Ring */}
          <div className="relative w-48 h-48 mx-auto mb-6">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="45"
                stroke="currentColor"
                strokeWidth="2"
                fill="none"
                className="text-gray-200 dark:text-gray-700"
              />
              <circle
                cx="50"
                cy="50"
                r="45"
                stroke="currentColor"
                strokeWidth="3"
                fill="none"
                strokeDasharray={`${2 * Math.PI * 45}`}
                strokeDashoffset={`${2 * Math.PI * 45 * (1 - getProgress() / 100)}`}
                className={`transition-all duration-1000 ${isBreak ? "text-green-500" : "text-indigo-500"}`}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-sm font-medium text-gray-600 dark:text-gray-300">{Math.round(getProgress())}%</div>
                {technique === "pomodoro" && (
                  <div className="text-xs text-gray-500 dark:text-gray-400">🍅 {completedPomodoros}</div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Subject Input */}
        {!isRunning && (
          <div className="mb-6">
            <Input
              placeholder="What are you studying? (e.g., Mathematics, History)"
              value={currentSubject}
              onChange={(e) => setCurrentSubject(e.target.value)}
              className="text-center text-lg py-3 bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm border-gray-300/50 dark:border-gray-600/50"
            />
          </div>
        )}

        {/* Current Subject Display */}
        {isRunning && currentSubject && (
          <div className="mb-6 p-4 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-2xl border border-indigo-200/50 dark:border-indigo-700/50">
            <p className="text-lg font-medium text-gray-800 dark:text-white">
              Studying: <span className="text-indigo-600 dark:text-indigo-400">{currentSubject}</span>
            </p>
          </div>
        )}

        {/* Controls */}
        <div className="flex justify-center gap-3 mb-6">
          {!isRunning ? (
            <Button
              onClick={startTimer}
              size="lg"
              className={`bg-gradient-to-r ${currentTechnique.color} text-white shadow-lg hover:shadow-xl transition-all duration-200 px-8 py-3`}
              disabled={!currentSubject.trim()}
            >
              <Play className="w-5 h-5 mr-2" />
              Start {isBreak ? "Break" : "Session"}
            </Button>
          ) : (
            <>
              <Button
                onClick={pauseTimer}
                size="lg"
                variant="outline"
                className="px-6 py-3 bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm"
              >
                <Pause className="w-5 h-5 mr-2" />
                Pause
              </Button>
              <Button
                onClick={stopTimer}
                size="lg"
                variant="outline"
                className="px-6 py-3 bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm"
              >
                <Square className="w-5 h-5 mr-2" />
                Stop
              </Button>
            </>
          )}

          <Button
            onClick={resetTimer}
            size="lg"
            variant="outline"
            className="px-6 py-3 bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm"
          >
            <RotateCcw className="w-5 h-5" />
          </Button>
        </div>

        {/* Technique Selector */}
        {!isRunning && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            {Object.entries(techniques).map(([key, tech]) => (
              <Button
                key={key}
                onClick={() => changeTechnique(key as StudyTechnique)}
                variant={technique === key ? "default" : "outline"}
                className={`p-4 h-auto flex flex-col gap-2 ${
                  technique === key
                    ? `bg-gradient-to-r ${tech.color} text-white`
                    : "bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm"
                }`}
              >
                {tech.icon}
                <div className="text-xs font-medium">{tech.name}</div>
              </Button>
            ))}
          </div>
        )}

        {/* Duration Slider */}
        {!isRunning && technique !== "pomodoro" && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Duration: {duration} minutes
            </label>
            <Slider
              value={[duration]}
              onValueChange={(value) => {
                setDuration(value[0])
                setTimeLeft(value[0] * 60)
              }}
              max={120}
              min={5}
              step={5}
              className="w-full max-w-md mx-auto"
            />
          </div>
        )}

        {/* Session Feedback */}
        {isRunning && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Focus Level: {focusRating[0]}/5
              </label>
              <Slider
                value={focusRating}
                onValueChange={setFocusRating}
                max={5}
                min={1}
                step={1}
                className="w-full max-w-xs mx-auto"
              />
            </div>

            <Button
              onClick={() => setDistractions((prev) => prev + 1)}
              variant="outline"
              size="sm"
              className="bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm"
            >
              Mark Distraction ({distractions})
            </Button>
          </div>
        )}
      </div>
    </section>
  )
}
