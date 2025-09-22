"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Flag, 
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  ArrowLeft,
  ArrowRight
} from "lucide-react"
import { QuizQuestion, QuizSession, QuizConfig, QuizAttempt } from "@/lib/types"
import { QuizQuestionComponent } from "./quiz-question"
import { QuizNavigation } from "./quiz-navigation"
import { QuizResultsDisplay } from "./quiz-results"
import { QuizScoringService } from "@/lib/services/quizScoringService"
import { cn } from "@/lib/utils"

interface QuizSessionProps {
  quizId: number
  questions: QuizQuestion[]
  config: QuizConfig
  onComplete: (results: any) => void
  onExit: () => void
  className?: string
}

export function QuizSession({
  quizId,
  questions,
  config,
  onComplete,
  onExit,
  className
}: QuizSessionProps) {
  const [session, setSession] = useState<QuizSession>({
    id: `quiz-${quizId}-${Date.now()}`,
    quizId,
    userId: "current-user", // In a real app, this would come from auth
    currentQuestionIndex: 0,
    answers: new Map(),
    startTime: new Date().toISOString(),
    timeRemaining: config.timeLimit,
    isCompleted: false,
    isPaused: false,
    hintsUsed: [],
    questionsSkipped: []
  })

  const [showResults, setShowResults] = useState(false)
  const [isReviewMode, setIsReviewMode] = useState(false)

  // Timer effect
  useEffect(() => {
    if (session.isPaused || session.isCompleted || !session.timeRemaining) return

    const timer = setInterval(() => {
      setSession(prev => {
        if (prev.timeRemaining && prev.timeRemaining > 0) {
          return {
            ...prev,
            timeRemaining: prev.timeRemaining - 1
          }
        } else {
          // Time's up - auto-submit
          handleFinishQuiz()
          return prev
        }
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [session.isPaused, session.isCompleted, session.timeRemaining])

  // Handle answer submission
  const handleAnswer = useCallback((answer: any) => {
    setSession(prev => ({
      ...prev,
      answers: new Map(prev.answers).set(prev.currentQuestionIndex, answer)
    }))
  }, [])

  // Handle question navigation
  const handleQuestionChange = useCallback((index: number) => {
    setSession(prev => ({
      ...prev,
      currentQuestionIndex: index
    }))
  }, [])

  // Handle hint usage
  const handleHint = useCallback(() => {
    const currentQuestion = questions[session.currentQuestionIndex]
    if (currentQuestion?.hints && currentQuestion.hints.length > 0) {
      setSession(prev => ({
        ...prev,
        hintsUsed: [...prev.hintsUsed, prev.currentQuestionIndex]
      }))
    }
  }, [session.currentQuestionIndex, questions])

  // Handle skip question
  const handleSkip = useCallback(() => {
    setSession(prev => ({
      ...prev,
      questionsSkipped: [...prev.questionsSkipped, prev.currentQuestionIndex],
      currentQuestionIndex: Math.min(prev.currentQuestionIndex + 1, questions.length - 1)
    }))
  }, [questions.length])

  // Handle reset quiz
  const handleReset = useCallback(() => {
    setSession(prev => ({
      ...prev,
      currentQuestionIndex: 0,
      answers: new Map(),
      timeRemaining: config.timeLimit,
      isCompleted: false,
      isPaused: false,
      hintsUsed: [],
      questionsSkipped: []
    }))
  }, [config.timeLimit])

  // Handle pause/resume
  const handlePauseResume = useCallback(() => {
    setSession(prev => ({
      ...prev,
      isPaused: !prev.isPaused
    }))
  }, [])

  // Calculate score using the scoring service
  const calculateScore = useCallback(() => {
    return QuizScoringService.calculateScore(questions, session.answers)
  }, [questions, session.answers])

  // Handle quiz completion
  const handleQuizComplete = useCallback(() => {
    const results = calculateScore()
    
    // Save the quiz attempt
    const attempt: QuizAttempt = {
      id: `attempt-${Date.now()}`,
      quizId: quizId,
      userId: "current-user",
      answers: Array.from(session.answers.entries()).map(([questionIndex, answer]) => ({
        questionId: questions[questionIndex].id,
        answer: answer.answer,
        isCorrect: answer.isCorrect,
        timeSpent: answer.timeSpent
      })),
      score: results.percentage,
      completedAt: new Date().toISOString(),
      timeSpent: results.timeSpent,
      passed: results.passed
    }
    
    QuizScoringService.saveQuizAttempt(attempt)
    
    // Call the completion handler
    onComplete(results)
  }, [calculateScore, quizId, session.answers, questions, onComplete])

  // Handle finish quiz
  const handleFinishQuiz = useCallback(() => {
    setSession(prev => ({
      ...prev,
      isCompleted: true,
      isPaused: true
    }))
    setShowResults(true)
    handleQuizComplete()
  }, [handleQuizComplete])

  // Handle review mode toggle
  const handleToggleReview = useCallback(() => {
    setIsReviewMode(prev => !prev)
  }, [])

  // Get current question
  const currentQuestion = questions[session.currentQuestionIndex]
  const currentAnswer = session.answers.get(session.currentQuestionIndex)

  // Format time remaining
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  if (showResults) {
    const results = calculateScore()
    
    return (
      <QuizResultsDisplay
        results={results}
        onRetake={handleReset}
        onExit={onExit}
        className={className}
      />
    )
  }

  return (
    <div className={cn("w-full max-w-6xl mx-auto space-y-6", className)}>
      {/* Quiz header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Quiz Session</CardTitle>
              <p className="text-sm text-muted-foreground">
                Question {session.currentQuestionIndex + 1} of {questions.length}
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              {session.timeRemaining && (
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span className="font-mono text-lg">
                    {formatTime(session.timeRemaining)}
                  </span>
                </div>
              )}
              
              <Button
                variant="outline"
                size="sm"
                onClick={handlePauseResume}
                disabled={session.isCompleted}
              >
                {session.isPaused ? (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Resume
                  </>
                ) : (
                  <>
                    <Pause className="h-4 w-4 mr-2" />
                    Pause
                  </>
                )}
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={onExit}
              >
                Exit
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Quiz navigation */}
      <QuizNavigation
        questions={questions}
        currentQuestionIndex={session.currentQuestionIndex}
        onQuestionChange={handleQuestionChange}
        answers={session.answers}
        timeRemaining={session.timeRemaining}
        totalTime={config.timeLimit}
        onSkip={handleSkip}
        onReset={handleReset}
        onFinish={handleFinishQuiz}
        onToggleReview={handleToggleReview}
        isReviewMode={isReviewMode}
        disabled={session.isPaused || session.isCompleted}
      />

      {/* Current question */}
      {currentQuestion && (
        <QuizQuestionComponent
          question={currentQuestion}
          onAnswer={handleAnswer}
          selectedAnswer={currentAnswer}
          isAnswered={currentAnswer !== undefined}
          showCorrectAnswer={isReviewMode}
          timeRemaining={session.timeRemaining}
          onHint={handleHint}
          hintsUsed={session.hintsUsed.includes(session.currentQuestionIndex)}
          disabled={session.isPaused || session.isCompleted}
        />
      )}

      {/* Pause overlay */}
      {session.isPaused && !session.isCompleted && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-96">
            <CardHeader>
              <CardTitle className="text-center">Quiz Paused</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-muted-foreground">
                Your progress has been saved. Click resume to continue.
              </p>
              <Button onClick={handlePauseResume} className="w-full">
                <Play className="h-4 w-4 mr-2" />
                Resume Quiz
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
