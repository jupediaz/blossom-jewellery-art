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
          .title("Content")
          .items([
            S.listItem()
              .title("Products")
              .child(
                S.documentTypeList("product").title("Products")
              ),
            S.listItem()
              .title("Categories")
              .child(
                S.documentTypeList("category").title("Categories")
              ),
            S.listItem()
              .title("Collections")
              .child(
                S.documentTypeList("collection").title("Collections")
              ),
            S.divider(),
            S.listItem()
              .title("Blog Posts")
              .child(
                S.documentTypeList("blogPost").title("Blog Posts")
              ),
            S.listItem()
              .title("Authors")
              .child(
                S.documentTypeList("author").title("Authors")
              ),
            S.divider(),
            S.listItem()
              .title("Site Settings")
              .child(
                S.document()
                  .schemaType("siteSettings")
                  .documentId("siteSettings")
              ),
          ]),
    }),
    visionTool({ defaultApiVersion: "2026-02-12" }),
  ],
});
