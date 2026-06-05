import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { z } from 'zod'

const offerSchema = z.object({
  name: z.string().min(1).max(200),
  type: z.enum(['FLASH_SALE', 'LAUNCH_OFFER', 'SEASONAL', 'COLLECTION_SALE', 'CLEARANCE']),
  discountType: z.enum(['PERCENTAGE', 'FIXED_AMOUNT']),
  discountValue: z.number().positive(),
  applyToAll: z.boolean().default(true),
  applicableProducts: z.array(z.string()).default([]),
  applicableCollections: z.array(z.string()).default([]),
  validFrom: z.string().refine((s) => !isNaN(Date.parse(s)), { message: 'Invalid validFrom date' }),
  validUntil: z.string().refine((s) => !isNaN(Date.parse(s)), { message: 'Invalid validUntil date' }),
  badgeText: z.string().max(50).nullable().optional(),
  bannerText: z.string().max(200).nullable().optional(),
}).refine((d) => new Date(d.validFrom) < new Date(d.validUntil), {
  message: 'validFrom must be before validUntil',
  path: ['validFrom'],
})

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user || (session.user.role !== 'ADMIN' && session.user.role !== 'STORE_OWNER')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: z.infer<typeof offerSchema>
  try {
    body = offerSchema.parse(await req.json())
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues[0].message }, { status: 400 })
    }
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  const offer = await db.offer.create({
    data: {
      name: body.name,
      type: body.type,
      discountType: body.discountType,
      discountValue: body.discountValue,
      applyToAll: body.applyToAll,
      applicableProducts: body.applicableProducts,
      applicableCollections: body.applicableCollections,
      validFrom: new Date(body.validFrom),
      validUntil: new Date(body.validUntil),
      badgeText: body.badgeText ?? null,
      bannerText: body.bannerText ?? null,
    },
  })

  return NextResponse.json(offer, { status: 201 })
}
