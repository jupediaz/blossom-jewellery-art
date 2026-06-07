import type { CollectionConfig } from 'payload'

// Product catalog — mirrors the former Sanity `product` document. Localized
// fields (name/description/seo) replace Sanity's manual `translations` object.
// Stock QUANTITY stays in Postgres (Prisma `Inventory`, keyed by product id);
// `inStock` here is the display flag, kept in sync by the inventory engine.
export const Products: CollectionConfig = {
  slug: 'products',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'price', 'inStock', 'featured'],
  },
  access: { read: () => true },
  fields: [
    { name: 'name', type: 'text', required: true, localized: true },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: { description: 'URL slug, e.g. "gold-blossom-ring".' },
    },
    { name: 'description', type: 'richText', localized: true },
    { name: 'price', type: 'number', required: true, min: 0 },
    {
      name: 'compareAtPrice',
      type: 'number',
      min: 0,
      admin: { description: 'If set and higher than price, shows a SALE badge.' },
    },
    { name: 'images', type: 'upload', relationTo: 'media', hasMany: true },
    { name: 'collection', type: 'relationship', relationTo: 'collections' },
    { name: 'category', type: 'relationship', relationTo: 'categories' },
    { name: 'inStock', type: 'checkbox', defaultValue: true },
    { name: 'featured', type: 'checkbox', defaultValue: false, admin: { description: 'Show on homepage.' } },
    { name: 'materials', type: 'array', fields: [{ name: 'value', type: 'text' }] },
    { name: 'dimensions', type: 'text', localized: true },
    { name: 'careInstructions', type: 'textarea', localized: true },
    {
      name: 'variants',
      type: 'array',
      fields: [
        { name: 'name', type: 'text', required: true },
        { name: 'priceModifier', type: 'number' },
        { name: 'inStock', type: 'checkbox', defaultValue: true },
      ],
    },
    {
      name: 'seo',
      type: 'group',
      fields: [
        { name: 'title', type: 'text', localized: true },
        { name: 'description', type: 'textarea', localized: true },
      ],
    },
  ],
}
