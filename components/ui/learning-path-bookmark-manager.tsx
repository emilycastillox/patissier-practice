"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Bookmark, 
  BookmarkCheck, 
  Star, 
  Clock, 
  Target, 
  Filter, 
  Search, 
  SortAsc, 
  SortDesc, 
  Edit, 
  Trash2, 
  Download, 
  Upload, 
  RefreshCw,
  Play,
  Pause,
  Calendar,
  Tag,
  Flag,
  BarChart3,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  MoreHorizontal,
  Eye,
  EyeOff
} from "lucide-react"
import { LearningPath, LearningModule } from "@/lib/types"
import { learningPathBookmarkService, BookmarkedPath, BookmarkFilters, BookmarkStats } from "@/lib/services/learningPathBookmarkService"
import { cn } from "@/lib/utils"

interface LearningPathBookmarkManagerProps {
  paths: LearningPath[]
  onPathSelect?: (path: LearningPath) => void
  onModuleSelect?: (path: LearningPath, module: LearningModule) => void
  className?: string
}

export function LearningPathBookmarkManager({ 
  paths, 
  onPathSelect,
  onModuleSelect,
  className 
}: LearningPathBookmarkManagerProps) {
  const [bookmarks, setBookmarks] = useState<BookmarkedPath[]>([])
  const [filteredBookmarks, setFilteredBookmarks] = useState<BookmarkedPath[]>([])
  const [stats, setStats] = useState<BookmarkStats | null>(null)
  const [filters, setFilters] = useState<BookmarkFilters>({})
  const [sortBy, setSortBy] = useState<'title' | 'progress' | 'bookmarkedAt' | 'lastAccessedAt' | 'priority'>('lastAccessedAt')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')
  const [activeTab, setActiveTab] = useState('all')
  const [isLoading, setIsLoading] = useState(true)
  const [editingBookmark, setEditingBookmark] = useState<BookmarkedPath | null>(null)

  useEffect(() => {
    loadBookmarks()
  }, [paths])

  useEffect(() => {
    applyFilters()
  }, [bookmarks, filters, sortBy, sortDirection])

  const loadBookmarks = async () => {
    setIsLoading(true)
    try {
      // Update progress for all bookmarks
      bookmarks.forEach(bookmark => {
        learningPathBookmarkService.updateProgress(bookmark.pathId)
      })

      const allBookmarks = learningPathBookmarkService.getBookmarks()
      setBookmarks(allBookmarks)
      
      const bookmarkStats = learningPathBookmarkService.getBookmarkStats()
      setStats(bookmarkStats)
    } catch (error) {
      console.error('Error loading bookmarks:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const applyFilters = () => {
    let filtered = learningPathBookmarkService.getFilteredBookmarks(filters)
    
    // Apply tab filter
    switch (activeTab) {
      case 'favorites':
        filtered = filtered.filter(b => b.isFavorite)
        break
      case 'in-progress':
        filtered = filtered.filter(b => b.progress > 0 && b.progress < 100)
        break
      case 'completed':
        filtered = filtered.filter(b => b.progress >= 100)
        break
      case 'high-priority':
        filtered = filtered.filter(b => b.priority === 'high')
        break
    }

    // Apply sorting
    filtered = learningPathBookmarkService.sortBookmarks(filtered, sortBy, sortDirection)
    
    setFilteredBookmarks(filtered)
  }

  const handleBookmark = (path: LearningPath) => {
    const bookmark = learningPathBookmarkService.bookmarkPath(path)
    loadBookmarks()
    return bookmark
  }

  const handleRemoveBookmark = (pathId: number) => {
    learningPathBookmarkService.removeBookmark(pathId)
    loadBookmarks()
  }

  const handleToggleFavorite = (pathId: number) => {
    learningPathBookmarkService.toggleFavorite(pathId)
    loadBookmarks()
  }

  const handleUpdateNotes = (pathId: number, notes: string) => {
    learningPathBookmarkService.updateNotes(pathId, notes)
    loadBookmarks()
  }

  const handleUpdateTags = (pathId: number, tags: string[]) => {
    learningPathBookmarkService.updateTags(pathId, tags)
    loadBookmarks()
  }

  const handleUpdatePriority = (pathId: number, priority: 'low' | 'medium' | 'high') => {
    learningPathBookmarkService.updatePriority(pathId, priority)
    loadBookmarks()
  }

  const handleResume = (bookmark: BookmarkedPath) => {
    if (bookmark.currentModuleId) {
      const module = bookmark.path.modules.find(m => m.id === bookmark.currentModuleId)
      if (module && onModuleSelect) {
        onModuleSelect(bookmark.path, module)
      }
    } else if (onPathSelect) {
      onPathSelect(bookmark.path)
    }
  }

  const handleExport = () => {
    const data = learningPathBookmarkService.exportBookmarks()
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'learning-path-bookmarks.json'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const data = e.target?.result as string
        if (learningPathBookmarkService.importBookmarks(data)) {
          loadBookmarks()
        }
      }
      reader.readAsText(file)
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800'
      case 'low':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getProgressColor = (progress: number) => {
    if (progress >= 100) return 'text-green-600'
    if (progress >= 75) return 'text-blue-600'
    if (progress >= 50) return 'text-yellow-600'
    if (progress >= 25) return 'text-orange-600'
    return 'text-red-600'
  }

  if (isLoading) {
    return (
      <div className={cn("flex items-center justify-center p-8", className)}>
        <div className="flex items-center gap-2">
          <RefreshCw className="h-4 w-4 animate-spin" />
          <span>Loading bookmarks...</span>
        </div>
      </div>
    )
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">My Learning Paths</h2>
          <p className="text-muted-foreground">
            Manage your bookmarked learning paths and resume your progress
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={loadBookmarks}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <label htmlFor="import-bookmarks">
            <Button variant="outline" asChild>
              <span>
                <Upload className="h-4 w-4 mr-2" />
                Import
              </span>
            </Button>
          </label>
          <input
            id="import-bookmarks"
            type="file"
            accept=".json"
            onChange={handleImport}
            className="hidden"
          />
        </div>
      </div>

      {/* Statistics */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Bookmark className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Total Bookmarks</p>
                  <p className="text-2xl font-bold">{stats.totalBookmarks}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Star className="h-5 w-5 text-yellow-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Favorites</p>
                  <p className="text-2xl font-bold">{stats.favoriteBookmarks}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-500" />
                <div>
                  <p className="text-sm text-muted-foreground">In Progress</p>
                  <p className="text-2xl font-bold">{stats.inProgressBookmarks}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-purple-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Completed</p>
                  <p className="text-2xl font-bold">{stats.completedBookmarks}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search bookmarks..."
                value={filters.search || ''}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="pl-10"
              />
            </div>
            <div className="flex items-center gap-2">
              <Select
                value={filters.priority || ''}
                onValueChange={(value) => setFilters({ ...filters, priority: value as any || undefined })}
              >
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Priority</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={sortBy}
                onValueChange={(value) => setSortBy(value as any)}
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="title">Title</SelectItem>
                  <SelectItem value="progress">Progress</SelectItem>
                  <SelectItem value="bookmarkedAt">Bookmarked</SelectItem>
                  <SelectItem value="lastAccessedAt">Last Accessed</SelectItem>
                  <SelectItem value="priority">Priority</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')}
              >
                {sortDirection === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all">All ({bookmarks.length})</TabsTrigger>
          <TabsTrigger value="favorites">Favorites ({stats?.favoriteBookmarks || 0})</TabsTrigger>
          <TabsTrigger value="in-progress">In Progress ({stats?.inProgressBookmarks || 0})</TabsTrigger>
          <TabsTrigger value="completed">Completed ({stats?.completedBookmarks || 0})</TabsTrigger>
          <TabsTrigger value="high-priority">High Priority</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4 mt-6">
          {filteredBookmarks.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredBookmarks.map((bookmark) => (
                <BookmarkCard
                  key={bookmark.pathId}
                  bookmark={bookmark}
                  onToggleFavorite={handleToggleFavorite}
                  onRemoveBookmark={handleRemoveBookmark}
                  onUpdateNotes={handleUpdateNotes}
                  onUpdateTags={handleUpdateTags}
                  onUpdatePriority={handleUpdatePriority}
                  onResume={handleResume}
                  onEdit={() => setEditingBookmark(bookmark)}
                />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <Bookmark className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Bookmarks Found</h3>
                <p className="text-muted-foreground">
                  {activeTab === 'all' 
                    ? "You haven't bookmarked any learning paths yet."
                    : `No bookmarks match the "${activeTab}" filter.`
                  }
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Edit Bookmark Modal */}
      {editingBookmark && (
        <EditBookmarkModal
          bookmark={editingBookmark}
          onClose={() => setEditingBookmark(null)}
          onSave={(updatedBookmark) => {
            handleUpdateNotes(updatedBookmark.pathId, updatedBookmark.notes || '')
            handleUpdateTags(updatedBookmark.pathId, updatedBookmark.tags || [])
            handleUpdatePriority(updatedBookmark.pathId, updatedBookmark.priority)
            setEditingBookmark(null)
          }}
        />
      )}
    </div>
  )
}

// Bookmark Card Component
interface BookmarkCardProps {
  bookmark: BookmarkedPath
  onToggleFavorite: (pathId: number) => void
  onRemoveBookmark: (pathId: number) => void
  onUpdateNotes: (pathId: number, notes: string) => void
  onUpdateTags: (pathId: number, tags: string[]) => void
  onUpdatePriority: (pathId: number, priority: 'low' | 'medium' | 'high') => void
  onResume: (bookmark: BookmarkedPath) => void
  onEdit: () => void
}

function BookmarkCard({ 
  bookmark, 
  onToggleFavorite, 
  onRemoveBookmark, 
  onResume, 
  onEdit 
}: BookmarkCardProps) {
  const [showActions, setShowActions] = useState(false)

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800'
      case 'low':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getProgressColor = (progress: number) => {
    if (progress >= 100) return 'text-green-600'
    if (progress >= 75) return 'text-blue-600'
    if (progress >= 50) return 'text-yellow-600'
    if (progress >= 25) return 'text-orange-600'
    return 'text-red-600'
  }

  return (
    <Card className="group hover:shadow-md transition-all duration-200">
      <div className="relative">
        {bookmark.path.bannerImage && (
          <img
            src={bookmark.path.bannerImage}
            alt={bookmark.path.title}
            className="w-full h-32 object-cover rounded-t-lg"
          />
        )}
        <div className="absolute top-3 right-3 flex gap-2">
          <Badge className={getPriorityColor(bookmark.priority)}>
            {bookmark.priority}
          </Badge>
          <Button
            variant="ghost"
            size="sm"
            className="bg-white/90 hover:bg-white"
            onClick={() => onToggleFavorite(bookmark.pathId)}
          >
            {bookmark.isFavorite ? (
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            ) : (
              <Star className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      <CardContent className="p-4">
        <div className="space-y-3">
          <div>
            <h3 className="font-semibold line-clamp-2 mb-1">{bookmark.path.title}</h3>
            <p className="text-muted-foreground text-sm line-clamp-2">
              {bookmark.path.shortDescription}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="outline">{bookmark.path.level}</Badge>
            <Badge variant="outline">{bookmark.path.difficulty}</Badge>
            <Badge variant="outline">{bookmark.path.duration}</Badge>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Progress</span>
              <span className={getProgressColor(bookmark.progress)}>
                {bookmark.progress.toFixed(0)}%
              </span>
            </div>
            <Progress value={bookmark.progress} className="h-2" />
          </div>

          {bookmark.notes && (
            <div className="text-sm text-muted-foreground line-clamp-2">
              <strong>Notes:</strong> {bookmark.notes}
            </div>
          )}

          {bookmark.tags && bookmark.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {bookmark.tags.map((tag, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-2">
              <Button size="sm" onClick={() => onResume(bookmark)}>
                <Play className="h-4 w-4 mr-2" />
                {bookmark.progress > 0 ? 'Resume' : 'Start'}
              </Button>
              <Button variant="outline" size="sm" onClick={onEdit}>
                <Edit className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowActions(!showActions)}
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
              {showActions && (
                <div className="absolute right-0 top-8 bg-white border rounded-md shadow-lg z-10">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      onRemoveBookmark(bookmark.pathId)
                      setShowActions(false)
                    }}
                    className="w-full justify-start"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Remove
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Edit Bookmark Modal Component
interface EditBookmarkModalProps {
  bookmark: BookmarkedPath
  onClose: () => void
  onSave: (bookmark: BookmarkedPath) => void
}

function EditBookmarkModal({ bookmark, onClose, onSave }: EditBookmarkModalProps) {
  const [notes, setNotes] = useState(bookmark.notes || '')
  const [tags, setTags] = useState(bookmark.tags?.join(', ') || '')
  const [priority, setPriority] = useState(bookmark.priority)

  const handleSave = () => {
    const updatedBookmark = {
      ...bookmark,
      notes,
      tags: tags.split(',').map(tag => tag.trim()).filter(tag => tag),
      priority
    }
    onSave(updatedBookmark)
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md mx-4">
        <CardHeader>
          <CardTitle>Edit Bookmark</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add your notes..."
              rows={3}
            />
          </div>
          <div>
            <Label htmlFor="tags">Tags (comma-separated)</Label>
            <Input
              id="tags"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="e.g., important, review, practice"
            />
          </div>
          <div>
            <Label htmlFor="priority">Priority</Label>
            <Select value={priority} onValueChange={(value) => setPriority(value as any)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              Save
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default LearningPathBookmarkManager
