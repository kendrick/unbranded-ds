# Feature Specification: API and vocabulary harmonization

**Feature Branch**: `013-api-vocabulary-harmonization`
**Created**: 2026-06-12
**Status**: Draft
**Input**: User description: "API and vocabulary harmonization: a discovery-first audit then breaking renames that bring the pre-XI.2 components onto the shared prop/slot vocabulary, with codemods, a deprecation window, and sidecars/TSDoc updated in lockstep." (brief at `docs/workshops/2026-06-11/spec-013-api-vocabulary-harmonization.md`)

## Background

Constitution Section XI.2 says component APIs must be predictable by analogy: variant axes draw from a small shared vocabulary (`variant`, `size`, `intent`, `disabled`), compound slots use the `*.Root` / `*.Trigger` / `*.Content` / `*.Item` pattern consistently, and polymorphic rendering uses one prop name across the library. The components shipped before XI.2 was ratified (spec 005) were written without that constraint. Specs 005, 006, and 007 audited prose and docs but were explicitly forbidden from renaming props or slots; each recorded the API-shape issues it found and deferred them here (005 FR-030, 006 FR-015, 007 FR-013).

Spec 010 (Part A) already took the non-breaking half of the constitution retrofit: token consumption. This spec is Part B, the breaking half, the actual renames that bring the pre-XI components into XI.2 compliance. Keeping the two apart means a mechanical internal retrofit and a breaking API redesign land in separate releases, so the changeset, the review, and the migration note each stay coherent.

The work is gated on discovery. No one has enumerated the real violations yet, and no rename starts before that list exists and is reviewed. The audit is what turns "harmonize the API" from a direction into a bounded set of changes with a known migration cost.

## Clarifications

**One constraint overrides everything in this spec: the API must stay compatible with shadcn/ui and Base UI conventions, now and as they evolve.** This is non-negotiable. Where the constitution's XI.2 shared vocabulary and upstream conventions conflict, upstream wins, and this spec amends XI.2 to say so. The point of harmonizing is that a consumer or agent who knows shadcn/Base UI can predict our API, which only holds if our names track upstream rather than a bespoke set.

### Session 2026-06-12

- Q: When XI.2's shared vocabulary conflicts with shadcn/Base UI conventions, which is canonical? → A: Upstream wins. A component's prop/slot names mirror the library it wraps; XI.2's shared vocabulary governs only props/slots WE introduce. This spec amends Section XI.2 to be compat-first (a minor constitution bump).
- Q: shadcn folds semantic intent into variant (`variant="destructive"`); what happens to a separate `intent` prop? → A: Moot. A clarify-time audit preview found no `intent`/`tone`/`appearance` prop in the code: Button already uses shadcn's flat variant set, Tabs uses `variant`, SegmentedControl uses `variant`/`size`. The components are already shadcn-aligned on this axis; there is nothing to fold.
- Q: Folding into variant, what is the resulting value set? → A: Moot, nothing to flatten. A richer orthogonal variant-and-intent model would be new API surface; it is parked as a future spec (see ROADMAP), out of this spec's harmonization scope.
- Q: Base UI names compound slots Portal/Positioner/Popup/Backdrop, not the generic Content; which naming do our compounds use? → A: Match the upstream convention our PUBLIC API follows. Grounding showed our shadcn-style compounds already expose shadcn's public slot names (Content/Trigger/Item) and keep Base UI's Popup/Positioner internal, which is correct for both shadcn and Base UI compat; we keep that. (An earlier reading, "rename our slots to Base UI's raw anatomy," was rejected: it would break shadcn compat and rename slots we name correctly.) XI.2's generic pattern applies only to a compound that follows neither upstream.
- Q: Base UI uses the `render` prop for polymorphism; unify on which? → A: **Reversed by the US1 audit.** The audit found three distinct mechanisms in use — `asChild` (Tooltip, shadcn's Slot idiom), `render` (Base UI compounds, by passthrough), and `as` (VisuallyHidden, a leaf element-swap primitive) — not one prop split across `as`/`render`. Unifying on `render` would break shadcn's `asChild` and conflate different mechanisms. Resolution: document the split by lineage in Section XI.2, rename nothing, keep VisuallyHidden's `as`.
- Q: Which names does this spec touch? → A: Only our own drift. Rename props/slots WE introduced that diverge from the shared or upstream vocabulary; anything inherited from shadcn/Base UI keeps upstream's name untouched.
- Q: How do the breaking renames reach consumers? → A: A deprecation window by default (old and new coexist for one minor, the old warns with a structured XI.4 payload, removed the next), with the audit recommending a hard break only where a soft landing is impractical.

## User Scenarios & Testing _(mandatory)_

### User Story 1 - The discovery audit (Priority: P1) 🎯 MVP

A maintainer produces, for every component, the props and slots that break XI.2, each entry carrying the current name and the proposed canonical name, the blast radius (which stories, sidecars, TSDoc blocks, tests, and the example app move with the rename), whether a codemod can cover it or it needs a manual touch, and a recommendation to hard-break or deprecate. The list is reviewed and approved before any rename begins.

**Why this priority**: It is the gate. Every other story is scoped by this list, and the brief is explicit that no rename starts before it is reviewed. It is independently valuable on its own: even if the renames slipped, the audit is the bounded inventory of the library's API debt and its migration cost, which is the thing no one has today.

**Independent Test**: Produce the audit for the current component set and confirm every component appears, each flagged violation has a proposed canonical name, a blast radius, a codemod-or-manual call, and a break-or-deprecate recommendation. Confirm the list was reviewed and approved before any rename landed.

**Acceptance Scenarios**:

1. **Given** the current component library, **When** the audit runs, **Then** it lists every prop and slot that violates XI.2, each with its current name, proposed canonical name, blast radius, codemod feasibility, and a break-or-deprecate recommendation.
2. **Given** the completed audit, **When** it is reviewed, **Then** approval is recorded before any rename is implemented; the renames in later stories draw only from this approved list.
3. **Given** a component already compliant with XI.2, **When** the audit runs, **Then** it is recorded as compliant (no false renames invented for components that already conform).

---

### User Story 2 - Prop vocabulary harmonization (Priority: P2)

A consumer reads any component's props and finds shadcn's axis names everywhere: visual treatment is `variant` (shadcn's flat value set, where a semantic treatment like `destructive` is a variant value, not a separate prop), scale is `size`. Any bespoke synonym the audit flags (`tone`, `appearance`, `kind`, `color`-as-variant) is renamed to that set, with the sidecar, TSDoc, stories, and tests moving in the same change and a codemod for the mechanical cases.

**Why this priority**: It is the class spec 007 flagged, and the most consumer-visible axis when it drifts. The clarify preview found the current components already on this convention (Button's flat variant set, Tabs and SegmentedControl on `variant`/`size`), so the value here is mostly the audit confirming there is no drift rather than a large rename. If drift surfaces, this fixes it; if not, the story is satisfied by the confirmation.

**Independent Test**: For each component the audit flagged for a prop rename, confirm the canonical name is in place, the old name is handled per the deprecation decision, and the sidecar, TSDoc, stories, and tests reference only the new name. Confirm the codemod migrates a sample consumer call.

**Acceptance Scenarios**:

1. **Given** a component with a bespoke variant-axis prop the audit flagged, **When** the rename ships, **Then** the prop uses the shared vocabulary name and the sidecar, TSDoc, stories, and tests reference only it.
2. **Given** a consumer using the old prop name, **When** they upgrade, **Then** the codemod (for mechanical cases) renames their usage, or the deprecation path accepts the old name with a warning per the chosen policy.

---

### User Story 3 - Slot consistency (Priority: P3)

A consumer composing any compound finds shadcn's public slot names (`Content`, `Trigger`, `Item`, and the like) that the components already expose, built on Base UI's internal anatomy (`Popup`, `Positioner`). Where a compound's PUBLIC slot drifted from shadcn's convention, it is renamed back, with docs and tests in lockstep. Grounding found the compounds already follow shadcn's slot names, so this story is mostly the audit confirming compliance rather than a rename.

**Why this priority**: Slot names are how a consumer reasons about composition. Consistent slots let the same mental model carry across every compound, which is the composition half of XI.2. It is lower than prop vocabulary only because compounds are a smaller share of the API surface.

**Independent Test**: For each compound the audit flagged for a slot rename, confirm the slot uses the shared role name, the sidecar/TSDoc/stories/tests reference only it, and a codemod or documented manual step covers the consumer migration.

**Acceptance Scenarios**:

1. **Given** a compound with a slot named off-pattern, **When** the rename ships, **Then** the slot uses the shared role name and the compound's docs and tests reference only it.
2. **Given** the full compound set, **When** a consumer inspects any two, **Then** the same role uses the same slot name in both.

---

### User Story 4 - Polymorphic prop conventions (Priority: P4)

A consumer rendering a component polymorphically finds the idiom that matches the component's lineage, documented and consistent: `asChild` on shadcn-style Slot triggers (Tooltip), `render` on Base-UI-backed components (by passthrough), and `as` on the design system's own leaf element-swap primitives (VisuallyHidden). The split is documented in Section XI.2 rather than collapsed into one prop.

**Why this priority**: It is the one place the API was thought inconsistent. The audit (US1) established that the three are distinct mechanisms, not synonyms, and that unifying on one prop would break shadcn's `asChild`. Resolving it means writing the by-lineage rule into the constitution so the convention is predictable, not renaming anything.

**Independent Test**: Confirm Section XI.2 documents the polymorphic-by-lineage rule, that each component's polymorphic prop matches its lineage (Tooltip `asChild`, Base-UI compounds `render`, VisuallyHidden `as`), and that no polymorphic rename ships.

**Acceptance Scenarios**:

1. **Given** the audit's polymorphic finding, **When** the rule is written into Section XI.2, **Then** a reader learns which idiom applies to which lineage, and the components already match it.
2. **Given** a shadcn user, **When** they reach for `asChild` on a Slot trigger, **Then** it works, because the spec did not rename it to `render`.

---

### User Story 5 - Structured failure output (Priority: P5)

A consumer (or agent) that hits a component or helper warning or error receives a structured `{ code, path, message }` payload, with the human-readable string layered on top, matching the Section XI.4 shape the `warn()` helper and `validateTheme` already model. Prose-only warnings and throws are converted.

**Why this priority**: It is a distinct concern from the renames (failure shape, not naming), and a smaller surface, so it lands last. It matters for the agent-legibility differentiator: a structured failure is machine-parseable where a prose string is not.

**Independent Test**: For each component or helper the audit flagged with a prose-only failure, confirm it now emits `{ code, path, message }` and that the human-readable message is still present.

**Acceptance Scenarios**:

1. **Given** a component or helper that warned or threw with a prose-only message, **When** the failure path runs after this change, **Then** it emits a structured `{ code, path, message }` payload with the readable string layered on.
2. **Given** the structured payload, **When** an agent inspects it, **Then** it can branch on `code` and `path` without parsing prose.

---

### Edge Cases

- **A component is already XI.2-compliant**: the audit records it as compliant; no rename is invented for it.
- **A rename is not mechanical** (a prop whose meaning shifts, not just its name): the audit flags it manual; it gets a documented migration step rather than a codemod, and the spec does not change the prop's semantics beyond the rename.
- **A consumer is mid-migration when a name is in its deprecation window**: both the old and new name work, and the old one warns, so a partial migration still runs.
- **The example app (spec 012) or a theme (spec 009) consumes a renamed prop or slot**: it updates in lockstep with the rename, in the same change, so no in-repo consumer references a stale name.
- **Two components disagree on a "canonical" name** (the audit proposes different names for the same role): the audit resolves it to one canonical name before any rename, so the shared vocabulary stays internally consistent.

## Requirements _(mandatory)_

### Functional Requirements

**The audit (US1, gating)**

- **FR-001**: The first deliverable MUST be a discovery audit enumerating, for every component, each prop and slot that drifts from the shared or upstream vocabulary, with the current name, the proposed canonical name, the blast radius (stories, sidecars, TSDoc, tests, example app), codemod feasibility, and a hard-break-or-deprecate recommendation. The proposed canonical name MUST default to shadcn/Base UI's name for that concept; XI.2's generic name is used only where upstream is silent.
- **FR-002**: No rename MUST be implemented before the audit is reviewed and approved. Every rename in FR-004 through FR-007 MUST trace to an approved audit entry.
- **FR-003**: The audit MUST resolve any conflict where the same role is proposed different canonical names, so the shared vocabulary is internally consistent before renames begin.

**The renames (US2, US3, US4)**

- **FR-004**: Any bespoke variant-axis prop the audit flags MUST be renamed to shadcn's vocabulary: visual treatment to `variant`, scale to `size`. Semantic intent stays folded into `variant` (shadcn's convention, `variant="destructive"`), not a separate prop. The clarify preview found the current components already on this convention (Button's flat variant set, Tabs and SegmentedControl using `variant`/`size`), so this category is expected to be minimal or empty; the audit confirms.
- **FR-005**: Compound slot names MUST match the upstream convention the component's PUBLIC API follows. Our shadcn-style compounds keep shadcn's public slot names (`Content`, `Trigger`, `Item`, and the like), which they already use; Base UI's internal anatomy (`Popup`, `Positioner`, `Portal`, `Backdrop`) stays internal and is NOT re-exposed as a renamed public slot. XI.2's generic pattern applies only to a compound that follows neither upstream. The audit flags only a public slot that drifts from the shadcn convention.
- **FR-006**: Polymorphic rendering MUST follow lineage rather than unify on one prop. A shadcn-style Slot trigger uses `asChild` (shadcn's convention); a Base-UI-backed component uses `render` (Base UI's, by passthrough); a leaf element-swap primitive the design system owns uses `as` (VisuallyHidden). The audit (US1) established these are distinct mechanisms, not synonyms, and that forcing one prop would break shadcn's `asChild`. The result is **documented in Section XI.2, not renamed** — there is no polymorphic rename.
- **FR-007**: Each rename MUST move the component's sidecar (XI.3), TSDoc (the spec 007 surface), stories, and tests in the same change, so no in-repo doc or test references a stale name.

**Structured failures (US5)**

- **FR-008**: Every component or helper the audit flags with a prose-only warning or throw MUST emit a structured `{ code, path, message }` payload per Section XI.4, with the human-readable string layered on top.

**Migration**

- **FR-009**: The change MUST ship a migration note in the changeset and CHANGELOG enumerating every rename (old name to new name).
- **FR-010**: Where a rename is mechanical (a prop or import rename), a codemod MUST be provided so a consumer migrates with one command.
- **FR-011**: The deprecation policy MUST follow the clarify decision: by default a deprecation window (old and new accepted for one minor, old warns, removed the next), with hard breaks only where the audit recommends.

**Constitution compliance**

- **FR-012**: Every renamed component MUST re-satisfy the Section IX Definition of Done (stories, a11y, SSR-safety, rendered autodocs).
- **FR-013**: All audit prose, the migration note, and any new doc copy MUST pass through the humanizer, with no three-item lists.
- **FR-014**: This spec MUST NOT change component behavior beyond what a rename strictly requires; it moves names, not semantics.

**Upstream compatibility (the overriding constraint)**

- **FR-015**: The harmonization MUST keep the API compatible with shadcn/ui and Base UI conventions. A prop or slot inherited unchanged from a wrapped library MUST keep the upstream name; the rename scope is the design system's own drift from the upstream or shared vocabulary, never the upstream conventions themselves.
- **FR-016**: This spec MUST amend Constitution Section XI.2 to be compat-first: the shared vocabulary governs the props and slots the design system introduces, while props and slots inherited from a wrapped library follow the upstream name. This is a MINOR constitution bump.

### Key Entities _(include if feature involves data)_

- **Audit entry**: one flagged violation. Carries the component, the current name, the proposed canonical name, the blast radius, codemod feasibility, and a hard-break-or-deprecate recommendation. The approved set of entries is the exact scope of every rename.
- **Shared vocabulary**: the XI.2 canonical names. Variant axes (`variant`, `size`, `intent`, `disabled`), the compound slot roles (`Root`, `Trigger`, `Content`, `Item`), and the one polymorphic prop. The target every rename moves toward.
- **Rename**: a single name change (a prop, a slot, or the polymorphic prop), with its lockstep doc and test updates, its codemod (if mechanical), and its deprecation treatment.
- **Structured failure**: the `{ code, path, message }` payload a warning or throw emits, with the readable message layered on.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: The audit enumerates every XI.2 violation across the component library; each entry has a canonical name, a blast radius, a codemod-or-manual call, and a break-or-deprecate recommendation. It is reviewed and approved before any rename.
- **SC-002**: After the renames, every component's variant-axis props use shadcn's vocabulary (`variant` with the flat value set, `size`), and no bespoke synonym (`tone`, `kind`, `appearance`, `color`-as-variant) or separate `intent` prop remains.
- **SC-003**: Every compound's public slots follow shadcn's convention (which they already use), so a shadcn user predicts ours; Base UI's internal anatomy is not exposed as a renamed public slot.
- **SC-004**: Polymorphic rendering follows lineage and is documented in Section XI.2 (`asChild` for shadcn Slot triggers, `render` for Base UI, `as` for leaf primitives); no polymorphic rename ships, and shadcn's `asChild` keeps working.
- **SC-005**: A consumer can migrate every mechanical rename with a single codemod command, and the migration note enumerates every rename old-to-new.
- **SC-006**: During the deprecation window, an old name still works and warns; after it, only the new name works.
- **SC-007**: No in-repo doc, story, or test references a renamed prop or slot's old name once its rename has shipped.
- **SC-008**: Every flagged failure path emits a structured `{ code, path, message }` payload an agent can branch on without parsing prose.
- **SC-009**: An agent or consumer who knows shadcn/ui and Base UI can predict a component's variant-axis props and compound slot names, because our names track upstream's rather than a bespoke set.

## Assumptions

- **shadcn/ui and Base UI compatibility is non-negotiable (decided).** The canonical vocabulary IS upstream's where it exists; the shared XI.2 vocabulary applies only to props/slots the design system introduces. This overrides XI.2 where they conflict, and this spec amends XI.2 to match.
- **The discovery audit defines the exact rename list.** This spec names the categories and the canonical vocabulary; the precise per-component renames come from the approved audit, so the FRs are scoped to "every entry the audit flags" rather than a hard-coded list. The canonical name an audit entry proposes defaults to the upstream name.
- **The prop-vocabulary category is likely minimal or empty (preview).** A clarify-time scan found no bespoke variant-synonym or `intent` prop: the components already use shadcn's flat `variant` set and `size`. The audit confirms this rather than assuming a large rename.
- **Polymorphic prop unifies on `render` (decided).** `as` becomes the deprecated alias. Ten components carry a polymorphic prop today, so this is the largest concrete rename.
- **Deprecation window is the default (decided).** Old and new names coexist for one minor, the old warns with a structured XI.4 payload, removed the next; hard breaks only where the audit recommends.
- **A breaking change ships as a pre-1.0 minor**, with a migration note and codemods, per the brief.
- **Specs 005, 006, 007, and 010 Part A are shipped**, having surfaced the API issues and completed the non-breaking token retrofit. Verified.
- **The example app (012) does not exist yet**, so it is a lockstep consumer only if it lands before this spec; today the in-repo consumers are stories, sidecars, TSDoc, and tests.

## Dependencies

- **Specs 005, 006, 007** — surfaced and recorded the API-shape issues this spec resolves (005 FR-030, 006 FR-015, 007 FR-013).
- **Spec 010 Part A** — the non-breaking token retrofit; this spec deliberately follows it so the breaking and non-breaking changes stay in separate releases.
- **Constitution Section XI.2** — the shared vocabulary this spec enforces; Section XI.3 (sidecars) and XI.4 (structured failures) set the lockstep doc and failure-shape rules.

## Out of Scope

- **Part A (token consumption)** — spec 010's scope, already shipped.
- **New components, new tokens, new variants** — this spec moves names, not surface area.
- **A richer orthogonal variant model** (splitting `variant` back into treatment and `intent` axes for the full grid) — adds expressiveness, so it is new API surface, parked as a future spec (see ROADMAP). This spec keeps shadcn's flat `variant` set for upstream compatibility.
- **Behavior changes beyond what a rename strictly requires** — semantics stay put; only names move.
- **Theme work (009) and the example app (012)** — except as downstream consumers that update in lockstep with each rename.
