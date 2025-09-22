"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from "@/components/ui/popover"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { 
  Filter, 
  X, 
  Clock, 
  Star, 
  Tag,
  Search,
  RotateCcw
} from "lucide-react"
import { TechniqueFilters, TechniqueCategory, DifficultyLevel } from "@/lib/types"
import { cn } from "@/lib/utils"

interface TechniqueFiltersProps {
  filters: TechniqueFilters
  onFiltersChange: (filters: TechniqueFilters) => void
  onClearFilters: () => void
  className?: string
}

const DURATION_OPTIONS = [
  { value: "0-15", label: "Under 15 min" },
  { value: "15-30", label: "15-30 min" },
  { value: "30-60", label: "30-60 min" },
  { value: "60+", label: "Over 1 hour" },
]

const RATING_OPTIONS = [
  { value: "4.5", label: "4.5+ stars" },
  { value: "4.0", label: "4.0+ stars" },
  { value: "3.5", label: "3.5+ stars" },
  { value: "3.0", label: "3.0+ stars" },
]

const DIFFICULTY_OPTIONS: { value: DifficultyLevel; label: string }[] = [
  { value: "Beginner", label: "Beginner" },
  { value: "Intermediate", label: "Intermediate" },
  { value: "Advanced", label: "Advanced" },
]

const CATEGORY_OPTIONS: { value: TechniqueCategory; label: string }[] = [
  { value: "Fundamentals", label: "Fundamentals" },
  { value: "Cakes & Desserts", label: "Cakes & Desserts" },
  { value: "Viennoiserie", label: "Viennoiserie" },
]

const POPULAR_TAGS = [
  "chocolate", "pastry", "french", "basics", "advanced", 
  "cakes", "cookies", "bread", "decorating", "tempering"
]

export function TechniqueFiltersComponent({
  filters,
  onFiltersChange,
  onClearFilters,
  className,
}: TechniqueFiltersProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [localFilters, setLocalFilters] = useState<TechniqueFilters>(filters)

  const handleFilterChange = (key: keyof TechniqueFilters, value: any) => {
    const newFilters = { ...localFilters, [key]: value }
    setLocalFilters(newFilters)
  }

  const handleApplyFilters = () => {
    onFiltersChange(localFilters)
    setIsOpen(false)
  }

  const handleClearFilters = () => {
    const clearedFilters: TechniqueFilters = {}
    setLocalFilters(clearedFilters)
    onClearFilters()
    setIsOpen(false)
  }

  const handleTagToggle = (tag: string) => {
    const currentTags = localFilters.tags || []
    const newTags = currentTags.includes(tag)
      ? currentTags.filter(t => t !== tag)
      : [...currentTags, tag]
    
    handleFilterChange('tags', newTags)
  }

  const getActiveFiltersCount = () => {
    let count = 0
    if (filters.category) count++
    if (filters.difficulty) count++
    if (filters.duration) count++
    if (filters.rating) count++
    if (filters.tags && filters.tags.length > 0) count++
    return count
  }

  const activeFiltersCount = getActiveFiltersCount()

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {/* Search Input */}
      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <input
          type="text"
          placeholder="Search techniques..."
          value={filters.search || ""}
          onChange={(e) => onFiltersChange({ ...filters, search: e.target.value })}
          className="w-full pl-10 pr-4 py-2 border border-input rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
        />
        {filters.search && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onFiltersChange({ ...filters, search: "" })}
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>

      {/* Filter Button */}
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filters
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 flex items-center justify-center text-xs">
                {activeFiltersCount}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-4" align="end">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Filter Techniques</h3>
              {activeFiltersCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearFilters}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <RotateCcw className="h-4 w-4 mr-1" />
                  Clear All
                </Button>
              )}
            </div>

            {/* Category Filter */}
            <div>
              <label className="text-sm font-medium mb-2 block">Category</label>
              <Select
                value={localFilters.category || ""}
                onValueChange={(value) => handleFilterChange('category', value || undefined)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All categories</SelectItem>
                  {CATEGORY_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Difficulty Filter */}
            <div>
              <label className="text-sm font-medium mb-2 block">Difficulty</label>
              <Select
                value={localFilters.difficulty || ""}
                onValueChange={(value) => handleFilterChange('difficulty', value || undefined)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All levels" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All levels</SelectItem>
                  {DIFFICULTY_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Duration Filter */}
            <div>
              <label className="text-sm font-medium mb-2 block">Duration</label>
              <Select
                value={localFilters.duration || ""}
                onValueChange={(value) => handleFilterChange('duration', value || undefined)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Any duration" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Any duration</SelectItem>
                  {DURATION_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Rating Filter */}
            <div>
              <label className="text-sm font-medium mb-2 block">Minimum Rating</label>
              <Select
                value={localFilters.rating?.toString() || ""}
                onValueChange={(value) => handleFilterChange('rating', value ? parseFloat(value) : undefined)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Any rating" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Any rating</SelectItem>
                  {RATING_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Tags Filter */}
            <div>
              <label className="text-sm font-medium mb-2 block">Tags</label>
              <div className="flex flex-wrap gap-2">
                {POPULAR_TAGS.map((tag) => (
                  <Button
                    key={tag}
                    variant={localFilters.tags?.includes(tag) ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleTagToggle(tag)}
                    className="text-xs"
                  >
                    <Tag className="h-3 w-3 mr-1" />
                    {tag}
                  </Button>
                ))}
              </div>
              {localFilters.tags && localFilters.tags.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {localFilters.tags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="secondary"
                      className="text-xs cursor-pointer hover:bg-destructive hover:text-destructive-foreground"
                      onClick={() => handleTagToggle(tag)}
                    >
                      {tag}
                      <X className="h-3 w-3 ml-1" />
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => setIsOpen(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleApplyFilters}
                className="flex-1"
              >
                Apply Filters
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {/* Active Filters Display */}
      {activeFiltersCount > 0 && (
        <div className="hidden md:flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Active filters:</span>
          <div className="flex flex-wrap gap-1">
            {filters.category && (
              <Badge variant="secondary" className="text-xs">
                {filters.category}
                <X 
                  className="h-3 w-3 ml-1 cursor-pointer" 
                  onClick={() => onFiltersChange({ ...filters, category: undefined })}
                />
              </Badge>
            )}
            {filters.difficulty && (
              <Badge variant="secondary" className="text-xs">
                {filters.difficulty}
                <X 
                  className="h-3 w-3 ml-1 cursor-pointer" 
                  onClick={() => onFiltersChange({ ...filters, difficulty: undefined })}
                />
              </Badge>
            )}
            {filters.duration && (
              <Badge variant="secondary" className="text-xs">
                {filters.duration}
                <X 
                  className="h-3 w-3 ml-1 cursor-pointer" 
                  onClick={() => onFiltersChange({ ...filters, duration: undefined })}
                />
              </Badge>
            )}
            {filters.rating && (
              <Badge variant="secondary" className="text-xs">
                {filters.rating}+ stars
                <X 
                  className="h-3 w-3 ml-1 cursor-pointer" 
                  onClick={() => onFiltersChange({ ...filters, rating: undefined })}
                />
              </Badge>
            )}
            {filters.tags && filters.tags.length > 0 && (
              <Badge variant="secondary" className="text-xs">
                {filters.tags.length} tags
                <X 
                  className="h-3 w-3 ml-1 cursor-pointer" 
                  onClick={() => onFiltersChange({ ...filters, tags: undefined })}
                />
              </Badge>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default TechniqueFiltersComponent
