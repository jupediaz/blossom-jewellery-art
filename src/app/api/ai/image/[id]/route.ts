import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { imageStorage } from '@/lib/ai/storage'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user || (session.user.role !== 'ADMIN' && session.user.role !== 'PRODUCT_MANAGER')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params

  const image = await db.generatedImage.findUnique({ where: { id } })
  if (!image) {
    return NextResponse.json({ error: 'Image not found' }, { status: 404 })
  }

  return NextResponse.json({
    id: image.id,
    url: imageStorage.getUrl(image.imagePath),
    thumbnailUrl: image.thumbnailPath ? imageStorage.getUrl(image.thumbnailPath) : null,
    prompt: image.prompt,
    mode: image.mode,
    modelUsed: image.modelUsed,
    isFavorite: image.isFavorite,
    tags: image.tags,
    linkedProductId: image.linkedProductId,
    linkedCollectionSlug: image.linkedCollectionSlug,
    dimensions: image.dimensions,
    createdAt: image.createdAt.toISOString(),
    updatedAt: image.updatedAt.toISOString(),
  })
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user || (session.user.role !== 'ADMIN' && session.user.role !== 'PRODUCT_MANAGER')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const body = await req.json()

  const updateData: Record<string, unknown> = {}
  if (body.tags !== undefined) updateData.tags = body.tags
  if (body.isFavorite !== undefined) updateData.isFavorite = body.isFavorite
  if (body.linkedProductId !== undefined) updateData.linkedProductId = body.linkedProductId
  if (body.linkedCollectionSlug !== undefined) updateData.linkedCollectionSlug = body.linkedCollectionSlug

  const image = await db.generatedImage.update({
    where: { id },
    data: updateData,
  })

  return NextResponse.json({
    id: image.id,
    isFavorite: image.isFavorite,
    tags: image.tags,
    linkedProductId: image.linkedProductId,
  })
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user || (session.user.role !== 'ADMIN' && session.user.role !== 'PRODUCT_MANAGER')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params

  const image = await db.generatedImage.findUnique({ where: { id } })
  if (!image) {
    return NextResponse.json({ error: 'Image not found' }, { status: 404 })
  }

  // Delete file from storage
  try {
    await imageStorage.delete(image.imagePath)
    if (image.thumbnailPath) {
      await imageStorage.delete(image.thumbnailPath)
    }
  } catch {
    // File may already be deleted
  }

  await db.generatedImage.delete({ where: { id } })

  return NextResponse.json({ success: true })
}
