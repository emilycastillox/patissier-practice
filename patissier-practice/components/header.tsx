"use client"

import { Button } from "@/components/ui/button"
import { ChefHat, BookOpen, Trophy, Brain, Heart, TrendingUp } from "lucide-react"
import { useFavorites } from "@/lib/contexts/FavoritesContext"
import { useProgress } from "@/lib/contexts/ProgressContext"

interface HeaderProps {
  onFavoritesClick?: () => void
  onProgressClick?: () => void
}

export function Header({ onFavoritesClick, onProgressClick }: HeaderProps) {
  const { favoriteTechniques, bookmarkedTechniques } = useFavorites()
  const { userProgress, getOverallProgress } = useProgress()
  const totalSaved = favoriteTechniques.length + bookmarkedTechniques.length
  const overallProgress = getOverallProgress()

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <ChefHat className="h-8 w-8 text-primary" />
          <h1 className="text-2xl font-bold text-foreground">Patissier Practice</h1>
        </div>

        <nav className="hidden md:flex items-center gap-6">
          <a
            href="#techniques"
            className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <BookOpen className="h-4 w-4" />
            Techniques
          </a>
          <a
            href="#paths"
            className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <Trophy className="h-4 w-4" />
            Learning Paths
          </a>
          <a
            href="#quizzes"
            className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <Brain className="h-4 w-4" />
            Quizzes
          </a>
        </nav>

        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="sm" 
            className="relative"
            onClick={onProgressClick}
          >
            <TrendingUp className="h-4 w-4 mr-2" />
            Progress
            {overallProgress > 0 && (
              <span className="absolute -top-1 -right-1 bg-green-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {overallProgress}%
              </span>
            )}
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="relative"
            onClick={onFavoritesClick}
          >
            <Heart className="h-4 w-4 mr-2" />
            Favorites
            {totalSaved > 0 && (
              <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {totalSaved}
              </span>
            )}
          </Button>
          <Button variant="outline" size="sm">
            Sign In
          </Button>
          <Button size="sm">Get Started</Button>
        </div>
      </div>
    </header>
  )
}
