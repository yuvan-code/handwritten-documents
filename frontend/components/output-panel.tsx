'use client'

import { useState, useEffect } from 'react'
import { Copy, Download, AlertCircle, Check } from 'lucide-react'

interface OutputPanelProps {
  extractedText: string
  onDownload: (format: 'txt' | 'pdf') => void
  isProcessing: boolean
}

export default function OutputPanel({
  extractedText,
  onDownload,
  isProcessing,
}: OutputPanelProps) {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)
  const [displayedText, setDisplayedText] = useState('')
  const [highlightedWords] = useState<number[]>([2, 5, 8]) // Example uncertain words

  // Typing animation effect
  useEffect(() => {
    if (!isProcessing && extractedText && displayedText.length < extractedText.length) {
      const timer = setTimeout(() => {
        setDisplayedText((prev) => extractedText.slice(0, prev.length + 1))
      }, 30)
      return () => clearTimeout(timer)
    }
  }, [displayedText, extractedText, isProcessing])

  // Reset on new extraction
  useEffect(() => {
    if (!isProcessing && extractedText) {
      setDisplayedText('')
    }
  }, [extractedText, isProcessing])

  const words = displayedText.split(' ')

  const handleCopy = async (index?: number) => {
    const textToCopy = index !== undefined ? words[index] : displayedText
    await navigator.clipboard.writeText(textToCopy)
    setCopiedIndex(index ?? -1)
    setTimeout(() => setCopiedIndex(null), 2000)
  }

  const handleDownload = (format: 'txt' | 'pdf') => {
    if (format === 'txt') {
      const element = document.createElement('a')
      element.setAttribute(
        'href',
        'data:text/plain;charset=utf-8,' + encodeURIComponent(displayedText)
      )
      element.setAttribute('download', 'extracted-text.txt')
      element.style.display = 'none'
      document.body.appendChild(element)
      element.click()
      document.body.removeChild(element)
    } else {
      onDownload('pdf')
    }
  }

  return (
    <div className="flex flex-col gap-4 h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 glass rounded-xl">
        <h3 className="font-semibold text-foreground">Extracted Text</h3>
        <button
          onClick={() => handleCopy()}
          disabled={!displayedText}
          className="flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed text-foreground transition-all duration-200 active:scale-95"
        >
          {copiedIndex === -1 ? (
            <>
              <Check className="w-4 h-4 text-green-500" />
              <span>Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" />
              <span>Copy All</span>
            </>
          )}
        </button>
      </div>

      {/* Text Output Area */}
      <div className="flex-1 glass rounded-2xl p-6 overflow-hidden flex flex-col">
        {isProcessing && !displayedText && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <div className="w-12 h-12 rounded-full border-4 border-white/20 border-t-blue-500 animate-spin" />
              </div>
              <div>
                <p className="text-foreground font-semibold">Processing image...</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Running AI text extraction
                </p>
              </div>
            </div>
          </div>
        )}

        {!isProcessing && !displayedText && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="p-4 rounded-full bg-white/10 w-fit mx-auto mb-4">
                <AlertCircle className="w-8 h-8 text-muted-foreground" />
              </div>
              <p className="text-foreground font-medium">No text extracted yet</p>
              <p className="text-sm text-muted-foreground mt-1">
                Upload an image and click "Extract Text" to begin
              </p>
            </div>
          </div>
        )}

        {displayedText && (
          <>
            {/* Text Display with Highlighting */}
            <div className="flex-1 overflow-y-auto mb-4 pr-3">
              <div className="flex flex-wrap gap-2 text-base leading-relaxed font-medium">
                {words.map((word, idx) => (
                  <div
                    key={idx}
                    className={`px-2.5 py-1 rounded-md transition-all duration-200 cursor-pointer hover:bg-white/10 ${
                      highlightedWords.includes(idx)
                        ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30'
                        : 'text-foreground'
                    }`}
                    onClick={() => handleCopy(idx)}
                    title="Click to copy"
                  >
                    {word}
                  </div>
                ))}
              </div>
            </div>

            {/* Stats */}
            <div className="text-xs text-muted-foreground py-2 border-t border-white/10 mb-4">
              <p>
                <span className="text-foreground font-semibold">{words.length}</span> words •{' '}
                <span className="text-foreground font-semibold">{displayedText.length}</span> characters •{' '}
                <span className="text-yellow-300">{highlightedWords.length}</span> uncertain
              </p>
            </div>
          </>
        )}
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => handleDownload('txt')}
          disabled={!displayedText}
          className="flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed text-foreground font-medium transition-all duration-200 hover:shadow-lg active:scale-95"
        >
          <Download className="w-4 h-4" />
          <span>Download TXT</span>
        </button>

        <button
          onClick={() => handleDownload('pdf')}
          disabled={!displayedText}
          className="flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed text-foreground font-medium transition-all duration-200 hover:shadow-lg active:scale-95"
        >
          <Download className="w-4 h-4" />
          <span>Download PDF</span>
        </button>
      </div>
    </div>
  )
}
