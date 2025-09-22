"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { 
  Clock, 
  Lightbulb, 
  CheckCircle, 
  XCircle, 
  HelpCircle,
  RotateCcw
} from "lucide-react"
import { QuizQuestion, BlankItem } from "@/lib/types"
import { cn } from "@/lib/utils"

interface FillBlankQuestionProps {
  question: QuizQuestion
  onAnswer: (answer: BlankAnswer[]) => void
  selectedAnswer?: BlankAnswer[]
  isAnswered?: boolean
  showCorrectAnswer?: boolean
  timeRemaining?: number
  onHint?: () => void
  hintsUsed?: boolean
  disabled?: boolean
  className?: string
}

interface BlankAnswer {
  blankId: string
  answer: string
}

export function FillBlankQuestion({
  question,
  onAnswer,
  selectedAnswer = [],
  isAnswered = false,
  showCorrectAnswer = false,
  timeRemaining,
  onHint,
  hintsUsed = false,
  disabled = false,
  className
}: FillBlankQuestionProps) {
  const [userAnswers, setUserAnswers] = useState<BlankAnswer[]>(selectedAnswer)
  const [showExplanation, setShowExplanation] = useState(false)
  const [timeUp, setTimeUp] = useState(false)

  // Handle time limit
  useEffect(() => {
    if (question.timeLimit && timeRemaining !== undefined) {
      if (timeRemaining <= 0) {
        setTimeUp(true)
        if (userAnswers.length === 0) {
          // Auto-submit empty answers
          const answers = question.blanks?.map(blank => ({
            blankId: blank.id,
            answer: ""
          })) || []
          setUserAnswers(answers)
          onAnswer(answers)
        }
      }
    }
  }, [timeRemaining, question.timeLimit, userAnswers.length, question.blanks, onAnswer])

  // Handle input change
  const handleInputChange = (blankId: string, value: string) => {
    if (disabled || timeUp) return

    const newAnswers = userAnswers.filter(answer => answer.blankId !== blankId)
    newAnswers.push({ blankId, answer: value })
    setUserAnswers(newAnswers)
    onAnswer(newAnswers)
  }

  // Get answer for a blank
  const getAnswerForBlank = (blankId: string) => {
    const answer = userAnswers.find(a => a.blankId === blankId)
    return answer?.answer || ""
  }

  // Check if an answer is correct
  const isAnswerCorrect = (blank: BlankItem) => {
    if (!showCorrectAnswer) return false
    
    const userAnswer = getAnswerForBlank(blank.id).toLowerCase().trim()
    const correctAnswer = blank.correctAnswer.toLowerCase().trim()
    
    if (userAnswer === correctAnswer) return true
    
    // Check alternatives
    if (blank.alternatives) {
      return blank.alternatives.some(alt => 
        alt.toLowerCase().trim() === userAnswer
      )
    }
    
    return false
  }

  // Check if an answer is incorrect
  const isAnswerIncorrect = (blank: BlankItem) => {
    if (!showCorrectAnswer) return false
    
    const userAnswer = getAnswerForBlank(blank.id).trim()
    if (userAnswer === "") return false
    
    return !isAnswerCorrect(blank)
  }

  // Reset all answers
  const resetAnswers = () => {
    if (disabled || timeUp) return
    setUserAnswers([])
    onAnswer([])
  }

  // Format time remaining
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // Render question text with blanks
  const renderQuestionWithBlanks = () => {
    if (!question.blanks || question.blanks.length === 0) {
      return <p className="text-sm">{question.question}</p>
    }

    // Sort blanks by position
    const sortedBlanks = [...question.blanks].sort((a, b) => a.position - b.position)
    
    const elements: (string | JSX.Element)[] = []
    let lastIndex = 0

    sortedBlanks.forEach((blank, index) => {
      const beforeBlank = question.question.substring(lastIndex, blank.position)
      const afterBlank = index === sortedBlanks.length - 1 
        ? question.question.substring(blank.position)
        : ""

      if (beforeBlank) {
        elements.push(beforeBlank)
      }

      elements.push(
        <span key={`blank-${blank.id}`} className="inline-block mx-1">
          <Input
            value={getAnswerForBlank(blank.id)}
            onChange={(e) => handleInputChange(blank.id, e.target.value)}
            placeholder={`Blank ${index + 1}`}
            disabled={disabled || timeUp}
            className={cn(
              "inline-block w-32 h-8 text-center",
              {
                "border-green-500 bg-green-50": showCorrectAnswer && isAnswerCorrect(blank),
                "border-red-500 bg-red-50": showCorrectAnswer && isAnswerIncorrect(blank)
              }
            )}
          />
        </span>
      )

      if (afterBlank) {
        elements.push(afterBlank)
      }
      
      lastIndex = blank.position
    })

    return <div className="text-sm leading-relaxed">{elements}</div>
  }

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg font-semibold mb-2">
              Fill in the blanks
            </CardTitle>
            
            {/* Question metadata */}
            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
              <Badge variant="outline">{question.points} points</Badge>
              {question.timeLimit && (
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>
                    {timeRemaining !== undefined 
                      ? formatTime(timeRemaining) 
                      : `${formatTime(question.timeLimit)} limit`
                    }
                  </span>
                </div>
              )}
              {question.hints && question.hints.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onHint}
                  disabled={hintsUsed || disabled}
                  className="h-6 px-2"
                >
                  <Lightbulb className="h-4 w-4 mr-1" />
                  Hint
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={resetAnswers}
                disabled={disabled || timeUp}
                className="h-6 px-2"
              >
                <RotateCcw className="h-4 w-4 mr-1" />
                Reset
              </Button>
            </div>

            {/* Time progress bar */}
            {question.timeLimit && timeRemaining !== undefined && (
              <div className="mb-4">
                <Progress 
                  value={(timeRemaining / question.timeLimit) * 100} 
                  className="h-2"
                />
              </div>
            )}

            {/* Question image */}
            {question.image && (
              <div className="mb-4">
                <img 
                  src={question.image} 
                  alt="Question illustration"
                  className="max-w-full h-auto rounded-lg border"
                />
              </div>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {/* Question with blanks */}
        <div className="mb-6">
          {renderQuestionWithBlanks()}
        </div>

        {/* Hints */}
        {question.hints && question.hints.length > 0 && hintsUsed && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-medium text-sm mb-2 text-blue-800">Hint:</h4>
            <p className="text-sm text-blue-700">{question.hints[0]}</p>
          </div>
        )}

        {/* Answer feedback for each blank */}
        {showCorrectAnswer && question.blanks && (
          <div className="mb-6 space-y-3">
            {question.blanks.map((blank, index) => {
              const userAnswer = getAnswerForBlank(blank.id)
              const isCorrect = isAnswerCorrect(blank)
              const isIncorrect = isAnswerIncorrect(blank)

              return (
                <div
                  key={blank.id}
                  className={cn(
                    "p-3 rounded-lg border",
                    {
                      "bg-green-50 border-green-200": isCorrect,
                      "bg-red-50 border-red-200": isIncorrect,
                      "bg-muted/50": !isCorrect && !isIncorrect
                    }
                  )}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Blank {index + 1}</span>
                    <div className="flex items-center gap-2">
                      {isCorrect && <CheckCircle className="h-4 w-4 text-green-600" />}
                      {isIncorrect && <XCircle className="h-4 w-4 text-red-600" />}
                    </div>
                  </div>
                  
                  <div className="text-sm space-y-1">
                    <p>
                      <span className="font-medium">Your answer:</span> 
                      <span className={cn(
                        "ml-2 px-2 py-1 rounded text-xs",
                        {
                          "bg-green-100 text-green-800": isCorrect,
                          "bg-red-100 text-red-800": isIncorrect,
                          "bg-muted": !isCorrect && !isIncorrect
                        }
                      )}>
                        {userAnswer || "(empty)"}
                      </span>
                    </p>
                    <p>
                      <span className="font-medium">Correct answer:</span> 
                      <span className="ml-2 px-2 py-1 rounded text-xs bg-green-100 text-green-800">
                        {blank.correctAnswer}
                      </span>
                    </p>
                    {blank.hint && (
                      <p className="text-muted-foreground">
                        <span className="font-medium">Hint:</span> {blank.hint}
                      </p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Explanation */}
        {showExplanation && question.explanation && (
          <div className="mt-6 p-4 bg-muted/50 rounded-lg">
            <h4 className="font-medium text-sm mb-2">Explanation:</h4>
            <p className="text-sm text-muted-foreground">{question.explanation}</p>
          </div>
        )}

        {/* Show explanation button */}
        {isAnswered && !showExplanation && question.explanation && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowExplanation(true)}
            className="mt-4"
          >
            <HelpCircle className="h-4 w-4 mr-2" />
            Show Explanation
          </Button>
        )}

        {/* Time up message */}
        {timeUp && (
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              Time's up! Your answers have been automatically submitted.
            </p>
          </div>
        )}

        {/* Overall answer feedback */}
        {isAnswered && showCorrectAnswer && (
          <div className="mt-4 p-3 bg-muted/50 rounded-lg">
            <p className="text-sm">
              {userAnswers.length === 0 
                ? "No answers were provided. The correct answers are shown above."
                : `You provided ${userAnswers.length} answer(s). Correct answers are highlighted in green, incorrect ones in red.`
              }
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
