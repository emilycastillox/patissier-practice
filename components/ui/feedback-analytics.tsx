"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './card'
import { Button } from './button'
import { Badge } from './badge'
import { Progress } from './progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './tabs'
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Target,
  Award,
  Calendar,
  Star,
  Zap,
  AlertCircle,
  CheckCircle,
  Clock,
  Trophy,
  Activity
} from 'lucide-react'
import { 
  AnalyticsData, 
  ProgressInsight,
  feedbackAnalyticsService 
} from '@/lib/services/feedbackAnalyticsService'
import { FeedbackHistoryEntry } from '@/lib/services/feedbackHistoryService'

interface FeedbackAnalyticsProps {
  history: FeedbackHistoryEntry[]
  className?: string
}

export function FeedbackAnalytics({ history, className }: FeedbackAnalyticsProps) {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [insights, setInsights] = useState<ProgressInsight[]>([])
  const [activeTab, setActiveTab] = useState('overview')
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'all'>('all')

  useEffect(() => {
    if (history.length > 0) {
      const analyticsData = feedbackAnalyticsService.generateAnalytics(history)
      const progressInsights = feedbackAnalyticsService.generateProgressInsights(history)
      setAnalytics(analyticsData)
      setInsights(progressInsights)
    }
  }, [history])

  if (!analytics || history.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Analytics & Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No Data Yet</h3>
            <p className="text-muted-foreground">
              Upload some pastry creations to start tracking your progress and analytics!
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600"
    if (score >= 80) return "text-blue-600"
    if (score >= 70) return "text-yellow-600"
    return "text-red-600"
  }

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-4 w-4 text-green-500" />
      case 'down': return <TrendingDown className="h-4 w-4 text-red-500" />
      default: return <Activity className="h-4 w-4 text-gray-500" />
    }
  }

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'improvement': return <TrendingUp className="h-5 w-5 text-green-500" />
      case 'decline': return <TrendingDown className="h-5 w-5 text-red-500" />
      case 'consistency': return <CheckCircle className="h-5 w-5 text-blue-500" />
      case 'breakthrough': return <Zap className="h-5 w-5 text-purple-500" />
      default: return <AlertCircle className="h-5 w-5 text-gray-500" />
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-red-200 bg-red-50'
      case 'medium': return 'border-yellow-200 bg-yellow-50'
      case 'low': return 'border-green-200 bg-green-50'
      default: return 'border-gray-200 bg-gray-50'
    }
  }

  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Analytics & Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="trends">Trends</TabsTrigger>
              <TabsTrigger value="insights">Insights</TabsTrigger>
              <TabsTrigger value="achievements">Achievements</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="mt-6">
              <div className="space-y-6">
                {/* Key Metrics */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-primary">{analytics.totalSubmissions}</div>
                      <p className="text-sm text-muted-foreground">Total Submissions</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className={`text-2xl font-bold ${getScoreColor(analytics.averageScore)}`}>
                        {analytics.averageScore}
                      </div>
                      <p className="text-sm text-muted-foreground">Average Score</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className={`text-2xl font-bold ${getScoreColor(analytics.bestScore)}`}>
                        {analytics.bestScore}
                      </div>
                      <p className="text-sm text-muted-foreground">Best Score</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-blue-600">{analytics.streaks.current}</div>
                      <p className="text-sm text-muted-foreground">Current Streak</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Category Breakdown */}
                <div>
                  <h3 className="font-medium mb-4">Performance by Category</h3>
                  <div className="space-y-3">
                    {analytics.categoryBreakdown.map((category, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{category.category}</span>
                          <Badge variant="outline">{category.count} submissions</Badge>
                          {getTrendIcon(category.trend)}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`font-bold ${getScoreColor(category.averageScore)}`}>
                            {category.averageScore}
                          </span>
                          <div className="w-20">
                            <Progress value={category.averageScore} className="h-2" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Strengths and Weaknesses */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm text-green-600">Strengths</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {analytics.strengths.length > 0 ? (
                        <div className="space-y-2">
                          {analytics.strengths.map((strength, index) => (
                            <div key={index} className="flex items-center gap-2">
                              <CheckCircle className="h-4 w-4 text-green-500" />
                              <span className="text-sm">{strength}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">Keep practicing to identify your strengths!</p>
                      )}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm text-red-600">Areas for Improvement</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {analytics.weaknesses.length > 0 ? (
                        <div className="space-y-2">
                          {analytics.weaknesses.map((weakness, index) => (
                            <div key={index} className="flex items-center gap-2">
                              <AlertCircle className="h-4 w-4 text-red-500" />
                              <span className="text-sm">{weakness}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">Great job! No major weaknesses identified.</p>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="trends" className="mt-6">
              <div className="space-y-6">
                {/* Score Trend Chart */}
                <div>
                  <h3 className="font-medium mb-4">Score Trend Over Time</h3>
                  <Card>
                    <CardContent className="p-6">
                      <div className="h-64 flex items-end justify-between gap-1">
                        {analytics.scoreTrend.scores.map((score, index) => (
                          <div key={index} className="flex flex-col items-center gap-1">
                            <div 
                              className="bg-primary rounded-t w-4"
                              style={{ height: `${(score / 100) * 200}px` }}
                            />
                            <span className="text-xs text-muted-foreground">
                              {index % 5 === 0 ? score : ''}
                            </span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Weekly Progress */}
                <div>
                  <h3 className="font-medium mb-4">Weekly Progress</h3>
                  <div className="space-y-3">
                    {analytics.weeklyProgress.slice(-8).map((week, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{week.week}</span>
                          <Badge variant="outline">{week.submissions} submissions</Badge>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`font-bold ${getScoreColor(week.averageScore)}`}>
                            {week.averageScore}
                          </span>
                          {week.improvement !== 0 && (
                            <div className={`flex items-center gap-1 ${
                              week.improvement > 0 ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {week.improvement > 0 ? (
                                <TrendingUp className="h-4 w-4" />
                              ) : (
                                <TrendingDown className="h-4 w-4" />
                              )}
                              <span className="text-sm">
                                {week.improvement > 0 ? '+' : ''}{week.improvement.toFixed(1)}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="insights" className="mt-6">
              <div className="space-y-4">
                <h3 className="font-medium">Progress Insights</h3>
                {insights.length > 0 ? (
                  <div className="space-y-4">
                    {insights.map((insight, index) => (
                      <Card key={index} className={`border-l-4 ${getPriorityColor(insight.priority)}`}>
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            {getInsightIcon(insight.type)}
                            <div className="flex-1">
                              <h4 className="font-medium mb-1">{insight.title}</h4>
                              <p className="text-sm text-muted-foreground mb-2">{insight.description}</p>
                              <p className="text-sm font-medium text-blue-600">{insight.recommendation}</p>
                            </div>
                            <Badge variant="outline" className={getPriorityColor(insight.priority)}>
                              {insight.priority}
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card>
                    <CardContent className="p-6 text-center">
                      <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="font-medium mb-2">No Insights Yet</h3>
                      <p className="text-sm text-muted-foreground">
                        Keep practicing to generate personalized insights about your progress!
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>

            <TabsContent value="achievements" className="mt-6">
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-yellow-600">{analytics.achievements.length}</div>
                      <p className="text-sm text-muted-foreground">Achievements Unlocked</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-blue-600">{analytics.streaks.longest}</div>
                      <p className="text-sm text-muted-foreground">Longest Streak</p>
                    </CardContent>
                  </Card>
                </div>

                <div>
                  <h3 className="font-medium mb-4">Your Achievements</h3>
                  {analytics.achievements.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {analytics.achievements.map((achievement, index) => (
                        <Card key={index} className="border-l-4 border-yellow-400 bg-yellow-50">
                          <CardContent className="p-4">
                            <div className="flex items-start gap-3">
                              <Trophy className="h-5 w-5 text-yellow-600" />
                              <div className="flex-1">
                                <h4 className="font-medium">{achievement.title}</h4>
                                <p className="text-sm text-muted-foreground mb-2">{achievement.description}</p>
                                <p className="text-xs text-muted-foreground">
                                  Unlocked: {achievement.unlockedAt.toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <Card>
                      <CardContent className="p-6 text-center">
                        <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="font-medium mb-2">No Achievements Yet</h3>
                        <p className="text-sm text-muted-foreground">
                          Keep practicing to unlock achievements and milestones!
                        </p>
                      </CardContent>
                    </Card>
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
