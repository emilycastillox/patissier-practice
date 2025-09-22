"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Star, 
  Clock, 
  Users, 
  Target, 
  TrendingUp, 
  Zap, 
  BookOpen, 
  CheckCircle,
  Play,
  Bookmark,
  BookmarkCheck,
  Filter,
  Search,
  RefreshCw,
  Award,
  Lightbulb,
  ArrowRight,
  ThumbsUp,
  ThumbsDown
} from "lucide-react"
import { LearningPath, LearningPathLevel, DifficultyLevel } from "@/lib/types"
import { recommendationService, Recommendation, RecommendationFilters, UserProfile } from "@/lib/services/recommendationService"
import { progressService } from "@/lib/services/progressService"
import { cn } from "@/lib/utils"

interface RecommendationDisplayProps {
  paths: LearningPath[]
  onPathSelect?: (path: LearningPath) => void
  onBookmark?: (pathId: number) => void
  className?: string
}

export function RecommendationDisplay({ 
  paths, 
  onPathSelect,
  onBookmark,
  className 
}: RecommendationDisplayProps) {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([])
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [filters, setFilters] = useState<RecommendationFilters>({})
  const [selectedTab, setSelectedTab] = useState<'personalized' | 'trending' | 'similar'>('personalized')
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    loadRecommendations()
  }, [paths, filters])

  const loadRecommendations = async () => {
    setIsLoading(true)
    try {
      // Build user profile
      const profile = recommendationService.buildUserProfile(paths)
      setUserProfile(profile)

      // Get recommendations based on selected tab
      let newRecommendations: Recommendation[] = []
      
      switch (selectedTab) {
        case 'personalized':
          newRecommendations = recommendationService.getPersonalizedRecommendations(paths, 12)
          break
        case 'trending':
          newRecommendations = recommendationService.getTrendingRecommendations(paths, 12)
          break
        case 'similar':
          // For similar, we'd need a current path context
          newRecommendations = recommendationService.getPersonalizedRecommendations(paths, 12)
          break
      }

      // Apply search filter
      if (searchQuery) {
        newRecommendations = newRecommendations.filter(rec =>
          rec.path.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          rec.path.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          rec.path.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
        )
      }

      setRecommendations(newRecommendations)
    } catch (error) {
      console.error('Error loading recommendations:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handlePathClick = (path: LearningPath) => {
    recommendationService.trackRecommendationInteraction(path.id, 'click')
    if (onPathSelect) {
      onPathSelect(path)
    }
  }

  const handleBookmark = (pathId: number) => {
    recommendationService.trackRecommendationInteraction(pathId, 'bookmark')
    if (onBookmark) {
      onBookmark(pathId)
    }
  }

  const handleFilterChange = (newFilters: Partial<RecommendationFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }))
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

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800"
      case "medium":
        return "bg-yellow-100 text-yellow-800"
      case "low":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getBasedOnIcon = (basedOn: string) => {
    switch (basedOn) {
      case 'skill_level':
        return <Target className="h-4 w-4" />
      case 'interests':
        return <Star className="h-4 w-4" />
      case 'progress':
        return <TrendingUp className="h-4 w-4" />
      case 'popularity':
        return <Users className="h-4 w-4" />
      case 'completion':
        return <CheckCircle className="h-4 w-4" />
      case 'difficulty':
        return <Award className="h-4 w-4" />
      case 'duration':
        return <Clock className="h-4 w-4" />
      default:
        return <Lightbulb className="h-4 w-4" />
    }
  }

  if (isLoading) {
    return (
      <div className={cn("flex items-center justify-center p-8", className)}>
        <div className="flex items-center gap-2">
          <RefreshCw className="h-4 w-4 animate-spin" />
          <span>Loading recommendations...</span>
        </div>
      </div>
    )
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Recommended Learning Paths</h2>
          <p className="text-muted-foreground">
            Personalized recommendations based on your learning profile
          </p>
        </div>
        <Button variant="outline" onClick={loadRecommendations}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* User Profile Summary */}
      {userProfile && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div>
                  <h3 className="font-semibold">Your Learning Profile</h3>
                  <p className="text-sm text-muted-foreground">
                    {userProfile.skillLevel} • {userProfile.preferredDifficulty} • {userProfile.learningStreak} day streak
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={getLevelColor(userProfile.skillLevel)}>
                    {userProfile.skillLevel}
                  </Badge>
                  <Badge className={getDifficultyColor(userProfile.preferredDifficulty)}>
                    {userProfile.preferredDifficulty}
                  </Badge>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-muted-foreground">
                  {userProfile.completedPaths.length} paths completed
                </div>
                <div className="text-sm text-muted-foreground">
                  {Math.round(userProfile.timeSpent / 60)}h total time
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search recommendations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-input rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <select
                value={filters.skillLevel || ''}
                onChange={(e) => handleFilterChange({ skillLevel: e.target.value as LearningPathLevel || undefined })}
                className="px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="">All Levels</option>
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
              <select
                value={filters.difficulty || ''}
                onChange={(e) => handleFilterChange({ difficulty: e.target.value as DifficultyLevel || undefined })}
                className="px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="">All Difficulties</option>
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recommendation Tabs */}
      <Tabs value={selectedTab} onValueChange={(value) => setSelectedTab(value as any)}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="personalized">Personalized</TabsTrigger>
          <TabsTrigger value="trending">Trending</TabsTrigger>
          <TabsTrigger value="similar">Similar</TabsTrigger>
        </TabsList>

        <TabsContent value="personalized" className="space-y-4">
          <RecommendationGrid
            recommendations={recommendations}
            onPathClick={handlePathClick}
            onBookmark={handleBookmark}
          />
        </TabsContent>

        <TabsContent value="trending" className="space-y-4">
          <RecommendationGrid
            recommendations={recommendations}
            onPathClick={handlePathClick}
            onBookmark={handleBookmark}
          />
        </TabsContent>

        <TabsContent value="similar" className="space-y-4">
          <RecommendationGrid
            recommendations={recommendations}
            onPathClick={handlePathClick}
            onBookmark={handleBookmark}
          />
        </TabsContent>
      </Tabs>

      {/* Empty State */}
      {recommendations.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Lightbulb className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No Recommendations Found</h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery 
                ? "Try adjusting your search terms or filters."
                : "Complete some learning paths to get personalized recommendations."
              }
            </p>
            {searchQuery && (
              <Button onClick={() => setSearchQuery("")}>
                Clear Search
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// Recommendation Grid Component
interface RecommendationGridProps {
  recommendations: Recommendation[]
  onPathClick: (path: LearningPath) => void
  onBookmark: (pathId: number) => void
}

function RecommendationGrid({ recommendations, onPathClick, onBookmark }: RecommendationGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {recommendations.map((rec) => (
        <RecommendationCard
          key={rec.pathId}
          recommendation={rec}
          onPathClick={onPathClick}
          onBookmark={onBookmark}
        />
      ))}
    </div>
  )
}

// Recommendation Card Component
interface RecommendationCardProps {
  recommendation: Recommendation
  onPathClick: (path: LearningPath) => void
  onBookmark: (pathId: number) => void
}

function RecommendationCard({ recommendation, onPathClick, onBookmark }: RecommendationCardProps) {
  const [isBookmarked, setIsBookmarked] = useState(false)

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

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800"
      case "medium":
        return "bg-yellow-100 text-yellow-800"
      case "low":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getBasedOnIcon = (basedOn: string) => {
    switch (basedOn) {
      case 'skill_level':
        return <Target className="h-4 w-4" />
      case 'interests':
        return <Star className="h-4 w-4" />
      case 'progress':
        return <TrendingUp className="h-4 w-4" />
      case 'popularity':
        return <Users className="h-4 w-4" />
      case 'completion':
        return <CheckCircle className="h-4 w-4" />
      case 'difficulty':
        return <Award className="h-4 w-4" />
      case 'duration':
        return <Clock className="h-4 w-4" />
      default:
        return <Lightbulb className="h-4 w-4" />
    }
  }

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 cursor-pointer">
      <div className="relative">
        {recommendation.path.bannerImage && (
          <img
            src={recommendation.path.bannerImage}
            alt={recommendation.path.title}
            className="w-full h-32 object-cover rounded-t-lg"
          />
        )}
        <div className="absolute top-3 right-3 flex gap-2">
          <Badge className={getPriorityColor(recommendation.priority)}>
            {recommendation.priority}
          </Badge>
          {recommendation.path.isFeatured && (
            <Badge className="bg-yellow-100 text-yellow-800">
              <Zap className="h-3 w-3 mr-1" />
              Featured
            </Badge>
          )}
        </div>
      </div>

      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h3 className="font-semibold line-clamp-2 mb-1">{recommendation.path.title}</h3>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {recommendation.path.shortDescription}
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                setIsBookmarked(!isBookmarked)
                onBookmark(recommendation.pathId)
              }}
            >
              {isBookmarked ? (
                <BookmarkCheck className="h-4 w-4 text-primary" />
              ) : (
                <Bookmark className="h-4 w-4" />
              )}
            </Button>
          </div>

          {/* Recommendation Score */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              {getBasedOnIcon(recommendation.basedOn)}
              <span className="text-sm font-medium">
                {Math.round(recommendation.score * 100)}% match
              </span>
            </div>
            <div className="flex-1">
              <Progress value={recommendation.score * 100} className="h-2" />
            </div>
          </div>

          {/* Badges */}
          <div className="flex items-center gap-2">
            <Badge className={getDifficultyColor(recommendation.path.difficulty)}>
              {recommendation.path.difficulty}
            </Badge>
            <Badge className={getLevelColor(recommendation.path.level)}>
              {recommendation.path.level}
            </Badge>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {recommendation.path.duration}
            </div>
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              {recommendation.path.totalStudents.toLocaleString()}
            </div>
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              {recommendation.path.averageRating.toFixed(1)}
            </div>
          </div>

          {/* Reasons */}
          {recommendation.reasons.length > 0 && (
            <div className="space-y-1">
              <h4 className="text-sm font-medium">Why recommended:</h4>
              <ul className="space-y-1">
                {recommendation.reasons.slice(0, 2).map((reason, index) => (
                  <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    {reason}
                  </li>
                ))}
                {recommendation.reasons.length > 2 && (
                  <li className="text-sm text-muted-foreground">
                    +{recommendation.reasons.length - 2} more reasons
                  </li>
                )}
              </ul>
            </div>
          )}

          {/* Action Button */}
          <Button 
            className="w-full" 
            onClick={() => onPathClick(recommendation.path)}
          >
            <Play className="h-4 w-4 mr-2" />
            Start Learning
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export default RecommendationDisplay
