import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import type { MovementType } from '@/generated/prisma/client'

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user || (session.user.role !== 'ADMIN' && session.user.role !== 'PRODUCT_MANAGER')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { inventoryId, type, quantity, reason } = (await req.json()) as {
    inventoryId: string
    type: MovementType
    quantity: number
    reason?: string
  }

  const inventory = await db.inventory.findUnique({ where: { id: inventoryId } })
  if (!inventory) {
    return NextResponse.json({ error: 'Inventory not found' }, { status: 404 })
  }

  const newTotal = inventory.quantityTotal + quantity
  if (newTotal < 0) {
    return NextResponse.json({ error: 'Cannot reduce below zero' }, { status: 400 })
  }

  const [updated] = await db.$transaction([
    db.inventory.update({
      where: { id: inventoryId },
      data: { quantityTotal: newTotal },
    }),
    db.stockMovement.create({
      data: {
        inventoryId,
        type,
        quantity,
        reason,
      },
    }),
  ])

  return NextResponse.json(updated)
}
