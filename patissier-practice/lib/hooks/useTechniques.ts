import { useState, useEffect, useCallback } from 'react'
import { Technique, TechniqueFilters, ApiResponse } from '@/lib/types'
import { contentService } from '@/lib/services/contentService'

interface UseTechniquesReturn {
  techniques: Technique[]
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
  searchTechniques: (query: string) => Promise<void>
  filterTechniques: (filters: TechniqueFilters) => Promise<void>
}

export function useTechniques(initialFilters?: TechniqueFilters): UseTechniquesReturn {
  const [techniques, setTechniques] = useState<Technique[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentFilters, setCurrentFilters] = useState<TechniqueFilters | undefined>(initialFilters)

  const fetchTechniques = useCallback(async (filters?: TechniqueFilters) => {
    setLoading(true)
    setError(null)
    
    try {
      const response: ApiResponse<Technique[]> = await contentService.getTechniques(filters)
      
      if (response.success && response.data) {
        setTechniques(response.data)
      } else {
        // Fallback to mock data for development
        console.warn('API not available, using mock data:', response.error)
        setTechniques(contentService.getMockTechniques())
      }
    } catch (err) {
      console.error('Error fetching techniques:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch techniques')
      // Fallback to mock data
      setTechniques(contentService.getMockTechniques())
    } finally {
      setLoading(false)
    }
  }, [])

  const refetch = useCallback(async () => {
    await fetchTechniques(currentFilters)
  }, [fetchTechniques, currentFilters])

  const searchTechniques = useCallback(async (query: string) => {
    const searchFilters = { ...currentFilters, search: query }
    await fetchTechniques(searchFilters)
  }, [currentFilters, fetchTechniques])

  const filterTechniques = useCallback(async (filters: TechniqueFilters) => {
    setCurrentFilters(filters)
    await fetchTechniques(filters)
  }, [fetchTechniques])

  useEffect(() => {
    fetchTechniques(initialFilters)
  }, [fetchTechniques, initialFilters])

  return {
    techniques,
    loading,
    error,
    refetch,
    searchTechniques,
    filterTechniques,
  }
}

export default useTechniques
