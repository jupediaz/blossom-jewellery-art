import {
  Button,
  Section,
  Text,
} from '@react-email/components'
import * as React from 'react'
import { EmailLayout } from './components/Layout'

interface DeliveryConfirmationProps {
  orderNumber: string
  customerName: string
  items: Array<{ name: string; quantity: number }>
}

export default function DeliveryConfirmation({
  orderNumber = 'BLM-2026-0001',
  customerName = 'there',
  items = [
    { name: 'Botanical Earrings', quantity: 1 },
    { name: 'Petal Necklace', quantity: 1 },
  ],
}: DeliveryConfirmationProps) {
  return (
    <EmailLayout preview={`Order ${orderNumber} has been delivered`}>
      <Section style={content}>
        <Text style={heading}>Your Order Has Arrived</Text>
        <Text style={subtext}>
          Hi {customerName}, your handcrafted pieces from Blossom Jewellery Art
          have been delivered. We hope you love them!
        </Text>
      </Section>

      <Section style={orderSection}>
        <Text style={label}>Order</Text>
        <Text style={value}>{orderNumber}</Text>

        <Text style={{ ...label, marginTop: '12px' }}>Items</Text>
        {items.map((item, i) => (
          <Text key={i} style={itemText}>
            {item.name} &times; {item.quantity}
          </Text>
        ))}
      </Section>

      <Section style={content}>
        <Text style={careTitle}>Caring for Your Pieces</Text>
        <Text style={careText}>
          Your polymer clay jewelry is lightweight and durable, but please handle
          with care. Avoid contact with water, perfume, and harsh chemicals. Store
          in a cool, dry place away from direct sunlight.
        </Text>
      </Section>

      <Section style={{ padding: '0 24px 24px', textAlign: 'center' as const }}>
        <Button style={button} href="https://blossomjewellery.art/products">
          Explore More Pieces
        </Button>
      </Section>

      <Section style={content}>
        <Text style={note}>
          If you have any questions or concerns about your order, reply to this
          email — we&apos;re here to help. Thank you for supporting handmade
          artisan jewelry.
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

const orderSection: React.CSSProperties = {
  padding: '16px 24px',
  backgroundColor: '#fafaf9',
}

const label: React.CSSProperties = {
  fontSize: '11px',
  fontWeight: 'bold',
  textTransform: 'uppercase',
  letterSpacing: '0.1em',
  color: '#999',
  margin: '0 0 2px',
}

const value: React.CSSProperties = {
  fontSize: '14px',
  fontWeight: 'bold',
  margin: '0',
}

const itemText: React.CSSProperties = {
  fontSize: '14px',
  margin: '4px 0',
}

const careTitle: React.CSSProperties = {
  fontSize: '14px',
  fontWeight: 'bold',
  margin: '0 0 8px',
}

const careText: React.CSSProperties = {
  fontSize: '13px',
  color: '#555',
  lineHeight: '1.6',
  margin: '0',
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
