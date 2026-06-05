'use client'

import { X, Download, Heart, Trash2, Tag, Calendar, Cpu } from 'lucide-react'
import type { GeneratedImageData } from '@/lib/ai/types'

interface ImageDetailModalProps {
  image: GeneratedImageData
  onClose: () => void
  onFavorite: () => void
  onDelete: () => void
}

export function ImageDetailModal({
  image,
  onClose,
  onFavorite,
  onDelete,
}: ImageDetailModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="relative max-h-[90vh] w-full max-w-4xl overflow-auto rounded-2xl bg-white shadow-xl">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-10 rounded-full bg-black/40 p-2 text-white hover:bg-black/60"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex flex-col md:flex-row">
          {/* Image */}
          <div className="flex-1 bg-gray-100">
            <img
              src={image.url}
              alt={image.prompt}
              className="h-full w-full object-contain"
            />
          </div>

          {/* Metadata sidebar */}
          <div className="w-full space-y-4 p-6 md:w-80">
            <h3 className="text-sm font-medium text-gray-900">Image Details</h3>

            {/* Prompt */}
            <div>
              <p className="mb-1 text-xs font-medium uppercase text-gray-400">Prompt</p>
              <p className="text-sm text-gray-700">{image.prompt}</p>
            </div>

            {/* Mode */}
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-medium text-purple-700">
                {image.mode}
              </span>
            </div>

            {/* Model */}
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Cpu className="h-3.5 w-3.5" />
              <span>{image.modelUsed}</span>
            </div>

            {/* Date */}
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Calendar className="h-3.5 w-3.5" />
              <span>{new Date(image.createdAt).toLocaleDateString()}</span>
            </div>

            {/* Tags */}
            {image.tags.length > 0 && (
              <div>
                <div className="mb-1 flex items-center gap-1 text-xs font-medium uppercase text-gray-400">
                  <Tag className="h-3 w-3" />
                  Tags
                </div>
                <div className="flex flex-wrap gap-1">
                  {image.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="space-y-2 border-t border-gray-200 pt-4">
              <a
                href={image.url}
                download
                className="flex w-full items-center justify-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                <Download className="h-4 w-4" />
                Download Original
              </a>

              <button
                onClick={onFavorite}
                className={`flex w-full items-center justify-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
                  image.isFavorite
                    ? 'border-red-300 bg-red-50 text-red-700'
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Heart className={`h-4 w-4 ${image.isFavorite ? 'fill-red-500' : ''}`} />
                {image.isFavorite ? 'Unfavorite' : 'Favorite'}
              </button>

              <button
                onClick={onDelete}
                className="flex w-full items-center justify-center gap-2 rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
