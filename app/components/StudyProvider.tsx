"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"

export interface Task {
  id: string
  title: string
  subject: string
  priority: "urgent" | "high" | "medium" | "low"
  estimatedMinutes: number
  actualMinutes: number
  isCompleted: boolean
  progress: number
  dueDate?: Date
  tags: string[]
  createdAt: Date
  completedAt?: Date
  difficulty: 1 | 2 | 3 | 4 | 5
  type: "assignment" | "reading" | "practice" | "review" | "project" | "exam-prep"
}

export interface StudySession {
  id: string
  taskId?: string
  subject: string
  technique: "pomodoro" | "timeblock" | "flowtime" | "sprint"
  duration: number // minutes
  startTime: Date
  endTime: Date
  focusRating: 1 | 2 | 3 | 4 | 5
  completed: boolean
  breaks: number
  distractions: number
}

export interface QuickNote {
  id: string
  content: string
  subject?: string
  tags: string[]
  createdAt: Date
  isImportant: boolean
}

export interface StudyStreak {
  currentStreak: number
  longestStreak: number
  lastStudyDate?: Date
  totalStudyDays: number
}

interface StudyContextType {
  // Tasks
  tasks: Task[]
  setTasks: (tasks: Task[]) => void
  addTask: (task: Omit<Task, "id" | "createdAt">) => void
  updateTask: (id: string, updates: Partial<Task>) => void
  deleteTask: (id: string) => void

  // Study Sessions
  studySessions: StudySession[]
  addStudySession: (session: Omit<StudySession, "id">) => void

  // Quick Notes
  quickNotes: QuickNote[]
  addQuickNote: (note: Omit<QuickNote, "id" | "createdAt">) => void
  deleteQuickNote: (id: string) => void

  // Study Streak
  studyStreak: StudyStreak
  updateStreak: () => void

  // Analytics
  getTodayStats: () => { studyTime: number; tasksCompleted: number; focusScore: number }
  getWeekStats: () => { studyTime: number; tasksCompleted: number; avgFocusScore: number; studyDays: number }
  getSubjectStats: () => Array<{ subject: string; time: number; tasks: number }>

  // Smart Recommendations
  getSmartRecommendations: () => Array<{ type: string; message: string; action?: string }>
}

const StudyContext = createContext<StudyContextType | undefined>(undefined)

export function StudyProvider({ children }: { children: React.ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [studySessions, setStudySessions] = useState<StudySession[]>([])
  const [quickNotes, setQuickNotes] = useState<QuickNote[]>([])
  const [studyStreak, setStudyStreak] = useState<StudyStreak>({
    currentStreak: 0,
    longestStreak: 0,
    totalStudyDays: 0,
  })

  // Load data from localStorage
  useEffect(() => {
    const savedTasks = localStorage.getItem("studyTasks")
    const savedSessions = localStorage.getItem("studySessions")
    const savedNotes = localStorage.getItem("quickNotes")
    const savedStreak = localStorage.getItem("studyStreak")

    if (savedTasks) {
      const parsedTasks = JSON.parse(savedTasks).map((task: any) => ({
        ...task,
        createdAt: new Date(task.createdAt),
        dueDate: task.dueDate ? new Date(task.dueDate) : undefined,
        completedAt: task.completedAt ? new Date(task.completedAt) : undefined,
      }))
      setTasks(parsedTasks)
    }

    if (savedSessions) {
      const parsedSessions = JSON.parse(savedSessions).map((session: any) => ({
        ...session,
        startTime: new Date(session.startTime),
        endTime: new Date(session.endTime),
      }))
      setStudySessions(parsedSessions)
    }

    if (savedNotes) {
      const parsedNotes = JSON.parse(savedNotes).map((note: any) => ({
        ...note,
        createdAt: new Date(note.createdAt),
      }))
      setQuickNotes(parsedNotes)
    }

    if (savedStreak) {
      const parsedStreak = JSON.parse(savedStreak)
      setStudyStreak({
        ...parsedStreak,
        lastStudyDate: parsedStreak.lastStudyDate ? new Date(parsedStreak.lastStudyDate) : undefined,
      })
    }
  }, [])

  // Save data to localStorage
  useEffect(() => {
    localStorage.setItem("studyTasks", JSON.stringify(tasks))
  }, [tasks])

  useEffect(() => {
    localStorage.setItem("studySessions", JSON.stringify(studySessions))
  }, [studySessions])

  useEffect(() => {
    localStorage.setItem("quickNotes", JSON.stringify(quickNotes))
  }, [quickNotes])

  useEffect(() => {
    localStorage.setItem("studyStreak", JSON.stringify(studyStreak))
  }, [studyStreak])

  const addTask = (taskData: Omit<Task, "id" | "createdAt">) => {
    const newTask: Task = {
      ...taskData,
      id: Date.now().toString(),
      createdAt: new Date(),
    }
    setTasks((prev) => [...prev, newTask])
  }

  const updateTask = (id: string, updates: Partial<Task>) => {
    setTasks((prev) => prev.map((task) => (task.id === id ? { ...task, ...updates } : task)))
  }

  const deleteTask = (id: string) => {
    setTasks((prev) => prev.filter((task) => task.id !== id))
  }

  const addStudySession = (sessionData: Omit<StudySession, "id">) => {
    const newSession: StudySession = {
      ...sessionData,
      id: Date.now().toString(),
    }
    setStudySessions((prev) => [...prev, newSession])
    updateStreak()
  }

  const addQuickNote = (noteData: Omit<QuickNote, "id" | "createdAt">) => {
    const newNote: QuickNote = {
      ...noteData,
      id: Date.now().toString(),
      createdAt: new Date(),
    }
    setQuickNotes((prev) => [...prev, newNote])
  }

  const deleteQuickNote = (id: string) => {
    setQuickNotes((prev) => prev.filter((note) => note.id !== id))
  }

  const updateStreak = () => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const lastStudy = studyStreak.lastStudyDate
    if (!lastStudy) {
      setStudyStreak((prev) => ({
        ...prev,
        currentStreak: 1,
        longestStreak: Math.max(prev.longestStreak, 1),
        lastStudyDate: today,
        totalStudyDays: prev.totalStudyDays + 1,
      }))
      return
    }

    const daysDiff = Math.floor((today.getTime() - lastStudy.getTime()) / (1000 * 60 * 60 * 24))

    if (daysDiff === 0) {
      // Same day, no change to streak
      return
    } else if (daysDiff === 1) {
      // Consecutive day
      setStudyStreak((prev) => ({
        ...prev,
        currentStreak: prev.currentStreak + 1,
        longestStreak: Math.max(prev.longestStreak, prev.currentStreak + 1),
        lastStudyDate: today,
        totalStudyDays: prev.totalStudyDays + 1,
      }))
    } else {
      // Streak broken
      setStudyStreak((prev) => ({
        ...prev,
        currentStreak: 1,
        lastStudyDate: today,
        totalStudyDays: prev.totalStudyDays + 1,
      }))
    }
  }

  const getTodayStats = () => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const todaySessions = studySessions.filter((session) => session.startTime >= today && session.startTime < tomorrow)

    const studyTime = todaySessions.reduce((sum, session) => sum + session.duration, 0)
    const tasksCompleted = tasks.filter(
      (task) => task.completedAt && task.completedAt >= today && task.completedAt < tomorrow,
    ).length
    const focusScore =
      todaySessions.length > 0
        ? todaySessions.reduce((sum, session) => sum + session.focusRating, 0) / todaySessions.length
        : 0

    return { studyTime, tasksCompleted, focusScore }
  }

  const getWeekStats = () => {
    const today = new Date()
    const weekStart = new Date(today)
    weekStart.setDate(today.getDate() - 6)
    weekStart.setHours(0, 0, 0, 0)

    const weekSessions = studySessions.filter((session) => session.startTime >= weekStart)

    const studyTime = weekSessions.reduce((sum, session) => sum + session.duration, 0)
    const tasksCompleted = tasks.filter((task) => task.completedAt && task.completedAt >= weekStart).length
    const avgFocusScore =
      weekSessions.length > 0
        ? weekSessions.reduce((sum, session) => sum + session.focusRating, 0) / weekSessions.length
        : 0

    const studyDays = new Set(weekSessions.map((session) => session.startTime.toDateString())).size

    return { studyTime, tasksCompleted, avgFocusScore, studyDays }
  }

  const getSubjectStats = () => {
    const subjectMap = new Map<string, { time: number; tasks: number }>()

    studySessions.forEach((session) => {
      const current = subjectMap.get(session.subject) || { time: 0, tasks: 0 }
      subjectMap.set(session.subject, {
        time: current.time + session.duration,
        tasks: current.tasks + (session.taskId ? 1 : 0),
      })
    })

    return Array.from(subjectMap.entries())
      .map(([subject, stats]) => ({
        subject,
        ...stats,
      }))
      .sort((a, b) => b.time - a.time)
  }

  const getSmartRecommendations = () => {
    const recommendations: Array<{ type: string; message: string; action?: string }> = []
    const todayStats = getTodayStats()
    const weekStats = getWeekStats()

    // Study time recommendations
    if (todayStats.studyTime < 30) {
      recommendations.push({
        type: "motivation",
        message: "Start with just 25 minutes of focused study today!",
        action: "start-pomodoro",
      })
    } else if (todayStats.studyTime > 240) {
      recommendations.push({
        type: "wellness",
        message: "Great work! Remember to take breaks and stay hydrated.",
      })
    }

    // Task management
    const overdueTasks = tasks.filter((task) => task.dueDate && task.dueDate < new Date() && !task.isCompleted).length

    if (overdueTasks > 0) {
      recommendations.push({
        type: "urgent",
        message: `You have ${overdueTasks} overdue task${overdueTasks > 1 ? "s" : ""}. Tackle them first!`,
        action: "view-overdue",
      })
    }

    // Focus improvement
    if (weekStats.avgFocusScore < 3 && weekStats.studyTime > 0) {
      recommendations.push({
        type: "improvement",
        message: "Try the Flowtime technique for better focus on complex tasks.",
        action: "try-flowtime",
      })
    }

    // Streak motivation
    if (studyStreak.currentStreak >= 7) {
      recommendations.push({
        type: "achievement",
        message: `Amazing! You're on a ${studyStreak.currentStreak}-day study streak! 🔥`,
      })
    }

    return recommendations
  }

  return (
    <StudyContext.Provider
      value={{
        tasks,
        setTasks,
        addTask,
        updateTask,
        deleteTask,
        studySessions,
        addStudySession,
        quickNotes,
        addQuickNote,
        deleteQuickNote,
        studyStreak,
        updateStreak,
        getTodayStats,
        getWeekStats,
        getSubjectStats,
        getSmartRecommendations,
      }}
    >
      {children}
    </StudyContext.Provider>
  )
}

export function useStudy() {
  const context = useContext(StudyContext)
  if (!context) {
    throw new Error("useStudy must be used within StudyProvider")
  }
  return context
}
