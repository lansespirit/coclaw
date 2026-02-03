import { useEffect, useMemo, useRef, useState } from 'react';

type PagefindResultData = {
  url: string;
  excerpt?: string;
  meta?: { title?: string };
  content?: string;
  filters?: Record<string, string[]>;
};

type PagefindSearchResult = {
  id: string;
  data: () => Promise<PagefindResultData>;
};

type Pagefind = {
  search: (
    query: string,
    opts?: { filters?: Record<string, string | string[]> }
  ) => Promise<{ results: PagefindSearchResult[] }>;
};

type Props = {
  channels: string[];
  os: string[];
  components: string[];
  severities: string[];
  initialQuery?: string;
  initialChannel?: string;
  initialOs?: string;
  initialComponent?: string;
  initialSeverity?: string;
};

export function TroubleshootingSearch({
  channels,
  os,
  components,
  severities,
  initialQuery = '',
  initialChannel = 'all',
  initialOs = 'all',
  initialComponent = 'all',
  initialSeverity = 'all',
}: Props) {
  const normalizeInitial = (value: string, allowed: string[]) => {
    const v = value.trim();
    if (!v || v === 'all') return 'all';
    return allowed.includes(v) ? v : 'all';
  };

  const [query, setQuery] = useState(initialQuery);
  const [channel, setChannel] = useState(normalizeInitial(initialChannel, channels));
  const [osValue, setOsValue] = useState(normalizeInitial(initialOs, os));
  const [component, setComponent] = useState(normalizeInitial(initialComponent, components));
  const [severity, setSeverity] = useState(normalizeInitial(initialSeverity, severities));

  const [pagefind, setPagefind] = useState<Pagefind | null>(null);
  const [results, setResults] = useState<
    | null
    | {
        url: string;
        title: string;
        excerpt: string;
        filters: Record<string, string[]>;
      }[]
  >(null);

  const lastKeyRef = useRef<string>('');

  useEffect(() => {
    const w = globalThis as typeof globalThis & { pagefind?: Pagefind };
    if (w.pagefind) {
      setPagefind(w.pagefind);
      return;
    }

    const pagefindPath = '/pagefind/pagefind.js';
    import(/* @vite-ignore */ pagefindPath)
      .then(() => {
        if (w.pagefind) setPagefind(w.pagefind);
      })
      .catch(() => {
        // ignore - dev mode doesn't have Pagefind
      });
  }, []);

  const activeFilters = useMemo(() => {
    const filters: Record<string, string | string[]> = {
      type: 'troubleshooting',
      kind: 'solution',
    };
    if (channel !== 'all') filters.channel = channel;
    if (osValue !== 'all') filters.os = osValue;
    if (component !== 'all') filters.component = component;
    if (severity !== 'all') filters.severity = severity;
    return filters;
  }, [channel, osValue, component, severity]);

  useEffect(() => {
    if (!pagefind) return;

    const q = query.trim();
    if (!q) {
      setResults(null);
      return;
    }

    const key = `${q}::${channel}::${osValue}::${component}::${severity}`;
    if (key === lastKeyRef.current) return;
    lastKeyRef.current = key;

    let cancelled = false;
    pagefind
      .search(q, { filters: activeFilters })
      .then(async ({ results }) => {
        const rows = await Promise.all(
          results.slice(0, 20).map(async (r) => {
            const d = await r.data();
            return {
              url: d.url,
              title: d.meta?.title || d.content?.slice(0, 80) || 'Result',
              excerpt: d.excerpt || '',
              filters: d.filters || {},
            };
          })
        );
        if (!cancelled) setResults(rows);
      })
      .catch(() => {
        if (!cancelled) setResults([]);
      });

    return () => {
      cancelled = true;
    };
  }, [pagefind, query, activeFilters, channel, osValue, component, severity]);

  return (
    <div className="space-y-5">
      <div className="grid gap-3 md:grid-cols-3">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder='Search solutions (paste error text like "EACCES", "unauthorized", "EADDRINUSE")'
          className="md:col-span-3 w-full px-4 py-4 rounded-2xl border-2 border-divider bg-content1 text-foreground placeholder:text-default-500 focus:border-primary focus:outline-none transition-colors text-lg"
        />
      </div>

      <div className="grid gap-3 md:grid-cols-4">
        <select
          value={channel}
          onChange={(e) => setChannel(e.target.value)}
          className="w-full px-4 py-3 rounded-xl border border-divider bg-content1 text-foreground focus:border-primary focus:outline-none transition-colors"
        >
          <option value="all">All channels</option>
          {channels.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>

        <select
          value={osValue}
          onChange={(e) => setOsValue(e.target.value)}
          className="w-full px-4 py-3 rounded-xl border border-divider bg-content1 text-foreground focus:border-primary focus:outline-none transition-colors"
        >
          <option value="all">All OS</option>
          {os.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>

        <select
          value={component}
          onChange={(e) => setComponent(e.target.value)}
          className="w-full px-4 py-3 rounded-xl border border-divider bg-content1 text-foreground focus:border-primary focus:outline-none transition-colors"
        >
          <option value="all">All components</option>
          {components.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>

        <select
          value={severity}
          onChange={(e) => setSeverity(e.target.value)}
          className="w-full px-4 py-3 rounded-xl border border-divider bg-content1 text-foreground focus:border-primary focus:outline-none transition-colors"
        >
          <option value="all">All severities</option>
          {severities.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      {!pagefind ? (
        <div className="text-sm text-default-600">
          Search is available on the live site. If you’re previewing locally, you may need to build
          once to generate the search index.
        </div>
      ) : null}

      <div className="text-sm text-default-600">
        Tip: paste the exact error line (for example: <code className="px-2 py-1 rounded bg-content2">EACCES</code>,{' '}
        <code className="px-2 py-1 rounded bg-content2">unauthorized</code>,{' '}
        <code className="px-2 py-1 rounded bg-content2">EADDRINUSE</code>) and then narrow down using filters.
      </div>

      {results && query.trim() ? (
        results.length ? (
          <div className="space-y-3">
            {results.map((r) => (
              <a
                key={r.url}
                href={r.url}
                className="block rounded-xl border border-divider bg-content1 p-5 hover:border-primary/40 transition-colors"
              >
                <h3 className="font-semibold text-foreground truncate">{r.title}</h3>
                {r.excerpt ? (
                  <p
                    className="mt-2 text-sm text-default-700 line-clamp-3"
                    dangerouslySetInnerHTML={{ __html: r.excerpt }}
                  />
                ) : null}
              </a>
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-divider bg-content1 p-6">
            <div className="font-semibold text-foreground">No matching solutions yet.</div>
            <div className="mt-2 text-sm text-default-700 dark:text-default-500">
              Try broader keywords, clear filters, or browse{' '}
              <a className="text-primary hover:underline" href="/troubleshooting/solutions">
                all solutions
              </a>
              . If you’re still stuck, ask in the{' '}
              <a
                className="text-primary hover:underline"
                href="https://forum.coclaw.com"
                target="_blank"
                rel="noopener noreferrer"
              >
                Community Forum
              </a>
              .
            </div>
          </div>
        )
      ) : null}
    </div>
  );
}
