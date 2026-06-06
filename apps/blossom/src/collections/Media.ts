import type { CollectionConfig } from 'payload'

// Product/content images. Files are stored in Cloudflare R2 via the s3Storage
// plugin (see payload.config.ts). `alt` is localized for accessibility + i18n.
export const Media: CollectionConfig = {
  slug: 'media',
  access: { read: () => true },
  upload: {
    // Raster formats only — SVG is excluded to prevent stored XSS via
    // <script> in uploaded vector files.
    mimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif'],
    imageSizes: [
      { name: 'thumbnail', width: 400 },
      { name: 'card', width: 768 },
      { name: 'full', width: 1600 },
    ],
  },
  fields: [{ name: 'alt', type: 'text', localized: true }],
}
