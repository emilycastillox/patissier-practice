import { NextResponse } from 'next/server'
import { contentService } from '@/lib/services/contentService'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const level = searchParams.get('level') as any
    const difficulty = searchParams.get('difficulty') as any
    const search = searchParams.get('search')
    const sortBy = searchParams.get('sortBy') as any
    const sortOrder = searchParams.get('sortOrder') as any

    const filters = {
      level,
      difficulty,
      search,
      sortBy,
      sortOrder
    }

    // Use mock data directly for better performance
    const learningPaths = contentService.getMockLearningPaths()
    
    return NextResponse.json({
      success: true,
      data: learningPaths
    })
  } catch (error) {
    console.error('Error fetching learning paths:', error)
    return NextResponse.json(
      { error: 'Failed to fetch learning paths' },
      { status: 500 }
    )
  }
}
