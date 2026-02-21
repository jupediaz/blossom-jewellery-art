import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { imageStorage } from '@/lib/ai/storage'
import { rateLimit } from '@/lib/rate-limit'
import crypto from 'crypto'

const MAX_SIZE = 10 * 1024 * 1024 // 10MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user || (session.user.role !== 'ADMIN' && session.user.role !== 'PRODUCT_MANAGER')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const limited = rateLimit(req, { limit: 30, windowSeconds: 60 })
  if (limited) return limited

  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null
    const directory = (formData.get('directory') as string) || 'uploads'

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: `Invalid file type. Allowed: ${ALLOWED_TYPES.join(', ')}` },
        { status: 400 }
      )
    }

    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: `File too large. Maximum size: ${MAX_SIZE / 1024 / 1024}MB` },
        { status: 400 }
      )
    }

    if (!['model-profile', 'uploads'].includes(directory)) {
      return NextResponse.json({ error: 'Invalid directory' }, { status: 400 })
    }

    const ext = file.name.split('.').pop() || 'png'
    const uniqueName = `${crypto.randomUUID()}.${ext}`
    const buffer = Buffer.from(await file.arrayBuffer())

    const filePath = await imageStorage.save(buffer, directory, uniqueName)

    return NextResponse.json({
      path: filePath,
      url: imageStorage.getUrl(filePath),
      filename: uniqueName,
      size: file.size,
    })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Upload failed' },
      { status: 500 }
    )
  }
}
