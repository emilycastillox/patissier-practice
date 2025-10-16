import { NextResponse } from 'next/server'
import { contentService } from '@/lib/services/contentService'

export async function GET() {
  try {
    // Use mock data directly for better performance
    const techniques = contentService.getMockTechniques()
    
    return NextResponse.json(techniques)
  } catch (error) {
    console.error('Error fetching techniques:', error)
    return NextResponse.json(
      { error: 'Failed to fetch techniques' },
      { status: 500 }
    )
  }
}
