"use client"

import React, { createContext, useContext, useState, useEffect, useCallback } from "react"
import { LearningPath, LearningModule, LearningPathProgress, LearningPathLevel } from "@/lib/types"
import { progressService } from "@/lib/services/progressService"
import { prerequisiteService } from "@/lib/services/prerequisiteService"
import { completionLogicService } from "@/lib/services/completionLogicService"

interface LearningPathContextType {
  currentPath: LearningPath | null
  currentModule: LearningModule | null
  pathProgress: LearningPathProgress | null
  availablePaths: LearningPath[]
  unlockedModules: number[]
  completedModules: number[]
  setCurrentPath: (path: LearningPath | null) => void
  setCurrentModule: (module: LearningModule | null) => void
  navigateToModule: (moduleId: number) => boolean
  navigateToPath: (pathId: number) => boolean
  navigateToLevel: (level: LearningPathLevel) => LearningPath[]
  completeModule: (moduleId: number) => void
  unlockModule: (moduleId: number) => void
  getModuleProgress: (moduleId: number) => number
  getPathProgress: (pathId: number) => number
  canAccessModule: (moduleId: number) => boolean
  canAccessPath: (pathId: number) => boolean
  getNextModule: () => LearningModule | null
  getPreviousModule: () => LearningModule | null
  getRecommendedPaths: () => LearningPath[]
  getPathsByLevel: (level: LearningPathLevel) => LearningPath[]
  searchPaths: (query: string) => LearningPath[]
  filterPaths: (filters: LearningPathFilters) => LearningPath[]
}

interface LearningPathFilters {
  level?: LearningPathLevel
  difficulty?: string
  duration?: string
  tags?: string[]
  unlocked?: boolean
  completed?: boolean
  search?: string
}

const LearningPathContext = createContext<LearningPathContextType | undefined>(undefined)

const STORAGE_KEYS = {
  CURRENT_PATH: 'patissier-practice-current-path',
  CURRENT_MODULE: 'patissier-practice-current-module',
  PATH_PROGRESS: 'patissier-practice-path-progress',
  UNLOCKED_MODULES: 'patissier-practice-unlocked-modules',
  COMPLETED_MODULES: 'patissier-practice-completed-modules'
}

export function LearningPathProvider({ children }: { children: React.ReactNode }) {
  const [currentPath, setCurrentPath] = useState<LearningPath | null>(null)
  const [currentModule, setCurrentModule] = useState<LearningModule | null>(null)
  const [pathProgress, setPathProgress] = useState<LearningPathProgress | null>(null)
  const [availablePaths, setAvailablePaths] = useState<LearningPath[]>([])
  const [unlockedModules, setUnlockedModules] = useState<number[]>([])
  const [completedModules, setCompletedModules] = useState<number[]>([])

  // Load data from localStorage on mount
  useEffect(() => {
    const loadFromStorage = () => {
      try {
        const currentPathData = localStorage.getItem(STORAGE_KEYS.CURRENT_PATH)
        const currentModuleData = localStorage.getItem(STORAGE_KEYS.CURRENT_MODULE)
        const pathProgressData = localStorage.getItem(STORAGE_KEYS.PATH_PROGRESS)
        const unlockedModulesData = localStorage.getItem(STORAGE_KEYS.UNLOCKED_MODULES)
        const completedModulesData = localStorage.getItem(STORAGE_KEYS.COMPLETED_MODULES)
        
        if (currentPathData) {
          setCurrentPath(JSON.parse(currentPathData))
        }
        if (currentModuleData) {
          setCurrentModule(JSON.parse(currentModuleData))
        }
        if (pathProgressData) {
          setPathProgress(JSON.parse(pathProgressData))
        }
        if (unlockedModulesData) {
          setUnlockedModules(JSON.parse(unlockedModulesData))
        }
        if (completedModulesData) {
          setCompletedModules(JSON.parse(completedModulesData))
        }
      } catch (error) {
        console.error('Error loading learning path data from localStorage:', error)
      }
    }

    loadFromStorage()
  }, [])

  // Save to localStorage whenever state changes
  useEffect(() => {
    try {
      if (currentPath) {
        localStorage.setItem(STORAGE_KEYS.CURRENT_PATH, JSON.stringify(currentPath))
      }
    } catch (error) {
      console.error('Error saving current path to localStorage:', error)
    }
  }, [currentPath])

  useEffect(() => {
    try {
      if (currentModule) {
        localStorage.setItem(STORAGE_KEYS.CURRENT_MODULE, JSON.stringify(currentModule))
      }
    } catch (error) {
      console.error('Error saving current module to localStorage:', error)
    }
  }, [currentModule])

  useEffect(() => {
    try {
      if (pathProgress) {
        localStorage.setItem(STORAGE_KEYS.PATH_PROGRESS, JSON.stringify(pathProgress))
      }
    } catch (error) {
      console.error('Error saving path progress to localStorage:', error)
    }
  }, [pathProgress])

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.UNLOCKED_MODULES, JSON.stringify(unlockedModules))
    } catch (error) {
      console.error('Error saving unlocked modules to localStorage:', error)
    }
  }, [unlockedModules])

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.COMPLETED_MODULES, JSON.stringify(completedModules))
    } catch (error) {
      console.error('Error saving completed modules to localStorage:', error)
    }
  }, [completedModules])

  // Navigate to a specific module
  const navigateToModule = useCallback((moduleId: number): boolean => {
    if (!currentPath) return false

    const module = currentPath.modules.find(m => m.id === moduleId)
    if (!module) return false

    // Check if module is unlocked
    if (!canAccessModule(moduleId)) {
      console.warn(`Module ${moduleId} is not unlocked`)
      return false
    }

    setCurrentModule(module)
    
    // Update path progress
    if (pathProgress) {
      setPathProgress({
        ...pathProgress,
        currentModule: moduleId,
        lastAccessedAt: new Date().toISOString()
      })
    }

    return true
  }, [currentPath, pathProgress])

  // Navigate to a specific path
  const navigateToPath = useCallback((pathId: number): boolean => {
    const path = availablePaths.find(p => p.id === pathId)
    if (!path) return false

    // Check if path is unlocked
    if (!canAccessPath(pathId)) {
      console.warn(`Path ${pathId} is not unlocked`)
      return false
    }

    setCurrentPath(path)
    
    // Set first unlocked module as current
    const firstUnlockedModule = path.modules.find(m => 
      m.isUnlocked && unlockedModules.includes(m.id)
    )
    if (firstUnlockedModule) {
      setCurrentModule(firstUnlockedModule)
    }

    // Initialize or update path progress
    const existingProgress = pathProgress?.pathId === pathId ? pathProgress : {
      pathId,
      userId: 'current-user',
      status: 'in-progress' as const,
      completedModules: [],
      currentModule: firstUnlockedModule?.id || path.modules[0]?.id || 0,
      startedAt: new Date().toISOString(),
      timeSpent: 0,
      score: 0,
      lastAccessedAt: new Date().toISOString(),
      streak: 0,
      achievements: [],
      notes: '',
      bookmarked: false
    }

    setPathProgress(existingProgress)

    return true
  }, [availablePaths, pathProgress, unlockedModules])

  // Navigate to a specific level
  const navigateToLevel = useCallback((level: LearningPathLevel): LearningPath[] => {
    return getPathsByLevel(level)
  }, [])

  // Complete a module
  const completeModule = useCallback((moduleId: number, score?: number) => {
    if (!currentPath) return

    // Handle completion through completion logic service
    const result = completionLogicService.handleModuleCompletion(moduleId, currentPath.id, score)
    
    // Update local state
    if (!completedModules.includes(moduleId)) {
      setCompletedModules(prev => [...prev, moduleId])
    }

    // Update path progress
    if (pathProgress && !pathProgress.completedModules.includes(moduleId)) {
      setPathProgress(prev => {
        if (!prev) return prev
        return {
          ...prev,
          completedModules: [...prev.completedModules, moduleId],
          lastAccessedAt: new Date().toISOString()
        }
      })
    }

    // Update unlocked modules based on completion logic
    if (result.newlyUnlockedModules.length > 0) {
      setUnlockedModules(prev => [...prev, ...result.newlyUnlockedModules])
    }

    // Handle notifications and achievements
    if (result.notifications.length > 0) {
      // In a real app, you might want to show these notifications
      console.log('Completion notifications:', result.notifications)
    }

    if (result.achievements.length > 0) {
      // In a real app, you might want to show achievement notifications
      console.log('New achievements:', result.achievements)
    }
  }, [completedModules, pathProgress, currentPath])

  // Unlock a module
  const unlockModule = useCallback((moduleId: number) => {
    if (!unlockedModules.includes(moduleId)) {
      setUnlockedModules(prev => [...prev, moduleId])
    }
  }, [unlockedModules])

  // Get module progress
  const getModuleProgress = useCallback((moduleId: number): number => {
    const progress = progressService.getModuleProgress(moduleId)
    return progress ? progress.completionPercentage : 0
  }, [])

  // Get path progress
  const getPathProgress = useCallback((pathId: number): number => {
    const path = availablePaths.find(p => p.id === pathId)
    if (!path) return 0
    
    return progressService.calculatePathCompletion(path)
  }, [availablePaths])

  // Check if module can be accessed
  const canAccessModule = useCallback((moduleId: number): boolean => {
    return unlockedModules.includes(moduleId)
  }, [unlockedModules])

  // Check if path can be accessed
  const canAccessPath = useCallback((pathId: number): boolean => {
    const path = availablePaths.find(p => p.id === pathId)
    if (!path) return false
    
    // Check prerequisites
    if (path.prerequisites && path.prerequisites.length > 0) {
      return path.prerequisites.every(prereqId => 
        completedModules.some(moduleId => {
          const module = availablePaths
            .flatMap(p => p.modules)
            .find(m => m.id === moduleId)
          return module?.pathId === prereqId
        })
      )
    }
    
    return path.isUnlocked
  }, [availablePaths, completedModules])

  // Get next module
  const getNextModule = useCallback((): LearningModule | null => {
    if (!currentPath || !currentModule) return null

    const currentIndex = currentPath.modules.findIndex(m => m.id === currentModule.id)
    if (currentIndex === -1) return null

    const nextModule = currentPath.modules[currentIndex + 1]
    return nextModule && canAccessModule(nextModule.id) ? nextModule : null
  }, [currentPath, currentModule, canAccessModule])

  // Get previous module
  const getPreviousModule = useCallback((): LearningModule | null => {
    if (!currentPath || !currentModule) return null

    const currentIndex = currentPath.modules.findIndex(m => m.id === currentModule.id)
    if (currentIndex <= 0) return null

    return currentPath.modules[currentIndex - 1]
  }, [currentPath, currentModule])

  // Get recommended paths
  const getRecommendedPaths = useCallback((): LearningPath[] => {
    return availablePaths.filter(path => path.isRecommended)
  }, [availablePaths])

  // Get paths by level
  const getPathsByLevel = useCallback((level: LearningPathLevel): LearningPath[] => {
    return availablePaths.filter(path => path.level === level)
  }, [availablePaths])

  // Search paths
  const searchPaths = useCallback((query: string): LearningPath[] => {
    if (!query.trim()) return availablePaths

    const lowercaseQuery = query.toLowerCase()
    return availablePaths.filter(path => 
      path.title.toLowerCase().includes(lowercaseQuery) ||
      path.description.toLowerCase().includes(lowercaseQuery) ||
      path.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery))
    )
  }, [availablePaths])

  // Filter paths
  const filterPaths = useCallback((filters: LearningPathFilters): LearningPath[] => {
    let filtered = availablePaths

    if (filters.level) {
      filtered = filtered.filter(path => path.level === filters.level)
    }

    if (filters.difficulty) {
      filtered = filtered.filter(path => path.difficulty === filters.difficulty)
    }

    if (filters.duration) {
      filtered = filtered.filter(path => path.duration.includes(filters.duration!))
    }

    if (filters.tags && filters.tags.length > 0) {
      filtered = filtered.filter(path => 
        filters.tags!.some(tag => path.tags.includes(tag))
      )
    }

    if (filters.unlocked !== undefined) {
      filtered = filtered.filter(path => 
        filters.unlocked ? canAccessPath(path.id) : !canAccessPath(path.id)
      )
    }

    if (filters.completed !== undefined) {
      filtered = filtered.filter(path => {
        const progress = getPathProgress(path.id)
        return filters.completed ? progress === 100 : progress < 100
      })
    }

    if (filters.search) {
      filtered = searchPaths(filters.search)
    }

    return filtered
  }, [availablePaths, canAccessPath, getPathProgress, searchPaths])

  const value: LearningPathContextType = {
    currentPath,
    currentModule,
    pathProgress,
    availablePaths,
    unlockedModules,
    completedModules,
    setCurrentPath,
    setCurrentModule,
    navigateToModule,
    navigateToPath,
    navigateToLevel,
    completeModule,
    unlockModule,
    getModuleProgress,
    getPathProgress,
    canAccessModule,
    canAccessPath,
    getNextModule,
    getPreviousModule,
    getRecommendedPaths,
    getPathsByLevel,
    searchPaths,
    filterPaths,
  }

  return (
    <LearningPathContext.Provider value={value}>
      {children}
    </LearningPathContext.Provider>
  )
}

export function useLearningPath() {
  const context = useContext(LearningPathContext)
  if (context === undefined) {
    throw new Error('useLearningPath must be used within a LearningPathProvider')
  }
  return context
}

export default LearningPathContext
