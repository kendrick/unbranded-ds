---
description: "Task list for spec 020 — re-enable the nested-overlay stacking regression in the Storybook test-runner"
---

# Tasks: Nested-overlay stacking regression runs in the Storybook test-runner

**Input**: Design documents from `/specs/020-storybook-zindex-test-env/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, quickstart.md

**Tests**: No new test files. The "test" this feature delivers is the already-written `TooltipStacksAboveDialog` assertion being re-enabled; it drives the fix red-first (T002). Per clarifications Q1/Q2, US2 and US3 are one-time manual verifications, not committed tests.

**Organization**: Tasks are grouped by user story. The shared test-environment fix is foundational because all three stories depend on it.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3)
- Exact file paths are included in each task

## Path Conventions

Monorepo. The fix lands in `apps/storybook` test config; the re-enable edits one file in `packages/react`; a changeset lands in `.changeset/`. The concrete z-index values are read (never edited) from the generated `packages/tokens/dist/css/tokens-*.css`.

---

## Phase 1: Setup

**Purpose**: Establish the starting baseline before changing anything

- [ ] T001 Confirm the baseline: from the repo root run `pnpm --filter @unbranded-ds/storybook test:storybook` and confirm the suite is green with `TooltipStacksAboveDialog` skipped (it carries `tags: ['!test']` in `packages/react/src/components/Dialog/Dialog.stories.tsx`). This also confirms Playwright's Chromium is provisioned locally.

**Checkpoint**: Known-green starting point, browser available.

---

## Phase 2: Foundational — z-index resolves in the test-runner (BLOCKING)

**Purpose**: Make the `z-(--z-index-*)` declarations resolve in the Vitest browser-mode runner so the stacking assertion can read real values. This blocks US1 (which needs the assertion to pass) and US3 (which spot-checks the same resolution).

**⚠️ CRITICAL**: No user story can complete until this phase is done. Driven test-first by the quarantined assertion.

- [ ] T002 Reproduce the failure (red): remove `tags: ['!test']` from `packages/react/src/components/Dialog/Dialog.stories.tsx`, run `pnpm --filter @unbranded-ds/storybook test:storybook`, and confirm `TooltipStacksAboveDialog` FAILS because `getComputedStyle().zIndex` returns `auto` (so `Number.parseInt` is `NaN`). Capture the failure output. Keep the tag removed for the rest of this work.
- [ ] T003 Diagnose the gap via systematic debugging in the runner (per research.md): determine whether the `.z-\(--z-index-tooltip\)` utility rule is emitted in the runner's stylesheet, and whether `--z-index-tooltip` resolves on the element. Confirm which hypothesis holds — Tailwind content scan missing the arbitrary `z-(--z-index-*)` utilities (leading), or `data-color-scheme` absent on the render root (fallback). Record the finding before fixing.
- [ ] T004 Only after T003's finding is recorded, apply the minimal fix in `apps/storybook` test config that the finding indicates (research.md decision): if the content scan is the gap, run `@tailwindcss/vite` in `apps/storybook/vitest.config.ts` with `packages/react/src/**` in scope (or add an explicit `@source` to `apps/storybook/.storybook/styles.css`); if the axis attribute is the gap, apply it in `apps/storybook/.storybook/vitest.setup.ts` the way the preview does. Do not guess the mechanism — pick the one T003 confirmed. The concrete values MUST continue to come from the already-imported generated token CSS — do NOT declare z-index values in test code (FR-008).
- [ ] T005 Confirm green: rerun the gate and confirm `TooltipStacksAboveDialog` passes, with the tooltip and dialog content resolving to numeric stops (60 above 50 under the default theme), not `auto` (SC-003).
- [ ] T006 Regression guard: run the FULL gate and confirm every story that was green before still passes — surfacing the z-index stops changed no other story's interaction or accessibility result (FR-009 / SC-007).

**Checkpoint**: z-index resolves in the runner; the quarantine can be lifted permanently and the other stories verified.

---

## Phase 3: User Story 1 — re-enable the stacking gate (Priority: P1) 🎯 MVP

**Goal**: The spec-010 nested-overlay stacking guarantee is gated on every PR — `TooltipStacksAboveDialog` runs and passes instead of being skipped.

**Independent Test**: Run the gate; confirm the story appears in the run (not skipped) and passes, and is gone from the skipped list.

- [ ] T007 [US1] Finalize the un-quarantine in `packages/react/src/components/Dialog/Dialog.stories.tsx`: confirm `tags: ['!test']` is removed and delete the now-stale quarantine comment (the block above the story citing spec 020). If a short comment is worth keeping to explain why the assertion is safe in the runner, add one — and run that comment through the `humanizer` skill before merge (Constitution XI.1).
- [ ] T008 [P] [US1] Add an empty changeset at `.changeset/zindex-test-env.md` with empty frontmatter (`---\n---`) and a body explaining the `packages/react` edit is story-only and not in the published bundle (`files: ["dist"]`), so no version bump. This satisfies `changeset-check.yml`; mirror `.changeset/storybook-test-runner-gate.md`.
- [ ] T009 [US1] Verify US1 acceptance: run `pnpm --filter @unbranded-ds/storybook test:storybook`, confirm `TooltipStacksAboveDialog` executes and passes (SC-001), and confirm the count of `!test`-tagged stories dropped by one with none newly quarantined (SC-004).

**Checkpoint**: US1 complete — MVP. The regression is gated.

---

## Phase 4: User Story 2 — confirm the gate discriminates (Priority: P2)

**Goal**: Prove the re-enabled assertion is a real gate, not an inert check that passes for the wrong reason.

**Independent Test**: Break the stacking; the gate goes red and names the story. Restore it; the gate passes.

- [ ] T010 [US2] One-time manual discrimination check: temporarily invert the stacking in the rendered DOM (a scratch edit giving the dialog content a stop at or above the tooltip's), run the gate, and confirm it FAILS and names `TooltipStacksAboveDialog` (SC-002). REVERT the scratch edit before committing. Do NOT commit an always-failing test — the token ordering is already guarded by the tokens' `defaults.test.ts` (clarification Q1).

**Checkpoint**: US2 complete — the gate is proven to fail on a real regression.

---

## Phase 5: User Story 3 — confirm the generalization (Priority: P3)

**Goal**: Confirm the fix resolves the whole `z-(--z-index-*)` category, so future stacking assertions do not re-hit the `auto` wall.

**Independent Test**: In the runner, read the computed z-index of a non-tooltip consumer; it returns a number, not `auto`.

- [ ] T011 [US3] Optional manual spot-check: in the runner, read the computed z-index of another `z-(--z-index-*)` consumer — the skip link's `--z-index-max` (`packages/react/src/components/SkipLink/SkipLink.tsx`) or the select popover's `--z-index-popover` (`packages/react/src/components/Select/Select.tsx`) — and confirm it resolves to a number, not `auto`. This is a spot-check, not a committed test (clarification Q2: expected side effect).

**Checkpoint**: US3 complete — fix confirmed category-wide.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final verification and merge readiness

- [ ] T012 [P] Run the `humanizer` skill over any new code comment added in T007 (per Constitution XI.1 and the user's human-facing-prose rule), and confirm no other prose was introduced that needs it.
- [ ] T013 Local CI parity: run the workspace `lint`, `typecheck`, and unit suites, plus `pnpm --filter @unbranded-ds/storybook test:storybook`, and confirm all green (the checks CI's verify path and the storybook gate run).
- [ ] T014 Final review against quickstart.md: confirm the diff is confined to `apps/storybook` test config, the single `Dialog.stories.tsx` tag/comment edit, and the empty changeset (SC-005), with the z-index token values and the Dialog/Tooltip components unchanged (FR-004). Then confirm dev/prod resolution is untouched (FR-005): run `pnpm --filter @unbranded-ds/storybook build` (or `dev`) and verify the tooltip still stacks above the dialog in `TooltipStacksAboveDialog`.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately.
- **Foundational (Phase 2)**: Depends on Setup. BLOCKS all user stories. Internally strictly sequential: T002 (red) → T003 (diagnose) → T004 (fix) → T005 (green) → T006 (regression guard).
- **US1 (Phase 3)**: Depends on Foundational (the assertion must pass first).
- **US2 (Phase 4)**: Depends on US1 (needs the re-enabled, passing assertion to invert).
- **US3 (Phase 5)**: Depends on Foundational (needs z-index resolving); independent of US1/US2.
- **Polish (Phase 6)**: Depends on US1 landing (T007/T008); T012 depends on T007.

### Within Each User Story

- US1: T007 and T008 are different files (story vs changeset) and can run in parallel; T009 depends on both.
- US2, US3: single verification task each.

### Parallel Opportunities

- T008 [P] (changeset) runs alongside T007 (story cleanup) — different files.
- T012 [P] (humanizer) is independent of T013/T014 once T007 is done.
- US3 (T011) can be verified in parallel with US1's finalization, since both only need the Foundational fix — but US2 (T010) must wait for US1.
- The Foundational phase itself is sequential and offers no parallelism (each step gates the next).

---

## Implementation Strategy

### MVP (User Story 1)

1. Phase 1: confirm baseline.
2. Phase 2: the test-env fix, driven red-first by the assertion (this is the bulk of the work).
3. Phase 3: finalize the un-quarantine + empty changeset + acceptance.
4. **STOP and VALIDATE**: `TooltipStacksAboveDialog` runs and passes; suite green. This is shippable — the regression is gated.

### Incremental verification

5. Phase 4 (US2): prove the gate fails on an inverted stack (manual, reverted).
6. Phase 5 (US3): spot-check another consumer resolves (manual).
7. Phase 6: humanizer on new comments, local CI parity, final diff review.

### Notes

- [P] tasks = different files, no dependencies.
- The Foundational fix and US1 are tightly coupled by design — for a fix this small, reaching the MVP is most of the work, and the user-story split mainly separates the fix from its verifications.
- Commit after each logical group (per the user's small-commit preference): one commit for the test-env fix (T002–T006 squashed to the final state), one for the un-quarantine + changeset (T007–T008), and keep the manual verifications (T010/T011) out of the diff.
- Verify the assertion fails before fixing (T002) — do not skip the red step.
