import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params
  const body = await req.json()
  const { name, countries, freeShippingThreshold, isActive } = body as {
    name?: string
    countries?: string[]
    freeShippingThreshold?: number | null
    isActive?: boolean
  }

  const zone = await db.shippingZone.update({
    where: { id },
    data: {
      ...(name !== undefined && { name }),
      ...(countries !== undefined && { countries }),
      ...(freeShippingThreshold !== undefined && { freeShippingThreshold }),
      ...(isActive !== undefined && { isActive }),
    },
    include: { methods: { orderBy: { rate: 'asc' } } },
  })

  return NextResponse.json(zone)
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params

  // Check if zone has orders referencing its methods
  const methodsWithOrders = await db.shippingMethod.findMany({
    where: { zoneId: id },
    include: { _count: { select: { orders: true } } },
  })

  const hasOrders = methodsWithOrders.some((m) => m._count.orders > 0)
  if (hasOrders) {
    return NextResponse.json(
      { error: 'Cannot delete zone with existing orders. Deactivate it instead.' },
      { status: 409 }
    )
  }

  await db.shippingZone.delete({ where: { id } })

  return NextResponse.json({ deleted: true })
}
