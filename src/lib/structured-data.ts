export const SCHEMA_CONTEXT = 'https://schema.org';
export const SITE_NAME = 'CoClaw';
export const SITE_URL = 'https://coclaw.com';

export function toDateValue(value?: Date | string | number | null): string | undefined {
  if (!value) return undefined;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
}

export function toDateLabel(
  value?: Date | string | number | null,
  locale = 'en-US'
): string | null {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function toContributorEntity(name?: string | null) {
  const normalized = name?.trim();
  if (!normalized) return undefined;

  const organizationLike = /(team|community|editorial|research|staff)/i.test(normalized);
  return {
    '@type': organizationLike ? 'Organization' : 'Person',
    name: normalized,
  };
}

export function toContributorEntities(names?: string[] | null) {
  const entities = (names ?? [])
    .map((name) => toContributorEntity(name))
    .filter((entity): entity is NonNullable<typeof entity> => Boolean(entity));

  return entities.length ? entities : undefined;
}

export function buildSiteOrganization() {
  return {
    '@type': 'Organization',
    name: SITE_NAME,
    url: SITE_URL,
  };
}

export function buildSiteWebSite() {
  return {
    '@type': 'WebSite',
    name: SITE_NAME,
    url: SITE_URL,
  };
}

export function buildBreadcrumbList(items: Array<{ name: string; item: string }>) {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: items.map((entry, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: entry.name,
      item: entry.item,
    })),
  };
}

export function buildWebPage({
  name,
  description,
  url,
}: {
  name: string;
  description: string;
  url: string;
}) {
  return {
    '@type': 'WebPage',
    name,
    description,
    url,
    isPartOf: buildSiteWebSite(),
    about: buildSiteOrganization(),
  };
}

export function buildCollectionPage({
  name,
  description,
  url,
  items = [],
}: {
  name: string;
  description: string;
  url: string;
  items?: Array<{ name: string; url: string; description?: string }>;
}) {
  return {
    '@type': 'CollectionPage',
    name,
    description,
    url,
    isPartOf: buildSiteWebSite(),
    about: buildSiteOrganization(),
    hasPart: items.map((item) => ({
      '@type': 'WebPage',
      name: item.name,
      url: item.url,
      description: item.description,
    })),
    mainEntity: {
      '@type': 'ItemList',
      itemListOrder: 'https://schema.org/ItemListOrderDescending',
      numberOfItems: items.length,
      itemListElement: items.map((item, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: item.name,
        url: item.url,
      })),
    },
  };
}

export function wrapSchemaGraph(...nodes: Array<Record<string, unknown> | undefined>) {
  const graph = nodes.filter((node): node is Record<string, unknown> => Boolean(node));
  return {
    '@context': SCHEMA_CONTEXT,
    '@graph': graph,
  };
}
