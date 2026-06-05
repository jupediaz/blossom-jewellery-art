import { defineField, defineType } from "sanity";

// Singleton document — one per site. Editable at /studio → About Page
export const aboutPage = defineType({
  name: "aboutPage",
  title: "About Page / Сторінка «Про мене»",
  type: "document",
  groups: [
    { name: "artist", title: "Artist / Художниця", default: true },
    { name: "craft", title: "The Craft / Майстерність" },
    { name: "values", title: "Values / Цінності" },
    { name: "process", title: "Process / Процес" },
    { name: "photos", title: "Photos / Фото" },
  ],
  fields: [
    // ── ARTIST ────────────────────────────────────────
    defineField({
      name: "artistName",
      title: "Artist Name / Ім'я",
      type: "string",
      group: "artist",
    }),
    defineField({
      name: "artistRole",
      title: "Artist Title / Посада (e.g. Polymer Clay Artist · Marbella, Spain)",
      type: "string",
      group: "artist",
    }),
    defineField({
      name: "bio",
      title: "Biography / Біографія",
      type: "object",
      group: "artist",
      description: "The artist's story. Shown in the main About section.",
      fields: [
        {
          name: "en",
          title: "English",
          type: "array",
          of: [{ type: "block" }],
        },
        {
          name: "es",
          title: "Español",
          type: "array",
          of: [{ type: "block" }],
        },
        {
          name: "uk",
          title: "Українська",
          type: "array",
          of: [{ type: "block" }],
        },
      ],
    }),

    // ── PHOTOS ────────────────────────────────────────
    defineField({
      name: "portraitPhoto",
      title: "Portrait Photo / Портрет",
      type: "image",
      group: "photos",
      options: { hotspot: true },
      fields: [{ name: "alt", title: "Alt Text", type: "string" }],
    }),
    defineField({
      name: "craftPhoto",
      title: "Craft Process Photo / Фото процесу",
      type: "image",
      group: "photos",
      options: { hotspot: true },
      fields: [{ name: "alt", title: "Alt Text", type: "string" }],
    }),
    defineField({
      name: "workshopPhoto",
      title: "Workshop / Atelier Photo",
      type: "image",
      group: "photos",
      options: { hotspot: true },
      fields: [{ name: "alt", title: "Alt Text", type: "string" }],
    }),

    // ── CRAFT ─────────────────────────────────────────
    defineField({
      name: "craftSectionTitle",
      title: "Craft Section Title / Назва розділу «Майстерність»",
      type: "object",
      group: "craft",
      fields: [
        { name: "en", title: "English", type: "string" },
        { name: "es", title: "Español", type: "string" },
        { name: "uk", title: "Українська", type: "string" },
      ],
    }),
    defineField({
      name: "craftSectionText",
      title: "Craft Section Text / Текст розділу",
      type: "object",
      group: "craft",
      fields: [
        { name: "en", title: "English", type: "text", rows: 4 },
        { name: "es", title: "Español", type: "text", rows: 4 },
        { name: "uk", title: "Українська", type: "text", rows: 4 },
      ],
    }),

    // ── VALUES ────────────────────────────────────────
    defineField({
      name: "values",
      title: "Values (3 items) / Цінності",
      type: "array",
      group: "values",
      of: [
        {
          type: "object",
          fields: [
            {
              name: "title",
              title: "Title",
              type: "object",
              fields: [
                { name: "en", title: "English", type: "string" },
                { name: "es", title: "Español", type: "string" },
                { name: "uk", title: "Українська", type: "string" },
              ],
            },
            {
              name: "text",
              title: "Description",
              type: "object",
              fields: [
                { name: "en", title: "English", type: "text", rows: 2 },
                { name: "es", title: "Español", type: "text", rows: 2 },
                { name: "uk", title: "Українська", type: "text", rows: 2 },
              ],
            },
          ],
          preview: {
            select: { title: "title.en" },
          },
        },
      ],
      validation: (rule) => rule.max(3),
    }),

    // ── PROCESS STEPS ─────────────────────────────────
    defineField({
      name: "processSteps",
      title: "Creative Process Steps (4 steps) / Кроки процесу",
      type: "array",
      group: "process",
      of: [
        {
          type: "object",
          fields: [
            { name: "stepNumber", title: "Step Number (01, 02...)", type: "string" },
            {
              name: "title",
              title: "Step Title",
              type: "object",
              fields: [
                { name: "en", title: "English", type: "string" },
                { name: "es", title: "Español", type: "string" },
                { name: "uk", title: "Українська", type: "string" },
              ],
            },
            {
              name: "text",
              title: "Step Description",
              type: "object",
              fields: [
                { name: "en", title: "English", type: "text", rows: 2 },
                { name: "es", title: "Español", type: "text", rows: 2 },
                { name: "uk", title: "Українська", type: "text", rows: 2 },
              ],
            },
          ],
          preview: {
            select: { title: "title.en", subtitle: "stepNumber" },
          },
        },
      ],
      validation: (rule) => rule.max(4),
    }),
  ],
  preview: {
    prepare() {
      return { title: "About Page" };
    },
  },
});
