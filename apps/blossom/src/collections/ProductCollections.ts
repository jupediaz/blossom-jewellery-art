import type { CollectionConfig } from 'payload'

// Curated product collections (slug `collections`) — mirrors Sanity `collection`.
export const ProductCollections: CollectionConfig = {
  slug: 'collections',
  admin: { useAsTitle: 'name', defaultColumns: ['name', 'orderRank'] },
  access: { read: () => true },
  fields: [
    { name: 'name', type: 'text', required: true, localized: true },
    { name: 'slug', type: 'text', required: true, unique: true, index: true },
    { name: 'description', type: 'textarea', localized: true },
    { name: 'image', type: 'upload', relationTo: 'media' },
    { name: 'orderRank', type: 'text', admin: { description: 'Sort key for display order.' } },
  ],
}
