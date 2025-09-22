"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  TrendingUp, 
  Target, 
  Clock, 
  Trophy, 
  Award,
  Download,
  Upload,
  RotateCcw,
  X,
  CheckCircle,
  Star,
  Calendar
} from "lucide-react"
import { Technique, TechniqueProgress } from "@/lib/types"
import { useProgress } from "@/lib/contexts/ProgressContext"
import { ProgressIndicator, TechniqueProgressCard, UserStatsCard } from "@/components/ui/progress-indicator"
import { cn } from "@/lib/utils"

interface ProgressDashboardProps {
  isOpen: boolean
  onClose: () => void
  techniques: Technique[]
}

export function ProgressDashboard({ isOpen, onClose, techniques }: ProgressDashboardProps) {
  const {
    userProgress,
    techniqueProgress,
    getOverallProgress,
    getCategoryProgress,
    markTechniqueComplete,
    markTechniqueIncomplete,
    resetProgress,
    exportProgress,
    importProgress
  } = useProgress()

  const [activeTab, setActiveTab] = useState("overview")
  const [showResetConfirm, setShowResetConfirm] = useState(false)

  // Calculate category progress
  const categoryProgress = techniques.reduce((acc, technique) => {
    const category = technique.category
    if (!acc[category]) {
      acc[category] = { total: 0, completed: 0 }
    }
    acc[category].total += 1
    const progress = techniqueProgress[technique.id]
    if (progress?.isCompleted) {
      acc[category].completed += 1
    }
    return acc
  }, {} as Record<string, { total: number; completed: number }>)

  // Get techniques with progress
  const techniquesWithProgress = techniques.map(technique => ({
    ...technique,
    progress: techniqueProgress[technique.id] || {
      techniqueId: technique.id,
      isCompleted: false,
      completionPercentage: 0,
      timeSpent: 0,
      lastAccessed: new Date().toISOString(),
      stepsCompleted: [],
      notes: '',
      rating: 0,
      difficulty: technique.difficulty
    }
  }))

  // Sort techniques by progress
  const sortedTechniques = techniquesWithProgress.sort((a, b) => {
    const aProgress = a.progress.completionPercentage
    const bProgress = b.progress.completionPercentage
    if (aProgress === bProgress) {
      return (b.progress.lastAccessed || '').localeCompare(a.progress.lastAccessed || '')
    }
    return bProgress - aProgress
  })

  const handleToggleComplete = (techniqueId: number) => {
    const progress = techniqueProgress[techniqueId]
    if (progress?.isCompleted) {
      markTechniqueIncomplete(techniqueId)
    } else {
      markTechniqueComplete(techniqueId)
    }
  }

  const handleExport = () => {
    const data = exportProgress()
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `patissier-progress-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const data = e.target?.result as string
        if (importProgress(data)) {
          alert('Progress imported successfully!')
        } else {
          alert('Failed to import progress data.')
        }
      }
      reader.readAsText(file)
    }
  }

  const handleReset = () => {
    resetProgress()
    setShowResetConfirm(false)
  }

  const overallProgress = getOverallProgress()

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden p-0">
        <div className="flex flex-col h-full">
          {/* Header */}
          <DialogHeader className="p-6 pb-4 border-b">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <DialogTitle className="text-2xl font-bold mb-2 flex items-center gap-2">
                  <Trophy className="h-6 w-6 text-primary" />
                  Progress Dashboard
                </DialogTitle>
                <p className="text-muted-foreground text-lg">
                  Track your learning journey and celebrate achievements
                </p>
              </div>
              <div className="flex items-center gap-2 ml-4">
                <Button variant="outline" size="sm" onClick={handleExport}>
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
                <label className="cursor-pointer">
                  <Button variant="outline" size="sm" asChild>
                    <span>
                      <Upload className="h-4 w-4 mr-2" />
                      Import
                    </span>
                  </Button>
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImport}
                    className="hidden"
                  />
                </label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowResetConfirm(true)}
                  className="text-destructive hover:text-destructive"
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Reset
                </Button>
                <Button variant="ghost" size="sm" onClick={onClose} className="text-muted-foreground hover:text-primary">
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </DialogHeader>

          {/* Content */}
          <div className="flex-1 overflow-hidden">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
              <TabsList className="grid w-full grid-cols-4 mx-6 mt-4">
                <TabsTrigger value="overview" className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Overview
                </TabsTrigger>
                <TabsTrigger value="techniques" className="flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  Techniques
                </TabsTrigger>
                <TabsTrigger value="categories" className="flex items-center gap-2">
                  <Award className="h-4 w-4" />
                  Categories
                </TabsTrigger>
                <TabsTrigger value="achievements" className="flex items-center gap-2">
                  <Trophy className="h-4 w-4" />
                  Achievements
                </TabsTrigger>
              </TabsList>

              <div className="flex-1 overflow-hidden">
                <TabsContent value="overview" className="h-full mt-0">
                  <div className="p-6 h-full overflow-y-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      {/* User Stats */}
                      <div className="lg:col-span-1">
                        <UserStatsCard
                          level={parseInt(userProgress.level) || 1}
                          experience={userProgress.experience}
                          nextLevelExperience={userProgress.nextLevelExperience}
                          totalTechniquesCompleted={userProgress.totalTechniquesCompleted}
                          totalTimeSpent={userProgress.totalTimeSpent}
                          currentStreak={userProgress.currentStreak}
                          longestStreak={userProgress.longestStreak}
                        />
                      </div>

                      {/* Overall Progress */}
                      <div className="lg:col-span-2 space-y-6">
                        <Card>
                          <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                              <TrendingUp className="h-5 w-5 text-primary" />
                              Overall Progress
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <ProgressIndicator
                              progress={overallProgress}
                              total={100}
                              completed={userProgress.totalTechniquesCompleted}
                              label="Techniques Completed"
                              showPercentage={true}
                              showCount={true}
                              size="lg"
                              variant="success"
                            />
                          </CardContent>
                        </Card>

                        {/* Recent Activity */}
                        <Card>
                          <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                              <Clock className="h-5 w-5 text-primary" />
                              Recent Activity
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-3">
                              {sortedTechniques.slice(0, 5).map((technique) => (
                                <div key={technique.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                                  <div className="flex items-center gap-3">
                                    <div className="w-2 h-2 rounded-full bg-primary" />
                                    <span className="font-medium">{technique.title}</span>
                                    <Badge variant="secondary" className="text-xs">
                                      {technique.category}
                                    </Badge>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm text-muted-foreground">
                                      {technique.progress.completionPercentage}%
                                    </span>
                                    {technique.progress.isCompleted && (
                                      <CheckCircle className="h-4 w-4 text-green-500" />
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="techniques" className="h-full mt-0">
                  <div className="p-6 h-full overflow-y-auto">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold">All Techniques</h3>
                        <Badge variant="secondary">
                          {userProgress.totalTechniquesCompleted} of {techniques.length} completed
                        </Badge>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {sortedTechniques.map((technique) => (
                          <TechniqueProgressCard
                            key={technique.id}
                            techniqueId={technique.id}
                            title={technique.title}
                            progress={technique.progress.completionPercentage}
                            isCompleted={technique.progress.isCompleted}
                            timeSpent={technique.progress.timeSpent}
                            lastAccessed={technique.progress.lastAccessed}
                            difficulty={technique.difficulty}
                            onToggleComplete={handleToggleComplete}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="categories" className="h-full mt-0">
                  <div className="p-6 h-full overflow-y-auto">
                    <div className="space-y-6">
                      <h3 className="text-lg font-semibold">Progress by Category</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {Object.entries(categoryProgress).map(([category, progress]) => {
                          const percentage = Math.round((progress.completed / progress.total) * 100)
                          return (
                            <Card key={category}>
                              <CardHeader>
                                <CardTitle className="text-lg">{category}</CardTitle>
                              </CardHeader>
                              <CardContent>
                                <ProgressIndicator
                                  progress={percentage}
                                  total={100}
                                  completed={progress.completed}
                                  label={`${progress.completed} of ${progress.total} techniques`}
                                  showPercentage={true}
                                  showCount={false}
                                  size="md"
                                  variant={percentage === 100 ? "success" : "default"}
                                />
                              </CardContent>
                            </Card>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="achievements" className="h-full mt-0">
                  <div className="p-6 h-full overflow-y-auto">
                    <div className="space-y-6">
                      <h3 className="text-lg font-semibold">Achievements</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {/* Placeholder achievements - these would be dynamic based on user progress */}
                        <Card className="opacity-50">
                          <CardContent className="p-6 text-center">
                            <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                            <h4 className="font-semibold mb-2">First Steps</h4>
                            <p className="text-sm text-muted-foreground">Complete your first technique</p>
                          </CardContent>
                        </Card>
                        <Card className="opacity-50">
                          <CardContent className="p-6 text-center">
                            <Star className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                            <h4 className="font-semibold mb-2">Rising Star</h4>
                            <p className="text-sm text-muted-foreground">Complete 10 techniques</p>
                          </CardContent>
                        </Card>
                        <Card className="opacity-50">
                          <CardContent className="p-6 text-center">
                            <Award className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                            <h4 className="font-semibold mb-2">Master Chef</h4>
                            <p className="text-sm text-muted-foreground">Complete all techniques</p>
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </div>
            </Tabs>
          </div>
        </div>

        {/* Reset Confirmation Dialog */}
        {showResetConfirm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <Card className="w-96">
              <CardHeader>
                <CardTitle className="text-destructive">Reset Progress</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  Are you sure you want to reset all your progress? This action cannot be undone.
                </p>
                <div className="flex gap-2 justify-end">
                  <Button variant="outline" onClick={() => setShowResetConfirm(false)}>
                    Cancel
                  </Button>
                  <Button variant="destructive" onClick={handleReset}>
                    Reset Progress
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

export default ProgressDashboard
