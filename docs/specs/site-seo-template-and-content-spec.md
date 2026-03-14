# CoClaw SEO Template and Content Specification

Status: Draft
Owner: CoClaw site
Last updated: 2026-03-14

## 1. Purpose

This specification defines how CoClaw pages should be designed, authored, and rendered for search.

It exists to prevent the site from drifting into a state where:

- editorial headlines are reused as SEO titles without judgment
- trust signals are inconsistent or missing
- templates expose different crawl/index behavior by accident
- structured data coverage depends on whoever touched the page last
- content is publishable but not explainable to search engines

This is a site-system spec, not a keyword hack guide.

## 2. Design Principles

### 2.1 Search is a product surface

Every indexable page has three user experiences:

1. the SERP snippet
2. the on-page reading experience
3. the trust/evidence interpretation layer

All three must be designed intentionally.

### 2.2 Editorial title and SEO title are different jobs

- editorial `title` serves the on-page reading experience
- `seoTitle` serves query matching and click intent in search
- these may be the same, but that should be a choice, not a default assumption

### 2.3 Trust beats aggression

CoClaw covers technical and operational topics where a high-ranking page that looks unreliable is strategically weak.

Accuracy, evidence, and verification have priority over exaggerated SEO phrasing.

### 2.4 Templates own consistency

Writers should not have to reinvent metadata behavior for each page. The template/content contract should make the correct behavior the easy behavior.

## 3. Scope

This spec applies to:

- `/Users/sean/Programs/CoClaw/src/layouts/BaseLayout.astro`
- all dynamic content templates
- static marketing/support pages that are indexable
- content collections under `/Users/sean/Programs/CoClaw/src/content`

Content types in scope:

- `blog`
- `guides`
- `getting-started`
- `channels`
- `troubleshooting`
- `special-reports`
- `stories`
- index pages and core static pages

## 4. Indexability Rules

### 4.1 Default policy

All public evergreen pages are indexable unless there is a deliberate reason not to index them.

### 4.2 `robots.txt`

`robots.txt` must not be used to hide content that also depends on `meta robots noindex` for deindexing.

Rule:

- use `robots.txt` for crawl boundaries
- use `meta robots` for index control on pages that remain fetchable
- do not apply both to the same URL family unless there is a documented reason

### 4.3 Noindex criteria

A page may be `noindex` only if one of these is true:

- transitional or legacy surface
- duplicate utility page with no independent search value
- filtered/search-result variant
- low-value internal workflow page
- legal or policy reason

### 4.4 Canonical rules

- canonical defaults to route URL
- canonical override is allowed only when the page intentionally consolidates to another public URL
- canonical must not be used as a workaround for weak content differentiation

## 5. Metadata Contract

### 5.1 Required content fields for indexable pages

Base content fields:

- `title`
- `description`
- `publishDate`
- `lastUpdated` or equivalent

Required SEO fields for strategic/indexable content:

- `seoTitle`
- `seoDescription`

Recommended support fields:

- `targetKeywords`
- `searchIntent`
- `canonicalPath`
- `robots`

### 5.2 Length guidance

These are authoring targets, not hard law, but templates and checks should enforce reasonable bounds.

- `seoTitle`: target 45-65 characters
- `seoDescription`: target 110-160 characters

If a page needs more precision, prefer precision over arbitrary compression, but do not ship routinely over these ranges.

### 5.3 Writing rules for `seoTitle`

`seoTitle` should:

- surface the search intent clearly
- name the subject precisely
- include OpenClaw/CoClaw only when useful for query matching or disambiguation
- avoid vague magazine-style phrasing when the page is meant to win a specific technical query

`seoTitle` should not:

- duplicate the site name twice
- stuff multiple keyword variants into a list
- try to summarize the whole article argument

### 5.4 Writing rules for `seoDescription`

`seoDescription` should:

- describe the page promise in one compact unit
- make clear what the reader gets
- reflect the actual page type: fix, guide, comparison, explanation, report, story

`seoDescription` should not:

- simply reuse the opening paragraph
- be a partial abstract of the article
- read like generic marketing copy

## 6. H1 and Headline Rules

- every indexable page must render exactly one visible H1
- content body must not introduce a second H1 if the template already owns the page H1
- if an MDX body includes a leading `#` heading, the template must either suppress the outer H1 or content guidelines must prohibit the inner one for that content type

Default rule:

- template-owned pages use template H1
- MDX body starts at `##` unless the layout explicitly delegates H1 ownership to content

## 7. Structured Data Rules

Structured data is required for all indexable content templates.

### 7.1 Minimum mapping by content type

- `blog`: `BlogPosting` or `TechArticle`
- `guides`: `HowTo` when step-oriented; otherwise `TechArticle`
- `getting-started`: `HowTo` + `BreadcrumbList`
- `channels`: `TechArticle`
- `troubleshooting solutions`: `TechArticle` or `HowTo` depending on structure
- `special-reports`: `Article` or `CollectionPage` depending on page type
- `stories`: `Article`
- index pages: `CollectionPage`, `WebPage`, `FAQPage`, or `ItemList` as appropriate

### 7.2 Structured data requirements

Each page-level schema should include where relevant:

- headline/name
- description
- datePublished
- dateModified
- mainEntityOfPage
- author
- reviewer when available
- publisher
- image when available
- keywords when materially useful

### 7.3 Schema gaps not allowed

A new indexable template cannot launch without schema mapping.

## 8. E-E-A-T Contract

E-E-A-T on CoClaw is not a slogan. It is a content model and rendering system.

### 8.1 Trust fields

Core trust fields:

- `author`
- `reviewedBy`
- `reviewedAt`
- `testedOn`
- `sources`
- `contentOwner`
- `reviewCadence`
- `verificationStatus`
- `changeSummary`

### 8.2 Source model

`sources` should support structured entries with:

- `label`
- `url`
- `type` (`official-doc`, `repo`, `issue`, `maintainer-comment`, `community-report`, `first-hand-test`, `news`, `other`)
- `notes` (optional)

### 8.3 Claim-status model

For sensitive pages, content should distinguish among:

- confirmed behavior
- reported behavior
- maintainer claim
- editorial inference
- operator recommendation

This can be implemented through prose conventions, callout blocks, or source notes, but it must be intentional.

### 8.4 Verification model

`testedOn` should express the environment used to verify the recommendation where relevant.

Examples:

- OpenClaw version
- OS / runtime
- install method
- integration surface

### 8.5 Review model

High-stakes pages should have a review owner and cadence.

Recommended default:

- `troubleshooting`, `guides`, `channels`: strict review model
- `special-reports`: medium review model
- `blog` and `stories`: flexible, but required when making operational/security claims

### 8.6 Public trust presentation

High-stakes pages should render a **Verification & references** section **after the main content**.
Users should encounter the primary content first, then decide whether to verify claims, review scope,
or check sources.

Suggested contents:

- reviewed by
- last reviewed date
- tested on
- references list (collapsible when long)
- scope/risk note where relevant

Presentation rules:

- Do not repeat page-header metadata (for example author or publish date) inside this section.
- Do not show this section in the first screen / hero area.
- Prefer one compact block over nested cards; optimize for scanability and minimal vertical footprint.
- Use reader-facing language (page label: **Verification & references**). Avoid developer-ish naming like “Trust signals”.

Per content-type display strategy (default):

- `blog`: show `Reviewed by`, `Last reviewed`, and `References`; hide `Verified on` unless the post is explicitly version-bound.
- `guides` / `getting-started` / `docs`: show `Reviewed by`, `Last reviewed`, `Verified on`, plus `References` when available.
- `troubleshooting`: show `Status` (when meaningful), `Verified on`, and **group references by source type** (docs/issues/community/etc).
- `channels`: show `Reviewed by`, `Verified on`, and `References`; show `Status` only when it signals time-sensitivity (for example monitoring/deprecated).
- `stories`: use a dedicated bottom-of-article `Sources` section; avoid per-source nested cards (prefer a compact divided list).

## 9. Content-Type Requirements

## 9.1 Blog

Primary role: interpret trends, claims, releases, and ecosystem developments.

SEO requirements:

- `seoTitle`, `seoDescription`
- structured data
- at least one source when the page makes factual external claims
- explicit distinction between observation and interpretation
- in-body links to relevant guides/solutions when operational claims are made

## 9.2 Guides

Primary role: help readers accomplish a task.

SEO requirements:

- `seoTitle`, `seoDescription`
- `testedOn`
- `reviewedBy`
- structured data
- verification step
- rollback / failure mode guidance where relevant
- in-body links to troubleshooting when the task commonly fails

## 9.3 Getting Started

Primary role: shortest safe path to value.

SEO requirements:

- `seoTitle`, `seoDescription`
- `testedOn`
- structured data
- extremely clear intent and prerequisites
- minimal ambiguity in snippet copy

## 9.4 Channels

Primary role: help users understand or configure a platform/channel integration.

SEO requirements:

- `seoTitle`, `seoDescription`
- `testedOn`
- `reviewedBy`
- source-backed platform caveats when relevant
- structured data
- visible safety / auth / limitations notes

## 9.5 Troubleshooting Solutions

Primary role: solve a concrete problem fast.

SEO requirements:

- `seoTitle`, `seoDescription`
- `errorSignatures`
- `testedOn` when applicable
- `reviewedBy`
- one short recovery path near the top
- `Symptoms`, `Cause`, `Fix`, `Verify` or equivalent
- structured data required
- strong links to related fix and guide pages

## 9.6 Special Reports

Primary role: curated reading packs / operator briefings / topic collections.

SEO requirements:

- explicit page type in metadata and schema
- avoid pretending these are long standalone explanatory articles if they are primarily curated collections
- surface why the pack exists and who it is for

## 9.7 Stories

Primary role: narrative reporting.

SEO requirements:

- sources required
- distinction between allegation, fact, and interpretation required
- `seoTitle` and `seoDescription` can be more editorial than guides, but still must express subject and value clearly

## 10. Internal Linking Rules

- every strategic page should belong to a topic cluster
- cluster hubs must link down to supporting pages
- supporting pages must link laterally to nearby alternatives and up to hubs
- page-end related links are not enough; add contextual in-body links where they help user decisions

Minimum expectation for strategic pages:

- at least 2 meaningful internal links in the body or structured summary areas

## 11. Static Page Rules

Core site pages like `/about`, `/contact`, `/faq`, `/privacy`, `/security`, `/terms`, and major hubs should not be metadata afterthoughts.

Requirements:

- title and description intentionally written
- schema where appropriate
- no ultra-short default-looking titles
- FAQ content should use `FAQPage` schema where eligible

## 12. Freshness and Review Cadence

Not all content ages the same way.

Suggested default cadence:

- troubleshooting: 30-60 days
- guides/channels: 60-90 days
- getting-started: 30-60 days
- special reports: depends on event vs evergreen
- blog: review only when operational claims are time-sensitive
- stories: update when facts materially change

If a page falls out of cadence and is high-stakes, it should surface `needsReview` internally and may render a lighter public freshness cue if approved.

## 13. Validation Rules

The site should fail validation on major contract breaches.

Recommended checks:

- missing `seoTitle` / `seoDescription` on required content types
- overlong metadata beyond configured limits
- missing schema on indexable templates
- duplicate H1
- missing trust fields on pages that require them
- missing sources on content types where sources are mandatory

## 14. Anti-Patterns

Do not do the following:

- use one long editorial title everywhere: page, SERP, social, schema
- block a URL in `robots.txt` and expect `noindex` to clean it up
- publish high-stakes operational guidance with no source or verification signal
- let analytical posts make implementation claims without evidence or scope notes
- keep anonymous organization authorship on sensitive pages by default
- treat page-end related cards as a substitute for contextual information architecture

## 15. Editorial Workflow Requirements

Before publishing a page that falls under the strict trust model, the editor should confirm:

1. Is the search intent explicit?
2. Is the snippet hand-authored?
3. Is the page type correctly mapped in schema?
4. Is the trust/evidence posture visible enough for the topic?
5. Are risk boundaries and failure modes stated when relevant?
6. Is there a review owner?
7. Does the page link to the next useful page if this page is not sufficient?

## 16. Open Alignment Questions

These points still need product/editorial alignment before full implementation:

1. Whether author/reviewer profile pages will exist.
2. Whether all high-stakes pages require named human reviewer attribution.
3. Whether public verification badges should be shown.
4. Whether organization-only authorship remains acceptable on some page types.
5. Whether `sources` is mandatory on all indexable pages or only selected content types.

## 17. Default Implementation Direction

Unless product/editorial chooses otherwise, the implementation should assume:

- explicit SEO metadata fields are preferred over editorial fallback
- high-stakes operational content uses strict trust fields
- issue-mirror pages are not part of the long-term information architecture
- trust signals should be visible but not ornamental
- validation should prevent the most common SEO regressions at build time
