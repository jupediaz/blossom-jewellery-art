'use client'

import { useState } from 'react'
import { Sparkles, Loader2, Copy, Check, ChevronDown, ChevronUp } from 'lucide-react'

interface GeneratedContent {
  name: string
  shortDescription: string
  longDescription: string
  materials: string
  seoTitle: string
  seoDescription: string
  instagramCaption: string
}

type Language = 'en' | 'es' | 'uk'

const languageLabels: Record<Language, string> = {
  en: 'English',
  es: 'Spanish',
  uk: 'Ukrainian',
}

export function AIDescriptionGenerator() {
  const [input, setInput] = useState('')
  const [inputLanguage, setInputLanguage] = useState<Language>('uk')
  const [productType, setProductType] = useState('')
  const [materials, setMaterials] = useState('')
  const [collection, setCollection] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState<Record<Language, GeneratedContent> | null>(null)
  const [activeLang, setActiveLang] = useState<Language>('en')
  const [copiedField, setCopiedField] = useState<string | null>(null)
  const [expanded, setExpanded] = useState(true)

  async function handleGenerate() {
    if (!input.trim()) return
    setLoading(true)
    setError('')
    setResult(null)

    try {
      const res = await fetch('/api/ai/describe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          input,
          inputLanguage,
          productType: productType || undefined,
          materials: materials ? materials.split(',').map((m) => m.trim()) : undefined,
          collection: collection || undefined,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Generation failed')
      }

      const data = await res.json()
      setResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  function copyToClipboard(text: string, field: string) {
    navigator.clipboard.writeText(text)
    setCopiedField(field)
    setTimeout(() => setCopiedField(null), 2000)
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-center justify-between px-6 py-4"
      >
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-purple-500" />
          <h3 className="font-medium text-gray-900">AI Description Generator</h3>
        </div>
        {expanded ? (
          <ChevronUp className="h-4 w-4 text-gray-400" />
        ) : (
          <ChevronDown className="h-4 w-4 text-gray-400" />
        )}
      </button>

      {expanded && (
        <div className="border-t border-gray-200 px-6 py-4 space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Describe the product (in any language)
            </label>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              rows={3}
              placeholder="Сережки натхнені квітами лаванди, ніжні відтінки фіолетового з золотою фурнітурою..."
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-charcoal focus:outline-none focus:ring-1 focus:ring-charcoal"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Input Language
              </label>
              <select
                value={inputLanguage}
                onChange={(e) => setInputLanguage(e.target.value as Language)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-charcoal focus:outline-none focus:ring-1 focus:ring-charcoal"
              >
                <option value="uk">Ukrainian</option>
                <option value="en">English</option>
                <option value="es">Spanish</option>
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Product Type
              </label>
              <input
                value={productType}
                onChange={(e) => setProductType(e.target.value)}
                placeholder="Earrings, Necklace..."
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-charcoal focus:outline-none focus:ring-1 focus:ring-charcoal"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Materials
              </label>
              <input
                value={materials}
                onChange={(e) => setMaterials(e.target.value)}
                placeholder="Polymer clay, gold..."
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-charcoal focus:outline-none focus:ring-1 focus:ring-charcoal"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Collection
              </label>
              <input
                value={collection}
                onChange={(e) => setCollection(e.target.value)}
                placeholder="Botanical Garden..."
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-charcoal focus:outline-none focus:ring-1 focus:ring-charcoal"
              />
            </div>
          </div>

          <button
            onClick={handleGenerate}
            disabled={loading || !input.trim()}
            className="flex items-center gap-2 rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700 disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
            {loading ? 'Generating...' : 'Generate Descriptions'}
          </button>

          {error && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {result && (
            <div className="space-y-4 border-t border-gray-200 pt-4">
              <div className="flex gap-1">
                {(['en', 'es', 'uk'] as Language[]).map((lang) => (
                  <button
                    key={lang}
                    onClick={() => setActiveLang(lang)}
                    className={`rounded-lg px-3 py-1.5 text-sm font-medium ${
                      activeLang === lang
                        ? 'bg-charcoal text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {languageLabels[lang]}
                  </button>
                ))}
              </div>

              {result[activeLang] && (
                <div className="space-y-3">
                  {(
                    [
                      ['name', 'Product Name'],
                      ['shortDescription', 'Short Description'],
                      ['longDescription', 'Full Description'],
                      ['materials', 'Materials & Care'],
                      ['seoTitle', 'SEO Title'],
                      ['seoDescription', 'SEO Description'],
                      ['instagramCaption', 'Instagram Caption'],
                    ] as const
                  ).map(([key, label]) => (
                    <div key={key} className="rounded-lg border border-gray-100 p-3">
                      <div className="mb-1 flex items-center justify-between">
                        <span className="text-xs font-medium uppercase text-gray-400">
                          {label}
                        </span>
                        <button
                          onClick={() =>
                            copyToClipboard(result[activeLang][key], `${activeLang}-${key}`)
                          }
                          className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600"
                        >
                          {copiedField === `${activeLang}-${key}` ? (
                            <>
                              <Check className="h-3 w-3 text-green-500" />
                              Copied
                            </>
                          ) : (
                            <>
                              <Copy className="h-3 w-3" />
                              Copy
                            </>
                          )}
                        </button>
                      </div>
                      <p className="whitespace-pre-wrap text-sm text-gray-800">
                        {result[activeLang][key]}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
