import {
  Alert,
  Button,
  Card,
  CardBody,
  Checkbox,
  Code,
  Divider,
  HeroUIProvider,
  Input,
  Radio,
  RadioGroup,
  Select,
  SelectItem,
  Switch,
  Tab,
  Tabs,
  Textarea,
  Tooltip,
} from '@heroui/react';
import { useEffect, useMemo, useState } from 'react';
import {
  buildOpenClawConfig,
  type DmPolicy,
  type GatewayAuthMode,
  type GatewayBindMode,
  type GroupPolicy,
  type ModelApi,
  type OpenClawConfigGeneratorState,
  type ThinkingDepth,
} from '../../lib/openclaw-config/generator';
import { inferOfficialModelLimits } from '../../lib/openclaw-config/official-model-limits';
import {
  PRESET_DEFINITIONS,
  applyPresetToState,
  type GeneratorPresetId,
} from '../../lib/openclaw-config/presets';
import { OPENCLAW_REF } from '../../lib/openclaw-ref';
import {
  IconCopy,
  IconDiscord,
  IconDocumentText,
  IconInfoSolid,
  IconLockClosed,
  IconSlack,
  IconTelegram,
  IconWarning,
  IconWhatsApp,
} from '../icons';

function asInt(value: string, fallback: number): number {
  const n = Number.parseInt(value, 10);
  return Number.isFinite(n) ? n : fallback;
}

const ENV_VAR_NAME_RE = /^[A-Z_][A-Z0-9_]*$/;

function looksLikeApiKey(value: string): boolean {
  const t = value.trim();
  if (!t) return false;
  if (ENV_VAR_NAME_RE.test(t)) return false;

  // Common API key prefixes (best signal).
  if (/^(sk-|sk-proj-|sk-or-|rk-|xoxb-|xapp-|ghp_|hf_|AIza|eyJ)/.test(t)) return true;

  // Heuristic: long token-like strings are more likely a pasted key than an env var name.
  // Keep this conservative to avoid misclassifying lowercased env var names.
  if (t.length >= 32 && /^[A-Za-z0-9._-]+$/.test(t)) return true;

  return false;
}

type ChannelKind = 'telegram' | 'whatsapp' | 'discord' | 'slack';

function DmPolicyLabel({
  title,
  badge,
  tooltip,
}: {
  title: string;
  badge?: { text: string; tone: 'primary' | 'warning' };
  tooltip: string;
}) {
  const stop = (e: React.SyntheticEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  return (
    <div className="flex items-center justify-between gap-2 w-full">
      <div className="flex items-center gap-2 min-w-0">
        <span className="text-sm font-semibold truncate">{title}</span>
        {badge && (
          <span
            className={[
              'shrink-0 rounded-md px-1.5 py-[2px] text-[9px] leading-none font-semibold border',
              badge.tone === 'primary'
                ? 'text-primary border-primary/40 bg-primary/10'
                : 'text-warning border-warning/40 bg-warning/10',
            ].join(' ')}
          >
            {badge.text}
          </span>
        )}
      </div>
      <Tooltip content={tooltip}>
        <button
          type="button"
          tabIndex={0}
          aria-label="More info"
          onPointerDown={stop}
          onClick={stop}
          className="inline-flex items-center text-default-500 cursor-help opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity pointer-events-none group-hover:pointer-events-auto group-focus-within:pointer-events-auto"
        >
          <IconInfoSolid className="w-4 h-4" aria-hidden="true" />
        </button>
      </Tooltip>
    </div>
  );
}

function dmPolicyCopy(
  channel: ChannelKind,
  policy: DmPolicy
): {
  title: string;
  shortHint: string;
  tooltip: string;
  badge?: { text: string; tone: 'primary' | 'warning' };
} {
  switch (policy) {
    case 'pairing':
      return {
        title: 'Approval required',
        shortHint: 'Approve unknown senders.',
        tooltip:
          'Default secure mode. Unknown senders receive a pairing code and messages are ignored until you approve them.',
        badge: { text: 'Recommended', tone: 'primary' },
      };
    case 'allowlist': {
      const allowFromHint =
        channel === 'whatsapp'
          ? 'E.164 numbers in your allowed senders list.'
          : channel === 'telegram'
            ? 'Sender IDs or usernames in your allowed senders list.'
            : 'User IDs in your allowed senders list.';
      return {
        title: 'Allowed senders only',
        shortHint: `Only allow ${allowFromHint} (or already paired).`,
        tooltip:
          channel === 'telegram'
            ? 'Only people in your allowed senders list can start a Telegram DM, unless you have already approved them.'
            : channel === 'whatsapp'
              ? 'Only people in your allowed senders list can start a WhatsApp DM, unless you have already approved them.'
              : channel === 'discord'
                ? 'Only people in your allowed senders list can start a Discord DM, unless you have already approved them.'
                : 'Only people in your allowed senders list can start a Slack DM, unless you have already approved them.',
      };
    }
    case 'open':
      return {
        title: 'Anyone',
        shortHint: 'Anyone who can DM the account can trigger the assistant.',
        tooltip:
          channel === 'telegram'
            ? 'Anyone who can DM your Telegram bot can trigger it. Add "*" to the allowed senders list to make this work.'
            : channel === 'whatsapp'
              ? 'Anyone who can DM your WhatsApp number can trigger it. Add "*" to the allowed senders list to make this work.'
              : channel === 'discord'
                ? 'Anyone who can DM your Discord bot can trigger it. Add "*" to the allowed senders list to make this work.'
                : 'Anyone in the Slack workspace who can DM the bot can trigger it. Add "*" to the allowed senders list to make this work.',
        badge: { text: 'Risky', tone: 'warning' },
      };
    case 'disabled':
      return {
        title: 'Off',
        shortHint: 'Ignore inbound DMs.',
        tooltip: 'Disable inbound DMs entirely for this channel.',
      };
  }
}

function downloadTextFile(filename: string, content: string) {
  const blob = new Blob([content], { type: 'application/json;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

const dmPolicyKeys: DmPolicy[] = ['pairing', 'allowlist', 'open', 'disabled'];

const bindOptions: Array<{ key: GatewayBindMode; label: string; hint: string }> = [
  {
    key: 'loopback',
    label: 'Local only',
    hint: 'Only this machine can reach the Gateway (127.0.0.1).',
  },
  {
    key: 'auto',
    label: 'Auto',
    hint: 'Try local only first, then fall back to 0.0.0.0 if loopback is unavailable.',
  },
  {
    key: 'lan',
    label: 'LAN / public',
    hint: 'Listen on all interfaces (0.0.0.0). Public if the host is public.',
  },
  { key: 'tailnet', label: 'Tailnet', hint: 'Bind to a Tailnet IP when available.' },
  { key: 'custom', label: 'Custom IP', hint: 'Bind to a specific IP address.' },
];

const selectPopoverProps = {
  classNames: {
    base: 'z-[120]',
    backdrop: 'z-[110]',
  },
} as const;

const AUTO_GATEWAY_TOKEN = '__AUTO_GATEWAY_TOKEN__';

function generateFriendlyGatewayToken(): string {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789';
  const bytes = new Uint8Array(24);

  if (typeof globalThis.crypto?.getRandomValues === 'function') {
    globalThis.crypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < bytes.length; i += 1) {
      bytes[i] = Math.floor(Math.random() * 256);
    }
  }

  const body = Array.from(bytes, (value) => alphabet[value % alphabet.length]).join('');
  return `ocw_${body}`;
}

const DEFAULT_PRESET_ID: GeneratorPresetId = 'personal';

const defaultState: OpenClawConfigGeneratorState = {
  toolsProfile: 'coding',
  toolsAllow: [],
  toolsDeny: [],
  sandboxMode: 'non-main',
  sandboxToolsAllow: [],
  sandboxToolsDeny: [],
  modelFallbacksRaw: '',
  thinkingDepth: 'low',
  ai: {
    mode: 'custom',
    builtIn: {
      primaryModel: 'anthropic/claude-opus-4.6',
    },
    custom: {
      providerId: 'my-provider',
      api: 'openai-responses',
      baseUrl: 'https://api.example.com/v1',
      apiKeyEnvVar: 'MY_PROVIDER_API_KEY',
      apiKey: '',
      model: {
        id: 'gpt-5.2',
        name: 'GPT-5.2',
        inputText: true,
        inputImage: true,
        contextWindow: 400000,
        maxTokens: 128000,
      },
    },
  },
  gateway: {
    port: 18789,
    bind: 'loopback',
    customBindHost: '',
    authMode: 'token',
    authToken: AUTO_GATEWAY_TOKEN,
    authPassword: 'change-this-password',
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

export default function OpenClawConfigGenerator() {
  const [selectedPreset, setSelectedPreset] = useState<GeneratorPresetId>(DEFAULT_PRESET_ID);
  const [state, setState] = useState<OpenClawConfigGeneratorState>(() =>
    applyPresetToState(defaultState, DEFAULT_PRESET_ID)
  );
  const [copyState, setCopyState] = useState<'idle' | 'copied' | 'failed'>('idle');
  const [autoModelLimits, setAutoModelLimits] = useState(true);

  useEffect(() => {
    setState((current) =>
      current.gateway.authToken === AUTO_GATEWAY_TOKEN
        ? {
            ...current,
            gateway: { ...current.gateway, authToken: generateFriendlyGatewayToken() },
          }
        : current
    );
  }, []);

  const officialModelLimits = useMemo(
    () => inferOfficialModelLimits(state.ai.custom.api, state.ai.custom.model.id),
    [state.ai.custom.api, state.ai.custom.model.id]
  );

  const modelIdPlaceholder = useMemo(() => {
    if (state.ai.custom.api === 'anthropic-messages') return 'claude-sonnet-4-6';
    return 'gpt-5.2';
  }, [state.ai.custom.api]);

  const modelNamePlaceholder = useMemo(() => {
    if (state.ai.custom.api === 'anthropic-messages') return 'Claude Sonnet 4.6';
    return 'GPT-5.2';
  }, [state.ai.custom.api]);

  useEffect(() => {
    if (state.ai.mode !== 'custom') return;
    if (!autoModelLimits) return;
    if (!officialModelLimits) return;

    if (
      state.ai.custom.model.contextWindow === officialModelLimits.contextWindow &&
      state.ai.custom.model.maxTokens === officialModelLimits.maxTokens
    ) {
      return;
    }

    setState((s) => ({
      ...s,
      ai: {
        ...s.ai,
        custom: {
          ...s.ai.custom,
          model: {
            ...s.ai.custom.model,
            contextWindow: officialModelLimits.contextWindow,
            maxTokens: officialModelLimits.maxTokens,
          },
        },
      },
    }));
  }, [autoModelLimits, officialModelLimits, state.ai.mode]);

  const result = useMemo(() => buildOpenClawConfig(state), [state]);
  const activePreset = PRESET_DEFINITIONS[selectedPreset];
  const customProviderSecretValue = state.ai.custom.apiKey || state.ai.custom.apiKeyEnvVar;
  const showModelTuning = activePreset.ui.showModelTuning;
  const showModelFallbacks = activePreset.ui.showModelFallbacks;
  const showGatewayCard = activePreset.ui.showGateway;
  const showGatewayNetworkControls = activePreset.ui.showGatewayNetworkControls;
  const showGatewayPasswordAuth = activePreset.ui.showGatewayPasswordAuth;
  const showGroupControls = activePreset.ui.showGroupControls;
  const showMentionControls = activePreset.ui.showMentionControls;

  const errors = result.issues.filter((i) => i.level === 'error');
  const warnings = result.issues.filter((i) => i.level === 'warning');
  const infos = result.issues.filter((i) => i.level === 'info');

  const canExport = errors.length === 0;

  async function onCopy() {
    try {
      await navigator.clipboard.writeText(result.json);
      setCopyState('copied');
      window.setTimeout(() => setCopyState('idle'), 1200);
    } catch {
      setCopyState('failed');
      window.setTimeout(() => setCopyState('idle'), 1500);
    }
  }

  const groupPolicyKeys: GroupPolicy[] = ['allowlist', 'open', 'disabled'];
  const thinkingOptions: ThinkingDepth[] = ['none', 'low', 'high', 'xhigh'];
  const selectedThinking = thinkingOptions.includes(state.thinkingDepth)
    ? state.thinkingDepth
    : 'none';

  return (
    <HeroUIProvider>
      <div className="space-y-6">
        <div className="flex flex-col gap-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-2 text-sm text-default-700 dark:text-default-500">
              <IconLockClosed className="w-4 h-4" aria-hidden="true" />
              <span>Runs fully client-side. No tokens are sent to CoClaw.</span>
            </div>
            <div className="text-xs text-default-600 dark:text-default-500">
              OpenClaw ref: <span className="font-mono">{OPENCLAW_REF.branch}</span> @{' '}
              <span className="font-mono">{OPENCLAW_REF.commit.slice(0, 7)}</span>
            </div>
          </div>

          <div className="text-sm text-default-700 dark:text-default-500">
            Pick a preset, generate a config that matches your workflow, then tweak only what you
            need.
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6 items-start">
          <div className="space-y-6">
            <Card>
              <CardBody className="gap-4">
                <div className="space-y-2">
                  <div>
                    <h2 className="text-xl font-bold">Choose your starting point</h2>
                    <p className="text-sm text-default-700 dark:text-default-500">
                      Start with the preset that best matches the OpenClaw experience you want.
                    </p>
                  </div>

                  <Tabs
                    aria-label="Config presets"
                    selectedKey={selectedPreset}
                    onSelectionChange={(key) => {
                      const presetId = String(key) as GeneratorPresetId;
                      setSelectedPreset(presetId);
                      setState((current) => applyPresetToState(current, presetId));
                    }}
                    variant="underlined"
                    classNames={{
                      tabList:
                        'gap-6 w-full relative rounded-none p-0 border-b border-divider overflow-x-auto',
                      cursor: 'w-full bg-primary',
                      tab: 'max-w-fit px-0 h-11',
                      tabContent: 'group-data-[selected=true]:text-primary font-semibold',
                    }}
                  >
                    {Object.values(PRESET_DEFINITIONS).map((preset) => {
                      const title = preset.caution ? (
                        <span className="inline-flex items-center gap-1">
                          <span>{preset.tabLabel}</span>
                          <Tooltip content={preset.caution}>
                            <span className="inline-flex items-center text-default-500 cursor-help">
                              <IconInfoSolid className="w-4 h-4" aria-hidden="true" />
                            </span>
                          </Tooltip>
                        </span>
                      ) : (
                        preset.tabLabel
                      );
                      return <Tab key={preset.id} title={title} />;
                    })}
                  </Tabs>
                </div>

                <p className="text-sm text-default-700 dark:text-default-500">
                  <span className="font-semibold text-foreground">{activePreset.title}</span> -{' '}
                  {activePreset.summary}
                </p>
              </CardBody>
            </Card>

            <Card>
              <CardBody className="gap-5">
                <div>
                  <h2 className="text-xl font-bold">AI API Provider</h2>
                  <p className="text-sm text-default-700 dark:text-default-500">
                    Choose how OpenClaw connects to your model: use OpenClaw sign-in, or connect
                    your own provider.
                  </p>
                </div>

                <Select
                  popoverProps={selectPopoverProps}
                  label={
                    <span className="inline-flex items-center gap-1">
                      Provider Mode
                      <Tooltip content="Use OpenClaw sign-in when you want OpenClaw to handle access. Use your own provider when you want to enter the base URL and API key details here.">
                        <span className="inline-flex items-center text-default-500 cursor-help">
                          <IconInfoSolid className="w-4 h-4" aria-hidden="true" />
                        </span>
                      </Tooltip>
                    </span>
                  }
                  selectedKeys={[state.ai.mode]}
                  onSelectionChange={(keys) => {
                    if (keys === 'all') return;
                    const mode = [...keys][0] as
                      | OpenClawConfigGeneratorState['ai']['mode']
                      | undefined;
                    if (!mode) return;
                    setState((s) => ({ ...s, ai: { ...s.ai, mode } }));
                  }}
                  variant="bordered"
                >
                  <SelectItem
                    key="built-in"
                    description="Use OpenClaw sign-in or your own environment variables outside this generator."
                  >
                    Use OpenClaw sign-in
                  </SelectItem>
                  <SelectItem
                    key="custom"
                    description="Recommended. Enter your own base URL and API key details here."
                  >
                    Use your own provider
                  </SelectItem>
                </Select>

                {state.ai.mode === 'built-in' ? (
                  <div className="space-y-3">
                    <Input
                      label="Model name"
                      placeholder="anthropic/claude-opus-4.6"
                      value={state.ai.builtIn.primaryModel}
                      onValueChange={(v) =>
                        setState((s) => ({
                          ...s,
                          ai: { ...s.ai, builtIn: { ...s.ai.builtIn, primaryModel: v } },
                        }))
                      }
                      variant="bordered"
                    />
                    <Alert
                      color="default"
                      title="API key is handled elsewhere"
                      description="Built-in models do not add an API key here. After you copy the config, sign in inside OpenClaw or set the provider environment variables before starting OpenClaw."
                    />
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <Input
                        label="Provider name"
                        placeholder="my-provider"
                        value={state.ai.custom.providerId}
                        onValueChange={(v) =>
                          setState((s) => ({
                            ...s,
                            ai: { ...s.ai, custom: { ...s.ai.custom, providerId: v } },
                          }))
                        }
                        variant="bordered"
                      />
                      <Select
                        popoverProps={selectPopoverProps}
                        label="API type"
                        selectedKeys={[state.ai.custom.api]}
                        onSelectionChange={(keys) => {
                          if (keys === 'all') return;
                          const api = [...keys][0] as ModelApi | undefined;
                          if (!api) return;
                          setState((s) => ({
                            ...s,
                            ai: { ...s.ai, custom: { ...s.ai.custom, api } },
                          }));
                        }}
                        variant="bordered"
                      >
                        <SelectItem key="openai-responses">openai-responses</SelectItem>
                        <SelectItem key="openai-completions">openai-completions</SelectItem>
                        <SelectItem key="anthropic-messages">anthropic-messages</SelectItem>
                      </Select>
                    </div>

                    <Input
                      label="Base URL"
                      placeholder="https://api.example.com/v1"
                      value={state.ai.custom.baseUrl}
                      onValueChange={(v) =>
                        setState((s) => ({
                          ...s,
                          ai: { ...s.ai, custom: { ...s.ai.custom, baseUrl: v } },
                        }))
                      }
                      variant="bordered"
                    />

                    <Input
                      label="API key or environment variable name"
                      placeholder="MY_PROVIDER_API_KEY or sk-..."
                      value={customProviderSecretValue}
                      onValueChange={(v) =>
                        setState((s) => ({
                          ...s,
                          ai: {
                            ...s.ai,
                            custom: looksLikeApiKey(v)
                              ? { ...s.ai.custom, apiKey: v, apiKeyEnvVar: '' }
                              : { ...s.ai.custom, apiKey: '', apiKeyEnvVar: v },
                          },
                        }))
                      }
                      variant="bordered"
                      description="Paste a real API key to write it into JSON, or enter an uppercase environment variable name like MY_PROVIDER_API_KEY to render ${MY_PROVIDER_API_KEY}."
                    />

                    <Divider />

                    <div className="grid sm:grid-cols-2 gap-4">
                      <Input
                        label="Model ID"
                        placeholder={modelIdPlaceholder}
                        value={state.ai.custom.model.id}
                        onValueChange={(v) =>
                          setState((s) => ({
                            ...s,
                            ai: {
                              ...s.ai,
                              custom: { ...s.ai.custom, model: { ...s.ai.custom.model, id: v } },
                            },
                          }))
                        }
                        variant="bordered"
                      />
                      <Input
                        label="Display name"
                        placeholder={modelNamePlaceholder}
                        value={state.ai.custom.model.name}
                        onValueChange={(v) =>
                          setState((s) => ({
                            ...s,
                            ai: {
                              ...s.ai,
                              custom: { ...s.ai.custom, model: { ...s.ai.custom.model, name: v } },
                            },
                          }))
                        }
                        variant="bordered"
                      />
                    </div>

                    {showModelTuning ? (
                      <>
                        <div className="grid sm:grid-cols-2 gap-4">
                          <Input
                            type="number"
                            label="Context window"
                            value={String(state.ai.custom.model.contextWindow)}
                            isDisabled={autoModelLimits && !!officialModelLimits}
                            onValueChange={(v) =>
                              setState((s) => ({
                                ...s,
                                ai: {
                                  ...s.ai,
                                  custom: {
                                    ...s.ai.custom,
                                    model: {
                                      ...s.ai.custom.model,
                                      contextWindow: asInt(
                                        v,
                                        officialModelLimits?.contextWindow ?? 128000
                                      ),
                                    },
                                  },
                                },
                              }))
                            }
                            variant="bordered"
                            min={1}
                          />
                          <Input
                            type="number"
                            label="Max output tokens"
                            value={String(state.ai.custom.model.maxTokens)}
                            isDisabled={autoModelLimits && !!officialModelLimits}
                            onValueChange={(v) =>
                              setState((s) => ({
                                ...s,
                                ai: {
                                  ...s.ai,
                                  custom: {
                                    ...s.ai.custom,
                                    model: {
                                      ...s.ai.custom.model,
                                      maxTokens: asInt(v, officialModelLimits?.maxTokens ?? 8192),
                                    },
                                  },
                                },
                              }))
                            }
                            variant="bordered"
                            min={1}
                          />
                        </div>

                        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                          <Switch
                            isSelected={autoModelLimits}
                            onValueChange={(v) => setAutoModelLimits(v)}
                            isDisabled={!officialModelLimits}
                          >
                            Auto-fill known token limits
                          </Switch>
                          {officialModelLimits ? (
                            <div className="text-xs text-default-700 dark:text-default-500">
                              Detected:{' '}
                              <Code className="px-1 py-0.5">
                                {state.ai.custom.model.id.trim() || modelIdPlaceholder}
                              </Code>{' '}
                              {'->'} context window{' '}
                              {officialModelLimits.contextWindow.toLocaleString()}, max output
                              tokens {officialModelLimits.maxTokens.toLocaleString()}
                            </div>
                          ) : (
                            <div className="text-xs text-default-700 dark:text-default-500">
                              No known token limits detected for this model id.
                            </div>
                          )}
                        </div>
                      </>
                    ) : (
                      <div className="text-xs text-default-700 dark:text-default-500">
                        This preset uses the recommended model defaults for context window and
                        output size.
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1 text-xs font-semibold">
                        thinking depth
                        <Tooltip content="Controls the default /think level OpenClaw uses when starting a session. Choose none to disable thinking/reasoning params for compatibility testing.">
                          <span className="inline-flex items-center text-default-500 cursor-help">
                            <IconInfoSolid className="w-3.5 h-3.5" aria-hidden="true" />
                          </span>
                        </Tooltip>
                      </div>

                      <div className="mt-1 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6">
                        <div
                          role="radiogroup"
                          aria-label="thinking depth"
                          className="grid grid-cols-4 gap-1 rounded-xl bg-default-100 dark:bg-content2 p-1 w-full sm:w-[360px]"
                        >
                          {thinkingOptions.map((opt) => {
                            const isSelected = selectedThinking === opt;
                            return (
                              <button
                                key={opt}
                                type="button"
                                role="radio"
                                aria-checked={isSelected}
                                onClick={() => setState((s) => ({ ...s, thinkingDepth: opt }))}
                                className={[
                                  'rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-colors',
                                  'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background',
                                  isSelected
                                    ? 'bg-background text-foreground shadow-small'
                                    : 'text-default-600 dark:text-default-500 hover:bg-background/60 hover:text-foreground',
                                ].join(' ')}
                              >
                                {opt}
                              </button>
                            );
                          })}
                        </div>

                        <div className="flex items-center gap-4 shrink-0">
                          <Checkbox
                            size="sm"
                            isSelected={state.ai.custom.model.inputText}
                            onValueChange={(v) =>
                              setState((s) => ({
                                ...s,
                                ai: {
                                  ...s.ai,
                                  custom: {
                                    ...s.ai.custom,
                                    model: { ...s.ai.custom.model, inputText: v },
                                  },
                                },
                              }))
                            }
                          >
                            text
                          </Checkbox>
                          <Checkbox
                            size="sm"
                            isSelected={state.ai.custom.model.inputImage}
                            onValueChange={(v) =>
                              setState((s) => ({
                                ...s,
                                ai: {
                                  ...s.ai,
                                  custom: {
                                    ...s.ai.custom,
                                    model: { ...s.ai.custom.model, inputImage: v },
                                  },
                                },
                              }))
                            }
                          >
                            image
                          </Checkbox>
                        </div>
                      </div>
                    </div>

                    <div className="text-xs text-default-700 dark:text-default-500">
                      Primary model id will be:{' '}
                      <Code className="px-1 py-0.5">
                        {`${state.ai.custom.providerId || 'custom-proxy'}/${state.ai.custom.model.id || 'model'}`}
                      </Code>
                    </div>
                  </div>
                )}

                {showModelFallbacks && (
                  <div className="space-y-2">
                    <Divider />
                    <Textarea
                      label={
                        <span className="inline-flex items-center gap-1">
                          Model fallbacks (optional)
                          <Tooltip content="Optional backup models. Add one per line.">
                            <span className="inline-flex items-center text-default-500 cursor-help pointer-events-auto">
                              <IconInfoSolid className="w-4 h-4" aria-hidden="true" />
                            </span>
                          </Tooltip>
                        </span>
                      }
                      classNames={{ label: 'pointer-events-auto' }}
                      placeholder={'anthropic/claude-sonnet-4.6\nopenai/gpt-4.1'}
                      value={state.modelFallbacksRaw ?? ''}
                      onValueChange={(v) => setState((s) => ({ ...s, modelFallbacksRaw: v }))}
                      variant="bordered"
                      minRows={3}
                    />
                    <p className="text-xs text-default-700 dark:text-default-500">
                      OpenClaw will try fallbacks if the primary model fails or is unavailable.
                    </p>
                  </div>
                )}
              </CardBody>
            </Card>

            {showGatewayCard && (
              <Card>
                <CardBody className="gap-5">
                  <div>
                    <h2 className="text-xl font-bold">Gateway</h2>
                    <p className="text-sm text-default-700 dark:text-default-500">
                      Controls the WebSocket + Control UI server binding.
                    </p>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <Input
                      type="number"
                      label="Port"
                      value={String(state.gateway.port)}
                      onValueChange={(v) =>
                        setState((s) => ({
                          ...s,
                          gateway: { ...s.gateway, port: asInt(v, 18789) },
                        }))
                      }
                      variant="bordered"
                      min={1}
                      max={65535}
                    />

                    {showGatewayNetworkControls ? (
                      <Select
                        popoverProps={selectPopoverProps}
                        label="Bind mode"
                        selectedKeys={[state.gateway.bind]}
                        onSelectionChange={(keys) => {
                          if (keys === 'all') return;
                          const bind = [...keys][0] as GatewayBindMode | undefined;
                          if (!bind) return;
                          setState((s) => ({
                            ...s,
                            gateway: {
                              ...s.gateway,
                              bind,
                              authMode:
                                (bind === 'lan' || bind === 'tailnet' || bind === 'custom') &&
                                s.gateway.authMode === 'off'
                                  ? 'token'
                                  : s.gateway.authMode,
                            },
                          }));
                        }}
                        variant="bordered"
                      >
                        {bindOptions.map((o) => (
                          <SelectItem key={o.key} description={o.hint}>
                            {o.label}
                          </SelectItem>
                        ))}
                      </Select>
                    ) : (
                      <p className="text-sm text-default-700 dark:text-default-500">
                        This preset keeps the Gateway on
                        <Code className="mx-1 px-1 py-0.5">local only</Code>
                        with token auth.
                      </p>
                    )}
                  </div>

                  {showGatewayNetworkControls && state.gateway.bind === 'custom' && (
                    <Input
                      label="Custom host or IP"
                      placeholder="203.0.113.10"
                      value={state.gateway.customBindHost}
                      onValueChange={(v) =>
                        setState((s) => ({ ...s, gateway: { ...s.gateway, customBindHost: v } }))
                      }
                      variant="bordered"
                    />
                  )}

                  {showGatewayNetworkControls && state.gateway.bind !== 'loopback' && (
                    <div className="space-y-3">
                      <Divider />

                      <Select
                        popoverProps={selectPopoverProps}
                        label={
                          <span className="inline-flex items-center gap-1">
                            Sign-in protection
                            <Tooltip content="If other devices can reach this Gateway, you must turn on sign-in protection.">
                              <span className="inline-flex items-center text-default-500 cursor-help pointer-events-auto">
                                <IconInfoSolid className="w-4 h-4" aria-hidden="true" />
                              </span>
                            </Tooltip>
                          </span>
                        }
                        selectedKeys={[state.gateway.authMode]}
                        onSelectionChange={(keys) => {
                          if (keys === 'all') return;
                          const authMode = [...keys][0] as GatewayAuthMode | undefined;
                          if (!authMode) return;
                          setState((s) => ({ ...s, gateway: { ...s.gateway, authMode } }));
                        }}
                        variant="bordered"
                      >
                        <SelectItem key="token" description="Recommended. Use a long random token.">
                          Token
                        </SelectItem>
                        {showGatewayPasswordAuth && (
                          <SelectItem
                            key="password"
                            description="Use a password only when you specifically need it, such as Tailscale Funnel."
                          >
                            Password
                          </SelectItem>
                        )}
                        <SelectItem key="off" description="Not recommended and may fail to start.">
                          Off
                        </SelectItem>
                      </Select>

                      {state.gateway.authMode === 'token' && (
                        <Input
                          label="Gateway token or environment variable name"
                          placeholder="Auto-generated token"
                          value={state.gateway.authToken}
                          onValueChange={(v) =>
                            setState((s) => ({ ...s, gateway: { ...s.gateway, authToken: v } }))
                          }
                          variant="bordered"
                          description="A ready-to-use token is generated for you. You can keep it as-is, replace it with your own token, or enter an uppercase environment variable name if you already manage secrets that way."
                        />
                      )}

                      {showGatewayPasswordAuth && state.gateway.authMode === 'password' && (
                        <Input
                          label="Gateway password or environment variable name"
                          placeholder="OPENCLAW_GATEWAY_PASSWORD or strong-password"
                          value={state.gateway.authPassword}
                          onValueChange={(v) =>
                            setState((s) => ({
                              ...s,
                              gateway: { ...s.gateway, authPassword: v },
                            }))
                          }
                          variant="bordered"
                          description="Paste the real password to write it into JSON, or enter an uppercase environment variable name like OPENCLAW_GATEWAY_PASSWORD."
                        />
                      )}

                      {state.gateway.authMode === 'off' && (
                        <Alert
                          color="warning"
                          title="Sign-in protection is off"
                          description="OpenClaw will not let the Gateway listen beyond this machine unless sign-in protection is turned on. Use a token unless you have a specific reason not to."
                        />
                      )}
                    </div>
                  )}

                  {showGatewayNetworkControls &&
                    state.gateway.bind !== 'loopback' &&
                    state.gateway.bind !== 'auto' && (
                      <Alert
                        color="warning"
                        title="Public access risk"
                        description="If this Gateway is reachable from the public internet, lock it down with strong sign-in protection."
                      />
                    )}

                  {showGatewayNetworkControls && state.gateway.bind === 'auto' && (
                    <Alert
                      color="default"
                      title="Auto network mode"
                      description="Auto usually stays local to this machine, but on some hosts it can open to other devices. If you expose the Gateway, turn on sign-in protection."
                    />
                  )}
                </CardBody>
              </Card>
            )}

            <Card>
              <CardBody className="gap-5">
                <div>
                  <h2 className="text-xl font-bold">Channels</h2>
                  <p className="text-sm text-default-700 dark:text-default-500">
                    Pick the messaging channels you want to enable. If you're not sure, skip this
                    for now—start OpenClaw first, then ask it to walk you through installing and
                    configuring the channel you need.
                  </p>
                </div>

                <div className="grid sm:grid-cols-2 gap-3">
                  <Checkbox
                    size="sm"
                    isSelected={state.channels.telegram.enabled}
                    onValueChange={(v) =>
                      setState((s) => ({
                        ...s,
                        channels: {
                          ...s.channels,
                          telegram: { ...s.channels.telegram, enabled: v },
                        },
                      }))
                    }
                  >
                    <span className="inline-flex items-center gap-2">
                      <IconTelegram className="w-4 h-4" aria-hidden="true" />
                      Telegram
                    </span>
                  </Checkbox>

                  <Checkbox
                    size="sm"
                    isSelected={state.channels.whatsapp.enabled}
                    onValueChange={(v) =>
                      setState((s) => ({
                        ...s,
                        channels: {
                          ...s.channels,
                          whatsapp: { ...s.channels.whatsapp, enabled: v },
                        },
                      }))
                    }
                  >
                    <span className="inline-flex items-center gap-2">
                      <IconWhatsApp className="w-4 h-4" aria-hidden="true" />
                      WhatsApp
                    </span>
                  </Checkbox>

                  <Checkbox
                    size="sm"
                    isSelected={state.channels.discord.enabled}
                    onValueChange={(v) =>
                      setState((s) => ({
                        ...s,
                        channels: { ...s.channels, discord: { ...s.channels.discord, enabled: v } },
                      }))
                    }
                  >
                    <span className="inline-flex items-center gap-2">
                      <IconDiscord className="w-4 h-4" aria-hidden="true" />
                      Discord
                    </span>
                  </Checkbox>

                  <Checkbox
                    size="sm"
                    isSelected={state.channels.slack.enabled}
                    onValueChange={(v) =>
                      setState((s) => ({
                        ...s,
                        channels: { ...s.channels, slack: { ...s.channels.slack, enabled: v } },
                      }))
                    }
                  >
                    <span className="inline-flex items-center gap-2">
                      <IconSlack className="w-4 h-4" aria-hidden="true" />
                      Slack
                    </span>
                  </Checkbox>
                </div>

                <Divider />

                {state.channels.telegram.enabled && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <IconTelegram className="w-4 h-4" aria-hidden="true" />
                      <h3 className="font-bold">Telegram</h3>
                    </div>

                    {state.channels.telegram.dmPolicy === 'open' && (
                      <Alert
                        color="warning"
                        title="Telegram DMs are open to everyone"
                        description='Anyone can DM your bot and trigger the assistant. Add "*" to the allowed senders list to make this work.'
                      />
                    )}

                    <RadioGroup
                      label={
                        <span className="inline-flex items-center gap-1">
                          Who can message this assistant
                          <Tooltip content="Choose who can start a Telegram DM with this assistant.">
                            <span className="inline-flex items-center text-default-500 cursor-help">
                              <IconInfoSolid className="w-4 h-4" aria-hidden="true" />
                            </span>
                          </Tooltip>
                        </span>
                      }
                      value={state.channels.telegram.dmPolicy}
                      onValueChange={(v) =>
                        setState((s) => ({
                          ...s,
                          channels: {
                            ...s.channels,
                            telegram: { ...s.channels.telegram, dmPolicy: v as DmPolicy },
                          },
                        }))
                      }
                      orientation="horizontal"
                      classNames={{
                        wrapper: 'grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4',
                      }}
                    >
                      {dmPolicyKeys.map((key) => {
                        const copy = dmPolicyCopy('telegram', key);
                        return (
                          <Radio
                            key={key}
                            value={key}
                            classNames={{
                              base: 'group',
                              label: 'pointer-events-auto',
                              labelWrapper: 'w-full pointer-events-auto',
                            }}
                          >
                            <DmPolicyLabel
                              title={copy.title}
                              badge={copy.badge}
                              tooltip={`${copy.shortHint} ${copy.tooltip}`}
                            />
                          </Radio>
                        );
                      })}
                    </RadioGroup>

                    <Input
                      label="Bot token or environment variable name"
                      placeholder="TELEGRAM_BOT_TOKEN or 123456:ABCDEF..."
                      value={state.channels.telegram.botToken}
                      onValueChange={(v) =>
                        setState((s) => ({
                          ...s,
                          channels: {
                            ...s.channels,
                            telegram: { ...s.channels.telegram, botToken: v },
                          },
                        }))
                      }
                      variant="bordered"
                      description="Paste the real bot token to write it into JSON, or enter an uppercase environment variable name like TELEGRAM_BOT_TOKEN."
                    />

                    {(state.channels.telegram.dmPolicy === 'open' ||
                      state.channels.telegram.dmPolicy === 'allowlist' ||
                      showGroupControls ||
                      !!state.channels.telegram.allowFromRaw.trim()) && (
                      <div className="space-y-1">
                        <Textarea
                          label={
                            <span className="inline-flex items-center gap-1">
                              Allowed DM senders
                              <Tooltip content='Only these people can start a Telegram DM. If you choose Anyone, include "*".'>
                                <span className="inline-flex items-center text-default-500 cursor-help pointer-events-auto">
                                  <IconInfoSolid className="w-4 h-4" aria-hidden="true" />
                                </span>
                              </Tooltip>
                            </span>
                          }
                          classNames={{ label: 'pointer-events-auto' }}
                          placeholder={'tg:123456789\n*'}
                          value={state.channels.telegram.allowFromRaw}
                          onValueChange={(v) =>
                            setState((s) => ({
                              ...s,
                              channels: {
                                ...s.channels,
                                telegram: { ...s.channels.telegram, allowFromRaw: v },
                              },
                            }))
                          }
                          variant="bordered"
                          minRows={3}
                        />
                        {state.channels.telegram.dmPolicy === 'open' && (
                          <p className="text-xs text-warning">
                            Required: include <Code className="px-1 py-0.5">*</Code> in the allowed
                            senders list when Anyone is selected.
                          </p>
                        )}
                        {state.channels.telegram.dmPolicy === 'allowlist' &&
                          !state.channels.telegram.allowFromRaw.trim() && (
                            <p className="text-xs text-warning">
                              Required: add at least one sender id (example:{' '}
                              <Code className="px-1 py-0.5">tg:123456789</Code>).
                            </p>
                          )}
                      </div>
                    )}

                    {showGroupControls && (
                      <div className="space-y-4 pt-2">
                        <Divider />
                        <div>
                          <h4 className="text-sm font-bold">Group Messages</h4>
                          <p className="text-xs text-default-700 dark:text-default-500">
                            Telegram group messages stay locked down until you open them up here.
                          </p>
                        </div>

                        <Select
                          popoverProps={selectPopoverProps}
                          label={
                            <span className="inline-flex items-center gap-1">
                              Who can trigger here
                              <Tooltip content="Choose who can trigger this assistant from Telegram groups.">
                                <span className="inline-flex items-center text-default-500 cursor-help pointer-events-auto">
                                  <IconInfoSolid className="w-4 h-4" aria-hidden="true" />
                                </span>
                              </Tooltip>
                            </span>
                          }
                          selectedKeys={[state.channels.telegram.groupPolicy]}
                          onSelectionChange={(keys) => {
                            if (keys === 'all') return;
                            const groupPolicy = [...keys][0] as GroupPolicy | undefined;
                            if (!groupPolicy) return;
                            setState((s) => ({
                              ...s,
                              channels: {
                                ...s.channels,
                                telegram: { ...s.channels.telegram, groupPolicy },
                              },
                            }));
                          }}
                          variant="bordered"
                        >
                          {groupPolicyKeys.map((key) => (
                            <SelectItem
                              key={key}
                              description={
                                key === 'allowlist'
                                  ? 'Only the people you list below can trigger the assistant from groups.'
                                  : key === 'open'
                                    ? 'Anyone in the group can trigger the assistant.'
                                    : 'Ignore group messages.'
                              }
                            >
                              {key === 'allowlist'
                                ? 'Allowed list only'
                                : key === 'open'
                                  ? 'Anyone here'
                                  : 'Off'}
                            </SelectItem>
                          ))}
                        </Select>

                        {state.channels.telegram.groupPolicy === 'open' && (
                          <Alert
                            color="warning"
                            title="Telegram group messages are open to everyone here"
                            description="Higher risk: anyone in the Telegram groups you allow can trigger the assistant."
                          />
                        )}

                        {state.channels.telegram.groupPolicy === 'allowlist' && (
                          <div className="space-y-1">
                            <Textarea
                              label={
                                <span className="inline-flex items-center gap-1">
                                  Allowed people in groups
                                  <Tooltip content="Add the Telegram users who are allowed to trigger this assistant from groups. Leave this empty to keep group messages off.">
                                    <span className="inline-flex items-center text-default-500 cursor-help pointer-events-auto">
                                      <IconInfoSolid className="w-4 h-4" aria-hidden="true" />
                                    </span>
                                  </Tooltip>
                                </span>
                              }
                              classNames={{ label: 'pointer-events-auto' }}
                              placeholder={'tg:123456789\n@alice\n*'}
                              value={state.channels.telegram.groupAllowFromRaw}
                              onValueChange={(v) =>
                                setState((s) => ({
                                  ...s,
                                  channels: {
                                    ...s.channels,
                                    telegram: { ...s.channels.telegram, groupAllowFromRaw: v },
                                  },
                                }))
                              }
                              variant="bordered"
                              minRows={3}
                            />
                            {!state.channels.telegram.groupAllowFromRaw.trim() && (
                              <p className="text-xs text-default-700 dark:text-default-500">
                                Optional. If you leave this empty while Allowed senders only is
                                selected, Telegram group messages stay off.
                              </p>
                            )}
                          </div>
                        )}

                        {showMentionControls && (
                          <div className="space-y-4">
                            <Switch
                              isSelected={state.channels.telegram.groupRequireMention}
                              onValueChange={(v) =>
                                setState((s) => ({
                                  ...s,
                                  channels: {
                                    ...s.channels,
                                    telegram: { ...s.channels.telegram, groupRequireMention: v },
                                  },
                                }))
                              }
                            >
                              Only respond when mentioned in groups
                            </Switch>

                            <Textarea
                              label={
                                <span className="inline-flex items-center gap-1">
                                  Allowed groups
                                  <Tooltip content="Add the Telegram group chat IDs that are allowed to trigger this assistant. Leave this empty to keep group messages off.">
                                    <span className="inline-flex items-center text-default-500 cursor-help pointer-events-auto">
                                      <IconInfoSolid className="w-4 h-4" aria-hidden="true" />
                                    </span>
                                  </Tooltip>
                                </span>
                              }
                              classNames={{ label: 'pointer-events-auto' }}
                              placeholder={'-1001234567890\n-1009876543210'}
                              value={state.channels.telegram.groupIdsRaw}
                              onValueChange={(v) =>
                                setState((s) => ({
                                  ...s,
                                  channels: {
                                    ...s.channels,
                                    telegram: { ...s.channels.telegram, groupIdsRaw: v },
                                  },
                                }))
                              }
                              variant="bordered"
                              minRows={3}
                            />

                            <div className="grid sm:grid-cols-2 gap-4">
                              <Input
                                label="webhookUrl"
                                placeholder="https://example.com/telegram/webhook"
                                value={state.channels.telegram.webhookUrl}
                                onValueChange={(v) =>
                                  setState((s) => ({
                                    ...s,
                                    channels: {
                                      ...s.channels,
                                      telegram: { ...s.channels.telegram, webhookUrl: v },
                                    },
                                  }))
                                }
                                variant="bordered"
                              />
                              <Input
                                label="webhookSecret"
                                placeholder="${TELEGRAM_WEBHOOK_SECRET}"
                                value={state.channels.telegram.webhookSecret}
                                onValueChange={(v) =>
                                  setState((s) => ({
                                    ...s,
                                    channels: {
                                      ...s.channels,
                                      telegram: { ...s.channels.telegram, webhookSecret: v },
                                    },
                                  }))
                                }
                                variant="bordered"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {state.channels.whatsapp.enabled && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <IconWhatsApp className="w-4 h-4" aria-hidden="true" />
                      <h3 className="font-bold">WhatsApp</h3>
                    </div>

                    {state.channels.whatsapp.dmPolicy === 'open' && (
                      <Alert
                        color="warning"
                        title="WhatsApp DMs are open to everyone"
                        description='Anyone who can DM this number can trigger the assistant. Add "*" to the allowed senders list to make this work.'
                      />
                    )}

                    <RadioGroup
                      label={
                        <span className="inline-flex items-center gap-1">
                          Who can message this assistant
                          <Tooltip content="Choose who can start a WhatsApp chat with this assistant.">
                            <span className="inline-flex items-center text-default-500 cursor-help">
                              <IconInfoSolid className="w-4 h-4" aria-hidden="true" />
                            </span>
                          </Tooltip>
                        </span>
                      }
                      value={state.channels.whatsapp.dmPolicy}
                      onValueChange={(v) =>
                        setState((s) => ({
                          ...s,
                          channels: {
                            ...s.channels,
                            whatsapp: { ...s.channels.whatsapp, dmPolicy: v as DmPolicy },
                          },
                        }))
                      }
                      orientation="horizontal"
                      classNames={{
                        wrapper: 'grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4',
                      }}
                    >
                      {dmPolicyKeys.map((key) => {
                        const copy = dmPolicyCopy('whatsapp', key);
                        return (
                          <Radio
                            key={key}
                            value={key}
                            classNames={{
                              base: 'group',
                              label: 'pointer-events-auto',
                              labelWrapper: 'w-full pointer-events-auto',
                            }}
                          >
                            <DmPolicyLabel
                              title={copy.title}
                              badge={copy.badge}
                              tooltip={`${copy.shortHint} ${copy.tooltip}`}
                            />
                          </Radio>
                        );
                      })}
                    </RadioGroup>

                    <Switch
                      isSelected={state.channels.whatsapp.selfChatMode}
                      onValueChange={(v) =>
                        setState((s) => ({
                          ...s,
                          channels: {
                            ...s.channels,
                            whatsapp: { ...s.channels.whatsapp, selfChatMode: v },
                          },
                        }))
                      }
                    >
                      <span className="inline-flex items-center gap-1">
                        selfChatMode
                        <Tooltip content="Enable if you run on your personal number and want to test by messaging yourself.">
                          <span className="inline-flex items-center text-default-500 cursor-help">
                            <IconInfoSolid className="w-4 h-4" aria-hidden="true" />
                          </span>
                        </Tooltip>
                      </span>
                    </Switch>

                    {(state.channels.whatsapp.dmPolicy === 'open' ||
                      state.channels.whatsapp.dmPolicy === 'allowlist' ||
                      showGroupControls ||
                      !!state.channels.whatsapp.allowFromRaw.trim()) && (
                      <div className="space-y-1">
                        <Textarea
                          label={
                            <span className="inline-flex items-center gap-1">
                              Allowed DM senders
                              <Tooltip content='Only these numbers can start a WhatsApp chat. If you choose Anyone, include "*".'>
                                <span className="inline-flex items-center text-default-500 cursor-help pointer-events-auto">
                                  <IconInfoSolid className="w-4 h-4" aria-hidden="true" />
                                </span>
                              </Tooltip>
                            </span>
                          }
                          classNames={{ label: 'pointer-events-auto' }}
                          placeholder={'+15551234567\n*'}
                          value={state.channels.whatsapp.allowFromRaw}
                          onValueChange={(v) =>
                            setState((s) => ({
                              ...s,
                              channels: {
                                ...s.channels,
                                whatsapp: { ...s.channels.whatsapp, allowFromRaw: v },
                              },
                            }))
                          }
                          variant="bordered"
                          minRows={3}
                        />
                        {state.channels.whatsapp.dmPolicy === 'open' && (
                          <p className="text-xs text-warning">
                            Required: include <Code className="px-1 py-0.5">*</Code> in the allowed
                            senders list when Anyone is selected.
                          </p>
                        )}
                        {state.channels.whatsapp.dmPolicy === 'allowlist' &&
                          !state.channels.whatsapp.allowFromRaw.trim() && (
                            <p className="text-xs text-warning">
                              Required: add at least one E.164 number (example:{' '}
                              <Code className="px-1 py-0.5">+15551234567</Code>).
                            </p>
                          )}
                      </div>
                    )}

                    {showGroupControls && (
                      <div className="space-y-4 pt-2">
                        <Divider />
                        <div>
                          <h4 className="text-sm font-bold">Group Messages</h4>
                          <p className="text-xs text-default-700 dark:text-default-500">
                            WhatsApp group messages stay locked down until you open them up here.
                          </p>
                        </div>

                        <Select
                          popoverProps={selectPopoverProps}
                          label={
                            <span className="inline-flex items-center gap-1">
                              Who can trigger here
                              <Tooltip content="Choose who can trigger this assistant from WhatsApp groups.">
                                <span className="inline-flex items-center text-default-500 cursor-help pointer-events-auto">
                                  <IconInfoSolid className="w-4 h-4" aria-hidden="true" />
                                </span>
                              </Tooltip>
                            </span>
                          }
                          selectedKeys={[state.channels.whatsapp.groupPolicy]}
                          onSelectionChange={(keys) => {
                            if (keys === 'all') return;
                            const groupPolicy = [...keys][0] as GroupPolicy | undefined;
                            if (!groupPolicy) return;
                            setState((s) => ({
                              ...s,
                              channels: {
                                ...s.channels,
                                whatsapp: { ...s.channels.whatsapp, groupPolicy },
                              },
                            }));
                          }}
                          variant="bordered"
                        >
                          {groupPolicyKeys.map((key) => (
                            <SelectItem
                              key={key}
                              description={
                                key === 'allowlist'
                                  ? 'Only the people you list below can trigger the assistant from groups.'
                                  : key === 'open'
                                    ? 'Anyone in the group can trigger the assistant.'
                                    : 'Ignore group messages.'
                              }
                            >
                              {key === 'allowlist'
                                ? 'Allowed list only'
                                : key === 'open'
                                  ? 'Anyone here'
                                  : 'Off'}
                            </SelectItem>
                          ))}
                        </Select>

                        {state.channels.whatsapp.groupPolicy === 'open' && (
                          <Alert
                            color="warning"
                            title="WhatsApp group messages are open to everyone here"
                            description="Higher risk: anyone in the WhatsApp groups you allow can trigger the assistant."
                          />
                        )}

                        {state.channels.whatsapp.groupPolicy === 'allowlist' && (
                          <div className="space-y-1">
                            <Textarea
                              label={
                                <span className="inline-flex items-center gap-1">
                                  Allowed people in groups
                                  <Tooltip content="Add the WhatsApp numbers that are allowed to trigger this assistant from groups. Leave this empty to keep group messages off.">
                                    <span className="inline-flex items-center text-default-500 cursor-help pointer-events-auto">
                                      <IconInfoSolid className="w-4 h-4" aria-hidden="true" />
                                    </span>
                                  </Tooltip>
                                </span>
                              }
                              classNames={{ label: 'pointer-events-auto' }}
                              placeholder={'+15551234567\n*'}
                              value={state.channels.whatsapp.groupAllowFromRaw}
                              onValueChange={(v) =>
                                setState((s) => ({
                                  ...s,
                                  channels: {
                                    ...s.channels,
                                    whatsapp: { ...s.channels.whatsapp, groupAllowFromRaw: v },
                                  },
                                }))
                              }
                              variant="bordered"
                              minRows={3}
                            />
                            {!state.channels.whatsapp.groupAllowFromRaw.trim() && (
                              <p className="text-xs text-default-700 dark:text-default-500">
                                Optional. If you leave this empty while Allowed senders only is
                                selected, WhatsApp group messages stay off.
                              </p>
                            )}
                          </div>
                        )}

                        {showMentionControls && (
                          <div className="space-y-4">
                            <Switch
                              isSelected={state.channels.whatsapp.groupRequireMention}
                              onValueChange={(v) =>
                                setState((s) => ({
                                  ...s,
                                  channels: {
                                    ...s.channels,
                                    whatsapp: { ...s.channels.whatsapp, groupRequireMention: v },
                                  },
                                }))
                              }
                            >
                              Only respond when mentioned in groups
                            </Switch>

                            <Textarea
                              label={
                                <span className="inline-flex items-center gap-1">
                                  Allowed groups
                                  <Tooltip content="Add the WhatsApp group IDs that are allowed to trigger this assistant. Leave this empty to keep group messages off.">
                                    <span className="inline-flex items-center text-default-500 cursor-help pointer-events-auto">
                                      <IconInfoSolid className="w-4 h-4" aria-hidden="true" />
                                    </span>
                                  </Tooltip>
                                </span>
                              }
                              classNames={{ label: 'pointer-events-auto' }}
                              placeholder={'12345-67890@g.us'}
                              value={state.channels.whatsapp.groupIdsRaw}
                              onValueChange={(v) =>
                                setState((s) => ({
                                  ...s,
                                  channels: {
                                    ...s.channels,
                                    whatsapp: { ...s.channels.whatsapp, groupIdsRaw: v },
                                  },
                                }))
                              }
                              variant="bordered"
                              minRows={3}
                            />
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {state.channels.discord.enabled && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <IconDiscord className="w-4 h-4" aria-hidden="true" />
                      <h3 className="font-bold">Discord</h3>
                    </div>

                    {state.channels.discord.dmPolicy === 'open' && (
                      <Alert
                        color="warning"
                        title="Discord DMs are open to everyone"
                        description='Anyone can DM the bot and trigger the assistant. Add "*" to the allowed senders list to make this work.'
                      />
                    )}

                    <RadioGroup
                      label={
                        <span className="inline-flex items-center gap-1">
                          Who can message this assistant
                          <Tooltip content="Choose who can start a Discord DM with this assistant.">
                            <span className="inline-flex items-center text-default-500 cursor-help">
                              <IconInfoSolid className="w-4 h-4" aria-hidden="true" />
                            </span>
                          </Tooltip>
                        </span>
                      }
                      value={state.channels.discord.dmPolicy}
                      onValueChange={(v) =>
                        setState((s) => ({
                          ...s,
                          channels: {
                            ...s.channels,
                            discord: { ...s.channels.discord, dmPolicy: v as DmPolicy },
                          },
                        }))
                      }
                      orientation="horizontal"
                      classNames={{
                        wrapper: 'grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4',
                      }}
                    >
                      {dmPolicyKeys.map((key) => {
                        const copy = dmPolicyCopy('discord', key);
                        return (
                          <Radio
                            key={key}
                            value={key}
                            classNames={{
                              base: 'group',
                              label: 'pointer-events-auto',
                              labelWrapper: 'w-full pointer-events-auto',
                            }}
                          >
                            <DmPolicyLabel
                              title={copy.title}
                              badge={copy.badge}
                              tooltip={`${copy.shortHint} ${copy.tooltip}`}
                            />
                          </Radio>
                        );
                      })}
                    </RadioGroup>

                    <Input
                      label="Bot token or environment variable name"
                      placeholder="DISCORD_BOT_TOKEN or your-bot-token"
                      value={state.channels.discord.token}
                      onValueChange={(v) =>
                        setState((s) => ({
                          ...s,
                          channels: {
                            ...s.channels,
                            discord: { ...s.channels.discord, token: v },
                          },
                        }))
                      }
                      variant="bordered"
                      description="Paste the real bot token to write it into JSON, or enter an uppercase environment variable name like DISCORD_BOT_TOKEN."
                    />

                    {(state.channels.discord.dmPolicy === 'open' ||
                      state.channels.discord.dmPolicy === 'allowlist' ||
                      showGroupControls ||
                      !!state.channels.discord.allowFromRaw.trim()) && (
                      <div className="space-y-1">
                        <Textarea
                          label={
                            <span className="inline-flex items-center gap-1">
                              Allowed DM senders
                              <Tooltip content='Only these Discord users can start a DM. If you choose Anyone, include "*".'>
                                <span className="inline-flex items-center text-default-500 cursor-help pointer-events-auto">
                                  <IconInfoSolid className="w-4 h-4" aria-hidden="true" />
                                </span>
                              </Tooltip>
                            </span>
                          }
                          classNames={{ label: 'pointer-events-auto' }}
                          placeholder={'123456789012345678\n*'}
                          value={state.channels.discord.allowFromRaw}
                          onValueChange={(v) =>
                            setState((s) => ({
                              ...s,
                              channels: {
                                ...s.channels,
                                discord: { ...s.channels.discord, allowFromRaw: v },
                              },
                            }))
                          }
                          variant="bordered"
                          minRows={3}
                        />
                        {state.channels.discord.dmPolicy === 'open' && (
                          <p className="text-xs text-warning">
                            Required: include <Code className="px-1 py-0.5">*</Code> in the allowed
                            senders list when Anyone is selected.
                          </p>
                        )}
                        {state.channels.discord.dmPolicy === 'allowlist' &&
                          !state.channels.discord.allowFromRaw.trim() && (
                            <p className="text-xs text-warning">
                              Required: add at least one user id.
                            </p>
                          )}
                      </div>
                    )}

                    {showGroupControls && (
                      <div className="space-y-4 pt-2">
                        <Divider />
                        <div>
                          <h4 className="text-sm font-bold">Guild Messages</h4>
                          <p className="text-xs text-default-700 dark:text-default-500">
                            Discord server messages follow the server access choices you set here.
                          </p>
                        </div>

                        <Select
                          popoverProps={selectPopoverProps}
                          label={
                            <span className="inline-flex items-center gap-1">
                              Who can trigger here
                              <Tooltip content="Choose who can trigger this assistant from Discord servers.">
                                <span className="inline-flex items-center text-default-500 cursor-help pointer-events-auto">
                                  <IconInfoSolid className="w-4 h-4" aria-hidden="true" />
                                </span>
                              </Tooltip>
                            </span>
                          }
                          selectedKeys={[state.channels.discord.groupPolicy]}
                          onSelectionChange={(keys) => {
                            if (keys === 'all') return;
                            const groupPolicy = [...keys][0] as GroupPolicy | undefined;
                            if (!groupPolicy) return;
                            setState((s) => ({
                              ...s,
                              channels: {
                                ...s.channels,
                                discord: { ...s.channels.discord, groupPolicy },
                              },
                            }));
                          }}
                          variant="bordered"
                        >
                          {groupPolicyKeys.map((key) => (
                            <SelectItem
                              key={key}
                              description={
                                key === 'allowlist'
                                  ? 'Only the servers you list below can trigger the assistant.'
                                  : key === 'open'
                                    ? 'Any server the bot can access can trigger the assistant.'
                                    : 'Ignore server messages.'
                              }
                            >
                              {key === 'allowlist'
                                ? 'Allowed list only'
                                : key === 'open'
                                  ? 'Anyone here'
                                  : 'Off'}
                            </SelectItem>
                          ))}
                        </Select>

                        {state.channels.discord.groupPolicy === 'open' && (
                          <Alert
                            color="warning"
                            title="Discord server messages are open to everyone here"
                            description="Higher risk: any server the bot can access can trigger the assistant."
                          />
                        )}

                        {(state.channels.discord.groupPolicy === 'allowlist' ||
                          !!state.channels.discord.guildIdsRaw.trim()) && (
                          <div className="space-y-1">
                            <Textarea
                              label={
                                <span className="inline-flex items-center gap-1">
                                  Allowed servers
                                  <Tooltip content="Add the Discord server IDs that are allowed to trigger this assistant. Leave this empty to keep server messages off.">
                                    <span className="inline-flex items-center text-default-500 cursor-help pointer-events-auto">
                                      <IconInfoSolid className="w-4 h-4" aria-hidden="true" />
                                    </span>
                                  </Tooltip>
                                </span>
                              }
                              classNames={{ label: 'pointer-events-auto' }}
                              placeholder={'123456789012345678\n987654321098765432'}
                              value={state.channels.discord.guildIdsRaw}
                              onValueChange={(v) =>
                                setState((s) => ({
                                  ...s,
                                  channels: {
                                    ...s.channels,
                                    discord: { ...s.channels.discord, guildIdsRaw: v },
                                  },
                                }))
                              }
                              variant="bordered"
                              minRows={3}
                            />
                            {state.channels.discord.groupPolicy === 'allowlist' &&
                              !state.channels.discord.guildIdsRaw.trim() && (
                                <p className="text-xs text-default-700 dark:text-default-500">
                                  Optional. If you leave this empty while Allowed servers is
                                  selected, Discord server messages stay off (DMs still work).
                                </p>
                              )}
                          </div>
                        )}

                        {showMentionControls && (
                          <Switch
                            isSelected={state.channels.discord.guildRequireMention}
                            onValueChange={(v) =>
                              setState((s) => ({
                                ...s,
                                channels: {
                                  ...s.channels,
                                  discord: { ...s.channels.discord, guildRequireMention: v },
                                },
                              }))
                            }
                          >
                            Only respond when mentioned in servers
                          </Switch>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {state.channels.slack.enabled && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <IconSlack className="w-4 h-4" aria-hidden="true" />
                      <h3 className="font-bold">Slack</h3>
                    </div>

                    {state.channels.slack.dmPolicy === 'open' && (
                      <Alert
                        color="warning"
                        title="Slack DMs are open to everyone"
                        description='Anyone in the workspace can DM the bot and trigger the assistant. Add "*" to the allowed senders list to make this work.'
                      />
                    )}

                    <RadioGroup
                      label={
                        <span className="inline-flex items-center gap-1">
                          Who can message this assistant
                          <Tooltip content="Choose who can start a Slack DM with this assistant.">
                            <span className="inline-flex items-center text-default-500 cursor-help">
                              <IconInfoSolid className="w-4 h-4" aria-hidden="true" />
                            </span>
                          </Tooltip>
                        </span>
                      }
                      value={state.channels.slack.dmPolicy}
                      onValueChange={(v) =>
                        setState((s) => ({
                          ...s,
                          channels: {
                            ...s.channels,
                            slack: { ...s.channels.slack, dmPolicy: v as DmPolicy },
                          },
                        }))
                      }
                      orientation="horizontal"
                      classNames={{
                        wrapper: 'grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4',
                      }}
                    >
                      {dmPolicyKeys.map((key) => {
                        const copy = dmPolicyCopy('slack', key);
                        return (
                          <Radio
                            key={key}
                            value={key}
                            classNames={{
                              base: 'group',
                              label: 'pointer-events-auto',
                              labelWrapper: 'w-full pointer-events-auto',
                            }}
                          >
                            <DmPolicyLabel
                              title={copy.title}
                              badge={copy.badge}
                              tooltip={`${copy.shortHint} ${copy.tooltip}`}
                            />
                          </Radio>
                        );
                      })}
                    </RadioGroup>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <Input
                        label="Bot token or environment variable name"
                        placeholder="SLACK_BOT_TOKEN or xoxb-..."
                        value={state.channels.slack.botToken}
                        onValueChange={(v) =>
                          setState((s) => ({
                            ...s,
                            channels: {
                              ...s.channels,
                              slack: { ...s.channels.slack, botToken: v },
                            },
                          }))
                        }
                        variant="bordered"
                        description="Paste the real bot token to write it into JSON, or enter an uppercase environment variable name like SLACK_BOT_TOKEN."
                      />
                      <Input
                        label="App token or environment variable name"
                        placeholder="SLACK_APP_TOKEN or xapp-..."
                        value={state.channels.slack.appToken}
                        onValueChange={(v) =>
                          setState((s) => ({
                            ...s,
                            channels: {
                              ...s.channels,
                              slack: { ...s.channels.slack, appToken: v },
                            },
                          }))
                        }
                        variant="bordered"
                        description="Paste the real app token to write it into JSON, or enter an uppercase environment variable name like SLACK_APP_TOKEN."
                      />
                    </div>

                    {(state.channels.slack.dmPolicy === 'open' ||
                      state.channels.slack.dmPolicy === 'allowlist' ||
                      showGroupControls ||
                      !!state.channels.slack.allowFromRaw.trim()) && (
                      <div className="space-y-1">
                        <Textarea
                          label={
                            <span className="inline-flex items-center gap-1">
                              Allowed DM senders
                              <Tooltip content='Only these Slack users can start a DM. If you choose Anyone, include "*".'>
                                <span className="inline-flex items-center text-default-500 cursor-help pointer-events-auto">
                                  <IconInfoSolid className="w-4 h-4" aria-hidden="true" />
                                </span>
                              </Tooltip>
                            </span>
                          }
                          classNames={{ label: 'pointer-events-auto' }}
                          placeholder={'U012ABCDEF\n*'}
                          value={state.channels.slack.allowFromRaw}
                          onValueChange={(v) =>
                            setState((s) => ({
                              ...s,
                              channels: {
                                ...s.channels,
                                slack: { ...s.channels.slack, allowFromRaw: v },
                              },
                            }))
                          }
                          variant="bordered"
                          minRows={3}
                        />
                        {state.channels.slack.dmPolicy === 'open' && (
                          <p className="text-xs text-warning">
                            Required: include <Code className="px-1 py-0.5">*</Code> in the allowed
                            senders list when Anyone is selected.
                          </p>
                        )}
                        {state.channels.slack.dmPolicy === 'allowlist' &&
                          !state.channels.slack.allowFromRaw.trim() && (
                            <p className="text-xs text-warning">
                              Required: add at least one user id.
                            </p>
                          )}
                      </div>
                    )}

                    {showGroupControls && (
                      <div className="space-y-4 pt-2">
                        <Divider />
                        <div>
                          <h4 className="text-sm font-bold">Channel Messages</h4>
                          <p className="text-xs text-default-700 dark:text-default-500">
                            Slack channel messages follow the channel access choices you set here.
                          </p>
                        </div>

                        <Select
                          popoverProps={selectPopoverProps}
                          label={
                            <span className="inline-flex items-center gap-1">
                              Who can trigger here
                              <Tooltip content="Choose who can trigger this assistant from Slack channels.">
                                <span className="inline-flex items-center text-default-500 cursor-help pointer-events-auto">
                                  <IconInfoSolid className="w-4 h-4" aria-hidden="true" />
                                </span>
                              </Tooltip>
                            </span>
                          }
                          selectedKeys={[state.channels.slack.groupPolicy]}
                          onSelectionChange={(keys) => {
                            if (keys === 'all') return;
                            const groupPolicy = [...keys][0] as GroupPolicy | undefined;
                            if (!groupPolicy) return;
                            setState((s) => ({
                              ...s,
                              channels: {
                                ...s.channels,
                                slack: { ...s.channels.slack, groupPolicy },
                              },
                            }));
                          }}
                          variant="bordered"
                        >
                          {groupPolicyKeys.map((key) => (
                            <SelectItem
                              key={key}
                              description={
                                key === 'allowlist'
                                  ? 'Only the channels you list below can trigger the assistant.'
                                  : key === 'open'
                                    ? 'Any channel the bot can access can trigger the assistant.'
                                    : 'Ignore channel messages.'
                              }
                            >
                              {key === 'allowlist'
                                ? 'Allowed list only'
                                : key === 'open'
                                  ? 'Anyone here'
                                  : 'Off'}
                            </SelectItem>
                          ))}
                        </Select>

                        {state.channels.slack.groupPolicy === 'open' && (
                          <Alert
                            color="warning"
                            title="Slack channel messages are open to everyone here"
                            description="Higher risk: any channel the bot can access can trigger the assistant."
                          />
                        )}

                        {(state.channels.slack.groupPolicy === 'allowlist' ||
                          !!state.channels.slack.channelIdsRaw.trim()) && (
                          <div className="space-y-1">
                            <Textarea
                              label={
                                <span className="inline-flex items-center gap-1">
                                  Allowed channels
                                  <Tooltip content='Add the Slack channels that are allowed to trigger this assistant. Examples: "C012ABCDEF", "#general". Leave this empty to keep channel messages off.'>
                                    <span className="inline-flex items-center text-default-500 cursor-help pointer-events-auto">
                                      <IconInfoSolid className="w-4 h-4" aria-hidden="true" />
                                    </span>
                                  </Tooltip>
                                </span>
                              }
                              classNames={{ label: 'pointer-events-auto' }}
                              placeholder={'C012ABCDEF\n#general'}
                              value={state.channels.slack.channelIdsRaw}
                              onValueChange={(v) =>
                                setState((s) => ({
                                  ...s,
                                  channels: {
                                    ...s.channels,
                                    slack: { ...s.channels.slack, channelIdsRaw: v },
                                  },
                                }))
                              }
                              variant="bordered"
                              minRows={3}
                            />
                            {state.channels.slack.groupPolicy === 'allowlist' &&
                              !state.channels.slack.channelIdsRaw.trim() && (
                                <p className="text-xs text-default-700 dark:text-default-500">
                                  Optional. If you leave this empty while Allowed channels is
                                  selected, Slack channel messages stay off (DMs still work).
                                </p>
                              )}
                          </div>
                        )}

                        {showMentionControls && state.channels.slack.channelIdsRaw.trim() && (
                          <Switch
                            isSelected={state.channels.slack.channelRequireMention}
                            onValueChange={(v) =>
                              setState((s) => ({
                                ...s,
                                channels: {
                                  ...s.channels,
                                  slack: { ...s.channels.slack, channelRequireMention: v },
                                },
                              }))
                            }
                          >
                            Only respond when mentioned in allowed channels
                          </Switch>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </CardBody>
            </Card>
          </div>

          <div className="space-y-6 lg:sticky lg:top-24">
            <Card>
              <CardBody className="gap-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-bold">Generated Config</h2>
                    <p className="text-sm text-default-700 dark:text-default-500">
                      Generated <span className="font-mono">openclaw.json</span>
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="flat"
                      onPress={onCopy}
                      startContent={<IconCopy className="w-4 h-4" aria-hidden="true" />}
                    >
                      {copyState === 'copied'
                        ? 'Copied'
                        : copyState === 'failed'
                          ? 'Copy failed'
                          : 'Copy'}
                    </Button>
                    <Button
                      size="sm"
                      color="primary"
                      onPress={() => downloadTextFile('openclaw.json', result.json)}
                      isDisabled={!canExport}
                      startContent={<IconDocumentText className="w-4 h-4" aria-hidden="true" />}
                    >
                      Download
                    </Button>
                  </div>
                </div>

                {!canExport && (
                  <Alert
                    color="danger"
                    title="Fix errors before exporting"
                    description="This config would likely fail validation or behave unsafely."
                  />
                )}

                {(errors.length > 0 || warnings.length > 0 || infos.length > 0) && (
                  <div className="space-y-2">
                    {errors.map((i) => (
                      <Alert
                        key={`e:${i.path}:${i.message}`}
                        color="danger"
                        title={i.path}
                        description={i.message}
                      />
                    ))}
                    {warnings.map((i) => (
                      <Alert
                        key={`w:${i.path}:${i.message}`}
                        color="warning"
                        title={i.path}
                        description={i.message}
                      />
                    ))}
                    {infos.map((i) => (
                      <Alert
                        key={`i:${i.path}:${i.message}`}
                        color="default"
                        title={i.path}
                        description={i.message}
                      />
                    ))}
                  </div>
                )}

                {result.requiredEnvVars.length > 0 && (
                  <Card className="bg-content2">
                    <CardBody className="gap-2">
                      <div className="flex items-center gap-2 text-sm font-semibold">
                        <IconWarning className="w-4 h-4" aria-hidden="true" />
                        Required environment variables
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {result.requiredEnvVars.map((k) => (
                          <Code key={k} className="px-2 py-1">
                            {k}
                          </Code>
                        ))}
                      </div>
                      <p className="text-xs text-default-700 dark:text-default-500">
                        Any uppercase environment variable name you entered is rendered as{' '}
                        <Code className="px-1 py-0.5">{'${ENV_VAR}'}</Code> in the exported config.
                        Set these values before you start OpenClaw.
                      </p>
                    </CardBody>
                  </Card>
                )}

                <pre className="text-xs leading-relaxed overflow-auto rounded-xl bg-content2 p-4 border border-divider font-mono whitespace-pre">
                  {result.json}
                </pre>
              </CardBody>
            </Card>
          </div>
        </div>
      </div>
    </HeroUIProvider>
  );
}
