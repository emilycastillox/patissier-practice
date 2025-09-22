"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { StarRating } from "@/components/ui/star-rating"
import { BookmarkButton, BookmarkBadge } from "@/components/ui/bookmark-button"
import { ProgressIndicator } from "@/components/ui/progress-indicator"
import { useProgress } from "@/lib/contexts/ProgressContext"
import { useReviews } from "@/lib/contexts/ReviewContext"
import { 
  Clock, 
  Users, 
  Star, 
  Play, 
  CheckCircle,
  Target,
  TrendingUp
} from "lucide-react"
import { Technique } from "@/lib/types"
import { cn } from "@/lib/utils"

interface TechniqueCardProps {
  technique: Technique
  layout?: "grid" | "grid-sm" | "list" | "masonry"
  onImageGalleryOpen: (technique: Technique) => void
  onTechniqueClick: (technique: Technique) => void
  onToggleComplete: (techniqueId: number) => void
  className?: string
}

export function TechniqueCard({
  technique,
  layout = "grid",
  onImageGalleryOpen,
  onTechniqueClick,
  onToggleComplete,
  className,
}: TechniqueCardProps) {
  const { getTechniqueProgress, markTechniqueComplete, markTechniqueIncomplete } = useProgress()
  const { getTechniqueRating } = useReviews()
  
  const progress = getTechniqueProgress(technique.id)
  const rating = getTechniqueRating(technique.id)

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

  const handleToggleComplete = () => {
    if (progress.isCompleted) {
      markTechniqueIncomplete(technique.id)
    } else {
      markTechniqueComplete(technique.id)
    }
  }

  // Grid layout (default)
  if (layout === "grid") {
    return (
      <Card className={cn("group hover:shadow-lg transition-all duration-300 overflow-hidden", className)}>
        <div className="relative">
          <img
            src={technique.image || "/placeholder.svg"}
            alt={technique.title}
            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300 cursor-pointer"
            onClick={() => onImageGalleryOpen(technique)}
          />
          <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors duration-300" />
          
          {/* Bookmark badges */}
          <BookmarkBadge techniqueId={technique.id} type="favorite" />
          <BookmarkBadge techniqueId={technique.id} type="bookmark" className="top-8" />
          
          {/* Action buttons */}
          <div className="absolute top-4 right-4 flex flex-col gap-2">
            <Button 
              size="sm" 
              className="bg-white/90 text-gray-900 hover:bg-white"
              onClick={(e) => {
                e.stopPropagation()
                onTechniqueClick(technique)
              }}
            >
              <Play className="h-4 w-4 mr-1" />
              Watch
            </Button>
          </div>
          
          <Badge className={`absolute bottom-4 left-4 ${getDifficultyColor(technique.difficulty)}`}>
            {technique.difficulty}
          </Badge>
          
          {/* Progress indicator */}
          {progress.completionPercentage > 0 && (
            <div className="absolute bottom-4 right-4 bg-white/90 rounded-full px-2 py-1 text-xs font-medium">
              {progress.completionPercentage}%
            </div>
          )}
          
          {/* Completion indicator */}
          {progress.isCompleted && (
            <div className="absolute top-4 left-4 bg-green-500 text-white rounded-full p-1">
              <CheckCircle className="h-4 w-4" />
            </div>
          )}
        </div>

        <CardHeader className="pb-3">
          <CardTitle className="text-lg text-balance line-clamp-2">{technique.title}</CardTitle>
          <p className="text-sm text-muted-foreground text-pretty line-clamp-2">{technique.description}</p>
        </CardHeader>

        <CardContent className="pt-0">
          <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {technique.duration}
              </div>
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                {technique.students.toLocaleString()}
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              {rating ? rating.averageRating.toFixed(1) : technique.rating}
              {rating && rating.totalRatings > 0 && (
                <span className="text-xs text-muted-foreground">
                  ({rating.totalRatings})
                </span>
              )}
            </div>
          </div>

          <div className="space-y-3">
            {/* Progress bar */}
            {progress.completionPercentage > 0 && (
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-primary h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress.completionPercentage}%` }}
                />
              </div>
            )}
            
            <div className="flex gap-2">
              <Button className="flex-1" onClick={() => onTechniqueClick(technique)}>
                {progress.isCompleted ? "Review" : "Start Learning"}
              </Button>
              <Button
                variant={progress.isCompleted ? "default" : "outline"}
                size="sm"
                onClick={handleToggleComplete}
                className={progress.isCompleted ? "bg-green-500 hover:bg-green-600" : ""}
              >
                {progress.isCompleted ? "✓" : "○"}
              </Button>
              <BookmarkButton 
                techniqueId={technique.id} 
                type="favorite" 
                size="sm" 
                variant="outline"
              />
              <BookmarkButton 
                techniqueId={technique.id} 
                type="bookmark" 
                size="sm" 
                variant="outline"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Compact grid layout
  if (layout === "grid-sm") {
    return (
      <Card className={cn("group hover:shadow-md transition-all duration-300 overflow-hidden", className)}>
        <div className="relative">
          <img
            src={technique.image || "/placeholder.svg"}
            alt={technique.title}
            className="w-full h-32 object-cover group-hover:scale-105 transition-transform duration-300 cursor-pointer"
            onClick={() => onImageGalleryOpen(technique)}
          />
          <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors duration-300" />
          
          {/* Bookmark badges */}
          <BookmarkBadge techniqueId={technique.id} type="favorite" />
          <BookmarkBadge techniqueId={technique.id} type="bookmark" className="top-6" />
          
          <Badge className={`absolute bottom-2 left-2 text-xs ${getDifficultyColor(technique.difficulty)}`}>
            {technique.difficulty}
          </Badge>
          
          {/* Completion indicator */}
          {progress.isCompleted && (
            <div className="absolute top-2 left-2 bg-green-500 text-white rounded-full p-1">
              <CheckCircle className="h-3 w-3" />
            </div>
          )}
        </div>

        <CardContent className="p-3">
          <CardTitle className="text-sm font-medium line-clamp-2 mb-1">{technique.title}</CardTitle>
          
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {technique.duration}
            </div>
            <div className="flex items-center gap-1">
              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
              {rating ? rating.averageRating.toFixed(1) : technique.rating}
            </div>
          </div>

          {/* Progress bar */}
          {progress.completionPercentage > 0 && (
            <div className="w-full bg-gray-200 rounded-full h-1 mb-2">
              <div 
                className="bg-primary h-1 rounded-full transition-all duration-300"
                style={{ width: `${progress.completionPercentage}%` }}
              />
            </div>
          )}
          
          <div className="flex gap-1">
            <Button 
              size="sm" 
              className="flex-1 text-xs h-7"
              onClick={() => onTechniqueClick(technique)}
            >
              <Play className="h-3 w-3 mr-1" />
              {progress.isCompleted ? "Review" : "Start"}
            </Button>
            <Button
              variant={progress.isCompleted ? "default" : "outline"}
              size="sm"
              onClick={handleToggleComplete}
              className={`h-7 w-7 p-0 ${progress.isCompleted ? "bg-green-500 hover:bg-green-600" : ""}`}
            >
              {progress.isCompleted ? "✓" : "○"}
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  // List layout
  if (layout === "list") {
    return (
      <Card className={cn("group hover:shadow-md transition-all duration-300", className)}>
        <div className="flex gap-4 p-4">
          <div className="relative flex-shrink-0">
            <img
              src={technique.image || "/placeholder.svg"}
              alt={technique.title}
              className="w-24 h-24 object-cover rounded-lg cursor-pointer"
              onClick={() => onImageGalleryOpen(technique)}
            />
            <BookmarkBadge techniqueId={technique.id} type="favorite" />
            <BookmarkBadge techniqueId={technique.id} type="bookmark" className="top-6" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1 min-w-0">
                <CardTitle className="text-lg font-semibold line-clamp-1">{technique.title}</CardTitle>
                <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{technique.description}</p>
              </div>
              <div className="flex items-center gap-2 ml-4">
                <Badge className={getDifficultyColor(technique.difficulty)}>
                  {technique.difficulty}
                </Badge>
                {progress.isCompleted && (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                )}
              </div>
            </div>

            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {technique.duration}
              </div>
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                {technique.students.toLocaleString()}
              </div>
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                {rating ? rating.averageRating.toFixed(1) : technique.rating}
                {rating && rating.totalRatings > 0 && (
                  <span className="text-xs">
                    ({rating.totalRatings})
                  </span>
                )}
              </div>
            </div>

            {/* Progress bar */}
            {progress.completionPercentage > 0 && (
              <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                <div 
                  className="bg-primary h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress.completionPercentage}%` }}
                />
              </div>
            )}

            <div className="flex items-center gap-2">
              <Button onClick={() => onTechniqueClick(technique)}>
                <Play className="h-4 w-4 mr-2" />
                {progress.isCompleted ? "Review Technique" : "Start Learning"}
              </Button>
              <Button
                variant={progress.isCompleted ? "default" : "outline"}
                size="sm"
                onClick={handleToggleComplete}
                className={progress.isCompleted ? "bg-green-500 hover:bg-green-600" : ""}
              >
                {progress.isCompleted ? "✓" : "○"}
              </Button>
              <BookmarkButton 
                techniqueId={technique.id} 
                type="favorite" 
                size="sm" 
                variant="outline"
              />
              <BookmarkButton 
                techniqueId={technique.id} 
                type="bookmark" 
                size="sm" 
                variant="outline"
              />
            </div>
          </div>
        </div>
      </Card>
    )
  }

  // Masonry layout
  if (layout === "masonry") {
    return (
      <Card className={cn("group hover:shadow-lg transition-all duration-300 overflow-hidden", className)}>
        <div className="relative">
          <img
            src={technique.image || "/placeholder.svg"}
            alt={technique.title}
            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300 cursor-pointer"
            onClick={() => onImageGalleryOpen(technique)}
          />
          <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors duration-300" />
          
          {/* Bookmark badges */}
          <BookmarkBadge techniqueId={technique.id} type="favorite" />
          <BookmarkBadge techniqueId={technique.id} type="bookmark" className="top-8" />
          
          <Badge className={`absolute bottom-4 left-4 ${getDifficultyColor(technique.difficulty)}`}>
            {technique.difficulty}
          </Badge>
          
          {/* Completion indicator */}
          {progress.isCompleted && (
            <div className="absolute top-4 left-4 bg-green-500 text-white rounded-full p-1">
              <CheckCircle className="h-4 w-4" />
            </div>
          )}
        </div>

        <CardContent className="p-4">
          <CardTitle className="text-lg font-semibold line-clamp-2 mb-2">{technique.title}</CardTitle>
          <p className="text-sm text-muted-foreground line-clamp-3 mb-3">{technique.description}</p>
          
          <div className="flex items-center justify-between text-sm text-muted-foreground mb-3">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {technique.duration}
              </div>
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                {rating ? rating.averageRating.toFixed(1) : technique.rating}
              </div>
            </div>
          </div>

          {/* Progress bar */}
          {progress.completionPercentage > 0 && (
            <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
              <div 
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress.completionPercentage}%` }}
              />
            </div>
          )}
          
          <div className="flex gap-2">
            <Button 
              size="sm" 
              className="flex-1"
              onClick={() => onTechniqueClick(technique)}
            >
              <Play className="h-4 w-4 mr-1" />
              {progress.isCompleted ? "Review" : "Start"}
            </Button>
            <Button
              variant={progress.isCompleted ? "default" : "outline"}
              size="sm"
              onClick={handleToggleComplete}
              className={progress.isCompleted ? "bg-green-500 hover:bg-green-600" : ""}
            >
              {progress.isCompleted ? "✓" : "○"}
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return null
}

export default TechniqueCard
