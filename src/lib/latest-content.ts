import { getCollection, type CollectionEntry } from 'astro:content';

export type LatestContentKind = 'blog' | 'guide' | 'troubleshooting' | 'story';

export interface LatestContentItem {
  id: string;
  kind: LatestContentKind;
  href: string;
  title: string;
  description: string;
  publishDate: Date;
  badge: string;
}

type QuotaMap = Partial<Record<LatestContentKind, number>>;

type CandidateItem = LatestContentItem & {
  rank: number;
};

const DEFAULT_LIMIT = 8;
const DEFAULT_QUOTAS: QuotaMap = {
  blog: 2,
  guide: 2,
  troubleshooting: 3,
  story: 2,
};

function hasArchivedFlag(entry: {
  data: {
    archived?: boolean;
  };
}): boolean {
  return entry.data.archived === true;
}

function mapBlogEntry(entry: CollectionEntry<'blog'>): LatestContentItem {
  return {
    id: `blog:${entry.slug}`,
    kind: 'blog',
    href: `/blog/${entry.slug}`,
    title: entry.data.title,
    description: entry.data.description,
    publishDate: entry.data.publishDate,
    badge: entry.data.category || 'Blog',
  };
}

function mapGuideEntry(entry: CollectionEntry<'guides'>): LatestContentItem {
  return {
    id: `guide:${entry.slug}`,
    kind: 'guide',
    href: `/guides/${entry.slug}`,
    title: entry.data.title,
    description: entry.data.description,
    publishDate: entry.data.publishDate,
    badge: 'Guide',
  };
}

function mapTroubleshootingEntry(entry: CollectionEntry<'troubleshooting'>): LatestContentItem {
  return {
    id: `troubleshooting:${entry.slug}`,
    kind: 'troubleshooting',
    href: `/troubleshooting/${entry.slug}`,
    title: entry.data.title,
    description: entry.data.description,
    publishDate: entry.data.publishDate,
    badge: 'Fix',
  };
}

function mapStoryEntry(entry: CollectionEntry<'stories'>): LatestContentItem {
  return {
    id: `story:${entry.slug}`,
    kind: 'story',
    href: `/stories/${entry.slug}`,
    title: entry.data.name,
    description: entry.data.summary,
    publishDate: entry.data.publishDate,
    badge: 'Story',
  };
}

function sortByPublishDate<T extends { publishDate: Date }>(items: T[]): T[] {
  return [...items].sort((a, b) => b.publishDate.getTime() - a.publishDate.getTime());
}

function takeByQuota(
  items: LatestContentItem[],
  limit: number,
  quotas: QuotaMap
): LatestContentItem[] {
  const sorted = sortByPublishDate(items).map((item, rank) => ({ ...item, rank }));
  const selected: CandidateItem[] = [];
  const selectedIds = new Set<string>();
  const counts: Record<LatestContentKind, number> = {
    blog: 0,
    guide: 0,
    troubleshooting: 0,
    story: 0,
  };

  const perTypeGroups: Record<LatestContentKind, CandidateItem[]> = {
    blog: [],
    guide: [],
    troubleshooting: [],
    story: [],
  };

  for (const item of sorted) {
    perTypeGroups[item.kind].push(item);
  }

  const kinds: LatestContentKind[] = ['blog', 'guide', 'troubleshooting', 'story'];

  for (const kind of kinds) {
    const nextItem = perTypeGroups[kind][0];
    if (!nextItem || selected.length >= limit) continue;
    selected.push(nextItem);
    selectedIds.add(nextItem.id);
    counts[kind] += 1;
  }

  for (const item of sorted) {
    if (selected.length >= limit) break;
    if (selectedIds.has(item.id)) continue;

    const maxForKind = quotas[item.kind] ?? Number.POSITIVE_INFINITY;
    if (counts[item.kind] >= maxForKind) continue;

    selected.push(item);
    selectedIds.add(item.id);
    counts[item.kind] += 1;
  }

  return selected
    .sort((a, b) => {
      const dateDelta = b.publishDate.getTime() - a.publishDate.getTime();
      if (dateDelta !== 0) return dateDelta;
      return a.rank - b.rank;
    })
    .slice(0, limit)
    .map(({ rank: _rank, ...item }) => item);
}

export async function getLatestHomepageContent(options?: {
  limit?: number;
  quotas?: QuotaMap;
}): Promise<LatestContentItem[]> {
  const limit = options?.limit ?? DEFAULT_LIMIT;
  const quotas = options?.quotas ?? DEFAULT_QUOTAS;

  const [blogEntries, guideEntries, troubleshootingEntries, storyEntries] = await Promise.all([
    getCollection('blog', ({ data }) => !data.draft && !hasArchivedFlag({ data })),
    getCollection('guides', ({ data }) => !data.draft),
    getCollection(
      'troubleshooting',
      ({ data }) => !data.draft && data.kind === 'solution' && !hasArchivedFlag({ data })
    ),
    getCollection('stories', ({ data }) => !data.draft),
  ]);

  const items: LatestContentItem[] = [
    ...blogEntries.map(mapBlogEntry),
    ...guideEntries.map(mapGuideEntry),
    ...troubleshootingEntries.map(mapTroubleshootingEntry),
    ...storyEntries.map(mapStoryEntry),
  ];

  return takeByQuota(items, limit, quotas);
}
