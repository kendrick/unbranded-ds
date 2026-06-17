# Implementation Plan: Fix the accessible-name pattern in form-control docs

**Branch**: `021-form-control-a11y-naming` | **Date**: 2026-06-17 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/021-form-control-a11y-naming/spec.md`

## Summary

Two threads, one patch release. First, correct the form-control docs that teach a native-`<label>` pattern which names nothing on Base UI's ARIA-role controls: Checkbox and Switch `@example` blocks and sidecars, plus the Slider basic example (currently unnamed). The corrected pattern mirrors the spec-019 story fixes exactly — `aria-label` for an unlabeled control; for a labeled one, keep the wrapping `<label>` (Checkbox) or `<Label htmlFor>` (Switch) for click-to-toggle AND add `aria-labelledby` pointing at a visible `<Label id>` to name the ARIA element. Second, add a dev-only `warn()` when a Checkbox/Switch/Slider renders with no accessible name, detected props-only (`aria-label` or `aria-labelledby`), emitted from a shared hook in `useEffect`, gated to development, scoped to those three controls.

Select and Input need no fix (audit confirms): the Select trigger is named by its value/placeholder content, and Input is a native `<input>` where `htmlFor` is correct (its file-input story already uses `aria-label`). The Range slider story's two `"Value"` thumbs become `"Minimum"`/`"Maximum"`. One patch changeset on `@unbranded-ds/react`.

## Technical Context

**Language/Version**: TypeScript 5.x, strict, no `any` (Constitution VIII). React 19.  
**Primary Dependencies**: `@base-ui-components/react` (peer), the existing `lib/warn.ts` helper, `lib/cn`. No new dependencies.  
**Storage**: N/A — a dev-only console warning; no runtime or persisted state.  
**Testing**: Vitest unit test for the new hook + per-component wiring (Constitution VI.1); the Storybook test-runner (interaction + a11y axe) already passes for these components after spec 019.  
**Target Platform**: ESM package consumed by React 19 / Next.js 15 App Router (RSC-aware).  
**Project Type**: component library (`packages/react`) and its co-located documentation surfaces.  
**Performance Goals**: N/A — the warning is dev-only and off any runtime hot path; production builds strip it.  
**Constraints**: SSR-safe (warn fires in `useEffect`, never at render — Constitution IX.6); dev-only (`process.env.NODE_ENV` gate, dead-code-eliminated in consumer prod builds); no change to the controls' rendered DOM (FR-006).  
**Scale/Scope**: 3 components get the warning; 3 components' docs corrected; 2 components audited (no change); 1 story updated; 1 new hook + test; 1 changeset.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-checked after Phase 1 design.*

- [x] **Section IV (components thin/unopinionated)**: no new component; the warning adds dev-only behavior with no DOM, style, or public-API change. The component set is unchanged.
- [x] **Section VI (three test layers)**: a Vitest unit test covers the warning's behavior matrix (unnamed → one warn; `aria-label`/`aria-labelledby` → none; production → none). Interaction and a11y layers already pass.
- [x] **Section VIII (tooling, strict TS, no `any`)**: the hook is fully typed (a props subset with optional `aria-label`/`aria-labelledby`). No new tooling.
- [x] **Section IX (DoD, SSR)**: the warning defers to `useEffect`, so no browser globals are touched at render; SSR output stays clean. Adding the hook makes `Checkbox.tsx` a client component (`'use client'`) — consistent with spec 017's handling and with Switch/Slider, which already carry the banner.
- [x] **Section X (changeset + compliance)**: one `.changeset/*.md` declaring a patch bump on `@unbranded-ds/react`. A patch is correct — no public-API or rendered-output change, a dev-only signal.
- [x] **Section XI.1 (prose humanized)**: the changed sidecar prose and any new `@example`/comment prose are human-facing and must pass the `humanizer` skill before merge.
- [x] **Section XI.2 (API shape)**: no new props (the clarify pass rejected a suppress prop). `aria-label`/`aria-labelledby` are standard ARIA, not introduced vocabulary.
- [x] **Section XI.4 (structured failure output)**: the warn payload carries a machine-parseable code (`issue: 'missing-accessible-name'`) plus `component` and `remedy`, matching the existing `warn()` convention.
- [x] **Section XI.5 (story coverage)**: minor, noted — the warning is a dev-tool console signal with no visual/interaction surface, so it is unit-tested rather than storied, consistent with the existing Slider `warn()` validations. The corrected naming patterns are already exercised by the spec-019 stories.

No violations. Complexity Tracking is empty.

## Project Structure

### Documentation (this feature)

```text
specs/021-form-control-a11y-naming/
├── plan.md              # This file
├── research.md          # Phase 0 — decisions (warn pattern, detection site, audit outcomes)
├── data-model.md        # Phase 1 — the named predicate, warn payload, scope, naming pattern
├── quickstart.md        # Phase 1 — how to verify
├── contracts/
│   └── accessible-name-warning.md   # Phase 1 — the warning's structured-output contract + matrix
└── tasks.md             # Phase 2 — created by /speckit.tasks
```

### Source Code (repository root)

```text
packages/react/src/
├── lib/
│   ├── use-accessible-name-warning.ts        # NEW — the shared dev-only hook
│   └── use-accessible-name-warning.test.tsx  # NEW — the behavior-matrix unit test
└── components/
    ├── Checkbox/
    │   ├── Checkbox.tsx        # add 'use client' + hook; fix the two @example blocks
    │   ├── Checkbox.usage.md   # rewrite the native-label examples to aria-labelledby/aria-label
    │   └── Checkbox.test.tsx   # assert the warning wiring (named → silent, unnamed → warns)
    ├── Switch/
    │   ├── Switch.tsx          # add hook; fix the two @example blocks
    │   ├── Switch.usage.md     # rewrite the htmlFor-only examples to add aria-labelledby
    │   └── Switch.test.tsx     # assert the warning wiring
    └── Slider/
        ├── Slider.tsx          # add hook to SliderThumb; name the basic @example thumb
        ├── Slider.usage.md     # ensure the single-thumb example names the thumb
        ├── Slider.stories.tsx  # Range story thumbs: "Value"/"Value" → "Minimum"/"Maximum"
        └── Slider.test.tsx     # assert the warning wiring (per-thumb)

# Audited, expected no change (confirm in a task):
#   components/Select/Select.tsx + Select.usage.md   (trigger named by content; out of warning scope)
#   components/Input/Input.tsx + Input.usage.md      (native input; htmlFor is correct)

.changeset/<name>.md            # NEW — patch @unbranded-ds/react
```

**Structure Decision**: Existing monorepo layout (Constitution I). All work lands in `packages/react`; no new package, no new top-level directory. The hook lives in `packages/react/src/lib` beside `warn.ts`, the helper it wraps.

## Complexity Tracking

No Constitution violations. Section not applicable.
