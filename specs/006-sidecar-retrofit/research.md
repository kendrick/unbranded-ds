# Research: Sidecar retrofit

**Spec**: [spec.md](./spec.md) | **Plan**: [plan.md](./plan.md)
**Date**: 2026-05-18

## Premise

Spec 005 ratified the sidecar shape, shipped the template, the CI validator, the `AGENTS.md` index, and the constitution amendment (Section XI) that makes per-component sidecars a co-equal documentation surface. The remaining unknowns are operational: which structural bucket each component falls in, how to handle the per-PR atomicity of inter-sidecar links, and what wins when prop documentation could be sourced from three places. The /speckit.clarify session resolved every one of these. This document records the decisions so the implementer doesn't have to re-litigate them when reaching the per-component PRs.

Phase 0 research is unusually short for this spec because nothing here required a green-field investigation — the technical primitives all exist on `main`. The work is judgment calls about scope and rules, all of which the clarify session locked.

## Decision 1: Card classification

**Decision**: Card belongs in US2 (compound-component sidecars), not US1. The seven compound components for this spec are Card, Dialog, SegmentedControl, Select, Slider, Tabs, Tooltip. The seven single-component sidecars are Button, Checkbox, Input, Label, SkipLink, Switch, VisuallyHidden.

**Rationale**: Card's source exports six sibling sub-components (CardHeader, CardTitle, CardDescription, CardContent, CardFooter, CardAction) consumed as a tree of children inside a Card root. Structurally, Card is a slot tree — it's just notated by sibling exports rather than dot-access. The operative definition of "compound" that ratifies through to this spec is "consumed as a slot tree," which captures both dot-notation (Tooltip) and sibling-export (Card, Dialog, Tabs) shapes. Treating Card as single-component would have forced its sidecar to either flatten six sub-component prop tables into the root's (wrong) or document them as "related primitives" in a footnote (worse).

**Alternatives considered**:

- Keep Card in US1 with the sub-components mentioned only in a Related section. Rejected — sub-components are part of how Card is used, not "related primitives" you reach for separately.
- Invent a third structural class for sibling-export trees, distinct from dot-notation. Rejected as overkill; the user-facing distinction is "do I render slots inside it," not "what does the API surface look like in the import statement."

## Decision 2: Related-link timing under per-PR atomicity

**Decision**: Per-PR Related sections are forward-only — link only to sidecars already merged to `main` at PR-author time. After all 14 per-component PRs land, a final "Related backfill" PR retroactively populates every sidecar's Related section to reach all relevant peers. Total PR count: 15.

**Rationale**: Per-PR atomicity (FR-012) and zero-broken-links-on-main are both genuine constraints. Forward-only authoring gives both: each PR's `main` state is internally consistent, the backfill PR concentrates the inter-link work in one well-named cleanup, and the cohort still ships as 14 independent component-named PRs that a future maintainer can revert individually without breaking links to peers.

**Alternatives considered**:

- Strict dependency ordering. Rejected — over-constrains the implementation order and makes the work less parallelizable without delivering anything the backfill approach doesn't.
- Allow temporary 404s on `main` until the cohort completes. Rejected — a consumer who pulls main mid-cohort and clicks a Related link expects the link to resolve.
- Drop Related sections from this spec entirely. Rejected — Related is part of the contract from spec 005; deferring it just postpones the work.

## Decision 3: Source-of-truth rule for prop tables

**Decision**: The TypeScript signature defines the `Type` column and required-vs-optional designation. The destructuring default in the component's `.tsx` implementation defines the `Default` column. Storybook `argTypes` is derivative — when it disagrees with the code, the sidecar matches the code and the `argTypes` drift is flagged for spec 010 via the `spec-007-inbox.md` mechanism.

**Rationale**: TypeScript interfaces and prop types literally cannot express a default value — they can only express "this prop is optional." The only place a runtime default actually lives is the destructuring assignment in the function body (`function Button({ size = 'md', ...props })`). Treating `argTypes` as derivative reflects what it is: a Storybook controls schema, not a fact-of-the-code source. When the code and `argTypes` disagree, the code is the truth.

**Alternatives considered**:

- TS signature wins for everything including Default. Rejected — underdetermined, since TS can't carry default values.
- `argTypes` wins because it's what Storybook already shows consumers. Rejected — `argTypes` can drift; the code is what consumers actually get at runtime.
- Author judgment case-by-case. Rejected — produces non-uniform sidecars and makes review harder.

## Decision 4: Multi-component code examples in Common patterns

**Decision**: Multi-component examples are allowed and expected in Common patterns when the focal component's use case requires another component for the example to be meaningful. The focal component remains the subject; supporting components appear only as needed for realism. Multi-component examples have no dependency on the supporting component's sidecar being merged first (the CI validator only checks compile, not docs cross-references).

**Rationale**: Several focal components — Label, Tooltip, Dialog, SkipLink — have no meaningful use without another component in scope. Label alone is just a `<label>` element; the use case is `<Label><Input /></Label>`. Forcing single-component examples would make these sidecars artificial.

**Alternatives considered**:

- Single-component examples only; multi-component scenarios get described in prose. Rejected — prose-only descriptions of "wire X to Y" are less useful than a 5-line code block.
- Multi-component examples only after the supporting component's sidecar is merged. Rejected — over-constrains ordering; the validator already enforces correctness independently of doc state.

## Decision 5: TSDoc drift handling

**Decision**: This spec MUST NOT modify any `.tsx` source file. When a sidecar author notices stale TSDoc/JSDoc while reading a component to write its sidecar, they append the drift to `specs/006-sidecar-retrofit/spec-007-inbox.md` (one bullet per drift site, naming file path, line range, and the discrepancy). The sidecar itself reflects what the code actually does, not what stale comments claim. Spec 007 reads the inbox as its starting backlog.

**Rationale**: FR-015 already prohibits behavior or API changes. Extending the constraint to all `.tsx` modifications (including comment-only edits) keeps this spec from accidentally pre-doing parts of spec 007. The inbox file gives that future spec a free intelligence layer it wouldn't otherwise have — every sidecar author becomes a TSDoc auditor for the component they touch.

**Alternatives considered**:

- Fix TSDoc inline as the sidecar author encounters it. Rejected — pulls spec 007's work forward unevenly and scope-creeps this spec.
- Don't record the drift either; spec 007 starts from scratch. Rejected — loses free intelligence; spec 007 then has to re-discover what 14 authors already saw.

## Decision 6: Compound sidecar coverage depth

**Decision**: Each compound sidecar contains a Props subsection for every named export the component exposes. Subsection length is proportional to consumer reach. Core slots (Dialog.Content, Tabs.List, etc.) get full prop tables with Type/Default/Description columns. Escape-hatch slots (Dialog.Portal, Dialog.Overlay, etc.) get a one-line subsection: "Inherits all props from [underlying primitive]. Reach for this only when you need to [override scenario]." No named export is silently omitted.

**Rationale**: Completeness is the sidecar's promise — a consumer searching for `DialogOverlay` shouldn't hit a blank. But proportional length keeps the sidecar from being padded with restatements of "passes through to Base UI."

**Alternatives considered**:

- Only "core" slots get Props subsections; escape-hatch slots get named only in Variants and slots. Rejected — leaves a discoverability gap for the rarely-needed-but-real cases.
- All slots get equal-depth full tables. Rejected — produces 200+ line sidecars dominated by repetition.
- Per-component author judgment. Rejected — produces non-uniform sidecars and shifts the consistency burden onto review.

## Decision 7: Changeset granularity

**Decision**: Per-PR changeset. Each of the 14 component PRs ships its own `.changeset/add-<component>-sidecar.md` declaring `@unbranded-ds/react: patch`. The backfill PR ships `.changeset/sidecar-related-backfill.md` at the same level. All 15 changesets aggregate into one release bump; the CHANGELOG entry for that release lists every component by name.

**Rationale**: The repo's per-PR-changeset convention (set in spec 003) treats every PR as self-contained for revert and history purposes. A consumer skimming the CHANGELOG for "0.3.1" sees concretely what shipped (Button sidecar, Card sidecar, etc.) rather than one opaque "sidecar retrofit" entry. The "noisy changesets directory" is cosmetic — changesets clears on release.

**Alternatives considered**:

- One umbrella changeset for the whole cohort. Rejected — sacrifices per-PR atomicity for a CHANGELOG that says less.
- One changeset per user story (3 total). Rejected — splits the difference without delivering the benefit of either extreme.

## What this research does NOT cover

- Auto-generation of sidecars from component metadata. Spec 005's research.md rejected this on a "manual authoring is the value" rationale; nothing in this spec revisits it.
- Sidecar rendering inside Storybook docs. Deferred to a future spec.
- Inclusion of sidecar files in the published npm package. Tied to the package's `files` field; deferred.
- Automated agreement checking between sidecar prop tables and a component-metadata source. This spec stays on manual review (FR-003 and FR-004); automation is open to a future spec when there's enough signal that drift is a real cost.
