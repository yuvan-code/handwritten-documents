'use client'

import { Moon, Sun, Zap } from 'lucide-react'

interface TopControlsProps {
  mode: 'strict' | 'smart' | 'translate'
  isDarkMode: boolean
  onModeChange: (mode: 'strict' | 'smart' | 'translate') => void
  onToggleDarkMode: () => void
  onExtractText: () => void
  isProcessing: boolean
}

export default function TopControls({
  mode,
  isDarkMode,
  onModeChange,
  onToggleDarkMode,
  onExtractText,
  isProcessing,
}: TopControlsProps) {
  return (
    <div className="border-b border-border glass-dark px-6 py-4 flex items-center justify-between">
      {/* Left: Mode Selector */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground font-medium">Mode:</span>
        <div className="flex gap-2 p-1 bg-white/5 rounded-lg">
          {(['strict', 'smart', 'translate'] as const).map((m) => (
            <button
              key={m}
              onClick={() => onModeChange(m)}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold capitalize transition-all duration-200 ${
                mode === m
                  ? 'bg-primary text-primary-foreground shadow-lg shadow-blue-500/30'
                  : 'text-foreground hover:bg-white/10'
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-3">
        {/* Extract Text Button */}
        <button
          onClick={onExtractText}
          disabled={isProcessing}
          className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-all duration-200 hover:shadow-lg hover:shadow-blue-500/30 active:scale-95"
        >
          {isProcessing ? (
            <>
              <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
              <span>Extracting...</span>
            </>
          ) : (
            <>
              <Zap className="w-4 h-4" />
              <span>Extract Text</span>
            </>
          )}
        </button>

        {/* Theme Toggle */}
        <button
          onClick={onToggleDarkMode}
          className="p-2.5 rounded-lg bg-white/10 hover:bg-white/20 text-foreground transition-all duration-200 hover:shadow-lg"
          title="Toggle theme"
        >
          {isDarkMode ? (
            <Sun className="w-5 h-5" />
          ) : (
            <Moon className="w-5 h-5" />
          )}
        </button>
      </div>
    </div>
  )
}
