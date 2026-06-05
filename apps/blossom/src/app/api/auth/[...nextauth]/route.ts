import { NextRequest } from 'next/server'
import { handlers } from '@/lib/auth'
import { rateLimit } from '@/lib/rate-limit'

export const { GET } = handlers

export async function POST(req: NextRequest) {
  // Rate limit login attempts (credential auth)
  const limited = rateLimit(req, { limit: 10, windowSeconds: 300 })
  if (limited) return limited

  return handlers.POST(req)
}
