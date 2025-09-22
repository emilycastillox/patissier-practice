"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  Trophy, 
  Target, 
  Clock, 
  CheckCircle, 
  XCircle, 
  RotateCcw,
  Download,
  Share,
  Star,
  TrendingUp,
  TrendingDown,
  Lightbulb,
  BookOpen
} from "lucide-react"
import { QuizResults, QuestionResult } from "@/lib/types"
import { cn } from "@/lib/utils"

interface QuizResultsProps {
  results: QuizResults
  onRetake: () => void
  onExit: () => void
  className?: string
}

export function QuizResultsDisplay({
  results,
  onRetake,
  onExit,
  className
}: QuizResultsProps) {
  const [showDetailedResults, setShowDetailedResults] = useState(false)

  const getScoreColor = (percentage: number) => {
    if (percentage >= 90) return "text-green-600"
    if (percentage >= 70) return "text-blue-600"
    if (percentage >= 50) return "text-yellow-600"
    return "text-red-600"
  }

  const getScoreBadgeVariant = (percentage: number) => {
    if (percentage >= 90) return "default"
    if (percentage >= 70) return "secondary"
    if (percentage >= 50) return "outline"
    return "destructive"
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const getPerformanceMessage = (percentage: number) => {
    if (percentage >= 90) return "Outstanding! You have mastered this topic."
    if (percentage >= 80) return "Excellent work! You have a strong understanding."
    if (percentage >= 70) return "Good job! You passed the quiz."
    if (percentage >= 50) return "You're getting there! Review the material and try again."
    return "Keep studying! You'll get it next time."
  }

  return (
    <div className={cn("w-full max-w-4xl mx-auto space-y-6", className)}>
      {/* Main Results Card */}
      <Card className="text-center">
        <CardHeader>
          <div className="flex items-center justify-center mb-4">
            {results.passed ? (
              <Trophy className="h-16 w-16 text-yellow-500" />
            ) : (
              <Target className="h-16 w-16 text-muted-foreground" />
            )}
          </div>
          <CardTitle className="text-2xl">
            {results.passed ? "Congratulations!" : "Keep Learning!"}
          </CardTitle>
          <p className="text-muted-foreground">
            {getPerformanceMessage(results.percentage)}
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Score Display */}
          <div className="space-y-4">
            <div className={cn("text-6xl font-bold", getScoreColor(results.percentage))}>
              {results.percentage}%
            </div>
            <Badge 
              variant={getScoreBadgeVariant(results.percentage)}
              className="text-lg px-4 py-2"
            >
              {results.passed ? "PASSED" : "NEEDS IMPROVEMENT"}
            </Badge>
          </div>

          {/* Score Breakdown */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{results.questionResults.filter(r => r.isCorrect).length}</div>
              <div className="text-sm text-muted-foreground">Correct</div>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">{results.questionResults.filter(r => !r.isCorrect).length}</div>
              <div className="text-sm text-muted-foreground">Incorrect</div>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold">{results.score}</div>
              <div className="text-sm text-muted-foreground">Points Earned</div>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <div className="text-2xl font-bold">{formatTime(results.timeSpent)}</div>
              <div className="text-sm text-muted-foreground">Time Spent</div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Overall Progress</span>
              <span>{results.percentage}%</span>
            </div>
            <Progress value={results.percentage} className="h-3" />
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button onClick={onRetake} variant="default" size="lg">
              <RotateCcw className="h-4 w-4 mr-2" />
              Retake Quiz
            </Button>
            <Button onClick={onExit} variant="outline" size="lg">
              Exit to Dashboard
            </Button>
            <Button 
              onClick={() => setShowDetailedResults(!showDetailedResults)} 
              variant="ghost" 
              size="lg"
            >
              <BookOpen className="h-4 w-4 mr-2" />
              {showDetailedResults ? "Hide" : "Show"} Details
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Results */}
      {showDetailedResults && (
        <div className="space-y-6">
          {/* Question-by-Question Results */}
          <Card>
            <CardHeader>
              <CardTitle>Question Review</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {results.questionResults.map((questionResult, index) => (
                  <QuestionResultCard
                    key={questionResult.questionId}
                    questionResult={questionResult}
                    questionNumber={index + 1}
                  />
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Strengths and Weaknesses */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Strengths */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                  Strengths
                </CardTitle>
              </CardHeader>
              <CardContent>
                {results.strengths.length > 0 ? (
                  <ul className="space-y-2">
                    {results.strengths.map((strength, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                        <span>{strength}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">No specific strengths identified.</p>
                )}
              </CardContent>
            </Card>

            {/* Weaknesses */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingDown className="h-5 w-5 text-red-600" />
                  Areas for Improvement
                </CardTitle>
              </CardHeader>
              <CardContent>
                {results.weaknesses.length > 0 ? (
                  <ul className="space-y-2">
                    {results.weaknesses.map((weakness, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm">
                        <XCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                        <span>{weakness}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-muted-foreground">No specific weaknesses identified.</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Recommendations */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-yellow-600" />
                Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent>
              {results.recommendations.length > 0 ? (
                <ul className="space-y-2">
                  {results.recommendations.map((recommendation, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <Star className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                      <span>{recommendation}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">No specific recommendations at this time.</p>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

interface QuestionResultCardProps {
  questionResult: QuestionResult
  questionNumber: number
}

function QuestionResultCard({ questionResult, questionNumber }: QuestionResultCardProps) {
  const [showExplanation, setShowExplanation] = useState(false)

  return (
    <div className={cn(
      "p-4 rounded-lg border transition-all duration-200",
      {
        "bg-green-50 border-green-200": questionResult.isCorrect,
        "bg-red-50 border-red-200": !questionResult.isCorrect
      }
    )}>
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-3">
          <div className={cn(
            "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium",
            {
              "bg-green-100 text-green-800": questionResult.isCorrect,
              "bg-red-100 text-red-800": !questionResult.isCorrect
            }
          )}>
            {questionNumber}
          </div>
          <div>
            <h4 className="font-medium text-sm">{questionResult.question}</h4>
            <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
              <span>{questionResult.pointsEarned}/{questionResult.maxPoints} points</span>
              <span>{Math.round(questionResult.timeSpent)}s</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {questionResult.isCorrect ? (
            <CheckCircle className="h-5 w-5 text-green-600" />
          ) : (
            <XCircle className="h-5 w-5 text-red-600" />
          )}
        </div>
      </div>

      {/* User Answer vs Correct Answer */}
      <div className="mt-3 space-y-2">
        <div className="text-xs">
          <span className="font-medium">Your answer: </span>
          <span className={cn(
            "px-2 py-1 rounded text-xs",
            {
              "bg-green-100 text-green-800": questionResult.isCorrect,
              "bg-red-100 text-red-800": !questionResult.isCorrect
            }
          )}>
            {questionResult.userAnswer ? String(questionResult.userAnswer) : "No answer"}
          </span>
        </div>
        
        {!questionResult.isCorrect && (
          <div className="text-xs">
            <span className="font-medium">Correct answer: </span>
            <span className="px-2 py-1 rounded text-xs bg-green-100 text-green-800">
              {String(questionResult.correctAnswer)}
            </span>
          </div>
        )}
      </div>

      {/* Explanation */}
      {questionResult.explanation && (
        <div className="mt-3">
          {showExplanation ? (
            <div className="p-3 bg-muted/50 rounded-lg">
              <p className="text-xs text-muted-foreground">
                <span className="font-medium">Explanation: </span>
                {questionResult.explanation}
              </p>
            </div>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowExplanation(true)}
              className="h-6 px-2 text-xs"
            >
              Show Explanation
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
