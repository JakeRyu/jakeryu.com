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

// Portfolio data: one YAML file per entry (or per skill group). The file name is the id.
const yamlEntries = (collection: string) => glob({ pattern: "*.yaml", base: `${contentDir}/${collection}` });

const projects = defineCollection({
  loader: yamlEntries("projects"),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string(),
      role: z.string(),
      stack: z.array(z.string()).min(1),
      image: image().optional(),
    }),
});

const skills = defineCollection({
  loader: yamlEntries("skills"),
  schema: z.object({
    group: z.string(),
    items: z.array(z.string()).min(1),
  }),
});

const publications = defineCollection({
  loader: yamlEntries("publications"),
  schema: z.object({ title: z.string(), year: z.number().int() }),
});

const certifications = defineCollection({
  loader: yamlEntries("certifications"),
  schema: z.object({ title: z.string(), year: z.number().int() }),
});

export const collections = { blog, projects, skills, publications, certifications };
