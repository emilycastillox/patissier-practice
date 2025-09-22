"use client"

import React, { createContext, useContext, useState, useEffect, useCallback } from "react"
import { TechniqueReview, TechniqueRating, ReviewFilters, UserReview } from "@/lib/types"

interface ReviewContextType {
  techniqueRatings: Record<number, TechniqueRating>
  userReviews: Record<number, UserReview>
  addReview: (techniqueId: number, review: UserReview) => void
  updateReview: (techniqueId: number, review: UserReview) => void
  deleteReview: (techniqueId: number) => void
  getTechniqueRating: (techniqueId: number) => TechniqueRating | null
  getUserReview: (techniqueId: number) => UserReview | null
  voteReview: (reviewId: string, isHelpful: boolean) => void
  getReviews: (techniqueId: number, filters?: ReviewFilters) => TechniqueReview[]
  hasUserReviewed: (techniqueId: number) => boolean
  canUserReview: (techniqueId: number) => boolean
}

const ReviewContext = createContext<ReviewContextType | undefined>(undefined)

const STORAGE_KEYS = {
  TECHNIQUE_RATINGS: 'patissier-practice-technique-ratings',
  USER_REVIEWS: 'patissier-practice-user-reviews'
}

export function ReviewProvider({ children }: { children: React.ReactNode }) {
  const [techniqueRatings, setTechniqueRatings] = useState<Record<number, TechniqueRating>>({})
  const [userReviews, setUserReviews] = useState<Record<number, UserReview>>({})

  // Load data from localStorage on mount
  useEffect(() => {
    const loadFromStorage = () => {
      try {
        const ratingsData = localStorage.getItem(STORAGE_KEYS.TECHNIQUE_RATINGS)
        const reviewsData = localStorage.getItem(STORAGE_KEYS.USER_REVIEWS)
        
        if (ratingsData) {
          setTechniqueRatings(JSON.parse(ratingsData))
        }
        if (reviewsData) {
          setUserReviews(JSON.parse(reviewsData))
        }
      } catch (error) {
        console.error('Error loading reviews from localStorage:', error)
      }
    }

    loadFromStorage()
  }, [])

  // Save to localStorage whenever state changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.TECHNIQUE_RATINGS, JSON.stringify(techniqueRatings))
    } catch (error) {
      console.error('Error saving technique ratings to localStorage:', error)
    }
  }, [techniqueRatings])

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.USER_REVIEWS, JSON.stringify(userReviews))
    } catch (error) {
      console.error('Error saving user reviews to localStorage:', error)
    }
  }, [userReviews])

  // Add a new review
  const addReview = useCallback((techniqueId: number, review: UserReview) => {
    // Update user reviews
    setUserReviews(prev => ({
      ...prev,
      [techniqueId]: review
    }))

    // Create a full review object
    const fullReview: TechniqueReview = {
      id: `review-${techniqueId}-${Date.now()}`,
      techniqueId,
      userId: 'current-user', // In a real app, this would come from auth
      userName: 'You', // In a real app, this would come from user profile
      userAvatar: undefined,
      rating: review.rating,
      title: review.title,
      content: review.content,
      helpfulVotes: 0,
      notHelpfulVotes: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isVerified: true, // Assume user completed the technique to review
      difficulty: review.difficulty,
      timeSpent: review.timeSpent,
      tags: review.tags
    }

    // Update technique ratings
    setTechniqueRatings(prev => {
      const existing = prev[techniqueId] || {
        techniqueId,
        averageRating: 0,
        totalRatings: 0,
        ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
        reviews: []
      }

      // Add the new review
      const updatedReviews = [...existing.reviews.filter(r => r.userId !== 'current-user'), fullReview]
      
      // Recalculate ratings
      const totalRatings = updatedReviews.length
      const averageRating = totalRatings > 0 
        ? updatedReviews.reduce((sum, r) => sum + r.rating, 0) / totalRatings 
        : 0

      const ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
      updatedReviews.forEach(r => {
        ratingDistribution[r.rating as keyof typeof ratingDistribution]++
      })

      return {
        ...prev,
        [techniqueId]: {
          ...existing,
          averageRating: Math.round(averageRating * 10) / 10,
          totalRatings,
          ratingDistribution,
          reviews: updatedReviews
        }
      }
    })
  }, [])

  // Update an existing review
  const updateReview = useCallback((techniqueId: number, review: UserReview) => {
    addReview(techniqueId, review) // Same logic as adding
  }, [addReview])

  // Delete a review
  const deleteReview = useCallback((techniqueId: number) => {
    // Remove from user reviews
    setUserReviews(prev => {
      const updated = { ...prev }
      delete updated[techniqueId]
      return updated
    })

    // Update technique ratings
    setTechniqueRatings(prev => {
      const existing = prev[techniqueId]
      if (!existing) return prev

      // Remove user's review
      const updatedReviews = existing.reviews.filter(r => r.userId !== 'current-user')
      
      // Recalculate ratings
      const totalRatings = updatedReviews.length
      const averageRating = totalRatings > 0 
        ? updatedReviews.reduce((sum, r) => sum + r.rating, 0) / totalRatings 
        : 0

      const ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
      updatedReviews.forEach(r => {
        ratingDistribution[r.rating as keyof typeof ratingDistribution]++
      })

      return {
        ...prev,
        [techniqueId]: {
          ...existing,
          averageRating: Math.round(averageRating * 10) / 10,
          totalRatings,
          ratingDistribution,
          reviews: updatedReviews
        }
      }
    })
  }, [])

  // Get technique rating
  const getTechniqueRating = useCallback((techniqueId: number): TechniqueRating | null => {
    return techniqueRatings[techniqueId] || null
  }, [techniqueRatings])

  // Get user's review for a technique
  const getUserReview = useCallback((techniqueId: number): UserReview | null => {
    return userReviews[techniqueId] || null
  }, [userReviews])

  // Vote on a review
  const voteReview = useCallback((reviewId: string, isHelpful: boolean) => {
    setTechniqueRatings(prev => {
      const updated = { ...prev }
      
      // Find and update the review
      Object.keys(updated).forEach(techniqueId => {
        const rating = updated[parseInt(techniqueId)]
        if (rating) {
          const reviewIndex = rating.reviews.findIndex(r => r.id === reviewId)
          if (reviewIndex !== -1) {
            const review = rating.reviews[reviewIndex]
            if (isHelpful) {
              review.helpfulVotes++
            } else {
              review.notHelpfulVotes++
            }
            rating.reviews[reviewIndex] = { ...review }
          }
        }
      })
      
      return updated
    })
  }, [])

  // Get filtered reviews for a technique
  const getReviews = useCallback((techniqueId: number, filters: ReviewFilters = {}): TechniqueReview[] => {
    const rating = techniqueRatings[techniqueId]
    if (!rating) return []

    let reviews = [...rating.reviews]

    // Apply filters
    if (filters.rating) {
      reviews = reviews.filter(r => r.rating === filters.rating)
    }
    if (filters.verified !== undefined) {
      reviews = reviews.filter(r => r.isVerified === filters.verified)
    }

    // Apply sorting
    switch (filters.sortBy) {
      case 'newest':
        reviews.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        break
      case 'oldest':
        reviews.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
        break
      case 'helpful':
        reviews.sort((a, b) => (b.helpfulVotes - b.notHelpfulVotes) - (a.helpfulVotes - a.notHelpfulVotes))
        break
      case 'rating':
        reviews.sort((a, b) => b.rating - a.rating)
        break
      default:
        // Default to newest
        reviews.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    }

    return reviews
  }, [techniqueRatings])

  // Check if user has reviewed a technique
  const hasUserReviewed = useCallback((techniqueId: number): boolean => {
    return userReviews.hasOwnProperty(techniqueId)
  }, [userReviews])

  // Check if user can review a technique (completed it)
  const canUserReview = useCallback((techniqueId: number): boolean => {
    // In a real app, this would check if user completed the technique
    // For now, we'll assume they can review if they haven't already
    return !hasUserReviewed(techniqueId)
  }, [hasUserReviewed])

  const value: ReviewContextType = {
    techniqueRatings,
    userReviews,
    addReview,
    updateReview,
    deleteReview,
    getTechniqueRating,
    getUserReview,
    voteReview,
    getReviews,
    hasUserReviewed,
    canUserReview,
  }

  return (
    <ReviewContext.Provider value={value}>
      {children}
    </ReviewContext.Provider>
  )
}

export function useReviews() {
  const context = useContext(ReviewContext)
  if (context === undefined) {
    throw new Error('useReviews must be used within a ReviewProvider')
  }
  return context
}

export default ReviewContext
