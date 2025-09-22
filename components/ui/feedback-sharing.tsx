"use client"

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './card'
import { Button } from './button'
import { Badge } from './badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './tabs'
import { 
  Share2, 
  Download, 
  Copy, 
  Twitter, 
  Facebook, 
  Instagram, 
  Linkedin,
  FileText,
  Image as ImageIcon,
  Settings,
  Check,
  ExternalLink,
  Link as LinkIcon
} from 'lucide-react'
import { 
  ShareableFeedback, 
  ExportOptions,
  feedbackSharingService 
} from '@/lib/services/feedbackSharingService'
import { FeedbackHistoryEntry } from '@/lib/services/feedbackHistoryService'

interface FeedbackSharingProps {
  feedback: FeedbackHistoryEntry
  onClose?: () => void
  className?: string
}

export function FeedbackSharing({ feedback, onClose, className }: FeedbackSharingProps) {
  const [shareSettings, setShareSettings] = useState({
    includeImage: true,
    includeScore: true,
    includeSuggestions: true,
    includeTechnique: true,
    includeNotes: false
  })
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    format: 'json',
    includeImage: true,
    includeHistory: false
  })
  const [isSharing, setIsSharing] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [copied, setCopied] = useState(false)

  const shareableFeedback = feedbackSharingService.generateShareableFeedback(feedback, shareSettings)

  const handleSocialShare = async (platform: 'twitter' | 'facebook' | 'instagram' | 'linkedin') => {
    setIsSharing(true)
    try {
      const success = await feedbackSharingService.shareToSocial(shareableFeedback, platform)
      if (success) {
        feedbackSharingService.saveSharedFeedback(shareableFeedback)
      }
    } catch (error) {
      console.error('Error sharing:', error)
    } finally {
      setIsSharing(false)
    }
  }

  const handleCopyLink = async () => {
    const link = feedbackSharingService.generateShareableLink(shareableFeedback)
    const success = await feedbackSharingService.copyToClipboard(link)
    if (success) {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleExport = async () => {
    setIsExporting(true)
    try {
      const blob = await feedbackSharingService.exportFeedback([feedback], exportOptions)
      if (blob) {
        const filename = `pastry-feedback-${feedback.id}.${exportOptions.format}`
        feedbackSharingService.downloadFile(blob, filename)
      }
    } catch (error) {
      console.error('Error exporting:', error)
    } finally {
      setIsExporting(false)
    }
  }

  const handleCopyText = async () => {
    const shareData = feedbackSharingService.generateSocialShareData(shareableFeedback, 'twitter')
    const text = `${shareData.title}\n\n${shareData.description}\n\n${shareData.hashtags.join(' ')}`
    
    const success = await feedbackSharingService.copyToClipboard(text)
    if (success) {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600"
    if (score >= 80) return "text-blue-600"
    if (score >= 70) return "text-yellow-600"
    return "text-red-600"
  }

  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Share2 className="h-5 w-5" />
              Share Your Progress
            </CardTitle>
            {onClose && (
              <Button variant="ghost" size="sm" onClick={onClose}>
                ×
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="social" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="social">Social Share</TabsTrigger>
              <TabsTrigger value="export">Export</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="social" className="mt-6">
              <div className="space-y-6">
                {/* Preview */}
                <div className="bg-muted/50 rounded-lg p-4">
                  <h3 className="font-medium mb-2">Preview</h3>
                  <div className="flex items-start gap-4">
                    {shareSettings.includeImage && (
                      <img
                        src={feedback.imageUrl}
                        alt="Feedback preview"
                        className="w-20 h-20 object-cover rounded-lg"
                      />
                    )}
                    <div className="flex-1">
                      <h4 className="font-medium">
                        My {feedback.technique || feedback.analysisResult.category} Creation - {feedback.analysisResult.score}/100 Score!
                      </h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        Just got AI feedback on my pastry creation! Scored {feedback.analysisResult.score}/100 for {feedback.analysisResult.category}. Check out my progress! 🧁✨
                      </p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {['#PastryPractice', '#BakingProgress', '#AIFeedback'].map(tag => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Social Media Buttons */}
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    onClick={() => handleSocialShare('twitter')}
                    disabled={isSharing}
                    className="flex items-center gap-2"
                  >
                    <Twitter className="h-4 w-4" />
                    Share on Twitter
                  </Button>
                  <Button
                    onClick={() => handleSocialShare('facebook')}
                    disabled={isSharing}
                    className="flex items-center gap-2"
                  >
                    <Facebook className="h-4 w-4" />
                    Share on Facebook
                  </Button>
                  <Button
                    onClick={() => handleSocialShare('instagram')}
                    disabled={isSharing}
                    className="flex items-center gap-2"
                  >
                    <Instagram className="h-4 w-4" />
                    Share on Instagram
                  </Button>
                  <Button
                    onClick={() => handleSocialShare('linkedin')}
                    disabled={isSharing}
                    className="flex items-center gap-2"
                  >
                    <Linkedin className="h-4 w-4" />
                    Share on LinkedIn
                  </Button>
                </div>

                {/* Copy Options */}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={handleCopyLink}
                    className="flex items-center gap-2"
                  >
                    <LinkIcon className="h-4 w-4" />
                    {copied ? 'Copied!' : 'Copy Link'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleCopyText}
                    className="flex items-center gap-2"
                  >
                    <Copy className="h-4 w-4" />
                    {copied ? 'Copied!' : 'Copy Text'}
                  </Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="export" className="mt-6">
              <div className="space-y-6">
                {/* Export Format Selection */}
                <div>
                  <h3 className="font-medium mb-3">Export Format</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      variant={exportOptions.format === 'json' ? 'default' : 'outline'}
                      onClick={() => setExportOptions(prev => ({ ...prev, format: 'json' }))}
                      className="flex items-center gap-2"
                    >
                      <FileText className="h-4 w-4" />
                      JSON
                    </Button>
                    <Button
                      variant={exportOptions.format === 'csv' ? 'default' : 'outline'}
                      onClick={() => setExportOptions(prev => ({ ...prev, format: 'csv' }))}
                      className="flex items-center gap-2"
                    >
                      <FileText className="h-4 w-4" />
                      CSV
                    </Button>
                    <Button
                      variant={exportOptions.format === 'pdf' ? 'default' : 'outline'}
                      onClick={() => setExportOptions(prev => ({ ...prev, format: 'pdf' }))}
                      className="flex items-center gap-2"
                    >
                      <FileText className="h-4 w-4" />
                      PDF
                    </Button>
                    <Button
                      variant={exportOptions.format === 'image' ? 'default' : 'outline'}
                      onClick={() => setExportOptions(prev => ({ ...prev, format: 'image' }))}
                      className="flex items-center gap-2"
                    >
                      <ImageIcon className="h-4 w-4" />
                      Image
                    </Button>
                  </div>
                </div>

                {/* Export Options */}
                <div className="space-y-3">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={exportOptions.includeImage}
                      onChange={(e) => setExportOptions(prev => ({ ...prev, includeImage: e.target.checked }))}
                    />
                    <span className="text-sm">Include image</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={exportOptions.includeHistory}
                      onChange={(e) => setExportOptions(prev => ({ ...prev, includeHistory: e.target.checked }))}
                    />
                    <span className="text-sm">Include full history</span>
                  </label>
                </div>

                {/* Export Button */}
                <Button
                  onClick={handleExport}
                  disabled={isExporting}
                  className="w-full flex items-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  {isExporting ? 'Exporting...' : 'Export Feedback'}
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="settings" className="mt-6">
              <div className="space-y-4">
                <h3 className="font-medium">Share Settings</h3>
                
                <div className="space-y-3">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={shareSettings.includeImage}
                      onChange={(e) => setShareSettings(prev => ({ ...prev, includeImage: e.target.checked }))}
                    />
                    <span className="text-sm">Include image in share</span>
                  </label>
                  
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={shareSettings.includeScore}
                      onChange={(e) => setShareSettings(prev => ({ ...prev, includeScore: e.target.checked }))}
                    />
                    <span className="text-sm">Include score</span>
                  </label>
                  
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={shareSettings.includeSuggestions}
                      onChange={(e) => setShareSettings(prev => ({ ...prev, includeSuggestions: e.target.checked }))}
                    />
                    <span className="text-sm">Include suggestions</span>
                  </label>
                  
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={shareSettings.includeTechnique}
                      onChange={(e) => setShareSettings(prev => ({ ...prev, includeTechnique: e.target.checked }))}
                    />
                    <span className="text-sm">Include technique</span>
                  </label>
                  
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={shareSettings.includeNotes}
                      onChange={(e) => setShareSettings(prev => ({ ...prev, includeNotes: e.target.checked }))}
                    />
                    <span className="text-sm">Include personal notes</span>
                  </label>
                </div>

                {/* Current Feedback Summary */}
                <div className="bg-muted/50 rounded-lg p-4">
                  <h4 className="font-medium mb-2">Current Feedback</h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Technique:</span>
                      <span>{feedback.technique || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Category:</span>
                      <span>{feedback.analysisResult.category}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Score:</span>
                      <span className={getScoreColor(feedback.analysisResult.score)}>
                        {feedback.analysisResult.score}/100
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Date:</span>
                      <span>{feedback.timestamp.toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
