"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  Heart, 
  Bookmark, 
  X, 
  Search, 
  Filter,
  Clock,
  Users,
  Star,
  Trash2,
  Play
} from "lucide-react"
import { Technique } from "@/lib/types"
import { useFavorites } from "@/lib/contexts/FavoritesContext"
import { cn } from "@/lib/utils"

interface FavoritesManagerProps {
  isOpen: boolean
  onClose: () => void
  techniques: Technique[]
}

export function FavoritesManager({ isOpen, onClose, techniques }: FavoritesManagerProps) {
  const {
    favoriteTechniques,
    bookmarkedTechniques,
    removeFromFavorites,
    removeFromBookmarks,
    clearAllFavorites,
    clearAllBookmarks,
    getFavoriteTechniques,
    getBookmarkedTechniques,
  } = useFavorites()

  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("favorites")

  const favoriteTechniquesList = getFavoriteTechniques(techniques)
  const bookmarkedTechniquesList = getBookmarkedTechniques(techniques)

  // Filter techniques based on search query
  const filterTechniques = (techniquesList: Technique[]) => {
    if (!searchQuery.trim()) return techniquesList
    
    const query = searchQuery.toLowerCase()
    return techniquesList.filter(technique =>
      technique.title.toLowerCase().includes(query) ||
      technique.description.toLowerCase().includes(query) ||
      technique.category.toLowerCase().includes(query) ||
      technique.tags.some(tag => tag.toLowerCase().includes(query))
    )
  }

  const filteredFavorites = filterTechniques(favoriteTechniquesList)
  const filteredBookmarks = filterTechniques(bookmarkedTechniquesList)

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Beginner":
        return "bg-green-100 text-green-800"
      case "Intermediate":
        return "bg-yellow-100 text-yellow-800"
      case "Advanced":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const handleRemoveFavorite = (techniqueId: number) => {
    removeFromFavorites(techniqueId)
  }

  const handleRemoveBookmark = (techniqueId: number) => {
    removeFromBookmarks(techniqueId)
  }

  const handleClearAllFavorites = () => {
    if (confirm("Are you sure you want to remove all favorites?")) {
      clearAllFavorites()
    }
  }

  const handleClearAllBookmarks = () => {
    if (confirm("Are you sure you want to remove all bookmarks?")) {
      clearAllBookmarks()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden p-0">
        <div className="flex flex-col h-full">
          {/* Header */}
          <DialogHeader className="p-6 pb-4 border-b">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <DialogTitle className="text-2xl font-bold mb-2">
                  My Favorites & Bookmarks
                </DialogTitle>
                <p className="text-muted-foreground text-lg">
                  Manage your saved techniques and learning materials
                </p>
              </div>
              <div className="flex items-center gap-2 ml-4">
                <Button variant="ghost" size="sm" onClick={onClose} className="text-muted-foreground hover:text-primary">
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </DialogHeader>

          {/* Search Bar */}
          <div className="p-6 pb-4 border-b">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <input
                type="text"
                placeholder="Search your favorites and bookmarks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-input rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
              />
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-hidden">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
              <TabsList className="grid w-full grid-cols-2 mx-6 mt-4">
                <TabsTrigger value="favorites" className="flex items-center gap-2">
                  <Heart className="h-4 w-4" />
                  Favorites ({favoriteTechniques.length})
                </TabsTrigger>
                <TabsTrigger value="bookmarks" className="flex items-center gap-2">
                  <Bookmark className="h-4 w-4" />
                  Bookmarks ({bookmarkedTechniques.length})
                </TabsTrigger>
              </TabsList>

              <div className="flex-1 overflow-hidden">
                <TabsContent value="favorites" className="h-full mt-0">
                  <div className="p-6 h-full overflow-y-auto">
                    {filteredFavorites.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-64 text-center">
                        <Heart className="h-16 w-16 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-semibold mb-2">
                          {searchQuery ? "No matching favorites found" : "No favorites yet"}
                        </h3>
                        <p className="text-muted-foreground">
                          {searchQuery 
                            ? "Try adjusting your search terms" 
                            : "Start adding techniques to your favorites to see them here"
                          }
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-semibold">
                            Favorite Techniques ({filteredFavorites.length})
                          </h3>
                          {favoriteTechniques.length > 0 && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={handleClearAllFavorites}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Clear All
                            </Button>
                          )}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {filteredFavorites.map((technique) => (
                            <Card key={technique.id} className="group hover:shadow-lg transition-all duration-300">
                              <div className="relative">
                                <img
                                  src={technique.image || "/placeholder.svg"}
                                  alt={technique.title}
                                  className="w-full h-48 object-cover rounded-t-lg"
                                />
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleRemoveFavorite(technique.id)}
                                  className="absolute top-2 right-2 bg-white/90 text-red-600 hover:bg-red-50 hover:text-red-700"
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                                <Badge className={`absolute bottom-2 left-2 ${getDifficultyColor(technique.difficulty)}`}>
                                  {technique.difficulty}
                                </Badge>
                              </div>
                              <CardHeader className="pb-3">
                                <CardTitle className="text-lg text-balance">{technique.title}</CardTitle>
                                <p className="text-sm text-muted-foreground text-pretty line-clamp-2">
                                  {technique.description}
                                </p>
                              </CardHeader>
                              <CardContent className="pt-0">
                                <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                                  <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-1">
                                      <Clock className="h-4 w-4" />
                                      {technique.duration}
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <Users className="h-4 w-4" />
                                      {technique.students.toLocaleString()}
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                    {technique.rating}
                                  </div>
                                </div>
                                <Button className="w-full">
                                  <Play className="h-4 w-4 mr-2" />
                                  Continue Learning
                                </Button>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="bookmarks" className="h-full mt-0">
                  <div className="p-6 h-full overflow-y-auto">
                    {filteredBookmarks.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-64 text-center">
                        <Bookmark className="h-16 w-16 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-semibold mb-2">
                          {searchQuery ? "No matching bookmarks found" : "No bookmarks yet"}
                        </h3>
                        <p className="text-muted-foreground">
                          {searchQuery 
                            ? "Try adjusting your search terms" 
                            : "Start bookmarking techniques to save them for later"
                          }
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-semibold">
                            Bookmarked Techniques ({filteredBookmarks.length})
                          </h3>
                          {bookmarkedTechniques.length > 0 && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={handleClearAllBookmarks}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Clear All
                            </Button>
                          )}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {filteredBookmarks.map((technique) => (
                            <Card key={technique.id} className="group hover:shadow-lg transition-all duration-300">
                              <div className="relative">
                                <img
                                  src={technique.image || "/placeholder.svg"}
                                  alt={technique.title}
                                  className="w-full h-48 object-cover rounded-t-lg"
                                />
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleRemoveBookmark(technique.id)}
                                  className="absolute top-2 right-2 bg-white/90 text-red-600 hover:bg-red-50 hover:text-red-700"
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                                <Badge className={`absolute bottom-2 left-2 ${getDifficultyColor(technique.difficulty)}`}>
                                  {technique.difficulty}
                                </Badge>
                              </div>
                              <CardHeader className="pb-3">
                                <CardTitle className="text-lg text-balance">{technique.title}</CardTitle>
                                <p className="text-sm text-muted-foreground text-pretty line-clamp-2">
                                  {technique.description}
                                </p>
                              </CardHeader>
                              <CardContent className="pt-0">
                                <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                                  <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-1">
                                      <Clock className="h-4 w-4" />
                                      {technique.duration}
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <Users className="h-4 w-4" />
                                      {technique.students.toLocaleString()}
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                                    {technique.rating}
                                  </div>
                                </div>
                                <Button className="w-full">
                                  <Play className="h-4 w-4 mr-2" />
                                  Continue Learning
                                </Button>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </TabsContent>
              </div>
            </Tabs>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default FavoritesManager
