import { NextResponse } from 'next/server'
import { isCreatorEnabled } from '@/lib/creator'

/**
 * GET /api/creator/status
 * Chequeo same-origin (sin grant) de si ESTE navegador es el creador: lee la
 * cookie bl_creator que /api/creator/set acuñó tras el handoff del hub. Sin
 * esto el login tendría que hacer un fetch cross-origin al hub en cada
 * visita, lo que Safari/Firefox bloquean (cookies third-party particionadas).
 */
export const dynamic = 'force-dynamic'

export async function GET() {
  const enabled = await isCreatorEnabled()
  return NextResponse.json(
    { enabled },
    {
      headers: {
        'Cache-Control': 'no-store, private, max-age=0',
        Pragma: 'no-cache',
        Vary: 'Cookie',
      },
    },
  )
}
