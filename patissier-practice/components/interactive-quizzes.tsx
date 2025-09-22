"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { CheckCircle, X, Brain, Timer, Trophy, Target, Play } from "lucide-react"
import { QuizSession } from "@/components/ui/quiz-session"
import { Quiz, QuizConfig } from "@/lib/types"

const quizzes: Quiz[] = [
  {
    id: 1,
    title: "Pastry Fundamentals",
    description: "Test your knowledge of basic pastry techniques and ingredients",
    questionCount: 5,
    duration: "10 min",
    difficulty: "Beginner",
    completed: true,
    score: 87,
    type: "multiple-choice",
    category: "Fundamentals",
    techniqueIds: [1, 2, 3],
    questions: [
      {
        id: 1,
        question: "What is the ideal temperature for tempering dark chocolate?",
        type: "multiple-choice",
        options: ["28-30°C (82-86°F)", "31-32°C (88-90°F)", "35-37°C (95-99°F)", "40-42°C (104-108°F)"],
        correctAnswer: 1,
        explanation: "Dark chocolate should be tempered at 31-32°C (88-90°F) for the proper crystal formation that gives it shine and snap.",
        points: 20,
        timeLimit: 60
      },
      {
        id: 2,
        question: "Which ingredient is essential for creating flaky pastry?",
        type: "multiple-choice",
        options: ["Sugar", "Butter", "Eggs", "Milk"],
        correctAnswer: 1,
        explanation: "Butter creates layers in pastry when it melts during baking, resulting in flaky texture.",
        points: 20,
        timeLimit: 60
      },
      {
        id: 3,
        question: "What is the correct order for making choux pastry?",
        type: "sequence",
        sequenceItems: [
          { id: "1", content: "Bring water and butter to boil", order: 1 },
          { id: "2", content: "Add flour and cook out", order: 2 },
          { id: "3", content: "Add eggs gradually", order: 3 },
          { id: "4", content: "Beat until smooth paste forms", order: 4 }
        ],
        correctAnswer: [1, 2, 3, 4],
        explanation: "Choux pastry requires bringing the liquid to a boil, adding flour, cooking out the starch, then gradually adding eggs while beating.",
        points: 20,
        timeLimit: 90
      },
      {
        id: 4,
        question: "True or False: Yeast dough should be proofed at room temperature.",
        type: "true-false",
        correctAnswer: "true",
        explanation: "Yeast dough should be proofed at room temperature (68-72°F) for optimal fermentation.",
        points: 20,
        timeLimit: 30
      },
      {
        id: 5,
        question: "Match the technique with its description:",
        type: "matching",
        matchingPairs: [
          { id: "1", left: "Lamination", right: "Creating layers of dough and fat" },
          { id: "2", left: "Tempering", right: "Controlling chocolate crystallization" },
          { id: "3", left: "Proofing", right: "Allowing dough to rise" }
        ],
        correctAnswer: [0, 1, 2],
        explanation: "Each technique has a specific purpose in pastry making.",
        points: 20,
        timeLimit: 120
      }
    ],
    passingScore: 70,
    maxAttempts: 3,
    createdAt: "2024-01-15T10:00:00Z",
    updatedAt: "2024-01-15T10:00:00Z"
  },
  {
    id: 2,
    title: "Chocolate Techniques",
    description: "Master the art of chocolate work through interactive challenges",
    questionCount: 4,
    duration: "8 min",
    difficulty: "Intermediate",
    completed: false,
    score: undefined,
    type: "drag-drop",
    category: "Fundamentals",
    techniqueIds: [4, 5, 6],
    questions: [
      {
        id: 1,
        question: "Arrange these chocolate tempering steps in the correct order:",
        type: "drag-drop",
        dragItems: [
          { id: "melt", content: "Melt chocolate to 45°C", category: "tempering" },
          { id: "cool", content: "Cool to 27°C", category: "tempering" },
          { id: "reheat", content: "Reheat to 31°C", category: "tempering" },
          { id: "test", content: "Test temper", category: "tempering" }
        ],
        correctAnswer: [0, 1, 2, 3],
        explanation: "Proper tempering requires melting, cooling, reheating, and testing the chocolate.",
        points: 25,
        timeLimit: 120
      },
      {
        id: 2,
        question: "Fill in the blanks: Chocolate should be stored at __°C with __% humidity.",
        type: "fill-blank",
        blanks: [
          { id: "temp", position: 0, correctAnswer: "18-20", hint: "Room temperature range" },
          { id: "humidity", position: 1, correctAnswer: "50-60", hint: "Moderate humidity level" }
        ],
        correctAnswer: ["18-20", "50-60"],
        explanation: "Chocolate should be stored at 18-20°C with 50-60% humidity for optimal quality.",
        points: 25,
        timeLimit: 90
      },
      {
        id: 3,
        question: "What is the purpose of tempering chocolate?",
        type: "multiple-choice",
        options: [
          "To make it sweeter",
          "To create proper crystal structure",
          "To make it darker",
          "To reduce fat content"
        ],
        correctAnswer: 1,
        explanation: "Tempering creates the proper crystal structure that gives chocolate its shine and snap.",
        points: 25,
        timeLimit: 60
      },
      {
        id: 4,
        question: "True or False: White chocolate contains cocoa solids.",
        type: "true-false",
        correctAnswer: "false",
        explanation: "White chocolate contains cocoa butter but no cocoa solids, which is why it's white.",
        points: 25,
        timeLimit: 30
      }
    ],
    passingScore: 75,
    maxAttempts: 2,
    createdAt: "2024-01-15T10:00:00Z",
    updatedAt: "2024-01-15T10:00:00Z"
  },
  {
    id: 3,
    title: "Advanced Lamination",
    description: "Perfect your understanding of complex dough lamination",
    questionCount: 6,
    duration: "15 min",
    difficulty: "Advanced",
    completed: false,
    score: undefined,
    type: "mixed",
    category: "Fundamentals",
    techniqueIds: [7, 8, 9],
    questions: [
      {
        id: 1,
        question: "What is the ideal butter temperature for lamination?",
        type: "multiple-choice",
        options: ["10-12°C", "15-18°C", "20-22°C", "25-28°C"],
        correctAnswer: 1,
        explanation: "Butter should be pliable but not too soft - 15-18°C is ideal for lamination.",
        points: 20,
        timeLimit: 60
      },
      {
        id: 2,
        question: "Arrange the lamination process steps:",
        type: "sequence",
        sequenceItems: [
          { id: "1", content: "Prepare detrempe (base dough)", order: 1 },
          { id: "2", content: "Roll out dough", order: 2 },
          { id: "3", content: "Place butter block", order: 3 },
          { id: "4", content: "Fold and roll", order: 4 },
          { id: "5", content: "Rest in refrigerator", order: 5 },
          { id: "6", content: "Repeat folding process", order: 6 }
        ],
        correctAnswer: [1, 2, 3, 4, 5, 6],
        explanation: "Lamination requires careful preparation, rolling, folding, and resting cycles.",
        points: 20,
        timeLimit: 180
      },
      {
        id: 3,
        question: "How many turns are typically needed for croissant dough?",
        type: "multiple-choice",
        options: ["2 turns", "3 turns", "4 turns", "6 turns"],
        correctAnswer: 2,
        explanation: "Croissant dough typically requires 4 turns (2 double turns) to create the proper layer structure.",
        points: 20,
        timeLimit: 60
      },
      {
        id: 4,
        question: "Match the lamination technique with its description:",
        type: "matching",
        matchingPairs: [
          { id: "1", left: "Single fold", right: "Fold one third over center" },
          { id: "2", left: "Double fold", right: "Fold both ends to center" },
          { id: "3", left: "Book fold", right: "Fold like a book" }
        ],
        correctAnswer: [0, 1, 2],
        explanation: "Different folding techniques create different layer patterns in laminated dough.",
        points: 20,
        timeLimit: 120
      },
      {
        id: 5,
        question: "True or False: Laminated dough should always be rolled in the same direction.",
        type: "true-false",
        correctAnswer: "false",
        explanation: "Laminated dough should be rolled in alternating directions to prevent the butter from breaking through the layers.",
        points: 20,
        timeLimit: 30
      },
      {
        id: 6,
        question: "What happens if the butter is too cold during lamination?",
        type: "multiple-choice",
        options: [
          "Dough becomes too sticky",
          "Butter breaks into pieces",
          "Layers don't form properly",
          "All of the above"
        ],
        correctAnswer: 3,
        explanation: "Butter that's too cold will break into pieces, preventing proper layer formation and making the dough difficult to work with.",
        points: 20,
        timeLimit: 60
      }
    ],
    passingScore: 80,
    maxAttempts: 2,
    createdAt: "2024-01-15T10:00:00Z",
    updatedAt: "2024-01-15T10:00:00Z"
  }
]

const sampleQuestions = {
  multipleChoice: {
    question: "What is the ideal temperature for tempering dark chocolate?",
    options: ["28-30°C (82-86°F)", "31-32°C (88-90°F)", "35-37°C (95-99°F)", "40-42°C (104-108°F)"],
    correct: 1,
    explanation:
      "Dark chocolate should be tempered at 31-32°C (88-90°F) for the proper crystal formation that gives it shine and snap.",
  },
  dragDrop: {
    question: "Arrange these steps for making choux pastry in the correct order:",
    items: [
      "Add eggs gradually",
      "Bring water and butter to boil",
      "Add flour and cook out",
      "Beat until smooth paste forms",
    ],
    correctOrder: [1, 2, 3, 0],
  },
}

function QuizCard({ quiz, onStartQuiz }: { quiz: Quiz; onStartQuiz: (quiz: Quiz) => void }) {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Beginner":
        return "bg-green-100 text-green-800"
      case "Intermediate":
        return "bg-yellow-100 text-yellow-800"
      case "Advanced":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <Card className="group hover:shadow-lg transition-all duration-300">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between mb-2">
          <CardTitle className="text-lg">{quiz.title}</CardTitle>
          {quiz.completed && (
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span className="text-sm font-medium text-green-600">{quiz.score}%</span>
            </div>
          )}
        </div>
        <p className="text-sm text-muted-foreground text-pretty">{quiz.description}</p>

        <div className="flex items-center gap-4 text-sm text-muted-foreground mt-4">
          <Badge className={getDifficultyColor(quiz.difficulty)}>{quiz.difficulty}</Badge>
          <div className="flex items-center gap-1">
            <Target className="h-4 w-4" />
            {quiz.questionCount} questions
          </div>
          <div className="flex items-center gap-1">
            <Timer className="h-4 w-4" />
            {quiz.duration}
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <Button 
          className="w-full" 
          variant={quiz.completed ? "outline" : "default"}
          onClick={() => onStartQuiz(quiz)}
        >
          {quiz.completed ? (
            <>
              <Trophy className="mr-2 h-4 w-4" />
              Retake Quiz
            </>
          ) : (
            <>
              <Play className="mr-2 h-4 w-4" />
              Start Quiz
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  )
}

function QuizDemo() {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [showExplanation, setShowExplanation] = useState(false)
  const [dragItems, setDragItems] = useState(sampleQuestions.dragDrop.items)
  const [quizType, setQuizType] = useState<"multiple-choice" | "drag-drop">("multiple-choice")

  const handleAnswerSelect = (index: number) => {
    setSelectedAnswer(index)
    setShowExplanation(true)
  }

  const resetQuiz = () => {
    setSelectedAnswer(null)
    setShowExplanation(false)
    setDragItems(sampleQuestions.dragDrop.items)
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl">Interactive Quiz Demo</CardTitle>
          <div className="flex gap-2">
            <Button
              variant={quizType === "multiple-choice" ? "default" : "outline"}
              size="sm"
              onClick={() => {
                setQuizType("multiple-choice")
                resetQuiz()
              }}
            >
              Multiple Choice
            </Button>
            <Button
              variant={quizType === "drag-drop" ? "default" : "outline"}
              size="sm"
              onClick={() => {
                setQuizType("drag-drop")
                resetQuiz()
              }}
            >
              Drag & Drop
            </Button>
          </div>
        </div>
        <Progress value={50} className="h-2" />
        <p className="text-sm text-muted-foreground">Question 1 of 2</p>
      </CardHeader>

      <CardContent className="space-y-6">
        {quizType === "multiple-choice" ? (
          <>
            <h3 className="text-lg font-medium text-balance">{sampleQuestions.multipleChoice.question}</h3>

            <div className="space-y-3">
              {sampleQuestions.multipleChoice.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleAnswerSelect(index)}
                  disabled={showExplanation}
                  className={`w-full p-4 text-left rounded-lg border transition-all ${
                    selectedAnswer === index
                      ? index === sampleQuestions.multipleChoice.correct
                        ? "border-green-500 bg-green-50 text-green-800"
                        : "border-red-500 bg-red-50 text-red-800"
                      : showExplanation && index === sampleQuestions.multipleChoice.correct
                        ? "border-green-500 bg-green-50 text-green-800"
                        : "border-border hover:border-primary hover:bg-muted/50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span>{option}</span>
                    {showExplanation && (
                      <>
                        {index === sampleQuestions.multipleChoice.correct && (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        )}
                        {selectedAnswer === index && index !== sampleQuestions.multipleChoice.correct && (
                          <X className="h-5 w-5 text-red-600" />
                        )}
                      </>
                    )}
                  </div>
                </button>
              ))}
            </div>

            {showExplanation && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Explanation:</strong> {sampleQuestions.multipleChoice.explanation}
                </p>
              </div>
            )}
          </>
        ) : (
          <>
            <h3 className="text-lg font-medium text-balance">{sampleQuestions.dragDrop.question}</h3>

            <div className="space-y-3">
              {dragItems.map((item, index) => (
                <div
                  key={index}
                  className="p-4 bg-card border border-border rounded-lg cursor-move hover:shadow-md transition-all"
                  draggable
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center text-sm font-medium">
                      {index + 1}
                    </div>
                    <span>{item}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 bg-muted/50 border border-dashed border-muted-foreground/30 rounded-lg text-center">
              <p className="text-sm text-muted-foreground">
                Drag and drop the items above to arrange them in the correct order
              </p>
            </div>
          </>
        )}

        <div className="flex gap-3">
          <Button onClick={resetQuiz} variant="outline" className="flex-1 bg-transparent">
            Reset
          </Button>
          <Button className="flex-1">Next Question</Button>
        </div>
      </CardContent>
    </Card>
  )
}

export function InteractiveQuizzes() {
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null)
  const [showQuizSession, setShowQuizSession] = useState(false)

  // Default quiz configuration
  const defaultConfig: QuizConfig = {
    allowHints: true,
    allowSkipping: true,
    showCorrectAnswers: true,
    showExplanations: true,
    randomizeQuestions: false,
    randomizeOptions: false,
    timeLimit: 600, // 10 minutes
    passingScore: 70,
    maxAttempts: 3,
    retakeDelay: 0
  }

  const handleStartQuiz = (quiz: Quiz) => {
    setSelectedQuiz(quiz)
    setShowQuizSession(true)
  }

  const handleQuizComplete = (results: any) => {
    console.log("Quiz completed:", results)
    // In a real app, you would save the results to a database
    // Don't exit the quiz session here - let the QuizSession component handle the results display
  }

  const handleExitQuiz = () => {
    setShowQuizSession(false)
    setSelectedQuiz(null)
  }

  if (showQuizSession && selectedQuiz) {
    return (
      <div className="min-h-screen bg-background">
        <QuizSession
          quizId={selectedQuiz.id}
          questions={selectedQuiz.questions}
          config={defaultConfig}
          onComplete={handleQuizComplete}
          onExit={handleExitQuiz}
        />
      </div>
    )
  }

  return (
    <section id="quizzes" className="py-20 px-4">
      <div className="container mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Interactive Quizzes</h2>
          <p className="text-xl text-muted-foreground text-balance max-w-2xl mx-auto">
            Test your knowledge with engaging quizzes featuring multiple choice questions, drag-and-drop challenges, and
            instant feedback.
          </p>
        </div>

        <div className="mb-16">
          <QuizDemo />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {quizzes.map((quiz) => (
            <QuizCard key={quiz.id} quiz={quiz} onStartQuiz={handleStartQuiz} />
          ))}
        </div>

        <div className="text-center">
          <Button variant="outline" size="lg">
            View All Quizzes
          </Button>
        </div>
      </div>
    </section>
  )
}
