import { Button, Section, Text } from '@react-email/components'
import * as React from 'react'
import { EmailLayout } from './components/Layout'

interface EmailVerificationProps {
  verifyUrl: string
  name?: string
}

export default function EmailVerification({
  verifyUrl = 'https://www.blossombyolha.com/account/verify-email',
  name = 'there',
}: EmailVerificationProps) {
  return (
    <EmailLayout preview="Verify your email — Blossom by Olha">
      <Section style={content}>
        <Text style={heading}>Verify Your Email Address</Text>
        <Text style={body}>
          Hi {name}, thank you for creating an account with Blossom by Olha!
          Please click the button below to verify your email address.
        </Text>
        <Text style={body}>
          This link will expire in 24 hours. If you did not create an account,
          you can safely ignore this email.
        </Text>
      </Section>

      <Section style={ctaSection}>
        <Button style={button} href={verifyUrl}>
          Verify Email Address
        </Button>
      </Section>

      <Section style={content}>
        <Text style={signature}>
          With love,
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
const heading: React.CSSProperties = { fontSize: '22px', fontWeight: 'normal', margin: '0 0 16px' }
const body: React.CSSProperties = { fontSize: '14px', color: '#333', lineHeight: '1.7', margin: '0 0 12px' }
const ctaSection: React.CSSProperties = { padding: '0 24px 24px', textAlign: 'center' as const }
const button: React.CSSProperties = {
  backgroundColor: '#1a1a1a', color: '#ffffff', padding: '12px 32px',
  borderRadius: '8px', fontSize: '14px', fontWeight: 'bold', textDecoration: 'none',
}
const signature: React.CSSProperties = { fontSize: '14px', color: '#333', lineHeight: '1.6', fontStyle: 'italic' }
