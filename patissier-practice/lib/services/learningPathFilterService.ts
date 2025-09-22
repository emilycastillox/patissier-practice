import { LearningPath, LearningPathLevel, DifficultyLevel } from "@/lib/types"

export interface LearningPathFilters {
  search?: string
  skillLevel?: LearningPathLevel
  difficulty?: DifficultyLevel
  duration?: string
  durationRange?: {
    min: number // in weeks
    max: number // in weeks
  }
  categories?: string[]
  tags?: string[]
  rating?: {
    min: number
    max: number
  }
  studentCount?: {
    min: number
    max: number
  }
  completionRate?: {
    min: number
    max: number
  }
  isUnlocked?: boolean
  isCompleted?: boolean
  isInProgress?: boolean
  isFeatured?: boolean
  isRecommended?: boolean
  instructor?: string
  createdAt?: {
    from: Date
    to: Date
  }
  lastUpdated?: {
    from: Date
    to: Date
  }
}

export interface FilterOption {
  value: string
  label: string
  count: number
  isSelected: boolean
}

export interface FilterGroup {
  key: keyof LearningPathFilters
  label: string
  type: 'select' | 'multiselect' | 'range' | 'date' | 'boolean' | 'search'
  options?: FilterOption[]
  min?: number
  max?: number
  step?: number
}

export interface FilterStats {
  totalPaths: number
  filteredPaths: number
  filterGroups: {
    [key: string]: {
      total: number
      selected: number
    }
  }
}

class LearningPathFilterService {
  // Parse duration string to weeks
  private parseDurationToWeeks(duration: string): number {
    const durationLower = duration.toLowerCase()
    
    if (durationLower.includes('week')) {
      const match = durationLower.match(/(\d+)\s*week/)
      return match ? parseInt(match[1]) : 0
    }
    
    if (durationLower.includes('month')) {
      const match = durationLower.match(/(\d+)\s*month/)
      return match ? parseInt(match[1]) * 4 : 0
    }
    
    if (durationLower.includes('day')) {
      const match = durationLower.match(/(\d+)\s*day/)
      return match ? Math.ceil(parseInt(match[1]) / 7) : 0
    }
    
    return 0
  }

  // Convert weeks to duration string
  private weeksToDuration(weeks: number): string {
    if (weeks < 1) {
      return `${Math.ceil(weeks * 7)} days`
    } else if (weeks < 4) {
      return `${weeks} week${weeks > 1 ? 's' : ''}`
    } else {
      const months = Math.floor(weeks / 4)
      const remainingWeeks = weeks % 4
      if (remainingWeeks === 0) {
        return `${months} month${months > 1 ? 's' : ''}`
      } else {
        return `${months} month${months > 1 ? 's' : ''} ${remainingWeeks} week${remainingWeeks > 1 ? 's' : ''}`
      }
    }
  }

  // Filter learning paths based on criteria
  filterPaths(paths: LearningPath[], filters: LearningPathFilters): LearningPath[] {
    return paths.filter(path => {
      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase()
        const matchesSearch = 
          path.title.toLowerCase().includes(searchLower) ||
          path.description.toLowerCase().includes(searchLower) ||
          path.shortDescription.toLowerCase().includes(searchLower) ||
          path.tags.some(tag => tag.toLowerCase().includes(searchLower)) ||
          path.instructor?.name.toLowerCase().includes(searchLower)
        
        if (!matchesSearch) return false
      }

      // Skill level filter
      if (filters.skillLevel && path.level !== filters.skillLevel) {
        return false
      }

      // Difficulty filter
      if (filters.difficulty && path.difficulty !== filters.difficulty) {
        return false
      }

      // Duration filter
      if (filters.duration && !path.duration.includes(filters.duration)) {
        return false
      }

      // Duration range filter
      if (filters.durationRange) {
        const pathDurationWeeks = this.parseDurationToWeeks(path.duration)
        if (pathDurationWeeks < filters.durationRange.min || pathDurationWeeks > filters.durationRange.max) {
          return false
        }
      }

      // Categories filter
      if (filters.categories && filters.categories.length > 0) {
        const pathCategory = this.extractCategoryFromPath(path)
        if (!pathCategory || !filters.categories.includes(pathCategory)) {
          return false
        }
      }

      // Tags filter
      if (filters.tags && filters.tags.length > 0) {
        const hasMatchingTag = filters.tags.some(tag => path.tags.includes(tag))
        if (!hasMatchingTag) return false
      }

      // Rating filter
      if (filters.rating) {
        if (path.averageRating < filters.rating.min || path.averageRating > filters.rating.max) {
          return false
        }
      }

      // Student count filter
      if (filters.studentCount) {
        if (path.totalStudents < filters.studentCount.min || path.totalStudents > filters.studentCount.max) {
          return false
        }
      }

      // Completion rate filter
      if (filters.completionRate) {
        if (path.completionRate < filters.completionRate.min || path.completionRate > filters.completionRate.max) {
          return false
        }
      }

      // Unlocked filter
      if (filters.isUnlocked !== undefined) {
        if (path.isUnlocked !== filters.isUnlocked) return false
      }

      // Completed filter
      if (filters.isCompleted !== undefined) {
        // This would need progress data - for now, return true
        // In a real implementation, you'd check against progress service
      }

      // In progress filter
      if (filters.isInProgress !== undefined) {
        // This would need progress data - for now, return true
        // In a real implementation, you'd check against progress service
      }

      // Featured filter
      if (filters.isFeatured !== undefined) {
        if (path.isFeatured !== filters.isFeatured) return false
      }

      // Recommended filter
      if (filters.isRecommended !== undefined) {
        if (path.isRecommended !== filters.isRecommended) return false
      }

      // Instructor filter
      if (filters.instructor) {
        if (!path.instructor?.name.toLowerCase().includes(filters.instructor.toLowerCase())) {
          return false
        }
      }

      // Created date filter
      if (filters.createdAt) {
        const pathCreatedAt = new Date(path.createdAt)
        if (pathCreatedAt < filters.createdAt.from || pathCreatedAt > filters.createdAt.to) {
          return false
        }
      }

      // Last updated filter
      if (filters.lastUpdated) {
        const pathUpdatedAt = new Date(path.updatedAt)
        if (pathUpdatedAt < filters.lastUpdated.from || pathUpdatedAt > filters.lastUpdated.to) {
          return false
        }
      }

      return true
    })
  }

  // Extract category from path
  private extractCategoryFromPath(path: LearningPath): string | null {
    const title = path.title.toLowerCase()
    
    if (title.includes('cake') || title.includes('dessert')) return 'Cakes & Desserts'
    if (title.includes('bread') || title.includes('viennoiserie')) return 'Bread & Viennoiserie'
    if (title.includes('chocolate') || title.includes('confectionery')) return 'Chocolate & Confectionery'
    if (title.includes('basic') || title.includes('fundamental')) return 'Fundamentals'
    if (title.includes('advanced') || title.includes('master')) return 'Advanced Techniques'
    
    return null
  }

  // Get available filter options
  getFilterOptions(paths: LearningPath[]): FilterGroup[] {
    const categories = new Set<string>()
    const tags = new Set<string>()
    const instructors = new Set<string>()
    const durations = new Set<string>()
    const skillLevels = new Set<LearningPathLevel>()
    const difficulties = new Set<DifficultyLevel>()
    
    let minRating = 5
    let maxRating = 0
    let minStudents = Infinity
    let maxStudents = 0
    let minCompletionRate = 100
    let maxCompletionRate = 0
    let minDurationWeeks = Infinity
    let maxDurationWeeks = 0

    paths.forEach(path => {
      // Categories
      const category = this.extractCategoryFromPath(path)
      if (category) categories.add(category)

      // Tags
      path.tags.forEach(tag => tags.add(tag))

      // Instructors
      if (path.instructor?.name) instructors.add(path.instructor.name)

      // Durations
      durations.add(path.duration)

      // Skill levels
      skillLevels.add(path.level)

      // Difficulties
      difficulties.add(path.difficulty)

      // Rating range
      minRating = Math.min(minRating, path.averageRating)
      maxRating = Math.max(maxRating, path.averageRating)

      // Student count range
      minStudents = Math.min(minStudents, path.totalStudents)
      maxStudents = Math.max(maxStudents, path.totalStudents)

      // Completion rate range
      minCompletionRate = Math.min(minCompletionRate, path.completionRate)
      maxCompletionRate = Math.max(maxCompletionRate, path.completionRate)

      // Duration range
      const durationWeeks = this.parseDurationToWeeks(path.duration)
      minDurationWeeks = Math.min(minDurationWeeks, durationWeeks)
      maxDurationWeeks = Math.max(maxDurationWeeks, durationWeeks)
    })

    return [
      {
        key: 'search',
        label: 'Search',
        type: 'search'
      },
      {
        key: 'skillLevel',
        label: 'Skill Level',
        type: 'select',
        options: Array.from(skillLevels).map(level => ({
          value: level,
          label: level,
          count: paths.filter(p => p.level === level).length,
          isSelected: false
        }))
      },
      {
        key: 'difficulty',
        label: 'Difficulty',
        type: 'select',
        options: Array.from(difficulties).map(difficulty => ({
          value: difficulty,
          label: difficulty,
          count: paths.filter(p => p.difficulty === difficulty).length,
          isSelected: false
        }))
      },
      {
        key: 'duration',
        label: 'Duration',
        type: 'select',
        options: Array.from(durations).map(duration => ({
          value: duration,
          label: duration,
          count: paths.filter(p => p.duration === duration).length,
          isSelected: false
        }))
      },
      {
        key: 'durationRange',
        label: 'Duration Range',
        type: 'range',
        min: minDurationWeeks,
        max: maxDurationWeeks,
        step: 0.5
      },
      {
        key: 'categories',
        label: 'Categories',
        type: 'multiselect',
        options: Array.from(categories).map(category => ({
          value: category,
          label: category,
          count: paths.filter(p => this.extractCategoryFromPath(p) === category).length,
          isSelected: false
        }))
      },
      {
        key: 'tags',
        label: 'Tags',
        type: 'multiselect',
        options: Array.from(tags).map(tag => ({
          value: tag,
          label: tag,
          count: paths.filter(p => p.tags.includes(tag)).length,
          isSelected: false
        }))
      },
      {
        key: 'rating',
        label: 'Rating',
        type: 'range',
        min: Math.floor(minRating),
        max: Math.ceil(maxRating),
        step: 0.1
      },
      {
        key: 'studentCount',
        label: 'Student Count',
        type: 'range',
        min: minStudents,
        max: maxStudents,
        step: 100
      },
      {
        key: 'completionRate',
        label: 'Completion Rate',
        type: 'range',
        min: minCompletionRate,
        max: maxCompletionRate,
        step: 1
      },
      {
        key: 'isUnlocked',
        label: 'Unlocked Only',
        type: 'boolean'
      },
      {
        key: 'isFeatured',
        label: 'Featured Only',
        type: 'boolean'
      },
      {
        key: 'isRecommended',
        label: 'Recommended Only',
        type: 'boolean'
      },
      {
        key: 'instructor',
        label: 'Instructor',
        type: 'select',
        options: Array.from(instructors).map(instructor => ({
          value: instructor,
          label: instructor,
          count: paths.filter(p => p.instructor?.name === instructor).length,
          isSelected: false
        }))
      }
    ]
  }

  // Get filter statistics
  getFilterStats(paths: LearningPath[], filters: LearningPathFilters): FilterStats {
    const filteredPaths = this.filterPaths(paths, filters)
    const filterGroups = this.getFilterOptions(paths)

    const stats: FilterStats = {
      totalPaths: paths.length,
      filteredPaths: filteredPaths.length,
      filterGroups: {}
    }

    filterGroups.forEach(group => {
      if (group.options) {
        stats.filterGroups[group.key] = {
          total: group.options.reduce((sum, option) => sum + option.count, 0),
          selected: group.options.filter(option => option.isSelected).length
        }
      }
    })

    return stats
  }

  // Clear all filters
  clearFilters(): LearningPathFilters {
    return {}
  }

  // Get default filters
  getDefaultFilters(): LearningPathFilters {
    return {
      rating: { min: 0, max: 5 },
      studentCount: { min: 0, max: Infinity },
      completionRate: { min: 0, max: 100 }
    }
  }

  // Validate filters
  validateFilters(filters: LearningPathFilters): { isValid: boolean; errors: string[] } {
    const errors: string[] = []

    // Validate rating range
    if (filters.rating) {
      if (filters.rating.min < 0 || filters.rating.min > 5) {
        errors.push('Rating minimum must be between 0 and 5')
      }
      if (filters.rating.max < 0 || filters.rating.max > 5) {
        errors.push('Rating maximum must be between 0 and 5')
      }
      if (filters.rating.min > filters.rating.max) {
        errors.push('Rating minimum cannot be greater than maximum')
      }
    }

    // Validate student count range
    if (filters.studentCount) {
      if (filters.studentCount.min < 0) {
        errors.push('Student count minimum cannot be negative')
      }
      if (filters.studentCount.min > filters.studentCount.max) {
        errors.push('Student count minimum cannot be greater than maximum')
      }
    }

    // Validate completion rate range
    if (filters.completionRate) {
      if (filters.completionRate.min < 0 || filters.completionRate.min > 100) {
        errors.push('Completion rate minimum must be between 0 and 100')
      }
      if (filters.completionRate.max < 0 || filters.completionRate.max > 100) {
        errors.push('Completion rate maximum must be between 0 and 100')
      }
      if (filters.completionRate.min > filters.completionRate.max) {
        errors.push('Completion rate minimum cannot be greater than maximum')
      }
    }

    // Validate duration range
    if (filters.durationRange) {
      if (filters.durationRange.min < 0) {
        errors.push('Duration minimum cannot be negative')
      }
      if (filters.durationRange.min > filters.durationRange.max) {
        errors.push('Duration minimum cannot be greater than maximum')
      }
    }

    // Validate date ranges
    if (filters.createdAt) {
      if (filters.createdAt.from > filters.createdAt.to) {
        errors.push('Created date from cannot be after to date')
      }
    }

    if (filters.lastUpdated) {
      if (filters.lastUpdated.from > filters.lastUpdated.to) {
        errors.push('Last updated from cannot be after to date')
      }
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }

  // Export filters
  exportFilters(filters: LearningPathFilters): string {
    return JSON.stringify(filters, null, 2)
  }

  // Import filters
  importFilters(data: string): LearningPathFilters | null {
    try {
      const parsed = JSON.parse(data)
      const validation = this.validateFilters(parsed)
      
      if (validation.isValid) {
        return parsed
      } else {
        console.error('Invalid filter data:', validation.errors)
        return null
      }
    } catch (error) {
      console.error('Error importing filters:', error)
      return null
    }
  }
}

export const learningPathFilterService = new LearningPathFilterService()
export default learningPathFilterService
