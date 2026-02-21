'use client'

import { useState } from 'react'
import { Download, Heart, Trash2, Loader2, Tag } from 'lucide-react'
import type { GeneratedImageData } from '@/lib/ai/types'

interface GenerationResultsProps {
  images: GeneratedImageData[]
  loading?: boolean
  onSave?: (image: GeneratedImageData) => void
  onFavorite?: (image: GeneratedImageData) => void
  onDelete?: (image: GeneratedImageData) => void
  onUseForProduct?: (image: GeneratedImageData) => void
}

export function GenerationResults({
  images,
  loading,
  onFavorite,
  onDelete,
}: GenerationResultsProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null)

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-gray-200 bg-gray-50 py-16">
        <Loader2 className="mb-3 h-8 w-8 animate-spin text-purple-500" />
        <p className="text-sm font-medium text-gray-700">Generating images...</p>
        <p className="mt-1 text-xs text-gray-500">This may take 10-30 seconds</p>
      </div>
    )
  }

  if (images.length === 0) return null

  return (
    <div className="space-y-3">
      <h4 className="text-sm font-medium text-gray-700">Results</h4>
      <div className={`grid gap-3 ${images.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
        {images.map((image) => (
          <div
            key={image.id}
            onClick={() => setSelectedId(selectedId === image.id ? null : image.id)}
            className={`group relative cursor-pointer overflow-hidden rounded-xl border transition-all ${
              selectedId === image.id
                ? 'border-purple-500 ring-2 ring-purple-200'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <img
              src={image.url}
              alt={image.prompt}
              className="w-full object-cover"
            />

            {/* Hover overlay with actions */}
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-3 opacity-0 transition-opacity group-hover:opacity-100">
              <div className="flex items-center justify-between">
                <div className="flex gap-1.5">
                  <a
                    href={image.url}
                    download
                    onClick={(e) => e.stopPropagation()}
                    className="rounded-lg bg-white/20 p-1.5 text-white backdrop-blur-sm hover:bg-white/30"
                  >
                    <Download className="h-4 w-4" />
                  </a>
                  {onFavorite && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        onFavorite(image)
                      }}
                      className="rounded-lg bg-white/20 p-1.5 text-white backdrop-blur-sm hover:bg-white/30"
                    >
                      <Heart
                        className={`h-4 w-4 ${image.isFavorite ? 'fill-red-400 text-red-400' : ''}`}
                      />
                    </button>
                  )}
                  {onDelete && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        onDelete(image)
                      }}
                      className="rounded-lg bg-white/20 p-1.5 text-white backdrop-blur-sm hover:bg-red-500/50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
                {image.tags.length > 0 && (
                  <div className="flex items-center gap-1 text-white/80">
                    <Tag className="h-3 w-3" />
                    <span className="text-xs">{image.tags.length}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Mode badge */}
            <div className="absolute left-2 top-2">
              <span className="rounded-full bg-black/50 px-2 py-0.5 text-[10px] font-medium text-white backdrop-blur-sm">
                {image.mode}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
