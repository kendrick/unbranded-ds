# Tasks: Primitive set expansion

**Input**: Design documents from `/specs/004-primitive-set-expansion/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/Tooltip.md, contracts/SkipLink.md, contracts/Slider.md, contracts/SegmentedControl.md, quickstart.md

**Tests**: Unit tests are required per Constitution Section VI and spec FR-027; interaction tests via Storybook `play` functions are required per FR-030; accessibility tests via the axe story-runner are required per FR-033. Test tasks are included throughout.

**Organization**: Tasks are grouped by user story so each component can be implemented, tested, and shipped as its own PR. The four user-story phases (US1–US4) have no code-level dependencies between them and are designed to run in parallel after the foundational phase completes.

## Format

`- [ ] [ID] [P?] [Story?] Description with file path`

- **[P]**: Can run in parallel with other [P] tasks (different files, no dependencies on incomplete tasks in the same phase)
- **[Story]**: Maps to user stories from spec.md (US1, US2, US3, US4)
- All file paths are absolute from the repo root

## Path conventions

This is a React component library inside a pnpm monorepo. New component sources live at `packages/react/src/components/<Component>/`. Shared helpers live at `packages/react/src/lib/`. Re-exports are wired through `packages/react/src/index.ts`. Per-PR changesets live in `.changeset/`.

---

## Phase 1: Setup (shared infrastructure)

**Purpose**: Verify the existing package infrastructure (Base UI peer dep, Tailwind preset, lint rules) is in place for the four new components. No new tooling is introduced.

- [x] T001 Verify `packages/react/package.json` peerDependencies includes `@base-ui-components/react` at a version that exposes `Tooltip`, `Slider`, and `RadioGroup` primitives. Update the version range if necessary.

**Checkpoint**: Setup verified — Foundational work can begin.

---

## Phase 2: Foundational (blocking prerequisites)

**Purpose**: Build shared infrastructure that all four user stories depend on. Without this phase, US3 (Slider) and US4 (SegmentedControl) cannot emit structured warnings per FR-020 and FR-034.

**CRITICAL**: No user-story work begins until this phase completes.

- [x] T002 Add structured-warning helper at `packages/react/src/lib/warn.ts` that wraps `console.warn` with the `[unbranded-ds]` prefix and accepts a typed payload object `{ component: string; issue: string; [key: string]: unknown }`. Used by Slider (FR-020) and SegmentedControl (edge-case handling).
- [x] T003 [P] Add unit tests for the warn helper at `packages/react/src/lib/warn.test.ts` covering the `[unbranded-ds]` prefix, payload pass-through, and the required `component` + `issue` fields.

**Checkpoint**: Foundation ready — User Story implementation can now begin in parallel across US1, US2, US3, US4.

---

## Phase 3: User Story 1 — Tooltip (Priority: P1) — MVP

**Goal**: Ship `<Tooltip>` wrapping `@base-ui-components/react`'s Tooltip primitives. Token-styled, ARIA-compliant, with `asChild` support for inline-element wrapping (citation pattern) and `prefers-reduced-motion: reduce` honored.

**Independent Test**: A consumer renders `<Tooltip.Provider><Tooltip.Trigger>Hover me</Tooltip.Trigger><Tooltip.Content>Detail</Tooltip.Content></Tooltip.Provider>`. Hover or keyboard-focus reveals the content; Escape dismisses; tap on touch toggles. Axe reports zero `serious` or `critical` violations on the Tooltip stories.

- [x] T004 [US1] Create Tooltip source at `packages/react/src/components/Tooltip/Tooltip.tsx`. Wraps `@base-ui-components/react`'s Tooltip primitives. Exports a compound: `Tooltip.Provider` (props: `delayDuration` default 700, `container`, `onOpenChange`), `Tooltip.Trigger` (prop: `asChild`), `Tooltip.Content` (props: `side` default `top`, `align` default `center`). Applies CVA for Content variants and Tailwind `motion-reduce:transition-none motion-reduce:duration-0` for reduced-motion. Passes `className` through `cn()`. No `window` or `document` access at render time. Implements FR-001 through FR-008 and the clarified defaults.
- [x] T005 [P] [US1] Create Tooltip stories at `packages/react/src/components/Tooltip/Tooltip.stories.tsx`. Stories: `Default`, `Sides` (top/right/bottom/left), `Alignments` (start/center/end), and the FR-030-required `Wrapping an inline element` story demonstrating `<Tooltip.Trigger asChild>` over an `<a>` inside a `<sup>` (citation pattern). Includes `play` functions for hover-to-open, keyboard-focus-to-open, and Escape-to-dismiss. Autodocs descriptions on every prop, written for both human and agent audiences and reviewed via humanizer pass (FR-031). Implements US1 acceptance scenarios 1–6.
- [x] T006 [P] [US1] Create Tooltip unit tests at `packages/react/src/components/Tooltip/Tooltip.test.tsx`. Coverage: CVA variant resolution for `side` and `align`; `cn()` className merging on Content; `asChild` pass-through preserves the child element type (assertion: rendered output is the original element, not a `<button>`); default values for `delayDuration` (700), `side` (`top`), `align` (`center`).
- [x] T007 [US1] Create Tooltip barrel export at `packages/react/src/components/Tooltip/index.ts` re-exporting the `Tooltip` compound and the three prop types (`TooltipProviderProps`, `TooltipTriggerProps`, `TooltipContentProps`).
- [x] T008 [US1] Add Tooltip re-export to `packages/react/src/index.ts` alongside the existing component exports.
- [x] T009 [US1] Create `.changeset/add-tooltip.md` declaring `'@unbranded-ds/react': minor` with an autodoc-grade entry per FR-013 of spec 003's quality bar (one short paragraph naming the addition, the canonical usage, and the new acceptance test).

**Checkpoint**: Tooltip is independently functional, tested, story-covered, and ready for PR. The component is consumable through `import { Tooltip } from '@unbranded-ds/react'` once the PR is merged and the Version Packages PR ships 0.3.0.

---

## Phase 4: User Story 2 — SkipLink (Priority: P2)

**Goal**: Ship `<SkipLink>` as a native `<a href="#${targetId}">` with `.sr-only` + `focus-visible` reveal. No `preventDefault`, no programmatic scroll. Multiple instances supported.

**Independent Test**: A consumer renders `<SkipLink />` as the first child of their layout. Pressing Tab on page load reveals the link and focuses it; pressing Enter scrolls and focuses the element matching `targetId` (default `main`). Multiple instances with different `targetId`s work independently. Axe reports zero `serious` or `critical` violations on the SkipLink stories.

- [x] T010 [US2] Create SkipLink source at `packages/react/src/components/SkipLink/SkipLink.tsx`. Native `<a href="#${targetId}">` with `.sr-only` utility (from spec 002) for the hidden state and `focus-visible:not-sr-only` plus tokens-driven background/border/padding for the visible state. Props: `targetId` (default `'main'`), `children` (default `'Skip to main content'`), `className` merged via `cn()`. NO `preventDefault()`. NO programmatic scroll. SSR-safe (no `window`/`document` at render time). Implements FR-009 through FR-013.
- [x] T011 [P] [US2] Create SkipLink stories at `packages/react/src/components/SkipLink/SkipLink.stories.tsx`. Stories: `Default` (single SkipLink with default targetId), the FR-030-required `Multiple skip targets` story (three SkipLink instances pointing at `main`, `nav`, `footer` with matching anchor elements). Includes `play` functions for tab-to-focus reveal and Enter-to-jump. Autodocs descriptions on every prop, humanizer-reviewed. Implements US2 acceptance scenarios 1–5.
- [x] T012 [P] [US2] Create SkipLink unit tests at `packages/react/src/components/SkipLink/SkipLink.test.tsx`. Coverage: default `targetId` of `'main'` produces `href="#main"`; custom `targetId` produces matching href; default children text; custom children passes through; `className` merges via `cn()`; component renders a real `<a>` element (regression test against accidentally rendering a `<button>`).
- [x] T013 [US2] Create SkipLink barrel export at `packages/react/src/components/SkipLink/index.ts` re-exporting `SkipLink` and `SkipLinkProps`.
- [x] T014 [US2] Add SkipLink re-export to `packages/react/src/index.ts`.
- [x] T015 [US2] Create `.changeset/add-skiplink.md` declaring `'@unbranded-ds/react': minor` with an autodoc-grade entry.

**Checkpoint**: SkipLink is independently functional, tested, story-covered, and ready for PR.

---

## Phase 5: User Story 3 — Slider (Priority: P3)

**Goal**: Ship `<Slider>` wrapping `@base-ui-components/react`'s Slider primitives. Single-value AND range mode from day one. CVA size/orientation/disabled axes. Structured warnings on invalid props. Pointer, keyboard, and touch all resolve to the same value-change pathway.

**Independent Test**: A consumer renders `<Slider.Root defaultValue={[50]} min={0} max={100}>` with the slot tree. Arrow keys change by step, Home/End jump to min/max, drag works with pointer, tap-to-position works on touch. Range mode (`defaultValue={[20, 80]}`) renders two independent thumbs that cannot cross. Invalid configurations clamp with a structured warning. Axe reports zero `serious` or `critical` violations on the Slider stories.

- [x] T016 [US3] Create Slider source at `packages/react/src/components/Slider/Slider.tsx`. Wraps `@base-ui-components/react`'s Slider primitives. Exports a compound: `Slider.Root` (props: `value`, `defaultValue`, `min` default 0, `max` default 100, `step` default 1, `onValueChange`, `size` default `'md'`, `orientation` default `'horizontal'`, `disabled` default false), `Slider.Control`, `Slider.Track`, `Slider.Indicator`, `Slider.Thumb`. `value`/`defaultValue` always `number[]` (single: `[50]`, range: `[20, 80]`). CVA size/orientation/disabled variants on Root. Uses the shared warn helper from T002 to emit structured payloads for `value-out-of-range`, `invalid-step`, `invalid-bounds` (FR-020). PageUp/PageDown change by 10% of `(max - min)` rounded to nearest step (FR-018). No `window`/`document` at render time. Implements FR-014 through FR-021.
- [x] T017 [P] [US3] Create Slider stories at `packages/react/src/components/Slider/Slider.stories.tsx`. Stories: `Default` (single-value), `Sizes` (sm/md/lg), `Orientations` (horizontal/vertical), `Range` (two-thumb), `Disabled`, `Controlled` (with onValueChange). `play` functions for keyboard increment via Right Arrow, Home/End jumps, pointer drag, AND the FR-030-required touch variant using `pointerType: 'touch'` to verify tap-to-position and drag-with-finger. Autodocs descriptions on every prop, humanizer-reviewed. Implements US3 acceptance scenarios 1–5.
- [x] T018 [P] [US3] Create Slider unit tests at `packages/react/src/components/Slider/Slider.test.tsx`. Coverage: CVA variant resolution; `value`/`defaultValue` always `number[]` (single and range); `onValueChange` shape matches; value-out-of-range clamp emits structured warning with `{ component: 'Slider', issue: 'value-out-of-range', prop, got, clamped }`; `step <= 0` falls back to 1 with `issue: 'invalid-step'` warning; `min >= max` swaps to `[min, min+1]` with `issue: 'invalid-bounds'` warning; range thumbs do not cross; `disabled` removes focus from thumbs.
- [x] T019 [US3] Create Slider barrel export at `packages/react/src/components/Slider/index.ts` re-exporting the `Slider` compound and the five slot props types.
- [x] T020 [US3] Add Slider re-export to `packages/react/src/index.ts`.
- [x] T021 [US3] Create `.changeset/add-slider.md` declaring `'@unbranded-ds/react': minor` with an autodoc-grade entry that names single-value AND range support, the structured warning contract, and the touch input pathway.

**Checkpoint**: Slider is independently functional, tested, story-covered, and ready for PR.

---

## Phase 6: User Story 4 — SegmentedControl (Priority: P4)

**Goal**: Ship `<SegmentedControl>` wrapping `@base-ui-components/react`'s RadioGroup primitives, visually styled as a connected pill control. CVA size/orientation/disabled axes. Strict-axis keyboard navigation.

**Independent Test**: A consumer renders `<SegmentedControl.Root defaultValue="b"><Item value="a">A</Item><Item value="b">B</Item><Item value="c">C</Item></SegmentedControl.Root>`. Clicking changes selection; arrow keys navigate strict-axis (Left/Right for horizontal, Up/Down for vertical); `aria-checked` reflects selection. Axe reports zero `serious` or `critical` violations on the SegmentedControl stories.

- [x] T022 [US4] Create SegmentedControl source at `packages/react/src/components/SegmentedControl/SegmentedControl.tsx`. Wraps `@base-ui-components/react`'s RadioGroup primitives. Exports a compound: `SegmentedControl.Root` (props: `value`, `defaultValue`, `onValueChange`, `size` default `'md'`, `orientation` default `'horizontal'`, `disabled` default false), `SegmentedControl.Item` (props: `value` required, `disabled`). CVA size/orientation/disabled axes on Root with a connected pill visual. Strict-axis arrow keys (Left/Right for horizontal, Up/Down for vertical, Home/End in both). Uses the shared warn helper from T002 to emit `{ component: 'SegmentedControl', issue: 'no-items' }` when zero items are rendered (edge case). No `window`/`document` at render time. Implements FR-022 through FR-026.
- [x] T023 [P] [US4] Create SegmentedControl stories at `packages/react/src/components/SegmentedControl/SegmentedControl.stories.tsx`. Stories: `Default` (three items), `Sizes` (sm/md/lg), `Orientations` (horizontal/vertical), `Disabled`, `Two Items` (edge case — verifies render-with-no-warning), `Controlled` (with onValueChange). `play` functions for click-to-select and arrow-key navigation in both orientations. Autodocs descriptions on every prop, humanizer-reviewed. Implements US4 acceptance scenarios 1–4.
- [x] T024 [P] [US4] Create SegmentedControl unit tests at `packages/react/src/components/SegmentedControl/SegmentedControl.test.tsx`. Coverage: CVA variant resolution; single-select behavior (selecting one deselects others); strict-axis keyboard mapping (Up/Down on horizontal is a no-op; Left/Right on vertical is a no-op); controlled vs uncontrolled; `role="radiogroup"` and `role="radio"` semantics; zero-items emits structured warning with `{ component: 'SegmentedControl', issue: 'no-items' }`; two-items renders without warning.
- [x] T025 [US4] Create SegmentedControl barrel export at `packages/react/src/components/SegmentedControl/index.ts` re-exporting the `SegmentedControl` compound and `SegmentedControlRootProps`, `SegmentedControlItemProps`.
- [x] T026 [US4] Add SegmentedControl re-export to `packages/react/src/index.ts`.
- [x] T027 [US4] Create `.changeset/add-segmentedcontrol.md` declaring `'@unbranded-ds/react': minor` with an autodoc-grade entry that names the RadioGroup-based semantics and the strict-axis keyboard pattern.

**Checkpoint**: SegmentedControl is independently functional, tested, story-covered, and ready for PR. All four user stories complete.

---

## Phase 7: Polish & Cross-Cutting

**Purpose**: Final integration verification across the four components, plus the cross-cutting quality gates that aren't tied to a single component.

- [x] T028 [P] Verify SSR safety with a `renderToString` smoke test for all four components at `packages/react/src/components/__ssr__.test.tsx` (or equivalent per-component variants). Each component renders to a string without throwing, with no `window`/`document` access at render time. Satisfies Constitution Section IX bullet 6.
- [x] T029 [P] Run `pnpm --filter @unbranded-ds/react test` and verify all unit tests pass (warn helper, Tooltip, SkipLink, Slider, SegmentedControl).
- [x] T030 [P] Run `pnpm --filter @unbranded-ds/storybook dev` and manually verify each of the four components in Storybook: autodocs are populated with humanizer-passed descriptions per FR-029 and FR-031; the Tests panel shows passing play functions; the Accessibility panel shows zero `serious` or `critical` violations per FR-033.
- [x] T031 Run `pnpm build` (Turbo) and verify `@unbranded-ds/react` builds with the four new components exported, no TypeScript errors, no lint failures (including the no-hardcoded-colors rule per FR-029).
- [x] T032 Final humanizer review pass on the four component descriptions and all autodoc prop descriptions. Confirm no prose three-item lists (FR-032 — variant enums with three options like `size: 'sm' | 'md' | 'lg'` are code lists and exempt). Confirm bolded inline-header lists are not used.

---

## Dependencies & Execution Order

### Phase dependencies

```text
Phase 1 (Setup)
    ↓
Phase 2 (Foundational — warn helper + test)
    ↓
    ├── Phase 3 (US1 Tooltip)         ⎫
    ├── Phase 4 (US2 SkipLink)         ⎬ run in parallel
    ├── Phase 5 (US3 Slider)           ⎪
    └── Phase 6 (US4 SegmentedControl) ⎭
    ↓ (all four complete)
Phase 7 (Polish & Cross-Cutting)
```

### Within-phase dependencies

For each User Story phase (US1–US4), the internal dependency graph is:

```text
Source (T-source)
    ↓
    ├── Stories (T-stories) [P]
    └── Unit tests (T-tests) [P]
    ↓
Barrel export (T-index)
    ↓
Root re-export (T-root)
    ↓
Changeset (T-changeset)
```

The root re-export task touches `packages/react/src/index.ts` — a shared file. If running US1–US4 phases in parallel, the four root-export tasks (T008, T014, T020, T026) WILL produce merge conflicts on `packages/react/src/index.ts`. This is expected: each component PR adds its own line; merge in PR order resolves cleanly. The conflict is procedural, not a [P] concern within a single phase.

### Cross-phase shared file note

`packages/react/src/index.ts` is touched by T008, T014, T020, T026 (one per US phase). These tasks are NOT marked [P] across phases — they're sequential per-phase but each phase's edit is independent of others until merge time.

---

## Parallel Execution Strategy

The user-story phases (3–6) are designed to be implemented by independent agents or developers working in parallel branches. After Phase 2 completes, kick off all four phases simultaneously.

### Within a phase (single agent)

After completing the source task (e.g., T004), the agent can issue parallel tool calls for stories + tests (e.g., T005 and T006 together):

```text
After T004 (Tooltip source):
  Issue parallel writes for T005 (stories) and T006 (tests).
  Then sequential: T007 (index.ts) → T008 (root re-export) → T009 (changeset).
```

### Across phases (multiple agents)

```text
After T003 (Foundational checkpoint):
  Launch four parallel agents:
    - Agent A: US1 Tooltip      → T004 → T005,T006 → T007 → T008 → T009
    - Agent B: US2 SkipLink     → T010 → T011,T012 → T013 → T014 → T015
    - Agent C: US3 Slider       → T016 → T017,T018 → T019 → T020 → T021
    - Agent D: US4 SegmentedCtl → T022 → T023,T024 → T025 → T026 → T027

  When all four complete:
    Phase 7 polish tasks (T028–T032).
```

### Polish phase

T028, T029, T030 are independent verification tasks ([P]). T031 (build) and T032 (humanizer review) are sequential after the others — T031 needs the full source tree built; T032 reads autodoc text once everything is in place.

---

## Implementation Strategy

### MVP scope (single-story shipping option)

If pressure forces a partial release, the MVP is **User Story 1 — Tooltip alone**:

- Setup + Foundational + Phase 3 only (T001–T009)
- Independently shippable in a `@unbranded-ds/react@0.2.1` release if the bundled-0.3.0 commitment is dropped
- The other three components defer to a follow-up

Per the spec's SC-006, the intent is to ship all four together as 0.3.0. The MVP option above is a fallback, not the planned path.

### Incremental delivery (recommended)

1. Complete Phase 1 + 2 (setup + foundational warn helper)
2. Open four parallel PRs for US1–US4, each with its own `.changeset/*.md`
3. As each PR merges, the Changesets `Version Packages` PR updates but is NOT merged
4. Once all four have landed on `main`, merge the `Version Packages` PR — Changesets cuts `@unbranded-ds/react@0.3.0` and publishes via the release workflow
5. Run Phase 7 polish tasks against the final state of `main` (post-merge)

### Notes on the constitution amendment

The Section IX bullet 6 (SSR safety) constitution amendment is already committed on this branch alongside this spec. No task is needed to make that amendment — it landed during planning. T028 enforces the constraint by smoke-testing each component server-side.

---

## Task counts

| Phase                         | Count  | Notes                                                              |
| ----------------------------- | ------ | ------------------------------------------------------------------ |
| Phase 1: Setup                | 1      | Verification only                                                  |
| Phase 2: Foundational         | 2      | Warn helper + its test                                             |
| Phase 3: US1 Tooltip          | 6      | source, stories, tests, index, root, changeset                     |
| Phase 4: US2 SkipLink         | 6      | Same structure                                                     |
| Phase 5: US3 Slider           | 6      | Same structure                                                     |
| Phase 6: US4 SegmentedControl | 6      | Same structure                                                     |
| Phase 7: Polish               | 5      | SSR smoke test, test run, Storybook check, build, humanizer review |
| **Total**                     | **32** |                                                                    |

Parallel opportunities: 4 cross-phase tracks (US1–US4) plus 2 within-phase parallel tasks per US phase plus 3 [P] tasks in Phase 7. Maximum theoretical concurrency: 4 simultaneous agents during US implementation, 3 simultaneous tasks during polish.
