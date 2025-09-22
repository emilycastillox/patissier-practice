import { LearningPath, LearningModule, LearningPathLevel, ProgressStatus } from "@/lib/types"
import { progressService } from "./progressService"
import { prerequisiteService } from "./prerequisiteService"

export interface CompletionEvent {
  type: 'module_completed' | 'path_completed' | 'module_started' | 'path_started'
  moduleId?: number
  pathId: number
  timestamp: string
  score?: number
  timeSpent?: number
  attempts?: number
}

export interface UnlockResult {
  newlyUnlockedModules: number[]
  newlyUnlockedPaths: number[]
  achievements: string[]
  notifications: string[]
}

export interface CompletionStats {
  totalModulesCompleted: number
  totalPathsCompleted: number
  totalTimeSpent: number
  averageScore: number
  currentStreak: number
  longestStreak: number
  achievements: string[]
  levelProgress: {
    [key in LearningPathLevel]: {
      completed: number
      total: number
      percentage: number
    }
  }
}

class CompletionLogicService {
  private completionEvents: CompletionEvent[] = []
  private storageKey = 'patissier-practice-completion-events'

  constructor() {
    this.loadCompletionEvents()
  }

  // Load completion events from localStorage
  private loadCompletionEvents(): void {
    if (typeof window === 'undefined') return
    
    try {
      const data = localStorage.getItem(this.storageKey)
      if (data) {
        this.completionEvents = JSON.parse(data)
      }
    } catch (error) {
      console.error('Error loading completion events:', error)
    }
  }

  // Save completion events to localStorage
  private saveCompletionEvents(): void {
    if (typeof window === 'undefined') return
    
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.completionEvents))
    } catch (error) {
      console.error('Error saving completion events:', error)
    }
  }

  // Record a completion event
  private recordEvent(event: CompletionEvent): void {
    this.completionEvents.push(event)
    this.saveCompletionEvents()
  }

  // Handle module completion
  handleModuleCompletion(moduleId: number, pathId: number, score?: number, timeSpent?: number): UnlockResult {
    const module = this.findModule(moduleId, pathId)
    if (!module) {
      throw new Error(`Module ${moduleId} not found in path ${pathId}`)
    }

    // Record completion event
    this.recordEvent({
      type: 'module_completed',
      moduleId,
      pathId,
      timestamp: new Date().toISOString(),
      score,
      timeSpent
    })

    // Update progress
    progressService.markModuleComplete(moduleId, pathId, score)

    // Check for newly unlockable modules
    const newlyUnlockedModules = this.checkModuleUnlocks(pathId)
    
    // Check for path completion
    const pathCompleted = this.checkPathCompletion(pathId)
    let newlyUnlockedPaths: number[] = []
    
    if (pathCompleted) {
      newlyUnlockedPaths = this.checkPathUnlocks()
    }

    // Check for achievements
    const achievements = this.checkAchievements()

    // Generate notifications
    const notifications = this.generateNotifications(
      newlyUnlockedModules,
      newlyUnlockedPaths,
      achievements
    )

    return {
      newlyUnlockedModules,
      newlyUnlockedPaths,
      achievements,
      notifications
    }
  }

  // Handle module start
  handleModuleStart(moduleId: number, pathId: number): void {
    this.recordEvent({
      type: 'module_started',
      moduleId,
      pathId,
      timestamp: new Date().toISOString()
    })
  }

  // Handle path start
  handlePathStart(pathId: number): void {
    this.recordEvent({
      type: 'path_started',
      pathId,
      timestamp: new Date().toISOString()
    })
  }

  // Check for newly unlockable modules
  private checkModuleUnlocks(pathId: number): number[] {
    const path = this.findPath(pathId)
    if (!path) return []

    const results = prerequisiteService.autoUnlockModules(path)
    return results
      .filter(result => result.newlyUnlocked)
      .map(result => result.moduleId)
  }

  // Check for path completion
  private checkPathCompletion(pathId: number): boolean {
    const path = this.findPath(pathId)
    if (!path) return false

    const pathProgress = progressService.getPathProgress(pathId)
    return pathProgress ? pathProgress.completionPercentage >= 100 : false
  }

  // Check for newly unlockable paths
  private checkPathUnlocks(): number[] {
    // This would need access to all paths - for now return empty array
    // In a real implementation, this would check all available paths
    return []
  }

  // Check for achievements
  private checkAchievements(): string[] {
    const stats = this.getCompletionStats()
    const achievements: string[] = []

    // Module completion achievements
    if (stats.totalModulesCompleted >= 1) {
      achievements.push('First Module Complete')
    }
    if (stats.totalModulesCompleted >= 10) {
      achievements.push('Module Master')
    }
    if (stats.totalModulesCompleted >= 50) {
      achievements.push('Learning Champion')
    }

    // Path completion achievements
    if (stats.totalPathsCompleted >= 1) {
      achievements.push('First Path Complete')
    }
    if (stats.totalPathsCompleted >= 5) {
      achievements.push('Path Master')
    }
    if (stats.totalPathsCompleted >= 10) {
      achievements.push('Learning Legend')
    }

    // Time-based achievements
    if (stats.totalTimeSpent >= 60) {
      achievements.push('Hour of Learning')
    }
    if (stats.totalTimeSpent >= 300) {
      achievements.push('Learning Marathon')
    }
    if (stats.totalTimeSpent >= 1000) {
      achievements.push('Learning Master')
    }

    // Streak achievements
    if (stats.currentStreak >= 7) {
      achievements.push('Week Warrior')
    }
    if (stats.currentStreak >= 30) {
      achievements.push('Monthly Master')
    }
    if (stats.currentStreak >= 100) {
      achievements.push('Streak Legend')
    }

    // Score achievements
    if (stats.averageScore >= 90) {
      achievements.push('High Achiever')
    }
    if (stats.averageScore >= 95) {
      achievements.push('Perfectionist')
    }

    return achievements
  }

  // Generate notifications for unlocks and achievements
  private generateNotifications(
    newlyUnlockedModules: number[],
    newlyUnlockedPaths: number[],
    achievements: string[]
  ): string[] {
    const notifications: string[] = []

    // Module unlock notifications
    newlyUnlockedModules.forEach(moduleId => {
      notifications.push(`Module unlocked! You can now access the next learning module.`)
    })

    // Path unlock notifications
    newlyUnlockedPaths.forEach(pathId => {
      notifications.push(`New learning path unlocked! Explore new challenges and techniques.`)
    })

    // Achievement notifications
    achievements.forEach(achievement => {
      notifications.push(`Achievement unlocked: ${achievement}`)
    })

    return notifications
  }

  // Get completion statistics
  getCompletionStats(): CompletionStats {
    const allProgress = progressService.getAllProgress()
    
    const totalModulesCompleted = Object.values(allProgress.moduleProgress)
      .filter(mp => mp.status === 'completed').length
    
    const totalPathsCompleted = Object.values(allProgress.pathProgress)
      .filter(pp => pp.status === 'completed').length
    
    const totalTimeSpent = Object.values(allProgress.moduleProgress)
      .reduce((total, mp) => total + mp.timeSpent, 0)
    
    const scores = Object.values(allProgress.moduleProgress)
      .filter(mp => mp.score !== undefined).map(mp => mp.score!)
    const averageScore = scores.length > 0 ? 
      scores.reduce((sum, score) => sum + score, 0) / scores.length : 0

    // Calculate streaks
    const currentStreak = this.calculateCurrentStreak()
    const longestStreak = this.calculateLongestStreak()

    // Calculate level progress
    const levelProgress = this.calculateLevelProgress()

    return {
      totalModulesCompleted,
      totalPathsCompleted,
      totalTimeSpent,
      averageScore,
      currentStreak,
      longestStreak,
      achievements: this.getUnlockedAchievements(),
      levelProgress
    }
  }

  // Calculate current streak
  private calculateCurrentStreak(): number {
    const today = new Date()
    let streak = 0

    // Sort events by timestamp (most recent first)
    const sortedEvents = [...this.completionEvents]
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

    for (const event of sortedEvents) {
      const eventDate = new Date(event.timestamp)
      const daysDiff = Math.floor((today.getTime() - eventDate.getTime()) / (1000 * 60 * 60 * 24))
      
      if (daysDiff <= 1) {
        streak++
        today.setDate(today.getDate() - 1)
      } else {
        break
      }
    }

    return streak
  }

  // Calculate longest streak
  private calculateLongestStreak(): number {
    // This would require more sophisticated historical tracking
    // For now, return current streak
    return this.calculateCurrentStreak()
  }

  // Calculate level progress
  private calculateLevelProgress(): {
    [key in LearningPathLevel]: {
      completed: number
      total: number
      percentage: number
    }
  } {
    const levelProgress = {
      Beginner: { completed: 0, total: 0, percentage: 0 },
      Intermediate: { completed: 0, total: 0, percentage: 0 },
      Advanced: { completed: 0, total: 0, percentage: 0 }
    }

    // This would need access to all paths to calculate properly
    // For now, return empty progress
    return levelProgress
  }

  // Get unlocked achievements
  private getUnlockedAchievements(): string[] {
    // This would track unlocked achievements
    // For now, return empty array
    return []
  }

  // Find module by ID and path ID
  private findModule(moduleId: number, pathId: number): LearningModule | null {
    const path = this.findPath(pathId)
    if (!path) return null

    return path.modules.find(m => m.id === moduleId) || null
  }

  // Find path by ID
  private findPath(pathId: number): LearningPath | null {
    // This would need access to all paths
    // For now, return null
    return null
  }

  // Get completion events
  getCompletionEvents(): CompletionEvent[] {
    return [...this.completionEvents]
  }

  // Get recent completion events
  getRecentCompletionEvents(limit: number = 10): CompletionEvent[] {
    return [...this.completionEvents]
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit)
  }

  // Clear all completion events
  clearCompletionEvents(): void {
    this.completionEvents = []
    this.saveCompletionEvents()
  }

  // Export completion data
  exportCompletionData(): string {
    return JSON.stringify({
      events: this.completionEvents,
      stats: this.getCompletionStats()
    }, null, 2)
  }

  // Import completion data
  importCompletionData(data: string): boolean {
    try {
      const parsed = JSON.parse(data)
      if (parsed.events && Array.isArray(parsed.events)) {
        this.completionEvents = parsed.events
        this.saveCompletionEvents()
        return true
      }
    } catch (error) {
      console.error('Error importing completion data:', error)
    }
    return false
  }
}

export const completionLogicService = new CompletionLogicService()
export default completionLogicService
