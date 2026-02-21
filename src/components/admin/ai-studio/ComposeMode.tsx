'use client'

import { useState, useEffect } from 'react'
import { Sparkles, Loader2, User, AlertTriangle } from 'lucide-react'
import { ImageDropzone } from './ImageDropzone'
import { PromptInput } from './PromptInput'
import { GenerationResults } from './GenerationResults'
import { compositionPresets } from '@/lib/ai/scene-presets'
import { GEMINI_MODELS, type GeneratedImageData, type ReferenceImage } from '@/lib/ai/types'

export function ComposeMode() {
  const [modelPhotos, setModelPhotos] = useState<ReferenceImage[]>([])
  const [modelName, setModelName] = useState('Ola')
  const [productBase64, setProductBase64] = useState<string | null>(null)
  const [productPreview, setProductPreview] = useState<string | null>(null)
  const [poseBase64, setPoseBase64] = useState<string | null>(null)
  const [posePreview, setPosePreview] = useState<string | null>(null)
  const [prompt, setPrompt] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [results, setResults] = useState<GeneratedImageData[]>([])

  // Load model profile
  useEffect(() => {
    fetch('/api/ai/model-profile')
      .then((r) => r.json())
      .then((data) => {
        if (data?.referenceImages) {
          setModelPhotos(data.referenceImages)
          setModelName(data.name || 'Ola')
        }
      })
      .catch(() => {})
  }, [])

  const handleGenerate = async () => {
    if (!prompt.trim() || !productBase64) return

    setLoading(true)
    setError('')
    setResults([])

    try {
      const res = await fetch('/api/ai/image/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          includeModel: true,
          productImageBase64: productBase64,
          poseReferenceBase64: poseBase64,
          model: GEMINI_MODELS.PRO,
          numberOfImages: 4,
          aspectRatio: '3:4',
          mode: 'COMPOSE',
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Generation failed')
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
    } catch {}
  }

  return (
    <div className="space-y-5">
      {/* Experimental warning */}
      <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-3">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
        <div>
          <p className="text-sm font-medium text-amber-800">Experimental Mode</p>
          <p className="text-xs text-amber-700">
            Multi-reference composition uses up to 14 reference images. Results may vary —
            character consistency is ~80%. Best for lifestyle/marketing shots.
          </p>
        </div>
      </div>

      {/* Brand model display */}
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
        <div className="flex items-center gap-2 mb-2">
          <User className="h-4 w-4 text-purple-500" />
          <span className="text-sm font-medium text-gray-700">
            Brand Model: {modelName}
          </span>
          <span className="rounded-full bg-purple-100 px-2 py-0.5 text-[10px] font-medium text-purple-700">
            Required
          </span>
        </div>

        {modelPhotos.length > 0 ? (
          <div className="flex gap-2">
            {modelPhotos.slice(0, 5).map((photo, i) => (
              <img
                key={i}
                src={`/uploads/ai-studio/${photo.path}`}
                alt={`Reference ${i + 1}`}
                className="h-14 w-14 rounded-lg object-cover"
              />
            ))}
          </div>
        ) : (
          <p className="text-xs text-amber-600">
            No reference photos uploaded.{' '}
            <a href="/admin/ai-studio/model-profile" className="underline">
              Upload photos first
            </a>
          </p>
        )}
      </div>

      {/* Jewelry product photo (required) */}
      <div>
        <label className="mb-1.5 block text-sm font-medium text-gray-700">
          Jewelry Product Photo
          <span className="ml-1 text-xs text-red-500">*</span>
        </label>
        <ImageDropzone
          onImageSelect={(_file, base64) => {
            setProductBase64(base64)
            setProductPreview(base64)
          }}
          onClear={() => {
            setProductBase64(null)
            setProductPreview(null)
          }}
          preview={productPreview}
          label="Upload the jewelry piece to feature in the composition"
        />
      </div>

      {/* Pose/scene reference (optional) */}
      <div>
        <label className="mb-1.5 block text-sm font-medium text-gray-700">
          Pose / Scene Reference (optional)
        </label>
        <ImageDropzone
          onImageSelect={(_file, base64) => {
            setPoseBase64(base64)
            setPosePreview(base64)
          }}
          onClear={() => {
            setPoseBase64(null)
            setPosePreview(null)
          }}
          preview={posePreview}
          compact
          label="Pose reference"
        />
      </div>

      {/* Composition prompt with presets */}
      <div>
        <label className="mb-1.5 block text-sm font-medium text-gray-700">
          Composition Description
        </label>
        <PromptInput
          value={prompt}
          onChange={setPrompt}
          presets={compositionPresets}
          isProcessing={loading}
          processingStatus="Generating composition (this takes 30-60s)..."
          placeholder="Describe the composition you want..."
        />
      </div>

      {/* Info: Uses Pro model, generates 4 variations */}
      <div className="flex items-center gap-4 text-xs text-gray-500">
        <span className="rounded-full bg-gray-100 px-2.5 py-1 font-medium">
          Pro Model (required)
        </span>
        <span className="rounded-full bg-gray-100 px-2.5 py-1 font-medium">
          4 Variations
        </span>
        <span className="rounded-full bg-gray-100 px-2.5 py-1 font-medium">
          3:4 Portrait
        </span>
      </div>

      {/* Generate button */}
      <button
        onClick={handleGenerate}
        disabled={loading || !prompt.trim() || !productBase64 || modelPhotos.length === 0}
        className="flex items-center gap-2 rounded-lg bg-purple-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-purple-700 disabled:opacity-50"
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Sparkles className="h-4 w-4" />
        )}
        {loading ? 'Composing...' : 'Generate Composition (4 variations)'}
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
