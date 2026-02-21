import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET() {
  const session = await auth()
  if (!session?.user || (session.user.role !== 'ADMIN' && session.user.role !== 'PRODUCT_MANAGER')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const zones = await db.shippingZone.findMany({
    orderBy: { name: 'asc' },
    include: { methods: { orderBy: { rate: 'asc' } } },
  })

  return NextResponse.json(
    zones.map((z) => ({
      ...z,
      freeShippingThreshold: z.freeShippingThreshold ? Number(z.freeShippingThreshold) : null,
      methods: z.methods.map((m) => ({
        ...m,
        rate: Number(m.rate),
      })),
    }))
  )
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json()
  const { name, countries, freeShippingThreshold, isActive, methods } = body as {
    name: string
    countries: string[]
    freeShippingThreshold?: number | null
    isActive?: boolean
    methods?: Array<{
      name: string
      rate: number
      estimatedDaysMin: number
      estimatedDaysMax: number
      isActive?: boolean
    }>
  }

  if (!name || !countries?.length) {
    return NextResponse.json({ error: 'Name and countries are required' }, { status: 400 })
  }

  const zone = await db.shippingZone.create({
    data: {
      name,
      countries,
      freeShippingThreshold: freeShippingThreshold ?? null,
      isActive: isActive ?? true,
      methods: methods?.length
        ? {
            create: methods.map((m) => ({
              name: m.name,
              rate: m.rate,
              estimatedDaysMin: m.estimatedDaysMin,
              estimatedDaysMax: m.estimatedDaysMax,
              isActive: m.isActive ?? true,
            })),
          }
        : undefined,
    },
    include: { methods: true },
  })

  return NextResponse.json(zone, { status: 201 })
}
