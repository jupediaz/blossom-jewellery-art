import { promises as fs } from 'fs'
import path from 'path'

export interface ImageStorageProvider {
  save(buffer: Buffer, directory: string, filename: string): Promise<string>
  read(filePath: string): Promise<Buffer>
  delete(filePath: string): Promise<void>
  getUrl(filePath: string): string
  exists(filePath: string): Promise<boolean>
}

const UPLOAD_ROOT = path.join(process.cwd(), 'public', 'uploads', 'ai-studio')

export class LocalImageStorage implements ImageStorageProvider {
  async save(buffer: Buffer, directory: string, filename: string): Promise<string> {
    const dir = path.join(UPLOAD_ROOT, directory)
    await fs.mkdir(dir, { recursive: true })

    const filePath = path.join(directory, filename)
    const fullPath = path.join(UPLOAD_ROOT, filePath)
    await fs.writeFile(fullPath, buffer)

    return filePath
  }

  async read(filePath: string): Promise<Buffer> {
    const fullPath = path.join(UPLOAD_ROOT, filePath)
    return fs.readFile(fullPath)
  }

  async delete(filePath: string): Promise<void> {
    const fullPath = path.join(UPLOAD_ROOT, filePath)
    try {
      await fs.unlink(fullPath)
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

export const imageStorage = new LocalImageStorage()
