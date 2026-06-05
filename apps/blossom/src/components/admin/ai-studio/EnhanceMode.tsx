'use client'

import { useState } from 'react'
import { Sparkles, Loader2 } from 'lucide-react'
import { ImageDropzone } from './ImageDropzone'
import { PromptInput } from './PromptInput'
import { ModelSelector } from './ModelSelector'
import { GenerationResults } from './GenerationResults'
import { enhancementPresets } from '@/lib/ai/scene-presets'
import { GEMINI_MODELS, type GeminiModel, type GeneratedImageData } from '@/lib/ai/types'

export function EnhanceMode() {
  const [imageBase64, setImageBase64] = useState<string | null>(null)
  const [imageMimeType, setImageMimeType] = useState('image/png')
  const [preview, setPreview] = useState<string | null>(null)
  const [prompt, setPrompt] = useState('')
  const [model, setModel] = useState<GeminiModel>(GEMINI_MODELS.FLASH)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [results, setResults] = useState<GeneratedImageData[]>([])

  const handleImageSelect = (_file: File, base64: string) => {
    setImageBase64(base64)
    setPreview(base64)
    const mime = base64.match(/^data:(image\/\w+);base64,/)?.[1] || 'image/png'
    setImageMimeType(mime)
  }

  const handleGenerate = async () => {
    if (!imageBase64 || !prompt.trim()) return

    setLoading(true)
    setError('')
    setResults([])

    try {
      const res = await fetch('/api/ai/image/enhance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64,
          mimeType: imageMimeType,
          prompt,
          model,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Enhancement failed')
      }

      const data = await res.json()
      setResults(data.images)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const handleFavorite = async (image: GeneratedImageData) => {
    try {
      await fetch(`/api/ai/image/${image.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isFavorite: !image.isFavorite }),
      })
      setResults((prev) =>
        prev.map((img) =>
          img.id === image.id ? { ...img, isFavorite: !img.isFavorite } : img
        )
      )
    } catch {
      // Silently fail — non-critical action
    }
  }

  return (
    <div className="space-y-5">
      {/* Upload product photo */}
      <div>
        <label className="mb-1.5 block text-sm font-medium text-gray-700">
          Product Photo
        </label>
        <ImageDropzone
          onImageSelect={handleImageSelect}
          onClear={() => {
            setImageBase64(null)
            setPreview(null)
          }}
          preview={preview}
          label="Upload a product photo to enhance"
        />
      </div>

      {/* Enhancement prompt with presets */}
      <div>
        <label className="mb-1.5 block text-sm font-medium text-gray-700">
          Enhancement Prompt
        </label>
        <PromptInput
          value={prompt}
          onChange={setPrompt}
          presets={enhancementPresets}
          isProcessing={loading}
          processingStatus="Enhancing image with AI..."
          placeholder="Describe the enhancement you want (or click a preset below)..."
        />
      </div>

      {/* Model selection */}
      <div>
        <label className="mb-1.5 block text-sm font-medium text-gray-700">
          AI Model
        </label>
        <ModelSelector value={model} onChange={setModel} disabled={loading} />
      </div>

      {/* Generate button */}
      <button
        onClick={handleGenerate}
        disabled={loading || !imageBase64 || !prompt.trim()}
        className="flex items-center gap-2 rounded-lg bg-purple-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-purple-700 disabled:opacity-50"
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Sparkles className="h-4 w-4" />
        )}
        {loading ? 'Enhancing...' : 'Enhance Image'}
      </button>

      {/* Error */}
      {error && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</div>
      )}

      {/* Results */}
      <GenerationResults
        images={results}
        loading={loading}
        onFavorite={handleFavorite}
      />
    </div>
  )
}
