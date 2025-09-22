"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Unlock, 
  Lock, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Target, 
  Star, 
  TrendingUp,
  Award,
  BookOpen,
  Play,
  AlertCircle,
  Info,
  Zap,
  RefreshCw,
  Filter,
  Search
} from "lucide-react"
import { LearningPath, LearningModule, LearningPathLevel } from "@/lib/types"
import { prerequisiteService, ModuleUnlockResult, PathUnlockResult } from "@/lib/services/prerequisiteService"
import { progressService } from "@/lib/services/progressService"
import { PrerequisiteVisualizer } from "./prerequisite-visualizer"
import { cn } from "@/lib/utils"

interface ModuleUnlockManagerProps {
  path: LearningPath
  onUnlock?: (result: ModuleUnlockResult) => void
  onPathUnlock?: (result: PathUnlockResult) => void
  className?: string
}

export function ModuleUnlockManager({ 
  path, 
  onUnlock,
  onPathUnlock,
  className 
}: ModuleUnlockManagerProps) {
  const [unlockedModules, setUnlockedModules] = useState<number[]>([])
  const [unlockableModules, setUnlockableModules] = useState<number[]>([])
  const [lockedModules, setLockedModules] = useState<number[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'unlocked' | 'unlockable' | 'locked'>('all')
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    loadModuleStatus()
  }, [path])

  const loadModuleStatus = () => {
    setIsLoading(true)
    try {
      const unlocked = path.modules.filter(m => prerequisiteService.isModuleUnlocked(m.id))
      const unlockable = prerequisiteService.getNextUnlockableModules(path)
      const locked = path.modules.filter(m => 
        !prerequisiteService.isModuleUnlocked(m.id) && 
        !unlockable.includes(m.id)
      )

      setUnlockedModules(unlocked.map(m => m.id))
      setUnlockableModules(unlockable)
      setLockedModules(locked.map(m => m.id))
    } catch (error) {
      console.error('Error loading module status:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleUnlockModule = async (moduleId: number) => {
    try {
      const result = prerequisiteService.unlockModule(moduleId, path)
      loadModuleStatus()
      
      if (onUnlock) {
        onUnlock(result)
      }
    } catch (error) {
      console.error('Error unlocking module:', error)
    }
  }

  const handleUnlockAll = async () => {
    try {
      const results = prerequisiteService.autoUnlockModules(path)
      loadModuleStatus()
      
      results.forEach(result => {
        if (onUnlock) {
          onUnlock(result)
        }
      })
    } catch (error) {
      console.error('Error unlocking modules:', error)
    }
  }

  const getFilteredModules = () => {
    let modules = path.modules

    // Apply status filter
    switch (filter) {
      case 'unlocked':
        modules = modules.filter(m => unlockedModules.includes(m.id))
        break
      case 'unlockable':
        modules = modules.filter(m => unlockableModules.includes(m.id))
        break
      case 'locked':
        modules = modules.filter(m => lockedModules.includes(m.id))
        break
    }

    // Apply search filter
    if (searchQuery) {
      modules = modules.filter(m => 
        m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    return modules
  }

  const getModuleStatus = (module: LearningModule) => {
    if (unlockedModules.includes(module.id)) {
      return { status: 'unlocked', icon: Unlock, color: 'text-green-600' }
    }
    if (unlockableModules.includes(module.id)) {
      return { status: 'unlockable', icon: Zap, color: 'text-blue-600' }
    }
    return { status: 'locked', icon: Lock, color: 'text-gray-400' }
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

  const getStatusBadge = (module: LearningModule) => {
    const status = getModuleStatus(module)
    
    switch (status.status) {
      case 'unlocked':
        return <Badge className="bg-green-100 text-green-800">Unlocked</Badge>
      case 'unlockable':
        return <Badge className="bg-blue-100 text-blue-800">Ready to Unlock</Badge>
      case 'locked':
        return <Badge variant="outline">Locked</Badge>
    }
  }

  if (isLoading) {
    return (
      <div className={cn("flex items-center justify-center p-8", className)}>
        <div className="flex items-center gap-2">
          <RefreshCw className="h-4 w-4 animate-spin" />
          <span>Loading module status...</span>
        </div>
      </div>
    )
  }

  const filteredModules = getFilteredModules()

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Module Unlock Manager</h2>
          <p className="text-muted-foreground">
            Manage module prerequisites and unlocking conditions for {path.title}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={loadModuleStatus}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          {unlockableModules.length > 0 && (
            <Button onClick={handleUnlockAll}>
              <Unlock className="h-4 w-4 mr-2" />
              Unlock All Available
            </Button>
          )}
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-green-100 rounded-lg">
                <Unlock className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Unlocked</p>
                <p className="text-2xl font-bold">{unlockedModules.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Zap className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Ready to Unlock</p>
                <p className="text-2xl font-bold">{unlockableModules.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-gray-100 rounded-lg">
                <Lock className="h-5 w-5 text-gray-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Locked</p>
                <p className="text-2xl font-bold">{lockedModules.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Target className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">{path.modules.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search modules..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-input rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as any)}
                className="px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="all">All Modules</option>
                <option value="unlocked">Unlocked</option>
                <option value="unlockable">Ready to Unlock</option>
                <option value="locked">Locked</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Modules List */}
      <div className="space-y-4">
        {filteredModules.map((module) => {
          const status = getModuleStatus(module)
          const StatusIcon = status.icon
          const moduleProgress = progressService.getModuleProgress(module.id)
          const prerequisites = prerequisiteService.checkModulePrerequisites(module, path)

          return (
            <Card key={module.id} className="group hover:shadow-md transition-all duration-200">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <StatusIcon className={cn("h-5 w-5", status.color)} />
                      <h3 className="text-lg font-semibold">{module.title}</h3>
                      {getStatusBadge(module)}
                    </div>
                    <p className="text-muted-foreground text-sm mb-3">
                      {module.description}
                    </p>
                    <div className="flex items-center gap-2">
                      <Badge className={getDifficultyColor(module.difficulty)}>
                        {module.difficulty}
                      </Badge>
                      <Badge variant="outline">
                        Module {module.order}
                      </Badge>
                      <Badge variant="outline">
                        {module.type}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {status.status === 'unlockable' && (
                      <Button
                        size="sm"
                        onClick={() => handleUnlockModule(module.id)}
                      >
                        <Unlock className="h-4 w-4 mr-1" />
                        Unlock
                      </Button>
                    )}
                    {status.status === 'unlocked' && (
                      <Button variant="outline" size="sm">
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Unlocked
                      </Button>
                    )}
                  </div>
                </div>

                {/* Module Progress */}
                {moduleProgress && (
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <span>Progress</span>
                      <span>{moduleProgress.completionPercentage}%</span>
                    </div>
                    <Progress value={moduleProgress.completionPercentage} className="h-2" />
                  </div>
                )}

                {/* Prerequisites Summary */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Prerequisites</span>
                    <span>
                      {prerequisites.completedPrerequisites.length} / {prerequisites.unlockConditions.length} met
                    </span>
                  </div>
                  <Progress 
                    value={prerequisites.unlockConditions.length > 0 ? 
                      (prerequisites.completedPrerequisites.length / prerequisites.unlockConditions.length) * 100 : 100
                    } 
                    className="h-2" 
                  />
                </div>

                {/* Prerequisites Details */}
                {prerequisites.unlockConditions.length > 0 && (
                  <div className="mt-4 pt-4 border-t">
                    <PrerequisiteVisualizer
                      module={module}
                      path={path}
                      showDetails={false}
                      compact={true}
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Empty State */}
      {filteredModules.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No Modules Found</h3>
            <p className="text-muted-foreground">
              {searchQuery 
                ? "Try adjusting your search terms or filters."
                : "No modules match the current filter criteria."
              }
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default ModuleUnlockManager
