import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { CheckCircle, Lock, Play, Trophy, Star, Clock } from "lucide-react"

const learningPaths = [
  {
    id: 1,
    title: "Beginner Baker",
    description: "Start your pastry journey with fundamental techniques and basic recipes",
    level: "Beginner",
    duration: "4-6 weeks",
    lessons: 12,
    progress: 75,
    unlocked: true,
    color: "bg-green-500",
    modules: [
      { title: "Kitchen Setup & Tools", completed: true, duration: "15 min" },
      { title: "Basic Mixing Techniques", completed: true, duration: "20 min" },
      { title: "Simple Cookie Dough", completed: true, duration: "25 min" },
      { title: "Basic Cake Batter", completed: false, duration: "30 min", current: true },
      { title: "Frosting Fundamentals", completed: false, duration: "20 min" },
      { title: "Decoration Basics", completed: false, duration: "35 min" },
    ],
  },
  {
    id: 2,
    title: "Intermediate Artisan",
    description: "Advance your skills with complex techniques and professional methods",
    level: "Intermediate",
    duration: "6-8 weeks",
    lessons: 16,
    progress: 30,
    unlocked: true,
    color: "bg-yellow-500",
    modules: [
      { title: "Advanced Dough Techniques", completed: true, duration: "40 min" },
      { title: "Pastry Cream Mastery", completed: true, duration: "35 min" },
      { title: "Lamination Basics", completed: false, duration: "45 min", current: true },
      { title: "Chocolate Tempering", completed: false, duration: "30 min" },
      { title: "Sugar Work Introduction", completed: false, duration: "50 min" },
      { title: "Plated Desserts", completed: false, duration: "40 min" },
    ],
  },
  {
    id: 3,
    title: "Master Patissier",
    description: "Perfect advanced techniques and create restaurant-quality desserts",
    level: "Advanced",
    duration: "8-12 weeks",
    lessons: 20,
    progress: 0,
    unlocked: false,
    color: "bg-red-500",
    modules: [
      { title: "Complex Laminated Doughs", completed: false, duration: "60 min" },
      { title: "Advanced Sugar Techniques", completed: false, duration: "75 min" },
      { title: "Molecular Gastronomy", completed: false, duration: "90 min" },
      { title: "Competition Techniques", completed: false, duration: "120 min" },
      { title: "Menu Development", completed: false, duration: "45 min" },
      { title: "Final Portfolio", completed: false, duration: "180 min" },
    ],
  },
]

function PathCard({ path }: { path: any }) {
  return (
    <Card className={`relative overflow-hidden ${!path.unlocked ? "opacity-60" : ""}`}>
      <div className={`absolute top-0 left-0 right-0 h-1 ${path.color}`} />

      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-xl mb-2">{path.title}</CardTitle>
            <p className="text-sm text-muted-foreground text-pretty">{path.description}</p>
          </div>
          {!path.unlocked && <Lock className="h-5 w-5 text-muted-foreground" />}
        </div>

        <div className="flex items-center gap-4 text-sm text-muted-foreground mt-4">
          <Badge variant="outline">{path.level}</Badge>
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            {path.duration}
          </div>
          <div className="flex items-center gap-1">
            <Play className="h-4 w-4" />
            {path.lessons} lessons
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Progress</span>
            <span>{path.progress}%</span>
          </div>
          <Progress value={path.progress} className="h-2" />
        </div>

        <div className="space-y-2">
          <h4 className="font-medium text-sm">Current Modules</h4>
          <div className="space-y-2">
            {path.modules.slice(0, 4).map((module: any, index: number) => (
              <div key={index} className="flex items-center gap-3 text-sm">
                {module.completed ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : module.current ? (
                  <div className="h-4 w-4 rounded-full border-2 border-primary bg-primary/20" />
                ) : (
                  <div className="h-4 w-4 rounded-full border-2 border-muted-foreground/30" />
                )}
                <span className={module.completed ? "text-muted-foreground" : module.current ? "font-medium" : ""}>
                  {module.title}
                </span>
                <span className="text-muted-foreground ml-auto">{module.duration}</span>
              </div>
            ))}
          </div>
        </div>

        <Button className="w-full" disabled={!path.unlocked} variant={path.progress > 0 ? "default" : "outline"}>
          {!path.unlocked ? (
            <>
              <Lock className="mr-2 h-4 w-4" />
              Locked
            </>
          ) : path.progress > 0 ? (
            <>
              <Play className="mr-2 h-4 w-4" />
              Continue Learning
            </>
          ) : (
            <>
              <Star className="mr-2 h-4 w-4" />
              Start Path
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  )
}

export function LearningPaths() {
  return (
    <section id="paths" className="py-20 px-4 bg-muted/30">
      <div className="container mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Learning Paths</h2>
          <p className="text-xl text-muted-foreground text-balance max-w-2xl mx-auto">
            Follow structured learning paths designed to take you from beginner to master patissier, with achievements
            and progress tracking.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {learningPaths.map((path) => (
            <PathCard key={path.id} path={path} />
          ))}
        </div>

        <div className="bg-card rounded-lg p-8 text-center">
          <Trophy className="h-12 w-12 text-secondary mx-auto mb-4" />
          <h3 className="text-2xl font-bold mb-2">Unlock Advanced Paths</h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Complete the Intermediate Artisan path with 80% or higher scores to unlock the Master Patissier program and
            advanced techniques.
          </p>
          <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              Complete all modules
            </div>
            <div className="flex items-center gap-2">
              <Trophy className="h-4 w-4 text-secondary" />
              Pass final assessment
            </div>
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4 text-primary" />
              Maintain 80% average
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
