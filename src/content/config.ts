import { defineCollection, z } from 'astro:content';

const docsCollection = defineCollection({
  type: 'content',
  schema: z.object({
    // Basic Metadata
    title: z.string(),
    description: z.string(),
    slug: z.string().optional(),

    // Content Classification
    category: z.string(),
    subcategory: z.string().optional(),
    platform: z.string().optional(),
    difficulty: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
    estimatedTime: z.string().optional(),

    // SEO Metadata
    keywords: z.array(z.string()).optional(),
    ogImage: z.string().optional(),
    ogType: z.string().optional(),
    twitterCard: z.string().optional(),

    // Content Metadata
    author: z.string().default('CoClaw Team'),
    contributors: z.array(z.string()).optional(),
    publishDate: z.date(),
    lastUpdated: z.date(),
    version: z.string().optional(),

    // Navigation & Organization
    order: z.number().optional(),
    featured: z.boolean().default(false),
    relatedPages: z.array(z.string()).optional(),

    // Schema.org Structured Data
    schema: z
      .object({
        type: z.string(),
        totalTime: z.string().optional(),
        tool: z.string().optional(),
        supply: z.string().optional(),
      })
      .optional(),

    // Localization
    lang: z.string().default('en'),
    translations: z.record(z.string()).optional(),

    // Content Status
    draft: z.boolean().default(false),
    archived: z.boolean().default(false),
    needsReview: z.boolean().default(false),
  }),
});

export const collections = {
  'getting-started': docsCollection,
  channels: docsCollection,
  troubleshooting: docsCollection,
  guides: docsCollection,
  blog: docsCollection,
  templates: docsCollection,
};
