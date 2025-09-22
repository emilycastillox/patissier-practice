"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Settings, 
  Target, 
  Star, 
  Clock, 
  Users, 
  TrendingUp, 
  Filter,
  Save,
  RefreshCw,
  Trash2,
  Download,
  Upload,
  Lightbulb,
  Award,
  BookOpen,
  Zap
} from "lucide-react"
import { LearningPathLevel, DifficultyLevel } from "@/lib/types"
import { recommendationService, UserProfile, RecommendationFilters } from "@/lib/services/recommendationService"
import { cn } from "@/lib/utils"

interface RecommendationSettingsProps {
  onSettingsChange?: (settings: RecommendationFilters) => void
  className?: string
}

export function RecommendationSettings({ 
  onSettingsChange,
  className 
}: RecommendationSettingsProps) {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [settings, setSettings] = useState<RecommendationFilters>({})
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    setIsLoading(true)
    try {
      // Load user profile
      const profile = recommendationService.buildUserProfile([])
      setUserProfile(profile)

      // Load saved settings from localStorage
      const savedSettings = localStorage.getItem('patissier-practice-recommendation-settings')
      if (savedSettings) {
        setSettings(JSON.parse(savedSettings))
      }
    } catch (error) {
      console.error('Error loading settings:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSettingChange = (key: keyof RecommendationFilters, value: any) => {
    const newSettings = { ...settings, [key]: value }
    setSettings(newSettings)
    
    if (onSettingsChange) {
      onSettingsChange(newSettings)
    }
  }

  const handleSaveSettings = async () => {
    setIsSaving(true)
    try {
      localStorage.setItem('patissier-practice-recommendation-settings', JSON.stringify(settings))
      // Show success message or notification
    } catch (error) {
      console.error('Error saving settings:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleResetSettings = () => {
    setSettings({})
    if (onSettingsChange) {
      onSettingsChange({})
    }
  }

  const handleExportSettings = () => {
    const data = JSON.stringify(settings, null, 2)
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'recommendation-settings.json'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleImportSettings = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target?.result as string)
          setSettings(data)
          if (onSettingsChange) {
            onSettingsChange(data)
          }
        } catch (error) {
          console.error('Error importing settings:', error)
        }
      }
      reader.readAsText(file)
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

  if (isLoading) {
    return (
      <div className={cn("flex items-center justify-center p-8", className)}>
        <div className="flex items-center gap-2">
          <RefreshCw className="h-4 w-4 animate-spin" />
          <span>Loading settings...</span>
        </div>
      </div>
    )
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Recommendation Settings</h2>
          <p className="text-muted-foreground">
            Customize your learning path recommendations
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleResetSettings}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Reset
          </Button>
          <Button onClick={handleSaveSettings} disabled={isSaving}>
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? 'Saving...' : 'Save Settings'}
          </Button>
        </div>
      </div>

      {/* User Profile Summary */}
      {userProfile && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Your Learning Profile
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary mb-1">
                  {userProfile.skillLevel}
                </div>
                <div className="text-sm text-muted-foreground">Skill Level</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary mb-1">
                  {userProfile.completedPaths.length}
                </div>
                <div className="text-sm text-muted-foreground">Paths Completed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary mb-1">
                  {userProfile.learningStreak}
                </div>
                <div className="text-sm text-muted-foreground">Day Streak</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Settings Tabs */}
      <Tabs defaultValue="filters" className="space-y-4">
        <TabsList>
          <TabsTrigger value="filters">Filters</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
        </TabsList>

        <TabsContent value="filters" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Recommendation Filters
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Skill Level Filter */}
              <div className="space-y-3">
                <label className="text-sm font-medium">Skill Level</label>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={!!settings.skillLevel}
                    onCheckedChange={(checked) => 
                      handleSettingChange('skillLevel', checked ? userProfile?.skillLevel : undefined)
                    }
                  />
                  <span className="text-sm text-muted-foreground">
                    Filter by skill level
                  </span>
                </div>
                {settings.skillLevel && (
                  <div className="flex items-center gap-2">
                    <Badge className={getLevelColor(settings.skillLevel)}>
                      {settings.skillLevel}
                    </Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSettingChange('skillLevel', undefined)}
                    >
                      Clear
                    </Button>
                  </div>
                )}
              </div>

              {/* Difficulty Filter */}
              <div className="space-y-3">
                <label className="text-sm font-medium">Difficulty</label>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={!!settings.difficulty}
                    onCheckedChange={(checked) => 
                      handleSettingChange('difficulty', checked ? userProfile?.preferredDifficulty : undefined)
                    }
                  />
                  <span className="text-sm text-muted-foreground">
                    Filter by difficulty
                  </span>
                </div>
                {settings.difficulty && (
                  <div className="flex items-center gap-2">
                    <Badge className={getDifficultyColor(settings.difficulty)}>
                      {settings.difficulty}
                    </Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSettingChange('difficulty', undefined)}
                    >
                      Clear
                    </Button>
                  </div>
                )}
              </div>

              {/* Duration Filter */}
              <div className="space-y-3">
                <label className="text-sm font-medium">Duration</label>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={!!settings.duration}
                    onCheckedChange={(checked) => 
                      handleSettingChange('duration', checked ? userProfile?.preferredDuration : undefined)
                    }
                  />
                  <span className="text-sm text-muted-foreground">
                    Filter by duration
                  </span>
                </div>
                {settings.duration && (
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">
                      {settings.duration}
                    </Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSettingChange('duration', undefined)}
                    >
                      Clear
                    </Button>
                  </div>
                )}
              </div>

              {/* Exclude Completed */}
              <div className="space-y-3">
                <label className="text-sm font-medium">Exclude Completed</label>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={settings.excludeCompleted || false}
                    onCheckedChange={(checked) => 
                      handleSettingChange('excludeCompleted', checked)
                    }
                  />
                  <span className="text-sm text-muted-foreground">
                    Hide completed learning paths
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preferences" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5" />
                Recommendation Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Minimum Score */}
              <div className="space-y-3">
                <label className="text-sm font-medium">Minimum Rating</label>
                <div className="space-y-2">
                  <Slider
                    value={[settings.minScore || 0]}
                    onValueChange={([value]) => handleSettingChange('minScore', value)}
                    max={5}
                    min={0}
                    step={0.1}
                    className="w-full"
                  />
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>0.0</span>
                    <span className="font-medium">{settings.minScore || 0} stars</span>
                    <span>5.0</span>
                  </div>
                </div>
              </div>

              {/* Maximum Duration */}
              <div className="space-y-3">
                <label className="text-sm font-medium">Maximum Duration</label>
                <select
                  value={settings.maxDuration || ''}
                  onChange={(e) => handleSettingChange('maxDuration', e.target.value || undefined)}
                  className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="">No limit</option>
                  <option value="1 week">1 week</option>
                  <option value="2 weeks">2 weeks</option>
                  <option value="1 month">1 month</option>
                  <option value="2 months">2 months</option>
                  <option value="3 months">3 months</option>
                </select>
              </div>

              {/* Minimum Duration */}
              <div className="space-y-3">
                <label className="text-sm font-medium">Minimum Duration</label>
                <select
                  value={settings.minDuration || ''}
                  onChange={(e) => handleSettingChange('minDuration', e.target.value || undefined)}
                  className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="">No limit</option>
                  <option value="1 week">1 week</option>
                  <option value="2 weeks">2 weeks</option>
                  <option value="1 month">1 month</option>
                  <option value="2 months">2 months</option>
                  <option value="3 months">3 months</option>
                </select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="advanced" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Advanced Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Data Management */}
              <div className="space-y-4">
                <h4 className="font-medium">Data Management</h4>
                <div className="flex items-center gap-2">
                  <Button variant="outline" onClick={handleExportSettings}>
                    <Download className="h-4 w-4 mr-2" />
                    Export Settings
                  </Button>
                  <label htmlFor="import-settings">
                    <Button variant="outline" asChild>
                      <span>
                        <Upload className="h-4 w-4 mr-2" />
                        Import Settings
                      </span>
                    </Button>
                  </label>
                  <input
                    id="import-settings"
                    type="file"
                    accept=".json"
                    onChange={handleImportSettings}
                    className="hidden"
                  />
                </div>
              </div>

              {/* Reset Options */}
              <div className="space-y-4">
                <h4 className="font-medium">Reset Options</h4>
                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    onClick={() => recommendationService.clearRecommendationHistory()}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Clear Recommendation History
                  </Button>
                </div>
              </div>

              {/* Current Settings Display */}
              <div className="space-y-4">
                <h4 className="font-medium">Current Settings</h4>
                <div className="p-4 bg-muted/30 rounded-lg">
                  <pre className="text-sm text-muted-foreground overflow-auto">
                    {JSON.stringify(settings, null, 2)}
                  </pre>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default RecommendationSettings
