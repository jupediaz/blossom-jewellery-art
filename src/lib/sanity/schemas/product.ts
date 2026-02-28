import { defineField, defineType } from "sanity";

export const product = defineType({
  name: "product",
  title: "Product / Товар",
  type: "document",
  groups: [
    { name: "main", title: "Main / Основне", default: true },
    { name: "translations", title: "Translations EN / ES / UK" },
    { name: "details", title: "Details / Деталі" },
    { name: "seo", title: "SEO" },
  ],
  fields: [
    // ── MAIN ──────────────────────────────────────────
    defineField({
      name: "name",
      title: "Name (default)",
      type: "string",
      group: "main",
      description: "Main product name. Used when no translation is set.",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "slug",
      title: "URL Slug",
      type: "slug",
      group: "main",
      options: { source: "name", maxLength: 96 },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "description",
      title: "Description (default)",
      type: "array",
      group: "main",
      of: [{ type: "block" }],
    }),
    defineField({
      name: "price",
      title: "Price (EUR) / Ціна (EUR)",
      type: "number",
      group: "main",
      validation: (rule) => rule.required().positive(),
    }),
    defineField({
      name: "compareAtPrice",
      title: "Original Price (for sale badge) / Стара ціна",
      type: "number",
      group: "main",
      description: "If set, a SALE badge will appear on the product.",
    }),
    defineField({
      name: "images",
      title: "Images / Фото",
      type: "array",
      group: "main",
      of: [
        {
          type: "image",
          options: { hotspot: true },
          fields: [
            {
              name: "alt",
              title: "Alt Text",
              type: "string",
            },
          ],
        },
      ],
    }),
    defineField({
      name: "imageUrl",
      title: "External Image URL (fallback)",
      type: "url",
      group: "main",
      description:
        "Temporary fallback image URL. Add real images above when available. This field will be ignored once images are uploaded.",
      hidden: ({ document }) =>
        Boolean(
          document?.images &&
            Array.isArray(document.images) &&
            document.images.length > 0
        ),
    }),
    defineField({
      name: "collection",
      title: "Collection / Колекція",
      type: "reference",
      group: "main",
      to: [{ type: "collection" }],
    }),
    defineField({
      name: "category",
      title: "Category / Категорія",
      type: "reference",
      group: "main",
      to: [{ type: "category" }],
    }),
    defineField({
      name: "inStock",
      title: "In Stock / В наявності",
      type: "boolean",
      group: "main",
      initialValue: true,
    }),
    defineField({
      name: "featured",
      title: "Show on Homepage / На головній",
      type: "boolean",
      group: "main",
      initialValue: false,
    }),

    // ── TRANSLATIONS ──────────────────────────────────
    defineField({
      name: "translations",
      title: "Multilingual Content / Переклади",
      type: "object",
      group: "translations",
      description:
        "Use the AI Description Generator below to fill these automatically. Or type manually.",
      fields: [
        defineField({
          name: "en",
          title: "English",
          type: "object",
          fields: [
            {
              name: "name",
              title: "Product Name",
              type: "string",
            },
            {
              name: "shortDescription",
              title: "Short Description (product cards, 1-2 lines)",
              type: "text",
              rows: 2,
            },
            {
              name: "description",
              title: "Full Description",
              type: "array",
              of: [{ type: "block" }],
            },
          ],
        }),
        defineField({
          name: "es",
          title: "Español",
          type: "object",
          fields: [
            {
              name: "name",
              title: "Nombre del producto",
              type: "string",
            },
            {
              name: "shortDescription",
              title: "Descripción corta",
              type: "text",
              rows: 2,
            },
            {
              name: "description",
              title: "Descripción completa",
              type: "array",
              of: [{ type: "block" }],
            },
          ],
        }),
        defineField({
          name: "uk",
          title: "Українська",
          type: "object",
          fields: [
            {
              name: "name",
              title: "Назва товару",
              type: "string",
            },
            {
              name: "shortDescription",
              title: "Короткий опис",
              type: "text",
              rows: 2,
            },
            {
              name: "description",
              title: "Повний опис",
              type: "array",
              of: [{ type: "block" }],
            },
          ],
        }),
      ],
    }),

    // ── DETAILS ───────────────────────────────────────
    defineField({
      name: "materials",
      title: "Materials / Матеріали",
      type: "array",
      group: "details",
      of: [{ type: "string" }],
      options: { layout: "tags" },
    }),
    defineField({
      name: "dimensions",
      title: "Dimensions / Розміри",
      type: "string",
      group: "details",
      description: "e.g., 3cm x 1.5cm",
    }),
    defineField({
      name: "careInstructions",
      title: "Care Instructions / Догляд",
      type: "text",
      group: "details",
    }),
    defineField({
      name: "variants",
      title: "Variants / Варіанти",
      type: "array",
      group: "details",
      of: [
        {
          type: "object",
          fields: [
            { name: "name", title: "Variant Name", type: "string" },
            {
              name: "priceModifier",
              title: "Price Modifier (EUR)",
              type: "number",
            },
            {
              name: "inStock",
              title: "In Stock",
              type: "boolean",
              initialValue: true,
            },
          ],
        },
      ],
    }),
    defineField({
      name: "orderRank",
      title: "Order Rank",
      type: "string",
      group: "details",
      hidden: true,
    }),

    // ── SEO ───────────────────────────────────────────
    defineField({
      name: "seo",
      title: "SEO",
      type: "object",
      group: "seo",
      fields: [
        { name: "metaTitle", title: "Meta Title (max 60 chars)", type: "string" },
        {
          name: "metaDescription",
          title: "Meta Description (max 155 chars)",
          type: "text",
          rows: 3,
        },
      ],
    }),
  ],
  preview: {
    select: {
      title: "name",
      subtitle: "price",
      media: "images.0",
    },
    prepare({ title, subtitle, media }) {
      return {
        title,
        subtitle: subtitle ? `€${subtitle}` : "No price",
        media,
      };
    },
  },
});
