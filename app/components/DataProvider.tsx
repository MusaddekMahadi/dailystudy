"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"

export interface Task {
  id: string
  name: string
  description: string
  expectedTime: number // in minutes
  actualTime: number // in seconds
  isCompleted: boolean
  progress: number // percentage
  isActive: boolean
  priority: "high" | "medium" | "low"
  createdAt: Date
  scheduledDate?: Date
  isRecurring: boolean
  recurringPattern?: "daily" | "weekly" | "monthly"
  completedSessions: PomodoroSession[]
}

export interface PomodoroSession {
  id: string
  taskId?: string
  startTime: Date
  endTime?: Date
  duration: number // in seconds
  type: "focus" | "break" | "long-break"
  completed: boolean
}

export interface StudyGoal {
  id: string
  type: "daily" | "weekly" | "monthly"
  targetHours: number
  period: Date // represents the start of the period
  progress: number // in minutes
}

export interface StudySession {
  id: string
  taskId?: string
  date: Date
  duration: number // in minutes
  type: "pomodoro" | "regular"
}

interface DataContextType {
  tasks: Task[]
  setTasks: (tasks: Task[]) => void
  pomodoroSessions: PomodoroSession[]
  setPomodoroSessions: (sessions: PomodoroSession[]) => void
  studyGoals: StudyGoal[]
  setStudyGoals: (goals: StudyGoal[]) => void
  studySessions: StudySession[]
  setStudySessions: (sessions: StudySession[]) => void
  addStudySession: (session: Omit<StudySession, "id">) => void
  updateTaskTime: (taskId: string, actualTime: number) => void
  getTodayProgress: () => number
  getWeekProgress: () => number
  getMonthProgress: () => number
}

const DataContext = createContext<DataContextType | undefined>(undefined)

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [pomodoroSessions, setPomodoroSessions] = useState<PomodoroSession[]>([])
  const [studyGoals, setStudyGoals] = useState<StudyGoal[]>([])
  const [studySessions, setStudySessions] = useState<StudySession[]>([])

  // Load data from localStorage
  useEffect(() => {
    const savedTasks = localStorage.getItem("studyTasks")
    const savedSessions = localStorage.getItem("pomodoroSessions")
    const savedGoals = localStorage.getItem("studyGoals")
    const savedStudySessions = localStorage.getItem("studySessions")

    if (savedTasks) {
      const parsedTasks = JSON.parse(savedTasks).map((task: any) => ({
        ...task,
        createdAt: new Date(task.createdAt),
        scheduledDate: task.scheduledDate ? new Date(task.scheduledDate) : undefined,
        completedSessions:
          task.completedSessions?.map((session: any) => ({
            ...session,
            startTime: new Date(session.startTime),
            endTime: session.endTime ? new Date(session.endTime) : undefined,
          })) || [],
      }))
      setTasks(parsedTasks)
    }

    if (savedSessions) {
      const parsedSessions = JSON.parse(savedSessions).map((session: any) => ({
        ...session,
        startTime: new Date(session.startTime),
        endTime: session.endTime ? new Date(session.endTime) : undefined,
      }))
      setPomodoroSessions(parsedSessions)
    }

    if (savedGoals) {
      const parsedGoals = JSON.parse(savedGoals).map((goal: any) => ({
        ...goal,
        period: new Date(goal.period),
      }))
      setStudyGoals(parsedGoals)
    }

    if (savedStudySessions) {
      const parsedStudySessions = JSON.parse(savedStudySessions).map((session: any) => ({
        ...session,
        date: new Date(session.date),
      }))
      setStudySessions(parsedStudySessions)
    }
  }, [])

  // Save data to localStorage
  useEffect(() => {
    localStorage.setItem("studyTasks", JSON.stringify(tasks))
  }, [tasks])

  useEffect(() => {
    localStorage.setItem("pomodoroSessions", JSON.stringify(pomodoroSessions))
  }, [pomodoroSessions])

  useEffect(() => {
    localStorage.setItem("studyGoals", JSON.stringify(studyGoals))
  }, [studyGoals])

  useEffect(() => {
    localStorage.setItem("studySessions", JSON.stringify(studySessions))
  }, [studySessions])

  const addStudySession = (session: Omit<StudySession, "id">) => {
    const newSession: StudySession = {
      ...session,
      id: Date.now().toString(),
    }
    setStudySessions((prev) => [...prev, newSession])
  }

  const updateTaskTime = (taskId: string, actualTime: number) => {
    setTasks((prev) =>
      prev.map((task) => (task.id === taskId ? { ...task, actualTime: task.actualTime + actualTime } : task)),
    )
  }

  const getTodayProgress = () => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    return studySessions
      .filter((session) => session.date >= today && session.date < tomorrow)
      .reduce((total, session) => total + session.duration, 0)
  }

  const getWeekProgress = () => {
    const today = new Date()
    const startOfWeek = new Date(today)
    startOfWeek.setDate(today.getDate() - today.getDay())
    startOfWeek.setHours(0, 0, 0, 0)
    const endOfWeek = new Date(startOfWeek)
    endOfWeek.setDate(endOfWeek.getDate() + 7)

    return studySessions
      .filter((session) => session.date >= startOfWeek && session.date < endOfWeek)
      .reduce((total, session) => total + session.duration, 0)
  }

  const getMonthProgress = () => {
    const today = new Date()
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1)

    return studySessions
      .filter((session) => session.date >= startOfMonth && session.date < endOfMonth)
      .reduce((total, session) => total + session.duration, 0)
  }

  return (
    <DataContext.Provider
      value={{
        tasks,
        setTasks,
        pomodoroSessions,
        setPomodoroSessions,
        studyGoals,
        setStudyGoals,
        studySessions,
        setStudySessions,
        addStudySession,
        updateTaskTime,
        getTodayProgress,
        getWeekProgress,
        getMonthProgress,
      }}
    >
      {children}
    </DataContext.Provider>
  )
}

export function useData() {
  const context = useContext(DataContext)
  if (!context) {
    throw new Error("useData must be used within DataProvider")
  }
  return context
}
