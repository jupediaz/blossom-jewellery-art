import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { enhanceProductImage } from '@/lib/ai/gemini-image'
import { imageStorage } from '@/lib/ai/storage'
import { rateLimit } from '@/lib/rate-limit'
import { GEMINI_MODELS, type GeminiModel } from '@/lib/ai/types'
import crypto from 'crypto'

export const maxDuration = 60

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user || (session.user.role !== 'ADMIN' && session.user.role !== 'PRODUCT_MANAGER')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const limited = rateLimit(req, { limit: 10, windowSeconds: 60 })
  if (limited) return limited

  const body = await req.json()
  const { imageBase64, mimeType, prompt, model, maskBase64 } = body

  if (!imageBase64 || !prompt) {
    return NextResponse.json(
      { error: 'Image and prompt are required' },
      { status: 400 }
    )
  }

  const geminiModel = (model as GeminiModel) || GEMINI_MODELS.FLASH

  // Create session record
  const genSession = await db.imageGenerationSession.create({
    data: {
      userId: session.user.id,
      mode: 'ENHANCE',
      prompt,
      referenceImages: [],
      modelUsed: geminiModel,
      status: 'PROCESSING',
    },
  })

  const startTime = Date.now()

  try {
    const result = await enhanceProductImage(
      imageBase64,
      mimeType || 'image/png',
      prompt,
      geminiModel,
      maskBase64
    )

    // Save the generated image
    const base64Data = result.imageBase64.replace(/^data:image\/\w+;base64,/, '')
    const buffer = Buffer.from(base64Data, 'base64')
    const filename = `${crypto.randomUUID()}.png`

    const imagePath = await imageStorage.save(buffer, 'generated', filename)

    // Create GeneratedImage record
    const generatedImage = await db.generatedImage.create({
      data: {
        prompt,
        mode: 'ENHANCE',
        modelUsed: geminiModel,
        imagePath,
        tags: ['enhanced'],
        sessionId: genSession.id,
      },
    })

    // Update session as completed
    await db.imageGenerationSession.update({
      where: { id: genSession.id },
      data: {
        status: 'COMPLETED',
        resultCount: 1,
        durationMs: Date.now() - startTime,
      },
    })

    return NextResponse.json({
      sessionId: genSession.id,
      images: [
        {
          id: generatedImage.id,
          url: imageStorage.getUrl(imagePath),
          thumbnailUrl: null,
          prompt,
          mode: 'ENHANCE',
          modelUsed: geminiModel,
          isFavorite: false,
          tags: ['enhanced'],
          linkedProductId: null,
          createdAt: generatedImage.createdAt.toISOString(),
        },
      ],
    })
  } catch (error) {
    console.error('Enhancement error:', error)

    await db.imageGenerationSession.update({
      where: { id: genSession.id },
      data: {
        status: 'FAILED',
        errorMessage: error instanceof Error ? error.message : 'Enhancement failed',
        durationMs: Date.now() - startTime,
      },
    })

    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Enhancement failed' },
      { status: 500 }
    )
  }
}
