import path from 'path'
import { fileURLToPath } from 'url'
import { buildConfig } from 'payload'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { s3Storage } from '@payloadcms/storage-s3'
import sharp from 'sharp'

import { Users } from './collections/Users'
import { Products } from './collections/Products'
import { ProductCollections } from './collections/ProductCollections'
import { Categories } from './collections/Categories'
import { Media } from './collections/Media'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

// Fail closed: never start with a missing signing secret (forgeable sessions)
// or empty R2 credentials (uploads silently routed to the wrong endpoint).
function requireEnv(name: string): string {
  const value = process.env[name]
  if (!value) throw new Error(`${name} is required but is not set`)
  return value
}

const payloadSecret = requireEnv('PAYLOAD_SECRET')

// Payload admin lives under /cms/* to avoid colliding with Blossom's own
// /admin panel (orders, inventory, fulfilment). It shares the project's
// Postgres (db.codelabs.studio) — Payload owns its own tables, Prisma owns the
// commerce tables. Images go to the existing Cloudflare R2 bucket.
export default buildConfig({
  secret: payloadSecret,
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname, './app/cms/(payload)'),
      importMapFile: path.resolve(dirname, './app/cms/(payload)/admin/importMap.js'),
    },
  },
  routes: {
    admin: '/cms/admin',
    api: '/cms/api',
    graphQL: '/cms/api/graphql',
    graphQLPlayground: '/cms/api/graphql-playground',
  },
  editor: lexicalEditor(),
  collections: [Products, ProductCollections, Categories, Media, Users],
  localization: {
    locales: ['en', 'es', 'uk'],
    defaultLocale: 'en',
  },
  db: postgresAdapter({
    pool: { connectionString: process.env.DATABASE_URL },
  }),
  plugins: [
    s3Storage({
      collections: { media: true },
      bucket: requireEnv('R2_BUCKET_NAME'),
      config: {
        endpoint: `https://${requireEnv('R2_ACCOUNT_ID')}.r2.cloudflarestorage.com`,
        region: 'auto',
        forcePathStyle: true,
        credentials: {
          accessKeyId: requireEnv('R2_ACCESS_KEY_ID'),
          secretAccessKey: requireEnv('R2_SECRET_ACCESS_KEY'),
        },
      },
    }),
  ],
  sharp,
  typescript: { outputFile: path.resolve(dirname, './payload-types.ts') },
})
