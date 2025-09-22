"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { 
  Clock, 
  Lightbulb, 
  CheckCircle, 
  XCircle, 
  HelpCircle,
  Image as ImageIcon,
  Play
} from "lucide-react"
import { QuizQuestion } from "@/lib/types"
import { cn } from "@/lib/utils"

interface MultipleChoiceQuestionProps {
  question: QuizQuestion
  onAnswer: (answer: number | number[]) => void
  selectedAnswer?: number | number[]
  isAnswered?: boolean
  showCorrectAnswer?: boolean
  timeRemaining?: number
  onHint?: () => void
  hintsUsed?: boolean
  allowMultiple?: boolean
  disabled?: boolean
  className?: string
}

export function MultipleChoiceQuestion({
  question,
  onAnswer,
  selectedAnswer,
  isAnswered = false,
  showCorrectAnswer = false,
  timeRemaining,
  onHint,
  hintsUsed = false,
  allowMultiple = false,
  disabled = false,
  className
}: MultipleChoiceQuestionProps) {
  const [localAnswer, setLocalAnswer] = useState<number | number[] | undefined>(selectedAnswer)
  const [showExplanation, setShowExplanation] = useState(false)
  const [timeUp, setTimeUp] = useState(false)

  // Handle time limit
  useEffect(() => {
    if (question.timeLimit && timeRemaining !== undefined) {
      if (timeRemaining <= 0) {
        setTimeUp(true)
        if (localAnswer === undefined) {
          onAnswer(allowMultiple ? [] : -1)
        }
      }
    }
  }, [timeRemaining, question.timeLimit, localAnswer, onAnswer, allowMultiple])

  // Handle answer selection
  const handleAnswerChange = (value: string) => {
    if (disabled || timeUp) return

    if (allowMultiple) {
      const answerIndex = parseInt(value)
      const currentAnswers = Array.isArray(localAnswer) ? localAnswer : []
      
      if (currentAnswers.includes(answerIndex)) {
        const newAnswers = currentAnswers.filter(a => a !== answerIndex)
        setLocalAnswer(newAnswers)
        onAnswer(newAnswers)
      } else {
        const newAnswers = [...currentAnswers, answerIndex]
        setLocalAnswer(newAnswers)
        onAnswer(newAnswers)
      }
    } else {
      const answerIndex = parseInt(value)
      setLocalAnswer(answerIndex)
      onAnswer(answerIndex)
    }
  }

  // Check if an option is correct
  const isOptionCorrect = (index: number) => {
    if (!showCorrectAnswer) return false
    
    if (Array.isArray(question.correctAnswer)) {
      return (question.correctAnswer as number[]).includes(index)
    } else if (typeof question.correctAnswer === 'number') {
      return question.correctAnswer === index
    } else {
      return false
    }
  }

  // Check if an option is selected
  const isOptionSelected = (index: number) => {
    if (Array.isArray(localAnswer)) {
      return localAnswer.includes(index)
    } else {
      return localAnswer === index
    }
  }

  // Check if user's answer is correct
  const isUserAnswerCorrect = () => {
    if (!isAnswered || !showCorrectAnswer) return false
    
    if (Array.isArray(question.correctAnswer) && Array.isArray(localAnswer)) {
      return (question.correctAnswer as number[]).length === localAnswer.length &&
             (question.correctAnswer as number[]).every(answer => localAnswer.includes(answer))
    } else if (!Array.isArray(question.correctAnswer) && !Array.isArray(localAnswer)) {
      return question.correctAnswer === localAnswer
    }
    return false
  }

  // Format time remaining
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg font-semibold mb-2">
              {question.question}
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

            {/* Question video */}
            {question.videoUrl && (
              <div className="mb-4">
                <div className="relative">
                  <video 
                    src={question.videoUrl}
                    controls
                    className="max-w-full h-auto rounded-lg border"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {/* Answer options */}
        {allowMultiple ? (
          <div className="space-y-3">
            {question.options?.map((option, index) => {
              const isCorrect = isOptionCorrect(index)
              const isSelected = isOptionSelected(index)
              const isWrong = isAnswered && isSelected && !isCorrect

              return (
                <div
                  key={index}
                  className={cn(
                    "flex items-center space-x-3 p-3 rounded-lg border transition-all duration-200",
                    {
                      "bg-primary/5 border-primary": isSelected && !showCorrectAnswer,
                      "bg-green-50 border-green-200": showCorrectAnswer && isCorrect,
                      "bg-red-50 border-red-200": showCorrectAnswer && isWrong,
                      "hover:bg-muted/50": !disabled && !timeUp,
                      "opacity-50 cursor-not-allowed": disabled || timeUp,
                      "cursor-pointer": !disabled && !timeUp
                    }
                  )}
                >
                  <Checkbox
                    id={`option-${index}`}
                    checked={isSelected}
                    disabled={disabled || timeUp}
                    className="mt-1"
                    onCheckedChange={(checked) => {
                      if (checked) {
                        const currentAnswers = Array.isArray(localAnswer) ? localAnswer : []
                        const newAnswers = [...currentAnswers, index]
                        setLocalAnswer(newAnswers)
                        onAnswer(newAnswers)
                      } else {
                        const currentAnswers = Array.isArray(localAnswer) ? localAnswer : []
                        const newAnswers = currentAnswers.filter(a => a !== index)
                        setLocalAnswer(newAnswers)
                        onAnswer(newAnswers)
                      }
                    }}
                  />
                  
                  <Label 
                    htmlFor={`option-${index}`}
                    className={cn(
                      "flex-1 cursor-pointer",
                      {
                        "cursor-not-allowed": disabled || timeUp
                      }
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{option}</span>
                      
                      {/* Answer status icons */}
                      {showCorrectAnswer && (
                        <div className="flex items-center gap-2">
                          {isCorrect && (
                            <CheckCircle className="h-5 w-5 text-green-600" />
                          )}
                          {isWrong && (
                            <XCircle className="h-5 w-5 text-red-600" />
                          )}
                        </div>
                      )}
                    </div>
                  </Label>
                </div>
              )
            })}
          </div>
        ) : (
          <RadioGroup
            value={localAnswer?.toString()}
            onValueChange={handleAnswerChange}
            disabled={disabled || timeUp}
            className="space-y-3"
          >
            {question.options?.map((option, index) => {
              const isCorrect = isOptionCorrect(index)
              const isSelected = isOptionSelected(index)
              const isWrong = isAnswered && isSelected && !isCorrect

              return (
                <div
                  key={index}
                  className={cn(
                    "flex items-center space-x-3 p-3 rounded-lg border transition-all duration-200",
                    {
                      "bg-primary/5 border-primary": isSelected && !showCorrectAnswer,
                      "bg-green-50 border-green-200": showCorrectAnswer && isCorrect,
                      "bg-red-50 border-red-200": showCorrectAnswer && isWrong,
                      "hover:bg-muted/50": !disabled && !timeUp,
                      "opacity-50 cursor-not-allowed": disabled || timeUp,
                      "cursor-pointer": !disabled && !timeUp
                    }
                  )}
                >
                  <RadioGroupItem
                    value={index.toString()}
                    id={`option-${index}`}
                    disabled={disabled || timeUp}
                    className="mt-1"
                  />
                  
                  <Label 
                    htmlFor={`option-${index}`}
                    className={cn(
                      "flex-1 cursor-pointer",
                      {
                        "cursor-not-allowed": disabled || timeUp
                      }
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{option}</span>
                      
                      {/* Answer status icons */}
                      {showCorrectAnswer && (
                        <div className="flex items-center gap-2">
                          {isCorrect && (
                            <CheckCircle className="h-5 w-5 text-green-600" />
                          )}
                          {isWrong && (
                            <XCircle className="h-5 w-5 text-red-600" />
                          )}
                        </div>
                      )}
                    </div>
                  </Label>
                </div>
              )
            })}
          </RadioGroup>
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
              Time's up! Your answer has been automatically submitted.
            </p>
          </div>
        )}

        {/* Answer feedback */}
        {isAnswered && showCorrectAnswer && (
          <div className={cn(
            "mt-4 p-3 rounded-lg",
            isUserAnswerCorrect() 
              ? "bg-green-50 border border-green-200" 
              : "bg-red-50 border border-red-200"
          )}>
            <p className={cn(
              "text-sm font-medium",
              isUserAnswerCorrect() ? "text-green-800" : "text-red-800"
            )}>
              {isUserAnswerCorrect() ? "Correct!" : "Incorrect. The correct answer is highlighted above."}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
