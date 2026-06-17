---
description: "Task list for spec 021: Fix the accessible-name pattern in form-control docs"
---

# Tasks: Fix the Accessible-Name Pattern in Form-Control Docs

**Input**: Design documents from `/specs/021-form-control-a11y-naming/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/accessible-name-warning.md

**Organization**: Tasks are grouped by user story (US1/US2/US3 from spec.md) to enable independent delivery. US1 and US2 are documentation-only with no version bump; US3 adds the runtime dev warning and carries a patch changeset.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no cross-task dependencies at that point)
- **[Story]**: Which user story this task belongs to (US1, US2, US3)
- All paths are relative to the repo root

---

## Phase 1: Setup

**Purpose**: Housekeeping that blocks nothing but should be done early — the changeset documents the intended release before the first line of implementation is written.

- [ ] T001 Create `.changeset/<unique-name>.md` — patch bump for `@unbranded-ds/react`, summarizing the dev warning addition (the only runtime change); US1/US2 docs need no bump on their own

---

## Phase 2: Foundational (Blocking Prerequisite for US3)

**Purpose**: The shared hook lives in `lib/` and is imported by all three component wiring tasks in US3. US1 and US2 do NOT depend on it and can proceed in parallel with this phase.

**⚠️ CRITICAL for US3**: T013–T015 (hook wiring) cannot start until T002 is complete.

- [ ] T002 Create `packages/react/src/lib/use-accessible-name-warning.ts` — the shared dev-only hook; reads `aria-label`/`aria-labelledby` from props, emits one `warn({ component, issue: 'missing-accessible-name', remedy })` from a `useEffect` when both are absent, gates on `process.env.NODE_ENV !== 'production'`; import from `./warn` for the `warn()` call and `WarnPayload` type
- [ ] T003 Create `packages/react/src/lib/use-accessible-name-warning.test.tsx` — unit test covering the full behavior matrix from `contracts/accessible-name-warning.md`: unnamed in dev → one `warn()`; `aria-label` set → no warn; `aria-labelledby` set → no warn; empty string → one warn; production → no warn

**Checkpoint**: `packages/react/src/lib/use-accessible-name-warning.ts` exported and passing `pnpm --filter @unbranded-ds/react test` for its own test file.

---

## Phase 3: User Story 1 — Component docs teach the working accessible-name pattern (Priority: P1) 🎯 MVP

**Goal**: Every `@example` block and usage sidecar for Checkbox, Switch, and Slider demonstrates `aria-label` (unlabeled) or `aria-labelledby` referencing a visible Label (labeled). Select and Input are audited and confirmed correct.

**Independent Test**: Run `rg -n 'aria-labelledby|aria-label' packages/react/src/components/{Checkbox,Switch,Slider}/*.tsx packages/react/src/components/{Checkbox,Switch,Slider}/*.usage.md` — every named example must show the correct pattern. Run `pnpm tsx scripts/validate-sidecars.ts` to confirm the updated examples compile.

All tasks in this phase touch different files and can run in parallel.

### Implementation for User Story 1

- [ ] T004 [P] [US1] Fix the two `@example` blocks in `packages/react/src/components/Checkbox/Checkbox.tsx`: labeled example adds `aria-labelledby` on `<Checkbox>` pointing at a `<Label id>` while keeping the wrapping `<label>` for click-to-toggle; unlabeled example uses `aria-label` on `<Checkbox>` directly (reference: `Checkbox.stories.tsx:34-37`)
- [ ] T005 [P] [US1] Rewrite the broken native-label examples in `packages/react/src/components/Checkbox/Checkbox.usage.md` — anywhere it says "wrap both in a `<label>`" or teaches that a wrapping `<label>` names the control, replace with the `aria-labelledby` + wrapping-label pattern (labeled) or `aria-label` (unlabeled); prose around the examples also needs the humanizer pass (see Polish phase)
- [ ] T006 [P] [US1] Fix the two `@example` blocks in `packages/react/src/components/Switch/Switch.tsx`: labeled example adds `aria-labelledby` on `<Switch>` referencing the `<Label id>` while keeping `<Label htmlFor>` for click-to-toggle; unlabeled example uses `aria-label` on `<Switch>` (reference: `Switch.stories.tsx:52-53`)
- [ ] T007 [P] [US1] Rewrite the `htmlFor`-only examples in `packages/react/src/components/Switch/Switch.usage.md` — labeled examples must pair `<Label htmlFor id>` with `aria-labelledby` on `<Switch>`; prose around the examples also needs the humanizer pass (see Polish phase)
- [ ] T008 [P] [US1] Name the unnamed thumb in the basic `@example` block in `packages/react/src/components/Slider/Slider.tsx` — the single `<Slider.Thumb />` example adds `aria-label="Value"` (matches every other Slider story and the Range-thumb naming convention); the existing range `@example` already names each thumb and stays as-is
- [ ] T009 [P] [US1] Update `packages/react/src/components/Slider/Slider.usage.md` — confirm the single-thumb example names its thumb; if it teaches an unnamed `<Slider.Thumb />`, add `aria-label`; prose also needs the humanizer pass (see Polish phase)
- [ ] T010 [P] [US1] Audit `packages/react/src/components/Select/Select.tsx` and `packages/react/src/components/Select/Select.usage.md` — confirm no example teaches a native-label pattern for the Base UI trigger (which is named by its value/placeholder content); the expected outcome is confirm-only (research.md D7), so correct only if the audit surfaces an actual broken example
- [ ] T011 [P] [US1] Audit `packages/react/src/components/Input/Input.tsx` and `packages/react/src/components/Input/Input.usage.md` — a native `<input>` is correctly named by `<label htmlFor>`, so no change is expected; confirm the file-input story carries `aria-label` (it does per research.md D7); correct only if the audit surfaces an actual broken example

**Checkpoint**: US1 is independently verifiable — `rg` shows no bare native-label naming of ARIA-role controls; `validate-sidecars.ts` passes; the a11y gate (`pnpm --filter @unbranded-ds/storybook test:storybook`) stays green.

---

## Phase 4: User Story 2 — The Range slider example names both thumbs distinctly (Priority: P2)

**Goal**: The Range story's two thumbs carry distinct, meaningful names ("Minimum" and "Maximum") instead of the spec-019 placeholder pair ("Value" / "Value").

**Independent Test**: `rg -n 'aria-label' packages/react/src/components/Slider/Slider.stories.tsx` — the Range story block shows `"Minimum"` and `"Maximum"`.

- [ ] T012 [P] [US2] Rename the two `aria-label` values on the Range story's `<Slider.Thumb>` elements from `"Value"` to `"Minimum"` and `"Maximum"` respectively in `packages/react/src/components/Slider/Slider.stories.tsx` (lines 95–116)

**Checkpoint**: US2 is independently verifiable — the Range story renders with two thumbs whose accessible names are "Minimum" and "Maximum"; `test:storybook` a11y gate passes.

---

## Phase 5: User Story 3 — A dev-time warning catches an unnamed control at the source (Priority: P3)

**Goal**: Checkbox, Switch, and SliderThumb each call `useAccessibleNameWarning`, emit the warning from `useEffect` in development, and stay silent in production and when named. Component tests assert the wiring.

**Dependency note**: T013–T015 have two hard prerequisites each:
- The shared hook (T002 from Phase 2) must exist.
- The `@example` fix for the same file (T004 → T013, T006 → T014, T008 → T015) should be committed first so each PR touches the file once, not twice.

T013, T014, and T015 are in different files and can run in parallel once both prerequisites are met. T016–T018 each depend on the corresponding wiring task but can also run in parallel with each other.

### Implementation for User Story 3

- [ ] T013 [P] [US3] Add `'use client'` directive and call `useAccessibleNameWarning('Checkbox', props)` in `packages/react/src/components/Checkbox/Checkbox.tsx` — import from `../../lib/use-accessible-name-warning`; `Checkbox.tsx` currently has no directive, so the banner goes at line 1 (consistent with Switch and Slider per research.md D8). Before finishing: check whether a spec-017 `'use client'` directive-coverage test exists (e.g. one enumerating which components carry the banner); if it does, add Checkbox to it so the new banner doesn't break or get missed by that assertion
- [ ] T014 [P] [US3] Call `useAccessibleNameWarning('Switch', props)` in `packages/react/src/components/Switch/Switch.tsx` — Switch already carries `'use client'`; just add the hook call and import
- [ ] T015 [P] [US3] Call `useAccessibleNameWarning('Slider', props)` inside the `SliderThumb` component in `packages/react/src/components/Slider/Slider.tsx` — the detection site is `SliderThumb` (the `role="slider"` element), not `SliderRoot`; pass the thumb's own `aria-label`/`aria-labelledby` props (research.md D3)
- [ ] T016 [P] [US3] Update `packages/react/src/components/Checkbox/Checkbox.test.tsx` — add tests asserting the hook wiring: render with no naming props → `warn` spy called once with `{ component: 'Checkbox', issue: 'missing-accessible-name' }`; render with `aria-label` → `warn` not called; render with `aria-labelledby` → `warn` not called. Render without StrictMode so the dev double-invoke doesn't make "called once" flaky (research.md D4)
- [ ] T017 [P] [US3] Update `packages/react/src/components/Switch/Switch.test.tsx` — same wiring assertions as T016 (including the render-without-StrictMode note) but for `Switch`
- [ ] T018 [P] [US3] Update `packages/react/src/components/Slider/Slider.test.tsx` — assert per-thumb wiring: a single unnamed thumb → one warn; a named thumb (`aria-label="Value"`) → no warn; two unnamed Range thumbs → two warns (one per thumb). Render without StrictMode (research.md D4)

**Checkpoint**: US3 is independently verifiable — `pnpm --filter @unbranded-ds/react test` passes for the hook unit test and all three component wiring tests; no production bundle contains the string `"missing-accessible-name"` (`pnpm --filter @unbranded-ds/react build && rg -n 'missing-accessible-name' packages/react/dist` should print nothing).

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Humanize the human-facing prose changes (Constitution XI.1) and run the quickstart verification gates.

- [ ] T019 Run the `humanizer` skill on all changed sidecar prose in `packages/react/src/components/Checkbox/Checkbox.usage.md`, `packages/react/src/components/Switch/Switch.usage.md`, and `packages/react/src/components/Slider/Slider.usage.md` — the surrounding prose (not the code blocks) must pass the audit-and-revise loop before merge
- [ ] T020 Run the seven quickstart.md verification steps end to end: `rg` for corrected naming patterns; Range story thumb names; `pnpm --filter @unbranded-ds/react test`; `pnpm --filter @unbranded-ds/storybook test:storybook`; `pnpm tsx scripts/validate-sidecars.ts`; prod bundle check; changeset presence (`ls .changeset/*.md`)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies — create the changeset immediately.
- **Phase 2 (Foundational)**: No dependencies — create the shared hook and its test in parallel with Phase 3/4 work.
- **Phase 3 (US1)**: No dependencies — all seven tasks are in different files; start immediately.
- **Phase 4 (US2)**: No dependencies — one file, one task; start immediately.
- **Phase 5 (US3)**: T013–T015 require T002 AND their per-component US1 task (T004/T006/T008 respectively). T016–T018 require their corresponding wiring task (T013/T014/T015 respectively).
- **Phase 6 (Polish)**: T019 requires T005/T007/T009; T020 requires all prior tasks.

### Critical Same-File Ordering Constraints

| File | US1 task (first) | US3 task (second) |
|------|------------------|-------------------|
| `Checkbox.tsx` | T004 | T013 |
| `Switch.tsx` | T006 | T014 |
| `Slider.tsx` | T008 | T015 |

Do NOT start a US3 wiring task on a file until the US1 `@example` fix for that file is complete, to avoid conflicting edits.

### Parallel Opportunities

**Can start immediately (no dependencies):**
- T001 (changeset)
- T002 (shared hook)
- T004 through T011 (all US1 tasks)
- T012 (US2 Range story)

**Can start once T002 is done AND the matching US1 @example fix is done:**
- T013 (after T002 + T004)
- T014 (after T002 + T006)
- T015 (after T002 + T008)

**Can start once the matching wiring task is done:**
- T016 (after T013)
- T017 (after T014)
- T018 (after T015)

---

## Parallel Example: US3 Wiring Phase

```bash
# Once T002 + T004 + T006 + T008 are all complete, launch wiring in parallel:
Task A: "Wire hook + 'use client' in Checkbox.tsx (T013)"
Task B: "Wire hook in Switch.tsx (T014)"
Task C: "Wire hook into SliderThumb in Slider.tsx (T015)"

# Once A/B/C complete respectively, launch component tests in parallel:
Task D: "Update Checkbox.test.tsx for hook wiring (T016)"
Task E: "Update Switch.test.tsx for hook wiring (T017)"
Task F: "Update Slider.test.tsx for hook wiring (T018)"
```

---

## Implementation Strategy

### MVP First (US1 Only)

1. T001 (changeset — create early)
2. T004–T011 in parallel (US1 doc corrections)
3. T019 (humanize the changed sidecars)
4. **STOP and VALIDATE**: `rg` + `validate-sidecars.ts` + `test:storybook` a11y gate
5. Merge or demo US1 independently — the docs defect is fixed

### Incremental Delivery

1. US1 only → merge when green (the core value of the spec)
2. Add US2 (T012, one task) → merge Range story fix
3. Add Phase 2 + US3 (T002–T003 + T013–T018) → merge the dev warning with the patch bump

### Full Delivery (Single PR)

1. T001 + T002 in parallel
2. T003 (hook test) after T002
3. T004–T012 in parallel (US1 + US2)
4. T013–T015 in parallel (after T002 + respective US1 task)
5. T016–T018 in parallel (after respective wiring task)
6. T019 (humanizer on sidecars)
7. T020 (quickstart verification)

---

## Notes

- `[P]` tasks touch different files with no shared-state dependency at the point they're listed
- `[Story]` labels map tasks to user stories for traceability and independent delivery
- Tasks T013–T015 have two prerequisites each (see the same-file ordering table above)
- US1 and US2 have no runtime change; US3 is the sole reason the changeset (T001) carries a patch bump
- The humanizer (T019) must run on the prose *around* code blocks, not inside them; the code blocks themselves are exempt
- Commit after each logical group (per-component, or per story); do not batch all 20 tasks into one commit
