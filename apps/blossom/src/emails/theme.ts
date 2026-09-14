/**
 * Shared email theme — Blossom by Olha
 *
 * Single source of truth for the transactional email palette AND for the
 * light/dark <style> block. Both consumers import from here so they cannot
 * drift apart:
 *
 *   - src/emails/components/Layout.tsx  (react-email templates, 9 of them)
 *   - src/lib/email-shell.ts            (raw-HTML emails built inside API routes)
 *
 * Why a dark variant at all: without `color-scheme: light dark` declared in the
 * head, Gmail on iOS/Android applies its OWN inversion — it flips the light
 * surfaces to dark but does NOT invert images, and it does not touch the inline
 * colors each template paints. The result is dark text on a dark card. Declaring
 * the two schemes hands control back to the rules below.
 *
 * Trap that bites the OTHER way (trichosuite, 2026-09-14): once
 * `color-scheme: light dark` is declared, INHERITED text color stops being fixed
 * black and follows the OS theme, so any cell without its own `color` turns white
 * and vanishes in LIGHT mode. Hence the light palette is declared explicitly
 * below — without `!important`, so each template's inline colors still win.
 */

export const EMAIL_COLORS = {
  light: {
    page: '#FAFAF9',
    card: '#FFFFFF',
    header: '#FFFFFF',
    headerRule: '#1A1A1A',
    wordmark: '#1A1A1A',
    tagline: '#666666',
    text: '#1A1A1A',
    textSoft: '#333333',
    muted: '#666666',
    faint: '#999999',
    surface: '#FAFAF9',
    accentSurface: '#FDF2F8',
    accent: '#BE185D',
    ok: '#059669',
    ctaBg: '#1A1A1A',
    ctaFg: '#FFFFFF',
    rule: '#E5E5E5',
    hair: '#F0F0F0',
    ruleStrong: '#1A1A1A',
    link: '#1A1A1A',
  },
  dark: {
    page: '#12100E',
    card: '#1A1714',
    header: '#1A1714',
    headerRule: '#3A332C',
    wordmark: '#F4EFE8',
    tagline: '#A9A199',
    text: '#F0EAE1',
    textSoft: '#E2DAD0',
    muted: '#A9A199',
    faint: '#8A827A',
    surface: '#221E1A',
    accentSurface: '#2A1C22',
    accent: '#F2A0BE',
    ok: '#6EE7B7',
    ctaBg: '#F0EAE1',
    ctaFg: '#1A1A1A',
    rule: '#332D27',
    hair: '#2A251F',
    ruleStrong: '#4A4239',
    link: '#D9A87F',
  },
} as const

const L = EMAIL_COLORS.light
const D = EMAIL_COLORS.dark

/**
 * Dark-mode rules, emitted twice: once inside the media query and once behind
 * `[data-ogsc]`, because Outlook.com applies its own dark mode and ignores
 * `prefers-color-scheme`.
 *
 * Order matters: the generic body-text rule comes FIRST and links, boxes and
 * buttons AFTER it, or the generic rule eats them.
 */
function darkRules(prefix: string): string {
  return `
  ${prefix}.bl-page        { background-color:${D.page} !important; }
  ${prefix}.bl-card        { background-color:${D.card} !important; }
  ${prefix}.bl-header      { background-color:${D.header} !important; border-bottom-color:${D.headerRule} !important; }
  ${prefix}.bl-wordmark    { color:${D.wordmark} !important; }
  ${prefix}.bl-tagline     { color:${D.tagline} !important; }
  /* Surfaces first. The card and the footer paint white inline; without these
     two the generic text rule below turns the copy cream ON white. */
  ${prefix}.bl-body        { background-color:${D.card} !important; }
  ${prefix}.bl-footer      { background-color:${D.card} !important; }
  ${prefix}.bl-body, ${prefix}.bl-body p, ${prefix}.bl-body td,
  ${prefix}.bl-body th, ${prefix}.bl-body div, ${prefix}.bl-body span,
  ${prefix}.bl-body h1, ${prefix}.bl-body h2, ${prefix}.bl-body h3,
  ${prefix}.bl-body li, ${prefix}.bl-body strong, ${prefix}.bl-body b,
  ${prefix}.bl-body em     { color:${D.text} !important; }
  ${prefix}.bl-body a, ${prefix}.bl-link { color:${D.link} !important; }
  ${prefix}.bl-surface, ${prefix}.bl-body .bl-surface { background-color:${D.surface} !important; }
  ${prefix}.bl-accent-surface, ${prefix}.bl-body .bl-accent-surface { background-color:${D.accentSurface} !important; }
  ${prefix}.bl-accent, ${prefix}.bl-body .bl-accent { color:${D.accent} !important; }
  ${prefix}.bl-ok, ${prefix}.bl-body .bl-ok { color:${D.ok} !important; }
  ${prefix}.bl-cta, ${prefix}.bl-body .bl-cta { background-color:${D.ctaBg} !important; color:${D.ctaFg} !important; }
  ${prefix}.bl-rule, ${prefix}.bl-body .bl-rule { border-color:${D.rule} !important; }
  ${prefix}.bl-hair, ${prefix}.bl-body .bl-hair { border-color:${D.hair} !important; }
  ${prefix}.bl-rule-strong, ${prefix}.bl-body .bl-rule-strong { border-color:${D.ruleStrong} !important; }
  ${prefix}.bl-footer, ${prefix}.bl-footer p, ${prefix}.bl-footer td,
  ${prefix}.bl-footer span { color:${D.faint} !important; }
  ${prefix}.bl-footer a    { color:${D.muted} !important; }`
}

export const EMAIL_CSS = `
  :root { color-scheme: light dark; supported-color-schemes: light dark; }

  /* ── LIGHT ──────────────────────────────────────────────────────────────
     Declared explicitly (no !important) so that nothing depends on inherited
     color, while each template's own inline colors keep winning. */
  .bl-page        { background-color:${L.page}; }
  .bl-card        { background-color:${L.card}; }
  .bl-header      { background-color:${L.header}; }
  .bl-wordmark    { color:${L.wordmark}; }
  .bl-tagline     { color:${L.tagline}; }
  .bl-body        { background-color:${L.card}; }
  .bl-footer      { background-color:${L.card}; }
  .bl-body, .bl-body p, .bl-body td, .bl-body th, .bl-body div,
  .bl-body span, .bl-body h1, .bl-body h2, .bl-body h3, .bl-body li,
  .bl-body strong, .bl-body b, .bl-body em { color:${L.text}; }
  .bl-link        { color:${L.link}; }
  .bl-surface     { background-color:${L.surface}; }
  .bl-accent-surface { background-color:${L.accentSurface}; }
  .bl-accent      { color:${L.accent}; }
  .bl-ok          { color:${L.ok}; }
  .bl-cta         { background-color:${L.ctaBg}; color:${L.ctaFg}; }
  .bl-rule        { border-color:${L.rule}; }
  .bl-hair        { border-color:${L.hair}; }
  .bl-rule-strong { border-color:${L.ruleStrong}; }
  .bl-footer, .bl-footer p, .bl-footer td, .bl-footer span { color:${L.faint}; }

  /* ── DARK ─────────────────────────────────────────────────────────────── */
  @media (prefers-color-scheme: dark) {${darkRules('')}
  }

  /* Outlook.com: own dark mode, ignores the media query. */
  ${darkRules('[data-ogsc] ').trim()}

  @media only screen and (max-width:600px) {
    .bl-pad { padding-left:20px !important; padding-right:20px !important; }
  }
`

/** Head tags for raw-HTML emails (the react-email Layout writes its own JSX). */
export const EMAIL_HEAD_TAGS = `<meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="x-apple-disable-message-reformatting">
  <meta name="color-scheme" content="light dark">
  <meta name="supported-color-schemes" content="light dark">
  <style>${EMAIL_CSS}</style>`

/** Wordmark — identical on every surface (brand rule). Never restyled. */
export const BRAND_NAME = 'Blossom by Olha'
export const BRAND_TAGLINE = 'Handcrafted polymer clay jewelry'
