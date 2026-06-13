# Implementation Plan: API and vocabulary harmonization

**Branch**: `013-api-vocabulary-harmonization` | **Date**: 2026-06-12 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/013-api-vocabulary-harmonization/spec.md`

## Summary

Bring the pre-XI.2 components onto a predictable API, under one non-negotiable constraint: stay compatible with shadcn/ui and Base UI. The work is discovery-gated. The audit (US1) runs first and no rename starts before it is reviewed.

Grounding during clarify and planning dissolved most of the assumed rename surface, because the library was built faithfully to shadcn/Base UI from the start:

- **Prop vocabulary**: already shadcn-flat (`variant` with shadcn's value set, `size`); no `intent`/`tone`/`appearance` prop exists. Expected near-empty.
- **Slots**: the compounds already expose shadcn's public slot names (`Content`/`Trigger`/`Item`), with Base UI's `Popup`/`Positioner` internal. Expected near-empty.
- **Polymorphic**: only **Tooltip** declares its own `as`; the Base-UI components inherit `render` by passthrough. A short tail (Tooltip, VisuallyHidden, maybe SkipLink), not ten components.
- **Structured failures**: the `warn()` helper (`lib/warn.ts`) already models the XI.4 shape, so this is applying it where prose-only warnings or throws remain.

So the substantive deliverables are the **audit** (which mostly confirms compliance and finds the short tail), the **Section XI.2 amendment** (compat-first, the lasting change), the **structured-failure pass**, and the **deprecation + codemod machinery** for whatever short tail the audit finds.

## Technical Context

**Language/Version**: TypeScript 5.x, strict mode, no `any`
**Primary Dependencies**: `@base-ui-components/react`, `class-variance-authority`, Storybook 10.3 (interaction + a11y), the `warn()` helper (`lib/warn.ts`), jscodeshift (NEW, for the rename codemods)
**Storage**: N/A (component library)
**Testing**: Vitest (unit), Storybook Test addon (interaction + a11y). Renamed components re-run their existing suites; the deprecation path and codemods get their own tests.
**Target Platform**: React components consumed in browser + SSR
**Project Type**: monorepo component library (`packages/react`)
**Constraints**: shadcn/ui + Base UI compatibility is non-negotiable (FR-015). Breaking changes ship behind a deprecation window (FR-011). Sidecars (XI.3) and TSDoc move in lockstep with each rename (FR-007). All prose through the humanizer (FR-013).
**Scale/Scope**: Audit covers every component. The actual renames are a short, audit-determined tail (polymorphic `as`→`render` plus any slot/prop drift the audit finds). One constitution amendment. One codemod per mechanical rename.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] **Section I/II (Repository shape)** — all work in `packages/react` (+ the constitution amendment and a migration note). No new package.
- [⚠] **Section XI.2 (Shared vocabulary)** — **this spec amends Section XI.2** (FR-016) to be compat-first: the shared vocabulary governs props/slots the design system introduces; props/slots inherited from a wrapped library follow the upstream name. A sanctioned MINOR amendment via the Section X procedure, shipped in this PR with its rationale. Not a violation; the amendment is the point.
- [x] **Section V (Stories are source of truth)** — each renamed component's stories move with the rename; the audit lists the stories in each entry's blast radius.
- [x] **Section VI (Testing, three layers)** — renamed components re-run unit + interaction + a11y; the deprecation alias and the codemods get dedicated tests.
- [x] **Section VII (Chromatic / VR disabled)** — unchanged; renames are API-surface, not visual.
- [x] **Section IX (Definition of Done)** — every renamed component re-satisfies stories, a11y, SSR-safety, and rendered autodocs (FR-012).
- [x] **Section X (Governance / changeset)** — a `@unbranded-ds/react` minor (pre-1.0 breaking) with a migration note enumerating every rename, codemods for the mechanical ones, and the XI.2 amendment in the same PR.
- [x] **Section XI.3 (Sidecars)** — each rename updates its sidecar in the same change (FR-007), so no sidecar describes a stale API.
- [x] **Section XI.4 (Structured failures)** — the structured-failure pass routes prose-only warnings/throws through `warn()`'s `{ code, path, message }` shape, including the deprecation warnings.

No violations. One governed amendment (Section XI.2), versioned and shipped in-PR.

## Project Structure

### Documentation (this feature)

```text
specs/013-api-vocabulary-harmonization/
├── plan.md              # This file
├── research.md          # Phase 0: deprecation-window pattern, codemod tooling, the audit method, the XI.2 wording
├── data-model.md        # Phase 1: the audit-entry schema, the rename + deprecation + codemod entities
├── contracts/
│   ├── audit-format.md          # the per-component audit table the gate produces
│   └── deprecation-and-codemod.md   # how old+new names coexist and warn; the codemod interface
├── quickstart.md        # Phase 1: audit → review → rename (lockstep) → codemod → migrate → verify
└── tasks.md             # Phase 2 (/speckit.tasks)
```

### Source Code (repository root)

```text
packages/react/
├── AUDIT-xi2.md (or specs/013/.../audit.md)   # the discovery audit deliverable (US1 gate)
├── src/components/<Component>/                 # the audit-determined short tail of renames:
│   ├── <Component>.tsx                         #   the prop/slot rename + the deprecation alias
│   ├── <Component>.usage.md                    #   sidecar, in lockstep (XI.3)
│   └── <Component>.stories.tsx                 #   stories, in lockstep (V)
├── src/lib/warn.ts                             # reused for the structured-failure pass + deprecation warnings
└── codemods/                                   # NEW — one jscodeshift transform per mechanical rename
.changeset/<name>.md                            # @unbranded-ds/react minor + the migration note (old→new)
.specify/memory/constitution.md                 # Section XI.2 amendment (minor bump)
```

**Structure Decision**: All component work in `packages/react`. The audit is the gating artifact; the renames are a short audit-determined tail; the codemods live in a new `codemods/` dir; the XI.2 amendment and the migration note ship in the same PR.

## The execution shape (audit-gated)

This spec has a hard internal gate, so the plan is two-phase, not a flat fan-out.

**Phase A — The audit (US1, the gate).** Enumerate, per component, each prop/slot that drifts from the shared/upstream vocabulary, with the proposed canonical name (defaulting to the upstream name), the blast radius (stories, sidecars, TSDoc, tests), codemod feasibility, and a hard-break-or-deprecate recommendation. **No rename starts until this is reviewed and approved.** The audit can fan out per-component (each component read independently), then converge into one reviewed list. Given the grounding, the audit is expected to confirm broad compliance and surface a short tail.

**Phase B — Execute the approved list (after the gate).**
- **The renames (parallel, per-component).** Each audit entry's rename, with its sidecar, TSDoc, stories, and tests moving in the same change. Disjoint component files, so the tail runs in parallel. Each ships the deprecation alias (old name accepted, warns via `warn()`).
- **The structured-failure pass.** Route any prose-only warning/throw the audit flagged through `warn()`'s `{ code, path, message }` shape.
- **The codemods.** One jscodeshift transform per mechanical rename (a prop or import rename), so a consumer migrates with one command.

**Phase C — Migration + governance + verify.** The migration note (every rename old→new) in the changeset and CHANGELOG, the Section XI.2 amendment, then full verification (renamed components green across unit/interaction/a11y, the codemods tested against a sample, the deprecation warnings fire).

So: **audit (gate) → reviewed list → parallel per-component renames + structured failures + codemods → migration note + XI.2 amendment → verify.** The parallel width is the size of the audit's tail, which grounding suggests is small.

## Research Summary

See [research.md](research.md). Grounded against the code:

- **The three rename categories are near-empty.** Prop vocab is already shadcn-flat; slots already use shadcn's public names; the polymorphic `as` is essentially Tooltip (the Base-UI components passthrough `render`). The audit confirms; the plan does not assume a large rename.
- **The slot target is shadcn's public names, not Base UI's raw anatomy.** Our `Dialog.Content` wraps Base UI's internal `Popup`; renaming the public slot to `Popup` would break shadcn compat. The audit aligns public slots to shadcn (which they already follow) and leaves Base UI internal.
- **`warn()` exists** (`lib/warn.ts`, `WarnPayload`), so the structured-failure pass and the deprecation warnings reuse it rather than inventing a shape.
- **Deprecation window**: accept both the old and new prop name for one minor, warn on the old via `warn()`, remove the next. The research settles the prop-alias mechanism (a small wrapper that maps the deprecated prop and emits the structured warning).
- **Codemod tooling**: jscodeshift is the standard for React prop/import renames; it is added as a dev dependency, with one transform per mechanical rename.

## Complexity Tracking

> No constitution violations to justify. The Section XI.2 change is a governed amendment, tracked above.

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| — | — | — |
