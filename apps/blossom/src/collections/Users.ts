import type { CollectionConfig } from 'payload'

// Payload admin users (CMS editors, e.g. the store owner). Separate from the
// storefront/customer auth (NextAuth) and the custom /admin panel — this only
// gates the Payload CMS at /cms/admin.
export const Users: CollectionConfig = {
  slug: 'users',
  auth: true,
  admin: { useAsTitle: 'email' },
  // CMS users are not public — only authenticated admins can read them
  // (prevents account enumeration). Storefront never reads this collection.
  access: { read: ({ req: { user } }) => !!user },
  fields: [{ name: 'name', type: 'text' }],
}
