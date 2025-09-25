"use client"

import { Header } from "@/components/header"
import { Hero } from "@/components/hero"
import { TechniqueLibrary } from "@/components/technique-library"
import { LearningPaths } from "@/components/learning-paths"
import { InteractiveQuizzes } from "@/components/interactive-quizzes"
import { AIFeedback } from "@/components/ai-feedback"
import { AIChat } from "@/components/ai-chat"
import { FavoritesManager } from "@/components/ui/favorites-manager"
import { ProgressDashboard } from "@/components/ui/progress-dashboard"
import { useState } from "react"
import { useTechniques } from "@/lib/hooks/useTechniques"

export default function HomePage() {
  const [isFavoritesOpen, setIsFavoritesOpen] = useState(false)
  const [isProgressOpen, setIsProgressOpen] = useState(false)
  const { techniques } = useTechniques({})

  return (
    <div className="min-h-screen bg-background">
      <Header 
        onFavoritesClick={() => setIsFavoritesOpen(true)}
        onProgressClick={() => setIsProgressOpen(true)}
      />
      <main>
        <Hero />
        <TechniqueLibrary />
        <LearningPaths />
        <InteractiveQuizzes />
        <AIFeedback />
        
        {/* AI Chat Section */}
        <section id="ai-chat" className="py-16">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">AI Pastry Tutor</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Get personalized guidance from our AI tutor. Ask questions about techniques, 
                get recipe suggestions, troubleshoot problems, and receive learning recommendations.
              </p>
            </div>
            <div className="max-w-4xl mx-auto">
              <AIChat />
            </div>
          </div>
        </section>
      </main>
      
      {/* Favorites Manager */}
      <FavoritesManager
        isOpen={isFavoritesOpen}
        onClose={() => setIsFavoritesOpen(false)}
        techniques={techniques}
      />

      {/* Progress Dashboard */}
      <ProgressDashboard
        isOpen={isProgressOpen}
        onClose={() => setIsProgressOpen(false)}
        techniques={techniques}
      />
    </div>
  )
}
