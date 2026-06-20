'use client'

import { useState, useRef } from 'react'
import { Upload, Image } from 'lucide-react'

interface UploadPanelProps {
  onImageUpload: (imageSrc: string) => void
}

export default function UploadPanel({ onImageUpload }: UploadPanelProps) {
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const files = e.dataTransfer.files
    if (files && files[0]) {
      processFile(files[0])
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.currentTarget.files
    if (files && files[0]) {
      processFile(files[0])
    }
  }

  const processFile = (file: File) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      if (e.target?.result) {
        onImageUpload(e.target.result as string)
      }
    }
    reader.readAsDataURL(file)
  }

  return (
    <div className="flex flex-col gap-6 h-full">
      {/* Upload Area */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative flex-1 rounded-2xl border-2 border-dashed transition-all duration-300 flex items-center justify-center overflow-hidden group ${
          isDragging
            ? 'border-blue-500 bg-blue-500/10'
            : 'border-border bg-white/5 hover:border-blue-400 hover:bg-blue-500/5'
        }`}
      >
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 to-indigo-600/0 group-hover:from-blue-500/5 group-hover:to-indigo-600/5 transition-all duration-300" />

        {/* Content */}
        <div className="relative flex flex-col items-center justify-center gap-4 p-8 text-center">
          <div className="p-4 rounded-full bg-white/10 group-hover:bg-white/20 transition-all duration-300">
            <Upload
              className={`w-8 h-8 transition-all duration-300 ${
                isDragging ? 'text-blue-500 scale-110' : 'text-muted-foreground group-hover:text-blue-400'
              }`}
            />
          </div>

          <div>
            <h3 className="text-lg font-semibold text-foreground mb-1">
              Drag & drop your image
            </h3>
            <p className="text-sm text-muted-foreground">
              or click the button below to browse
            </p>
          </div>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-medium transition-all duration-200 hover:shadow-lg hover:shadow-blue-500/30 active:scale-95 mt-2"
          >
            Select Image
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />

          <p className="text-xs text-muted-foreground mt-2">
            Supported: JPG, PNG, GIF, WebP (Max 10MB)
          </p>
        </div>
      </div>

      {/* Help Section */}
      <div className="glass rounded-xl p-4 space-y-3">
        <h4 className="font-semibold text-sm text-foreground flex items-center gap-2">
          <Image className="w-4 h-4 text-blue-500" />
          Tips for best results
        </h4>
        <ul className="text-xs text-muted-foreground space-y-2">
          <li>✓ Ensure the image has clear text</li>
          <li>✓ Good lighting and contrast</li>
          <li>✓ Straight angle, not tilted</li>
          <li>✓ Minimum 300x300 pixels</li>
        </ul>
      </div>
    </div>
  )
}
