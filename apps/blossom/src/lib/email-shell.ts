/**
 * Raw-HTML email shell — Blossom by Olha
 *
 * Three API routes build their email HTML as a string instead of going through
 * the react-email templates (admin returns, order refunds, newsletter
 * broadcast). They used to carry their own hand-written <!DOCTYPE html>, with a
 * different palette AND a different wordmark ("BLOSSOM BY OLHA" letterspaced vs
 * "Blossom by Olha"), and none of the light/dark handling. They now render
 * through this shell, which imports the SAME tokens and the SAME <style> block
 * as src/emails/components/Layout.tsx, so the two paths cannot drift.
 */

import {
  BRAND_NAME,
  BRAND_TAGLINE,
  EMAIL_COLORS,
  EMAIL_HEAD_TAGS,
} from '@/emails/theme'

const L = EMAIL_COLORS.light

/** Escapes text interpolated into the HTML shell. */
export function esc(value: string): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
}

/** Only http(s), mailto and site-relative hrefs survive. */
export function safeHref(href: string): string {
  const trimmed = (href ?? '').trim()
  if (!trimmed) return '#'
  const ok =
    /^https?:\/\//i.test(trimmed) || /^mailto:/i.test(trimmed) || trimmed.startsWith('/')
  return ok ? esc(trimmed) : '#'
}

export interface EmailShellOptions {
  /** Hidden preview text shown next to the subject in the inbox list. */
  preheader?: string
  /** Extra footer paragraph(s), already HTML. Rendered above the standard line. */
  footerHtml?: string
}

/**
 * Wraps `bodyHtml` in the Blossom email shell: cream page, white card, header
 * with the wordmark, thin rule, footer. Light is the inline default; the dark
 * variant lives in EMAIL_HEAD_TAGS and only reassigns colors by class.
 */
export function emailShell(bodyHtml: string, opts: EmailShellOptions = {}): string {
  const { preheader, footerHtml } = opts

  const preheaderHtml = preheader
    ? `<div style="display:none;max-height:0;overflow:hidden;opacity:0;mso-hide:all;">${esc(preheader)}</div>`
    : ''

  return `<!DOCTYPE html>
<html lang="en">
<head>
  ${EMAIL_HEAD_TAGS}
</head>
<body class="bl-page" style="margin:0;padding:0;background-color:${L.page};font-family:Georgia,'Times New Roman',serif;color:${L.text};">
${preheaderHtml}
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" class="bl-page" style="background-color:${L.page};">
  <tr>
    <td align="center" style="padding:40px 20px;">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" class="bl-card" style="max-width:600px;width:100%;background-color:${L.card};">

        <!-- HEADER — wordmark identical to every other surface -->
        <tr>
          <td class="bl-header bl-pad" style="background-color:${L.header};border-bottom:2px solid ${L.headerRule};padding:32px 24px 24px;text-align:center;">
            <p class="bl-wordmark" style="margin:0;font-family:Georgia,'Times New Roman',serif;font-size:24px;font-weight:400;letter-spacing:0.05em;color:${L.wordmark};">${esc(BRAND_NAME)}</p>
            <p class="bl-tagline" style="margin:4px 0 0;font-size:12px;text-transform:uppercase;letter-spacing:0.1em;color:${L.tagline};">${esc(BRAND_TAGLINE)}</p>
          </td>
        </tr>

        <!-- BODY -->
        <tr>
          <td class="bl-body bl-pad" style="background-color:${L.card};color:${L.text};padding:32px 24px;">
            ${bodyHtml}
          </td>
        </tr>

        <!-- FOOTER -->
        <tr>
          <td class="bl-footer bl-pad" style="background-color:${L.card};border-top:1px solid ${L.rule};padding:24px;text-align:center;color:${L.faint};">
            ${footerHtml ?? ''}
            <p style="margin:2px 0;font-size:12px;color:${L.faint};">Blossom by Olha &mdash; Marbella, Spain</p>
            <p style="margin:2px 0;font-size:12px;color:${L.faint};">Handcrafted with love by Olha</p>
          </td>
        </tr>

      </table>
    </td>
  </tr>
</table>
</body>
</html>`
}

/** Section heading inside the body. */
export function emailHeading(text: string): string {
  return `<h1 style="margin:0 0 16px;font-family:Georgia,'Times New Roman',serif;font-size:22px;font-weight:400;line-height:1.3;color:${L.text};">${esc(text)}</h1>`
}

/** Body paragraph. `html` is NOT escaped — the caller owns it. */
export function emailParagraph(html: string, muted = false): string {
  return `<p style="margin:0 0 16px;font-size:15px;line-height:1.7;color:${muted ? L.muted : L.textSoft};">${html}</p>`
}

/** Primary call to action. Inverts in dark mode via .bl-cta. */
export function emailButton(href: string, label: string): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:8px 0 0;">
      <tr>
        <td align="center" class="bl-cta" style="background-color:${L.ctaBg};border-radius:8px;">
          <a href="${safeHref(href)}" class="bl-cta" style="display:inline-block;padding:13px 30px;font-family:Georgia,'Times New Roman',serif;font-size:14px;letter-spacing:0.04em;text-decoration:none;background-color:${L.ctaBg};color:${L.ctaFg};border-radius:8px;">${esc(label)}</a>
        </td>
      </tr>
    </table>`
}

/** Quoted note box (admin note, reason, etc.). */
export function emailNoteBox(html: string): string {
  return `<div class="bl-surface" style="margin:0 0 24px;padding:14px 16px;border-left:3px solid ${L.headerRule};border-radius:4px;background-color:${L.surface};">
      <p style="margin:0;font-size:14px;line-height:1.6;font-style:italic;color:${L.textSoft};">${html}</p>
    </div>`
}

/** Label / value row for receipts and summaries. */
export function emailDataRow(label: string, value: string, mono = false): string {
  return `<tr>
        <td style="padding:7px 0;font-size:14px;color:${L.muted};">${esc(label)}</td>
        <td align="right" style="padding:7px 0;font-size:${mono ? '12px' : '14px'};${mono ? "font-family:ui-monospace,SFMono-Regular,Menlo,monospace;" : ''}color:${L.text};">${esc(value)}</td>
      </tr>`
}

/** Wraps emailDataRow() rows in the tinted panel. */
export function emailDataTable(rows: string): string {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" class="bl-surface" style="margin:0 0 24px;background-color:${L.surface};border-radius:8px;">
      <tr><td style="padding:6px 18px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">${rows}</table>
      </td></tr>
    </table>`
}
