# Tasks: Popover tokens and the Dialog description contrast fix

**Input**: Design documents from `/specs/022-popover-tokens-contrast/`
**Prerequisites**: plan.md ✓, spec.md ✓, research.md ✓, data-model.md ✓, contracts/ ✓, quickstart.md ✓

**Organization**: Tasks are grouped by user story to enable independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3, US4)

---

## Phase 1: Setup

**Purpose**: Establish a clean baseline before any edits.

- [X] T001 Run `pnpm --filter @unbranded-ds/tokens build && pnpm --filter @unbranded-ds/tokens test` from the repo root to confirm the tokens build and test suite pass clean before any changes

**Checkpoint**: Baseline is green — story work can begin.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Define the canonical popover token pair in the schema and token map — these changes gate all user story phases.

**⚠️ CRITICAL**: All three tasks must complete before palette files or tests can be edited.

- [X] T002 Add `popover` and `popover-foreground` keys to the `colorTokens` Zod object in `packages/tokens/src/schema.ts`, following the `background`/`foreground` pattern already present (both are required `z.string()` entries — required so a composed theme that omits either fails validation, which G1/FR-008 depend on)
- [X] T003 Append two entries to the exported `contrastPairs` array in `packages/tokens/src/schema.ts`: `{ foreground: 'color.popover-foreground', background: 'color.popover', threshold: 4.5 }` and `{ foreground: 'color.muted-foreground', background: 'color.popover', threshold: 4.5 }` — array length grows from 6 to 8
- [X] T004 [P] Add two hand-authored entries to `packages/tokens/src/token-map.ts`: one for `color.popover` and one for `color.popover-foreground`, each with `source: 'schema'`, `category: 'color'`, `type: 'color'`, and `cssVariable` set to `--color-popover` and `--color-popover-foreground` respectively, matching the existing `color.background` entry pattern

**Checkpoint**: Schema and token map declare the pair — palette files can now be authored in parallel.

---

## Phase 3: User Story 1 — Popover surfaces have a real, opaque background (Priority: P1) 🎯 MVP

**Goal**: Author the popover pair in all six shipped palette files so the token build emits `--color-popover` and `--color-popover-foreground` in every color-scheme × identity cell.

**Independent Test**: Open a Dialog, Tooltip, and Select menu in the default light theme and confirm each content surface resolves to a concrete, fully opaque background color with no bleed-through.

- [X] T005 [P] [US1] Read `packages/tokens/src/tokens/color.json` to find its `background` and `foreground` values, then add `"popover"` and `"popover-foreground"` DTCG entries (`$value` + `$type: "color"`) under the `color` object, each value equal to the matching base entry in this file
- [X] T006 [P] [US1] Read `packages/tokens/themes/color-scheme/dark.json` to find its `background` and `foreground` values, then add `"popover"` and `"popover-foreground"` DTCG entries under the `color` object, each value equal to the matching entry in this file
- [X] T007 [P] [US1] Read `packages/tokens/themes/theme/brand/light.json` to find its `background` and `foreground` values, then add `"popover"` and `"popover-foreground"` DTCG entries under the `color` object, each value equal to the matching entry in this file
- [X] T008 [P] [US1] Read `packages/tokens/themes/theme/brand/dark.json` to find its `background` and `foreground` values, then add `"popover"` and `"popover-foreground"` DTCG entries under the `color` object, each value equal to the matching entry in this file
- [X] T009 [P] [US1] Read `packages/tokens/themes/theme/vaporwave/light.json` to find its `background` and `foreground` values, then add `"popover"` and `"popover-foreground"` DTCG entries under the `color` object, each value equal to the matching entry in this file
- [X] T010 [P] [US1] Read `packages/tokens/themes/theme/vaporwave/dark.json` to find its `background` and `foreground` values, then add `"popover"` and `"popover-foreground"` DTCG entries under the `color` object, each value equal to the matching entry in this file
- [X] T011 [US1] Run `pnpm --filter @unbranded-ds/tokens build` to regenerate `packages/tokens/src/defaults.generated.ts`, the Tailwind preset at `packages/tokens/dist/tailwind/preset.css`, and the per-theme CSS artifacts — do not hand-edit these files; then run `rg -n "color-popover" packages/tokens/dist/tailwind/preset.css` to confirm the utilities are present

**Checkpoint**: The build emits `--color-popover` and `--color-popover-foreground` in every theme cell and the preset exposes `bg-popover` / `text-popover-foreground`. User Story 1 is independently verifiable.

---

## Phase 4: User Story 2 — Dialog description text meets WCAG AA (Priority: P1)

**Goal**: Update the test count assertions that would otherwise fail on the new pair count, then run the token test suite to confirm the contrast passes in the default-light cell.

**Independent Test**: Run `pnpm --filter @unbranded-ds/tokens test` and confirm the suite passes green, including that the Dialog description's `muted-foreground`/`popover` pair measures at least 4.5:1 in the default-light cell.

- [X] T012 [US2] Update the `toHaveLength(6)` assertion on `contrastPairs` to `toHaveLength(8)` in `packages/tokens/src/schema.test.ts`; also scan for any color-token-count assertion in that file and update it to account for the two new `colorTokens` keys
- [X] T013 [US2] Read `packages/tokens/src/defaults.test.ts` and update any hard-coded token-count or baseline-shape assertions that would fail after `defaults.generated.ts` was regenerated by T011 to include `popover` and `popover-foreground`
- [X] T014 [US2] Run `pnpm --filter @unbranded-ds/tokens test` and confirm `schema.test.ts`, `defaults.test.ts`, and `themes-contrast.test.ts` all pass green

**Checkpoint**: Full token test suite passes. The Dialog description clears AA in default light through the existing `muted-foreground`/`background` relationship.

---

## Phase 5: User Story 3 — The fix holds across the whole theme matrix (Priority: P2)

**Goal**: Confirm the matrix test auto-derives coverage for the two new pairs across all six cells — no edit to `themes-contrast.test.ts` is needed — add a completeness assertion for the omission case, and re-run the suite verbose to see each cell pass explicitly.

**Independent Test**: Re-run `pnpm --filter @unbranded-ds/tokens test --reporter=verbose` and confirm `themes-contrast.test.ts` reports passing for `color.popover-foreground`/`color.popover` and `color.muted-foreground`/`color.popover` in all six cells (default-light, default-dark, brand-light, brand-dark, vaporwave-light, vaporwave-dark).

- [X] T015 [P] [US3] Read `packages/tokens/src/themes-contrast.test.ts` and confirm the matrix loop derives its pairs from the exported `contrastPairs` array (it should iterate `contrastPairs` directly) — verify that no edit to this file is needed and document that the two new pairs are covered automatically by the T003 schema change
- [X] T016 [US3] (Optional, closes FR-008's omission guarantee) Add a completeness assertion in `packages/tokens/src/schema.test.ts`: a composed/partial theme that omits `popover` or `popover-foreground` MUST fail `validateComposedTheme` (or the theme validator) with a coded completeness issue, not pass silently. If the existing required-key validation already has a generic completeness test that this case rides on, note that instead of duplicating it. (This file is also edited by T012 — sequence after it.)
- [X] T017 [US3] Run `pnpm --filter @unbranded-ds/tokens test --reporter=verbose` and inspect the output to confirm all six theme cells report passing for both `color.popover-foreground`/`color.popover` and `color.muted-foreground`/`color.popover`, plus the T016 completeness assertion; if any cell fails, read that palette file and confirm its `popover` value matches its `background` exactly. Density is intentionally not a separate axis here: density tokens carry no color, so the popover/background contrast is invariant across densities — the six color-scheme × identity cells are the full color matrix (per data-model.md).

**Checkpoint**: All six cells pass for both popover pairs and a theme omitting the pair fails loudly. No theme ships a transparent or below-AA popover surface.

---

## Phase 6: User Story 4 — The accessibility quarantine is removed (Priority: P3)

**Goal**: Remove the two `color-contrast` suppressions from the Dialog stories and confirm the accessibility gate passes with no rules disabled.

**Independent Test**: Run `pnpm --filter @unbranded-ds/react test` and confirm the react component tests pass after the stories change; then confirm `rg -n "color-contrast" packages/react/src/components/Dialog/Dialog.stories.tsx` returns no matches.

- [X] T018 [US4] Remove the `color-contrast` accessibility suppression from the `OpenCloseInteraction` story in `packages/react/src/components/Dialog/Dialog.stories.tsx` — locate the `parameters.a11y.config.rules` block that disables `color-contrast` and delete it
- [X] T019 [US4] Remove the `color-contrast` accessibility suppression from the `TooltipStacksAboveDialog` story in `packages/react/src/components/Dialog/Dialog.stories.tsx` — locate its `parameters.a11y.config.rules` block and delete it
- [X] T020 [US4] Run `pnpm --filter @unbranded-ds/react test` and confirm the react component test suite passes; also confirm `rg -n "color-contrast" packages/react/src/components/Dialog/Dialog.stories.tsx` returns nothing

**Checkpoint**: Quarantine is gone, gate is clean. Dialog accessibility is enforced on its own merits.

---

## Phase 7: Polish & Cross-Cutting Concerns

- [X] T021 [P] Write `.changeset/<slug>.md` declaring `@unbranded-ds/tokens` minor and `@unbranded-ds/react` patch; describe the fix in the changeset body and run it through the humanizer skill before saving — the minor bump reflects the additive canonical token (partial consumer themes inherit the default rather than breaking); the react patch records the now-opaque surface in react's changelog. If T002/T003 or a palette file gained an explanatory comment or `$description` ("popover equals background"), run that prose through the humanizer in this pass too
- [X] T022 Run the 7 verification steps in `specs/022-popover-tokens-contrast/quickstart.md` end to end to confirm the full feature is correct; address any step that fails before marking the feature complete

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on Phase 1 passing — **blocks all story phases**
- **US1 (Phase 3)**: Depends on Phase 2; T005–T010 are parallel; T011 depends on T005–T010
- **US2 (Phase 4)**: Depends on T011 (build must regenerate artifacts before test fixes make sense)
- **US3 (Phase 5)**: T015 can start after T003 (schema change defines contrastPairs); T016 edits `schema.test.ts` so it sequences after T012; T017 depends on T014 and T016 (the final verify run covers the matrix and the completeness assertion)
- **US4 (Phase 6)**: Can start in parallel with US2/US3 after Phase 2 — the stories change is independent of the test-count fixes; T018 and T019 edit the same file, so run them sequentially; T020 depends on T018 and T019
- **Polish (Phase 7)**: Depends on all prior phases complete

### User Story Dependencies

- **US1 (P1)**: Depends on Foundational only — no dependency on other stories
- **US2 (P1)**: Depends on US1 (T011 build) — test assertions reference the regenerated artifacts
- **US3 (P2)**: T015 depends on Foundational; T016 (optional) edits `schema.test.ts`, so it follows T012; T017 depends on US2 (T014 test run) and T016
- **US4 (P3)**: Depends on Foundational only — the stories change is independent; T020 confirms the whole fix works

### Parallel Opportunities

Within Phase 3, T005–T010 are six independent palette files — all six can run concurrently:

```bash
# Launch all six palette edits simultaneously:
Task: "Add popover pair to packages/tokens/src/tokens/color.json"
Task: "Add popover pair to packages/tokens/themes/color-scheme/dark.json"
Task: "Add popover pair to packages/tokens/themes/theme/brand/light.json"
Task: "Add popover pair to packages/tokens/themes/theme/brand/dark.json"
Task: "Add popover pair to packages/tokens/themes/theme/vaporwave/light.json"
Task: "Add popover pair to packages/tokens/themes/theme/vaporwave/dark.json"
```

T004 (token-map.ts) can run in parallel with T002/T003 (schema.ts) since they are different files.

T018 and T019 both edit `Dialog.stories.tsx`, so they are **not** parallel — run them sequentially as two edits to the same file.

---

## Implementation Strategy

### MVP (User Stories 1 + 2)

1. Complete Phase 1: baseline check
2. Complete Phase 2: schema + token map
3. Complete Phase 3 (T005–T011): six palette files + build
4. Complete Phase 4 (T012–T014): test count fixes + test run
5. **Stop and validate**: token test suite passes green
6. Story 1 (opaque surface) and Story 2 (AA in default light) are now done

### Incremental Delivery

1. Phase 1 + 2 → schema defines the pair
2. Phase 3 → build emits `--color-popover` across all cells (US1 done, surfaces render opaque)
3. Phase 4 → test suite confirms AA in default light (US2 done)
4. Phase 5 → matrix coverage confirmed across all six cells, omission fails loudly (US3 done)
5. Phase 6 → quarantine removed, gate clean (US4 done)
6. Phase 7 → changeset written, quickstart verified

---

## Notes

- `defaults.generated.ts` is auto-generated by `sd.config.ts` — never hand-edit it; it regenerates in T011
- `themes-contrast.test.ts` requires no edit — its matrix loop auto-covers new `contrastPairs` entries
- Each palette file is a complete color declaration; all six must carry the pair explicitly (the dark and brand cells have their own distinct `background` values, so they cannot inherit from the base)
- The popover `$value` in each palette file must exactly match that file's `background` `$value` — copy it, do not retype
- T020 (react tests) verifies component behavior only; the Storybook a11y gate (`pnpm --filter @unbranded-ds/storybook test:storybook`) is the definitive quarantine-removal proof and is covered in T022 via quickstart step 5
