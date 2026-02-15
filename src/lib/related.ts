export type WeightedTokens = Map<string, number>;

const STOPWORDS = new Set([
  // Very common English words
  'a',
  'an',
  'and',
  'are',
  'as',
  'at',
  'be',
  'but',
  'by',
  'can',
  'do',
  'does',
  'for',
  'from',
  'has',
  'have',
  'how',
  'if',
  'in',
  'into',
  'is',
  'it',
  'its',
  'of',
  'on',
  'or',
  'our',
  'should',
  'that',
  'the',
  'their',
  'then',
  'this',
  'to',
  'use',
  'using',
  'was',
  'were',
  'when',
  'with',
  'you',
  'your',
  // Site/global terms that otherwise dominate similarity
  'openclaw',
  'coclaw',
  // Low-signal “troubleshooting” words
  'troubleshooting',
  'trouble',
  'issue',
  'issues',
  'error',
  'errors',
  'fix',
  'fixed',
  'fails',
  'failed',
  'failure',
  'start',
  'starting',
]);

function normalizeText(input: string): string {
  return input
    .toLowerCase()
    .replace(/[`"'()[\]{}<>]/g, ' ')
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim();
}

function tokenize(input: string): string[] {
  if (!input) return [];
  const norm = normalizeText(input);
  if (!norm) return [];
  return norm
    .split(/\s+/g)
    .map((t) => t.trim())
    .filter(Boolean)
    .filter((t) => t.length >= 2 && t.length <= 32)
    .filter((t) => !STOPWORDS.has(t));
}

export function buildWeightedTokens(
  fields: Array<{ text?: string | string[] | null; weight: number }>
): WeightedTokens {
  const out: WeightedTokens = new Map();
  for (const f of fields) {
    if (!f.text) continue;
    const texts = Array.isArray(f.text) ? f.text : [f.text];
    for (const t of texts) {
      for (const tok of tokenize(String(t))) {
        out.set(tok, (out.get(tok) ?? 0) + f.weight);
      }
    }
  }
  return out;
}

function l2Norm(v: WeightedTokens): number {
  let sum = 0;
  for (const w of v.values()) sum += w * w;
  return Math.sqrt(sum);
}

export function cosineSimilarity(a: WeightedTokens, b: WeightedTokens): number {
  const na = l2Norm(a);
  const nb = l2Norm(b);
  if (!na || !nb) return 0;

  // Iterate smaller map for efficiency.
  const [small, large] = a.size <= b.size ? [a, b] : [b, a];
  let dot = 0;
  for (const [tok, w] of small) dot += w * (large.get(tok) ?? 0);
  return dot / (na * nb);
}

export function topRelated<T>(opts: {
  seed: { id: string; tokens: WeightedTokens };
  candidates: Array<{ id: string; tokens: WeightedTokens; item: T }>;
  limit: number;
  minScore?: number;
}): Array<{ score: number; item: T }> {
  const minScore = opts.minScore ?? 0.08;
  const scored = opts.candidates
    .filter((c) => c.id !== opts.seed.id)
    .map((c) => ({ score: cosineSimilarity(opts.seed.tokens, c.tokens), item: c.item }))
    .filter((x) => x.score >= minScore)
    .sort((a, b) => b.score - a.score);
  return scored.slice(0, opts.limit);
}
