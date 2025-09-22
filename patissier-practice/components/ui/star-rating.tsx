"use client"

import { useState } from "react"
import { Star } from "lucide-react"
import { cn } from "@/lib/utils"

interface StarRatingProps {
  rating: number
  maxRating?: number
  size?: "sm" | "md" | "lg"
  interactive?: boolean
  showValue?: boolean
  showCount?: boolean
  count?: number
  onRatingChange?: (rating: number) => void
  className?: string
}

export function StarRating({
  rating,
  maxRating = 5,
  size = "md",
  interactive = false,
  showValue = false,
  showCount = false,
  count,
  onRatingChange,
  className,
}: StarRatingProps) {
  const [hoverRating, setHoverRating] = useState(0)
  const [isHovering, setIsHovering] = useState(false)

  const getSizeClasses = () => {
    switch (size) {
      case "sm":
        return "h-3 w-3"
      case "md":
        return "h-4 w-4"
      case "lg":
        return "h-5 w-5"
      default:
        return "h-4 w-4"
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

  const displayRating = isHovering ? hoverRating : rating

  const handleMouseEnter = (starIndex: number) => {
    if (interactive) {
      setHoverRating(starIndex + 1)
      setIsHovering(true)
    }
  }

  const handleMouseLeave = () => {
    if (interactive) {
      setHoverRating(0)
      setIsHovering(false)
    }
  }

  const handleClick = (starIndex: number) => {
    if (interactive && onRatingChange) {
      onRatingChange(starIndex + 1)
    }
  }

  return (
    <div className={cn("flex items-center gap-1", className)}>
      <div 
        className="flex items-center gap-0.5"
        onMouseLeave={handleMouseLeave}
      >
        {Array.from({ length: maxRating }, (_, index) => {
          const isFilled = index < displayRating
          const isHalfFilled = index === Math.floor(displayRating) && displayRating % 1 !== 0
          
          return (
            <button
              key={index}
              type="button"
              className={cn(
                "transition-colors duration-150",
                interactive && "cursor-pointer hover:scale-110",
                !interactive && "cursor-default"
              )}
              onMouseEnter={() => handleMouseEnter(index)}
              onClick={() => handleClick(index)}
              disabled={!interactive}
            >
              <Star
                className={cn(
                  getSizeClasses(),
                  isFilled || isHalfFilled
                    ? "fill-yellow-400 text-yellow-400"
                    : "text-gray-300",
                  interactive && "hover:fill-yellow-300 hover:text-yellow-300"
                )}
              />
            </button>
          )
        })}
      </div>
      
      {(showValue || showCount) && (
        <div className={cn("ml-2 text-muted-foreground", getTextSize())}>
          {showValue && (
            <span className="font-medium">
              {rating.toFixed(1)}
            </span>
          )}
          {showValue && showCount && count !== undefined && (
            <span className="mx-1">•</span>
          )}
          {showCount && count !== undefined && (
            <span>({count})</span>
          )}
        </div>
      )}
    </div>
  )
}

interface RatingDistributionProps {
  distribution: {
    1: number
    2: number
    3: number
    4: number
    5: number
  }
  totalRatings: number
  className?: string
}

export function RatingDistribution({
  distribution,
  totalRatings,
  className,
}: RatingDistributionProps) {
  const getPercentage = (count: number) => {
    return totalRatings > 0 ? (count / totalRatings) * 100 : 0
  }

  return (
    <div className={cn("space-y-2", className)}>
      {[5, 4, 3, 2, 1].map((rating) => {
        const count = distribution[rating as keyof typeof distribution]
        const percentage = getPercentage(count)
        
        return (
          <div key={rating} className="flex items-center gap-2">
            <div className="flex items-center gap-1 w-8">
              <span className="text-sm font-medium">{rating}</span>
              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
            </div>
            <div className="flex-1 bg-gray-200 rounded-full h-2">
              <div
                className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                style={{ width: `${percentage}%` }}
              />
            </div>
            <div className="text-sm text-muted-foreground w-8 text-right">
              {count}
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default StarRating
