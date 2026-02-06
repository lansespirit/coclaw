import { useEffect, useMemo, useRef, useState } from 'react';
import { loadPagefind, type PagefindModule } from '../../lib/pagefind';

type LocalSolution = {
  url: string;
  title: string;
  description: string;
  channel: string[];
  os: string[];
  component?: string | null;
  severity?: string | null;
  errorSignatures?: string[];
};

type Props = {
  channels: string[];
  os: string[];
  components: string[];
  severities: string[];
  localIndex?: LocalSolution[];
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
  localIndex = [],
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

  const [pagefind, setPagefind] = useState<PagefindModule | null>(null);
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
    let cancelled = false;
    loadPagefind().then((mod) => {
      if (!cancelled) setPagefind(mod);
    });
    return () => {
      cancelled = true;
    };
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
    const q = query.trim();
    if (!q) {
      setResults(null);
      return;
    }

    const key = `${q}::${channel}::${osValue}::${component}::${severity}`;
    if (key === lastKeyRef.current) return;
    lastKeyRef.current = key;

    let cancelled = false;

    const runLocalSearch = () => {
      const qLower = q.toLowerCase();
      const terms = qLower.split(/\s+/).filter(Boolean);

      const matchesQuery = (s: LocalSolution) => {
        const haystack = [
          s.title,
          s.description,
          ...(s.errorSignatures ?? []),
          ...(s.channel ?? []),
          ...(s.os ?? []),
          s.component ?? '',
          s.severity ?? '',
        ]
          .join(' ')
          .toLowerCase();

        return terms.every((t) => haystack.includes(t));
      };

      const rows = localIndex
        .filter((s) => {
          if (!matchesQuery(s)) return false;
          if (channel !== 'all' && !s.channel.includes(channel)) return false;
          if (osValue !== 'all' && !s.os.includes(osValue)) return false;
          if (component !== 'all' && (s.component ?? '') !== component) return false;
          if (severity !== 'all' && (s.severity ?? '') !== severity) return false;
          return true;
        })
        .slice(0, 20)
        .map((s) => ({
          url: s.url,
          title: s.title,
          excerpt: s.description,
          filters: {
            type: ['troubleshooting'],
            kind: ['solution'],
            ...(s.component ? { component: [s.component] } : {}),
            ...(s.severity ? { severity: [s.severity] } : {}),
            ...(s.channel?.length ? { channel: s.channel } : {}),
            ...(s.os?.length ? { os: s.os } : {}),
          },
        }));

      setResults(rows);
    };

    if (!pagefind) {
      runLocalSearch();
      return;
    }

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
  }, [pagefind, query, activeFilters, channel, osValue, component, severity, localIndex]);

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
          Search results may be limited right now. You can browse{' '}
          <a className="text-primary hover:underline font-medium" href="/troubleshooting/solutions">
            all solutions
          </a>{' '}
          and narrow down using the filters below.
        </div>
      ) : null}

      <div className="text-sm text-default-600">
        Tip: paste the exact error line (for example:{' '}
        <code className="px-2 py-1 rounded bg-content2">EACCES</code>,{' '}
        <code className="px-2 py-1 rounded bg-content2">unauthorized</code>,{' '}
        <code className="px-2 py-1 rounded bg-content2">EADDRINUSE</code>) and then narrow down
        using filters.
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
