# Feature Specification: Autodoc legibility audit

**Feature Branch**: `007-autodoc-audit`
**Created**: 2026-05-18
**Status**: Draft
**Input**: User description: "Autodoc legibility audit — apply humanizer rules to stories and TSDoc for all 14 shipped components" (full brief at `tmp/spec-007-autodoc-audit.md`)

## Background

Section XI.1 (ratified in spec 005 at constitution 1.1.0) says every piece of written content passes through the humanizer skill before merge. The 14 currently shipped components were authored before XI.1 was binding. Their stories and TSDoc comments still contain prose that violates the rule — three-item lists, em-dash overuse, "serves as" phrasing, promotional vocabulary, hedging, signposting. Some prop descriptions tell consumers WHAT a prop does without telling them WHEN to reach for it (per FR-019 from spec 005, the same standard the sidecar contract applies).

This spec is a focused in-place pass on four prose surfaces per component. Git history is the audit ledger; there is no parallel audit-log document. The audit also closes the drift bullets seeded by spec 006's `spec-007-inbox.md` — six concrete items spec 006's authors flagged while reading the same source.

After this spec lands, the autodoc surfaces an agent or human encounters — Storybook autodoc, MCP tool descriptions, IDE hover, the published docs page — all read in the same humanizer-clean voice the rest of the design system already does.

## Clarifications

### Session 2026-05-18

- Q: Should prop descriptions be authored once in TSDoc (with Storybook's react-docgen propagating them to `argTypes.description`), or maintained independently in both places? → A: TSDoc-as-canonical. The TSDoc on the prop interface is the single source of truth for a prop's description. `argTypes.description` appears in stories.tsx only when the stories file needs to override the TSDoc-derived default (rare — e.g., a Storybook-UI-only note). The audit removes argTypes.description that just duplicates TSDoc.
- Q: How should the US1/US2 partition shift under TSDoc-as-canonical, since prop descriptions now live in `.tsx` rather than stories.tsx? → A: US2 owns all TSDoc (including prop descriptions, which propagate to Storybook's Controls panel via react-docgen). US1 owns only stories-meta items — the component-level `description` and per-story `parameters.docs.description.story`. Clean audience-axis partition preserved; each story independently shippable.
- Q: Should every named story carry a description, or only meaningful ones? → A: Every named story carries a description. Trivial variants get a tight one-sentence description naming the variant's use case — no multi-sentence filler. Uniformity is the contract; the humanizer's "specific over generic" rule keeps descriptions short.
- Q: How does TSDoc placement work for compound components (dot-notation like Tooltip vs sibling-export like Dialog)? → A: Both surfaces. Per-slot TSDoc on each function/declaration (what IDE hover surfaces when consumers hover `<Dialog.Content>` or `<CardHeader>`) AND an overview TSDoc on the aggregating export (the object literal for Tooltip/SegmentedControl, or the primary component for Dialog/Card). Both placements have distinct hover contexts; both deserve specific content.
- Q: How tightly do TSDoc/argTypes/story descriptions align to the sidecar's prose, and how do length expectations differ across surfaces? → A (initial): paraphrase with same intent. Per-surface length varies: prop-level TSDoc terse (1-2 sentences); component-level TSDoc terse (1-2 sentences); Storybook component banner lengthier (1-3 paragraphs); per-story description one tight sentence.
- Q (Q5-revised, after Q9 incorporation): With substantial-incorporation locked, Q5 collapses. Component-level TSDoc IS the rich surface (~one-line summary + `@remarks` + structured subsections + tables + `@example` + `@see`) and renders verbatim in both IDE hover AND the Storybook autodoc component banner via react-docgen. The `meta.parameters.docs.description.component` override in stories.tsx is reserved for the rare case where the TSDoc-derived banner needs a Storybook-specific tweak (e.g., a Storybook-UI-only note about live previews). One source of truth, same TSDoc-as-canonical principle from Q1 applied to component descriptions instead of just prop descriptions.
- Q (Q9 — incorporation of deep-research recommendations): Should spec 007 stay narrow (humanizer + WHAT+WHEN audit) or adopt the deep-research's structured TSDoc template? → A: Substantial incorporation. TSDoc adopts the 6-section component-level template (one-line summary → `@remarks` → `### Accessibility` → `### Keyboard interactions` → `### When to use` / `### When not to use` → `@example` → `@see`) and the 3-section prop-level template (description / behavior nuance / `@defaultValue` / optional `Accessibility:` prefix). Adds WAI-ARIA APG cross-reference links, keyboard tables (Radix-style `Key | Description`), layered `@example` blocks, and `{@link}` for sibling references. Operational caveat: TSDoc MUST be attached directly to the declaration it documents (no floating blocks between imports) — the shadcn registry CLI strips comments not attached to declarations. Reframes US1 / US2 priorities (TSDoc surface is now P1 since it drives both IDE hover and Storybook banner; stories-meta is P2). Docs-site / Figma-toolkit / status-taxonomy / a11y-status-matrix work defers to multiple smaller follow-up specs.
- Q: What does the WHAT + WHEN bar look like concretely so reviewers apply it uniformly? → A: WHAT = one short clause naming the prop's effect; WHEN = one short clause naming the consumer decision context (what makes a consumer choose this prop or pick a value). Reviewers reject descriptions that satisfy the rule textually but don't help a consumer decide — for example, "Reach for this when you want a different visual style" is a filler WHEN that restates the prop's purpose. Codified in FR-003 with anti-examples and good examples for reviewer reference.
- Q: Inbox bullets from spec 006 — explicit attribution to user stories, or "must close by end of spec" with attribution flexible? → A: Explicit attribution. Bullet 1 (Button argTypes drift) is dual-natured; primary closure obligation sits with US2 (the TSDoc edit). Bullets 2-6 are all US2 TSDoc work. Each story's "done" check includes its assigned bullets.

## User Scenarios & Testing _(mandatory)_

Two consumer-facing user stories. Under Q9's substantial-incorporation decision, the TSDoc surface drives the bulk of visible value (it renders in IDE hover AND Storybook component banner AND Storybook Controls panel via react-docgen), so it takes P1. Per-story descriptions remain a distinct stories-only surface that supplements the TSDoc work.

### User Story 1 - Structured TSDoc surface (Priority: P1) 🎯 MVP

A consumer hovering a component in their IDE, opening a Storybook autodoc page, or reading a Controls panel sees rich structured prose: a one-line summary, an extended description, an Accessibility section, a Keyboard interactions table where applicable, When-to-use / When-not-to-use guidance, layered `@example` blocks, and a WAI-ARIA APG cross-reference. The same TSDoc renders in all three surfaces via react-docgen propagation — one source, three audiences.

Every component function carries a structured TSDoc block following the 6-section template (FR-010). Every prop interface carries per-property TSDoc following the 3-section template (FR-011). Compound components carry both an overview TSDoc on the aggregating export and per-slot TSDoc on each named slot. Prose passes humanizer review. WAI-ARIA APG patterns are linked. The spec-006 inbox bullets close as part of this story.

**Why this priority**: TSDoc is now the canonical surface for component-level, prop-level, AND Storybook component-banner content (per Q1 + Q5-collapse). One edit reaches three audiences. The IDE-hover surface is the differentiator the deep research identifies as the gap in shadcn-style design systems — none of them surface accessibility, keyboard tables, or APG references inline. Shipping this first lands the bulk of the audit's value and the bulk of the deep-research differentiator.

**Independent Test**: A consumer opens any of the 14 component files in their IDE. Hovering the component function surfaces a TSDoc block that includes a one-line summary, accessibility behavior, keyboard interactions (table where applicable), when-to-use guidance, at least one `@example`, and a WAI-ARIA APG `@see` link. Hovering any prop surfaces a TSDoc that explains WHAT + WHEN with the FR-003 quality bar. Opening Storybook autodoc for the same component shows the same content rendered as the page banner; the Controls panel shows the same per-prop descriptions. Every inbox bullet from `specs/006-sidecar-retrofit/spec-007-inbox.md` is closed.

**Acceptance Scenarios**:

1. **Given** the repo at the conclusion of this user story, **When** a developer hovers a component function in their IDE, **Then** TSDoc surfaces the 6-section structured block (per FR-010) with humanizer-clean prose, an accessibility section, a keyboard table (where the component has keyboard behavior), at least one `@example`, and a WAI-ARIA APG `@see` link.
2. **Given** any exported prop interface in a component's `.tsx`, **When** a developer hovers it (or a Storybook visitor opens the Controls panel for that component), **Then** every property's TSDoc explains WHAT + WHEN per the FR-003 bar with the 3-section structure from FR-011.
3. **Given** the same component's Storybook autodoc page, **When** the page loads, **Then** the component banner shows the TSDoc-derived description (including subsection headers, keyboard table, examples, and APG link) rendered as Markdown via react-docgen.
4. **Given** any compound component (Card, Dialog, SegmentedControl, Select, Slider, Tabs, Tooltip), **When** a developer hovers any individual slot (`<Dialog.Content>`, `<CardHeader>`), **Then** per-slot TSDoc surfaces; the aggregating export carries an overview TSDoc.
5. **Given** the inbox at `specs/006-sidecar-retrofit/spec-007-inbox.md`, **When** the audit is complete, **Then** every bullet has a corresponding TSDoc edit that resolves the drift (the inbox file is then emptied or the bullets crossed out with a commit reference).
6. **Given** the audited source files, **When** the existing component test suite runs, **Then** every test passes. Behavior and public API are unchanged.
7. **Given** the audited source files, **When** Storybook runs and renders every story, **Then** no rendering regressions appear. SSR-safety remains intact per Section IX bullet 6.

---

### User Story 2 - Per-story descriptions (Priority: P2)

A Storybook visitor reading any named story sees a one-sentence description explaining what use case the story exemplifies. Every named story across the 14 components carries a `parameters.docs.description.story` value.

This is the only stories-meta surface that has no TSDoc fallback — per-story descriptions can only live in stories.tsx. The `meta.parameters.docs.description.component` override is also part of this surface but is reserved for the rare case where the TSDoc-derived banner needs a Storybook-specific tweak (per Q5-collapse, the default is that TSDoc drives the banner).

**Why this priority**: Per-story descriptions add Storybook polish but they don't reach IDE-hover consumers or the agent introspection surface. They're a smaller value increment than US1's TSDoc work. Shipping after US1 means the Storybook banner and Controls panel are already populated when per-story descriptions land.

**Independent Test**: A consumer opens the deployed Storybook for any of the 14 components. Every named story has a description naming its use case in humanizer-clean voice. Trivial variant stories (e.g., Button's `Outline`, `Ghost`, `Secondary`) carry a tight one-sentence description.

**Acceptance Scenarios**:

1. **Given** the repo at the conclusion of this user story, **When** a reader opens any named story in Storybook autodoc, **Then** the story description names the use case it exemplifies in humanizer-clean voice.
2. **Given** any audited stories.tsx, **When** the file is scanned for AI tells, **Then** none remain in per-story prose (code unions like `'sm' | 'md' | 'lg'` are exempt).
3. **Given** the audited stories.tsx files, **When** Storybook is rebuilt and tests run, **Then** the test-runner stays green and stories render without regression.

---

### Edge Cases

- **Component file without existing TSDoc** (most current components): the audit adds TSDoc rather than rewriting. The "audit" framing covers both clean-existing-prose work and add-where-missing work. Under substantial incorporation (Q9), this is the predominant work mode — most components are TSDoc-empty today.
- **Component without keyboard behavior** (Card, Input, Label, SkipLink, VisuallyHidden): the `### Keyboard interactions` subsection is omitted entirely per FR-017. Don't add a "no keyboard interactions" placeholder — silence is the contract.
- **`@example` block that references a sibling component**: that's a multi-component example (allowed per the same logic as spec 006's FR-007a — sidecars allow multi-component examples). The validator confirms the import resolves; the sibling's TSDoc doesn't need to be in place first.
- **Prop description that's already humanizer-clean but only says WHAT**: the audit adds the WHEN context. A description like `"The variant value"` becomes `"The visual style for the button. Reach for 'destructive' when the action is irreversible..."`
- **Story description that's terse and serviceable**: prefer keeping it terse. The humanizer rule is "no AI tells," not "longer is better." A two-sentence story description that names the use case beats a five-sentence one that pads.
- **Three-item code list inside prose**: code unions like `'a' | 'b' | 'c'` are exempt from the no-three-item rule per Section XI.1. A prose list of three things is not.
- **TSDoc drift surfaces a Section XI.2 API issue** (e.g., a prop name violates the shared vocabulary): record the API issue for spec 010 (constitution-driven retrofit); do not rename the prop in this spec.
- **Prose surface disagrees with the corresponding sidecar from spec 006**: the audit aligns the autodoc surface to the sidecar's *intent* (same WHAT + WHEN, same use cases named). Verbatim copying is not required — the sidecar's "When to use" paragraph maps to the TSDoc's `@remarks` + `### When to use` subsection; the sidecar's Accessibility section maps to TSDoc's `### Accessibility` + `### Keyboard interactions`; the sidecar's prop-table Description column maps to per-prop TSDoc. The mapping is structural rather than copy-paste.

## Requirements _(mandatory)_

### Functional Requirements

**Audit scope (applies to all 14 components)**

- **FR-001**: This spec MUST audit the four prose surfaces per FR-021a from spec 005:
  - The component-level `description` in `stories.tsx` meta
  - Every prop's `argTypes.description` in `stories.tsx`
  - Every named story's `parameters.docs.description.story`
  - Every TSDoc comment block in the component's `.tsx` source
- **FR-002**: Every audited prose surface MUST pass humanizer review per Section XI.1. AI tells (em-dash overuse, three-item lists, "serves as," "ensures," "leverages," "robust," "powerful," "intuitive," "seamlessly," signposting, hedging) are removed.
- **FR-003**: Every prop's description (in TSDoc, which propagates to `argTypes.description`) MUST explain both WHAT the prop does AND WHEN a consumer would reach for it (per FR-019 from spec 005). The codified bar:
  - **WHAT**: one short clause naming the prop's effect on the component
  - **WHEN**: one short clause naming the consumer decision context — what makes a consumer choose this prop or pick a value
  - **Anti-pattern (WHAT only)**: `variant`: "The visual style of the button." (no WHEN)
  - **Anti-pattern (filler WHEN)**: `variant`: "The visual style of the button. Reach for this when you want a different visual style." (textually meets the rule but doesn't help a consumer decide)
  - **Good (terse WHAT + meaningful WHEN)**: `delayDuration`: "Milliseconds the tooltip waits before opening on hover. Increase when triggers cluster densely and accidental hovers are common; decrease to ~200ms for tooltips on critical actions."
  - **Good (WHAT + WHEN with concrete consumer scenarios)**: `variant`: "The button's visual treatment. Pick by user intent: `default` for the primary action, `destructive` for irreversible actions (delete, sign out), `outline` or `ghost` for de-emphasized choices, `link` for inline navigation."

  Reviewers reject descriptions that meet the rule textually but don't help a consumer decide.
- **FR-004**: Every component's canonical component-level description (the TSDoc on the component function per FR-010, which renders in both IDE hover and the Storybook autodoc banner) MUST identify the consumer scenario the component addresses, in active voice. When the optional `stories.tsx` override is set per FR-007, it follows the same standard.
- **FR-005**: Every named story's description MUST name the use case the story exemplifies.
- **FR-006**: Three-item prose enumerations MUST be restructured to two, four, or a sentence per Section XI.1. Code unions (`'sm' | 'md' | 'lg'`) are exempt.

**Stories-meta surface (US2)**

- **FR-007**: For each of the 14 components, `stories.tsx`'s `meta.parameters.docs.description.component` field MAY be set as an override of the TSDoc-derived component banner — but it is no longer required. Per Q5-collapse, the TSDoc on the component function (FR-010) renders as the Storybook component banner via react-docgen by default. The override only fires when Storybook-specific content is genuinely needed (e.g., a Storybook-UI-only note about live previews, a link to a Chromatic build for visual reference). When the override is set, it MUST follow the same humanizer-clean voice and WHAT+WHEN intent as the TSDoc; when omitted, Storybook shows the TSDoc-derived banner unmodified.
- **FR-008**: Each prop's description appears in Storybook autodoc by being authored once in TSDoc on the prop interface (per FR-011). `argTypes.description` in stories.tsx is reserved for overriding the TSDoc-derived default and MUST be removed when it merely duplicates TSDoc. The audit removes duplicate `argTypes.description` values as it edits TSDoc.
- **FR-009**: Each named story across the 14 components MUST have a `parameters.docs.description.story` value that passes humanizer review. Trivial variant stories (those that differ from a peer by one prop) get a tight one-sentence description that names the variant's use case — no multi-sentence filler. The humanizer's "specific over generic" rule prefers short, concrete descriptions over padded ones. Uniformity across stories is the contract; consumers shouldn't have to wonder why some stories carry descriptions and others don't.

**TSDoc surface (US1)**

- **FR-010**: Each of the 14 components' `.tsx` source files MUST contain a structured TSDoc block on the component function following the 6-section component-level template:
  1. **One-line summary** (≤ 120 chars). Names what the component is in the same voice as Radix / React Aria (e.g., "A button triggers an event or action — submitting a form, opening a dialog, canceling an action.").
  2. **`@remarks` extended description** (2-6 sentences). Composition behavior, intended slot, polymorphism (`asChild` when relevant), and any non-obvious render semantics.
  3. **`### Accessibility`** subsection. ARIA pattern reference, ARIA roles applied automatically, focus management behavior, screen reader name resolution. Plain-prose enumeration.
  4. **`### Keyboard interactions`** subsection (where the component has keyboard behavior — applies to Button, Checkbox, Dialog, SegmentedControl, Select, Slider, Switch, Tabs, Tooltip). A Markdown table of `Key | Description`. Sourced from the spec 006 sidecar accessibility prose and the Radix/Base UI primitive's documented behavior. Omit the entire subsection for components without distinct keyboard behavior (Card, Input, Label, SkipLink, VisuallyHidden).
  5. **`### When to use`** and **`### When not to use`** subsections. Bulleted lists of consumer scenarios. The "When not to use" entries reference sibling components via `{@link}` (e.g., `Use {@link Switch} for two-state on/off controls.`).
  6. **`@example`** blocks — at least one minimum-viable example, plus 1-2 variants that exercise non-obvious features (`asChild`, controlled state, icon-only with `aria-label`, etc.). Each `@example` is preceded by a one-line label and fenced as `tsx`.
  7. **`@see`** lines for the WAI-ARIA APG pattern URL and (where relevant) the Radix/Base UI primitive docs URL. Sibling component cross-references use `@see {@link SiblingComponent}` notation.

  Placement varies by shape:
  - **Single-component shapes** (Button, Checkbox, Input, Label, SkipLink, Switch, VisuallyHidden): one structured TSDoc block on the component function.
  - **Compound shapes** (Card, Dialog, SegmentedControl, Select, Slider, Tabs, Tooltip): both surfaces. A per-slot TSDoc on each individual slot function/declaration (what surfaces when hovering `<Dialog.Content>` or `<CardHeader>`) AND an overview TSDoc on the aggregating export (the object literal for dot-notation compounds like Tooltip/SegmentedControl, or on the primary component for sibling-export compounds like Dialog/Card). The overview block carries the 6-section structure; per-slot blocks are shorter (one-line summary + accessibility + props pointer, no full keyboard table on slots that share the compound's keyboard model).
- **FR-011**: Each exported prop interface or type across the 14 components MUST have per-property TSDoc comments following the 3-section prop-level template:
  1. **One-sentence description** (active voice) explaining WHAT the prop does plus WHEN a consumer would reach for it per the FR-003 codified bar.
  2. **(Optional) one-sentence behavior nuance.** Edge cases, controlled vs uncontrolled, side effects on focus/ARIA. Reserve for props where the type signature doesn't communicate the nuance.
  3. **`@defaultValue`** — the literal default, in backticks (e.g., `` `false` ``). Required when a default exists.
  4. **(Optional) Accessibility implication** as a single sentence prefixed with `Accessibility:` so it's `Cmd+F`-discoverable in rendered docs. Reserve for props where setting the value has an ARIA/keyboard/focus consequence.
  5. **(Optional) `@example`** — only for props whose behavior is hard to grasp from the type signature alone.

  Storybook's react-docgen propagates the description to `argTypes.description` automatically; the audit removes any duplicate `argTypes.description` in stories.tsx per FR-008. Per-prop TSDoc paraphrases the corresponding sidecar prop-table Description column with the same intent (same WHAT + WHEN, same use cases named) without copying verbatim.
- **FR-012**: Every bullet currently open in `specs/006-sidecar-retrofit/spec-007-inbox.md` MUST be resolved by a corresponding TSDoc edit (and, for bullet 1, an incidental stories.tsx argTypes cleanup). The inbox file is updated as bullets close — either remove the bullet or strike it through with a link to the resolving commit. Under the Q9 substantial-incorporation reframing, all six bullets are US1 work (the canonical TSDoc surface):
  - **Bullet 1 (Button argTypes drift)**: add per-prop TSDoc on `ButtonProps.size` listing all 8 values; remove the now-stale `options: [...]` array from `Button.stories.tsx` argTypes (or leave the override only if it's intentionally narrower for a Storybook-UI reason — but in this case it isn't).
  - **Bullets 2-3 (Dialog `showCloseButton` gaps on DialogContent and DialogFooter)**: per-prop TSDoc on the respective interfaces.
  - **Bullets 4-5 (Slider interface and slot-function gaps)**: per-slot and per-prop TSDoc on Slider components.
  - **Bullet 6 (SegmentedControl interface gap)**: per-prop TSDoc on SegmentedControl interfaces.

**Structural elements (US1 — required across the audit)**

- **FR-016**: Every component's TSDoc MUST include a `@see` link to the relevant WAI-ARIA APG pattern (e.g., `@see https://www.w3.org/WAI/ARIA/apg/patterns/button/` for Button). Where the component wraps a Base UI primitive, an additional `@see` link to the Base UI documentation page for the primitive is also included.
- **FR-017**: Every component with documented keyboard behavior MUST include a `### Keyboard interactions` Markdown table in its component-level TSDoc with `Key | Description` columns. Content is sourced from the corresponding spec 006 sidecar Accessibility prose and verified against the Base UI primitive's behavior. Components without keyboard interaction (Card, Input as a plain `<input>`, Label, SkipLink, VisuallyHidden) omit this subsection.
- **FR-018**: Every component's TSDoc MUST include at least one `@example` block. The first example is the minimum viable usage; subsequent examples (1-2 more) layer non-obvious features (`asChild`, controlled state, icon-only with `aria-label`, edge-case configurations). All `@example` blocks are tagged `tsx` and pass the same compile validator that spec 005 wired up for sidecars — see FR-019.
- **FR-019**: TSDoc `@example` code blocks MUST compile via `tsc --noEmit`. Extend the existing sidecar validator at `scripts/validate-sidecars.ts` to also extract and compile `@example` blocks from `.tsx` source TSDoc, OR add a sibling validator that does so. Either way, the CI verify job stays green and broken examples in TSDoc fail the same way broken examples in sidecars do.
- **FR-020**: Sibling-component cross-references in TSDoc MUST use the `{@link ComponentName}` notation so editors and TypeDoc consumers can resolve them. Plain-prose references (`"see also Switch"`) are not equivalent and MUST be rewritten as `{@link Switch}`.
- **FR-021**: TSDoc blocks MUST be attached directly to the declaration they document (component function, exported interface, exported type alias). No floating TSDoc blocks between imports or unattached to any declaration. Operational rationale: while this repo is consumed as a published npm package today and not via the shadcn registry CLI, the shadcn registry CLI strips comments not directly attached to declarations (shadcn-ui/ui issue #9206). Keeping TSDoc declaration-attached preserves it for any future consumer who copies the source through that path.

**Constraints (carry forward from the brief)**

- **FR-013**: This spec MUST NOT change component behavior or public API. API-shape issues that the audit surfaces (e.g., a prop name violating Section XI.2's shared vocabulary) are recorded for spec 010 — do not rename or restructure in this spec. The revised FR-030 from spec 005 explicitly permits prose-only edits to `.tsx` files since they don't affect behavior or API.
- **FR-014**: The existing component test suite MUST pass after every audit edit. Storybook stories MUST render. SSR safety (Section IX bullet 6) MUST remain intact — TSDoc edits cannot introduce browser-API references in component bodies.

**PR organization**

- **FR-015**: PR organization is at the implementer's discretion. A single bulk PR works because the audit is mechanical and each change is small. Multiple PRs — one per component, or grouped by category (single-component vs compound, or `0.1.0` cohort vs later) — also work. Each PR ships a `.changeset/audit-<scope>.md` declaring `@unbranded-ds/react: patch`.

### Key Entities

- **Prose surface**: One of the four FR-021a categories where a consumer or agent encounters component documentation. Each component has 4 prose surfaces; the spec audits 14 × 4 = 56 surfaces total, plus per-prop and per-story sub-surfaces inside.
- **Audit edit**: A single prose-level change to one surface — restructuring a three-item list, replacing a copula-avoiding "serves as," adding a WHEN clause to a prop description, et cetera. Mechanical; each edit is small.
- **Inbox bullet**: A drift item recorded by a spec 006 sidecar author. Six exist at spec 007 kickoff. Each closes as the corresponding TSDoc or argTypes edit lands.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: Every component's `.tsx` source carries a TSDoc block following the FR-010 6-section template (one-line summary → `@remarks` → `### Accessibility` → `### Keyboard interactions` where applicable → `### When to use` / `### When not to use` → `@example` × 1+ → `@see`). The block renders correctly in IDE hover AND propagates to the Storybook autodoc component banner via react-docgen. Verifiable by manual review per component plus opening Storybook and confirming the banner content.
- **SC-002**: Every prop on all 14 components has TSDoc on its interface declaration following the FR-011 3-section template (description with WHAT + WHEN per FR-003 → optional behavior nuance → `@defaultValue` → optional `Accessibility:` prefix → optional `@example`). The same prose surfaces in Storybook's Controls panel via react-docgen propagation. Verifiable by reviewer cross-reference during PR review.
- **SC-003**: Every named story's `parameters.docs.description.story` across the 14 components passes humanizer review (one tight sentence per story per FR-009).
- **SC-004**: Every TSDoc comment block in the 14 component `.tsx` source files passes humanizer review.
- **SC-005**: No three-item prose lists remain in any of the audited surfaces. Verifiable by reviewer or grep audit.
- **SC-006**: All six inbox bullets from `specs/006-sidecar-retrofit/spec-007-inbox.md` are closed by corresponding audit edits. The inbox file is empty or every bullet is struck through with a commit reference by the end of this spec.
- **SC-007**: Every component's TSDoc includes a `@see` link to the relevant WAI-ARIA APG pattern (per FR-016). Verifiable by grep for `apg/patterns/` across `packages/react/src/components/`.
- **SC-008**: Every component with documented keyboard behavior carries a `### Keyboard interactions` table in its TSDoc (per FR-017). Verifiable by checking the 9 keyboard-relevant components: Button, Checkbox, Dialog, SegmentedControl, Select, Slider, Switch, Tabs, Tooltip.
- **SC-009**: Every component's TSDoc includes at least one `@example` block (per FR-018). Verifiable by grep for `@example` across `packages/react/src/components/`.
- **SC-010**: Every `@example` block in TSDoc compiles via `tsc --noEmit` through the validator (per FR-019). CI's verify job stays green throughout.
- **SC-011**: Every sibling-component reference in TSDoc uses `{@link}` notation (per FR-020). Verifiable by grep for `{@link ` and confirming no plain-prose sibling refs slip through.
- **SC-012**: Every TSDoc block is attached directly to its declaration (per FR-021). Verifiable by manual review during each PR.
- **SC-013**: The existing component test suite passes without modification after every audit PR merges. CI's verify job stays green throughout.
- **SC-014**: Storybook stories render without regression. The Storybook test-runner (interaction + a11y) stays green throughout.

## Assumptions

- Spec 005 is on main with constitution Section XI ratified. Spec 006 is on main with `specs/006-sidecar-retrofit/spec-007-inbox.md` available as the starting backlog. Both verified at the start of this spec's implementation.
- The 14 components are the same set as spec 006: Button, Card, Checkbox, Dialog, Input, Label, SegmentedControl, Select, SkipLink, Slider, Switch, Tabs, Tooltip, VisuallyHidden. No new components are introduced between spec 005 and this spec.
- Humanizer review is manual during PR review. Future specs may add automated humanizer linting, but that's out of scope here.
- "WHAT + WHEN" prop descriptions are a quality bar enforced by reviewer judgment per the codified rule in FR-003. The bar requires a meaningful consumer decision context in the WHEN clause — not just textual satisfaction of the rule. Reviewer rejects descriptions like "Reach for this when you want X" where X is the prop's own purpose restated.
- This spec stays prose-only. No snapshot tests currently exist in the repo (verified by grep); prose edits cannot produce snapshot drift. Interaction tests (`play` functions) and a11y tests assert on DOM and behavior, not on autodoc prose, so they're unaffected by this audit.
- The sidecar text from spec 006 is the canonical voice and intent reference. The audit aligns each autodoc surface to the sidecar's *intent* (same WHAT + WHEN, same use cases named) structurally rather than verbatim. The component-level TSDoc (which renders in both IDE hover and the Storybook autodoc banner via react-docgen — see Q5-collapse) carries the rich 6-section structure with `### Accessibility`, `### Keyboard interactions`, layered `@example`, and `@see`; per-prop TSDoc carries the terse 3-section structure; per-story descriptions carry one tight sentence. Sidecar-to-TSDoc-section mapping is structural rather than copy-paste.

## Dependencies

- Spec 005 (agent experience foundation) merged to main — provides Section XI ratification, FR-019, FR-021a, and the revised FR-030 that permits prose-only `.tsx` edits
- Spec 006 (sidecar retrofit) merged to main — provides the sidecar text the audit aligns to, and the `spec-007-inbox.md` starting backlog
- Constitution at 1.1.1 or later (Section XI live) — already on main as of spec 005
- The 14 components currently shipped in `@unbranded-ds/react`

## Out of Scope

- Component API renames or restructures (a prop named `tone` should be `intent` per Section XI.2's shared vocabulary) — defer to spec 010
- Component behavior changes — defer to spec 010
- New components, new variants, new tests beyond regression
- Sidecars themselves — that work is spec 006, already merged
- Per-package `AGENTS.md` files — deferred until clear demand
- Automated humanizer linting — a future spec, not this one
- Sidecar rendering inside Storybook docs — deferred to a future spec

**Deferred to follow-up specs surfaced by the docs deep-research** (working titles; numbering TBD):

- **Status taxonomy + release tags**: adopt `@alpha`/`@beta`/`@public`/`@deprecated`. Surface in TSDoc, Storybook component-card badges, CHANGELOG entries, CLI install warnings. Optional API Extractor pipeline.
- **Accessibility differentiator**: per-component a11y status matrix (Carbon's pattern). Known-issues link per component (Primer's pattern). WAI-ARIA APG cross-references rendered in docs surface beyond TSDoc `@see`. Optional VPAT/ACR commitment when there's testing budget.
- **Designer handoff**: fork or adopt the GitHub Annotation Toolkit (CC-BY-4.0). Per-component anatomy diagrams (SVG or Figma). Stamp library for designers.
- **Docs site restructure**: separate MDX docs site beyond Storybook autodoc with the 6-section component-page template (Overview / Anatomy / Usage / API / Accessibility / Examples). react-docgen pipeline integration if chosen.
