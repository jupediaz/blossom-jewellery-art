import { defineField, defineType } from "sanity";

// Singleton document — homepage editable content
export const homepage = defineType({
  name: "homepage",
  title: "Homepage / Головна сторінка",
  type: "document",
  groups: [
    { name: "hero", title: "Hero Section", default: true },
    { name: "announcement", title: "Announcement Bar" },
  ],
  fields: [
    // ── HERO ──────────────────────────────────────────
    defineField({
      name: "heroImage",
      title: "Hero Background Image / Фото героя",
      type: "image",
      group: "hero",
      options: { hotspot: true },
      description: "Large full-screen image on the homepage. Recommended: 1920×1080px.",
    }),
    defineField({
      name: "heroHeadline",
      title: "Hero Headline / Заголовок",
      type: "object",
      group: "hero",
      fields: [
        { name: "en", title: "English", type: "string" },
        { name: "es", title: "Español", type: "string" },
        { name: "uk", title: "Українська", type: "string" },
      ],
    }),
    defineField({
      name: "heroSubtitle",
      title: "Hero Subtitle / Підзаголовок",
      type: "object",
      group: "hero",
      fields: [
        { name: "en", title: "English", type: "text", rows: 2 },
        { name: "es", title: "Español", type: "text", rows: 2 },
        { name: "uk", title: "Українська", type: "text", rows: 2 },
      ],
    }),
    defineField({
      name: "heroCta",
      title: "Hero Button Text / Текст кнопки",
      type: "object",
      group: "hero",
      fields: [
        { name: "en", title: "English", type: "string" },
        { name: "es", title: "Español", type: "string" },
        { name: "uk", title: "Українська", type: "string" },
      ],
    }),

    // ── ANNOUNCEMENT BAR ──────────────────────────────
    defineField({
      name: "announcementBar",
      title: "Announcement Bar / Стрічка оголошень",
      type: "object",
      group: "announcement",
      description: "The banner shown at the very top of all pages.",
      fields: [
        {
          name: "enabled",
          title: "Show announcement bar?",
          type: "boolean",
          initialValue: false,
        },
        {
          name: "text",
          title: "Text",
          type: "object",
          fields: [
            { name: "en", title: "English", type: "string" },
            { name: "es", title: "Español", type: "string" },
            { name: "uk", title: "Українська", type: "string" },
          ],
        },
        {
          name: "link",
          title: "Link URL (optional)",
          type: "url",
        },
      ],
    }),
  ],
  preview: {
    prepare() {
      return { title: "Homepage" };
    },
  },
});
