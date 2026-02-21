// ─── AI Image Studio Types ──────────────────────

export type ImageMode = 'SCENE' | 'ENHANCE' | 'COMPOSE'
export type GenerationStatusType = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED'
export type GeminiModel = 'gemini-2.5-flash-image' | 'gemini-3-pro-image-preview'

export const GEMINI_MODELS = {
  FLASH: 'gemini-2.5-flash-image' as const,
  PRO: 'gemini-3-pro-image-preview' as const,
}

export interface ReferenceImage {
  path: string
  type: 'person' | 'object' | 'style' | 'pose'
  filename: string
}

export interface BrandModelProfileData {
  id: string
  name: string
  referenceImages: ReferenceImage[]
  isActive: boolean
  notes: string | null
}

// ─── API Request Types ──────────────────────────

export interface UploadRequest {
  file: File
  directory: 'model-profile' | 'uploads'
}

export interface UploadResponse {
  path: string
  url: string
  filename: string
  size: number
}

export interface EnhanceRequest {
  imageBase64: string
  mimeType: string
  prompt: string
  model: GeminiModel
  maskBase64?: string
}

export interface GenerateRequest {
  prompt: string
  includeModel: boolean
  productImageBase64?: string
  poseReferenceBase64?: string
  model: GeminiModel
  numberOfImages: number
  aspectRatio?: '1:1' | '3:4' | '4:3' | '16:9' | '9:16'
}

export interface GeneratedImageData {
  id: string
  url: string
  thumbnailUrl: string | null
  prompt: string
  mode: ImageMode
  modelUsed: string
  isFavorite: boolean
  tags: string[]
  linkedProductId: string | null
  createdAt: string
}

export interface GenerationResponse {
  sessionId: string
  images: GeneratedImageData[]
}

// ─── Component Props Types ──────────────────────

export interface ScenePreset {
  id: string
  label: string
  promptSuffix: string
  icon?: string
}
