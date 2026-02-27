import type { ModelApi } from './generator';

export type OfficialModelLimits = {
  contextWindow: number;
  maxTokens: number;
};

export function inferOfficialModelLimits(
  api: ModelApi,
  modelIdRaw: string
): OfficialModelLimits | null {
  const modelId = modelIdRaw.trim();
  if (!modelId) return null;

  if (api === 'openai-completions' || api === 'openai-responses') {
    // Some aggregators prefix model ids (example: "openai/gpt-5.2", "z-ai/glm-5:free").
    // Normalize to the last path segment, and drop ":free"/":beta" suffixes.
    const full = modelId.toLowerCase();
    const id = (full.split('/').pop() ?? full).split(':')[0] ?? '';

    // Z.ai GLM series (OpenAI-compatible)
    // Official docs report context + max output for recent series:
    // - GLM-5/4.7/4.6: 200K context, 128K output
    // - GLM-4.5: 128K context, 96K output
    if (id === 'glm-5' || id.startsWith('glm-5-')) {
      return { contextWindow: 200_000, maxTokens: 131_072 };
    }
    if (id === 'glm-4.7' || id.startsWith('glm-4.7-')) {
      return { contextWindow: 200_000, maxTokens: 131_072 };
    }
    if (id === 'glm-4.6' || id.startsWith('glm-4.6-')) {
      return { contextWindow: 200_000, maxTokens: 131_072 };
    }
    if (id === 'glm-4.5' || id.startsWith('glm-4.5-')) {
      return { contextWindow: 131_072, maxTokens: 98_304 };
    }
    // Generic GLM fallback (best-effort): assume the newer 200K/128K baseline.
    if (id.startsWith('glm-')) {
      return { contextWindow: 200_000, maxTokens: 131_072 };
    }

    // Moonshot (Kimi / moonshot-v1) models (OpenAI-compatible).
    // Their model IDs often encode context length via suffixes like "-8k"/"-32k"/"-128k"/"-256k".
    const suffix = (() => {
      const m = id.match(/-(8k|32k|128k|256k)(?:$|[-_.])/);
      return m?.[1] ?? null;
    })();
    if (suffix) {
      const contextWindow =
        suffix === '8k' ? 8_192 : suffix === '32k' ? 32_768 : suffix === '128k' ? 131_072 : 262_144; // 256k

      // For OpenClaw config purposes, treat maxTokens as an upper bound the agent may request.
      // Many Moonshot/Kimi model IDs encode symmetric input/output caps (example: 128K in / 128K out).
      // For very large contexts (>=256K), keep output somewhat smaller to reduce risk of provider-side rejections.
      const maxTokens = contextWindow >= 262_144 ? 131_072 : contextWindow;

      // Only apply suffix-based inference when the model family matches Moonshot/Kimi style IDs.
      if (
        id.startsWith('moonshot-v1-') ||
        id.startsWith('kimi-latest') ||
        id.startsWith('kimi-thinking') ||
        id.startsWith('kimi-k2') ||
        id.startsWith('kimi-')
      ) {
        return { contextWindow, maxTokens };
      }
    }

    // Moonshot "kimi-latest" and "kimi-thinking-preview" are documented as 128k context models.
    if (id === 'kimi-latest' || id.startsWith('kimi-latest-')) {
      return { contextWindow: 131_072, maxTokens: 131_072 };
    }
    if (id === 'kimi-thinking-preview' || id.startsWith('kimi-thinking')) {
      return { contextWindow: 131_072, maxTokens: 131_072 };
    }

    // Kimi K2 series (best-effort)
    if (id.startsWith('kimi-k2.5') || id.startsWith('kimi-k2-5')) {
      return { contextWindow: 262_144, maxTokens: 131_072 };
    }
    if (id.startsWith('kimi-k2')) {
      return { contextWindow: 262_144, maxTokens: 131_072 };
    }

    // Moonshot "m-*" and Kimi "k-*" shorthand (best-effort).
    if (id.startsWith('m-')) {
      return { contextWindow: 131_072, maxTokens: 131_072 };
    }
    if (id.startsWith('k-')) {
      return { contextWindow: 131_072, maxTokens: 131_072 };
    }

    // gpt-5-pro
    if (id === 'gpt-5-pro' || id.startsWith('gpt-5-pro-')) {
      return { contextWindow: 400_000, maxTokens: 272_000 };
    }

    // chat-latest variants use smaller limits than the base gpt-5.2 model.
    if (id === 'gpt-5.2-chat-latest' || id === 'gpt-5-chat-latest') {
      return { contextWindow: 128_000, maxTokens: 16_384 };
    }

    // gpt-5.2 and siblings (gpt-5.2-mini, gpt-5.2-nano, etc.)
    if (id.startsWith('gpt-5.2')) {
      return { contextWindow: 400_000, maxTokens: 128_000 };
    }

    // gpt-5 and siblings (gpt-5-mini, gpt-5-nano, gpt-5-codex, etc.)
    if (id.startsWith('gpt-5')) {
      return { contextWindow: 400_000, maxTokens: 128_000 };
    }

    // gpt-4.1 and siblings (mini/nano)
    if (id.startsWith('gpt-4.1')) {
      return { contextWindow: 1_047_576, maxTokens: 32_768 };
    }

    // gpt-4o and siblings
    if (id.startsWith('gpt-4o')) {
      return { contextWindow: 128_000, maxTokens: 16_384 };
    }

    // OpenAI audio models share the same token limits.
    if (id === 'gpt-audio' || id.startsWith('gpt-audio-mini') || id.startsWith('gpt-audio-')) {
      return { contextWindow: 128_000, maxTokens: 16_384 };
    }

    // o-series reasoning models
    if (
      id === 'o3' ||
      id.startsWith('o3-') ||
      id === 'o4-mini' ||
      id.startsWith('o4-mini-') ||
      id.startsWith('o4-mini-deep-research')
    ) {
      return { contextWindow: 200_000, maxTokens: 100_000 };
    }

    // Generic OpenAI "gpt-*" fallback (best-effort).
    // Many modern "gpt-" chat models are 128k context with ~16k output.
    if (id.startsWith('gpt-')) {
      return { contextWindow: 128_000, maxTokens: 16_384 };
    }

    return null;
  }

  if (api === 'anthropic-messages') {
    // Anthropic docs use hyphenated IDs; OpenClaw built-ins often use dotted versions.
    const full = modelId.replaceAll('.', '-').toLowerCase();
    const id = ((full.split('/').pop() ?? full).split(':')[0] ?? '').trim();

    // Claude Opus 4 / Sonnet 4 family (200K context); output differs by tier.
    if (id.startsWith('claude-opus-4-')) {
      return { contextWindow: 200_000, maxTokens: 32_000 };
    }

    if (id.startsWith('claude-sonnet-4-')) {
      return { contextWindow: 200_000, maxTokens: 64_000 };
    }

    // Claude Sonnet 3.7 supports 64K output by default (optionally higher with beta headers).
    if (id.startsWith('claude-3-7-sonnet-') || id.startsWith('claude-3-7-sonnet')) {
      return { contextWindow: 200_000, maxTokens: 64_000 };
    }

    if (id.startsWith('claude-3-5-sonnet-') || id.startsWith('claude-3-5-sonnet')) {
      return { contextWindow: 200_000, maxTokens: 8_192 };
    }

    if (id.startsWith('claude-3-5-haiku-') || id.startsWith('claude-3-5-haiku')) {
      return { contextWindow: 200_000, maxTokens: 8_192 };
    }

    if (id.startsWith('claude-3-haiku-') || id.startsWith('claude-3-haiku')) {
      return { contextWindow: 200_000, maxTokens: 4_096 };
    }

    // Generic Claude family fallback (best-effort).
    if (id.startsWith('claude-opus-')) {
      return { contextWindow: 200_000, maxTokens: 32_000 };
    }
    if (id.startsWith('claude-sonnet-')) {
      return { contextWindow: 200_000, maxTokens: 64_000 };
    }
    if (id.startsWith('claude-haiku-')) {
      return { contextWindow: 200_000, maxTokens: 8_192 };
    }
    if (id.startsWith('claude-')) {
      return { contextWindow: 200_000, maxTokens: 8_192 };
    }

    return null;
  }

  return null;
}
