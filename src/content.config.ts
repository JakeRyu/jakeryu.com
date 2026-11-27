import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

// Content lives in one folder per collection, e.g. <contentDir>/blog/<slug>/index.mdx.
// Tests point CONTENT_DIR at a fixture set so they never depend on real content.
const contentDir = process.env.CONTENT_DIR ?? "./src/content";

const blog = defineCollection({
  // The folder name is the slug.
  loader: glob({
    pattern: "*/index.mdx",
    base: `${contentDir}/blog`,
    generateId: ({ entry }) => entry.slice(0, entry.indexOf("/")),
  }),
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    date: z.coerce.date(),
    tags: z.array(z.string()).default([]),
    language: z.enum(["en", "ko"]).default("en"),
    translationKey: z.string().optional(),
    draft: z.boolean().default(false),
  }),
});

export const collections = { blog };
