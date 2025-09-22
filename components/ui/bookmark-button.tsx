"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Heart, 
  Bookmark, 
  HeartOff, 
  BookmarkCheck,
  Loader2
} from "lucide-react"
import { useFavorites } from "@/lib/contexts/FavoritesContext"
import { cn } from "@/lib/utils"

interface BookmarkButtonProps {
  techniqueId: number
  type: "favorite" | "bookmark"
  size?: "sm" | "md" | "lg"
  variant?: "ghost" | "outline" | "default"
  showLabel?: boolean
  className?: string
  onToggle?: (isActive: boolean) => void
}

export function BookmarkButton({
  techniqueId,
  type,
  size = "md",
  variant = "ghost",
  showLabel = false,
  className,
  onToggle,
}: BookmarkButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const {
    isFavorite,
    isBookmarked,
    toggleFavorite,
    toggleBookmark,
  } = useFavorites()

  const isActive = type === "favorite" ? isFavorite(techniqueId) : isBookmarked(techniqueId)
  const toggleFunction = type === "favorite" ? toggleFavorite : toggleBookmark

  const handleClick = async () => {
    setIsLoading(true)
    try {
      toggleFunction(techniqueId)
      onToggle?.(!isActive)
    } catch (error) {
      console.error(`Error toggling ${type}:`, error)
    } finally {
      setIsLoading(false)
    }
  }

  const getIcon = () => {
    if (isLoading) {
      return <Loader2 className="h-4 w-4 animate-spin" />
    }

    if (type === "favorite") {
      return isActive ? (
        <Heart className="h-4 w-4 fill-current" />
      ) : (
        <HeartOff className="h-4 w-4" />
      )
    } else {
      return isActive ? (
        <BookmarkCheck className="h-4 w-4 fill-current" />
      ) : (
        <Bookmark className="h-4 w-4" />
      )
    }
  }

  const getLabel = () => {
    if (type === "favorite") {
      return isActive ? "Remove from Favorites" : "Add to Favorites"
    } else {
      return isActive ? "Remove Bookmark" : "Bookmark"
    }
  }

  const getSizeClasses = () => {
    switch (size) {
      case "sm":
        return "h-8 w-8 p-0"
      case "md":
        return "h-9 w-9 p-0"
      case "lg":
        return "h-10 w-10 p-0"
      default:
        return "h-9 w-9 p-0"
    }
  }

  const getTextSizeClasses = () => {
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
    <Button
      variant={variant}
      size={size === "md" ? "default" : size}
      onClick={handleClick}
      disabled={isLoading}
      className={cn(
        "transition-all duration-200",
        isActive && type === "favorite" && "text-red-500 hover:text-red-600 hover:bg-red-50",
        isActive && type === "bookmark" && "text-blue-500 hover:text-blue-600 hover:bg-blue-50",
        !isActive && "text-muted-foreground hover:text-foreground",
        showLabel && "gap-2",
        getSizeClasses(),
        className
      )}
    >
      {getIcon()}
      {showLabel && (
        <span className={getTextSizeClasses()}>
          {getLabel()}
        </span>
      )}
    </Button>
  )
}

interface BookmarkBadgeProps {
  techniqueId: number
  type: "favorite" | "bookmark"
  className?: string
}

export function BookmarkBadge({ techniqueId, type, className }: BookmarkBadgeProps) {
  const { isFavorite, isBookmarked } = useFavorites()
  const isActive = type === "favorite" ? isFavorite(techniqueId) : isBookmarked(techniqueId)

  if (!isActive) return null

  return (
    <Badge
      variant="secondary"
      className={cn(
        "absolute top-2 right-2 z-10",
        type === "favorite" && "bg-red-100 text-red-800 border-red-200",
        type === "bookmark" && "bg-blue-100 text-blue-800 border-blue-200",
        className
      )}
    >
      {type === "favorite" ? (
        <Heart className="h-3 w-3 mr-1 fill-current" />
      ) : (
        <Bookmark className="h-3 w-3 mr-1 fill-current" />
      )}
      {type === "favorite" ? "Favorite" : "Bookmarked"}
    </Badge>
  )
}

export default BookmarkButton
