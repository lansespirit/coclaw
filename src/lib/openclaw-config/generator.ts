export type DmPolicy = 'pairing' | 'allowlist' | 'open' | 'disabled';
export type GroupPolicy = 'open' | 'allowlist' | 'disabled';
export type GatewayBindMode = 'loopback' | 'auto' | 'lan' | 'tailnet' | 'custom';
export type GatewayAuthMode = 'off' | 'token' | 'password';
export type ModelApi = 'openai-completions' | 'openai-responses' | 'anthropic-messages';
export type ToolsProfile = 'minimal' | 'messaging' | 'coding' | 'full';
export type ThinkingDepth = 'none' | 'low' | 'high' | 'xhigh';

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
export type WhatsAppChannelState = ChannelStateBase & {
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
  toolsProfile: ToolsProfile;
  toolsAllow: string[];
  toolsDeny: string[];
  sandboxMode: 'non-main' | 'off';
  sandboxToolsAllow: string[];
  sandboxToolsDeny: string[];
  modelFallbacksRaw?: string;
  thinkingDepth: ThinkingDepth;
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
    whatsapp: WhatsAppChannelState;
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

const ENV_VAR_NAME_RE = /^[A-Z_][A-Z0-9_]*$/;

function isEnvVarName(value: string): boolean {
  return ENV_VAR_NAME_RE.test(value.trim());
}

function resolveSecretValue(
  value: string,
  path: string,
  missingMessage: string,
  issues: ConfigIssue[],
  requiredEnvVars: string[]
): string | null {
  const trimmed = value.trim();
  if (!trimmed) {
    issues.push({
      level: 'error',
      path,
      message: missingMessage,
    });
    return null;
  }

  if (isEnvVarName(trimmed)) {
    requiredEnvVars.push(trimmed);
    return `\${${trimmed}}`;
  }

  return trimmed;
}

function hasAnyEnabledChannel(state: OpenClawConfigGeneratorState): boolean {
  return (
    state.channels.telegram.enabled ||
    state.channels.whatsapp.enabled ||
    state.channels.discord.enabled ||
    state.channels.slack.enabled
  );
}

export function inferProviderEnvVarFromModelId(modelId: string): string | null {
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
    const customApiKeyInput = state.ai.custom.apiKey.trim() || state.ai.custom.apiKeyEnvVar.trim();

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

    if (!customApiKeyInput) {
      issues.push({
        level: 'error',
        path: `models.providers.${providerId || '<providerId>'}.apiKey`,
        message: 'Enter an API key or an env var name for the custom provider.',
      });
    } else if (isEnvVarName(customApiKeyInput)) {
      requiredEnvVars.push(customApiKeyInput.trim());
    }
  }

  if (!hasAnyEnabledChannel(state)) {
    issues.push({
      level: 'info',
      path: 'channels',
      message: 'No messaging channels selected. This is fine if you only use the dashboard / CLI.',
    });
  }

  const cfg: Record<string, unknown> = {};

  cfg.agents = {
    defaults: {
      model: { primary: primaryModel, ...(fallbacks.length ? { fallbacks } : {}) },
      thinkingDefault: state.thinkingDepth === 'none' ? 'off' : state.thinkingDepth,
      ...(state.sandboxMode === 'non-main' ? { sandbox: { mode: 'non-main' } } : {}),
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
      const token = resolveSecretValue(
        state.gateway.authToken,
        'gateway.auth.token',
        'gateway.auth.mode="token" requires a token or env var name.',
        issues,
        requiredEnvVars
      );
      if (token) auth.token = token;
    } else if (authMode === 'password') {
      const password = resolveSecretValue(
        state.gateway.authPassword,
        'gateway.auth.password',
        'gateway.auth.mode="password" requires a password or env var name.',
        issues,
        requiredEnvVars
      );
      if (password) auth.password = password;
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

  cfg.tools = {
    profile: state.toolsProfile,
    ...(state.toolsAllow.length > 0 ? { allow: state.toolsAllow } : {}),
    ...(state.toolsDeny.length > 0 ? { deny: state.toolsDeny } : {}),
    ...(state.sandboxMode === 'non-main'
      ? {
          sandbox: {
            tools: {
              ...(state.sandboxToolsAllow.length > 0 ? { allow: state.sandboxToolsAllow } : {}),
              ...(state.sandboxToolsDeny.length > 0 ? { deny: state.sandboxToolsDeny } : {}),
            },
          },
        }
      : {}),
  };

  if (state.ai.mode === 'custom') {
    const providerId = state.ai.custom.providerId.trim();
    const baseUrl = state.ai.custom.baseUrl.trim();
    const modelId = state.ai.custom.model.id.trim();
    const customApiKeyInput = state.ai.custom.apiKey.trim() || state.ai.custom.apiKeyEnvVar.trim();
    const input: Array<'text' | 'image'> = [];
    if (state.ai.custom.model.inputText) input.push('text');
    if (state.ai.custom.model.inputImage) input.push('image');

    if (providerId && baseUrl && modelId) {
      const apiKey = isEnvVarName(customApiKeyInput)
        ? `\${${customApiKeyInput.trim()}}`
        : customApiKeyInput;

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
                reasoning: state.thinkingDepth !== 'none',
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
          'groupPolicy="open" allows any sender in groups to reach the agent (mention-gating may still apply). Consider sandboxing + allowlists.',
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
      if (isEnvVarName(webhookSecret)) {
        requiredEnvVars.push(webhookSecret.trim());
        telegram.webhookSecret = `\${${webhookSecret.trim()}}`;
      } else {
        telegram.webhookSecret = webhookSecret;
      }
    }

    const telegramBotToken = resolveSecretValue(
      state.channels.telegram.botToken,
      'channels.telegram.botToken',
      'Telegram requires a bot token or env var name.',
      issues,
      requiredEnvVars
    );
    if (telegramBotToken) {
      telegram.botToken = telegramBotToken;
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
          'groupPolicy="open" allows any sender in groups to reach the agent (mention-gating may still apply). Consider sandboxing + allowlists.',
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
          'groupPolicy="open" allows messages from any server/channel (mention-gating may still apply). Consider sandboxing + explicit allowlists.',
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

    const discordToken = resolveSecretValue(
      state.channels.discord.token,
      'channels.discord.token',
      'Discord requires a bot token or env var name.',
      issues,
      requiredEnvVars
    );
    if (discordToken) {
      discord.token = discordToken;
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
          'groupPolicy="open" allows messages from any channel (mention-gating may still apply). Consider sandboxing + explicit allowlists.',
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

    const slackBotToken = resolveSecretValue(
      state.channels.slack.botToken,
      'channels.slack.botToken',
      'Slack requires botToken or an env var name.',
      issues,
      requiredEnvVars
    );
    if (slackBotToken) {
      slack.botToken = slackBotToken;
    }

    const slackAppToken = resolveSecretValue(
      state.channels.slack.appToken,
      'channels.slack.appToken',
      'Slack (socket mode) requires appToken or an env var name.',
      issues,
      requiredEnvVars
    );
    if (slackAppToken) {
      slack.appToken = slackAppToken;
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
