import { db } from '@/lib/db'
import { StudioTabsLoader as StudioTabs } from './StudioTabsLoader'
import Link from 'next/link'
import { User, Image as ImageIcon, Heart } from 'lucide-react'

async function getStudioStats() {
  try {
    const [totalGenerated, favorites] = await Promise.all([
      db.generatedImage.count(),
      db.generatedImage.count({ where: { isFavorite: true } }),
    ])
    return { totalGenerated, favorites }
  } catch {
    return { totalGenerated: 0, favorites: 0 }
  }
}

export default async function AIStudioPage() {
  const stats = await getStudioStats()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">AI Image Studio</h2>
          <p className="text-sm text-gray-500">
            Create professional product and marketing images with AI
          </p>
        </div>
        <Link
          href="/admin/ai-studio/model-profile"
          className="flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          <User className="h-4 w-4" />
          Model Profile
        </Link>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-100">
            <ImageIcon className="h-4.5 w-4.5 text-purple-600" />
          </div>
          <div>
            <p className="text-lg font-semibold text-gray-900">{stats.totalGenerated}</p>
            <p className="text-xs text-gray-500">Images Generated</p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-100">
            <Heart className="h-4.5 w-4.5 text-red-500" />
          </div>
          <div>
            <p className="text-lg font-semibold text-gray-900">{stats.favorites}</p>
            <p className="text-xs text-gray-500">Favorites</p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3">
          <Link
            href="/admin/ai-studio/gallery"
            className="text-sm font-medium text-purple-600 hover:text-purple-700"
          >
            View Gallery →
          </Link>
        </div>
      </div>

      <StudioTabs />
    </div>
  )
}
