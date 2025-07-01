"use client"

import { useState } from "react"
import { Plus, Lightbulb, Star, Hash, X, BookOpen } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { useStudy } from "./StudyProvider"

export default function QuickCapture() {
  const [isExpanded, setIsExpanded] = useState(false)
  const [content, setContent] = useState("")
  const [subject, setSubject] = useState("")
  const [tags, setTags] = useState("")
  const [isImportant, setIsImportant] = useState(false)

  const { quickNotes, addQuickNote, deleteQuickNote } = useStudy()

  const handleSave = () => {
    if (!content.trim()) return

    addQuickNote({
      content: content.trim(),
      subject: subject.trim() || undefined,
      tags: tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
      isImportant,
    })

    setContent("")
    setSubject("")
    setTags("")
    setIsImportant(false)
    setIsExpanded(false)
  }

  const handleQuickSave = () => {
    if (!content.trim()) return

    addQuickNote({
      content: content.trim(),
      tags: [],
      isImportant: false,
    })

    setContent("")
  }

  return (
    <section className="space-y-4">
      {/* Quick Capture */}
      <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-3xl shadow-xl p-6 border border-gray-200/50 dark:border-gray-700/50">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-xl bg-gradient-to-r from-yellow-500 to-orange-500 text-white">
            <Lightbulb className="w-5 h-5" />
          </div>
          <h3 className="text-xl font-bold text-gray-800 dark:text-white">Quick Capture</h3>
        </div>

        <div className="space-y-3">
          <Textarea
            placeholder="Capture a quick thought, idea, or note..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-[100px] bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm border-gray-300/50 dark:border-gray-600/50 resize-none"
            onFocus={() => setIsExpanded(true)}
          />

          {isExpanded && (
            <div className="space-y-3 animate-in slide-in-from-top-2 duration-200">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  placeholder="Subject (optional)"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm"
                />
                <Input
                  placeholder="Tags (comma-separated)"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  className="bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm"
                />
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsImportant(!isImportant)}
                  className={`${
                    isImportant
                      ? "bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900/20 dark:text-yellow-300"
                      : "bg-white/50 dark:bg-gray-700/50"
                  } backdrop-blur-sm`}
                >
                  <Star className={`w-4 h-4 mr-2 ${isImportant ? "fill-current" : ""}`} />
                  Important
                </Button>
              </div>
            </div>
          )}

          <div className="flex gap-2">
            {isExpanded ? (
              <>
                <Button
                  onClick={handleSave}
                  className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Save Note
                </Button>
                <Button
                  onClick={() => setIsExpanded(false)}
                  variant="outline"
                  className="bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm"
                >
                  Cancel
                </Button>
              </>
            ) : (
              <Button
                onClick={handleQuickSave}
                className="w-full bg-gradient-to-r from-blue-500 to-cyan-600 text-white"
                disabled={!content.trim()}
              >
                <Plus className="w-4 h-4 mr-2" />
                Quick Save
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Recent Notes */}
      {quickNotes.length > 0 && (
        <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-3xl shadow-xl p-6 border border-gray-200/50 dark:border-gray-700/50">
          <div className="flex items-center gap-3 mb-4">
            <BookOpen className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white">Recent Notes</h3>
          </div>

          <div className="space-y-3 max-h-64 overflow-y-auto">
            {quickNotes.slice(0, 5).map((note) => (
              <div
                key={note.id}
                className="p-3 bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm rounded-xl border border-gray-200/50 dark:border-gray-600/50 group"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {note.isImportant && <Star className="w-4 h-4 text-yellow-500 fill-current flex-shrink-0" />}
                      {note.subject && (
                        <span className="text-xs font-medium text-indigo-600 dark:text-indigo-400 bg-indigo-100 dark:bg-indigo-900/20 px-2 py-1 rounded-full">
                          {note.subject}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">{note.content}</p>
                    {note.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {note.tags.map((tag) => (
                          <span
                            key={tag}
                            className="inline-flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-600 px-2 py-1 rounded-full"
                          >
                            <Hash className="w-3 h-3" />
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteQuickNote(note.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1 h-auto text-red-500 hover:text-red-700 hover:bg-red-100 dark:hover:bg-red-900/20"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {quickNotes.length > 5 && (
            <div className="text-center mt-3">
              <span className="text-sm text-gray-500 dark:text-gray-400">+{quickNotes.length - 5} more notes</span>
            </div>
          )}
        </div>
      )}
    </section>
  )
}
