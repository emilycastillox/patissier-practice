"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Textarea } from "@/components/ui/textarea"
import { 
  CheckCircle, 
  Play, 
  Pause, 
  RotateCcw, 
  Clock, 
  Target, 
  Bookmark,
  BookmarkCheck,
  Star,
  Edit3,
  Save,
  X,
  Award,
  TrendingUp,
  Calendar,
  Timer
} from "lucide-react"
import { LearningModule, LearningPath } from "@/lib/types"
import { progressService, ModuleProgress } from "@/lib/services/progressService"
import { cn } from "@/lib/utils"

interface ModuleProgressTrackerProps {
  module: LearningModule
  path: LearningPath
  onProgressUpdate?: (progress: ModuleProgress) => void
  onComplete?: (moduleId: number) => void
  onReset?: (moduleId: number) => void
  className?: string
}

export function ModuleProgressTracker({ 
  module, 
  path, 
  onProgressUpdate,
  onComplete,
  onReset,
  className 
}: ModuleProgressTrackerProps) {
  const [progress, setProgress] = useState<ModuleProgress | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [notes, setNotes] = useState("")
  const [isBookmarked, setIsBookmarked] = useState(false)

  useEffect(() => {
    loadProgress()
  }, [module.id])

  const loadProgress = () => {
    const moduleProgress = progressService.getModuleProgress(module.id)
    setProgress(moduleProgress)
    setNotes(moduleProgress?.notes || "")
    setIsBookmarked(moduleProgress?.bookmarked || false)
  }

  const updateProgress = (updates: Partial<ModuleProgress>) => {
    progressService.updateModuleProgress(module.id, path.id, updates)
    const updatedProgress = progressService.getModuleProgress(module.id)
    setProgress(updatedProgress)
    if (onProgressUpdate && updatedProgress) {
      onProgressUpdate(updatedProgress)
    }
  }

  const handleStart = () => {
    updateProgress({
      status: 'in-progress',
      startedAt: new Date().toISOString(),
      attempts: (progress?.attempts || 0) + 1
    })
  }

  const handlePause = () => {
    updateProgress({
      status: 'in-progress'
    })
  }

  const handleComplete = (score?: number) => {
    updateProgress({
      status: 'completed',
      completionPercentage: 100,
      completedAt: new Date().toISOString(),
      score: score || 100
    })
    
    if (onComplete) {
      onComplete(module.id)
    }
  }

  const handleReset = () => {
    updateProgress({
      status: 'not-started',
      completionPercentage: 0,
      startedAt: undefined,
      completedAt: undefined,
      score: undefined,
      attempts: 0
    })
    
    if (onReset) {
      onReset(module.id)
    }
  }

  const handleProgressChange = (percentage: number) => {
    updateProgress({
      completionPercentage: Math.max(0, Math.min(100, percentage))
    })
  }

  const handleSaveNotes = () => {
    updateProgress({ notes })
    setIsEditing(false)
  }

  const handleToggleBookmark = () => {
    const newBookmarked = !isBookmarked
    setIsBookmarked(newBookmarked)
    updateProgress({ bookmarked: newBookmarked })
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Beginner":
        return "bg-green-100 text-green-800"
      case "Intermediate":
        return "bg-yellow-100 text-yellow-800"
      case "Advanced":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "text-green-600"
      case "in-progress":
        return "text-blue-600"
      case "not-started":
        return "text-gray-500"
      default:
        return "text-gray-500"
    }
  }

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours > 0) {
      return `${hours}h ${mins}m`
    }
    return `${mins}m`
  }

  const getStatusIcon = () => {
    if (progress?.status === 'completed') {
      return <CheckCircle className="h-5 w-5 text-green-500" />
    }
    if (progress?.status === 'in-progress') {
      return <Play className="h-5 w-5 text-blue-500" />
    }
    return <Target className="h-5 w-5 text-gray-400" />
  }

  const getStatusText = () => {
    if (progress?.status === 'completed') {
      return "Completed"
    }
    if (progress?.status === 'in-progress') {
      return "In Progress"
    }
    return "Not Started"
  }

  return (
    <Card className={cn("", className)}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="flex items-center gap-2 mb-2">
              {getStatusIcon()}
              {module.title}
            </CardTitle>
            <p className="text-muted-foreground text-sm mb-3">
              {module.description}
            </p>
            <div className="flex items-center gap-2">
              <Badge className={getDifficultyColor(module.difficulty)}>
                {module.difficulty}
              </Badge>
              <Badge variant="outline">
                Module {module.order}
              </Badge>
              <Badge variant="outline" className={getStatusColor(progress?.status || 'not-started')}>
                {getStatusText()}
              </Badge>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleToggleBookmark}
            >
              {isBookmarked ? (
                <BookmarkCheck className="h-4 w-4 text-primary" />
              ) : (
                <Bookmark className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Progress Bar */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Progress</span>
            <span className="text-sm text-muted-foreground">
              {progress?.completionPercentage || 0}%
            </span>
          </div>
          <Progress value={progress?.completionPercentage || 0} className="h-3" />
          
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>
              {progress?.attempts || 0} attempt{progress?.attempts !== 1 ? 's' : ''}
            </span>
            {progress?.timeSpent && progress.timeSpent > 0 && (
              <span>
                {formatTime(progress.timeSpent)} spent
              </span>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {progress?.status === 'not-started' && (
            <Button onClick={handleStart} className="flex-1">
              <Play className="h-4 w-4 mr-2" />
              Start Module
            </Button>
          )}
          
          {progress?.status === 'in-progress' && (
            <>
              <Button 
                variant="outline" 
                onClick={handlePause}
                className="flex-1"
              >
                <Pause className="h-4 w-4 mr-2" />
                Pause
              </Button>
              <Button 
                onClick={() => handleComplete()}
                className="flex-1"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Complete
              </Button>
            </>
          )}
          
          {progress?.status === 'completed' && (
            <Button 
              variant="outline" 
              onClick={handleReset}
              className="flex-1"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset
            </Button>
          )}
        </div>

        {/* Manual Progress Control */}
        {progress?.status === 'in-progress' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Manual Progress</span>
              <span className="text-sm text-muted-foreground">
                {progress.completionPercentage}%
              </span>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="0"
                max="100"
                value={progress.completionPercentage}
                onChange={(e) => handleProgressChange(parseInt(e.target.value))}
                className="flex-1"
              />
              <Button
                size="sm"
                onClick={() => handleComplete()}
                disabled={progress.completionPercentage < 100}
              >
                Complete
              </Button>
            </div>
          </div>
        )}

        {/* Module Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-3 border-t">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground mb-1">
              <Clock className="h-4 w-4" />
              Duration
            </div>
            <div className="font-medium">{module.duration}</div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground mb-1">
              <Target className="h-4 w-4" />
              Type
            </div>
            <div className="font-medium capitalize">{module.type}</div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground mb-1">
              <TrendingUp className="h-4 w-4" />
              Score
            </div>
            <div className="font-medium">
              {progress?.score ? `${progress.score}%` : 'N/A'}
            </div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground mb-1">
              <Calendar className="h-4 w-4" />
              Started
            </div>
            <div className="font-medium text-xs">
              {progress?.startedAt 
                ? new Date(progress.startedAt).toLocaleDateString()
                : 'Not started'
              }
            </div>
          </div>
        </div>

        {/* Notes Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-sm">Notes</h4>
            {!isEditing && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsEditing(true)}
              >
                <Edit3 className="h-4 w-4 mr-1" />
                Edit
              </Button>
            )}
          </div>
          
          {isEditing ? (
            <div className="space-y-2">
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add your notes about this module..."
                className="min-h-[80px]"
              />
              <div className="flex items-center gap-2">
                <Button size="sm" onClick={handleSaveNotes}>
                  <Save className="h-4 w-4 mr-1" />
                  Save
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => {
                    setIsEditing(false)
                    setNotes(progress?.notes || "")
                  }}
                >
                  <X className="h-4 w-4 mr-1" />
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="p-3 bg-muted/30 rounded-lg">
              {progress?.notes ? (
                <p className="text-sm whitespace-pre-wrap">{progress.notes}</p>
              ) : (
                <p className="text-sm text-muted-foreground italic">
                  No notes yet. Click Edit to add your thoughts about this module.
                </p>
              )}
            </div>
          )}
        </div>

        {/* Completion Info */}
        {progress?.status === 'completed' && (
          <div className="p-3 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-center gap-2 mb-2">
              <Award className="h-4 w-4 text-green-600" />
              <span className="font-medium text-green-800">Module Completed!</span>
            </div>
            <div className="text-sm text-green-700">
              {progress.completedAt && (
                <p>Completed on {new Date(progress.completedAt).toLocaleDateString()}</p>
              )}
              {progress.score && (
                <p>Final Score: {progress.score}%</p>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default ModuleProgressTracker
