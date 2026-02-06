import { Input } from '@heroui/react';
import { useEffect, useMemo, useRef, useState, type KeyboardEventHandler } from 'react';
import { loadPagefind, type PagefindModule } from '../lib/pagefind';
import { IconSearch } from './icons';

type ResourceIndexItem = {
  url: string;
  title: string;
  description?: string;
  type?: string;
  keywords?: string[];
};

type Props = {
  items?: ResourceIndexItem[];
};

function normalize(s: string): string {
  return s.toLowerCase().replace(/\s+/g, ' ').trim();
}

export const ResourceSearchInput = ({ items = [] }: Props) => {
  const [query, setQuery] = useState('');
  const [pagefind, setPagefind] = useState<PagefindModule | null>(null);
  const [results, setResults] = useState<ResourceIndexItem[] | null>(null);
  const [open, setOpen] = useState(false);

  const lastQueryRef = useRef<string>('');
  const blurTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let cancelled = false;
    loadPagefind().then((mod) => {
      if (!cancelled) setPagefind(mod);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const localIndex = useMemo(() => {
    const dedup = new Map<string, ResourceIndexItem>();
    for (const item of items) dedup.set(item.url, item);
    return [...dedup.values()];
  }, [items]);

  useEffect(() => {
    const q = normalize(query);
    if (!q) {
      setResults(null);
      return;
    }

    if (q === lastQueryRef.current) return;
    lastQueryRef.current = q;

    const runLocal = () => {
      const terms = q.split(' ').filter(Boolean);
      const rows = localIndex
        .map((item) => {
          const hay = normalize(
            [item.title, item.description ?? '', (item.keywords ?? []).join(' ')].join(' ')
          );
          const ok = terms.every((t) => hay.includes(t));
          if (!ok) return null;
          const titleHay = normalize(item.title);
          const score = terms.reduce((acc, t) => acc + (titleHay.includes(t) ? 10 : 0), 0);
          return { item, score };
        })
        .filter(Boolean) as { item: ResourceIndexItem; score: number }[];

      rows.sort((a, b) => b.score - a.score);
      setResults(rows.slice(0, 8).map((r) => r.item));
    };

    if (!pagefind) {
      runLocal();
      return;
    }

    let cancelled = false;
    pagefind
      .search(q)
      .then(async ({ results }) => {
        const rows = await Promise.all(
          results.slice(0, 8).map(async (r) => {
            const d = await r.data();
            return {
              url: d.url,
              title: d.meta?.title || d.content?.slice(0, 80) || 'Result',
              description: d.excerpt ? d.excerpt.replace(/<[^>]+>/g, '').trim() : undefined,
            } satisfies ResourceIndexItem;
          })
        );
        if (!cancelled) setResults(rows);
      })
      .catch(() => {
        if (!cancelled) runLocal();
      });

    return () => {
      cancelled = true;
    };
  }, [query, pagefind, localIndex]);

  const onKeyDown: KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (e.key !== 'Enter') return;
    const q = normalize(query);
    if (!q) return;
    const first = results?.[0];
    if (first) globalThis.location.assign(first.url);
  };

  return (
    <div className="relative">
      <Input
        value={query}
        onValueChange={setQuery}
        onKeyDown={onKeyDown}
        onFocus={() => {
          if (blurTimerRef.current) globalThis.clearTimeout(blurTimerRef.current);
          blurTimerRef.current = null;
          setOpen(true);
        }}
        onBlur={() => {
          blurTimerRef.current = globalThis.setTimeout(() => setOpen(false), 120);
        }}
        placeholder="Search for guides, videos, or help..."
        radius="full"
        size="lg"
        variant="bordered"
        className="shadow-2xl shadow-primary/5"
        startContent={<IconSearch className="w-5 h-5 text-default-400" aria-hidden="true" />}
      />

      {open && results && query.trim() ? (
        <div className="absolute z-50 left-0 right-0 mt-3 rounded-2xl border border-divider bg-content1 shadow-xl overflow-hidden">
          {results.length ? (
            <div className="divide-y divide-divider/60">
              {results.map((r) => (
                <a
                  key={r.url}
                  href={r.url}
                  className="block px-5 py-4 hover:bg-content2/60 transition-colors"
                >
                  <div className="font-semibold text-foreground truncate">{r.title}</div>
                  {r.description ? (
                    <div className="mt-1 text-sm text-default-600 line-clamp-2">
                      {r.description}
                    </div>
                  ) : null}
                </a>
              ))}
            </div>
          ) : (
            <div className="px-5 py-4 text-sm text-default-600">No matches yet.</div>
          )}

          {!pagefind ? (
            <div className="px-5 py-3 text-xs text-default-500 border-t border-divider/60">
              Showing limited results. If you can’t find what you need, try the{' '}
              <a href="/troubleshooting" className="text-primary hover:underline font-medium">
                Troubleshooting Hub
              </a>{' '}
              or browse the resources below.
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
};
