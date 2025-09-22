import { AIAnalysisResult } from './aiService'
import { FeedbackHistoryEntry } from './feedbackHistoryService'

export interface ShareableFeedback {
  id: string
  imageUrl: string
  analysisResult: AIAnalysisResult
  timestamp: Date
  technique?: string
  notes?: string
  shareSettings: {
    includeImage: boolean
    includeScore: boolean
    includeSuggestions: boolean
    includeTechnique: boolean
    includeNotes: boolean
  }
}

export interface ExportOptions {
  format: 'pdf' | 'json' | 'csv' | 'image'
  includeImage: boolean
  includeHistory: boolean
  dateRange?: {
    start: Date
    end: Date
  }
  categories?: string[]
}

export interface SocialShareData {
  title: string
  description: string
  imageUrl?: string
  hashtags: string[]
  url?: string
}

export class FeedbackSharingService {
  private static instance: FeedbackSharingService
  private storageKey = 'patissier-shared-feedback'

  private constructor() {}

  public static getInstance(): FeedbackSharingService {
    if (!FeedbackSharingService.instance) {
      FeedbackSharingService.instance = new FeedbackSharingService()
    }
    return FeedbackSharingService.instance
  }

  // Generate shareable feedback data
  generateShareableFeedback(
    entry: FeedbackHistoryEntry,
    shareSettings: ShareableFeedback['shareSettings']
  ): ShareableFeedback {
    return {
      id: entry.id,
      imageUrl: entry.imageUrl,
      analysisResult: entry.analysisResult,
      timestamp: entry.timestamp,
      technique: entry.technique,
      notes: entry.notes,
      shareSettings
    }
  }

  // Generate social media share data
  generateSocialShareData(
    feedback: ShareableFeedback,
    platform: 'twitter' | 'facebook' | 'instagram' | 'linkedin'
  ): SocialShareData {
    const { analysisResult, technique } = feedback
    const score = analysisResult.score
    const category = analysisResult.category

    const baseTitle = `My ${technique || category} Creation - ${score}/100 Score!`
    const baseDescription = `Just got AI feedback on my pastry creation! Scored ${score}/100 for ${category}. Check out my progress! 🧁✨`

    const hashtags = [
      '#PastryPractice',
      '#BakingProgress',
      '#AIFeedback',
      `#${category.replace(/\s+/g, '')}`,
      `#${technique?.replace(/\s+/g, '') || 'Pastry'}`,
      '#BakingCommunity'
    ]

    switch (platform) {
      case 'twitter':
        return {
          title: baseTitle,
          description: baseDescription.slice(0, 200), // Twitter character limit
          imageUrl: feedback.shareSettings.includeImage ? feedback.imageUrl : undefined,
          hashtags: hashtags.slice(0, 3), // Limit hashtags for Twitter
          url: `${window.location.origin}/feedback/${feedback.id}`
        }
      
      case 'facebook':
        return {
          title: baseTitle,
          description: baseDescription,
          imageUrl: feedback.shareSettings.includeImage ? feedback.imageUrl : undefined,
          hashtags,
          url: `${window.location.origin}/feedback/${feedback.id}`
        }
      
      case 'instagram':
        return {
          title: `My ${technique || category} - ${score}/100! 🧁`,
          description: `AI feedback: ${score}/100 for ${category}\n\n${hashtags.join(' ')}`,
          imageUrl: feedback.imageUrl, // Instagram always includes image
          hashtags
        }
      
      case 'linkedin':
        return {
          title: `Pastry Learning Progress: ${technique || category}`,
          description: `Excited to share my latest pastry creation! Scored ${score}/100 with AI feedback on ${category}. Always learning and improving! 🧁`,
          imageUrl: feedback.shareSettings.includeImage ? feedback.imageUrl : undefined,
          hashtags: hashtags.slice(0, 5),
          url: `${window.location.origin}/feedback/${feedback.id}`
        }
      
      default:
        return {
          title: baseTitle,
          description: baseDescription,
          imageUrl: feedback.imageUrl,
          hashtags
        }
    }
  }

  // Share to social media
  async shareToSocial(
    feedback: ShareableFeedback,
    platform: 'twitter' | 'facebook' | 'instagram' | 'linkedin'
  ): Promise<boolean> {
    try {
      const shareData = this.generateSocialShareData(feedback, platform)
      
      if (platform === 'twitter') {
        const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareData.title)}&url=${encodeURIComponent(shareData.url || '')}&hashtags=${encodeURIComponent(shareData.hashtags.join(','))}`
        window.open(twitterUrl, '_blank', 'width=600,height=400')
      } else if (platform === 'facebook') {
        const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareData.url || '')}&quote=${encodeURIComponent(shareData.description)}`
        window.open(facebookUrl, '_blank', 'width=600,height=400')
      } else if (platform === 'linkedin') {
        const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareData.url || '')}`
        window.open(linkedinUrl, '_blank', 'width=600,height=400')
      } else if (platform === 'instagram') {
        // Instagram doesn't support direct sharing, so we'll copy the text
        await this.copyToClipboard(shareData.description)
        alert('Text copied to clipboard! You can now paste it in your Instagram post.')
      }
      
      return true
    } catch (error) {
      console.error('Error sharing to social media:', error)
      return false
    }
  }

  // Copy to clipboard
  async copyToClipboard(text: string): Promise<boolean> {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(text)
        return true
      } else {
        // Fallback for older browsers
        const textArea = document.createElement('textarea')
        textArea.value = text
        document.body.appendChild(textArea)
        textArea.select()
        document.execCommand('copy')
        document.body.removeChild(textArea)
        return true
      }
    } catch (error) {
      console.error('Error copying to clipboard:', error)
      return false
    }
  }

  // Export feedback data
  async exportFeedback(
    entries: FeedbackHistoryEntry[],
    options: ExportOptions
  ): Promise<Blob | null> {
    try {
      switch (options.format) {
        case 'json':
          return this.exportAsJSON(entries, options)
        case 'csv':
          return this.exportAsCSV(entries, options)
        case 'pdf':
          return await this.exportAsPDF(entries, options)
        case 'image':
          return await this.exportAsImage(entries, options)
        default:
          throw new Error('Unsupported export format')
      }
    } catch (error) {
      console.error('Error exporting feedback:', error)
      return null
    }
  }

  // Export as JSON
  private exportAsJSON(entries: FeedbackHistoryEntry[], options: ExportOptions): Blob {
    const exportData = entries.map(entry => ({
      id: entry.id,
      timestamp: entry.timestamp,
      technique: entry.technique,
      notes: entry.notes,
      analysisResult: {
        score: entry.analysisResult.score,
        category: entry.analysisResult.category,
        analysis: entry.analysisResult.analysis,
        suggestions: entry.analysisResult.feedback
      },
      imageUrl: options.includeImage ? entry.imageUrl : undefined
    }))

    const jsonString = JSON.stringify(exportData, null, 2)
    return new Blob([jsonString], { type: 'application/json' })
  }

  // Export as CSV
  private exportAsCSV(entries: FeedbackHistoryEntry[], options: ExportOptions): Blob {
    const headers = [
      'Date',
      'Technique',
      'Category',
      'Score',
      'Color Score',
      'Shape Score',
      'Texture Score',
      'Presentation Score',
      'Notes'
    ]

    const csvRows = [headers.join(',')]

    entries.forEach(entry => {
      const row = [
        entry.timestamp.toISOString().split('T')[0],
        entry.technique || '',
        entry.analysisResult.category,
        entry.analysisResult.score.toString(),
        entry.analysisResult.analysis.color?.score.toString() || '',
        entry.analysisResult.analysis.shape?.score.toString() || '',
        entry.analysisResult.analysis.texture?.score.toString() || '',
        entry.analysisResult.analysis.technique?.score.toString() || '',
        (entry.notes || '').replace(/,/g, ';') // Escape commas
      ]
      csvRows.push(row.join(','))
    })

    const csvString = csvRows.join('\n')
    return new Blob([csvString], { type: 'text/csv' })
  }

  // Export as PDF (simplified version)
  private async exportAsPDF(entries: FeedbackHistoryEntry[], options: ExportOptions): Promise<Blob> {
    // This is a simplified PDF export - in a real app, you'd use a library like jsPDF
    const content = entries.map(entry => `
      Date: ${entry.timestamp.toLocaleDateString()}
      Technique: ${entry.technique || 'N/A'}
      Category: ${entry.analysisResult.category}
      Score: ${entry.analysisResult.score}/100
      Notes: ${entry.notes || 'None'}
      ---
    `).join('\n')

    const pdfContent = `
      Pastry Practice Feedback Report
      Generated: ${new Date().toLocaleDateString()}
      
      ${content}
    `

    return new Blob([pdfContent], { type: 'text/plain' })
  }

  // Export as image (creates a summary image)
  private async exportAsImage(entries: FeedbackHistoryEntry[], options: ExportOptions): Promise<Blob> {
    // This is a simplified image export - in a real app, you'd use canvas to create an image
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    
    if (!ctx) throw new Error('Could not get canvas context')

    canvas.width = 800
    canvas.height = 600

    // Draw background
    ctx.fillStyle = '#f8f9fa'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Draw title
    ctx.fillStyle = '#333'
    ctx.font = 'bold 24px Arial'
    ctx.textAlign = 'center'
    ctx.fillText('Pastry Practice Progress', canvas.width / 2, 50)

    // Draw entries
    let y = 100
    entries.slice(0, 10).forEach((entry, index) => {
      ctx.fillStyle = '#666'
      ctx.font = '16px Arial'
      ctx.textAlign = 'left'
      ctx.fillText(
        `${index + 1}. ${entry.technique || entry.analysisResult.category} - ${entry.analysisResult.score}/100`,
        50,
        y
      )
      y += 30
    })

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        resolve(blob || new Blob())
      }, 'image/png')
    })
  }

  // Download file
  downloadFile(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  // Generate shareable link
  generateShareableLink(feedback: ShareableFeedback): string {
    const baseUrl = window.location.origin
    const params = new URLSearchParams({
      id: feedback.id,
      score: feedback.analysisResult.score.toString(),
      category: feedback.analysisResult.category
    })
    
    return `${baseUrl}/share/feedback?${params.toString()}`
  }

  // Save shared feedback
  saveSharedFeedback(feedback: ShareableFeedback): void {
    const shared = this.getSharedFeedback()
    shared.push(feedback)
    localStorage.setItem(this.storageKey, JSON.stringify(shared))
  }

  // Get shared feedback
  getSharedFeedback(): ShareableFeedback[] {
    try {
      const stored = localStorage.getItem(this.storageKey)
      return stored ? JSON.parse(stored) : []
    } catch (error) {
      console.error('Error loading shared feedback:', error)
      return []
    }
  }
}

export const feedbackSharingService = FeedbackSharingService.getInstance()
