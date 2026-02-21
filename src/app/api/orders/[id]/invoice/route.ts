import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { jsPDF } from 'jspdf'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params

  const order = await db.order.findUnique({
    where: { id },
    include: {
      items: true,
      customer: { select: { email: true, name: true } },
    },
  })

  if (!order) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 })
  }

  // Verify access: admin or order owner
  const isAdmin = session.user.role === 'ADMIN' || session.user.role === 'PRODUCT_MANAGER'
  const isOwner = order.customerId === session.user.id
  if (!isAdmin && !isOwner) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  // Generate PDF invoice
  const doc = new jsPDF()
  const margin = 20
  let y = margin

  // Header
  doc.setFontSize(20)
  doc.text('BLOSSOM JEWELLERY ART', margin, y)
  y += 8
  doc.setFontSize(9)
  doc.setTextColor(100)
  doc.text('Handcrafted polymer clay jewelry | Marbella, Spain', margin, y)
  y += 4
  doc.text('hello@blossomjewellery.art', margin, y)
  y += 12

  // Invoice title
  doc.setFontSize(14)
  doc.setTextColor(0)
  doc.text('INVOICE', margin, y)
  y += 8

  // Order details
  doc.setFontSize(9)
  doc.setTextColor(100)
  doc.text(`Order: ${order.orderNumber}`, margin, y)
  doc.text(
    `Date: ${order.createdAt.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}`,
    120,
    y
  )
  y += 5

  const customerName = order.customer?.name || order.guestName || 'Guest'
  const customerEmail = order.customer?.email || order.guestEmail || ''
  doc.text(`Customer: ${customerName}`, margin, y)
  doc.text(`Email: ${customerEmail}`, 120, y)
  y += 5

  // Shipping address
  const addr = order.shippingAddress as Record<string, string>
  if (addr.line1) {
    doc.text(`Ship to: ${addr.name || ''}, ${addr.line1}, ${addr.city} ${addr.postalCode}, ${addr.country}`, margin, y)
    y += 8
  }

  // Line separator
  doc.setDrawColor(200)
  doc.line(margin, y, 190, y)
  y += 6

  // Table header
  doc.setFontSize(8)
  doc.setTextColor(100)
  doc.text('ITEM', margin, y)
  doc.text('QTY', 120, y, { align: 'center' })
  doc.text('PRICE', 150, y, { align: 'right' })
  doc.text('TOTAL', 185, y, { align: 'right' })
  y += 4
  doc.line(margin, y, 190, y)
  y += 5

  // Items
  doc.setTextColor(30)
  doc.setFontSize(9)

  for (const item of order.items) {
    const name = item.variantName
      ? `${item.productName} (${item.variantName})`
      : item.productName

    // Truncate long names
    const displayName = name.length > 50 ? name.substring(0, 47) + '...' : name

    doc.text(displayName, margin, y)
    doc.text(String(item.quantity), 120, y, { align: 'center' })
    doc.text(`€${Number(item.unitPrice).toFixed(2)}`, 150, y, { align: 'right' })
    doc.text(`€${Number(item.totalPrice).toFixed(2)}`, 185, y, { align: 'right' })
    y += 6
  }

  // Totals
  y += 4
  doc.line(margin, y, 190, y)
  y += 6

  doc.setTextColor(100)
  doc.text('Subtotal', 140, y, { align: 'right' })
  doc.setTextColor(30)
  doc.text(`€${Number(order.subtotal).toFixed(2)}`, 185, y, { align: 'right' })
  y += 5

  if (Number(order.discountAmount) > 0) {
    doc.setTextColor(100)
    doc.text('Discount', 140, y, { align: 'right' })
    doc.setTextColor(30)
    doc.text(`-€${Number(order.discountAmount).toFixed(2)}`, 185, y, { align: 'right' })
    y += 5
  }

  doc.setTextColor(100)
  doc.text('Shipping', 140, y, { align: 'right' })
  doc.setTextColor(30)
  doc.text(
    Number(order.shippingCost) > 0 ? `€${Number(order.shippingCost).toFixed(2)}` : 'Free',
    185,
    y,
    { align: 'right' }
  )
  y += 7

  doc.setFontSize(11)
  doc.text('Total', 140, y, { align: 'right' })
  doc.text(`€${Number(order.total).toFixed(2)}`, 185, y, { align: 'right' })
  y += 15

  // Footer
  doc.setFontSize(8)
  doc.setTextColor(150)
  doc.text('Thank you for supporting handmade artisan jewelry.', margin, y)
  y += 4
  doc.text('Each piece is handcrafted with love in Marbella, Spain.', margin, y)

  const pdfBuffer = doc.output('arraybuffer')

  return new NextResponse(pdfBuffer, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="invoice-${order.orderNumber}.pdf"`,
    },
  })
}
