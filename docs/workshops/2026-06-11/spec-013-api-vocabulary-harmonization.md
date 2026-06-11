# Spec 013 — API and vocabulary harmonization

**Target version:** breaking change to consumer component APIs; a minor bump (pre-1.0) with a migration note and, where feasible, codemods. The exact number depends on what ships before it.
**Depends on:** 005, 006, 007 (which surfaced and recorded the API-shape issues), and ideally lands after 010 Part A (the non-breaking token retrofit) so the two kinds of change stay in separate releases. The sidecars (006) and TSDoc (007) update in lockstep with each rename.
**Split from:** spec 010 (constitution-driven retrofit). 010 took Part A (token consumption: non-breaking, mechanical). This is Part B: the breaking API renames that enforce Section XI.2's shared vocabulary on the pre-XI components.
**Blocks:** nothing hard.

> Numbering note: "013" is indicative, following the tmp/ brief convention. The speckit script assigns the real spec number at `/speckit.specify` time based on the next available slot.

---

## Why this exists

Section XI.2 says component APIs must be predictable from analogy: variant axes use a small shared vocabulary (`variant`, `size`, `intent`, `disabled`), compound slots use the `*.Root` / `*.Trigger` / `*.Content` / `*.Item` pattern consistently, and polymorphic rendering uses one prop name across the codebase. The components shipped before XI.2 was ratified (spec 005) were written without that constraint. Specs 005, 006, and 007 audited prose and docs but were explicitly forbidden from renaming props or slots, recording every API-shape issue "for spec 010" instead.

Spec 010 took the non-breaking half (token consumption). This spec takes the breaking half: the actual renames. Splitting them keeps a mechanical internal retrofit out of the same release as a breaking API redesign, so the changeset, the review, and the migration note each stay coherent.

## Discovery comes first (the gating task)

No one has enumerated the actual violations. The first deliverable is an audit that produces, for every component, the props and slots that break XI.2, each with:

- the current name and the proposed canonical name
- the blast radius: which stories, sidecars, TSDoc blocks, tests, and the example app move with the rename
- whether a codemod can cover it, or it needs a manual touch

No rename starts before this list is reviewed. The audit is what turns "harmonize the API" from a vibe into a bounded set of changes with a known migration cost.

## Scope (the discovery audit sets the exact list)

These are the known and likely categories:

### Prop vocabulary

Rename bespoke variant-axis synonyms to the shared set. Any prop meaning "visual treatment" becomes `variant`; "semantic intent" becomes `intent`; "scale" becomes `size`. A `tone`, `kind`, `appearance`, or `color`-as-variant prop is the kind of thing that moves. Spec 007 flagged this class explicitly.

### Slot consistency

Every compound's slots use the same names for the same roles. `*.Root`, `*.Trigger`, `*.Content`, `*.Item` mean one thing across Dialog, Select, Tabs, Tooltip, SegmentedControl, Slider, and Card. Where a compound named a slot differently, rename to the shared pattern.

### Polymorphic prop unification

The repo mixes `as` (VisuallyHidden) and Base UI's `render` (Dialog, Select, Tabs triggers). Pick one prop name for "render as a different element" and apply it everywhere, or document the two as a deliberate split with a clear rule for which applies when.

### Structured failure output

Any component or helper that warns or throws with a prose-only message gets a structured `{ code, path, message }` payload per Section XI.4, with the human-readable string layered on top. The existing `warn()` helper and `validateTheme` are the model.

## Migration

Because these are breaking changes to consumer APIs, the spec ships:

- a migration note in the changeset and CHANGELOG enumerating every rename (old to new)
- codemods where the rename is mechanical (a prop or import rename), so consumers run one command
- a deprecation window where the team prefers a soft landing: accept both the old and new name for one minor, warn on the old, remove in the next. The discovery audit recommends per rename whether to hard-break or deprecate.

## Out of scope

- Part A (token consumption). That is spec 010's scope.
- New components, new tokens, new variants.
- Behavior changes beyond what a rename strictly requires. This spec moves names, not semantics.
- Theme work (009) and the example app (012), except as downstream consumers that update in lockstep with each rename.

## Constitution check (bridge rules)

This spec finally brings the pre-XI components into XI.2 compliance.

- Every renamed component re-satisfies the Section IX Definition of Done: stories, a11y, SSR-safety, autodocs.
- The sidecars (XI.3) and TSDoc (the spec 007 surface) update with each rename, in the same PR, so the docs never describe a stale API.
- The migration note and the audit prose pass through the humanizer.
- New structured-failure output follows the XI.4 shape.
- No three-item lists in the prose.

## References

- `tmp/spec-010-constitution-retrofit.md`: Part A (token consumption) and the original split recommendation that produced this spec
- `specs/007-autodoc-audit/spec.md`: defers prop renames and behavior changes here (Out of Scope, FR-013)
- `specs/006-sidecar-retrofit/spec.md`: defers API issues here (FR-015)
- `specs/005-agent-experience-foundation/spec.md`: FR-030 defers API refactors here
- `.specify/memory/constitution.md` Section XI.2: the shared vocabulary this spec enforces
