import { LearningPath, LearningModule } from "@/lib/types"
import { progressService } from "./progressService"

export interface BookmarkedPath {
  pathId: number
  path: LearningPath
  bookmarkedAt: string
  lastAccessedAt: string
  currentModuleId?: number
  progress: number
  notes?: string
  tags?: string[]
  isFavorite: boolean
  priority: 'low' | 'medium' | 'high'
  estimatedCompletionDate?: string
  actualCompletionDate?: string
}

export interface BookmarkFilters {
  search?: string
  priority?: 'low' | 'medium' | 'high'
  isFavorite?: boolean
  progress?: {
    min: number
    max: number
  }
  bookmarkedAfter?: string
  bookmarkedBefore?: string
  tags?: string[]
  level?: string
  difficulty?: string
}

export interface BookmarkStats {
  totalBookmarks: number
  favoriteBookmarks: number
  completedBookmarks: number
  inProgressBookmarks: number
  averageProgress: number
  mostBookmarkedCategory: string
  recentBookmarks: BookmarkedPath[]
  upcomingDeadlines: BookmarkedPath[]
}

export interface ResumeData {
  pathId: number
  moduleId: number
  position: number // Position within the module (e.g., video timestamp, step number)
  lastAccessedAt: string
  context: {
    moduleTitle: string
    pathTitle: string
    estimatedTimeRemaining: number
    nextSteps: string[]
  }
}

class LearningPathBookmarkService {
  private storageKey = 'patissier-practice-path-bookmarks'
  private bookmarks: BookmarkedPath[] = []
  private resumeData: ResumeData[] = []

  constructor() {
    this.loadBookmarks()
    this.loadResumeData()
  }

  // Load bookmarks from localStorage
  private loadBookmarks(): void {
    try {
      const data = localStorage.getItem(this.storageKey)
      if (data) {
        this.bookmarks = JSON.parse(data)
      }
    } catch (error) {
      console.error('Error loading bookmarks:', error)
    }
  }

  // Save bookmarks to localStorage
  private saveBookmarks(): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.bookmarks))
    } catch (error) {
      console.error('Error saving bookmarks:', error)
    }
  }

  // Load resume data from localStorage
  private loadResumeData(): void {
    try {
      const data = localStorage.getItem('patissier-practice-resume-data')
      if (data) {
        this.resumeData = JSON.parse(data)
      }
    } catch (error) {
      console.error('Error loading resume data:', error)
    }
  }

  // Save resume data to localStorage
  private saveResumeData(): void {
    try {
      localStorage.setItem('patissier-practice-resume-data', JSON.stringify(this.resumeData))
    } catch (error) {
      console.error('Error saving resume data:', error)
    }
  }

  // Bookmark a learning path
  bookmarkPath(path: LearningPath, options?: {
    notes?: string
    tags?: string[]
    priority?: 'low' | 'medium' | 'high'
    estimatedCompletionDate?: string
  }): BookmarkedPath {
    const existingBookmark = this.bookmarks.find(b => b.pathId === path.id)
    
    if (existingBookmark) {
      // Update existing bookmark
      existingBookmark.lastAccessedAt = new Date().toISOString()
      existingBookmark.notes = options?.notes || existingBookmark.notes
      existingBookmark.tags = options?.tags || existingBookmark.tags
      existingBookmark.priority = options?.priority || existingBookmark.priority
      existingBookmark.estimatedCompletionDate = options?.estimatedCompletionDate || existingBookmark.estimatedCompletionDate
      
      // Update progress
      const progress = progressService.getPathProgress(path.id)
      existingBookmark.progress = progress?.completionPercentage || 0
      
      this.saveBookmarks()
      return existingBookmark
    }

    // Create new bookmark
    const bookmark: BookmarkedPath = {
      pathId: path.id,
      path,
      bookmarkedAt: new Date().toISOString(),
      lastAccessedAt: new Date().toISOString(),
      progress: progressService.getPathProgress(path.id)?.completionPercentage || 0,
      notes: options?.notes,
      tags: options?.tags || [],
      isFavorite: false,
      priority: options?.priority || 'medium',
      estimatedCompletionDate: options?.estimatedCompletionDate
    }

    this.bookmarks.push(bookmark)
    this.saveBookmarks()
    return bookmark
  }

  // Remove bookmark
  removeBookmark(pathId: number): boolean {
    const index = this.bookmarks.findIndex(b => b.pathId === pathId)
    if (index !== -1) {
      this.bookmarks.splice(index, 1)
      this.saveBookmarks()
      return true
    }
    return false
  }

  // Toggle favorite status
  toggleFavorite(pathId: number): boolean {
    const bookmark = this.bookmarks.find(b => b.pathId === pathId)
    if (bookmark) {
      bookmark.isFavorite = !bookmark.isFavorite
      bookmark.lastAccessedAt = new Date().toISOString()
      this.saveBookmarks()
      return bookmark.isFavorite
    }
    return false
  }

  // Update bookmark notes
  updateNotes(pathId: number, notes: string): boolean {
    const bookmark = this.bookmarks.find(b => b.pathId === pathId)
    if (bookmark) {
      bookmark.notes = notes
      bookmark.lastAccessedAt = new Date().toISOString()
      this.saveBookmarks()
      return true
    }
    return false
  }

  // Update bookmark tags
  updateTags(pathId: number, tags: string[]): boolean {
    const bookmark = this.bookmarks.find(b => b.pathId === pathId)
    if (bookmark) {
      bookmark.tags = tags
      bookmark.lastAccessedAt = new Date().toISOString()
      this.saveBookmarks()
      return true
    }
    return false
  }

  // Update bookmark priority
  updatePriority(pathId: number, priority: 'low' | 'medium' | 'high'): boolean {
    const bookmark = this.bookmarks.find(b => b.pathId === pathId)
    if (bookmark) {
      bookmark.priority = priority
      bookmark.lastAccessedAt = new Date().toISOString()
      this.saveBookmarks()
      return true
    }
    return false
  }

  // Get all bookmarks
  getBookmarks(): BookmarkedPath[] {
    return this.bookmarks
  }

  // Get bookmarks with filters
  getFilteredBookmarks(filters: BookmarkFilters = {}): BookmarkedPath[] {
    let filtered = [...this.bookmarks]

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      filtered = filtered.filter(bookmark =>
        bookmark.path.title.toLowerCase().includes(searchLower) ||
        bookmark.path.description.toLowerCase().includes(searchLower) ||
        bookmark.notes?.toLowerCase().includes(searchLower) ||
        bookmark.tags?.some(tag => tag.toLowerCase().includes(searchLower))
      )
    }

    // Priority filter
    if (filters.priority) {
      filtered = filtered.filter(bookmark => bookmark.priority === filters.priority)
    }

    // Favorite filter
    if (filters.isFavorite !== undefined) {
      filtered = filtered.filter(bookmark => bookmark.isFavorite === filters.isFavorite)
    }

    // Progress filter
    if (filters.progress) {
      filtered = filtered.filter(bookmark =>
        bookmark.progress >= filters.progress!.min &&
        bookmark.progress <= filters.progress!.max
      )
    }

    // Date filters
    if (filters.bookmarkedAfter) {
      const afterDate = new Date(filters.bookmarkedAfter)
      filtered = filtered.filter(bookmark => new Date(bookmark.bookmarkedAt) >= afterDate)
    }

    if (filters.bookmarkedBefore) {
      const beforeDate = new Date(filters.bookmarkedBefore)
      filtered = filtered.filter(bookmark => new Date(bookmark.bookmarkedAt) <= beforeDate)
    }

    // Tags filter
    if (filters.tags && filters.tags.length > 0) {
      filtered = filtered.filter(bookmark =>
        bookmark.tags?.some(tag => filters.tags!.includes(tag))
      )
    }

    // Level filter
    if (filters.level) {
      filtered = filtered.filter(bookmark => bookmark.path.level === filters.level)
    }

    // Difficulty filter
    if (filters.difficulty) {
      filtered = filtered.filter(bookmark => bookmark.path.difficulty === filters.difficulty)
    }

    return filtered
  }

  // Get bookmark by path ID
  getBookmark(pathId: number): BookmarkedPath | null {
    return this.bookmarks.find(b => b.pathId === pathId) || null
  }

  // Check if path is bookmarked
  isBookmarked(pathId: number): boolean {
    return this.bookmarks.some(b => b.pathId === pathId)
  }

  // Update bookmark progress
  updateProgress(pathId: number): void {
    const bookmark = this.bookmarks.find(b => b.pathId === pathId)
    if (bookmark) {
      const progress = progressService.getPathProgress(pathId)
      bookmark.progress = progress?.completionPercentage || 0
      bookmark.lastAccessedAt = new Date().toISOString()
      
      // Mark as completed if progress is 100%
      if (bookmark.progress >= 100) {
        bookmark.actualCompletionDate = new Date().toISOString()
      }
      
      this.saveBookmarks()
    }
  }

  // Set current module for resume functionality
  setCurrentModule(pathId: number, moduleId: number, position: number = 0): void {
    const bookmark = this.bookmarks.find(b => b.pathId === pathId)
    if (bookmark) {
      bookmark.currentModuleId = moduleId
      bookmark.lastAccessedAt = new Date().toISOString()
      this.saveBookmarks()
    }

    // Update resume data
    const existingResume = this.resumeData.find(r => r.pathId === pathId)
    if (existingResume) {
      existingResume.moduleId = moduleId
      existingResume.position = position
      existingResume.lastAccessedAt = new Date().toISOString()
    } else {
      this.resumeData.push({
        pathId,
        moduleId,
        position,
        lastAccessedAt: new Date().toISOString(),
        context: {
          moduleTitle: '', // This would be populated with actual module data
          pathTitle: bookmark?.path.title || '',
          estimatedTimeRemaining: 0,
          nextSteps: []
        }
      })
    }
    
    this.saveResumeData()
  }

  // Get resume data for a path
  getResumeData(pathId: number): ResumeData | null {
    return this.resumeData.find(r => r.pathId === pathId) || null
  }

  // Get all resume data
  getAllResumeData(): ResumeData[] {
    return this.resumeData
  }

  // Clear resume data for a path
  clearResumeData(pathId: number): boolean {
    const index = this.resumeData.findIndex(r => r.pathId === pathId)
    if (index !== -1) {
      this.resumeData.splice(index, 1)
      this.saveResumeData()
      return true
    }
    return false
  }

  // Get bookmark statistics
  getBookmarkStats(): BookmarkStats {
    const totalBookmarks = this.bookmarks.length
    const favoriteBookmarks = this.bookmarks.filter(b => b.isFavorite).length
    const completedBookmarks = this.bookmarks.filter(b => b.progress >= 100).length
    const inProgressBookmarks = this.bookmarks.filter(b => b.progress > 0 && b.progress < 100).length
    const averageProgress = totalBookmarks > 0 
      ? this.bookmarks.reduce((sum, b) => sum + b.progress, 0) / totalBookmarks 
      : 0

    // Find most bookmarked category
    const categoryCounts: { [key: string]: number } = {}
    this.bookmarks.forEach(bookmark => {
      const category = this.extractCategoryFromPath(bookmark.path)
      if (category) {
        categoryCounts[category] = (categoryCounts[category] || 0) + 1
      }
    })
    const mostBookmarkedCategory = Object.entries(categoryCounts)
      .sort(([, a], [, b]) => b - a)[0]?.[0] || 'None'

    // Get recent bookmarks (last 5)
    const recentBookmarks = [...this.bookmarks]
      .sort((a, b) => new Date(b.lastAccessedAt).getTime() - new Date(a.lastAccessedAt).getTime())
      .slice(0, 5)

    // Get upcoming deadlines
    const upcomingDeadlines = this.bookmarks
      .filter(b => b.estimatedCompletionDate && b.progress < 100)
      .sort((a, b) => new Date(a.estimatedCompletionDate!).getTime() - new Date(b.estimatedCompletionDate!).getTime())
      .slice(0, 5)

    return {
      totalBookmarks,
      favoriteBookmarks,
      completedBookmarks,
      inProgressBookmarks,
      averageProgress,
      mostBookmarkedCategory,
      recentBookmarks,
      upcomingDeadlines
    }
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

  // Export bookmarks
  exportBookmarks(): string {
    return JSON.stringify(this.bookmarks, null, 2)
  }

  // Import bookmarks
  importBookmarks(data: string): boolean {
    try {
      const importedBookmarks = JSON.parse(data)
      if (Array.isArray(importedBookmarks)) {
        this.bookmarks = importedBookmarks
        this.saveBookmarks()
        return true
      }
    } catch (error) {
      console.error('Error importing bookmarks:', error)
    }
    return false
  }

  // Clear all bookmarks
  clearAllBookmarks(): void {
    this.bookmarks = []
    this.resumeData = []
    this.saveBookmarks()
    this.saveResumeData()
  }

  // Get bookmarks by priority
  getBookmarksByPriority(priority: 'low' | 'medium' | 'high'): BookmarkedPath[] {
    return this.bookmarks.filter(b => b.priority === priority)
  }

  // Get favorite bookmarks
  getFavoriteBookmarks(): BookmarkedPath[] {
    return this.bookmarks.filter(b => b.isFavorite)
  }

  // Get in-progress bookmarks
  getInProgressBookmarks(): BookmarkedPath[] {
    return this.bookmarks.filter(b => b.progress > 0 && b.progress < 100)
  }

  // Get completed bookmarks
  getCompletedBookmarks(): BookmarkedPath[] {
    return this.bookmarks.filter(b => b.progress >= 100)
  }

  // Search bookmarks
  searchBookmarks(query: string): BookmarkedPath[] {
    const searchLower = query.toLowerCase()
    return this.bookmarks.filter(bookmark =>
      bookmark.path.title.toLowerCase().includes(searchLower) ||
      bookmark.path.description.toLowerCase().includes(searchLower) ||
      bookmark.notes?.toLowerCase().includes(searchLower) ||
      bookmark.tags?.some(tag => tag.toLowerCase().includes(searchLower))
    )
  }

  // Sort bookmarks
  sortBookmarks(bookmarks: BookmarkedPath[], sortBy: 'title' | 'progress' | 'bookmarkedAt' | 'lastAccessedAt' | 'priority', direction: 'asc' | 'desc' = 'asc'): BookmarkedPath[] {
    return [...bookmarks].sort((a, b) => {
      let comparison = 0

      switch (sortBy) {
        case 'title':
          comparison = a.path.title.localeCompare(b.path.title)
          break
        case 'progress':
          comparison = a.progress - b.progress
          break
        case 'bookmarkedAt':
          comparison = new Date(a.bookmarkedAt).getTime() - new Date(b.bookmarkedAt).getTime()
          break
        case 'lastAccessedAt':
          comparison = new Date(a.lastAccessedAt).getTime() - new Date(b.lastAccessedAt).getTime()
          break
        case 'priority':
          const priorityOrder = { 'high': 3, 'medium': 2, 'low': 1 }
          comparison = (priorityOrder[a.priority] || 0) - (priorityOrder[b.priority] || 0)
          break
        default:
          comparison = 0
      }

      return direction === 'asc' ? comparison : -comparison
    })
  }
}

export const learningPathBookmarkService = new LearningPathBookmarkService()
export default learningPathBookmarkService
