import type {
  DmPolicy,
  GatewayAuthMode,
  GatewayBindMode,
  GroupPolicy,
  OpenClawConfigGeneratorState,
  ToolsProfile,
} from './generator';

export type GeneratorPresetId = 'personal' | 'developer' | 'message' | 'remote' | 'full' | 'custom';

export type RiskLevel = 'low' | 'medium' | 'high';
export type PresetUiSchema = {
  showModelTuning: boolean;
  showModelFallbacks: boolean;
  showGateway: boolean;
  showGatewayNetworkControls: boolean;
  showGatewayPasswordAuth: boolean;
  showGroupControls: boolean;
  showMentionControls: boolean;
};

export type PresetDefinition = {
  id: GeneratorPresetId;
  tabLabel: string;
  title: string;
  audience: string;
  summary: string;
  caution?: string;
  risk: RiskLevel;
  ui: PresetUiSchema;
};

type DerivedPolicy = {
  toolsProfile: ToolsProfile;
  toolsAllow: string[];
  toolsDeny: string[];
  sandboxMode: 'non-main' | 'off';
  sandboxToolsAllow: string[];
  sandboxToolsDeny: string[];
  gatewayBind: GatewayBindMode;
  gatewayAuthMode: GatewayAuthMode;
  defaultDmPolicy: DmPolicy;
  defaultGroupPolicy: GroupPolicy;
  requireMentionInGroups: boolean;
};

const PERSONAL_ALLOW = ['group:web', 'browser', 'pdf'];
const FRIENDLY_MESSAGE_ALLOW = ['group:fs', 'group:runtime'];
const FRIENDLY_SAFE_DENY = ['browser', 'cron'];
const LIGHT_SAFE_DENY = ['cron'];
const PRESET_SANDBOX_ALLOW = [
  'bash',
  'process',
  'read',
  'write',
  'edit',
  'sessions_list',
  'sessions_history',
  'sessions_send',
  'sessions_spawn',
];
const PRESET_SANDBOX_DENY = ['browser', 'canvas', 'nodes', 'cron', 'discord', 'gateway'];

export const PRESET_DEFINITIONS: Record<GeneratorPresetId, PresetDefinition> = {
  personal: {
    id: 'personal',
    tabLabel: 'Personal',
    title: 'Personal Assistant',
    audience: 'Best for everyday personal help on your own machine.',
    summary: 'A chat-first everyday assistant with web, browser, and PDF help ready to use.',
    caution:
      'Best when you want OpenClaw to feel like an everyday assistant for research, reading, and personal tasks.',
    risk: 'low',
    ui: {
      showModelTuning: false,
      showModelFallbacks: false,
      showGateway: false,
      showGatewayNetworkControls: false,
      showGatewayPasswordAuth: false,
      showGroupControls: false,
      showMentionControls: false,
    },
  },
  developer: {
    id: 'developer',
    tabLabel: 'Developer',
    title: 'Developer Assistant',
    audience: 'Best for coding, debugging, and hands-on work on your own machine.',
    summary: 'Best for coding, file editing, and running commands on your own machine.',
    caution:
      'Use this when you want OpenClaw to behave like a real coding assistant, not just a chat bot.',
    risk: 'medium',
    ui: {
      showModelTuning: false,
      showModelFallbacks: false,
      showGateway: true,
      showGatewayNetworkControls: false,
      showGatewayPasswordAuth: false,
      showGroupControls: false,
      showMentionControls: false,
    },
  },
  message: {
    id: 'message',
    tabLabel: 'Message',
    title: 'Messaging Assistant',
    audience: 'Best for chats, bots, and messaging-first workflows.',
    summary:
      'Best for chat and bot workflows, while still allowing basic file and command help when needed.',
    caution:
      'Shared spaces are higher risk. Keep who can trigger this assistant narrow, and leave reply-only-when-mentioned on unless you want broader reach.',
    risk: 'medium',
    ui: {
      showModelTuning: false,
      showModelFallbacks: false,
      showGateway: false,
      showGatewayNetworkControls: false,
      showGatewayPasswordAuth: false,
      showGroupControls: true,
      showMentionControls: false,
    },
  },
  remote: {
    id: 'remote',
    tabLabel: 'Remote',
    title: 'Remote Access Assistant',
    audience: 'Best for VPS, homelab, and remote machine access.',
    summary:
      'Best for VPS and remote setups where you need OpenClaw to be reachable securely from outside your local machine.',
    caution: 'Choose this when remote access matters more than keeping everything local-only.',
    risk: 'medium',
    ui: {
      showModelTuning: false,
      showModelFallbacks: false,
      showGateway: true,
      showGatewayNetworkControls: true,
      showGatewayPasswordAuth: true,
      showGroupControls: false,
      showMentionControls: false,
    },
  },
  full: {
    id: 'full',
    tabLabel: 'Full',
    title: 'Full Access Assistant',
    audience: 'Best for trusted personal setups where you want the broadest default capabilities.',
    summary: 'Gives OpenClaw the broadest default capabilities for trusted personal setups.',
    caution: 'Use this only on machines and accounts you fully trust.',
    risk: 'high',
    ui: {
      showModelTuning: false,
      showModelFallbacks: false,
      showGateway: true,
      showGatewayNetworkControls: false,
      showGatewayPasswordAuth: false,
      showGroupControls: false,
      showMentionControls: false,
    },
  },
  custom: {
    id: 'custom',
    tabLabel: 'Custom',
    title: 'Custom Starting Point',
    audience: 'Best when you want to shape OpenClaw around your own workflow.',
    summary:
      'Start from a flexible base when you want to tune the important OpenClaw behaviors yourself.',
    caution:
      'Choose this when none of the presets feel quite right for the assistant experience you want.',
    risk: 'medium',
    ui: {
      showModelTuning: true,
      showModelFallbacks: true,
      showGateway: true,
      showGatewayNetworkControls: true,
      showGatewayPasswordAuth: false,
      showGroupControls: true,
      showMentionControls: true,
    },
  },
};

export function derivePolicyFromPreset(id: GeneratorPresetId): DerivedPolicy {
  switch (id) {
    case 'personal':
      return {
        toolsProfile: 'coding',
        toolsAllow: PERSONAL_ALLOW,
        toolsDeny: LIGHT_SAFE_DENY,
        sandboxMode: 'non-main',
        sandboxToolsAllow: PRESET_SANDBOX_ALLOW,
        sandboxToolsDeny: PRESET_SANDBOX_DENY,
        gatewayBind: 'loopback',
        gatewayAuthMode: 'token',
        defaultDmPolicy: 'pairing',
        defaultGroupPolicy: 'allowlist',
        requireMentionInGroups: true,
      };
    case 'message':
      return {
        toolsProfile: 'messaging',
        toolsAllow: FRIENDLY_MESSAGE_ALLOW,
        toolsDeny: FRIENDLY_SAFE_DENY,
        sandboxMode: 'non-main',
        sandboxToolsAllow: PRESET_SANDBOX_ALLOW,
        sandboxToolsDeny: PRESET_SANDBOX_DENY,
        gatewayBind: 'loopback',
        gatewayAuthMode: 'token',
        defaultDmPolicy: 'pairing',
        defaultGroupPolicy: 'allowlist',
        requireMentionInGroups: true,
      };
    case 'full':
      return {
        toolsProfile: 'full',
        toolsAllow: [],
        toolsDeny: [],
        sandboxMode: 'non-main',
        sandboxToolsAllow: PRESET_SANDBOX_ALLOW,
        sandboxToolsDeny: PRESET_SANDBOX_DENY,
        gatewayBind: 'loopback',
        gatewayAuthMode: 'token',
        defaultDmPolicy: 'pairing',
        defaultGroupPolicy: 'allowlist',
        requireMentionInGroups: true,
      };
    case 'remote':
      return {
        toolsProfile: 'coding',
        toolsAllow: [],
        toolsDeny: FRIENDLY_SAFE_DENY,
        sandboxMode: 'non-main',
        sandboxToolsAllow: PRESET_SANDBOX_ALLOW,
        sandboxToolsDeny: PRESET_SANDBOX_DENY,
        gatewayBind: 'loopback',
        gatewayAuthMode: 'token',
        defaultDmPolicy: 'pairing',
        defaultGroupPolicy: 'allowlist',
        requireMentionInGroups: true,
      };
    case 'developer':
      return {
        toolsProfile: 'coding',
        toolsAllow: [],
        toolsDeny: FRIENDLY_SAFE_DENY,
        sandboxMode: 'non-main',
        sandboxToolsAllow: PRESET_SANDBOX_ALLOW,
        sandboxToolsDeny: PRESET_SANDBOX_DENY,
        gatewayBind: 'loopback',
        gatewayAuthMode: 'token',
        defaultDmPolicy: 'pairing',
        defaultGroupPolicy: 'allowlist',
        requireMentionInGroups: true,
      };
    case 'custom':
    default:
      return {
        toolsProfile: 'coding',
        toolsAllow: [],
        toolsDeny: [],
        sandboxMode: 'non-main',
        sandboxToolsAllow: PRESET_SANDBOX_ALLOW,
        sandboxToolsDeny: PRESET_SANDBOX_DENY,
        gatewayBind: 'loopback',
        gatewayAuthMode: 'token',
        defaultDmPolicy: 'pairing',
        defaultGroupPolicy: 'allowlist',
        requireMentionInGroups: true,
      };
  }
}

export function applyPresetToState(
  state: OpenClawConfigGeneratorState,
  presetId: GeneratorPresetId
): OpenClawConfigGeneratorState {
  const policy = derivePolicyFromPreset(presetId);
  return {
    ...state,
    toolsProfile: policy.toolsProfile,
    toolsAllow: [...policy.toolsAllow],
    toolsDeny: [...policy.toolsDeny],
    sandboxMode: policy.sandboxMode,
    sandboxToolsAllow: [...policy.sandboxToolsAllow],
    sandboxToolsDeny: [...policy.sandboxToolsDeny],
    gateway: {
      ...state.gateway,
      bind: policy.gatewayBind,
      authMode: policy.gatewayAuthMode,
      customBindHost: policy.gatewayBind === 'custom' ? state.gateway.customBindHost : '',
    },
    channels: {
      telegram: {
        ...state.channels.telegram,
        dmPolicy: policy.defaultDmPolicy,
        groupPolicy: policy.defaultGroupPolicy,
        groupRequireMention: policy.requireMentionInGroups,
      },
      whatsapp: {
        ...state.channels.whatsapp,
        dmPolicy: policy.defaultDmPolicy,
        groupPolicy: policy.defaultGroupPolicy,
        groupRequireMention: policy.requireMentionInGroups,
      },
      discord: {
        ...state.channels.discord,
        dmPolicy: policy.defaultDmPolicy,
        groupPolicy: policy.defaultGroupPolicy,
        guildRequireMention: policy.requireMentionInGroups,
      },
      slack: {
        ...state.channels.slack,
        dmPolicy: policy.defaultDmPolicy,
        groupPolicy: policy.defaultGroupPolicy,
        channelRequireMention: policy.requireMentionInGroups,
      },
    },
  };
}
