import {
  Button,
  Column,
  Img,
  Row,
  Section,
  Text,
} from '@react-email/components'
import * as React from 'react'
import { EmailLayout } from './components/Layout'

interface CartItem {
  name: string
  price: number
  image?: string
}

interface CartRecoveryProps {
  stage: '1h' | '24h' | '48h'
  items: CartItem[]
  subtotal: number
  recoveryUrl: string
  discountCode?: string
}

export default function CartRecovery({
  stage = '1h',
  items = [
    { name: 'Botanical Earrings', price: 45 },
    { name: 'Petal Necklace', price: 65 },
  ],
  subtotal = 110,
  recoveryUrl = 'https://blossomjewellery.art/cart/recover/abc123',
  discountCode,
}: CartRecoveryProps) {
  const headlines: Record<string, { heading: string; body: string }> = {
    '1h': {
      heading: 'You left something beautiful behind',
      body: 'Your handcrafted pieces are waiting for you. Each one is a unique work of art — don\'t let them slip away.',
    },
    '24h': {
      heading: 'Still thinking about it?',
      body: 'Your cart is saved, but our pieces are one-of-a-kind and may sell out. Come back and complete your order.',
    },
    '48h': {
      heading: 'A little gift for you',
      body: 'We noticed you haven\'t completed your order. Here\'s a special thank-you for being part of our community.',
    },
  }

  const { heading, body } = headlines[stage]

  return (
    <EmailLayout preview={heading}>
      <Section style={content}>
        <Text style={headingStyle}>{heading}</Text>
        <Text style={bodyStyle}>{body}</Text>
      </Section>

      {discountCode && (
        <Section style={discountSection}>
          <Text style={discountLabel}>Your exclusive discount code</Text>
          <Text style={discountCodeStyle}>{discountCode}</Text>
          <Text style={discountNote}>10% off your order</Text>
        </Section>
      )}

      <Section style={itemsSection}>
        <Text style={sectionTitle}>Your Cart</Text>
        {items.map((item, i) => (
          <Row key={i} style={itemRow}>
            <Column style={{ width: '56px' }}>
              {item.image ? (
                <Img
                  src={item.image}
                  width="56"
                  height="56"
                  alt={item.name}
                  style={itemImage}
                />
              ) : (
                <div style={imagePlaceholder} />
              )}
            </Column>
            <Column style={{ paddingLeft: '12px' }}>
              <Text style={itemName}>{item.name}</Text>
              <Text style={itemPrice}>&euro;{item.price.toFixed(2)}</Text>
            </Column>
          </Row>
        ))}
        <Text style={subtotalText}>
          Subtotal: &euro;{subtotal.toFixed(2)}
        </Text>
      </Section>

      <Section style={ctaSection}>
        <Button style={button} href={recoveryUrl}>
          Complete Your Order
        </Button>
      </Section>

      <Section style={content}>
        <Text style={note}>
          Questions? Simply reply to this email — we are always happy to help.
        </Text>
      </Section>
    </EmailLayout>
  )
}

const content: React.CSSProperties = { padding: '24px' }

const headingStyle: React.CSSProperties = {
  fontSize: '22px',
  fontWeight: 'normal',
  margin: '0 0 8px',
}

const bodyStyle: React.CSSProperties = {
  fontSize: '14px',
  color: '#333',
  lineHeight: '1.7',
  margin: '0',
}

const discountSection: React.CSSProperties = {
  margin: '0 24px',
  padding: '20px',
  backgroundColor: '#fdf2f8',
  borderRadius: '12px',
  textAlign: 'center' as const,
}

const discountLabel: React.CSSProperties = {
  fontSize: '11px',
  fontWeight: 'bold',
  textTransform: 'uppercase',
  letterSpacing: '0.1em',
  color: '#999',
  margin: '0 0 4px',
}

const discountCodeStyle: React.CSSProperties = {
  fontSize: '28px',
  fontWeight: 'bold',
  letterSpacing: '0.15em',
  margin: '4px 0',
  color: '#be185d',
}

const discountNote: React.CSSProperties = {
  fontSize: '13px',
  color: '#666',
  margin: '4px 0 0',
}

const itemsSection: React.CSSProperties = {
  padding: '16px 24px',
}

const sectionTitle: React.CSSProperties = {
  fontSize: '11px',
  fontWeight: 'bold',
  textTransform: 'uppercase',
  letterSpacing: '0.1em',
  color: '#999',
  margin: '0 0 12px',
}

const itemRow: React.CSSProperties = {
  padding: '8px 0',
  borderBottom: '1px solid #f0f0f0',
}

const itemImage: React.CSSProperties = {
  borderRadius: '8px',
  objectFit: 'cover',
}

const imagePlaceholder: React.CSSProperties = {
  width: '56px',
  height: '56px',
  backgroundColor: '#f0f0f0',
  borderRadius: '8px',
}

const itemName: React.CSSProperties = {
  fontSize: '14px',
  fontWeight: 'bold',
  margin: '0',
}

const itemPrice: React.CSSProperties = {
  fontSize: '13px',
  color: '#666',
  margin: '2px 0 0',
}

const subtotalText: React.CSSProperties = {
  fontSize: '14px',
  fontWeight: 'bold',
  margin: '12px 0 0',
  textAlign: 'right' as const,
}

const ctaSection: React.CSSProperties = {
  padding: '0 24px 24px',
  textAlign: 'center' as const,
}

const button: React.CSSProperties = {
  backgroundColor: '#1a1a1a',
  color: '#ffffff',
  padding: '14px 32px',
  borderRadius: '8px',
  fontSize: '14px',
  fontWeight: 'bold',
  textDecoration: 'none',
}

const note: React.CSSProperties = {
  fontSize: '13px',
  color: '#999',
  lineHeight: '1.5',
}
