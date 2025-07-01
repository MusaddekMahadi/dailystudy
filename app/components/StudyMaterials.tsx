"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Plus, ExternalLink, Trash2, BookOpen, GripVertical, Edit3, Search, Tag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface StudyMaterial {
  id: string
  title: string
  url: string
  description?: string
  category: string
  tags: string[]
  order: number
  lastAccessed?: Date
  accessCount: number
}

const defaultMaterials: StudyMaterial[] = [
  {
    id: "youtube",
    title: "YouTube",
    url: "https://youtube.com",
    description: "Educational videos and tutorials",
    category: "Video",
    tags: ["education", "tutorials"],
    order: 0,
    accessCount: 0,
  },
  {
    id: "chatgpt",
    title: "ChatGPT",
    url: "https://chat.openai.com",
    description: "AI assistant for learning",
    category: "AI Tools",
    tags: ["ai", "assistant"],
    order: 1,
    accessCount: 0,
  },
  {
    id: "docs",
    title: "Google Docs",
    url: "https://docs.google.com",
    description: "Document creation and collaboration",
    category: "Productivity",
    tags: ["documents", "collaboration"],
    order: 2,
    accessCount: 0,
  },
  {
    id: "scholar",
    title: "Google Scholar",
    url: "https://scholar.google.com",
    description: "Academic papers and research",
    category: "Research",
    tags: ["research", "academic"],
    order: 3,
    accessCount: 0,
  },
]

const categories = ["All", "Video", "AI Tools", "Productivity", "Research", "Reference", "Practice", "Other"]

export default function StudyMaterials() {
  const [materials, setMaterials] = useState<StudyMaterial[]>(defaultMaterials)
  const [newTitle, setNewTitle] = useState("")
  const [newUrl, setNewUrl] = useState("")
  const [newDescription, setNewDescription] = useState("")
  const [newCategory, setNewCategory] = useState("Other")
  const [newTags, setNewTags] = useState("")
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingMaterial, setEditingMaterial] = useState<string | null>(null)
  const [draggedItem, setDraggedItem] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")

  // Load materials from localStorage on component mount
  useEffect(() => {
    const savedMaterials = localStorage.getItem("studyMaterials")
    if (savedMaterials) {
      const parsedMaterials = JSON.parse(savedMaterials).map((material: any) => ({
        ...material,
        lastAccessed: material.lastAccessed ? new Date(material.lastAccessed) : undefined,
      }))
      setMaterials(parsedMaterials)
    }
  }, [])

  // Save materials to localStorage whenever materials change
  useEffect(() => {
    localStorage.setItem("studyMaterials", JSON.stringify(materials))
  }, [materials])

  const addMaterial = () => {
    if (newTitle.trim() && newUrl.trim()) {
      const newMaterial: StudyMaterial = {
        id: Date.now().toString(),
        title: newTitle.trim(),
        url: newUrl.trim().startsWith("http") ? newUrl.trim() : `https://${newUrl.trim()}`,
        description: newDescription.trim() || undefined,
        category: newCategory,
        tags: newTags
          .split(",")
          .map((tag) => tag.trim())
          .filter((tag) => tag.length > 0),
        order: materials.length,
        accessCount: 0,
      }
      setMaterials([...materials, newMaterial])
      setNewTitle("")
      setNewUrl("")
      setNewDescription("")
      setNewCategory("Other")
      setNewTags("")
      setShowAddForm(false)
    }
  }

  const deleteMaterial = (id: string) => {
    setMaterials(materials.filter((material) => material.id !== id))
  }

  const updateMaterial = (id: string, updates: Partial<StudyMaterial>) => {
    setMaterials(materials.map((material) => (material.id === id ? { ...material, ...updates } : material)))
  }

  const accessMaterial = (id: string, url: string) => {
    setMaterials(
      materials.map((material) =>
        material.id === id
          ? {
              ...material,
              accessCount: material.accessCount + 1,
              lastAccessed: new Date(),
            }
          : material,
      ),
    )
    window.open(url, "_blank")
  }

  const getFaviconUrl = (url: string) => {
    try {
      const domain = new URL(url).hostname
      return `https://www.google.com/s2/favicons?domain=${domain}&sz=32`
    } catch {
      return "/placeholder.svg?height=32&width=32"
    }
  }

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedItem(id)
    e.dataTransfer.effectAllowed = "move"
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = "move"
  }

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault()

    if (!draggedItem || draggedItem === targetId) return

    const draggedIndex = materials.findIndex((m) => m.id === draggedItem)
    const targetIndex = materials.findIndex((m) => m.id === targetId)

    if (draggedIndex === -1 || targetIndex === -1) return

    const newMaterials = [...materials]
    const [draggedMaterial] = newMaterials.splice(draggedIndex, 1)
    newMaterials.splice(targetIndex, 0, draggedMaterial)

    // Update order values
    const updatedMaterials = newMaterials.map((material, index) => ({
      ...material,
      order: index,
    }))

    setMaterials(updatedMaterials)
    setDraggedItem(null)
  }

  const filteredMaterials = materials
    .filter((material) => {
      const matchesSearch =
        material.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        material.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        material.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))

      const matchesCategory = selectedCategory === "All" || material.category === selectedCategory

      return matchesSearch && matchesCategory
    })
    .sort((a, b) => a.order - b.order)

  const getCategoryColor = (category: string) => {
    const colors = {
      Video: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300",
      "AI Tools": "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300",
      Productivity: "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300",
      Research: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300",
      Reference: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300",
      Practice: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/20 dark:text-indigo-300",
      Other: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300",
    }
    return colors[category as keyof typeof colors] || colors.Other
  }

  return (
    <section
      className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-100 dark:border-gray-700 transition-colors duration-300"
      aria-labelledby="study-materials-heading"
    >
      <div className="flex items-center justify-between mb-6">
        <h2
          id="study-materials-heading"
          className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-3"
        >
          <BookOpen className="w-6 h-6 text-indigo-600 dark:text-indigo-400" aria-hidden="true" />
          Study Materials
        </h2>
        <Button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-indigo-600 hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          aria-expanded={showAddForm}
          aria-controls="add-material-form"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Resource
        </Button>
      </div>

      {/* Search and Filter */}
      <div className="mb-6 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search materials..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {categories.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Add New Material Form */}
      {showAddForm && (
        <div id="add-material-form" className="mb-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
          <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-3">Add New Study Material</h3>
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                placeholder="Title (e.g., Khan Academy)"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                aria-label="Material title"
              />
              <Input
                placeholder="URL (e.g., https://khanacademy.org)"
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
                aria-label="Material URL"
              />
            </div>
            <Textarea
              placeholder="Description (optional)"
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              className="min-h-[80px]"
              aria-label="Material description"
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Select value={newCategory} onValueChange={setNewCategory}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.slice(1).map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                placeholder="Tags (comma-separated)"
                value={newTags}
                onChange={(e) => setNewTags(e.target.value)}
                aria-label="Material tags"
              />
            </div>
            <div className="flex gap-3">
              <Button
                onClick={addMaterial}
                className="bg-green-600 hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                disabled={!newTitle.trim() || !newUrl.trim()}
              >
                Add Material
              </Button>
              <Button
                onClick={() => setShowAddForm(false)}
                variant="outline"
                className="focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Materials Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredMaterials.map((material) => (
          <div
            key={material.id}
            draggable
            onDragStart={(e) => handleDragStart(e, material.id)}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, material.id)}
            className={`group relative bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-700 rounded-xl p-4 border border-gray-200 dark:border-gray-600 hover:border-indigo-300 dark:hover:border-indigo-500 hover:shadow-lg transition-all duration-200 cursor-pointer ${
              draggedItem === material.id ? "opacity-50 scale-95" : ""
            }`}
            onClick={() => accessMaterial(material.id, material.url)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault()
                accessMaterial(material.id, material.url)
              }
            }}
            aria-label={`Open ${material.title} - ${material.description || material.url}`}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <GripVertical
                  className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing"
                  aria-hidden="true"
                />
                <img
                  src={getFaviconUrl(material.url) || "/placeholder.svg"}
                  alt=""
                  className="w-8 h-8 rounded flex-shrink-0"
                  onError={(e) => {
                    e.currentTarget.src = "/placeholder.svg?height=32&width=32"
                  }}
                />
                <div className="flex-1 min-w-0">
                  {editingMaterial === material.id ? (
                    <Input
                      value={material.title}
                      onChange={(e) => updateMaterial(material.id, { title: e.target.value })}
                      onBlur={() => setEditingMaterial(null)}
                      onKeyDown={(e) => {
                        e.stopPropagation()
                        if (e.key === "Enter") setEditingMaterial(null)
                        if (e.key === "Escape") setEditingMaterial(null)
                      }}
                      onClick={(e) => e.stopPropagation()}
                      className="text-sm"
                      autoFocus
                    />
                  ) : (
                    <h3 className="font-semibold text-gray-800 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate">
                      {material.title}
                    </h3>
                  )}
                </div>
              </div>

              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation()
                    setEditingMaterial(material.id)
                  }}
                  className="h-8 w-8 p-0 hover:bg-blue-100 dark:hover:bg-blue-900/20 text-blue-600 dark:text-blue-400"
                  aria-label={`Edit ${material.title}`}
                >
                  <Edit3 className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation()
                    accessMaterial(material.id, material.url)
                  }}
                  className="h-8 w-8 p-0 hover:bg-indigo-100 dark:hover:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400"
                  aria-label={`Open ${material.title} in new tab`}
                >
                  <ExternalLink className="w-4 h-4" />
                </Button>
                {!defaultMaterials.find((dm) => dm.id === material.id) && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation()
                      deleteMaterial(material.id)
                    }}
                    className="h-8 w-8 p-0 hover:bg-red-100 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400"
                    aria-label={`Delete ${material.title}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>

            {/* Category Badge */}
            <div className="mb-2">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(material.category)}`}>
                {material.category}
              </span>
            </div>

            {material.description && (
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-2 line-clamp-2">{material.description}</p>
            )}

            {/* Tags */}
            {material.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-2">
                {material.tags.slice(0, 3).map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded text-xs flex items-center gap-1"
                  >
                    <Tag className="w-3 h-3" />
                    {tag}
                  </span>
                ))}
                {material.tags.length > 3 && (
                  <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded text-xs">
                    +{material.tags.length - 3}
                  </span>
                )}
              </div>
            )}

            {/* Access Stats */}
            <div className="flex justify-between items-center text-xs text-gray-400 dark:text-gray-500">
              <span className="truncate">{material.url}</span>
              {material.accessCount > 0 && <span>{material.accessCount} visits</span>}
            </div>
          </div>
        ))}
      </div>

      {filteredMaterials.length === 0 && (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>
            {searchQuery || selectedCategory !== "All"
              ? "No materials match your search criteria."
              : "No study materials yet. Add your first resource to get started!"}
          </p>
        </div>
      )}

      {/* Usage Statistics */}
      {materials.length > 0 && (
        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
          <h3 className="text-sm font-semibold text-blue-800 dark:text-blue-300 mb-2">📊 Resource Statistics</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-lg font-bold text-blue-600 dark:text-blue-400">{materials.length}</div>
              <div className="text-xs text-blue-700 dark:text-blue-300">Total Resources</div>
            </div>
            <div>
              <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                {new Set(materials.map((m) => m.category)).size}
              </div>
              <div className="text-xs text-blue-700 dark:text-blue-300">Categories</div>
            </div>
            <div>
              <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                {materials.reduce((sum, m) => sum + m.accessCount, 0)}
              </div>
              <div className="text-xs text-blue-700 dark:text-blue-300">Total Visits</div>
            </div>
            <div>
              <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                {materials.filter((m) => m.lastAccessed).length}
              </div>
              <div className="text-xs text-blue-700 dark:text-blue-300">Recently Used</div>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
