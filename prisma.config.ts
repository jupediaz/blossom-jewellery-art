import path from 'node:path'
import { defineConfig, env } from 'prisma/config'
import { config } from 'dotenv'

// Load .env.local (Next.js convention) for DATABASE_URL
config({ path: path.resolve(__dirname, '.env.local') })

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
    seed: 'npx tsx prisma/seed.ts',
  },
  datasource: {
    url: env('DATABASE_URL'),
  },
})
