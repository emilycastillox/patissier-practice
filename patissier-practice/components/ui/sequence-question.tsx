"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  Clock, 
  Lightbulb, 
  CheckCircle, 
  XCircle, 
  HelpCircle,
  RotateCcw,
  ArrowUp,
  ArrowDown,
  GripVertical
} from "lucide-react"
import { QuizQuestion, SequenceItem, SequenceAnswer } from "@/lib/types"
import { cn } from "@/lib/utils"

interface SequenceQuestionProps {
  question: QuizQuestion
  onAnswer: (answer: SequenceAnswer[]) => void
  selectedAnswer?: SequenceAnswer[]
  isAnswered?: boolean
  showCorrectAnswer?: boolean
  timeRemaining?: number
  onHint?: () => void
  hintsUsed?: boolean
  disabled?: boolean
  className?: string
}

export function SequenceQuestion({
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
}: SequenceQuestionProps) {
  const [sequence, setSequence] = useState<SequenceItem[]>([])
  const [userAnswers, setUserAnswers] = useState<SequenceAnswer[]>(selectedAnswer)
  const [showExplanation, setShowExplanation] = useState(false)
  const [timeUp, setTimeUp] = useState(false)

  // Initialize sequence from question data
  useEffect(() => {
    if (question.sequenceItems) {
      // Shuffle items if not showing correct answer
      const shuffled = showCorrectAnswer 
        ? [...question.sequenceItems].sort((a, b) => a.order - b.order)
        : [...question.sequenceItems].sort(() => Math.random() - 0.5)
      setSequence(shuffled)
    }
  }, [question.sequenceItems, showCorrectAnswer])

  // Handle time limit
  useEffect(() => {
    if (question.timeLimit && timeRemaining !== undefined) {
      if (timeRemaining <= 0) {
        setTimeUp(true)
        if (userAnswers.length === 0) {
          // Auto-submit current sequence
          const answers = sequence.map((item, index) => ({
            itemId: item.id,
            order: index + 1
          }))
          setUserAnswers(answers)
          onAnswer(answers)
        }
      }
    }
  }, [timeRemaining, question.timeLimit, userAnswers.length, sequence, onAnswer])

  // Move item up in sequence
  const moveItemUp = (index: number) => {
    if (disabled || timeUp || index === 0) return
    
    const newSequence = [...sequence]
    const temp = newSequence[index]
    newSequence[index] = newSequence[index - 1]
    newSequence[index - 1] = temp
    setSequence(newSequence)
    
    // Update answers
    const answers = newSequence.map((item, idx) => ({
      itemId: item.id,
      order: idx + 1
    }))
    setUserAnswers(answers)
    onAnswer(answers)
  }

  // Move item down in sequence
  const moveItemDown = (index: number) => {
    if (disabled || timeUp || index === sequence.length - 1) return
    
    const newSequence = [...sequence]
    const temp = newSequence[index]
    newSequence[index] = newSequence[index + 1]
    newSequence[index + 1] = temp
    setSequence(newSequence)
    
    // Update answers
    const answers = newSequence.map((item, idx) => ({
      itemId: item.id,
      order: idx + 1
    }))
    setUserAnswers(answers)
    onAnswer(answers)
  }

  // Reset sequence to original order
  const resetSequence = () => {
    if (disabled || timeUp) return
    
    const originalOrder = question.sequenceItems?.sort((a, b) => a.order - b.order) || []
    setSequence(originalOrder)
    
    const answers = originalOrder.map((item, idx) => ({
      itemId: item.id,
      order: idx + 1
    }))
    setUserAnswers(answers)
    onAnswer(answers)
  }

  // Check if an item is in the correct position
  const isItemInCorrectPosition = (item: SequenceItem, currentIndex: number) => {
    if (!showCorrectAnswer) return false
    return item.order === currentIndex + 1
  }

  // Check if an item is in the wrong position
  const isItemInWrongPosition = (item: SequenceItem, currentIndex: number) => {
    if (!showCorrectAnswer) return false
    return !isItemInCorrectPosition(item, currentIndex)
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
              <Button
                variant="ghost"
                size="sm"
                onClick={resetSequence}
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
        {/* Instructions */}
        <div className="mb-6">
          <p className="text-sm text-muted-foreground">
            Arrange the items in the correct order by using the up/down arrows:
          </p>
        </div>

        {/* Sequence items */}
        <div className="space-y-3">
          {sequence.map((item, index) => {
            const isCorrect = isItemInCorrectPosition(item, index)
            const isWrong = isItemInWrongPosition(item, index)

            return (
              <div
                key={item.id}
                className={cn(
                  "flex items-center gap-3 p-4 rounded-lg border transition-all duration-200",
                  {
                    "bg-green-50 border-green-200": showCorrectAnswer && isCorrect,
                    "bg-red-50 border-red-200": showCorrectAnswer && isWrong,
                    "bg-muted/50": !showCorrectAnswer
                  }
                )}
              >
                {/* Position number */}
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                  {index + 1}
                </div>

                {/* Item content */}
                <div className="flex-1 flex items-center gap-3">
                  {item.image && (
                    <img 
                      src={item.image} 
                      alt={item.content}
                      className="w-12 h-12 rounded object-cover"
                    />
                  )}
                  <span className="text-sm font-medium">{item.content}</span>
                </div>

                {/* Status indicators */}
                {showCorrectAnswer && (
                  <div className="flex items-center gap-2">
                    {isCorrect && <CheckCircle className="h-5 w-5 text-green-600" />}
                    {isWrong && <XCircle className="h-5 w-5 text-red-600" />}
                  </div>
                )}

                {/* Move controls */}
                <div className="flex flex-col gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => moveItemUp(index)}
                    disabled={disabled || timeUp || index === 0}
                    className="h-6 w-6 p-0"
                  >
                    <ArrowUp className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => moveItemDown(index)}
                    disabled={disabled || timeUp || index === sequence.length - 1}
                    className="h-6 w-6 p-0"
                  >
                    <ArrowDown className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            )
          })}
        </div>

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
              Time's up! Your current sequence has been submitted.
            </p>
          </div>
        )}

        {/* Answer feedback */}
        {isAnswered && showCorrectAnswer && (
          <div className="mt-4 p-3 bg-muted/50 rounded-lg">
            <p className="text-sm">
              {userAnswers.length === 0 
                ? "No sequence was provided. The correct order is shown above."
                : `Your sequence has been submitted. Correct positions are highlighted in green, incorrect ones in red.`
              }
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
