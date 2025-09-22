"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { StarRating, RatingDistribution } from "@/components/ui/star-rating"
import { 
  Star, 
  ThumbsUp, 
  ThumbsDown, 
  Clock, 
  User, 
  CheckCircle,
  Filter,
  SortAsc,
  SortDesc
} from "lucide-react"
import { TechniqueReview, ReviewFilters, DifficultyLevel } from "@/lib/types"
import { cn } from "@/lib/utils"

interface ReviewListProps {
  reviews: TechniqueReview[]
  averageRating: number
  totalRatings: number
  ratingDistribution: {
    1: number
    2: number
    3: number
    4: number
    5: number
  }
  onVote: (reviewId: string, isHelpful: boolean) => void
  onFilterChange: (filters: ReviewFilters) => void
  currentFilters: ReviewFilters
  className?: string
}

export function ReviewList({
  reviews,
  averageRating,
  totalRatings,
  ratingDistribution,
  onVote,
  onFilterChange,
  currentFilters,
  className,
}: ReviewListProps) {
  const [showFilters, setShowFilters] = useState(false)

  const getDifficultyColor = (difficulty: DifficultyLevel) => {
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
    
    if (diffInDays === 0) return "Today"
    if (diffInDays === 1) return "Yesterday"
    if (diffInDays < 7) return `${diffInDays} days ago`
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`
    return date.toLocaleDateString()
  }

  const formatTime = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes}m`
    }
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`
  }

  const handleSortChange = (sortBy: ReviewFilters['sortBy']) => {
    onFilterChange({ ...currentFilters, sortBy })
  }

  const handleRatingFilter = (rating: number | undefined) => {
    onFilterChange({ ...currentFilters, rating })
  }

  const handleVerifiedFilter = (verified: boolean | undefined) => {
    onFilterChange({ ...currentFilters, verified })
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Rating Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5 text-yellow-500" />
            Reviews & Ratings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Overall Rating */}
            <div className="text-center">
              <div className="text-4xl font-bold text-primary mb-2">
                {averageRating.toFixed(1)}
              </div>
              <StarRating
                rating={averageRating}
                size="lg"
                showValue={false}
                showCount={true}
                count={totalRatings}
              />
              <p className="text-sm text-muted-foreground mt-2">
                Based on {totalRatings} review{totalRatings !== 1 ? 's' : ''}
              </p>
            </div>

            {/* Rating Distribution */}
            <div>
              <h4 className="font-medium mb-3">Rating Breakdown</h4>
              <RatingDistribution
                distribution={ratingDistribution}
                totalRatings={totalRatings}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filters and Sort */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>

            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Sort by:</span>
              <select
                value={currentFilters.sortBy || 'newest'}
                onChange={(e) => handleSortChange(e.target.value as ReviewFilters['sortBy'])}
                className="px-3 py-1 border border-input rounded-md bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="newest">Newest</option>
                <option value="oldest">Oldest</option>
                <option value="helpful">Most Helpful</option>
                <option value="rating">Highest Rating</option>
              </select>
            </div>

            {showFilters && (
              <div className="flex items-center gap-4 ml-auto">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Rating:</span>
                  <select
                    value={currentFilters.rating || ''}
                    onChange={(e) => handleRatingFilter(e.target.value ? parseInt(e.target.value) : undefined)}
                    className="px-3 py-1 border border-input rounded-md bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="">All Ratings</option>
                    <option value="5">5 Stars</option>
                    <option value="4">4 Stars</option>
                    <option value="3">3 Stars</option>
                    <option value="2">2 Stars</option>
                    <option value="1">1 Star</option>
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Verified:</span>
                  <select
                    value={currentFilters.verified === undefined ? '' : currentFilters.verified.toString()}
                    onChange={(e) => handleVerifiedFilter(e.target.value === '' ? undefined : e.target.value === 'true')}
                    className="px-3 py-1 border border-input rounded-md bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="">All Reviews</option>
                    <option value="true">Verified Only</option>
                    <option value="false">Non-Verified Only</option>
                  </select>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground">No reviews found matching your filters.</p>
            </CardContent>
          </Card>
        ) : (
          reviews.map((review) => (
            <Card key={review.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="space-y-4">
                  {/* Review Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <User className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{review.userName}</h4>
                          {review.isVerified && (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <StarRating
                            rating={review.rating}
                            size="sm"
                            showValue={false}
                          />
                          <span>•</span>
                          <span>{formatDate(review.createdAt)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Badge className={getDifficultyColor(review.difficulty)}>
                        {review.difficulty}
                      </Badge>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {formatTime(review.timeSpent)}
                      </div>
                    </div>
                  </div>

                  {/* Review Content */}
                  <div>
                    <h5 className="font-medium mb-2">{review.title}</h5>
                    <p className="text-muted-foreground leading-relaxed">
                      {review.content}
                    </p>
                  </div>

                  {/* Review Tags */}
                  {review.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {review.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}

                  {/* Review Actions */}
                  <div className="flex items-center justify-between pt-2 border-t">
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => onVote(review.id, true)}
                        className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors"
                      >
                        <ThumbsUp className="h-4 w-4" />
                        Helpful ({review.helpfulVotes})
                      </button>
                      <button
                        onClick={() => onVote(review.id, false)}
                        className="flex items-center gap-1 text-sm text-muted-foreground hover:text-destructive transition-colors"
                      >
                        <ThumbsDown className="h-4 w-4" />
                        Not Helpful ({review.notHelpfulVotes})
                      </button>
                    </div>

                    <div className="text-xs text-muted-foreground">
                      {review.isVerified ? "Verified Purchase" : "Unverified"}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}

export default ReviewList
