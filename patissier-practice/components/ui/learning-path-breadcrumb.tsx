"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  ChevronRight, 
  Home, 
  BookOpen, 
  Play, 
  CheckCircle, 
  Lock,
  Clock,
  Users,
  Star,
  Target,
  TrendingUp
} from "lucide-react"
import { LearningPath, LearningModule } from "@/lib/types"
import { useLearningPath } from "@/lib/contexts/LearningPathContext"
import { cn } from "@/lib/utils"

interface LearningPathBreadcrumbProps {
  className?: string
  showProgress?: boolean
  showStats?: boolean
  onPathClick?: () => void
  onModuleClick?: () => void
}

export function LearningPathBreadcrumb({ 
  className, 
  showProgress = true, 
  showStats = true,
  onPathClick,
  onModuleClick
}: LearningPathBreadcrumbProps) {
  const {
    currentPath,
    currentModule,
    pathProgress,
    getPathProgress,
    getNextModule,
    getPreviousModule,
    navigateToModule,
    navigateToPath
  } = useLearningPath()

  if (!currentPath) {
    return (
      <div className={cn("flex items-center gap-2 text-muted-foreground", className)}>
        <Home className="h-4 w-4" />
        <span>Learning Paths</span>
      </div>
    )
  }

  const progress = getPathProgress(currentPath.id)
  const nextModule = getNextModule()
  const previousModule = getPreviousModule()

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

  const handlePathClick = () => {
    if (onPathClick) {
      onPathClick()
    } else {
      // Default behavior: navigate to path overview
      navigateToPath(currentPath.id)
    }
  }

  const handleModuleClick = () => {
    if (onModuleClick) {
      onModuleClick()
    }
  }

  const handleNextModule = () => {
    if (nextModule) {
      navigateToModule(nextModule.id)
    }
  }

  const handlePreviousModule = () => {
    if (previousModule) {
      navigateToModule(previousModule.id)
    }
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-sm">
        <Button
          variant="ghost"
          size="sm"
          className="h-auto p-0 text-muted-foreground hover:text-foreground"
        >
          <Home className="h-4 w-4 mr-1" />
          Learning Paths
        </Button>
        
        <ChevronRight className="h-4 w-4 text-muted-foreground" />
        
        <Button
          variant="ghost"
          size="sm"
          className="h-auto p-0 text-foreground hover:text-primary"
          onClick={handlePathClick}
        >
          <BookOpen className="h-4 w-4 mr-1" />
          {currentPath.title}
        </Button>

        {currentModule && (
          <>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
            
            <Button
              variant="ghost"
              size="sm"
              className="h-auto p-0 text-foreground hover:text-primary"
              onClick={handleModuleClick}
            >
              <Play className="h-4 w-4 mr-1" />
              {currentModule.title}
            </Button>
          </>
        )}
      </div>

      {/* Path Information */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold">{currentPath.title}</h1>
            <p className="text-muted-foreground">{currentPath.shortDescription}</p>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge className={getDifficultyColor(currentPath.difficulty)}>
              {currentPath.difficulty}
            </Badge>
            <Badge variant="outline">
              {currentPath.level}
            </Badge>
            {currentPath.isRecommended && (
              <Badge className="bg-blue-100 text-blue-800">
                <TrendingUp className="h-3 w-3 mr-1" />
                Recommended
              </Badge>
            )}
          </div>
        </div>

        {showStats && (
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {currentPath.duration}
            </div>
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              {currentPath.totalStudents.toLocaleString()}
            </div>
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              {currentPath.averageRating.toFixed(1)}
            </div>
          </div>
        )}
      </div>

      {/* Progress Section */}
      {showProgress && (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">Learning Progress</span>
            <span className="text-muted-foreground">{progress}% Complete</span>
          </div>
          
          <Progress value={progress} className="h-2" />
          
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>
              {pathProgress?.completedModules.length || 0} of {currentPath.modules.length} modules completed
            </span>
            {pathProgress?.timeSpent && (
              <span>
                {Math.round(pathProgress.timeSpent / 60)}h {pathProgress.timeSpent % 60}m spent
              </span>
            )}
          </div>
        </div>
      )}

      {/* Current Module Information */}
      {currentModule && (
        <div className="bg-muted/30 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-primary" />
              <span className="font-medium">Current Module</span>
            </div>
            <Badge className={getDifficultyColor(currentModule.difficulty)}>
              {currentModule.difficulty}
            </Badge>
          </div>
          
          <h3 className="text-lg font-semibold mb-1">{currentModule.title}</h3>
          <p className="text-sm text-muted-foreground mb-3">
            {currentModule.description}
          </p>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {currentModule.duration}
              </div>
              <div className="flex items-center gap-1">
                <Play className="h-4 w-4" />
                Module {currentModule.order}
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePreviousModule}
                disabled={!previousModule}
              >
                Previous
              </Button>
              <Button
                size="sm"
                onClick={handleNextModule}
                disabled={!nextModule}
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Module Navigation Pills */}
      {currentPath && (
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {currentPath.modules.map((module, index) => {
            const isCurrent = currentModule?.id === module.id
            const isCompleted = pathProgress?.completedModules.includes(module.id) || false
            const isUnlocked = module.isUnlocked || false

            return (
              <Button
                key={module.id}
                variant={isCurrent ? "default" : "outline"}
                size="sm"
                className={cn(
                  "flex items-center gap-2 whitespace-nowrap",
                  isCurrent && "bg-primary text-primary-foreground",
                  !isUnlocked && "opacity-50 cursor-not-allowed"
                )}
                onClick={() => isUnlocked && navigateToModule(module.id)}
                disabled={!isUnlocked}
              >
                {isCompleted ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : !isUnlocked ? (
                  <Lock className="h-4 w-4" />
                ) : (
                  <Play className="h-4 w-4" />
                )}
                <span className="hidden sm:inline">{module.title}</span>
                <span className="sm:hidden">{index + 1}</span>
              </Button>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default LearningPathBreadcrumb
