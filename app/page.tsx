"use client"

import { Header } from "@/components/header"
import { Hero } from "@/components/hero"
import { TechniqueLibrary } from "@/components/technique-library"
import { LearningPaths } from "@/components/learning-paths"
import { InteractiveQuizzes } from "@/components/interactive-quizzes"
import { AIFeedback } from "@/components/ai-feedback"
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
