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
  ChevronLeft,
  PlayCircle,
  PauseCircle,
  RotateCcw,
  FileText,
  Video,
  Image,
  Download as DownloadIcon,
  ExternalLink,
  BookmarkPlus,
  BookmarkMinus
} from "lucide-react"
import { LearningPath, LearningModule, ModuleType } from "@/lib/types"
import { progressService } from "@/lib/services/progressService"
import { learningPathBookmarkService } from "@/lib/services/learningPathBookmarkService"
import { cn } from "@/lib/utils"

interface ModuleDetailProps {
  path: LearningPath
  module: LearningModule
  onBack?: () => void
  onPathSelect?: (path: LearningPath) => void
  onNextModule?: (module: LearningModule) => void
  onPrevModule?: (module: LearningModule) => void
  className?: string
}

export function ModuleDetail({ 
  path, 
  module, 
  onBack,
  onPathSelect,
  onNextModule,
  onPrevModule,
  className 
}: ModuleDetailProps) {
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [progress, setProgress] = useState(0)
  const [isCompleted, setIsCompleted] = useState(false)
  const [activeTab, setActiveTab] = useState('content')
  const [isLoading, setIsLoading] = useState(true)
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set())

  useEffect(() => {
    loadModuleData()
  }, [module])

  const loadModuleData = async () => {
    setIsLoading(true)
    try {
      // Load progress data
      const moduleProgress = progressService.getModuleProgress(module.id)
      setProgress(moduleProgress?.completionPercentage || 0)
      setIsCompleted((moduleProgress?.completionPercentage || 0) >= 100)

      // Check bookmark status
      const bookmark = learningPathBookmarkService.getBookmark(path.id)
      setIsBookmarked(!!bookmark)
    } catch (error) {
      console.error('Error loading module data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleBookmark = () => {
    if (isBookmarked) {
      learningPathBookmarkService.removeBookmark(path.id)
      setIsBookmarked(false)
    } else {
      learningPathBookmarkService.bookmarkPath(path)
      setIsBookmarked(true)
    }
  }

  const handleComplete = () => {
    // Mark module as completed
    progressService.updateModuleProgress(module.id, path.id, { completionPercentage: 100 })
    setProgress(100)
    setIsCompleted(true)
    
    // Update path progress
    learningPathBookmarkService.updateProgress(path.id)
  }

  const handleStart = () => {
    if (onPathSelect) {
      onPathSelect(path)
    }
  }

  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections)
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId)
    } else {
      newExpanded.add(sectionId)
    }
    setExpandedSections(newExpanded)
  }

  const getModuleTypeIcon = (type: ModuleType) => {
    switch (type) {
      case 'video':
        return <Video className="h-5 w-5" />
      case 'reading':
        return <FileText className="h-5 w-5" />
      case 'assignment':
        return <Award className="h-5 w-5" />
      case 'quiz':
        return <Target className="h-5 w-5" />
      default:
        return <BookOpen className="h-5 w-5" />
    }
  }

  const getModuleTypeColor = (type: ModuleType) => {
    switch (type) {
      case 'video':
        return 'bg-red-100 text-red-800'
      case 'reading':
        return 'bg-blue-100 text-blue-800'
      case 'assignment':
        return 'bg-green-100 text-green-800'
      case 'quiz':
        return 'bg-purple-100 text-purple-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getProgressColor = (progress: number) => {
    if (progress >= 100) return 'text-green-600'
    if (progress >= 75) return 'text-blue-600'
    if (progress >= 50) return 'text-yellow-600'
    if (progress >= 25) return 'text-orange-600'
    return 'text-red-600'
  }

  if (isLoading) {
    return (
      <div className={cn("flex items-center justify-center p-8", className)}>
        <div className="flex items-center gap-2">
          <RefreshCw className="h-4 w-4 animate-spin" />
          <span>Loading module details...</span>
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
            <div className="flex items-center gap-2 mb-2">
              <Badge className={getModuleTypeColor(module.type)}>
                {getModuleTypeIcon(module.type)}
                <span className="ml-1">{module.type}</span>
              </Badge>
              <Badge variant="outline">
                {module.estimatedMinutes} min
              </Badge>
              {isCompleted && (
                <Badge className="bg-green-100 text-green-800">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Completed
                </Badge>
              )}
            </div>
            <h1 className="text-3xl font-bold">{module.title}</h1>
            <p className="text-muted-foreground text-lg">{module.shortDescription}</p>
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
          <Button variant="outline">
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
        </div>
      </div>

      {/* Progress Bar */}
      <Card>
        <CardContent className="p-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Module Progress</span>
              <span className={cn("text-sm font-medium", getProgressColor(progress))}>
                {progress.toFixed(0)}%
              </span>
            </div>
            <Progress value={progress} className="h-3" />
            {!isCompleted && (
              <div className="flex items-center justify-center pt-2">
                <Button onClick={handleComplete} size="sm">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Mark as Completed
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="resources">Resources</TabsTrigger>
          <TabsTrigger value="notes">Notes</TabsTrigger>
        </TabsList>

        <TabsContent value="content" className="space-y-6 mt-6">
          {/* Module Content */}
          {module.content && (
            <Card>
              <CardHeader>
                <CardTitle>Module Content</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none">
                  {module.content.map((content, index) => (
                    <div key={index} className="mb-6">
                      {content.type === 'video' && (
                        <div className="space-y-4">
                          <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                            <div className="text-center">
                              <Video className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                              <p className="text-muted-foreground">Video: {content.title}</p>
                              <p className="text-sm text-muted-foreground">{content.duration}</p>
                            </div>
                          </div>
                          <div>
                            <h3 className="font-semibold mb-2">{content.title}</h3>
                            <p className="text-muted-foreground">{content.description}</p>
                          </div>
                        </div>
                      )}
                      
                      {content.type === 'text' && (
                        <div className="space-y-4">
                          <h3 className="font-semibold text-lg">{content.title}</h3>
                          <div className="prose max-w-none">
                            <p className="text-muted-foreground leading-relaxed">{content.content}</p>
                          </div>
                        </div>
                      )}
                      
                      {content.type === 'image' && (
                        <div className="space-y-4">
                          <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
                            <div className="text-center">
                              <Image className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                              <p className="text-muted-foreground">Image: {content.title}</p>
                            </div>
                          </div>
                          <div>
                            <h3 className="font-semibold mb-2">{content.title}</h3>
                            <p className="text-muted-foreground">{content.description}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Learning Objectives */}
          <Card>
            <CardHeader>
              <CardTitle>Learning Objectives</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Understand the fundamental concepts of this module</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Apply the techniques learned in practical exercises</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Demonstrate mastery through completion activities</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="resources" className="space-y-6 mt-6">
          {/* Downloadable Resources */}
          <Card>
            <CardHeader>
              <CardTitle>Downloadable Resources</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-blue-500" />
                    <div>
                      <p className="font-medium">Module Guide</p>
                      <p className="text-sm text-muted-foreground">PDF • 2.3 MB</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    <DownloadIcon className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Image className="h-5 w-5 text-green-500" />
                    <div>
                      <p className="font-medium">Reference Images</p>
                      <p className="text-sm text-muted-foreground">ZIP • 5.1 MB</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    <DownloadIcon className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Video className="h-5 w-5 text-red-500" />
                    <div>
                      <p className="font-medium">Video Transcripts</p>
                      <p className="text-sm text-muted-foreground">TXT • 156 KB</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    <DownloadIcon className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* External Links */}
          <Card>
            <CardHeader>
              <CardTitle>Additional Resources</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <ExternalLink className="h-5 w-5 text-blue-500" />
                    <div>
                      <p className="font-medium">Official Documentation</p>
                      <p className="text-sm text-muted-foreground">Learn more about this topic</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Visit
                  </Button>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <ExternalLink className="h-5 w-5 text-green-500" />
                    <div>
                      <p className="font-medium">Practice Exercises</p>
                      <p className="text-sm text-muted-foreground">Hands-on practice materials</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Visit
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notes" className="space-y-6 mt-6">
          <Card>
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Notes Coming Soon</h3>
              <p className="text-muted-foreground">
                Note-taking functionality will be available in a future update.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Navigation */}
      <div className="flex items-center justify-between pt-6 border-t">
        <div className="flex items-center gap-4">
          {onPrevModule && (
            <Button variant="outline" onClick={() => onPrevModule(module)}>
              <ChevronLeft className="h-4 w-4 mr-2" />
              Previous Module
            </Button>
          )}
        </div>
        <div className="flex items-center gap-4">
          <Button onClick={handleStart}>
            <Play className="h-4 w-4 mr-2" />
            {progress > 0 ? 'Continue' : 'Start Module'}
          </Button>
          {onNextModule && (
            <Button onClick={() => onNextModule(module)}>
              Next Module
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

export default ModuleDetail
