import assert from 'node:assert/strict';

import {
  buildOpenClawConfig,
  type OpenClawConfigGeneratorState,
} from '../src/lib/openclaw-config/generator';
import { inferOfficialModelLimits } from '../src/lib/openclaw-config/official-model-limits';

function hasIssue(
  res: ReturnType<typeof buildOpenClawConfig>,
  level: 'error' | 'warning' | 'info',
  path: string
): boolean {
  return res.issues.some((i) => i.level === level && i.path === path);
}

function baseState(): OpenClawConfigGeneratorState {
  return {
    safeMode: true,
    secretsMode: 'env',
    modelFallbacksRaw: '',
    ai: {
      mode: 'built-in',
      builtIn: {
        primaryModel: 'anthropic/claude-opus-4.6',
      },
      custom: {
        providerId: 'custom-proxy',
        api: 'openai-responses',
        baseUrl: 'http://localhost:4000/v1',
        apiKeyEnvVar: 'CUSTOM_PROVIDER_API_KEY',
        apiKey: '',
        model: {
          id: 'gpt-5.2',
          name: 'GPT-5.2',
          reasoning: false,
          inputText: true,
          inputImage: false,
          contextWindow: 400000,
          maxTokens: 128000,
        },
      },
    },
    gateway: {
      port: 18789,
      bind: 'loopback',
      customBindHost: '',
      authMode: 'off',
      authToken: '',
      authPassword: '',
    },
    channels: {
      telegram: {
        enabled: false,
        dmPolicy: 'pairing',
        allowFromRaw: '',
        botToken: '',
        groupPolicy: 'allowlist',
        groupAllowFromRaw: '',
        groupIdsRaw: '',
        groupRequireMention: true,
        webhookUrl: '',
        webhookSecret: '',
      },
      whatsapp: {
        enabled: false,
        dmPolicy: 'pairing',
        allowFromRaw: '',
        selfChatMode: false,
        groupPolicy: 'allowlist',
        groupAllowFromRaw: '',
        groupIdsRaw: '',
        groupRequireMention: true,
      },
      discord: {
        enabled: false,
        dmPolicy: 'pairing',
        allowFromRaw: '',
        token: '',
        groupPolicy: 'allowlist',
        guildIdsRaw: '',
        guildRequireMention: true,
      },
      slack: {
        enabled: false,
        dmPolicy: 'pairing',
        allowFromRaw: '',
        botToken: '',
        appToken: '',
        groupPolicy: 'allowlist',
        channelIdsRaw: '',
        channelRequireMention: true,
      },
    },
  };
}

function run() {
  // 0) Official model limits inference (best-effort fallbacks)
  {
    assert.deepEqual(inferOfficialModelLimits('openai-responses', 'gpt-5.2'), {
      contextWindow: 400_000,
      maxTokens: 128_000,
    });

    assert.deepEqual(inferOfficialModelLimits('openai-responses', 'gpt-some-unknown'), {
      contextWindow: 128_000,
      maxTokens: 16_384,
    });

    assert.deepEqual(inferOfficialModelLimits('anthropic-messages', 'claude-sonnet-4.6'), {
      contextWindow: 200_000,
      maxTokens: 64_000,
    });

    assert.deepEqual(inferOfficialModelLimits('openai-responses', 'glm-5'), {
      contextWindow: 200_000,
      maxTokens: 131_072,
    });
    assert.deepEqual(inferOfficialModelLimits('openai-responses', 'z-ai/glm-5:free'), {
      contextWindow: 200_000,
      maxTokens: 131_072,
    });

    assert.deepEqual(inferOfficialModelLimits('openai-responses', 'kimi-latest'), {
      contextWindow: 131_072,
      maxTokens: 131_072,
    });

    assert.deepEqual(inferOfficialModelLimits('openai-responses', 'moonshot-v1-128k'), {
      contextWindow: 131_072,
      maxTokens: 131_072,
    });
    assert.deepEqual(inferOfficialModelLimits('openai-responses', 'moonshotai/moonshot-v1-128k'), {
      contextWindow: 131_072,
      maxTokens: 131_072,
    });

    assert.deepEqual(inferOfficialModelLimits('openai-responses', 'kimi-k2.5'), {
      contextWindow: 262_144,
      maxTokens: 131_072,
    });
  }

  // 1) Gateway: bind=custom must set customBindHost
  {
    const s = baseState();
    s.gateway.bind = 'custom';
    s.gateway.customBindHost = '';
    s.gateway.authMode = 'token';
    const res = buildOpenClawConfig(s);
    assert.ok(hasIssue(res, 'error', 'gateway.customBindHost'));
  }

  // 2) Gateway: binding beyond loopback requires auth
  {
    const s = baseState();
    s.gateway.bind = 'lan';
    s.gateway.authMode = 'off';
    const res = buildOpenClawConfig(s);
    assert.ok(hasIssue(res, 'error', 'gateway.auth'));
  }

  // 2b) Gateway: bind=auto does not require auth, but should warn when auth is off
  {
    const s = baseState();
    s.gateway.bind = 'auto';
    s.gateway.authMode = 'off';
    const res = buildOpenClawConfig(s);
    assert.equal(res.issues.filter((i) => i.level === 'error').length, 0);
    assert.ok(hasIssue(res, 'warning', 'gateway.auth'));
  }

  // 3) Gateway: env secrets + token auth should surface required env var
  {
    const s = baseState();
    s.gateway.bind = 'lan';
    s.gateway.authMode = 'token';
    const res = buildOpenClawConfig(s);
    assert.equal(res.issues.filter((i) => i.level === 'error').length, 0);
    assert.ok(res.requiredEnvVars.includes('OPENCLAW_GATEWAY_TOKEN'));
  }

  // 3b) Gateway: env secrets + password auth should surface required env var
  {
    const s = baseState();
    s.gateway.bind = 'lan';
    s.gateway.authMode = 'password';
    const res = buildOpenClawConfig(s);
    assert.equal(res.issues.filter((i) => i.level === 'error').length, 0);
    assert.ok(res.requiredEnvVars.includes('OPENCLAW_GATEWAY_PASSWORD'));
  }

  // 4) dmPolicy="open" requires "*" in allowFrom (all supported channels)
  {
    const s = baseState();
    s.channels.telegram.enabled = true;
    s.channels.telegram.dmPolicy = 'open';
    s.channels.telegram.allowFromRaw = '123';
    let res = buildOpenClawConfig(s);
    assert.ok(hasIssue(res, 'error', 'channels.telegram.allowFrom'));

    const w = baseState();
    w.channels.whatsapp.enabled = true;
    w.channels.whatsapp.dmPolicy = 'open';
    w.channels.whatsapp.allowFromRaw = '+15551234567';
    res = buildOpenClawConfig(w);
    assert.ok(hasIssue(res, 'error', 'channels.whatsapp.allowFrom'));

    const d = baseState();
    d.channels.discord.enabled = true;
    d.channels.discord.dmPolicy = 'open';
    d.channels.discord.allowFromRaw = '123456789';
    res = buildOpenClawConfig(d);
    assert.ok(hasIssue(res, 'error', 'channels.discord.dm.allowFrom'));

    const sl = baseState();
    sl.channels.slack.enabled = true;
    sl.channels.slack.dmPolicy = 'open';
    sl.channels.slack.allowFromRaw = 'U123';
    res = buildOpenClawConfig(sl);
    assert.ok(hasIssue(res, 'error', 'channels.slack.dm.allowFrom'));
  }

  // 5) Telegram: webhookUrl requires webhookSecret
  {
    const s = baseState();
    s.channels.telegram.enabled = true;
    s.channels.telegram.webhookUrl = 'https://example.com/tg';
    s.channels.telegram.webhookSecret = '';
    const res = buildOpenClawConfig(s);
    assert.ok(hasIssue(res, 'error', 'channels.telegram.webhookSecret'));
  }

  // 6) Fallback list should not include primary model
  {
    const s = baseState();
    s.modelFallbacksRaw = 'anthropic/claude-opus-4.6\nopenai/gpt-4.1';
    const res = buildOpenClawConfig(s);
    assert.ok(hasIssue(res, 'info', 'agents.defaults.model.fallbacks'));
    const cfg = res.config as unknown as {
      agents?: { defaults?: { model?: { fallbacks?: unknown } } };
    };
    assert.deepEqual(cfg.agents?.defaults?.model?.fallbacks, ['openai/gpt-4.1']);
  }

  // 6b) Custom provider: env var names must be uppercase (OpenClaw only substitutes ${VARS} for uppercase)
  {
    const s = baseState();
    s.secretsMode = 'env';
    s.ai.mode = 'custom';
    s.ai.custom.apiKeyEnvVar = 'custom_provider_api_key';
    const res = buildOpenClawConfig(s);
    assert.ok(hasIssue(res, 'error', 'ai.custom.apiKeyEnvVar'));
  }

  // 7) Discord guild allowlist: allowlist mode + empty guilds should not error (blocks guild msgs)
  {
    const s = baseState();
    s.channels.discord.enabled = true;
    s.channels.discord.groupPolicy = 'allowlist';
    s.channels.discord.guildIdsRaw = '';
    const res = buildOpenClawConfig(s);
    assert.equal(res.issues.filter((i) => i.level === 'error').length, 0);
    assert.ok(hasIssue(res, 'info', 'channels.discord.guilds'));
  }

  // 7b) Discord guild allowlist: setting requireMention=false should warn when guilds are configured
  {
    const s = baseState();
    s.channels.discord.enabled = true;
    s.channels.discord.groupPolicy = 'allowlist';
    s.channels.discord.guildIdsRaw = '123456789012345678';
    s.channels.discord.guildRequireMention = false;
    const res = buildOpenClawConfig(s);
    assert.equal(res.issues.filter((i) => i.level === 'error').length, 0);
    assert.ok(hasIssue(res, 'warning', 'channels.discord.guilds.*.requireMention'));
  }

  // 8) Slack channel allowlist: allowlist mode + empty channels should not error (blocks channel msgs)
  {
    const s = baseState();
    s.channels.slack.enabled = true;
    s.channels.slack.groupPolicy = 'allowlist';
    s.channels.slack.channelIdsRaw = '';
    const res = buildOpenClawConfig(s);
    assert.equal(res.issues.filter((i) => i.level === 'error').length, 0);
    assert.ok(hasIssue(res, 'info', 'channels.slack.channels'));
  }

  // 8b) Slack channel allowlist: setting requireMention=false should warn when channels are configured
  {
    const s = baseState();
    s.channels.slack.enabled = true;
    s.channels.slack.groupPolicy = 'allowlist';
    s.channels.slack.channelIdsRaw = '#general';
    s.channels.slack.channelRequireMention = false;
    const res = buildOpenClawConfig(s);
    assert.equal(res.issues.filter((i) => i.level === 'error').length, 0);
    assert.ok(hasIssue(res, 'warning', 'channels.slack.channels.*.requireMention'));
  }

  // 9) dmPolicy="allowlist" requires allowFrom (all supported channels)
  {
    const s = baseState();
    s.channels.telegram.enabled = true;
    s.channels.telegram.dmPolicy = 'allowlist';
    s.channels.telegram.allowFromRaw = '';
    let res = buildOpenClawConfig(s);
    assert.ok(hasIssue(res, 'error', 'channels.telegram.allowFrom'));

    const w = baseState();
    w.channels.whatsapp.enabled = true;
    w.channels.whatsapp.dmPolicy = 'allowlist';
    w.channels.whatsapp.allowFromRaw = '';
    res = buildOpenClawConfig(w);
    assert.ok(hasIssue(res, 'error', 'channels.whatsapp.allowFrom'));

    const d = baseState();
    d.channels.discord.enabled = true;
    d.channels.discord.dmPolicy = 'allowlist';
    d.channels.discord.allowFromRaw = '';
    res = buildOpenClawConfig(d);
    assert.ok(hasIssue(res, 'error', 'channels.discord.dm.allowFrom'));

    const sl = baseState();
    sl.channels.slack.enabled = true;
    sl.channels.slack.dmPolicy = 'allowlist';
    sl.channels.slack.allowFromRaw = '';
    res = buildOpenClawConfig(sl);
    assert.ok(hasIssue(res, 'error', 'channels.slack.dm.allowFrom'));
  }

  // 10) Gateway should include explicit mode=local
  {
    const s = baseState();
    const res = buildOpenClawConfig(s);
    const cfg = res.config as unknown as { gateway?: { mode?: unknown } };
    assert.equal(cfg.gateway?.mode, 'local');
  }

  // 11) WhatsApp selfChatMode should be emitted when enabled
  {
    const s = baseState();
    s.channels.whatsapp.enabled = true;
    s.channels.whatsapp.selfChatMode = true;
    const res = buildOpenClawConfig(s);
    const cfg = res.config as unknown as {
      channels?: { whatsapp?: { selfChatMode?: unknown } };
    };
    assert.equal(cfg.channels?.whatsapp?.selfChatMode, true);
  }

  process.stdout.write('config-generator tests: OK\n');
}

run();
