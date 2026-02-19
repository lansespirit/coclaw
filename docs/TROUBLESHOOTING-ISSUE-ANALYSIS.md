# Troubleshooting Issue Analysis

Generated: 2026-02-19
Dataset: openclaw/openclaw
Fetched at: 2026-02-19T00:59:53.631Z
Total issues analyzed: 500

## Top Channels (in issues text)

- telegram: 112
- discord: 53
- whatsapp: 43
- slack: 39
- signal: 17
- imessage: 15
- googlechat: 6
- irc: 4

## Top Platforms (in issues text)

- linux: 171
- macos: 143
- windows: 52
- docker: 33

## Top Components (heuristic)

- config: 370
- gateway: 246
- websocket: 205
- web-ui: 67
- onboarding: 15
- tui: 11

## High-Value Error Signatures (for curated articles)

- model: 120
- windows: 60
- oauth: 43
- docker: 42
- unauthorized: 20
- eacces: 20
- pairing_required: 5
- setmycommands: 1
- enotfound: 1
- device_identity_required: 0
- eaddrinuse: 0

## Recommended Writing Backlog (start here)

These are _solution_ pages we should curate (problem → cause → fix → verify) because they appear frequently and have high user impact:

- unauthorized/token mismatch (Control UI)
- npm EACCES / permission denied (global install)
- EADDRINUSE / GatewayLockError (port conflict)
- Telegram setMyCommands failed (DNS/egress/IPv6)
- Config validation failed / schema errors / JSON5 parse errors
- openclaw command not found (PATH sanity)

## Example Issues Per Signature (top by comments)

### Unauthorized / token mismatch (Control UI) (20)

- #9028 (closed, 10 comments): [Bug]: Docker install/onboarding stuck: CLI can’t connect to gateway (1006/1008), token mismatch due to OPENCLAW_GATEWAY_TOKEN override + confusing pairing flow/docs
- #18274 (closed, 6 comments): [Bug]: gateway closed (1008): unauthorized: device token mismatch (rotate/reissue device token)
- #17328 (closed, 4 comments): [Bug]: Telegram bot replies "unknown model: ollama/gemma3:4b" despite status showing it as default (v2026.2.12)
- #3181 (open, 4 comments): [Bug]: Runaway heartbeat loop triggers excessive model calls + retries (high CPU / cost)
- #17262 (open, 3 comments): BlueBubbles: Incoming messages rejected with 'unauthorized guid' regardless of dmPolicy

### Control UI: pairing required (1008) (5)

- #9028 (closed, 10 comments): [Bug]: Docker install/onboarding stuck: CLI can’t connect to gateway (1006/1008), token mismatch due to OPENCLAW_GATEWAY_TOKEN override + confusing pairing flow/docs
- #12210 (closed, 4 comments): sessions_spawn fails with "gateway closed (1008): pairing required" for internal subagents
- #16305 (open, 3 comments): Gateway unreachable: pairing required
- #20447 (open, 0 comments): Control UI does not receive device.pair.requested broadcast (pairing approval UI broken)
- #20401 (open, 0 comments): [Bug]: Webchat pairing fails behind Tailscale Serve — isLocalDirectRequest unreachable .ts.net check

### Control UI: device identity required (1008) (0)

- (no examples)

### EACCES / permission denied (npm/global install) (20)

- #17019 (open, 26 comments): [Bug]: 400 Item 'rs\_[...]' of type 'reasoning' was provided without its required following item.
- #19769 (open, 7 comments): v2026.2.17: Anthropic auth fails with OAuth error
- #4686 (open, 6 comments): [Bug]: WhatsApp linking stuck at "logging in" after initial successful link - cannot relink any number
- #9831 (open, 5 comments): [Bug]: openclaw config doesn't see gemini-cli installation
- #18965 (open, 4 comments): [Bug]: Exec tool returns empty stdout on Windows 10 native after upgrade from 2026.2.9 to 2026.2.15

### EADDRINUSE / GatewayLockError (port already used) (0)

- (no examples)

### Telegram setMyCommands failed (1)

- #19842 (open, 3 comments): [Bug]: Telegram provider fails to start polling after setMyCommands error

### ENOTFOUND / DNS resolution failures (1)

- #13371 (open, 6 comments): [Bug] WhatsApp channel exits permanently after DNS failure instead of retrying

### OAuth/Auth flows failing (43)

- #2697 (closed, 33 comments): [Bug]: Claude Code CLI OAuth auth fails - mode/type mismatch between config files
- #2145 (closed, 25 comments): [Bug]: After I start it, it always appears disconnected (1006): no reason, can't use
- #9095 (closed, 24 comments): [Bug] Anthropic OAuth authentication fails with HTTP 401 invalid bearer token
- #11359 (open, 18 comments): Telegram shows billing error while Web UI responses succeed (Claude Max)
- #19769 (open, 7 comments): v2026.2.17: Anthropic auth fails with OAuth error

### Model resolution / providers / "all models failed" (120)

- #2697 (closed, 33 comments): [Bug]: Claude Code CLI OAuth auth fails - mode/type mismatch between config files
- #17019 (open, 26 comments): [Bug]: 400 Item 'rs\_[...]' of type 'reasoning' was provided without its required following item.
- #2145 (closed, 25 comments): [Bug]: After I start it, it always appears disconnected (1006): no reason, can't use
- #9095 (closed, 24 comments): [Bug] Anthropic OAuth authentication fails with HTTP 401 invalid bearer token
- #19184 (open, 23 comments): [Bug]: [OpenAI Responses] "400 Item 'rs\_...' of type 'reasoning' was provided without its required following item" loop on gpt-5.2

### Windows install/runtime issues (60)

- #7559 (closed, 26 comments): 📱 Request iOS/Android TestFlight/Beta Access - @cnshenyi
- #2145 (closed, 25 comments): [Bug]: After I start it, it always appears disconnected (1006): no reason, can't use
- #19184 (open, 23 comments): [Bug]: [OpenAI Responses] "400 Item 'rs\_...' of type 'reasoning' was provided without its required following item" loop on gpt-5.2
- #9645 (closed, 9 comments): memory_search never calls qmd search when using QMD backend
- #2868 (open, 9 comments): [Bug]: Unexpected high token consumption with Claude models

### Docker deployment issues (42)

- #2145 (closed, 25 comments): [Bug]: After I start it, it always appears disconnected (1006): no reason, can't use
- #11359 (open, 18 comments): Telegram shows billing error while Web UI responses succeed (Claude Max)
- #9028 (closed, 10 comments): [Bug]: Docker install/onboarding stuck: CLI can’t connect to gateway (1006/1008), token mismatch due to OPENCLAW_GATEWAY_TOKEN override + confusing pairing flow/docs
- #4686 (open, 6 comments): [Bug]: WhatsApp linking stuck at "logging in" after initial successful link - cannot relink any number
- #8714 (open, 5 comments): [Bug]: Custom OpenAI-compatible provider shows 'Cannot read properties of undefined (reading 0)' before response
