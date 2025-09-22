"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Trophy, 
  Award, 
  Target, 
  TrendingUp, 
  Clock, 
  Star, 
  Users, 
  BookOpen, 
  Zap, 
  Crown,
  Medal,
  Shield,
  Gem,
  Flame,
  Calendar,
  BarChart3,
  PieChart,
  Activity,
  ChevronRight,
  RefreshCw,
  Download,
  Share2
} from "lucide-react"
import { LearningPath } from "@/lib/types"
import { achievementService, type Achievement, type Badge as AchievementBadge, type Level, type ProgressVisualization as ProgressVisualizationType } from "@/lib/services/achievementService"
import { cn } from "@/lib/utils"

interface ProgressVisualizationProps {
  paths: LearningPath[]
  className?: string
}

export function ProgressVisualization({ paths, className }: ProgressVisualizationProps) {
  const [visualization, setVisualization] = useState<ProgressVisualizationType | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    loadVisualization()
  }, [paths])

  const loadVisualization = async () => {
    setIsLoading(true)
    try {
      const data = achievementService.getProgressVisualization(paths)
      setVisualization(data)
    } catch (error) {
      console.error('Error loading progress visualization:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common':
        return 'bg-gray-100 text-gray-800'
      case 'uncommon':
        return 'bg-green-100 text-green-800'
      case 'rare':
        return 'bg-blue-100 text-blue-800'
      case 'epic':
        return 'bg-purple-100 text-purple-800'
      case 'legendary':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'progress':
        return <TrendingUp className="h-4 w-4" />
      case 'milestone':
        return <Target className="h-4 w-4" />
      case 'skill':
        return <Award className="h-4 w-4" />
      case 'streak':
        return <Flame className="h-4 w-4" />
      case 'social':
        return <Users className="h-4 w-4" />
      case 'special':
        return <Gem className="h-4 w-4" />
      default:
        return <Trophy className="h-4 w-4" />
    }
  }

  const getBadgeComponentColor = (color: string) => {
    return color
  }

  if (isLoading) {
    return (
      <div className={cn("flex items-center justify-center p-8", className)}>
        <div className="flex items-center gap-2">
          <RefreshCw className="h-4 w-4 animate-spin" />
          <span>Loading progress visualization...</span>
        </div>
      </div>
    )
  }

  if (!visualization) {
    return (
      <div className={cn("flex items-center justify-center p-8", className)}>
        <div className="text-center">
          <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Progress Data</h3>
          <p className="text-muted-foreground">Start learning to see your progress visualization.</p>
        </div>
      </div>
    )
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Your Learning Progress</h2>
          <p className="text-muted-foreground">
            Track your achievements, badges, and learning milestones
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={loadVisualization}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline">
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-blue-100 rounded-lg">
                <BookOpen className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Paths Completed</p>
                <p className="text-2xl font-bold">{visualization.statistics.totalPathsCompleted}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-green-100 rounded-lg">
                <Target className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Modules Completed</p>
                <p className="text-2xl font-bold">{visualization.statistics.totalModulesCompleted}</p>
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
                <p className="text-sm text-muted-foreground">Time Spent</p>
                <p className="text-2xl font-bold">{Math.round(visualization.statistics.totalTimeSpent / 60)}h</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Star className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Average Score</p>
                <p className="text-2xl font-bold">{visualization.statistics.averageScore.toFixed(1)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
          <TabsTrigger value="badges">BadgeComponents</TabsTrigger>
          <TabsTrigger value="levels">Levels</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6 mt-6">
          {/* Overall Progress */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Overall Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Learning Paths</span>
                    <span className="text-sm text-muted-foreground">{visualization.overallProgress.toFixed(1)}%</span>
                  </div>
                  <Progress value={visualization.overallProgress} className="h-3" />
                </div>

                {/* Level Progress */}
                <div className="space-y-3">
                  <h4 className="font-medium">Progress by Level</h4>
                  {Object.entries(visualization.levelProgress).map(([level, progress]) => (
                    <div key={level}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm">{level}</span>
                        <span className="text-sm text-muted-foreground">{progress.toFixed(1)}%</span>
                      </div>
                      <Progress value={progress} className="h-2" />
                    </div>
                  ))}
                </div>

                {/* Category Progress */}
                <div className="space-y-3">
                  <h4 className="font-medium">Progress by Category</h4>
                  {Object.entries(visualization.categoryProgress).map(([category, progress]) => (
                    <div key={category}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm">{category}</span>
                        <span className="text-sm text-muted-foreground">{progress.toFixed(1)}%</span>
                      </div>
                      <Progress value={progress} className="h-2" />
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Streak Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Flame className="h-5 w-5" />
                Learning Streak
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-orange-600">{visualization.streaks.current}</div>
                  <div className="text-sm text-muted-foreground">Current Streak</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">{visualization.streaks.longest}</div>
                  <div className="text-sm text-muted-foreground">Longest Streak</div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-muted-foreground">
                    Last Activity: {new Date(visualization.streaks.lastActivity).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="achievements" className="space-y-6 mt-6">
          <AchievementsGrid achievements={visualization.achievements} />
        </TabsContent>

        <TabsContent value="badges" className="space-y-6 mt-6">
          <BadgeComponentsGrid badges={visualization.badges} />
        </TabsContent>

        <TabsContent value="levels" className="space-y-6 mt-6">
          <LevelsGrid levels={achievementService.getLevels()} currentLevel={visualization.statistics.currentLevel} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

// Achievements Grid Component
interface AchievementsGridProps {
  achievements: Achievement[]
}

function AchievementsGrid({ achievements }: AchievementsGridProps) {
  const [filter, setFilter] = useState<'all' | 'unlocked' | 'locked'>('all')
  const [category, setCategory] = useState<'all' | string>('all')

  const filteredAchievements = achievements.filter(achievement => {
    if (filter === 'unlocked' && !achievement.isUnlocked) return false
    if (filter === 'locked' && achievement.isUnlocked) return false
    if (category !== 'all' && achievement.category !== category) return false
    return true
  })

  const categories = Array.from(new Set(achievements.map(a => a.category)))

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Filter:</span>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
            className="px-3 py-1 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="all">All</option>
            <option value="unlocked">Unlocked</option>
            <option value="locked">Locked</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Category:</span>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="px-3 py-1 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="all">All</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Achievements Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredAchievements.map((achievement) => (
          <AchievementCard key={achievement.id} achievement={achievement} />
        ))}
      </div>
    </div>
  )
}

// Achievement Card Component
interface AchievementCardProps {
  achievement: Achievement
}

function AchievementCard({ achievement }: AchievementCardProps) {
  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common':
        return 'bg-gray-100 text-gray-800'
      case 'uncommon':
        return 'bg-green-100 text-green-800'
      case 'rare':
        return 'bg-blue-100 text-blue-800'
      case 'epic':
        return 'bg-purple-100 text-purple-800'
      case 'legendary':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'progress':
        return <TrendingUp className="h-4 w-4" />
      case 'milestone':
        return <Target className="h-4 w-4" />
      case 'skill':
        return <Award className="h-4 w-4" />
      case 'streak':
        return <Flame className="h-4 w-4" />
      case 'social':
        return <Users className="h-4 w-4" />
      case 'special':
        return <Gem className="h-4 w-4" />
      default:
        return <Trophy className="h-4 w-4" />
    }
  }

  return (
    <Card className={cn(
      "group hover:shadow-md transition-all duration-200",
      achievement.isUnlocked ? "ring-2 ring-yellow-400" : ""
    )}>
      <CardContent className="p-4">
        <div className="space-y-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="text-3xl">{achievement.icon}</div>
              <div className="flex-1">
                <h3 className="font-semibold line-clamp-1">{achievement.title}</h3>
                <p className="text-sm text-muted-foreground line-clamp-2">{achievement.description}</p>
              </div>
            </div>
            <div className="flex flex-col items-end gap-1">
              <Badge className={getRarityColor(achievement.rarity)}>
                {achievement.rarity}
              </Badge>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                {getCategoryIcon(achievement.category)}
                {achievement.points} pts
              </div>
            </div>
          </div>

          {achievement.isUnlocked ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-green-600">
                <Trophy className="h-4 w-4" />
                Unlocked {achievement.unlockedAt && new Date(achievement.unlockedAt).toLocaleDateString()}
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Progress</span>
                <span>{achievement.progress.toFixed(0)}%</span>
              </div>
              <Progress value={achievement.progress} className="h-2" />
              <div className="text-xs text-muted-foreground">
                {achievement.requirements.map(req => req.description).join(', ')}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

// BadgeComponents Grid Component
interface BadgeComponentsGridProps {
  badges: AchievementBadge[]
}

function BadgeComponentsGrid({ badges }: BadgeComponentsGridProps) {
  const [filter, setFilter] = useState<'all' | 'earned' | 'not_earned'>('all')
  const [category, setCategory] = useState<'all' | string>('all')

  const filteredBadgeComponents = badges.filter(badge => {
    if (filter === 'earned' && !badge.isEarned) return false
    if (filter === 'not_earned' && badge.isEarned) return false
    if (category !== 'all' && badge.category !== category) return false
    return true
  })

  const categories = Array.from(new Set(badges.map(b => b.category)))

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Filter:</span>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
            className="px-3 py-1 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="all">All</option>
            <option value="earned">Earned</option>
            <option value="not_earned">Not Earned</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Category:</span>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="px-3 py-1 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="all">All</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      {/* BadgeComponents Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredBadgeComponents.map((badge) => (
          <BadgeComponentCard key={badge.id} badge={badge} />
        ))}
      </div>
    </div>
  )
}

// BadgeComponent Card Component
interface BadgeComponentCardProps {
  badge: AchievementBadge
}

function BadgeComponentCard({ badge }: BadgeComponentCardProps) {
  return (
    <Card className={cn(
      "group hover:shadow-md transition-all duration-200 text-center",
      badge.isEarned ? "ring-2 ring-yellow-400" : "opacity-60"
    )}>
      <CardContent className="p-4">
        <div className="space-y-3">
          <div className={cn(
            "w-16 h-16 rounded-full flex items-center justify-center text-2xl mx-auto",
            badge.color,
            !badge.isEarned && "grayscale"
          )}>
            {badge.icon}
          </div>
          <div>
            <h3 className="font-semibold text-sm line-clamp-1">{badge.title}</h3>
            <p className="text-xs text-muted-foreground line-clamp-2">{badge.description}</p>
          </div>
          {badge.isEarned ? (
            <div className="text-xs text-green-600">
              Earned {badge.earnedAt && new Date(badge.earnedAt).toLocaleDateString()}
            </div>
          ) : (
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span>Progress</span>
                <span>{badge.progress.toFixed(0)}%</span>
              </div>
              <Progress value={badge.progress} className="h-1" />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

// Levels Grid Component
interface LevelsGridProps {
  levels: Level[]
  currentLevel: string
}

function LevelsGrid({ levels, currentLevel }: LevelsGridProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {levels.map((level) => (
          <LevelCard key={level.id} level={level} isCurrent={level.name === currentLevel} />
        ))}
      </div>
    </div>
  )
}

// Level Card Component
interface LevelCardProps {
  level: Level
  isCurrent: boolean
}

function LevelCard({ level, isCurrent }: LevelCardProps) {
  return (
    <Card className={cn(
      "group hover:shadow-md transition-all duration-200",
      isCurrent ? "ring-2 ring-blue-400" : "",
      !level.isUnlocked ? "opacity-60" : ""
    )}>
      <CardContent className="p-4">
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className={cn(
              "w-12 h-12 rounded-full flex items-center justify-center text-xl",
              level.color,
              !level.isUnlocked && "grayscale"
            )}>
              {level.icon}
            </div>
            <div className="flex-1">
              <h3 className="font-semibold">{level.name}</h3>
              <p className="text-sm text-muted-foreground">{level.description}</p>
            </div>
            {isCurrent && (
              <Badge className="bg-blue-100 text-blue-800">Current</Badge>
            )}
          </div>
          
          <div className="space-y-2">
            <div className="text-sm">
              <span className="font-medium">Required Points:</span> {level.requiredPoints}
            </div>
            <div className="text-sm">
              <span className="font-medium">Benefits:</span>
              <ul className="list-disc list-inside mt-1 space-y-1">
                {level.benefits.map((benefit, index) => (
                  <li key={index} className="text-xs text-muted-foreground">{benefit}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default ProgressVisualization
