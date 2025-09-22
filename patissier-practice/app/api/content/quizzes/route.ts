import { NextResponse } from 'next/server'
import { contentService } from '@/lib/services/contentService'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category') as any
    const difficulty = searchParams.get('difficulty') as any
    const type = searchParams.get('type') as any
    const search = searchParams.get('search')

    const filters = {
      category,
      difficulty,
      type,
      search
    }

    // Use mock data directly for better performance
    const quizzes = contentService.getMockQuizzes()
    
    return NextResponse.json({
      success: true,
      data: quizzes
    })
  } catch (error) {
    console.error('Error fetching quizzes:', error)
    return NextResponse.json(
      { error: 'Failed to fetch quizzes' },
      { status: 500 }
    )
  }
}
