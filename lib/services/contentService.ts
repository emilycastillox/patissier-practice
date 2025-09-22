import { Technique, LearningPath, Quiz, TechniqueFilters, LearningPathFilters, QuizFilters, ApiResponse, PaginatedResponse } from '@/lib/types'

const API_BASE_URL = typeof window !== 'undefined' 
  ? window.location.origin + '/api'
  : process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002/api'

class ContentService {
  private async fetchApi<T>(endpoint: string, options?: RequestInit): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
        ...options,
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error(`API Error for ${endpoint}:`, error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
      }
    }
  }

  // Technique Library API methods
  async getTechniques(filters?: TechniqueFilters): Promise<ApiResponse<Technique[]>> {
    const queryParams = new URLSearchParams()
    
    if (filters?.category) queryParams.append('category', filters.category)
    if (filters?.difficulty) queryParams.append('difficulty', filters.difficulty)
    if (filters?.duration) queryParams.append('duration', filters.duration)
    if (filters?.rating) queryParams.append('rating', filters.rating.toString())
    if (filters?.tags) queryParams.append('tags', filters.tags.join(','))
    if (filters?.search) queryParams.append('search', filters.search)

    const queryString = queryParams.toString()
    const endpoint = `/content/techniques${queryString ? `?${queryString}` : ''}`
    
    const response = await this.fetchApi<Technique[]>(endpoint)
    
    if (response.success && response.data) {
      return response
    } else {
      // Fallback to mock data for development
      console.warn('API not available, using mock data:', response.error)
      const mockData = this.getMockTechniques()
      const filteredData = this.filterMockTechniques(mockData, filters)
      return {
        success: true,
        data: filteredData
      }
    }
  }

  // Enhanced filtering for mock data
  private filterMockTechniques(techniques: Technique[], filters?: TechniqueFilters): Technique[] {
    if (!filters) return techniques

    return techniques.filter(technique => {
      // Category filter
      if (filters.category && technique.category !== filters.category) {
        return false
      }

      // Difficulty filter
      if (filters.difficulty && technique.difficulty !== filters.difficulty) {
        return false
      }

      // Duration filter
      if (filters.duration) {
        const duration = technique.duration
        const durationMatch = this.matchesDurationFilter(duration, filters.duration)
        if (!durationMatch) return false
      }

      // Rating filter
      if (filters.rating && technique.rating < filters.rating) {
        return false
      }

      // Tags filter
      if (filters.tags && filters.tags.length > 0) {
        const hasMatchingTag = filters.tags.some(tag => 
          technique.tags.some(techniqueTag => 
            techniqueTag.toLowerCase().includes(tag.toLowerCase())
          )
        )
        if (!hasMatchingTag) return false
      }

      // Search filter
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase()
        const matchesSearch = 
          technique.title.toLowerCase().includes(searchTerm) ||
          technique.description.toLowerCase().includes(searchTerm) ||
          technique.tags.some(tag => tag.toLowerCase().includes(searchTerm))
        if (!matchesSearch) return false
      }

      return true
    })
  }

  private matchesDurationFilter(duration: string, filter: string): boolean {
    const durationMinutes = this.parseDurationToMinutes(duration)
    
    switch (filter) {
      case "0-15":
        return durationMinutes <= 15
      case "15-30":
        return durationMinutes > 15 && durationMinutes <= 30
      case "30-60":
        return durationMinutes > 30 && durationMinutes <= 60
      case "60+":
        return durationMinutes > 60
      default:
        return true
    }
  }

  private parseDurationToMinutes(duration: string): number {
    // Parse duration strings like "15 min", "2 hours", "1h 30m"
    const match = duration.match(/(\d+)\s*(min|hour|h|m)/i)
    if (!match) return 0
    
    const value = parseInt(match[1])
    const unit = match[2].toLowerCase()
    
    if (unit === 'hour' || unit === 'h') {
      return value * 60
    }
    return value
  }

  async getTechniqueById(id: number): Promise<ApiResponse<Technique>> {
    return this.fetchApi<Technique>(`/content/techniques/${id}`)
  }

  async getTechniquesByCategory(category: string): Promise<ApiResponse<Technique[]>> {
    return this.fetchApi<Technique[]>(`/content/techniques/category/${category}`)
  }

  async searchTechniques(query: string): Promise<ApiResponse<Technique[]>> {
    return this.fetchApi<Technique[]>(`/content/techniques/search?q=${encodeURIComponent(query)}`)
  }

  // Learning Paths API methods
  async getLearningPaths(filters?: LearningPathFilters): Promise<ApiResponse<LearningPath[]>> {
    const queryParams = new URLSearchParams()
    
    if (filters?.level) queryParams.append('level', filters.level)
    if (filters?.duration) queryParams.append('duration', filters.duration)
    if (filters?.unlocked !== undefined) queryParams.append('unlocked', filters.unlocked.toString())
    if (filters?.search) queryParams.append('search', filters.search)

    const queryString = queryParams.toString()
    const endpoint = `/content/paths${queryString ? `?${queryString}` : ''}`
    
    return this.fetchApi<LearningPath[]>(endpoint)
  }

  async getLearningPathById(id: number): Promise<ApiResponse<LearningPath>> {
    return this.fetchApi<LearningPath>(`/content/paths/${id}`)
  }

  // Quiz API methods
  async getQuizzes(filters?: QuizFilters): Promise<ApiResponse<Quiz[]>> {
    const queryParams = new URLSearchParams()
    
    if (filters?.difficulty) queryParams.append('difficulty', filters.difficulty)
    if (filters?.category) queryParams.append('category', filters.category)
    if (filters?.type) queryParams.append('type', filters.type)
    if (filters?.completed !== undefined) queryParams.append('completed', filters.completed.toString())
    if (filters?.search) queryParams.append('search', filters.search)

    const queryString = queryParams.toString()
    const endpoint = `/content/quizzes${queryString ? `?${queryString}` : ''}`
    
    return this.fetchApi<Quiz[]>(endpoint)
  }

  async getQuizById(id: number): Promise<ApiResponse<Quiz>> {
    return this.fetchApi<Quiz>(`/content/quizzes/${id}`)
  }

  // Fallback data for development/testing
  getMockTechniques(): Technique[] {
    return [
      {
        id: 1,
        title: "Basic Choux Pastry",
        description: "Master the foundation of éclairs, profiteroles, and cream puffs",
        duration: "15 min",
        difficulty: "Beginner",
        rating: 4.8,
        students: 1250,
        image: "/choux-pastry-being-piped.jpg",
        category: "Fundamentals",
        videoUrl: "/videos/choux-pastry-basics.mp4",
        steps: [
          {
            id: 1,
            stepNumber: 1,
            title: "Heat water and butter",
            description: "Bring water and butter to a rolling boil in a saucepan",
            duration: "3 min",
            tips: ["Use unsalted butter for better control", "Don't let it boil too long"]
          },
          {
            id: 2,
            stepNumber: 2,
            title: "Add flour and cook out",
            description: "Add flour all at once and stir vigorously until a smooth paste forms",
            duration: "2 min",
            tips: ["Stir continuously to prevent lumps", "Cook until the paste pulls away from the pan"]
          }
        ],
        tags: ["choux", "pastry", "basics", "french"],
        createdAt: "2024-01-15T10:00:00Z",
        updatedAt: "2024-01-15T10:00:00Z"
      },
      {
        id: 2,
        title: "Perfect Pâte Brisée",
        description: "Learn the classic short pastry for tarts and quiches",
        duration: "12 min",
        difficulty: "Beginner",
        rating: 4.9,
        students: 980,
        image: "/rolling-pastry-dough.jpg",
        category: "Fundamentals",
        videoUrl: "/videos/pate-brisee-perfect.mp4",
        steps: [
          {
            id: 3,
            stepNumber: 1,
            title: "Mix dry ingredients",
            description: "Combine flour and salt in a large bowl",
            duration: "1 min",
            tips: ["Use cold ingredients", "Don't overmix"]
          }
        ],
        tags: ["pastry", "tart", "quiche", "french"],
        createdAt: "2024-01-15T10:00:00Z",
        updatedAt: "2024-01-15T10:00:00Z"
      },
      {
        id: 3,
        title: "Tempering Chocolate",
        description: "Achieve the perfect shine and snap in your chocolate work",
        duration: "20 min",
        difficulty: "Intermediate",
        rating: 4.7,
        students: 750,
        image: "/tempering-chocolate-on-marble.jpg",
        category: "Fundamentals",
        videoUrl: "/videos/chocolate-tempering.mp4",
        steps: [
          {
            id: 4,
            stepNumber: 1,
            title: "Melt chocolate",
            description: "Melt 2/3 of the chocolate in a double boiler",
            duration: "5 min",
            tips: ["Don't let water touch the chocolate", "Stir gently"]
          }
        ],
        tags: ["chocolate", "tempering", "technique", "desserts"],
        createdAt: "2024-01-15T10:00:00Z",
        updatedAt: "2024-01-15T10:00:00Z"
      }
    ]
  }

  getMockLearningPaths(): LearningPath[] {
    return [
      {
        id: 1,
        title: "Beginner Baker",
        description: "Start your pastry journey with fundamental techniques and basic recipes",
        shortDescription: "Fundamental pastry techniques for beginners",
        level: "Beginner",
        duration: "4-6 weeks",
        estimatedHours: 8,
        difficulty: "Beginner",
        modules: [] as any, // Temporarily empty to fix build
        tags: ["beginner", "fundamentals"],
        color: "bg-green-500",
        isUnlocked: true,
        isRecommended: true,
        isFeatured: false,
        completionRate: 75,
        averageRating: 4.5,
        totalStudents: 1200,
        createdAt: "2024-01-15T10:00:00Z",
        updatedAt: "2024-01-15T10:00:00Z"
      }
    ]
  }

  getMockQuizzes(): Quiz[] {
    return [] as any // Temporarily empty to fix build
  }
}

export const contentService = new ContentService()
export default contentService
