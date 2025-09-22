"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  ChevronLeft, 
  ChevronRight, 
  Play, 
  Pause,
  Maximize,
  RotateCcw
} from "lucide-react"
import { cn } from "@/lib/utils"

interface ImageCarouselProps {
  images: string[]
  titles?: string[]
  descriptions?: string[]
  className?: string
  autoPlay?: boolean
  autoPlayInterval?: number
  showThumbnails?: boolean
  showControls?: boolean
  aspectRatio?: "square" | "video" | "portrait" | "landscape"
}

export function ImageCarousel({
  images,
  titles = [],
  descriptions = [],
  className,
  autoPlay = false,
  autoPlayInterval = 4000,
  showThumbnails = true,
  showControls = true,
  aspectRatio = "video",
}: ImageCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [zoom, setZoom] = useState(1)
  const [rotation, setRotation] = useState(0)
  const carouselRef = useRef<HTMLDivElement>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  const currentImage = images[currentIndex]
  const currentTitle = titles[currentIndex] || `Image ${currentIndex + 1}`
  const currentDescription = descriptions[currentIndex] || ""

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
    if (isPlaying && autoPlay && images.length > 1) {
      intervalRef.current = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % images.length)
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
  }, [isPlaying, autoPlay, autoPlayInterval, images.length])

  // Navigation functions
  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length)
  }

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length)
  }

  const goToImage = (index: number) => {
    setCurrentIndex(index)
  }

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
      carouselRef.current?.requestFullscreen()
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
          goToPrevious()
          break
        case 'ArrowRight':
          e.preventDefault()
          goToNext()
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
  }, [isFullscreen])

  // Get aspect ratio class
  const getAspectRatioClass = () => {
    switch (aspectRatio) {
      case "square":
        return "aspect-square"
      case "video":
        return "aspect-video"
      case "portrait":
        return "aspect-[3/4]"
      case "landscape":
        return "aspect-[4/3]"
      default:
        return "aspect-video"
    }
  }

  if (!images.length) {
    return (
      <div className={cn("flex items-center justify-center h-64 bg-muted rounded-lg", className)}>
        <p className="text-muted-foreground">No images available</p>
      </div>
    )
  }

  return (
    <div
      ref={carouselRef}
      className={cn(
        "relative bg-black rounded-lg overflow-hidden group",
        isFullscreen && "fixed inset-0 z-50 rounded-none",
        className
      )}
    >
      {/* Main Image Display */}
      <div className={cn("relative bg-gray-900", getAspectRatioClass())}>
        <img
          src={currentImage}
          alt={currentTitle}
          className="w-full h-full object-contain"
          style={{
            transform: `scale(${zoom}) rotate(${rotation}deg)`,
            transition: 'transform 0.3s ease',
          }}
        />

        {/* Image Overlay Controls */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          {/* Top Controls */}
          <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="bg-white/90 text-gray-900">
                {currentIndex + 1} of {images.length}
              </Badge>
              {autoPlay && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleAutoPlay}
                  className="text-white hover:bg-white/20"
                >
                  {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                </Button>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleZoomOut}
                className="text-white hover:bg-white/20"
              >
                Zoom Out
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
                Zoom In
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
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleFullscreen}
                className="text-white hover:bg-white/20"
              >
                <Maximize className="h-4 w-4" />
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

          {/* Navigation Controls */}
          {showControls && images.length > 1 && (
            <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
              <Button
                variant="ghost"
                size="sm"
                onClick={goToPrevious}
                className="text-white hover:bg-white/20"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={goToNext}
                className="text-white hover:bg-white/20"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Image Information */}
      {(currentTitle || currentDescription) && (
        <div className="p-4 bg-background">
          {currentTitle && (
            <h3 className="font-semibold text-lg mb-1">{currentTitle}</h3>
          )}
          {currentDescription && (
            <p className="text-muted-foreground text-sm">{currentDescription}</p>
          )}
        </div>
      )}

      {/* Thumbnail Navigation */}
      {showThumbnails && images.length > 1 && (
        <div className="p-4 bg-muted/30 border-t">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {images.map((image, index) => (
              <button
                key={index}
                onClick={() => goToImage(index)}
                className={cn(
                  "flex-shrink-0 w-20 h-16 rounded-lg overflow-hidden border-2 transition-all",
                  currentIndex === index
                    ? "border-primary ring-2 ring-primary/20"
                    : "border-border hover:border-primary/50"
                )}
              >
                <img
                  src={image}
                  alt={titles[index] || `Image ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Progress Indicators */}
      {images.length > 1 && (
        <div className="px-4 pb-4">
          <div className="flex justify-center gap-1">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={() => goToImage(index)}
                className={cn(
                  "w-2 h-2 rounded-full transition-all",
                  currentIndex === index
                    ? "bg-primary w-6"
                    : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
                )}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default ImageCarousel
