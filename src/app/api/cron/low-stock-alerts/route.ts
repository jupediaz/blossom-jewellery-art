import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { sendEmail } from '@/lib/email'
import { siteConfig } from '@/lib/env'

// Called by a scheduled cron job (e.g., daily).
// Protect with CRON_SECRET in production.

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const lowStockItems = await db.$queryRaw<
      Array<{
        id: string
        sanityProductId: string
        sanityVariantKey: string | null
        sku: string | null
        quantityTotal: number
        quantityReserved: number
        lowStockThreshold: number
      }>
    >`
      SELECT id, "sanityProductId", "sanityVariantKey", sku,
             "quantityTotal", "quantityReserved", "lowStockThreshold"
      FROM "Inventory"
      WHERE "trackInventory" = true
        AND ("quantityTotal" - "quantityReserved") <= "lowStockThreshold"
        AND ("quantityTotal" - "quantityReserved") > 0
      ORDER BY ("quantityTotal" - "quantityReserved") ASC
    `

    if (lowStockItems.length === 0) {
      return NextResponse.json({ sent: false, reason: 'No low stock items' })
    }

    const rows = lowStockItems
      .map(
        (item) =>
          `<tr style="border-bottom:1px solid #eee">
            <td style="padding:8px 12px">${item.sku ?? item.sanityProductId}</td>
            <td style="padding:8px 12px">${item.sanityVariantKey ?? '—'}</td>
            <td style="padding:8px 12px;font-weight:bold;color:#d97706">${item.quantityTotal - item.quantityReserved} left</td>
            <td style="padding:8px 12px;color:#6b7280">Threshold: ${item.lowStockThreshold}</td>
          </tr>`
      )
      .join('')

    await sendEmail({
      to: siteConfig.email,
      subject: `[${siteConfig.name}] Low Stock Alert — ${lowStockItems.length} item${lowStockItems.length === 1 ? '' : 's'}`,
      html: `
        <h2 style="font-family:sans-serif">Low Stock Alert</h2>
        <p style="font-family:sans-serif;color:#6b7280">
          The following items are at or below their low-stock threshold:
        </p>
        <table style="border-collapse:collapse;width:100%;font-family:sans-serif;font-size:14px">
          <thead>
            <tr style="background:#f9fafb">
              <th style="padding:8px 12px;text-align:left">SKU / Product ID</th>
              <th style="padding:8px 12px;text-align:left">Variant</th>
              <th style="padding:8px 12px;text-align:left">Available</th>
              <th style="padding:8px 12px;text-align:left">Threshold</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
        <p style="font-family:sans-serif;margin-top:24px">
          <a href="${siteConfig.url}/admin/inventory" style="color:#3b82f6">
            Manage Inventory →
          </a>
        </p>
      `,
    })

    return NextResponse.json({ sent: true, count: lowStockItems.length })
  } catch (err) {
    console.error('[Cron] Low stock alert failed:', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
