# Feature Specification: Sidecar retrofit

**Feature Branch**: `006-sidecar-retrofit`
**Created**: 2026-05-18
**Status**: Draft
**Input**: User description: "Sidecar retrofit — apply the usage template to all 14 shipped components" (full brief at `tmp/spec-006-sidecar-retrofit.md`)

## Background

Spec 005 shipped the sidecar foundation: the template at `packages/react/src/components/_template/Component.usage.md`, the compile validator at `scripts/validate-sidecars.ts`, the CI step that runs the validator on every PR, and `AGENTS.md` at the repo root with a component index that already links to every sidecar (the links resolve as each one merges).

The 14 per-component sidecars themselves got deferred from spec 005's US2 because each one deserves its own PR per FR-032, and 14 PRs in one spec implementation was too much. This spec finishes that work. Every shipped component gets a `<Component>.usage.md` file co-located with its source, with content drawn from the existing stories, autodocs, and TypeScript signatures.

After this spec lands, Section XI.3's promise that "an agent or human with a local clone can answer 'how do I use Button' with no network connection" is finally fully met across the whole shipped component surface.

## Clarifications

### Session 2026-05-18

- Q: Card sits in US1 (single-component) but its source exports six sibling sub-components (CardHeader, CardTitle, etc.) consumed as a tree. Should Card move to US2? → A: Yes — Card is structurally compound and belongs in US2. The operative definition of "compound" is "consumed as a slot tree," covering both dot-notation (Tooltip) and sibling-export (Card, Dialog, Tabs) shapes. US1 = 7 components, US2 = 7 components.
- Q: How do we handle Related-section links between sidecars when each lands in its own PR and the linked peer may not exist yet? → A: Forward-only Related sections per PR (link only to already-merged peers); a final "Related backfill" PR after the 14 component PRs retroactively populates each sidecar's Related to reach all peers. Keeps main free of broken links throughout. Total PR count = 15.
- Q: When TS signature, `argTypes`, and runtime default disagree, which one wins for the sidecar's prop table? → A: TS signature defines `Type` and required-vs-optional; the destructuring default in `.tsx` defines `Default` (because TS interfaces literally can't carry default values). `argTypes` is derivative — when it disagrees with the code, sidecar matches the code and the drift is flagged for spec 010.
- Q: Are multi-component code examples allowed in Common patterns (e.g., Label + Input, Tooltip + Button)? → A: Yes — allowed and expected when the focal component's use case requires another component for the example to be meaningful. Focal component stays the subject; supporting components are present only insofar as the example needs them. No dependency on the supporting component's sidecar being merged first.
- Q: When a sidecar author notices stale TSDoc/JSDoc during sidecar authoring, do they fix inline or defer? → A: Defer. Do not modify `.tsx` files in this spec. Append the drift to `specs/006-sidecar-retrofit/spec-007-inbox.md` on the per-component PR; spec 007 picks up the inbox as its starting backlog. Sidecar reflects the code's actual behavior, not what stale comments claim.
- Q: For compound sidecars, do we document every named export as a Props subsection, or only the "core" user-facing pieces? → A: Every named export gets a Props subsection. Subsection length is proportional to consumer reach — core slots (`Dialog.Content`, etc.) get full prop tables; escape-hatch slots (`Dialog.Portal`, etc.) get one-line "inherits all props from X; reach for this when Y" notes. No named export is silently omitted.
- Q: Per-PR changeset (one per component, 15 total) or one umbrella changeset for the whole cohort? → A: Per-PR (FR-013 as written). 14 component changesets + 1 backfill changeset, all aggregated into one release bump. CHANGELOG entry lists every component by name; each PR stays self-contained for revert purposes. Matches the repo's existing per-PR-changeset convention from spec 003.

## User Scenarios & Testing _(mandatory)_

Two consumer-facing user stories, partitioned by the structural difference between single-component sidecars (flat prop table) and compound-component sidecars (slot subsections per FR-010a from spec 005). Each story is independently testable; either one delivered alone is a viable partial release.

### User Story 1 - Single-component sidecars (Priority: P1)

A consumer browsing `packages/react/src/components/` should find a `<Component>.usage.md` file next to each single-component source. Single-component means the component is consumed as one element with a flat prop API — no slot tree, no sibling sub-components rendered inside. The seven components in this category are: Button, Checkbox, Input, Label, SkipLink, Switch, VisuallyHidden.

Each sidecar follows the structure from `specs/005-agent-experience-foundation/contracts/sidecar-shape.md`: heading + tagline, when-to-use paragraph, import code block, prop table, common usage patterns with compile-validated `tsx` examples, accessibility notes, variants and slots reference, and a Related section when relevant.

**Why this priority**: These are the simpler structural case and the more frequently used components. Shipping the seven single-component sidecars first delivers the bulk of consumer value and exercises the sidecar pattern across a meaningful breadth of components without the complexity of compound slots.

**Independent Test**: A consumer clones the repo. For any of the seven single-component types, the directory contains a `<Component>.usage.md` file at the same level as the `.tsx` source. Opening the file shows all required sections. The Common patterns code blocks all pass the CI validator (compile-tested via `tsc --noEmit`).

**Acceptance Scenarios**:

1. **Given** the repo at the conclusion of this user story, **When** a consumer lists `packages/react/src/components/Button/`, **Then** the directory contains `Button.usage.md`. (Same for Checkbox, Input, Label, SkipLink, Switch, VisuallyHidden.)
2. **Given** any of the seven sidecar files, **When** a consumer reads it, **Then** it includes Heading, When to use, Import, Props (flat table), Common patterns, Accessibility, and Variants and slots sections; the Related section appears when sibling primitives are relevant.
3. **Given** any of the seven sidecar files, **When** the CI validator runs, **Then** every `tsx` code block in the sidecar compiles via `tsc --noEmit`.
4. **Given** any one sidecar, **When** its prop table is compared against the source-of-truth rule (TS signature for Type, destructuring default for Default), **Then** the table matches the code; any `argTypes` drift is noted for spec 010.
5. **Given** the `AGENTS.md` component index after all seven PRs merge, **When** a consumer clicks a sidecar link for any of the seven, **Then** the link resolves to the live file.

---

### User Story 2 - Compound-component sidecars (Priority: P2)

A consumer browsing the same directory should find a sidecar for each compound component. Compound means the component is consumed as a slot tree — either dot-notation (`Tooltip.Provider` + `Tooltip.Trigger` + `Tooltip.Content`) or sibling exports rendered inside a root (`<Card><CardHeader>...</CardHeader></Card>`). Per FR-010a from spec 005, compound-component sidecars are a single file at the top-level component directory with slot subsections inside, not one file per slot. The seven components in this category are: Card, Dialog, SegmentedControl, Select, Slider, Tabs, Tooltip.

Each sidecar follows the same overall structure as US1 but with the Props section split into per-slot subsections (e.g., `### Provider props`, `### Trigger props`, `### Content props`), each with its own prop table. The Variants and slots section names every slot with a one-line role description.

**Why this priority**: Compound components are structurally more involved and a smaller number of components. Shipping them after the single-component cohort lets US1's review attention exercise the simpler shape first, surfacing any sidecar-template adjustments before the harder cases land.

**Independent Test**: For any of the seven compound component types, the directory contains a `<Component>.usage.md` file at the top level (not per-slot files). Opening the file shows the standard sections plus per-slot prop subsections. The Variants and slots section names every slot with its role.

**Acceptance Scenarios**:

1. **Given** the repo at the conclusion of this user story, **When** a consumer lists `packages/react/src/components/Tooltip/`, **Then** the directory contains exactly one `Tooltip.usage.md` file (not separate `Tooltip.Provider.usage.md`, `Tooltip.Trigger.usage.md`, etc.). (Same for Card, Dialog, SegmentedControl, Select, Slider, Tabs.)
2. **Given** any compound sidecar's Props section, **When** a consumer reads it, **Then** they find one subsection per slot, each with its own prop table.
3. **Given** any compound sidecar's Variants and slots section, **When** a consumer reads it, **Then** every slot the component exposes is named with a one-line role description.
4. **Given** any compound sidecar, **When** the CI validator runs, **Then** every `tsx` code block compiles.
5. **Given** the `AGENTS.md` component index after all seven PRs merge, **When** a consumer clicks a sidecar link for any compound component, **Then** the link resolves to the live file.

---

### Edge Cases

- **Component with no variants and no slots** (Label, SkipLink, VisuallyHidden): the Variants and slots section reads "No CVA variant axes. No compound slots; the component is rendered as a single element." — the section is required even when empty.
- **Component with only one common usage pattern** (Label is the canonical example): the Common patterns section may contain a single pattern. Per the spec 005 clarification, every sidecar gets a Related section when relevant pointing at sibling components (Label → Input, Switch).
- **Compound component with optional slots** (e.g., Slider.Indicator is optional): the Variants and slots section identifies which slots are required and which are optional.
- **MCP and sidecar disagree on a prop signature**: surfaces as a bug. Fixes during this spec's PR review. If the bug is in the component itself (the autodoc audit in spec 007 will surface those), defer to spec 007 or 010 — this spec MUST NOT change component behavior or API.
- **Stale TSDoc/JSDoc discovered during sidecar authoring**: do not fix inline. Append to `spec-007-inbox.md` per FR-015a; sidecar reflects what the code actually does, not what stale comments claim. Spec 007 handles the TSDoc pass.

## Requirements _(mandatory)_

### Functional Requirements

**Sidecar content (applies to all 14)**

- **FR-001**: Each component in `packages/react/src/components/` (excluding `_template/`) MUST have a co-located `<Component>.usage.md` file by the end of this spec
- **FR-002**: Each sidecar MUST follow the section structure defined by `specs/005-agent-experience-foundation/contracts/sidecar-shape.md`
- **FR-003**: Each sidecar's prop table MUST agree with the component's code. Source-of-truth rule: the TypeScript signature defines the `Type` column and required-vs-optional designation; the destructuring default in the component's `.tsx` implementation defines the `Default` column. Storybook `argTypes` is derivative — when it disagrees with the code, the sidecar matches the code and the `argTypes` drift is flagged for spec 010. Verified by manual review during each PR.
- **FR-004**: Each sidecar's described usage patterns MUST agree with the component's stories
- **FR-005**: Each sidecar's accessibility notes MUST capture what the component does for keyboard users and screen readers
- **FR-006**: Each sidecar's prose MUST pass humanizer review before merge per Section XI.1
- **FR-007**: Each sidecar's `tsx` code blocks MUST pass the CI validator (`scripts/validate-sidecars.ts`) — every block compiles via `tsc --noEmit`
- **FR-007a**: Common patterns code blocks MAY combine the focal component with other components from `@unbranded-ds/react` when the use case requires it (e.g., `<Label><Input /></Label>`, `<Tooltip>...<Button /></Tooltip>`). The focal component remains the subject; supporting components appear only to make the example realistic. Multi-component examples do not depend on the supporting component's sidecar being merged first — the CI validator only checks compile, not docs cross-references.
- **FR-008**: Each sidecar's Related section appears when sibling components or related primitives are relevant; the section is omitted when nothing relates. On the per-PR pass, Related links MUST point only at sidecars that are already merged to `main` at PR-author time — never at peers that don't yet exist on `main`. Forward-looking Related entries are added in the backfill PR (FR-014a), not in the original per-component PR.

**Single-component sidecars (US1)**

- **FR-009**: Each of the seven single-component sidecars (Button, Checkbox, Input, Label, SkipLink, Switch, VisuallyHidden) MUST contain one flat prop table, not slot subsections

**Compound-component sidecars (US2)**

- **FR-010**: Each of the seven compound-component sidecars (Card, Dialog, SegmentedControl, Select, Slider, Tabs, Tooltip) MUST be authored as a single file at the top-level component directory with per-slot subsections inside, not separate files per slot, per FR-010a from spec 005
- **FR-011**: Each compound sidecar's Variants and slots section MUST name every slot the component exposes with a one-line role description
- **FR-011a**: Each compound sidecar MUST contain a Props subsection for every named export the component exposes. Subsection length is proportional to consumer reach: core slots (the ones consumers compose directly — `Dialog.Trigger`, `Dialog.Content`, `Tabs.List`, `Tabs.Trigger`, `Tabs.Content`) get full prop tables with the `Type`/`Default`/`Description` columns. Escape-hatch slots (the ones rarely touched — `Dialog.Portal`, `Dialog.Overlay`, `Slider.Indicator` when optional) get a one-line subsection of the form: "Inherits all props from [underlying primitive]. Reach for this only when you need to [override scenario]." No named export is silently omitted.

**PR organization**

- **FR-012**: Each sidecar lands in its own PR per FR-032 from spec 005. 14 PRs total — one per component.
- **FR-013**: Each PR MUST add a `.changeset/add-<component>-sidecar.md` declaring `@unbranded-ds/react: patch`. Sidecar-only changes are documentation, not behavior or API; patch is the right level.
- **FR-014**: The `AGENTS.md` component index links resolve as each PR merges. (The index entries already exist from spec 005; this spec adds the targets.)
- **FR-014a**: After all 14 per-component PRs land, a final "Related backfill" PR retroactively populates each sidecar's Related section with links to peers that didn't yet exist when the original PR merged. The backfill PR ships its own `.changeset/sidecar-related-backfill.md` declaring `@unbranded-ds/react: patch`. Total PR count for this spec: 15 (14 sidecars + 1 backfill).

**Constraints (carry forward from spec 005)**

- **FR-015**: This spec MUST NOT change component behavior or public API. Issues that the sidecar work surfaces (a prop description that reveals an API inconsistency) are noted for spec 010 (constitution-driven retrofit) and do not get fixed in this spec.
- **FR-015a**: This spec MUST NOT modify `.tsx` source files — no TSDoc fixes, no comment cleanups, no rename touch-ups. When a sidecar author notices TSDoc/JSDoc drift, they append it to `specs/006-sidecar-retrofit/spec-007-inbox.md` (a running list shipped on the per-component PR, format: one bullet per drift site naming file path, line range, and the discrepancy). Spec 007 reads from this inbox as its starting backlog.
- **FR-016**: No sidecar's prose may contain three-item lists per Section XI.1. Code lists (e.g., the variant enum `size: 'sm' | 'md' | 'lg'`) are exempt.

### Key Entities

- **Single-component sidecar**: A `<Component>.usage.md` file with a flat prop table and the standard sections. One per component for the seven single-component types.
- **Compound-component sidecar**: A `<Component>.usage.md` file with per-slot prop subsections under Props and per-slot role descriptions under Variants and slots. One per top-level component for the seven compound types.
- **Per-component changeset**: A `.changeset/add-<component>-sidecar.md` file declaring a `@unbranded-ds/react: patch` bump. One per sidecar PR.
- **Spec 007 inbox**: `specs/006-sidecar-retrofit/spec-007-inbox.md` — a running list of TSDoc/JSDoc drift discovered during sidecar authoring, appended on each per-component PR, consumed by spec 007 as its starting backlog.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: All 14 shipped components have a co-located `<Component>.usage.md` file by the end of this spec. Verifiable by `find packages/react/src/components -name '*.usage.md' -not -path '*_template*' | wc -l` returning 14.
- **SC-002**: The CI validator passes on every sidecar — every `tsx` code block across all 14 files compiles via `tsc --noEmit`. CI's verify job stays green.
- **SC-003**: Every sidecar's prop table matches the component's TypeScript signatures, defaults, and required-vs-optional designations. Verified by manual cross-reference during each PR review.
- **SC-004**: No sidecar's prose contains a three-item list. Verifiable by reviewer or automated audit.
- **SC-005**: After all 14 per-component PRs merge, `AGENTS.md`'s component index has zero 404 links. A reader clicking any sidecar link from the index lands on a live file. After the FR-014a backfill PR merges, every inter-sidecar Related link also resolves — no broken links anywhere in the sidecar surface.
- **SC-006**: The cumulative line count of sidecar prose meets a non-trivial floor (a sidecar of ~5 lines isn't doing its job). Heuristic: each sidecar averages 60-150 lines depending on component complexity. Verifiable by line counts during review.

## Assumptions

- Spec 005 is on main with the sidecar template (`packages/react/src/components/_template/Component.usage.md`), the CI validator (`scripts/validate-sidecars.ts`), and the `AGENTS.md` component index in place. Verified at the start of this spec's implementation.
- The 14 components are the nine from 0.1.0 (Button, Card, Checkbox, Dialog, Input, Label, Select, Switch, Tabs), one from 0.2.0 (VisuallyHidden), and four from 0.3.0 (Tooltip, SkipLink, Slider, SegmentedControl). No additional components ship between spec 005 and this spec.
- "Manual review" is the verification mechanism for FR-003 and FR-004 (prop table agreement, usage pattern agreement). Future specs may add automated agreement checking between sidecars and the Storybook MCP, but that's out of scope here.
- Sidecar files are NOT included in the published `@unbranded-ds/react` npm artifact in this spec. Whether sidecars ship to npm is a separate decision tied to the package's `files` field; deferred to a future spec.
- The retrofit may run in any order. There's no priority among the 14 components for the per-PR work — alphabetical, by complexity, or by component importance all work. The implementer picks.

## Dependencies

- Spec 005 (agent experience foundation) merged to main — provides the template, validator, AGENTS.md, and constitution Section XI ratification this spec depends on
- Constitution at 1.1.1 or later (Section XI live, MCP SDK in Section VIII) — already on main as of spec 005's PR
- `@unbranded-ds/react@0.3.0` or later (the 14 components this spec documents) — already on npm

## Out of Scope

- The sidecar template itself — already shipped in spec 005
- The CI validator script — already shipped in spec 005
- The `AGENTS.md` index — already shipped; this spec just makes its links resolve
- Auto-generation of sidecars from component metadata — spec 005's research.md explicitly rejected this. Manual authoring through Section XI.1's prose rules is the value.
- Sidecar rendering inside Storybook docs — deferred to a future spec
- Component API or behavior changes the sidecar work surfaces — those go to spec 010 (constitution-driven retrofit), not here
- Per-package `AGENTS.md` files — deferred until there's clear demand
- Inclusion of sidecar files in the published npm package — separate decision
