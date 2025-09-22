"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  Play, 
  Clock, 
  Target, 
  BookOpen, 
  ArrowRight, 
  RefreshCw,
  Calendar,
  Timer,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Star,
  Bookmark,
  Eye,
  EyeOff
} from "lucide-react"
import { LearningPath, LearningModule } from "@/lib/types"
import { learningPathBookmarkService, ResumeData, BookmarkedPath } from "@/lib/services/learningPathBookmarkService"
import { progressService } from "@/lib/services/progressService"
import { cn } from "@/lib/utils"

interface LearningPathResumeProps {
  paths: LearningPath[]
  onPathSelect?: (path: LearningPath) => void
  onModuleSelect?: (path: LearningPath, module: LearningModule) => void
  className?: string
}

export function LearningPathResume({ 
  paths, 
  onPathSelect,
  onModuleSelect,
  className 
}: LearningPathResumeProps) {
  const [resumeData, setResumeData] = useState<ResumeData[]>([])
  const [bookmarks, setBookmarks] = useState<BookmarkedPath[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showCompleted, setShowCompleted] = useState(false)

  useEffect(() => {
    loadResumeData()
  }, [paths])

  const loadResumeData = async () => {
    setIsLoading(true)
    try {
      const allResumeData = learningPathBookmarkService.getAllResumeData()
      const allBookmarks = learningPathBookmarkService.getBookmarks()
      
      // Filter out completed paths if showCompleted is false
      const filteredResumeData = showCompleted 
        ? allResumeData 
        : allResumeData.filter(resume => {
            const bookmark = allBookmarks.find(b => b.pathId === resume.pathId)
            return bookmark && bookmark.progress < 100
          })

      setResumeData(filteredResumeData)
      setBookmarks(allBookmarks)
    } catch (error) {
      console.error('Error loading resume data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleResume = (resume: ResumeData) => {
    const bookmark = bookmarks.find(b => b.pathId === resume.pathId)
    if (bookmark) {
      const module = bookmark.path.modules.find(m => m.id === resume.moduleId)
      if (module && onModuleSelect) {
        onModuleSelect(bookmark.path, module)
      } else if (onPathSelect) {
        onPathSelect(bookmark.path)
      }
    }
  }

  const handleClearResume = (pathId: number) => {
    learningPathBookmarkService.clearResumeData(pathId)
    loadResumeData()
  }

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return 'Just now'
    if (diffInHours < 24) return `${diffInHours}h ago`
    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays < 7) return `${diffInDays}d ago`
    const diffInWeeks = Math.floor(diffInDays / 7)
    return `${diffInWeeks}w ago`
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
          <span>Loading resume data...</span>
        </div>
      </div>
    )
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Resume Learning</h2>
          <p className="text-muted-foreground">
            Continue where you left off in your learning journey
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowCompleted(!showCompleted)}
          >
            {showCompleted ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
            {showCompleted ? 'Hide Completed' : 'Show Completed'}
          </Button>
          <Button variant="outline" onClick={loadResumeData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Resume List */}
      {resumeData.length > 0 ? (
        <div className="space-y-4">
          {resumeData.map((resume) => {
            const bookmark = bookmarks.find(b => b.pathId === resume.pathId)
            if (!bookmark) return null

            const module = bookmark.path.modules.find(m => m.id === resume.moduleId)
            const isCompleted = bookmark.progress >= 100

            return (
              <ResumeCard
                key={resume.pathId}
                resume={resume}
                bookmark={bookmark}
                module={module}
                isCompleted={isCompleted}
                onResume={handleResume}
                onClearResume={handleClearResume}
                getTimeAgo={getTimeAgo}
                getProgressColor={getProgressColor}
              />
            )
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Play className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No Resume Data</h3>
            <p className="text-muted-foreground mb-4">
              {showCompleted 
                ? "You don't have any completed learning paths to resume."
                : "Start a learning path to see resume options here."
              }
            </p>
            <Button onClick={() => onPathSelect && onPathSelect({} as LearningPath)}>
              <BookOpen className="h-4 w-4 mr-2" />
              Browse Learning Paths
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// Resume Card Component
interface ResumeCardProps {
  resume: ResumeData
  bookmark: BookmarkedPath
  module: LearningModule | undefined
  isCompleted: boolean
  onResume: (resume: ResumeData) => void
  onClearResume: (pathId: number) => void
  getTimeAgo: (dateString: string) => string
  getProgressColor: (progress: number) => string
}

function ResumeCard({ 
  resume, 
  bookmark, 
  module, 
  isCompleted, 
  onResume, 
  onClearResume,
  getTimeAgo,
  getProgressColor 
}: ResumeCardProps) {
  const [showDetails, setShowDetails] = useState(false)

  return (
    <Card className={cn(
      "group hover:shadow-md transition-all duration-200",
      isCompleted && "opacity-75"
    )}>
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          {/* Path Image */}
          {bookmark.path.bannerImage && (
            <img
              src={bookmark.path.bannerImage}
              alt={bookmark.path.title}
              className="w-20 h-20 object-cover rounded-lg"
            />
          )}

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <h3 className="font-semibold line-clamp-1">{bookmark.path.title}</h3>
                <p className="text-sm text-muted-foreground line-clamp-1">
                  {module ? `Module: ${module.title}` : 'Learning Path'}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {isCompleted && (
                  <Badge className="bg-green-100 text-green-800">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Completed
                  </Badge>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowDetails(!showDetails)}
                >
                  {showDetails ? 'Hide Details' : 'Show Details'}
                </Button>
              </div>
            </div>

            {/* Progress */}
            <div className="space-y-2 mb-3">
              <div className="flex items-center justify-between text-sm">
                <span>Progress</span>
                <span className={getProgressColor(bookmark.progress)}>
                  {bookmark.progress.toFixed(0)}%
                </span>
              </div>
              <Progress value={bookmark.progress} className="h-2" />
            </div>

            {/* Quick Info */}
            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {getTimeAgo(resume.lastAccessedAt)}
              </div>
              <div className="flex items-center gap-1">
                <Target className="h-4 w-4" />
                {bookmark.path.level}
              </div>
              <div className="flex items-center gap-1">
                <Timer className="h-4 w-4" />
                {bookmark.path.duration}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button 
                  size="sm" 
                  onClick={() => onResume(resume)}
                  disabled={isCompleted}
                >
                  <Play className="h-4 w-4 mr-2" />
                  {isCompleted ? 'Completed' : 'Resume'}
                </Button>
                {!isCompleted && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => onClearResume(resume.pathId)}
                  >
                    Clear Resume
                  </Button>
                )}
              </div>
              <div className="flex items-center gap-1">
                {bookmark.isFavorite && (
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                )}
                <Bookmark className="h-4 w-4 text-blue-500" />
              </div>
            </div>

            {/* Detailed Information */}
            {showDetails && (
              <div className="mt-4 pt-4 border-t space-y-3">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Path Level:</span> {bookmark.path.level}
                  </div>
                  <div>
                    <span className="font-medium">Difficulty:</span> {bookmark.path.difficulty}
                  </div>
                  <div>
                    <span className="font-medium">Duration:</span> {bookmark.path.duration}
                  </div>
                  <div>
                    <span className="font-medium">Modules:</span> {bookmark.path.modules.length}
                  </div>
                </div>

                {module && (
                  <div className="text-sm">
                    <span className="font-medium">Current Module:</span> {module.title}
                    <p className="text-muted-foreground mt-1">{module.shortDescription}</p>
                  </div>
                )}

                {bookmark.notes && (
                  <div className="text-sm">
                    <span className="font-medium">Notes:</span>
                    <p className="text-muted-foreground mt-1">{bookmark.notes}</p>
                  </div>
                )}

                {bookmark.tags && bookmark.tags.length > 0 && (
                  <div className="text-sm">
                    <span className="font-medium">Tags:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {bookmark.tags.map((tag, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <div className="text-sm text-muted-foreground">
                  <span className="font-medium">Last Accessed:</span> {new Date(resume.lastAccessedAt).toLocaleString()}
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default LearningPathResume
