# Stories & Special Reports SEO Metadata Plan (2026-03-14)

This plan implements the next chunk of the broader SEO remediation roadmap: ensure every "story" and "special-report" MDX page declares explicit `seoTitle` and `seoDescription`, and confirm the plan references the systemized E-E-A-T/SEO spec already in flight.

## Context

- The site already has a draft SEO/content spec in `docs/specs/site-seo-template-and-content-spec.md` that defines the rules for metadata length, trust fields, and structured data.
- Legacy `issues/` paths and their templates have been removed, so we no longer need the robots/issue artifacts or the old issue templates.
- OG image fixes are deferred to a follow-up task, and EEAT work is scoped to adding structured fields (e.g., `seoTitle`, `seoDescription`, `reviewedBy`, `testedOn`, `sources`) plus any additional insight we align on pre-execution.
- The high-level plan already filed under `docs/plans/seo-remediation-plan-2026-03-14.md` should guide sequencing; this document drills down on the current story/special-report metadata work.

## Clarified Constraints

1. `issues/` surface is gone; no touch required for its robots entries or templates.
2. OG image work is not part of this effort; metadata/spec/spec is the focus.
3. EEAT must be systematic; besides the named fields, the plan includes reviewing if additional metadata/insights (e.g., claim status notes, reviewer cadence) are needed for these content types and flag them for follow-up.
4. When we hit the mass metadata backfill phase (adding `seoTitle`/`seoDescription` en masse), spin up dedicated sub-agents that each own a subset of pages (per section or folder) so we can parallelize the work without conflicting edits.

## Execution Steps

1. **Re-read the SEO spec** to ensure the titles/descriptions we write obey the 45-65/110-160 character targets, reflect the page intent, and respect the E-E-A-T trust rules (sources, reviewed/touch cues). Document any open questions as part of this plan before touching the content.
2. **Audit `src/content/stories/*.mdx` and `src/content/special-reports/*.mdx`** to list pages missing `seoTitle`/`seoDescription`. Preserve existing editorial `title` and `description`, and note any odd files that might be intentionally metadata-light (e.g., index-like templates) for later sync.
3. **Author metadata**: for each story/special-report that lacks `seoTitle` or `seoDescription`, craft concise, intent-driven values consistent with the spec. Respect the editorial tone while clarifying the search promise. Prioritize batch work by category and use the sub-agent strategy described above during this phase.
4. **Run `pnpm build`** to ensure metadata additions do not break the build and to verify the new frontmatter surfaces in the generated metadata (manifest should pick up the fields). Capture any validation warnings and address them.
5. **Document results**: record which files were touched and which were intentionally skipped (if their metadata must wait or the page is non-indexable) and add that summary to the plan or the final report.
6. **Continue plan**: once this metadata batch is complete, resume the broader plan (phase 4 backfill) by following the established plan path.

## Dependencies & Notes

- Continue working in the `codex/` branch (default) and do not revert others' patches.
- If a story/special-report already has `seoTitle/seoDescription`, double-check lengths and clarity; adjust only if they violate the spec or appear incomplete.
- Document any new insights for EEAT beyond the named fields (e.g., claim format notes, evidence callouts) and propose them separately if necessary.
