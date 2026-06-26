---
description: "Task list for Re-home DS lint so it actually runs"
---

# Tasks: Re-home DS lint so it actually runs

**Input**: Design documents from `/specs/025-re-home-lint/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/lint-gate.md, quickstart.md

**Tests**: One test task is included (the RuleTester proof for `no-hardcoded-colors`), because User Story 2 and FR-003 explicitly require proving the rule fires. No other test tasks are generated.

**Organization**: Tasks are grouped by user story. The three stories touch disjoint files (`eslint.config.ts` + `ci.yml` for US1, a new test under `packages/react/eslint/` for US2, `README.md` for US3), so US1 and US2 can run in parallel; US3's prose describes the gate US1 lands, so its content depends on US1.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3)
- Exact file paths are in each description

## Path Conventions

This is a pnpm + Turborepo monorepo. Relevant paths: repo-root `eslint.config.ts`, `.github/workflows/ci.yml`, `README.md`, and `packages/react/eslint/`. There is no `src/` work.

---

## Phase 1: Setup

**Purpose**: Establish what "green" means before changing anything.

- [X] T001 Capture the current lint baseline: run `pnpm lint` from the repo root and record the result (expect 63 `style/quote-props` errors in `@unbranded-ds/tokens` and 8 non-blocking `react/*` warnings in `@unbranded-ds/react`). This confirms the antfu config resolves (no Phase 7 crash) and defines the target state.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Cross-story prerequisites.

There are none. The three user stories touch disjoint files and are each independently testable, so no shared foundational work blocks them. Proceed directly to the stories.

---

## Phase 3: User Story 1 - DS package changes are actually linted in CI (Priority: P1) 🎯 MVP

**Goal**: `pnpm lint` runs in CI against `react`, `tokens`, and `storybook`, and a lint error blocks merge. The tree is green so the gate is sane.

**Independent Test**: Introduce a lint error (e.g. an unused import) in `packages/react/src`, push on a branch, confirm the `verify` job's lint step fails and names it; revert and confirm it passes.

- [X] T002 [US1] In `eslint.config.ts`, add `'style/quote-props': 'off'` to the antfu `rules` block (alongside the existing `style/multiline-ternary` / `style/arrow-parens` entries). This clears all 63 errors as redundant style noise without churning source; leave the rest of antfu's stylistic config (the JS/TS formatter) untouched. Then run `pnpm lint` and confirm 0 errors remain (the 8 `react/*` warnings stay).
- [X] T003 [US1] In `.github/workflows/ci.yml`, add a step named `Lint` running `pnpm lint` to the `verify` job, positioned after "Install dependencies" and before "Typecheck" (the constitution's `install → lint → typecheck` order). Do not add `--max-warnings`; errors-only is ESLint's default. The job is already named "Lint, typecheck, test, build", so no rename is needed.
- [X] T004 [US1] Verify gate behavior locally per `quickstart.md`: on the clean tree `pnpm lint` exits 0; with a literal `style={{ color: '#ff0000' }}` added to a component in `packages/react/src/components/**` it exits non-zero with `custom-rules/no-hardcoded-colors`; reverting returns it to 0. Confirm the 8 `react/*` warnings print but do not fail.

**Checkpoint**: Lint now runs and blocks in CI against all three DS packages, on a green tree. This is the MVP.

---

## Phase 4: User Story 2 - The token-discipline rule is proven to fire (Priority: P1)

**Goal**: A durable, repeatable proof that `no-hardcoded-colors` catches literal colors in component source.

**Independent Test**: Run `pnpm --filter @unbranded-ds/react test`; the RuleTester test passes, asserting the rule errors on literal colors and accepts token-backed ones.

- [X] T005 [P] [US2] Create `packages/react/eslint/no-hardcoded-colors.test.ts`: a Vitest test using ESLint's `RuleTester` against the rule imported from `./no-hardcoded-colors.js`. Valid cases: a token-backed / CSS-variable color (e.g. `var(--color-primary)`). Invalid cases: literal `#ff0000`, `rgb(...)`, and `hsl(...)` in JSX/style, each expecting the rule's error. Use a parser config matching the rule's component-source target (TSX).
- [X] T006 [US2] Ensure the new test is discovered and run by `@unbranded-ds/react`'s Vitest setup. If its test glob only covers `src/`, either extend the glob to include `eslint/**/*.test.ts` or relocate the test so it is picked up. Run `pnpm --filter @unbranded-ds/react test` and confirm the RuleTester test passes (depends on T005).

**Checkpoint**: The constitution's token-discipline rule is no longer "configured but unproven" — it has a test that fails if the rule ever stops firing.

---

## Phase 5: User Story 3 - The repo stops advertising a gate it doesn't have (Priority: P2)

**Goal**: CI job names and the README's CI section match what CI actually runs.

**Independent Test**: Read each CI job name against its steps and the README CI section against the workflow; nothing claims a lint check it doesn't run.

**Dependency note**: US3's content describes the gate US1 lands, so do it after US1 (T002–T003); otherwise the README would have to describe a gate that isn't wired yet.

- [X] T007 [P] [US3] Rewrite the `## CI` section of `README.md` to match the real workflow: `verify` now lints (react/tokens/storybook) and that lint blocks merge; correct the stale "two jobs" claim and stop folding the Storybook test-runner into `verify` (it is the separate `storybook-test` job). Keep it accurate to the jobs that actually exist (`changes`, `verify`, `publish`, `example-e2e`, `storybook-test`).
- [X] T008 [US3] Run the rewritten `README.md` CI section through the `humanizer` skill (formal invoke: draft → audit → revise) per the user's prose policy and constitution XI.1, and apply the revisions in place (depends on T007).
- [X] T009 [US3] Audit every job `name:` in `.github/workflows/ci.yml` against its steps; confirm none advertises a check it doesn't run. After T003, "Lint, typecheck, test, build" on `verify` is accurate. Record (and fix) any remaining mismatch.

**Checkpoint**: The gap is closed in both places a reader would check — the job names and the README.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Confirm the change is non-shipping and didn't break the rest of `verify`.

- [X] T010 [P] Confirm the changeset gate (`changeset-check.yml`) passes for this branch. The change is non-shipping: root config, CI, README, and one test under `packages/react` (test-only `packages/react` changes are exempt; no package version bumps). No changeset is expected — only add one if the gate demands it.
- [X] T011 Run the full `quickstart.md` validation end to end (lint green; RuleTester passes; manual hardcoded-color check red-then-green; errors-only confirmed). Also confirm the `example-e2e` job's own lint step in `.github/workflows/ci.yml` is unchanged and still runs (FR-006).
- [X] T012 [P] Run `pnpm typecheck` and `pnpm test:unit` locally to confirm the `eslint.config.ts` and new-test changes didn't disturb the other `verify` steps.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately.
- **Foundational (Phase 2)**: Empty; nothing to block on.
- **User Stories (Phase 3–5)**: US1 and US2 are independent and can run in parallel. US3 depends on US1 for accurate content.
- **Polish (Phase 6)**: After the stories you intend to ship.

### User Story Dependencies

- **US1 (P1)**: No dependencies. The MVP.
- **US2 (P1)**: No dependencies on US1 — touches only the new test file. Can run alongside US1.
- **US3 (P2)**: Content-dependent on US1 (it documents the landed gate). Start after T002–T003.

### Within Each Story

- US1: T002 (green) → T003 (add gate) → T004 (verify).
- US2: T005 (write test) → T006 (ensure it runs).
- US3: T007 (rewrite) → T008 (humanize); T009 (audit) after US1's T003.

### Parallel Opportunities

- US1 and US2 touch disjoint files, so they can proceed in parallel.
- T005 [US2], T007 [US3], T010 and T012 [Polish] are each marked [P] (distinct files, no incomplete-task dependencies within their lane).

---

## Parallel Example: US1 + US2 together

```bash
# After Setup, one developer takes US1, another takes US2 — different files, no conflict:
Dev A (US1): edit eslint.config.ts, then .github/workflows/ci.yml
Dev B (US2): create packages/react/eslint/no-hardcoded-colors.test.ts
```

---

## Implementation Strategy

### MVP First (User Story 1 only)

1. Phase 1: capture the baseline.
2. Phase 3 (US1): disable `quote-props`, add the `Lint` step, verify the gate.
3. **STOP and VALIDATE**: lint runs and blocks in CI on a green tree. Ship this alone if needed — it closes the actual gap.

### Incremental Delivery

1. US1 → the gate is real (MVP).
2. US2 → the token rule is proven, not just present.
3. US3 → the docs and job names stop overstating.
4. Polish → confirm non-shipping and green `verify`.

Commit per task or logical group (matching the small-commit convention): the config change, the CI step, the rule test, and the README rewrite are natural separate commits.

---

## Notes

- [P] = different files, no dependencies on incomplete tasks.
- The README rewrite (T007) must pass through the `humanizer` skill (T008) before merge — it is human-facing prose.
- The `style/quote-props` disable (T002) is the refinement Phase 0 surfaced: it clears the 63 errors without the tree-wide reformat that disabling all of antfu's stylistic set would invite. Confirm that call still holds before starting.
- No component, token value, or built artifact changes (FR-010). If anything under `packages/react/src` or `packages/tokens/src` would change, stop — that is out of scope.
