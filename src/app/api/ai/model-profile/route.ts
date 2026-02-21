import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET() {
  const session = await auth()
  if (!session?.user || (session.user.role !== 'ADMIN' && session.user.role !== 'PRODUCT_MANAGER')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const profile = await db.brandModelProfile.findFirst({
    where: { isActive: true },
    orderBy: { updatedAt: 'desc' },
  })

  return NextResponse.json(profile)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user || (session.user.role !== 'ADMIN' && session.user.role !== 'PRODUCT_MANAGER')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const { id, name, referenceImages, notes } = body

  if (id) {
    // Update existing profile
    const updated = await db.brandModelProfile.update({
      where: { id },
      data: {
        name: name || 'Ola',
        referenceImages: referenceImages ?? [],
        notes: notes ?? null,
      },
    })
    return NextResponse.json(updated)
  }

  // Create new profile (deactivate previous ones)
  await db.brandModelProfile.updateMany({
    where: { isActive: true },
    data: { isActive: false },
  })

  const profile = await db.brandModelProfile.create({
    data: {
      name: name || 'Ola',
      referenceImages: referenceImages ?? [],
      notes: notes ?? null,
      isActive: true,
    },
  })

  return NextResponse.json(profile)
}
