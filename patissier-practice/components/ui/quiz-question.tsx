"use client"

import { MultipleChoiceQuestion } from "./multiple-choice-question"
import { DragDropQuestion } from "./drag-drop-question"
import { SequenceQuestion } from "./sequence-question"
import { FillBlankQuestion } from "./fill-blank-question"
import { MatchingQuestion } from "./matching-question"
import { TrueFalseQuestion } from "./true-false-question"
import { QuizQuestion } from "@/lib/types"

interface QuizQuestionProps {
  question: QuizQuestion
  onAnswer: (answer: any) => void
  selectedAnswer?: any
  isAnswered?: boolean
  showCorrectAnswer?: boolean
  timeRemaining?: number
  onHint?: () => void
  hintsUsed?: boolean
  disabled?: boolean
  className?: string
}

export function QuizQuestionComponent({
  question,
  onAnswer,
  selectedAnswer,
  isAnswered = false,
  showCorrectAnswer = false,
  timeRemaining,
  onHint,
  hintsUsed = false,
  disabled = false,
  className
}: QuizQuestionProps) {
  // Render the appropriate question component based on type
  switch (question.type) {
    case "multiple-choice":
      return (
        <MultipleChoiceQuestion
          question={question}
          onAnswer={onAnswer}
          selectedAnswer={selectedAnswer}
          isAnswered={isAnswered}
          showCorrectAnswer={showCorrectAnswer}
          timeRemaining={timeRemaining}
          onHint={onHint}
          hintsUsed={hintsUsed}
          disabled={disabled}
          className={className}
        />
      )

    case "drag-drop":
      return (
        <DragDropQuestion
          question={question}
          onAnswer={onAnswer}
          selectedAnswer={selectedAnswer}
          isAnswered={isAnswered}
          showCorrectAnswer={showCorrectAnswer}
          timeRemaining={timeRemaining}
          onHint={onHint}
          hintsUsed={hintsUsed}
          disabled={disabled}
          className={className}
        />
      )

    case "sequence":
      return (
        <SequenceQuestion
          question={question}
          onAnswer={onAnswer}
          selectedAnswer={selectedAnswer}
          isAnswered={isAnswered}
          showCorrectAnswer={showCorrectAnswer}
          timeRemaining={timeRemaining}
          onHint={onHint}
          hintsUsed={hintsUsed}
          disabled={disabled}
          className={className}
        />
      )

    case "fill-blank":
      return (
        <FillBlankQuestion
          question={question}
          onAnswer={onAnswer}
          selectedAnswer={selectedAnswer}
          isAnswered={isAnswered}
          showCorrectAnswer={showCorrectAnswer}
          timeRemaining={timeRemaining}
          onHint={onHint}
          hintsUsed={hintsUsed}
          disabled={disabled}
          className={className}
        />
      )

    case "matching":
      return (
        <MatchingQuestion
          question={question}
          onAnswer={onAnswer}
          selectedAnswer={selectedAnswer}
          isAnswered={isAnswered}
          showCorrectAnswer={showCorrectAnswer}
          timeRemaining={timeRemaining}
          onHint={onHint}
          hintsUsed={hintsUsed}
          disabled={disabled}
          className={className}
        />
      )

    case "true-false":
      return (
        <TrueFalseQuestion
          question={question}
          onAnswer={onAnswer}
          selectedAnswer={selectedAnswer}
          isAnswered={isAnswered}
          showCorrectAnswer={showCorrectAnswer}
          timeRemaining={timeRemaining}
          onHint={onHint}
          hintsUsed={hintsUsed}
          disabled={disabled}
          className={className}
        />
      )

    default:
      return (
        <div className="p-4 border rounded-lg bg-muted/50">
          <p className="text-sm text-muted-foreground">
            Unsupported question type: {question.type}
          </p>
        </div>
      )
  }
}
