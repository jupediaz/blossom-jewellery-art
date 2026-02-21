import {
  Button,
  Section,
  Text,
} from '@react-email/components'
import * as React from 'react'
import { EmailLayout } from './components/Layout'

interface WelcomeProps {
  name: string
}

export default function Welcome({ name = 'there' }: WelcomeProps) {
  return (
    <EmailLayout preview="Welcome to Blossom Jewellery Art">
      <Section style={content}>
        <Text style={heading}>Welcome, {name}</Text>
        <Text style={body}>
          Thank you for creating an account with Blossom Jewellery Art. Each
          piece in our collection is handcrafted from polymer clay, inspired by
          the organic beauty of botanical forms.
        </Text>
        <Text style={body}>
          As a member, you can track your orders, save your favorite pieces to
          your wishlist, and enjoy a seamless checkout experience.
        </Text>
      </Section>

      <Section style={ctaSection}>
        <Button
          style={button}
          href="https://blossomjewellery.art/products"
        >
          Explore the Collection
        </Button>
      </Section>

      <Section style={content}>
        <Text style={signature}>
          With love,
          <br />
          Olha
          <br />
          <span style={{ fontSize: '12px', color: '#999' }}>
            Founder &amp; Artist, Blossom Jewellery Art
          </span>
        </Text>
      </Section>
    </EmailLayout>
  )
}

const content: React.CSSProperties = { padding: '24px' }

const heading: React.CSSProperties = {
  fontSize: '22px',
  fontWeight: 'normal',
  margin: '0 0 16px',
}

const body: React.CSSProperties = {
  fontSize: '14px',
  color: '#333',
  lineHeight: '1.7',
  margin: '0 0 12px',
}

const ctaSection: React.CSSProperties = {
  padding: '0 24px 24px',
  textAlign: 'center' as const,
}

const button: React.CSSProperties = {
  backgroundColor: '#1a1a1a',
  color: '#ffffff',
  padding: '12px 32px',
  borderRadius: '8px',
  fontSize: '14px',
  fontWeight: 'bold',
  textDecoration: 'none',
}

const signature: React.CSSProperties = {
  fontSize: '14px',
  color: '#333',
  lineHeight: '1.6',
  fontStyle: 'italic',
}
