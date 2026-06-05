import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { sendEmail } from '@/lib/email'
import { z } from 'zod'

const updateSchema = z.object({
  status: z.enum(['UNDER_REVIEW', 'APPROVED', 'REJECTED', 'COMPLETED']),
  resolution: z.enum(['REFUND', 'EXCHANGE', 'STORE_CREDIT']).optional(),
  adminNote: z.string().max(1000).optional(),
})

const RESOLUTION_LABELS: Record<string, string> = {
  REFUND: 'a full refund',
  EXCHANGE: 'an exchange',
  STORE_CREDIT: 'store credit',
}

function buildReturnStatusEmail({
  orderNumber,
  status,
  resolution,
  adminNote,
}: {
  orderNumber: string
  status: string
  resolution?: string | null
  adminNote?: string | null
}) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.blossombyolha.com'

  const statusMessages: Record<string, { subject: string; heading: string; body: string }> = {
    UNDER_REVIEW: {
      subject: `Return request under review — ${orderNumber}`,
      heading: 'Your return request is under review',
      body: "We've received your return request and our team is reviewing it. We'll get back to you within 1–2 business days.",
    },
    APPROVED: {
      subject: `Return approved — ${orderNumber}`,
      heading: 'Your return has been approved',
      body: resolution
        ? `Great news! Your return request has been approved. We'll process ${RESOLUTION_LABELS[resolution] ?? resolution} for you shortly.`
        : 'Great news! Your return request has been approved. We will be in touch with the next steps.',
    },
    REJECTED: {
      subject: `Return request update — ${orderNumber}`,
      heading: 'Return request update',
      body: "After reviewing your return request, we're unable to process it at this time. Please see the note below for more details, or contact us if you have any questions.",
    },
    COMPLETED: {
      subject: `Return completed — ${orderNumber}`,
      heading: 'Your return has been completed',
      body: 'Your return has been fully processed. Thank you for your patience.',
    },
  }

  const msg = statusMessages[status]
  if (!msg) return null

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f9f6f2;font-family:Georgia,serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9f6f2;padding:40px 20px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;overflow:hidden;max-width:600px;width:100%;">
        <tr>
          <td style="background:#2c2c2c;padding:28px 40px;text-align:center;">
            <p style="margin:0;font-family:Georgia,serif;font-size:22px;font-weight:400;color:#fff;letter-spacing:2px;">BLOSSOM BY OLHA</p>
          </td>
        </tr>
        <tr>
          <td style="padding:40px;">
            <h1 style="margin:0 0 16px;font-size:22px;font-weight:400;color:#2c2c2c;">${msg.heading}</h1>
            <p style="margin:0 0 16px;font-size:15px;color:#666;line-height:1.6;">Order: <strong>${orderNumber}</strong></p>
            <p style="margin:0 0 24px;font-size:15px;color:#444;line-height:1.7;">${msg.body}</p>
            ${adminNote ? `<div style="background:#f5f5f5;border-left:3px solid #2c2c2c;padding:12px 16px;margin-bottom:24px;border-radius:4px;"><p style="margin:0;font-size:14px;color:#444;font-style:italic;">${adminNote}</p></div>` : ''}
            <a href="${baseUrl}/account/returns" style="display:inline-block;background:#2c2c2c;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-size:14px;letter-spacing:0.5px;">View My Returns</a>
          </td>
        </tr>
        <tr>
          <td style="padding:24px 40px;border-top:1px solid #eee;text-align:center;">
            <p style="margin:0;font-size:12px;color:#aaa;">Questions? Reply to this email or contact us at <a href="mailto:hello@blossombyolha.com" style="color:#2c2c2c;">hello@blossombyolha.com</a></p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`

  return { subject: msg.subject, html }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth()
  if (!session?.user || (session.user.role !== 'ADMIN' && session.user.role !== 'STORE_OWNER')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { id } = await params
  const body = await req.json()
  const parsed = updateSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })

  const returnRequest = await db.return.update({
    where: { id },
    data: {
      status: parsed.data.status,
      resolution: parsed.data.resolution ?? null,
      adminNote: parsed.data.adminNote ?? null,
    },
    include: {
      order: {
        select: {
          orderNumber: true,
          customer: { select: { email: true } },
          guestEmail: true,
        },
      },
    },
  })

  // Send notification email to customer (fire and forget)
  const customerEmail = returnRequest.order.customer?.email || returnRequest.order.guestEmail
  if (customerEmail) {
    const email = buildReturnStatusEmail({
      orderNumber: returnRequest.order.orderNumber,
      status: parsed.data.status,
      resolution: parsed.data.resolution,
      adminNote: parsed.data.adminNote,
    })
    if (email) {
      sendEmail({ to: customerEmail, subject: email.subject, html: email.html }).catch(() => {})
    }
  }

  return NextResponse.json({ return: returnRequest })
}
