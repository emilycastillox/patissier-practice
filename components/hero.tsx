import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ChefHat, Play, Star, BookOpen, Trophy, Brain } from "lucide-react"

export function Hero() {
  return (
    <section className="py-20 px-4">
      <div className="container mx-auto text-center">
        <div className="flex justify-center mb-6">
          <div className="flex items-center gap-2 bg-secondary/20 text-secondary-foreground px-4 py-2 rounded-full text-sm font-medium">
            <Star className="h-4 w-4" />
            AI-Powered Learning Platform
          </div>
        </div>

        <h1 className="text-4xl md:text-6xl font-bold text-balance mb-6">
          Master the Art of <span className="text-primary">Pastry</span>
        </h1>

        <p className="text-xl text-muted-foreground text-balance mb-8 max-w-2xl mx-auto">
          From beginner basics to advanced techniques, learn pastry arts with interactive lessons, step-by-step videos,
          and AI-powered feedback on your creations.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
          <Button size="lg" className="text-lg px-8">
            <ChefHat className="mr-2 h-5 w-5" />
            Start Learning
          </Button>
          <Button variant="outline" size="lg" className="text-lg px-8 bg-transparent">
            <Play className="mr-2 h-5 w-5" />
            Watch Demo
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <Card className="p-6 text-center">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
              <BookOpen className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold mb-2">500+ Techniques</h3>
            <p className="text-sm text-muted-foreground">
              Comprehensive library of pastry techniques with videos and step-by-step guides
            </p>
          </Card>

          <Card className="p-6 text-center">
            <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Trophy className="h-6 w-6 text-secondary" />
            </div>
            <h3 className="font-semibold mb-2">Progressive Paths</h3>
            <p className="text-sm text-muted-foreground">
              Structured learning from beginner to advanced with unlockable achievements
            </p>
          </Card>

          <Card className="p-6 text-center">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Brain className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold mb-2">AI Feedback</h3>
            <p className="text-sm text-muted-foreground">
              Upload photos of your creations and get instant AI-powered improvement tips
            </p>
          </Card>
        </div>
      </div>
    </section>
  )
}
