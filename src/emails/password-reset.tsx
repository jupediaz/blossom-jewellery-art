import {
  Button,
  Section,
  Text,
} from '@react-email/components'
import * as React from 'react'
import { EmailLayout } from './components/Layout'

interface PasswordResetProps {
  resetUrl: string
}

export default function PasswordReset({
  resetUrl = 'https://www.blossombyolha.com/account/reset-password',
}: PasswordResetProps) {
  return (
    <EmailLayout preview="Reset your password — Blossom by Olha">
      <Section style={content}>
        <Text style={heading}>Reset Your Password</Text>
        <Text style={body}>
          We received a request to reset the password for your Blossom by Olha
          account. Click the button below to choose a new password.
        </Text>
        <Text style={body}>
          If you did not request a password reset, you can safely ignore this
          email. Your password will not be changed.
        </Text>
      </Section>

      <Section style={ctaSection}>
        <Button style={button} href={resetUrl}>
          Reset Password
        </Button>
      </Section>

      <Section style={content}>
        <Text style={note}>
          This link will expire in 1 hour. If it has expired, you can request a
          new one from the login page.
        </Text>
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

const note: React.CSSProperties = {
  fontSize: '12px',
  color: '#999',
  lineHeight: '1.6',
  margin: '0 0 16px',
}

const signature: React.CSSProperties = {
  fontSize: '14px',
  color: '#333',
  lineHeight: '1.6',
  fontStyle: 'italic',
}
