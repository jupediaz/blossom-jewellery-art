'use client'

import { useCallback, useRef, useState } from 'react'
import { Upload, X, Image as ImageIcon } from 'lucide-react'

interface ImageDropzoneProps {
  onImageSelect: (file: File, base64: string) => void
  onClear?: () => void
  accept?: string
  maxSizeMB?: number
  label?: string
  preview?: string | null
  compact?: boolean
}

export function ImageDropzone({
  onImageSelect,
  onClear,
  accept = 'image/jpeg,image/png,image/webp',
  maxSizeMB = 10,
  label = 'Drop an image here or click to upload',
  preview,
  compact = false,
}: ImageDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = useCallback(
    (file: File) => {
      setError('')

      if (!accept.split(',').some((t) => file.type === t.trim())) {
        setError('Invalid file type')
        return
      }

      if (file.size > maxSizeMB * 1024 * 1024) {
        setError(`File too large (max ${maxSizeMB}MB)`)
        return
      }

      const reader = new FileReader()
      reader.onload = () => {
        onImageSelect(file, reader.result as string)
      }
      reader.readAsDataURL(file)
    },
    [accept, maxSizeMB, onImageSelect]
  )

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)
      const file = e.dataTransfer.files[0]
      if (file) handleFile(file)
    },
    [handleFile]
  )

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file) handleFile(file)
      if (inputRef.current) inputRef.current.value = ''
    },
    [handleFile]
  )

  if (preview) {
    return (
      <div className={`relative overflow-hidden rounded-lg border border-gray-200 ${compact ? 'h-32 w-32' : ''}`}>
        <img
          src={preview}
          alt="Preview"
          className={`object-cover ${compact ? 'h-full w-full' : 'max-h-64 w-full'}`}
        />
        {onClear && (
          <button
            onClick={onClear}
            className="absolute right-1.5 top-1.5 rounded-full bg-black/60 p-1 text-white hover:bg-black/80"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    )
  }

  return (
    <div>
      <div
        onDragOver={(e) => {
          e.preventDefault()
          setIsDragging(true)
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed transition-colors ${
          compact ? 'h-32 w-32 gap-1 p-2' : 'gap-2 px-6 py-8'
        } ${
          isDragging
            ? 'border-purple-400 bg-purple-50'
            : 'border-gray-300 bg-gray-50 hover:border-gray-400 hover:bg-gray-100'
        }`}
      >
        {compact ? (
          <ImageIcon className="h-6 w-6 text-gray-400" />
        ) : (
          <Upload className="h-8 w-8 text-gray-400" />
        )}
        <p className={`text-center text-gray-500 ${compact ? 'text-xs' : 'text-sm'}`}>
          {compact ? 'Upload' : label}
        </p>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleChange}
        className="hidden"
      />
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  )
}
