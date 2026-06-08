/**
 * One-shot test: generate Olha wearing a catalog jewelry piece, to judge
 * on-model consistency / jewelry fidelity before committing to a pipeline.
 *
 * Replicates the AI Studio's generateImageWithReferences() logic so the test
 * is representative of production. Uploads results to R2 and prints full URLs.
 *
 * Run from apps/blossom:  node scripts/ai-avatar/test-generation.mjs
 */
import { readFileSync } from 'node:fs'
import { randomUUID } from 'node:crypto'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'

function loadEnv(path) {
  const out = {}
  for (const line of readFileSync(path, 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/)
    if (!m) continue
    let v = m[2].trim()
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1)
    out[m[1]] = v
  }
  return out
}
const env = loadEnv(new URL('../../.env.local', import.meta.url).pathname)

// ─── Avatar person references (R2) + jewelry object reference (local crop) ───
const PERSON_URLS = [
  'https://pub-8901f7dc70734521bb212bbabaad0187.r2.dev/ai-studio/model-profile/1cbb3466-a68a-4a1a-9c7d-5eec59071102.jpg',
  'https://pub-8901f7dc70734521bb212bbabaad0187.r2.dev/ai-studio/model-profile/24dcb347-6428-4742-81cf-4c3a96186119.jpg',
  'https://pub-8901f7dc70734521bb212bbabaad0187.r2.dev/ai-studio/model-profile/6f1f66b0-e3c7-4b46-aad6-28baade77e24.jpg',
]
const JEWELRY_CROP = '/tmp/dark-bloom-blue-crop.jpg'

const SCENE_PROMPT =
  'Editorial beauty portrait of the woman from the person references wearing the blue flower stud earrings shown in the object reference. ' +
  'Sunlit botanical garden background with soft bokeh, warm golden-hour light. Three-quarter view, soft natural smile, elegant and luxurious mood. ' +
  'The blue flower earrings must match the reference exactly: cobalt-blue layered petals with a dark center. Sharp focus on the earrings.'

const s3 = new S3Client({
  region: 'auto',
  endpoint: `https://${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: { accessKeyId: env.R2_ACCESS_KEY_ID, secretAccessKey: env.R2_SECRET_ACCESS_KEY },
})

async function fetchBase64(url) {
  const res = await fetch(url)
  const buf = Buffer.from(await res.arrayBuffer())
  return buf.toString('base64')
}

function buildParts(personB64, jewelryB64) {
  const parts = []
  for (const b of personB64) parts.push({ inlineData: { mimeType: 'image/jpeg', data: b } })
  parts.push({ inlineData: { mimeType: 'image/jpeg', data: jewelryB64 } })
  parts.push({
    text: [
      `PERSON REFERENCES (${personB64.length} images): The first ${personB64.length} image(s) show the person to include. Maintain their face, features, and identity as closely as possible.`,
      `OBJECT/PRODUCT REFERENCES (1 images): Show the jewelry/product. Include it accurately in the scene with correct details, colors, and proportions.`,
      '',
      `SCENE DESCRIPTION: ${SCENE_PROMPT}`,
      '',
      'OUTPUT ASPECT RATIO: 3:4',
      '',
      'Generate a professional, high-quality photograph. Natural lighting, sharp focus, editorial quality.',
      'The result should look like a real photograph, not AI-generated.',
    ].join('\n'),
  })
  return parts
}

async function generate(modelName, parts) {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_KEY_OVERRIDE || env.GOOGLE_GEMINI_API_KEY)
  const model = genAI.getGenerativeModel({
    model: modelName,
    generationConfig: { responseModalities: ['TEXT', 'IMAGE'] },
  })
  const result = await model.generateContent(parts)
  for (const c of result.response.candidates ?? [])
    for (const p of c.content?.parts ?? [])
      if (p.inlineData) return Buffer.from(p.inlineData.data, 'base64')
  throw new Error(`no image returned by ${modelName}`)
}

async function upload(buffer, modelName) {
  const filename = `${modelName.replace(/[^a-z0-9]/gi, '-')}-${randomUUID()}.png`
  const key = `ai-studio/test-generations/${filename}`
  await s3.send(new PutObjectCommand({
    Bucket: env.R2_BUCKET_NAME || 'blossom-jewellery',
    Key: key, Body: buffer, ContentType: 'image/png',
  }))
  return `${env.R2_PUBLIC_URL}/${key}`
}

async function main() {
  console.log('Loading references...')
  const personB64 = await Promise.all(PERSON_URLS.map(fetchBase64))
  const jewelryB64 = readFileSync(JEWELRY_CROP).toString('base64')
  const parts = buildParts(personB64, jewelryB64)

  const models = ['gemini-2.5-flash-image', 'gemini-3-pro-image-preview']
  for (const m of models) {
    process.stdout.write(`\nGenerating with ${m} ... `)
    try {
      const img = await generate(m, parts)
      const url = await upload(img, m)
      console.log('done')
      console.log(`  ${url}`)
    } catch (err) {
      console.log(`FAILED: ${err.message}`)
    }
  }
}

main().catch((e) => { console.error(e); process.exit(1) })
