"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { VideoPlayer } from "@/components/ui/video-player"
import { StepImageGallery } from "@/components/ui/step-image-gallery"
import { BookmarkButton, BookmarkBadge } from "@/components/ui/bookmark-button"
import { ProgressIndicator } from "@/components/ui/progress-indicator"
import { TechniqueReviews } from "@/components/ui/technique-reviews"
import { StarRating } from "@/components/ui/star-rating"
import { useProgress } from "@/lib/contexts/ProgressContext"
import { useFavorites } from "@/lib/contexts/FavoritesContext"
import { useReviews } from "@/lib/contexts/ReviewContext"
import { 
  Clock, 
  Users, 
  Star, 
  Play, 
  Bookmark, 
  Share2, 
  Heart,
  ChevronLeft,
  ChevronRight,
  X,
  CheckCircle,
  Target,
  TrendingUp,
  Award,
  Lightbulb,
  AlertTriangle
} from "lucide-react"
import { Technique, TechniqueStep } from "@/lib/types"
import { cn } from "@/lib/utils"

interface TechniqueDetailModalProps {
  technique: Technique | null
  isOpen: boolean
  onClose: () => void
  onNext?: () => void
  onPrevious?: () => void
  hasNext?: boolean
  hasPrevious?: boolean
}

export function TechniqueDetailModal({
  technique,
  isOpen,
  onClose,
  onNext,
  onPrevious,
  hasNext = false,
  hasPrevious = false,
}: TechniqueDetailModalProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [activeTab, setActiveTab] = useState("video")
  const [showReviews, setShowReviews] = useState(false)
  
  const { getTechniqueProgress, updateTechniqueProgress, markTechniqueComplete } = useProgress()
  const { isFavorite, isBookmarked } = useFavorites()
  const { getTechniqueRating } = useReviews()
  
  const progress = technique ? getTechniqueProgress(technique.id) : null
  const rating = technique ? getTechniqueRating(technique.id) : null

  if (!technique) return null

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

  const handleVideoProgress = (currentTime: number, duration: number) => {
    if (technique) {
      const progressPercentage = Math.round((currentTime / duration) * 100)
      updateTechniqueProgress(technique.id, {
        completionPercentage: progressPercentage,
        timeSpent: Math.round(currentTime / 60) // Convert to minutes
      })
    }
  }

  const handleVideoComplete = () => {
    if (technique) {
      markTechniqueComplete(technique.id)
    }
  }

  const handleStepClick = (stepIndex: number) => {
    setCurrentStep(stepIndex)
  }

  const handleNextStep = () => {
    if (currentStep < technique.steps.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePreviousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden p-0">
        <div className="flex flex-col h-full">
          {/* Header */}
          <DialogHeader className="p-6 pb-4 border-b">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-start gap-4 mb-4">
                  <div className="flex-1">
                    <DialogTitle className="text-2xl font-bold mb-2">
                      {technique.title}
                    </DialogTitle>
                    <p className="text-muted-foreground text-lg mb-4">
                      {technique.description}
                    </p>
                  </div>
                  
                  {/* Progress and Status Indicators */}
                  <div className="flex flex-col items-end gap-2">
                    {progress && (
                      <div className="flex items-center gap-2">
                        {progress.isCompleted && (
                          <div className="flex items-center gap-1 text-green-600">
                            <CheckCircle className="h-4 w-4" />
                            <span className="text-sm font-medium">Completed</span>
                          </div>
                        )}
                        <div className="text-right">
                          <div className="text-sm font-medium">{progress.completionPercentage}% Complete</div>
                          <div className="text-xs text-muted-foreground">
                            {progress.timeSpent} min spent
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* Bookmark Badges */}
                    <div className="flex gap-1">
                      {isFavorite(technique.id) && (
                        <Badge variant="secondary" className="bg-red-100 text-red-800">
                          <Heart className="h-3 w-3 mr-1 fill-current" />
                          Favorite
                        </Badge>
                      )}
                      {isBookmarked(technique.id) && (
                        <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                          <Bookmark className="h-3 w-3 mr-1 fill-current" />
                          Bookmarked
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {technique.duration}
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    {technique.students.toLocaleString()} students
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    {technique.rating}
                  </div>
                  <Badge className={getDifficultyColor(technique.difficulty)}>
                    {technique.difficulty}
                  </Badge>
                </div>
              </div>
              
              <div className="flex items-center gap-2 ml-4">
                <BookmarkButton 
                  techniqueId={technique.id} 
                  type="favorite" 
                  size="sm" 
                  variant="ghost"
                />
                <BookmarkButton 
                  techniqueId={technique.id} 
                  type="bookmark" 
                  size="sm" 
                  variant="ghost"
                />
                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary">
                  <Share2 className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={onClose} className="text-muted-foreground hover:text-primary">
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </DialogHeader>

          {/* Content */}
          <div className="flex-1 overflow-hidden">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
              <TabsList className="grid w-full grid-cols-4 mx-6 mt-4">
                <TabsTrigger value="video" className="flex items-center gap-2">
                  <Play className="h-4 w-4" />
                  Video Tutorial
                </TabsTrigger>
                <TabsTrigger value="steps" className="flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  Step by Step
                </TabsTrigger>
                <TabsTrigger value="details" className="flex items-center gap-2">
                  <Award className="h-4 w-4" />
                  Details
                </TabsTrigger>
                <TabsTrigger value="reviews" className="flex items-center gap-2">
                  <Star className="h-4 w-4" />
                  Reviews
                  {rating && rating.totalRatings > 0 && (
                    <span className="ml-1 text-xs bg-primary/20 text-primary px-1.5 py-0.5 rounded-full">
                      {rating.totalRatings}
                    </span>
                  )}
                </TabsTrigger>
              </TabsList>

              <div className="flex-1 overflow-hidden">
                <TabsContent value="video" className="h-full mt-0">
                  <div className="p-6 h-full space-y-4">
                    {/* Progress Overview */}
                    {progress && progress.completionPercentage > 0 && (
                      <div className="bg-muted/30 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold flex items-center gap-2">
                            <TrendingUp className="h-4 w-4" />
                            Your Progress
                          </h3>
                          <span className="text-sm text-muted-foreground">
                            {progress.timeSpent} min watched
                          </span>
                        </div>
                        <ProgressIndicator
                          progress={progress.completionPercentage}
                          total={100}
                          completed={progress.completionPercentage}
                          showPercentage={true}
                          showCount={false}
                          size="md"
                          variant={progress.isCompleted ? "success" : "default"}
                        />
                      </div>
                    )}
                    
                    <VideoPlayer
                      src={technique.videoUrl || ""}
                      poster={technique.image}
                      title={technique.title}
                      className="h-full min-h-[400px]"
                      onProgress={handleVideoProgress}
                      onComplete={handleVideoComplete}
                    />
                  </div>
                </TabsContent>

                <TabsContent value="steps" className="h-full mt-0">
                  <div className="p-6 h-full">
                    <StepImageGallery
                      steps={technique.steps}
                      currentStep={currentStep}
                      onStepChange={setCurrentStep}
                      className="h-full"
                      showNavigation={true}
                      showThumbnails={true}
                      autoPlay={false}
                    />
                  </div>
                </TabsContent>

                <TabsContent value="details" className="h-full mt-0">
                  <div className="p-6 h-full overflow-y-auto">
                    <div className="space-y-6">
                      {/* Progress Summary */}
                      {progress && (
                        <div className="bg-gradient-to-r from-primary/5 to-primary/10 rounded-lg p-4">
                          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                            <TrendingUp className="h-5 w-5" />
                            Your Learning Progress
                          </h3>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="text-center">
                              <div className="text-2xl font-bold text-primary">{progress.completionPercentage}%</div>
                              <div className="text-sm text-muted-foreground">Complete</div>
                            </div>
                            <div className="text-center">
                              <div className="text-2xl font-bold text-primary">{progress.timeSpent}</div>
                              <div className="text-sm text-muted-foreground">Minutes Spent</div>
                            </div>
                            <div className="text-center">
                              <div className="text-2xl font-bold text-primary">
                                {progress.isCompleted ? "✓" : "○"}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {progress.isCompleted ? "Completed" : "In Progress"}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      <div>
                        <h3 className="text-lg font-semibold mb-3">About This Technique</h3>
                        <p className="text-muted-foreground leading-relaxed">
                          {technique.description}
                        </p>
                      </div>

                      <div>
                        <h3 className="text-lg font-semibold mb-3">Tags</h3>
                        <div className="flex flex-wrap gap-2">
                          {technique.tags.map((tag, index) => (
                            <Badge key={index} variant="secondary">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h3 className="text-lg font-semibold mb-3">Prerequisites</h3>
                        {technique.prerequisites && technique.prerequisites.length > 0 ? (
                          <div className="space-y-2">
                            {technique.prerequisites.map((prereqId, index) => (
                              <div key={index} className="text-sm text-muted-foreground">
                                • Prerequisite technique {prereqId}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-muted-foreground text-sm">No prerequisites required</p>
                        )}
                      </div>

                      <div>
                        <h3 className="text-lg font-semibold mb-3">Statistics</h3>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Duration:</span>
                            <span className="ml-2 font-medium">{technique.duration}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Difficulty:</span>
                            <span className="ml-2 font-medium">{technique.difficulty}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Rating:</span>
                            <span className="ml-2 font-medium">{technique.rating}/5</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Students:</span>
                            <span className="ml-2 font-medium">{technique.students.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>

                      {/* Tips and Warnings */}
                      {technique.steps && technique.steps.length > 0 && (
                        <div>
                          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                            <Lightbulb className="h-5 w-5" />
                            Key Tips
                          </h3>
                          <div className="space-y-3">
                            {technique.steps.map((step, index) => (
                              <div key={step.id} className="space-y-2">
                                {step.tips && step.tips.length > 0 && (
                                  <div className="bg-blue-50 rounded-lg p-3">
                                    <h4 className="font-medium text-blue-900 mb-2">Step {step.stepNumber}: {step.title}</h4>
                                    <ul className="space-y-1">
                                      {step.tips.map((tip, tipIndex) => (
                                        <li key={tipIndex} className="text-sm text-blue-800 flex items-start gap-2">
                                          <span className="text-blue-500 mt-1">•</span>
                                          {tip}
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                                {step.warnings && step.warnings.length > 0 && (
                                  <div className="bg-orange-50 rounded-lg p-3">
                                    <h4 className="font-medium text-orange-900 mb-2 flex items-center gap-2">
                                      <AlertTriangle className="h-4 w-4" />
                                      Important Warnings
                                    </h4>
                                    <ul className="space-y-1">
                                      {step.warnings.map((warning, warningIndex) => (
                                        <li key={warningIndex} className="text-sm text-orange-800 flex items-start gap-2">
                                          <span className="text-orange-500 mt-1">•</span>
                                          {warning}
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="reviews" className="h-full mt-0">
                  <div className="p-6 h-full overflow-y-auto">
                    <div className="space-y-6">
                      {/* Rating Summary */}
                      <div className="bg-muted/30 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-semibold">Overall Rating</h3>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setShowReviews(true)}
                          >
                            <Star className="h-4 w-4 mr-2" />
                            View All Reviews
                          </Button>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="text-center">
                            <div className="text-3xl font-bold text-primary mb-2">
                              {rating ? rating.averageRating.toFixed(1) : technique.rating}
                            </div>
                            <StarRating
                              rating={rating ? rating.averageRating : technique.rating}
                              size="lg"
                              showValue={false}
                              showCount={true}
                              count={rating ? rating.totalRatings : 0}
                            />
                            <p className="text-sm text-muted-foreground mt-2">
                              Based on {rating ? rating.totalRatings : 0} review{rating && rating.totalRatings !== 1 ? 's' : ''}
                            </p>
                          </div>
                          
                          {rating && rating.totalRatings > 0 && (
                            <div className="space-y-2">
                              <h4 className="font-medium">Rating Breakdown</h4>
                              {[5, 4, 3, 2, 1].map((starRating) => {
                                const count = rating.ratingDistribution[starRating as keyof typeof rating.ratingDistribution]
                                const percentage = rating.totalRatings > 0 ? (count / rating.totalRatings) * 100 : 0
                                
                                return (
                                  <div key={starRating} className="flex items-center gap-2">
                                    <div className="flex items-center gap-1 w-8">
                                      <span className="text-sm font-medium">{starRating}</span>
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
                          )}
                        </div>
                      </div>

                      {/* Recent Reviews Preview */}
                      {rating && rating.reviews.length > 0 && (
                        <div>
                          <h3 className="text-lg font-semibold mb-4">Recent Reviews</h3>
                          <div className="space-y-4">
                            {rating.reviews.slice(0, 3).map((review) => (
                              <div key={review.id} className="border rounded-lg p-4">
                                <div className="flex items-start justify-between mb-2">
                                  <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                                      <span className="text-sm font-medium text-primary">
                                        {review.userName.charAt(0)}
                                      </span>
                                    </div>
                                    <div>
                                      <div className="flex items-center gap-2">
                                        <span className="font-medium text-sm">{review.userName}</span>
                                        {review.isVerified && (
                                          <CheckCircle className="h-3 w-3 text-green-500" />
                                        )}
                                      </div>
                                      <StarRating
                                        rating={review.rating}
                                        size="sm"
                                        showValue={false}
                                      />
                                    </div>
                                  </div>
                                  <span className="text-xs text-muted-foreground">
                                    {new Date(review.createdAt).toLocaleDateString()}
                                  </span>
                                </div>
                                <h4 className="font-medium text-sm mb-1">{review.title}</h4>
                                <p className="text-sm text-muted-foreground line-clamp-2">
                                  {review.content}
                                </p>
                              </div>
                            ))}
                          </div>
                          
                          {rating.reviews.length > 3 && (
                            <div className="text-center mt-4">
                              <Button
                                variant="outline"
                                onClick={() => setShowReviews(true)}
                              >
                                View All {rating.reviews.length} Reviews
                              </Button>
                            </div>
                          )}
                        </div>
                      )}

                      {(!rating || rating.reviews.length === 0) && (
                        <div className="text-center py-8">
                          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                            <Star className="h-8 w-8 text-muted-foreground" />
                          </div>
                          <h3 className="text-lg font-semibold mb-2">No Reviews Yet</h3>
                          <p className="text-muted-foreground mb-4">
                            Be the first to share your experience with this technique!
                          </p>
                          <Button onClick={() => setShowReviews(true)}>
                            <Star className="h-4 w-4 mr-2" />
                            Write a Review
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </TabsContent>
              </div>
            </Tabs>
          </div>

          {/* Footer */}
          <div className="p-6 pt-4 border-t">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {hasPrevious && (
                  <Button variant="outline" onClick={onPrevious}>
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Previous
                  </Button>
                )}
                {hasNext && (
                  <Button variant="outline" onClick={onNext}>
                    Next
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                {/* Progress Actions */}
                {progress && (
                  <div className="flex items-center gap-2 mr-4">
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
                )}
                
                <Button variant="outline" onClick={onClose}>
                  Close
                </Button>
                <Button 
                  onClick={() => {
                    if (activeTab !== "video") {
                      setActiveTab("video")
                    } else {
                      // If already on video tab, just close
                      onClose()
                    }
                  }}
                  className={progress?.isCompleted ? "bg-green-500 hover:bg-green-600" : ""}
                >
                  {progress?.isCompleted ? (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Review Technique
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4 mr-2" />
                      {progress?.completionPercentage > 0 ? "Continue Learning" : "Start Learning"}
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
      
      {/* Reviews Modal */}
      <TechniqueReviews
        technique={technique}
        isOpen={showReviews}
        onClose={() => setShowReviews(false)}
      />
    </Dialog>
  )
}

export default TechniqueDetailModal
