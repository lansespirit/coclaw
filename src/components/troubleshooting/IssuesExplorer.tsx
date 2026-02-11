import { useEffect, useMemo, useRef, useState } from 'react';
import { labelToFilterValue } from '../../lib/openclaw-issues-filters';
import { loadPagefind, type PagefindModule } from '../../lib/pagefind';

type IssuePreview = {
  number: number;
  title: string;
  bodyPreview: string;
  state: 'open' | 'closed' | string;
  comments: number;
  updatedAt: string;
  labels: string[];
  channels?: string[];
  platforms?: string[];
  components?: string[];
};

type Props = {
  issues: IssuePreview[];
  initialQuery?: string;
  initialState?: 'open' | 'closed' | 'all';
};

function uniq<T>(xs: T[]): T[] {
  return [...new Set(xs)];
}

export function IssuesExplorer({ issues, initialQuery = '', initialState = 'all' }: Props) {
  const [query, setQuery] = useState(initialQuery);
  const [state, setState] = useState<'open' | 'closed' | 'all'>(initialState);
  const [label, setLabel] = useState<string>('all');
  const [channel, setChannel] = useState<string>('all');
  const [platform, setPlatform] = useState<string>('all');
  const [component, setComponent] = useState<string>('all');

  const [pagefind, setPagefind] = useState<PagefindModule | null>(null);
  const [pagefindResults, setPagefindResults] = useState<
    | null
    | {
        url: string;
        title: string;
        excerpt: string;
        filters: Record<string, string[]>;
      }[]
  >(null);

  const lastQueryRef = useRef<string>('');

  useEffect(() => {
    // `pagefind.js` only exists after a full build (`pnpm build`).
    // In dev, we fall back to client-side searching the preview list.
    let cancelled = false;
    loadPagefind().then((mod) => {
      if (!cancelled) setPagefind(mod);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const labelOptions = useMemo(() => {
    const labels = uniq(
      issues
        .flatMap((i) => i.labels ?? [])
        .map((l) => l.trim())
        .filter(Boolean)
    ).sort((a, b) => a.localeCompare(b));
    return labels;
  }, [issues]);

  const channelOptions = useMemo(() => {
    const channels = uniq(
      issues
        .flatMap((i) => i.channels ?? [])
        .map((c) => c.trim())
        .filter(Boolean)
    ).sort((a, b) => a.localeCompare(b));
    return channels;
  }, [issues]);

  const platformOptions = useMemo(() => {
    const platforms = uniq(
      issues
        .flatMap((i) => i.platforms ?? [])
        .map((p) => p.trim())
        .filter(Boolean)
    ).sort((a, b) => a.localeCompare(b));
    return platforms;
  }, [issues]);

  const componentOptions = useMemo(() => {
    const components = uniq(
      issues
        .flatMap((i) => i.components ?? [])
        .map((c) => c.trim())
        .filter(Boolean)
    ).sort((a, b) => a.localeCompare(b));
    return components;
  }, [issues]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return issues
      .filter((i) => (state === 'all' ? true : i.state === state))
      .filter((i) => (label === 'all' ? true : (i.labels ?? []).includes(label)))
      .filter((i) => (channel === 'all' ? true : (i.channels ?? []).includes(channel)))
      .filter((i) => (platform === 'all' ? true : (i.platforms ?? []).includes(platform)))
      .filter((i) => (component === 'all' ? true : (i.components ?? []).includes(component)))
      .filter((i) => {
        if (!q) return true;
        const hay = `${i.title}\n${i.bodyPreview}\n${(i.labels ?? []).join(' ')}`.toLowerCase();
        return hay.includes(q);
      });
  }, [issues, query, state, label, channel, platform, component]);

  useEffect(() => {
    if (!pagefind) return;

    const q = query.trim();
    if (!q) {
      setPagefindResults(null);
      return;
    }

    // Avoid spamming Pagefind on every keystroke when nothing changed.
    const key = `${q}::${state}::${label}`;
    if (key === lastQueryRef.current) return;
    lastQueryRef.current = key;

    const filters: Record<string, string | string[]> = { type: 'issue' };
    if (state !== 'all') filters.state = state;
    if (label !== 'all') filters.label = labelToFilterValue(label);
    if (channel !== 'all') filters.channel = channel;
    if (platform !== 'all') filters.platform = platform;
    if (component !== 'all') filters.component = component;

    let cancelled = false;
    pagefind
      .search(q, { filters })
      .then(async ({ results }) => {
        const rows = await Promise.all(
          results.slice(0, 30).map(async (r) => {
            const d = await r.data();
            return {
              url: d.url,
              title: d.meta?.title || d.content?.slice(0, 80) || 'Result',
              excerpt: d.excerpt || '',
              filters: d.filters || {},
            };
          })
        );
        if (!cancelled) setPagefindResults(rows);
      })
      .catch(() => {
        if (!cancelled) setPagefindResults(null);
      });

    return () => {
      cancelled = true;
    };
  }, [pagefind, query, state, label, channel, platform, component]);

  const showPagefind = Boolean(pagefind && pagefindResults && query.trim());

  return (
    <div className="space-y-6">
      <div className="grid gap-3 md:grid-cols-3">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search issues (paste error text, keywords, etc.)"
          className="w-full px-4 py-3 rounded-xl border border-divider bg-content1 text-foreground placeholder:text-default-500 focus:border-primary focus:outline-none transition-colors"
        />

        <select
          value={state}
          onChange={(e) => setState(e.target.value as 'open' | 'closed' | 'all')}
          className="w-full px-4 py-3 rounded-xl border border-divider bg-content1 text-foreground focus:border-primary focus:outline-none transition-colors"
        >
          <option value="all">All states</option>
          <option value="open">Open</option>
          <option value="closed">Closed</option>
        </select>

        <select
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          className="w-full px-4 py-3 rounded-xl border border-divider bg-content1 text-foreground focus:border-primary focus:outline-none transition-colors"
        >
          <option value="all">All labels</option>
          {labelOptions.map((l) => (
            <option key={l} value={l}>
              {l}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <select
          value={channel}
          onChange={(e) => setChannel(e.target.value)}
          className="w-full px-4 py-3 rounded-xl border border-divider bg-content1 text-foreground focus:border-primary focus:outline-none transition-colors"
        >
          <option value="all">All channels</option>
          {channelOptions.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>

        <select
          value={platform}
          onChange={(e) => setPlatform(e.target.value)}
          className="w-full px-4 py-3 rounded-xl border border-divider bg-content1 text-foreground focus:border-primary focus:outline-none transition-colors"
        >
          <option value="all">All platforms</option>
          {platformOptions.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>

        <select
          value={component}
          onChange={(e) => setComponent(e.target.value)}
          className="w-full px-4 py-3 rounded-xl border border-divider bg-content1 text-foreground focus:border-primary focus:outline-none transition-colors"
        >
          <option value="all">All components</option>
          {componentOptions.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      <div className="flex items-center justify-between text-sm text-default-600">
        <div>
          Showing <span className="font-semibold text-foreground">{filtered.length}</span> /{' '}
          {issues.length} issues
        </div>
        <div className="text-default-500">
          Tip: use labels to narrow down channels (telegram/whatsapp) or platform issues.
        </div>
      </div>

      <div className="space-y-3">
        {showPagefind
          ? pagefindResults!.map((r) => (
              <a
                key={r.url}
                href={r.url}
                className="block rounded-xl border border-divider bg-content1 p-5 hover:border-primary/40 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <h3 className="font-semibold text-foreground truncate">{r.title}</h3>
                    {r.excerpt ? (
                      <p
                        className="mt-2 text-sm text-default-700 line-clamp-3"
                        dangerouslySetInnerHTML={{ __html: r.excerpt }}
                      />
                    ) : null}
                    {r.filters?.label?.length ? (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {r.filters.label.slice(0, 10).map((lv) => (
                          <span
                            key={lv}
                            className="inline-flex items-center rounded-full border border-divider bg-content2 px-2 py-0.5 text-xs text-default-700"
                          >
                            {lv}
                          </span>
                        ))}
                      </div>
                    ) : null}
                  </div>
                </div>
              </a>
            ))
          : filtered.slice(0, 200).map((i) => (
              <a
                key={i.number}
                href={`/troubleshooting/issues/${i.number}`}
                className="block rounded-xl border border-divider bg-content1 p-5 hover:border-primary/40 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${
                          i.state === 'open'
                            ? 'bg-success/10 text-success-600 dark:text-success'
                            : 'bg-default-500/10 text-default-600'
                        }`}
                      >
                        {i.state}
                      </span>
                      <span className="text-xs text-default-500">#{i.number}</span>
                      <span className="text-xs text-default-500">{i.comments} comments</span>
                    </div>
                    <h3 className="mt-2 font-semibold text-foreground truncate">{i.title}</h3>
                    <p className="mt-2 text-sm text-default-700 line-clamp-2 whitespace-pre-wrap">
                      {i.bodyPreview || 'No description provided.'}
                    </p>
                  </div>
                  <span className="text-xs text-default-500 whitespace-nowrap">
                    {new Date(i.updatedAt).toLocaleDateString('en-US')}
                  </span>
                </div>

                {i.labels?.length ? (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {i.labels.slice(0, 8).map((l) => (
                      <span
                        key={l}
                        className="inline-flex items-center rounded-full border border-divider bg-content2 px-2 py-0.5 text-xs text-default-700"
                      >
                        {l}
                      </span>
                    ))}
                  </div>
                ) : null}
              </a>
            ))}
      </div>

      {filtered.length > 200 ? (
        <div className="text-sm text-default-600">
          Showing first 200 results. Refine your search to see more.
        </div>
      ) : null}
    </div>
  );
}
