import { GoogleGenerativeAI } from '@google/generative-ai'
import { GEMINI_MODELS, type GeminiModel } from './types'

// ─── Types ──────────────────────────────────────

interface EditImageParams {
  imageBase64: string
  mimeType?: string
  prompt: string
  maskBase64?: string
  model?: GeminiModel
}

interface EditImageResult {
  imageBase64: string
  text?: string
}

interface ReferenceImageInput {
  base64: string
  mimeType: string
  type: 'person' | 'object' | 'style' | 'pose'
}

interface GenerateWithReferencesParams {
  prompt: string
  references: ReferenceImageInput[]
  model?: GeminiModel
  aspectRatio?: string
}

// ─── Core Gemini Functions ──────────────────────

function getApiKey(): string {
  const key = process.env.GOOGLE_GEMINI_API_KEY
  if (!key) throw new Error('GOOGLE_GEMINI_API_KEY is not configured')
  return key
}

function stripDataUrl(base64: string): { data: string; mimeType: string } {
  const match = base64.match(/^data:(image\/\w+);base64,(.+)$/)
  if (match) return { mimeType: match[1], data: match[2] }
  return { mimeType: 'image/png', data: base64 }
}

/**
 * Edit a single image using Gemini (ported from image-metadata project).
 * Supports optional mask for inpainting.
 */
export async function editImageWithGemini(params: EditImageParams): Promise<EditImageResult> {
  const apiKey = getApiKey()
  const modelName = params.model || GEMINI_MODELS.FLASH

  const genAI = new GoogleGenerativeAI(apiKey)
  const model = genAI.getGenerativeModel({ model: modelName })

  type Part = { inlineData: { mimeType: string; data: string } } | { text: string }
  const parts: Part[] = []

  const { data: imageData, mimeType } = stripDataUrl(params.imageBase64)

  parts.push({
    inlineData: { mimeType: params.mimeType || mimeType, data: imageData },
  })

  if (params.maskBase64) {
    const { data: maskData } = stripDataUrl(params.maskBase64)
    parts.push({
      inlineData: { mimeType: 'image/png', data: maskData },
    })
    parts.push({
      text: [
        'INPAINTING MODE: Two images provided.',
        '1. Original photograph to edit',
        '2. Black & white mask (white = edit zone, black = keep)',
        '',
        `INSTRUCTION: ${params.prompt}`,
        '',
        'RULES:',
        '- Edit ONLY white mask areas. Black areas must remain identical.',
        '- Seamlessly blend edits with surrounding texture, grain, color temperature, and lighting.',
        '- Same resolution and dimensions. Maximum quality.',
      ].join('\n'),
    })
  } else {
    parts.push({
      text: [
        params.prompt,
        '',
        'Maintain the exact same image quality, sharpness, and detail level.',
        'Output the result in the same format and quality as the input.',
      ].join('\n'),
    })
  }

  const result = await model.generateContent(parts)
  const response = result.response

  let resultBase64 = ''
  let text = ''

  for (const candidate of response.candidates ?? []) {
    for (const part of candidate.content?.parts ?? []) {
      if (part.inlineData) {
        resultBase64 = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`
      }
      if (part.text) {
        text = part.text
      }
    }
  }

  if (!resultBase64) {
    throw new Error(
      `Gemini did not return an image. Model "${modelName}" may not support image generation.`
    )
  }

  return { imageBase64: resultBase64, text }
}

/**
 * Generate images with multiple reference inputs (person, object, style, pose).
 * Uses Gemini Pro for multi-reference capability.
 */
export async function generateImageWithReferences(
  params: GenerateWithReferencesParams
): Promise<EditImageResult[]> {
  const apiKey = getApiKey()
  const modelName = params.model || GEMINI_MODELS.PRO

  const genAI = new GoogleGenerativeAI(apiKey)
  const model = genAI.getGenerativeModel({ model: modelName })

  type Part = { inlineData: { mimeType: string; data: string } } | { text: string }
  const parts: Part[] = []

  // Group references by type for structured prompting
  const byType = {
    person: params.references.filter((r) => r.type === 'person'),
    object: params.references.filter((r) => r.type === 'object'),
    style: params.references.filter((r) => r.type === 'style'),
    pose: params.references.filter((r) => r.type === 'pose'),
  }

  // Add all reference images as inline data
  for (const ref of params.references) {
    const { data } = stripDataUrl(ref.base64)
    parts.push({
      inlineData: { mimeType: ref.mimeType, data },
    })
  }

  // Build structured prompt describing reference usage
  const promptLines: string[] = []

  if (byType.person.length > 0) {
    promptLines.push(
      `PERSON REFERENCES (${byType.person.length} images): The first ${byType.person.length} image(s) show the person to include. Maintain their face, features, and identity as closely as possible.`
    )
  }
  if (byType.object.length > 0) {
    promptLines.push(
      `OBJECT/PRODUCT REFERENCES (${byType.object.length} images): Show the jewelry/product. Include it accurately in the scene with correct details, colors, and proportions.`
    )
  }
  if (byType.style.length > 0) {
    promptLines.push(
      `STYLE REFERENCES (${byType.style.length} images): Match the visual style, lighting, and mood of these references.`
    )
  }
  if (byType.pose.length > 0) {
    promptLines.push(
      `POSE REFERENCES (${byType.pose.length} images): Use these for body positioning and composition guidance.`
    )
  }

  promptLines.push('', `SCENE DESCRIPTION: ${params.prompt}`)

  if (params.aspectRatio) {
    promptLines.push(``, `OUTPUT ASPECT RATIO: ${params.aspectRatio}`)
  }

  promptLines.push(
    '',
    'Generate a professional, high-quality photograph. Natural lighting, sharp focus, editorial quality.',
    'The result should look like a real photograph, not AI-generated.'
  )

  parts.push({ text: promptLines.join('\n') })

  const result = await model.generateContent(parts)
  const response = result.response

  const images: EditImageResult[] = []

  for (const candidate of response.candidates ?? []) {
    let imageBase64 = ''
    let text = ''
    for (const part of candidate.content?.parts ?? []) {
      if (part.inlineData) {
        imageBase64 = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`
      }
      if (part.text) {
        text = part.text
      }
    }
    if (imageBase64) {
      images.push({ imageBase64, text })
    }
  }

  if (images.length === 0) {
    throw new Error('Gemini did not return any images for the given references and prompt.')
  }

  return images
}

/**
 * Convenience wrapper for product image enhancement (Mode B).
 */
export async function enhanceProductImage(
  imageBase64: string,
  mimeType: string,
  prompt: string,
  model: GeminiModel = GEMINI_MODELS.FLASH,
  maskBase64?: string
): Promise<EditImageResult> {
  return editImageWithGemini({
    imageBase64,
    mimeType,
    prompt,
    maskBase64,
    model,
  })
}
