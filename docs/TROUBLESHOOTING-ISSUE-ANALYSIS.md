# Troubleshooting Issue Analysis

Generated: 2026-02-03
Dataset: openclaw/openclaw
Fetched at: 2026-02-03T11:15:47.623Z
Total issues analyzed: 500

## Top Channels (in issues text)

- telegram: 97
- whatsapp: 36
- discord: 34
- signal: 21
- slack: 16
- imessage: 9

## Top Platforms (in issues text)

- linux: 132
- macos: 121
- docker: 56
- windows: 41

## Top Components (heuristic)

- config: 310
- gateway: 200
- websocket: 185
- web-ui: 62
- tui: 13
- onboarding: 12

## High-Value Error Signatures (for curated articles)

- model: 94
- docker: 56
- windows: 41
- oauth: 23
- eacces: 12
- unauthorized: 9
- pairing_required: 3
- setmycommands: 1
- device_identity_required: 0
- eaddrinuse: 0
- enotfound: 0

## Recommended Writing Backlog (start here)

These are _solution_ pages we should curate (problem → cause → fix → verify) because they appear frequently and have high user impact:

- unauthorized/token mismatch (Control UI)
- npm EACCES / permission denied (global install)
- EADDRINUSE / GatewayLockError (port conflict)
- Telegram setMyCommands failed (DNS/egress/IPv6)
- Config validation failed / schema errors / JSON5 parse errors
- openclaw command not found (PATH sanity)

## Example Issues Per Signature (top by comments)

### Unauthorized / token mismatch (Control UI) (9)

- #1690 (closed, 10 comments): Webchat UI fails to authenticate: 'gateway token missing' even with token in URL
- #5483 (closed, 5 comments): clawhub CLI: Token authentication fails with "Unauthorized" error, cannot delete skill
- #6959 (open, 2 comments): Fix "disconnected (1008): pairing required" Error in OpenClaw Docker
- #7903 (open, 0 comments): Critical: Self-talk detection runs AFTER tool execution, allowing unauthorized actions
- #7749 (open, 0 comments): openclaw dashboard doesn't include token in URL

### Control UI: pairing required (1008) (3)

- #6959 (open, 2 comments): Fix "disconnected (1008): pairing required" Error in OpenClaw Docker
- #7715 (open, 0 comments): Feature: hot-reload device pairing approvals without gateway restart
- #7384 (open, 0 comments): WebGUI/WebSocket always disconnected (1008): pairing required despite trustedProxies set in 2026.x

### Control UI: device identity required (1008) (0)

- (no examples)

### EACCES / permission denied (npm/global install) (12)

- #2596 (open, 15 comments): [Bug]: read tool validation fails - uses "file_path" but expects "path" parameter
- #4855 (open, 11 comments): [Bug]: Control UI assets not found on npm global install (resolveControlUiDistIndexPath fails)
- #5434 (open, 8 comments): Error: EACCES: permission denied, open '/home/node/.openclaw/openclaw.json.7.2ede223b-aa90-4aa5-8f0d-97049696b626.tmp'
- #5571 (closed, 2 comments): Dashboard: Logo image broken/missing, causing header layout issues
- #4585 (open, 1 comments): google-gemini-cli provider: client_secret missing error with Gemini CLI OAuth

### EADDRINUSE / GatewayLockError (port already used) (0)

- (no examples)

### Telegram setMyCommands failed (1)

- #7511 (open, 0 comments): Teltelegram provider crashes gateway on startup (unhandled fetch rejection + setMyCommands failure) + OpenAI key not loading after OAuth success

### ENOTFOUND / DNS resolution failures (0)

- (no examples)

### OAuth/Auth flows failing (23)

- #2697 (open, 25 comments): [Bug]: Claude Code CLI OAuth auth fails - mode/type mismatch between config files
- #4772 (open, 6 comments): Discord integration fails in China: "Failed to resolve Discord application id"
- #6732 (open, 5 comments): [Bug]: Anthropic (claude) token authentication misverifcation
- #5483 (closed, 5 comments): clawhub CLI: Token authentication fails with "Unauthorized" error, cannot delete skill
- #6823 (open, 3 comments): Feature Request: Execution Guardrails for Tool Safety

### Model resolution / providers / "all models failed" (94)

- #2697 (open, 25 comments): [Bug]: Claude Code CLI OAuth auth fails - mode/type mismatch between config files
- #1866 (open, 12 comments): [Bug]: Add tool calling support for `openai-completions` API mode
- #2315 (open, 11 comments): Venice AI provider returns empty responses (no API calls made)
- #3475 (open, 11 comments): [Bug]: Kimi/Moonshot OpenAI-compatible models fail silently (direct API works, Clawdbot hangs)
- #4499 (open, 8 comments): bug(tui): MiniMax responses show '(no output)' until TUI restart

### Windows install/runtime issues (41)

- #75 (open, 16 comments): Linux/Windows Clawdbot Apps
- #2596 (open, 15 comments): [Bug]: read tool validation fails - uses "file_path" but expects "path" parameter
- #5231 (open, 8 comments): [Bug]: i cant install
- #6834 (closed, 6 comments): [Bug]: Windows 11 installation update failed
- #5483 (closed, 5 comments): clawhub CLI: Token authentication fails with "Unauthorized" error, cannot delete skill

### Docker deployment issues (56)

- #4111 (open, 51 comments): [Bug]:This version of Antigravity is no longer supported. Please update to receive the latest features!
- #1818 (open, 16 comments): [Bug]: Onboarding wizard does not install Systemd service on Ubuntu 22.04
- #3146 (closed, 9 comments): [Bug]: docker install "./docker-setup.sh" happen => ERROR [12/14] RUN CLAWDBOT_A2UI_SKIP_MISSING=1 pnpm build
- #5434 (open, 8 comments): Error: EACCES: permission denied, open '/home/node/.openclaw/openclaw.json.7.2ede223b-aa90-4aa5-8f0d-97049696b626.tmp'
- #5231 (open, 8 comments): [Bug]: i cant install
