import Header from "./components/Header"
import StudyTimer from "./components/StudyTimer"
import TaskHub from "./components/TaskHub"
import Analytics from "./components/Analytics"
import QuickCapture from "./components/QuickCapture"
import { ThemeProvider } from "./components/ThemeProvider"
import { StudyProvider } from "./components/StudyProvider"

export default function Home() {
  return (
    <ThemeProvider>
      <StudyProvider>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-slate-900 dark:to-gray-800 transition-all duration-500">
          <div className="container mx-auto px-4 py-6 max-w-6xl">
            <Header />

            {/* Main Study Interface */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              <div className="lg:col-span-2">
                <StudyTimer />
              </div>
              <div>
                <QuickCapture />
              </div>
            </div>

            {/* Analytics Dashboard */}
            <Analytics />

            {/* Task Management */}
            <TaskHub />
          </div>
        </div>
      </StudyProvider>
    </ThemeProvider>
  )
}
