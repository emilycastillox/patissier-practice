"use client"

import React, { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, X, AlertCircle } from 'lucide-react'
import { Button } from './button'
import { cn } from '@/lib/utils'

interface ImageUploadProps {
  onImageSelect: (file: File) => void
  onImageRemove: () => void
  selectedImage?: File | null
  maxSize?: number // in MB
  acceptedTypes?: string[]
  className?: string
}

export function ImageUpload({
  onImageSelect,
  onImageRemove,
  selectedImage,
  maxSize = 10,
  acceptedTypes = ['image/jpeg', 'image/png', 'image/webp'],
  className
}: ImageUploadProps) {
  const [error, setError] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)

  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
    setError(null)
    
    if (rejectedFiles.length > 0) {
      const rejection = rejectedFiles[0]
      if (rejection.errors[0]?.code === 'file-too-large') {
        setError(`File is too large. Maximum size is ${maxSize}MB.`)
      } else if (rejection.errors[0]?.code === 'file-invalid-type') {
        setError(`Invalid file type. Please upload ${acceptedTypes.join(', ')} files.`)
      } else {
        setError('File upload failed. Please try again.')
      }
      return
    }

    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0]
      setIsUploading(true)
      
      // Simulate upload delay
      setTimeout(() => {
        onImageSelect(file)
        setIsUploading(false)
      }, 1000)
    }
  }, [onImageSelect, maxSize, acceptedTypes])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: acceptedTypes.reduce((acc, type) => ({ ...acc, [type]: [] }), {}),
    maxSize: maxSize * 1024 * 1024, // Convert MB to bytes
    multiple: false
  })

  const handleFileSelect = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = acceptedTypes.join(',')
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        onDrop([file], [])
      }
    }
    input.click()
  }

  const handleRemove = () => {
    setError(null)
    onImageRemove()
  }

  if (selectedImage) {
    return (
      <div className={cn("space-y-4", className)}>
        <div className="relative group">
          <img
            src={URL.createObjectURL(selectedImage)}
            alt="Selected image"
            className="w-full h-64 object-cover rounded-lg border"
          />
          <Button
            variant="destructive"
            size="sm"
            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={handleRemove}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>{selectedImage.name}</span>
          <span>{(selectedImage.size / 1024 / 1024).toFixed(2)} MB</span>
        </div>
      </div>
    )
  }

  return (
    <div className={cn("space-y-4", className)}>
      <div
        {...getRootProps()}
        className={cn(
          "border-2 border-dashed rounded-lg p-8 text-center transition-all cursor-pointer",
          isDragActive ? "border-primary bg-primary/5" : "border-muted-foreground/30 hover:border-primary/50",
          error && "border-destructive bg-destructive/5"
        )}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center">
            {isUploading ? (
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            ) : (
              <Upload className="h-8 w-8 text-muted-foreground" />
            )}
          </div>
          
          <div>
            <h3 className="text-lg font-medium mb-2">
              {isUploading ? "Uploading..." : "Upload Your Creation"}
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              {isDragActive 
                ? "Drop the image here" 
                : "Drag and drop your image here, or click to browse"
              }
            </p>
          </div>

          <Button 
            onClick={handleFileSelect}
            disabled={isUploading}
            className="w-full max-w-xs"
          >
            <Upload className="mr-2 h-4 w-4" />
            Choose File
          </Button>

          <p className="text-xs text-muted-foreground">
            Supports {acceptedTypes.join(', ')} up to {maxSize}MB
          </p>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-sm text-destructive">
          <AlertCircle className="h-4 w-4" />
          {error}
        </div>
      )}
    </div>
  )
}