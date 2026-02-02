export type DmPolicy = 'pairing' | 'allowlist' | 'open' | 'disabled';
export type GatewayBindMode = 'loopback' | 'lan' | 'tailnet' | 'custom';
export type SecretsMode = 'env' | 'inline';
export type ModelApi = 'openai-completions' | 'openai-responses' | 'anthropic-messages';

export type ConfigIssueLevel = 'error' | 'warning' | 'info';

export type ConfigIssue = {
  level: ConfigIssueLevel;
  path: string;
  message: string;
};

export type ChannelStateBase = {
  enabled: boolean;
  dmPolicy: DmPolicy;
  allowFromRaw: string;
};

export type TelegramState = ChannelStateBase & {
  botToken: string;
};

export type WhatsAppState = ChannelStateBase;

export type DiscordState = ChannelStateBase & {
  token: string;
};

export type SlackState = ChannelStateBase & {
  botToken: string;
  appToken: string;
};

export type OpenClawConfigGeneratorState = {
  safeMode: boolean;
  secretsMode: SecretsMode;
  ai: {
    mode: 'built-in' | 'custom';
    builtIn: {
      primaryModel: string;
    };
    custom: {
      providerId: string;
      api: ModelApi;
      baseUrl: string;
      apiKeyEnvVar: string;
      apiKey: string;
      model: {
        id: string;
        name: string;
        reasoning: boolean;
        inputText: boolean;
        inputImage: boolean;
        contextWindow: number;
        maxTokens: number;
      };
    };
  };
  gateway: {
    port: number;
    bind: GatewayBindMode;
    customBindHost: string;
  };
  channels: {
    telegram: TelegramState;
    whatsapp: WhatsAppState;
    discord: DiscordState;
    slack: SlackState;
  };
};

export type BuildResult = {
  config: Record<string, unknown>;
  json: string;
  issues: ConfigIssue[];
  requiredEnvVars: string[];
};

function isValidProviderId(id: string): boolean {
  return /^[a-z0-9][a-z0-9_-]*$/i.test(id);
}

function splitList(raw: string): string[] {
  return raw
    .split(/[\n,]+/g)
    .map((s) => s.trim())
    .filter(Boolean);
}

function uniq<T>(items: T[]): T[] {
  return [...new Set(items)];
}

function hasAnyEnabledChannel(state: OpenClawConfigGeneratorState): boolean {
  return (
    state.channels.telegram.enabled ||
    state.channels.whatsapp.enabled ||
    state.channels.discord.enabled ||
    state.channels.slack.enabled
  );
}

function inferProviderEnvVarFromModelId(modelId: string): string | null {
  const provider = modelId.split('/')[0]?.trim();
  if (!provider) return null;
  const map: Record<string, string> = {
    openai: 'OPENAI_API_KEY',
    anthropic: 'ANTHROPIC_API_KEY',
    openrouter: 'OPENROUTER_API_KEY',
    groq: 'GROQ_API_KEY',
    gemini: 'GEMINI_API_KEY',
    google: 'GEMINI_API_KEY',
    opencode: 'OPENCODE_API_KEY',
    zai: 'ZAI_API_KEY',
  };
  return map[provider] ?? null;
}

function ensureEnvVarName(name: string): string {
  const trimmed = name.trim();
  return trimmed || 'CUSTOM_PROVIDER_API_KEY';
}

function makePrimaryModelId(state: OpenClawConfigGeneratorState): string {
  if (state.ai.mode === 'custom') {
    const providerId = state.ai.custom.providerId.trim();
    const modelId = state.ai.custom.model.id.trim();
    if (providerId && modelId) return `${providerId}/${modelId}`;
  }
  return state.ai.builtIn.primaryModel.trim();
}

export function buildOpenClawConfig(state: OpenClawConfigGeneratorState): BuildResult {
  const issues: ConfigIssue[] = [];
  const requiredEnvVars: string[] = [];

  const primaryModel = makePrimaryModelId(state);

  if (!primaryModel) {
    issues.push({
      level: 'error',
      path: 'agents.defaults.model.primary',
      message: 'Pick a model (example: anthropic/claude-opus-4-5).',
    });
  }

  if (state.ai.mode === 'custom') {
    const providerId = state.ai.custom.providerId.trim();
    const baseUrl = state.ai.custom.baseUrl.trim();
    const modelId = state.ai.custom.model.id.trim();

    if (!providerId) {
      issues.push({
        level: 'error',
        path: 'models.providers.<providerId>',
        message: 'Provider id is required (example: custom-proxy).',
      });
    } else if (!isValidProviderId(providerId)) {
      issues.push({
        level: 'error',
        path: `models.providers.${providerId}`,
        message: 'Provider id must be alphanumeric and may include "_" or "-".',
      });
    }

    if (!baseUrl) {
      issues.push({
        level: 'error',
        path: `models.providers.${providerId || '<providerId>'}.baseUrl`,
        message: 'baseUrl is required (example: http://localhost:4000/v1).',
      });
    } else if (!/^https?:\/\//i.test(baseUrl)) {
      issues.push({
        level: 'error',
        path: `models.providers.${providerId || '<providerId>'}.baseUrl`,
        message: 'baseUrl must start with http:// or https://',
      });
    } else if (
      (state.ai.custom.api === 'openai-completions' ||
        state.ai.custom.api === 'openai-responses') &&
      !/\/v1\/?$/i.test(baseUrl)
    ) {
      issues.push({
        level: 'warning',
        path: `models.providers.${providerId || '<providerId>'}.baseUrl`,
        message:
          'OpenAI-compatible endpoints typically end with /v1 (example: https://api.example.com/v1).',
      });
    } else if (state.ai.custom.api === 'anthropic-messages' && /\/v1\/?$/i.test(baseUrl)) {
      issues.push({
        level: 'warning',
        path: `models.providers.${providerId || '<providerId>'}.baseUrl`,
        message: 'Anthropic-compatible endpoints often do not include /v1 (client may append it).',
      });
    }

    if (!modelId) {
      issues.push({
        level: 'error',
        path: `models.providers.${providerId || '<providerId>'}.models[0].id`,
        message: 'Model id is required (example: llama-3.1-8b).',
      });
    }

    const input: Array<'text' | 'image'> = [];
    if (state.ai.custom.model.inputText) input.push('text');
    if (state.ai.custom.model.inputImage) input.push('image');
    if (input.length === 0) {
      issues.push({
        level: 'error',
        path: `models.providers.${providerId || '<providerId>'}.models[0].input`,
        message: 'Select at least one input type (text and/or image).',
      });
    }

    if (
      !Number.isFinite(state.ai.custom.model.contextWindow) ||
      state.ai.custom.model.contextWindow <= 0
    ) {
      issues.push({
        level: 'error',
        path: `models.providers.${providerId || '<providerId>'}.models[0].contextWindow`,
        message: 'contextWindow must be a positive number.',
      });
    }

    if (!Number.isFinite(state.ai.custom.model.maxTokens) || state.ai.custom.model.maxTokens <= 0) {
      issues.push({
        level: 'error',
        path: `models.providers.${providerId || '<providerId>'}.models[0].maxTokens`,
        message: 'maxTokens must be a positive number.',
      });
    }

    if (state.secretsMode === 'inline') {
      if (!state.ai.custom.apiKey.trim()) {
        issues.push({
          level: 'error',
          path: `models.providers.${providerId || '<providerId>'}.apiKey`,
          message: 'apiKey is required in inline mode.',
        });
      }
    } else {
      const envVar = ensureEnvVarName(state.ai.custom.apiKeyEnvVar);
      requiredEnvVars.push(envVar);
      if (!/^[A-Z_][A-Z0-9_]*$/.test(envVar)) {
        issues.push({
          level: 'warning',
          path: 'ai.custom.apiKeyEnvVar',
          message: 'Env var names should be uppercase (example: CUSTOM_PROVIDER_API_KEY).',
        });
      }
    }
  } else if (state.secretsMode === 'env') {
    const inferred = inferProviderEnvVarFromModelId(primaryModel);
    if (inferred) requiredEnvVars.push(inferred);
  }

  if (!hasAnyEnabledChannel(state)) {
    issues.push({
      level: 'info',
      path: 'channels',
      message: 'No messaging channels selected. This is fine if you only use the dashboard / CLI.',
    });
  }

  if (!state.safeMode) {
    issues.push({
      level: 'warning',
      path: 'agents.defaults.sandbox.mode',
      message:
        'Safe Mode is OFF. Non-main sessions (groups/channels) may run on the host unless you configure sandboxing.',
    });
  }

  const cfg: Record<string, unknown> = {};

  cfg.agents = {
    defaults: {
      model: { primary: primaryModel },
      ...(state.safeMode ? { sandbox: { mode: 'non-main' } } : {}),
    },
  };

  cfg.gateway = {
    port: state.gateway.port,
    bind: state.gateway.bind,
    ...(state.gateway.bind === 'custom' && state.gateway.customBindHost.trim()
      ? { customBindHost: state.gateway.customBindHost.trim() }
      : {}),
  };

  if (state.safeMode) {
    cfg.tools = {
      sandbox: {
        tools: {
          allow: [
            'bash',
            'process',
            'read',
            'write',
            'edit',
            'sessions_list',
            'sessions_history',
            'sessions_send',
            'sessions_spawn',
          ],
          deny: ['browser', 'canvas', 'nodes', 'cron', 'discord', 'gateway'],
        },
      },
    };
  }

  if (state.ai.mode === 'custom') {
    const providerId = state.ai.custom.providerId.trim();
    const baseUrl = state.ai.custom.baseUrl.trim();
    const modelId = state.ai.custom.model.id.trim();
    const input: Array<'text' | 'image'> = [];
    if (state.ai.custom.model.inputText) input.push('text');
    if (state.ai.custom.model.inputImage) input.push('image');

    if (providerId && baseUrl && modelId) {
      const apiKey =
        state.secretsMode === 'inline'
          ? state.ai.custom.apiKey.trim()
          : `\${${ensureEnvVarName(state.ai.custom.apiKeyEnvVar)}}`;

      cfg.models = {
        mode: 'merge',
        providers: {
          [providerId]: {
            baseUrl,
            apiKey,
            api: state.ai.custom.api,
            models: [
              {
                id: modelId,
                name: state.ai.custom.model.name.trim() || modelId,
                reasoning: !!state.ai.custom.model.reasoning,
                input,
                cost: { input: 0, output: 0, cacheRead: 0, cacheWrite: 0 },
                contextWindow: state.ai.custom.model.contextWindow,
                maxTokens: state.ai.custom.model.maxTokens,
              },
            ],
          },
        },
      };
    }
  }

  const channelsCfg: Record<string, unknown> = {};

  // Telegram
  if (state.channels.telegram.enabled) {
    const allowFrom = splitList(state.channels.telegram.allowFromRaw);
    if (state.channels.telegram.dmPolicy === 'allowlist' && allowFrom.length === 0) {
      issues.push({
        level: 'error',
        path: 'channels.telegram.allowFrom',
        message: 'Telegram dmPolicy="allowlist" requires allowFrom entries.',
      });
    }
    if (state.channels.telegram.dmPolicy === 'open' && !allowFrom.includes('*')) {
      issues.push({
        level: 'error',
        path: 'channels.telegram.allowFrom',
        message: 'Telegram dmPolicy="open" requires allowFrom to include "*".',
      });
    }

    const telegram: Record<string, unknown> = {
      enabled: true,
      dmPolicy: state.channels.telegram.dmPolicy,
      ...(allowFrom.length ? { allowFrom } : {}),
    };

    if (state.secretsMode === 'inline') {
      if (!state.channels.telegram.botToken.trim()) {
        issues.push({
          level: 'error',
          path: 'channels.telegram.botToken',
          message: 'Telegram requires a bot token.',
        });
      } else {
        telegram.botToken = state.channels.telegram.botToken.trim();
      }
    } else {
      requiredEnvVars.push('TELEGRAM_BOT_TOKEN');
    }

    channelsCfg.telegram = telegram;
  }

  // WhatsApp
  if (state.channels.whatsapp.enabled) {
    const allowFrom = splitList(state.channels.whatsapp.allowFromRaw);
    if (state.channels.whatsapp.dmPolicy === 'allowlist' && allowFrom.length === 0) {
      issues.push({
        level: 'error',
        path: 'channels.whatsapp.allowFrom',
        message:
          'WhatsApp dmPolicy="allowlist" requires allowFrom entries (E.164, e.g. +15551234567).',
      });
    }
    if (state.channels.whatsapp.dmPolicy === 'open') {
      issues.push({
        level: 'warning',
        path: 'channels.whatsapp.dmPolicy',
        message:
          'WhatsApp dmPolicy="open" means anyone who can DM the number can control your agent.',
      });
    }

    channelsCfg.whatsapp = {
      dmPolicy: state.channels.whatsapp.dmPolicy,
      ...(allowFrom.length ? { allowFrom } : {}),
    };
  }

  // Discord
  if (state.channels.discord.enabled) {
    const allowFrom = splitList(state.channels.discord.allowFromRaw);
    if (state.channels.discord.dmPolicy === 'allowlist' && allowFrom.length === 0) {
      issues.push({
        level: 'error',
        path: 'channels.discord.dm.allowFrom',
        message: 'Discord dm.policy="allowlist" requires dm.allowFrom entries (user IDs).',
      });
    }
    if (state.channels.discord.dmPolicy === 'open') {
      issues.push({
        level: 'warning',
        path: 'channels.discord.dm.policy',
        message: 'Discord dm.policy="open" means anyone can DM your bot and trigger the agent.',
      });
    }

    const discord: Record<string, unknown> = {
      enabled: true,
      dm: {
        enabled: true,
        policy: state.channels.discord.dmPolicy,
        ...(allowFrom.length ? { allowFrom } : {}),
      },
    };

    if (state.secretsMode === 'inline') {
      if (!state.channels.discord.token.trim()) {
        issues.push({
          level: 'error',
          path: 'channels.discord.token',
          message: 'Discord requires a bot token.',
        });
      } else {
        discord.token = state.channels.discord.token.trim();
      }
    } else {
      requiredEnvVars.push('DISCORD_BOT_TOKEN');
    }

    channelsCfg.discord = discord;
  }

  // Slack
  if (state.channels.slack.enabled) {
    const allowFrom = splitList(state.channels.slack.allowFromRaw);
    if (state.channels.slack.dmPolicy === 'allowlist' && allowFrom.length === 0) {
      issues.push({
        level: 'error',
        path: 'channels.slack.dm.allowFrom',
        message: 'Slack dm.policy="allowlist" requires dm.allowFrom entries (user IDs).',
      });
    }
    if (state.channels.slack.dmPolicy === 'open') {
      issues.push({
        level: 'warning',
        path: 'channels.slack.dm.policy',
        message:
          'Slack dm.policy="open" means anyone in the workspace can DM your bot and trigger the agent.',
      });
    }

    const slack: Record<string, unknown> = {
      enabled: true,
      dm: {
        enabled: true,
        policy: state.channels.slack.dmPolicy,
        ...(allowFrom.length ? { allowFrom } : {}),
      },
    };

    if (state.secretsMode === 'inline') {
      if (!state.channels.slack.botToken.trim()) {
        issues.push({
          level: 'error',
          path: 'channels.slack.botToken',
          message: 'Slack requires botToken.',
        });
      } else {
        slack.botToken = state.channels.slack.botToken.trim();
      }
      if (!state.channels.slack.appToken.trim()) {
        issues.push({
          level: 'error',
          path: 'channels.slack.appToken',
          message: 'Slack (socket mode) requires appToken.',
        });
      } else {
        slack.appToken = state.channels.slack.appToken.trim();
      }
    } else {
      requiredEnvVars.push('SLACK_BOT_TOKEN', 'SLACK_APP_TOKEN');
    }

    channelsCfg.slack = slack;
  }

  if (Object.keys(channelsCfg).length > 0) {
    cfg.channels = channelsCfg;
  }

  const json = JSON.stringify(cfg, null, 2) + '\n';

  return {
    config: cfg,
    json,
    issues,
    requiredEnvVars: uniq(requiredEnvVars),
  };
}
