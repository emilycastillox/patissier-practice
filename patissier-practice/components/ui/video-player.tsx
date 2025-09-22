"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  Maximize, 
  Minimize, 
  RotateCcw,
  Settings,
  SkipBack,
  SkipForward
} from "lucide-react"
import { cn } from "@/lib/utils"

interface VideoPlayerProps {
  src: string
  poster?: string
  title?: string
  className?: string
  autoPlay?: boolean
  muted?: boolean
  onProgress?: (currentTime: number, duration: number) => void
  onComplete?: () => void
  onPlay?: () => void
  onPause?: () => void
}

export function VideoPlayer({
  src,
  poster,
  title,
  className,
  autoPlay = false,
  muted = false,
  onProgress,
  onComplete,
  onPlay,
  onPause,
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(muted)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showControls, setShowControls] = useState(true)
  const [isLoading, setIsLoading] = useState(true)
  const [playbackRate, setPlaybackRate] = useState(1)
  const [showSettings, setShowSettings] = useState(false)

  // Update current time and progress
  const updateTime = useCallback(() => {
    if (videoRef.current) {
      const current = videoRef.current.currentTime
      const total = videoRef.current.duration
      setCurrentTime(current)
      onProgress?.(current, total)
    }
  }, [onProgress])

  // Handle play/pause
  const togglePlay = useCallback(() => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
        setIsPlaying(false)
        onPause?.()
      } else {
        videoRef.current.play()
        setIsPlaying(true)
        onPlay?.()
      }
    }
  }, [isPlaying, onPlay, onPause])

  // Handle volume change
  const handleVolumeChange = useCallback((newVolume: number) => {
    if (videoRef.current) {
      videoRef.current.volume = newVolume
      setVolume(newVolume)
      setIsMuted(newVolume === 0)
    }
  }, [])

  // Handle mute toggle
  const toggleMute = useCallback(() => {
    if (videoRef.current) {
      if (isMuted) {
        videoRef.current.volume = volume
        setIsMuted(false)
      } else {
        videoRef.current.volume = 0
        setIsMuted(true)
      }
    }
  }, [isMuted, volume])

  // Handle seek
  const handleSeek = useCallback((time: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = time
      setCurrentTime(time)
    }
  }, [])

  // Handle fullscreen
  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen()
      setIsFullscreen(true)
    } else {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }, [])

  // Handle playback rate change
  const handlePlaybackRateChange = useCallback((rate: number) => {
    if (videoRef.current) {
      videoRef.current.playbackRate = rate
      setPlaybackRate(rate)
    }
  }, [])

  // Skip forward/backward
  const skip = useCallback((seconds: number) => {
    if (videoRef.current) {
      const newTime = Math.max(0, Math.min(duration, currentTime + seconds))
      handleSeek(newTime)
    }
  }, [currentTime, duration, handleSeek])

  // Format time
  const formatTime = useCallback((time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }, [])

  // Event handlers
  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const handleLoadedMetadata = () => {
      setDuration(video.duration)
      setIsLoading(false)
    }

    const handleTimeUpdate = () => {
      updateTime()
    }

    const handleEnded = () => {
      setIsPlaying(false)
      onComplete?.()
    }

    const handlePlay = () => {
      setIsPlaying(true)
      onPlay?.()
    }

    const handlePause = () => {
      setIsPlaying(false)
      onPause?.()
    }

    const handleVolumeChange = () => {
      setVolume(video.volume)
      setIsMuted(video.muted)
    }

    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }

    video.addEventListener('loadedmetadata', handleLoadedMetadata)
    video.addEventListener('timeupdate', handleTimeUpdate)
    video.addEventListener('ended', handleEnded)
    video.addEventListener('play', handlePlay)
    video.addEventListener('pause', handlePause)
    video.addEventListener('volumechange', handleVolumeChange)
    document.addEventListener('fullscreenchange', handleFullscreenChange)

    return () => {
      video.removeEventListener('loadedmetadata', handleLoadedMetadata)
      video.removeEventListener('timeupdate', handleTimeUpdate)
      video.removeEventListener('ended', handleEnded)
      video.removeEventListener('play', handlePlay)
      video.removeEventListener('pause', handlePause)
      video.removeEventListener('volumechange', handleVolumeChange)
      document.removeEventListener('fullscreenchange', handleFullscreenChange)
    }
  }, [updateTime, onComplete, onPlay, onPause])

  // Auto-play effect
  useEffect(() => {
    if (autoPlay && videoRef.current) {
      videoRef.current.play()
    }
  }, [autoPlay])

  // Show/hide controls on mouse movement
  useEffect(() => {
    let timeout: NodeJS.Timeout
    const handleMouseMove = () => {
      setShowControls(true)
      clearTimeout(timeout)
      timeout = setTimeout(() => setShowControls(false), 3000)
    }

    const container = containerRef.current
    if (container) {
      container.addEventListener('mousemove', handleMouseMove)
      return () => {
        container.removeEventListener('mousemove', handleMouseMove)
        clearTimeout(timeout)
      }
    }
  }, [])

  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative group bg-black rounded-lg overflow-hidden",
        isFullscreen && "fixed inset-0 z-50 rounded-none",
        className
      )}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
    >
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        className="w-full h-full object-cover"
        preload="metadata"
        playsInline
      />

      {/* Loading indicator */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* Controls overlay */}
      <div
        className={cn(
          "absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent transition-opacity duration-300",
          showControls ? "opacity-100" : "opacity-0"
        )}
      >
        {/* Top controls */}
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
          {title && (
            <h3 className="text-white font-medium text-lg truncate max-w-md">
              {title}
            </h3>
          )}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSettings(!showSettings)}
              className="text-white hover:bg-white/20"
            >
              <Settings className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleFullscreen}
              className="text-white hover:bg-white/20"
            >
              {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {/* Settings panel */}
        {showSettings && (
          <div className="absolute top-12 right-4 bg-black/80 backdrop-blur-sm rounded-lg p-4 min-w-48">
            <div className="space-y-3">
              <div>
                <label className="text-white text-sm font-medium block mb-2">
                  Playback Speed
                </label>
                <div className="flex gap-2">
                  {[0.5, 0.75, 1, 1.25, 1.5, 2].map((rate) => (
                    <Button
                      key={rate}
                      variant={playbackRate === rate ? "default" : "outline"}
                      size="sm"
                      onClick={() => handlePlaybackRateChange(rate)}
                      className="text-xs"
                    >
                      {rate}x
                    </Button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-white text-sm font-medium block mb-2">
                  Volume
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={isMuted ? 0 : volume}
                  onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                  className="w-full"
                />
              </div>
            </div>
          </div>
        )}

        {/* Center play button */}
        {!isPlaying && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Button
              size="lg"
              onClick={togglePlay}
              className="w-16 h-16 rounded-full bg-white/20 hover:bg-white/30 text-white"
            >
              <Play className="h-8 w-8 ml-1" />
            </Button>
          </div>
        )}

        {/* Bottom controls */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          {/* Progress bar */}
          <div className="mb-4">
            <Progress
              value={progressPercentage}
              className="h-1 cursor-pointer"
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect()
                const clickX = e.clientX - rect.left
                const percentage = clickX / rect.width
                handleSeek(percentage * duration)
              }}
            />
          </div>

          {/* Control buttons */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={togglePlay}
                className="text-white hover:bg-white/20"
              >
                {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => skip(-10)}
                className="text-white hover:bg-white/20"
              >
                <SkipBack className="h-4 w-4" />
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => skip(10)}
                className="text-white hover:bg-white/20"
              >
                <SkipForward className="h-4 w-4" />
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={toggleMute}
                className="text-white hover:bg-white/20"
              >
                {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
              </Button>

              <div className="text-white text-sm font-mono">
                {formatTime(currentTime)} / {formatTime(duration)}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleSeek(0)}
                className="text-white hover:bg-white/20"
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default VideoPlayer
