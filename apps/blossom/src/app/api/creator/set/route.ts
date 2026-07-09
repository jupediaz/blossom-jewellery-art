import { NextResponse, type NextRequest } from 'next/server'
import {
  verifyCreatorToken,
  verifyHubGrant,
  signCreatorToken,
  creatorModeEnabled,
  CREATOR_COOKIE,
} from '@/lib/creator'

/**
 * GET /api/creator/set?grant=<firmado por el hub>
 * developer.codelabs.studio (codelabs-hub) abre esta URL con un grant de vida
 * corta firmado con PORTAL_HUB_SECRET. Aquí lo validamos y acuñamos una cookie
 * httpOnly de larga duración (30 días) con un token propio (NEXTAUTH_SECRET).
 * Así la cookie queda en el dominio correcto (blossombyolha.com) pese a que
 * el hub vive en otro dominio.
 */
export const dynamic = 'force-dynamic'

const THIRTY_DAYS = 30 * 24 * 3600
// Solo se acepta `next` (redirect de vuelta) si apunta al orquestador del hub —
// evita open-redirect. Es el origen del API del hub, no el del SPA.
const HUB_SYNC_ORIGIN = 'https://hub-api.codelabs.studio'

export async function GET(req: NextRequest) {
  // Detrás de proxy el origin interno puede no ser el público; usamos el host
  // reenviado por el proxy (Traefik) para que el redirect apunte a blossombyolha.com.
  const host = req.headers.get('x-forwarded-host') ?? req.nextUrl.host
  const proto = req.headers.get('x-forwarded-proto') ?? 'https'
  const base = `${proto}://${host}`

  // Acepta el `grant` del handoff/sync del hub o un `token` propio (enlaces
  // manuales / dev). `off=1` borra la cookie; `next` continúa la cadena de
  // sync del hub.
  const grant = req.nextUrl.searchParams.get('grant')
  const token = req.nextUrl.searchParams.get('token')
  const off = req.nextUrl.searchParams.get('off') === '1'
  const nextParam = req.nextUrl.searchParams.get('next')

  const authed = verifyHubGrant(grant) || verifyCreatorToken(token)
  // God-mode flag: fijar la cookie requiere CREATOR_MODE_ENABLED='true'. Borrarla
  // (off=1) se permite siempre que el grant/token sea válido, para poder desactivar.
  const valid = off ? authed : authed && creatorModeEnabled()

  // Si `next` es del hub, seguimos la cadena de sync (aunque este proyecto no
  // valide, para no dejarla colgada); si no, volvemos al login de admin.
  const nextIsHub = !!nextParam && nextParam.startsWith(`${HUB_SYNC_ORIGIN}/`)
  const redirectTo = nextIsHub
    ? nextParam!
    : new URL(`/admin/login?creator=${valid ? 'ok' : 'invalid'}`, base).toString()

  if (!valid) {
    return NextResponse.redirect(redirectTo)
  }

  const res = NextResponse.redirect(redirectTo, 307)
  const opts = {
    httpOnly: true,
    secure: proto === 'https',
    sameSite: 'lax' as const,
    path: '/',
  }
  if (off) {
    res.cookies.set(CREATOR_COOKIE, '', { ...opts, maxAge: 0 })
  } else {
    res.cookies.set(CREATOR_COOKIE, signCreatorToken(THIRTY_DAYS), { ...opts, maxAge: THIRTY_DAYS })
  }
  return res
}
