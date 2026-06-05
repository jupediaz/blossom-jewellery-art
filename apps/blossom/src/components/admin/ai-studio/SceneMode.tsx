'use client'

import { useState, useEffect } from 'react'
import { Sparkles, Loader2, User, Check } from 'lucide-react'
import { ImageDropzone } from './ImageDropzone'
import { PromptInput } from './PromptInput'
import { ModelSelector } from './ModelSelector'
import { GenerationResults } from './GenerationResults'
import { scenePresets } from '@/lib/ai/scene-presets'
import { GEMINI_MODELS, type GeminiModel, type GeneratedImageData, type ReferenceImage } from '@/lib/ai/types'

const ASPECT_RATIOS = [
  { value: '1:1', label: '1:1' },
  { value: '3:4', label: '3:4' },
  { value: '4:3', label: '4:3' },
  { value: '16:9', label: '16:9' },
  { value: '9:16', label: '9:16' },
] as const

export function SceneMode() {
  const [includeModel, setIncludeModel] = useState(false)
  const [modelPhotos, setModelPhotos] = useState<ReferenceImage[]>([])
  const [productBase64, setProductBase64] = useState<string | null>(null)
  const [productPreview, setProductPreview] = useState<string | null>(null)
  const [poseBase64, setPoseBase64] = useState<string | null>(null)
  const [posePreview, setPosePreview] = useState<string | null>(null)
  const [prompt, setPrompt] = useState('')
  const [model, setModel] = useState<GeminiModel>(GEMINI_MODELS.PRO)
  const [aspectRatio, setAspectRatio] = useState('3:4')
  const [variations, setVariations] = useState(1)
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
        }
      })
      .catch(() => {})
  }, [])

  const handleGenerate = async () => {
    if (!prompt.trim()) return

    setLoading(true)
    setError('')
    setResults([])

    try {
      const res = await fetch('/api/ai/image/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          includeModel,
          productImageBase64: productBase64,
          poseReferenceBase64: poseBase64,
          model,
          numberOfImages: variations,
          aspectRatio,
          mode: 'SCENE',
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
      {/* Include brand model toggle */}
      <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
        <label className="flex cursor-pointer items-center gap-3">
          <button
            onClick={() => setIncludeModel(!includeModel)}
            className={`flex h-5 w-5 items-center justify-center rounded border-2 transition-colors ${
              includeModel
                ? 'border-purple-500 bg-purple-500'
                : 'border-gray-300 bg-white'
            }`}
          >
            {includeModel && <Check className="h-3.5 w-3.5 text-white" />}
          </button>
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">
              Include Brand Model (Ola)
            </span>
          </div>
        </label>

        {includeModel && modelPhotos.length > 0 && (
          <div className="mt-3 flex gap-2">
            {modelPhotos.slice(0, 5).map((photo, i) => (
              <img
                key={i}
                src={`/uploads/ai-studio/${photo.path}`}
                alt={`Reference ${i + 1}`}
                className="h-12 w-12 rounded-lg object-cover"
              />
            ))}
          </div>
        )}

        {includeModel && modelPhotos.length === 0 && (
          <p className="mt-2 text-xs text-amber-600">
            No reference photos uploaded yet.{' '}
            <a href="/admin/ai-studio/model-profile" className="underline">
              Upload photos
            </a>
          </p>
        )}
      </div>

      {/* Scene description */}
      <div>
        <label className="mb-1.5 block text-sm font-medium text-gray-700">
          Scene Description
        </label>
        <PromptInput
          value={prompt}
          onChange={setPrompt}
          presets={scenePresets}
          isProcessing={loading}
          processingStatus="Generating scene..."
          placeholder="Describe the scene you want to create..."
        />
      </div>

      {/* Optional: Product photo and Pose reference */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">
            Product Photo (optional)
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
            compact
            label="Product"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">
            Pose Reference (optional)
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
            label="Pose"
          />
        </div>
      </div>

      {/* Settings row */}
      <div className="grid gap-4 sm:grid-cols-3">
        {/* Aspect ratio */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">
            Aspect Ratio
          </label>
          <div className="flex gap-1">
            {ASPECT_RATIOS.map((ar) => (
              <button
                key={ar.value}
                onClick={() => setAspectRatio(ar.value)}
                className={`flex-1 rounded-md px-2 py-1.5 text-xs font-medium transition-colors ${
                  aspectRatio === ar.value
                    ? 'bg-charcoal text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {ar.label}
              </button>
            ))}
          </div>
        </div>

        {/* Variations */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">
            Variations
          </label>
          <div className="flex gap-1">
            {[1, 2, 4].map((n) => (
              <button
                key={n}
                onClick={() => setVariations(n)}
                className={`flex-1 rounded-md px-2 py-1.5 text-xs font-medium transition-colors ${
                  variations === n
                    ? 'bg-charcoal text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {n}
              </button>
            ))}
          </div>
        </div>

        {/* Model selector */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">
            AI Model
          </label>
          <ModelSelector
            value={model}
            onChange={setModel}
            disabled={loading}
            recommendPro
          />
        </div>
      </div>

      {/* Generate button */}
      <button
        onClick={handleGenerate}
        disabled={loading || !prompt.trim()}
        className="flex items-center gap-2 rounded-lg bg-purple-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-purple-700 disabled:opacity-50"
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Sparkles className="h-4 w-4" />
        )}
        {loading ? 'Generating...' : `Generate ${variations > 1 ? `${variations} Variations` : 'Image'}`}
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
