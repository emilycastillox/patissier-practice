"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  CheckCircle, 
  XCircle, 
  Lock, 
  Unlock, 
  Clock, 
  Target, 
  Star, 
  TrendingUp,
  Award,
  BookOpen,
  Play,
  AlertCircle,
  Info,
  Zap
} from "lucide-react"
import { LearningPath, LearningModule, LearningPathLevel } from "@/lib/types"
import { prerequisiteService, PrerequisiteCheck, UnlockCondition } from "@/lib/services/prerequisiteService"
import { progressService } from "@/lib/services/progressService"
import { cn } from "@/lib/utils"

interface PrerequisiteVisualizerProps {
  module?: LearningModule
  path?: LearningPath
  paths?: LearningPath[]
  showDetails?: boolean
  compact?: boolean
  className?: string
}

export function PrerequisiteVisualizer({ 
  module, 
  path, 
  paths = [],
  showDetails = true,
  compact = false,
  className 
}: PrerequisiteVisualizerProps) {
  const [prerequisites, setPrerequisites] = useState<PrerequisiteCheck | null>(null)
  const [unlockProgress, setUnlockProgress] = useState<{
    progress: number
    total: number
    completed: number
    remaining: number
  } | null>(null)

  useEffect(() => {
    if (module && path) {
      loadModulePrerequisites()
    } else if (path) {
      loadPathPrerequisites()
    }
  }, [module, path, paths])

  const loadModulePrerequisites = () => {
    if (!module || !path) return

    const prereqCheck = prerequisiteService.checkModulePrerequisites(module, path)
    const progress = prerequisiteService.getModuleUnlockProgress(module, path)
    
    setPrerequisites(prereqCheck)
    setUnlockProgress(progress)
  }

  const loadPathPrerequisites = () => {
    if (!path) return

    const prereqCheck = prerequisiteService.checkPathPrerequisites(path)
    const progress = prerequisiteService.getPathUnlockProgress(path)
    
    setPrerequisites(prereqCheck)
    setUnlockProgress(progress)
  }

  const handleUnlock = () => {
    if (module && path) {
      const result = prerequisiteService.unlockModule(module.id, path)
      loadModulePrerequisites()
    } else if (path) {
      const result = prerequisiteService.unlockPath(path.id, paths)
      loadPathPrerequisites()
    }
  }

  const getConditionIcon = (condition: UnlockCondition) => {
    switch (condition.type) {
      case 'module_completion':
        return condition.isMet ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />
      case 'path_completion':
        return condition.isMet ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />
      case 'score_threshold':
        return condition.isMet ? <Star className="h-4 w-4" /> : <Target className="h-4 w-4" />
      case 'time_spent':
        return condition.isMet ? <Clock className="h-4 w-4" /> : <Clock className="h-4 w-4" />
      case 'attempts':
        return condition.isMet ? <Play className="h-4 w-4" /> : <Play className="h-4 w-4" />
      default:
        return <Info className="h-4 w-4" />
    }
  }

  const getConditionColor = (condition: UnlockCondition) => {
    return condition.isMet ? "text-green-600" : "text-red-600"
  }

  const getStatusBadge = () => {
    if (!prerequisites) return null

    if (prerequisites.isUnlocked) {
      return <Badge className="bg-green-100 text-green-800">Unlocked</Badge>
    }
    if (prerequisites.canUnlock) {
      return <Badge className="bg-blue-100 text-blue-800">Ready to Unlock</Badge>
    }
    return <Badge variant="outline">Locked</Badge>
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

  if (!prerequisites || !unlockProgress) {
    return (
      <div className={cn("flex items-center justify-center p-4", className)}>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Clock className="h-4 w-4 animate-spin" />
          <span>Loading prerequisites...</span>
        </div>
      </div>
    )
  }

  if (compact) {
    return (
      <div className={cn("flex items-center gap-3 p-3 bg-muted/30 rounded-lg", className)}>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-medium truncate">
              {module ? module.title : path?.title}
            </h4>
            {getStatusBadge()}
          </div>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Target className="h-4 w-4" />
              {unlockProgress.completed}/{unlockProgress.total} conditions met
            </div>
            <div className="flex items-center gap-1">
              <Progress value={unlockProgress.progress} className="w-16 h-2" />
            </div>
          </div>
        </div>
        
        {prerequisites.canUnlock && (
          <Button size="sm" onClick={handleUnlock}>
            <Unlock className="h-4 w-4 mr-1" />
            Unlock
          </Button>
        )}
      </div>
    )
  }

  return (
    <Card className={cn("", className)}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="flex items-center gap-2 mb-2">
              {prerequisites.isUnlocked ? (
                <Unlock className="h-5 w-5 text-green-600" />
              ) : (
                <Lock className="h-5 w-5 text-gray-400" />
              )}
              Prerequisites
            </CardTitle>
            <p className="text-muted-foreground text-sm">
              {module 
                ? `Requirements to unlock ${module.title}`
                : `Requirements to unlock ${path?.title}`
              }
            </p>
          </div>
          {getStatusBadge()}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Unlock Progress */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Unlock Progress</span>
            <span className="text-sm text-muted-foreground">
              {unlockProgress.completed} / {unlockProgress.total} conditions met
            </span>
          </div>
          <Progress value={unlockProgress.progress} className="h-3" />
          
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{unlockProgress.remaining} conditions remaining</span>
            <span>{Math.round(unlockProgress.progress)}% complete</span>
          </div>
        </div>

        {/* Prerequisites List */}
        {showDetails && prerequisites.unlockConditions.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium text-sm">Unlock Conditions</h4>
            <div className="space-y-2">
              {prerequisites.unlockConditions.map((condition, index) => (
                <div
                  key={index}
                  className={cn(
                    "flex items-start gap-3 p-3 rounded-lg border transition-colors",
                    condition.isMet 
                      ? "bg-green-50 border-green-200" 
                      : "bg-red-50 border-red-200"
                  )}
                >
                  <div className={cn("mt-0.5", getConditionColor(condition))}>
                    {getConditionIcon(condition)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm">{condition.description}</span>
                      {condition.isMet && (
                        <Badge variant="outline" className="text-xs">
                          Complete
                        </Badge>
                      )}
                    </div>
                    
                    {condition.requiredValue !== undefined && (
                      <div className="text-xs text-muted-foreground">
                        {condition.type === 'score_threshold' && (
                          <span>
                            Required: {condition.requiredValue}% | 
                            Current: {condition.currentValue || 0}%
                          </span>
                        )}
                        {condition.type === 'time_spent' && (
                          <span>
                            Required: {Math.floor(condition.requiredValue! / 60)}h {condition.requiredValue! % 60}m | 
                            Current: {Math.floor((condition.currentValue || 0) / 60)}h {(condition.currentValue || 0) % 60}m
                          </span>
                        )}
                        {condition.type === 'attempts' && (
                          <span>
                            Required: {condition.requiredValue} attempts | 
                            Current: {condition.currentValue || 0} attempts
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Missing Prerequisites */}
        {prerequisites.missingPrerequisites.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium text-sm text-red-600">Missing Prerequisites</h4>
            <div className="space-y-2">
              {prerequisites.missingPrerequisites.map((prereqId) => {
                const prereqModule = path?.modules.find(m => m.id === prereqId)
                const prereqPath = paths.find(p => p.id === prereqId)
                
                return (
                  <div key={prereqId} className="flex items-center gap-3 p-2 bg-red-50 rounded-lg border border-red-200">
                    <XCircle className="h-4 w-4 text-red-600" />
                    <div className="flex-1">
                      <div className="font-medium text-sm">
                        {prereqModule ? prereqModule.title : prereqPath?.title}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {prereqModule ? 'Module' : 'Path'} must be completed
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {prereqModule ? prereqModule.difficulty : prereqPath?.difficulty}
                    </Badge>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Completed Prerequisites */}
        {prerequisites.completedPrerequisites.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium text-sm text-green-600">Completed Prerequisites</h4>
            <div className="space-y-2">
              {prerequisites.completedPrerequisites.map((prereqId) => {
                const prereqModule = path?.modules.find(m => m.id === prereqId)
                const prereqPath = paths.find(p => p.id === prereqId)
                
                return (
                  <div key={prereqId} className="flex items-center gap-3 p-2 bg-green-50 rounded-lg border border-green-200">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <div className="flex-1">
                      <div className="font-medium text-sm">
                        {prereqModule ? prereqModule.title : prereqPath?.title}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {prereqModule ? 'Module' : 'Path'} completed
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {prereqModule ? prereqModule.difficulty : prereqPath?.difficulty}
                    </Badge>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Blocking Modules */}
        {prerequisites.blockingModules.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium text-sm text-blue-600">Blocking Modules</h4>
            <div className="space-y-2">
              {prerequisites.blockingModules.map((moduleId) => {
                const blockingModule = path?.modules.find(m => m.id === moduleId)
                
                return (
                  <div key={moduleId} className="flex items-center gap-3 p-2 bg-blue-50 rounded-lg border border-blue-200">
                    <AlertCircle className="h-4 w-4 text-blue-600" />
                    <div className="flex-1">
                      <div className="font-medium text-sm">
                        {blockingModule?.title}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Depends on this module
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {blockingModule?.difficulty}
                    </Badge>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Unlock Action */}
        {prerequisites.canUnlock && (
          <div className="pt-4 border-t">
            <Button onClick={handleUnlock} className="w-full">
              <Unlock className="h-4 w-4 mr-2" />
              Unlock {module ? 'Module' : 'Path'}
            </Button>
          </div>
        )}

        {/* Already Unlocked */}
        {prerequisites.isUnlocked && (
          <div className="pt-4 border-t">
            <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg border border-green-200">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-green-800">
                {module ? 'Module' : 'Path'} is already unlocked and ready to use!
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default PrerequisiteVisualizer
