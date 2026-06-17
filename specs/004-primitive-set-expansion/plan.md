# Implementation Plan: Primitive set expansion

**Branch**: `004-primitive-set-expansion` | **Date**: 2026-05-16 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/004-primitive-set-expansion/spec.md`

## Summary

Add four React components — Tooltip, SkipLink, Slider, SegmentedControl — to `@unbranded-ds/react`. Tooltip and Slider wrap Base UI primitives. SegmentedControl wraps Base UI's RadioGroup with segmented-control visual styling. SkipLink is a thin in-house component built on a native `<a href>` plus the `.sr-only` utility from spec 002. All four follow the existing slot-and-variant patterns, ship in a bundled `@unbranded-ds/react@0.3.0` release, and meet Constitution Section IX DoD (including the SSR-safety gate added in 1.0.2 alongside this spec). Constitution Section XI is not yet ratified, but its bridge rules — predictable slot and prop naming, humanizer pass on autodocs, no prose three-item lists, structured failure output — apply to this work per the spec's brief.

## Technical Context

**Language/Version**: TypeScript 5.x, strict mode, no `any` (Constitution Section VIII)

**Primary Dependencies**:

- `@base-ui-components/react` — peer dependency. Tooltip primitive (Provider/Trigger/Content), Slider primitive (Root/Control/Track/Indicator/Thumb), RadioGroup primitive (Root/Item)
- `react` and `react-dom` 18+ — peer dependencies
- `@unbranded-ds/tokens@^0.2.0` — Tailwind preset + CSS variables
- `class-variance-authority` (`cva`) — variant logic
- `clsx` + `tailwind-merge` exposed as `cn()` — class composition
- `tsup` — ESM-only build
- Tailwind CSS v4 via `@unbranded-ds/react/preset.css`

**Storage**: N/A (component library; no persisted data)

**Testing**:

- Vitest — unit tests in `packages/react`
- Storybook Test addon — interaction tests via `play` functions
- `@storybook/addon-a11y` + test-runner — accessibility tests with zero `serious` or `critical` violations gate

**Target Platform**: Modern evergreen browsers (Chrome, Firefox, Safari, Edge — current and one prior major), with SSR safety for Next.js, Remix, and other server-rendering React frameworks (Constitution Section IX #6)

**Project Type**: React component library (sub-package within pnpm monorepo)

**Performance Goals**: Each new component adds negligible runtime cost beyond the wrapped Base UI primitive. Combined gzipped bundle-size target for the four together: under 8 KB. No formal latency target — component interaction must feel instant.

**Constraints**:

- WCAG 2.2 AA across all stories for the four new components (axe rule enforces serious and critical violations)
- SSR-safe — no `window` or `document` access at render time (Constitution Section IX #6)
- No hardcoded colors, radii, spacing, font sizes, or shadows (existing lint rule)
- No new wrapper API for things Base UI already exposes (FR-036 slot-name parity)
- All four components ship in one `@unbranded-ds/react@0.3.0` release; the Version Packages PR opened by Changesets is held until all four merge

**Scale/Scope**:

- 4 new components added to the existing 10 components
- ~16–20 stories total across the four (Default + variant stories + named stories per FR-030)
- ~16–24 unit tests covering CVA, `cn()` merging, and wrapper-specific logic
- ~12–16 play function assertions covering primary interactions
- 1 constitution amendment item (Section IX #6 SSR safety) bundled in this branch

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

Constitution version at planning time: **1.0.2** (amended on this branch to add Section IX #6 SSR safety; see `.specify/memory/constitution.md` SYNC IMPACT REPORT).

| Section                               | Gate                                                                                                | Status | Notes                                                                                                         |
| ------------------------------------- | --------------------------------------------------------------------------------------------------- | ------ | ------------------------------------------------------------------------------------------------------------- |
| I. Repository shape                   | No new packages                                                                                     | Pass   | All work in `packages/react`; no new top-level packages                                                       |
| II. Tokens independent of components  | Tokens unchanged                                                                                    | Pass   | No edits to `packages/tokens`                                                                                 |
| III. Theming contract                 | No new theming surface                                                                              | Pass   | Components consume tokens via the Tailwind preset                                                             |
| IV. Components thin and unopinionated | Base UI wraps, tokens only, `className` merged via `cn()`, no `@unbranded-ds/tokens` runtime import | Pass   | Tooltip, Slider, and SegmentedControl wrap Base UI primitives; SkipLink is a native `<a>` + `.sr-only`        |
| V. Stories source of truth            | Default + variants + play function + autodocs                                                       | Pass   | FR-030 names required stories per component; FR-031 mandates humanizer pass                                   |
| VI. Testing — three layers            | Unit + interaction + a11y                                                                           | Pass   | All three required by FR-030 and FR-033                                                                       |
| VII. Deployment and MCP               | No MCP surface change                                                                               | Pass   | New components surface through existing `@storybook/addon-mcp`                                                |
| VIII. Tooling baseline                | Per Section VIII                                                                                    | Pass   | No tool substitutions                                                                                         |
| IX. DoD per component                 | All nine bullets                                                                                    | Pass   | Including new bullet 6 (SSR safety)                                                                           |
| X. Governance                         | Constitution Check + per-PR changeset                                                               | Pass   | Branch amends constitution; each component PR adds a `.changeset/*.md` declaring `@unbranded-ds/react: minor` |

No violations. Complexity tracking section below stays empty.

## Project Structure

### Documentation (this feature)

```text
specs/004-primitive-set-expansion/
├── plan.md                    # This file
├── spec.md                    # Feature specification
├── research.md                # Phase 0 output
├── data-model.md              # Phase 1 output
├── quickstart.md              # Phase 1 output
├── contracts/                 # Phase 1 output
│   ├── Tooltip.md
│   ├── SkipLink.md
│   ├── Slider.md
│   └── SegmentedControl.md
├── checklists/
│   └── requirements.md        # Spec quality checklist
└── tasks.md                   # Phase 2 output, created by /speckit.tasks
```

### Source Code (repository root)

```text
packages/react/src/
├── components/
│   ├── Tooltip/                       # NEW (this spec)
│   │   ├── Tooltip.tsx
│   │   ├── Tooltip.stories.tsx
│   │   ├── Tooltip.test.tsx
│   │   └── index.ts
│   ├── SkipLink/                      # NEW (this spec)
│   │   ├── SkipLink.tsx
│   │   ├── SkipLink.stories.tsx
│   │   ├── SkipLink.test.tsx
│   │   └── index.ts
│   ├── Slider/                        # NEW (this spec)
│   │   ├── Slider.tsx
│   │   ├── Slider.stories.tsx
│   │   ├── Slider.test.tsx
│   │   └── index.ts
│   ├── SegmentedControl/              # NEW (this spec)
│   │   ├── SegmentedControl.tsx
│   │   ├── SegmentedControl.stories.tsx
│   │   ├── SegmentedControl.test.tsx
│   │   └── index.ts
│   ├── Button/                        # existing (0.1.0)
│   ├── Card/                          # existing (0.1.0)
│   ├── Checkbox/                      # existing (0.1.0)
│   ├── Dialog/                        # existing (0.1.0)
│   ├── Input/                         # existing (0.1.0)
│   ├── Label/                         # existing (0.1.0)
│   ├── Select/                        # existing (0.1.0)
│   ├── Switch/                        # existing (0.1.0)
│   ├── Tabs/                          # existing (0.1.0)
│   └── VisuallyHidden/                # existing (0.2.0, from spec 002)
├── lib/                               # existing utilities (cn(), etc.)
└── index.ts                           # add 4 new re-exports

.changeset/                            # per-PR changesets, see FR-038
├── add-tooltip.md                     # @unbranded-ds/react: minor
├── add-skiplink.md                    # @unbranded-ds/react: minor
├── add-slider.md                      # @unbranded-ds/react: minor
└── add-segmentedcontrol.md            # @unbranded-ds/react: minor
```

**Structure Decision**: Each component is its own directory under `packages/react/src/components/`, matching the pattern from 0.1.0 and 0.2.0. The directory contains exactly the four files mandated by FR-027 (`<Component>.tsx`, `<Component>.stories.tsx`, `<Component>.test.tsx`, `index.ts`). Each component is re-exported from `packages/react/src/index.ts` (FR-028).

Each component lands as one PR with its own `.changeset/*.md` file declaring a minor bump on `@unbranded-ds/react`. The four changesets coalesce into the same `@unbranded-ds/react@0.3.0` release once the Version Packages PR is merged (FR-038, SC-006). A separate changeset for the constitution amendment is unnecessary because the constitution lives outside `packages/*` — the existing `changeset-check.yml` gate does not require a changeset for `.specify/memory/` changes.

## Complexity Tracking

No violations. The plan stays within constitution.
