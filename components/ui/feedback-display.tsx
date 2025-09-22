"use client"

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './card'
import { Badge } from './badge'
import { Progress } from './progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './tabs'
import { CheckCircle, AlertCircle, Lightbulb, Star, Target, Palette, Shapes, Zap } from 'lucide-react'
import { AIAnalysisResult } from '@/lib/services/aiService'

interface FeedbackDisplayProps {
  result: AIAnalysisResult
  onRetake?: () => void
  onClose?: () => void
  className?: string
}

export function FeedbackDisplay({ result, onRetake, onClose, className }: FeedbackDisplayProps) {
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

  return (
    <div className={className}>
      <Card className="overflow-hidden">
        <CardHeader className="text-center bg-gradient-to-r from-primary/10 to-secondary/10">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Star className="h-6 w-6 text-yellow-500 fill-yellow-500" />
            <span className="text-3xl font-bold">{result.score}/100</span>
          </div>
          <CardTitle className={`text-xl ${getScoreColor(result.score)}`}>
            {getScoreLabel(result.score)}
          </CardTitle>
          <div className="flex items-center justify-center gap-4 mt-4">
            <Badge variant="secondary" className="bg-white/90 text-gray-900">
              {result.category}
            </Badge>
            <Badge variant="outline" className="bg-white/90 text-gray-900">
              {result.confidence}% Confidence
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview" className="text-xs">
                Overview
              </TabsTrigger>
              <TabsTrigger value="positive" className="text-xs">
                Strengths
              </TabsTrigger>
              <TabsTrigger value="improvements" className="text-xs">
                Improvements
              </TabsTrigger>
              <TabsTrigger value="techniques" className="text-xs">
                Techniques
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="mt-6">
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Palette className="h-4 w-4 text-blue-500" />
                      <span className="text-sm font-medium">Color</span>
                      <span className={`text-sm font-bold ${getScoreColor(result.analysis.color.score)}`}>
                        {result.analysis.color.score}/100
                      </span>
                    </div>
                    <Progress value={result.analysis.color.score} className="h-2" />
                    <p className="text-xs text-muted-foreground">{result.analysis.color.feedback}</p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Shapes className="h-4 w-4 text-green-500" />
                      <span className="text-sm font-medium">Shape</span>
                      <span className={`text-sm font-bold ${getScoreColor(result.analysis.shape.score)}`}>
                        {result.analysis.shape.score}/100
                      </span>
                    </div>
                    <Progress value={result.analysis.shape.score} className="h-2" />
                    <p className="text-xs text-muted-foreground">{result.analysis.shape.feedback}</p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Target className="h-4 w-4 text-purple-500" />
                      <span className="text-sm font-medium">Texture</span>
                      <span className={`text-sm font-bold ${getScoreColor(result.analysis.texture.score)}`}>
                        {result.analysis.texture.score}/100
                      </span>
                    </div>
                    <Progress value={result.analysis.texture.score} className="h-2" />
                    <p className="text-xs text-muted-foreground">{result.analysis.texture.feedback}</p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Zap className="h-4 w-4 text-orange-500" />
                      <span className="text-sm font-medium">Technique</span>
                      <span className={`text-sm font-bold ${getScoreColor(result.analysis.technique.score)}`}>
                        {result.analysis.technique.score}/100
                      </span>
                    </div>
                    <Progress value={result.analysis.technique.score} className="h-2" />
                    <p className="text-xs text-muted-foreground">{result.analysis.technique.feedback}</p>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="positive" className="mt-6">
              <div className="space-y-3">
                {result.feedback.positive.length > 0 ? (
                  result.feedback.positive.map((item, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-pretty">{item}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No specific strengths identified. Keep practicing!
                  </p>
                )}
              </div>
            </TabsContent>

            <TabsContent value="improvements" className="mt-6">
              <div className="space-y-3">
                {result.feedback.improvements.length > 0 ? (
                  result.feedback.improvements.map((item, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <AlertCircle className="h-5 w-5 text-yellow-500 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-pretty">{item}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Great job! No specific improvements needed at this time.
                  </p>
                )}
              </div>
            </TabsContent>

            <TabsContent value="techniques" className="mt-6">
              <div className="space-y-3">
                {result.feedback.techniques.length > 0 ? (
                  result.feedback.techniques.map((item, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <Lightbulb className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-pretty">{item}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No specific technique feedback available.
                  </p>
                )}
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex gap-3 mt-6">
            {onRetake && (
              <button
                onClick={onRetake}
                className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Analyze Another Image
              </button>
            )}
            {onClose && (
              <button
                onClick={onClose}
                className="flex-1 bg-muted text-muted-foreground hover:bg-muted/80 px-4 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Close
              </button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}