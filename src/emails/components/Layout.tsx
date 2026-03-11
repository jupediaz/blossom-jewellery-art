import {
  Body,
  Container,
  Head,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from '@react-email/components'
import * as React from 'react'

interface LayoutProps {
  preview: string
  children: React.ReactNode
}

export function EmailLayout({ preview, children }: LayoutProps) {
  return (
    <Html>
      <Head />
      <Preview>{preview}</Preview>
      <Body style={body}>
        <Container style={container}>
          <Section style={header}>
            <Text style={logo}>Blossom by Olha</Text>
            <Text style={tagline}>Handcrafted polymer clay jewelry</Text>
          </Section>

          {children}

          <Hr style={hr} />

          <Section style={footer}>
            <Text style={footerText}>
              Blossom by Olha &mdash; Marbella, Spain
            </Text>
            <Text style={footerText}>
              Handcrafted with love by Olha
            </Text>
            <Text style={unsubscribeText}>
              If you no longer wish to receive these emails, you can{' '}
              <a href="https://www.blossombyolha.com/account" style={unsubscribeLink}>
                manage your preferences
              </a>{' '}
              in your account settings.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

const body: React.CSSProperties = {
  backgroundColor: '#fafaf9',
  fontFamily: 'Georgia, "Times New Roman", serif',
  color: '#1a1a1a',
}

const container: React.CSSProperties = {
  maxWidth: '600px',
  margin: '0 auto',
  backgroundColor: '#ffffff',
}

const header: React.CSSProperties = {
  textAlign: 'center',
  padding: '32px 24px 24px',
  borderBottom: '2px solid #1a1a1a',
}

const logo: React.CSSProperties = {
  fontSize: '24px',
  fontWeight: 'normal',
  margin: '0',
  letterSpacing: '0.05em',
}

const tagline: React.CSSProperties = {
  fontSize: '12px',
  color: '#666',
  margin: '4px 0 0',
  textTransform: 'uppercase',
  letterSpacing: '0.1em',
}

const hr: React.CSSProperties = {
  borderColor: '#e5e5e5',
  margin: '0',
}

const footer: React.CSSProperties = {
  padding: '24px',
  textAlign: 'center',
}

const footerText: React.CSSProperties = {
  fontSize: '12px',
  color: '#999',
  margin: '2px 0',
}

const unsubscribeText: React.CSSProperties = {
  fontSize: '11px',
  color: '#bbb',
  margin: '12px 0 0',
  lineHeight: '1.5',
}

const unsubscribeLink: React.CSSProperties = {
  color: '#999',
  textDecoration: 'underline',
}
