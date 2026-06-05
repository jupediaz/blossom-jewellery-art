import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@/generated/prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function createPrismaClient() {
  // Parse the DATABASE_URL to extract connection params without sslmode interference.
  // db.codelabs.studio uses a self-signed cert — we need ssl but with rejectUnauthorized: false.
  // pg v8 can override our explicit ssl option when sslmode is in the query string,
  // so we strip sslmode and handle SSL explicitly via the Pool config.
  const dbUrl = new URL(process.env.DATABASE_URL!)
  dbUrl.searchParams.delete('sslmode')
  dbUrl.searchParams.delete('sslaccept')

  const pool = new Pool({
    connectionString: dbUrl.toString(),
    ssl: { rejectUnauthorized: false },
  })

  const adapter = new PrismaPg(pool)
  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  })
}

export const db = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db

// NewsletterSubscriber is fully typed in the generated client — use directly
export const newsletterDb = db.newsletterSubscriber

export type ContactMessage = {
  id: string
  name: string
  email: string
  subject: string
  message: string
  isRead: boolean
  createdAt: Date
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const contactMessageDb = (db as any).contactMessage as {
  create: (args: {
    data: { name: string; email: string; subject: string; message: string }
  }) => Promise<ContactMessage>
  findMany: (args: {
    where?: { isRead?: boolean }
    orderBy?: { createdAt: 'asc' | 'desc' }
    take?: number
    skip?: number
  }) => Promise<ContactMessage[]>
  count: (args: { where?: { isRead?: boolean } }) => Promise<number>
  update: (args: {
    where: { id: string }
    data: { isRead: boolean }
  }) => Promise<ContactMessage>
}
