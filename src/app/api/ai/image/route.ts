import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { imageStorage } from '@/lib/ai/storage'
import type { ImageMode } from '@/lib/ai/types'

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user || (session.user.role !== 'ADMIN' && session.user.role !== 'PRODUCT_MANAGER')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const mode = searchParams.get('mode') as ImageMode | null
  const tag = searchParams.get('tag')
  const productId = searchParams.get('productId')
  const favorite = searchParams.get('favorite')
  const search = searchParams.get('search')
  const page = parseInt(searchParams.get('page') || '1')
  const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 50)

  const where: Record<string, unknown> = {}
  if (mode) where.mode = mode
  if (tag) where.tags = { has: tag }
  if (productId) where.linkedProductId = productId
  if (favorite === 'true') where.isFavorite = true
  if (search) where.prompt = { contains: search, mode: 'insensitive' }

  const [images, total] = await Promise.all([
    db.generatedImage.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    db.generatedImage.count({ where }),
  ])

  return NextResponse.json({
    images: images.map((img) => ({
      id: img.id,
      url: imageStorage.getUrl(img.imagePath),
      thumbnailUrl: img.thumbnailPath ? imageStorage.getUrl(img.thumbnailPath) : null,
      prompt: img.prompt,
      mode: img.mode,
      modelUsed: img.modelUsed,
      isFavorite: img.isFavorite,
      tags: img.tags,
      linkedProductId: img.linkedProductId,
      dimensions: img.dimensions,
      createdAt: img.createdAt.toISOString(),
    })),
    total,
    page,
    totalPages: Math.ceil(total / limit),
  })
}
