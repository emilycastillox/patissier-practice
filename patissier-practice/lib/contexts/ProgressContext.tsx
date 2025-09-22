"use client"

import React, { createContext, useContext, useState, useEffect, useCallback } from "react"
import { Technique, TechniqueProgress, LearningPath, UserProgress } from "@/lib/types"

interface ProgressContextType {
  userProgress: UserProgress
  techniqueProgress: Record<number, TechniqueProgress>
  learningPathProgress: Record<number, number> // pathId -> completion percentage
  updateTechniqueProgress: (techniqueId: number, progress: Partial<TechniqueProgress>) => void
  markTechniqueComplete: (techniqueId: number) => void
  markTechniqueIncomplete: (techniqueId: number) => void
  getTechniqueProgress: (techniqueId: number) => TechniqueProgress
  getOverallProgress: () => number
  getCategoryProgress: (category: string) => number
  getLearningPathProgress: (pathId: number) => number
  updateLearningPathProgress: (pathId: number, progress: number) => void
  resetProgress: () => void
  exportProgress: () => string
  importProgress: (data: string) => boolean
}

const ProgressContext = createContext<ProgressContextType | undefined>(undefined)

const STORAGE_KEYS = {
  USER_PROGRESS: 'patissier-practice-user-progress',
  TECHNIQUE_PROGRESS: 'patissier-practice-technique-progress',
  LEARNING_PATH_PROGRESS: 'patissier-practice-learning-path-progress'
}

export function ProgressProvider({ children }: { children: React.ReactNode }) {
  const [userProgress, setUserProgress] = useState<UserProgress>({
    totalTechniquesCompleted: 0,
    totalTimeSpent: 0,
    currentStreak: 0,
    longestStreak: 0,
    lastActivityDate: null,
    achievements: [],
    level: 1,
    experience: 0,
    nextLevelExperience: 100
  })

  const [techniqueProgress, setTechniqueProgress] = useState<Record<number, TechniqueProgress>>({})
  const [learningPathProgress, setLearningPathProgress] = useState<Record<number, number>>({})

  // Load data from localStorage on mount
  useEffect(() => {
    const loadFromStorage = () => {
      try {
        const userProgressData = localStorage.getItem(STORAGE_KEYS.USER_PROGRESS)
        const techniqueProgressData = localStorage.getItem(STORAGE_KEYS.TECHNIQUE_PROGRESS)
        const learningPathProgressData = localStorage.getItem(STORAGE_KEYS.LEARNING_PATH_PROGRESS)
        
        if (userProgressData) {
          setUserProgress(JSON.parse(userProgressData))
        }
        if (techniqueProgressData) {
          setTechniqueProgress(JSON.parse(techniqueProgressData))
        }
        if (learningPathProgressData) {
          setLearningPathProgress(JSON.parse(learningPathProgressData))
        }
      } catch (error) {
        console.error('Error loading progress from localStorage:', error)
      }
    }

    loadFromStorage()
  }, [])

  // Save to localStorage whenever state changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.USER_PROGRESS, JSON.stringify(userProgress))
    } catch (error) {
      console.error('Error saving user progress to localStorage:', error)
    }
  }, [userProgress])

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.TECHNIQUE_PROGRESS, JSON.stringify(techniqueProgress))
    } catch (error) {
      console.error('Error saving technique progress to localStorage:', error)
    }
  }, [techniqueProgress])

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.LEARNING_PATH_PROGRESS, JSON.stringify(learningPathProgress))
    } catch (error) {
      console.error('Error saving learning path progress to localStorage:', error)
    }
  }, [learningPathProgress])

  // Update technique progress
  const updateTechniqueProgress = useCallback((techniqueId: number, progress: Partial<TechniqueProgress>) => {
    setTechniqueProgress(prev => {
      const currentProgress = prev[techniqueId] || {
        techniqueId,
        isCompleted: false,
        completionPercentage: 0,
        timeSpent: 0,
        lastAccessed: new Date().toISOString(),
        stepsCompleted: [],
        notes: '',
        rating: 0,
        difficulty: 'Beginner' as const
      }

      const updatedProgress = {
        ...currentProgress,
        ...progress,
        lastAccessed: new Date().toISOString()
      }

      return {
        ...prev,
        [techniqueId]: updatedProgress
      }
    })

    // Update user progress
    setUserProgress(prev => {
      const newTotalTimeSpent = prev.totalTimeSpent + (progress.timeSpent || 0)
      const newExperience = prev.experience + (progress.isCompleted ? 10 : 1)
      
      // Check for level up
      let newLevel = prev.level
      let newNextLevelExperience = prev.nextLevelExperience
      if (newExperience >= prev.nextLevelExperience) {
        newLevel += 1
        newNextLevelExperience = newLevel * 100
      }

      return {
        ...prev,
        totalTimeSpent: newTotalTimeSpent,
        experience: newExperience,
        level: newLevel,
        nextLevelExperience: newNextLevelExperience,
        lastActivityDate: new Date().toISOString()
      }
    })
  }, [])

  // Mark technique as complete
  const markTechniqueComplete = useCallback((techniqueId: number) => {
    updateTechniqueProgress(techniqueId, {
      isCompleted: true,
      completionPercentage: 100,
      completedAt: new Date().toISOString()
    })

    // Update total completed count
    setUserProgress(prev => ({
      ...prev,
      totalTechniquesCompleted: prev.totalTechniquesCompleted + 1
    }))
  }, [updateTechniqueProgress])

  // Mark technique as incomplete
  const markTechniqueIncomplete = useCallback((techniqueId: number) => {
    updateTechniqueProgress(techniqueId, {
      isCompleted: false,
      completionPercentage: 0
    })

    // Update total completed count
    setUserProgress(prev => ({
      ...prev,
      totalTechniquesCompleted: Math.max(0, prev.totalTechniquesCompleted - 1)
    }))
  }, [updateTechniqueProgress])

  // Get technique progress
  const getTechniqueProgress = useCallback((techniqueId: number): TechniqueProgress => {
    return techniqueProgress[techniqueId] || {
      techniqueId,
      isCompleted: false,
      completionPercentage: 0,
      timeSpent: 0,
      lastAccessed: new Date().toISOString(),
      stepsCompleted: [],
      notes: '',
      rating: 0,
      difficulty: 'Beginner'
    }
  }, [techniqueProgress])

  // Get overall progress
  const getOverallProgress = useCallback(() => {
    const totalTechniques = Object.keys(techniqueProgress).length
    if (totalTechniques === 0) return 0
    
    const completedTechniques = Object.values(techniqueProgress).filter(p => p.isCompleted).length
    return Math.round((completedTechniques / totalTechniques) * 100)
  }, [techniqueProgress])

  // Get category progress
  const getCategoryProgress = useCallback((category: string) => {
    // This would need to be implemented with technique data
    // For now, return a placeholder
    return 0
  }, [])

  // Get learning path progress
  const getLearningPathProgress = useCallback((pathId: number) => {
    return learningPathProgress[pathId] || 0
  }, [learningPathProgress])

  // Update learning path progress
  const updateLearningPathProgress = useCallback((pathId: number, progress: number) => {
    setLearningPathProgress(prev => ({
      ...prev,
      [pathId]: Math.min(100, Math.max(0, progress))
    }))
  }, [])

  // Reset all progress
  const resetProgress = useCallback(() => {
    setUserProgress({
      totalTechniquesCompleted: 0,
      totalTimeSpent: 0,
      currentStreak: 0,
      longestStreak: 0,
      lastActivityDate: null,
      achievements: [],
      level: 1,
      experience: 0,
      nextLevelExperience: 100
    })
    setTechniqueProgress({})
    setLearningPathProgress({})
  }, [])

  // Export progress data
  const exportProgress = useCallback(() => {
    const data = {
      userProgress,
      techniqueProgress,
      learningPathProgress,
      exportedAt: new Date().toISOString()
    }
    return JSON.stringify(data, null, 2)
  }, [userProgress, techniqueProgress, learningPathProgress])

  // Import progress data
  const importProgress = useCallback((data: string) => {
    try {
      const importedData = JSON.parse(data)
      
      if (importedData.userProgress) {
        setUserProgress(importedData.userProgress)
      }
      if (importedData.techniqueProgress) {
        setTechniqueProgress(importedData.techniqueProgress)
      }
      if (importedData.learningPathProgress) {
        setLearningPathProgress(importedData.learningPathProgress)
      }
      
      return true
    } catch (error) {
      console.error('Error importing progress data:', error)
      return false
    }
  }, [])

  const value: ProgressContextType = {
    userProgress,
    techniqueProgress,
    learningPathProgress,
    updateTechniqueProgress,
    markTechniqueComplete,
    markTechniqueIncomplete,
    getTechniqueProgress,
    getOverallProgress,
    getCategoryProgress,
    getLearningPathProgress,
    updateLearningPathProgress,
    resetProgress,
    exportProgress,
    importProgress,
  }

  return (
    <ProgressContext.Provider value={value}>
      {children}
    </ProgressContext.Provider>
  )
}

export function useProgress() {
  const context = useContext(ProgressContext)
  if (context === undefined) {
    throw new Error('useProgress must be used within a ProgressProvider')
  }
  return context
}

export default ProgressContext
