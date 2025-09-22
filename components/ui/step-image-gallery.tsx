"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  ChevronLeft, 
  ChevronRight, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Play, 
  Pause,
  Maximize,
  Minimize,
  X,
  Clock,
  Lightbulb,
  AlertTriangle
} from "lucide-react"
import { TechniqueStep } from "@/lib/types"
import { cn } from "@/lib/utils"

interface StepImageGalleryProps {
  steps: TechniqueStep[]
  currentStep?: number
  onStepChange?: (stepIndex: number) => void
  className?: string
  showNavigation?: boolean
  showThumbnails?: boolean
  autoPlay?: boolean
  autoPlayInterval?: number
}

export function StepImageGallery({
  steps,
  currentStep = 0,
  onStepChange,
  className,
  showNavigation = true,
  showThumbnails = true,
  autoPlay = false,
  autoPlayInterval = 3000,
}: StepImageGalleryProps) {
  const [selectedStep, setSelectedStep] = useState(currentStep)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [zoom, setZoom] = useState(1)
  const [rotation, setRotation] = useState(0)
  const [showTips, setShowTips] = useState(true)
  const [showWarnings, setShowWarnings] = useState(true)
  const galleryRef = useRef<HTMLDivElement>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  const currentStepData = steps[selectedStep]

  // Early return if no step data
  if (!currentStepData) {
    return (
      <div className="w-full h-96 bg-gray-100 rounded-lg flex items-center justify-center">
        <p className="text-gray-500">No step data available</p>
      </div>
    )
  }

  // Handle step change
  const handleStepChange = (stepIndex: number) => {
    if (stepIndex >= 0 && stepIndex < steps.length) {
      setSelectedStep(stepIndex)
      onStepChange?.(stepIndex)
    }
  }

  // Navigation functions
  const goToNextStep = () => {
    if (selectedStep < steps.length - 1) {
      handleStepChange(selectedStep + 1)
    }
  }

  const goToPreviousStep = () => {
    if (selectedStep > 0) {
      handleStepChange(selectedStep - 1)
    }
  }

  // Auto-play functionality
  const toggleAutoPlay = () => {
    if (isPlaying) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
      setIsPlaying(false)
    } else {
      setIsPlaying(true)
    }
  }

  useEffect(() => {
    if (isPlaying && autoPlay) {
      intervalRef.current = setInterval(() => {
        if (selectedStep < steps.length - 1) {
          goToNextStep()
        } else {
          setIsPlaying(false)
        }
      }, autoPlayInterval)
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isPlaying, selectedStep, steps.length, autoPlay, autoPlayInterval])

  // Zoom and rotation functions
  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.25, 3))
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.25, 0.5))
  const handleRotate = () => setRotation(prev => (prev + 90) % 360)
  const handleReset = () => {
    setZoom(1)
    setRotation(0)
  }

  // Fullscreen functionality
  const toggleFullscreen = () => {
    if (!isFullscreen) {
      galleryRef.current?.requestFullscreen()
      setIsFullscreen(true)
    } else {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isFullscreen) return

      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault()
          goToPreviousStep()
          break
        case 'ArrowRight':
          e.preventDefault()
          goToNextStep()
          break
        case ' ':
          e.preventDefault()
          toggleAutoPlay()
          break
        case 'Escape':
          e.preventDefault()
          if (isFullscreen) {
            document.exitFullscreen()
            setIsFullscreen(false)
          }
          break
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [selectedStep, isFullscreen])

  // Update selected step when currentStep prop changes
  useEffect(() => {
    setSelectedStep(currentStep)
  }, [currentStep])

  if (!currentStepData) {
    return (
      <div className={cn("flex items-center justify-center h-64 bg-muted rounded-lg", className)}>
        <p className="text-muted-foreground">No steps available</p>
      </div>
    )
  }

  return (
    <div
      ref={galleryRef}
      className={cn(
        "relative bg-black rounded-lg overflow-hidden",
        isFullscreen && "fixed inset-0 z-50 rounded-none",
        className
      )}
    >
      {/* Main Image Display */}
      <div className="relative aspect-video bg-gray-900">
        {currentStepData.image ? (
          <img
            src={currentStepData.image}
            alt={currentStepData.title}
            className="w-full h-full object-contain"
            style={{
              transform: `scale(${zoom}) rotate(${rotation}deg)`,
              transition: 'transform 0.3s ease',
            }}
          />
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            <div className="text-center">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="h-8 w-8" />
              </div>
              <p className="text-lg font-medium">{currentStepData.title}</p>
              <p className="text-sm">No image available for this step</p>
            </div>
          </div>
        )}

        {/* Image Overlay Controls */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent">
          {/* Top Controls */}
          <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-white/90 text-gray-900">
                Step {selectedStep + 1} of {steps.length}
              </Badge>
              {currentStepData.duration && (
                <Badge variant="secondary" className="bg-white/90 text-gray-900">
                  <Clock className="h-3 w-3 mr-1" />
                  {currentStepData.duration}
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleFullscreen}
                className="text-white hover:bg-white/20"
              >
                {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          {/* Center Play/Pause Button */}
          {autoPlay && (
            <div className="absolute inset-0 flex items-center justify-center">
              <Button
                size="lg"
                onClick={toggleAutoPlay}
                className="w-16 h-16 rounded-full bg-white/20 hover:bg-white/30 text-white"
              >
                {isPlaying ? <Pause className="h-8 w-8" /> : <Play className="h-8 w-8 ml-1" />}
              </Button>
            </div>
          )}

          {/* Bottom Controls */}
          <div className="absolute bottom-4 left-4 right-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={goToPreviousStep}
                  disabled={selectedStep === 0}
                  className="text-white hover:bg-white/20 disabled:opacity-50"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={goToNextStep}
                  disabled={selectedStep === steps.length - 1}
                  className="text-white hover:bg-white/20 disabled:opacity-50"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleZoomOut}
                  className="text-white hover:bg-white/20"
                >
                  <ZoomOut className="h-4 w-4" />
                </Button>
                <span className="text-white text-sm font-mono min-w-[3rem] text-center">
                  {Math.round(zoom * 100)}%
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleZoomIn}
                  className="text-white hover:bg-white/20"
                >
                  <ZoomIn className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRotate}
                  className="text-white hover:bg-white/20"
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleReset}
                  className="text-white hover:bg-white/20"
                >
                  Reset
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Step Information */}
      <div className="p-4 bg-background">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="font-semibold text-lg">{currentStepData.title}</h3>
            <p className="text-muted-foreground text-sm">{currentStepData.description}</p>
          </div>
          <div className="flex items-center gap-2">
            {currentStepData.tips && currentStepData.tips.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowTips(!showTips)}
                className={cn(
                  "text-blue-600 hover:bg-blue-50",
                  showTips && "bg-blue-50"
                )}
              >
                <Lightbulb className="h-4 w-4 mr-1" />
                Tips
              </Button>
            )}
            {currentStepData.warnings && currentStepData.warnings.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowWarnings(!showWarnings)}
                className={cn(
                  "text-orange-600 hover:bg-orange-50",
                  showWarnings && "bg-orange-50"
                )}
              >
                <AlertTriangle className="h-4 w-4 mr-1" />
                Warnings
              </Button>
            )}
          </div>
        </div>

        {/* Tips and Warnings */}
        {(showTips || showWarnings) && (
          <div className="space-y-3">
            {showTips && currentStepData.tips && currentStepData.tips.length > 0 && (
              <div className="p-3 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2 flex items-center gap-2">
                  <Lightbulb className="h-4 w-4" />
                  Tips
                </h4>
                <ul className="space-y-1">
                  {currentStepData.tips.map((tip, index) => (
                    <li key={index} className="text-sm text-blue-800 flex items-start gap-2">
                      <span className="text-blue-500 mt-1">•</span>
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {showWarnings && currentStepData.warnings && currentStepData.warnings.length > 0 && (
              <div className="p-3 bg-orange-50 rounded-lg">
                <h4 className="font-medium text-orange-900 mb-2 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  Warnings
                </h4>
                <ul className="space-y-1">
                  {currentStepData.warnings.map((warning, index) => (
                    <li key={index} className="text-sm text-orange-800 flex items-start gap-2">
                      <span className="text-orange-500 mt-1">•</span>
                      {warning}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Thumbnail Navigation */}
      {showThumbnails && steps.length > 1 && (
        <div className="p-4 bg-muted/30 border-t">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {steps.map((step, index) => (
              <button
                key={step.id}
                onClick={() => handleStepChange(index)}
                className={cn(
                  "flex-shrink-0 w-20 h-16 rounded-lg overflow-hidden border-2 transition-all",
                  selectedStep === index
                    ? "border-primary ring-2 ring-primary/20"
                    : "border-border hover:border-primary/50"
                )}
              >
                {step.image ? (
                  <img
                    src={step.image}
                    alt={step.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-muted flex items-center justify-center">
                    <Clock className="h-6 w-6 text-muted-foreground" />
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Progress Bar */}
      {showNavigation && steps.length > 1 && (
        <div className="px-4 pb-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground min-w-[3rem]">
              {selectedStep + 1}/{steps.length}
            </span>
            <div className="flex-1 bg-muted rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${((selectedStep + 1) / steps.length) * 100}%` }}
              />
            </div>
            <span className="text-sm text-muted-foreground">
              {Math.round(((selectedStep + 1) / steps.length) * 100)}%
            </span>
          </div>
        </div>
      )}
    </div>
  )
}

export default StepImageGallery
