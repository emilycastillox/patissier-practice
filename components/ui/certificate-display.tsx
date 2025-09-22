"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Award, 
  Download, 
  Share2, 
  Eye, 
  CheckCircle, 
  Star, 
  Calendar, 
  User, 
  BookOpen, 
  Target, 
  Clock, 
  Trophy, 
  Medal, 
  Shield, 
  Gem, 
  Zap, 
  Crown,
  RefreshCw,
  ExternalLink,
  Copy,
  QrCode,
  Printer,
  Mail,
  Twitter,
  Facebook,
  Linkedin,
  Instagram
} from "lucide-react"
import { LearningPath } from "@/lib/types"
import { certificateService, Certificate, CertificateTemplate, CompletionStats } from "@/lib/services/certificateService"
import { cn } from "@/lib/utils"

interface CertificateDisplayProps {
  path: LearningPath
  studentName: string
  onClose?: () => void
  className?: string
}

export function CertificateDisplay({ 
  path, 
  studentName,
  onClose,
  className 
}: CertificateDisplayProps) {
  const [certificate, setCertificate] = useState<Certificate | null>(null)
  const [templates, setTemplates] = useState<CertificateTemplate[]>([])
  const [selectedTemplate, setSelectedTemplate] = useState<CertificateTemplate | null>(null)
  const [stats, setStats] = useState<CompletionStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isGenerating, setIsGenerating] = useState(false)
  const [activeTab, setActiveTab] = useState('certificate')

  useEffect(() => {
    loadData()
  }, [path, studentName])

  const loadData = async () => {
    setIsLoading(true)
    try {
      // Generate certificate
      const newCertificate = certificateService.generateCertificate(path, studentName)
      setCertificate(newCertificate)

      // Load templates
      const availableTemplates = certificateService.getActiveTemplates()
      setTemplates(availableTemplates)
      setSelectedTemplate(availableTemplates[0] || null)

      // Load stats
      const completionStats = certificateService.getCompletionStats()
      setStats(completionStats)
    } catch (error) {
      console.error('Error loading certificate data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDownloadPDF = async () => {
    if (!certificate || !selectedTemplate) return
    
    setIsGenerating(true)
    try {
      const pdfBlob = await certificateService.exportCertificateAsPDF(certificate, selectedTemplate.id)
      const url = URL.createObjectURL(pdfBlob)
      const a = document.createElement('a')
      a.href = url
      a.download = `certificate-${certificate.certificateNumber}.pdf`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error downloading PDF:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleDownloadImage = async () => {
    if (!certificate || !selectedTemplate) return
    
    setIsGenerating(true)
    try {
      const imageBlob = await certificateService.exportCertificateAsImage(certificate, selectedTemplate.id)
      const url = URL.createObjectURL(imageBlob)
      const a = document.createElement('a')
      a.href = url
      a.download = `certificate-${certificate.certificateNumber}.png`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error downloading image:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleShare = (platform: 'social' | 'email' | 'link') => {
    if (!certificate) return
    
    const shareUrl = certificateService.shareCertificate(certificate, platform)
    
    if (platform === 'link') {
      navigator.clipboard.writeText(shareUrl)
      // Show toast notification
    } else {
      window.open(shareUrl, '_blank')
    }
  }

  const handlePrint = () => {
    window.print()
  }

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

  const getLevelColor = (level: string) => {
    switch (level) {
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

  if (isLoading) {
    return (
      <div className={cn("flex items-center justify-center p-8", className)}>
        <div className="flex items-center gap-2">
          <RefreshCw className="h-4 w-4 animate-spin" />
          <span>Generating certificate...</span>
        </div>
      </div>
    )
  }

  if (!certificate) {
    return (
      <div className={cn("flex items-center justify-center p-8", className)}>
        <div className="text-center">
          <Award className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Certificate Not Found</h3>
          <p className="text-muted-foreground">Unable to generate certificate for this learning path.</p>
        </div>
      </div>
    )
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Certificate of Completion</h2>
          <p className="text-muted-foreground">
            Congratulations on completing "{path.title}"
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="h-4 w-4 mr-2" />
            Print
          </Button>
          {onClose && (
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          )}
        </div>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="certificate">Certificate</TabsTrigger>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="share">Share</TabsTrigger>
        </TabsList>

        <TabsContent value="certificate" className="space-y-6 mt-6">
          {/* Certificate Display */}
          <Card className="overflow-hidden">
            <CardContent className="p-0">
              <div 
                className="relative"
                style={{
                  backgroundColor: selectedTemplate?.styles.backgroundColor || '#ffffff',
                  border: `${selectedTemplate?.styles.borderWidth || 2}px ${selectedTemplate?.styles.borderStyle || 'solid'} ${selectedTemplate?.styles.borderColor || '#d1d5db'}`,
                  borderRadius: `${selectedTemplate?.styles.borderRadius || 8}px`,
                  padding: `${selectedTemplate?.styles.padding || 40}px`,
                  margin: `${selectedTemplate?.styles.margin || 20}px`,
                  fontFamily: selectedTemplate?.styles.fontFamily || 'serif'
                }}
              >
                {/* Certificate Header */}
                <div className="text-center mb-8">
                  <div className="flex items-center justify-center mb-4">
                    <Trophy className="h-16 w-16 text-yellow-500" />
                  </div>
                  <h1 className="text-4xl font-bold mb-2" style={{ color: selectedTemplate?.styles.primaryColor || '#1f2937' }}>
                    Certificate of Completion
                  </h1>
                  <p className="text-lg" style={{ color: selectedTemplate?.styles.secondaryColor || '#6b7280' }}>
                    This is to certify that
                  </p>
                </div>

                {/* Student Name */}
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold mb-2" style={{ color: selectedTemplate?.styles.primaryColor || '#1f2937' }}>
                    {certificate.studentName}
                  </h2>
                  <p className="text-lg" style={{ color: selectedTemplate?.styles.secondaryColor || '#6b7280' }}>
                    has successfully completed
                  </p>
                </div>

                {/* Course Information */}
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-semibold mb-4" style={{ color: selectedTemplate?.styles.primaryColor || '#1f2937' }}>
                    {certificate.pathTitle}
                  </h3>
                  <div className="flex items-center justify-center gap-4 mb-4">
                    <Badge className={getLevelColor(certificate.level)}>
                      {certificate.level}
                    </Badge>
                    <Badge className={getDifficultyColor(certificate.difficulty)}>
                      {certificate.difficulty}
                    </Badge>
                    <Badge variant="outline">
                      {certificate.duration}
                    </Badge>
                  </div>
                  <p className="text-sm" style={{ color: selectedTemplate?.styles.secondaryColor || '#6b7280' }}>
                    {certificate.modulesCompleted} modules completed • Score: {certificate.score.toFixed(0)}%
                  </p>
                </div>

                {/* Completion Date */}
                <div className="text-center mb-8">
                  <p className="text-sm" style={{ color: selectedTemplate?.styles.secondaryColor || '#6b7280' }}>
                    Completed on {new Date(certificate.completionDate).toLocaleDateString()}
                  </p>
                </div>

                {/* Certificate Number */}
                <div className="text-center mb-8">
                  <p className="text-xs" style={{ color: selectedTemplate?.styles.secondaryColor || '#6b7280' }}>
                    Certificate Number: {certificate.certificateNumber}
                  </p>
                  <p className="text-xs" style={{ color: selectedTemplate?.styles.secondaryColor || '#6b7280' }}>
                    Verification Code: {certificate.verificationCode}
                  </p>
                </div>

                {/* Instructor Signature */}
                {certificate.instructorName && (
                  <div className="flex justify-between items-end mt-12">
                    <div className="text-center">
                      <div className="border-t-2 border-gray-300 w-32 mx-auto mb-2"></div>
                      <p className="text-sm font-semibold">{certificate.instructorName}</p>
                      <p className="text-xs" style={{ color: selectedTemplate?.styles.secondaryColor || '#6b7280' }}>
                        {certificate.instructorTitle}
                      </p>
                    </div>
                    <div className="text-center">
                      <div className="border-t-2 border-gray-300 w-32 mx-auto mb-2"></div>
                      <p className="text-sm font-semibold">Date</p>
                      <p className="text-xs" style={{ color: selectedTemplate?.styles.secondaryColor || '#6b7280' }}>
                        {new Date(certificate.issueDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Template Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Certificate Template</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {templates.map((template) => (
                  <div
                    key={template.id}
                    className={cn(
                      "p-4 border rounded-lg cursor-pointer transition-all",
                      selectedTemplate?.id === template.id
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                    )}
                    onClick={() => setSelectedTemplate(template)}
                  >
                    <h3 className="font-semibold mb-2">{template.name}</h3>
                    <p className="text-sm text-muted-foreground mb-3">{template.description}</p>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-4 h-4 rounded"
                        style={{ backgroundColor: template.styles.primaryColor }}
                      ></div>
                      <div
                        className="w-4 h-4 rounded"
                        style={{ backgroundColor: template.styles.secondaryColor }}
                      ></div>
                      <div
                        className="w-4 h-4 rounded"
                        style={{ backgroundColor: template.styles.backgroundColor }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Download Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Download Certificate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <Button onClick={handleDownloadPDF} disabled={isGenerating}>
                  <Download className="h-4 w-4 mr-2" />
                  {isGenerating ? 'Generating...' : 'Download PDF'}
                </Button>
                <Button variant="outline" onClick={handleDownloadImage} disabled={isGenerating}>
                  <Download className="h-4 w-4 mr-2" />
                  {isGenerating ? 'Generating...' : 'Download Image'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="details" className="space-y-6 mt-6">
          {/* Certificate Details */}
          <Card>
            <CardHeader>
              <CardTitle>Certificate Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Student Information</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Name:</span>
                        <span>{certificate.studentName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Completion Date:</span>
                        <span>{new Date(certificate.completionDate).toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Issue Date:</span>
                        <span>{new Date(certificate.issueDate).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Course Information</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Course:</span>
                        <span>{certificate.pathTitle}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Level:</span>
                        <Badge className={getLevelColor(certificate.level)}>
                          {certificate.level}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Difficulty:</span>
                        <Badge className={getDifficultyColor(certificate.difficulty)}>
                          {certificate.difficulty}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Duration:</span>
                        <span>{certificate.duration}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Score:</span>
                        <span>{certificate.score.toFixed(0)}%</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Verification</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Certificate Number:</span>
                        <span className="font-mono">{certificate.certificateNumber}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Verification Code:</span>
                        <span className="font-mono">{certificate.verificationCode}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Status:</span>
                        <Badge className="bg-green-100 text-green-800">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Valid
                        </Badge>
                      </div>
                      {certificate.expiresAt && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Expires:</span>
                          <span>{new Date(certificate.expiresAt).toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {certificate.instructorName && (
                    <div>
                      <h4 className="font-semibold mb-2">Instructor</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Name:</span>
                          <span>{certificate.instructorName}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Title:</span>
                          <span>{certificate.instructorTitle}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Achievements and Badges */}
          {(certificate.achievements.length > 0 || certificate.badges.length > 0) && (
            <Card>
              <CardHeader>
                <CardTitle>Achievements & Badges</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {certificate.achievements.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-2">Achievements</h4>
                      <div className="flex flex-wrap gap-2">
                        {certificate.achievements.map((achievement, index) => (
                          <Badge key={index} variant="secondary">
                            <Trophy className="h-3 w-3 mr-1" />
                            {achievement}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  {certificate.badges.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-2">Badges</h4>
                      <div className="flex flex-wrap gap-2">
                        {certificate.badges.map((badge, index) => (
                          <Badge key={index} variant="outline">
                            <Medal className="h-3 w-3 mr-1" />
                            {badge}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Learning Statistics */}
          {stats && (
            <Card>
              <CardHeader>
                <CardTitle>Learning Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{stats.totalPathsCompleted}</div>
                    <div className="text-sm text-muted-foreground">Paths Completed</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{stats.totalModulesCompleted}</div>
                    <div className="text-sm text-muted-foreground">Modules Completed</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">{stats.achievementsUnlocked}</div>
                    <div className="text-sm text-muted-foreground">Achievements</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-600">{stats.currentStreak}</div>
                    <div className="text-sm text-muted-foreground">Day Streak</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="share" className="space-y-6 mt-6">
          {/* Share Options */}
          <Card>
            <CardHeader>
              <CardTitle>Share Your Achievement</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Button
                    variant="outline"
                    onClick={() => handleShare('social')}
                    className="flex items-center gap-2"
                  >
                    <Twitter className="h-4 w-4" />
                    Twitter
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleShare('email')}
                    className="flex items-center gap-2"
                  >
                    <Mail className="h-4 w-4" />
                    Email
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleShare('link')}
                    className="flex items-center gap-2"
                  >
                    <Copy className="h-4 w-4" />
                    Copy Link
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleShare('link')}
                    className="flex items-center gap-2"
                  >
                    <QrCode className="h-4 w-4" />
                    QR Code
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Social Media Preview */}
          <Card>
            <CardHeader>
              <CardTitle>Social Media Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg p-4 bg-gray-50">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                    <User className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold">{certificate.studentName}</span>
                      <span className="text-muted-foreground">@username</span>
                      <span className="text-muted-foreground">•</span>
                      <span className="text-muted-foreground">now</span>
                    </div>
                    <p className="mb-2">
                      🎉 I just completed "{certificate.pathTitle}" on Patissier Practice! 
                      Proud to have earned my {certificate.level} level certificate. 
                      #PatissierPractice #BakingSkills #Learning
                    </p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>❤️ 0</span>
                      <span>🔄 0</span>
                      <span>💬 0</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default CertificateDisplay
