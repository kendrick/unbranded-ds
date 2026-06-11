# Implementation Plan: Constitution-driven retrofit (Part A — token consumption)

**Branch**: `010-constitution-retrofit` | **Date**: 2026-06-11 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/010-constitution-retrofit/spec.md`

## Summary

Consume the spec 008 tokens in component source: swap the focus-ring width (`ring-3` → `ring.width`, ~13 sites across 8 components), the overlay stacking layer (`z-50` → the `z-index` scale in Dialog/Select/Tooltip, which fixes the nested-overlay bug), and the overlay open/close timing (`duration-100`/`duration-150` → `motion` tokens plus a token easing). SkipLink stays out of the z-index swap; micro-transitions stay out of the motion swap. Non-breaking; ships as a `@unbranded-ds/react` patch.

## Technical Context

**Language/Version**: TypeScript 5.x, strict mode, no `any`
**Primary Dependencies**: Tailwind CSS v4 (`@theme` preset consumption), `@base-ui-components/react`, `class-variance-authority`, Storybook 10.3 (interaction + a11y test runner)
**Storage**: N/A (component library; no persisted data)
**Testing**: Vitest (unit), Storybook Test addon (interaction `play`), `@storybook/addon-a11y` + test-runner (a11y)
**Target Platform**: React components consumed in browser + SSR pipelines
**Project Type**: monorepo component library (`packages/react`); `@unbranded-ds/tokens` already on main provides the tokens
**Performance Goals**: N/A (static class-string edits)
**Constraints**: Non-breaking (no public API change except corrected stacking order). Tokens-only styling per Section IV. SSR safety per Section IX bullet 6. Visual regression stays disabled per Section VII.
**Scale/Scope**: 10 component files. Three swap types: ring (8 components), z-index (3 overlays), motion (3 overlays). One foundational syntax-lock, then per-component parallel edits, then verification.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] **Section I (Repository shape)** — no new package; all work in `packages/react`.
- [x] **Section IV (Components style through tokens)** — the swaps move from Tailwind built-in utilities (`ring-3`, `z-50`, `duration-100`) to utilities that reference design-system tokens. This increases token alignment. No hex/rgb/hsl literals introduced; the lint rule passes.
- [x] **Section V (Stories are source of truth)** — no story content changes (internal class edits). One new interaction test is added for the nested-overlay fix (tooltip-in-dialog stacking), which is a behavior now worth exercising per XI.5.
- [x] **Section VI (Testing, three layers)** — unit, interaction, and a11y must stay green. The bug fix adds an interaction assertion.
- [x] **Section VIII (Tooling baseline)** — no toolchain change.
- [x] **Section IX (Definition of Done)** — each touched component keeps tokens-only styling, story coverage, a11y, SSR safety, and rendered autodocs. The swaps cannot introduce browser-API access.
- [x] **Section X (Governance / changeset)** — ships a `@unbranded-ds/react` patch changeset.
- [x] **Section XI (Agent + human legibility)** — no prose or public-API change, so sidecars and TSDoc do not churn (they document props and usage, not internal class strings). No new failure modes. Predictable API preserved (Part B, the renames, is spec 013).

No violations. No concessions.

## Project Structure

### Documentation (this feature)

```text
specs/010-constitution-retrofit/
├── plan.md              # This file
├── research.md          # Phase 0: Tailwind v4 consumption syntax, easing mapping, transition-vs-animation nuance
├── data-model.md        # Phase 1: the swap-site catalog (which file, which value, which token)
├── contracts/
│   └── token-consumption-patterns.md   # The canonical snippet per token type that every component copies
├── quickstart.md        # Phase 1: implement + verify walkthrough
└── tasks.md             # Phase 2 output (/speckit.tasks)
```

### Source Code (repository root)

```text
packages/react/src/components/
├── Button/Button.tsx              # ring-3 → ring.width (2 sites)
├── Checkbox/Checkbox.tsx          # ring-3 (2)
├── Input/Input.tsx                # ring-3 (2)
├── Switch/Switch.tsx              # ring-3 (2)
├── Slider/Slider.tsx              # ring-3 (1)
├── SegmentedControl/SegmentedControl.tsx  # ring-3 (1)
├── SkipLink/SkipLink.tsx          # ring-3 (1); z-50 RETAINED (excluded)
├── Dialog/Dialog.tsx              # z-50 → overlay (2); duration-100 → motion (enter/exit)
├── Select/Select.tsx              # ring-3 (2); z-50 → popover (2); duration-100 → motion
└── Tooltip/Tooltip.tsx            # z-50 → tooltip (1); transition duration-150 → motion + easing

packages/react/                    # a new interaction test for tooltip-in-dialog stacking (per existing test convention)
.changeset/<name>.md               # @unbranded-ds/react: patch
```

**Structure Decision**: All edits are in `packages/react/src/components/`. Ten component files, each independently editable. No tokens-package or build-config change (the tokens already ship from spec 008).

## Parallelization

The user asked to parallelize. This spec parallelizes well because the work is **per-file and the files are disjoint** — once the consumption syntax is locked, ten component edits run concurrently with zero shared state.

**Step 1 — Lock the syntax (foundational, blocks the swaps).** Verify the four consumption patterns generate correctly against a real Tailwind build (see `contracts/token-consumption-patterns.md`):
- ring: `ring-(length:--ring-width)`
- z-index: `z-(--z-index-overlay)` / `z-(--z-index-popover)` / `z-(--z-index-tooltip)`
- duration: `duration-(--duration-fast)` — confirm it applies to **both** a `transition` (Tooltip) and a keyframe `animate-in/out` (Dialog, Select)
- easing: `ease-standard` (real utility), plus per-direction `data-open:ease-decelerate data-closed:ease-accelerate`

This produces the exact snippets every component copies, so the parallel edits are uniform and cannot drift.

**Step 2 — Per-component swaps (10-way parallel).** Each file is owned by one worker:
- **Ring-only (7)**: Button, Checkbox, Input, Switch, Slider, SegmentedControl, SkipLink. Each swaps its `ring-3` for the locked ring snippet. SkipLink does its ring swap but keeps its `z-50`.
- **Overlay (3)**: Dialog, Select, Tooltip. Each does its z-index stop + motion swap; Select also does its ring swap. One worker per overlay file does all of that file's swaps together.

No two workers touch the same file, so this is genuine 10-way parallelism.

**Step 3 — Verify (after all swaps converge).** Typecheck, lint, unit, Storybook interaction + a11y, grep for residual `ring-3` / overlay `z-50` / built-in overlay timings, and the new tooltip-in-dialog stacking test.

**Step 4 — Changeset.** One `@unbranded-ds/react: patch`.

So: **foundational syntax-lock → 10 parallel file edits → verify → changeset.** The middle is the widest fan-out we have had on a spec, because component files share nothing.

## Research Summary

See [research.md](research.md). Resolved:

- **Tailwind v4 custom-property syntax** is confirmed for z-index (`z-(--var)`) and the length-hinted form (`ring-(length:--var)` follows the documented `text-(length:--var)` pattern). The foundational step verifies the ring form against a build, with `ring-[length:var(--ring-width)]` as the fallback.
- **Easing mapping** (left to planning by the clarify): overlay enter uses `ease-decelerate`, exit uses `ease-accelerate`, applied via `data-open:` / `data-closed:` variants. This matches the token names and standard motion practice.
- **Transition vs animation**: Tooltip animates via `transition-[opacity,transform]`; Dialog and Select via keyframe `animate-in/out`. The duration token must apply to both cases — the foundational step verifies the keyframe path honors the token duration before the parallel edits rely on it.
- **`ring-1` is not in scope** — it is a hairline border ring, a different concern from the focus-ring width. Only `ring-3` maps to `ring.width`.

## Complexity Tracking

> No constitution violations to justify.

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| — | — | — |
