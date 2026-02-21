import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user || (session.user.role !== 'ADMIN' && session.user.role !== 'PRODUCT_MANAGER')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()

  const offer = await db.offer.create({
    data: {
      name: body.name,
      type: body.type,
      discountType: body.discountType,
      discountValue: body.discountValue,
      applyToAll: body.applyToAll ?? false,
      applicableProducts: body.applicableProducts ?? [],
      applicableCollections: body.applicableCollections ?? [],
      validFrom: new Date(body.validFrom),
      validUntil: new Date(body.validUntil),
      badgeText: body.badgeText,
      bannerText: body.bannerText,
    },
  })

  return NextResponse.json(offer, { status: 201 })
}
