import {
  Column,
  Img,
  Row,
  Section,
  Text,
} from '@react-email/components'
import * as React from 'react'
import { EmailLayout } from './components/Layout'

interface OrderItem {
  name: string
  quantity: number
  unitPrice: number
  totalPrice: number
  image?: string
  variant?: string
}

interface OrderConfirmationProps {
  orderNumber: string
  items: OrderItem[]
  subtotal: number
  shippingCost: number
  discountAmount: number
  total: number
  shippingAddress: {
    name: string
    line1: string
    city: string
    postalCode: string
    country: string
  }
}

export default function OrderConfirmation({
  orderNumber = 'BLM-2026-0001',
  items = [
    { name: 'Botanical Earrings', quantity: 1, unitPrice: 45, totalPrice: 45 },
    { name: 'Petal Necklace', quantity: 1, unitPrice: 65, totalPrice: 65 },
  ],
  subtotal = 110,
  shippingCost = 0,
  discountAmount = 0,
  total = 110,
  shippingAddress = {
    name: 'Jane Doe',
    line1: 'Calle Mayor 1',
    city: 'Marbella',
    postalCode: '29601',
    country: 'ES',
  },
}: OrderConfirmationProps) {
  return (
    <EmailLayout preview={`Order ${orderNumber} confirmed`}>
      <Section style={content}>
        <Text style={heading}>Order Confirmed</Text>
        <Text style={subheading}>
          Thank you for your order. We are preparing your handcrafted pieces
          with care.
        </Text>
        <Text style={orderNum}>Order: {orderNumber}</Text>
      </Section>

      <Section style={itemsSection}>
        {items.map((item, i) => (
          <Row key={i} style={itemRow}>
            <Column style={{ width: '48px' }}>
              {item.image ? (
                <Img
                  src={item.image}
                  width="48"
                  height="48"
                  alt={item.name}
                  style={itemImage}
                />
              ) : (
                <div style={imagePlaceholder} />
              )}
            </Column>
            <Column style={itemDetails}>
              <Text style={itemName}>{item.name}</Text>
              {item.variant && (
                <Text style={itemVariant}>{item.variant}</Text>
              )}
              <Text style={itemQty}>Qty: {item.quantity}</Text>
            </Column>
            <Column style={itemPrice}>
              <Text style={priceText}>
                &euro;{item.totalPrice.toFixed(2)}
              </Text>
            </Column>
          </Row>
        ))}
      </Section>

      <Section style={totalsSection}>
        <Row>
          <Column>
            <Text style={totalLabel}>Subtotal</Text>
          </Column>
          <Column style={{ textAlign: 'right' as const }}>
            <Text style={totalValue}>&euro;{subtotal.toFixed(2)}</Text>
          </Column>
        </Row>
        {discountAmount > 0 && (
          <Row>
            <Column>
              <Text style={{ ...totalLabel, color: '#059669' }}>Discount</Text>
            </Column>
            <Column style={{ textAlign: 'right' as const }}>
              <Text style={{ ...totalValue, color: '#059669' }}>
                -&euro;{discountAmount.toFixed(2)}
              </Text>
            </Column>
          </Row>
        )}
        <Row>
          <Column>
            <Text style={totalLabel}>Shipping</Text>
          </Column>
          <Column style={{ textAlign: 'right' as const }}>
            <Text style={totalValue}>
              {shippingCost > 0 ? `€${shippingCost.toFixed(2)}` : 'Free'}
            </Text>
          </Column>
        </Row>
        <Row>
          <Column>
            <Text style={grandTotalLabel}>Total</Text>
          </Column>
          <Column style={{ textAlign: 'right' as const }}>
            <Text style={grandTotalValue}>&euro;{total.toFixed(2)}</Text>
          </Column>
        </Row>
      </Section>

      <Section style={addressSection}>
        <Text style={sectionTitle}>Shipping To</Text>
        <Text style={addressText}>{shippingAddress.name}</Text>
        <Text style={addressText}>{shippingAddress.line1}</Text>
        <Text style={addressText}>
          {shippingAddress.city}, {shippingAddress.postalCode}
        </Text>
        <Text style={addressText}>{shippingAddress.country}</Text>
      </Section>

      <Section style={content}>
        <Text style={note}>
          Each piece is handcrafted with care. We will notify you when your
          order ships with tracking information.
        </Text>
      </Section>
    </EmailLayout>
  )
}

const content: React.CSSProperties = { padding: '24px' }

const heading: React.CSSProperties = {
  fontSize: '22px',
  fontWeight: 'normal',
  margin: '0 0 8px',
}

const subheading: React.CSSProperties = {
  fontSize: '14px',
  color: '#666',
  margin: '0 0 16px',
  lineHeight: '1.5',
}

const orderNum: React.CSSProperties = {
  fontSize: '14px',
  fontWeight: 'bold',
  margin: '0',
  padding: '12px 16px',
  backgroundColor: '#fafaf9',
  borderRadius: '8px',
}

const itemsSection: React.CSSProperties = {
  padding: '0 24px',
}

const itemRow: React.CSSProperties = {
  padding: '12px 0',
  borderBottom: '1px solid #f0f0f0',
}

const itemImage: React.CSSProperties = {
  borderRadius: '8px',
  objectFit: 'cover',
}

const imagePlaceholder: React.CSSProperties = {
  width: '48px',
  height: '48px',
  backgroundColor: '#f0f0f0',
  borderRadius: '8px',
}

const itemDetails: React.CSSProperties = {
  paddingLeft: '12px',
  verticalAlign: 'top',
}

const itemName: React.CSSProperties = {
  fontSize: '14px',
  fontWeight: 'bold',
  margin: '0',
}

const itemVariant: React.CSSProperties = {
  fontSize: '12px',
  color: '#666',
  margin: '2px 0 0',
}

const itemQty: React.CSSProperties = {
  fontSize: '12px',
  color: '#999',
  margin: '2px 0 0',
}

const itemPrice: React.CSSProperties = {
  textAlign: 'right' as const,
  verticalAlign: 'top',
}

const priceText: React.CSSProperties = {
  fontSize: '14px',
  fontWeight: 'bold',
  margin: '0',
}

const totalsSection: React.CSSProperties = {
  padding: '16px 24px',
  borderTop: '2px solid #1a1a1a',
}

const totalLabel: React.CSSProperties = {
  fontSize: '13px',
  color: '#666',
  margin: '4px 0',
}

const totalValue: React.CSSProperties = {
  fontSize: '13px',
  margin: '4px 0',
  textAlign: 'right' as const,
}

const grandTotalLabel: React.CSSProperties = {
  fontSize: '16px',
  fontWeight: 'bold',
  margin: '8px 0 0',
}

const grandTotalValue: React.CSSProperties = {
  fontSize: '16px',
  fontWeight: 'bold',
  margin: '8px 0 0',
  textAlign: 'right' as const,
}

const addressSection: React.CSSProperties = {
  padding: '16px 24px',
  backgroundColor: '#fafaf9',
}

const sectionTitle: React.CSSProperties = {
  fontSize: '11px',
  fontWeight: 'bold',
  textTransform: 'uppercase',
  letterSpacing: '0.1em',
  color: '#999',
  margin: '0 0 8px',
}

const addressText: React.CSSProperties = {
  fontSize: '13px',
  color: '#333',
  margin: '2px 0',
}

const note: React.CSSProperties = {
  fontSize: '13px',
  color: '#666',
  lineHeight: '1.6',
  fontStyle: 'italic',
}
