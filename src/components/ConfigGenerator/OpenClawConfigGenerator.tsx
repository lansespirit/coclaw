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
  Textarea,
  Tooltip,
} from '@heroui/react';
import { useMemo, useState } from 'react';
import {
  buildOpenClawConfig,
  type DmPolicy,
  type GatewayBindMode,
  type ModelApi,
  type OpenClawConfigGeneratorState,
  type SecretsMode,
} from '../../lib/openclaw-config/generator';
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
        title: 'pairing',
        shortHint: 'Approve unknown senders.',
        tooltip:
          'Default secure mode. Unknown senders receive a pairing code and messages are ignored until you approve them.',
        badge: { text: 'Recommended', tone: 'primary' },
      };
    case 'allowlist': {
      const allowFromHint =
        channel === 'whatsapp'
          ? 'E.164 numbers in allowFrom.'
          : channel === 'telegram'
            ? 'Sender IDs/usernames in allowFrom.'
            : 'User IDs in dm.allowFrom.';
      return {
        title: 'allowlist',
        shortHint: `Only allow ${allowFromHint}`,
        tooltip:
          channel === 'telegram'
            ? 'Only allow direct messages from senders listed in channels.telegram.allowFrom.'
            : channel === 'whatsapp'
              ? 'Only allow direct messages from numbers listed in channels.whatsapp.allowFrom (E.164 format).'
              : channel === 'discord'
                ? 'Only allow DMs from user IDs listed in channels.discord.dm.allowFrom.'
                : 'Only allow DMs from user IDs listed in channels.slack.dm.allowFrom.',
      };
    }
    case 'open':
      return {
        title: 'open',
        shortHint: 'Anyone who can DM the account can trigger the agent.',
        tooltip:
          channel === 'telegram'
            ? 'Opens inbound Telegram DMs. OpenClaw requires allowFrom to include "*" for dmPolicy="open".'
            : 'High risk. Anyone who can DM this bot/account can trigger the agent. Use allowlists and Safe Mode unless you fully understand the exposure.',
        badge: { text: 'Risky', tone: 'warning' },
      };
    case 'disabled':
      return {
        title: 'disabled',
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
  { key: 'loopback', label: 'loopback', hint: 'Local-only (127.0.0.1).' },
  { key: 'lan', label: 'lan', hint: 'All interfaces (0.0.0.0). Public if the host is public.' },
  { key: 'tailnet', label: 'tailnet', hint: 'Bind to Tailnet IP when available.' },
  { key: 'custom', label: 'custom', hint: 'Bind to a specific IP (customBindHost).' },
];

const defaultState: OpenClawConfigGeneratorState = {
  safeMode: true,
  secretsMode: 'env',
  ai: {
    mode: 'built-in',
    builtIn: {
      primaryModel: 'anthropic/claude-opus-4-5',
    },
    custom: {
      providerId: 'custom-proxy',
      api: 'openai-completions',
      baseUrl: 'http://localhost:4000/v1',
      apiKeyEnvVar: 'CUSTOM_PROVIDER_API_KEY',
      apiKey: '',
      model: {
        id: 'llama-3.1-8b',
        name: 'Llama 3.1 8B',
        reasoning: false,
        inputText: true,
        inputImage: false,
        contextWindow: 128000,
        maxTokens: 8192,
      },
    },
  },
  gateway: {
    port: 18789,
    bind: 'loopback',
    customBindHost: '',
  },
  channels: {
    telegram: {
      enabled: false,
      dmPolicy: 'pairing',
      allowFromRaw: '',
      botToken: '',
    },
    whatsapp: {
      enabled: false,
      dmPolicy: 'pairing',
      allowFromRaw: '',
    },
    discord: {
      enabled: false,
      dmPolicy: 'pairing',
      allowFromRaw: '',
      token: '',
    },
    slack: {
      enabled: false,
      dmPolicy: 'pairing',
      allowFromRaw: '',
      botToken: '',
      appToken: '',
    },
  },
};

export default function OpenClawConfigGenerator() {
  const [state, setState] = useState<OpenClawConfigGeneratorState>(defaultState);
  const [copyState, setCopyState] = useState<'idle' | 'copied' | 'failed'>('idle');

  const result = useMemo(() => buildOpenClawConfig(state), [state]);

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
        </div>

        <div className="grid lg:grid-cols-2 gap-6 items-start">
          <div className="space-y-6">
            <Card>
              <CardBody className="gap-5">
                <div>
                  <h2 className="text-xl font-bold">Core</h2>
                  <p className="text-sm text-default-700 dark:text-default-500">
                    Start with a safe baseline and grow from there.
                  </p>
                </div>

                <div className="grid sm:grid-cols-2 gap-4 items-center">
                  <Switch
                    isSelected={state.safeMode}
                    onValueChange={(v) => setState((s) => ({ ...s, safeMode: v }))}
                  >
                    <span className="inline-flex items-center gap-1">
                      Safe Mode
                      <Tooltip content="Recommended: sandbox non-main sessions + safer tool defaults.">
                        <span className="inline-flex items-center text-default-500 cursor-help">
                          <IconInfoSolid className="w-4 h-4" aria-hidden="true" />
                        </span>
                      </Tooltip>
                    </span>
                  </Switch>
                  <Select
                    label={
                      <span className="inline-flex items-center gap-1">
                        Secrets
                        <Tooltip content="Prefer env vars or ${ENV_VAR} substitution to keep keys out of JSON.">
                          <span className="inline-flex items-center text-default-500 cursor-help">
                            <IconInfoSolid className="w-4 h-4" aria-hidden="true" />
                          </span>
                        </Tooltip>
                      </span>
                    }
                    selectedKeys={[state.secretsMode]}
                    onSelectionChange={(keys) => {
                      if (keys === 'all') return;
                      const mode = [...keys][0] as SecretsMode | undefined;
                      if (!mode) return;
                      setState((s) => ({ ...s, secretsMode: mode }));
                    }}
                    variant="bordered"
                  >
                    <SelectItem
                      key="env"
                      description="Recommended. Use env vars and keep openclaw.json clean."
                    >
                      Env vars
                    </SelectItem>
                    <SelectItem
                      key="inline"
                      description="Not recommended. Writes secrets directly into JSON."
                    >
                      Inline in JSON
                    </SelectItem>
                  </Select>
                </div>

                {!state.safeMode && (
                  <Alert
                    color="warning"
                    title="Safe Mode is off"
                    description="If you plan to use groups/channels, consider enabling sandboxing for non-main sessions."
                    className="mt-1"
                  />
                )}
              </CardBody>
            </Card>

            <Card>
              <CardBody className="gap-5">
                <div>
                  <h2 className="text-xl font-bold">AI Providers</h2>
                  <p className="text-sm text-default-700 dark:text-default-500">
                    Use a built-in model id, or define a custom provider (baseUrl + apiKey).
                  </p>
                </div>

                <Select
                  label={
                    <span className="inline-flex items-center gap-1">
                      Mode
                      <Tooltip content="Built-in: only pick a model id. Custom: generate models.providers with baseUrl + apiKey.">
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
                    description="Enter a model id like anthropic/claude-opus-4-5; keys are usually env vars."
                  >
                    Built-in
                  </SelectItem>
                  <SelectItem
                    key="custom"
                    description="Generate models.providers with your baseUrl and apiKey (${ENV_VAR} supported)."
                  >
                    Custom baseUrl
                  </SelectItem>
                </Select>

                {state.ai.mode === 'built-in' ? (
                  <div className="space-y-3">
                    <Input
                      label="Primary model (agents.defaults.model.primary)"
                      placeholder="anthropic/claude-opus-4-5"
                      value={state.ai.builtIn.primaryModel}
                      onValueChange={(v) =>
                        setState((s) => ({
                          ...s,
                          ai: { ...s.ai, builtIn: { ...s.ai.builtIn, primaryModel: v } },
                        }))
                      }
                      variant="bordered"
                    />
                    {state.secretsMode === 'env' && (
                      <p className="text-xs text-default-700 dark:text-default-500">
                        Tip: OpenClaw usually reads provider keys from env vars (for example{' '}
                        <Code className="px-1 py-0.5">ANTHROPIC_API_KEY</Code> or{' '}
                        <Code className="px-1 py-0.5">OPENAI_API_KEY</Code>).
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <Input
                        label="providerId"
                        placeholder="custom-proxy"
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
                        label="api"
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
                      label="baseUrl"
                      placeholder="http://localhost:4000/v1"
                      value={state.ai.custom.baseUrl}
                      onValueChange={(v) =>
                        setState((s) => ({
                          ...s,
                          ai: { ...s.ai, custom: { ...s.ai.custom, baseUrl: v } },
                        }))
                      }
                      variant="bordered"
                    />

                    {state.secretsMode === 'inline' ? (
                      <Input
                        label="apiKey"
                        placeholder="YOUR_API_KEY"
                        value={state.ai.custom.apiKey}
                        onValueChange={(v) =>
                          setState((s) => ({
                            ...s,
                            ai: { ...s.ai, custom: { ...s.ai.custom, apiKey: v } },
                          }))
                        }
                        variant="bordered"
                      />
                    ) : (
                      <Input
                        label="apiKey env var"
                        placeholder="CUSTOM_PROVIDER_API_KEY"
                        value={state.ai.custom.apiKeyEnvVar}
                        onValueChange={(v) =>
                          setState((s) => ({
                            ...s,
                            ai: { ...s.ai, custom: { ...s.ai.custom, apiKeyEnvVar: v } },
                          }))
                        }
                        variant="bordered"
                        description="Will be rendered as ${ENV_VAR} in openclaw.json"
                      />
                    )}

                    <Divider />

                    <div className="grid sm:grid-cols-2 gap-4">
                      <Input
                        label="model id"
                        placeholder="llama-3.1-8b"
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
                        label="model name"
                        placeholder="Llama 3.1 8B"
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

                    <div className="grid sm:grid-cols-2 gap-4">
                      <Input
                        type="number"
                        label="contextWindow"
                        value={String(state.ai.custom.model.contextWindow)}
                        onValueChange={(v) =>
                          setState((s) => ({
                            ...s,
                            ai: {
                              ...s.ai,
                              custom: {
                                ...s.ai.custom,
                                model: { ...s.ai.custom.model, contextWindow: asInt(v, 128000) },
                              },
                            },
                          }))
                        }
                        variant="bordered"
                        min={1}
                      />
                      <Input
                        type="number"
                        label="maxTokens"
                        value={String(state.ai.custom.model.maxTokens)}
                        onValueChange={(v) =>
                          setState((s) => ({
                            ...s,
                            ai: {
                              ...s.ai,
                              custom: {
                                ...s.ai.custom,
                                model: { ...s.ai.custom.model, maxTokens: asInt(v, 8192) },
                              },
                            },
                          }))
                        }
                        variant="bordered"
                        min={1}
                      />
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4">
                      <Switch
                        isSelected={state.ai.custom.model.reasoning}
                        onValueChange={(v) =>
                          setState((s) => ({
                            ...s,
                            ai: {
                              ...s.ai,
                              custom: {
                                ...s.ai.custom,
                                model: { ...s.ai.custom.model, reasoning: v },
                              },
                            },
                          }))
                        }
                      >
                        reasoning
                      </Switch>
                      <div className="flex items-center gap-4">
                        <Checkbox
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

                    <div className="text-xs text-default-700 dark:text-default-500">
                      Primary model id will be:{' '}
                      <Code className="px-1 py-0.5">
                        {`${state.ai.custom.providerId || 'custom-proxy'}/${state.ai.custom.model.id || 'model'}`}
                      </Code>
                    </div>
                  </div>
                )}
              </CardBody>
            </Card>

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
                      setState((s) => ({ ...s, gateway: { ...s.gateway, port: asInt(v, 18789) } }))
                    }
                    variant="bordered"
                    min={1}
                    max={65535}
                  />

                  <Select
                    label="Bind mode"
                    selectedKeys={[state.gateway.bind]}
                    onSelectionChange={(keys) => {
                      if (keys === 'all') return;
                      const bind = [...keys][0] as GatewayBindMode | undefined;
                      if (!bind) return;
                      setState((s) => ({ ...s, gateway: { ...s.gateway, bind } }));
                    }}
                    variant="bordered"
                  >
                    {bindOptions.map((o) => (
                      <SelectItem key={o.key} description={o.hint}>
                        {o.label}
                      </SelectItem>
                    ))}
                  </Select>
                </div>

                {state.gateway.bind === 'custom' && (
                  <Input
                    label="customBindHost"
                    placeholder="203.0.113.10"
                    value={state.gateway.customBindHost}
                    onValueChange={(v) =>
                      setState((s) => ({ ...s, gateway: { ...s.gateway, customBindHost: v } }))
                    }
                    variant="bordered"
                  />
                )}

                {state.gateway.bind !== 'loopback' && (
                  <Alert
                    color="warning"
                    title="Public binding risk"
                    description="If you bind beyond loopback on a public host, lock down Gateway auth and network exposure."
                  />
                )}
              </CardBody>
            </Card>

            <Card>
              <CardBody className="gap-5">
                <div>
                  <h2 className="text-xl font-bold">Channels</h2>
                  <p className="text-sm text-default-700 dark:text-default-500">
                    Pick the messaging channels you want to enable.
                  </p>
                </div>

                <div className="grid sm:grid-cols-2 gap-3">
                  <Checkbox
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
                        title='Telegram DM policy is "open"'
                        description='Anyone can DM your bot and trigger the agent. OpenClaw requires allowFrom to include "*".'
                      />
                    )}

                    <RadioGroup
                      label={
                        <span className="inline-flex items-center gap-1">
                          DM policy
                          <Tooltip content="Controls inbound Telegram DMs (channels.telegram.dmPolicy).">
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

                    {state.secretsMode === 'inline' ? (
                      <Input
                        label="botToken"
                        placeholder="123456:ABCDEF..."
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
                      />
                    ) : (
                      <Alert
                        color="default"
                        title="Token via env var"
                        description="Set TELEGRAM_BOT_TOKEN in your environment (env wins over config)."
                      />
                    )}

                    {(state.channels.telegram.dmPolicy === 'allowlist' ||
                      state.channels.telegram.dmPolicy === 'open' ||
                      !!state.channels.telegram.allowFromRaw.trim()) && (
                      <div className="space-y-1">
                        <Textarea
                          label={
                            <span className="inline-flex items-center gap-1">
                              allowFrom
                              <Tooltip content='Optional allowlist for Telegram DMs. For dmPolicy="open", include "*".'>
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
                            Required: include <Code className="px-1 py-0.5">*</Code> in allowFrom
                            for dmPolicy=&quot;open&quot;.
                          </p>
                        )}
                        {state.channels.telegram.dmPolicy === 'allowlist' &&
                          !state.channels.telegram.allowFromRaw.trim() && (
                            <p className="text-xs text-warning">
                              Required for dmPolicy=&quot;allowlist&quot; (example:{' '}
                              <Code className="px-1 py-0.5">tg:123</Code>).
                            </p>
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
                        title='WhatsApp DM policy is "open"'
                        description="Anyone who can DM this number can trigger the agent. Use allowlists unless you fully trust the exposure."
                      />
                    )}

                    <RadioGroup
                      label={
                        <span className="inline-flex items-center gap-1">
                          DM policy
                          <Tooltip content="Controls inbound WhatsApp DMs (channels.whatsapp.dmPolicy).">
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

                    {(state.channels.whatsapp.dmPolicy === 'allowlist' ||
                      !!state.channels.whatsapp.allowFromRaw.trim()) && (
                      <div className="space-y-1">
                        <Textarea
                          label={
                            <span className="inline-flex items-center gap-1">
                              allowFrom
                              <Tooltip content="WhatsApp allowlist (E.164). Required when dmPolicy=allowlist.">
                                <span className="inline-flex items-center text-default-500 cursor-help pointer-events-auto">
                                  <IconInfoSolid className="w-4 h-4" aria-hidden="true" />
                                </span>
                              </Tooltip>
                            </span>
                          }
                          classNames={{ label: 'pointer-events-auto' }}
                          placeholder={'+15551234567\n+15557654321'}
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
                        {state.channels.whatsapp.dmPolicy === 'allowlist' &&
                          !state.channels.whatsapp.allowFromRaw.trim() && (
                            <p className="text-xs text-warning">
                              Required for dmPolicy=&quot;allowlist&quot; (example:{' '}
                              <Code className="px-1 py-0.5">+15551234567</Code>).
                            </p>
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
                        title='Discord DM policy is "open"'
                        description="Anyone can DM the bot and trigger the agent. Consider allowlist or pairing for safety."
                      />
                    )}

                    <RadioGroup
                      label={
                        <span className="inline-flex items-center gap-1">
                          DM policy
                          <Tooltip content="Controls inbound Discord DMs (channels.discord.dm.policy).">
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

                    {state.secretsMode === 'inline' ? (
                      <Input
                        label="token"
                        placeholder="DISCORD_BOT_TOKEN..."
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
                      />
                    ) : (
                      <Alert
                        color="default"
                        title="Token via env var"
                        description="Set DISCORD_BOT_TOKEN in your environment (env wins over config)."
                      />
                    )}

                    {(state.channels.discord.dmPolicy === 'allowlist' ||
                      !!state.channels.discord.allowFromRaw.trim()) && (
                      <div className="space-y-1">
                        <Textarea
                          label={
                            <span className="inline-flex items-center gap-1">
                              dm.allowFrom
                              <Tooltip content="Optional DM allowlist (Discord user IDs). Required when dmPolicy=allowlist.">
                                <span className="inline-flex items-center text-default-500 cursor-help pointer-events-auto">
                                  <IconInfoSolid className="w-4 h-4" aria-hidden="true" />
                                </span>
                              </Tooltip>
                            </span>
                          }
                          classNames={{ label: 'pointer-events-auto' }}
                          placeholder={'123456789012345678\n987654321098765432'}
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
                        {state.channels.discord.dmPolicy === 'allowlist' &&
                          !state.channels.discord.allowFromRaw.trim() && (
                            <p className="text-xs text-warning">
                              Required for dmPolicy=&quot;allowlist&quot; (Discord user IDs).
                            </p>
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
                        title='Slack DM policy is "open"'
                        description="Anyone in the workspace can DM the bot and trigger the agent. Consider allowlist or pairing for safety."
                      />
                    )}

                    <RadioGroup
                      label={
                        <span className="inline-flex items-center gap-1">
                          DM policy
                          <Tooltip content="Controls inbound Slack DMs (channels.slack.dm.policy).">
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

                    {state.secretsMode === 'inline' ? (
                      <div className="grid sm:grid-cols-2 gap-4">
                        <Input
                          label="botToken"
                          placeholder="xoxb-..."
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
                        />
                        <Input
                          label="appToken (socket)"
                          placeholder="xapp-..."
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
                        />
                      </div>
                    ) : (
                      <Alert
                        color="default"
                        title="Tokens via env vars"
                        description="Set SLACK_BOT_TOKEN and SLACK_APP_TOKEN in your environment (env wins over config)."
                      />
                    )}

                    {(state.channels.slack.dmPolicy === 'allowlist' ||
                      !!state.channels.slack.allowFromRaw.trim()) && (
                      <div className="space-y-1">
                        <Textarea
                          label={
                            <span className="inline-flex items-center gap-1">
                              dm.allowFrom
                              <Tooltip content="Optional DM allowlist (Slack user IDs). Required when dmPolicy=allowlist.">
                                <span className="inline-flex items-center text-default-500 cursor-help pointer-events-auto">
                                  <IconInfoSolid className="w-4 h-4" aria-hidden="true" />
                                </span>
                              </Tooltip>
                            </span>
                          }
                          classNames={{ label: 'pointer-events-auto' }}
                          placeholder={'U012ABCDEF\nU045GHIJKL'}
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
                        {state.channels.slack.dmPolicy === 'allowlist' &&
                          !state.channels.slack.allowFromRaw.trim() && (
                            <p className="text-xs text-warning">
                              Required for dmPolicy=&quot;allowlist&quot; (Slack user IDs).
                            </p>
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
                    <h2 className="text-xl font-bold">Preview</h2>
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

                {state.secretsMode === 'env' && result.requiredEnvVars.length > 0 && (
                  <Card className="bg-content2">
                    <CardBody className="gap-2">
                      <div className="flex items-center gap-2 text-sm font-semibold">
                        <IconWarning className="w-4 h-4" aria-hidden="true" />
                        Required env vars
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {result.requiredEnvVars.map((k) => (
                          <Code key={k} className="px-2 py-1">
                            {k}
                          </Code>
                        ))}
                      </div>
                      <p className="text-xs text-default-700 dark:text-default-500">
                        You selected “Keep secrets out of JSON”, so tokens are expected via env
                        vars.
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
