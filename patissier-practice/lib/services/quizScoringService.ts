import { QuizQuestion, QuizAnswer, QuizResults, QuestionResult, QuizAttempt } from "@/lib/types"

export class QuizScoringService {
  /**
   * Calculate the score for a quiz attempt
   */
  static calculateScore(
    questions: QuizQuestion[],
    answers: Map<number, QuizAnswer>
  ): QuizResults {
    const questionResults: QuestionResult[] = []
    let totalScore = 0
    let maxScore = 0
    let correctAnswers = 0

    questions.forEach((question, index) => {
      const userAnswer = answers.get(index)
      const questionResult = this.scoreQuestion(question, userAnswer)
      
      questionResults.push(questionResult)
      totalScore += questionResult.pointsEarned
      maxScore += questionResult.maxPoints
      
      if (questionResult.isCorrect) {
        correctAnswers++
      }
    })

    const percentage = maxScore > 0 ? (totalScore / maxScore) * 100 : 0
    const passed = percentage >= 70 // Default passing score

    return {
      attemptId: `attempt-${Date.now()}`,
      quizId: 0, // Will be set by caller
      userId: "current-user", // Will be set by caller
      score: totalScore,
      maxScore: maxScore,
      percentage: Math.round(percentage),
      passed: passed,
      timeSpent: this.calculateTotalTimeSpent(questionResults),
      completedAt: new Date().toISOString(),
      questionResults: questionResults,
      strengths: this.identifyStrengths(questionResults),
      weaknesses: this.identifyWeaknesses(questionResults),
      recommendations: this.generateRecommendations(questionResults, percentage)
    }
  }

  /**
   * Score an individual question
   */
  private static scoreQuestion(
    question: QuizQuestion,
    userAnswer?: QuizAnswer
  ): QuestionResult {
    const maxPoints = question.points
    let pointsEarned = 0
    let isCorrect = false
    let timeSpent = userAnswer?.timeSpent || 0

    if (userAnswer) {
      isCorrect = this.checkAnswer(question, userAnswer.answer)
      pointsEarned = isCorrect ? maxPoints : 0
    }

    return {
      questionId: question.id,
      question: question.question,
      userAnswer: userAnswer?.answer || null,
      correctAnswer: question.correctAnswer,
      isCorrect: isCorrect,
      pointsEarned: pointsEarned,
      maxPoints: maxPoints,
      timeSpent: timeSpent,
      explanation: question.explanation
    }
  }

  /**
   * Check if a user's answer is correct
   */
  private static checkAnswer(question: QuizQuestion, userAnswer: any): boolean {
    switch (question.type) {
      case "multiple-choice":
        return this.checkMultipleChoice(question, userAnswer)
      
      case "true-false":
        return this.checkTrueFalse(question, userAnswer)
      
      case "sequence":
        return this.checkSequence(question, userAnswer)
      
      case "drag-drop":
        return this.checkDragDrop(question, userAnswer)
      
      case "fill-blank":
        return this.checkFillBlank(question, userAnswer)
      
      case "matching":
        return this.checkMatching(question, userAnswer)
      
      default:
        return false
    }
  }

  /**
   * Check multiple choice answer
   */
  private static checkMultipleChoice(question: QuizQuestion, userAnswer: any): boolean {
    if (Array.isArray(question.correctAnswer)) {
      // Multiple correct answers
      if (!Array.isArray(userAnswer)) return false
      return question.correctAnswer.length === userAnswer.length &&
             question.correctAnswer.every(answer => userAnswer.includes(answer))
    } else {
      // Single correct answer
      return userAnswer === question.correctAnswer
    }
  }

  /**
   * Check true/false answer
   */
  private static checkTrueFalse(question: QuizQuestion, userAnswer: any): boolean {
    const correctAnswer = typeof question.correctAnswer === "boolean" 
      ? question.correctAnswer 
      : question.correctAnswer === 1 || question.correctAnswer === "true"
    
    return userAnswer === correctAnswer
  }

  /**
   * Check sequence answer
   */
  private static checkSequence(question: QuizQuestion, userAnswer: any): boolean {
    if (!Array.isArray(userAnswer) || !Array.isArray(question.correctAnswer)) {
      return false
    }

    // Check if the sequence is correct
    return userAnswer.length === question.correctAnswer.length &&
           userAnswer.every((answer, index) => answer.order === question.correctAnswer[index])
  }

  /**
   * Check drag and drop answer
   */
  private static checkDragDrop(question: QuizQuestion, userAnswer: any): boolean {
    if (!Array.isArray(userAnswer) || !question.dragItems) {
      return false
    }

    // Check if all items are correctly placed
    return userAnswer.every((answer: any) => {
      const correctTarget = question.dragItems?.find(item => 
        item.id === answer.itemId
      )
      return correctTarget && answer.targetId === `target-${question.dragItems?.indexOf(correctTarget)}`
    })
  }

  /**
   * Check fill in the blank answer
   */
  private static checkFillBlank(question: QuizQuestion, userAnswer: any): boolean {
    if (!Array.isArray(userAnswer) || !question.blanks) {
      return false
    }

    return question.blanks.every(blank => {
      const userBlankAnswer = userAnswer.find((answer: any) => answer.blankId === blank.id)
      if (!userBlankAnswer) return false

      const userAnswerText = userBlankAnswer.answer.toLowerCase().trim()
      const correctAnswer = blank.correctAnswer.toLowerCase().trim()
      
      if (userAnswerText === correctAnswer) return true
      
      // Check alternatives
      if (blank.alternatives) {
        return blank.alternatives.some(alt => 
          alt.toLowerCase().trim() === userAnswerText
        )
      }
      
      return false
    })
  }

  /**
   * Check matching answer
   */
  private static checkMatching(question: QuizQuestion, userAnswer: any): boolean {
    if (!Array.isArray(userAnswer) || !question.matchingPairs) {
      return false
    }

    return question.matchingPairs.every(pair => {
      const userMatch = userAnswer.find((answer: any) => answer.leftId === pair.leftId)
      return userMatch && userMatch.rightId === pair.rightId
    })
  }

  /**
   * Calculate total time spent on quiz
   */
  private static calculateTotalTimeSpent(questionResults: QuestionResult[]): number {
    return questionResults.reduce((total, result) => total + result.timeSpent, 0)
  }

  /**
   * Identify user's strengths based on performance
   */
  private static identifyStrengths(questionResults: QuestionResult[]): string[] {
    const strengths: string[] = []
    const correctQuestions = questionResults.filter(result => result.isCorrect)
    
    if (correctQuestions.length === questionResults.length) {
      strengths.push("Perfect score! You have excellent knowledge in this area.")
    } else if (correctQuestions.length >= questionResults.length * 0.8) {
      strengths.push("Strong performance! You have good understanding of most concepts.")
    }

    // Add specific strengths based on question types
    const questionTypes = new Set(questionResults.map(r => r.questionId))
    if (questionTypes.size > 1) {
      strengths.push("You performed well across different question types.")
    }

    return strengths
  }

  /**
   * Identify user's weaknesses based on performance
   */
  private static identifyWeaknesses(questionResults: QuestionResult[]): string[] {
    const weaknesses: string[] = []
    const incorrectQuestions = questionResults.filter(result => !result.isCorrect)
    
    if (incorrectQuestions.length > 0) {
      weaknesses.push(`You missed ${incorrectQuestions.length} question(s). Review the explanations to improve.`)
    }

    // Add specific weaknesses
    const slowQuestions = questionResults.filter(result => result.timeSpent > 120) // More than 2 minutes
    if (slowQuestions.length > 0) {
      weaknesses.push("Some questions took longer than expected. Consider reviewing the material.")
    }

    return weaknesses
  }

  /**
   * Generate recommendations based on performance
   */
  private static generateRecommendations(
    questionResults: QuestionResult[],
    percentage: number
  ): string[] {
    const recommendations: string[] = []

    if (percentage < 50) {
      recommendations.push("Consider reviewing the fundamental concepts before retaking the quiz.")
    } else if (percentage < 70) {
      recommendations.push("You're close to passing! Review the incorrect answers and try again.")
    } else if (percentage < 90) {
      recommendations.push("Good job! You passed. Consider reviewing the explanations to improve further.")
    } else {
      recommendations.push("Excellent work! You have a strong understanding of the material.")
    }

    // Add specific recommendations based on question types
    const incorrectQuestions = questionResults.filter(result => !result.isCorrect)
    if (incorrectQuestions.length > 0) {
      recommendations.push("Focus on the questions you got wrong and study the explanations provided.")
    }

    return recommendations
  }

  /**
   * Save quiz attempt to localStorage (in a real app, this would be saved to a database)
   */
  static saveQuizAttempt(attempt: QuizAttempt): void {
    if (typeof window === 'undefined') return

    try {
      const attempts = this.getQuizAttempts()
      attempts.push(attempt)
      localStorage.setItem('quiz-attempts', JSON.stringify(attempts))
    } catch (error) {
      console.error('Error saving quiz attempt:', error)
    }
  }

  /**
   * Get quiz attempts from localStorage
   */
  static getQuizAttempts(): QuizAttempt[] {
    if (typeof window === 'undefined') return []

    try {
      const attempts = localStorage.getItem('quiz-attempts')
      return attempts ? JSON.parse(attempts) : []
    } catch (error) {
      console.error('Error loading quiz attempts:', error)
      return []
    }
  }

  /**
   * Get quiz attempts for a specific quiz
   */
  static getQuizAttemptsForQuiz(quizId: number): QuizAttempt[] {
    return this.getQuizAttempts().filter(attempt => attempt.quizId === quizId)
  }

  /**
   * Get user's best score for a quiz
   */
  static getBestScore(quizId: number): number {
    const attempts = this.getQuizAttemptsForQuiz(quizId)
    return attempts.length > 0 ? Math.max(...attempts.map(attempt => attempt.score)) : 0
  }

  /**
   * Get user's average score for a quiz
   */
  static getAverageScore(quizId: number): number {
    const attempts = this.getQuizAttemptsForQuiz(quizId)
    if (attempts.length === 0) return 0
    
    const totalScore = attempts.reduce((sum, attempt) => sum + attempt.score, 0)
    return Math.round(totalScore / attempts.length)
  }

  /**
   * Check if user can retake a quiz
   */
  static canRetakeQuiz(quizId: number, maxAttempts: number): boolean {
    const attempts = this.getQuizAttemptsForQuiz(quizId)
    return attempts.length < maxAttempts
  }

  /**
   * Get quiz statistics
   */
  static getQuizStatistics(quizId: number) {
    const attempts = this.getQuizAttemptsForQuiz(quizId)
    
    if (attempts.length === 0) {
      return {
        totalAttempts: 0,
        bestScore: 0,
        averageScore: 0,
        passRate: 0,
        averageTimeSpent: 0
      }
    }

    const passedAttempts = attempts.filter(attempt => attempt.passed).length
    const totalTimeSpent = attempts.reduce((sum, attempt) => sum + attempt.timeSpent, 0)

    return {
      totalAttempts: attempts.length,
      bestScore: Math.max(...attempts.map(attempt => attempt.score)),
      averageScore: Math.round(attempts.reduce((sum, attempt) => sum + attempt.score, 0) / attempts.length),
      passRate: Math.round((passedAttempts / attempts.length) * 100),
      averageTimeSpent: Math.round(totalTimeSpent / attempts.length)
    }
  }
}
