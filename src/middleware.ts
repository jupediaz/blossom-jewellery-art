import { NextRequest } from 'next/server'
import createIntlMiddleware from 'next-intl/middleware'
import { routing } from '@/i18n/routing'

const intlMiddleware = createIntlMiddleware(routing)

export default function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname

  // Admin routes: auth is handled server-side, no i18n needed
  if (pathname.startsWith('/admin')) {
    return
  }

  // Run i18n middleware for all storefront routes
  return intlMiddleware(req)
}

export const config = {
  matcher: ['/((?!api|studio|_next|.*\\..*).*)'],
}
