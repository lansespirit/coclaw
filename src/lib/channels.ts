export type ChannelTone = 'primary' | 'secondary' | 'accent' | 'success' | 'warning' | 'danger';

export type ChannelIconKey = 'telegram' | 'whatsapp' | 'slack' | 'discord' | 'generic';

export type ChannelBlueprintKind = 'core' | 'plugin' | 'legacy' | 'recommended' | 'browser';

export interface ChannelBlueprint {
  slug: string;
  title: string;
  strapline: string;
  summary: string;
  playbookEyebrow: string;
  playbookTitle: string;
  playbookIntro: string;
  watchLabel: string;
  watchTitle: string;
  authModel: string;
  safetyNote: string;
  operatingMode: string;
  complexity: string;
  warning: string;
  verificationHint: string;
  bestUseCase: string;
  checklist: string[];
  focusAreas: string[];
  tone: ChannelTone;
  iconKey: ChannelIconKey;
  kind: ChannelBlueprintKind;
  kindLabel: string;
}

export const channelBlueprints: ChannelBlueprint[] = [
  {
    slug: 'bluebubbles',
    title: 'BlueBubbles',
    strapline:
      'The preferred iMessage route when you want native Apple reach without leaning on legacy glue.',
    summary:
      'BlueBubbles for OpenClaw covers macOS server setup, REST connectivity, pairing boundaries, and advanced messaging behaviors for Apple-centric workflows.',
    playbookEyebrow: 'Recommended iMessage path',
    playbookTitle: 'Run iMessage through the BlueBubbles Mac, not the legacy bridge.',
    playbookIntro:
      'BlueBubbles gives OpenClaw the richer iMessage lane with webhooks inbound, REST outbound, pairing controls, and advanced actions like tapbacks, replies, edits, and group management.',
    watchLabel: 'Watch the Mac',
    watchTitle:
      'Monitor webhook auth, Messages.app staying responsive, and macOS version drift because Tahoe already breaks edit and can desync group icon updates.',
    authModel: 'BlueBubbles server credentials + trusted macOS host',
    safetyNote:
      'Treat the Mac host and BlueBubbles server as production infrastructure, not a casual desktop toggle.',
    operatingMode: 'Recommended Apple-device rollout with host stability first',
    complexity: '30–45 min setup',
    warning:
      'Host sleep, macOS upgrades, or BlueBubbles server drift can quietly degrade delivery and reactions.',
    verificationHint:
      'Confirm send, receive, reactions, and one group conversation after the Mac host has been idle and reawakened.',
    bestUseCase:
      'Teams or individuals who want modern iMessage support with richer capabilities than legacy imsg.',
    checklist: [
      'Prepare a dedicated or reliable macOS host before treating the lane as production-ready.',
      'Verify BlueBubbles server reachability, local persistence, and restart behavior.',
      'Test direct threads, group chats, reactions, and reconnect behavior separately.',
      'Document the host maintenance plan before upgrading macOS or BlueBubbles.',
    ],
    focusAreas: [
      'bluebubbles server',
      'macOS host',
      'iMessage delivery',
      'reactions',
      'host uptime',
    ],
    tone: 'primary',
    iconKey: 'generic',
    kind: 'recommended',
    kindLabel: 'Recommended Integration',
  },
  {
    slug: 'discord',
    title: 'Discord',
    strapline: 'Community-scale presence with nuanced intents, roles, and moderation boundaries.',
    summary:
      'Discord Bot setup for OpenClaw: gateway intents, role permissions, DM versus guild behavior, verification drills, and moderation-aware rollout patterns.',
    playbookEyebrow: 'Discord Bot',
    playbookTitle: 'Turn a private server into a real workspace.',
    playbookIntro:
      'Discord is ready for DMs and guild channels, with DM pairing first and a recommended guild workspace where each channel keeps its own session.',
    watchLabel: 'Watch guild access',
    watchTitle:
      'Guild channels need the right allowlist and, by default, an @mention before the bot responds.',
    authModel: 'Bot token + gateway intents + guild roles',
    safetyNote:
      'Make intents and role scope explicit before the bot ever lands in a shared server.',
    operatingMode: 'Community deployment with moderation-aware defaults',
    complexity: '25–40 min setup',
    warning:
      'Missing intents and weak role positioning often look like random silence unless the guide teaches the distinction clearly.',
    verificationHint:
      'Walk through DM, guild text channel, and restricted-channel tests before inviting a broader community.',
    bestUseCase:
      'Developer communities, support servers, and teams that need visible bot presence without surrendering moderation control.',
    checklist: [
      'Enable only the intents required for the workflows you plan to ship.',
      'Place the bot role correctly relative to channels, threads, and moderation actions.',
      'Test mention handling, slash commands, and file delivery as separate flows.',
      'Define what the bot should never do in public channels before rollout.',
    ],
    focusAreas: [
      'gateway intents',
      'guild roles',
      'slash commands',
      'moderation',
      'channel permissions',
    ],
    tone: 'accent',
    iconKey: 'discord',
    kind: 'core',
    kindLabel: 'Core Channel',
  },
  {
    slug: 'feishu',
    title: 'Feishu',
    strapline: 'A Lark/Feishu lane for teams that want enterprise chat on a plugin track.',
    summary:
      'Feishu integration for OpenClaw focuses on plugin installation, WebSocket bot setup, tenant permissions, verification, and team rollout hygiene.',
    playbookEyebrow: 'Feishu over long connection',
    playbookTitle: 'Run a Feishu or Lark bot without putting a public webhook on the edge.',
    playbookIntro:
      'OpenClaw uses Feishu’s WebSocket event subscription, defaults DMs to pairing, and requires @mentions in groups unless you relax the policy.',
    watchLabel: 'Watch the long connection',
    watchTitle:
      'Watch Feishu stay on its long connection while the gateway routes replies back to the same DM or group context.',
    authModel: 'Installed plugin + tenant app credentials + WebSocket bot config',
    safetyNote:
      'Treat tenant-level permissions and app scopes as part of the rollout plan, not a one-time form fill.',
    operatingMode: 'Plugin-backed enterprise deployment',
    complexity: '30–45 min setup',
    warning:
      'Plugin installation drift and tenant permission mismatches can stall the bot before the first message lands.',
    verificationHint:
      'Validate plugin registration, bot connectivity, and one message round-trip inside the intended tenant workspace.',
    bestUseCase:
      'Organizations already standardized on Lark/Feishu that want OpenClaw inside internal workflows.',
    checklist: [
      'Install the channel plugin and record the plugin version alongside the tenant app settings.',
      'Verify bot credentials, tenant visibility, and event delivery before inviting real users.',
      'Run one DM and one shared-space test to separate permission issues from transport issues.',
      'Add recovery notes for plugin upgrades or tenant-side policy changes.',
    ],
    focusAreas: [
      'plugin install',
      'tenant app',
      'websocket bot',
      'workspace permissions',
      'enterprise rollout',
    ],
    tone: 'secondary',
    iconKey: 'generic',
    kind: 'plugin',
    kindLabel: 'Community Plugin',
  },
  {
    slug: 'googlechat',
    title: 'Google Chat',
    strapline: 'Workspace-native messaging for teams already living inside Google Chat.',
    summary:
      'Google Chat setup for OpenClaw covers Chat API apps, webhook delivery, workspace permissions, and a clean verification path for internal rollouts.',
    playbookEyebrow: 'Google Workspace Chat app',
    playbookTitle: 'Wire Google Chat to a public webhook and keep exposure to one path.',
    playbookIntro:
      'This channel is ready for DMs and spaces over HTTP, verifies bearer audiences, pairs DMs by default, and treats spaces as mention-gated.',
    watchLabel: 'Watch the webhook path',
    watchTitle:
      'Watch Google Chat land on `/googlechat`, pass audience checks, and route cleanly by DM or space.',
    authModel: 'Google Chat app credentials + HTTP webhook configuration',
    safetyNote:
      'Align Google Workspace permissions with the smallest audience possible before widening room access.',
    operatingMode: 'Internal workspace deployment with webhook discipline',
    complexity: '25–35 min setup',
    warning:
      'Misconfigured app visibility or webhook assumptions can look like total transport failure.',
    verificationHint:
      'Verify app install state, one direct conversation, and one room-based message flow before going broad.',
    bestUseCase:
      'Google Workspace teams that need internal assistant workflows without another chat surface.',
    checklist: [
      'Create the Chat app in the right workspace and document which org policies affect it.',
      'Verify webhook targets and workspace visibility before testing content behavior.',
      'Test DM and room behaviors separately so permission and routing issues stay distinct.',
      'Capture admin dependencies for future workspace transfers or policy changes.',
    ],
    focusAreas: ['workspace app', 'http webhook', 'chat api', 'room access', 'google workspace'],
    tone: 'primary',
    iconKey: 'generic',
    kind: 'core',
    kindLabel: 'Core Channel',
  },
  {
    slug: 'imessage',
    title: 'iMessage',
    strapline:
      'The legacy iMessage route is still documentable, but new setups should bias toward BlueBubbles.',
    summary:
      'Legacy iMessage support for OpenClaw via imsg: transition guidance, risk notes, verification expectations, and when to prefer BlueBubbles instead.',
    playbookEyebrow: 'Legacy iMessage lane',
    playbookTitle: 'Treat `imsg` as a compatibility bridge and point new operators to BlueBubbles.',
    playbookIntro:
      'This path runs `imsg rpc` over stdio with no separate daemon, but it depends on macOS Messages access, Full Disk Access, Automation approval, and careful pairing and group gating.',
    watchLabel: 'Watch the bridge',
    watchTitle:
      'Check that `imsg` still exposes RPC, the gateway process context still has macOS permissions, and remote attachment fetches still clear SSH and path checks.',
    authModel: 'Local macOS host + imsg CLI / JSON-RPC bridge',
    safetyNote:
      'Present this lane as a migration or compatibility path, not the default recommendation.',
    operatingMode: 'Legacy maintenance and transition planning',
    complexity: 'Legacy path',
    warning:
      'This route can accumulate hidden host assumptions and becomes costly to maintain compared with BlueBubbles.',
    verificationHint:
      'If you keep legacy iMessage, test send/receive after restarts and document the migration path to BlueBubbles.',
    bestUseCase:
      'Operators maintaining an older setup that cannot move to BlueBubbles immediately.',
    checklist: [
      'Make the transition recommendation to BlueBubbles explicit near the top of the guide.',
      'Verify the current imsg bridge still behaves predictably after host restarts.',
      'Record every local dependency required to keep the lane alive.',
      'Define the decision point for retiring the legacy path.',
    ],
    focusAreas: ['imsg cli', 'legacy bridge', 'macOS host', 'migration path', 'maintenance risk'],
    tone: 'warning',
    iconKey: 'generic',
    kind: 'legacy',
    kindLabel: 'Legacy Integration',
  },
  {
    slug: 'irc',
    title: 'IRC',
    strapline: 'Minimal interface, maximal need for explicit access controls.',
    summary:
      'IRC for OpenClaw focuses on server connectivity, nick identity, channel versus DM rules, and allowlist-first operation on classic networks.',
    playbookEyebrow: 'Classic network discipline',
    playbookTitle:
      'IRC works best when channel access, sender access, and mention gating stay explicitly separate.',
    playbookIntro:
      'OpenClaw’s IRC lane is core and straightforward, but it expects stable sender identities like `nick!user@host`, pairing for DMs by default, and allowlist-first handling for channels.',
    watchLabel: 'Watch the gates',
    watchTitle:
      'Most silent failures are policy decisions, so verify `groupPolicy`, channel allowlists, sender allowlists, and whether mention gating is still required in the room.',
    authModel: 'IRC server connection + nick identity + channel access rules',
    safetyNote: 'On IRC, allowlists and pairing posture matter more than visual onboarding polish.',
    operatingMode: 'Text-first operations with strict routing controls',
    complexity: '20–35 min setup',
    warning:
      'A loose allowlist can expose the bot to noisy public channels faster than operators expect.',
    verificationHint:
      'Test DM flow, one private channel, and one public-but-controlled room before trusting broader access.',
    bestUseCase:
      'Self-hosters and long-lived communities that still operate on IRC or bridge from it.',
    checklist: [
      'Define nick, server, and channel scope before connecting to public networks.',
      'Set pairing or allowlist rules early so first contact is not first exposure.',
      'Test DM and channel behavior independently because policies often differ.',
      'Document reconnect and rate-limit assumptions for the chosen network.',
    ],
    focusAreas: ['irc server', 'nick identity', 'allowlist', 'pairing', 'dm versus channel'],
    tone: 'warning',
    iconKey: 'generic',
    kind: 'core',
    kindLabel: 'Core Channel',
  },
  {
    slug: 'line',
    title: 'LINE',
    strapline:
      'A plugin lane for teams targeting LINE without flattening everything into webhook boilerplate.',
    summary:
      'LINE Messaging API setup for OpenClaw: plugin installation, webhook wiring, channel credentials, verification drills, and rollout notes for supported regions.',
    playbookEyebrow: 'Messaging API webhook',
    playbookTitle:
      'Run LINE as a verified webhook channel with richer cards only after plain text is stable.',
    playbookIntro:
      'The LINE plugin supports DMs, groups, media, locations, Flex messages, template messages, and quick replies, while reactions and threads remain out of scope.',
    watchLabel: 'Watch the webhook',
    watchTitle:
      'Keep the HTTPS webhook path, raw-body signature verification, and media size limits aligned because those are the first places LINE delivery breaks.',
    authModel: 'Installed plugin + LINE Messaging API credentials + webhook endpoint',
    safetyNote:
      'Respect webhook integrity and account boundaries before adding richer templates or menu actions.',
    operatingMode: 'Plugin-backed regional bot deployment',
    complexity: '25–40 min setup',
    warning: 'Webhook misrouting and template limits can masquerade as generic delivery bugs.',
    verificationHint:
      'Validate webhook delivery, bot reply behavior, and one richer message surface after the first text round-trip.',
    bestUseCase:
      'Operators serving LINE-heavy audiences who need a proper OpenClaw lane instead of an improvised bridge.',
    checklist: [
      'Install the plugin and record the LINE channel credentials used for each environment.',
      'Confirm webhook verification before testing any interactive templates.',
      'Separate plain-text validation from richer menu or template behaviors.',
      'Document regional/account constraints that affect operations or support.',
    ],
    focusAreas: [
      'line messaging api',
      'webhook verify',
      'plugin install',
      'template limits',
      'regional rollout',
    ],
    tone: 'success',
    iconKey: 'generic',
    kind: 'plugin',
    kindLabel: 'Community Plugin',
  },
  {
    slug: 'matrix',
    title: 'Matrix',
    strapline:
      'Federated messaging needs a federated mindset: rooms, homeservers, and identity scope all matter.',
    summary:
      'Matrix support for OpenClaw covers plugin setup, homeserver credentials, room access, federation-aware verification, and operator notes for self-hosted deployments.',
    playbookEyebrow: 'Federated room operations',
    playbookTitle:
      'Matrix is strongest when homeserver identity, room policy, and encryption are treated as one operational surface.',
    playbookIntro:
      'The Matrix plugin supports DMs, rooms, threads, media, reactions, polls, location, and optional E2EE, with replies always routed back to Matrix and allowlists keyed to full Matrix IDs.',
    watchLabel: 'Watch identity and crypto',
    watchTitle:
      'Verify the homeserver token, room and user ID resolution, invite and auto-join behavior, and device verification whenever encryption is enabled.',
    authModel: 'Installed plugin + Matrix homeserver credentials + room access policy',
    safetyNote:
      'Document which homeserver, rooms, and federation assumptions define trust for this rollout.',
    operatingMode: 'Plugin-backed federated deployment',
    complexity: '35–50 min setup',
    warning:
      'Room membership, federation assumptions, and homeserver policy can break behavior without changing your OpenClaw config.',
    verificationHint:
      'Verify login, room joins, DM behavior, and one federated room path if that is part of the intended rollout.',
    bestUseCase:
      'Self-hosted or federated communities that want OpenClaw in a protocol-native environment.',
    checklist: [
      'Install the plugin and lock down the homeserver credentials you plan to operate.',
      'Verify DM and room behavior separately across the target homeserver topology.',
      'Test a federated room only if federation is part of the actual deployment target.',
      'Record homeserver-side dependencies so future operators can debug the right layer.',
    ],
    focusAreas: ['homeserver', 'matrix rooms', 'plugin install', 'federation', 'room joins'],
    tone: 'secondary',
    iconKey: 'generic',
    kind: 'plugin',
    kindLabel: 'Community Plugin',
  },
  {
    slug: 'mattermost',
    title: 'Mattermost',
    strapline: 'Self-hosted team chat with a stronger ops flavor than consumer messaging apps.',
    summary:
      'Mattermost for OpenClaw covers plugin installation, bot tokens, WebSocket behavior, channel permissions, and verification for self-hosted internal teams.',
    playbookEyebrow: 'Self-hosted team chat',
    playbookTitle:
      'Mattermost is a plugin lane where bot scope, chat mode, and callback reachability decide whether the channel feels solid.',
    playbookIntro:
      'OpenClaw supports Mattermost DMs and channels over bot token plus WebSocket events, with optional native slash commands, reactions, and interactive buttons.',
    watchLabel: 'Watch callbacks and mode',
    watchTitle:
      'Confirm the bot is in the channel, `chatmode` matches operator intent, and every slash-command or button callback is reachable from Mattermost with valid HMAC and alphanumeric action IDs.',
    authModel: 'Installed plugin + bot token + WebSocket / channel access config',
    safetyNote:
      'Treat self-hosted chat policy and bot scope as part of the same operational document.',
    operatingMode: 'Internal self-hosted collaboration rollout',
    complexity: '30–45 min setup',
    warning:
      'Permission drift between teams, channels, and the self-hosted server can obscure what actually failed.',
    verificationHint:
      'Test DM, channel, and reconnect behavior independently after the plugin and bot are both healthy.',
    bestUseCase:
      'Organizations already operating Mattermost and wanting assistant workflows inside their own perimeter.',
    checklist: [
      'Install the plugin and capture the Mattermost server version with the bot setup.',
      'Verify bot token scope and which teams/channels the bot can actually see.',
      'Run DM and channel delivery tests as separate approval points.',
      'Document server-side dependencies like WebSocket, reverse proxy, or self-hosted policy.',
    ],
    focusAreas: ['bot token', 'websocket', 'self-hosted chat', 'channel scope', 'plugin install'],
    tone: 'secondary',
    iconKey: 'generic',
    kind: 'plugin',
    kindLabel: 'Community Plugin',
  },
  {
    slug: 'msteams',
    title: 'Microsoft Teams',
    strapline: 'Enterprise messaging with identity, policy, and app-registration gravity.',
    summary:
      'Microsoft Teams support for OpenClaw covers plugin-backed Bot Framework setup, Azure app registration, tenant policy, and enterprise verification paths.',
    playbookEyebrow: 'Microsoft Teams plugin',
    playbookTitle: 'Bring Teams online through Azure Bot with the right defaults and caveats.',
    playbookIntro:
      'Teams supports DMs, group chats, and channels, defaults groups to allowlist plus mention gating, and needs SharePoint plus Graph permissions for channel or group file sends.',
    watchLabel: 'Watch `/api/messages`',
    watchTitle:
      'Watch Teams arrive on `/api/messages`, keep replies pinned to the same conversation, and surface the file-delivery caveats early.',
    authModel: 'Installed plugin + Bot Framework / Azure app credentials + tenant policy',
    safetyNote:
      'Treat Azure registration, tenant policy, and Teams app visibility as one combined deployment problem.',
    operatingMode: 'Enterprise plugin rollout with admin coordination',
    complexity: '40–60 min setup',
    warning:
      'Teams failures often originate in tenant policy or app registration, not the bot code path you test last.',
    verificationHint:
      'Verify tenant install, one direct chat, and one team/channel flow with the exact org policies you expect in production.',
    bestUseCase:
      'Enterprises operating heavily inside Microsoft 365 that need an internal assistant lane.',
    checklist: [
      'Install the plugin and keep Azure app registration details in the runbook.',
      'Confirm tenant admin approval and app visibility before testing content behavior.',
      'Separate personal chat validation from team/channel validation.',
      'Write down which Microsoft 365 policies can break the lane later.',
    ],
    focusAreas: ['azure app', 'bot framework', 'tenant policy', 'teams app', 'enterprise rollout'],
    tone: 'primary',
    iconKey: 'generic',
    kind: 'plugin',
    kindLabel: 'Community Plugin',
  },
  {
    slug: 'nextcloud-talk',
    title: 'Nextcloud Talk',
    strapline: 'A self-hosted collaboration lane that stays inside the Nextcloud perimeter.',
    summary:
      'Nextcloud Talk for OpenClaw covers plugin setup, server credentials, room access, and a verification path tuned for self-hosted teams.',
    playbookEyebrow: 'Nextcloud Talk webhook bot',
    playbookTitle: 'Set up Nextcloud Talk as a webhook bot with room rules that stay explicit.',
    playbookIntro:
      'This plugin supports direct messages, rooms, reactions, and markdown, but users must message first, media goes out as URLs, and rooms stay allowlisted and mention-gated by default.',
    watchLabel: 'Watch the Talk bot',
    watchTitle:
      'Watch a user-started Talk message enter the webhook flow, then verify how rooms, mentions, and URL-only media behave.',
    authModel: 'Installed plugin + Nextcloud Talk credentials + room policy',
    safetyNote: 'Document which server, rooms, and identity policy define the trust boundary.',
    operatingMode: 'Self-hosted collaboration rollout with room discipline',
    complexity: '25–40 min setup',
    warning:
      'Room-level access assumptions can drift after server upgrades or admin policy changes.',
    verificationHint:
      'Validate login, room delivery, and reconnect behavior on the exact self-hosted instance meant for production.',
    bestUseCase:
      'Privacy-conscious teams already standardized on Nextcloud for internal collaboration.',
    checklist: [
      'Install the plugin and record the exact Nextcloud Talk instance and credentials used.',
      'Verify room membership and message delivery before scaling to broader teams.',
      'Test reconnect and session persistence after one deliberate restart.',
      'Capture admin-side dependencies that affect bot visibility or delivery.',
    ],
    focusAreas: [
      'nextcloud talk',
      'self-hosted rooms',
      'plugin install',
      'room access',
      'session persistence',
    ],
    tone: 'success',
    iconKey: 'generic',
    kind: 'plugin',
    kindLabel: 'Community Plugin',
  },
  {
    slug: 'nostr',
    title: 'Nostr',
    strapline:
      'Encrypted decentralized messaging with fewer platform guarantees and more protocol intent.',
    summary:
      'Nostr DM support for OpenClaw covers plugin installation, NIP-04 assumptions, key management, relay behavior, and verification for decentralized operators.',
    playbookEyebrow: 'Optional plugin · NIP-04 DM rail',
    playbookTitle: 'Encrypted DMs on Nostr, treated as a deliberate operator lane.',
    playbookIntro:
      'Nostr keeps the lane narrow: encrypted NIP-04 DMs, relay-backed delivery, and sender policy enforced through pubkeys rather than usernames.',
    watchLabel: 'Protocol watch',
    watchTitle:
      'Keep relay scope and `dmPolicy` deliberate, because this channel is safest as a controlled DM rail rather than a public inbox.',
    authModel: 'Installed plugin + key material + relay configuration',
    safetyNote:
      'Key handling and relay selection are the actual product surface here, not just implementation details.',
    operatingMode: 'Protocol-native decentralized deployment',
    complexity: '30–45 min setup',
    warning:
      'Weak key hygiene or casual relay assumptions can undermine the privacy story the channel is chosen for.',
    verificationHint:
      'Verify relay connectivity, encrypted DM delivery, and one key-rotation or recovery scenario before trusting the lane.',
    bestUseCase:
      'Operators working in decentralized ecosystems who need OpenClaw on the same protocol plane.',
    checklist: [
      'Install the plugin and lock down key storage before testing user-facing delivery.',
      'Choose relays deliberately and record why they are acceptable for the use case.',
      'Test encrypted DM flow and one recovery path for key or relay issues.',
      'Document privacy assumptions so future changes do not silently violate them.',
    ],
    focusAreas: [
      'nip-04',
      'relay selection',
      'key management',
      'decentralized dm',
      'plugin install',
    ],
    tone: 'accent',
    iconKey: 'generic',
    kind: 'plugin',
    kindLabel: 'Community Plugin',
  },
  {
    slug: 'signal',
    title: 'Signal',
    strapline:
      'Private messaging with stronger trust expectations and more infrastructure ceremony.',
    summary:
      'Signal for OpenClaw covers signal-cli setup, linked-device expectations, number model decisions, safe rollout, and reliability testing for privacy-focused deployments.',
    playbookEyebrow: 'Signal via signal-cli',
    playbookTitle: 'More setup, but clean routing once it is online.',
    playbookIntro:
      'Signal runs through `signal-cli` over HTTP JSON-RPC and SSE, with pairing by default and a separate bot number strongly preferred.',
    watchLabel: 'Watch the number model',
    watchTitle:
      'If you run the bot on your personal Signal account, OpenClaw ignores your own messages for loop protection.',
    authModel: 'signal-cli linked device + local service paths + account identity',
    safetyNote:
      'Treat device linking, number ownership, and state persistence as first-class operational controls.',
    operatingMode: 'Privacy-first deployment with explicit host dependencies',
    complexity: '35–50 min setup',
    warning:
      'Signal issues often stem from device state, daemon health, or number model confusion rather than the message content path itself.',
    verificationHint:
      'Validate send, receive, daemon health, and restart recovery after the linked-device setup is complete.',
    bestUseCase:
      'Privacy-sensitive teams or operators who prioritize secure messaging over the fastest onboarding path.',
    checklist: [
      'Decide which phone number and linked-device model will own the lane before setup begins.',
      'Verify signal-cli installation, service health, and persistence on the target host.',
      'Test DM flow and one restart or reconnect scenario before wider rollout.',
      'Document operational ownership for number resets, relinks, or daemon failures.',
    ],
    focusAreas: [
      'signal-cli',
      'linked device',
      'daemon health',
      'number model',
      'restart recovery',
    ],
    tone: 'success',
    iconKey: 'generic',
    kind: 'core',
    kindLabel: 'Core Channel',
  },
  {
    slug: 'slack',
    title: 'Slack',
    strapline: 'Permission-heavy, team-native, and ideal for structured internal workflows.',
    summary:
      'Slack Bot setup for OpenClaw: scopes, Socket Mode or Events API behavior, thread policy, workspace rollout, and troubleshooting for silent bots.',
    playbookEyebrow: 'Slack App',
    playbookTitle: 'Operator-grade Slack starts with Socket Mode.',
    playbookIntro:
      'Slack is production-ready for DMs and channels, defaults to Socket Mode, and keeps channel traffic mention-gated unless you change policy.',
    watchLabel: 'Watch app wiring',
    watchTitle:
      'Socket Mode needs bot and app tokens, while HTTP mode needs a signing secret on the webhook path.',
    authModel: 'Slack app scopes + bot token + Socket Mode / Events API',
    safetyNote: 'Minimize scopes and verify thread semantics before broad workspace deployment.',
    operatingMode: 'Policy-aware internal deployment',
    complexity: '35–50 min setup',
    warning:
      'Mis-scoped OAuth permissions and event-subscription gaps cause most “connected but silent” failures.',
    verificationHint:
      'Test DM, channel mention, and thread reply separately because each path fails for a different reason.',
    bestUseCase:
      'Internal ops, support, and product teams that need durable chat context and workflow hooks.',
    checklist: [
      'Start with the minimal Slack scope set and expand only after a tested need appears.',
      'Choose Socket Mode or Events API with one documented transport verification step.',
      'Test public channels, private channels, and threaded replies separately.',
      'Write down the workspace-admin dependencies required for maintenance or reinstall.',
    ],
    focusAreas: ['oauth scopes', 'socket mode', 'events api', 'threading', 'workspace rollout'],
    tone: 'secondary',
    iconKey: 'slack',
    kind: 'core',
    kindLabel: 'Core Channel',
  },
  {
    slug: 'synology-chat',
    title: 'Synology Chat',
    strapline:
      'NAS-native chat for operators who want the assistant close to self-hosted infrastructure.',
    summary:
      'Synology Chat for OpenClaw covers plugin installation, webhook directionality, NAS-hosted trust boundaries, and verification inside Synology collaboration flows.',
    playbookEyebrow: 'Synology Chat DM webhooks',
    playbookTitle: 'Use Synology Chat as a locked-down direct-message channel.',
    playbookIntro:
      'The plugin bridges outgoing and incoming webhooks, recommends `allowlist` for production, and will not start the route if that allowlist is empty.',
    watchLabel: 'Watch the DM webhook',
    watchTitle:
      'Watch a token-verified Synology DM pass sender rate limiting and return through the incoming webhook.',
    authModel: 'Installed plugin + outgoing / incoming webhooks + Synology Chat room config',
    safetyNote:
      'Treat the NAS and webhook boundary as one security surface, especially on home or small-business networks.',
    operatingMode: 'Self-hosted webhook deployment on Synology infrastructure',
    complexity: '25–40 min setup',
    warning:
      'Webhook mismatch and NAS environment drift can make failures look like generic connectivity issues.',
    verificationHint:
      'Confirm outbound and inbound webhook paths separately before relying on room-level interactions.',
    bestUseCase:
      'Synology-centered teams or homelabs that want OpenClaw inside their NAS-native collaboration stack.',
    checklist: [
      'Install the plugin and verify the Synology environment you are targeting is stable enough for the lane.',
      'Configure incoming and outgoing webhook paths as separate checkpoints.',
      'Test one simple text flow before adding richer routing expectations.',
      'Document NAS-side dependencies, permissions, and update risks.',
    ],
    focusAreas: [
      'synology chat',
      'incoming webhook',
      'outgoing webhook',
      'nas host',
      'plugin install',
    ],
    tone: 'warning',
    iconKey: 'generic',
    kind: 'plugin',
    kindLabel: 'Community Plugin',
  },
  {
    slug: 'telegram',
    title: 'Telegram',
    strapline: 'Fast pairing, public reach, and the cleanest path from install day to first reply.',
    summary:
      'Telegram Bot setup for OpenClaw: BotFather token handling, DM versus group policy, privacy mode, verification, and common integration failure patterns.',
    playbookEyebrow: 'Telegram Bot',
    playbookTitle: 'The simplest OpenClaw bot launch.',
    playbookIntro:
      'Telegram is production-ready for DMs and groups, with BotFather setup, pairing by default, and long polling as the standard runtime.',
    watchLabel: 'Watch group visibility',
    watchTitle:
      'Privacy Mode limits what the bot sees in groups unless you disable it or make the bot an admin.',
    authModel: 'Bot token + DM pairing or group permissions',
    safetyNote:
      'Lock pairing scope early and verify privacy mode before exposing the bot to public groups.',
    operatingMode: 'Rapid launch with iterative hardening',
    complexity: '20–30 min setup',
    warning:
      'Most failures come from privacy mode, webhook confusion, or missing group permissions.',
    verificationHint:
      'Confirm `/start`, a direct reply, and one group-thread interaction before calling setup complete.',
    bestUseCase:
      'Operators who want the fastest reliable route from install to a working OpenClaw channel.',
    checklist: [
      'Mint the bot token and store it outside shell history.',
      'Choose DM-only or group mode before inviting the bot anywhere public.',
      'Verify privacy mode, command scope, and reply permissions.',
      'Test text, media, and command routing with a throwaway chat first.',
    ],
    focusAreas: ['bot token', 'privacy mode', 'group permissions', 'webhooks', 'delivery checks'],
    tone: 'primary',
    iconKey: 'telegram',
    kind: 'core',
    kindLabel: 'Core Channel',
  },
  {
    slug: 'tlon',
    title: 'Tlon',
    strapline:
      'An Urbit-adjacent lane for communities that want protocol-shaped operations instead of mainstream chat defaults.',
    summary:
      'Tlon/Urbit support for OpenClaw covers plugin-backed setup, identity assumptions, group access, and verification tailored to that ecosystem.',
    playbookEyebrow: 'Optional plugin · Urbit messenger',
    playbookTitle: 'Tlon on Urbit, with private chat and group traffic kept distinct.',
    playbookIntro:
      'Tlon runs as an Urbit-native lane for DMs and group chats, with discovery, owner approval, and mention-gated groups shaping how traffic reaches the bot.',
    watchLabel: 'Reply watch',
    watchTitle: 'Keep group replies mention-gated unless you intentionally widen the lane.',
    authModel: 'Installed plugin + Urbit / Tlon identity and room configuration',
    safetyNote:
      'Document the identity and room model explicitly because it differs from mainstream bot platforms.',
    operatingMode: 'Protocol-specific community deployment',
    complexity: '35–50 min setup',
    warning:
      'Assumptions imported from Slack or Discord can mislead operators about what access and identity actually mean here.',
    verificationHint:
      'Validate identity resolution, message delivery, and one group interaction on the exact environment meant for production.',
    bestUseCase:
      'Communities already centered on Urbit/Tlon that want an assistant lane native to their operating context.',
    checklist: [
      'Install the plugin and define the target identity / ship / room model up front.',
      'Verify the first direct and shared-space interactions separately.',
      'Document ecosystem-specific constraints so the guide does not read like a generic bot setup.',
      'Add maintenance notes for plugin or protocol-side changes.',
    ],
    focusAreas: [
      'urbit identity',
      'tlon rooms',
      'plugin install',
      'shared spaces',
      'protocol context',
    ],
    tone: 'accent',
    iconKey: 'generic',
    kind: 'plugin',
    kindLabel: 'Community Plugin',
  },
  {
    slug: 'twitch',
    title: 'Twitch',
    strapline: 'Live chat means live moderation pressure, rate limits, and stream-aware etiquette.',
    summary:
      'Twitch chat support for OpenClaw covers plugin-backed IRC-style setup, channel auth, moderation expectations, and verification for live environments.',
    playbookEyebrow: 'Plugin channel · IRC-backed chat',
    playbookTitle: 'Twitch chat as a public bot surface, not a generic inbox.',
    playbookIntro:
      'Twitch runs over IRC-backed live chat, with OpenClaw connecting as a Twitch user and enforcing access control before public chat becomes bot input.',
    watchLabel: 'Access watch',
    watchTitle:
      'Keep `allowFrom`, role gating, and `requireMention` visible, because those controls decide whether chat stays manageable.',
    authModel: 'Installed plugin + Twitch chat credentials / IRC-style channel auth',
    safetyNote:
      'Moderation boundaries and rate expectations matter as much as raw connectivity on a live stream surface.',
    operatingMode: 'Live-chat deployment with moderation discipline',
    complexity: '20–35 min setup',
    warning:
      'A bot that behaves acceptably in a private test can still fail hard under live-stream pace and moderation norms.',
    verificationHint:
      'Test in a controlled channel first, then rehearse commands and replies under moderate message volume.',
    bestUseCase:
      'Creators or communities that want an assistant in live chat without improvising the operational rules later.',
    checklist: [
      'Install the plugin and define which channels and moderators own the rollout.',
      'Verify authentication and basic delivery before simulating live activity.',
      'Test moderation-sensitive behavior in a small or private stream context first.',
      'Document rate and etiquette rules before going on-air.',
    ],
    focusAreas: ['live chat', 'moderation', 'twitch auth', 'rate control', 'plugin install'],
    tone: 'accent',
    iconKey: 'generic',
    kind: 'plugin',
    kindLabel: 'Community Plugin',
  },
  {
    slug: 'webchat',
    title: 'WebChat',
    strapline:
      'The browser-native surface: no external messenger, but all the same trust and session questions.',
    summary:
      'WebChat for OpenClaw covers browser access, WebSocket reachability, token bootstrap, pairing, and safe remote exposure for the built-in chat surface.',
    playbookEyebrow: 'Gateway WebChat',
    playbookTitle: 'Direct gateway chat, without a separate web server.',
    playbookIntro:
      'WebChat is a native Gateway WebSocket UI that uses the same sessions and routing rules as other channels and always routes replies back to WebChat.',
    watchLabel: 'Watch gateway reachability',
    watchTitle:
      'Gateway auth is required by default even on loopback, and the UI becomes read-only when the gateway is unreachable.',
    authModel: 'Gateway token + browser pairing + WebSocket session',
    safetyNote:
      'Because it feels local and simple, operators often underestimate the trust model and remote-access implications.',
    operatingMode: 'Fastest browser-native path with trust-state awareness',
    complexity: '10–20 min setup',
    warning:
      'WebChat failures frequently mix up reachability, auth, pairing, and browser security-context problems.',
    verificationHint:
      'Test the exact local or remote URL, token path, and browser profile you expect real operators to use.',
    bestUseCase:
      'Single-operator or lightweight team setups that want the shortest path to a native OpenClaw interface.',
    checklist: [
      'Confirm how the browser reaches the gateway: localhost, tunnel, tailnet, or reverse proxy.',
      'Verify token bootstrap and pairing behavior on the intended browser profile.',
      'Test reconnect and session persistence after one deliberate restart.',
      'Document what changes when the same UI is opened remotely instead of locally.',
    ],
    focusAreas: [
      'websocket',
      'browser pairing',
      'gateway token',
      'remote access',
      'session persistence',
    ],
    tone: 'primary',
    iconKey: 'generic',
    kind: 'browser',
    kindLabel: 'Browser Surface',
  },
  {
    slug: 'whatsapp',
    title: 'WhatsApp',
    strapline:
      'Huge reach, strong ergonomics, and the strictest need for account-safety discipline.',
    summary:
      'WhatsApp setup for OpenClaw: QR pairing, session health, account-safety guardrails, listener state, and troubleshooting for production-minded operators.',
    playbookEyebrow: 'WhatsApp Web',
    playbookTitle: 'Run it on your own number, ideally a separate one.',
    playbookIntro:
      'WhatsApp is production-ready through a QR-linked Web session, with pairing for unknown senders and the gateway owning the linked session.',
    watchLabel: 'Watch linked state',
    watchTitle: 'Outbound sends require an active WhatsApp listener for the target account.',
    authModel: 'WhatsApp Web session or provider-backed credentials',
    safetyNote:
      'Treat account safety as a first-class operating requirement, not a footnote after setup succeeds.',
    operatingMode: 'Measured rollout with explicit risk controls',
    complexity: '30–45 min setup',
    warning:
      'Aggressive automation, stale sessions, or self-chat misunderstandings can break trust very quickly.',
    verificationHint:
      'Validate QR/session state, outgoing delivery, and reply threading under the exact account mode you plan to run.',
    bestUseCase:
      'Operators who need consumer reach and are willing to maintain a careful compliance and recovery playbook.',
    checklist: [
      'Decide early between personal-number experiments and production-safe account paths.',
      'Pair in a controlled environment and capture the session health assumptions.',
      'Review ban-risk guidance before enabling broad automations or broadcasts.',
      'Test re-auth, reconnect, and recovery flows instead of only the first-send path.',
    ],
    focusAreas: [
      'qr pairing',
      'session health',
      'listener state',
      'ban prevention',
      'recovery drills',
    ],
    tone: 'success',
    iconKey: 'whatsapp',
    kind: 'core',
    kindLabel: 'Core Channel',
  },
  {
    slug: 'zalo',
    title: 'Zalo',
    strapline:
      'A regional bot lane where local platform conventions matter more than generic bot patterns.',
    summary:
      'Zalo Bot API support for OpenClaw covers plugin-backed setup, bot credentials, local rollout conventions, and verification tuned for Vietnam-focused deployments.',
    playbookEyebrow: 'Experimental · Zalo bot channel',
    playbookTitle: 'Zalo with deterministic routing back to the platform.',
    playbookIntro:
      'Zalo stays intentionally narrow: experimental Bot API integration, deterministic replies back to Zalo, and operator-controlled DM or group policy.',
    watchLabel: 'Policy watch',
    watchTitle:
      'Keep `groupPolicy`, `groupAllowFrom`, and transport mode explicit, because Zalo group behavior is intentionally fail-closed unless you open it.',
    authModel: 'Installed plugin + Zalo Bot API credentials',
    safetyNote:
      'Regional platform rules and account expectations should be documented alongside the technical setup.',
    operatingMode: 'Regional plugin deployment with market-specific guardrails',
    complexity: '25–40 min setup',
    warning:
      'If the guide imports assumptions from Telegram or WhatsApp without adjustment, operators will miss the platform-specific constraints that matter.',
    verificationHint:
      'Test credential validity, one direct bot interaction, and one intended production-like context before scaling use.',
    bestUseCase:
      'Teams serving Zalo-first audiences who need OpenClaw in the dominant local messaging surface.',
    checklist: [
      'Install the plugin and document the Zalo bot account or org context being used.',
      'Verify the Bot API credentials before layering on richer workflow expectations.',
      'Test the lane in a production-like conversation context, not only a sterile sandbox.',
      'Capture any regional policy or support constraints for future operators.',
    ],
    focusAreas: [
      'zalo bot api',
      'regional rollout',
      'plugin install',
      'bot credentials',
      'local conventions',
    ],
    tone: 'warning',
    iconKey: 'generic',
    kind: 'plugin',
    kindLabel: 'Community Plugin',
  },
  {
    slug: 'zalouser',
    title: 'Zalo Personal',
    strapline:
      'Personal-account automation adds convenience but also raises operational and policy risk sharply.',
    summary:
      'Zalo Personal support for OpenClaw covers plugin-backed QR login, personal-account constraints, risk posture, and verification for cautious operators.',
    playbookEyebrow: 'Experimental · Unofficial personal account',
    playbookTitle: 'Zalo Personal via zca-js, with the tradeoff stated upfront.',
    playbookIntro:
      'Zalo Personal runs through native `zca-js` login on the gateway, with QR-linked session state and a platform-risk posture you need to accept before rollout.',
    watchLabel: 'Risk watch',
    watchTitle:
      'Treat suspension and ban risk as part of setup, not as a footnote after the lane is already live.',
    authModel: 'Installed plugin + QR login + personal account session state',
    safetyNote:
      'Make the personal-account tradeoffs explicit before anyone treats the lane as a safe default.',
    operatingMode: 'Cautious experimental rollout with policy awareness',
    complexity: '35–50 min setup',
    warning:
      'Personal-account automation can create higher support and policy risk than teams expect from “just another QR flow.”',
    verificationHint:
      'Validate login, session persistence, and one reconnect path before trusting the lane for routine use.',
    bestUseCase:
      'Operators who knowingly need a personal-account path and can accept the higher maintenance burden.',
    checklist: [
      'Install the plugin and document why the personal-account route is required.',
      'Verify QR login flow, session persistence, and reconnect behavior in the real environment.',
      'Write down the policy and support risks so the tradeoff stays visible.',
      'Define a migration path to a safer bot-style channel if one becomes available.',
    ],
    focusAreas: [
      'qr login',
      'personal account',
      'session persistence',
      'policy risk',
      'plugin install',
    ],
    tone: 'danger',
    iconKey: 'generic',
    kind: 'plugin',
    kindLabel: 'Community Plugin',
  },
];

const channelBlueprintMap = new Map(channelBlueprints.map((entry) => [entry.slug, entry]));

export function resolveChannelBlueprint(slug: string, title?: string): ChannelBlueprint {
  const normalizedSlug = slug.toLowerCase();
  const existing = channelBlueprintMap.get(normalizedSlug);
  if (existing) return existing;

  const fallbackTitle =
    title ?? slug.replace(/[-_]+/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());

  return {
    slug: normalizedSlug,
    title: fallbackTitle,
    strapline: 'A channel integration dossier built for operators, not tourists.',
    summary:
      'Channel-specific setup notes, safety posture, and verification drills belong here as soon as this integration is documented.',
    playbookEyebrow: 'Channel route brief',
    playbookTitle: 'Document the operator path before widening access.',
    playbookIntro:
      'Use this dossier to make the auth model, route boundaries, and first verification loop explicit before the channel goes live.',
    watchLabel: 'Route watch',
    watchTitle:
      'Keep the first risky boundary visible so setup drift does not get mistaken for delivery health.',
    authModel: 'Platform credentials + least-privilege pairing',
    safetyNote: 'Start narrow, prove permissions, then expand scope deliberately.',
    operatingMode: 'Operator-first rollout with visible checkpoints',
    complexity: 'Guide in progress',
    warning:
      'Document the failure modes before the launch-day shortcuts become the production default.',
    verificationHint:
      'Test direct messages, shared spaces, and recovery behavior as separate flows.',
    bestUseCase:
      'Any channel that needs a setup playbook with security and troubleshooting built in.',
    checklist: [
      'Create the minimal credential set required for the first verified workflow.',
      'Define the smallest audience or room where the bot is allowed to respond.',
      'Test delivery, threading, and fallback behavior before the public rollout.',
      'Link troubleshooting notes next to the happy path instead of burying them later.',
    ],
    focusAreas: ['credentials', 'permissions', 'verification', 'failure recovery'],
    tone: 'warning',
    iconKey: 'generic',
    kind: 'core',
    kindLabel: 'Core Channel',
  };
}

type ChannelEntryLike = {
  slug: string;
  data: {
    featured?: boolean;
    publishDate: Date | string | number;
    title: string;
  };
};

export function sortChannelEntries<T extends ChannelEntryLike>(entries: T[]): T[] {
  return [...entries].sort((left, right) => {
    if (left.data.featured !== right.data.featured) {
      return left.data.featured ? -1 : 1;
    }

    const publishDelta =
      coerceDate(right.data.publishDate).getTime() - coerceDate(left.data.publishDate).getTime();
    if (publishDelta !== 0) return publishDelta;

    return left.data.title.localeCompare(right.data.title, 'en');
  });
}

export function coerceDate(value: Date | string | number | null | undefined): Date {
  const date = value instanceof Date ? value : new Date(value ?? Number.NaN);
  return Number.isNaN(date.getTime()) ? new Date(Number.NaN) : date;
}

export function normalizeKeywords(values: string[] | undefined): string[] {
  return [...new Set((values ?? []).map((value) => value.trim()).filter(Boolean))];
}
