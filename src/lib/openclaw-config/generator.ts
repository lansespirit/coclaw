export type DmPolicy = 'pairing' | 'allowlist' | 'open' | 'disabled';
export type GroupPolicy = 'open' | 'allowlist' | 'disabled';
export type GatewayBindMode = 'loopback' | 'auto' | 'lan' | 'tailnet' | 'custom';
export type GatewayAuthMode = 'off' | 'token' | 'password';
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
  groupPolicy: GroupPolicy;
  groupAllowFromRaw: string;
  groupIdsRaw: string;
  groupRequireMention: boolean;
  webhookUrl: string;
  webhookSecret: string;
};

export type WhatsAppState = ChannelStateBase;
export type WhatsAppStateAdvanced = ChannelStateBase & {
  selfChatMode: boolean;
  groupPolicy: GroupPolicy;
  groupAllowFromRaw: string;
  groupIdsRaw: string;
  groupRequireMention: boolean;
};

export type DiscordState = ChannelStateBase & {
  token: string;
  groupPolicy: GroupPolicy;
  guildIdsRaw: string;
  guildRequireMention: boolean;
};

export type SlackState = ChannelStateBase & {
  botToken: string;
  appToken: string;
  groupPolicy: GroupPolicy;
  channelIdsRaw: string;
  channelRequireMention: boolean;
};

export type OpenClawConfigGeneratorState = {
  safeMode: boolean;
  secretsMode: SecretsMode;
  modelFallbacksRaw?: string;
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
    authMode: GatewayAuthMode;
    authToken: string;
    authPassword: string;
  };
  channels: {
    telegram: TelegramState;
    whatsapp: WhatsAppStateAdvanced;
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
  const rawFallbacks = splitList(state.modelFallbacksRaw ?? '');
  const fallbacks = rawFallbacks.filter((m) => m !== primaryModel);
  if (rawFallbacks.some((m) => m === primaryModel)) {
    issues.push({
      level: 'info',
      path: 'agents.defaults.model.fallbacks',
      message: 'Fallbacks included the primary model; it will be ignored.',
    });
  }

  if (!primaryModel) {
    issues.push({
      level: 'error',
      path: 'agents.defaults.model.primary',
      message: 'Pick a model (example: anthropic/claude-opus-4.6).',
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

    if (
      Number.isFinite(state.ai.custom.model.contextWindow) &&
      state.ai.custom.model.contextWindow > 0 &&
      Number.isFinite(state.ai.custom.model.maxTokens) &&
      state.ai.custom.model.maxTokens > state.ai.custom.model.contextWindow
    ) {
      issues.push({
        level: 'warning',
        path: `models.providers.${providerId || '<providerId>'}.models[0].maxTokens`,
        message: 'maxTokens is greater than contextWindow; it will be clamped by OpenClaw.',
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
      if (!/^[A-Z_][A-Z0-9_]*$/.test(envVar)) {
        issues.push({
          level: 'error',
          path: 'ai.custom.apiKeyEnvVar',
          message:
            'Env var names must be uppercase (example: CUSTOM_PROVIDER_API_KEY). OpenClaw only substitutes ${VARS} for uppercase names.',
        });
      } else {
        requiredEnvVars.push(envVar);
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
      model: { primary: primaryModel, ...(fallbacks.length ? { fallbacks } : {}) },
      ...(state.safeMode ? { sandbox: { mode: 'non-main' } } : {}),
    },
  };

  const gatewayCfg: Record<string, unknown> = {
    // OpenClaw 2026.x expects an explicit mode (local vs remote).
    // The config generator currently targets the common local gateway setup.
    mode: 'local',
    port: state.gateway.port,
    bind: state.gateway.bind,
    ...(state.gateway.bind === 'custom' && state.gateway.customBindHost.trim()
      ? { customBindHost: state.gateway.customBindHost.trim() }
      : {}),
  };

  const authMode = state.gateway.authMode;
  const bindNeedsAuth =
    state.gateway.bind === 'lan' ||
    state.gateway.bind === 'tailnet' ||
    state.gateway.bind === 'custom';

  if (bindNeedsAuth && authMode === 'off') {
    issues.push({
      level: 'error',
      path: 'gateway.auth',
      message:
        'Binding beyond loopback requires Gateway auth (set gateway.auth.token/password or OPENCLAW_GATEWAY_TOKEN/OPENCLAW_GATEWAY_PASSWORD).',
    });
  } else if (state.gateway.bind === 'auto' && authMode === 'off') {
    issues.push({
      level: 'warning',
      path: 'gateway.auth',
      message:
        'bind="auto" usually binds to 127.0.0.1, but may fall back to 0.0.0.0. Configure gateway.auth.token/password to avoid startup failures on non-loopback binds.',
    });
  }

  if (authMode !== 'off') {
    const auth: Record<string, unknown> = { mode: authMode };
    if (authMode === 'token') {
      if (state.secretsMode === 'inline') {
        const token = state.gateway.authToken.trim();
        if (!token) {
          issues.push({
            level: 'error',
            path: 'gateway.auth.token',
            message: 'gateway.auth.mode="token" requires gateway.auth.token in inline mode.',
          });
        } else {
          auth.token = token;
        }
      } else {
        requiredEnvVars.push('OPENCLAW_GATEWAY_TOKEN');
        auth.token = `\${OPENCLAW_GATEWAY_TOKEN}`;
      }
    } else if (authMode === 'password') {
      if (state.secretsMode === 'inline') {
        const password = state.gateway.authPassword.trim();
        if (!password) {
          issues.push({
            level: 'error',
            path: 'gateway.auth.password',
            message: 'gateway.auth.mode="password" requires gateway.auth.password in inline mode.',
          });
        } else {
          auth.password = password;
        }
      } else {
        requiredEnvVars.push('OPENCLAW_GATEWAY_PASSWORD');
        auth.password = `\${OPENCLAW_GATEWAY_PASSWORD}`;
      }
    }
    gatewayCfg.auth = auth;
  }

  cfg.gateway = gatewayCfg;

  if (state.gateway.bind === 'custom' && !state.gateway.customBindHost.trim()) {
    issues.push({
      level: 'error',
      path: 'gateway.customBindHost',
      message: 'gateway.bind="custom" requires customBindHost.',
    });
  }

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

      const contextWindow = state.ai.custom.model.contextWindow;
      const maxTokens = Math.min(state.ai.custom.model.maxTokens, contextWindow);

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
                contextWindow,
                maxTokens,
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
    const groupAllowFrom = splitList(state.channels.telegram.groupAllowFromRaw);
    const groupIds = splitList(state.channels.telegram.groupIdsRaw);
    const groupPolicy = state.channels.telegram.groupPolicy;

    if (state.channels.telegram.dmPolicy === 'open' && !allowFrom.includes('*')) {
      issues.push({
        level: 'error',
        path: 'channels.telegram.allowFrom',
        message: 'Telegram dmPolicy="open" requires allowFrom to include "*".',
      });
    }
    if (state.channels.telegram.dmPolicy === 'allowlist' && allowFrom.length === 0) {
      issues.push({
        level: 'error',
        path: 'channels.telegram.allowFrom',
        message:
          'Telegram dmPolicy="allowlist" requires allowFrom to contain at least one sender ID.',
      });
    }

    if (groupPolicy === 'open') {
      issues.push({
        level: 'warning',
        path: 'channels.telegram.groupPolicy',
        message:
          'groupPolicy="open" allows any sender in groups to reach the agent (mention-gating may still apply). Consider sandboxing (Safe Mode) + allowlists.',
      });
    } else if (groupPolicy === 'allowlist' && groupAllowFrom.length === 0) {
      issues.push({
        level: 'info',
        path: 'channels.telegram.groupAllowFrom',
        message:
          'groupPolicy="allowlist" with no groupAllowFrom entries will block all group messages (DMs still work).',
      });
    }

    if (state.channels.telegram.groupRequireMention === false && groupIds.length === 0) {
      issues.push({
        level: 'warning',
        path: 'channels.telegram.groups',
        message:
          'Groups requireMention=false with no group allowlist means the bot may respond to all groups without mention-gating (high risk).',
      });
    }

    const webhookUrl = state.channels.telegram.webhookUrl.trim();
    const webhookSecret = state.channels.telegram.webhookSecret.trim();
    if (webhookUrl && !webhookSecret) {
      issues.push({
        level: 'error',
        path: 'channels.telegram.webhookSecret',
        message: 'channels.telegram.webhookUrl requires channels.telegram.webhookSecret.',
      });
    }

    const telegram: Record<string, unknown> = {
      enabled: true,
      dmPolicy: state.channels.telegram.dmPolicy,
      ...(allowFrom.length ? { allowFrom } : {}),
    };

    if (groupPolicy !== 'allowlist') {
      telegram.groupPolicy = groupPolicy;
    }
    if (groupAllowFrom.length > 0) {
      telegram.groupAllowFrom = groupAllowFrom;
    }

    if (groupIds.length > 0) {
      telegram.groups = Object.fromEntries(
        groupIds.map((id) => [id, { requireMention: state.channels.telegram.groupRequireMention }])
      );
    } else if (state.channels.telegram.groupRequireMention === false) {
      telegram.groups = { '*': { requireMention: false } };
    }

    if (webhookUrl) {
      telegram.webhookUrl = webhookUrl;
    }
    if (webhookSecret) {
      telegram.webhookSecret = webhookSecret;
    }

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
      telegram.botToken = `\${TELEGRAM_BOT_TOKEN}`;
    }

    channelsCfg.telegram = telegram;
  }

  // WhatsApp
  if (state.channels.whatsapp.enabled) {
    const allowFrom = splitList(state.channels.whatsapp.allowFromRaw);
    const groupAllowFrom = splitList(state.channels.whatsapp.groupAllowFromRaw);
    const groupIds = splitList(state.channels.whatsapp.groupIdsRaw);
    const groupPolicy = state.channels.whatsapp.groupPolicy;

    if (state.channels.whatsapp.dmPolicy === 'open' && !allowFrom.includes('*')) {
      issues.push({
        level: 'error',
        path: 'channels.whatsapp.allowFrom',
        message: 'WhatsApp dmPolicy="open" requires allowFrom to include "*".',
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
    if (state.channels.whatsapp.dmPolicy === 'allowlist' && allowFrom.length === 0) {
      issues.push({
        level: 'error',
        path: 'channels.whatsapp.allowFrom',
        message:
          'WhatsApp dmPolicy="allowlist" requires allowFrom to contain at least one sender ID.',
      });
    }

    if (groupPolicy === 'open') {
      issues.push({
        level: 'warning',
        path: 'channels.whatsapp.groupPolicy',
        message:
          'groupPolicy="open" allows any sender in groups to reach the agent (mention-gating may still apply). Consider sandboxing (Safe Mode) + allowlists.',
      });
    } else if (groupPolicy === 'allowlist' && groupAllowFrom.length === 0) {
      issues.push({
        level: 'info',
        path: 'channels.whatsapp.groupAllowFrom',
        message:
          'groupPolicy="allowlist" with no groupAllowFrom entries will block all group messages (DMs still work).',
      });
    }

    if (state.channels.whatsapp.groupRequireMention === false && groupIds.length === 0) {
      issues.push({
        level: 'warning',
        path: 'channels.whatsapp.groups',
        message:
          'Groups requireMention=false with no group allowlist means the bot may respond to all groups without mention-gating (high risk).',
      });
    }

    const whatsapp: Record<string, unknown> = {
      enabled: true,
      dmPolicy: state.channels.whatsapp.dmPolicy,
      ...(allowFrom.length ? { allowFrom } : {}),
    };

    if (state.channels.whatsapp.selfChatMode) {
      whatsapp.selfChatMode = true;
    }

    if (groupPolicy !== 'allowlist') {
      whatsapp.groupPolicy = groupPolicy;
    }
    if (groupAllowFrom.length > 0) {
      whatsapp.groupAllowFrom = groupAllowFrom;
    }

    if (groupIds.length > 0) {
      whatsapp.groups = Object.fromEntries(
        groupIds.map((id) => [id, { requireMention: state.channels.whatsapp.groupRequireMention }])
      );
    } else if (state.channels.whatsapp.groupRequireMention === false) {
      whatsapp.groups = { '*': { requireMention: false } };
    }

    channelsCfg.whatsapp = whatsapp;
  }

  // Discord
  if (state.channels.discord.enabled) {
    const allowFrom = splitList(state.channels.discord.allowFromRaw);
    const guildIds = splitList(state.channels.discord.guildIdsRaw);
    const groupPolicy = state.channels.discord.groupPolicy;
    if (state.channels.discord.dmPolicy === 'open' && !allowFrom.includes('*')) {
      issues.push({
        level: 'error',
        path: 'channels.discord.dm.allowFrom',
        message: 'Discord dm.policy="open" requires dm.allowFrom to include "*".',
      });
    }
    if (state.channels.discord.dmPolicy === 'open') {
      issues.push({
        level: 'warning',
        path: 'channels.discord.dm.policy',
        message: 'Discord dm.policy="open" means anyone can DM your bot and trigger the agent.',
      });
    }
    if (state.channels.discord.dmPolicy === 'allowlist' && allowFrom.length === 0) {
      issues.push({
        level: 'error',
        path: 'channels.discord.dm.allowFrom',
        message:
          'Discord dm.policy="allowlist" requires dm.allowFrom to contain at least one sender ID.',
      });
    }

    if (groupPolicy === 'open') {
      issues.push({
        level: 'warning',
        path: 'channels.discord.groupPolicy',
        message:
          'groupPolicy="open" allows messages from any server/channel (mention-gating may still apply). Consider Safe Mode + explicit allowlists.',
      });
    } else if (groupPolicy === 'allowlist' && guildIds.length === 0) {
      issues.push({
        level: 'info',
        path: 'channels.discord.guilds',
        message:
          'Discord groupPolicy="allowlist" with no guilds configured will block all server messages (DMs still work).',
      });
    }

    if (guildIds.length > 0 && state.channels.discord.guildRequireMention === false) {
      issues.push({
        level: 'warning',
        path: 'channels.discord.guilds.*.requireMention',
        message:
          'requireMention=false in Discord guilds can make the bot respond without @mention (higher risk).',
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

    if (groupPolicy !== 'allowlist') {
      discord.groupPolicy = groupPolicy;
    }

    if (guildIds.length > 0) {
      discord.guilds = Object.fromEntries(
        guildIds.map((id) => [
          id,
          state.channels.discord.guildRequireMention ? {} : { requireMention: false },
        ])
      );
    }

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
      discord.token = `\${DISCORD_BOT_TOKEN}`;
    }

    channelsCfg.discord = discord;
  }

  // Slack
  if (state.channels.slack.enabled) {
    const allowFrom = splitList(state.channels.slack.allowFromRaw);
    const channelIds = splitList(state.channels.slack.channelIdsRaw);
    const groupPolicy = state.channels.slack.groupPolicy;
    if (state.channels.slack.dmPolicy === 'open' && !allowFrom.includes('*')) {
      issues.push({
        level: 'error',
        path: 'channels.slack.dm.allowFrom',
        message: 'Slack dm.policy="open" requires dm.allowFrom to include "*".',
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
    if (state.channels.slack.dmPolicy === 'allowlist' && allowFrom.length === 0) {
      issues.push({
        level: 'error',
        path: 'channels.slack.dm.allowFrom',
        message:
          'Slack dm.policy="allowlist" requires dm.allowFrom to contain at least one sender ID.',
      });
    }

    if (groupPolicy === 'open') {
      issues.push({
        level: 'warning',
        path: 'channels.slack.groupPolicy',
        message:
          'groupPolicy="open" allows messages from any channel (mention-gating may still apply). Consider Safe Mode + explicit allowlists.',
      });
    } else if (groupPolicy === 'allowlist' && channelIds.length === 0) {
      issues.push({
        level: 'info',
        path: 'channels.slack.channels',
        message:
          'Slack groupPolicy="allowlist" with no channels configured will block all channel messages (DMs still work).',
      });
    }

    if (channelIds.length > 0 && state.channels.slack.channelRequireMention === false) {
      issues.push({
        level: 'warning',
        path: 'channels.slack.channels.*.requireMention',
        message:
          'requireMention=false in Slack channels can make the bot respond without @mention (higher risk).',
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

    if (groupPolicy !== 'allowlist') {
      slack.groupPolicy = groupPolicy;
    }

    if (channelIds.length > 0) {
      slack.channels = Object.fromEntries(
        channelIds.map((id) => [
          id,
          state.channels.slack.channelRequireMention ? {} : { requireMention: false },
        ])
      );
    }

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
      slack.botToken = `\${SLACK_BOT_TOKEN}`;
      slack.appToken = `\${SLACK_APP_TOKEN}`;
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
