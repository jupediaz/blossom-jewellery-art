'use client'

import { Loader2 } from 'lucide-react'
import type { ScenePreset } from '@/lib/ai/types'

interface PromptInputProps {
  value: string
  onChange: (value: string) => void
  presets?: ScenePreset[]
  isProcessing?: boolean
  processingStatus?: string
  placeholder?: string
  rows?: number
}

export function PromptInput({
  value,
  onChange,
  presets,
  isProcessing,
  processingStatus,
  placeholder = 'Describe the image you want to create...',
  rows = 3,
}: PromptInputProps) {
  return (
    <div className="space-y-2">
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        placeholder={placeholder}
        disabled={isProcessing}
        className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-charcoal focus:outline-none focus:ring-1 focus:ring-charcoal disabled:bg-gray-100 disabled:text-gray-500"
      />

      {presets && presets.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {presets.map((preset) => (
            <button
              key={preset.id}
              onClick={() => {
                const separator = value.trim() ? '. ' : ''
                onChange(value.trim() + separator + preset.promptSuffix)
              }}
              disabled={isProcessing}
              className="rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-medium text-gray-600 hover:border-purple-300 hover:bg-purple-50 hover:text-purple-700 disabled:opacity-50"
            >
              {preset.label}
            </button>
          ))}
        </div>
      )}

      {isProcessing && processingStatus && (
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
          {processingStatus}
        </div>
      )}
    </div>
  )
}
