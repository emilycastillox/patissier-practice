import { AIAnalysisResult } from './aiService'
import { FeedbackHistoryEntry } from './feedbackHistoryService'

export interface LearningRecommendation {
  id: string
  type: 'technique' | 'recipe' | 'course' | 'practice'
  title: string
  description: string
  priority: 'high' | 'medium' | 'low'
  category: string
  estimatedTime: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  resources: {
    videos?: string[]
    articles?: string[]
    tutorials?: string[]
  }
  prerequisites?: string[]
  expectedImprovement: string
}

export interface PersonalizedLearningPath {
  userId: string
  currentLevel: 'beginner' | 'intermediate' | 'advanced'
  focusAreas: string[]
  recommendations: LearningRecommendation[]
  nextSteps: string[]
  progressGoals: {
    shortTerm: string[]
    longTerm: string[]
  }
}

export class LearningRecommendationService {
  private static instance: LearningRecommendationService
  private storageKey = 'patissier-learning-recommendations'

  private constructor() {}

  public static getInstance(): LearningRecommendationService {
    if (!LearningRecommendationService.instance) {
      LearningRecommendationService.instance = new LearningRecommendationService()
    }
    return LearningRecommendationService.instance
  }

  // Generate recommendations based on AI analysis
  generateRecommendations(
    analysisResult: AIAnalysisResult,
    feedbackHistory: FeedbackHistoryEntry[] = []
  ): LearningRecommendation[] {
    const recommendations: LearningRecommendation[] = []
    const analysis = analysisResult.analysis
    const category = analysisResult.category.toLowerCase()

    // Analyze weaknesses and generate targeted recommendations
    Object.entries(analysis).forEach(([aspect, data]) => {
      if (data.score < 70) {
        const recommendation = this.createRecommendationForAspect(aspect, data.score, category)
        if (recommendation) {
          recommendations.push(recommendation)
        }
      }
    })

    // Add category-specific recommendations
    const categoryRecommendations = this.getCategoryRecommendations(category, analysisResult.score)
    recommendations.push(...categoryRecommendations)

    // Add technique-specific recommendations based on low scores
    if (analysisResult.score < 80) {
      const techniqueRecommendations = this.getTechniqueRecommendations(analysisResult)
      recommendations.push(...techniqueRecommendations)
    }

    // Sort by priority and score impact
    return recommendations
      .sort((a, b) => {
        const priorityOrder = { high: 3, medium: 2, low: 1 }
        return priorityOrder[b.priority] - priorityOrder[a.priority]
      })
      .slice(0, 5) // Return top 5 recommendations
  }

  // Create personalized learning path
  createPersonalizedLearningPath(
    analysisResult: AIAnalysisResult,
    feedbackHistory: FeedbackHistoryEntry[]
  ): PersonalizedLearningPath {
    const recommendations = this.generateRecommendations(analysisResult, feedbackHistory)
    const currentLevel = this.determineCurrentLevel(analysisResult.score, feedbackHistory)
    const focusAreas = this.identifyFocusAreas(analysisResult, feedbackHistory)

    return {
      userId: 'current-user', // In a real app, this would be the actual user ID
      currentLevel,
      focusAreas,
      recommendations,
      nextSteps: this.generateNextSteps(recommendations),
      progressGoals: this.generateProgressGoals(focusAreas, currentLevel)
    }
  }

  // Get recommendations for specific aspect
  private createRecommendationForAspect(
    aspect: string,
    score: number,
    category: string
  ): LearningRecommendation | null {
    const aspectRecommendations = {
      color: {
        title: 'Master Color Theory for Pastries',
        description: 'Learn how to create beautiful, consistent colors in your pastries',
        type: 'technique' as const,
        priority: score < 50 ? 'high' as const : 'medium' as const,
        category: 'Color Theory',
        estimatedTime: '2-3 hours',
        difficulty: 'beginner' as const,
        resources: {
          videos: ['Color Theory Basics', 'Food Coloring Techniques'],
          articles: ['Understanding Color in Baking', 'Natural Food Coloring Guide']
        },
        expectedImprovement: 'Improve color consistency and visual appeal'
      },
      shape: {
        title: 'Perfect Your Shaping Techniques',
        description: 'Develop consistent and professional shaping skills',
        type: 'technique' as const,
        priority: score < 50 ? 'high' as const : 'medium' as const,
        category: 'Shaping',
        estimatedTime: '3-4 hours',
        difficulty: 'intermediate' as const,
        resources: {
          videos: ['Basic Shaping Techniques', 'Advanced Shaping Methods'],
          tutorials: ['Step-by-Step Shaping Guide']
        },
        expectedImprovement: 'Achieve uniform shapes and professional appearance'
      },
      texture: {
        title: 'Master Texture Control',
        description: 'Learn to control and perfect pastry textures',
        type: 'technique' as const,
        priority: score < 50 ? 'high' as const : 'medium' as const,
        category: 'Texture',
        estimatedTime: '4-5 hours',
        difficulty: 'intermediate' as const,
        resources: {
          videos: ['Texture Control Techniques', 'Troubleshooting Texture Issues'],
          articles: ['Understanding Pastry Textures', 'Common Texture Problems']
        },
        expectedImprovement: 'Achieve desired texture consistency'
      },
      presentation: {
        title: 'Elevate Your Presentation Skills',
        description: 'Learn professional presentation and plating techniques',
        type: 'technique' as const,
        priority: score < 60 ? 'high' as const : 'medium' as const,
        category: 'Presentation',
        estimatedTime: '2-3 hours',
        difficulty: 'beginner' as const,
        resources: {
          videos: ['Plating Techniques', 'Garnishing Basics'],
          tutorials: ['Presentation Masterclass']
        },
        expectedImprovement: 'Create visually stunning presentations'
      }
    }

    const config = aspectRecommendations[aspect as keyof typeof aspectRecommendations]
    if (!config) return null

    return {
      id: `${aspect}-${Date.now()}`,
      ...config
    }
  }

  // Get category-specific recommendations
  private getCategoryRecommendations(category: string, score: number): LearningRecommendation[] {
    const categoryRecommendations = {
      croissant: [
        {
          id: 'croissant-lamination',
          type: 'technique' as const,
          title: 'Master Lamination Technique',
          description: 'Perfect the art of creating flaky, layered croissants',
          priority: score < 70 ? 'high' as const : 'medium' as const,
          category: 'Lamination',
          estimatedTime: '6-8 hours',
          difficulty: 'advanced' as const,
          resources: {
            videos: ['Lamination Masterclass', 'Troubleshooting Lamination'],
            articles: ['Lamination Science', 'Common Lamination Mistakes']
          },
          expectedImprovement: 'Achieve perfect flaky layers'
        }
      ],
      macaron: [
        {
          id: 'macaron-technique',
          type: 'technique' as const,
          title: 'Perfect Macaron Technique',
          description: 'Master the delicate art of making perfect macarons',
          priority: score < 75 ? 'high' as const : 'medium' as const,
          category: 'Macaron Making',
          estimatedTime: '8-10 hours',
          difficulty: 'advanced' as const,
          resources: {
            videos: ['Macaron Masterclass', 'Macaron Troubleshooting'],
            tutorials: ['Step-by-Step Macaron Guide']
          },
          expectedImprovement: 'Achieve consistent macaron shells and feet'
        }
      ],
      cake: [
        {
          id: 'cake-decorating',
          type: 'technique' as const,
          title: 'Advanced Cake Decorating',
          description: 'Learn professional cake decorating techniques',
          priority: score < 70 ? 'high' as const : 'medium' as const,
          category: 'Cake Decorating',
          estimatedTime: '10-12 hours',
          difficulty: 'intermediate' as const,
          resources: {
            videos: ['Cake Decorating Basics', 'Advanced Techniques'],
            tutorials: ['Complete Cake Decorating Course']
          },
          expectedImprovement: 'Create professional-quality decorated cakes'
        }
      ]
    }

    return categoryRecommendations[category as keyof typeof categoryRecommendations] || []
  }

  // Get technique-specific recommendations
  private getTechniqueRecommendations(analysisResult: AIAnalysisResult): LearningRecommendation[] {
    const recommendations: LearningRecommendation[] = []

    if (analysisResult.score < 60) {
      recommendations.push({
        id: 'fundamentals-review',
        type: 'course',
        title: 'Review Baking Fundamentals',
        description: 'Strengthen your foundation with essential baking techniques',
        priority: 'high',
        category: 'Fundamentals',
        estimatedTime: '12-15 hours',
        difficulty: 'beginner',
        resources: {
          videos: ['Baking Fundamentals Series'],
          articles: ['Essential Baking Techniques'],
          tutorials: ['Complete Beginner Course']
        },
        expectedImprovement: 'Build strong foundation for advanced techniques'
      })
    }

    if (analysisResult.score >= 60 && analysisResult.score < 80) {
      recommendations.push({
        id: 'intermediate-skills',
        type: 'course',
        title: 'Intermediate Pastry Skills',
        description: 'Develop intermediate-level pastry techniques and skills',
        priority: 'medium',
        category: 'Intermediate Skills',
        estimatedTime: '15-20 hours',
        difficulty: 'intermediate',
        resources: {
          videos: ['Intermediate Techniques Series'],
          tutorials: ['Intermediate Pastry Course']
        },
        expectedImprovement: 'Advance to intermediate skill level'
      })
    }

    return recommendations
  }

  // Determine current skill level
  private determineCurrentLevel(score: number, history: FeedbackHistoryEntry[]): 'beginner' | 'intermediate' | 'advanced' {
    if (history.length === 0) {
      return score >= 80 ? 'intermediate' : 'beginner'
    }

    const avgScore = history.reduce((sum, entry) => sum + entry.analysisResult.score, 0) / history.length
    
    if (avgScore >= 85) return 'advanced'
    if (avgScore >= 70) return 'intermediate'
    return 'beginner'
  }

  // Identify focus areas based on analysis and history
  private identifyFocusAreas(analysisResult: AIAnalysisResult, history: FeedbackHistoryEntry[]): string[] {
    const focusAreas: string[] = []
    const analysis = analysisResult.analysis

    Object.entries(analysis).forEach(([aspect, data]) => {
      if (data.score < 70) {
        focusAreas.push(aspect)
      }
    })

    // Add category-specific focus areas
    if (analysisResult.category) {
      focusAreas.push(analysisResult.category)
    }

    return Array.from(new Set(focusAreas)) // Remove duplicates
  }

  // Generate next steps
  private generateNextSteps(recommendations: LearningRecommendation[]): string[] {
    return recommendations
      .filter(rec => rec.priority === 'high')
      .slice(0, 3)
      .map(rec => `Start with: ${rec.title}`)
  }

  // Generate progress goals
  private generateProgressGoals(
    focusAreas: string[],
    level: 'beginner' | 'intermediate' | 'advanced'
  ): { shortTerm: string[]; longTerm: string[] } {
    const shortTerm = focusAreas.slice(0, 2).map(area => `Improve ${area} technique`)
    const longTerm = [
      `Master ${level} level techniques`,
      'Develop consistent quality across all aspects',
      'Build professional presentation skills'
    ]

    return { shortTerm, longTerm }
  }

  // Save recommendations to storage
  saveRecommendations(recommendations: LearningRecommendation[]): void {
    localStorage.setItem(this.storageKey, JSON.stringify(recommendations))
  }

  // Load recommendations from storage
  loadRecommendations(): LearningRecommendation[] {
    try {
      const stored = localStorage.getItem(this.storageKey)
      return stored ? JSON.parse(stored) : []
    } catch (error) {
      console.error('Error loading recommendations:', error)
      return []
    }
  }

  // Mark recommendation as completed
  markRecommendationCompleted(id: string): void {
    const recommendations = this.loadRecommendations()
    const updated = recommendations.map(rec => 
      rec.id === id ? { ...rec, completed: true } : rec
    )
    this.saveRecommendations(updated)
  }
}

export const learningRecommendationService = LearningRecommendationService.getInstance()
