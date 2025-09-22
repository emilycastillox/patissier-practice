"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  ChevronLeft, 
  ChevronRight, 
  Play, 
  CheckCircle, 
  Lock, 
  Clock, 
  Users, 
  Star,
  Bookmark,
  BookmarkCheck,
  Target,
  TrendingUp,
  Award,
  ArrowRight,
  ArrowLeft,
  Home,
  Search,
  Filter
} from "lucide-react"
import { LearningPath, LearningModule, LearningPathLevel } from "@/lib/types"
import { useLearningPath } from "@/lib/contexts/LearningPathContext"
import { cn } from "@/lib/utils"

interface LearningPathNavigationProps {
  className?: string
}

export function LearningPathNavigation({ className }: LearningPathNavigationProps) {
  const {
    currentPath,
    currentModule,
    pathProgress,
    availablePaths,
    unlockedModules,
    completedModules,
    navigateToModule,
    navigateToPath,
    navigateToLevel,
    getNextModule,
    getPreviousModule,
    canAccessModule,
    getPathProgress,
    getRecommendedPaths,
    getPathsByLevel,
    searchPaths,
    filterPaths
  } = useLearningPath()

  const [selectedLevel, setSelectedLevel] = useState<LearningPathLevel | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [showFilters, setShowFilters] = useState(false)

  const levels: { value: LearningPathLevel; label: string; color: string }[] = [
    { value: "Beginner", label: "Beginner", color: "bg-green-100 text-green-800" },
    { value: "Intermediate", label: "Intermediate", color: "bg-yellow-100 text-yellow-800" },
    { value: "Advanced", label: "Advanced", color: "bg-red-100 text-red-800" }
  ]

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

  const getModuleStatus = (module: LearningModule) => {
    if (completedModules.includes(module.id)) {
      return { status: "completed", icon: CheckCircle, color: "text-green-500" }
    }
    if (unlockedModules.includes(module.id)) {
      return { status: "unlocked", icon: Play, color: "text-blue-500" }
    }
    return { status: "locked", icon: Lock, color: "text-gray-400" }
  }

  const handleLevelSelect = (level: LearningPathLevel) => {
    setSelectedLevel(level)
  }

  const handlePathSelect = (path: LearningPath) => {
    navigateToPath(path.id)
  }

  const handleModuleSelect = (module: LearningModule) => {
    navigateToModule(module.id)
  }

  const handleNextModule = () => {
    const nextModule = getNextModule()
    if (nextModule) {
      navigateToModule(nextModule.id)
    }
  }

  const handlePreviousModule = () => {
    const previousModule = getPreviousModule()
    if (previousModule) {
      navigateToModule(previousModule.id)
    }
  }

  const filteredPaths = selectedLevel 
    ? getPathsByLevel(selectedLevel)
    : searchQuery 
      ? searchPaths(searchQuery)
      : availablePaths

  return (
    <div className={cn("space-y-6", className)}>
      {/* Level Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Choose Your Learning Level
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {levels.map((level) => (
              <Button
                key={level.value}
                variant={selectedLevel === level.value ? "default" : "outline"}
                className="h-auto p-4 flex flex-col items-center gap-2"
                onClick={() => handleLevelSelect(level.value)}
              >
                <div className="text-lg font-semibold">{level.label}</div>
                <div className="text-sm text-muted-foreground">
                  {getPathsByLevel(level.value).length} paths available
                </div>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search learning paths..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-input rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Learning Paths Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPaths.map((path) => (
          <Card 
            key={path.id} 
            className="group hover:shadow-lg transition-all duration-300 cursor-pointer"
            onClick={() => handlePathSelect(path)}
          >
            <div className="relative">
              {path.bannerImage && (
                <img
                  src={path.bannerImage}
                  alt={path.title}
                  className="w-full h-32 object-cover rounded-t-lg"
                />
              )}
              <div className="absolute top-4 right-4 flex gap-2">
                {path.isFeatured && (
                  <Badge className="bg-yellow-100 text-yellow-800">
                    <Star className="h-3 w-3 mr-1" />
                    Featured
                  </Badge>
                )}
                {path.isRecommended && (
                  <Badge className="bg-blue-100 text-blue-800">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    Recommended
                  </Badge>
                )}
              </div>
            </div>

            <CardHeader className="pb-3">
              <CardTitle className="text-lg line-clamp-2">{path.title}</CardTitle>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {path.shortDescription}
              </p>
            </CardHeader>

            <CardContent className="pt-0">
              <div className="space-y-3">
                {/* Path Info */}
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

                {/* Difficulty and Level */}
                <div className="flex items-center gap-2">
                  <Badge className={getDifficultyColor(path.difficulty)}>
                    {path.difficulty}
                  </Badge>
                  <Badge variant="outline">
                    {path.level}
                  </Badge>
                </div>

                {/* Progress */}
                {pathProgress && pathProgress.pathId === path.id && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Progress</span>
                      <span>{getPathProgress(path.id)}%</span>
                    </div>
                    <Progress value={getPathProgress(path.id)} className="h-2" />
                  </div>
                )}

                {/* Tags */}
                {path.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {path.tags.slice(0, 3).map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                    {path.tags.length > 3 && (
                      <Badge variant="secondary" className="text-xs">
                        +{path.tags.length - 3}
                      </Badge>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Current Path Module Navigation */}
      {currentPath && currentModule && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bookmark className="h-5 w-5" />
              {currentPath.title} - Module Navigation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Current Module */}
              <div className="bg-primary/5 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold">Current Module</h3>
                  <Badge className={getDifficultyColor(currentModule.difficulty)}>
                    {currentModule.difficulty}
                  </Badge>
                </div>
                <h4 className="text-lg font-medium mb-1">{currentModule.title}</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  {currentModule.description}
                </p>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {currentModule.duration}
                  </div>
                  <div className="flex items-center gap-1">
                    <Target className="h-4 w-4" />
                    Module {currentModule.order}
                  </div>
                </div>
              </div>

              {/* Module List */}
              <div className="space-y-2">
                <h4 className="font-medium">All Modules</h4>
                {currentPath.modules.map((module) => {
                  const moduleStatus = getModuleStatus(module)
                  const isCurrent = module.id === currentModule.id
                  const StatusIcon = moduleStatus.icon

                  return (
                    <div
                      key={module.id}
                      className={cn(
                        "flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors",
                        isCurrent && "bg-primary/10 border-primary",
                        !isCurrent && "hover:bg-muted/50"
                      )}
                      onClick={() => handleModuleSelect(module)}
                    >
                      <StatusIcon className={cn("h-5 w-5", moduleStatus.color)} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{module.title}</span>
                          {isCurrent && (
                            <Badge variant="outline" className="text-xs">
                              Current
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-1">
                          {module.shortDescription}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        {module.duration}
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Navigation Controls */}
              <div className="flex items-center justify-between pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={handlePreviousModule}
                  disabled={!getPreviousModule()}
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Previous
                </Button>
                
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    <Home className="h-4 w-4 mr-2" />
                    Back to Paths
                  </Button>
                </div>

                <Button
                  onClick={handleNextModule}
                  disabled={!getNextModule()}
                >
                  Next
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {filteredPaths.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No Learning Paths Found</h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery 
                ? "Try adjusting your search terms or filters."
                : "No learning paths are available at the moment."
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

export default LearningPathNavigation
