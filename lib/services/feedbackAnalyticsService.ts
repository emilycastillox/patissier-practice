import { FeedbackHistoryEntry } from './feedbackHistoryService'
import { AIAnalysisResult } from './aiService'

export interface AnalyticsData {
  totalSubmissions: number
  averageScore: number
  bestScore: number
  worstScore: number
  scoreTrend: {
    dates: string[]
    scores: number[]
    movingAverage: number[]
  }
  categoryBreakdown: {
    category: string
    count: number
    averageScore: number
    trend: 'up' | 'down' | 'stable'
  }[]
  techniqueBreakdown: {
    technique: string
    count: number
    averageScore: number
    improvement: number
  }[]
  weeklyProgress: {
    week: string
    submissions: number
    averageScore: number
    improvement: number
  }[]
  monthlyProgress: {
    month: string
    submissions: number
    averageScore: number
    improvement: number
  }[]
  strengths: string[]
  weaknesses: string[]
  recommendations: string[]
  achievements: {
    id: string
    title: string
    description: string
    unlockedAt: Date
    type: 'score' | 'consistency' | 'improvement' | 'category' | 'streak'
  }[]
  streaks: {
    current: number
    longest: number
    type: 'daily' | 'weekly' | 'monthly'
  }
}

export interface ProgressInsight {
  type: 'improvement' | 'decline' | 'consistency' | 'breakthrough'
  title: string
  description: string
  data: any
  recommendation: string
  priority: 'high' | 'medium' | 'low'
}

export class FeedbackAnalyticsService {
  private static instance: FeedbackAnalyticsService
  private storageKey = 'patissier-analytics-cache'

  private constructor() {}

  public static getInstance(): FeedbackAnalyticsService {
    if (!FeedbackAnalyticsService.instance) {
      FeedbackAnalyticsService.instance = new FeedbackAnalyticsService()
    }
    return FeedbackAnalyticsService.instance
  }

  // Generate comprehensive analytics
  generateAnalytics(history: FeedbackHistoryEntry[]): AnalyticsData {
    if (history.length === 0) {
      return this.getEmptyAnalytics()
    }

    const totalSubmissions = history.length
    const scores = history.map(entry => entry.analysisResult.score)
    const averageScore = scores.reduce((sum, score) => sum + score, 0) / scores.length
    const bestScore = Math.max(...scores)
    const worstScore = Math.min(...scores)

    return {
      totalSubmissions,
      averageScore: Math.round(averageScore * 100) / 100,
      bestScore,
      worstScore,
      scoreTrend: this.calculateScoreTrend(history),
      categoryBreakdown: this.calculateCategoryBreakdown(history),
      techniqueBreakdown: this.calculateTechniqueBreakdown(history),
      weeklyProgress: this.calculateWeeklyProgress(history),
      monthlyProgress: this.calculateMonthlyProgress(history),
      strengths: this.identifyStrengths(history),
      weaknesses: this.identifyWeaknesses(history),
      recommendations: this.generateRecommendations(history),
      achievements: this.calculateAchievements(history),
      streaks: this.calculateStreaks(history)
    }
  }

  // Calculate score trend over time
  private calculateScoreTrend(history: FeedbackHistoryEntry[]): AnalyticsData['scoreTrend'] {
    const sortedHistory = [...history].sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())
    
    const dates = sortedHistory.map(entry => 
      entry.timestamp.toISOString().split('T')[0]
    )
    const scores = sortedHistory.map(entry => entry.analysisResult.score)
    
    // Calculate 7-day moving average
    const movingAverage = this.calculateMovingAverage(scores, 7)
    
    return { dates, scores, movingAverage }
  }

  // Calculate category breakdown
  private calculateCategoryBreakdown(history: FeedbackHistoryEntry[]): AnalyticsData['categoryBreakdown'] {
    const categoryMap = new Map<string, { scores: number[], count: number }>()
    
    history.forEach(entry => {
      const category = entry.analysisResult.category
      if (!categoryMap.has(category)) {
        categoryMap.set(category, { scores: [], count: 0 })
      }
      const data = categoryMap.get(category)!
      data.scores.push(entry.analysisResult.score)
      data.count++
    })

    return Array.from(categoryMap.entries()).map(([category, data]) => {
      const averageScore = data.scores.reduce((sum, score) => sum + score, 0) / data.scores.length
      const trend = this.calculateTrend(data.scores)
      
      return {
        category,
        count: data.count,
        averageScore: Math.round(averageScore * 100) / 100,
        trend
      }
    }).sort((a, b) => b.count - a.count)
  }

  // Calculate technique breakdown
  private calculateTechniqueBreakdown(history: FeedbackHistoryEntry[]): AnalyticsData['techniqueBreakdown'] {
    const techniqueMap = new Map<string, { scores: number[], count: number }>()
    
    history.forEach(entry => {
      const technique = entry.technique || 'Unknown'
      if (!techniqueMap.has(technique)) {
        techniqueMap.set(technique, { scores: [], count: 0 })
      }
      const data = techniqueMap.get(technique)!
      data.scores.push(entry.analysisResult.score)
      data.count++
    })

    return Array.from(techniqueMap.entries()).map(([technique, data]) => {
      const averageScore = data.scores.reduce((sum, score) => sum + score, 0) / data.scores.length
      const improvement = this.calculateImprovement(data.scores)
      
      return {
        technique,
        count: data.count,
        averageScore: Math.round(averageScore * 100) / 100,
        improvement: Math.round(improvement * 100) / 100
      }
    }).sort((a, b) => b.count - a.count)
  }

  // Calculate weekly progress
  private calculateWeeklyProgress(history: FeedbackHistoryEntry[]): AnalyticsData['weeklyProgress'] {
    const weeklyMap = new Map<string, { scores: number[], count: number }>()
    
    history.forEach(entry => {
      const week = this.getWeekString(entry.timestamp)
      if (!weeklyMap.has(week)) {
        weeklyMap.set(week, { scores: [], count: 0 })
      }
      const data = weeklyMap.get(week)!
      data.scores.push(entry.analysisResult.score)
      data.count++
    })

    const weeks = Array.from(weeklyMap.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([week, data]) => {
        const averageScore = data.scores.reduce((sum, score) => sum + score, 0) / data.scores.length
        return { week, submissions: data.count, averageScore: Math.round(averageScore * 100) / 100, improvement: 0 }
      })

    // Calculate improvement for each week
    for (let i = 1; i < weeks.length; i++) {
      weeks[i].improvement = weeks[i].averageScore - weeks[i - 1].averageScore
    }

    return weeks
  }

  // Calculate monthly progress
  private calculateMonthlyProgress(history: FeedbackHistoryEntry[]): AnalyticsData['monthlyProgress'] {
    const monthlyMap = new Map<string, { scores: number[], count: number }>()
    
    history.forEach(entry => {
      const month = entry.timestamp.toISOString().slice(0, 7) // YYYY-MM
      if (!monthlyMap.has(month)) {
        monthlyMap.set(month, { scores: [], count: 0 })
      }
      const data = monthlyMap.get(month)!
      data.scores.push(entry.analysisResult.score)
      data.count++
    })

    const months = Array.from(monthlyMap.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([month, data]) => {
        const averageScore = data.scores.reduce((sum, score) => sum + score, 0) / data.scores.length
        return { month, submissions: data.count, averageScore: Math.round(averageScore * 100) / 100, improvement: 0 }
      })

    // Calculate improvement for each month
    for (let i = 1; i < months.length; i++) {
      months[i].improvement = months[i].averageScore - months[i - 1].averageScore
    }

    return months
  }

  // Identify strengths based on analysis
  private identifyStrengths(history: FeedbackHistoryEntry[]): string[] {
    const aspectScores = this.calculateAspectScores(history)
    const strengths: string[] = []

    Object.entries(aspectScores).forEach(([aspect, data]) => {
      if (data.average >= 80) {
        strengths.push(this.getAspectDisplayName(aspect))
      }
    })

    return strengths
  }

  // Identify weaknesses based on analysis
  private identifyWeaknesses(history: FeedbackHistoryEntry[]): string[] {
    const aspectScores = this.calculateAspectScores(history)
    const weaknesses: string[] = []

    Object.entries(aspectScores).forEach(([aspect, data]) => {
      if (data.average < 70) {
        weaknesses.push(this.getAspectDisplayName(aspect))
      }
    })

    return weaknesses
  }

  // Generate recommendations based on analytics
  private generateRecommendations(history: FeedbackHistoryEntry[]): string[] {
    const recommendations: string[] = []
    const analytics = this.generateAnalytics(history)

    if (analytics.weaknesses.length > 0) {
      recommendations.push(`Focus on improving your ${analytics.weaknesses[0]} technique`)
    }

    if (analytics.scoreTrend.movingAverage.length > 1) {
      const recentTrend = analytics.scoreTrend.movingAverage.slice(-3)
      const isImproving = recentTrend[2] > recentTrend[0]
      if (!isImproving) {
        recommendations.push('Consider reviewing your recent techniques to identify areas for improvement')
      }
    }

    if (analytics.streaks.current < 3) {
      recommendations.push('Try to maintain a consistent practice schedule')
    }

    return recommendations
  }

  // Calculate achievements
  private calculateAchievements(history: FeedbackHistoryEntry[]): AnalyticsData['achievements'] {
    const achievements: AnalyticsData['achievements'] = []
    const scores = history.map(entry => entry.analysisResult.score)
    const bestScore = Math.max(...scores)
    const averageScore = scores.reduce((sum, score) => sum + score, 0) / scores.length

    // Score-based achievements
    if (bestScore >= 95) {
      achievements.push({
        id: 'perfect-score',
        title: 'Perfectionist',
        description: 'Achieved a score of 95 or higher',
        unlockedAt: history.find(entry => entry.analysisResult.score >= 95)?.timestamp || new Date(),
        type: 'score'
      })
    }

    if (averageScore >= 85) {
      achievements.push({
        id: 'high-average',
        title: 'Consistent Excellence',
        description: 'Maintained an average score of 85 or higher',
        unlockedAt: new Date(),
        type: 'consistency'
      })
    }

    // Consistency achievements
    const weeklyProgress = this.calculateWeeklyProgress(history)
    const improvingWeeks = weeklyProgress.filter(week => week.improvement > 0).length
    if (improvingWeeks >= 4) {
      achievements.push({
        id: 'improvement-streak',
        title: 'Rising Star',
        description: 'Improved for 4 consecutive weeks',
        unlockedAt: new Date(),
        type: 'improvement'
      })
    }

    return achievements
  }

  // Calculate streaks
  private calculateStreaks(history: FeedbackHistoryEntry[]): AnalyticsData['streaks'] {
    const sortedHistory = [...history].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
    let currentStreak = 0
    let longestStreak = 0
    let tempStreak = 0

    // Calculate daily streak (simplified)
    for (let i = 0; i < sortedHistory.length - 1; i++) {
      const current = sortedHistory[i].timestamp
      const next = sortedHistory[i + 1].timestamp
      const daysDiff = Math.floor((current.getTime() - next.getTime()) / (1000 * 60 * 60 * 24))
      
      if (daysDiff <= 1) {
        tempStreak++
        if (i === 0) currentStreak = tempStreak
      } else {
        longestStreak = Math.max(longestStreak, tempStreak)
        tempStreak = 0
      }
    }
    longestStreak = Math.max(longestStreak, tempStreak)

    return {
      current: currentStreak,
      longest: longestStreak,
      type: 'daily'
    }
  }

  // Generate progress insights
  generateProgressInsights(history: FeedbackHistoryEntry[]): ProgressInsight[] {
    const insights: ProgressInsight[] = []
    const analytics = this.generateAnalytics(history)

    // Improvement insight
    if (analytics.scoreTrend.movingAverage.length > 1) {
      const recent = analytics.scoreTrend.movingAverage.slice(-3)
      const older = analytics.scoreTrend.movingAverage.slice(-6, -3)
      if (recent.length > 0 && older.length > 0) {
        const recentAvg = recent.reduce((sum, score) => sum + score, 0) / recent.length
        const olderAvg = older.reduce((sum, score) => sum + score, 0) / older.length
        const improvement = recentAvg - olderAvg

        if (improvement > 5) {
          insights.push({
            type: 'improvement',
            title: 'Great Progress!',
            description: `Your average score has improved by ${improvement.toFixed(1)} points recently`,
            data: { improvement, recentAvg, olderAvg },
            recommendation: 'Keep up the excellent work!',
            priority: 'high'
          })
        } else if (improvement < -5) {
          insights.push({
            type: 'decline',
            title: 'Need to Focus',
            description: `Your average score has decreased by ${Math.abs(improvement).toFixed(1)} points recently`,
            data: { improvement, recentAvg, olderAvg },
            recommendation: 'Consider reviewing your techniques and practicing more consistently',
            priority: 'high'
          })
        }
      }
    }

    // Consistency insight
    const scoreVariance = this.calculateVariance(analytics.scoreTrend.scores)
    if (scoreVariance < 50) {
      insights.push({
        type: 'consistency',
        title: 'Consistent Performer',
        description: 'Your scores are very consistent, showing good technique stability',
        data: { variance: scoreVariance },
        recommendation: 'Try pushing yourself with more challenging techniques',
        priority: 'medium'
      })
    }

    return insights
  }

  // Helper methods
  private calculateMovingAverage(scores: number[], window: number): number[] {
    const result: number[] = []
    for (let i = window - 1; i < scores.length; i++) {
      const windowScores = scores.slice(i - window + 1, i + 1)
      const average = windowScores.reduce((sum, score) => sum + score, 0) / windowScores.length
      result.push(Math.round(average * 100) / 100)
    }
    return result
  }

  private calculateTrend(scores: number[]): 'up' | 'down' | 'stable' {
    if (scores.length < 2) return 'stable'
    
    const firstHalf = scores.slice(0, Math.floor(scores.length / 2))
    const secondHalf = scores.slice(Math.floor(scores.length / 2))
    
    const firstAvg = firstHalf.reduce((sum, score) => sum + score, 0) / firstHalf.length
    const secondAvg = secondHalf.reduce((sum, score) => sum + score, 0) / secondHalf.length
    
    const diff = secondAvg - firstAvg
    if (diff > 2) return 'up'
    if (diff < -2) return 'down'
    return 'stable'
  }

  private calculateImprovement(scores: number[]): number {
    if (scores.length < 2) return 0
    
    const firstHalf = scores.slice(0, Math.floor(scores.length / 2))
    const secondHalf = scores.slice(Math.floor(scores.length / 2))
    
    const firstAvg = firstHalf.reduce((sum, score) => sum + score, 0) / firstHalf.length
    const secondAvg = secondHalf.reduce((sum, score) => sum + score, 0) / secondHalf.length
    
    return secondAvg - firstAvg
  }

  private getWeekString(date: Date): string {
    const year = date.getFullYear()
    const week = this.getWeekNumber(date)
    return `${year}-W${week.toString().padStart(2, '0')}`
  }

  private getWeekNumber(date: Date): number {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1)
    const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7)
  }

  private calculateAspectScores(history: FeedbackHistoryEntry[]): Record<string, { average: number, count: number }> {
    const aspectMap: Record<string, number[]> = {}
    
    history.forEach(entry => {
      Object.entries(entry.analysisResult.analysis).forEach(([aspect, data]) => {
        if (!aspectMap[aspect]) aspectMap[aspect] = []
        aspectMap[aspect].push(data.score)
      })
    })

    const result: Record<string, { average: number, count: number }> = {}
    Object.entries(aspectMap).forEach(([aspect, scores]) => {
      result[aspect] = {
        average: scores.reduce((sum, score) => sum + score, 0) / scores.length,
        count: scores.length
      }
    })

    return result
  }

  private getAspectDisplayName(aspect: string): string {
    const displayNames: Record<string, string> = {
      color: 'Color Theory',
      shape: 'Shaping Techniques',
      texture: 'Texture Control',
      presentation: 'Presentation Skills'
    }
    return displayNames[aspect] || aspect
  }

  private calculateVariance(scores: number[]): number {
    if (scores.length < 2) return 0
    
    const mean = scores.reduce((sum, score) => sum + score, 0) / scores.length
    const variance = scores.reduce((sum, score) => sum + Math.pow(score - mean, 2), 0) / scores.length
    return Math.round(variance * 100) / 100
  }

  private getEmptyAnalytics(): AnalyticsData {
    return {
      totalSubmissions: 0,
      averageScore: 0,
      bestScore: 0,
      worstScore: 0,
      scoreTrend: { dates: [], scores: [], movingAverage: [] },
      categoryBreakdown: [],
      techniqueBreakdown: [],
      weeklyProgress: [],
      monthlyProgress: [],
      strengths: [],
      weaknesses: [],
      recommendations: [],
      achievements: [],
      streaks: { current: 0, longest: 0, type: 'daily' }
    }
  }
}

export const feedbackAnalyticsService = FeedbackAnalyticsService.getInstance()
