import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
} from '@aws-sdk/client-s3'

// ─── Interface ──────────────────────────────────

export interface ImageStorageProvider {
  save(buffer: Buffer, directory: string, filename: string): Promise<string>
  read(filePath: string): Promise<Buffer>
  delete(filePath: string): Promise<void>
  getUrl(filePath: string): string
  exists(filePath: string): Promise<boolean>
}

// ─── R2 Implementation ─────────────────────────

const MIME_TYPES: Record<string, string> = {
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  webp: 'image/webp',
  gif: 'image/gif',
}

function getR2Config() {
  const accountId = process.env.R2_ACCOUNT_ID
  const accessKeyId = process.env.R2_ACCESS_KEY_ID
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY
  const bucket = process.env.R2_BUCKET_NAME || 'blossom-jewellery'
  const publicUrl = process.env.R2_PUBLIC_URL

  if (!accountId || !accessKeyId || !secretAccessKey || !publicUrl) {
    throw new Error(
      'R2 storage not configured. Set R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_PUBLIC_URL in environment.'
    )
  }

  return { accountId, accessKeyId, secretAccessKey, bucket, publicUrl }
}

let _s3Client: S3Client | null = null

function getS3Client(): S3Client {
  if (_s3Client) return _s3Client
  const config = getR2Config()
  _s3Client = new S3Client({
    region: 'auto',
    endpoint: `https://${config.accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
    },
  })
  return _s3Client
}

export class R2ImageStorage implements ImageStorageProvider {
  private prefix = 'ai-studio'

  private key(filePath: string): string {
    return `${this.prefix}/${filePath}`
  }

  async save(buffer: Buffer, directory: string, filename: string): Promise<string> {
    const config = getR2Config()
    const filePath = `${directory}/${filename}`
    const key = this.key(filePath)

    const ext = filename.split('.').pop()?.toLowerCase() || 'png'
    const contentType = MIME_TYPES[ext] || 'application/octet-stream'

    await getS3Client().send(
      new PutObjectCommand({
        Bucket: config.bucket,
        Key: key,
        Body: buffer,
        ContentType: contentType,
      })
    )

    return filePath
  }

  async read(filePath: string): Promise<Buffer> {
    const config = getR2Config()
    const result = await getS3Client().send(
      new GetObjectCommand({
        Bucket: config.bucket,
        Key: this.key(filePath),
      })
    )

    const chunks: Uint8Array[] = []
    const stream = result.Body as AsyncIterable<Uint8Array>
    for await (const chunk of stream) {
      chunks.push(chunk)
    }
    return Buffer.concat(chunks)
  }

  async delete(filePath: string): Promise<void> {
    const config = getR2Config()
    await getS3Client().send(
      new DeleteObjectCommand({
        Bucket: config.bucket,
        Key: this.key(filePath),
      })
    )
  }

  getUrl(filePath: string): string {
    const config = getR2Config()
    return `${config.publicUrl}/${this.key(filePath)}`
  }

  async exists(filePath: string): Promise<boolean> {
    const config = getR2Config()
    try {
      await getS3Client().send(
        new HeadObjectCommand({
          Bucket: config.bucket,
          Key: this.key(filePath),
        })
      )
      return true
    } catch {
      return false
    }
  }
}

// ─── Local Fallback (dev only) ──────────────────

import { promises as fs } from 'fs'
import path from 'path'

const UPLOAD_ROOT = path.join(process.cwd(), 'public', 'uploads', 'ai-studio')

export class LocalImageStorage implements ImageStorageProvider {
  async save(buffer: Buffer, directory: string, filename: string): Promise<string> {
    const dir = path.join(UPLOAD_ROOT, directory)
    await fs.mkdir(dir, { recursive: true })
    const filePath = `${directory}/${filename}`
    await fs.writeFile(path.join(UPLOAD_ROOT, filePath), buffer)
    return filePath
  }

  async read(filePath: string): Promise<Buffer> {
    return fs.readFile(path.join(UPLOAD_ROOT, filePath))
  }

  async delete(filePath: string): Promise<void> {
    try {
      await fs.unlink(path.join(UPLOAD_ROOT, filePath))
    } catch (err) {
      if ((err as NodeJS.ErrnoException).code !== 'ENOENT') throw err
    }
  }

  getUrl(filePath: string): string {
    return `/uploads/ai-studio/${filePath}`
  }

  async exists(filePath: string): Promise<boolean> {
    try {
      await fs.access(path.join(UPLOAD_ROOT, filePath))
      return true
    } catch {
      return false
    }
  }
}

// ─── Export active provider ─────────────────────

function createStorage(): ImageStorageProvider {
  // Use R2 if configured, otherwise fall back to local
  if (process.env.R2_ACCOUNT_ID && process.env.R2_ACCESS_KEY_ID) {
    return new R2ImageStorage()
  }
  console.warn('[ai-studio] R2 not configured, using local filesystem storage')
  return new LocalImageStorage()
}

export const imageStorage = createStorage()
