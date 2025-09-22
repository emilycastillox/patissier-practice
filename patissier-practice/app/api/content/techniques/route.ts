import { NextResponse } from 'next/server'
import { contentService } from '@/lib/services/contentService'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category') as any
    const difficulty = searchParams.get('difficulty') as any
    const search = searchParams.get('search')
    const sortBy = searchParams.get('sortBy') as any
    const sortOrder = searchParams.get('sortOrder') as any

    const filters = {
      category,
      difficulty,
      search,
      sortBy,
      sortOrder
    }

    // Use mock data directly for better performance
    const techniques = contentService.getMockTechniques()
    
    return NextResponse.json({
      success: true,
      data: techniques
    })
  } catch (error) {
    console.error('Error fetching techniques:', error)
    return NextResponse.json(
      { error: 'Failed to fetch techniques' },
      { status: 500 }
    )
  }
}
