/**
 * Seed the Brand Model Profile for Olha (the AI Studio avatar).
 *
 * Uploads the reference photos to R2 under the same layout the
 * /api/ai/image/upload endpoint uses (`ai-studio/model-profile/<uuid>.<ext>`)
 * and creates an active BrandModelProfile row pointing at them, so the
 * AI Studio can use Olha as the `person` reference for consistent generations.
 *
 * Source photos live outside the repo (personal photos, not versioned).
 * Run from apps/blossom:  node scripts/seed-olha-model-profile.mjs
 */
import { readFileSync } from 'node:fs'
import { randomUUID } from 'node:crypto'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import pg from 'pg'

// ─── Load env from .env.local (simple parser, values may be quoted) ──────────
function loadEnv(path) {
  const out = {}
  for (const line of readFileSync(path, 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/)
    if (!m) continue
    let v = m[2].trim()
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
      v = v.slice(1, -1)
    }
    out[m[1]] = v
  }
  return out
}

const env = loadEnv(new URL('../.env.local', import.meta.url).pathname)

// ─── Reference photos → slot mapping ─────────────────────────────────────────
const PHOTOS = [
  { slot: 'front',     src: '/Users/josediaz/Downloads/IMG_2839.JPG' },
  { slot: '3q-left',   src: '/Users/josediaz/Downloads/67f435da-7653-4c4e-835f-dc68fb5a3b74.JPG' },
  { slot: 'full-body', src: '/Users/josediaz/Downloads/IMG_2840.JPG' },
]

const R2_PREFIX = 'ai-studio'
const DIRECTORY = 'model-profile'

const s3 = new S3Client({
  region: 'auto',
  endpoint: `https://${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: env.R2_ACCESS_KEY_ID,
    secretAccessKey: env.R2_SECRET_ACCESS_KEY,
  },
})

async function uploadPhoto({ slot, src }) {
  const uuid = randomUUID()
  const filename = `${uuid}.jpg`
  const path = `${DIRECTORY}/${filename}`          // stored in referenceImages.path
  const key = `${R2_PREFIX}/${path}`               // actual R2 object key
  const body = readFileSync(src)

  await s3.send(new PutObjectCommand({
    Bucket: env.R2_BUCKET_NAME || 'blossom-jewellery',
    Key: key,
    Body: body,
    ContentType: 'image/jpeg',
  }))

  console.log(`  ✓ ${slot.padEnd(10)} → ${env.R2_PUBLIC_URL}/${key}`)
  return { path, type: 'person', filename: `${slot}-${filename}` }
}

async function main() {
  console.log('Uploading Olha reference photos to R2...')
  const referenceImages = []
  for (const p of PHOTOS) referenceImages.push(await uploadPhoto(p))

  // ─── Create the profile (strip sslmode so pg honors explicit ssl) ──────────
  const url = new URL(env.DATABASE_URL)
  url.searchParams.delete('sslmode')
  url.searchParams.delete('sslaccept')
  const client = new pg.Client({
    connectionString: url.toString(),
    ssl: { rejectUnauthorized: false },
  })
  await client.connect()

  await client.query('UPDATE "BrandModelProfile" SET "isActive" = false WHERE "isActive" = true')

  const id = randomUUID()
  await client.query(
    `INSERT INTO "BrandModelProfile"
       (id, name, "referenceImages", "isActive", notes, "createdAt", "updatedAt")
     VALUES ($1, $2, $3::jsonb, true, $4, now(), now())`,
    [
      id,
      'Olha',
      JSON.stringify(referenceImages),
      'Brand founder & face of Blossom by Olha. Long dark wavy hair, brown eyes, warm Mediterranean tan. Use as the consistent `person` reference for all on-model jewelry shots.',
    ],
  )

  await client.end()
  console.log(`\n✓ BrandModelProfile "Olha" created (id=${id}) with ${referenceImages.length} active reference photos.`)
}

main().catch((err) => {
  console.error('Seed failed:', err)
  process.exit(1)
})
