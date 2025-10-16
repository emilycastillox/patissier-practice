import { NextResponse } from 'next/server'
import { contentService } from '@/lib/services/contentService'

export async function GET() {
  try {
    // Use mock data directly for better performance
    const quizzes = contentService.getMockQuizzes()
    
    return NextResponse.json(quizzes)
  } catch (error) {
    console.error('Error fetching quizzes:', error)
    return NextResponse.json(
      { error: 'Failed to fetch quizzes' },
      { status: 500 }
    )
  }
}
