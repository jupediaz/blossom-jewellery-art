'use client'

import { GEMINI_MODELS, type GeminiModel } from '@/lib/ai/types'

interface ModelSelectorProps {
  value: GeminiModel
  onChange: (model: GeminiModel) => void
  disabled?: boolean
  recommendPro?: boolean
}

const models = [
  {
    id: GEMINI_MODELS.FLASH,
    name: 'Flash',
    description: 'Fast, good for enhancement. ~5-10s',
  },
  {
    id: GEMINI_MODELS.PRO,
    name: 'Pro',
    description: 'Best quality, multi-reference. ~15-30s',
  },
] as const

export function ModelSelector({ value, onChange, disabled, recommendPro }: ModelSelectorProps) {
  return (
    <div className="flex gap-3">
      {models.map((model) => {
        const isSelected = value === model.id
        const isRecommended =
          (recommendPro && model.id === GEMINI_MODELS.PRO) ||
          (!recommendPro && model.id === GEMINI_MODELS.FLASH)

        return (
          <button
            key={model.id}
            onClick={() => onChange(model.id)}
            disabled={disabled}
            className={`flex-1 rounded-lg border-2 px-3 py-2.5 text-left transition-colors ${
              isSelected
                ? 'border-purple-500 bg-purple-50'
                : 'border-gray-200 bg-white hover:border-gray-300'
            } disabled:opacity-50`}
          >
            <div className="flex items-center gap-2">
              <span className={`text-sm font-medium ${isSelected ? 'text-purple-700' : 'text-gray-900'}`}>
                {model.name}
              </span>
              {isRecommended && (
                <span className="rounded-full bg-purple-100 px-1.5 py-0.5 text-[10px] font-medium text-purple-700">
                  Recommended
                </span>
              )}
            </div>
            <p className="mt-0.5 text-xs text-gray-500">{model.description}</p>
          </button>
        )
      })}
    </div>
  )
}
