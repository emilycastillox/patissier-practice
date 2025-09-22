export interface AIAnalysisResult {
  score: number
  feedback: {
    positive: string[]
    improvements: string[]
    techniques: string[]
  }
  category: string
  confidence: number
  analysis: {
    color: { score: number; feedback: string }
    shape: { score: number; feedback: string }
    texture: { score: number; feedback: string }
    technique: { score: number; feedback: string }
  }
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  imageUrl?: string
}

export class AIService {
  private static instance: AIService
  private apiKey: string

  private constructor() {
    this.apiKey = process.env.OPENAI_API_KEY || ''
  }

  public static getInstance(): AIService {
    if (!AIService.instance) {
      AIService.instance = new AIService()
    }
    return AIService.instance
  }

  async analyzeImage(imageFile: File): Promise<AIAnalysisResult> {
    try {
      // For now, we'll simulate AI analysis with realistic feedback
      // In a real implementation, you would send the image to an AI service
      const formData = new FormData()
      formData.append('image', imageFile)

      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 2000))

      // Generate realistic feedback based on image properties
      const mockResult = this.generateMockAnalysis(imageFile)
      return mockResult
    } catch (error) {
      console.error('Error analyzing image:', error)
      throw new Error('Failed to analyze image. Please try again.')
    }
  }

  async sendChatMessage(message: string, context?: string): Promise<string> {
    try {
      // Simulate AI chat response
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const responses = [
        "That's a great question! Let me help you with that technique.",
        "I can see you're working on improving your pastry skills. Here's what I recommend...",
        "Based on your progress, I suggest focusing on these key areas...",
        "That's an excellent observation! Here's how you can take it to the next level...",
        "I understand your concern. Let me break this down step by step..."
      ]
      
      return responses[Math.floor(Math.random() * responses.length)]
    } catch (error) {
      console.error('Error sending chat message:', error)
      throw new Error('Failed to send message. Please try again.')
    }
  }

  private generateMockAnalysis(imageFile: File): AIAnalysisResult {
    const categories = ['Viennoiserie', 'Desserts', 'Bread', 'Cakes', 'Pastries']
    const category = categories[Math.floor(Math.random() * categories.length)]
    
    const score = Math.floor(Math.random() * 40) + 60 // Score between 60-100
    
    const positiveFeedback = [
      "Excellent golden-brown color indicates proper baking temperature",
      "Beautiful lamination visible with distinct layers",
      "Perfect crescent shape with proper proportions",
      "Smooth, glossy surface shows good technique",
      "Clean, sharp edges demonstrate precision",
      "Good color contrast with the garnish",
      "Proper rise and volume achieved",
      "Excellent texture and crumb structure"
    ]

    const improvementFeedback = [
      "Slightly uneven browning on one side - rotate halfway through baking",
      "Could benefit from a slightly longer proof for more volume",
      "Small air bubbles visible - strain the mixture next time",
      "Consider adding texture contrast with nuts or crunchy elements",
      "Tart shell could be slightly thinner for better texture balance",
      "The glaze could be more even - work on your pouring technique",
      "Consider adjusting the oven temperature for more even baking",
      "The decoration could be more precise - practice your piping skills"
    ]

    const techniqueFeedback = [
      "Your butter temperature control was excellent",
      "Great job maintaining dough temperature during lamination",
      "Nice work on the tart shell blind baking",
      "Your folding technique shows improvement",
      "Good attention to detail in the finishing touches",
      "The timing of your proofing was spot on",
      "Your mixing technique is developing well",
      "Great job on the temperature control throughout"
    ]

    // Select random feedback based on score
    const positiveCount = Math.min(3, Math.floor(score / 30))
    const improvementCount = Math.min(2, Math.floor((100 - score) / 20))
    const techniqueCount = Math.min(2, Math.floor(score / 40))

    const shuffleArray = (array: string[]) => {
      const shuffled = [...array]
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
      }
      return shuffled
    }

    return {
      score,
      feedback: {
        positive: shuffleArray(positiveFeedback).slice(0, positiveCount),
        improvements: shuffleArray(improvementFeedback).slice(0, improvementCount),
        techniques: shuffleArray(techniqueFeedback).slice(0, techniqueCount)
      },
      category,
      confidence: Math.floor(Math.random() * 20) + 80, // 80-100%
      analysis: {
        color: {
          score: Math.floor(Math.random() * 20) + 70,
          feedback: "Good color development with room for improvement"
        },
        shape: {
          score: Math.floor(Math.random() * 20) + 75,
          feedback: "Well-formed shape with consistent proportions"
        },
        texture: {
          score: Math.floor(Math.random() * 20) + 65,
          feedback: "Texture shows good technique execution"
        },
        technique: {
          score: Math.floor(Math.random() * 20) + 70,
          feedback: "Solid technique with areas for refinement"
        }
      }
    }
  }
}

export const aiService = AIService.getInstance()