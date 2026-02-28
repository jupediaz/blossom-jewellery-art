import { defineField, defineType } from "sanity";

export const collection = defineType({
  name: "collection",
  title: "Collection / Колекція",
  type: "document",
  fields: [
    defineField({
      name: "name",
      title: "Collection Name / Назва колекції",
      type: "string",
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "slug",
      title: "URL Slug",
      type: "slug",
      options: { source: "name", maxLength: 96 },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "description",
      title: "Description (English)",
      type: "text",
    }),
    defineField({
      name: "translations",
      title: "Translations / Переклади",
      type: "object",
      fields: [
        {
          name: "es",
          title: "Español",
          type: "object",
          fields: [
            { name: "name", title: "Nombre", type: "string" },
            { name: "description", title: "Descripción", type: "text" },
          ],
        },
        {
          name: "uk",
          title: "Українська",
          type: "object",
          fields: [
            { name: "name", title: "Назва", type: "string" },
            { name: "description", title: "Опис", type: "text" },
          ],
        },
      ],
    }),
    defineField({
      name: "image",
      title: "Cover Image / Обкладинка",
      type: "image",
      options: { hotspot: true },
    }),
    defineField({
      name: "imageUrl",
      title: "External Image URL (fallback)",
      type: "url",
      description: "Temporary fallback. Upload a real image above when available.",
      hidden: ({ document }) => Boolean(document?.image),
    }),
    defineField({
      name: "orderRank",
      title: "Order Rank",
      type: "string",
      hidden: true,
    }),
  ],
  preview: {
    select: {
      title: "name",
      media: "image",
    },
  },
});
