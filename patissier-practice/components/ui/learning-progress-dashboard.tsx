"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  TrendingUp, 
  Target, 
  Clock, 
  Award, 
  BookOpen, 
  CheckCircle, 
  Play, 
  Lock,
  Calendar,
  BarChart3,
  Download,
  Upload,
  RefreshCw,
  Star,
  Users,
  Zap,
  Trophy,
  Flame
} from "lucide-react"
import { LearningPath, LearningPathLevel } from "@/lib/types"
import { progressService, ProgressStats, ProgressAnalytics } from "@/lib/services/progressService"
import { useLearningPath } from "@/lib/contexts/LearningPathContext"
import { cn } from "@/lib/utils"

interface LearningProgressDashboardProps {
  className?: string
}

export function LearningProgressDashboard({ className }: LearningProgressDashboardProps) {
  const { availablePaths } = useLearningPath()
  const [stats, setStats] = useState<ProgressStats | null>(null)
  const [analytics, setAnalytics] = useState<ProgressAnalytics | null>(null)
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'year'>('week')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadProgressData()
  }, [availablePaths])

  const loadProgressData = async () => {
    setIsLoading(true)
    try {
      const progressStats = progressService.getProgressStats(availablePaths)
      const progressAnalytics = progressService.getProgressAnalytics()
      setStats(progressStats)
      setAnalytics(progressAnalytics)
    } catch (error) {
      console.error('Error loading progress data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleExportProgress = () => {
    const data = progressService.exportProgress()
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'learning-progress.json'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleImportProgress = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const data = e.target?.result as string
        if (progressService.importProgress(data)) {
          loadProgressData()
        }
      }
      reader.readAsText(file)
    }
  }

  const handleResetProgress = () => {
    if (confirm('Are you sure you want to reset all progress? This action cannot be undone.')) {
      progressService.resetProgress()
      loadProgressData()
    }
  }

  const getLevelColor = (level: LearningPathLevel) => {
    switch (level) {
      case 'Beginner':
        return 'bg-green-100 text-green-800'
      case 'Intermediate':
        return 'bg-yellow-100 text-yellow-800'
      case 'Advanced':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours > 0) {
      return `${hours}h ${mins}m`
    }
    return `${mins}m`
  }

  if (isLoading) {
    return (
      <div className={cn("flex items-center justify-center p-8", className)}>
        <div className="flex items-center gap-2">
          <RefreshCw className="h-4 w-4 animate-spin" />
          <span>Loading progress data...</span>
        </div>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className={cn("text-center p-8", className)}>
        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
          <BarChart3 className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-2">No Progress Data</h3>
        <p className="text-muted-foreground">Start learning to see your progress here!</p>
      </div>
    )
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Learning Progress Dashboard</h2>
          <p className="text-muted-foreground">Track your learning journey and achievements</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleExportProgress}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <label htmlFor="import-progress">
            <Button variant="outline" size="sm" asChild>
              <span>
                <Upload className="h-4 w-4 mr-2" />
                Import
              </span>
            </Button>
          </label>
          <input
            id="import-progress"
            type="file"
            accept=".json"
            onChange={handleImportProgress}
            className="hidden"
          />
          <Button variant="outline" size="sm" onClick={handleResetProgress}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Reset
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
                <p className="text-2xl font-bold">{stats.completedPaths}</p>
                <p className="text-xs text-muted-foreground">of {stats.totalPaths}</p>
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
                <p className="text-2xl font-bold">{stats.completedModules}</p>
                <p className="text-xs text-muted-foreground">of {stats.totalModules}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Clock className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Time Spent</p>
                <p className="text-2xl font-bold">{formatTime(stats.totalTimeSpent)}</p>
                <p className="text-xs text-muted-foreground">total learning time</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Flame className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Current Streak</p>
                <p className="text-2xl font-bold">{stats.currentStreak}</p>
                <p className="text-xs text-muted-foreground">days in a row</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Progress */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="levels">By Level</TabsTrigger>
          <TabsTrigger value="achievements">Achievements</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Path Progress */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Learning Paths Progress
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Completed</span>
                    <span className="text-sm text-muted-foreground">
                      {stats.completedPaths} / {stats.totalPaths}
                    </span>
                  </div>
                  <Progress 
                    value={stats.totalPaths > 0 ? (stats.completedPaths / stats.totalPaths) * 100 : 0} 
                    className="h-2"
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">In Progress</span>
                    <span className="text-sm text-muted-foreground">
                      {stats.inProgressPaths} / {stats.totalPaths}
                    </span>
                  </div>
                  <Progress 
                    value={stats.totalPaths > 0 ? (stats.inProgressPaths / stats.totalPaths) * 100 : 0} 
                    className="h-2"
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Not Started</span>
                    <span className="text-sm text-muted-foreground">
                      {stats.notStartedPaths} / {stats.totalPaths}
                    </span>
                  </div>
                  <Progress 
                    value={stats.totalPaths > 0 ? (stats.notStartedPaths / stats.totalPaths) * 100 : 0} 
                    className="h-2"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Module Progress */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Modules Progress
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Completed</span>
                    <span className="text-sm text-muted-foreground">
                      {stats.completedModules} / {stats.totalModules}
                    </span>
                  </div>
                  <Progress 
                    value={stats.totalModules > 0 ? (stats.completedModules / stats.totalModules) * 100 : 0} 
                    className="h-2"
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">In Progress</span>
                    <span className="text-sm text-muted-foreground">
                      {stats.inProgressModules} / {stats.totalModules}
                    </span>
                  </div>
                  <Progress 
                    value={stats.totalModules > 0 ? (stats.inProgressModules / stats.totalModules) * 100 : 0} 
                    className="h-2"
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Not Started</span>
                    <span className="text-sm text-muted-foreground">
                      {stats.notStartedModules} / {stats.totalModules}
                    </span>
                  </div>
                  <Progress 
                    value={stats.totalModules > 0 ? (stats.notStartedModules / stats.totalModules) * 100 : 0} 
                    className="h-2"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Learning Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Learning Statistics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary mb-2">
                    {stats.averageScore.toFixed(1)}
                  </div>
                  <div className="text-sm text-muted-foreground">Average Score</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary mb-2">
                    {stats.longestStreak}
                  </div>
                  <div className="text-sm text-muted-foreground">Longest Streak</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary mb-2">
                    {stats.achievements.length}
                  </div>
                  <div className="text-sm text-muted-foreground">Achievements</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="levels" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.entries(stats.levelProgress).map(([level, progress]) => (
              <Card key={level}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Badge className={getLevelColor(level as LearningPathLevel)}>
                      {level}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Completed</span>
                      <span>{progress.completed} / {progress.total}</span>
                    </div>
                    <Progress 
                      value={progress.total > 0 ? (progress.completed / progress.total) * 100 : 0} 
                      className="h-2"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>In Progress</span>
                      <span>{progress.inProgress} / {progress.total}</span>
                    </div>
                    <Progress 
                      value={progress.total > 0 ? (progress.inProgress / progress.total) * 100 : 0} 
                      className="h-2"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Not Started</span>
                      <span>{progress.notStarted} / {progress.total}</span>
                    </div>
                    <Progress 
                      value={progress.total > 0 ? (progress.notStarted / progress.total) * 100 : 0} 
                      className="h-2"
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="achievements" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5" />
                Achievements
              </CardTitle>
            </CardHeader>
            <CardContent>
              {stats.achievements.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {stats.achievements.map((achievement, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                      <div className="p-2 bg-yellow-100 rounded-lg">
                        <Award className="h-5 w-5 text-yellow-600" />
                      </div>
                      <div>
                        <div className="font-medium">{achievement}</div>
                        <div className="text-sm text-muted-foreground">Achievement unlocked</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                    <Trophy className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">No Achievements Yet</h3>
                  <p className="text-muted-foreground">Complete learning paths and modules to unlock achievements!</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Learning Analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                  <BarChart3 className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Analytics Coming Soon</h3>
                <p className="text-muted-foreground">
                  Detailed learning analytics and insights will be available soon.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default LearningProgressDashboard
