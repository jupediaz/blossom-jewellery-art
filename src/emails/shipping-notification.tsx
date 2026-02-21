import {
  Button,
  Section,
  Text,
} from '@react-email/components'
import * as React from 'react'
import { EmailLayout } from './components/Layout'

interface ShippingNotificationProps {
  orderNumber: string
  trackingNumber: string
  carrier: string
  estimatedDelivery: string
  items: Array<{ name: string; quantity: number }>
}

export default function ShippingNotification({
  orderNumber = 'BLM-2026-0001',
  trackingNumber = 'ES123456789',
  carrier = 'Correos',
  estimatedDelivery = '3-5 business days',
  items = [
    { name: 'Botanical Earrings', quantity: 1 },
    { name: 'Petal Necklace', quantity: 1 },
  ],
}: ShippingNotificationProps) {
  return (
    <EmailLayout preview={`Order ${orderNumber} has been shipped`}>
      <Section style={content}>
        <Text style={heading}>Your Order Has Shipped</Text>
        <Text style={subtext}>
          Great news! Your handcrafted pieces are on their way to you.
        </Text>
      </Section>

      <Section style={trackingSection}>
        <Text style={label}>Order</Text>
        <Text style={value}>{orderNumber}</Text>

        <Text style={label}>Carrier</Text>
        <Text style={value}>{carrier}</Text>

        <Text style={label}>Tracking Number</Text>
        <Text style={value}>{trackingNumber}</Text>

        <Text style={label}>Estimated Delivery</Text>
        <Text style={value}>{estimatedDelivery}</Text>
      </Section>

      <Section style={content}>
        <Text style={sectionTitle}>Items Shipped</Text>
        {items.map((item, i) => (
          <Text key={i} style={itemText}>
            {item.name} &times; {item.quantity}
          </Text>
        ))}
      </Section>

      <Section style={{ padding: '0 24px 24px', textAlign: 'center' as const }}>
        <Button style={button} href={`https://blossomjewellery.art/account/orders`}>
          View Order Details
        </Button>
      </Section>

      <Section style={content}>
        <Text style={note}>
          Please allow 24 hours for tracking information to update. Each piece
          is carefully wrapped in our signature botanical packaging.
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

const subtext: React.CSSProperties = {
  fontSize: '14px',
  color: '#666',
  margin: '0',
  lineHeight: '1.5',
}

const trackingSection: React.CSSProperties = {
  padding: '16px 24px',
  backgroundColor: '#fafaf9',
  borderRadius: '0',
}

const label: React.CSSProperties = {
  fontSize: '11px',
  fontWeight: 'bold',
  textTransform: 'uppercase',
  letterSpacing: '0.1em',
  color: '#999',
  margin: '12px 0 2px',
}

const value: React.CSSProperties = {
  fontSize: '14px',
  fontWeight: 'bold',
  margin: '0',
}

const sectionTitle: React.CSSProperties = {
  fontSize: '11px',
  fontWeight: 'bold',
  textTransform: 'uppercase',
  letterSpacing: '0.1em',
  color: '#999',
  margin: '0 0 8px',
}

const itemText: React.CSSProperties = {
  fontSize: '14px',
  margin: '4px 0',
}

const button: React.CSSProperties = {
  backgroundColor: '#1a1a1a',
  color: '#ffffff',
  padding: '12px 24px',
  borderRadius: '8px',
  fontSize: '14px',
  fontWeight: 'bold',
  textDecoration: 'none',
}

const note: React.CSSProperties = {
  fontSize: '13px',
  color: '#666',
  lineHeight: '1.6',
  fontStyle: 'italic',
}
