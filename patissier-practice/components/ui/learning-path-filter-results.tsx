"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  Grid, 
  List, 
  Filter, 
  SortAsc, 
  SortDesc, 
  Search,
  Clock,
  Users,
  Star,
  Target,
  Award,
  BookOpen,
  Zap,
  TrendingUp,
  Calendar,
  User,
  ArrowUpDown,
  RefreshCw
} from "lucide-react"
import { LearningPath, LearningPathLevel, DifficultyLevel } from "@/lib/types"
import { learningPathFilterService, LearningPathFilters } from "@/lib/services/learningPathFilterService"
import { progressService } from "@/lib/services/progressService"
import { cn } from "@/lib/utils"

interface LearningPathFilterResultsProps {
  paths: LearningPath[]
  filters: LearningPathFilters
  onPathSelect?: (path: LearningPath) => void
  onBookmark?: (pathId: number) => void
  className?: string
}

export type SortOption = 'name' | 'rating' | 'difficulty' | 'duration' | 'students' | 'completion' | 'created' | 'updated'
export type SortDirection = 'asc' | 'desc'
export type ViewMode = 'grid' | 'list'

export function LearningPathFilterResults({ 
  paths, 
  filters, 
  onPathSelect,
  onBookmark,
  className 
}: LearningPathFilterResultsProps) {
  const [filteredPaths, setFilteredPaths] = useState<LearningPath[]>([])
  const [sortOption, setSortOption] = useState<SortOption>('name')
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc')
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    filterAndSortPaths()
  }, [paths, filters, sortOption, sortDirection])

  const filterAndSortPaths = async () => {
    setIsLoading(true)
    try {
      // Apply filters
      const filtered = learningPathFilterService.filterPaths(paths, filters)
      
      // Apply sorting
      const sorted = sortPaths(filtered, sortOption, sortDirection)
      
      setFilteredPaths(sorted)
    } catch (error) {
      console.error('Error filtering paths:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const sortPaths = (pathsToSort: LearningPath[], option: SortOption, direction: SortDirection): LearningPath[] => {
    return [...pathsToSort].sort((a, b) => {
      let comparison = 0

      switch (option) {
        case 'name':
          comparison = a.title.localeCompare(b.title)
          break
        case 'rating':
          comparison = a.averageRating - b.averageRating
          break
        case 'difficulty':
          const difficultyOrder = { 'Beginner': 1, 'Intermediate': 2, 'Advanced': 3 }
          comparison = (difficultyOrder[a.difficulty as keyof typeof difficultyOrder] || 0) - 
                      (difficultyOrder[b.difficulty as keyof typeof difficultyOrder] || 0)
          break
        case 'duration':
          const getDurationWeeks = (duration: string) => {
            const durationLower = duration.toLowerCase()
            if (durationLower.includes('week')) {
              const match = durationLower.match(/(\d+)\s*week/)
              return match ? parseInt(match[1]) : 0
            }
            if (durationLower.includes('month')) {
              const match = durationLower.match(/(\d+)\s*month/)
              return match ? parseInt(match[1]) * 4 : 0
            }
            return 0
          }
          comparison = getDurationWeeks(a.duration) - getDurationWeeks(b.duration)
          break
        case 'students':
          comparison = a.totalStudents - b.totalStudents
          break
        case 'completion':
          comparison = a.completionRate - b.completionRate
          break
        case 'created':
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          break
        case 'updated':
          comparison = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime()
          break
        default:
          comparison = 0
      }

      return direction === 'asc' ? comparison : -comparison
    })
  }

  const handleSortChange = (option: SortOption) => {
    if (sortOption === option) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortOption(option)
      setSortDirection('asc')
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Beginner":
        return "bg-green-100 text-green-800"
      case "Intermediate":
        return "bg-yellow-100 text-yellow-800"
      case "Advanced":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getLevelColor = (level: LearningPathLevel) => {
    switch (level) {
      case "Beginner":
        return "bg-green-100 text-green-800"
      case "Intermediate":
        return "bg-yellow-100 text-yellow-800"
      case "Advanced":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getSortIcon = (option: SortOption) => {
    if (sortOption !== option) return <ArrowUpDown className="h-4 w-4" />
    return sortDirection === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />
  }

  if (isLoading) {
    return (
      <div className={cn("flex items-center justify-center p-8", className)}>
        <div className="flex items-center gap-2">
          <RefreshCw className="h-4 w-4 animate-spin" />
          <span>Filtering learning paths...</span>
        </div>
      </div>
    )
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Results Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Learning Paths</h2>
          <p className="text-muted-foreground">
            {filteredPaths.length} of {paths.length} paths match your filters
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          {/* View Mode Toggle */}
          <div className="flex items-center border rounded-md">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>

          {/* Sort Options */}
          <div className="flex items-center gap-1">
            <span className="text-sm text-muted-foreground">Sort by:</span>
            {[
              { key: 'name', label: 'Name' },
              { key: 'rating', label: 'Rating' },
              { key: 'difficulty', label: 'Difficulty' },
              { key: 'duration', label: 'Duration' },
              { key: 'students', label: 'Students' },
              { key: 'completion', label: 'Completion' },
              { key: 'created', label: 'Created' },
              { key: 'updated', label: 'Updated' }
            ].map((option) => (
              <Button
                key={option.key}
                variant={sortOption === option.key ? 'default' : 'ghost'}
                size="sm"
                onClick={() => handleSortChange(option.key as SortOption)}
                className="flex items-center gap-1"
              >
                {getSortIcon(option.key as SortOption)}
                {option.label}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Results Grid/List */}
      {filteredPaths.length > 0 ? (
        <div className={
          viewMode === 'grid' 
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            : "space-y-4"
        }>
          {filteredPaths.map((path) => (
            <LearningPathCard
              key={path.id}
              path={path}
              viewMode={viewMode}
              onPathSelect={onPathSelect}
              onBookmark={onBookmark}
            />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No Learning Paths Found</h3>
            <p className="text-muted-foreground mb-4">
              No learning paths match your current filters. Try adjusting your search criteria.
            </p>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Adjust Filters
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// Learning Path Card Component
interface LearningPathCardProps {
  path: LearningPath
  viewMode: ViewMode
  onPathSelect?: (path: LearningPath) => void
  onBookmark?: (pathId: number) => void
}

function LearningPathCard({ path, viewMode, onPathSelect, onBookmark }: LearningPathCardProps) {
  const [isBookmarked, setIsBookmarked] = useState(false)
  const progress = progressService.getPathProgress(path.id)

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Beginner":
        return "bg-green-100 text-green-800"
      case "Intermediate":
        return "bg-yellow-100 text-yellow-800"
      case "Advanced":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getLevelColor = (level: LearningPathLevel) => {
    switch (level) {
      case "Beginner":
        return "bg-green-100 text-green-800"
      case "Intermediate":
        return "bg-yellow-100 text-yellow-800"
      case "Advanced":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (viewMode === 'list') {
    return (
      <Card className="group hover:shadow-md transition-all duration-200">
        <CardContent className="p-4">
          <div className="flex items-start gap-4">
            {path.bannerImage && (
              <img
                src={path.bannerImage}
                alt={path.title}
                className="w-24 h-24 object-cover rounded-lg"
              />
            )}
            
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <h3 className="font-semibold text-lg line-clamp-1">{path.title}</h3>
                  <p className="text-muted-foreground text-sm line-clamp-2 mt-1">
                    {path.shortDescription}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    setIsBookmarked(!isBookmarked)
                    onBookmark?.(path.id)
                  }}
                >
                  {isBookmarked ? '★' : '☆'}
                </Button>
              </div>

              <div className="flex items-center gap-2 mb-3">
                <Badge className={getDifficultyColor(path.difficulty)}>
                  {path.difficulty}
                </Badge>
                <Badge className={getLevelColor(path.level)}>
                  {path.level}
                </Badge>
                {path.isFeatured && (
                  <Badge className="bg-yellow-100 text-yellow-800">
                    <Zap className="h-3 w-3 mr-1" />
                    Featured
                  </Badge>
                )}
              </div>

              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {path.duration}
                </div>
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  {path.totalStudents.toLocaleString()}
                </div>
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  {path.averageRating.toFixed(1)}
                </div>
                <div className="flex items-center gap-1">
                  <TrendingUp className="h-4 w-4" />
                  {path.completionRate}% completion
                </div>
              </div>

              {progress && progress.completionPercentage > 0 && (
                <div className="mt-3">
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span>Your Progress</span>
                    <span>{progress.completionPercentage}%</span>
                  </div>
                  <Progress value={progress.completionPercentage} className="h-2" />
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 cursor-pointer">
      <div className="relative">
        {path.bannerImage && (
          <img
            src={path.bannerImage}
            alt={path.title}
            className="w-full h-32 object-cover rounded-t-lg"
          />
        )}
        <div className="absolute top-3 right-3 flex gap-2">
          {path.isFeatured && (
            <Badge className="bg-yellow-100 text-yellow-800">
              <Zap className="h-3 w-3 mr-1" />
              Featured
            </Badge>
          )}
          <Button
            variant="ghost"
            size="sm"
            className="bg-white/90 hover:bg-white"
            onClick={(e) => {
              e.stopPropagation()
              setIsBookmarked(!isBookmarked)
              onBookmark?.(path.id)
            }}
          >
            {isBookmarked ? '★' : '☆'}
          </Button>
        </div>
      </div>

      <CardContent className="p-4">
        <div className="space-y-3">
          <div>
            <h3 className="font-semibold line-clamp-2 mb-1">{path.title}</h3>
            <p className="text-muted-foreground text-sm line-clamp-2">
              {path.shortDescription}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Badge className={getDifficultyColor(path.difficulty)}>
              {path.difficulty}
            </Badge>
            <Badge className={getLevelColor(path.level)}>
              {path.level}
            </Badge>
          </div>

          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {path.duration}
            </div>
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              {path.totalStudents.toLocaleString()}
            </div>
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              {path.averageRating.toFixed(1)}
            </div>
          </div>

          {progress && progress.completionPercentage > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Your Progress</span>
                <span>{progress.completionPercentage}%</span>
              </div>
              <Progress value={progress.completionPercentage} className="h-2" />
            </div>
          )}

          <Button 
            className="w-full" 
            onClick={() => onPathSelect?.(path)}
          >
            <BookOpen className="h-4 w-4 mr-2" />
            View Path
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export default LearningPathFilterResults
