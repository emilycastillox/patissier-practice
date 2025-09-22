"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './card'
import { Button } from './button'
import { Badge } from './badge'
import { Progress } from './progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './tabs'
import { 
  History, 
  TrendingUp, 
  TrendingDown, 
  Star, 
  Calendar, 
  BarChart3, 
  Target, 
  Award, 
  Trash2, 
  Eye, 
  GitCompare as Compare, 
  Share2
} from 'lucide-react'
import { feedbackHistoryService, FeedbackHistoryEntry, FeedbackComparison } from '@/lib/services/feedbackHistoryService'
import { AIAnalysisResult } from '@/lib/services/aiService'

interface FeedbackHistoryProps {
  onViewFeedback?: (entry: FeedbackHistoryEntry) => void
  onCompareFeedback?: (comparison: FeedbackComparison) => void
  onShareFeedback?: (entry: FeedbackHistoryEntry) => void
  className?: string
}

export function FeedbackHistory({ onViewFeedback, onCompareFeedback, onShareFeedback, className }: FeedbackHistoryProps) {
  const [history, setHistory] = useState<FeedbackHistoryEntry[]>([])
  const [statistics, setStatistics] = useState<any>(null)
  const [selectedEntries, setSelectedEntries] = useState<string[]>([])
  const [activeTab, setActiveTab] = useState('recent')

  useEffect(() => {
    loadHistory()
    loadStatistics()
  }, [])

  const loadHistory = () => {
    const feedbackHistory = feedbackHistoryService.getFeedbackHistory()
    setHistory(feedbackHistory)
  }

  const loadStatistics = () => {
    const stats = feedbackHistoryService.getStatistics()
    setStatistics(stats)
  }

  const handleDeleteEntry = (id: string) => {
    if (feedbackHistoryService.deleteFeedbackEntry(id)) {
      loadHistory()
      loadStatistics()
    }
  }

  const handleSelectEntry = (id: string) => {
    setSelectedEntries(prev => 
      prev.includes(id) 
        ? prev.filter(entryId => entryId !== id)
        : [...prev, id]
    )
  }

  const handleCompareSelected = () => {
    if (selectedEntries.length === 2) {
      const [currentId, previousId] = selectedEntries
      const comparison = feedbackHistoryService.compareFeedback(currentId, previousId)
      if (comparison && onCompareFeedback) {
        onCompareFeedback(comparison)
      }
    }
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date)
  }

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

  if (history.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Feedback History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <History className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No Feedback Yet</h3>
            <p className="text-muted-foreground">
              Upload your first pastry creation to start tracking your progress!
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
            <History className="h-5 w-5" />
            Feedback History
            <Badge variant="secondary">{history.length} entries</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="recent">Recent</TabsTrigger>
              <TabsTrigger value="statistics">Statistics</TabsTrigger>
              <TabsTrigger value="compare">Compare</TabsTrigger>
            </TabsList>

            <TabsContent value="recent" className="mt-6">
              <div className="space-y-4">
                {history.slice(0, 10).map((entry) => (
                  <Card key={entry.id} className="overflow-hidden">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <img
                            src={entry.imageUrl}
                            alt="Feedback entry"
                            className="w-16 h-16 object-cover rounded-lg"
                          />
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className={`text-2xl font-bold ${getScoreColor(entry.analysisResult.score)}`}>
                                {entry.analysisResult.score}/100
                              </span>
                              <Badge variant="outline">{entry.analysisResult.category}</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {getScoreLabel(entry.analysisResult.score)} • {formatDate(entry.timestamp)}
                            </p>
                            {entry.technique && (
                              <p className="text-xs text-muted-foreground mt-1">
                                Technique: {entry.technique}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onViewFeedback?.(entry)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onShareFeedback?.(entry)}
                          >
                            <Share2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteEntry(entry.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="statistics" className="mt-6">
              {statistics && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-primary">{statistics.totalSubmissions}</div>
                      <p className="text-sm text-muted-foreground">Total Submissions</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-green-600">{statistics.averageScore}</div>
                      <p className="text-sm text-muted-foreground">Average Score</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-blue-600">{statistics.bestScore}</div>
                      <p className="text-sm text-muted-foreground">Best Score</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-orange-600">{statistics.mostCommonCategory}</div>
                      <p className="text-sm text-muted-foreground">Most Common Category</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold text-purple-600">
                        {statistics.improvementRate > 0 ? '+' : ''}{statistics.improvementRate}%
                      </div>
                      <p className="text-sm text-muted-foreground">Improvement Rate</p>
                    </CardContent>
                  </Card>
                </div>
              )}
            </TabsContent>

            <TabsContent value="compare" className="mt-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">Compare Feedback Entries</h3>
                  <Button
                    onClick={handleCompareSelected}
                    disabled={selectedEntries.length !== 2}
                    className="flex items-center gap-2"
                  >
                        <Compare className="h-4 w-4" />
                    Compare Selected
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {history.slice(0, 6).map((entry) => (
                    <Card 
                      key={entry.id} 
                      className={`cursor-pointer transition-all ${
                        selectedEntries.includes(entry.id) 
                          ? 'ring-2 ring-primary bg-primary/5' 
                          : 'hover:bg-muted/50'
                      }`}
                      onClick={() => handleSelectEntry(entry.id)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={entry.imageUrl}
                            alt="Feedback entry"
                            className="w-12 h-12 object-cover rounded-lg"
                          />
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className={`text-lg font-bold ${getScoreColor(entry.analysisResult.score)}`}>
                                {entry.analysisResult.score}/100
                              </span>
                              <Badge variant="outline" className="text-xs">
                                {entry.analysisResult.category}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {formatDate(entry.timestamp)}
                            </p>
                          </div>
                          {selectedEntries.includes(entry.id) && (
                            <div className="w-4 h-4 bg-primary rounded-full flex items-center justify-center">
                              <div className="w-2 h-2 bg-white rounded-full" />
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
