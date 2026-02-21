'use client'

import { useState, useEffect, useCallback } from 'react'
import { Search, Heart, Trash2, Download, Filter, ChevronLeft, ChevronRight } from 'lucide-react'
import type { GeneratedImageData, ImageMode } from '@/lib/ai/types'
import { ImageDetailModal } from './ImageDetailModal'

const MODE_OPTIONS = [
  { value: '', label: 'All Modes' },
  { value: 'ENHANCE', label: 'Enhanced' },
  { value: 'SCENE', label: 'Scene' },
  { value: 'COMPOSE', label: 'Composition' },
] as const

export function ImageGallery() {
  const [images, setImages] = useState<GeneratedImageData[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [mode, setMode] = useState('')
  const [favoritesOnly, setFavoritesOnly] = useState(false)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState<GeneratedImageData | null>(null)

  const fetchImages = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams()
    params.set('page', String(page))
    params.set('limit', '20')
    if (mode) params.set('mode', mode)
    if (favoritesOnly) params.set('favorite', 'true')
    if (search) params.set('search', search)

    try {
      const res = await fetch(`/api/ai/image?${params}`)
      const data = await res.json()
      setImages(data.images)
      setTotal(data.total)
      setTotalPages(data.totalPages)
    } catch {
      // Fail silently
    } finally {
      setLoading(false)
    }
  }, [page, mode, favoritesOnly, search])

  useEffect(() => {
    fetchImages()
  }, [fetchImages])

  const handleFavorite = async (image: GeneratedImageData) => {
    try {
      await fetch(`/api/ai/image/${image.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isFavorite: !image.isFavorite }),
      })
      setImages((prev) =>
        prev.map((img) =>
          img.id === image.id ? { ...img, isFavorite: !img.isFavorite } : img
        )
      )
    } catch {}
  }

  const handleDelete = async (image: GeneratedImageData) => {
    if (!confirm('Delete this image?')) return
    try {
      await fetch(`/api/ai/image/${image.id}`, { method: 'DELETE' })
      setImages((prev) => prev.filter((img) => img.id !== image.id))
      setTotal((prev) => prev - 1)
    } catch {}
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
            placeholder="Search prompts..."
            className="w-full rounded-lg border border-gray-300 py-2 pl-9 pr-3 text-sm focus:border-charcoal focus:outline-none"
          />
        </div>

        <select
          value={mode}
          onChange={(e) => {
            setMode(e.target.value)
            setPage(1)
          }}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-charcoal focus:outline-none"
        >
          {MODE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        <button
          onClick={() => {
            setFavoritesOnly(!favoritesOnly)
            setPage(1)
          }}
          className={`flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
            favoritesOnly
              ? 'border-red-300 bg-red-50 text-red-700'
              : 'border-gray-300 text-gray-600 hover:bg-gray-50'
          }`}
        >
          <Heart className={`h-3.5 w-3.5 ${favoritesOnly ? 'fill-red-500' : ''}`} />
          Favorites
        </button>

        <div className="flex items-center gap-1 text-xs text-gray-500">
          <Filter className="h-3.5 w-3.5" />
          {total} images
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="aspect-square animate-pulse rounded-xl bg-gray-100" />
          ))}
        </div>
      ) : images.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-gray-200 bg-gray-50 py-16">
          <p className="text-sm text-gray-500">No images found</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {images.map((image) => (
            <div
              key={image.id}
              onClick={() => setSelectedImage(image)}
              className="group relative cursor-pointer overflow-hidden rounded-xl border border-gray-200 transition-shadow hover:shadow-md"
            >
              <div className="aspect-square">
                <img
                  src={image.thumbnailUrl || image.url}
                  alt={image.prompt}
                  className="h-full w-full object-cover"
                />
              </div>

              {/* Overlay */}
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-2 opacity-0 transition-opacity group-hover:opacity-100">
                <div className="flex items-center justify-between">
                  <span className="rounded bg-black/40 px-1.5 py-0.5 text-[10px] font-medium text-white">
                    {image.mode}
                  </span>
                  <div className="flex gap-1">
                    <a
                      href={image.url}
                      download
                      onClick={(e) => e.stopPropagation()}
                      className="rounded bg-white/20 p-1 text-white hover:bg-white/30"
                    >
                      <Download className="h-3.5 w-3.5" />
                    </a>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleFavorite(image)
                      }}
                      className="rounded bg-white/20 p-1 text-white hover:bg-white/30"
                    >
                      <Heart
                        className={`h-3.5 w-3.5 ${image.isFavorite ? 'fill-red-400 text-red-400' : ''}`}
                      />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDelete(image)
                      }}
                      className="rounded bg-white/20 p-1 text-white hover:bg-red-500/50"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Favorite indicator */}
              {image.isFavorite && (
                <div className="absolute right-2 top-2">
                  <Heart className="h-4 w-4 fill-red-500 text-red-500 drop-shadow" />
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
            className="rounded-lg border border-gray-300 p-2 text-gray-600 hover:bg-gray-50 disabled:opacity-50"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="text-sm text-gray-600">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage(Math.min(totalPages, page + 1))}
            disabled={page === totalPages}
            className="rounded-lg border border-gray-300 p-2 text-gray-600 hover:bg-gray-50 disabled:opacity-50"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Detail modal */}
      {selectedImage && (
        <ImageDetailModal
          image={selectedImage}
          onClose={() => setSelectedImage(null)}
          onFavorite={() => handleFavorite(selectedImage)}
          onDelete={() => {
            handleDelete(selectedImage)
            setSelectedImage(null)
          }}
        />
      )}
    </div>
  )
}
