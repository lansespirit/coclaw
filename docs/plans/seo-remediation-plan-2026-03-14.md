# CoClaw SEO Remediation Plan (2026-03-14)

This plan turns the content SEO audit into an implementation backlog for the CoClaw site.

It is intentionally execution-oriented: clear scope, sequencing, acceptance criteria, and file-level impact.

## Context

Current audit findings show that CoClaw already has a solid information architecture and publish pipeline, but the site still behaves more like a content library than a search-optimized publishing system.

The biggest losses are not missing pages. The losses are in:

- search snippet design (`title` / `description` too long or not intent-shaped)
- indexability policy inconsistencies
- uneven structured data coverage
- weak E-E-A-T and verification signaling
- no SEO-specific template/content contract shared across the site

## Clarifications Already Aligned

These constraints are confirmed and should be treated as project inputs:

1. `issues/` is legacy transitional design and should be removed from the site surface and crawl policy.
2. OG image work is explicitly out of scope for this task.
3. E-E-A-T is a first-class objective and needs a systematic, template-level solution rather than ad hoc copy fixes.
4. Before broad implementation, CoClaw needs an SEO-specific specification for templates and content creation under `docs/specs`.

## Goals

- Establish a durable SEO system for CoClaw page templates and content types.
- Separate editorial headline/body writing from SERP-focused metadata design.
- Remove obsolete issue-index pages and their crawl/index artifacts.
- Add a consistent E-E-A-T framework across templates, content schema, and editorial workflow.
- Improve discoverability for high-value OpenClaw search intents without flattening editorial voice.

## Non-Goals

- No OG image redesign or automation in this project.
- No broad content rewrite of the entire site in a single pass.
- No speculative SEO changes that weaken editorial accuracy or trust.
- No restoration of `/troubleshooting/issues/*` transitional pages.

## Deliverables

1. SEO specification document under `docs/specs`.
2. Execution plan under `docs/plans`.
3. Content schema updates for SEO and trust fields.
4. Template refactors for metadata, schema, and trust blocks.
5. Removal of obsolete issue pages and crawl rules.
6. Prioritized metadata/content backfill for highest-value pages.
7. Validation checklist and regression checks.

## Workstreams

### WS1. Remove Legacy `issues/` Surface

#### Why

The current state still builds hundreds of `noindex` issue pages while `robots.txt` blocks the same path. That is transitional baggage, creates policy ambiguity, and bloats build output with pages we do not want.

#### Scope

- Remove legacy routes and references related to `/troubleshooting/issues/`.
- Remove `robots.txt` disallow rule for that path once the route is gone.
- Remove issue dataset-driven generation from the published surface.
- Remove UI links that point users toward raw issue mirrors when a curated solution exists.

#### Expected file impact

- `/Users/sean/Programs/CoClaw/public/robots.txt`
- `/Users/sean/Programs/CoClaw/src/pages/troubleshooting/issues.astro`
- `/Users/sean/Programs/CoClaw/src/pages/troubleshooting/issues/[number].astro`
- `/Users/sean/Programs/CoClaw/src/pages/troubleshooting.astro`
- `/Users/sean/Programs/CoClaw/src/lib/openclaw-issues.ts`
- `/Users/sean/Programs/CoClaw/src/lib/openclaw-issues-filters.ts`
- any related components/search index wiring discovered during implementation

#### Acceptance criteria

- `pnpm build` no longer emits `/troubleshooting/issues/` routes.
- `robots.txt` contains no stale issue-path rule.
- no internal navigation points to removed issue pages.
- troubleshooting UX still supports curated discovery through solutions and guides.

### WS2. Introduce SEO-Specific Content Contract

#### Why

Today, most templates reuse editorial `title` and `description` directly for metadata. That makes the content authoring contract too coarse and causes systemic snippet truncation.

#### Scope

Add explicit SEO metadata fields to content collections and templates.

#### Proposed fields

Core fields:

- `seoTitle`
- `seoDescription`
- `canonicalPath` (optional override)
- `robots` (optional page-level override)
- `noindex` (optional convenience boolean)

Trust / E-E-A-T fields:

- `reviewedBy`
- `reviewedAt`
- `testedOn`
- `sources`
- `contentOwner`
- `reviewCadence`
- `verificationStatus`
- `changeSummary`

Optional content support fields:

- `searchIntent`
- `targetKeywords`
- `audience`
- `softwareVersion`
- `productSurface`

#### Expected file impact

- `/Users/sean/Programs/CoClaw/src/content/config.ts`
- all dynamic templates that consume collection frontmatter

#### Acceptance criteria

- content schema supports the new SEO and trust fields.
- templates prefer `seoTitle`/`seoDescription` when present.
- canonical and robots logic are explicit and consistent.
- existing content still builds with sensible fallbacks.

### WS3. Refactor Shared Metadata + Template Rules

#### Why

Metadata and trust behavior should live in shared template rules, not be re-decided page by page.

#### Scope

Refactor shared layout behavior so every template follows the same contract.

#### Rules to implement

- one visible H1 per page
- editorial title may differ from SEO title
- canonical is derived from route unless explicitly overridden
- metadata lengths are bounded by spec guidance, not by accident
- JSON-LD is required per indexable template type
- trust metadata can be rendered in a consistent page block when available

#### Expected file impact

- `/Users/sean/Programs/CoClaw/src/layouts/BaseLayout.astro`
- `/Users/sean/Programs/CoClaw/src/layouts/DocsLayout.astro`
- `/Users/sean/Programs/CoClaw/src/layouts/TroubleshootingLayout.astro`
- `/Users/sean/Programs/CoClaw/src/pages/blog/[slug].astro`
- `/Users/sean/Programs/CoClaw/src/pages/guides/[slug].astro`
- `/Users/sean/Programs/CoClaw/src/pages/channels/[slug].astro`
- `/Users/sean/Programs/CoClaw/src/pages/special-reports/[slug].astro`
- `/Users/sean/Programs/CoClaw/src/pages/stories/[slug].astro`
- other index/list pages as needed

#### Acceptance criteria

- no indexable template ships without canonical, description, and template-appropriate schema.
- solution pages emit structured data.
- duplicate H1 cases are resolved by spec and template handling.

### WS4. Establish E-E-A-T System

#### Why

For CoClaw, trust is not decorative. The site covers self-hosting, security, account risk, auth, tooling, automation, and operational recovery. Search visibility without trust posture is fragile and not worth much.

#### System components

1. **Attribution model**
   - named author or clearly defined organization role
   - named reviewer for sensitive/high-impact pages
2. **Verification model**
   - `testedOn` and `reviewedAt`
   - what environment or version the advice was verified against
3. **Evidence model**
   - structured `sources` with source type and confidence tier
   - distinguish primary docs, first-party issues, maintainer statements, and community anecdotes
4. **Claim-status model**
   - distinguish confirmed behavior, reported behavior, inference, and editorial interpretation
5. **Freshness model**
   - explicit content owner and review cadence
   - `needsReview` becomes operational rather than decorative
6. **Risk-boundary model**
   - pages covering auth, billing, bans, security, or irreversible actions should explicitly state safe boundary / failure mode / rollback path

#### Acceptance criteria

- specification defines which content types require which trust fields.
- at least one renderable trust block exists for high-stakes templates.
- content workflow supports periodic review rather than one-time publication.

### WS5. Metadata Backfill for High-Value Pages

#### Why

System changes alone will not fix CTR or intent matching. High-value pages need hand-authored metadata.

#### Priority order

P1 pages:

- homepage
- getting started hub + core getting-started pages
- top guides by strategic value
- troubleshooting hub + highest-traffic solutions
- highest-value blog posts tied to recurring search intent

P2 pages:

- channels
- special reports
- story pages with stable search demand

#### Backfill rules

- shorten and sharpen SEO titles
- rewrite descriptions for intent + benefit + specificity
- ensure brand term placement is deliberate, not mandatory in every position
- map target query family per page

#### Acceptance criteria

- top-priority pages have hand-written `seoTitle` and `seoDescription`.
- metadata is not just truncated editorial prose.
- search intent is evident from the snippet alone.

### WS6. Internal Linking and Topic Cluster Hardening

#### Why

Many articles have decent body depth but weak contextual linking inside the prose. Page-end related links are helpful, but they are not enough.

#### Scope

- add deliberate in-body links between guides, solutions, channels, and blog analysis
- ensure each indexable page participates in a topic cluster
- distinguish hub pages, supporting pages, and conversion/utility pages

#### Acceptance criteria

- target pages include contextual internal links, not only footer/related modules.
- each strategic content cluster has a clear hub and supporting leaf pages.

### WS7. QA, Validation, and Regression Controls

#### Why

SEO regressions are easy to introduce quietly. We need machine-checkable rules.

#### Scope

Introduce validation for:

- duplicate H1
- missing schema for indexable templates
- too-long `seoTitle` / `seoDescription`
- missing trust fields on pages that require them
- stale `needsReview` / `reviewCadence` handling

#### Expected file impact

- `/Users/sean/Programs/CoClaw/scripts/content-check.mjs`
- potentially new SEO validation scripts if separation is cleaner

#### Acceptance criteria

- build or content checks fail on major SEO contract violations.
- validation rules reflect the spec rather than ad hoc heuristics.

## Sequencing

### Phase 0. Specification

- write SEO spec in `docs/specs`
- align on E-E-A-T contract and public trust signals
- confirm metadata field design before code refactor

### Phase 1. Cleanup

- remove legacy issue routes and robots artifacts
- confirm clean build output

### Phase 2. Platform Refactor

- update content schemas
- refactor shared layout/template metadata handling
- add solution-page schema

### Phase 3. E-E-A-T Rendering

- implement trust/evidence blocks in templates where required
- introduce source and review presentation patterns

### Phase 4. Content Backfill

- rewrite metadata for highest-value pages
- fix duplicate H1 source content
- improve in-body linking on priority content

### Phase 5. Validation

- add checks
- run build and content validation
- review generated sitemap and rendered HTML

## Prioritized Backlog

### P0

- SEO spec authored and accepted
- remove issue routes
- remove issue robots rule
- add SEO/trust schema fields to content model

### P1

- refactor base metadata contract
- add structured data for troubleshooting solutions
- implement trust block for high-stakes templates
- hand-tune metadata for highest-value pages

### P2

- internal linking pass
- FAQ schema for `/faq`
- static page schema coverage for key site pages
- content validation rules

### P3

- broader metadata backfill across long-tail pages
- automation for review cadence surfacing
- author/reviewer profile system if approved

## Risks

- adding trust fields without rendering policy creates schema bloat and editorial drag
- forcing every page into the same E-E-A-T surface may flatten useful differences between content types
- deleting issue routes without redirect/UX review could create dead internal references
- over-optimizing titles may damage editorial clarity or trust if phrased too aggressively

## Open Decisions Requiring Alignment

1. Should all high-stakes pages require a named human reviewer, or is a role-based reviewer acceptable?
2. Should author and reviewer have dedicated profile pages?
3. Should `sources` be mandatory for all indexable pages, or only for selected content types?
4. Should `testedOn` be required only for operational pages (`guides`, `channels`, `troubleshooting`) or also for analytical `blog` posts when they make implementation claims?
5. Should CoClaw publicly expose verification status badges (for example: reviewed, tested, needs review), or keep that signal lighter?
6. Should certain content types be allowed to use organization authorship only, or should anonymous organizational authorship be phased out on sensitive pages?

## Definition of Done

This project is done when:

- the site has an accepted SEO specification under `docs/specs`
- legacy `issues/` publishing surface is fully removed
- templates use explicit SEO metadata fields instead of editorial fallbacks alone
- high-stakes content types have a working E-E-A-T system
- priority pages have rewritten metadata and cleaner search presentation
- build-time checks exist for the most important SEO contract failures
