"use client"

import type React from "react"
import { createContext, useContext, useReducer, useEffect } from "react"

export interface Task {
  id: string
  name: string
  description?: string
  date: string
  estimatedTime: number
  actualTime?: number
  elapsedTime: number
  status: "Not Started" | "In Progress" | "Complete"
  progress: number
  notes?: string
  recurrence: "none" | "daily" | "weekly" | "monthly"
  createdAt: string
  category?: string
  priority: "low" | "medium" | "high"
}

interface TaskState {
  tasks: Task[]
  currentTaskId: string | null
  activeTaskSeconds: number
  view: "today" | "upcoming" | "recurring"
}

type TaskAction =
  | { type: "SET_TASKS"; payload: Task[] }
  | { type: "ADD_TASK"; payload: Task }
  | { type: "UPDATE_TASK"; payload: { id: string; updates: Partial<Task> } }
  | { type: "DELETE_TASK"; payload: string }
  | { type: "START_TASK"; payload: string }
  | { type: "STOP_TASK" }
  | { type: "UPDATE_TIMER"; payload: number }
  | { type: "SET_VIEW"; payload: "today" | "upcoming" | "recurring" }

const initialState: TaskState = {
  tasks: [],
  currentTaskId: null,
  activeTaskSeconds: 0,
  view: "today",
}

function taskReducer(state: TaskState, action: TaskAction): TaskState {
  switch (action.type) {
    case "SET_TASKS":
      return { ...state, tasks: action.payload }
    case "ADD_TASK":
      return { ...state, tasks: [...state.tasks, action.payload] }
    case "UPDATE_TASK":
      return {
        ...state,
        tasks: state.tasks.map((task) =>
          task.id === action.payload.id ? { ...task, ...action.payload.updates } : task,
        ),
      }
    case "DELETE_TASK":
      return {
        ...state,
        tasks: state.tasks.filter((task) => task.id !== action.payload),
        currentTaskId: state.currentTaskId === action.payload ? null : state.currentTaskId,
      }
    case "START_TASK":
      return {
        ...state,
        currentTaskId: action.payload,
        activeTaskSeconds: 0,
        tasks: state.tasks.map((task) =>
          task.id === action.payload ? { ...task, status: "In Progress" as const } : task,
        ),
      }
    case "STOP_TASK":
      return {
        ...state,
        currentTaskId: null,
        activeTaskSeconds: 0,
      }
    case "UPDATE_TIMER":
      return { ...state, activeTaskSeconds: action.payload }
    case "SET_VIEW":
      return { ...state, view: action.payload }
    default:
      return state
  }
}

const TaskContext = createContext<{
  state: TaskState
  dispatch: React.Dispatch<TaskAction>
  addTask: (task: Omit<Task, "id" | "createdAt">) => void
  updateTask: (id: string, updates: Partial<Task>) => void
  deleteTask: (id: string) => void
  startTask: (id: string) => void
  stopTask: () => void
  getFilteredTasks: () => Task[]
} | null>(null)

export function TaskProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(taskReducer, initialState)

  // Load tasks from localStorage on mount
  useEffect(() => {
    const savedTasks = localStorage.getItem("advanced-study-tasks")
    if (savedTasks) {
      try {
        const tasks = JSON.parse(savedTasks)
        dispatch({ type: "SET_TASKS", payload: tasks })
      } catch (error) {
        console.error("Failed to load tasks:", error)
      }
    }
  }, [])

  // Save tasks to localStorage whenever tasks change
  useEffect(() => {
    if (state.tasks.length > 0) {
      localStorage.setItem("advanced-study-tasks", JSON.stringify(state.tasks))
    }
  }, [state.tasks])

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null

    if (state.currentTaskId) {
      interval = setInterval(() => {
        dispatch({ type: "UPDATE_TIMER", payload: state.activeTaskSeconds + 1 })

        // Update elapsed time every minute
        if ((state.activeTaskSeconds + 1) % 60 === 0) {
          const minutes = Math.floor((state.activeTaskSeconds + 1) / 60)
          dispatch({
            type: "UPDATE_TASK",
            payload: {
              id: state.currentTaskId,
              updates: { elapsedTime: minutes },
            },
          })
        }
      }, 1000)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [state.currentTaskId, state.activeTaskSeconds])

  const addTask = (taskData: Omit<Task, "id" | "createdAt">) => {
    const newTask: Task = {
      ...taskData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    }
    dispatch({ type: "ADD_TASK", payload: newTask })
  }

  const updateTask = (id: string, updates: Partial<Task>) => {
    dispatch({ type: "UPDATE_TASK", payload: { id, updates } })
  }

  const deleteTask = (id: string) => {
    dispatch({ type: "DELETE_TASK", payload: id })
  }

  const startTask = (id: string) => {
    if (state.currentTaskId) {
      // Stop current task first
      const currentTask = state.tasks.find((t) => t.id === state.currentTaskId)
      if (currentTask) {
        const elapsedMinutes = Math.floor(state.activeTaskSeconds / 60)
        dispatch({
          type: "UPDATE_TASK",
          payload: {
            id: state.currentTaskId,
            updates: { elapsedTime: currentTask.elapsedTime + elapsedMinutes },
          },
        })
      }
    }
    dispatch({ type: "START_TASK", payload: id })
  }

  const stopTask = () => {
    if (state.currentTaskId) {
      const currentTask = state.tasks.find((t) => t.id === state.currentTaskId)
      if (currentTask) {
        const elapsedMinutes = Math.floor(state.activeTaskSeconds / 60)
        dispatch({
          type: "UPDATE_TASK",
          payload: {
            id: state.currentTaskId,
            updates: { elapsedTime: currentTask.elapsedTime + elapsedMinutes },
          },
        })
      }
    }
    dispatch({ type: "STOP_TASK" })
  }

  const getFilteredTasks = () => {
    const today = new Date().toISOString().split("T")[0]

    switch (state.view) {
      case "today":
        return state.tasks.filter((task) => task.date === today || (task.recurrence && task.recurrence !== "none"))
      case "upcoming":
        return state.tasks.filter((task) => task.date > today && (!task.recurrence || task.recurrence === "none"))
      case "recurring":
        return state.tasks.filter((task) => task.recurrence && task.recurrence !== "none")
      default:
        return state.tasks
    }
  }

  return (
    <TaskContext.Provider
      value={{
        state,
        dispatch,
        addTask,
        updateTask,
        deleteTask,
        startTask,
        stopTask,
        getFilteredTasks,
      }}
    >
      {children}
    </TaskContext.Provider>
  )
}

export function useTask() {
  const context = useContext(TaskContext)
  if (!context) {
    throw new Error("useTask must be used within a TaskProvider")
  }
  return context
}
