import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { ImageGallery } from '@/components/admin/ai-studio/ImageGallery'

export default function GalleryPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/admin/ai-studio"
          className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Studio
        </Link>
      </div>

      <div>
        <h2 className="text-2xl font-semibold text-gray-900">Image Gallery</h2>
        <p className="text-sm text-gray-500">
          Browse, filter, and manage all AI-generated images
        </p>
      </div>

      <ImageGallery />
    </div>
  )
}
