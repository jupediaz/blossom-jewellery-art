import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { sendEmail } from '@/lib/email'
import type { MovementType } from '@/generated/prisma/client'

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user || (session.user.role !== 'ADMIN' && session.user.role !== 'STORE_OWNER')) {
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

  const wasOutOfStock = inventory.quantityTotal - inventory.quantityReserved <= 0
  const willBeInStock = newTotal - inventory.quantityReserved > 0

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

  // Restock notification: if went from out-of-stock to in-stock, email wishlist users
  if (wasOutOfStock && willBeInStock) {
    try {
      const wishlistEntries = await db.wishlist.findMany({
        where: { sanityProductId: inventory.sanityProductId },
        include: { user: { select: { email: true, name: true } } },
      })

      for (const entry of wishlistEntries) {
        const already = await db.emailLog.findFirst({
          where: {
            to: entry.user.email,
            type: 'BACK_IN_STOCK',
            metadata: { path: ['sanityProductId'], equals: inventory.sanityProductId },
          },
        })
        if (already) continue

        const productUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://www.blossombyolha.com'}/products`
        await sendEmail({
          to: entry.user.email,
          subject: 'Good news — an item on your wishlist is back in stock',
          html: `
            <div style="max-width:560px;margin:0 auto;font-family:Georgia,serif;color:#1a1a1a;padding:32px 24px">
              <h2 style="font-size:22px;margin:0 0 16px">Back in stock</h2>
              <p style="margin:0 0 16px">Hi ${entry.user.name || 'there'},</p>
              <p style="margin:0 0 24px">An item from your wishlist is back in stock at Blossom by Olha. Don't miss out — pieces like this tend to go quickly.</p>
              <a href="${productUrl}" style="display:inline-block;background:#1a1a1a;color:#fff;padding:12px 28px;text-decoration:none;font-size:13px;letter-spacing:0.1em;text-transform:uppercase">
                Shop Now
              </a>
              <p style="margin:24px 0 0;font-size:12px;color:#999">You're receiving this because you wishlisted this item. <a href="https://www.blossombyolha.com/account" style="color:#999">Manage preferences</a></p>
            </div>
          `,
        })

        await db.emailLog.create({
          data: {
            to: entry.user.email,
            type: 'BACK_IN_STOCK',
            subject: 'Good news — an item on your wishlist is back in stock',
            metadata: { sanityProductId: inventory.sanityProductId },
          },
        })
      }
    } catch (notifyError) {
      console.error('Failed to send restock notifications:', notifyError)
    }
  }

  return NextResponse.json(updated)
}
