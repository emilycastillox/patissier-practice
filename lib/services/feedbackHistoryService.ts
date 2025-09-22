import { AIAnalysisResult } from './aiService'

export interface FeedbackHistoryEntry {
  id: string
  imageUrl: string
  analysisResult: AIAnalysisResult
  timestamp: Date
  technique?: string
  notes?: string
}

export interface FeedbackComparison {
  current: FeedbackHistoryEntry
  previous: FeedbackHistoryEntry
  improvements: string[]
  regressions: string[]
  overallProgress: number
}

export class FeedbackHistoryService {
  private static instance: FeedbackHistoryService
  private storageKey = 'patissier-feedback-history'

  private constructor() {}

  public static getInstance(): FeedbackHistoryService {
    if (!FeedbackHistoryService.instance) {
      FeedbackHistoryService.instance = new FeedbackHistoryService()
    }
    return FeedbackHistoryService.instance
  }

  // Save feedback entry to local storage
  saveFeedbackEntry(entry: Omit<FeedbackHistoryEntry, 'id' | 'timestamp'>): FeedbackHistoryEntry {
    const newEntry: FeedbackHistoryEntry = {
      ...entry,
      id: this.generateId(),
      timestamp: new Date()
    }

    const history = this.getFeedbackHistory()
    history.unshift(newEntry) // Add to beginning for chronological order
    
    // Keep only last 50 entries to prevent storage bloat
    const limitedHistory = history.slice(0, 50)
    
    localStorage.setItem(this.storageKey, JSON.stringify(limitedHistory))
    return newEntry
  }

  // Get all feedback history
  getFeedbackHistory(): FeedbackHistoryEntry[] {
    try {
      const stored = localStorage.getItem(this.storageKey)
      if (!stored) return []
      
      const history = JSON.parse(stored)
      return history.map((entry: any) => ({
        ...entry,
        timestamp: new Date(entry.timestamp)
      }))
    } catch (error) {
      console.error('Error loading feedback history:', error)
      return []
    }
  }

  // Get feedback entry by ID
  getFeedbackEntry(id: string): FeedbackHistoryEntry | null {
    const history = this.getFeedbackHistory()
    return history.find(entry => entry.id === id) || null
  }

  // Get recent feedback entries (last N entries)
  getRecentFeedback(limit: number = 10): FeedbackHistoryEntry[] {
    const history = this.getFeedbackHistory()
    return history.slice(0, limit)
  }

  // Get feedback by technique/category
  getFeedbackByCategory(category: string): FeedbackHistoryEntry[] {
    const history = this.getFeedbackHistory()
    return history.filter(entry => 
      entry.analysisResult.category.toLowerCase() === category.toLowerCase()
    )
  }

  // Compare two feedback entries
  compareFeedback(currentId: string, previousId: string): FeedbackComparison | null {
    const current = this.getFeedbackEntry(currentId)
    const previous = this.getFeedbackEntry(previousId)

    if (!current || !previous) return null

    const improvements: string[] = []
    const regressions: string[] = []

    // Compare overall scores
    const scoreDiff = current.analysisResult.score - previous.analysisResult.score
    if (scoreDiff > 5) {
      improvements.push(`Overall score improved by ${scoreDiff} points`)
    } else if (scoreDiff < -5) {
      regressions.push(`Overall score decreased by ${Math.abs(scoreDiff)} points`)
    }

    // Compare individual analysis scores
    const currentAnalysis = current.analysisResult.analysis
    const previousAnalysis = previous.analysisResult.analysis

    Object.keys(currentAnalysis).forEach(key => {
      const currentScore = currentAnalysis[key as keyof typeof currentAnalysis].score
      const previousScore = previousAnalysis[key as keyof typeof previousAnalysis].score
      const diff = currentScore - previousScore

      if (diff > 5) {
        improvements.push(`${key} score improved by ${diff} points`)
      } else if (diff < -5) {
        regressions.push(`${key} score decreased by ${Math.abs(diff)} points`)
      }
    })

    // Calculate overall progress percentage
    const overallProgress = Math.max(0, Math.min(100, 
      ((current.analysisResult.score - previous.analysisResult.score) / 100) * 100 + 50
    ))

    return {
      current,
      previous,
      improvements,
      regressions,
      overallProgress
    }
  }

  // Get progress trends over time
  getProgressTrends(days: number = 30): {
    dates: string[]
    scores: number[]
    categories: string[]
  } {
    const history = this.getFeedbackHistory()
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - days)

    const recentHistory = history.filter(entry => entry.timestamp >= cutoffDate)
    
    const dates = recentHistory.map(entry => 
      entry.timestamp.toISOString().split('T')[0]
    )
    const scores = recentHistory.map(entry => entry.analysisResult.score)
    const categories = recentHistory.map(entry => entry.analysisResult.category)

    return { dates, scores, categories }
  }

  // Get statistics
  getStatistics(): {
    totalSubmissions: number
    averageScore: number
    bestScore: number
    worstScore: number
    mostCommonCategory: string
    improvementRate: number
  } {
    const history = this.getFeedbackHistory()
    
    if (history.length === 0) {
      return {
        totalSubmissions: 0,
        averageScore: 0,
        bestScore: 0,
        worstScore: 0,
        mostCommonCategory: '',
        improvementRate: 0
      }
    }

    const scores = history.map(entry => entry.analysisResult.score)
    const categories = history.map(entry => entry.analysisResult.category)
    
    const averageScore = scores.reduce((sum, score) => sum + score, 0) / scores.length
    const bestScore = Math.max(...scores)
    const worstScore = Math.min(...scores)
    
    // Find most common category
    const categoryCounts = categories.reduce((acc, category) => {
      acc[category] = (acc[category] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    
    const mostCommonCategory = Object.entries(categoryCounts)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || ''

    // Calculate improvement rate (simplified)
    const recentScores = scores.slice(0, Math.min(5, scores.length))
    const olderScores = scores.slice(-Math.min(5, scores.length))
    const improvementRate = recentScores.length > 0 && olderScores.length > 0
      ? ((recentScores.reduce((a, b) => a + b, 0) / recentScores.length) - 
         (olderScores.reduce((a, b) => a + b, 0) / olderScores.length)) / 100
      : 0

    return {
      totalSubmissions: history.length,
      averageScore: Math.round(averageScore),
      bestScore,
      worstScore,
      mostCommonCategory,
      improvementRate: Math.round(improvementRate * 100) / 100
    }
  }

  // Delete feedback entry
  deleteFeedbackEntry(id: string): boolean {
    const history = this.getFeedbackHistory()
    const filteredHistory = history.filter(entry => entry.id !== id)
    
    if (filteredHistory.length === history.length) return false
    
    localStorage.setItem(this.storageKey, JSON.stringify(filteredHistory))
    return true
  }

  // Clear all feedback history
  clearFeedbackHistory(): void {
    localStorage.removeItem(this.storageKey)
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2)
  }
}

export const feedbackHistoryService = FeedbackHistoryService.getInstance()
