import { db } from '@/lib/db'
import { ModelProfileEditor } from '@/components/admin/ai-studio/ModelProfileEditor'
import type { BrandModelProfileData, ReferenceImage } from '@/lib/ai/types'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default async function ModelProfilePage() {
  let profile: BrandModelProfileData | null = null

  try {
    const dbProfile = await db.brandModelProfile.findFirst({
      where: { isActive: true },
      orderBy: { updatedAt: 'desc' },
    })

    if (dbProfile) {
      profile = {
        id: dbProfile.id,
        name: dbProfile.name,
        referenceImages: dbProfile.referenceImages as unknown as ReferenceImage[],
        isActive: dbProfile.isActive,
        notes: dbProfile.notes,
      }
    }
  } catch {
    // DB may not have the table yet
  }

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
        <h2 className="text-2xl font-semibold text-gray-900">Brand Model Profile</h2>
        <p className="text-sm text-gray-500">
          Manage reference photos for AI-generated images featuring the brand model
        </p>
      </div>

      <ModelProfileEditor initialProfile={profile} />
    </div>
  )
}
