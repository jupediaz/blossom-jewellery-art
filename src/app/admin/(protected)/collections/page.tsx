import Image from 'next/image'
import Link from 'next/link'
import { Layers, ExternalLink, Pencil } from 'lucide-react'
import { sanityFetch } from '@/lib/sanity/client'
import { allCollectionsQuery } from '@/lib/sanity/queries'
import { EmptyState } from '@/components/admin/EmptyState'
import type { Collection } from '@/lib/types'

const mockCollections: Collection[] = [
  {
    _id: 'mock-1',
    name: 'Summer Bloom',
    slug: { current: 'summer-bloom' },
    description: 'Delicate florals and warm tones for the summer season.',
    productCount: 0,
  },
  {
    _id: 'mock-2',
    name: 'Golden Hour',
    slug: { current: 'golden-hour' },
    description: 'Warm gold tones that catch the evening light beautifully.',
    productCount: 0,
  },
  {
    _id: 'mock-3',
    name: 'Midnight Garden',
    slug: { current: 'midnight-garden' },
    description: 'Dark, romantic pieces inspired by moonlit botanical gardens.',
    productCount: 0,
  },
]

function truncate(text: string, max: number): string {
  if (text.length <= max) return text
  return text.slice(0, max).trimEnd() + '…'
}

export default async function AdminCollectionsPage() {
  const fetched = await sanityFetch<Collection[]>(allCollectionsQuery)
  const collections = fetched && fetched.length > 0 ? fetched : mockCollections
  const isMock = !fetched || fetched.length === 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Collections</h2>
          <p className="text-sm text-gray-500">
            {isMock
              ? 'Showing mock data — no collections in Sanity yet'
              : `${collections.length} collection${collections.length === 1 ? '' : 's'} in Sanity CMS`}
          </p>
        </div>
        <Link
          href="/studio"
          target="_blank"
          className="flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          <ExternalLink className="h-4 w-4" />
          Open Sanity Studio
        </Link>
      </div>

      {/* Mock data notice */}
      {isMock && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          No collections found in Sanity CMS. Create them in the{' '}
          <Link href="/studio" target="_blank" className="font-medium underline">
            Sanity Studio
          </Link>{' '}
          and they will appear here automatically.
        </div>
      )}

      {/* Grid or empty state */}
      {collections.length === 0 ? (
        <EmptyState
          icon={Layers}
          title="No collections in Sanity yet"
          description="Create them in the Sanity Studio."
          action={{ label: 'Open Sanity Studio →', href: '/studio' }}
        />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {collections.map((collection) => {
            const imageUrl =
              collection.image?.asset?._ref
                ? `https://cdn.sanity.io/images/${
                    process.env.NEXT_PUBLIC_SANITY_PROJECT_ID ?? ''
                  }/${
                    process.env.NEXT_PUBLIC_SANITY_DATASET ?? 'production'
                  }/${collection.image.asset._ref
                    .replace('image-', '')
                    .replace(/-([a-z]+)$/, '.$1')}`
                : null

            const href = isMock
              ? '#'
              : `/admin/collections/${collection.slug.current}`

            return (
              <Link
                key={collection._id}
                href={href}
                className={`group relative flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md ${
                  isMock ? 'pointer-events-none opacity-60' : ''
                }`}
              >
                {/* Cover image */}
                <div className="relative h-44 w-full bg-gray-100">
                  {imageUrl ? (
                    <Image
                      src={imageUrl}
                      alt={collection.name}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <Layers className="h-12 w-12 text-gray-300" />
                    </div>
                  )}

                  {/* Product count badge */}
                  <div className="absolute right-3 top-3">
                    <span className="rounded-full bg-charcoal/80 px-2.5 py-1 text-xs font-medium text-white backdrop-blur-sm">
                      {collection.productCount ?? 0}{' '}
                      {collection.productCount === 1 ? 'product' : 'products'}
                    </span>
                  </div>
                </div>

                {/* Card body */}
                <div className="flex flex-1 flex-col p-4">
                  <h3 className="text-sm font-semibold text-gray-900 group-hover:text-charcoal">
                    {collection.name}
                  </h3>
                  {collection.description && (
                    <p className="mt-1 text-xs leading-relaxed text-gray-500">
                      {truncate(collection.description, 80)}
                    </p>
                  )}
                  {!isMock && (
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <Link
                        href={`/studio/structure/collection;${collection._id}`}
                        target="_blank"
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center gap-1 text-xs font-medium text-gray-500 hover:text-charcoal"
                      >
                        <Pencil className="h-3 w-3" />
                        Edit in Studio
                      </Link>
                    </div>
                  )}
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
