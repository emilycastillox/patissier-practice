"use client"

import React, { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Sparkles, AlertCircle, History, Lightbulb, BarChart3 } from "lucide-react"
import { ImageUpload } from "@/components/ui/image-upload"
import { FeedbackDisplay } from "@/components/ui/feedback-display"
import { FeedbackHistory } from "@/components/ui/feedback-history"
import { FeedbackComparisonDisplay } from "@/components/ui/feedback-comparison"
import { LearningRecommendations } from "@/components/ui/learning-recommendations"
import { FeedbackSharing } from "@/components/ui/feedback-sharing"
import { FeedbackAnalytics } from "@/components/ui/feedback-analytics"
import { aiService, AIAnalysisResult } from "@/lib/services/aiService"
import { feedbackHistoryService, FeedbackHistoryEntry, FeedbackComparison } from "@/lib/services/feedbackHistoryService"

export function AIFeedback() {
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<AIAnalysisResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [showHistory, setShowHistory] = useState(false)
  const [selectedHistoryEntry, setSelectedHistoryEntry] = useState<FeedbackHistoryEntry | null>(null)
  const [comparison, setComparison] = useState<FeedbackComparison | null>(null)
  const [showRecommendations, setShowRecommendations] = useState(false)
  const [showSharing, setShowSharing] = useState(false)
  const [selectedFeedbackForSharing, setSelectedFeedbackForSharing] = useState<FeedbackHistoryEntry | null>(null)
  const [showAnalytics, setShowAnalytics] = useState(false)

  const handleImageSelect = async (file: File) => {
    setSelectedImage(file)
    setError(null)
    setIsAnalyzing(true)
    
    try {
      const result = await aiService.analyzeImage(file)
      setAnalysisResult(result)
      
      // Save to feedback history
      const imageUrl = URL.createObjectURL(file)
      feedbackHistoryService.saveFeedbackEntry({
        imageUrl,
        analysisResult: result,
        technique: result.category
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed')
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleImageRemove = () => {
    setSelectedImage(null)
    setAnalysisResult(null)
    setError(null)
  }

  const handleRetake = () => {
    setSelectedImage(null)
    setAnalysisResult(null)
    setError(null)
    setShowHistory(false)
    setSelectedHistoryEntry(null)
    setComparison(null)
    setShowRecommendations(false)
  }

  const handleViewHistory = () => {
    setShowHistory(true)
    setSelectedImage(null)
    setAnalysisResult(null)
  }

  const handleViewFeedback = (entry: FeedbackHistoryEntry) => {
    setSelectedHistoryEntry(entry)
    setAnalysisResult(entry.analysisResult)
    setShowHistory(false)
  }

  const handleCompareFeedback = (comparison: FeedbackComparison) => {
    setComparison(comparison)
    setShowHistory(false)
  }

  const handleCloseComparison = () => {
    setComparison(null)
  }

  const handleViewRecommendations = () => {
    setShowRecommendations(true)
    setShowHistory(false)
    setComparison(null)
  }

  const handleRecommendationClick = (recommendation: any) => {
    // In a real app, this would navigate to the specific learning content
    console.log('Recommendation clicked:', recommendation)
  }

  const handleShareFeedback = (feedback: FeedbackHistoryEntry) => {
    setSelectedFeedbackForSharing(feedback)
    setShowSharing(true)
    setShowHistory(false)
    setShowRecommendations(false)
    setComparison(null)
  }

  const handleCloseSharing = () => {
    setShowSharing(false)
    setSelectedFeedbackForSharing(null)
  }

  const handleViewAnalytics = () => {
    setShowAnalytics(true)
    setShowHistory(false)
    setShowRecommendations(false)
    setShowSharing(false)
    setComparison(null)
  }

  return (
    <section id="ai-feedback" className="py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">AI Visual Feedback</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Upload photos of your pastry creations and get instant AI-powered feedback on your technique, 
            presentation, and areas for improvement.
          </p>
        </div>

        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Main Upload/Feedback Area */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-primary" />
                    Upload Your Creation
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      onClick={handleViewHistory}
                      className="flex items-center gap-2"
                    >
                      <History className="h-4 w-4" />
                      History
                    </Button>
                    {analysisResult && (
                      <Button
                        variant="outline"
                        onClick={handleViewRecommendations}
                        className="flex items-center gap-2"
                      >
                        <Lightbulb className="h-4 w-4" />
                        Learn
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      onClick={handleViewAnalytics}
                      className="flex items-center gap-2"
                    >
                      <BarChart3 className="h-4 w-4" />
                      Analytics
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {!analysisResult ? (
                  <ImageUpload
                    onImageSelect={handleImageSelect}
                    onImageRemove={handleImageRemove}
                    selectedImage={selectedImage}
                  />
                ) : (
                  <FeedbackDisplay
                    result={analysisResult}
                    onRetake={handleRetake}
                  />
                )}
                
                {isAnalyzing && (
                  <div className="flex items-center justify-center gap-2 mt-4 text-muted-foreground">
                    <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    Analyzing your image...
                  </div>
                )}
                
                {error && (
                  <div className="flex items-center gap-2 mt-4 text-destructive">
                    <AlertCircle className="h-4 w-4" />
                    {error}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* History/Comparison/Recommendations Area */}
            <div className="space-y-6">
              {showHistory && (
                <FeedbackHistory
                  onViewFeedback={handleViewFeedback}
                  onCompareFeedback={handleCompareFeedback}
                  onShareFeedback={handleShareFeedback}
                />
              )}
              
              {showRecommendations && analysisResult && (
                <LearningRecommendations
                  analysisResult={analysisResult}
                  feedbackHistory={feedbackHistoryService.getFeedbackHistory()}
                  onRecommendationClick={handleRecommendationClick}
                />
              )}
              
              {showSharing && selectedFeedbackForSharing && (
                <FeedbackSharing
                  feedback={selectedFeedbackForSharing}
                  onClose={handleCloseSharing}
                />
              )}
              
              {showAnalytics && (
                <FeedbackAnalytics
                  history={feedbackHistoryService.getFeedbackHistory()}
                />
              )}
              
              {comparison && (
                <FeedbackComparisonDisplay
                  comparison={comparison}
                  onClose={handleCloseComparison}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}