"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Filter, 
  Search, 
  X, 
  RefreshCw, 
  Download, 
  Upload, 
  Settings,
  Target,
  Clock,
  Star,
  Users,
  Award,
  BookOpen,
  Zap,
  TrendingUp,
  Calendar,
  User
} from "lucide-react"
import { LearningPath, LearningPathLevel, DifficultyLevel } from "@/lib/types"
import { learningPathFilterService, LearningPathFilters, FilterGroup, FilterStats } from "@/lib/services/learningPathFilterService"
import { cn } from "@/lib/utils"

interface LearningPathFilterProps {
  paths: LearningPath[]
  onFiltersChange: (filters: LearningPathFilters) => void
  onClearFilters: () => void
  className?: string
}

export function LearningPathFilter({ 
  paths, 
  onFiltersChange, 
  onClearFilters,
  className 
}: LearningPathFilterProps) {
  const [filters, setFilters] = useState<LearningPathFilters>({})
  const [filterGroups, setFilterGroups] = useState<FilterGroup[]>([])
  const [stats, setStats] = useState<FilterStats | null>(null)
  const [isExpanded, setIsExpanded] = useState(false)
  const [activeTab, setActiveTab] = useState('basic')

  useEffect(() => {
    loadFilterOptions()
  }, [paths])

  useEffect(() => {
    updateStats()
  }, [filters, paths])

  const loadFilterOptions = () => {
    const groups = learningPathFilterService.getFilterOptions(paths)
    setFilterGroups(groups)
  }

  const updateStats = () => {
    const filterStats = learningPathFilterService.getFilterStats(paths, filters)
    setStats(filterStats)
  }

  const handleFilterChange = (key: keyof LearningPathFilters, value: any) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    onFiltersChange(newFilters)
  }

  const handleClearFilters = () => {
    const clearedFilters = learningPathFilterService.clearFilters()
    setFilters(clearedFilters)
    onClearFilters()
  }

  const handleExportFilters = () => {
    const data = learningPathFilterService.exportFilters(filters)
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'learning-path-filters.json'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleImportFilters = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const data = e.target?.result as string
        const importedFilters = learningPathFilterService.importFilters(data)
        if (importedFilters) {
          setFilters(importedFilters)
          onFiltersChange(importedFilters)
        }
      }
      reader.readAsText(file)
    }
  }

  const getFilterIcon = (key: string) => {
    switch (key) {
      case 'search':
        return <Search className="h-4 w-4" />
      case 'skillLevel':
        return <Target className="h-4 w-4" />
      case 'difficulty':
        return <Award className="h-4 w-4" />
      case 'duration':
      case 'durationRange':
        return <Clock className="h-4 w-4" />
      case 'categories':
        return <BookOpen className="h-4 w-4" />
      case 'tags':
        return <Zap className="h-4 w-4" />
      case 'rating':
        return <Star className="h-4 w-4" />
      case 'studentCount':
        return <Users className="h-4 w-4" />
      case 'completionRate':
        return <TrendingUp className="h-4 w-4" />
      case 'instructor':
        return <User className="h-4 w-4" />
      default:
        return <Filter className="h-4 w-4" />
    }
  }

  const getActiveFiltersCount = () => {
    return Object.keys(filters).filter(key => {
      const value = filters[key as keyof LearningPathFilters]
      if (value === undefined || value === null) return false
      if (typeof value === 'string' && value === '') return false
      if (Array.isArray(value) && value.length === 0) return false
      if (typeof value === 'object' && 'min' in value && 'max' in value) {
        return value.min !== undefined || value.max !== undefined
      }
      return true
    }).length
  }

  const renderFilterControl = (group: FilterGroup) => {
    const value = filters[group.key]

    switch (group.type) {
      case 'search':
        return (
          <Input
            placeholder="Search learning paths..."
            value={filters.search || ''}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            className="w-full"
          />
        )

      case 'select':
        return (
          <Select
            value={value as string || ''}
            onValueChange={(newValue) => handleFilterChange(group.key, newValue || undefined)}
          >
            <SelectTrigger>
              <SelectValue placeholder={`Select ${group.label.toLowerCase()}`} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All {group.label}</SelectItem>
              {group.options?.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label} ({option.count})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )

      case 'multiselect':
        return (
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {group.options?.map((option) => (
              <div key={option.value} className="flex items-center space-x-2">
                <Checkbox
                  id={`${group.key}-${option.value}`}
                  checked={Array.isArray(value) ? value.includes(option.value) : false}
                  onCheckedChange={(checked) => {
                    const currentValues = Array.isArray(value) ? value : []
                    const newValues = checked
                      ? [...currentValues, option.value]
                      : currentValues.filter(v => v !== option.value)
                    handleFilterChange(group.key, newValues.length > 0 ? newValues : undefined)
                  }}
                />
                <Label
                  htmlFor={`${group.key}-${option.value}`}
                  className="text-sm font-normal cursor-pointer"
                >
                  {option.label} ({option.count})
                </Label>
              </div>
            ))}
          </div>
        )

      case 'range':
        if (group.key === 'rating') {
          return (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Rating: {filters.rating?.min || 0} - {filters.rating?.max || 5}</span>
              </div>
              <Slider
                value={[filters.rating?.min || 0, filters.rating?.max || 5]}
                onValueChange={([min, max]) => handleFilterChange('rating', { min, max })}
                min={group.min || 0}
                max={group.max || 5}
                step={0.1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{group.min || 0}</span>
                <span>{group.max || 5}</span>
              </div>
            </div>
          )
        }

        if (group.key === 'studentCount') {
          return (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Students: {filters.studentCount?.min || 0} - {filters.studentCount?.max || '∞'}</span>
              </div>
              <Slider
                value={[filters.studentCount?.min || 0, filters.studentCount?.max || 10000]}
                onValueChange={([min, max]) => handleFilterChange('studentCount', { min, max })}
                min={group.min || 0}
                max={group.max || 10000}
                step={100}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{group.min || 0}</span>
                <span>{group.max || 10000}</span>
              </div>
            </div>
          )
        }

        if (group.key === 'completionRate') {
          return (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Completion: {filters.completionRate?.min || 0}% - {filters.completionRate?.max || 100}%</span>
              </div>
              <Slider
                value={[filters.completionRate?.min || 0, filters.completionRate?.max || 100]}
                onValueChange={([min, max]) => handleFilterChange('completionRate', { min, max })}
                min={group.min || 0}
                max={group.max || 100}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{group.min || 0}%</span>
                <span>{group.max || 100}%</span>
              </div>
            </div>
          )
        }

        if (group.key === 'durationRange') {
          return (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Duration: {filters.durationRange?.min || 0} - {filters.durationRange?.max || 12} weeks</span>
              </div>
              <Slider
                value={[filters.durationRange?.min || 0, filters.durationRange?.max || 12]}
                onValueChange={([min, max]) => handleFilterChange('durationRange', { min, max })}
                min={group.min || 0}
                max={group.max || 12}
                step={0.5}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{group.min || 0}w</span>
                <span>{group.max || 12}w</span>
              </div>
            </div>
          )
        }

        return null

      case 'boolean':
        return (
          <div className="flex items-center space-x-2">
            <Switch
              checked={!!value}
              onCheckedChange={(checked) => handleFilterChange(group.key, checked || undefined)}
            />
            <Label className="text-sm">Enable {group.label}</Label>
          </div>
        )

      default:
        return null
    }
  }

  const basicFilters = filterGroups.filter(group => 
    ['search', 'skillLevel', 'difficulty', 'duration'].includes(group.key)
  )

  const advancedFilters = filterGroups.filter(group => 
    !['search', 'skillLevel', 'difficulty', 'duration'].includes(group.key)
  )

  return (
    <Card className={cn("", className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filter Learning Paths
            {getActiveFiltersCount() > 0 && (
              <Badge variant="secondary">
                {getActiveFiltersCount()} active
              </Badge>
            )}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? 'Collapse' : 'Expand'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearFilters}
            >
              <X className="h-4 w-4 mr-1" />
              Clear
            </Button>
          </div>
        </div>
        
        {stats && (
          <div className="text-sm text-muted-foreground">
            Showing {stats.filteredPaths} of {stats.totalPaths} learning paths
          </div>
        )}
      </CardHeader>

      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="basic">Basic Filters</TabsTrigger>
            <TabsTrigger value="advanced">Advanced Filters</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-4 mt-4">
            {basicFilters.map((group) => (
              <div key={group.key} className="space-y-2">
                <Label className="flex items-center gap-2">
                  {getFilterIcon(group.key)}
                  {group.label}
                </Label>
                {renderFilterControl(group)}
              </div>
            ))}
          </TabsContent>

          <TabsContent value="advanced" className="space-y-4 mt-4">
            {advancedFilters.map((group) => (
              <div key={group.key} className="space-y-2">
                <Label className="flex items-center gap-2">
                  {getFilterIcon(group.key)}
                  {group.label}
                </Label>
                {renderFilterControl(group)}
              </div>
            ))}

            {/* Advanced Actions */}
            <div className="pt-4 border-t space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Filter Management</h4>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={handleExportFilters}>
                    <Download className="h-4 w-4 mr-1" />
                    Export
                  </Button>
                  <label htmlFor="import-filters">
                    <Button variant="outline" size="sm" asChild>
                      <span>
                        <Upload className="h-4 w-4 mr-1" />
                        Import
                      </span>
                    </Button>
                  </label>
                  <input
                    id="import-filters"
                    type="file"
                    accept=".json"
                    onChange={handleImportFilters}
                    className="hidden"
                  />
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* Active Filters Summary */}
        {getActiveFiltersCount() > 0 && (
          <div className="mt-4 pt-4 border-t">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium">Active Filters</h4>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearFilters}
              >
                Clear All
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {Object.entries(filters).map(([key, value]) => {
                if (!value || (typeof value === 'string' && value === '') || 
                    (Array.isArray(value) && value.length === 0)) return null

                let displayValue = ''
                if (typeof value === 'string') {
                  displayValue = value
                } else if (Array.isArray(value)) {
                  displayValue = value.join(', ')
                } else if (typeof value === 'object' && 'min' in value && 'max' in value) {
                  displayValue = `${value.min} - ${value.max}`
                } else if (typeof value === 'boolean') {
                  displayValue = 'Enabled'
                }

                return (
                  <Badge key={key} variant="secondary" className="flex items-center gap-1">
                    {getFilterIcon(key)}
                    {key}: {displayValue}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-4 w-4 p-0 hover:bg-transparent"
                      onClick={() => handleFilterChange(key as keyof LearningPathFilters, undefined)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                )
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default LearningPathFilter
