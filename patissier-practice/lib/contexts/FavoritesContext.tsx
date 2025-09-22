"use client"

import React, { createContext, useContext, useState, useEffect, useCallback } from "react"
import { Technique } from "@/lib/types"

interface FavoritesContextType {
  favoriteTechniques: number[]
  bookmarkedTechniques: number[]
  addToFavorites: (techniqueId: number) => void
  removeFromFavorites: (techniqueId: number) => void
  toggleFavorite: (techniqueId: number) => void
  addToBookmarks: (techniqueId: number) => void
  removeFromBookmarks: (techniqueId: number) => void
  toggleBookmark: (techniqueId: number) => void
  isFavorite: (techniqueId: number) => boolean
  isBookmarked: (techniqueId: number) => boolean
  clearAllFavorites: () => void
  clearAllBookmarks: () => void
  getFavoriteTechniques: (techniques: Technique[]) => Technique[]
  getBookmarkedTechniques: (techniques: Technique[]) => Technique[]
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined)

const STORAGE_KEYS = {
  FAVORITES: 'patissier-practice-favorites',
  BOOKMARKS: 'patissier-practice-bookmarks'
}

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const [favoriteTechniques, setFavoriteTechniques] = useState<number[]>([])
  const [bookmarkedTechniques, setBookmarkedTechniques] = useState<number[]>([])

  // Load data from localStorage on mount
  useEffect(() => {
    const loadFromStorage = () => {
      try {
        const favorites = localStorage.getItem(STORAGE_KEYS.FAVORITES)
        const bookmarks = localStorage.getItem(STORAGE_KEYS.BOOKMARKS)
        
        if (favorites) {
          setFavoriteTechniques(JSON.parse(favorites))
        }
        if (bookmarks) {
          setBookmarkedTechniques(JSON.parse(bookmarks))
        }
      } catch (error) {
        console.error('Error loading favorites/bookmarks from localStorage:', error)
      }
    }

    loadFromStorage()
  }, [])

  // Save to localStorage whenever state changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(favoriteTechniques))
    } catch (error) {
      console.error('Error saving favorites to localStorage:', error)
    }
  }, [favoriteTechniques])

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.BOOKMARKS, JSON.stringify(bookmarkedTechniques))
    } catch (error) {
      console.error('Error saving bookmarks to localStorage:', error)
    }
  }, [bookmarkedTechniques])

  // Favorites functions
  const addToFavorites = useCallback((techniqueId: number) => {
    setFavoriteTechniques(prev => {
      if (!prev.includes(techniqueId)) {
        return [...prev, techniqueId]
      }
      return prev
    })
  }, [])

  const removeFromFavorites = useCallback((techniqueId: number) => {
    setFavoriteTechniques(prev => prev.filter(id => id !== techniqueId))
  }, [])

  const toggleFavorite = useCallback((techniqueId: number) => {
    setFavoriteTechniques(prev => {
      if (prev.includes(techniqueId)) {
        return prev.filter(id => id !== techniqueId)
      } else {
        return [...prev, techniqueId]
      }
    })
  }, [])

  // Bookmarks functions
  const addToBookmarks = useCallback((techniqueId: number) => {
    setBookmarkedTechniques(prev => {
      if (!prev.includes(techniqueId)) {
        return [...prev, techniqueId]
      }
      return prev
    })
  }, [])

  const removeFromBookmarks = useCallback((techniqueId: number) => {
    setBookmarkedTechniques(prev => prev.filter(id => id !== techniqueId))
  }, [])

  const toggleBookmark = useCallback((techniqueId: number) => {
    setBookmarkedTechniques(prev => {
      if (prev.includes(techniqueId)) {
        return prev.filter(id => id !== techniqueId)
      } else {
        return [...prev, techniqueId]
      }
    })
  }, [])

  // Check functions
  const isFavorite = useCallback((techniqueId: number) => {
    return favoriteTechniques.includes(techniqueId)
  }, [favoriteTechniques])

  const isBookmarked = useCallback((techniqueId: number) => {
    return bookmarkedTechniques.includes(techniqueId)
  }, [bookmarkedTechniques])

  // Clear functions
  const clearAllFavorites = useCallback(() => {
    setFavoriteTechniques([])
  }, [])

  const clearAllBookmarks = useCallback(() => {
    setBookmarkedTechniques([])
  }, [])

  // Filter functions
  const getFavoriteTechniques = useCallback((techniques: Technique[]) => {
    return techniques.filter(technique => favoriteTechniques.includes(technique.id))
  }, [favoriteTechniques])

  const getBookmarkedTechniques = useCallback((techniques: Technique[]) => {
    return techniques.filter(technique => bookmarkedTechniques.includes(technique.id))
  }, [bookmarkedTechniques])

  const value: FavoritesContextType = {
    favoriteTechniques,
    bookmarkedTechniques,
    addToFavorites,
    removeFromFavorites,
    toggleFavorite,
    addToBookmarks,
    removeFromBookmarks,
    toggleBookmark,
    isFavorite,
    isBookmarked,
    clearAllFavorites,
    clearAllBookmarks,
    getFavoriteTechniques,
    getBookmarkedTechniques,
  }

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  )
}

export function useFavorites() {
  const context = useContext(FavoritesContext)
  if (context === undefined) {
    throw new Error('useFavorites must be used within a FavoritesProvider')
  }
  return context
}

export default FavoritesContext
