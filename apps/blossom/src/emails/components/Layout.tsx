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
import {
  BRAND_NAME,
  BRAND_TAGLINE,
  EMAIL_COLORS,
  EMAIL_CSS,
} from '../theme'

interface LayoutProps {
  preview: string
  children: React.ReactNode
}

const L = EMAIL_COLORS.light

export function EmailLayout({ preview, children }: LayoutProps) {
  return (
    <Html lang="en">
      <Head>
        {/* Without these two, Gmail on iOS/Android runs its own inversion: it
            flips the surfaces but not the inline text colors, and the card ends
            up dark text on dark. Declaring both schemes hands control to the
            rules in EMAIL_CSS. */}
        <meta name="color-scheme" content="light dark" />
        <meta name="supported-color-schemes" content="light dark" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <style dangerouslySetInnerHTML={{ __html: EMAIL_CSS }} />
      </Head>
      <Preview>{preview}</Preview>
      <Body className="bl-page" style={body}>
        {/* react-email's <Body> only forwards the class to the <body> tag; the
            wrapper cell it builds underneath keeps the light background inline
            and would frame the card in cream in dark mode. This Section is that
            cell's lid. */}
        <Section className="bl-page" style={pageWrap}>
          <Container className="bl-card" style={container}>
            <Section className="bl-header" style={header}>
              {/* Wordmark: same font, spelling and tracking as every other
                  surface. Only the color follows the mode, so the contrast
                  against the header is guaranteed in both. */}
              <Text className="bl-wordmark" style={logo}>{BRAND_NAME}</Text>
              <Text className="bl-tagline" style={tagline}>{BRAND_TAGLINE}</Text>
            </Section>

            <Section className="bl-body" style={bodyWrap}>
              {children}
            </Section>

            <Hr className="bl-rule" style={hr} />

            <Section className="bl-footer" style={footer}>
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
        </Section>
      </Body>
    </Html>
  )
}

const body: React.CSSProperties = {
  backgroundColor: L.page,
  fontFamily: 'Georgia, "Times New Roman", serif',
  color: L.text,
}

const pageWrap: React.CSSProperties = {
  width: '100%',
  backgroundColor: L.page,
}

const container: React.CSSProperties = {
  maxWidth: '600px',
  margin: '0 auto',
  backgroundColor: L.card,
}

const header: React.CSSProperties = {
  textAlign: 'center',
  padding: '32px 24px 24px',
  backgroundColor: L.header,
  borderBottom: `2px solid ${L.headerRule}`,
}

const logo: React.CSSProperties = {
  fontSize: '24px',
  fontWeight: 'normal',
  margin: '0',
  letterSpacing: '0.05em',
  color: L.wordmark,
}

const tagline: React.CSSProperties = {
  fontSize: '12px',
  color: L.tagline,
  margin: '4px 0 0',
  textTransform: 'uppercase',
  letterSpacing: '0.1em',
}

const bodyWrap: React.CSSProperties = {
  width: '100%',
  backgroundColor: L.card,
  color: L.text,
}

const hr: React.CSSProperties = {
  borderColor: L.rule,
  margin: '0',
}

const footer: React.CSSProperties = {
  padding: '24px',
  textAlign: 'center',
  backgroundColor: L.card,
  color: L.faint,
}

const footerText: React.CSSProperties = {
  fontSize: '12px',
  color: L.faint,
  margin: '2px 0',
}

const unsubscribeText: React.CSSProperties = {
  fontSize: '11px',
  color: '#BBBBBB',
  margin: '12px 0 0',
  lineHeight: '1.5',
}

const unsubscribeLink: React.CSSProperties = {
  color: L.faint,
  textDecoration: 'underline',
}
