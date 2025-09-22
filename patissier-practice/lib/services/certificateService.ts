import { LearningPath, LearningModule } from "@/lib/types"
import { progressService } from "./progressService"
import { achievementService } from "./achievementService"

export interface Certificate {
  id: string
  pathId: number
  pathTitle: string
  studentName: string
  completionDate: string
  issueDate: string
  certificateNumber: string
  level: string
  difficulty: string
  duration: string
  modulesCompleted: number
  totalModules: number
  score: number
  instructorName?: string
  instructorTitle?: string
  achievements: string[]
  badges: string[]
  verificationCode: string
  isValid: boolean
  expiresAt?: string
}

export interface CertificateTemplate {
  id: string
  name: string
  description: string
  template: string
  styles: CertificateStyles
  isDefault: boolean
  isActive: boolean
}

export interface CertificateStyles {
  backgroundColor: string
  primaryColor: string
  secondaryColor: string
  textColor: string
  borderColor: string
  fontFamily: string
  logoUrl?: string
  backgroundImage?: string
  borderStyle: 'solid' | 'dashed' | 'dotted' | 'double'
  borderWidth: number
  borderRadius: number
  padding: number
  margin: number
}

export interface CelebrationConfig {
  id: string
  name: string
  type: 'completion' | 'milestone' | 'achievement' | 'streak'
  trigger: {
    condition: 'path_completion' | 'module_completion' | 'score_threshold' | 'streak_days' | 'achievement_unlock'
    value: any
  }
  animation: {
    type: 'confetti' | 'fireworks' | 'sparkles' | 'balloons' | 'stars'
    duration: number
    intensity: 'low' | 'medium' | 'high'
  }
  sound: {
    enabled: boolean
    file: string
    volume: number
  }
  message: {
    title: string
    subtitle: string
    description: string
  }
  rewards: {
    points: number
    badges: string[]
    achievements: string[]
  }
  isActive: boolean
}

export interface CompletionStats {
  totalPathsCompleted: number
  totalModulesCompleted: number
  totalTimeSpent: number
  averageScore: number
  currentStreak: number
  longestStreak: number
  achievementsUnlocked: number
  badgesEarned: number
  level: string
  nextLevelProgress: number
}

class CertificateService {
  private storageKey = 'patissier-practice-certificates'
  private templatesKey = 'patissier-practice-certificate-templates'
  private celebrationsKey = 'patissier-practice-celebrations'
  private certificates: Certificate[] = []
  private templates: CertificateTemplate[] = []
  private celebrations: CelebrationConfig[] = []

  constructor() {
    this.loadCertificates()
    this.loadTemplates()
    this.loadCelebrations()
    this.initializeDefaultTemplates()
    this.initializeDefaultCelebrations()
  }

  // Load certificates from localStorage
  private loadCertificates(): void {
    try {
      const data = localStorage.getItem(this.storageKey)
      if (data) {
        this.certificates = JSON.parse(data)
      }
    } catch (error) {
      console.error('Error loading certificates:', error)
    }
  }

  // Save certificates to localStorage
  private saveCertificates(): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.certificates))
    } catch (error) {
      console.error('Error saving certificates:', error)
    }
  }

  // Load templates from localStorage
  private loadTemplates(): void {
    try {
      const data = localStorage.getItem(this.templatesKey)
      if (data) {
        this.templates = JSON.parse(data)
      }
    } catch (error) {
      console.error('Error loading templates:', error)
    }
  }

  // Save templates to localStorage
  private saveTemplates(): void {
    try {
      localStorage.setItem(this.templatesKey, JSON.stringify(this.templates))
    } catch (error) {
      console.error('Error saving templates:', error)
    }
  }

  // Load celebrations from localStorage
  private loadCelebrations(): void {
    try {
      const data = localStorage.getItem(this.celebrationsKey)
      if (data) {
        this.celebrations = JSON.parse(data)
      }
    } catch (error) {
      console.error('Error loading celebrations:', error)
    }
  }

  // Save celebrations to localStorage
  private saveCelebrations(): void {
    try {
      localStorage.setItem(this.celebrationsKey, JSON.stringify(this.celebrations))
    } catch (error) {
      console.error('Error saving celebrations:', error)
    }
  }

  // Initialize default certificate templates
  private initializeDefaultTemplates(): void {
    if (this.templates.length === 0) {
      this.templates = [
        {
          id: 'classic',
          name: 'Classic Certificate',
          description: 'Traditional certificate design with elegant borders',
          template: 'classic',
          styles: {
            backgroundColor: '#ffffff',
            primaryColor: '#1f2937',
            secondaryColor: '#6b7280',
            textColor: '#1f2937',
            borderColor: '#d1d5db',
            fontFamily: 'serif',
            borderStyle: 'solid',
            borderWidth: 2,
            borderRadius: 8,
            padding: 40,
            margin: 20
          },
          isDefault: true,
          isActive: true
        },
        {
          id: 'modern',
          name: 'Modern Certificate',
          description: 'Clean, modern design with minimal styling',
          template: 'modern',
          styles: {
            backgroundColor: '#f8fafc',
            primaryColor: '#3b82f6',
            secondaryColor: '#64748b',
            textColor: '#1e293b',
            borderColor: '#e2e8f0',
            fontFamily: 'sans-serif',
            borderStyle: 'solid',
            borderWidth: 1,
            borderRadius: 12,
            padding: 32,
            margin: 16
          },
          isDefault: true,
          isActive: true
        },
        {
          id: 'elegant',
          name: 'Elegant Certificate',
          description: 'Sophisticated design with decorative elements',
          template: 'elegant',
          styles: {
            backgroundColor: '#fefefe',
            primaryColor: '#7c3aed',
            secondaryColor: '#8b5cf6',
            textColor: '#1f2937',
            borderColor: '#c4b5fd',
            fontFamily: 'serif',
            borderStyle: 'double',
            borderWidth: 3,
            borderRadius: 16,
            padding: 48,
            margin: 24
          },
          isDefault: true,
          isActive: true
        }
      ]
      this.saveTemplates()
    }
  }

  // Initialize default celebration configurations
  private initializeDefaultCelebrations(): void {
    if (this.celebrations.length === 0) {
      this.celebrations = [
        {
          id: 'path_completion',
          name: 'Path Completion Celebration',
          type: 'completion',
          trigger: {
            condition: 'path_completion',
            value: 100
          },
          animation: {
            type: 'confetti',
            duration: 3000,
            intensity: 'high'
          },
          sound: {
            enabled: true,
            file: 'completion.mp3',
            volume: 0.7
          },
          message: {
            title: 'Congratulations!',
            subtitle: 'You\'ve completed the learning path!',
            description: 'You\'ve successfully mastered all the techniques and concepts in this learning path.'
          },
          rewards: {
            points: 100,
            badges: ['path_completer'],
            achievements: ['path_master']
          },
          isActive: true
        },
        {
          id: 'module_completion',
          name: 'Module Completion Celebration',
          type: 'milestone',
          trigger: {
            condition: 'module_completion',
            value: 100
          },
          animation: {
            type: 'sparkles',
            duration: 2000,
            intensity: 'medium'
          },
          sound: {
            enabled: true,
            file: 'milestone.mp3',
            volume: 0.5
          },
          message: {
            title: 'Great Job!',
            subtitle: 'Module completed successfully!',
            description: 'You\'ve mastered this module and are ready for the next challenge.'
          },
          rewards: {
            points: 25,
            badges: ['module_completer'],
            achievements: []
          },
          isActive: true
        },
        {
          id: 'achievement_unlock',
          name: 'Achievement Unlock Celebration',
          type: 'achievement',
          trigger: {
            condition: 'achievement_unlock',
            value: true
          },
          animation: {
            type: 'stars',
            duration: 2500,
            intensity: 'high'
          },
          sound: {
            enabled: true,
            file: 'achievement.mp3',
            volume: 0.8
          },
          message: {
            title: 'Achievement Unlocked!',
            subtitle: 'You\'ve earned a new achievement!',
            description: 'Your dedication and hard work have been recognized.'
          },
          rewards: {
            points: 50,
            badges: [],
            achievements: []
          },
          isActive: true
        },
        {
          id: 'streak_milestone',
          name: 'Streak Milestone Celebration',
          type: 'streak',
          trigger: {
            condition: 'streak_days',
            value: 7
          },
          animation: {
            type: 'fireworks',
            duration: 4000,
            intensity: 'high'
          },
          sound: {
            enabled: true,
            file: 'streak.mp3',
            volume: 0.6
          },
          message: {
            title: 'Amazing Streak!',
            subtitle: 'You\'ve maintained a 7-day learning streak!',
            description: 'Your consistency and dedication are truly inspiring.'
          },
          rewards: {
            points: 75,
            badges: ['dedicated_learner'],
            achievements: ['dedicated_learner']
          },
          isActive: true
        }
      ]
      this.saveCelebrations()
    }
  }

  // Generate certificate for path completion
  generateCertificate(path: LearningPath, studentName: string): Certificate {
    const completionDate = new Date().toISOString()
    const issueDate = new Date().toISOString()
    const certificateNumber = this.generateCertificateNumber()
    const verificationCode = this.generateVerificationCode()
    
    // Get completion stats
    const stats = this.getCompletionStats()
    
    // Get achievements and badges
    const achievements = achievementService.getAchievements()
      .filter(a => a.isUnlocked)
      .map(a => a.title)
    
    const badges = achievementService.getBadges()
      .filter(b => b.isEarned)
      .map(b => b.title)

    const certificate: Certificate = {
      id: `cert_${path.id}_${Date.now()}`,
      pathId: path.id,
      pathTitle: path.title,
      studentName,
      completionDate,
      issueDate,
      certificateNumber,
      level: path.level,
      difficulty: path.difficulty,
      duration: path.duration,
      modulesCompleted: path.modules.length,
      totalModules: path.modules.length,
      score: progressService.getPathProgress(path.id),
      instructorName: path.instructor?.name,
      instructorTitle: path.instructor?.title,
      achievements,
      badges,
      verificationCode,
      isValid: true,
      expiresAt: this.calculateExpirationDate(issueDate)
    }

    this.certificates.push(certificate)
    this.saveCertificates()
    
    return certificate
  }

  // Get all certificates
  getCertificates(): Certificate[] {
    return this.certificates
  }

  // Get certificate by ID
  getCertificate(id: string): Certificate | null {
    return this.certificates.find(c => c.id === id) || null
  }

  // Get certificates by path ID
  getCertificatesByPath(pathId: number): Certificate[] {
    return this.certificates.filter(c => c.pathId === pathId)
  }

  // Verify certificate
  verifyCertificate(certificateNumber: string, verificationCode: string): boolean {
    const certificate = this.certificates.find(c => 
      c.certificateNumber === certificateNumber && 
      c.verificationCode === verificationCode
    )
    return certificate ? certificate.isValid : false
  }

  // Generate certificate number
  private generateCertificateNumber(): string {
    const timestamp = Date.now().toString(36)
    const random = Math.random().toString(36).substring(2, 8)
    return `PAT-${timestamp}-${random}`.toUpperCase()
  }

  // Generate verification code
  private generateVerificationCode(): string {
    return Math.random().toString(36).substring(2, 10).toUpperCase()
  }

  // Calculate expiration date
  private calculateExpirationDate(issueDate: string): string {
    const date = new Date(issueDate)
    date.setFullYear(date.getFullYear() + 2) // Certificates valid for 2 years
    return date.toISOString()
  }

  // Get completion stats
  getCompletionStats(): CompletionStats {
    const allProgress = progressService.getAllProgress()
    const completionStats = achievementService.getProgressVisualization([])
    
    return {
      totalPathsCompleted: Object.values(allProgress.pathProgress)
        .filter((p: any) => p.completionPercentage >= 100).length,
      totalModulesCompleted: Object.values(allProgress.moduleProgress)
        .filter((m: any) => m.status === 'completed').length,
      totalTimeSpent: completionStats.statistics.totalTimeSpent,
      averageScore: completionStats.statistics.averageScore,
      currentStreak: completionStats.streaks.current,
      longestStreak: completionStats.streaks.longest,
      achievementsUnlocked: completionStats.achievements.filter(a => a.isUnlocked).length,
      badgesEarned: completionStats.badges.filter(b => b.isEarned).length,
      level: completionStats.statistics.currentLevel,
      nextLevelProgress: completionStats.statistics.nextLevelProgress
    }
  }

  // Get certificate templates
  getTemplates(): CertificateTemplate[] {
    return this.templates
  }

  // Get active templates
  getActiveTemplates(): CertificateTemplate[] {
    return this.templates.filter(t => t.isActive)
  }

  // Get default template
  getDefaultTemplate(): CertificateTemplate | null {
    return this.templates.find(t => t.isDefault && t.isActive) || null
  }

  // Create custom template
  createTemplate(template: Omit<CertificateTemplate, 'id'>): CertificateTemplate {
    const newTemplate: CertificateTemplate = {
      ...template,
      id: `template_${Date.now()}`,
      isDefault: false
    }
    
    this.templates.push(newTemplate)
    this.saveTemplates()
    
    return newTemplate
  }

  // Update template
  updateTemplate(id: string, updates: Partial<CertificateTemplate>): boolean {
    const index = this.templates.findIndex(t => t.id === id)
    if (index !== -1) {
      this.templates[index] = { ...this.templates[index], ...updates }
      this.saveTemplates()
      return true
    }
    return false
  }

  // Delete template
  deleteTemplate(id: string): boolean {
    const index = this.templates.findIndex(t => t.id === id)
    if (index !== -1 && !this.templates[index].isDefault) {
      this.templates.splice(index, 1)
      this.saveTemplates()
      return true
    }
    return false
  }

  // Get celebration configurations
  getCelebrations(): CelebrationConfig[] {
    return this.celebrations
  }

  // Get active celebrations
  getActiveCelebrations(): CelebrationConfig[] {
    return this.celebrations.filter(c => c.isActive)
  }

  // Get celebration by type
  getCelebrationByType(type: string): CelebrationConfig | null {
    return this.celebrations.find(c => c.type === type && c.isActive) || null
  }

  // Create custom celebration
  createCelebration(celebration: Omit<CelebrationConfig, 'id'>): CelebrationConfig {
    const newCelebration: CelebrationConfig = {
      ...celebration,
      id: `celebration_${Date.now()}`
    }
    
    this.celebrations.push(newCelebration)
    this.saveCelebrations()
    
    return newCelebration
  }

  // Update celebration
  updateCelebration(id: string, updates: Partial<CelebrationConfig>): boolean {
    const index = this.celebrations.findIndex(c => c.id === id)
    if (index !== -1) {
      this.celebrations[index] = { ...this.celebrations[index], ...updates }
      this.saveCelebrations()
      return true
    }
    return false
  }

  // Delete celebration
  deleteCelebration(id: string): boolean {
    const index = this.celebrations.findIndex(c => c.id === id)
    if (index !== -1) {
      this.celebrations.splice(index, 1)
      this.saveCelebrations()
      return true
    }
    return false
  }

  // Export certificate as PDF
  exportCertificateAsPDF(certificate: Certificate, templateId?: string): Promise<Blob> {
    // This would integrate with a PDF generation library
    // For now, return a placeholder
    return Promise.resolve(new Blob(['Certificate PDF'], { type: 'application/pdf' }))
  }

  // Export certificate as image
  exportCertificateAsImage(certificate: Certificate, templateId?: string): Promise<Blob> {
    // This would integrate with canvas or image generation
    // For now, return a placeholder
    return Promise.resolve(new Blob(['Certificate Image'], { type: 'image/png' }))
  }

  // Share certificate
  shareCertificate(certificate: Certificate, platform: 'social' | 'email' | 'link'): string {
    const baseUrl = window.location.origin
    const shareUrl = `${baseUrl}/certificate/${certificate.certificateNumber}`
    
    switch (platform) {
      case 'social':
        return `https://twitter.com/intent/tweet?text=I%20just%20completed%20${encodeURIComponent(certificate.pathTitle)}%20on%20Patissier%20Practice!&url=${encodeURIComponent(shareUrl)}`
      case 'email':
        return `mailto:?subject=I%20completed%20${encodeURIComponent(certificate.pathTitle)}&body=Check%20out%20my%20certificate:%20${encodeURIComponent(shareUrl)}`
      case 'link':
        return shareUrl
      default:
        return shareUrl
    }
  }

  // Clear all certificates
  clearAllCertificates(): void {
    this.certificates = []
    this.saveCertificates()
  }

  // Export all certificates
  exportAllCertificates(): string {
    return JSON.stringify(this.certificates, null, 2)
  }

  // Import certificates
  importCertificates(data: string): boolean {
    try {
      const imported = JSON.parse(data)
      if (Array.isArray(imported)) {
        this.certificates = [...this.certificates, ...imported]
        this.saveCertificates()
        return true
      }
    } catch (error) {
      console.error('Error importing certificates:', error)
    }
    return false
  }
}

export const certificateService = new CertificateService()
export default certificateService
