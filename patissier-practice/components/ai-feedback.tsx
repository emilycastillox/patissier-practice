"use client"

import React, { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Sparkles, AlertCircle } from "lucide-react"
import { ImageUpload } from "@/components/ui/image-upload"
import { FeedbackDisplay } from "@/components/ui/feedback-display"
import { aiService, AIAnalysisResult } from "@/lib/services/aiService"

export function AIFeedback() {
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<AIAnalysisResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleImageSelect = async (file: File) => {
    setSelectedImage(file)
    setError(null)
    setIsAnalyzing(true)
    
    try {
      const result = await aiService.analyzeImage(file)
      setAnalysisResult(result)
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

        <div className="max-w-4xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                Upload Your Creation
              </CardTitle>
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
        </div>
      </div>
    </section>
  )
}