import { LearningPath, LearningModule, LearningPathProgress, LearningPathLevel, ProgressStatus } from "@/lib/types"

export interface ProgressStats {
  totalPaths: number
  completedPaths: number
  inProgressPaths: number
  notStartedPaths: number
  totalModules: number
  completedModules: number
  inProgressModules: number
  notStartedModules: number
  totalTimeSpent: number // in minutes
  averageScore: number
  currentStreak: number
  longestStreak: number
  achievements: string[]
  levelProgress: {
    [key in LearningPathLevel]: {
      total: number
      completed: number
      inProgress: number
      notStarted: number
    }
  }
}

export interface ModuleProgress {
  moduleId: number
  pathId: number
  status: ProgressStatus
  completionPercentage: number
  timeSpent: number // in minutes
  lastAccessedAt: string
  startedAt?: string
  completedAt?: string
  score?: number
  attempts: number
  notes?: string
  bookmarked: boolean
}

export interface PathProgress {
  pathId: number
  status: ProgressStatus
  completionPercentage: number
  completedModules: number[]
  currentModule: number
  timeSpent: number // in minutes
  lastAccessedAt: string
  startedAt: string
  completedAt?: string
  score: number
  streak: number
  achievements: string[]
  notes?: string
  bookmarked: boolean
  rating?: number
  review?: string
}

export interface ProgressAnalytics {
  weeklyProgress: {
    week: string
    pathsCompleted: number
    modulesCompleted: number
    timeSpent: number
  }[]
  monthlyProgress: {
    month: string
    pathsCompleted: number
    modulesCompleted: number
    timeSpent: number
  }[]
  categoryProgress: {
    category: string
    totalPaths: number
    completedPaths: number
    completionRate: number
  }[]
  difficultyProgress: {
    difficulty: string
    totalPaths: number
    completedPaths: number
    completionRate: number
    averageScore: number
  }[]
  timeDistribution: {
    timeOfDay: string
    timeSpent: number
  }[]
  learningVelocity: {
    period: string
    pathsPerWeek: number
    modulesPerWeek: number
  }[]
}

class ProgressService {
  private storageKey = 'patissier-practice-progress'

  // Get all progress data
  getAllProgress(): {
    moduleProgress: Record<number, ModuleProgress>
    pathProgress: Record<number, PathProgress>
  } {
    try {
      const data = localStorage.getItem(this.storageKey)
      if (data) {
        const parsed = JSON.parse(data)
        return {
          moduleProgress: parsed.moduleProgress || {},
          pathProgress: parsed.pathProgress || {}
        }
      }
    } catch (error) {
      console.error('Error loading progress data:', error)
    }
    
    return {
      moduleProgress: {},
      pathProgress: {}
    }
  }

  // Save progress data
  private saveProgress(data: {
    moduleProgress: Record<number, ModuleProgress>
    pathProgress: Record<number, PathProgress>
  }): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(data))
    } catch (error) {
      console.error('Error saving progress data:', error)
    }
  }

  // Get module progress
  getModuleProgress(moduleId: number): ModuleProgress | null {
    const { moduleProgress } = this.getAllProgress()
    return moduleProgress[moduleId] || null
  }

  // Update module progress
  updateModuleProgress(moduleId: number, pathId: number, updates: Partial<ModuleProgress>): void {
    const { moduleProgress, pathProgress } = this.getAllProgress()
    
    const existing = moduleProgress[moduleId] || {
      moduleId,
      pathId,
      status: 'not-started' as ProgressStatus,
      completionPercentage: 0,
      timeSpent: 0,
      lastAccessedAt: new Date().toISOString(),
      attempts: 0,
      bookmarked: false
    }

    const updated: ModuleProgress = {
      ...existing,
      ...updates,
      lastAccessedAt: new Date().toISOString()
    }

    // Update status based on completion percentage
    if (updated.completionPercentage >= 100) {
      updated.status = 'completed'
      updated.completedAt = new Date().toISOString()
    } else if (updated.completionPercentage > 0) {
      updated.status = 'in-progress'
      if (!updated.startedAt) {
        updated.startedAt = new Date().toISOString()
      }
    }

    moduleProgress[moduleId] = updated

    // Update path progress
    this.updatePathProgressFromModule(pathId, moduleId, updated)

    this.saveProgress({ moduleProgress, pathProgress })
  }

  // Update path progress based on module changes
  private updatePathProgressFromModule(pathId: number, moduleId: number, moduleProgress: ModuleProgress): void {
    const { pathProgress } = this.getAllProgress()
    
    let pathProg = pathProgress[pathId]
    if (!pathProg) {
      pathProg = {
        pathId,
        status: 'not-started' as ProgressStatus,
        completionPercentage: 0,
        completedModules: [],
        currentModule: moduleId,
        timeSpent: 0,
        lastAccessedAt: new Date().toISOString(),
        startedAt: new Date().toISOString(),
        score: 0,
        streak: 0,
        achievements: [],
        bookmarked: false
      }
    }

    // Update completed modules
    if (moduleProgress.status === 'completed' && !pathProg.completedModules.includes(moduleId)) {
      pathProg.completedModules.push(moduleId)
    } else if (moduleProgress.status !== 'completed' && pathProg.completedModules.includes(moduleId)) {
      pathProg.completedModules = pathProg.completedModules.filter(id => id !== moduleId)
    }

    // Update current module
    if (moduleProgress.status === 'in-progress') {
      pathProg.currentModule = moduleId
    }

    // Update time spent
    pathProg.timeSpent = Object.values(this.getAllProgress().moduleProgress)
      .filter(mp => mp.pathId === pathId)
      .reduce((total, mp) => total + mp.timeSpent, 0)

    // Update status and completion percentage
    if (pathProg.completedModules.length > 0) {
      pathProg.status = 'in-progress'
    }
    if (pathProg.completedModules.length === 0) {
      pathProg.status = 'not-started'
    }

    pathProg.lastAccessedAt = new Date().toISOString()

    pathProgress[pathId] = pathProg
  }

  // Get path progress
  getPathProgress(pathId: number): PathProgress | null {
    const { pathProgress } = this.getAllProgress()
    return pathProgress[pathId] || null
  }

  // Update path progress
  updatePathProgress(pathId: number, updates: Partial<PathProgress>): void {
    const { pathProgress } = this.getAllProgress()
    
    const existing = pathProgress[pathId] || {
      pathId,
      status: 'not-started' as ProgressStatus,
      completionPercentage: 0,
      completedModules: [],
      currentModule: 0,
      timeSpent: 0,
      lastAccessedAt: new Date().toISOString(),
      startedAt: new Date().toISOString(),
      score: 0,
      streak: 0,
      achievements: [],
      bookmarked: false
    }

    const updated: PathProgress = {
      ...existing,
      ...updates,
      lastAccessedAt: new Date().toISOString()
    }

    // Update status based on completion
    if (updated.completionPercentage >= 100) {
      updated.status = 'completed'
      updated.completedAt = new Date().toISOString()
    } else if (updated.completionPercentage > 0) {
      updated.status = 'in-progress'
    }

    pathProgress[pathId] = updated
    this.saveProgress({ moduleProgress: this.getAllProgress().moduleProgress, pathProgress })
  }

  // Calculate path completion percentage
  calculatePathCompletion(path: LearningPath): number {
    const { moduleProgress } = this.getAllProgress()
    const pathModules = path.modules
    
    if (pathModules.length === 0) return 0

    const completedCount = pathModules.filter(module => {
      const progress = moduleProgress[module.id]
      return progress && progress.status === 'completed'
    }).length

    return Math.round((completedCount / pathModules.length) * 100)
  }

  // Calculate module completion percentage
  calculateModuleCompletion(module: LearningModule): number {
    const progress = this.getModuleProgress(module.id)
    return progress ? progress.completionPercentage : 0
  }

  // Get overall progress statistics
  getProgressStats(paths: LearningPath[]): ProgressStats {
    const { moduleProgress, pathProgress } = this.getAllProgress()
    
    const totalPaths = paths.length
    const completedPaths = paths.filter(path => {
      const progress = pathProgress[path.id]
      return progress && progress.status === 'completed'
    }).length
    
    const inProgressPaths = paths.filter(path => {
      const progress = pathProgress[path.id]
      return progress && progress.status === 'in-progress'
    }).length

    const totalModules = paths.reduce((total, path) => total + path.modules.length, 0)
    const completedModules = Object.values(moduleProgress).filter(mp => mp.status === 'completed').length
    const inProgressModules = Object.values(moduleProgress).filter(mp => mp.status === 'in-progress').length

    const totalTimeSpent = Object.values(moduleProgress).reduce((total, mp) => total + mp.timeSpent, 0)
    
    const scores = Object.values(moduleProgress).filter(mp => mp.score !== undefined).map(mp => mp.score!)
    const averageScore = scores.length > 0 ? scores.reduce((sum, score) => sum + score, 0) / scores.length : 0

    // Calculate streaks
    const currentStreak = this.calculateCurrentStreak()
    const longestStreak = this.calculateLongestStreak()

    // Calculate level progress
    const levelProgress = {
      Beginner: { total: 0, completed: 0, inProgress: 0, notStarted: 0 },
      Intermediate: { total: 0, completed: 0, inProgress: 0, notStarted: 0 },
      Advanced: { total: 0, completed: 0, inProgress: 0, notStarted: 0 }
    }

    paths.forEach(path => {
      const progress = pathProgress[path.id]
      const level = path.level
      
      levelProgress[level].total++
      
      if (progress) {
        if (progress.status === 'completed') {
          levelProgress[level].completed++
        } else if (progress.status === 'in-progress') {
          levelProgress[level].inProgress++
        } else {
          levelProgress[level].notStarted++
        }
      } else {
        levelProgress[level].notStarted++
      }
    })

    return {
      totalPaths,
      completedPaths,
      inProgressPaths,
      notStartedPaths: totalPaths - completedPaths - inProgressPaths,
      totalModules,
      completedModules,
      inProgressModules,
      notStartedModules: totalModules - completedModules - inProgressModules,
      totalTimeSpent,
      averageScore,
      currentStreak,
      longestStreak,
      achievements: this.getAchievements(),
      levelProgress
    }
  }

  // Calculate current streak
  private calculateCurrentStreak(): number {
    const { pathProgress } = this.getAllProgress()
    const today = new Date()
    let streak = 0

    // Sort by last accessed date
    const sortedProgress = Object.values(pathProgress)
      .sort((a, b) => new Date(b.lastAccessedAt).getTime() - new Date(a.lastAccessedAt).getTime())

    for (const progress of sortedProgress) {
      const lastAccessed = new Date(progress.lastAccessedAt)
      const daysDiff = Math.floor((today.getTime() - lastAccessed.getTime()) / (1000 * 60 * 60 * 24))
      
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
    // This would require historical data tracking
    // For now, return current streak
    return this.calculateCurrentStreak()
  }

  // Get achievements
  private getAchievements(): string[] {
    const { pathProgress, moduleProgress } = this.getAllProgress()
    const achievements: string[] = []

    const completedPaths = Object.values(pathProgress).filter(p => p.status === 'completed').length
    const completedModules = Object.values(moduleProgress).filter(m => m.status === 'completed').length

    if (completedPaths >= 1) achievements.push('First Path Complete')
    if (completedPaths >= 5) achievements.push('Path Master')
    if (completedPaths >= 10) achievements.push('Learning Legend')
    
    if (completedModules >= 10) achievements.push('Module Master')
    if (completedModules >= 50) achievements.push('Learning Champion')
    
    const totalTime = Object.values(moduleProgress).reduce((total, mp) => total + mp.timeSpent, 0)
    if (totalTime >= 60) achievements.push('Hour of Learning')
    if (totalTime >= 300) achievements.push('Learning Marathon')
    if (totalTime >= 1000) achievements.push('Learning Master')

    return achievements
  }

  // Get progress analytics
  getProgressAnalytics(): ProgressAnalytics {
    // This would require more sophisticated data tracking
    // For now, return mock data structure
    return {
      weeklyProgress: [],
      monthlyProgress: [],
      categoryProgress: [],
      difficultyProgress: [],
      timeDistribution: [],
      learningVelocity: []
    }
  }

  // Mark module as complete
  markModuleComplete(moduleId: number, pathId: number, score?: number): void {
    this.updateModuleProgress(moduleId, pathId, {
      status: 'completed',
      completionPercentage: 100,
      completedAt: new Date().toISOString(),
      score: score || 100
    })
  }

  // Mark module as incomplete
  markModuleIncomplete(moduleId: number, pathId: number): void {
    this.updateModuleProgress(moduleId, pathId, {
      status: 'in-progress',
      completionPercentage: 0,
      completedAt: undefined
    })
  }

  // Reset progress
  resetProgress(): void {
    try {
      localStorage.removeItem(this.storageKey)
    } catch (error) {
      console.error('Error resetting progress:', error)
    }
  }

  // Export progress data
  exportProgress(): string {
    const data = this.getAllProgress()
    return JSON.stringify(data, null, 2)
  }

  // Import progress data
  importProgress(data: string): boolean {
    try {
      const parsed = JSON.parse(data)
      this.saveProgress(parsed)
      return true
    } catch (error) {
      console.error('Error importing progress:', error)
      return false
    }
  }
}

export const progressService = new ProgressService()
export default progressService
