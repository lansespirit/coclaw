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

const troubleshootingCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    slug: z.string().optional(),

    // Core classification (solution vs case)
    kind: z.enum(['solution', 'case']).default('solution'),

    // Troubleshooting facets (used for filters + chips)
    component: z.string().optional(),
    severity: z.enum(['low', 'medium', 'high', 'critical']).optional(),
    os: z.array(z.string()).optional(),
    channel: z.array(z.string()).optional(),

    // Search helpers
    errorSignatures: z.array(z.string()).optional(),
    affectedVersions: z.array(z.string()).optional(),

    // SEO + content metadata
    keywords: z.array(z.string()).optional(),
    author: z.string().default('CoClaw Team'),
    publishDate: z.date(),
    lastUpdated: z.date(),

    // Cross-linking
    related: z
      .object({
        guides: z.array(z.string()).optional(),
        docs: z.array(z.string()).optional(),
        githubIssues: z.array(z.number()).optional(),
        external: z
          .array(
            z.object({
              label: z.string(),
              url: z.string().url(),
            })
          )
          .optional(),
      })
      .optional(),

    // Content status
    draft: z.boolean().default(false),
    archived: z.boolean().default(false),
    needsReview: z.boolean().default(false),
  }),
});

const storiesCollection = defineCollection({
  type: 'content',
  schema: z.object({
    name: z.string(),
    role: z.string(),
    company: z.string(),
    avatar: z.string(),
    ogImage: z.string().optional(),
    // Optional large hero/background image for the story detail page.
    coverImage: z.string().optional(),
    summary: z.string(),
    quote: z.string(),
    publishDate: z.date(),
    keywords: z.string().optional(),
    featured: z.boolean().default(false),
    sources: z
      .array(
        z.object({
          label: z.string(),
          url: z.string().url(),
        })
      )
      .optional(),
    draft: z.boolean().default(false),
  }),
});

const guidesCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    category: z.string(),
    difficulty: z.enum(['Beginner', 'Intermediate', 'Advanced']),
    platforms: z.array(z.string()),
    time: z.string(),
    steps: z.array(
      z.object({
        title: z.string(),
        content: z.string(),
      })
    ),
    keywords: z.array(z.string()).optional(),
    ogImage: z.string().optional(),
    publishDate: z.date(),
    lastUpdated: z.date(),
    featured: z.boolean().default(false),
    draft: z.boolean().default(false),
  }),
});

export const collections = {
  'getting-started': docsCollection,
  channels: docsCollection,
  troubleshooting: troubleshootingCollection,
  guides: guidesCollection,
  blog: docsCollection,
  templates: docsCollection,
  stories: storiesCollection,
};
