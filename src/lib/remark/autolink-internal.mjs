/**
 * Remark plugin: add a small number of in-body internal links by turning
 * well-known phrases into link nodes (once per document by default).
 *
 * This is intentionally conservative to avoid over-linking or linking inside
 * code blocks / existing links.
 */

function escapeRegExp(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function ensureGlobal(re) {
  const flags = re.flags.includes('g') ? re.flags : `${re.flags}g`;
  return new RegExp(re.source, flags);
}

function linkNode(url, value) {
  return { type: 'link', url, children: [{ type: 'text', value }] };
}

function textNode(value) {
  return { type: 'text', value };
}

const SKIP_ANCESTOR_TYPES = new Set([
  'link',
  'linkReference',
  'definition',
  'code',
  'inlineCode',
  'yaml',
  'html',
  // MDX-specific nodes (avoid rewriting inside component trees/expressions)
  'mdxJsxTextElement',
  'mdxJsxFlowElement',
  'mdxTextExpression',
  'mdxFlowExpression',
]);

/**
 * @typedef {{ id: string, url: string, pattern: RegExp }} Rule
 */

/**
 * @param {Rule[]} rules
 * @param {string} text
 * @param {number} fromIndex
 * @returns {null | { rule: Rule, index: number, matchText: string }}
 */
function findNextMatch(rules, text, fromIndex) {
  /** @type {null | { rule: Rule, index: number, matchText: string }} */
  let best = null;

  for (const rule of rules) {
    const re = rule.pattern;
    re.lastIndex = fromIndex;
    const m = re.exec(text);
    if (!m || typeof m.index !== 'number') continue;
    const matchText = m[0] ?? '';
    const candidate = { rule, index: m.index, matchText };

    if (!best) {
      best = candidate;
      continue;
    }

    // Prefer the earliest match; on ties, prefer longer (more specific) match.
    if (candidate.index < best.index) {
      best = candidate;
      continue;
    }
    if (candidate.index === best.index && candidate.matchText.length > best.matchText.length) {
      best = candidate;
    }
  }

  return best;
}

/**
 * @param {string} text
 * @param {Rule[]} rules
 * @param {{ perRule: Map<string, number>, maxPerRule: number, total: number, maxTotal: number }} budget
 * @returns {any[] | null}
 */
function linkifyText(text, rules, budget) {
  if (!text || !text.trim()) return null;

  /** @type {any[]} */
  const out = [];
  let pos = 0;
  let changed = false;

  while (pos < text.length) {
    const next = findNextMatch(rules, text, pos);
    if (!next) {
      out.push(textNode(text.slice(pos)));
      break;
    }

    if (next.index > pos) out.push(textNode(text.slice(pos, next.index)));

    const usedForRule = budget.perRule.get(next.rule.id) ?? 0;
    const canLink = usedForRule < budget.maxPerRule && budget.total < budget.maxTotal;

    if (canLink) {
      out.push(linkNode(next.rule.url, next.matchText));
      budget.perRule.set(next.rule.id, usedForRule + 1);
      budget.total += 1;
      changed = true;
    } else {
      out.push(textNode(next.matchText));
    }

    pos = next.index + next.matchText.length;
  }

  return changed ? out : null;
}

/**
 * @param {string} phrase
 * @param {string} url
 * @param {object} [opts]
 * @param {boolean} [opts.caseInsensitive]
 * @param {boolean} [opts.wordBoundary]
 * @returns {Rule}
 */
function phraseRule(phrase, url, opts = {}) {
  const { caseInsensitive = true, wordBoundary = false } = opts;
  const src = escapeRegExp(phrase);
  const body = wordBoundary ? `\\b${src}\\b` : src;
  const flags = `${caseInsensitive ? 'i' : ''}g`;
  return { id: `${url}::${phrase}`, url, pattern: new RegExp(body, flags) };
}

/**
 * @param {string} src
 * @param {string} url
 * @param {string} flags
 * @returns {Rule}
 */
function regexRule(src, url, flags = 'ig') {
  return { id: `${url}::/${src}/${flags}`, url, pattern: ensureGlobal(new RegExp(src, flags)) };
}

/**
 * @param {{
 *  rules?: Rule[];
 *  maxLinksPerDoc?: number;
 *  maxLinksPerRule?: number;
 * }} [options]
 */
export default function autolinkInternal(options = {}) {
  /** @type {Rule[]} */
  const defaultRules = [
    // Config + state fundamentals
    phraseRule('OPENCLAW_STATE_DIR', '/guides/openclaw-configuration', {
      caseInsensitive: false,
      wordBoundary: true,
    }),
    phraseRule('OPENCLAW_CONFIG_PATH', '/guides/openclaw-configuration', {
      caseInsensitive: false,
      wordBoundary: true,
    }),
    phraseRule('OPENCLAW_GATEWAY_TOKEN', '/guides/openclaw-configuration', {
      caseInsensitive: false,
      wordBoundary: true,
    }),
    regexRule('\\bopenclaw\\.json\\b', '/guides/openclaw-configuration', 'ig'),
    phraseRule('state directory', '/guides/openclaw-configuration'),

    // Tools + deployment
    phraseRule('OpenClaw Config Generator', '/openclaw-config-generator'),
    phraseRule('config generator', '/openclaw-config-generator'),
    phraseRule('Docker Compose', '/guides/docker-deployment'),
    phraseRule('docker compose', '/guides/docker-deployment'),

    // Common troubleshooting signatures -> solutions
    regexRule('\\bEADDRINUSE\\b', '/troubleshooting/solutions/gateway-lock-eaddrinuse', 'g'),
    phraseRule(
      'refusing to bind',
      '/troubleshooting/solutions/gateway-refusing-to-bind-without-auth'
    ),
    regexRule(
      '\\bconnect\\s+ECONNREFUSED\\b',
      '/troubleshooting/solutions/gateway-service-running-but-probe-fails',
      'ig'
    ),
    phraseRule('pairing required', '/troubleshooting/solutions/control-ui-pairing-required'),
    phraseRule('Startup probe failed', '/troubleshooting/solutions/gateway-service-running-but-probe-fails'),
    phraseRule('STARTING', '/troubleshooting/solutions/gateway-service-running-but-probe-fails', {
      caseInsensitive: false,
      wordBoundary: true,
    }),
    phraseRule('unauthorized', '/troubleshooting/solutions/control-ui-unauthorized'),
  ];

  const rules = (options.rules ?? defaultRules).map((r) => ({
    ...r,
    pattern: ensureGlobal(r.pattern),
  }));

  const maxLinksPerDoc = options.maxLinksPerDoc ?? 10;
  const maxLinksPerRule = options.maxLinksPerRule ?? 1;

  return function transformer(tree, file) {
    const currentUrl = inferCurrentUrl(file?.path ? String(file.path) : null);
    const effectiveRules = currentUrl
      ? rules.filter((r) => stripTrailingSlash(r.url) !== stripTrailingSlash(currentUrl))
      : rules;

    // Per-document budget to prevent over-linking.
    const budget = { perRule: new Map(), maxPerRule: maxLinksPerRule, total: 0, maxTotal: maxLinksPerDoc };

    /**
     * @param {any} node
     * @param {any[]} ancestors
     */
    function walk(node, ancestors) {
      if (!node || typeof node !== 'object') return;
      const nextAncestors = ancestors.concat(node);

      if (Array.isArray(node.children)) {
        for (let i = 0; i < node.children.length; i++) {
          const child = node.children[i];
          if (!child || typeof child !== 'object') continue;

          // Skip rewriting inside certain node types.
          const ancestorTypes = nextAncestors.map((a) => a && a.type).filter(Boolean);
          if (ancestorTypes.some((t) => SKIP_ANCESTOR_TYPES.has(t))) continue;
          if (node.type === 'heading') continue;

          if (child.type === 'text') {
            const replacement = linkifyText(child.value, effectiveRules, budget);
            if (replacement) {
              node.children.splice(i, 1, ...replacement);
              i += replacement.length - 1;
              continue;
            }
          }

          walk(child, nextAncestors);
        }
      }
    }

    // Avoid touching YAML frontmatter (tree children include it, but it is a 'yaml' node type).
    walk(tree, []);

    // Keep transformer quiet; don't modify file metadata.
    void file;
  };
}

function stripTrailingSlash(url) {
  return url.endsWith('/') ? url.replace(/\/+$/, '') : url;
}

/**
 * Infer the canonical site URL path from a content file path.
 * This is only used to avoid creating self-links.
 *
 * @param {string | null} filePath
 * @returns {string | null}
 */
function inferCurrentUrl(filePath) {
  if (!filePath) return null;
  const normalized = filePath.replace(/\\/g, '/');

  const m = normalized.match(/\/src\/content\/([^/]+)\/(.+?)\.(md|mdx)$/);
  if (!m) return null;
  const collection = m[1];
  const slug = m[2];

  // Match the site's routing conventions.
  if (collection === 'guides') return `/guides/${slug}`;
  if (collection === 'getting-started') return `/getting-started/${slug}`;
  if (collection === 'blog') return `/blog/${slug}`;
  if (collection === 'stories') return `/stories/${slug}`;
  if (collection === 'troubleshooting') return `/troubleshooting/${slug}`;

  return null;
}
