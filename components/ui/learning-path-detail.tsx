"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  ArrowLeft, 
  Play, 
  Pause, 
  Bookmark, 
  BookmarkCheck, 
  Star, 
  Share2, 
  Download, 
  Clock, 
  Users, 
  Target, 
  Award, 
  BookOpen, 
  CheckCircle, 
  Lock, 
  Unlock, 
  TrendingUp, 
  Calendar, 
  User, 
  Zap, 
  BarChart3, 
  List, 
  Grid, 
  Filter,
  Search,
  RefreshCw,
  Eye,
  EyeOff,
  ChevronRight,
  ChevronDown,
  PlayCircle,
  PauseCircle,
  RotateCcw
} from "lucide-react"
import { LearningPath, LearningModule, LearningPathLevel, DifficultyLevel } from "@/lib/types"
import { progressService } from "@/lib/services/progressService"
import { learningPathBookmarkService } from "@/lib/services/learningPathBookmarkService"
import { achievementService } from "@/lib/services/achievementService"
import { cn } from "@/lib/utils"

interface LearningPathDetailProps {
  path: LearningPath
  onBack?: () => void
  onModuleSelect?: (module: LearningModule) => void
  onPathSelect?: (path: LearningPath) => void
  className?: string
}

export function LearningPathDetail({ 
  path, 
  onBack,
  onModuleSelect,
  onPathSelect,
  className 
}: LearningPathDetailProps) {
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [isFavorite, setIsFavorite] = useState(false)
  const [progress, setProgress] = useState(0)
  const [moduleProgress, setModuleProgress] = useState<{ [key: number]: number }>({})
  const [activeTab, setActiveTab] = useState('overview')
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list')
  const [showCompleted, setShowCompleted] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadPathData()
  }, [path])

  const loadPathData = async () => {
    setIsLoading(true)
    try {
      // Load progress data
      const pathProgress = progressService.getPathProgress(path.id)
      setProgress(pathProgress?.completionPercentage || 0)

      // Load module progress
      const moduleProgressData: { [key: number]: number } = {}
      path.modules.forEach(module => {
        const moduleProgress = progressService.getModuleProgress(module.id)
        moduleProgressData[module.id] = moduleProgress?.completionPercentage || 0
      })
      setModuleProgress(moduleProgressData)

      // Check bookmark status
      const bookmark = learningPathBookmarkService.getBookmark(path.id)
      setIsBookmarked(!!bookmark)
      setIsFavorite(bookmark?.isFavorite || false)
    } catch (error) {
      console.error('Error loading path data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleBookmark = () => {
    if (isBookmarked) {
      learningPathBookmarkService.removeBookmark(path.id)
      setIsBookmarked(false)
      setIsFavorite(false)
    } else {
      learningPathBookmarkService.bookmarkPath(path)
      setIsBookmarked(true)
    }
  }

  const handleToggleFavorite = () => {
    if (isBookmarked) {
      const newFavoriteStatus = learningPathBookmarkService.toggleFavorite(path.id)
      setIsFavorite(newFavoriteStatus)
    }
  }

  const handleModuleClick = (module: LearningModule) => {
    if (onModuleSelect) {
      onModuleSelect(module)
    }
  }

  const handleStartPath = () => {
    if (onPathSelect) {
      onPathSelect(path)
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

  const getProgressColor = (progress: number) => {
    if (progress >= 100) return 'text-green-600'
    if (progress >= 75) return 'text-blue-600'
    if (progress >= 50) return 'text-yellow-600'
    if (progress >= 25) return 'text-orange-600'
    return 'text-red-600'
  }

  const filteredModules = path.modules.filter(module => {
    if (!showCompleted && moduleProgress[module.id] >= 100) return false
    if (searchQuery && !module.title.toLowerCase().includes(searchQuery.toLowerCase()) && 
        !module.shortDescription.toLowerCase().includes(searchQuery.toLowerCase())) return false
    return true
  })

  if (isLoading) {
    return (
      <div className={cn("flex items-center justify-center p-8", className)}>
        <div className="flex items-center gap-2">
          <RefreshCw className="h-4 w-4 animate-spin" />
          <span>Loading path details...</span>
        </div>
      </div>
    )
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {onBack && (
            <Button variant="outline" onClick={onBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          )}
          <div>
            <h1 className="text-3xl font-bold">{path.title}</h1>
            <p className="text-muted-foreground text-lg">{path.shortDescription}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleBookmark}>
            {isBookmarked ? (
              <BookmarkCheck className="h-4 w-4 mr-2" />
            ) : (
              <Bookmark className="h-4 w-4 mr-2" />
            )}
            {isBookmarked ? 'Bookmarked' : 'Bookmark'}
          </Button>
          {isBookmarked && (
            <Button variant="outline" onClick={handleToggleFavorite}>
              <Star className={cn("h-4 w-4 mr-2", isFavorite && "fill-yellow-400 text-yellow-400")} />
              {isFavorite ? 'Favorite' : 'Add to Favorites'}
            </Button>
          )}
          <Button variant="outline">
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Path Banner */}
      {path.bannerImage && (
        <div className="relative h-64 rounded-lg overflow-hidden">
          <img
            src={path.bannerImage}
            alt={path.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          <div className="absolute bottom-4 left-4 text-white">
            <div className="flex items-center gap-4">
              <Badge className={getLevelColor(path.level)}>
                {path.level}
              </Badge>
              <Badge className={getDifficultyColor(path.difficulty)}>
                {path.difficulty}
              </Badge>
              <Badge variant="outline" className="bg-white/20 text-white border-white/30">
                {path.duration}
              </Badge>
            </div>
          </div>
        </div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-blue-100 rounded-lg">
                <BookOpen className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Modules</p>
                <p className="text-2xl font-bold">{path.modules.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Progress</p>
                <p className={cn("text-2xl font-bold", getProgressColor(progress))}>
                  {progress.toFixed(0)}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Duration</p>
                <p className="text-2xl font-bold">{path.duration}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Users className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Students</p>
                <p className="text-2xl font-bold">{path.totalStudents.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="modules">Modules</TabsTrigger>
          <TabsTrigger value="progress">Progress</TabsTrigger>
          <TabsTrigger value="reviews">Reviews</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6 mt-6">
          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle>About This Learning Path</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">{path.description}</p>
            </CardContent>
          </Card>

          {/* Learning Objectives */}
          <Card>
            <CardHeader>
              <CardTitle>What You'll Learn</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {path.modules.map((module, index) => (
                  <li key={module.id} className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <span>{module.title}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Prerequisites */}
          <Card>
            <CardHeader>
              <CardTitle>Prerequisites</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-blue-500" />
                  <span>Basic understanding of baking fundamentals</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-blue-500" />
                  <span>Dedication to practice and learn</span>
                </div>
                <div className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-blue-500" />
                  <span>Access to basic baking tools and ingredients</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Instructor */}
          {path.instructor && (
            <Card>
              <CardHeader>
                <CardTitle>Instructor</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center">
                    <User className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{path.instructor.name}</h3>
                    <p className="text-muted-foreground">{path.instructor.title}</p>
                    <p className="text-sm text-muted-foreground">{path.instructor.bio}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="modules" className="space-y-6 mt-6">
          {/* Module Controls */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search modules..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-input rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center border rounded-md">
                    <Button
                      variant={viewMode === 'list' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setViewMode('list')}
                    >
                      <List className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={viewMode === 'grid' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setViewMode('grid')}
                    >
                      <Grid className="h-4 w-4" />
                    </Button>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowCompleted(!showCompleted)}
                  >
                    {showCompleted ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
                    {showCompleted ? 'Hide Completed' : 'Show Completed'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Modules List/Grid */}
          <div className={
            viewMode === 'grid' 
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
              : "space-y-4"
          }>
            {filteredModules.map((module) => (
              <ModuleCard
                key={module.id}
                module={module}
                progress={moduleProgress[module.id] || 0}
                viewMode={viewMode}
                onClick={() => handleModuleClick(module)}
                getProgressColor={getProgressColor}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="progress" className="space-y-6 mt-6">
          {/* Overall Progress */}
          <Card>
            <CardHeader>
              <CardTitle>Overall Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Learning Path Progress</span>
                  <span className={cn("text-sm font-medium", getProgressColor(progress))}>
                    {progress.toFixed(0)}%
                  </span>
                </div>
                <Progress value={progress} className="h-3" />
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-green-600">
                      {Object.values(moduleProgress).filter(p => p >= 100).length}
                    </div>
                    <div className="text-sm text-muted-foreground">Completed</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-blue-600">
                      {Object.values(moduleProgress).filter(p => p > 0 && p < 100).length}
                    </div>
                    <div className="text-sm text-muted-foreground">In Progress</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-600">
                      {Object.values(moduleProgress).filter(p => p === 0).length}
                    </div>
                    <div className="text-sm text-muted-foreground">Not Started</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Module Progress Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Module Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {path.modules.map((module) => {
                  const moduleProgressValue = moduleProgress[module.id] || 0
                  return (
                    <div key={module.id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{module.title}</span>
                        <span className={cn("text-sm", getProgressColor(moduleProgressValue))}>
                          {moduleProgressValue.toFixed(0)}%
                        </span>
                      </div>
                      <Progress value={moduleProgressValue} className="h-2" />
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reviews" className="space-y-6 mt-6">
          <Card>
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Reviews Coming Soon</h3>
              <p className="text-muted-foreground">
                Review functionality will be available in a future update.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Action Buttons */}
      <div className="flex items-center justify-center gap-4 pt-6 border-t">
        <Button size="lg" onClick={handleStartPath}>
          <Play className="h-5 w-5 mr-2" />
          {progress > 0 ? 'Continue Learning' : 'Start Learning Path'}
        </Button>
        <Button variant="outline" size="lg">
          <Download className="h-5 w-5 mr-2" />
          Download Materials
        </Button>
      </div>
    </div>
  )
}

// Module Card Component
interface ModuleCardProps {
  module: LearningModule
  progress: number
  viewMode: 'list' | 'grid'
  onClick: () => void
  getProgressColor: (progress: number) => string
}

function ModuleCard({ module, progress, viewMode, onClick, getProgressColor }: ModuleCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  if (viewMode === 'list') {
    return (
      <Card className="group hover:shadow-md transition-all duration-200 cursor-pointer" onClick={onClick}>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
              <BookOpen className="h-6 w-6 text-muted-foreground" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold line-clamp-1">{module.title}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">{module.shortDescription}</p>
                </div>
                <div className="flex items-center gap-2">
                  {progress >= 100 ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : progress > 0 ? (
                    <PlayCircle className="h-5 w-5 text-blue-500" />
                  ) : (
                    <PauseCircle className="h-5 w-5 text-gray-400" />
                  )}
                  <span className={cn("text-sm font-medium", getProgressColor(progress))}>
                    {progress.toFixed(0)}%
                  </span>
                </div>
              </div>
              <div className="mt-2">
                <Progress value={progress} className="h-2" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="group hover:shadow-md transition-all duration-200 cursor-pointer" onClick={onClick}>
      <CardContent className="p-4">
        <div className="space-y-3">
          <div className="flex items-start justify-between">
            <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center">
              <BookOpen className="h-6 w-6 text-muted-foreground" />
            </div>
            <div className="flex items-center gap-1">
              {progress >= 100 ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : progress > 0 ? (
                <PlayCircle className="h-5 w-5 text-blue-500" />
              ) : (
                <PauseCircle className="h-5 w-5 text-gray-400" />
              )}
            </div>
          </div>
          <div>
            <h3 className="font-semibold line-clamp-2 mb-1">{module.title}</h3>
            <p className="text-sm text-muted-foreground line-clamp-2">{module.shortDescription}</p>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Progress</span>
              <span className={getProgressColor(progress)}>{progress.toFixed(0)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default LearningPathDetail
