import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { visionTool } from "@sanity/vision";
import { schemaTypes } from "@/lib/sanity/schemas";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";

export default defineConfig({
  basePath: "/studio",
  projectId,
  dataset,
  schema: {
    types: schemaTypes,
  },
  plugins: [
    structureTool({
      structure: (S) =>
        S.list()
          .title("Blossom Studio")
          .items([
            // ── CATALOGUE ──────────────────────────────
            S.listItem()
              .title("Products / Товари")
              .child(S.documentTypeList("product").title("Products")),
            S.listItem()
              .title("Collections / Колекції")
              .child(S.documentTypeList("collection").title("Collections")),
            S.listItem()
              .title("Categories / Категорії")
              .child(S.documentTypeList("category").title("Categories")),

            S.divider(),

            // ── PAGES ──────────────────────────────────
            S.listItem()
              .title("Homepage / Головна")
              .child(
                S.document()
                  .schemaType("homepage")
                  .documentId("homepage")
                  .title("Homepage")
              ),
            S.listItem()
              .title("About Page / Про мене")
              .child(
                S.document()
                  .schemaType("aboutPage")
                  .documentId("aboutPage")
                  .title("About Page")
              ),

            S.divider(),

            // ── BLOG ───────────────────────────────────
            S.listItem()
              .title("Blog Posts")
              .child(S.documentTypeList("blogPost").title("Blog Posts")),
            S.listItem()
              .title("Authors")
              .child(S.documentTypeList("author").title("Authors")),

            S.divider(),

            // ── SETTINGS ───────────────────────────────
            S.listItem()
              .title("Site Settings / Налаштування")
              .child(
                S.document()
                  .schemaType("siteSettings")
                  .documentId("siteSettings")
                  .title("Site Settings")
              ),
          ]),
    }),
    visionTool({ defaultApiVersion: "2026-02-12" }),
  ],
});
