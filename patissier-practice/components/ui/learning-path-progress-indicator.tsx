"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { 
  CheckCircle, 
  Play, 
  Lock, 
  Clock, 
  Target, 
  TrendingUp, 
  Award,
  BookOpen,
  Star,
  Users,
  Calendar,
  Zap
} from "lucide-react"
import { LearningPath, LearningModule, LearningPathLevel } from "@/lib/types"
import { progressService } from "@/lib/services/progressService"
import { cn } from "@/lib/utils"

interface LearningPathProgressIndicatorProps {
  path: LearningPath
  showModules?: boolean
  showStats?: boolean
  compact?: boolean
  className?: string
}

export function LearningPathProgressIndicator({ 
  path, 
  showModules = true, 
  showStats = true,
  compact = false,
  className 
}: LearningPathProgressIndicatorProps) {
  const pathProgress = progressService.getPathProgress(path.id)
  const completionPercentage = progressService.calculatePathCompletion(path)

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

  const getLevelColor = (level: LearningPathLevel) => {
    switch (level) {
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

  const getModuleStatus = (module: LearningModule) => {
    const moduleProgress = progressService.getModuleProgress(module.id)
    
    if (moduleProgress?.status === 'completed') {
      return { 
        status: 'completed', 
        icon: CheckCircle, 
        color: 'text-green-500',
        progress: 100
      }
    }
    
    if (moduleProgress?.status === 'in-progress') {
      return { 
        status: 'in-progress', 
        icon: Play, 
        color: 'text-blue-500',
        progress: moduleProgress.completionPercentage
      }
    }
    
    if (module.isUnlocked) {
      return { 
        status: 'unlocked', 
        icon: Play, 
        color: 'text-gray-500',
        progress: 0
      }
    }
    
    return { 
      status: 'locked', 
      icon: Lock, 
      color: 'text-gray-400',
      progress: 0
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

  const getStatusBadge = () => {
    if (completionPercentage === 100) {
      return <Badge className="bg-green-100 text-green-800">Completed</Badge>
    }
    if (completionPercentage > 0) {
      return <Badge className="bg-blue-100 text-blue-800">In Progress</Badge>
    }
    return <Badge variant="outline">Not Started</Badge>
  }

  if (compact) {
    return (
      <div className={cn("flex items-center gap-3 p-3 bg-muted/30 rounded-lg", className)}>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-medium truncate">{path.title}</h4>
            {getStatusBadge()}
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {path.duration}
            </div>
            <div className="flex items-center gap-1">
              <Target className="h-4 w-4" />
              {path.modules.length} modules
            </div>
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              {path.averageRating.toFixed(1)}
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-sm font-medium">{completionPercentage}%</div>
            <div className="text-xs text-muted-foreground">Complete</div>
          </div>
          <div className="w-16">
            <Progress value={completionPercentage} className="h-2" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <Card className={cn("", className)}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="flex items-center gap-2 mb-2">
              <BookOpen className="h-5 w-5" />
              {path.title}
            </CardTitle>
            <p className="text-muted-foreground text-sm mb-3">
              {path.shortDescription}
            </p>
            <div className="flex items-center gap-2">
              <Badge className={getDifficultyColor(path.difficulty)}>
                {path.difficulty}
              </Badge>
              <Badge className={getLevelColor(path.level)}>
                {path.level}
              </Badge>
              {getStatusBadge()}
              {path.isRecommended && (
                <Badge className="bg-blue-100 text-blue-800">
                  <Zap className="h-3 w-3 mr-1" />
                  Recommended
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Progress Overview */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Overall Progress</span>
            <span className="text-sm text-muted-foreground">
              {completionPercentage}% Complete
            </span>
          </div>
          <Progress value={completionPercentage} className="h-3" />
          
          {pathProgress && (
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>
                {pathProgress.completedModules.length} of {path.modules.length} modules completed
              </span>
              {pathProgress.timeSpent > 0 && (
                <span>
                  {formatTime(pathProgress.timeSpent)} spent
                </span>
              )}
            </div>
          )}
        </div>

        {/* Stats */}
        {showStats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-3 border-t">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground mb-1">
                <Clock className="h-4 w-4" />
                Duration
              </div>
              <div className="font-medium">{path.duration}</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground mb-1">
                <Target className="h-4 w-4" />
                Modules
              </div>
              <div className="font-medium">{path.modules.length}</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground mb-1">
                <Users className="h-4 w-4" />
                Students
              </div>
              <div className="font-medium">{path.totalStudents.toLocaleString()}</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground mb-1">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                Rating
              </div>
              <div className="font-medium">{path.averageRating.toFixed(1)}</div>
            </div>
          </div>
        )}

        {/* Module Progress */}
        {showModules && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Module Progress</h4>
              <span className="text-sm text-muted-foreground">
                {path.modules.filter(m => {
                  const progress = progressService.getModuleProgress(m.id)
                  return progress?.status === 'completed'
                }).length} / {path.modules.length} completed
              </span>
            </div>
            
            <div className="space-y-2">
              {path.modules.map((module, index) => {
                const moduleStatus = getModuleStatus(module)
                const StatusIcon = moduleStatus.icon
                
                return (
                  <div
                    key={module.id}
                    className={cn(
                      "flex items-center gap-3 p-2 rounded-lg border transition-colors",
                      moduleStatus.status === 'completed' && "bg-green-50 border-green-200",
                      moduleStatus.status === 'in-progress' && "bg-blue-50 border-blue-200",
                      moduleStatus.status === 'unlocked' && "hover:bg-muted/50",
                      moduleStatus.status === 'locked' && "opacity-60"
                    )}
                  >
                    <StatusIcon className={cn("h-5 w-5", moduleStatus.color)} />
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">{module.title}</span>
                        <Badge variant="outline" className="text-xs">
                          {module.difficulty}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-1">
                        {module.shortDescription}
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <div className="text-xs text-muted-foreground">
                        {module.duration}
                      </div>
                      {moduleStatus.status === 'in-progress' && (
                        <div className="w-16">
                          <Progress value={moduleStatus.progress} className="h-1" />
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Tags */}
        {path.tags.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium text-sm">Tags</h4>
            <div className="flex flex-wrap gap-1">
              {path.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default LearningPathProgressIndicator
