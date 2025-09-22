"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Trophy, 
  Award, 
  Star, 
  Zap, 
  Crown, 
  Medal, 
  Shield, 
  Gem, 
  Target, 
  CheckCircle, 
  TrendingUp, 
  Flame, 
  Sparkles, 
  PartyPopper, 
  Gift, 
  Heart, 
  ThumbsUp, 
  Music, 
  Volume2, 
  VolumeX, 
  X, 
  Play, 
  Pause, 
  RotateCcw, 
  Share2, 
  Download, 
  Bookmark, 
  Eye, 
  EyeOff
} from "lucide-react"
import { LearningPath, LearningModule } from "@/lib/types"
import { certificateService, CelebrationConfig } from "@/lib/services/certificateService"
import { achievementService } from "@/lib/services/achievementService"
import { cn } from "@/lib/utils"

interface CelebrationUIProps {
  type: 'path_completion' | 'module_completion' | 'achievement_unlock' | 'streak_milestone'
  path?: LearningPath
  module?: LearningModule
  achievement?: string
  onClose?: () => void
  onContinue?: () => void
  className?: string
}

export function CelebrationUI({ 
  type, 
  path, 
  module, 
  achievement,
  onClose,
  onContinue,
  className 
}: CelebrationUIProps) {
  const [celebration, setCelebration] = useState<CelebrationConfig | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [showParticles, setShowParticles] = useState(true)
  const [animationStep, setAnimationStep] = useState(0)
  const audioRef = useRef<HTMLAudioElement>(null)
  const particleRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    loadCelebration()
  }, [type])

  useEffect(() => {
    if (celebration && celebration.sound.enabled && !isMuted) {
      playSound()
    }
  }, [celebration, isMuted])

  useEffect(() => {
    if (showParticles) {
      startParticleAnimation()
    }
  }, [showParticles])

  const loadCelebration = async () => {
    const celebrationConfig = certificateService.getCelebrationByType(type)
    if (celebrationConfig) {
      setCelebration(celebrationConfig)
    }
  }

  const playSound = () => {
    if (audioRef.current) {
      audioRef.current.volume = celebration?.sound.volume || 0.7
      audioRef.current.play().catch(console.error)
      setIsPlaying(true)
    }
  }

  const stopSound = () => {
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
      setIsPlaying(false)
    }
  }

  const toggleMute = () => {
    setIsMuted(!isMuted)
    if (isMuted) {
      playSound()
    } else {
      stopSound()
    }
  }

  const startParticleAnimation = () => {
    if (!particleRef.current) return

    const particles = particleRef.current
    const particleCount = celebration?.animation.intensity === 'high' ? 100 : 
                         celebration?.animation.intensity === 'medium' ? 50 : 25

    // Clear existing particles
    particles.innerHTML = ''

    // Create particles based on animation type
    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement('div')
      particle.className = 'absolute pointer-events-none'
      
      switch (celebration?.animation.type) {
        case 'confetti':
          particle.innerHTML = '🎉'
          break
        case 'fireworks':
          particle.innerHTML = '✨'
          break
        case 'sparkles':
          particle.innerHTML = '⭐'
          break
        case 'balloons':
          particle.innerHTML = '🎈'
          break
        case 'stars':
          particle.innerHTML = '🌟'
          break
        default:
          particle.innerHTML = '✨'
      }

      // Random positioning
      particle.style.left = Math.random() * 100 + '%'
      particle.style.top = Math.random() * 100 + '%'
      particle.style.fontSize = (Math.random() * 20 + 10) + 'px'
      particle.style.animationDelay = Math.random() * 2 + 's'
      particle.style.animationDuration = (celebration?.animation.duration || 3000) + 'ms'
      particle.style.animationName = 'celebrate'
      particle.style.animationIterationCount = '1'
      particle.style.animationFillMode = 'forwards'

      particles.appendChild(particle)
    }

    // Remove particles after animation
    setTimeout(() => {
      particles.innerHTML = ''
    }, celebration?.animation.duration || 3000)
  }

  const getIcon = () => {
    switch (type) {
      case 'path_completion':
        return <Trophy className="h-16 w-16 text-yellow-500" />
      case 'module_completion':
        return <Award className="h-16 w-16 text-blue-500" />
      case 'achievement_unlock':
        return <Star className="h-16 w-16 text-purple-500" />
      case 'streak_milestone':
        return <Flame className="h-16 w-16 text-orange-500" />
      default:
        return <Trophy className="h-16 w-16 text-yellow-500" />
    }
  }

  const getBackgroundColor = () => {
    switch (type) {
      case 'path_completion':
        return 'bg-gradient-to-br from-yellow-50 to-orange-50'
      case 'module_completion':
        return 'bg-gradient-to-br from-blue-50 to-indigo-50'
      case 'achievement_unlock':
        return 'bg-gradient-to-br from-purple-50 to-pink-50'
      case 'streak_milestone':
        return 'bg-gradient-to-br from-orange-50 to-red-50'
      default:
        return 'bg-gradient-to-br from-yellow-50 to-orange-50'
    }
  }

  const getRewardIcon = (reward: string) => {
    switch (reward) {
      case 'points':
        return <Star className="h-4 w-4" />
      case 'badges':
        return <Medal className="h-4 w-4" />
      case 'achievements':
        return <Trophy className="h-4 w-4" />
      default:
        return <Gift className="h-4 w-4" />
    }
  }

  if (!celebration) {
    return (
      <div className={cn("flex items-center justify-center p-8", className)}>
        <div className="flex items-center gap-2">
          <Trophy className="h-4 w-4" />
          <span>Loading celebration...</span>
        </div>
      </div>
    )
  }

  return (
    <div className={cn("fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4", className)}>
      {/* Audio Element */}
      <audio
        ref={audioRef}
        src={`/sounds/${celebration.sound.file}`}
        onEnded={() => setIsPlaying(false)}
        onError={() => console.warn('Could not load celebration sound')}
      />

      {/* Particle Container */}
      <div
        ref={particleRef}
        className="absolute inset-0 pointer-events-none"
        style={{ animation: showParticles ? 'none' : 'none' }}
      />

      {/* Celebration Modal */}
      <Card className="relative w-full max-w-2xl mx-auto animate-in zoom-in-95 duration-300">
        <CardContent className="p-0">
          <div className={cn("relative overflow-hidden rounded-lg", getBackgroundColor())}>
            {/* Close Button */}
            {onClose && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute top-4 right-4 z-10"
                onClick={onClose}
              >
                <X className="h-4 w-4" />
              </Button>
            )}

            {/* Sound Controls */}
            <div className="absolute top-4 left-4 z-10">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleMute}
              >
                {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
              </Button>
            </div>

            {/* Main Content */}
            <div className="p-8 text-center">
              {/* Icon */}
              <div className="flex items-center justify-center mb-6">
                <div className="relative">
                  {getIcon()}
                  <div className="absolute -top-2 -right-2">
                    <Sparkles className="h-6 w-6 text-yellow-400 animate-pulse" />
                  </div>
                </div>
              </div>

              {/* Title */}
              <h1 className="text-4xl font-bold mb-4 text-gray-900">
                {celebration.message.title}
              </h1>

              {/* Subtitle */}
              <h2 className="text-xl font-semibold mb-4 text-gray-700">
                {celebration.message.subtitle}
              </h2>

              {/* Description */}
              <p className="text-lg text-gray-600 mb-8 max-w-md mx-auto">
                {celebration.message.description}
              </p>

              {/* Specific Information */}
              {type === 'path_completion' && path && (
                <div className="mb-8">
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">{path.title}</h3>
                  <div className="flex items-center justify-center gap-4">
                    <Badge className="bg-blue-100 text-blue-800">{path.level}</Badge>
                    <Badge className="bg-green-100 text-green-800">{path.difficulty}</Badge>
                    <Badge className="bg-purple-100 text-purple-800">{path.duration}</Badge>
                  </div>
                </div>
              )}

              {type === 'module_completion' && module && (
                <div className="mb-8">
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">{module.title}</h3>
                  <div className="flex items-center justify-center gap-4">
                    <Badge className="bg-blue-100 text-blue-800">{module.type}</Badge>
                    <Badge className="bg-green-100 text-green-800">{module.estimatedMinutes} min</Badge>
                  </div>
                </div>
              )}

              {type === 'achievement_unlock' && achievement && (
                <div className="mb-8">
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">{achievement}</h3>
                  <div className="flex items-center justify-center gap-2">
                    <Trophy className="h-5 w-5 text-yellow-500" />
                    <span className="text-lg font-semibold text-gray-700">Achievement Unlocked!</span>
                  </div>
                </div>
              )}

              {type === 'streak_milestone' && (
                <div className="mb-8">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Flame className="h-8 w-8 text-orange-500" />
                    <span className="text-3xl font-bold text-orange-600">7</span>
                    <span className="text-xl font-semibold text-gray-700">Day Streak!</span>
                  </div>
                  <p className="text-lg text-gray-600">Your consistency is amazing!</p>
                </div>
              )}

              {/* Rewards */}
              {celebration.rewards && (
                <div className="mb-8">
                  <h4 className="text-lg font-semibold text-gray-800 mb-4">Rewards Earned</h4>
                  <div className="flex items-center justify-center gap-6">
                    {celebration.rewards.points > 0 && (
                      <div className="flex items-center gap-2">
                        <Star className="h-5 w-5 text-yellow-500" />
                        <span className="text-lg font-semibold text-gray-700">
                          +{celebration.rewards.points} Points
                        </span>
                      </div>
                    )}
                    {celebration.rewards.badges.length > 0 && (
                      <div className="flex items-center gap-2">
                        <Medal className="h-5 w-5 text-blue-500" />
                        <span className="text-lg font-semibold text-gray-700">
                          {celebration.rewards.badges.length} Badge{celebration.rewards.badges.length > 1 ? 's' : ''}
                        </span>
                      </div>
                    )}
                    {celebration.rewards.achievements.length > 0 && (
                      <div className="flex items-center gap-2">
                        <Trophy className="h-5 w-5 text-purple-500" />
                        <span className="text-lg font-semibold text-gray-700">
                          {celebration.rewards.achievements.length} Achievement{celebration.rewards.achievements.length > 1 ? 's' : ''}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-center gap-4">
                {onContinue && (
                  <Button size="lg" onClick={onContinue}>
                    <Play className="h-5 w-5 mr-2" />
                    Continue Learning
                  </Button>
                )}
                <Button variant="outline" size="lg" onClick={() => setShowParticles(!showParticles)}>
                  {showParticles ? <EyeOff className="h-5 w-5 mr-2" /> : <Eye className="h-5 w-5 mr-2" />}
                  {showParticles ? 'Hide Effects' : 'Show Effects'}
                </Button>
                <Button variant="outline" size="lg" onClick={() => startParticleAnimation()}>
                  <RotateCcw className="h-5 w-5 mr-2" />
                  Replay
                </Button>
              </div>
            </div>

            {/* Decorative Elements */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
              <div className="absolute top-4 left-4 text-6xl opacity-20">🎉</div>
              <div className="absolute top-4 right-4 text-6xl opacity-20">✨</div>
              <div className="absolute bottom-4 left-4 text-6xl opacity-20">🎈</div>
              <div className="absolute bottom-4 right-4 text-6xl opacity-20">🌟</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* CSS Animation */}
      <style jsx>{`
        @keyframes celebrate {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(-100vh) rotate(360deg);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  )
}

export default CelebrationUI
