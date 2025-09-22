import { LearningPath, LearningModule, LearningPathLevel, DifficultyLevel } from "@/lib/types"
import { progressService } from "./progressService"
import { prerequisiteService } from "./prerequisiteService"
import { completionLogicService } from "./completionLogicService"

export interface UserProfile {
  skillLevel: LearningPathLevel
  interests: string[]
  completedPaths: number[]
  completedModules: number[]
  timeSpent: number
  averageScore: number
  preferredDifficulty: DifficultyLevel
  preferredDuration: string
  learningStreak: number
  lastActivity: string
  favoriteCategories: string[]
  weakAreas: string[]
  strongAreas: string[]
}

export interface Recommendation {
  pathId: number
  path: LearningPath
  score: number
  reasons: string[]
  confidence: number
  priority: 'high' | 'medium' | 'low'
  basedOn: 'skill_level' | 'interests' | 'progress' | 'popularity' | 'completion' | 'difficulty' | 'duration'
}

export interface RecommendationFilters {
  skillLevel?: LearningPathLevel
  difficulty?: DifficultyLevel
  duration?: string
  categories?: string[]
  excludeCompleted?: boolean
  minScore?: number
  maxDuration?: string
  minDuration?: string
}

export interface RecommendationAnalytics {
  totalRecommendations: number
  recommendationsByType: {
    [key: string]: number
  }
  averageConfidence: number
  userEngagement: {
    clicks: number
    completions: number
    bookmarks: number
  }
  topPerformingRecommendations: number[]
}

class RecommendationService {
  private userProfile: UserProfile | null = null
  private recommendationHistory: { pathId: number; timestamp: string; action: string }[] = []
  private storageKey = 'patissier-practice-recommendations'

  constructor() {
    this.loadRecommendationHistory()
  }

  // Load recommendation history from localStorage
  private loadRecommendationHistory(): void {
    try {
      const data = localStorage.getItem(this.storageKey)
      if (data) {
        this.recommendationHistory = JSON.parse(data)
      }
    } catch (error) {
      console.error('Error loading recommendation history:', error)
    }
  }

  // Save recommendation history to localStorage
  private saveRecommendationHistory(): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.recommendationHistory))
    } catch (error) {
      console.error('Error saving recommendation history:', error)
    }
  }

  // Build user profile from progress data
  buildUserProfile(paths: LearningPath[]): UserProfile {
    const allProgress = progressService.getAllProgress()
    const completionStats = completionLogicService.getCompletionStats()

    // Calculate skill level based on completed paths
    const completedPaths = paths.filter(path => {
      const progress = allProgress.pathProgress[path.id]
      return progress && progress.completionPercentage >= 100
    })

    const skillLevel = this.calculateSkillLevel(completedPaths, paths)
    
    // Extract interests from completed modules and paths
    const interests = this.extractInterests(completedPaths, allProgress)
    
    // Calculate preferred difficulty
    const preferredDifficulty = this.calculatePreferredDifficulty(completedPaths)
    
    // Calculate preferred duration
    const preferredDuration = this.calculatePreferredDuration(completedPaths)
    
    // Extract favorite categories
    const favoriteCategories = this.extractFavoriteCategories(completedPaths)
    
    // Identify weak and strong areas
    const weakAreas = this.identifyWeakAreas(completedPaths, allProgress)
    const strongAreas = this.identifyStrongAreas(completedPaths, allProgress)

    this.userProfile = {
      skillLevel,
      interests,
      completedPaths: completedPaths.map(p => p.id),
      completedModules: Object.values(allProgress.moduleProgress)
        .filter(mp => mp.status === 'completed')
        .map(mp => mp.moduleId),
      timeSpent: completionStats.totalTimeSpent,
      averageScore: completionStats.averageScore,
      preferredDifficulty,
      preferredDuration,
      learningStreak: completionStats.currentStreak,
      lastActivity: this.getLastActivity(),
      favoriteCategories,
      weakAreas,
      strongAreas
    }

    return this.userProfile
  }

  // Calculate skill level based on completed paths
  private calculateSkillLevel(completedPaths: LearningPath[], allPaths: LearningPath[]): LearningPathLevel {
    if (completedPaths.length === 0) return 'Beginner'

    const levelCounts = {
      Beginner: 0,
      Intermediate: 0,
      Advanced: 0
    }

    completedPaths.forEach(path => {
      levelCounts[path.level]++
    })

    // If user has completed advanced paths, they're advanced
    if (levelCounts.Advanced > 0) return 'Advanced'
    
    // If user has completed intermediate paths, they're intermediate
    if (levelCounts.Intermediate > 0) return 'Intermediate'
    
    // Otherwise, they're beginner
    return 'Beginner'
  }

  // Extract interests from completed content
  private extractInterests(completedPaths: LearningPath[], allProgress: any): string[] {
    const interests: string[] = []
    
    completedPaths.forEach(path => {
      interests.push(...path.tags)
    })

    // Count frequency and return top interests
    const interestCounts = interests.reduce((acc, interest) => {
      acc[interest] = (acc[interest] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    return Object.entries(interestCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([interest]) => interest)
  }

  // Calculate preferred difficulty
  private calculatePreferredDifficulty(completedPaths: LearningPath[]): DifficultyLevel {
    if (completedPaths.length === 0) return 'Beginner'

    const difficultyCounts = {
      Beginner: 0,
      Intermediate: 0,
      Advanced: 0
    }

    completedPaths.forEach(path => {
      difficultyCounts[path.difficulty as DifficultyLevel]++
    })

    // Return most common difficulty
    return Object.entries(difficultyCounts)
      .sort(([, a], [, b]) => b - a)[0][0] as DifficultyLevel
  }

  // Calculate preferred duration
  private calculatePreferredDuration(completedPaths: LearningPath[]): string {
    if (completedPaths.length === 0) return '1-2 weeks'

    const durations = completedPaths.map(path => path.duration)
    const durationCounts = durations.reduce((acc, duration) => {
      acc[duration] = (acc[duration] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    return Object.entries(durationCounts)
      .sort(([, a], [, b]) => b - a)[0][0]
  }

  // Extract favorite categories
  private extractFavoriteCategories(completedPaths: LearningPath[]): string[] {
    const categories: string[] = []
    
    completedPaths.forEach(path => {
      // Extract category from path title or tags
      const category = this.extractCategoryFromPath(path)
      if (category) categories.push(category)
    })

    const categoryCounts = categories.reduce((acc, category) => {
      acc[category] = (acc[category] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    return Object.entries(categoryCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([category]) => category)
  }

  // Extract category from path
  private extractCategoryFromPath(path: LearningPath): string | null {
    // Simple category extraction based on path title
    const title = path.title.toLowerCase()
    
    if (title.includes('cake') || title.includes('dessert')) return 'Cakes & Desserts'
    if (title.includes('bread') || title.includes('viennoiserie')) return 'Bread & Viennoiserie'
    if (title.includes('chocolate') || title.includes('confectionery')) return 'Chocolate & Confectionery'
    if (title.includes('basic') || title.includes('fundamental')) return 'Fundamentals'
    
    return null
  }

  // Identify weak areas
  private identifyWeakAreas(completedPaths: LearningPath[], allProgress: any): string[] {
    // This would analyze low scores, incomplete modules, etc.
    // For now, return empty array
    return []
  }

  // Identify strong areas
  private identifyStrongAreas(completedPaths: LearningPath[], allProgress: any): string[] {
    // This would analyze high scores, quick completions, etc.
    // For now, return empty array
    return []
  }

  // Get last activity timestamp
  private getLastActivity(): string {
    const events = completionLogicService.getRecentCompletionEvents(1)
    return events.length > 0 ? events[0].timestamp : new Date().toISOString()
  }

  // Get recommendations for user
  getRecommendations(paths: LearningPath[], filters?: RecommendationFilters): Recommendation[] {
    if (!this.userProfile) {
      this.buildUserProfile(paths)
    }

    if (!this.userProfile) return []

    const recommendations: Recommendation[] = []

    paths.forEach(path => {
      // Skip if path is already completed and excludeCompleted is true
      if (filters?.excludeCompleted && this.userProfile!.completedPaths.includes(path.id)) {
        return
      }

      // Calculate recommendation score
      const score = this.calculateRecommendationScore(path, filters)
      
      if (score > 0) {
        const reasons = this.generateRecommendationReasons(path)
        const confidence = this.calculateConfidence(score, reasons.length)
        const priority = this.calculatePriority(score, confidence)
        const basedOn = this.determineRecommendationBasis(path)

        recommendations.push({
          pathId: path.id,
          path,
          score,
          reasons,
          confidence,
          priority,
          basedOn
        })
      }
    })

    // Sort by score and return top recommendations
    return recommendations
      .sort((a, b) => b.score - a.score)
      .slice(0, 20) // Limit to top 20 recommendations
  }

  // Calculate recommendation score
  private calculateRecommendationScore(path: LearningPath, filters?: RecommendationFilters): number {
    if (!this.userProfile) return 0

    let score = 0

    // Skill level matching (40% weight)
    const skillLevelMatch = this.calculateSkillLevelMatch(path)
    score += skillLevelMatch * 0.4

    // Interest matching (25% weight)
    const interestMatch = this.calculateInterestMatch(path)
    score += interestMatch * 0.25

    // Difficulty preference (15% weight)
    const difficultyMatch = this.calculateDifficultyMatch(path)
    score += difficultyMatch * 0.15

    // Duration preference (10% weight)
    const durationMatch = this.calculateDurationMatch(path)
    score += durationMatch * 0.1

    // Popularity (5% weight)
    const popularityScore = this.calculatePopularityScore(path)
    score += popularityScore * 0.05

    // Progress-based (5% weight)
    const progressScore = this.calculateProgressScore(path)
    score += progressScore * 0.05

    // Apply filters
    if (filters) {
      if (filters.skillLevel && path.level !== filters.skillLevel) {
        score *= 0.5
      }
      if (filters.difficulty && path.difficulty !== filters.difficulty) {
        score *= 0.5
      }
      if (filters.duration && !path.duration.includes(filters.duration)) {
        score *= 0.7
      }
      if (filters.categories && !filters.categories.some(cat => path.tags.includes(cat))) {
        score *= 0.6
      }
      if (filters.minScore && path.averageRating < filters.minScore) {
        score *= 0.3
      }
    }

    return Math.min(score, 1) // Cap at 1.0
  }

  // Calculate skill level match
  private calculateSkillLevelMatch(path: LearningPath): number {
    if (!this.userProfile) return 0

    const userLevel = this.userProfile.skillLevel
    const pathLevel = path.level

    // Perfect match
    if (userLevel === pathLevel) return 1.0
    
    // User is one level above (good for review)
    if (this.isLevelAbove(userLevel, pathLevel)) return 0.8
    
    // User is one level below (good for progression)
    if (this.isLevelAbove(pathLevel, userLevel)) return 0.6
    
    // Too far apart
    return 0.2
  }

  // Check if level1 is above level2
  private isLevelAbove(level1: LearningPathLevel, level2: LearningPathLevel): boolean {
    const levels = ['Beginner', 'Intermediate', 'Advanced']
    return levels.indexOf(level1) > levels.indexOf(level2)
  }

  // Calculate interest match
  private calculateInterestMatch(path: LearningPath): number {
    if (!this.userProfile) return 0

    const userInterests = this.userProfile.interests
    const pathTags = path.tags

    if (userInterests.length === 0) return 0.5

    const matchingTags = pathTags.filter(tag => userInterests.includes(tag))
    return matchingTags.length / Math.max(userInterests.length, pathTags.length)
  }

  // Calculate difficulty match
  private calculateDifficultyMatch(path: LearningPath): number {
    if (!this.userProfile) return 0.5

    const userDifficulty = this.userProfile.preferredDifficulty
    const pathDifficulty = path.difficulty

    if (userDifficulty === pathDifficulty) return 1.0
    
    // User prefers easier content
    if (this.isDifficultyAbove(userDifficulty, pathDifficulty)) return 0.8
    
    // User prefers harder content
    if (this.isDifficultyAbove(pathDifficulty, userDifficulty)) return 0.6
    
    return 0.4
  }

  // Check if difficulty1 is above difficulty2
  private isDifficultyAbove(difficulty1: DifficultyLevel, difficulty2: DifficultyLevel): boolean {
    const difficulties = ['Beginner', 'Intermediate', 'Advanced']
    return difficulties.indexOf(difficulty1) > difficulties.indexOf(difficulty2)
  }

  // Calculate duration match
  private calculateDurationMatch(path: LearningPath): number {
    if (!this.userProfile) return 0.5

    const userDuration = this.userProfile.preferredDuration
    const pathDuration = path.duration

    // Simple duration matching
    if (userDuration === pathDuration) return 1.0
    
    // Check if durations are similar
    if (this.areDurationsSimilar(userDuration, pathDuration)) return 0.8
    
    return 0.5
  }

  // Check if durations are similar
  private areDurationsSimilar(duration1: string, duration2: string): boolean {
    // Extract numbers from duration strings
    const extractNumber = (duration: string) => {
      const match = duration.match(/(\d+)/)
      return match ? parseInt(match[1]) : 0
    }

    const num1 = extractNumber(duration1)
    const num2 = extractNumber(duration2)

    return Math.abs(num1 - num2) <= 2 // Within 2 weeks
  }

  // Calculate popularity score
  private calculatePopularityScore(path: LearningPath): number {
    // Normalize student count to 0-1 scale
    const maxStudents = 10000 // Assume max students
    return Math.min(path.totalStudents / maxStudents, 1)
  }

  // Calculate progress-based score
  private calculateProgressScore(path: LearningPath): number {
    if (!this.userProfile) return 0

    const progress = progressService.getPathProgress(path.id)
    
    // If not started, return neutral score
    if (!progress || progress.completionPercentage === 0) return 0.5
    
    // If completed, return low score (unless user wants to review)
    if (progress.completionPercentage === 100) return 0.3
    
    // If in progress, return high score
    return 0.9
  }

  // Generate recommendation reasons
  private generateRecommendationReasons(path: LearningPath): string[] {
    if (!this.userProfile) return []

    const reasons: string[] = []

    // Skill level reasons
    if (path.level === this.userProfile.skillLevel) {
      reasons.push(`Matches your ${this.userProfile.skillLevel} skill level`)
    }

    // Interest reasons
    const matchingInterests = path.tags.filter(tag => 
      this.userProfile!.interests.includes(tag)
    )
    if (matchingInterests.length > 0) {
      reasons.push(`Matches your interests: ${matchingInterests.join(', ')}`)
    }

    // Difficulty reasons
    if (path.difficulty === this.userProfile.preferredDifficulty) {
      reasons.push(`Matches your preferred ${path.difficulty} difficulty`)
    }

    // Duration reasons
    if (path.duration === this.userProfile.preferredDuration) {
      reasons.push(`Matches your preferred ${path.duration} duration`)
    }

    // Popularity reasons
    if (path.totalStudents > 1000) {
      reasons.push(`Popular choice with ${path.totalStudents.toLocaleString()} students`)
    }

    // Rating reasons
    if (path.averageRating >= 4.5) {
      reasons.push(`Highly rated (${path.averageRating.toFixed(1)}/5)`)
    }

    // Featured reasons
    if (path.isFeatured) {
      reasons.push('Featured learning path')
    }

    return reasons
  }

  // Calculate confidence score
  private calculateConfidence(score: number, reasonCount: number): number {
    // Base confidence on score and number of reasons
    const baseConfidence = score
    const reasonBonus = Math.min(reasonCount * 0.1, 0.3)
    return Math.min(baseConfidence + reasonBonus, 1)
  }

  // Calculate priority level
  private calculatePriority(score: number, confidence: number): 'high' | 'medium' | 'low' {
    const combinedScore = (score + confidence) / 2
    
    if (combinedScore >= 0.8) return 'high'
    if (combinedScore >= 0.6) return 'medium'
    return 'low'
  }

  // Determine recommendation basis
  private determineRecommendationBasis(path: LearningPath): 'difficulty' | 'progress' | 'duration' | 'completion' | 'skill_level' | 'interests' | 'popularity' {
    if (!this.userProfile) return 'popularity'

    // Determine primary reason for recommendation
    if (path.level === this.userProfile.skillLevel) return 'skill_level'
    if (path.tags.some(tag => this.userProfile!.interests.includes(tag))) return 'interests'
    if (path.difficulty === this.userProfile.preferredDifficulty) return 'difficulty'
    if (path.duration === this.userProfile.preferredDuration) return 'duration'
    if (path.totalStudents > 1000) return 'popularity'
    
    return 'completion'
  }

  // Track recommendation interaction
  trackRecommendationInteraction(pathId: number, action: 'click' | 'bookmark' | 'start' | 'complete'): void {
    this.recommendationHistory.push({
      pathId,
      timestamp: new Date().toISOString(),
      action
    })
    this.saveRecommendationHistory()
  }

  // Get recommendation analytics
  getRecommendationAnalytics(): RecommendationAnalytics {
    const totalRecommendations = this.recommendationHistory.length
    
    const recommendationsByType = this.recommendationHistory.reduce((acc, rec) => {
      acc[rec.action] = (acc[rec.action] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const clicks = recommendationsByType.click || 0
    const completions = recommendationsByType.complete || 0
    const bookmarks = recommendationsByType.bookmark || 0

    return {
      totalRecommendations,
      recommendationsByType,
      averageConfidence: 0.7, // This would be calculated from actual data
      userEngagement: {
        clicks,
        completions,
        bookmarks
      },
      topPerformingRecommendations: [] // This would be calculated from actual data
    }
  }

  // Get personalized recommendations
  getPersonalizedRecommendations(paths: LearningPath[], limit: number = 10): Recommendation[] {
    const recommendations = this.getRecommendations(paths)
    return recommendations.slice(0, limit)
  }

  // Get trending recommendations
  getTrendingRecommendations(paths: LearningPath[], limit: number = 10): Recommendation[] {
    return paths
      .filter(path => path.isFeatured || path.totalStudents > 1000)
      .map(path => ({
        pathId: path.id,
        path,
        score: path.totalStudents / 10000,
        reasons: ['Trending learning path'],
        confidence: 0.8,
        priority: 'high' as const,
        basedOn: 'popularity' as const
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
  }

  // Get similar path recommendations
  getSimilarPathRecommendations(pathId: number, paths: LearningPath[], limit: number = 5): Recommendation[] {
    const targetPath = paths.find(p => p.id === pathId)
    if (!targetPath) return []

    return paths
      .filter(path => path.id !== pathId)
      .map(path => {
        const score = this.calculateSimilarityScore(targetPath, path)
        return {
          pathId: path.id,
          path,
          score,
          reasons: ['Similar to your current path'],
          confidence: score,
          priority: (score > 0.7 ? 'high' : 'medium') as 'high' | 'medium',
          basedOn: 'interests' as const
        }
      })
      .filter(rec => rec.score > 0.3)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
  }

  // Calculate similarity score between paths
  private calculateSimilarityScore(path1: LearningPath, path2: LearningPath): number {
    let score = 0

    // Level similarity
    if (path1.level === path2.level) score += 0.3

    // Difficulty similarity
    if (path1.difficulty === path2.difficulty) score += 0.3

    // Tag similarity
    const commonTags = path1.tags.filter(tag => path2.tags.includes(tag))
    score += (commonTags.length / Math.max(path1.tags.length, path2.tags.length)) * 0.4

    return score
  }

  // Clear recommendation history
  clearRecommendationHistory(): void {
    this.recommendationHistory = []
    this.saveRecommendationHistory()
  }
}

export const recommendationService = new RecommendationService()
export default recommendationService
