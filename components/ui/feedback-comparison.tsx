"use client"

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './card'
import { Button } from './button'
import { Badge } from './badge'
import { Progress } from './progress'
import { 
  TrendingUp, 
  TrendingDown, 
  Star, 
  Calendar,
  ArrowRight,
  Target,
  Award,
  X
} from 'lucide-react'
import { FeedbackComparison } from '@/lib/services/feedbackHistoryService'

interface FeedbackComparisonProps {
  comparison: FeedbackComparison
  onClose?: () => void
  className?: string
}

export function FeedbackComparisonDisplay({ comparison, onClose, className }: FeedbackComparisonProps) {
  const { current, previous, improvements, regressions, overallProgress } = comparison

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600"
    if (score >= 80) return "text-blue-600"
    if (score >= 70) return "text-yellow-600"
    return "text-red-600"
  }

  const getScoreLabel = (score: number) => {
    if (score >= 90) return "Excellent"
    if (score >= 80) return "Very Good"
    if (score >= 70) return "Good"
    if (score >= 60) return "Fair"
    return "Needs Improvement"
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date)
  }

  const getProgressColor = (progress: number) => {
    if (progress > 60) return "text-green-600"
    if (progress > 40) return "text-blue-600"
    if (progress > 20) return "text-yellow-600"
    return "text-red-600"
  }

  return (
    <div className={className}>
      <Card className="overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-primary/10 to-secondary/10">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Feedback Comparison
            </CardTitle>
            {onClose && (
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
          <div className="flex items-center gap-4 mt-4">
            <Badge variant="secondary" className="bg-white/90 text-gray-900">
              {formatDate(previous.timestamp)} → {formatDate(current.timestamp)}
            </Badge>
            <Badge 
              variant={overallProgress > 50 ? "default" : "destructive"}
              className="bg-white/90"
            >
              {overallProgress > 50 ? "Improving" : "Needs Work"}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          {/* Overall Progress */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-medium">Overall Progress</h3>
              <span className={`text-lg font-bold ${getProgressColor(overallProgress)}`}>
                {overallProgress.toFixed(1)}%
              </span>
            </div>
            <Progress value={overallProgress} className="h-3" />
          </div>

          {/* Score Comparison */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm text-muted-foreground">Previous</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className={`text-4xl font-bold ${getScoreColor(previous.analysisResult.score)} mb-2`}>
                    {previous.analysisResult.score}/100
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    {getScoreLabel(previous.analysisResult.score)}
                  </p>
                  <img
                    src={previous.imageUrl}
                    alt="Previous submission"
                    className="w-full h-32 object-cover rounded-lg mb-2"
                  />
                  <div className="flex items-center justify-center gap-2">
                    <Badge variant="outline">{previous.analysisResult.category}</Badge>
                    <span className="text-xs text-muted-foreground">
                      {formatDate(previous.timestamp)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm text-muted-foreground">Current</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className={`text-4xl font-bold ${getScoreColor(current.analysisResult.score)} mb-2`}>
                    {current.analysisResult.score}/100
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    {getScoreLabel(current.analysisResult.score)}
                  </p>
                  <img
                    src={current.imageUrl}
                    alt="Current submission"
                    className="w-full h-32 object-cover rounded-lg mb-2"
                  />
                  <div className="flex items-center justify-center gap-2">
                    <Badge variant="outline">{current.analysisResult.category}</Badge>
                    <span className="text-xs text-muted-foreground">
                      {formatDate(current.timestamp)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Analysis Comparison */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div>
              <h4 className="font-medium mb-4 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-green-500" />
                Improvements
              </h4>
              <div className="space-y-2">
                {improvements.length > 0 ? (
                  improvements.map((improvement, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                      <p className="text-sm text-pretty">{improvement}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">No significant improvements detected</p>
                )}
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-4 flex items-center gap-2">
                <TrendingDown className="h-4 w-4 text-red-500" />
                Areas to Watch
              </h4>
              <div className="space-y-2">
                {regressions.length > 0 ? (
                  regressions.map((regression, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0" />
                      <p className="text-sm text-pretty">{regression}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">No significant regressions detected</p>
                )}
              </div>
            </div>
          </div>

          {/* Category Analysis Comparison */}
          <div className="space-y-4">
            <h4 className="font-medium">Category Analysis</h4>
            <div className="grid grid-cols-2 gap-4">
              {Object.keys(current.analysisResult.analysis).map((category) => {
                const currentScore = current.analysisResult.analysis[category as keyof typeof current.analysisResult.analysis].score
                const previousScore = previous.analysisResult.analysis[category as keyof typeof previous.analysisResult.analysis].score
                const diff = currentScore - previousScore
                const isImprovement = diff > 0

                return (
                  <div key={category} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium capitalize">{category}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">{previousScore}</span>
                        <ArrowRight className="h-3 w-3 text-muted-foreground" />
                        <span className={`text-sm font-medium ${isImprovement ? 'text-green-600' : 'text-red-600'}`}>
                          {currentScore}
                        </span>
                        {diff !== 0 && (
                          <Badge variant={isImprovement ? "default" : "destructive"} className="text-xs">
                            {isImprovement ? '+' : ''}{diff}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <Progress 
                      value={currentScore} 
                      className="h-2" 
                    />
                  </div>
                )
              })}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
