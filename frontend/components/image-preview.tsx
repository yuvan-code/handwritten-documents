'use client'

import { useState } from 'react'
import { ZoomIn, ZoomOut, RotateCcw, Crop } from 'lucide-react'

interface ImagePreviewProps {
  imageSrc: string
}

export default function ImagePreview({ imageSrc }: ImagePreviewProps) {
  const [zoom, setZoom] = useState(1)
  const [rotation, setRotation] = useState(0)

  const handleZoomIn = () => setZoom((z) => Math.min(z + 0.2, 3))
  const handleZoomOut = () => setZoom((z) => Math.max(z - 0.2, 0.5))
  const handleRotate = () => setRotation((r) => (r + 90) % 360)

  return (
    <div className="flex flex-col gap-4 h-full">
      {/* Image Preview Area */}
      <div className="flex-1 glass rounded-2xl overflow-hidden flex items-center justify-center relative">
        {/* Background Grid */}
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage:
              'linear-gradient(0deg, transparent 24%, rgba(255, 255, 255, 0.1) 25%, rgba(255, 255, 255, 0.1) 26%, transparent 27%, transparent 74%, rgba(255, 255, 255, 0.1) 75%, rgba(255, 255, 255, 0.1) 76%, transparent 77%, transparent), linear-gradient(90deg, transparent 24%, rgba(255, 255, 255, 0.1) 25%, rgba(255, 255, 255, 0.1) 26%, transparent 27%, transparent 74%, rgba(255, 255, 255, 0.1) 75%, rgba(255, 255, 255, 0.1) 76%, transparent 77%, transparent)',
            backgroundSize: '50px 50px',
          }}
        />

        {/* Image */}
        <div className="relative w-full h-full flex items-center justify-center overflow-auto">
          <img
            src={imageSrc}
            alt="Preview"
            style={{
              transform: `scale(${zoom}) rotate(${rotation}deg)`,
              transition: 'transform 0.3s ease-out',
            }}
            className="max-h-full max-w-full object-contain"
          />
        </div>

        {/* Overlay Highlight (Example) */}
        <div className="absolute inset-0 pointer-events-none border-4 border-blue-500/20 rounded-lg" />
      </div>

      {/* Controls */}
      <div className="glass rounded-xl p-4">
        <div className="grid grid-cols-4 gap-2">
          <button
            onClick={handleZoomIn}
            title="Zoom in"
            className="p-3 rounded-lg bg-white/10 hover:bg-white/20 text-foreground transition-all duration-200 flex items-center justify-center hover:shadow-lg active:scale-95"
          >
            <ZoomIn className="w-5 h-5" />
          </button>

          <button
            onClick={handleZoomOut}
            title="Zoom out"
            className="p-3 rounded-lg bg-white/10 hover:bg-white/20 text-foreground transition-all duration-200 flex items-center justify-center hover:shadow-lg active:scale-95"
          >
            <ZoomOut className="w-5 h-5" />
          </button>

          <button
            onClick={handleRotate}
            title="Rotate 90°"
            className="p-3 rounded-lg bg-white/10 hover:bg-white/20 text-foreground transition-all duration-200 flex items-center justify-center hover:shadow-lg active:scale-95"
          >
            <RotateCcw className="w-5 h-5" />
          </button>

          <button
            title="Crop"
            className="p-3 rounded-lg bg-white/10 hover:bg-white/20 text-foreground transition-all duration-200 flex items-center justify-center hover:shadow-lg active:scale-95"
          >
            <Crop className="w-5 h-5" />
          </button>
        </div>

        {/* Zoom Level Display */}
        <div className="text-center mt-3">
          <p className="text-xs text-muted-foreground">
            Zoom: <span className="text-foreground font-semibold">{Math.round(zoom * 100)}%</span> |
            Rotation: <span className="text-foreground font-semibold">{rotation}°</span>
          </p>
        </div>
      </div>

      {/* Info */}
      <div className="glass rounded-xl p-4">
        <p className="text-xs text-muted-foreground">
          Image loaded and ready for text extraction. Use the controls above to adjust the view for optimal OCR results.
        </p>
      </div>
    </div>
  )
}
