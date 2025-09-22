"use client"

import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  CheckCircle, 
  Clock, 
  Trophy, 
  Star, 
  Target,
  TrendingUp,
  Award,
  Zap
} from "lucide-react"
import { cn } from "@/lib/utils"

interface ProgressIndicatorProps {
  progress: number
  total: number
  completed: number
  label?: string
  showPercentage?: boolean
  showCount?: boolean
  size?: "sm" | "md" | "lg"
  variant?: "default" | "success" | "warning" | "error"
  className?: string
}

export function ProgressIndicator({
  progress,
  total,
  completed,
  label,
  showPercentage = true,
  showCount = true,
  size = "md",
  variant = "default",
  className,
}: ProgressIndicatorProps) {
  const getSizeClasses = () => {
    switch (size) {
      case "sm":
        return "h-2"
      case "md":
        return "h-3"
      case "lg":
        return "h-4"
      default:
        return "h-3"
    }
  }

  const getVariantClasses = () => {
    switch (variant) {
      case "success":
        return "bg-green-500"
      case "warning":
        return "bg-yellow-500"
      case "error":
        return "bg-red-500"
      default:
        return "bg-primary"
    }
  }

  const getTextSize = () => {
    switch (size) {
      case "sm":
        return "text-xs"
      case "md":
        return "text-sm"
      case "lg":
        return "text-base"
      default:
        return "text-sm"
    }
  }

  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <div className="flex items-center justify-between">
          <span className={cn("font-medium text-foreground", getTextSize())}>
            {label}
          </span>
          {showCount && (
            <span className={cn("text-muted-foreground", getTextSize())}>
              {completed}/{total}
            </span>
          )}
        </div>
      )}
      
      <div className="relative">
        <Progress 
          value={progress} 
          className={cn(getSizeClasses(), "w-full")}
        />
        {showPercentage && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className={cn("font-semibold text-white drop-shadow-sm", getTextSize())}>
              {Math.round(progress)}%
            </span>
          </div>
        )}
      </div>
    </div>
  )
}

interface TechniqueProgressCardProps {
  techniqueId: number
  title: string
  progress: number
  isCompleted: boolean
  timeSpent: number
  lastAccessed?: string
  difficulty: string
  onToggleComplete?: (techniqueId: number) => void
  className?: string
}

export function TechniqueProgressCard({
  techniqueId,
  title,
  progress,
  isCompleted,
  timeSpent,
  lastAccessed,
  difficulty,
  onToggleComplete,
  className,
}: TechniqueProgressCardProps) {
  const formatTime = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes}m`
    }
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
    
    if (diffInDays === 0) return "Today"
    if (diffInDays === 1) return "Yesterday"
    if (diffInDays < 7) return `${diffInDays} days ago`
    return date.toLocaleDateString()
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

  return (
    <Card className={cn("group hover:shadow-md transition-all duration-200", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg text-balance flex-1">{title}</CardTitle>
          <div className="flex items-center gap-2 ml-4">
            <Badge className={getDifficultyColor(difficulty)}>
              {difficulty}
            </Badge>
            {isCompleted && (
              <CheckCircle className="h-5 w-5 text-green-500" />
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <ProgressIndicator
          progress={progress}
          total={100}
          completed={Math.round(progress)}
          showPercentage={true}
          showCount={false}
          size="md"
          variant={isCompleted ? "success" : "default"}
        />
        
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {formatTime(timeSpent)}
            </div>
            {lastAccessed && (
              <div className="flex items-center gap-1">
                <Target className="h-4 w-4" />
                {formatDate(lastAccessed)}
              </div>
            )}
          </div>
          
          {onToggleComplete && (
            <button
              onClick={() => onToggleComplete(techniqueId)}
              className={cn(
                "px-3 py-1 rounded-full text-xs font-medium transition-colors",
                isCompleted
                  ? "bg-green-100 text-green-700 hover:bg-green-200"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              )}
            >
              {isCompleted ? "Mark Incomplete" : "Mark Complete"}
            </button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

interface UserStatsCardProps {
  level: number
  experience: number
  nextLevelExperience: number
  totalTechniquesCompleted: number
  totalTimeSpent: number
  currentStreak: number
  longestStreak: number
  className?: string
}

export function UserStatsCard({
  level,
  experience,
  nextLevelExperience,
  totalTechniquesCompleted,
  totalTimeSpent,
  currentStreak,
  longestStreak,
  className,
}: UserStatsCardProps) {
  const formatTime = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes}m`
    }
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`
  }

  const experienceProgress = (experience / nextLevelExperience) * 100

  return (
    <Card className={cn("bg-gradient-to-br from-primary/5 to-primary/10", className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-primary" />
          Your Progress
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Level and Experience */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-medium">Level {level}</span>
            <span className="text-sm text-muted-foreground">
              {experience}/{nextLevelExperience} XP
            </span>
          </div>
          <ProgressIndicator
            progress={experienceProgress}
            total={100}
            completed={experience}
            showPercentage={true}
            showCount={false}
            size="md"
            variant="success"
          />
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 bg-background/50 rounded-lg">
            <div className="flex items-center justify-center gap-1 mb-1">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="font-semibold text-lg">{totalTechniquesCompleted}</span>
            </div>
            <p className="text-xs text-muted-foreground">Techniques Completed</p>
          </div>
          
          <div className="text-center p-3 bg-background/50 rounded-lg">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Clock className="h-4 w-4 text-blue-500" />
              <span className="font-semibold text-lg">{formatTime(totalTimeSpent)}</span>
            </div>
            <p className="text-xs text-muted-foreground">Time Spent</p>
          </div>
          
          <div className="text-center p-3 bg-background/50 rounded-lg">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Zap className="h-4 w-4 text-yellow-500" />
              <span className="font-semibold text-lg">{currentStreak}</span>
            </div>
            <p className="text-xs text-muted-foreground">Current Streak</p>
          </div>
          
          <div className="text-center p-3 bg-background/50 rounded-lg">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Award className="h-4 w-4 text-purple-500" />
              <span className="font-semibold text-lg">{longestStreak}</span>
            </div>
            <p className="text-xs text-muted-foreground">Best Streak</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default ProgressIndicator
