import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// Sanity webhook: sync product inventory records when products are created/updated/deleted
// Configure in Sanity: Settings > API > Webhooks > Add webhook
// URL: https://blossomjewellery.art/api/sanity/webhook
// Trigger: Create, Update, Delete on "product" type
// Secret: SANITY_WEBHOOK_SECRET env var

interface SanityVariant {
  name: string
  inStock?: boolean
}

export async function POST(req: NextRequest) {
  const secret = process.env.SANITY_WEBHOOK_SECRET
  if (secret) {
    const headerSecret = req.headers.get('x-sanity-webhook-secret')
    if (headerSecret !== secret) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
  }

  const body = await req.json()
  const { _type, _id, inStock, variants, transition } = body as {
    _type: string
    _id: string
    inStock?: boolean
    variants?: SanityVariant[]
    transition?: string
  }

  if (_type !== 'product') {
    return NextResponse.json({ skipped: true, reason: 'Not a product' })
  }

  // Handle delete: deactivate inventory tracking
  if (transition === 'disappear') {
    await db.inventory.updateMany({
      where: { sanityProductId: _id },
      data: { trackInventory: false, quantityTotal: 0 },
    })
    return NextResponse.json({ deleted: true, productId: _id })
  }

  // Upsert base product inventory
  await db.inventory.upsert({
    where: {
      sanityProductId_sanityVariantKey: {
        sanityProductId: _id,
        sanityVariantKey: "",
      },
    },
    update: {
      quantityTotal: inStock ? Math.max(1, 0) : 0,
      trackInventory: true,
    },
    create: {
      sanityProductId: _id,
      sanityVariantKey: "",
      quantityTotal: inStock ? 1 : 0,
      trackInventory: true,
    },
  })

  // Upsert variant-level inventory if variants exist
  if (variants && variants.length > 0) {
    for (const variant of variants) {
      await db.inventory.upsert({
        where: {
          sanityProductId_sanityVariantKey: {
            sanityProductId: _id,
            sanityVariantKey: variant.name,
          },
        },
        update: {
          quantityTotal: variant.inStock ? 1 : 0,
          trackInventory: true,
        },
        create: {
          sanityProductId: _id,
          sanityVariantKey: variant.name,
          quantityTotal: variant.inStock ? 1 : 0,
          trackInventory: true,
        },
      })
    }
  }

  return NextResponse.json({ synced: true, productId: _id })
}
