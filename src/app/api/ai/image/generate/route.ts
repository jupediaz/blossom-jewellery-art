import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { generateImageWithReferences } from '@/lib/ai/gemini-image'
import { imageStorage } from '@/lib/ai/storage'
import { rateLimit } from '@/lib/rate-limit'
import { GEMINI_MODELS, type GeminiModel, type ReferenceImage } from '@/lib/ai/types'
import crypto from 'crypto'

export const maxDuration = 60

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user || (session.user.role !== 'ADMIN' && session.user.role !== 'PRODUCT_MANAGER')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const limited = rateLimit(req, { limit: 5, windowSeconds: 60 })
  if (limited) return limited

  const body = await req.json()
  const {
    prompt,
    includeModel,
    productImageBase64,
    poseReferenceBase64,
    model,
    numberOfImages = 1,
    aspectRatio,
    mode = 'SCENE',
  } = body

  if (!prompt) {
    return NextResponse.json({ error: 'Prompt is required' }, { status: 400 })
  }

  const geminiModel = (model as GeminiModel) || GEMINI_MODELS.PRO

  // Build reference images array
  const references: Array<{ base64: string; mimeType: string; type: 'person' | 'object' | 'style' | 'pose' }> = []

  // Load brand model photos if requested
  if (includeModel) {
    const profile = await db.brandModelProfile.findFirst({
      where: { isActive: true },
      orderBy: { updatedAt: 'desc' },
    })

    if (profile) {
      const refImages = profile.referenceImages as unknown as ReferenceImage[]
      for (const ref of refImages) {
        try {
          const buffer = await imageStorage.read(ref.path)
          const base64 = `data:image/jpeg;base64,${buffer.toString('base64')}`
          references.push({ base64, mimeType: 'image/jpeg', type: 'person' })
        } catch {
          console.warn(`Could not load reference image: ${ref.path}`)
        }
      }
    }
  }

  // Add product image as object reference
  if (productImageBase64) {
    const mime = productImageBase64.match(/^data:(image\/\w+);/)?.[1] || 'image/png'
    references.push({ base64: productImageBase64, mimeType: mime, type: 'object' })
  }

  // Add pose reference
  if (poseReferenceBase64) {
    const mime = poseReferenceBase64.match(/^data:(image\/\w+);/)?.[1] || 'image/png'
    references.push({ base64: poseReferenceBase64, mimeType: mime, type: 'pose' })
  }

  // Create session record
  const genSession = await db.imageGenerationSession.create({
    data: {
      userId: session.user.id,
      mode: mode === 'COMPOSE' ? 'COMPOSE' : 'SCENE',
      prompt,
      referenceImages: references.map((r) => ({ type: r.type, mimeType: r.mimeType })),
      modelUsed: geminiModel,
      status: 'PROCESSING',
    },
  })

  const startTime = Date.now()

  try {
    // Generate images (run multiple times for numberOfImages > 1)
    const allResults = []
    const iterations = Math.min(numberOfImages, 4)

    for (let i = 0; i < iterations; i++) {
      const results = await generateImageWithReferences({
        prompt,
        references,
        model: geminiModel,
        aspectRatio,
      })
      allResults.push(...results)
    }

    // Save all generated images
    const savedImages = []
    for (const result of allResults) {
      const base64Data = result.imageBase64.replace(/^data:image\/\w+;base64,/, '')
      const buffer = Buffer.from(base64Data, 'base64')
      const filename = `${crypto.randomUUID()}.png`

      const imagePath = await imageStorage.save(buffer, 'generated', filename)

      const generatedImage = await db.generatedImage.create({
        data: {
          prompt,
          mode: mode === 'COMPOSE' ? 'COMPOSE' : 'SCENE',
          modelUsed: geminiModel,
          imagePath,
          tags: includeModel ? ['with-model'] : [],
          sessionId: genSession.id,
        },
      })

      savedImages.push({
        id: generatedImage.id,
        url: imageStorage.getUrl(imagePath),
        thumbnailUrl: null,
        prompt,
        mode: mode === 'COMPOSE' ? 'COMPOSE' : 'SCENE',
        modelUsed: geminiModel,
        isFavorite: false,
        tags: generatedImage.tags,
        linkedProductId: null,
        createdAt: generatedImage.createdAt.toISOString(),
      })
    }

    await db.imageGenerationSession.update({
      where: { id: genSession.id },
      data: {
        status: 'COMPLETED',
        resultCount: savedImages.length,
        durationMs: Date.now() - startTime,
      },
    })

    return NextResponse.json({
      sessionId: genSession.id,
      images: savedImages,
    })
  } catch (error) {
    console.error('Generation error:', error)

    await db.imageGenerationSession.update({
      where: { id: genSession.id },
      data: {
        status: 'FAILED',
        errorMessage: error instanceof Error ? error.message : 'Generation failed',
        durationMs: Date.now() - startTime,
      },
    })

    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Generation failed' },
      { status: 500 }
    )
  }
}
