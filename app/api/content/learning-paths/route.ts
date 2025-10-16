import { NextResponse } from 'next/server'
import { contentService } from '@/lib/services/contentService'

export async function GET() {
  try {
    // Use mock data directly for better performance
    const learningPaths = contentService.getMockLearningPaths()
    
    return NextResponse.json(learningPaths)
  } catch (error) {
    console.error('Error fetching learning paths:', error)
    return NextResponse.json(
      { error: 'Failed to fetch learning paths' },
      { status: 500 }
    )
  }
}
