"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  Target, 
  TrendingUp, 
  Clock, 
  Users, 
  Star, 
  CheckCircle,
  Lock,
  ArrowRight,
  BookOpen,
  Award,
  Zap
} from "lucide-react"
import { LearningPath, LearningPathLevel } from "@/lib/types"
import { useLearningPath } from "@/lib/contexts/LearningPathContext"
import { cn } from "@/lib/utils"

interface LearningPathLevelSelectorProps {
  onPathSelect?: (path: LearningPath) => void
  onLevelSelect?: (level: LearningPathLevel) => void
  className?: string
}

export function LearningPathLevelSelector({ 
  onPathSelect, 
  onLevelSelect,
  className 
}: LearningPathLevelSelectorProps) {
  const {
    availablePaths,
    getPathsByLevel,
    getRecommendedPaths,
    getPathProgress,
    canAccessPath,
    navigateToPath
  } = useLearningPath()

  const [selectedLevel, setSelectedLevel] = useState<LearningPathLevel | null>(null)

  const levels: { 
    value: LearningPathLevel; 
    label: string; 
    description: string;
    color: string;
    icon: React.ComponentType<{ className?: string }>;
    features: string[];
  }[] = [
    {
      value: "Beginner",
      label: "Beginner",
      description: "Perfect for those new to pastry making",
      color: "bg-green-100 text-green-800 border-green-200",
      icon: BookOpen,
      features: ["Basic techniques", "Step-by-step guidance", "Foundation skills"]
    },
    {
      value: "Intermediate",
      label: "Intermediate", 
      description: "Build on your skills with more complex recipes",
      color: "bg-yellow-100 text-yellow-800 border-yellow-200",
      icon: Target,
      features: ["Advanced techniques", "Complex recipes", "Skill building"]
    },
    {
      value: "Advanced",
      label: "Advanced",
      description: "Master-level techniques and professional methods",
      color: "bg-red-100 text-red-800 border-red-200",
      icon: Award,
      features: ["Master techniques", "Professional methods", "Expert-level skills"]
    }
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

  const handleLevelSelect = (level: LearningPathLevel) => {
    setSelectedLevel(level)
    if (onLevelSelect) {
      onLevelSelect(level)
    }
  }

  const handlePathSelect = (path: LearningPath) => {
    if (onPathSelect) {
      onPathSelect(path)
    } else {
      navigateToPath(path.id)
    }
  }

  const displayPaths = selectedLevel 
    ? getPathsByLevel(selectedLevel)
    : getRecommendedPaths()

  return (
    <div className={cn("space-y-6", className)}>
      {/* Level Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Choose Your Learning Level
          </CardTitle>
          <p className="text-muted-foreground">
            Select your skill level to see personalized learning paths
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {levels.map((level) => {
              const Icon = level.icon
              const paths = getPathsByLevel(level.value)
              const isSelected = selectedLevel === level.value
              
              return (
                <Card
                  key={level.value}
                  className={cn(
                    "cursor-pointer transition-all duration-200 hover:shadow-md",
                    isSelected && "ring-2 ring-primary"
                  )}
                  onClick={() => handleLevelSelect(level.value)}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className={cn(
                        "p-2 rounded-lg",
                        level.color
                      )}>
                        <Icon className="h-6 w-6" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">{level.label}</h3>
                        <p className="text-sm text-muted-foreground">
                          {paths.length} paths available
                        </p>
                      </div>
                    </div>
                    
                    <p className="text-sm text-muted-foreground mb-4">
                      {level.description}
                    </p>
                    
                    <div className="space-y-2">
                      {level.features.map((feature, index) => (
                        <div key={index} className="flex items-center gap-2 text-sm">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Recommended Paths */}
      {!selectedLevel && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Recommended for You
            </CardTitle>
            <p className="text-muted-foreground">
              Based on your progress and interests
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {getRecommendedPaths().slice(0, 4).map((path) => (
                <Card 
                  key={path.id}
                  className="group hover:shadow-md transition-all duration-200 cursor-pointer"
                  onClick={() => handlePathSelect(path)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-semibold line-clamp-2">{path.title}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                          {path.shortDescription}
                        </p>
                      </div>
                      <Badge className={getDifficultyColor(path.difficulty)}>
                        {path.difficulty}
                      </Badge>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
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
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{path.level}</Badge>
                        {path.isFeatured && (
                          <Badge className="bg-yellow-100 text-yellow-800">
                            <Zap className="h-3 w-3 mr-1" />
                            Featured
                          </Badge>
                        )}
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Level-specific Paths */}
      {selectedLevel && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              {selectedLevel} Learning Paths
            </CardTitle>
            <p className="text-muted-foreground">
              {displayPaths.length} paths available at your level
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {displayPaths.map((path) => {
                const progress = getPathProgress(path.id)
                const canAccess = canAccessPath(path.id)
                
                return (
                  <Card 
                    key={path.id}
                    className={cn(
                      "group hover:shadow-md transition-all duration-200 cursor-pointer",
                      !canAccess && "opacity-60"
                    )}
                    onClick={() => canAccess && handlePathSelect(path)}
                  >
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
                        {!canAccess && (
                          <Badge variant="outline" className="bg-white/90">
                            <Lock className="h-3 w-3 mr-1" />
                            Locked
                          </Badge>
                        )}
                      </div>
                    </div>

                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div>
                          <h3 className="font-semibold line-clamp-2">{path.title}</h3>
                          <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                            {path.shortDescription}
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          <Badge className={getDifficultyColor(path.difficulty)}>
                            {path.difficulty}
                          </Badge>
                          <Badge variant="outline">{path.level}</Badge>
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

                        {progress > 0 && (
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <span>Progress</span>
                              <span>{progress}%</span>
                            </div>
                            <Progress value={progress} className="h-2" />
                          </div>
                        )}

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {path.tags.slice(0, 2).map((tag) => (
                              <Badge key={tag} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                          <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {displayPaths.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Target className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No Learning Paths Available</h3>
            <p className="text-muted-foreground mb-4">
              {selectedLevel 
                ? `No ${selectedLevel.toLowerCase()} learning paths are available at the moment.`
                : "No recommended learning paths are available at the moment."
              }
            </p>
            {selectedLevel && (
              <Button onClick={() => setSelectedLevel(null)}>
                View All Paths
              </Button>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default LearningPathLevelSelector
