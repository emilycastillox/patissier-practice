"use client"

import React, { useState, useRef, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Badge } from './ui/badge'
import { ScrollArea } from './ui/scroll-area'
import { 
  Send, 
  Bot, 
  User, 
  Loader2, 
  MessageSquare, 
  Lightbulb, 
  BookOpen, 
  ChefHat,
  Camera,
  Image as ImageIcon,
  Paperclip,
  MoreHorizontal,
  Search,
  Download,
  Share2,
  Trash2
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface ChatMessage {
  id: string
  type: 'user' | 'assistant'
  content: string
  timestamp: Date
  messageType: 'text' | 'image' | 'technique' | 'suggestion'
  metadata?: {
    techniqueId?: number
    imageUrl?: string
    quickActions?: string[]
  }
}

interface QuickAction {
  id: string
  label: string
  icon: React.ReactNode
  action: () => void
}

interface AIChatProps {
  className?: string
}

export function AIChat({ className }: AIChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showQuickActions, setShowQuickActions] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Quick actions for common questions
  const quickActions: QuickAction[] = [
    {
      id: 'technique-help',
      label: 'Help with technique',
      icon: <ChefHat className="h-4 w-4" />,
      action: () => sendMessage("I need help with a specific pastry technique. Can you guide me?")
    },
    {
      id: 'recipe-suggestion',
      label: 'Recipe suggestion',
      icon: <BookOpen className="h-4 w-4" />,
      action: () => sendMessage("Can you suggest a recipe based on my skill level?")
    },
    {
      id: 'troubleshooting',
      label: 'Troubleshooting',
      icon: <Lightbulb className="h-4 w-4" />,
      action: () => sendMessage("I'm having trouble with my pastry. Can you help me troubleshoot?")
    },
    {
      id: 'learning-path',
      label: 'Learning path',
      icon: <MessageSquare className="h-4 w-4" />,
      action: () => sendMessage("What should I learn next in my pastry journey?")
    }
  ]

  // Initialize with welcome message
  useEffect(() => {
    const welcomeMessage: ChatMessage = {
      id: 'welcome',
      type: 'assistant',
      content: "Hello! I'm your AI pastry tutor. I can help you with techniques, recipes, troubleshooting, and guide your learning journey. What would you like to know?",
      timestamp: new Date(),
      messageType: 'text',
      metadata: {
        quickActions: ['technique-help', 'recipe-suggestion', 'troubleshooting', 'learning-path']
      }
    }
    setMessages([welcomeMessage])
  }, [])

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: content.trim(),
      timestamp: new Date(),
      messageType: 'text'
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue('')
    setIsLoading(true)
    setShowQuickActions(false)

    try {
      // Simulate AI response (in a real app, this would call an API)
      const response = await simulateAIResponse(content)
      
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: response.content,
        timestamp: new Date(),
        messageType: response.messageType,
        metadata: response.metadata
      }

      setMessages(prev => [...prev, assistantMessage])
    } catch (error) {
      console.error('Error sending message:', error)
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: "I'm sorry, I encountered an error. Please try again.",
        timestamp: new Date(),
        messageType: 'text'
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const simulateAIResponse = async (userInput: string): Promise<{ content: string; messageType: 'text' | 'technique' | 'suggestion'; metadata?: any }> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000))

    const input = userInput.toLowerCase()

    if (input.includes('technique') || input.includes('help')) {
      return {
        content: "I'd be happy to help you with pastry techniques! Here are some common techniques I can guide you through:\n\n• **Pâte à Choux** - For éclairs and cream puffs\n• **Laminating** - For croissants and puff pastry\n• **Tempering Chocolate** - For smooth, shiny chocolate\n• **Macaronage** - For perfect macarons\n• **Custard Making** - For crème pâtissière and crème anglaise\n\nWhich technique would you like to work on?",
        messageType: 'technique',
        metadata: {
          quickActions: ['pate-a-choux', 'laminating', 'tempering', 'macaronage', 'custard']
        }
      }
    }

    if (input.includes('recipe') || input.includes('suggest')) {
      return {
        content: "Based on your learning progress, I'd recommend trying these recipes:\n\n**Beginner Level:**\n• Classic Chocolate Chip Cookies\n• Simple Vanilla Cupcakes\n• Basic Shortbread\n\n**Intermediate Level:**\n• French Macarons\n• Chocolate Éclairs\n• Lemon Tart\n\n**Advanced Level:**\n• Croissants\n• Opera Cake\n• Soufflé\n\nWhat's your current skill level, and what type of pastry interests you most?",
        messageType: 'suggestion',
        metadata: {
          quickActions: ['beginner-recipes', 'intermediate-recipes', 'advanced-recipes']
        }
      }
    }

    if (input.includes('troubleshoot') || input.includes('problem') || input.includes('issue')) {
      return {
        content: "I'm here to help troubleshoot your pastry issues! Common problems include:\n\n• **Dense or tough texture** - Usually overmixing or incorrect flour ratios\n• **Cracked surfaces** - Often temperature or humidity issues\n• **Uneven browning** - Check oven temperature and positioning\n• **Collapsed items** - Usually underbaking or structural issues\n\nCan you describe what went wrong with your pastry? Include details about the recipe, technique, and what you observed.",
        messageType: 'text'
      }
    }

    if (input.includes('learn') || input.includes('next') || input.includes('path')) {
      return {
        content: "Great question! Here's a suggested learning path based on your current progress:\n\n**Week 1-2: Foundation Skills**\n• Master basic mixing techniques\n• Learn proper measuring and scaling\n• Practice with simple cookies and muffins\n\n**Week 3-4: Intermediate Techniques**\n• Work on laminated doughs\n• Practice piping and decorating\n• Try your first tarts\n\n**Week 5-6: Advanced Skills**\n• Challenge yourself with macarons\n• Learn chocolate work\n• Attempt complex layered desserts\n\nWould you like me to create a personalized learning plan for you?",
        messageType: 'suggestion',
        metadata: {
          quickActions: ['create-plan', 'foundation-skills', 'intermediate-skills', 'advanced-skills']
        }
      }
    }

    // Default response
    return {
      content: "That's an interesting question! I'm here to help you with all aspects of pastry making. I can assist with:\n\n• **Technique guidance** - Step-by-step instructions for any technique\n• **Recipe recommendations** - Based on your skill level and interests\n• **Troubleshooting** - Help solve common pastry problems\n• **Learning paths** - Personalized curriculum recommendations\n• **Ingredient advice** - Substitutions and quality tips\n\nWhat specific aspect of pastry making would you like to explore?",
      messageType: 'text',
      metadata: {
        quickActions: ['technique-help', 'recipe-suggestion', 'troubleshooting', 'learning-path']
      }
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    sendMessage(inputValue)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage(inputValue)
    }
  }

  const clearChat = () => {
    setMessages([])
    setShowQuickActions(true)
    // Re-add welcome message
    const welcomeMessage: ChatMessage = {
      id: 'welcome',
      type: 'assistant',
      content: "Hello! I'm your AI pastry tutor. I can help you with techniques, recipes, troubleshooting, and guide your learning journey. What would you like to know?",
      timestamp: new Date(),
      messageType: 'text',
      metadata: {
        quickActions: ['technique-help', 'recipe-suggestion', 'troubleshooting', 'learning-path']
      }
    }
    setMessages([welcomeMessage])
  }

  const exportChat = () => {
    const chatData = {
      messages: messages.map(msg => ({
        type: msg.type,
        content: msg.content,
        timestamp: msg.timestamp.toISOString(),
        messageType: msg.messageType
      })),
      exportedAt: new Date().toISOString()
    }
    
    const blob = new Blob([JSON.stringify(chatData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `pastry-chat-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const filteredMessages = messages.filter(msg => 
    !searchQuery || msg.content.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <Card className={cn("h-[600px] flex flex-col", className)}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Bot className="h-6 w-6 text-primary" />
            <CardTitle className="text-lg">AI Pastry Tutor</CardTitle>
            <Badge variant="secondary" className="text-xs">Online</Badge>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm" onClick={() => setSearchQuery('')}>
              <Search className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={exportChat}>
              <Download className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={clearChat}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        {searchQuery && (
          <div className="mt-2">
            <Input
              placeholder="Search messages..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-8"
            />
          </div>
        )}
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0">
        <ScrollArea className="flex-1 px-6">
          <div className="space-y-4 pb-4">
            {filteredMessages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "flex gap-3",
                  message.type === 'user' ? 'justify-end' : 'justify-start'
                )}
              >
                {message.type === 'assistant' && (
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <Bot className="h-4 w-4 text-primary" />
                  </div>
                )}
                
                <div
                  className={cn(
                    "max-w-[80%] rounded-lg px-4 py-2",
                    message.type === 'user'
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted"
                  )}
                >
                  <div className="whitespace-pre-wrap text-sm">
                    {message.content}
                  </div>
                  <div className={cn(
                    "text-xs mt-1",
                    message.type === 'user' ? "text-primary-foreground/70" : "text-muted-foreground"
                  )}>
                    {message.timestamp.toLocaleTimeString()}
                  </div>
                  
                  {message.metadata?.quickActions && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {message.metadata.quickActions.map((action: string) => (
                        <Button
                          key={action}
                          variant="outline"
                          size="sm"
                          className="h-6 text-xs"
                          onClick={() => sendMessage(`Tell me more about ${action}`)}
                        >
                          {action.replace('-', ' ')}
                        </Button>
                      ))}
                    </div>
                  )}
                </div>

                {message.type === 'user' && (
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                    <User className="h-4 w-4 text-primary-foreground" />
                  </div>
                )}
              </div>
            ))}
            
            {isLoading && (
              <div className="flex gap-3 justify-start">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <Bot className="h-4 w-4 text-primary" />
                </div>
                <div className="bg-muted rounded-lg px-4 py-2">
                  <div className="flex items-center space-x-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm text-muted-foreground">AI is thinking...</span>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {showQuickActions && (
          <div className="px-6 py-3 border-t">
            <div className="flex flex-wrap gap-2">
              {quickActions.map((action) => (
                <Button
                  key={action.id}
                  variant="outline"
                  size="sm"
                  onClick={action.action}
                  className="flex items-center gap-2"
                >
                  {action.icon}
                  {action.label}
                </Button>
              ))}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 border-t">
          <div className="flex gap-2">
            <Input
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me anything about pastry making..."
              disabled={isLoading}
              className="flex-1"
            />
            <Button type="submit" disabled={isLoading || !inputValue.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

export default AIChat
