# Feature Specification: Agent experience foundation

**Feature Branch**: `005-agent-experience-foundation`
**Created**: 2026-05-16
**Status**: Partially implemented — US1 (sidecar foundation) and US4 (token-query MCP) shipped on this branch; US2 (sidecar retrofit) and US3 (autodoc audit) deferred to follow-up specs 006 and 007 respectively. See the "Deferred work" section at the end of this spec for the breadcrumb.
**Input**: User description: "Agent experience foundation — AGENTS.md, sidecar template + retrofit, autodoc audit, token-query MCP decision" (full brief at `tmp/spec-005-constitution-and-agent-experience.md`)

## Clarifications

### Session 2026-05-16

- Q: For per-component sidecars with only one genuinely-common usage pattern (e.g., Label), how should we handle the count? → A: One pattern is fine when one is all there is. Every sidecar (regardless of pattern count) gets a "Related" section when relevant, pointing at sibling components or related primitives.
- Q: How are compound-component sidecars structured (Tooltip, Slider, SegmentedControl)? → A: One file per top-level component with slot subsections. Matches the one-`.tsx`-per-top-level source organization.
- Q: Should code examples inside sidecar markdown be compile-tested? → A: Yes, via a markdown code-block extractor that runs `tsc --noEmit` in CI. Authors write the examples they want; tooling confirms they compile. No coupling between sidecars and stories.
- Q: How detailed should AGENTS.md's tool inventory be? → A: Three lines per tool — name, one-line purpose, and a "useful when..." sentence that gives non-MCP-client readers context for when they'd reach for it.
- Q: What's the scope of the autodoc audit? → A: Four prose surfaces — the component-level `description` in stories.tsx meta, every prop's `argTypes` description, every named story's `parameters.docs.description.story`, AND every TSDoc comment block in component `.tsx` source files. FR-030 is loosened to forbid API/behavior changes specifically, since prose edits to TSDoc don't change behavior.
- Q: How is the audit recorded? → A: In-place edits, git history is the ledger. Commit per component (or per logical group), commit messages describe the change.
- Q: What input formats does the `contrast` MCP tool accept? → A: Color strings (hex, rgb, hsl) OR named token references like `'color.primary'` that get resolved against a theme. Agents author in token space; pre-resolving to hex defeats the purpose.
- Q: How does `palette` define a category? → A: Either flat (`'color'`) or hierarchical (`'color.foreground'`). Implementation walks the token tree starting at the given prefix.
- Q: What testing does the token-query MCP need? → A: Smoke test (`tools/list` returns the expected four tools) plus per-tool unit tests covering each tool's logic with mocked inputs. End-to-end deferred to a later spec.
- Q: How does the token-query MCP run — stdio, HTTP, or both? → A: stdio CLI binary only for v1. The MCP is exposed as a binary entry on `@unbranded-ds/tokens` and consumers invoke it via their MCP client config (`{ command: 'npx', args: ['@unbranded-ds/tokens', 'mcp'] }` or equivalent). No hosting required; tokens are already local once the package is installed. HTTP transport can be added in a future spec if remote access becomes a real need.
- Q: Should the local `@unbranded-ds/react` MCP land in spec 005? → A: Defer to a future spec, but extract shared MCP infrastructure (stdio harness, structured error format, testing scaffolding) from the token-query MCP in this spec so the future react MCP is cheap to build. The token-query MCP becomes both a feature and the proof-of-shape for subsequent MCP servers.

## Background

Constitution Section XI (Agent and human legibility are co-equal) was ratified in a `/speckit.constitution` invocation earlier on this branch, bumping the constitution from 1.0.2 to 1.1.0. Edit 4 of that amendment also added a Section XI checkbox to `.specify/templates/plan-template.md`. Both edits are staged on this branch and represent prerequisites for the work below, not work this spec performs.

This spec covers the remaining work that makes Section XI's promises real for current and future consumers: the agent-readable index doc (`AGENTS.md`), the sidecar `*.usage.md` convention (a template plus retrofit onto every shipped component), an audit of existing autodoc prose for agent legibility, and a recorded decision on the token-query MCP referenced in Section XI.3.

## User Scenarios & Testing _(mandatory)_

Four consumer-facing user stories, ordered by dependency and impact. US1 must complete before US2 can fully land, since the retrofit copies from the template. US3 and US4 are independent of US1 and US2 and can run in parallel.

### User Story 1 - Sidecar foundation (Priority: P1)

A developer or agent landing in this repo for the first time needs to answer two questions: "what components ship here?" and "how do I use any one of them?". Today the answer requires the published Storybook MCP, which means a network connection, an MCP-capable client, and knowledge that the MCP exists. After this story lands, the answer is also available in two local artifacts: a top-level `AGENTS.md` that names the MCP endpoints and indexes every component, and a sidecar `*.usage.md` template that demonstrates the structure each component's sidecar will follow.

**Why this priority**: Foundation for US2. The retrofit cannot meaningfully begin without a template to copy from and an index that knows where the sidecars live.

**Independent Test**: A consumer clones the repo. Opening `AGENTS.md` from the root, they find the MCP connection string, a worked example, and an index of every shipped component pointing to its (future or actual) sidecar. Opening the template at `packages/react/src/components/_template/Component.usage.md`, they see the structure a sidecar follows: import, when-to-use summary, prop table, usage examples, accessibility notes, variants/slots reference.

**Acceptance Scenarios**:

1. **Given** a fresh clone of the repo, **When** a consumer reads `AGENTS.md`, **Then** they find the MCP connection string for the Chromatic-published Storybook MCP, a tool inventory, a worked example, and an index listing every shipped component with a one-line summary and a link to its sidecar
2. **Given** the sidecar template at `packages/react/src/components/_template/Component.usage.md`, **When** a consumer reads it, **Then** they see all required sections (import, when-to-use, prop table, usage patterns, accessibility, variants/slots) with placeholder content that demonstrates the expected voice and structure
3. **Given** the template, **When** an agent or contributor wants to add a new component, **Then** they can copy the template and fill it in without needing additional guidance

---

### User Story 2 - Sidecar retrofit (Priority: P2)

A consumer browsing `packages/react/src/components/` should find a `<Component>.usage.md` file next to every component's source. The 13 currently shipped components — nine from 0.1.0 plus four from 0.3.0 — each get their own sidecar with content drawn from the existing stories, autodocs, and source.

**Why this priority**: This is the bulk of the spec's deliverable. Without it, Section XI.3's promise that "an agent or human with a local clone can answer 'how do I use Button' with no network connection" is unmet.

**Independent Test**: For each of the 13 components, the directory contains a `<Component>.usage.md` file at the level of the `.tsx` source. Opening any one of them shows the structure mandated by the template. Cross-referencing one sidecar against `@storybook/addon-mcp`'s output for the same component shows the two agree on prop signatures, defaults, and described usage patterns.

**Acceptance Scenarios**:

1. **Given** the `packages/react/src/components/` directory, **When** a consumer lists the components, **Then** each component directory contains a `<Component>.usage.md` file
2. **Given** any `<Component>.usage.md` file, **When** a consumer reads it, **Then** it follows the template structure and shipping prose is humanizer-passed
3. **Given** the sidecar for any one component, **When** compared against the MCP response for the same component, **Then** the prop signatures, defaults, and usage patterns agree
4. **Given** any sidecar file, **When** scanned for prose patterns, **Then** it contains zero three-item lists (the LLM tic Section XI.1 prohibits)

---

### User Story 3 - Autodoc legibility audit (Priority: P3)

A consumer browsing the deployed Storybook reads prop descriptions in autodocs to understand how a component works. An agent introspecting the Storybook MCP reads the same prop descriptions for the same purpose. Today some of those descriptions explain WHAT a prop does without explaining WHY a consumer would reach for it; others contain three-item lists, em-dash overuse, or other AI tells from earlier writing passes. This story is a focused audit pass: read every component's `argTypes` and prop descriptions, run them through the humanizer skill, and fix issues in place.

**Why this priority**: Orthogonal to US2 and runs in parallel. The audit improves an existing surface (Storybook autodocs and the corresponding MCP responses) rather than building a new one.

**Independent Test**: A reviewer reads every component's stories.tsx prop descriptions and component-level description. Each prop description explains WHY a consumer would reach for the prop (not just WHAT it does). No three-item prose lists remain. No em-dash overuse, no promotional vocabulary, no signposting language. The component-level description names the consumer scenario the component addresses.

**Acceptance Scenarios**:

1. **Given** any component's stories.tsx file, **When** a consumer reads each prop's `description` in `argTypes`, **Then** the description explains both WHAT the prop does and WHEN a consumer would reach for it
2. **Given** the component-level description in any stories.tsx, **When** read by a consumer or agent, **Then** it identifies the consumer scenario the component addresses
3. **Given** any prose touched by this audit, **When** scanned, **Then** it contains zero three-item lists, zero em-dash overuse where commas work, and zero promotional vocabulary
4. **Given** the named stories from spec 004 (Wrapping an inline element, Multiple skip targets, the Slider touch play function), **When** reviewed, **Then** their story-level descriptions also pass the audit

---

### User Story 4 - Token-query MCP (Priority: P4)

Section XI.3 of the constitution references a "planned token-query MCP" that exposes theme listing, palette, contrast math, and semantic token lookup. This story implements a thin first version of that MCP. An agent or developer authoring a themed component can query the MCP for available themes, look up a token's current value, list all tokens in a palette category, and compute contrast for any two colors against the WCAG thresholds.

**Why this priority**: Lower urgency than the documentation work in US1–US3, which improve existing surfaces with immediate consumers. The token-query MCP is a new surface; consumers ramp up after it ships. A thin first version validates the shape before any thicker scope (color manipulation, theme diff, validator-as-a-tool) gets layered on.

**Independent Test**: An MCP client connects to the token-query MCP endpoint. `tools/list` returns four tools (`listThemes`, `palette`, `contrast`, `lookupToken`). Each tool returns structured JSON when called with valid arguments and a typed error payload when called with invalid arguments. A consumer can answer "what's the value of `color.primary` in the dark theme?" with a single MCP call.

**Acceptance Scenarios**:

1. **Given** the published token-query MCP, **When** an MCP client calls `tools/list`, **Then** the response includes `listThemes`, `palette`, `contrast`, and `lookupToken` with their input schemas
2. **Given** a `listThemes` call with no arguments, **When** the tool runs, **Then** it returns the list of theme keys exposed by `@unbranded-ds/tokens` (e.g., `["light", "dark", "brand"]`) and a one-line description of each
3. **Given** a `lookupToken` call with `{ token: 'color.primary', theme: 'dark' }`, **When** the tool runs, **Then** it returns the resolved CSS variable name and the current value (or a structured error if the token or theme is unknown)
4. **Given** a `contrast` call with two color values, **When** the tool runs, **Then** it returns the WCAG contrast ratio plus pass/fail for AA-normal, AA-large, AAA-normal, and AAA-large
5. **Given** a `palette` call with `{ category: 'color', theme: 'light' }`, **When** the tool runs, **Then** it returns every token under `color.*` with its name and current value
6. **Given** the constitution at the end of this spec, **When** read for the token-query MCP reference, **Then** the wording reflects that the thin first version has shipped, and the SYNC IMPACT REPORT's deferred TODO for the MCP is resolved

---

### Edge Cases

- **Component without meaningful variants** (e.g., `Label`, `SkipLink` if no CVA axes): the sidecar still requires a Variants/Slots section, which states "no variants" with a one-line rationale rather than listing empty content
- **Component with optional slots** (e.g., `Slider.Indicator`): the slots reference identifies which slots are required and which are optional
- **A prop whose description is genuinely simple** (e.g., `disabled` disables the component): the audit does not pad with synthetic WHY content. A description that's correct and complete in one sentence stays one sentence.
- **Sidecar prose that requires a list of exactly three items** (rare, but possible): per Section XI.1, restructure to two or four items, or convert to a sentence. The rule is non-negotiable.
- **MCP and sidecar disagree on a prop signature**: this surfaces as a bug. The fix lives in whichever surface is wrong; the sidecar is canonical for the project's current intent, the MCP is canonical for what consumers see when they query.

## Requirements _(mandatory)_

### Functional Requirements

**AGENTS.md (US1)**

- **FR-001**: An `AGENTS.md` file MUST exist at the repository root and be a peer document to `README.md` (linked from `README.md`, not nested under a section)
- **FR-002**: `AGENTS.md` MUST include the MCP connection string for the Chromatic-published Storybook MCP and the exact configuration block a consumer pastes into their MCP client
- **FR-003**: `AGENTS.md` MUST include a tool inventory for each published MCP tool. Each entry MUST have three lines: the tool name, a one-line purpose, and a "useful when..." sentence explaining when a consumer would reach for the tool. The format gives readers without an MCP client enough context to understand the tool's role without redundantly publishing the input schema (the live `tools/list` response is canonical for schemas).
- **FR-004**: `AGENTS.md` MUST include at least one worked example showing how an agent would compose components (e.g., "scaffold a Card with a primary Button")
- **FR-005**: `AGENTS.md` MUST include an index of every shipped component with a one-line summary and a link to its sidecar file
- **FR-006**: `AGENTS.md` MUST reference the planned token-query MCP per the resolution from US4 (either pointing at the implementation or naming it as planned)

**Sidecar template (US1)**

- **FR-007**: A template MUST exist at `packages/react/src/components/_template/Component.usage.md` and demonstrate the required structure with placeholder content
- **FR-008**: The template MUST cover: import statement, one-paragraph "when to use this" summary, prop table (type, default, description), common usage patterns with code examples, accessibility notes (keyboard, screen reader, ARIA), variants and slots reference, and a "Related" section that points at sibling components or related primitives
- **FR-009**: The template's usage-patterns section MUST contain either two or four common patterns, never three, per Section XI.1. Per-component sidecars MAY contain one pattern when the component has only one genuinely common usage shape; they MUST NOT contain three.
- **FR-010**: The template MUST itself be a valid example of the sidecar voice — humanizer-passed prose, no three-item lists, specific over generic
- **FR-010a**: Compound-component sidecars (Tooltip, Slider, SegmentedControl, and any future compound component) MUST be authored as one file per top-level component, with slot subsections inside the file. The filesystem mirrors the `.tsx` source organization (one `.tsx`, one `.usage.md`).

**Sidecar retrofit (US2)**

- **FR-011**: Each of the 14 currently shipped components MUST have a `<Component>.usage.md` file co-located with its source at `packages/react/src/components/<Component>/`
- **FR-012**: Each sidecar MUST follow the template's structure
- **FR-013**: Each sidecar's prop table MUST agree with the component's TypeScript signatures and `argTypes` defaults
- **FR-014**: Each sidecar's described usage patterns MUST agree with the component's stories
- **FR-015**: Each sidecar's accessibility notes MUST capture what the component does for keyboard users and screen readers (e.g., for Tooltip: hover and focus open, Escape closes; for Slider: arrow keys increment, Home and End jump to min and max)
- **FR-015a**: Each sidecar MUST include a "Related" section when one or more sibling components or primitives are relevant to the component's use cases. If nothing relates, the section is omitted (the sidecar does not include an empty placeholder section).
- **FR-016**: Each sidecar's prose MUST pass humanizer review before merge (per Section XI.1)
- **FR-017**: No sidecar's prose may contain three-item lists (per Section XI.1)
- **FR-017a**: Sidecar code examples MUST be validated for compile-correctness by a CI step. The validator extracts code blocks tagged as TypeScript or TSX from every `*.usage.md` file and runs `tsc --noEmit` against them. A failing extraction blocks merge. Sidecar prose authors write the examples they want; the validator confirms they compile. No coupling to stories files is required.

**Autodoc audit (US3)**

- **FR-018**: Every component's component-level description in stories.tsx MUST identify the consumer scenario the component addresses
- **FR-019**: Every prop's description in `argTypes` MUST explain WHY a consumer would reach for the prop (when, not only what)
- **FR-020**: All autodoc prose MUST pass humanizer review (no three-item lists, no em-dash overuse where commas work, no promotional vocabulary, no signposting)
- **FR-021**: Named stories introduced in spec 004 (the inline-element, multi-target, and touch-input stories) MUST have story-level descriptions that also pass the audit
- **FR-021a**: The audit covers four prose surfaces: (1) component-level `description` in stories.tsx meta, (2) every prop's `argTypes` description, (3) every named story's `parameters.docs.description.story`, and (4) every TSDoc comment block in component `.tsx` source files. All four MUST pass humanizer review.

**Token-query MCP (US4)**

- **FR-022**: A token-query MCP server MUST be published with four tools: `listThemes`, `palette`, `contrast`, and `lookupToken`. Inputs and outputs are JSON-serializable. The server MUST use the stdio transport — it runs as a CLI subprocess of the MCP client, not as a hosted HTTP service. Consumers invoke it via their MCP client config (e.g., `{ command: 'npx', args: ['@unbranded-ds/tokens', 'mcp'] }`).
- **FR-023**: `listThemes` MUST return all theme keys exposed by `@unbranded-ds/tokens` plus a one-line description per theme
- **FR-024**: `lookupToken` MUST accept `{ token: string, theme?: string }` and return the resolved CSS variable name and current value. A missing theme defaults to the package's default theme. Unknown token or theme returns a structured error payload following the FR-034 pattern from spec 004 (`{ component: 'tokens-mcp', issue: ..., ... }`)
- **FR-025**: `contrast` MUST accept two color values and return the WCAG contrast ratio plus pass/fail booleans for AA-normal, AA-large, AAA-normal, and AAA-large thresholds. Color values MAY be hex (`#ff0000`), rgb/hsl strings, or named token references (`'color.primary'`) that the tool resolves against the active theme before computing contrast.
- **FR-026**: `palette` MUST accept `{ category: string, theme?: string }` and return every token under the requested category with its name and current value. `category` MAY be a top-level name (`'color'`) or a dotted path (`'color.foreground'`) that drills into a subtree of the token namespace.
- **FR-027**: All four tools MUST emit typed error payloads (not free-form prose) on invalid arguments, per Section XI.4
- **FR-028**: The constitution MUST be updated to reflect that the thin first version of the token-query MCP has shipped, and the SYNC IMPACT REPORT's deferred TODO entry for the MCP MUST be resolved
- **FR-029**: `AGENTS.md` MUST include the token-query MCP connection string alongside the Storybook MCP connection string (FR-002), with at least one worked example showing how an agent uses the four tools (FR-004 extension)
- **FR-029a**: The MCP MUST have a CI smoke test that calls `tools/list` on the published endpoint and asserts the four tools (`listThemes`, `palette`, `contrast`, `lookupToken`) are present with their expected input schemas. Each tool MUST have unit tests covering its core logic with mocked inputs and the expected outputs, including the typed error shapes from FR-027. End-to-end integration tests are out of scope for this spec.
- **FR-029b**: The MCP implementation MUST factor reusable infrastructure (stdio transport harness, structured error helpers per FR-027, testing scaffolding) into a shape that a second MCP server in this monorepo can adopt without duplicating the runtime code. The exact physical layout is the implementer's call — a `mcp-runtime/` module inside `@unbranded-ds/tokens` is the working assumption — but the design MUST anticipate a future `@unbranded-ds/react` MCP consuming the same primitives. The future MCP is not implemented in this spec.

**Cross-cutting**

- **FR-030**: This spec MUST NOT change component behavior or public API. The audit MAY edit prose surfaces — `argTypes` descriptions, component-level descriptions in stories.tsx, story-level descriptions, AND TSDoc comments in `.tsx` source files — since prose edits do not constitute behavior or API changes. Component API renames or refactors that the audit surfaces remain deferred to spec 010.
- **FR-031**: This spec MUST NOT introduce a new package without explicit constitutional justification (Section I). The token-query MCP either lives as a binary entry inside `@unbranded-ds/tokens` (preferred — no new package) or, if it lives in a new package, the plan and tasks documents must name the consumer and explain why an existing package cannot serve.
- **FR-032**: Each of the 14 sidecar files MUST land in its own PR — one PR per component. Bulk PRs are disallowed for the retrofit, since per-component review is the value the slow path buys.

### Key Entities

- **AGENTS.md**: Repository-root document. Indexes shipped components, names MCP endpoints, includes worked examples and tool inventory. Peer to README.md.
- **Sidecar template**: A reference `*.usage.md` at `packages/react/src/components/_template/Component.usage.md`. Demonstrates the required sidecar structure with placeholder content.
- **Component sidecar**: A `<Component>.usage.md` file co-located with each component's source. Contains import, when-to-use summary, prop table, usage patterns, accessibility notes, variants/slots reference.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: A consumer cloning the repo can answer "how do I use Button?" (or any of the 14 components) using only local files — `AGENTS.md`, the component's sidecar, the stories file — with no network access
- **SC-002**: Every component in `packages/react/src/components/` has a co-located `<Component>.usage.md` file (14 total: nine from 0.1.0, VisuallyHidden from 0.2.0, four from 0.3.0)
- **SC-003**: An agent reading the Storybook MCP response for any component and the corresponding sidecar finds the same prop signatures, defaults, and usage patterns
- **SC-004**: No prose touched by this spec contains a three-item list (per Section XI.1, verifiable by careful review)
- **SC-005**: Every component's stories.tsx prop descriptions explain WHY a consumer would reach for the prop, not only WHAT it does
- **SC-006**: The token-query MCP is published and an MCP client connecting to it gets four working tools (`listThemes`, `palette`, `contrast`, `lookupToken`). The constitution wording reflects shipped status; the SYNC IMPACT REPORT's deferred TODO for the MCP is resolved.
- **SC-007**: All 14 sidecar files land as 14 separate PRs, each independently reviewable

## Assumptions

- The constitution amendment to 1.1.0 (adding Section XI) and the plan-template Constitution Check update were both completed by a prior `/speckit.constitution` invocation on this same branch. They are prerequisites met, not work in scope.
- The 14 components are the nine from 0.1.0 (Button, Card, Checkbox, Dialog, Input, Label, Select, Switch, Tabs), VisuallyHidden from 0.2.0, and the four from 0.3.0 (Tooltip, SkipLink, Slider, SegmentedControl).
- "Confirming the sidecar matches what `@storybook/addon-mcp` returns" is a manual review activity, not an automated check, for this spec. Automated agreement checking could be added in a future spec but is not required here.
- The token-query MCP implementation lives inside `@unbranded-ds/tokens` (preferred) as a binary entry, avoiding a new package per Constitution Section I. If `/speckit.plan` argues for a new package, the plan provides the written justification Section I requires.
- Sidecar retrofit PRs land one per component (14 separate PRs). Per-component review is what the slow path buys. The constraint is encoded in FR-032.
- No package version bump is implied by this spec on its own. `AGENTS.md` and sidecar files do not affect the published `@unbranded-ds/react` package contents unless the sidecar files are explicitly included in the published artifact (a separate decision, not made here).

## Dependencies

- Spec 002 (consumer DX preset) shipped — provides the `.sr-only` utility and the published 0.2.0 baseline
- Spec 003 (versioning workflow) shipped — provides the Changesets flow that any release-affecting work uses
- Spec 004 (primitive set expansion) merged — adds the four primitives whose sidecars are included in the retrofit
- Constitution at 1.1.0 with Section XI ratified — prerequisite for this spec's mandates to be enforceable
- Plan-template Constitution Check has the Section XI checkbox — prerequisite met during the constitution amendment

## Out of Scope

- Thicker token-query MCP capabilities beyond the four tools (color manipulation, theme diff, validator-as-a-tool, semantic-token hierarchy queries). The thin first version validates the shape; expansion lands in a later spec on consumer demand.
- A local `@unbranded-ds/react` MCP that parallels the Storybook MCP with offline component lookups. The sidecars in this spec are the data source such an MCP would consume, but the MCP server itself is deferred to a future spec. The shared MCP infrastructure built in FR-029b makes that future spec a thin layer over existing primitives rather than a from-scratch effort.
- Component API refactors surfaced by the autodoc audit. If the audit reveals a prop name that violates Section XI.2's shared vocabulary, the rename goes to spec 010's retrofit pass, not here.
- Per-package `AGENTS.md` files (one for `@unbranded-ds/tokens`, one for `@unbranded-ds/react`). Deferred until there is clear demand.
- Authentication on the published Storybook MCP. Constitution Section VII still says no.
- Automated sidecar/MCP agreement checking. The manual review activity in FR-013 and FR-014 is the verification mechanism for this spec. A future spec could add an automated check.
- Inclusion of sidecar files in the published `@unbranded-ds/react` npm package. Whether sidecars ship to npm is a separate decision tied to the package's `files` field and is not addressed here.

## Deferred work

Two of this spec's four user stories ship on follow-up specs rather than in this branch. The decision was made during `/speckit.implement` after US1 and US4 landed and the scope of US2 + US3 became clear: 28 per-component tasks across 14 sidecars and 14 autodoc audits, each benefiting from focused per-component review attention more than from being bundled into one mega-PR.

### Spec 006 — sidecar retrofit (deferred from US2)

Lands one `<Component>.usage.md` next to every shipped component using the template at `packages/react/src/components/_template/Component.usage.md` and validated by `scripts/validate-sidecars.ts` — both of which shipped on this branch. Per FR-032, one PR per component. The 14 sidecars are: Button, Card, Checkbox, Dialog, Input, Label, SegmentedControl, Select, SkipLink, Slider, Switch, Tabs, Tooltip, VisuallyHidden.

When the follow-up spec runs `/speckit.specify`, the brief is: "Apply the sidecar template at `_template/Component.usage.md` to all 14 shipped components, one PR per component. Each sidecar's prop table and described patterns agree with the component's TypeScript signatures and stories. Each sidecar's prose passes humanizer review."

### Spec 007 — autodoc audit (deferred from US3)

Lands a humanizer pass across four prose surfaces for every shipped component: the component-level `description` in stories.tsx meta, every prop's `argTypes.description`, every named story's `parameters.docs.description.story`, and every TSDoc block in `.tsx` source. Per FR-021a, all four surfaces must pass humanizer review. FR-030 (revised during clarify) allows TSDoc edits since prose changes don't constitute behavior or API changes.

When the follow-up spec runs `/speckit.specify`, the brief is: "Audit the four prose surfaces on every shipped component. Apply Section XI.1 rules: no three-item lists, no em-dash overuse, no promotional vocabulary, no signposting. Every prop description explains WHY a consumer would reach for it, not only WHAT it does."

### Tracking

- Constitution `SYNC IMPACT REPORT` deferred-TODOs section names both follow-up specs explicitly so the breadcrumb survives.
- `tasks.md` for this spec keeps the per-task detail for both deferred stories (T011–T038 still marked `[ ]`); the follow-up specs lift those entries when they run `/speckit.tasks`.
