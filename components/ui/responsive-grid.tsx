"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { 
  Grid3X3, 
  Grid2X2, 
  List, 
  LayoutGrid,
  SlidersHorizontal,
  SortAsc,
  SortDesc
} from "lucide-react"
import { cn } from "@/lib/utils"

export type GridLayout = "grid" | "grid-sm" | "list" | "masonry"
export type SortOption = "default" | "name" | "rating" | "difficulty" | "duration" | "progress"
export type SortDirection = "asc" | "desc"

interface ResponsiveGridProps<T> {
  items: T[]
  renderItem: (item: T, index: number) => React.ReactNode
  keyExtractor: (item: T) => string | number
  className?: string
  emptyMessage?: string
  loading?: boolean
  error?: string | null
  onRetry?: () => void
  showLayoutControls?: boolean
  showSortControls?: boolean
  sortOptions?: Array<{ value: SortOption; label: string }>
  onSort?: (option: SortOption, direction: SortDirection) => void
  currentSort?: { option: SortOption; direction: SortDirection }
  itemsPerPage?: number
  showPagination?: boolean
  onPageChange?: (page: number) => void
  currentPage?: number
  totalPages?: number
}

export function ResponsiveGrid<T>({
  items,
  renderItem,
  keyExtractor,
  className,
  emptyMessage = "No items found",
  loading = false,
  error = null,
  onRetry,
  showLayoutControls = true,
  showSortControls = true,
  sortOptions = [
    { value: "default", label: "Default" },
    { value: "name", label: "Name" },
    { value: "rating", label: "Rating" },
    { value: "difficulty", label: "Difficulty" },
    { value: "duration", label: "Duration" },
    { value: "progress", label: "Progress" }
  ],
  onSort,
  currentSort = { option: "default", direction: "desc" },
  itemsPerPage = 12,
  showPagination = false,
  onPageChange,
  currentPage = 1,
  totalPages = 1,
}: ResponsiveGridProps<T>) {
  const [layout, setLayout] = useState<GridLayout>("grid")
  const [isClient, setIsClient] = useState(false)

  // Handle hydration
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Get grid classes based on layout
  const getGridClasses = () => {
    switch (layout) {
      case "grid":
        return "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6"
      case "grid-sm":
        return "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4"
      case "list":
        return "flex flex-col gap-4"
      case "masonry":
        return "columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 md:gap-6"
      default:
        return "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6"
    }
  }

  // Get item classes based on layout
  const getItemClasses = (index: number) => {
    switch (layout) {
      case "list":
        return "w-full"
      case "masonry":
        return "break-inside-avoid mb-4 md:mb-6"
      default:
        return "w-full"
    }
  }

  // Handle layout change
  const handleLayoutChange = (newLayout: GridLayout) => {
    setLayout(newLayout)
  }

  // Handle sort change
  const handleSortChange = (option: SortOption) => {
    if (onSort) {
      const direction = currentSort.option === option && currentSort.direction === "desc" ? "asc" : "desc"
      onSort(option, direction)
    }
  }

  // Render loading state
  if (loading) {
    return (
      <div className="space-y-6">
        {showLayoutControls && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Layout:</span>
              <div className="flex items-center gap-1">
                {[
                  { value: "grid", icon: Grid3X3, label: "Grid" },
                  { value: "grid-sm", icon: Grid2X2, label: "Compact" },
                  { value: "list", icon: List, label: "List" },
                  { value: "masonry", icon: LayoutGrid, label: "Masonry" }
                ].map(({ value, icon: Icon, label }) => (
                  <Button
                    key={value}
                    variant={layout === value ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleLayoutChange(value as GridLayout)}
                    className="h-8 w-8 p-0"
                    title={label}
                  >
                    <Icon className="h-4 w-4" />
                  </Button>
                ))}
              </div>
            </div>
          </div>
        )}
        
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center gap-2">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            <span className="text-muted-foreground">Loading...</span>
          </div>
        </div>
      </div>
    )
  }

  // Render error state
  if (error) {
    return (
      <div className="space-y-6">
        {showLayoutControls && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Layout:</span>
              <div className="flex items-center gap-1">
                {[
                  { value: "grid", icon: Grid3X3, label: "Grid" },
                  { value: "grid-sm", icon: Grid2X2, label: "Compact" },
                  { value: "list", icon: List, label: "List" },
                  { value: "masonry", icon: LayoutGrid, label: "Masonry" }
                ].map(({ value, icon: Icon, label }) => (
                  <Button
                    key={value}
                    variant={layout === value ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleLayoutChange(value as GridLayout)}
                    className="h-8 w-8 p-0"
                    title={label}
                  >
                    <Icon className="h-4 w-4" />
                  </Button>
                ))}
              </div>
            </div>
          </div>
        )}
        
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-destructive mb-4">{error}</p>
            {onRetry && (
              <Button onClick={onRetry}>Retry</Button>
            )}
          </CardContent>
        </Card>
      </div>
    )
  }

  // Render empty state
  if (items.length === 0) {
    return (
      <div className="space-y-6">
        {showLayoutControls && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Layout:</span>
              <div className="flex items-center gap-1">
                {[
                  { value: "grid", icon: Grid3X3, label: "Grid" },
                  { value: "grid-sm", icon: Grid2X2, label: "Compact" },
                  { value: "list", icon: List, label: "List" },
                  { value: "masonry", icon: LayoutGrid, label: "Masonry" }
                ].map(({ value, icon: Icon, label }) => (
                  <Button
                    key={value}
                    variant={layout === value ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleLayoutChange(value as GridLayout)}
                    className="h-8 w-8 p-0"
                    title={label}
                  >
                    <Icon className="h-4 w-4" />
                  </Button>
                ))}
              </div>
            </div>
          </div>
        )}
        
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">{emptyMessage}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Controls */}
      {(showLayoutControls || showSortControls) && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          {/* Layout Controls */}
          {showLayoutControls && (
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Layout:</span>
              <div className="flex items-center gap-1">
                {[
                  { value: "grid", icon: Grid3X3, label: "Grid" },
                  { value: "grid-sm", icon: Grid2X2, label: "Compact" },
                  { value: "list", icon: List, label: "List" },
                  { value: "masonry", icon: LayoutGrid, label: "Masonry" }
                ].map(({ value, icon: Icon, label }) => (
                  <Button
                    key={value}
                    variant={layout === value ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleLayoutChange(value as GridLayout)}
                    className="h-8 w-8 p-0"
                    title={label}
                  >
                    <Icon className="h-4 w-4" />
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Sort Controls */}
          {showSortControls && onSort && (
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Sort by:</span>
              <div className="flex items-center gap-1">
                <select
                  value={currentSort.option}
                  onChange={(e) => handleSortChange(e.target.value as SortOption)}
                  className="px-3 py-1 border border-input rounded-md bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  {sortOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onSort(currentSort.option, currentSort.direction === "asc" ? "desc" : "asc")}
                  className="h-8 w-8 p-0"
                  title={`Sort ${currentSort.direction === "asc" ? "Descending" : "Ascending"}`}
                >
                  {currentSort.direction === "asc" ? (
                    <SortAsc className="h-4 w-4" />
                  ) : (
                    <SortDesc className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Grid Content */}
      <div className={getGridClasses()}>
        {items.map((item, index) => (
          <div key={keyExtractor(item)} className={getItemClasses(index)}>
            {renderItem(item, index)}
          </div>
        ))}
      </div>

      {/* Pagination */}
      {showPagination && totalPages > 1 && onPageChange && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage <= 1}
          >
            Previous
          </Button>
          
          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const page = i + 1
              return (
                <Button
                  key={page}
                  variant={currentPage === page ? "default" : "outline"}
                  size="sm"
                  onClick={() => onPageChange(page)}
                  className="h-8 w-8 p-0"
                >
                  {page}
                </Button>
              )
            })}
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage >= totalPages}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  )
}

export default ResponsiveGrid
