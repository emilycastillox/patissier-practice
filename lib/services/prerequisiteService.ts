import { LearningPath, LearningModule, LearningPathLevel, ProgressStatus } from "@/lib/types"
import { progressService } from "./progressService"

export interface PrerequisiteCheck {
  isUnlocked: boolean
  missingPrerequisites: number[]
  completedPrerequisites: number[]
  blockingModules: number[]
  canUnlock: boolean
  unlockConditions: UnlockCondition[]
}

export interface UnlockCondition {
  type: 'module_completion' | 'path_completion' | 'score_threshold' | 'time_spent' | 'attempts' | 'custom'
  description: string
  isMet: boolean
  requiredValue?: number
  currentValue?: number
  moduleId?: number
  pathId?: number
}

export interface ModuleUnlockResult {
  moduleId: number
  wasUnlocked: boolean
  newlyUnlocked: boolean
  prerequisites: PrerequisiteCheck
  nextUnlockableModules: number[]
}

export interface PathUnlockResult {
  pathId: number
  wasUnlocked: boolean
  newlyUnlocked: boolean
  prerequisites: PrerequisiteCheck
  nextUnlockablePaths: number[]
}

class PrerequisiteService {
  private storageKey = 'patissier-practice-unlocked-modules'

  // Get unlocked modules from localStorage
  private getUnlockedModules(): number[] {
    try {
      const data = localStorage.getItem(this.storageKey)
      return data ? JSON.parse(data) : []
    } catch (error) {
      console.error('Error loading unlocked modules:', error)
      return []
    }
  }

  // Save unlocked modules to localStorage
  private saveUnlockedModules(modules: number[]): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(modules))
    } catch (error) {
      console.error('Error saving unlocked modules:', error)
    }
  }

  // Check if a module can be unlocked based on its prerequisites
  checkModulePrerequisites(module: LearningModule, path: LearningPath): PrerequisiteCheck {
    const unlockedModules = this.getUnlockedModules()
    const completedModules = this.getCompletedModules()
    
    const missingPrerequisites: number[] = []
    const completedPrerequisites: number[] = []
    const unlockConditions: UnlockCondition[] = []

    // Check module prerequisites
    if (module.prerequisites && module.prerequisites.length > 0) {
      for (const prereqId of module.prerequisites) {
        const prereqModule = path.modules.find(m => m.id === prereqId)
        if (prereqModule) {
          const prereqProgress = progressService.getModuleProgress(prereqId)
          const isCompleted = prereqProgress?.status === 'completed'
          
          if (isCompleted) {
            completedPrerequisites.push(prereqId)
          } else {
            missingPrerequisites.push(prereqId)
          }

          unlockConditions.push({
            type: 'module_completion',
            description: `Complete module: ${prereqModule.title}`,
            isMet: isCompleted,
            moduleId: prereqId
          })
        }
      }
    }

    // Check path prerequisites
    if (path.prerequisites && path.prerequisites.length > 0) {
      for (const prereqPathId of path.prerequisites) {
        const prereqPathProgress = progressService.getPathProgress(prereqPathId)
        const isPathCompleted = prereqPathProgress && prereqPathProgress.completionPercentage >= 100
        
        if (!isPathCompleted) {
          missingPrerequisites.push(prereqPathId)
        } else {
          completedPrerequisites.push(prereqPathId)
        }

        unlockConditions.push({
          type: 'path_completion',
          description: `Complete prerequisite path`,
          isMet: isPathCompleted || false,
          pathId: prereqPathId
        })
      }
    }

    // Check custom unlock conditions
    const customConditions = this.getCustomUnlockConditions(module)
    unlockConditions.push(...customConditions)

    // Check if module is already unlocked
    const isAlreadyUnlocked = unlockedModules.includes(module.id)
    
    // Check if all prerequisites are met
    const allPrerequisitesMet = missingPrerequisites.length === 0 && 
      unlockConditions.every(condition => condition.isMet)

    // Find blocking modules (modules that depend on this one)
    const blockingModules = path.modules
      .filter(m => m.prerequisites?.includes(module.id))
      .map(m => m.id)

    return {
      isUnlocked: isAlreadyUnlocked,
      missingPrerequisites,
      completedPrerequisites,
      blockingModules,
      canUnlock: allPrerequisitesMet && !isAlreadyUnlocked,
      unlockConditions
    }
  }

  // Check if a path can be unlocked
  checkPathPrerequisites(path: LearningPath): PrerequisiteCheck {
    const unlockedPaths = this.getUnlockedPaths()
    
    const missingPrerequisites: number[] = []
    const completedPrerequisites: number[] = []
    const unlockConditions: UnlockCondition[] = []

    // Check path prerequisites
    if (path.prerequisites && path.prerequisites.length > 0) {
      for (const prereqPathId of path.prerequisites) {
        const prereqPathProgress = progressService.getPathProgress(prereqPathId)
        const isPathCompleted = prereqPathProgress && prereqPathProgress.completionPercentage >= 100
        
        if (isPathCompleted) {
          completedPrerequisites.push(prereqPathId)
        } else {
          missingPrerequisites.push(prereqPathId)
        }

        unlockConditions.push({
          type: 'path_completion',
          description: `Complete prerequisite path`,
          isMet: isPathCompleted || false,
          pathId: prereqPathId
        })
      }
    }

    // Check if path is already unlocked
    const isAlreadyUnlocked = unlockedPaths.includes(path.id) || path.isUnlocked
    
    // Check if all prerequisites are met
    const allPrerequisitesMet = missingPrerequisites.length === 0 && 
      unlockConditions.every(condition => condition.isMet)

    return {
      isUnlocked: isAlreadyUnlocked,
      missingPrerequisites,
      completedPrerequisites,
      blockingModules: [],
      canUnlock: allPrerequisitesMet && !isAlreadyUnlocked,
      unlockConditions
    }
  }

  // Get custom unlock conditions for a module
  private getCustomUnlockConditions(module: LearningModule): UnlockCondition[] {
    const conditions: UnlockCondition[] = []
    const moduleProgress = progressService.getModuleProgress(module.id)

    // Score threshold condition
    if (module.difficulty === 'Advanced') {
      const hasHighScore = moduleProgress?.score && moduleProgress.score >= 80
      conditions.push({
        type: 'score_threshold',
        description: 'Achieve 80% or higher score on previous modules',
        isMet: hasHighScore || false,
        requiredValue: 80,
        currentValue: moduleProgress?.score || 0
      })
    }

    // Time spent condition
    if (module.estimatedMinutes > 60) {
      const totalTimeSpent = moduleProgress?.timeSpent || 0
      const requiredTime = Math.floor(module.estimatedMinutes * 0.5) // 50% of estimated time
      conditions.push({
        type: 'time_spent',
        description: `Spend at least ${requiredTime} minutes on previous modules`,
        isMet: totalTimeSpent >= requiredTime,
        requiredValue: requiredTime,
        currentValue: totalTimeSpent
      })
    }

    // Attempts condition
    if (module.type === 'quiz') {
      const attempts = moduleProgress?.attempts || 0
      const requiredAttempts = 1
      conditions.push({
        type: 'attempts',
        description: 'Complete at least one quiz attempt',
        isMet: attempts >= requiredAttempts,
        requiredValue: requiredAttempts,
        currentValue: attempts
      })
    }

    return conditions
  }

  // Unlock a module if prerequisites are met
  unlockModule(moduleId: number, path: LearningPath): ModuleUnlockResult {
    const module = path.modules.find(m => m.id === moduleId)
    if (!module) {
      throw new Error(`Module ${moduleId} not found in path ${path.id}`)
    }

    const prerequisites = this.checkModulePrerequisites(module, path)
    const unlockedModules = this.getUnlockedModules()
    
    const wasUnlocked = unlockedModules.includes(moduleId)
    let newlyUnlocked = false

    if (prerequisites.canUnlock && !wasUnlocked) {
      const updatedUnlocked = [...unlockedModules, moduleId]
      this.saveUnlockedModules(updatedUnlocked)
      newlyUnlocked = true
    }

    // Find next unlockable modules
    const nextUnlockableModules = this.getNextUnlockableModules(path)

    return {
      moduleId,
      wasUnlocked,
      newlyUnlocked,
      prerequisites,
      nextUnlockableModules
    }
  }

  // Unlock a path if prerequisites are met
  unlockPath(pathId: number, paths: LearningPath[]): PathUnlockResult {
    const path = paths.find(p => p.id === pathId)
    if (!path) {
      throw new Error(`Path ${pathId} not found`)
    }

    const prerequisites = this.checkPathPrerequisites(path)
    const unlockedPaths = this.getUnlockedPaths()
    
    const wasUnlocked = unlockedPaths.includes(pathId) || path.isUnlocked
    let newlyUnlocked = false

    if (prerequisites.canUnlock && !wasUnlocked) {
      const updatedUnlocked = [...unlockedPaths, pathId]
      this.saveUnlockedPaths(updatedUnlocked)
      newlyUnlocked = true
    }

    // Find next unlockable paths
    const nextUnlockablePaths = this.getNextUnlockablePaths(paths)

    return {
      pathId,
      wasUnlocked,
      newlyUnlocked,
      prerequisites,
      nextUnlockablePaths
    }
  }

  // Get next unlockable modules in a path
  getNextUnlockableModules(path: LearningPath): number[] {
    const unlockedModules = this.getUnlockedModules()
    const nextUnlockable: number[] = []

    for (const module of path.modules) {
      if (!unlockedModules.includes(module.id)) {
        const prerequisites = this.checkModulePrerequisites(module, path)
        if (prerequisites.canUnlock) {
          nextUnlockable.push(module.id)
        }
      }
    }

    return nextUnlockable
  }

  // Get next unlockable paths
  getNextUnlockablePaths(paths: LearningPath[]): number[] {
    const unlockedPaths = this.getUnlockedPaths()
    const nextUnlockable: number[] = []

    for (const path of paths) {
      if (!unlockedPaths.includes(path.id) && !path.isUnlocked) {
        const prerequisites = this.checkPathPrerequisites(path)
        if (prerequisites.canUnlock) {
          nextUnlockable.push(path.id)
        }
      }
    }

    return nextUnlockable
  }

  // Get completed modules across all paths
  private getCompletedModules(): number[] {
    const allProgress = progressService.getAllProgress()
    return Object.values(allProgress.moduleProgress)
      .filter(mp => mp.status === 'completed')
      .map(mp => mp.moduleId)
  }

  // Get unlocked paths from localStorage
  private getUnlockedPaths(): number[] {
    try {
      const data = localStorage.getItem('patissier-practice-unlocked-paths')
      return data ? JSON.parse(data) : []
    } catch (error) {
      console.error('Error loading unlocked paths:', error)
      return []
    }
  }

  // Save unlocked paths to localStorage
  private saveUnlockedPaths(paths: number[]): void {
    try {
      localStorage.setItem('patissier-practice-unlocked-paths', JSON.stringify(paths))
    } catch (error) {
      console.error('Error saving unlocked paths:', error)
    }
  }

  // Check if a module is unlocked
  isModuleUnlocked(moduleId: number): boolean {
    const unlockedModules = this.getUnlockedModules()
    return unlockedModules.includes(moduleId)
  }

  // Check if a path is unlocked
  isPathUnlocked(pathId: number, paths: LearningPath[]): boolean {
    const path = paths.find(p => p.id === pathId)
    if (!path) return false

    const unlockedPaths = this.getUnlockedPaths()
    return unlockedPaths.includes(pathId) || path.isUnlocked
  }

  // Get unlock progress for a module
  getModuleUnlockProgress(module: LearningModule, path: LearningPath): {
    progress: number
    total: number
    completed: number
    remaining: number
  } {
    const prerequisites = this.checkModulePrerequisites(module, path)
    const total = prerequisites.unlockConditions.length
    const completed = prerequisites.unlockConditions.filter(c => c.isMet).length
    const remaining = total - completed
    const progress = total > 0 ? (completed / total) * 100 : 100

    return {
      progress,
      total,
      completed,
      remaining
    }
  }

  // Get unlock progress for a path
  getPathUnlockProgress(path: LearningPath): {
    progress: number
    total: number
    completed: number
    remaining: number
  } {
    const prerequisites = this.checkPathPrerequisites(path)
    const total = prerequisites.unlockConditions.length
    const completed = prerequisites.unlockConditions.filter(c => c.isMet).length
    const remaining = total - completed
    const progress = total > 0 ? (completed / total) * 100 : 100

    return {
      progress,
      total,
      completed,
      remaining
    }
  }

  // Reset all unlocked modules and paths
  resetUnlocks(): void {
    try {
      localStorage.removeItem(this.storageKey)
      localStorage.removeItem('patissier-practice-unlocked-paths')
    } catch (error) {
      console.error('Error resetting unlocks:', error)
    }
  }

  // Auto-unlock modules based on completion
  autoUnlockModules(path: LearningPath): ModuleUnlockResult[] {
    const results: ModuleUnlockResult[] = []
    const nextUnlockable = this.getNextUnlockableModules(path)

    for (const moduleId of nextUnlockable) {
      try {
        const result = this.unlockModule(moduleId, path)
        results.push(result)
      } catch (error) {
        console.error(`Error auto-unlocking module ${moduleId}:`, error)
      }
    }

    return results
  }

  // Auto-unlock paths based on completion
  autoUnlockPaths(paths: LearningPath[]): PathUnlockResult[] {
    const results: PathUnlockResult[] = []
    const nextUnlockable = this.getNextUnlockablePaths(paths)

    for (const pathId of nextUnlockable) {
      try {
        const result = this.unlockPath(pathId, paths)
        results.push(result)
      } catch (error) {
        console.error(`Error auto-unlocking path ${pathId}:`, error)
      }
    }

    return results
  }
}

export const prerequisiteService = new PrerequisiteService()
export default prerequisiteService
