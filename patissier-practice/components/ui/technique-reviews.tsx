"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { StarRating } from "@/components/ui/star-rating"
import { ReviewForm } from "@/components/ui/review-form"
import { ReviewList } from "@/components/ui/review-list"
import { 
  Star, 
  MessageSquare, 
  Plus, 
  Edit, 
  Trash2,
  X,
  CheckCircle
} from "lucide-react"
import { Technique, UserReview, ReviewFilters } from "@/lib/types"
import { useReviews } from "@/lib/contexts/ReviewContext"
import { cn } from "@/lib/utils"

interface TechniqueReviewsProps {
  technique: Technique
  isOpen: boolean
  onClose: () => void
  className?: string
}

export function TechniqueReviews({
  technique,
  isOpen,
  onClose,
  className,
}: TechniqueReviewsProps) {
  const [activeTab, setActiveTab] = useState("reviews")
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [filters, setFilters] = useState<ReviewFilters>({})
  
  const {
    getTechniqueRating,
    getUserReview,
    addReview,
    updateReview,
    deleteReview,
    getReviews,
    hasUserReviewed,
    canUserReview,
    voteReview
  } = useReviews()

  const rating = getTechniqueRating(technique.id)
  const userReview = getUserReview(technique.id)
  const reviews = getReviews(technique.id, filters)

  const handleSubmitReview = (review: UserReview) => {
    if (userReview) {
      updateReview(technique.id, review)
    } else {
      addReview(technique.id, review)
    }
    setShowReviewForm(false)
  }

  const handleEditReview = () => {
    setShowReviewForm(true)
  }

  const handleDeleteReview = () => {
    if (confirm("Are you sure you want to delete your review?")) {
      deleteReview(technique.id)
    }
  }

  const handleFilterChange = (newFilters: ReviewFilters) => {
    setFilters(newFilters)
  }

  const handleVote = (reviewId: string, isHelpful: boolean) => {
    voteReview(reviewId, isHelpful)
  }

  const averageRating = rating?.averageRating || technique.rating
  const totalRatings = rating?.totalRatings || 0
  const ratingDistribution = rating?.ratingDistribution || { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden p-0">
        <div className="flex flex-col h-full">
          {/* Header */}
          <DialogHeader className="p-6 pb-4 border-b">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <DialogTitle className="text-2xl font-bold mb-2 flex items-center gap-2">
                  <Star className="h-6 w-6 text-yellow-500" />
                  Reviews & Ratings
                </DialogTitle>
                <p className="text-muted-foreground text-lg">
                  "{technique.title}" - See what others think
                </p>
              </div>
              <div className="flex items-center gap-2 ml-4">
                <Button variant="ghost" size="sm" onClick={onClose} className="text-muted-foreground hover:text-primary">
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </DialogHeader>

          {/* Content */}
          <div className="flex-1 overflow-hidden">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
              <TabsList className="grid w-full grid-cols-2 mx-6 mt-4">
                <TabsTrigger value="reviews" className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Reviews ({reviews.length})
                </TabsTrigger>
                <TabsTrigger value="write" className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Write Review
                </TabsTrigger>
              </TabsList>

              <div className="flex-1 overflow-hidden">
                <TabsContent value="reviews" className="h-full mt-0">
                  <div className="p-6 h-full overflow-y-auto">
                    {/* User Review Section */}
                    {userReview && (
                      <div className="mb-6 p-4 bg-primary/5 rounded-lg border border-primary/20">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="font-semibold flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            Your Review
                          </h3>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={handleEditReview}
                            >
                              <Edit className="h-4 w-4 mr-1" />
                              Edit
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={handleDeleteReview}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4 mr-1" />
                              Delete
                            </Button>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <StarRating
                              rating={userReview.rating}
                              size="sm"
                              showValue={false}
                            />
                            <span className="font-medium">{userReview.title}</span>
                          </div>
                          <p className="text-muted-foreground text-sm">
                            {userReview.content}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>Difficulty: {userReview.difficulty}</span>
                            <span>•</span>
                            <span>Time: {userReview.timeSpent} min</span>
                            {userReview.tags.length > 0 && (
                              <>
                                <span>•</span>
                                <span>Tags: {userReview.tags.join(", ")}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Reviews List */}
                    <ReviewList
                      reviews={reviews}
                      averageRating={averageRating}
                      totalRatings={totalRatings}
                      ratingDistribution={ratingDistribution}
                      onVote={handleVote}
                      onFilterChange={handleFilterChange}
                      currentFilters={filters}
                    />
                  </div>
                </TabsContent>

                <TabsContent value="write" className="h-full mt-0">
                  <div className="p-6 h-full overflow-y-auto">
                    {canUserReview(technique.id) ? (
                      <ReviewForm
                        techniqueId={technique.id}
                        techniqueTitle={technique.title}
                        initialReview={userReview}
                        onSubmit={handleSubmitReview}
                        onCancel={() => setShowReviewForm(false)}
                      />
                    ) : (
                      <div className="text-center py-12">
                        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                          <Star className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <h3 className="text-lg font-semibold mb-2">
                          {hasUserReviewed(technique.id) ? "You've Already Reviewed This Technique" : "Complete the Technique to Review"}
                        </h3>
                        <p className="text-muted-foreground mb-4">
                          {hasUserReviewed(technique.id) 
                            ? "You can edit your existing review from the Reviews tab."
                            : "Please complete this technique before writing a review."
                          }
                        </p>
                        <Button onClick={() => setActiveTab("reviews")}>
                          View Reviews
                        </Button>
                      </div>
                    )}
                  </div>
                </TabsContent>
              </div>
            </Tabs>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default TechniqueReviews
