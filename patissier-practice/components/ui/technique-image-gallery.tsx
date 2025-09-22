"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  ChevronLeft, 
  ChevronRight, 
  Maximize,
  X,
  Play,
  Clock
} from "lucide-react"
import { Technique } from "@/lib/types"
import { cn } from "@/lib/utils"

interface TechniqueImageGalleryProps {
  technique: Technique | null
  isOpen: boolean
  onClose: () => void
  className?: string
}

export function TechniqueImageGallery({
  technique,
  isOpen,
  onClose,
  className,
}: TechniqueImageGalleryProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  // Early return if technique is null or undefined
  if (!technique) {
    return null
  }

  // Collect all images from the technique
  const images = [
    { src: technique.image, title: technique.title, description: technique.description },
    ...technique.steps
      .filter(step => step.image)
      .map(step => ({
        src: step.image!,
        title: step.title,
        description: step.description
      }))
  ]

  const currentImage = images[currentImageIndex]

  const goToNext = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length)
  }

  const goToPrevious = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length)
  }

  const goToImage = (index: number) => {
    setCurrentImageIndex(index)
  }

  if (!isOpen || images.length === 0) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden p-0">
        <div className="flex flex-col h-full">
          {/* Header */}
          <DialogHeader className="p-6 pb-4 border-b">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <DialogTitle className="text-2xl font-bold mb-2">
                  {technique.title} - Image Gallery
                </DialogTitle>
                <p className="text-muted-foreground text-lg">
                  Step-by-step visual guide
                </p>
              </div>
              <div className="flex items-center gap-2 ml-4">
                <Button variant="ghost" size="sm" onClick={onClose} className="text-muted-foreground hover:text-primary">
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </DialogHeader>

          {/* Main Image Display */}
          <div className="flex-1 p-6">
            <div className="relative aspect-video bg-black rounded-lg overflow-hidden mb-4">
              <img
                src={currentImage.src}
                alt={currentImage.title}
                className="w-full h-full object-contain"
              />

              {/* Navigation Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300">
                <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
                  <Badge variant="secondary" className="bg-white/90 text-gray-900">
                    {currentImageIndex + 1} of {images.length}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-white hover:bg-white/20"
                  >
                    <Maximize className="h-4 w-4" />
                  </Button>
                </div>

                <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={goToPrevious}
                    disabled={images.length <= 1}
                    className="text-white hover:bg-white/20 disabled:opacity-50"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={goToNext}
                    disabled={images.length <= 1}
                    className="text-white hover:bg-white/20 disabled:opacity-50"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Image Information */}
            <div className="text-center">
              <h3 className="font-semibold text-lg mb-2">{currentImage.title}</h3>
              <p className="text-muted-foreground text-sm">{currentImage.description}</p>
            </div>
          </div>

          {/* Thumbnail Navigation */}
          {images.length > 1 && (
            <div className="p-6 pt-0 border-t">
              <div className="flex gap-2 overflow-x-auto pb-2">
                {images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => goToImage(index)}
                    className={cn(
                      "flex-shrink-0 w-20 h-16 rounded-lg overflow-hidden border-2 transition-all",
                      currentImageIndex === index
                        ? "border-primary ring-2 ring-primary/20"
                        : "border-border hover:border-primary/50"
                    )}
                  >
                    <img
                      src={image.src}
                      alt={image.title}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Progress Indicators */}
          {images.length > 1 && (
            <div className="px-6 pb-6">
              <div className="flex justify-center gap-1">
                {images.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => goToImage(index)}
                    className={cn(
                      "w-2 h-2 rounded-full transition-all",
                      currentImageIndex === index
                        ? "bg-primary w-6"
                        : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
                    )}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default TechniqueImageGallery
