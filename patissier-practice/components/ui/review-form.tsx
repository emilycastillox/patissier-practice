"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { StarRating } from "@/components/ui/star-rating"
import { 
  Star, 
  Clock, 
  Tag, 
  X,
  CheckCircle,
  AlertCircle
} from "lucide-react"
import { UserReview, DifficultyLevel } from "@/lib/types"
import { cn } from "@/lib/utils"

interface ReviewFormProps {
  techniqueId: number
  techniqueTitle: string
  initialReview?: UserReview
  onSubmit: (review: UserReview) => void
  onCancel: () => void
  className?: string
}

export function ReviewForm({
  techniqueId,
  techniqueTitle,
  initialReview,
  onSubmit,
  onCancel,
  className,
}: ReviewFormProps) {
  const [rating, setRating] = useState(initialReview?.rating || 0)
  const [title, setTitle] = useState(initialReview?.title || "")
  const [content, setContent] = useState(initialReview?.content || "")
  const [difficulty, setDifficulty] = useState<DifficultyLevel>(initialReview?.difficulty || "Beginner")
  const [timeSpent, setTimeSpent] = useState(initialReview?.timeSpent || 0)
  const [tags, setTags] = useState<string[]>(initialReview?.tags || [])
  const [newTag, setNewTag] = useState("")
  const [errors, setErrors] = useState<Record<string, string>>({})

  const difficultyOptions: { value: DifficultyLevel; label: string; color: string }[] = [
    { value: "Beginner", label: "Beginner", color: "bg-green-100 text-green-800" },
    { value: "Intermediate", label: "Intermediate", color: "bg-yellow-100 text-yellow-800" },
    { value: "Advanced", label: "Advanced", color: "bg-red-100 text-red-800" },
  ]

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (rating === 0) {
      newErrors.rating = "Please select a rating"
    }
    if (!title.trim()) {
      newErrors.title = "Please enter a review title"
    }
    if (!content.trim()) {
      newErrors.content = "Please write your review"
    }
    if (content.trim().length < 10) {
      newErrors.content = "Review must be at least 10 characters long"
    }
    if (timeSpent <= 0) {
      newErrors.timeSpent = "Please enter the time spent"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    const review: UserReview = {
      techniqueId,
      rating,
      title: title.trim(),
      content: content.trim(),
      difficulty,
      timeSpent,
      tags,
    }

    onSubmit(review)
  }

  const handleAddTag = () => {
    const tag = newTag.trim().toLowerCase()
    if (tag && !tags.includes(tag)) {
      setTags([...tags, tag])
      setNewTag("")
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove))
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault()
      handleAddTag()
    }
  }

  return (
    <Card className={cn("w-full max-w-2xl mx-auto", className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Star className="h-5 w-5 text-yellow-500" />
          {initialReview ? "Edit Your Review" : "Write a Review"}
        </CardTitle>
        <p className="text-muted-foreground">
          Share your experience with "{techniqueTitle}"
        </p>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Rating */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Overall Rating <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center gap-2">
              <StarRating
                rating={rating}
                interactive={true}
                onRatingChange={setRating}
                size="lg"
              />
              <span className="text-sm text-muted-foreground">
                {rating > 0 && `${rating} out of 5 stars`}
              </span>
            </div>
            {errors.rating && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.rating}
              </p>
            )}
          </div>

          {/* Review Title */}
          <div className="space-y-2">
            <label htmlFor="title" className="text-sm font-medium">
              Review Title <span className="text-red-500">*</span>
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Summarize your experience in a few words"
              className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
            />
            {errors.title && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.title}
              </p>
            )}
          </div>

          {/* Review Content */}
          <div className="space-y-2">
            <label htmlFor="content" className="text-sm font-medium">
              Your Review <span className="text-red-500">*</span>
            </label>
            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Tell others about your experience. What did you like? What could be improved? Any tips for other learners?"
              rows={4}
              className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent resize-none"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{content.length} characters</span>
              <span>Minimum 10 characters</span>
            </div>
            {errors.content && (
              <p className="text-sm text-red-500 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" />
                {errors.content}
              </p>
            )}
          </div>

          {/* Difficulty and Time Spent */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Perceived Difficulty</label>
              <div className="flex gap-2">
                {difficultyOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setDifficulty(option.value)}
                    className={cn(
                      "px-3 py-2 rounded-md text-sm font-medium transition-colors",
                      difficulty === option.value
                        ? option.color
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    )}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="timeSpent" className="text-sm font-medium">
                Time Spent (minutes) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  id="timeSpent"
                  type="number"
                  min="1"
                  value={timeSpent}
                  onChange={(e) => setTimeSpent(parseInt(e.target.value) || 0)}
                  placeholder="30"
                  className="w-full pl-10 pr-3 py-2 border border-input rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                />
              </div>
              {errors.timeSpent && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {errors.timeSpent}
                </p>
              )}
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Tags (optional)</label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Add a tag (e.g., 'challenging', 'fun', 'beginner-friendly')"
                  className="w-full pl-10 pr-3 py-2 border border-input rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                />
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={handleAddTag}
                disabled={!newTag.trim()}
              >
                Add
              </Button>
            </div>
            
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {tags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="flex items-center gap-1"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="ml-1 hover:text-red-500"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" className="flex-1">
              <CheckCircle className="h-4 w-4 mr-2" />
              {initialReview ? "Update Review" : "Submit Review"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

export default ReviewForm
