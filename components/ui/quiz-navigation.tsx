"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  ChevronLeft, 
  ChevronRight, 
  SkipForward, 
  RotateCcw,
  Clock,
  CheckCircle,
  Circle,
  HelpCircle,
  Flag,
  Eye,
  EyeOff,
  ListChecks
} from "lucide-react"
import { QuizQuestion, QuizSession } from "@/lib/types"
import { cn } from "@/lib/utils"

interface QuizNavigationProps {
  questions: QuizQuestion[]
  currentQuestionIndex: number
  onQuestionChange: (index: number) => void
  answers: Map<number, any>
  timeRemaining?: number
  totalTime?: number
  onSkip: () => void
  onReset: () => void
  onFinish: () => void
  onToggleReview: () => void
  isReviewMode?: boolean
  disabled?: boolean
  className?: string
}

export function QuizNavigation({
  questions,
  currentQuestionIndex,
  onQuestionChange,
  answers,
  timeRemaining,
  totalTime,
  onSkip,
  onReset,
  onFinish,
  onToggleReview,
  isReviewMode = false,
  disabled = false,
  className
}: QuizNavigationProps) {
  const [showQuestionList, setShowQuestionList] = useState(false)

  // Calculate progress
  const answeredQuestions = Array.from(answers.keys()).length
  const progressPercentage = (answeredQuestions / questions.length) * 100

  // Get question status
  const getQuestionStatus = (index: number) => {
    if (answers.has(index)) {
      return "answered"
    }
    if (index === currentQuestionIndex) {
      return "current"
    }
    return "unanswered"
  }

  // Format time remaining
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // Navigation handlers
  const goToPrevious = () => {
    if (currentQuestionIndex > 0) {
      onQuestionChange(currentQuestionIndex - 1)
    }
  }

  const goToNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      onQuestionChange(currentQuestionIndex + 1)
    }
  }

  const goToQuestion = (index: number) => {
    onQuestionChange(index)
    setShowQuestionList(false)
  }

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (disabled) return

      switch (e.key) {
        case "ArrowLeft":
          e.preventDefault()
          goToPrevious()
          break
        case "ArrowRight":
          e.preventDefault()
          goToNext()
          break
        case "Escape":
          e.preventDefault()
          setShowQuestionList(false)
          break
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [currentQuestionIndex, disabled])

  return (
    <div className={cn("space-y-4", className)}>
      {/* Progress bar */}
      <Card>
        <CardContent className="p-4">
          <div className="space-y-4">
            {/* Progress info */}
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-4">
                <span className="font-medium">
                  Question {currentQuestionIndex + 1} of {questions.length}
                </span>
                <Badge variant="outline">
                  {answeredQuestions} answered
                </Badge>
                {timeRemaining !== undefined && (
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>{formatTime(timeRemaining)}</span>
                  </div>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowQuestionList(!showQuestionList)}
                  disabled={disabled}
                >
                  {isReviewMode ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  {isReviewMode ? "Hide" : "Show"} Questions
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onToggleReview}
                  disabled={disabled}
                >
                  <Flag className="h-4 w-4 mr-1" />
                  {isReviewMode ? "Exit Review" : "Review"}
                </Button>
              </div>
            </div>

            {/* Progress bar */}
            <div className="space-y-2">
              <Progress value={progressPercentage} className="h-2" />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Progress: {Math.round(progressPercentage)}%</span>
                <span>{answeredQuestions}/{questions.length} completed</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Question list (expandable) */}
      {showQuestionList && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Question Navigator</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
              {questions.map((question, index) => {
                const status = getQuestionStatus(index)
                
                return (
                  <Button
                    key={index}
                    variant={status === "current" ? "default" : "outline"}
                    size="sm"
                    onClick={() => goToQuestion(index)}
                    disabled={disabled}
                    className={cn(
                      "h-8 w-8 p-0 text-xs",
                      {
                        "bg-green-100 border-green-300 text-green-800": status === "answered",
                        "bg-primary text-primary-foreground": status === "current",
                        "bg-muted": status === "unanswered"
                      }
                    )}
                  >
                    {status === "answered" ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : (
                      <span>{index + 1}</span>
                    )}
                  </Button>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Navigation controls */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            {/* Left controls */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={goToPrevious}
                disabled={disabled || currentQuestionIndex === 0}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={goToNext}
                disabled={disabled || currentQuestionIndex === questions.length - 1}
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>

            {/* Center controls */}
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={onSkip}
                disabled={disabled}
              >
                <SkipForward className="h-4 w-4 mr-1" />
                Skip
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={onReset}
                disabled={disabled}
              >
                <RotateCcw className="h-4 w-4 mr-1" />
                Reset
              </Button>
            </div>

            {/* Right controls */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowQuestionList(!showQuestionList)}
                disabled={disabled}
              >
                <HelpCircle className="h-4 w-4 mr-1" />
                {showQuestionList ? "Hide" : "Show"} List
              </Button>
              
              <Button
                variant="default"
                size="sm"
                onClick={onFinish}
                disabled={disabled}
                className="bg-primary hover:bg-primary/90"
              >
                Finish Quiz
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Time warning */}
      {timeRemaining !== undefined && timeRemaining < 60 && timeRemaining > 0 && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="p-3">
            <div className="flex items-center gap-2 text-yellow-800">
              <Clock className="h-4 w-4" />
              <span className="text-sm font-medium">
                {timeRemaining < 30 
                  ? `Warning: Only ${timeRemaining} seconds remaining!`
                  : `Time remaining: ${formatTime(timeRemaining)}`
                }
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Keyboard shortcuts help */}
      <Card className="bg-muted/50">
        <CardContent className="p-3">
          <div className="text-xs text-muted-foreground">
            <strong>Keyboard shortcuts:</strong> ← Previous question, → Next question, Esc Close question list
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
