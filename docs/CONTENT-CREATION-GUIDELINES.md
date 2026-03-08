# CoClaw Content Creation Guidelines (Operational Version)

This is a working document for editors, writers, and collaborators.

It is not a manifesto, and it is not meant to flatten every page into the same voice. It is meant to be used as a shared quality baseline while leaving room for editorial judgment, personality, and variation between pieces.

Scope:

- `stories`
- `blog`
- `guides`
- `getting-started`
- `channels`
- `templates`
- `troubleshooting`

Goals:

- Keep CoClaw content consistently high quality
- Keep the role of each section clear
- Preserve personality without losing accuracy
- Encourage pieces with distinct value, shape, and voice
- Keep metadata, SEO, and template usage aligned
- Make content maintainable over time

---

## 1. How To Use This Document

Use this sequence as the default working method, not as a rigid formula:

1. Decide the content role
2. Write a one-sentence content promise
3. Draft the metadata
4. Choose a structure template or deliberately depart from one
5. Write the body
6. Run the pre-publish checklist

If steps 1 and 2 are not clear, do not start writing the article. If the piece becomes stronger by bending the default structure, bend the structure—just do it intentionally.

---

## 2. Fast Decision: Which Section Does This Belong To?

### 2.1 Stories

Use `Stories` when the content mainly answers:

- What happened?
- Why is this person, project, incident, or moment worth reading through?
- What does it reveal about the OpenClaw ecosystem?

One-line definition:

> Stories are narrative reporting about real people, projects, incidents, and ecosystem moments.

### 2.2 Blog

Use `Blog` when the content mainly answers:

- How should we interpret this trend, product, or event?
- What is the argument?
- What larger framework should the reader use?

One-line definition:

> Blog explains how to think about something.

### 2.3 Guides

Use `Guides` when the content mainly answers:

- How do I accomplish a specific goal?
- What are the steps?
- How do I verify it worked?

One-line definition:

> Guides are execution paths.

### 2.4 Getting Started / Channels / Templates

Use these sections when the content mainly answers:

- How do I start using the product?
- How do I configure a specific channel or template?
- How should I understand a product feature or setup path?

One-line definition:

> These sections explain product usage and setup, not stories.

### 2.5 Troubleshooting

Use `Troubleshooting` when the content mainly answers:

- What is the problem?
- Why is it happening?
- How do I fix it?
- How do I confirm the fix?

One-line definition:

> Troubleshooting closes the loop on problems. It does not exist to express opinions.

---

## 3. The 5-Line Prewriting Card

Before drafting, write these five lines in a scratch note:

```md
Section:
Reader:
One-sentence reader benefit:
Core tension / thesis:
One sentence the reader should remember:
```

### 3.1 Example: Story

```md
Section: Stories
Reader: A builder trying to understand a real OpenClaw ecosystem controversy
One-sentence reader benefit: Understand how Capability Evolver went from breakout skill to governance dispute
Core tension / thesis: Innovation moved faster than governance, so the platform, builder, and crowd all fought to define the story
One sentence the reader should remember: A viral skill can become a governance problem overnight
```

### 3.2 Example: Blog

```md
Section: Blog
Reader: A technical team evaluating agent runtime risk
One-sentence reader benefit: Understand why OpenClaw security is fundamentally an authority-boundary problem
Core tension / thesis: Many teams still think of agents as chat tools when they already behave more like control-plane systems
One sentence the reader should remember: Agent security is less about prompts and more about delegated authority
```

---

## 4. Global Rules

## 4.0 Variety Is a Feature, Not a Bug

CoClaw should not sound like one person writing the same article repeatedly.

What should remain consistent:

- editorial standards
- factual discipline
- section clarity
- usefulness to the intended reader

What does **not** need to remain identical:

- sentence rhythm
- degree of dramatic framing
- amount of scene-setting
- tone, as long as it fits the section and the material
- structure, when a piece clearly benefits from a different shape

Rule of thumb:

> We want consistency of quality, not uniformity of voice.

## 4.1 Do Not Let Sections Bleed Into Each Other

This is the most important rule.

### Stories must not become:

- tutorials
- checklists
- policy memos
- pure explainers

### Blog must not become:

- news summaries
- source dumps
- backgrounders with no argument

### Guides must not become:

- opinion pieces
- essays
- concept pages with no execution path

### Troubleshooting must not become:

- issue mirrors
- long-form background explainers
- problem descriptions with no fix and no verification

## 4.2 Drama Is Allowed. Distortion Is Not.

Allowed:

- cold opens
- contrast
- tension
- dramatic pacing
- sharp lines
- narrative momentum

Not allowed:

- turning an allegation into a documented fact
- treating screenshots as final proof
- disguising editorial judgment as source-backed certainty
- exaggerating certainty for emotional or SEO effect

### Writers must explicitly separate four layers

- `Documented facts`
- `Claims / allegations`
- `Builder / maintainer account`
- `Editorial interpretation`

These layers can coexist in one piece, but they must not blur into one voice.

## 4.3 Do Not Publish Content That Is Merely Correct but Dull

CoClaw should not sound sterile.

Personality is allowed and necessary. Distinct voice is a feature, not a deviation to be corrected automatically.

But personality should come from:

- selection
- structure
- pacing
- editorial judgment

Not from empty posturing.

If deleting a paragraph removes no information and only removes attitude, that paragraph probably should not exist.

## 4.4 Do Not Sacrifice Readability for SEO

SEO should support the page, not dominate it.

Allowed:

- natural keyword placement in title, summary, dek, topics, and body
- repeating the core term naturally where the reader expects it

Not allowed:

- keyword stuffing
- forcing multiple search phrases into one paragraph
- writing for search traffic at the expense of human completion

Rule of thumb:

> If a real reader would notice the SEO machinery, the prose needs to be rewritten.

## 4.5 All Long Content Must Have Forward Motion

The most common failure is not lack of information. It is lack of movement.

Minimum structure:

- an opening that pulls the reader in
- a middle that advances something
- an ending that lands cleanly

Common failures:

- opening by repeating metadata
- middle section as raw source pileup
- ending that only says “this matters”

---

## 5. Story Rules

Paths:

- `src/content/stories/*.mdx`
- route: `/stories/<slug>/`

## 5.1 What Stories Are For

Stories should do two things at the same time:

- make the reader want to keep going
- leave the reader with a strong sense that the piece had material, judgment, and consequence

One-line definition:

> Stories are CoClaw’s narrative reporting on the OpenClaw ecosystem.

## 5.2 Preferred Story Structures

Use these as defaults, not mandatory molds. If a story becomes more memorable by breaking the template, that is usually a good sign—as long as the piece still has narrative control.

### Template A: Person / Project / Incident Story

1. Strong hook
2. What happened
3. Why it became larger than itself
4. Conflict / turn / competing accounts
5. What the episode actually reveals
6. Tight ending

### Template B: Ecosystem Panic / Risk Story

1. Open with a scene or mood
2. Show why the reader is already inside the problem
3. Show how the risk expands
4. Name the underlying tension
5. End on a line, not a report summary

## 5.3 How Story Openings Should Work

Prefer:

- a scene
- a sharp contrast
- a change the reader can feel immediately
- a line that forces continuation

Avoid:

- “This article explores…”
- “According to public sources…” as the first move
- “This matters because…” as the opening move
- generic AI trend openings

## 5.4 How Stories Commonly Go Wrong

A story is drifting when:

- section heads become analytical labels instead of narrative turns
- the writer keeps stepping in to explain “why this matters”
- the middle turns into a memo
- the ending sounds like a team retrospective

Correction method:

- go back to character
- go back to scene
- go back to conflict
- go back to “what happened next?”

## 5.5 Story Metadata Rules

See schema in `src/content/config.ts`.

### Field roles

- `title`: the headline, not the archive name
- `storyType`: `person | company | project | incident | ecosystem`
- `name`: the subject of the story
- `role`: the subject’s role in the story
- `company`: the organization / project / community association
- `summary`: card + SEO summary
- `dek`: narrative deck for the detail page
- `quote`: one line that captures the tension
- `topics`: 3–6 clear semantic tags
- `sources`: links that support the reporting trail

### `title` vs `name`

- `title` is the story headline
- `name` is the subject

Bad example:

- `title` is only a person’s name, but the body is actually about a project controversy or ecosystem event

### `summary` vs `dek`

- `summary`: concise, accurate, good for cards and SEO
- `dek`: stronger and more narrative, but still faithful to the piece

Do not make them identical.

## 5.6 Story Publish Checklist

Before publishing, check:

- Is there tension within the first five paragraphs?
- Can the reader feel that something changed?
- Are fact, allegation, account, and judgment clearly separated?
- Is there at least one memorable scene or line?
- Has the piece accidentally become an explainer?
- Does the ending leave an aftertaste instead of sounding like a meeting summary?

---

## 6. Blog Rules

Collection: `blog`

## 6.1 What Blog Is For

Blog exists to publish:

- arguments
- interpretations
- frameworks
- ecosystem analysis
- product and industry judgment

One-line definition:

> Blog tells the reader how to think about something.

## 6.2 Standard Blog Structure

Recommended default structure:

1. Thesis
2. 2–4 supporting sections
3. Counterpoint / limit case if needed
4. Clean landing

## 6.3 What Blog Must Do

- establish the thesis in the first three paragraphs
- make every section serve the thesis
- end with either a sharper frame or a practical implication

## 6.4 What Blog Must Not Do

- dump sources without judgment
- wander without a spine
- rely on corporate-security filler language
- disguise itself as a story when it is really analysis

---

## 7. Guide Rules

Path: `src/content/guides/*.mdx`

## 7.1 What Guides Are For

Guides exist to help the reader accomplish a concrete task.

Not to “understand a space.” To finish something.

## 7.2 What Every Guide Must Include

- a clear goal
- intended audience
- prerequisites
- ordered steps
- a verification path

## 7.3 Recommended Guide Structure

This is the preferred baseline, not a mandatory shell for every guide.

1. What this guide helps you do
2. Who this is for / not for
3. Prerequisites
4. Steps
5. Verification
6. Common deviations / next steps

## 7.4 Guide Metadata Rules

- `title`: action-oriented
- `description`: result-oriented
- `category`: stable and filterable
- `difficulty`: honest, not flattering
- `platforms`: only real supported platforms
- `time`: conservative estimate

---

## 8. Getting Started / Channels / Templates Rules

These sections are product-explanation layers.

## 8.1 Writing Goals

- correct
- clear
- stable
- scannable

## 8.2 Writing Rules

- one paragraph should do one job
- explain terms on first use
- config examples must be minimally usable
- risk boundaries must be explicit where relevant

## 8.3 Avoid

- marketing copy instead of explanation
- essay-style prose for product setup
- assuming the reader already knows the internal vocabulary

## 8.4 Metadata Rules

- `category / subcategory / platform` must remain stable
- `relatedPages` must be truly useful, not decorative
- `lastUpdated` must track real product changes

---

## 9. Troubleshooting Rules

See also:

- `docs/TROUBLESHOOTING-SOLUTIONS-MAINTENANCE.md`
- `docs/TROUBLESHOOTING-ISSUE-ANALYSIS.md`

This section only states the higher-level rules.

## 9.1 Core Goal

> Help the user fix the problem quickly.

## 9.2 Absolute Priorities

- search match quality
- symptom clarity
- cause clarity
- shortest viable fix path
- complete verification loop

## 9.3 Hard Prohibitions

- mirroring issue threads
- troubleshooting pages without a real fix
- troubleshooting pages without verification
- background-heavy pages with little user action

---

## 10. Metadata Rules

Metadata exists to:

- feed templates with semantic inputs
- support SEO and structured data
- support search, recommendation, and archives
- keep editorial maintenance stable

## 10.1 Do Not Add Decorative Fields

Before adding a field, ask:

- Will this be reusable over time?
- Does it improve semantics, SEO, or maintainability?
- Will at least 5 out of the next 10 similar pages plausibly use it?

If not, do not add it.

## 10.2 Prefer Semantic Fields Over Visual Fields

Prefer:

- `storyType`
- `topics`
- `difficulty`
- `platform`
- `relatedPages`

Be cautious with:

- `heroVariant`
- `accentColor`
- `layoutMode`
- `campaignTag`

## 10.3 Metadata Does Not Replace the Body

Metadata summarizes and indexes.

The body must still do the real work:

- narrate
- explain
- persuade
- deliver the content value

If the metadata feels more complete than the article, the article is usually underwritten.

---

## 11. Universal Pre-Publish Checklist

Every page should pass these questions before publication.

### 11.1 Section Check

- Does this clearly belong to this section?
- Has it drifted into the shape of another section?

### 11.2 Content Check

- Is the reader benefit obvious?
- Are there filler paragraphs?
- Are there repeated judgments?
- Would cutting 20% make it better?

### 11.3 Fact Check

- Has anything crossed the fact boundary?
- Has an allegation been written like a fact?
- Has editorial judgment been disguised as source-backed certainty?

### 11.4 Metadata Check

- Does the metadata match the body?
- Are `title / summary / dek / topics` doing different jobs?
- Are the sources strong enough to support the main framing?

### 11.5 Final Sentence Check

- What is the one sentence the reader is most likely to remember?

If you cannot answer that, the piece is usually not finished.

---

## 12. Special Rules Learned From the Stories Rewrite

These rules should stay.

## 12.1 Stories May Be Dramatic, But Not Cheaply Dramatic

Good drama:

- strong tension
- specific scene work
- clear role relationships
- strong pacing
- clean fact boundaries

Bad drama:

- rumor presented as fact
- certainty exaggerated for emotional effect
- stimulation without progression

## 12.2 Stories Most Commonly Decay Into Explainers

Typical decay path:

- the opening is strong
- the middle starts repeatedly explaining why the story matters
- the ending turns into a report summary

Correction:

- return to scene
- return to character
- return to conflict
- return to “what happened next?”

## 12.3 The Best Judgment Is Embedded in Structure

Do not summarize the lesson every two paragraphs.

Stronger judgment usually comes from:

- what details are included
- what order they appear in
- where the pacing slows down
- which line gets the ending

## 12.4 CoClaw’s Style Target

Not “correct like a corporate knowledge base.”

Instead:

> precise, readable, opinionated, and bounded.

---

## 13. Final Standard

CoClaw content should not only be correct.

It should make the reader feel:

- this site understands OpenClaw
- this site has real editorial judgment
- this page was worth finishing

If a page only achieves the first two, it is usually still not strong enough. A good CoClaw page should feel edited, intentional, and specific to its own material—not merely compliant with house rules.
