"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  Trophy, 
  Award, 
  Star, 
  Crown, 
  Medal, 
  Shield, 
  Gem, 
  Zap, 
  Target, 
  CheckCircle,
  Clock,
  Users,
  BookOpen,
  TrendingUp,
  Flame,
  Calendar,
  Download,
  Share2,
  RefreshCw
} from "lucide-react"
import { LearningPath, LearningModule } from "@/lib/types"
import { achievementService, Achievement, Badge as AchievementBadge } from "@/lib/services/achievementService"
import { progressService } from "@/lib/services/progressService"
import { cn } from "@/lib/utils"

interface CompletionBadgeProps {
  path: LearningPath
  module?: LearningModule
  type: 'path' | 'module'
  onClose?: () => void
  className?: string
}

export function CompletionBadge({ path, module, type, onClose, className }: CompletionBadgeProps) {
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [badges, setBadges] = useState<AchievementBadge[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showDetails, setShowDetails] = useState(false)

  useEffect(() => {
    loadAchievements()
  }, [path, module])

  const loadAchievements = async () => {
    setIsLoading(true)
    try {
      const allAchievements = achievementService.getAchievements()
      const allBadges = achievementService.getBadges()
      
      // Filter achievements and badges that might be relevant to this completion
      const relevantAchievements = allAchievements.filter(achievement => 
        achievement.isUnlocked && 
        (achievement.requirements.some(req => 
          (req.type === 'path_completion' && type === 'path') ||
          (req.type === 'module_completion' && type === 'module')
        ))
      )
      
      const relevantBadges = allBadges.filter(badge => 
        badge.isEarned && 
        (badge.requirements.some(req => 
          (req.type === 'path_completion' && type === 'path') ||
          (req.type === 'module_completion' && type === 'module')
        ))
      )

      setAchievements(relevantAchievements)
      setBadges(relevantBadges)
    } catch (error) {
      console.error('Error loading achievements:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getCompletionIcon = () => {
    if (type === 'path') {
      return <Trophy className="h-8 w-8 text-yellow-500" />
    } else {
      return <Award className="h-8 w-8 text-blue-500" />
    }
  }

  const getCompletionTitle = () => {
    if (type === 'path') {
      return 'Path Completed!'
    } else {
      return 'Module Completed!'
    }
  }

  const getCompletionMessage = () => {
    if (type === 'path') {
      return `Congratulations! You've completed "${path.title}"`
    } else {
      return `Great job! You've completed the "${module?.title}" module`
    }
  }

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common':
        return 'bg-gray-100 text-gray-800'
      case 'uncommon':
        return 'bg-green-100 text-green-800'
      case 'rare':
        return 'bg-blue-100 text-blue-800'
      case 'epic':
        return 'bg-purple-100 text-purple-800'
      case 'legendary':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getBadgeColor = (color: string) => {
    return color
  }

  if (isLoading) {
    return (
      <div className={cn("flex items-center justify-center p-8", className)}>
        <div className="flex items-center gap-2">
          <RefreshCw className="h-4 w-4 animate-spin" />
          <span>Loading completion details...</span>
        </div>
      </div>
    )
  }

  return (
    <Card className={cn("w-full max-w-2xl mx-auto", className)}>
      <CardHeader className="text-center">
        <div className="flex items-center justify-center mb-4">
          <div className="p-4 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full">
            {getCompletionIcon()}
          </div>
        </div>
        <CardTitle className="text-2xl font-bold text-green-600">
          {getCompletionTitle()}
        </CardTitle>
        <p className="text-muted-foreground">
          {getCompletionMessage()}
        </p>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Progress Summary */}
        <div className="bg-muted/30 rounded-lg p-4">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-primary">
                {type === 'path' ? path.modules.length : 1}
              </div>
              <div className="text-sm text-muted-foreground">
                {type === 'path' ? 'Modules' : 'Module'} Completed
              </div>
            </div>
            <div>
              <div className="text-2xl font-bold text-primary">
                {type === 'path' ? path.duration : '1 week'}
              </div>
              <div className="text-sm text-muted-foreground">
                {type === 'path' ? 'Duration' : 'Estimated Time'}
              </div>
            </div>
          </div>
        </div>

        {/* Achievements Earned */}
        {achievements.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-semibold flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-500" />
              Achievements Earned
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {achievements.map((achievement) => (
                <div key={achievement.id} className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg">
                  <div className="text-2xl">{achievement.icon}</div>
                  <div className="flex-1">
                    <div className="font-medium text-sm">{achievement.title}</div>
                    <div className="text-xs text-muted-foreground">{achievement.description}</div>
                  </div>
                  <Badge className={getRarityColor(achievement.rarity)}>
                    {achievement.points} pts
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Badges Earned */}
        {badges.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-semibold flex items-center gap-2">
              <Medal className="h-5 w-5 text-blue-500" />
              Badges Earned
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {badges.map((badge) => (
                <div key={badge.id} className="text-center">
                  <div className={cn(
                    "w-12 h-12 rounded-full flex items-center justify-center text-xl mx-auto mb-2",
                    getBadgeColor(badge.color)
                  )}>
                    {badge.icon}
                  </div>
                  <div className="text-xs font-medium">{badge.title}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Next Steps */}
        <div className="space-y-3">
          <h3 className="font-semibold flex items-center gap-2">
            <Target className="h-5 w-5 text-green-500" />
            What's Next?
          </h3>
          <div className="space-y-2">
            {type === 'path' ? (
              <>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>You've mastered this learning path!</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <TrendingUp className="h-4 w-4 text-blue-500" />
                  <span>Try more advanced paths to continue learning</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Star className="h-4 w-4 text-yellow-500" />
                  <span>Share your achievement with the community</span>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Great progress on this module!</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <BookOpen className="h-4 w-4 text-blue-500" />
                  <span>Continue with the next module in this path</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Target className="h-4 w-4 text-purple-500" />
                  <span>Practice the techniques you've learned</span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-4 border-t">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Download Certificate
            </Button>
            <Button variant="outline" size="sm">
              <Share2 className="h-4 w-4 mr-2" />
              Share Achievement
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setShowDetails(!showDetails)}>
              {showDetails ? 'Hide Details' : 'Show Details'}
            </Button>
            {onClose && (
              <Button size="sm" onClick={onClose}>
                Continue Learning
              </Button>
            )}
          </div>
        </div>

        {/* Detailed Progress */}
        {showDetails && (
          <div className="space-y-4 pt-4 border-t">
            <h4 className="font-medium">Detailed Progress</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="text-sm font-medium">Learning Statistics</div>
                <div className="space-y-1 text-sm text-muted-foreground">
                  <div>Time Spent: {type === 'path' ? path.duration : '1 week'}</div>
                  <div>Difficulty: {type === 'path' ? path.difficulty : module?.difficulty || 'N/A'}</div>
                  <div>Level: {type === 'path' ? path.level : 'N/A'}</div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="text-sm font-medium">Achievement Summary</div>
                <div className="space-y-1 text-sm text-muted-foreground">
                  <div>Achievements: {achievements.length}</div>
                  <div>Badges: {badges.length}</div>
                  <div>Total Points: {achievements.reduce((sum, a) => sum + a.points, 0)}</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default CompletionBadge
