import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { sendEmail } from '@/lib/email'
import { render } from '@react-email/render'
import CartRecovery from '@/emails/cart-recovery'

// This endpoint should be called by a cron job (e.g., Vercel Cron, Railway Cron)
// every 15 minutes to check for abandoned carts.
// Protect with a secret key in production.

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const now = new Date()
  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000)
  const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)
  const fortyEightHoursAgo = new Date(now.getTime() - 48 * 60 * 60 * 1000)

  const stats = { checked: 0, emailsSent: 0, errors: 0 }

  // Find carts that need recovery emails
  const abandonedCarts = await db.cartSession.findMany({
    where: {
      abandonedAt: { not: null },
      convertedOrderId: null,
      recoveredAt: null,
    },
    include: {
      customer: true,
    },
  })

  stats.checked = abandonedCarts.length

  for (const cart of abandonedCarts) {
    const email = cart.customer?.email
    if (!email) continue

    const items = cart.items as Array<{ name: string; price: number; image?: string }>
    const subtotal = Number(cart.subtotal)
    const recoveryUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://blossomjewellery.art'}/cart/recover/${cart.sessionToken}`

    try {
      // Determine which stage of recovery email to send
      const abandonedAt = cart.abandonedAt!
      const timeSinceAbandonment = now.getTime() - abandonedAt.getTime()
      const hoursSinceAbandonment = timeSinceAbandonment / (1000 * 60 * 60)

      let stage: '1h' | '24h' | '48h' | null = null

      if (hoursSinceAbandonment >= 1 && hoursSinceAbandonment < 2) {
        // Check if 1h email already sent
        const alreadySent = await db.emailLog.findFirst({
          where: { to: email, type: 'CART_RECOVERY_1H', metadata: { path: ['cartSessionId'], equals: cart.id } },
        })
        if (!alreadySent) stage = '1h'
      } else if (hoursSinceAbandonment >= 24 && hoursSinceAbandonment < 25) {
        const alreadySent = await db.emailLog.findFirst({
          where: { to: email, type: 'CART_RECOVERY_24H', metadata: { path: ['cartSessionId'], equals: cart.id } },
        })
        if (!alreadySent) stage = '24h'
      } else if (hoursSinceAbandonment >= 48 && hoursSinceAbandonment < 49) {
        const alreadySent = await db.emailLog.findFirst({
          where: { to: email, type: 'CART_RECOVERY_48H', metadata: { path: ['cartSessionId'], equals: cart.id } },
        })
        if (!alreadySent) stage = '48h'
      }

      if (!stage) continue

      // For 48h stage, generate a unique discount code
      let discountCode: string | undefined
      if (stage === '48h') {
        discountCode = `BLOSSOM10-${cart.id.slice(-6).toUpperCase()}`
        // Create the coupon in DB
        const existing = await db.coupon.findUnique({ where: { code: discountCode } })
        if (!existing) {
          await db.coupon.create({
            data: {
              code: discountCode,
              type: 'PERCENTAGE',
              value: 10,
              maxUses: 1,
              maxUsesPerCustomer: 1,
              validFrom: now,
              validUntil: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000), // 7 days
            },
          })
        }
      }

      const subjects: Record<string, string> = {
        '1h': 'You left something beautiful behind',
        '24h': 'Still thinking about it?',
        '48h': 'A little gift for you — 10% off your cart',
      }

      const html = await render(
        CartRecovery({
          stage,
          items,
          subtotal,
          recoveryUrl,
          discountCode,
        })
      )

      await sendEmail({
        to: email,
        subject: subjects[stage],
        html,
      })

      const emailType = stage === '1h'
        ? 'CART_RECOVERY_1H' as const
        : stage === '24h'
          ? 'CART_RECOVERY_24H' as const
          : 'CART_RECOVERY_48H' as const

      await db.emailLog.create({
        data: {
          to: email,
          type: emailType,
          subject: subjects[stage],
          metadata: { cartSessionId: cart.id, stage },
        },
      })

      await db.cartSession.update({
        where: { id: cart.id },
        data: { recoveryEmailSent: now },
      })

      stats.emailsSent++
    } catch (error) {
      console.error(`Failed to send recovery email for cart ${cart.id}:`, error)
      stats.errors++
    }
  }

  // Also detect newly abandoned carts (active carts with no activity for 1+ hour)
  const newlyAbandoned = await db.cartSession.updateMany({
    where: {
      abandonedAt: null,
      convertedOrderId: null,
      lastActivityAt: { lt: oneHourAgo },
      customerId: { not: null },
    },
    data: { abandonedAt: now },
  })

  return NextResponse.json({
    ...stats,
    newlyAbandoned: newlyAbandoned.count,
  })
}
