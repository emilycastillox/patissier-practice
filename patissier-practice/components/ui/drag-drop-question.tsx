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
  Image as ImageIcon,
  GripVertical
} from "lucide-react"
import { QuizQuestion, DragItem, DragAnswer } from "@/lib/types"
import { cn } from "@/lib/utils"

interface DragDropQuestionProps {
  question: QuizQuestion
  onAnswer: (answer: DragAnswer[]) => void
  selectedAnswer?: DragAnswer[]
  isAnswered?: boolean
  showCorrectAnswer?: boolean
  timeRemaining?: number
  onHint?: () => void
  hintsUsed?: boolean
  disabled?: boolean
  className?: string
}

interface DragTarget {
  id: string
  label: string
  category?: string
  acceptedItems: string[]
  position: { x: number; y: number }
}

export function DragDropQuestion({
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
}: DragDropQuestionProps) {
  const [draggedItem, setDraggedItem] = useState<DragItem | null>(null)
  const [dragOverTarget, setDragOverTarget] = useState<string | null>(null)
  const [userAnswers, setUserAnswers] = useState<DragAnswer[]>(selectedAnswer)
  const [showExplanation, setShowExplanation] = useState(false)
  const [timeUp, setTimeUp] = useState(false)

  // Create drag targets from the question
  const dragTargets: DragTarget[] = question.dragItems?.map((item, index) => ({
    id: `target-${index}`,
    label: `Target ${index + 1}`,
    category: item.category,
    acceptedItems: [item.id],
    position: { x: 100 + (index * 200), y: 300 }
  })) || []

  // Handle time limit
  useEffect(() => {
    if (question.timeLimit && timeRemaining !== undefined) {
      if (timeRemaining <= 0) {
        setTimeUp(true)
        if (userAnswers.length === 0) {
          onAnswer([])
        }
      }
    }
  }, [timeRemaining, question.timeLimit, userAnswers.length, onAnswer])

  // Handle drag start
  const handleDragStart = (e: React.DragEvent, item: DragItem) => {
    if (disabled || timeUp) return
    setDraggedItem(item)
    e.dataTransfer.effectAllowed = "move"
  }

  // Handle drag over
  const handleDragOver = (e: React.DragEvent, targetId: string) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = "move"
    setDragOverTarget(targetId)
  }

  // Handle drag leave
  const handleDragLeave = () => {
    setDragOverTarget(null)
  }

  // Handle drop
  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault()
    if (!draggedItem || disabled || timeUp) return

    const target = dragTargets.find(t => t.id === targetId)
    if (!target) return

    // Check if this item can be dropped on this target
    if (!target.acceptedItems.includes(draggedItem.id)) {
      setDragOverTarget(null)
      setDraggedItem(null)
      return
    }

    // Update user answers
    const newAnswers = userAnswers.filter(answer => answer.itemId !== draggedItem.id)
    newAnswers.push({
      itemId: draggedItem.id,
      targetId: targetId
    })
    
    setUserAnswers(newAnswers)
    onAnswer(newAnswers)
    setDragOverTarget(null)
    setDraggedItem(null)
  }

  // Handle drag end
  const handleDragEnd = () => {
    setDraggedItem(null)
    setDragOverTarget(null)
  }

  // Remove answer
  const removeAnswer = (itemId: string) => {
    if (disabled || timeUp) return
    const newAnswers = userAnswers.filter(answer => answer.itemId !== itemId)
    setUserAnswers(newAnswers)
    onAnswer(newAnswers)
  }

  // Reset answers
  const resetAnswers = () => {
    if (disabled || timeUp) return
    setUserAnswers([])
    onAnswer([])
  }

  // Check if an item is correctly placed
  const isItemCorrectlyPlaced = (itemId: string) => {
    if (!showCorrectAnswer) return false
    
    const userAnswer = userAnswers.find(answer => answer.itemId === itemId)
    if (!userAnswer) return false

    // Find the correct target for this item
    const correctTarget = dragTargets.find(target => 
      target.acceptedItems.includes(itemId)
    )
    
    return correctTarget?.id === userAnswer.targetId
  }

  // Check if an item is incorrectly placed
  const isItemIncorrectlyPlaced = (itemId: string) => {
    if (!showCorrectAnswer) return false
    
    const userAnswer = userAnswers.find(answer => answer.itemId === itemId)
    if (!userAnswer) return false

    return !isItemCorrectlyPlaced(itemId)
  }

  // Get placed items for a target
  const getPlacedItemsForTarget = (targetId: string) => {
    return userAnswers
      .filter(answer => answer.targetId === targetId)
      .map(answer => question.dragItems?.find(item => item.id === answer.itemId))
      .filter(Boolean) as DragItem[]
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
                onClick={resetAnswers}
                disabled={disabled || timeUp || userAnswers.length === 0}
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
        {/* Drag items */}
        <div className="mb-8">
          <h4 className="text-sm font-medium mb-3">Drag these items to the correct targets:</h4>
          <div className="flex flex-wrap gap-3">
            {question.dragItems?.map((item) => {
              const isPlaced = userAnswers.some(answer => answer.itemId === item.id)
              const isCorrect = isItemCorrectlyPlaced(item.id)
              const isIncorrect = isItemIncorrectlyPlaced(item.id)

              return (
                <div
                  key={item.id}
                  draggable={!disabled && !timeUp && !isPlaced}
                  onDragStart={(e) => handleDragStart(e, item)}
                  onDragEnd={handleDragEnd}
                  className={cn(
                    "flex items-center gap-2 p-3 rounded-lg border cursor-move transition-all duration-200",
                    {
                      "bg-primary/5 border-primary hover:bg-primary/10": !isPlaced && !disabled && !timeUp,
                      "bg-green-50 border-green-200": showCorrectAnswer && isCorrect,
                      "bg-red-50 border-red-200": showCorrectAnswer && isIncorrect,
                      "opacity-50 cursor-not-allowed": disabled || timeUp || isPlaced,
                      "cursor-move": !disabled && !timeUp && !isPlaced
                    }
                  )}
                >
                  {item.image && (
                    <img 
                      src={item.image} 
                      alt={item.content}
                      className="w-8 h-8 rounded object-cover"
                    />
                  )}
                  <span className="text-sm font-medium">{item.content}</span>
                  {showCorrectAnswer && (
                    <div className="flex items-center">
                      {isCorrect && <CheckCircle className="h-4 w-4 text-green-600" />}
                      {isIncorrect && <XCircle className="h-4 w-4 text-red-600" />}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Drop targets */}
        <div className="mb-6">
          <h4 className="text-sm font-medium mb-3">Drop zones:</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {dragTargets.map((target) => {
              const placedItems = getPlacedItemsForTarget(target.id)
              const isDragOver = dragOverTarget === target.id

              return (
                <div
                  key={target.id}
                  onDragOver={(e) => handleDragOver(e, target.id)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, target.id)}
                  className={cn(
                    "min-h-[120px] p-4 rounded-lg border-2 border-dashed transition-all duration-200",
                    {
                      "border-primary bg-primary/5": isDragOver && !disabled && !timeUp,
                      "border-muted-foreground/25": !isDragOver,
                      "border-green-200 bg-green-50": showCorrectAnswer && placedItems.length > 0 && placedItems.every(item => isItemCorrectlyPlaced(item.id)),
                      "border-red-200 bg-red-50": showCorrectAnswer && placedItems.length > 0 && placedItems.some(item => isItemIncorrectlyPlaced(item.id))
                    }
                  )}
                >
                  <div className="text-center">
                    <h5 className="text-sm font-medium mb-2">{target.label}</h5>
                    {target.category && (
                      <p className="text-xs text-muted-foreground mb-3">{target.category}</p>
                    )}
                    
                    {/* Placed items */}
                    <div className="space-y-2">
                      {placedItems.map((item) => (
                        <div
                          key={item.id}
                          className={cn(
                            "flex items-center justify-between gap-2 p-2 rounded border text-xs",
                            {
                              "bg-green-100 border-green-300": showCorrectAnswer && isItemCorrectlyPlaced(item.id),
                              "bg-red-100 border-red-300": showCorrectAnswer && isItemIncorrectlyPlaced(item.id),
                              "bg-muted": !showCorrectAnswer
                            }
                          )}
                        >
                          <span className="flex-1">{item.content}</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeAnswer(item.id)}
                            disabled={disabled || timeUp}
                            className="h-6 w-6 p-0"
                          >
                            <XCircle className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>

                    {/* Empty state */}
                    {placedItems.length === 0 && (
                      <p className="text-xs text-muted-foreground">
                        Drop items here
                      </p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
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
              Time's up! Your answers have been automatically submitted.
            </p>
          </div>
        )}

        {/* Answer feedback */}
        {isAnswered && showCorrectAnswer && (
          <div className="mt-4 p-3 bg-muted/50 rounded-lg">
            <p className="text-sm">
              {userAnswers.length === 0 
                ? "No items were placed. The correct placements are highlighted above."
                : `You placed ${userAnswers.length} item(s). Correct placements are highlighted in green, incorrect ones in red.`
              }
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
