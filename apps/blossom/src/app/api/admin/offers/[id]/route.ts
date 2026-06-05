import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user || (session.user.role !== 'ADMIN' && session.user.role !== 'STORE_OWNER')) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { id } = await params
  const offer = await db.offer.findUnique({ where: { id } })
  if (!offer) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json({ offer })
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user || (session.user.role !== 'ADMIN' && session.user.role !== 'STORE_OWNER')) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { id } = await params
  const body = await req.json()

  const offer = await db.offer.update({
    where: { id },
    data: {
      name: body.name,
      isActive: body.isActive,
      discountType: body.discountType,
      discountValue: body.discountValue,
      validFrom: body.validFrom ? new Date(body.validFrom) : undefined,
      validUntil: body.validUntil ? new Date(body.validUntil) : undefined,
      bannerText: body.bannerText,
      badgeText: body.badgeText,
    },
  })
  return NextResponse.json({ offer })
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user || (session.user.role !== 'ADMIN' && session.user.role !== 'STORE_OWNER')) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { id } = await params
  await db.offer.delete({ where: { id } })
  return NextResponse.json({ message: 'Offer deleted' })
}
