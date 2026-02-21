import NextAuth from 'next-auth'
import { PrismaAdapter } from '@auth/prisma-adapter'
import Credentials from 'next-auth/providers/credentials'
import Google from 'next-auth/providers/google'
import { compare } from 'bcryptjs'
import { db } from '@/lib/db'
import type { UserRole } from '@/generated/prisma/client'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      email: string
      name?: string | null
      image?: string | null
      role: UserRole
    }
  }

  interface User {
    role: UserRole
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  adapter: PrismaAdapter(db) as any,
  session: { strategy: 'jwt' },
  pages: {
    signIn: '/admin/login',
  },
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        const user = await db.user.findUnique({
          where: { email: credentials.email as string },
        })

        if (!user || !user.passwordHash) return null

        const isValid = await compare(
          credentials.password as string,
          user.passwordHash
        )

        if (!isValid) return null

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string
        session.user.role = token.role as UserRole
      }
      return session
    },
    async authorized({ auth, request }) {
      const path = request.nextUrl.pathname

      // Strip locale prefix for path matching (e.g. /es/account → /account)
      const pathWithoutLocale = path.replace(/^\/(en|es|uk)/, '') || '/'

      // Admin routes (never localized)
      if (path === '/admin/login') return true
      if (path.startsWith('/admin')) {
        if (!auth?.user) return false
        const role = auth.user.role
        return role === 'ADMIN' || role === 'PRODUCT_MANAGER'
      }

      // Customer account routes - allow login/register without auth
      if (pathWithoutLocale === '/account/login' || pathWithoutLocale === '/account/register') return true
      if (pathWithoutLocale.startsWith('/account')) {
        if (!auth?.user) {
          const loginUrl = new URL('/account/login', request.url)
          return Response.redirect(loginUrl)
        }
        return true
      }

      return true
    },
  },
})
