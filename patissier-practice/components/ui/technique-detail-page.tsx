"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { VideoPlayer } from "@/components/ui/video-player"
import { StepImageGallery } from "@/components/ui/step-image-gallery"
import { BookmarkButton, BookmarkBadge } from "@/components/ui/bookmark-button"
import { ProgressIndicator } from "@/components/ui/progress-indicator"
import { useProgress } from "@/lib/contexts/ProgressContext"
import { useFavorites } from "@/lib/contexts/FavoritesContext"
import { 
  Clock, 
  Users, 
  Star, 
  Play, 
  Bookmark, 
  Share2, 
  Heart,
  ArrowLeft,
  X,
  CheckCircle,
  Target,
  TrendingUp,
  Award,
  Lightbulb,
  AlertTriangle,
  Home
} from "lucide-react"
import { Technique, TechniqueStep } from "@/lib/types"
import { cn } from "@/lib/utils"
import Link from "next/link"

interface TechniqueDetailPageProps {
  technique: Technique | null
  onClose?: () => void
  onNext?: () => void
  onPrevious?: () => void
  hasNext?: boolean
  hasPrevious?: boolean
  showNavigation?: boolean
}

export function TechniqueDetailPage({
  technique,
  onClose,
  onNext,
  onPrevious,
  hasNext = false,
  hasPrevious = false,
  showNavigation = true,
}: TechniqueDetailPageProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [activeTab, setActiveTab] = useState("video")
  
  const { getTechniqueProgress, updateTechniqueProgress, markTechniqueComplete } = useProgress()
  const { isFavorite, isBookmarked } = useFavorites()
  
  const progress = technique ? getTechniqueProgress(technique.id) : null

  // Reset current step when technique changes
  useEffect(() => {
    setCurrentStep(0)
  }, [technique?.id])

  if (!technique) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Technique Not Found</h1>
          <p className="text-muted-foreground mb-4">The technique you're looking for doesn't exist.</p>
          <Link href="/">
            <Button>
              <Home className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </Link>
        </div>
      </div>
    )
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

  const handleVideoProgress = (currentTime: number, duration: number) => {
    const progressPercentage = Math.round((currentTime / duration) * 100)
    updateTechniqueProgress(technique.id, {
      completionPercentage: progressPercentage,
      timeSpent: Math.round(currentTime / 60) // Convert to minutes
    })
  }

  const handleVideoComplete = () => {
    markTechniqueComplete(technique.id)
  }

  const handleStepClick = (stepIndex: number) => {
    setCurrentStep(stepIndex)
  }

  const handleNextStep = () => {
    if (currentStep < technique.steps.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePreviousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {onClose ? (
                <Button variant="ghost" size="sm" onClick={onClose}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
              ) : (
                <Link href="/">
                  <Button variant="ghost" size="sm">
                    <Home className="h-4 w-4 mr-2" />
                    Home
                  </Button>
                </Link>
              )}
              
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold">{technique.title}</h1>
                <Badge className={getDifficultyColor(technique.difficulty)}>
                  {technique.difficulty}
                </Badge>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <BookmarkButton 
                techniqueId={technique.id} 
                type="favorite" 
                size="sm" 
                variant="ghost"
              />
              <BookmarkButton 
                techniqueId={technique.id} 
                type="bookmark" 
                size="sm" 
                variant="ghost"
              />
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary">
                <Share2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Content Area */}
          <div className="lg:col-span-3">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="video" className="flex items-center gap-2">
                  <Play className="h-4 w-4" />
                  Video Tutorial
                </TabsTrigger>
                <TabsTrigger value="steps" className="flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  Step by Step
                </TabsTrigger>
                <TabsTrigger value="details" className="flex items-center gap-2">
                  <Award className="h-4 w-4" />
                  Details
                </TabsTrigger>
              </TabsList>

              <TabsContent value="video" className="space-y-4">
                {/* Progress Overview */}
                {progress && progress.completionPercentage > 0 && (
                  <div className="bg-muted/30 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold flex items-center gap-2">
                        <TrendingUp className="h-4 w-4" />
                        Your Progress
                      </h3>
                      <span className="text-sm text-muted-foreground">
                        {progress.timeSpent} min watched
                      </span>
                    </div>
                    <ProgressIndicator
                      progress={progress.completionPercentage}
                      total={100}
                      completed={progress.completionPercentage}
                      showPercentage={true}
                      showCount={false}
                      size="md"
                      variant={progress.isCompleted ? "success" : "default"}
                    />
                  </div>
                )}
                
                <div className="aspect-video bg-black rounded-lg overflow-hidden">
                  <VideoPlayer
                    src={technique.videoUrl || ""}
                    poster={technique.image}
                    title={technique.title}
                    className="w-full h-full"
                    onProgress={handleVideoProgress}
                    onComplete={handleVideoComplete}
                  />
                </div>
              </TabsContent>

              <TabsContent value="steps" className="space-y-4">
                <StepImageGallery
                  steps={technique.steps}
                  currentStep={currentStep}
                  onStepChange={setCurrentStep}
                  className="min-h-[500px]"
                  showNavigation={true}
                  showThumbnails={true}
                  autoPlay={false}
                />
              </TabsContent>

              <TabsContent value="details" className="space-y-6">
                {/* Progress Summary */}
                {progress && (
                  <div className="bg-gradient-to-r from-primary/5 to-primary/10 rounded-lg p-4">
                    <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                      <TrendingUp className="h-5 w-5" />
                      Your Learning Progress
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-primary">{progress.completionPercentage}%</div>
                        <div className="text-sm text-muted-foreground">Complete</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-primary">{progress.timeSpent}</div>
                        <div className="text-sm text-muted-foreground">Minutes Spent</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-primary">
                          {progress.isCompleted ? "✓" : "○"}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {progress.isCompleted ? "Completed" : "In Progress"}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div>
                  <h3 className="text-lg font-semibold mb-3">About This Technique</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {technique.description}
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {technique.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">Statistics</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Duration:</span>
                      <span className="ml-2 font-medium">{technique.duration}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Difficulty:</span>
                      <span className="ml-2 font-medium">{technique.difficulty}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Rating:</span>
                      <span className="ml-2 font-medium">{technique.rating}/5</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Students:</span>
                      <span className="ml-2 font-medium">{technique.students.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Tips and Warnings */}
                {technique.steps && technique.steps.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                      <Lightbulb className="h-5 w-5" />
                      Key Tips
                    </h3>
                    <div className="space-y-3">
                      {technique.steps.map((step, index) => (
                        <div key={step.id} className="space-y-2">
                          {step.tips && step.tips.length > 0 && (
                            <div className="bg-blue-50 rounded-lg p-3">
                              <h4 className="font-medium text-blue-900 mb-2">Step {step.stepNumber}: {step.title}</h4>
                              <ul className="space-y-1">
                                {step.tips.map((tip, tipIndex) => (
                                  <li key={tipIndex} className="text-sm text-blue-800 flex items-start gap-2">
                                    <span className="text-blue-500 mt-1">•</span>
                                    {tip}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                          {step.warnings && step.warnings.length > 0 && (
                            <div className="bg-orange-50 rounded-lg p-3">
                              <h4 className="font-medium text-orange-900 mb-2 flex items-center gap-2">
                                <AlertTriangle className="h-4 w-4" />
                                Important Warnings
                              </h4>
                              <ul className="space-y-1">
                                {step.warnings.map((warning, warningIndex) => (
                                  <li key={warningIndex} className="text-sm text-orange-800 flex items-start gap-2">
                                    <span className="text-orange-500 mt-1">•</span>
                                    {warning}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Technique Info Card */}
            <div className="bg-card rounded-lg border p-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">Technique Info</h3>
                  {progress?.isCompleted && (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  )}
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>{technique.duration}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span>{technique.students.toLocaleString()} students</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4 text-yellow-500" />
                    <span>{technique.rating}/5</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <BookmarkButton 
                    techniqueId={technique.id} 
                    type="favorite" 
                    size="sm" 
                    variant="outline"
                    showLabel={true}
                  />
                  <BookmarkButton 
                    techniqueId={technique.id} 
                    type="bookmark" 
                    size="sm" 
                    variant="outline"
                    showLabel={true}
                  />
                </div>
              </div>
            </div>

            {/* Navigation */}
            {showNavigation && (hasNext || hasPrevious) && (
              <div className="bg-card rounded-lg border p-4">
                <h3 className="font-semibold mb-3">Navigation</h3>
                <div className="space-y-2">
                  {hasPrevious && (
                    <Button variant="outline" className="w-full justify-start" onClick={onPrevious}>
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Previous Technique
                    </Button>
                  )}
                  {hasNext && (
                    <Button variant="outline" className="w-full justify-start" onClick={onNext}>
                      Next Technique
                      <ArrowLeft className="h-4 w-4 ml-2 rotate-180" />
                    </Button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

export default TechniqueDetailPage
