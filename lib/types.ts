// Core data types for Patissier Practice application

export type DifficultyLevel = 'Beginner' | 'Intermediate' | 'Advanced'

export type TechniqueCategory = 'Fundamentals' | 'Cakes & Desserts' | 'Viennoiserie'

export type QuizType = 'multiple-choice' | 'drag-drop' | 'sequence' | 'fill-blank' | 'true-false' | 'matching' | 'mixed'

export type LearningPathLevel = 'Beginner' | 'Intermediate' | 'Advanced'

export type ModuleType = 'technique' | 'quiz' | 'reading' | 'assignment' | 'video' | 'practice' | 'project'

export type ProgressStatus = 'not-started' | 'in-progress' | 'completed'

export type AchievementType = 'technique-master' | 'path-completion' | 'quiz-expert' | 'streak-master'

// Technique Library Types
export interface Technique {
  id: number
  title: string
  description: string
  duration: string // e.g., "15 min", "2 hours"
  difficulty: DifficultyLevel
  rating: number // 0-5 scale
  students: number // number of students who completed
  image: string // URL or path to technique image
  category: TechniqueCategory
  videoUrl?: string // URL to technique video
  steps: TechniqueStep[]
  tags: string[] // e.g., ["chocolate", "tempering", "desserts"]
  prerequisites?: number[] // IDs of prerequisite techniques
  createdAt: string
  updatedAt: string
}

export interface TechniqueStep {
  id: number
  stepNumber: number
  title: string
  description: string
  image?: string // URL to step image
  videoUrl?: string // URL to step video
  duration?: string // e.g., "5 min"
  tips?: string[] // Additional tips for this step
  warnings?: string[] // Important warnings
}

export interface TechniqueProgress {
  techniqueId: number
  userId: string
  status: ProgressStatus
  completedSteps: number[]
  currentStep: number
  startedAt: string
  completedAt?: string
  timeSpent: number // in minutes
  rating?: number // user's rating of the technique
  notes?: string // user's personal notes
  completionPercentage: number // 0-100
  isCompleted: boolean
  lastAccessed?: string
}

// Learning Paths Types
export interface LearningPath {
  id: number
  title: string
  description: string
  shortDescription: string
  level: LearningPathLevel
  duration: string // e.g., "4-6 weeks"
  estimatedHours: number
  difficulty: DifficultyLevel
  image?: string
  bannerImage?: string
  modules: LearningModule[]
  prerequisites?: number[] // IDs of prerequisite paths
  tags: string[]
  isUnlocked: boolean
  isRecommended: boolean
  isFeatured: boolean
  completionRate: number // percentage of users who complete this path
  averageRating: number
  totalStudents: number
  color: string // CSS color class
  createdAt: string
  updatedAt: string
  instructor?: {
    id: string
    name: string
    title: string
    avatar?: string
    bio?: string
    expertise: string[]
  }
}

export interface LearningModule {
  id: number
  pathId: number
  title: string
  description: string
  shortDescription: string
  duration: string // e.g., "15 min"
  order: number
  type: ModuleType
  content: ModuleContentArray
  prerequisites?: number[] // IDs of prerequisite modules
  isUnlocked: boolean
  isCompleted: boolean
  isCurrent: boolean
  estimatedMinutes: number
  difficulty: DifficultyLevel
  tags: string[]
  createdAt: string
  updatedAt: string
}

export interface LearningPathProgress {
  pathId: number
  userId: string
  status: ProgressStatus
  completedModules: number[]
  currentModule: number
  startedAt: string
  completedAt?: string
  timeSpent: number // in minutes
  score: number // average score across modules
  lastAccessedAt: string
  streak: number // consecutive days of activity
  achievements: string[]
  notes: string
  bookmarked: boolean
  rating?: number // user's rating of the path
  review?: string // user's review of the path
}

export interface ModuleContent {
  type: 'video' | 'text' | 'image'
  title: string
  description?: string
  content?: string
  duration?: string
}

export type ModuleContentArray = ModuleContent[]

export interface ReadingMaterial {
  id: string
  title: string
  type: 'article' | 'pdf' | 'ebook' | 'guide'
  url: string
  duration: string
  isRequired: boolean
  description?: string
}

export interface Assignment {
  id: string
  title: string
  description: string
  type: 'practice' | 'project' | 'reflection' | 'quiz'
  dueDate?: string
  points: number
  isRequired: boolean
  instructions: string
  resources?: string[]
}

export interface Resource {
  id: string
  title: string
  type: 'tool' | 'ingredient' | 'equipment' | 'reference'
  description: string
  url?: string
  isRequired: boolean
  alternatives?: string[]
}

export interface LearningPathStats {
  pathId: number
  totalEnrollments: number
  completionRate: number
  averageCompletionTime: number // in days
  averageRating: number
  totalRatings: number
  difficultyDistribution: {
    beginner: number
    intermediate: number
    advanced: number
  }
  mostPopularModules: number[]
  commonDropOffPoints: number[]
  userFeedback: {
    positive: string[]
    negative: string[]
    suggestions: string[]
  }
}

export interface LearningPathRecommendation {
  pathId: number
  reason: string
  confidence: number // 0-1
  basedOn: 'progress' | 'interests' | 'difficulty' | 'popularity' | 'completion'
  priority: 'high' | 'medium' | 'low'
}

// Quiz System Types
export interface Quiz {
  id: number
  title: string
  description: string
  questionCount: number
  duration: string // e.g., "10 min"
  difficulty: DifficultyLevel
  completed: boolean
  score?: number // percentage 0-100
  type: QuizType
  category: TechniqueCategory
  techniqueIds: number[] // Related techniques
  questions: QuizQuestion[]
  passingScore: number // minimum score to pass
  maxAttempts?: number // maximum retake attempts
  createdAt: string
  updatedAt: string
}

export interface QuizQuestion {
  id: number
  question: string
  type: 'multiple-choice' | 'drag-drop' | 'sequence' | 'fill-blank' | 'true-false' | 'matching'
  options?: string[] // for multiple choice
  correctAnswer: number | number[] | string | string[] // various answer formats
  explanation: string
  points: number
  timeLimit?: number // seconds
  image?: string // URL to question image
  videoUrl?: string // URL to question video
  // Additional fields for different question types
  dragItems?: DragItem[] // for drag-drop questions
  sequenceItems?: SequenceItem[] // for sequence questions
  blanks?: BlankItem[] // for fill-in-the-blank questions
  matchingPairs?: MatchingPair[] // for matching questions
  hints?: string[] // optional hints for the question
}

export interface DragItem {
  id: string
  content: string
  image?: string
  category?: string
}

export interface SequenceItem {
  id: string
  content: string
  order: number
  image?: string
}

export interface BlankItem {
  id: string
  position: number
  correctAnswer: string
  alternatives?: string[] // alternative correct answers
  hint?: string
}

export interface MatchingPair {
  id: string
  left: string
  right: string
  leftImage?: string
  rightImage?: string
}

export interface QuizAttempt {
  id: string
  quizId: number
  userId: string
  answers: QuizAnswer[]
  score: number
  completedAt: string
  timeSpent: number // in seconds
  passed: boolean
}

export interface QuizAnswer {
  questionId: number
  answer: number | number[] | string | string[] | DragAnswer | SequenceAnswer | MatchingAnswer // various answer formats
  isCorrect: boolean
  timeSpent: number // in seconds
  partialCredit?: number // for partial credit scoring
}

export interface DragAnswer {
  itemId: string
  targetId: string
}

export interface SequenceAnswer {
  itemId: string
  order: number
}

export interface MatchingAnswer {
  pairId: string
  leftId: string
  rightId: string
}

// Quiz Session and State Management
export interface QuizSession {
  id: string
  quizId: number
  userId: string
  currentQuestionIndex: number
  answers: Map<number, QuizAnswer>
  startTime: string
  timeRemaining?: number // in seconds
  isCompleted: boolean
  isPaused: boolean
  hintsUsed: number[]
  questionsSkipped: number[]
}

// Quiz Results and Analytics
export interface QuizResults {
  attemptId: string
  quizId: number
  userId: string
  score: number
  maxScore: number
  percentage: number
  passed: boolean
  timeSpent: number
  completedAt: string
  questionResults: QuestionResult[]
  strengths: string[]
  weaknesses: string[]
  recommendations: string[]
}

export interface QuestionResult {
  questionId: number
  question: string
  userAnswer: any
  correctAnswer: any
  isCorrect: boolean
  pointsEarned: number
  maxPoints: number
  timeSpent: number
  explanation: string
}

// Quiz Configuration
export interface QuizConfig {
  allowHints: boolean
  allowSkipping: boolean
  showCorrectAnswers: boolean
  showExplanations: boolean
  randomizeQuestions: boolean
  randomizeOptions: boolean
  timeLimit: number // in seconds
  passingScore: number // percentage
  maxAttempts: number
  retakeDelay: number // in hours
}

// AI Feedback Types
export interface AIFeedback {
  id: string
  userId: string
  imageUrl: string
  techniqueId?: number // if related to specific technique
  category: TechniqueCategory
  score: number // 0-100
  feedback: FeedbackAnalysis
  createdAt: string
}

export interface FeedbackAnalysis {
  positive: string[] // what was done well
  improvements: string[] // areas for improvement
  techniques: string[] // technique-specific feedback
  overallScore: number // 0-100
  visualQuality: {
    color: number // 0-100
    shape: number // 0-100
    texture: number // 0-100
  }
  recommendations: string[] // suggested next steps
}

// AI Chat Types
export interface ChatMessage {
  id: string
  userId: string
  content: string
  type: 'text' | 'image' | 'technique-link'
  isUser: boolean
  timestamp: string
  metadata?: {
    techniqueId?: number
    imageUrl?: string
    attachments?: string[]
  }
}

export interface ChatConversation {
  id: string
  userId: string
  title: string
  messages: ChatMessage[]
  createdAt: string
  updatedAt: string
  isActive: boolean
}

// User Progress Types
export interface UserProgress {
  userId: string
  techniques: TechniqueProgress[]
  learningPaths: LearningPathProgress[]
  quizAttempts: QuizAttempt[]
  aiFeedback: AIFeedback[]
  achievements: Achievement[]
  preferences: UserPreferences
  totalTimeSpent: number // in minutes
  streak: number // consecutive days
  lastActiveAt: string
  level: string
  experience: number
  nextLevelExperience: number
  totalTechniquesCompleted: number
  currentStreak: number
  longestStreak: number
}

export interface UserPreferences {
  difficultyLevel: DifficultyLevel
  interests: TechniqueCategory[]
  learningGoals: string[]
  notifications: {
    email: boolean
    push: boolean
    achievements: boolean
  }
  theme: 'light' | 'dark' | 'system'
}

export interface Achievement {
  id: string
  type: AchievementType
  title: string
  description: string
  icon: string
  unlockedAt: string
  progress: number // 0-100
  maxProgress: number
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// Search and Filter Types
export interface TechniqueFilters {
  category?: TechniqueCategory
  difficulty?: DifficultyLevel
  duration?: string
  rating?: number
  tags?: string[]
  search?: string
}

export interface LearningPathFilters {
  level?: LearningPathLevel
  duration?: string
  unlocked?: boolean
  search?: string
}

export interface QuizFilters {
  difficulty?: DifficultyLevel
  category?: TechniqueCategory
  type?: QuizType
  completed?: boolean
  search?: string
}

// Review and Rating Types
export interface TechniqueReview {
  id: string
  techniqueId: number
  userId: string
  userName: string
  userAvatar?: string
  rating: number // 1-5 stars
  title: string
  content: string
  helpfulVotes: number
  notHelpfulVotes: number
  createdAt: string
  updatedAt: string
  isVerified: boolean // User completed the technique
  difficulty: DifficultyLevel // User's perceived difficulty
  timeSpent: number // in minutes
  tags: string[] // User-added tags
}

export interface TechniqueRating {
  techniqueId: number
  averageRating: number
  totalRatings: number
  ratingDistribution: {
    1: number
    2: number
    3: number
    4: number
    5: number
  }
  reviews: TechniqueReview[]
}

export interface ReviewFilters {
  rating?: number
  verified?: boolean
  sortBy?: 'newest' | 'oldest' | 'helpful' | 'rating'
}

export interface UserReview {
  techniqueId: number
  rating: number
  title: string
  content: string
  difficulty: DifficultyLevel
  timeSpent: number
  tags: string[]
}
