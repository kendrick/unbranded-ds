# Spec 010 — Constitution-driven retrofit

**Target version:** Part A is non-breaking (internal Tailwind-class swaps) and rides a `@unbranded-ds/react` patch. Part B, if kept here, is breaking and needs a minor bump with a migration note.
**Depends on:** 008 (the motion, ring, and z-index tokens must exist before components can consume them). The API-shape issues were surfaced by 005, 006, and 007.
**Blocks:** nothing hard. 009 (composition) noted that 010 "may want to lean on" multi-axis themes, but the token-consumption work here does not need 009.
**Assembled from:** deferrals deposited by specs 005, 006, 007, and 008. There was never a standalone brief by design; this document compiles what those specs kicked downstream.

---

## Why this exists

Several specs deliberately stayed prose-only or tokens-only and recorded the component-touching follow-up "for spec 010." Spec 005's foundation work, spec 006's sidecars, and spec 007's TSDoc audit all surfaced API-shape issues but were forbidden from changing component behavior or public API. Spec 008 introduced motion, ring, and z-index tokens but explicitly left the component swap to 010. This spec is where that accumulated retrofit lands.

The work splits into two halves with very different risk profiles. Read the split recommendation before scoping.

## The split (read this first)

**Part A — Token consumption (non-breaking, mechanical, ready now).** Swap hardcoded values in component source onto the spec 008 tokens. No public API change; these are internal Tailwind-class edits. Unblocked the moment 008 shipped.

**Part B — API and vocabulary harmonization (breaking, needs discovery).** Rename props and slots that violate Section XI.2's shared vocabulary. These are breaking changes to consumer component APIs, and nobody has enumerated the actual violations yet, so Part B needs a discovery audit before any rename.

**Recommendation: ship Part A as spec 010; move Part B to its own spec (a later number, e.g. 013).** Part A is non-breaking and ready; Part B is breaking and undiscovered. Bundling a mechanical internal retrofit with a breaking API redesign muddies the changeset, the review, and the migration note. Part A also fixes a live bug (A.3), so it should not wait behind Part B's discovery work.

The rest of this brief scopes Part A concretely and sketches Part B for the follow-up.

---

## Part A — Token consumption retrofit

### A.1 Motion token swap

Primitive components use Tailwind's built-in duration and easing utilities for their transitions because the DS motion tokens did not exist when those components shipped (Tooltip from spec 004 especially). Now that spec 008 ships the motion category, swap those transitions onto the DS tokens so the design system owns the timing surface.

- Find transition utilities in component source (hardcoded `duration-*`, `ease-*` timings).
- Replace with the DS motion tokens: `ease-standard` / `ease-decelerate` / `ease-accelerate` (these are real Tailwind utilities), and durations via `duration-[var(--duration-base)]` since Tailwind v4 has no named duration namespace (per spec 008 research).
- Tooltip's open and close transition is the primary target; Dialog, Select, and any other animated primitive follow.

### A.2 Ring width token swap

The focus-ring width `ring-3` is hardcoded 14 times across components. Spec 008 shipped `ring.width` (default 3px, the value those usages resolve to).

- Replace the 14 `ring-3` usages with the token (`ring-[length:var(--ring-width)]` or the equivalent).
- Behavior is unchanged at the default; the win is that a theme can now vary focus-ring thickness.

### A.3 Z-index scale swap (fixes a live bug)

Four portal components (Dialog, Select, Tooltip, SkipLink) all stack at a hardcoded `z-50`. A tooltip opened inside a dialog has no defined order over it. Spec 008 shipped an ordered `z-index` scale (overlay below popover below tooltip).

- Replace the 6 `z-50` usages with the appropriate scale stop per component: the dialog/overlay layer, the popover/select layer, the tooltip layer.
- This is the fix for the latent nested-overlay stacking bug, not only a tidiness change.

### Part A acceptance criteria

- No component source contains a hardcoded `ring-3`, `z-50`, or a built-in transition timing where a DS token now exists.
- A tooltip rendered inside an open dialog stacks above the dialog.
- The component test suite stays green. No public API change, and no behavior change beyond the corrected stacking order.
- Non-breaking: ships without a consumer migration note.

---

## Part B — API and vocabulary harmonization (sketch for a follow-up spec)

Surfaced by specs 005, 006, and 007, which recorded API-shape issues but were forbidden from renaming. Breaking; needs its own clarify cycle.

### B.0 Discovery first

Nobody has enumerated the actual violations. The first task is an audit that lists every prop and slot that breaks Section XI.2's shared vocabulary, with the proposed rename and the blast radius (which stories, sidecars, TSDoc, and consumer call sites move). Do not start renames before this list exists.

### Known and likely candidates

- **Prop names off the shared vocabulary.** Section XI.2 fixes the variant axes to `variant`, `size`, `intent`, `disabled`. Any bespoke synonym (a `tone` that should be `intent`, a `kind` that should be `variant`) gets renamed. Spec 007 flagged this class explicitly.
- **Slot-name consistency.** `*.Trigger`, `*.Content`, `*.Item`, `*.Root` must mean the same thing on every compound. The pre-XI components were written before the rule.
- **Polymorphic prop unification.** Pick one prop name for polymorphic rendering across the codebase (the repo currently mixes `as` and Base UI's `render`).
- **Structured failure output.** Any component or helper that warns or throws with prose only gets a structured `{ code, path, message }` payload per Section XI.4.

### Why it is a separate spec

Breaking API changes need a migration note, a coordinated bump (pre-1.0, a minor with a clear changelog), and codemods or a documented upgrade path. That is a different kind of work from Part A's internal swaps, and it should not delay the bug fix in A.3.

---

## Out of scope

- Everything in Part B, if you take the split recommendation (it becomes its own spec).
- New tokens or new components.
- Theme composition (spec 009) and the example app (spec 012).
- Changing the motion token values themselves (spec 008 set them).

## Constitution check (bridge rules)

Section XI is ratified. This spec is the one that finally enforces XI.2 (predictable API shape) on the pre-XI components.

- Part A touches component source, so the Section IX Definition of Done applies: tokens-only styling, stories cover variants, a11y clean, SSR-safe, autodocs render. The swaps must not regress any of these.
- Part B prose (the migration note, the discovery audit) passes through the humanizer.
- Any new structured-failure output follows the XI.4 shape.
- No three-item lists in the prose.

## References

- `specs/008-token-schema-growth/spec.md` — FR-020 and Out of Scope defer the component retrofit here; `research.md` notes the duration-token consumption form
- `specs/007-autodoc-audit/spec.md` — defers prop renames and behavior changes to 010 (Out of Scope, FR-013, edge cases)
- `specs/006-sidecar-retrofit/spec.md` — defers argTypes drift and API issues to 010 (FR-015)
- `specs/005-agent-experience-foundation/spec.md` — FR-030 defers API refactors to 010
- `tmp/post-008-pickup-notes.md` — the original 010 candidate list (slot/prop harmonization, motion swap, structured output)
- `.specify/memory/constitution.md` Section XI.2 — the shared vocabulary this retrofit enforces
