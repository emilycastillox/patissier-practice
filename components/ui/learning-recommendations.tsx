"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './card'
import { Button } from './button'
import { Badge } from './badge'
import { Progress } from './progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './tabs'
import { 
  BookOpen, 
  Clock, 
  Target, 
  Star,
  Play,
  CheckCircle,
  ArrowRight,
  TrendingUp,
  Award,
  Lightbulb,
  Calendar,
  Users
} from 'lucide-react'
import { 
  LearningRecommendation, 
  PersonalizedLearningPath,
  learningRecommendationService 
} from '@/lib/services/learningRecommendationService'
import { AIAnalysisResult } from '@/lib/services/aiService'
import { FeedbackHistoryEntry } from '@/lib/services/feedbackHistoryService'

interface LearningRecommendationsProps {
  analysisResult: AIAnalysisResult
  feedbackHistory?: FeedbackHistoryEntry[]
  onRecommendationClick?: (recommendation: LearningRecommendation) => void
  className?: string
}

export function LearningRecommendations({ 
  analysisResult, 
  feedbackHistory = [], 
  onRecommendationClick,
  className 
}: LearningRecommendationsProps) {
  const [recommendations, setRecommendations] = useState<LearningRecommendation[]>([])
  const [learningPath, setLearningPath] = useState<PersonalizedLearningPath | null>(null)
  const [activeTab, setActiveTab] = useState('recommendations')
  const [completedRecommendations, setCompletedRecommendations] = useState<Set<string>>(new Set())

  useEffect(() => {
    generateRecommendations()
  }, [analysisResult, feedbackHistory])

  const generateRecommendations = () => {
    const recs = learningRecommendationService.generateRecommendations(analysisResult, feedbackHistory)
    const path = learningRecommendationService.createPersonalizedLearningPath(analysisResult, feedbackHistory)
    
    setRecommendations(recs)
    setLearningPath(path)
    
    // Load completed recommendations
    const completed = new Set(
      learningRecommendationService.loadRecommendations()
        .filter(rec => (rec as any).completed)
        .map(rec => rec.id)
    )
    setCompletedRecommendations(completed)
  }

  const handleRecommendationClick = (recommendation: LearningRecommendation) => {
    onRecommendationClick?.(recommendation)
  }

  const handleMarkCompleted = (id: string) => {
    learningRecommendationService.markRecommendationCompleted(id)
    setCompletedRecommendations(prev => new Set(Array.from(prev).concat(id)))
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-50'
      case 'medium': return 'text-yellow-600 bg-yellow-50'
      case 'low': return 'text-green-600 bg-green-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'text-green-600'
      case 'intermediate': return 'text-yellow-600'
      case 'advanced': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'technique': return <Target className="h-4 w-4" />
      case 'recipe': return <BookOpen className="h-4 w-4" />
      case 'course': return <Play className="h-4 w-4" />
      case 'practice': return <Award className="h-4 w-4" />
      default: return <Lightbulb className="h-4 w-4" />
    }
  }

  if (recommendations.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5" />
            Learning Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Award className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Excellent Work!</h3>
            <p className="text-muted-foreground">
              Your pastry skills are impressive! Keep practicing to maintain your high level.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5" />
            Personalized Learning Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
              <TabsTrigger value="learning-path">Learning Path</TabsTrigger>
              <TabsTrigger value="progress">Progress</TabsTrigger>
            </TabsList>

            <TabsContent value="recommendations" className="mt-6">
              <div className="space-y-4">
                {recommendations.map((recommendation) => (
                  <Card 
                    key={recommendation.id} 
                    className={`transition-all hover:shadow-md ${
                      completedRecommendations.has(recommendation.id) 
                        ? 'opacity-75 bg-green-50' 
                        : ''
                    }`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            {getTypeIcon(recommendation.type)}
                            <h3 className="font-medium">{recommendation.title}</h3>
                            <Badge 
                              variant="outline" 
                              className={getPriorityColor(recommendation.priority)}
                            >
                              {recommendation.priority}
                            </Badge>
                            {completedRecommendations.has(recommendation.id) && (
                              <CheckCircle className="h-4 w-4 text-green-600" />
                            )}
                          </div>
                          
                          <p className="text-sm text-muted-foreground mb-3">
                            {recommendation.description}
                          </p>
                          
                          <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {recommendation.estimatedTime}
                            </div>
                            <div className="flex items-center gap-1">
                              <Star className="h-3 w-3" />
                              <span className={getDifficultyColor(recommendation.difficulty)}>
                                {recommendation.difficulty}
                              </span>
                            </div>
                            <Badge variant="secondary" className="text-xs">
                              {recommendation.category}
                            </Badge>
                          </div>
                          
                          <p className="text-xs text-blue-600 mb-3">
                            💡 {recommendation.expectedImprovement}
                          </p>
                          
                          {recommendation.resources && (
                            <div className="space-y-1">
                              {recommendation.resources.videos && (
                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                  <Play className="h-3 w-3" />
                                  {recommendation.resources.videos.length} video(s)
                                </div>
                              )}
                              {recommendation.resources.articles && (
                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                  <BookOpen className="h-3 w-3" />
                                  {recommendation.resources.articles.length} article(s)
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-2 ml-4">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRecommendationClick(recommendation)}
                          >
                            <ArrowRight className="h-4 w-4" />
                          </Button>
                          {!completedRecommendations.has(recommendation.id) && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleMarkCompleted(recommendation.id)}
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="learning-path" className="mt-6">
              {learningPath && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                      <CardContent className="p-4 text-center">
                        <div className="text-2xl font-bold text-primary">
                          {learningPath.currentLevel}
                        </div>
                        <p className="text-sm text-muted-foreground">Current Level</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4 text-center">
                        <div className="text-2xl font-bold text-blue-600">
                          {learningPath.focusAreas.length}
                        </div>
                        <p className="text-sm text-muted-foreground">Focus Areas</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4 text-center">
                        <div className="text-2xl font-bold text-green-600">
                          {learningPath.recommendations.length}
                        </div>
                        <p className="text-sm text-muted-foreground">Recommendations</p>
                      </CardContent>
                    </Card>
                  </div>

                  <div>
                    <h3 className="font-medium mb-3">Focus Areas</h3>
                    <div className="flex flex-wrap gap-2">
                      {learningPath.focusAreas.map((area, index) => (
                        <Badge key={index} variant="outline">
                          {area}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-medium mb-3">Next Steps</h3>
                    <div className="space-y-2">
                      {learningPath.nextSteps.map((step, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-primary rounded-full" />
                          <span className="text-sm">{step}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h3 className="font-medium mb-3">Short-term Goals</h3>
                      <div className="space-y-2">
                        {learningPath.progressGoals.shortTerm.map((goal, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <Target className="h-4 w-4 text-blue-500" />
                            <span className="text-sm">{goal}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h3 className="font-medium mb-3">Long-term Goals</h3>
                      <div className="space-y-2">
                        {learningPath.progressGoals.longTerm.map((goal, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <TrendingUp className="h-4 w-4 text-green-500" />
                            <span className="text-sm">{goal}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="progress" className="mt-6">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {completedRecommendations.size}
                      </div>
                      <p className="text-sm text-muted-foreground">Completed</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {recommendations.length - completedRecommendations.size}
                      </div>
                      <p className="text-sm text-muted-foreground">Remaining</p>
                    </CardContent>
                  </Card>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Overall Progress</span>
                    <span className="text-sm text-muted-foreground">
                      {Math.round((completedRecommendations.size / recommendations.length) * 100)}%
                    </span>
                  </div>
                  <Progress 
                    value={(completedRecommendations.size / recommendations.length) * 100} 
                    className="h-2" 
                  />
                </div>

                <div>
                  <h3 className="font-medium mb-3">Recent Achievements</h3>
                  {completedRecommendations.size > 0 ? (
                    <div className="space-y-2">
                      {Array.from(completedRecommendations).slice(0, 3).map((id) => {
                        const rec = recommendations.find(r => r.id === id)
                        return rec ? (
                          <div key={id} className="flex items-center gap-2 p-2 bg-green-50 rounded-lg">
                            <CheckCircle className="h-4 w-4 text-green-600" />
                            <span className="text-sm">{rec.title}</span>
                          </div>
                        ) : null
                      })}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No completed recommendations yet</p>
                  )}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
