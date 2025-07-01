"use client"
import { DashboardCards } from "@/components/dashboard-cards"
import { TaskManager } from "@/components/task-manager"
import { Analytics } from "@/components/analytics"
import { TaskProvider } from "@/contexts/task-context"

export default function StudyManager() {
  return (
    <TaskProvider>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          {/* Header Section */}
          <header className="text-center mb-10">
            <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-3">
              Advanced Study Manager
            </h1>
            <p className="text-slate-600 text-lg">Comprehensive task tracking with AI-powered analytics and insights</p>
          </header>

          {/* Dashboard Overview */}
          <DashboardCards />

          {/* Main Content Area */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-10">
            {/* Task Management Section */}
            <div className="lg:col-span-2">
              <TaskManager />
            </div>

            {/* Analytics Section */}
            <div className="lg:col-span-1">
              <Analytics />
            </div>
          </div>
        </div>
      </div>
    </TaskProvider>
  )
}
