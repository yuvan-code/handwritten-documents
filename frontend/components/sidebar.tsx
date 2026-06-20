'use client'

import { LayoutGrid, FileText, History, Settings } from 'lucide-react'

interface SidebarProps {
  mode: 'strict' | 'smart' | 'translate'
  onModeChange: (mode: 'strict' | 'smart' | 'translate') => void
}

export default function Sidebar({ mode, onModeChange }: SidebarProps) {
  const items = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutGrid },
    { id: 'scan', label: 'New Scan', icon: FileText },
    { id: 'history', label: 'History', icon: History },
    { id: 'settings', label: 'Settings', icon: Settings },
  ]

  return (
    <div className="bg-sidebar border-r border-sidebar-border glass-dark flex flex-col h-screen">
      {/* Logo Section */}
      <div className="p-6 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
            <span className="text-white font-bold text-lg">TS</span>
          </div>
          <div>
            <h1 className="text-white font-bold text-sm">TamilScribe</h1>
            <p className="text-xs text-muted-foreground">AI OCR</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {items.map((item) => {
          const Icon = item.icon
          return (
            <button
              key={item.id}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 hover:bg-white/10 active:bg-white/15 text-sidebar-foreground group"
            >
              <Icon className="w-5 h-5 group-hover:text-sidebar-primary transition-colors" />
              <span>{item.label}</span>
            </button>
          )
        })}
      </nav>

      {/* Mode Selection */}
      <div className="p-4 border-t border-sidebar-border">
        <p className="text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-wider">
          Extract Mode
        </p>
        <div className="space-y-2">
          {(['strict', 'smart', 'translate'] as const).map((m) => (
            <button
              key={m}
              onClick={() => onModeChange(m)}
              className={`w-full px-3 py-2 rounded-md text-xs font-medium capitalize transition-all duration-200 ${
                mode === m
                  ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-lg shadow-blue-500/20'
                  : 'bg-white/5 text-sidebar-foreground hover:bg-white/10'
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-sidebar-border">
        <p className="text-xs text-muted-foreground text-center">v1.0.0</p>
      </div>
    </div>
  )
}
