import { LearningPath, LearningModule } from "@/lib/types"
import { progressService } from "./progressService"
import { completionLogicService } from "./completionLogicService"

export interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  category: 'progress' | 'milestone' | 'skill' | 'streak' | 'social' | 'special'
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary'
  points: number
  requirements: AchievementRequirement[]
  unlockedAt?: string
  progress: number // 0-100
  isUnlocked: boolean
  isHidden: boolean
  dependencies?: string[] // Other achievement IDs that must be unlocked first
}

export interface AchievementRequirement {
  type: 'path_completion' | 'module_completion' | 'score_threshold' | 'time_spent' | 'streak_days' | 'technique_mastery' | 'category_mastery' | 'level_reached' | 'total_paths' | 'total_modules'
  value: any
  description: string
}

export interface Badge {
  id: string
  title: string
  description: string
  icon: string
  color: string
  category: 'completion' | 'progress' | 'skill' | 'milestone' | 'special'
  earnedAt?: string
  isEarned: boolean
  progress: number
  requirements: BadgeRequirement[]
}

export interface BadgeRequirement {
  type: 'path_completion' | 'module_completion' | 'score_threshold' | 'time_spent' | 'streak_days' | 'technique_mastery' | 'category_mastery' | 'level_reached' | 'total_paths' | 'total_modules'
  value: any
  description: string
}

export interface ProgressVisualization {
  overallProgress: number
  levelProgress: {
    [level: string]: number
  }
  categoryProgress: {
    [category: string]: number
  }
  skillProgress: {
    [skill: string]: number
  }
  achievements: Achievement[]
  badges: Badge[]
  streaks: {
    current: number
    longest: number
    lastActivity: string
  }
  statistics: {
    totalPathsCompleted: number
    totalModulesCompleted: number
    totalTimeSpent: number
    averageScore: number
    currentLevel: string
    nextLevelProgress: number
  }
}

export interface Level {
  id: string
  name: string
  description: string
  requiredPoints: number
  icon: string
  color: string
  benefits: string[]
  isUnlocked: boolean
  isCurrent: boolean
  isCompleted: boolean
}

class AchievementService {
  private storageKey = 'patissier-practice-achievements'
  private achievements: Achievement[] = []
  private badges: Badge[] = []
  private levels: Level[] = []

  constructor() {
    this.initializeAchievements()
    this.initializeBadges()
    this.initializeLevels()
  }

  // Initialize predefined achievements
  private initializeAchievements(): void {
    this.achievements = [
      // Progress Achievements
      {
        id: 'first_steps',
        title: 'First Steps',
        description: 'Complete your first learning path',
        icon: '👶',
        category: 'progress',
        rarity: 'common',
        points: 10,
        requirements: [{ type: 'path_completion', value: 1, description: 'Complete 1 learning path' }],
        progress: 0,
        isUnlocked: false,
        isHidden: false
      },
      {
        id: 'path_master',
        title: 'Path Master',
        description: 'Complete 10 learning paths',
        icon: '🎯',
        category: 'progress',
        rarity: 'uncommon',
        points: 50,
        requirements: [{ type: 'path_completion', value: 10, description: 'Complete 10 learning paths' }],
        progress: 0,
        isUnlocked: false,
        isHidden: false,
        dependencies: ['first_steps']
      },
      {
        id: 'path_legend',
        title: 'Path Legend',
        description: 'Complete 50 learning paths',
        icon: '👑',
        category: 'progress',
        rarity: 'legendary',
        points: 500,
        requirements: [{ type: 'path_completion', value: 50, description: 'Complete 50 learning paths' }],
        progress: 0,
        isUnlocked: false,
        isHidden: false,
        dependencies: ['path_master']
      },

      // Milestone Achievements
      {
        id: 'module_master',
        title: 'Module Master',
        description: 'Complete 100 modules',
        icon: '📚',
        category: 'milestone',
        rarity: 'rare',
        points: 100,
        requirements: [{ type: 'module_completion', value: 100, description: 'Complete 100 modules' }],
        progress: 0,
        isUnlocked: false,
        isHidden: false
      },
      {
        id: 'time_investor',
        title: 'Time Investor',
        description: 'Spend 100 hours learning',
        icon: '⏰',
        category: 'milestone',
        rarity: 'epic',
        points: 200,
        requirements: [{ type: 'time_spent', value: 360000, description: 'Spend 100 hours learning' }], // 100 hours in minutes
        progress: 0,
        isUnlocked: false,
        isHidden: false
      },

      // Skill Achievements
      {
        id: 'beginner_baker',
        title: 'Beginner Baker',
        description: 'Complete all beginner level paths',
        icon: '🥖',
        category: 'skill',
        rarity: 'common',
        points: 25,
        requirements: [{ type: 'level_reached', value: 'Beginner', description: 'Complete all beginner level paths' }],
        progress: 0,
        isUnlocked: false,
        isHidden: false
      },
      {
        id: 'intermediate_chef',
        title: 'Intermediate Chef',
        description: 'Complete all intermediate level paths',
        icon: '🍰',
        category: 'skill',
        rarity: 'uncommon',
        points: 75,
        requirements: [{ type: 'level_reached', value: 'Intermediate', description: 'Complete all intermediate level paths' }],
        progress: 0,
        isUnlocked: false,
        isHidden: false,
        dependencies: ['beginner_baker']
      },
      {
        id: 'master_patissier',
        title: 'Master Patissier',
        description: 'Complete all advanced level paths',
        icon: '🎂',
        category: 'skill',
        rarity: 'legendary',
        points: 300,
        requirements: [{ type: 'level_reached', value: 'Advanced', description: 'Complete all advanced level paths' }],
        progress: 0,
        isUnlocked: false,
        isHidden: false,
        dependencies: ['intermediate_chef']
      },

      // Streak Achievements
      {
        id: 'dedicated_learner',
        title: 'Dedicated Learner',
        description: 'Maintain a 7-day learning streak',
        icon: '🔥',
        category: 'streak',
        rarity: 'common',
        points: 20,
        requirements: [{ type: 'streak_days', value: 7, description: 'Maintain a 7-day learning streak' }],
        progress: 0,
        isUnlocked: false,
        isHidden: false
      },
      {
        id: 'streak_master',
        title: 'Streak Master',
        description: 'Maintain a 30-day learning streak',
        icon: '⚡',
        category: 'streak',
        rarity: 'rare',
        points: 100,
        requirements: [{ type: 'streak_days', value: 30, description: 'Maintain a 30-day learning streak' }],
        progress: 0,
        isUnlocked: false,
        isHidden: false,
        dependencies: ['dedicated_learner']
      },

      // Special Achievements
      {
        id: 'perfectionist',
        title: 'Perfectionist',
        description: 'Achieve 100% score on 10 modules',
        icon: '💯',
        category: 'special',
        rarity: 'epic',
        points: 150,
        requirements: [{ type: 'score_threshold', value: { score: 100, count: 10 }, description: 'Achieve 100% score on 10 modules' }],
        progress: 0,
        isUnlocked: false,
        isHidden: false
      },
      {
        id: 'early_bird',
        title: 'Early Bird',
        description: 'Complete a path in half the estimated time',
        icon: '🐦',
        category: 'special',
        rarity: 'uncommon',
        points: 50,
        requirements: [{ type: 'time_spent', value: 'half_estimated', description: 'Complete a path in half the estimated time' }],
        progress: 0,
        isUnlocked: false,
        isHidden: true
      }
    ]
  }

  // Initialize predefined badges
  private initializeBadges(): void {
    this.badges = [
      // Completion Badges
      {
        id: 'path_completer',
        title: 'Path Completer',
        description: 'Complete a learning path',
        icon: '🏁',
        color: 'bg-green-500',
        category: 'completion',
        isEarned: false,
        progress: 0,
        requirements: [{ type: 'path_completion', value: 1, description: 'Complete 1 learning path' }]
      },
      {
        id: 'module_completer',
        title: 'Module Completer',
        description: 'Complete a learning module',
        icon: '✅',
        color: 'bg-blue-500',
        category: 'completion',
        isEarned: false,
        progress: 0,
        requirements: [{ type: 'module_completion', value: 1, description: 'Complete 1 learning module' }]
      },

      // Progress Badges
      {
        id: 'progress_tracker',
        title: 'Progress Tracker',
        description: 'Reach 50% completion on any path',
        icon: '📊',
        color: 'bg-yellow-500',
        category: 'progress',
        isEarned: false,
        progress: 0,
        requirements: [{ type: 'score_threshold', value: { score: 50, type: 'path' }, description: 'Reach 50% completion on any path' }]
      },
      {
        id: 'almost_there',
        title: 'Almost There',
        description: 'Reach 90% completion on any path',
        icon: '🎯',
        color: 'bg-orange-500',
        category: 'progress',
        isEarned: false,
        progress: 0,
        requirements: [{ type: 'score_threshold', value: { score: 90, type: 'path' }, description: 'Reach 90% completion on any path' }]
      },

      // Skill Badges
      {
        id: 'technique_master',
        title: 'Technique Master',
        description: 'Master 5 different techniques',
        icon: '🎨',
        color: 'bg-purple-500',
        category: 'skill',
        isEarned: false,
        progress: 0,
        requirements: [{ type: 'technique_mastery', value: 5, description: 'Master 5 different techniques' }]
      },
      {
        id: 'category_expert',
        title: 'Category Expert',
        description: 'Complete all paths in a category',
        icon: '🏆',
        color: 'bg-red-500',
        category: 'skill',
        isEarned: false,
        progress: 0,
        requirements: [{ type: 'category_mastery', value: 1, description: 'Complete all paths in a category' }]
      },

      // Milestone Badges
      {
        id: 'century_club',
        title: 'Century Club',
        description: 'Complete 100 modules',
        icon: '💯',
        color: 'bg-indigo-500',
        category: 'milestone',
        isEarned: false,
        progress: 0,
        requirements: [{ type: 'module_completion', value: 100, description: 'Complete 100 modules' }]
      },
      {
        id: 'time_traveler',
        title: 'Time Traveler',
        description: 'Spend 24 hours learning',
        icon: '⏰',
        color: 'bg-teal-500',
        category: 'milestone',
        isEarned: false,
        progress: 0,
        requirements: [{ type: 'time_spent', value: 1440, description: 'Spend 24 hours learning' }] // 24 hours in minutes
      },

      // Special Badges
      {
        id: 'speed_demon',
        title: 'Speed Demon',
        description: 'Complete a path in record time',
        icon: '⚡',
        color: 'bg-yellow-400',
        category: 'special',
        isEarned: false,
        progress: 0,
        requirements: [{ type: 'time_spent', value: 'record_time', description: 'Complete a path in record time' }]
      },
      {
        id: 'perfectionist_badge',
        title: 'Perfectionist',
        description: 'Achieve perfect scores on 5 modules',
        icon: '💎',
        color: 'bg-pink-500',
        category: 'special',
        isEarned: false,
        progress: 0,
        requirements: [{ type: 'score_threshold', value: { score: 100, count: 5 }, description: 'Achieve perfect scores on 5 modules' }]
      }
    ]
  }

  // Initialize user levels
  private initializeLevels(): void {
    this.levels = [
      {
        id: 'novice',
        name: 'Novice',
        description: 'Just starting your pastry journey',
        requiredPoints: 0,
        icon: '🌱',
        color: 'bg-gray-500',
        benefits: ['Access to beginner paths', 'Basic progress tracking'],
        isUnlocked: true,
        isCurrent: true,
        isCompleted: false
      },
      {
        id: 'apprentice',
        name: 'Apprentice',
        description: 'Learning the fundamentals',
        requiredPoints: 100,
        icon: '🎓',
        color: 'bg-green-500',
        benefits: ['Access to intermediate paths', 'Advanced progress tracking', 'Achievement notifications'],
        isUnlocked: false,
        isCurrent: false,
        isCompleted: false
      },
      {
        id: 'journeyman',
        name: 'Journeyman',
        description: 'Developing your skills',
        requiredPoints: 500,
        icon: '🔧',
        color: 'bg-blue-500',
        benefits: ['Access to advanced paths', 'Detailed analytics', 'Custom learning plans'],
        isUnlocked: false,
        isCurrent: false,
        isCompleted: false
      },
      {
        id: 'craftsman',
        name: 'Craftsman',
        description: 'Mastering your craft',
        requiredPoints: 1000,
        icon: '⚒️',
        color: 'bg-purple-500',
        benefits: ['Access to expert paths', 'Mentoring features', 'Custom achievements'],
        isUnlocked: false,
        isCurrent: false,
        isCompleted: false
      },
      {
        id: 'master',
        name: 'Master',
        description: 'A true pastry master',
        requiredPoints: 2500,
        icon: '👑',
        color: 'bg-yellow-500',
        benefits: ['Access to all content', 'Teaching tools', 'Exclusive content'],
        isUnlocked: false,
        isCurrent: false,
        isCompleted: false
      }
    ]
  }

  // Get all achievements
  getAchievements(): Achievement[] {
    return this.achievements
  }

  // Get all badges
  getBadges(): Badge[] {
    return this.badges
  }

  // Get all levels
  getLevels(): Level[] {
    return this.levels
  }

  // Check and update achievement progress
  checkAchievements(paths: LearningPath[]): Achievement[] {
    const allProgress = progressService.getAllProgress()
    const completionStats = completionLogicService.getCompletionStats()

    this.achievements.forEach(achievement => {
      if (achievement.isUnlocked) return

      // Check dependencies
      if (achievement.dependencies) {
        const allDependenciesUnlocked = achievement.dependencies.every(depId => 
          this.achievements.find(a => a.id === depId)?.isUnlocked
        )
        if (!allDependenciesUnlocked) return
      }

      // Check requirements
      const progress = this.calculateAchievementProgress(achievement, allProgress, completionStats, paths)
      achievement.progress = progress

      if (progress >= 100) {
        achievement.isUnlocked = true
        achievement.unlockedAt = new Date().toISOString()
        this.saveAchievements()
      }
    })

    return this.achievements
  }

  // Check and update badge progress
  checkBadges(paths: LearningPath[]): Badge[] {
    const allProgress = progressService.getAllProgress()
    const completionStats = completionLogicService.getCompletionStats()

    this.badges.forEach(badge => {
      if (badge.isEarned) return

      const progress = this.calculateBadgeProgress(badge, allProgress, completionStats, paths)
      badge.progress = progress

      if (progress >= 100) {
        badge.isEarned = true
        badge.earnedAt = new Date().toISOString()
        this.saveBadges()
      }
    })

    return this.badges
  }

  // Calculate achievement progress
  private calculateAchievementProgress(achievement: Achievement, allProgress: any, completionStats: any, paths: LearningPath[]): number {
    let totalProgress = 0

    achievement.requirements.forEach(requirement => {
      const requirementProgress = this.calculateRequirementProgress(requirement, allProgress, completionStats, paths)
      totalProgress += requirementProgress
    })

    return Math.min(totalProgress / achievement.requirements.length, 100)
  }

  // Calculate badge progress
  private calculateBadgeProgress(badge: Badge, allProgress: any, completionStats: any, paths: LearningPath[]): number {
    let totalProgress = 0

    badge.requirements.forEach(requirement => {
      const requirementProgress = this.calculateRequirementProgress(requirement, allProgress, completionStats, paths)
      totalProgress += requirementProgress
    })

    return Math.min(totalProgress / badge.requirements.length, 100)
  }

  // Calculate individual requirement progress
  private calculateRequirementProgress(requirement: AchievementRequirement | BadgeRequirement, allProgress: any, completionStats: any, paths: LearningPath[]): number {
    switch (requirement.type) {
      case 'path_completion':
        const completedPaths = Object.values(allProgress.pathProgress).filter((p: any) => p.completionPercentage >= 100).length
        return Math.min((completedPaths / requirement.value) * 100, 100)

      case 'module_completion':
        const completedModules = Object.values(allProgress.moduleProgress).filter((m: any) => m.status === 'completed').length
        return Math.min((completedModules / requirement.value) * 100, 100)

      case 'score_threshold':
        if (typeof requirement.value === 'object' && requirement.value.score && requirement.value.count) {
          const perfectScores = Object.values(allProgress.moduleProgress).filter((m: any) => m.score >= requirement.value.score).length
          return Math.min((perfectScores / requirement.value.count) * 100, 100)
        } else if (typeof requirement.value === 'object' && requirement.value.score && requirement.value.type === 'path') {
          const highScorePaths = Object.values(allProgress.pathProgress).filter((p: any) => p.completionPercentage >= requirement.value.score).length
          return highScorePaths > 0 ? 100 : 0
        }
        return 0

      case 'time_spent':
        if (requirement.value === 'half_estimated') {
          // This would need more complex logic to check if any path was completed in half time
          return 0
        } else if (requirement.value === 'record_time') {
          // This would need more complex logic to check for record times
          return 0
        } else {
          const totalTimeMinutes = completionStats.totalTimeSpent
          return Math.min((totalTimeMinutes / requirement.value) * 100, 100)
        }

      case 'streak_days':
        return Math.min((completionStats.currentStreak / requirement.value) * 100, 100)

      case 'technique_mastery':
        // This would need technique data - for now return 0
        return 0

      case 'category_mastery':
        // This would need category completion data - for now return 0
        return 0

      case 'level_reached':
        // This would need level completion data - for now return 0
        return 0

      case 'total_paths':
        const totalPaths = Object.keys(allProgress.pathProgress).length
        return Math.min((totalPaths / requirement.value) * 100, 100)

      case 'total_modules':
        const totalModules = Object.keys(allProgress.moduleProgress).length
        return Math.min((totalModules / requirement.value) * 100, 100)

      default:
        return 0
    }
  }

  // Get progress visualization data
  getProgressVisualization(paths: LearningPath[]): ProgressVisualization {
    const allProgress = progressService.getAllProgress()
    const completionStats = completionLogicService.getCompletionStats()
    
    // Update achievements and badges
    this.checkAchievements(paths)
    this.checkBadges(paths)

    // Calculate overall progress
    const totalPaths = paths.length
    const completedPaths = Object.values(allProgress.pathProgress).filter((p: any) => p.completionPercentage >= 100).length
    const overallProgress = totalPaths > 0 ? (completedPaths / totalPaths) * 100 : 0

    // Calculate level progress
    const levelProgress: { [level: string]: number } = {}
    const levels = ['Beginner', 'Intermediate', 'Advanced']
    levels.forEach(level => {
      const levelPaths = paths.filter(p => p.level === level)
      const completedLevelPaths = levelPaths.filter(p => {
        const progress = allProgress.pathProgress[p.id]
        return progress && progress.completionPercentage >= 100
      })
      levelProgress[level] = levelPaths.length > 0 ? (completedLevelPaths.length / levelPaths.length) * 100 : 0
    })

    // Calculate category progress
    const categoryProgress: { [category: string]: number } = {}
    const categories = ['Cakes & Desserts', 'Bread & Viennoiserie', 'Chocolate & Confectionery', 'Fundamentals', 'Advanced Techniques']
    categories.forEach(category => {
      const categoryPaths = paths.filter(p => {
        const title = p.title.toLowerCase()
        if (category === 'Cakes & Desserts') return title.includes('cake') || title.includes('dessert')
        if (category === 'Bread & Viennoiserie') return title.includes('bread') || title.includes('viennoiserie')
        if (category === 'Chocolate & Confectionery') return title.includes('chocolate') || title.includes('confectionery')
        if (category === 'Fundamentals') return title.includes('basic') || title.includes('fundamental')
        if (category === 'Advanced Techniques') return title.includes('advanced') || title.includes('master')
        return false
      })
      const completedCategoryPaths = categoryPaths.filter(p => {
        const progress = allProgress.pathProgress[p.id]
        return progress && progress.completionPercentage >= 100
      })
      categoryProgress[category] = categoryPaths.length > 0 ? (completedCategoryPaths.length / categoryPaths.length) * 100 : 0
    })

    // Calculate current level
    const totalPoints = this.achievements.filter(a => a.isUnlocked).reduce((sum, a) => sum + a.points, 0)
    const currentLevel = this.levels.find(l => l.isCurrent) || this.levels[0]
    const nextLevel = this.levels.find(l => l.requiredPoints > totalPoints) || this.levels[this.levels.length - 1]
    const nextLevelProgress = nextLevel ? ((totalPoints - currentLevel.requiredPoints) / (nextLevel.requiredPoints - currentLevel.requiredPoints)) * 100 : 100

    return {
      overallProgress,
      levelProgress,
      categoryProgress,
      skillProgress: {}, // This would be calculated from technique data
      achievements: this.achievements,
      badges: this.badges,
      streaks: {
        current: completionStats.currentStreak,
        longest: completionStats.longestStreak,
        lastActivity: completionStats.lastActivity
      },
      statistics: {
        totalPathsCompleted: completedPaths,
        totalModulesCompleted: Object.values(allProgress.moduleProgress).filter((m: any) => m.status === 'completed').length,
        totalTimeSpent: completionStats.totalTimeSpent,
        averageScore: completionStats.averageScore,
        currentLevel: currentLevel.name,
        nextLevelProgress
      }
    }
  }

  // Save achievements to localStorage
  private saveAchievements(): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.achievements))
    } catch (error) {
      console.error('Error saving achievements:', error)
    }
  }

  // Save badges to localStorage
  private saveBadges(): void {
    try {
      localStorage.setItem('patissier-practice-badges', JSON.stringify(this.badges))
    } catch (error) {
      console.error('Error saving badges:', error)
    }
  }

  // Load achievements from localStorage
  loadAchievements(): void {
    try {
      const data = localStorage.getItem(this.storageKey)
      if (data) {
        const savedAchievements = JSON.parse(data)
        this.achievements = this.achievements.map(achievement => {
          const saved = savedAchievements.find((a: Achievement) => a.id === achievement.id)
          return saved ? { ...achievement, ...saved } : achievement
        })
      }
    } catch (error) {
      console.error('Error loading achievements:', error)
    }
  }

  // Load badges from localStorage
  loadBadges(): void {
    try {
      const data = localStorage.getItem('patissier-practice-badges')
      if (data) {
        const savedBadges = JSON.parse(data)
        this.badges = this.badges.map(badge => {
          const saved = savedBadges.find((b: Badge) => b.id === badge.id)
          return saved ? { ...badge, ...saved } : badge
        })
      }
    } catch (error) {
      console.error('Error loading badges:', error)
    }
  }

  // Reset all achievements and badges
  resetAll(): void {
    this.achievements.forEach(achievement => {
      achievement.isUnlocked = false
      achievement.unlockedAt = undefined
      achievement.progress = 0
    })
    this.badges.forEach(badge => {
      badge.isEarned = false
      badge.earnedAt = undefined
      badge.progress = 0
    })
    this.saveAchievements()
    this.saveBadges()
  }
}

export const achievementService = new AchievementService()
export default achievementService
