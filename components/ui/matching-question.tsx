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
  ArrowRight,
  Link
} from "lucide-react"
import { QuizQuestion, MatchingPair, MatchingAnswer } from "@/lib/types"
import { cn } from "@/lib/utils"

interface MatchingQuestionProps {
  question: QuizQuestion
  onAnswer: (answer: MatchingAnswer[]) => void
  selectedAnswer?: MatchingAnswer[]
  isAnswered?: boolean
  showCorrectAnswer?: boolean
  timeRemaining?: number
  onHint?: () => void
  hintsUsed?: boolean
  disabled?: boolean
  className?: string
}

export function MatchingQuestion({
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
}: MatchingQuestionProps) {
  const [userAnswers, setUserAnswers] = useState<MatchingAnswer[]>(selectedAnswer)
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null)
  const [selectedRight, setSelectedRight] = useState<string | null>(null)
  const [showExplanation, setShowExplanation] = useState(false)
  const [timeUp, setTimeUp] = useState(false)

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

  // Handle left item selection
  const handleLeftSelect = (leftText: string) => {
    if (disabled || timeUp) return

    if (selectedLeft === leftText) {
      setSelectedLeft(null)
    } else if (selectedRight) {
      // Create a match
      createMatch(leftText, selectedRight)
      setSelectedLeft(null)
      setSelectedRight(null)
    } else {
      setSelectedLeft(leftText)
    }
  }

  // Handle right item selection
  const handleRightSelect = (rightId: string) => {
    if (disabled || timeUp) return

    if (selectedRight === rightId) {
      setSelectedRight(null)
    } else if (selectedLeft) {
      // Create a match
      createMatch(selectedLeft, rightId)
      setSelectedLeft(null)
      setSelectedRight(null)
    } else {
      setSelectedRight(rightId)
    }
  }

  // Create a match between left and right items
  const createMatch = (leftText: string, rightText: string) => {
    // Find the matching pair by matching left and right text
    const pair = question.matchingPairs?.find(p => 
      p.left === leftText && p.right === rightText
    )
    
    if (!pair) return

    // Remove any existing match for this left item
    const newAnswers = userAnswers.filter(answer => answer.leftId !== leftText)
    
    // Add the new match
    newAnswers.push({
      pairId: pair.id,
      leftId: leftText,
      rightId: rightText
    })
    
    setUserAnswers(newAnswers)
    onAnswer(newAnswers)
  }

  // Remove a match
  const removeMatch = (leftText: string) => {
    if (disabled || timeUp) return
    
    const newAnswers = userAnswers.filter(answer => answer.leftId !== leftText)
    setUserAnswers(newAnswers)
    onAnswer(newAnswers)
  }

  // Reset all matches
  const resetMatches = () => {
    if (disabled || timeUp) return
    setUserAnswers([])
    onAnswer([])
    setSelectedLeft(null)
    setSelectedRight(null)
  }

  // Check if a match is correct
  const isMatchCorrect = (leftText: string, rightText: string) => {
    if (!showCorrectAnswer) return false
    
    const userMatch = userAnswers.find(answer => answer.leftId === leftText)
    if (!userMatch) return false
    
    return userMatch.rightId === rightText
  }

  // Check if a match is incorrect
  const isMatchIncorrect = (leftText: string, rightText: string) => {
    if (!showCorrectAnswer) return false
    
    const userMatch = userAnswers.find(answer => answer.leftId === leftText)
    if (!userMatch) return false
    
    return userMatch.rightId !== rightText
  }

  // Get matched right item for a left item
  const getMatchedRightItem = (leftText: string) => {
    const match = userAnswers.find(answer => answer.leftId === leftText)
    return match?.rightId || null
  }

  // Check if a right item is already matched
  const isRightItemMatched = (rightId: string) => {
    return userAnswers.some(answer => answer.rightId === rightId)
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
                onClick={resetMatches}
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
            Match the items on the left with the correct items on the right by clicking on them in sequence.
          </p>
        </div>

        {/* Matching pairs */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left column */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-center">Left Column</h4>
            {question.matchingPairs?.map((pair) => {
              const matchedRightId = getMatchedRightItem(pair.left)
              const isSelected = selectedLeft === pair.left
              const isMatched = matchedRightId !== null

              return (
                <div
                  key={pair.id}
                  onClick={() => handleLeftSelect(pair.left)}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all duration-200",
                    {
                      "bg-primary/5 border-primary": isSelected && !disabled && !timeUp,
                      "bg-green-50 border-green-200": showCorrectAnswer && isMatched && isMatchCorrect(pair.left, matchedRightId),
                      "bg-red-50 border-red-200": showCorrectAnswer && isMatched && isMatchIncorrect(pair.left, matchedRightId),
                      "bg-muted/50": isMatched && !showCorrectAnswer,
                      "hover:bg-muted/50": !disabled && !timeUp && !isMatched,
                      "opacity-50 cursor-not-allowed": disabled || timeUp
                    }
                  )}
                >
                  {pair.leftImage && (
                    <img 
                      src={pair.leftImage} 
                      alt={pair.left}
                      className="w-8 h-8 rounded object-cover"
                    />
                  )}
                  <span className="text-sm font-medium flex-1">{pair.left}</span>
                  
                  {isMatched && (
                    <div className="flex items-center gap-2">
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          removeMatch(pair.left)
                        }}
                        disabled={disabled || timeUp}
                        className="h-6 w-6 p-0"
                      >
                        <XCircle className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Right column */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-center">Right Column</h4>
            {question.matchingPairs?.map((pair) => {
              const isSelected = selectedRight === pair.right
              const isMatched = isRightItemMatched(pair.right)
              const matchedLeftId = userAnswers.find(answer => answer.rightId === pair.right)?.leftId

              return (
                <div
                  key={pair.id}
                  onClick={() => handleRightSelect(pair.right)}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all duration-200",
                    {
                      "bg-primary/5 border-primary": isSelected && !disabled && !timeUp,
                      "bg-green-50 border-green-200": showCorrectAnswer && isMatched && matchedLeftId && isMatchCorrect(matchedLeftId, pair.right),
                      "bg-red-50 border-red-200": showCorrectAnswer && isMatched && matchedLeftId && isMatchIncorrect(matchedLeftId, pair.right),
                      "bg-muted/50": isMatched && !showCorrectAnswer,
                      "hover:bg-muted/50": !disabled && !timeUp && !isMatched,
                      "opacity-50 cursor-not-allowed": disabled || timeUp || isMatched
                    }
                  )}
                >
                  {pair.rightImage && (
                    <img 
                      src={pair.rightImage} 
                      alt={pair.right}
                      className="w-8 h-8 rounded object-cover"
                    />
                  )}
                  <span className="text-sm font-medium flex-1">{pair.right}</span>
                  
                  {showCorrectAnswer && isMatched && (
                    <div className="flex items-center">
                      {matchedLeftId && isMatchCorrect(matchedLeftId, pair.right) && (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      )}
                      {matchedLeftId && isMatchIncorrect(matchedLeftId, pair.right) && (
                        <XCircle className="h-4 w-4 text-red-600" />
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Current matches */}
        {userAnswers.length > 0 && (
          <div className="mt-6 p-4 bg-muted/50 rounded-lg">
            <h4 className="text-sm font-medium mb-3">Current Matches:</h4>
            <div className="space-y-2">
              {userAnswers.map((answer) => {
                const pair = question.matchingPairs?.find(p => p.id === answer.pairId)
                if (!pair) return null

                return (
                  <div key={answer.pairId} className="flex items-center gap-2 text-sm">
                    <span className="font-medium">{pair.left}</span>
                    <ArrowRight className="h-3 w-3 text-muted-foreground" />
                    <span>{pair.right}</span>
                  </div>
                )
              })}
            </div>
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
              Time's up! Your current matches have been submitted.
            </p>
          </div>
        )}

        {/* Answer feedback */}
        {isAnswered && showCorrectAnswer && (
          <div className="mt-4 p-3 bg-muted/50 rounded-lg">
            <p className="text-sm">
              {userAnswers.length === 0 
                ? "No matches were made. The correct matches are highlighted above."
                : `You made ${userAnswers.length} match(es). Correct matches are highlighted in green, incorrect ones in red.`
              }
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
