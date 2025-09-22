"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Play, Clock, Users, Star, Loader2 } from "lucide-react"
import { Technique, TechniqueCategory, TechniqueFilters } from "@/lib/types"
import { useTechniques } from "@/lib/hooks/useTechniques"
import { TechniqueDetailModal } from "@/components/ui/technique-detail-modal"
import { TechniqueFiltersComponent } from "@/components/ui/technique-filters"
import { TechniqueImageGallery } from "@/components/ui/technique-image-gallery"
import { FavoritesManager } from "@/components/ui/favorites-manager"
import { BookmarkButton, BookmarkBadge } from "@/components/ui/bookmark-button"
import { ProgressDashboard } from "@/components/ui/progress-dashboard"
import { ResponsiveGrid, GridLayout, SortOption, SortDirection } from "@/components/ui/responsive-grid"
import { TechniqueCard } from "@/components/ui/technique-card"
import { useProgress } from "@/lib/contexts/ProgressContext"
import { useReviews } from "@/lib/contexts/ReviewContext"

// Helper function to group techniques by category
function groupTechniquesByCategory(techniques: Technique[]) {
  return techniques.reduce((acc, technique) => {
    const category = technique.category.toLowerCase().replace(/\s+/g, '-')
    if (!acc[category]) {
      acc[category] = []
    }
    acc[category].push(technique)
    return acc
  }, {} as Record<string, Technique[]>)
}


export function TechniqueLibrary() {
  const [selectedCategory, setSelectedCategory] = useState<TechniqueCategory>("Fundamentals")
  const [selectedTechnique, setSelectedTechnique] = useState<Technique | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isImageGalleryOpen, setIsImageGalleryOpen] = useState(false)
  const [isFavoritesOpen, setIsFavoritesOpen] = useState(false)
  const [isProgressOpen, setIsProgressOpen] = useState(false)
  const [filters, setFilters] = useState<TechniqueFilters>({})
  const [gridLayout, setGridLayout] = useState<GridLayout>("grid")
  const [sortOption, setSortOption] = useState<SortOption>("default")
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc")
  const { techniques, loading, error, searchTechniques, filterTechniques } = useTechniques(filters)
  const { getTechniqueProgress, markTechniqueComplete, markTechniqueIncomplete } = useProgress()

  // Group techniques by category
  const groupedTechniques = groupTechniquesByCategory(techniques)

  // Handle filter changes
  const handleFiltersChange = (newFilters: TechniqueFilters) => {
    setFilters(newFilters)
    filterTechniques(newFilters)
  }

  // Handle clear filters
  const handleClearFilters = () => {
    setFilters({})
    filterTechniques({})
  }

  // Handle category change
  const handleCategoryChange = async (category: TechniqueCategory) => {
    setSelectedCategory(category)
    const newFilters = { ...filters, category }
    setFilters(newFilters)
    await filterTechniques(newFilters)
  }

  // Sort techniques
  const sortTechniques = (techniques: Technique[]) => {
    return [...techniques].sort((a, b) => {
      let comparison = 0
      
      switch (sortOption) {
        case "name":
          comparison = a.title.localeCompare(b.title)
          break
        case "rating":
          comparison = (a.rating || 0) - (b.rating || 0)
          break
        case "difficulty":
          const difficultyOrder = { "Beginner": 1, "Intermediate": 2, "Advanced": 3 }
          comparison = (difficultyOrder[a.difficulty as keyof typeof difficultyOrder] || 0) - 
                      (difficultyOrder[b.difficulty as keyof typeof difficultyOrder] || 0)
          break
        case "duration":
          // Extract minutes from duration string (e.g., "15 min" -> 15)
          const getMinutes = (duration: string) => {
            const match = duration.match(/(\d+)/)
            return match ? parseInt(match[1]) : 0
          }
          comparison = getMinutes(a.duration) - getMinutes(b.duration)
          break
        case "progress":
          const progressA = getTechniqueProgress(a.id)
          const progressB = getTechniqueProgress(b.id)
          comparison = progressA.completionPercentage - progressB.completionPercentage
          break
        default:
          return 0
      }
      
      return sortDirection === "asc" ? comparison : -comparison
    })
  }

  // Get techniques for current category
  const getCurrentTechniques = () => {
    let currentTechniques: Technique[]
    if (filters.search) {
      currentTechniques = techniques
    } else {
      const categoryKey = selectedCategory.toLowerCase().replace(/\s+/g, '-')
      currentTechniques = groupedTechniques[categoryKey] || []
    }
    
    return sortTechniques(currentTechniques)
  }

  const currentTechniques = getCurrentTechniques()

  // Handle technique selection
  const handleTechniqueClick = (technique: Technique) => {
    setSelectedTechnique(technique)
    setIsModalOpen(true)
  }

  // Handle modal close
  const handleModalClose = () => {
    setIsModalOpen(false)
    setSelectedTechnique(null)
  }

  // Handle image gallery
  const handleImageGalleryOpen = (technique: Technique) => {
    setSelectedTechnique(technique)
    setIsImageGalleryOpen(true)
  }

  const handleImageGalleryClose = () => {
    setIsImageGalleryOpen(false)
    setSelectedTechnique(null)
  }

  // Handle favorites manager
  const handleFavoritesOpen = () => {
    setIsFavoritesOpen(true)
  }

  const handleFavoritesClose = () => {
    setIsFavoritesOpen(false)
  }

  // Handle progress dashboard
  const handleProgressOpen = () => {
    setIsProgressOpen(true)
  }

  const handleProgressClose = () => {
    setIsProgressOpen(false)
  }

  // Handle sort change
  const handleSortChange = (option: SortOption, direction: SortDirection) => {
    setSortOption(option)
    setSortDirection(direction)
  }

  return (
    <section id="techniques" className="py-20 px-4">
      <div className="container mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Technique Library</h2>
          <p className="text-xl text-muted-foreground text-balance max-w-2xl mx-auto">
            Master essential pastry techniques with our comprehensive video library, organized by skill level and pastry
            type.
          </p>
        </div>

        {/* Search and Filter Bar */}
        <div className="mb-8">
          <TechniqueFiltersComponent
            filters={filters}
            onFiltersChange={handleFiltersChange}
            onClearFilters={handleClearFilters}
          />
        </div>

        <Tabs value={selectedCategory} onValueChange={(value) => handleCategoryChange(value as TechniqueCategory)} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="Fundamentals" className="text-sm font-medium">
              Fundamentals
            </TabsTrigger>
            <TabsTrigger value="Cakes & Desserts" className="text-sm font-medium">
              Cakes & Desserts
            </TabsTrigger>
            <TabsTrigger value="Viennoiserie" className="text-sm font-medium">
              Viennoiserie
            </TabsTrigger>
          </TabsList>

          <TabsContent value="Fundamentals">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2 text-muted-foreground">Loading techniques...</span>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <p className="text-destructive mb-4">Error loading techniques: {error}</p>
                <Button onClick={() => window.location.reload()}>Retry</Button>
              </div>
            ) : (
              <ResponsiveGrid
                items={currentTechniques}
                renderItem={(technique) => (
                  <TechniqueCard
                    technique={technique}
                    layout={gridLayout}
                    onImageGalleryOpen={handleImageGalleryOpen}
                    onTechniqueClick={handleTechniqueClick}
                    onToggleComplete={(techniqueId) => {
                      const progress = getTechniqueProgress(techniqueId)
                      if (progress.isCompleted) {
                        markTechniqueIncomplete(techniqueId)
                      } else {
                        markTechniqueComplete(techniqueId)
                      }
                    }}
                  />
                )}
                keyExtractor={(technique) => technique.id}
                loading={loading}
                error={error}
                onRetry={() => window.location.reload()}
                showLayoutControls={true}
                showSortControls={true}
                onSort={handleSortChange}
                currentSort={{ option: sortOption, direction: sortDirection }}
                emptyMessage="No techniques found for this category."
              />
            )}
          </TabsContent>

          <TabsContent value="Cakes & Desserts">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2 text-muted-foreground">Loading techniques...</span>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <p className="text-destructive mb-4">Error loading techniques: {error}</p>
                <Button onClick={() => window.location.reload()}>Retry</Button>
              </div>
            ) : (
              <ResponsiveGrid
                items={currentTechniques}
                renderItem={(technique) => (
                  <TechniqueCard
                    technique={technique}
                    layout={gridLayout}
                    onImageGalleryOpen={handleImageGalleryOpen}
                    onTechniqueClick={handleTechniqueClick}
                    onToggleComplete={(techniqueId) => {
                      const progress = getTechniqueProgress(techniqueId)
                      if (progress.isCompleted) {
                        markTechniqueIncomplete(techniqueId)
                      } else {
                        markTechniqueComplete(techniqueId)
                      }
                    }}
                  />
                )}
                keyExtractor={(technique) => technique.id}
                loading={loading}
                error={error}
                onRetry={() => window.location.reload()}
                showLayoutControls={true}
                showSortControls={true}
                onSort={handleSortChange}
                currentSort={{ option: sortOption, direction: sortDirection }}
                emptyMessage="No techniques found for this category."
              />
            )}
          </TabsContent>

          <TabsContent value="Viennoiserie">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2 text-muted-foreground">Loading techniques...</span>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <p className="text-destructive mb-4">Error loading techniques: {error}</p>
                <Button onClick={() => window.location.reload()}>Retry</Button>
              </div>
            ) : (
              <ResponsiveGrid
                items={currentTechniques}
                renderItem={(technique) => (
                  <TechniqueCard
                    technique={technique}
                    layout={gridLayout}
                    onImageGalleryOpen={handleImageGalleryOpen}
                    onTechniqueClick={handleTechniqueClick}
                    onToggleComplete={(techniqueId) => {
                      const progress = getTechniqueProgress(techniqueId)
                      if (progress.isCompleted) {
                        markTechniqueIncomplete(techniqueId)
                      } else {
                        markTechniqueComplete(techniqueId)
                      }
                    }}
                  />
                )}
                keyExtractor={(technique) => technique.id}
                loading={loading}
                error={error}
                onRetry={() => window.location.reload()}
                showLayoutControls={true}
                showSortControls={true}
                onSort={handleSortChange}
                currentSort={{ option: sortOption, direction: sortDirection }}
                emptyMessage="No techniques found for this category."
              />
            )}
          </TabsContent>
        </Tabs>

        <div className="text-center mt-12">
          <Button variant="outline" size="lg">
            Browse All Techniques
          </Button>
        </div>
      </div>

      {/* Technique Detail Modal */}
      <TechniqueDetailModal
        technique={selectedTechnique}
        isOpen={isModalOpen}
        onClose={handleModalClose}
      />

      {/* Technique Image Gallery */}
      <TechniqueImageGallery
        technique={selectedTechnique}
        isOpen={isImageGalleryOpen}
        onClose={handleImageGalleryClose}
      />

      {/* Favorites Manager */}
      <FavoritesManager
        isOpen={isFavoritesOpen}
        onClose={handleFavoritesClose}
        techniques={techniques}
      />

      {/* Progress Dashboard */}
      <ProgressDashboard
        isOpen={isProgressOpen}
        onClose={handleProgressClose}
        techniques={techniques}
      />
    </section>
  )
}
