import { createHmac, timingSafeEqual } from 'node:crypto'
import { cookies } from 'next/headers'

/**
 * "Modo creador" portfolio-wide: el hub (developer.codelabs.studio) abre
 * `<origin>/api/creator/set?grant=<firmado>` con un grant HMAC de vida corta
 * y este proyecto acuña una cookie httpOnly de 30 días si CREATOR_MODE_ENABLED
 * está activo. El token de la cookie se firma con NEXTAUTH_SECRET, el MISMO
 * secreto que ya firma la sesión NextAuth de blossom (ver lib/auth.ts) — no
 * se inventa un secreto nuevo. Mismo patrón que tubexperto/fixcal/memchats.
 */

const PROJECT = 'blossom'
export const CREATOR_COOKIE = 'bl_creator'
const SECRET = process.env.NEXTAUTH_SECRET ?? ''
// Secreto compartido con codelabs-hub (developer.codelabs.studio) para
// verificar el "grant" del handoff de creador portfolio-wide.
const HUB_SECRET = process.env.PORTAL_HUB_SECRET ?? ''

/**
 * Verifica el grant del handoff del hub. Formato `${expMs}.${b64urlHmac}`,
 * firmado con PORTAL_HUB_SECRET sobre la cadena `creator-grant:${expMs}`.
 */
export function verifyHubGrant(grant: string | undefined | null): boolean {
  if (!grant || !HUB_SECRET) return false
  const parts = grant.split('.')
  if (parts.length !== 2) return false
  const exp = Number(parts[0])
  if (!Number.isFinite(exp) || exp < Date.now()) return false
  const expected = createHmac('sha256', HUB_SECRET).update(`creator-grant:${exp}`).digest('base64url')
  const a = Buffer.from(parts[1]!)
  const b = Buffer.from(expected)
  return a.length === b.length && timingSafeEqual(a, b)
}

function b64url(b: Buffer): string {
  return b.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}
function b64urlToBuf(s: string): Buffer {
  return Buffer.from(s.replace(/-/g, '+').replace(/_/g, '/'), 'base64')
}

/** Firma un token `{p, exp}`. Lo usa /api/creator/set para acuñar la cookie
 *  de larga duración bl_creator. */
export function signCreatorToken(expiresInSec: number): string {
  const payload = JSON.stringify({ p: PROJECT, exp: Math.floor(Date.now() / 1000) + expiresInSec })
  const body = b64url(Buffer.from(payload))
  const sig = b64url(createHmac('sha256', SECRET).update(body).digest())
  return `${body}.${sig}`
}

/** Verifica firma HMAC + caducidad + proyecto. */
export function verifyCreatorToken(token: string | undefined | null): boolean {
  if (!token || !SECRET) return false
  const parts = token.split('.')
  if (parts.length !== 2) return false
  const body = parts[0]!
  const sig = parts[1]!
  const expected = b64url(createHmac('sha256', SECRET).update(body).digest())
  const a = Buffer.from(sig)
  const b = Buffer.from(expected)
  if (a.length !== b.length || !timingSafeEqual(a, b)) return false
  try {
    const payload = JSON.parse(b64urlToBuf(body).toString('utf8')) as { p?: string; exp?: number }
    if (payload.p !== PROJECT) return false
    if (typeof payload.exp !== 'number' || payload.exp < Math.floor(Date.now() / 1000)) return false
    return true
  } catch {
    return false
  }
}

/**
 * "God-mode" flag: el modo creador SOLO puede activarse si CREATOR_MODE_ENABLED
 * es 'true' en el servidor. Ausente o distinto = desactivado: /api/creator/set
 * NO acuña la cookie e isCreatorEnabled() devuelve false, aunque el navegador
 * sea el del creador y el hub emita un grant válido.
 */
export function creatorModeEnabled(): boolean {
  return process.env.CREATOR_MODE_ENABLED === 'true'
}

/** ¿Este navegador es el creador? Requiere el flag CREATOR_MODE_ENABLED y la
 *  cookie bl_creator válida (acuñada por /api/creator/set). */
export async function isCreatorEnabled(): Promise<boolean> {
  if (!creatorModeEnabled()) return false
  const jar = await cookies()
  return verifyCreatorToken(jar.get(CREATOR_COOKIE)?.value)
}
