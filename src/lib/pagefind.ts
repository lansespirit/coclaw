export type PagefindResultData = {
  url: string;
  excerpt?: string;
  meta?: { title?: string };
  content?: string;
  filters?: Record<string, string[]>;
};

export type PagefindSearchResult = {
  id: string;
  data: () => Promise<PagefindResultData>;
};

export type PagefindModule = {
  search: (
    query: string,
    opts?: { filters?: Record<string, string | string[]> }
  ) => Promise<{ results: PagefindSearchResult[] }>;
  filters?: () => Promise<unknown>;
};

let cached: Promise<PagefindModule | null> | null = null;

export function loadPagefind(): Promise<PagefindModule | null> {
  if (cached) return cached;

  const pagefindPath = '/pagefind/pagefind.js';
  cached = import(/* @vite-ignore */ pagefindPath)
    .then((mod: unknown) => {
      const candidate = mod as { search?: unknown };
      if (candidate && typeof candidate.search === 'function') return mod as PagefindModule;
      return null;
    })
    .catch(() => null);

  return cached;
}
