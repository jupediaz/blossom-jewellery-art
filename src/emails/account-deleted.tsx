import { Section, Text } from '@react-email/components'
import * as React from 'react'
import { EmailLayout } from './components/Layout'

interface AccountDeletedProps {
  name?: string
}

export default function AccountDeleted({ name = 'there' }: AccountDeletedProps) {
  return (
    <EmailLayout preview="Your Blossom account has been deleted">
      <Section style={content}>
        <Text style={heading}>Goodbye, {name}</Text>
        <Text style={body}>
          Your account at Blossom by Olha has been permanently deleted as requested. All
          your personal data, addresses, and wishlist have been removed from our systems.
        </Text>
        <Text style={body}>
          Your order history has been anonymized and retained for legal and accounting
          purposes only — it is no longer linked to your identity.
        </Text>
        <Text style={body}>
          If this was a mistake or you didn&apos;t request this deletion, please contact
          us immediately at{' '}
          <a href="mailto:hello@blossombyolha.com" style={{ color: '#1a1a1a' }}>
            hello@blossombyolha.com
          </a>
          .
        </Text>
        <Text style={signature}>
          Warm regards,
          <br />
          Olha
          <br />
          <span style={{ fontSize: '12px', color: '#999' }}>
            Founder &amp; Artist, Blossom by Olha
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

const signature: React.CSSProperties = {
  fontSize: '14px',
  color: '#333',
  lineHeight: '1.6',
  fontStyle: 'italic',
  marginTop: '24px',
}
