import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET() {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const items = await db.wishlist.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
      take: 100,
    })
    return NextResponse.json(items)
  } catch {
    return NextResponse.json({ error: 'Failed to fetch wishlist' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let sanityProductId: string, variantName: string | undefined
  try {
    const body = await req.json()
    sanityProductId = body.sanityProductId
    variantName = body.variantName
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  if (!sanityProductId) {
    return NextResponse.json({ error: 'Product ID required' }, { status: 400 })
  }

  try {
    const item = await db.wishlist.upsert({
      where: {
        userId_sanityProductId_variantName: {
          userId: session.user.id,
          sanityProductId,
          variantName: (variantName ?? null) as string,
        },
      },
      create: {
        userId: session.user.id,
        sanityProductId,
        variantName: variantName || null,
      },
      update: {},
    })
    return NextResponse.json(item, { status: 201 })
  } catch {
    return NextResponse.json({ error: 'Failed to update wishlist' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const id = req.nextUrl.searchParams.get('id')
  if (!id) {
    return NextResponse.json({ error: 'Wishlist item ID required' }, { status: 400 })
  }

  try {
    const item = await db.wishlist.findUnique({ where: { id } })
    if (!item || item.userId !== session.user.id) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }
    await db.wishlist.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Failed to remove from wishlist' }, { status: 500 })
  }
}
