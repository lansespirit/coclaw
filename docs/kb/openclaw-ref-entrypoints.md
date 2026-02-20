# OpenClaw Ref Entrypoints (for troubleshooting)

> Generated: 2026-02-20T02:03:46.456Z
> OpenClaw ref: 9264a8e2 — chore: move skills to maintainers repository

## Channels (docs)

| Label           | Source                                           | Exists |
| --------------- | ------------------------------------------------ | ------ |
| Channel routing | `.ref/openclaw/docs/channels/channel-routing.md` | yes    |

## CLI (docs)

| Label          | Source                                | Exists |
| -------------- | ------------------------------------- | ------ |
| CLI: config    | `.ref/openclaw/docs/cli/config.md`    | yes    |
| CLI: configure | `.ref/openclaw/docs/cli/configure.md` | yes    |
| CLI: channels  | `.ref/openclaw/docs/cli/channels.md`  | yes    |

## Config (code)

| Label                                                            | Source                                             | Exists |
| ---------------------------------------------------------------- | -------------------------------------------------- | ------ |
| Schema builder (JSON Schema + uiHints merge: plugins + channels) | `.ref/openclaw/src/config/schema.ts`               | yes    |
| Top-level Zod schema entrypoint                                  | `.ref/openclaw/src/config/zod-schema.ts`           | yes    |
| Channels config schema (Zod)                                     | `.ref/openclaw/src/config/zod-schema.channels.ts`  | yes    |
| Providers config schema (Zod)                                    | `.ref/openclaw/src/config/zod-schema.providers.ts` | yes    |
| Config load/merge helpers                                        | `.ref/openclaw/src/config/merge-config.ts`         | yes    |

## Config (docs)

| Label                                            | Source                                                  | Exists |
| ------------------------------------------------ | ------------------------------------------------------- | ------ |
| Gateway configuration reference (field-by-field) | `.ref/openclaw/docs/gateway/configuration-reference.md` | yes    |
| Gateway configuration overview + examples        | `.ref/openclaw/docs/gateway/configuration.md`           | yes    |

## Control UI (code)

| Label                                    | Source                                          | Exists |
| ---------------------------------------- | ----------------------------------------------- | ------ |
| UI config controller (form coercion etc) | `.ref/openclaw/ui/src/ui/controllers/config.ts` | yes    |

## Control UI (docs)

| Label                                        | Source                                 | Exists |
| -------------------------------------------- | -------------------------------------- | ------ |
| Control UI (config schema + Raw JSON editor) | `.ref/openclaw/docs/web/control-ui.md` | yes    |

## Skills/Plugins (docs)

| Label                           | Source                                      | Exists |
| ------------------------------- | ------------------------------------------- | ------ |
| Skills config schema + examples | `.ref/openclaw/docs/tools/skills-config.md` | yes    |
| Plugin manifest + config schema | `.ref/openclaw/docs/plugins/manifest.md`    | yes    |

## Channels (code) — directory entrypoints

Use these when you need to trace behavior beyond docs/schema:

- `.ref/openclaw/src/discord`
- `.ref/openclaw/src/channels`
- `.ref/openclaw/extensions`
- `.ref/openclaw/src/memory`
