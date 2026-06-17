---
description: "Task list for spec 019 — Storybook interaction and accessibility gate executes in CI"
---

# Tasks: Storybook interaction and accessibility gate executes in CI

**Input**: Design documents from `/specs/019-storybook-test-runner-ci/`
**Prerequisites**: [plan.md](./plan.md) (required), [spec.md](./spec.md) (user stories), [research.md](./research.md), [quickstart.md](./quickstart.md)

**Tests**: The "verify" tasks below are this feature's whole point — proving the gate actually catches a broken `play` and a sub-AA story. They are do-and-undo checks, not committed test files, so they appear as verification tasks rather than new test sources.

**Organization**: Most of the work is foundational — one config file, two dev dependencies, one CI job — because a single runner delivers all three stories. The stories differ in what they _guarantee_ (interaction / accessibility / local parity), each independently verifiable.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependency on incomplete work)
- **[Story]**: US1, US2, US3 — maps to the spec's user stories

## Path Conventions

Monorepo. The test config lives in `apps/storybook/`; the CI job lives in `.github/workflows/ci.yml`. Paths below are repo-root-relative and exact.

---

## Phase 1: Setup

No setup tasks. There is no project to scaffold — the work is two dev dependencies, one config file, and one CI job, all of which are foundational below.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Stand up the `storybook` Vitest project so the gate can run at all. Every user story depends on this.

- [x] T001 Add `@vitest/browser` (^3, matching the repo's Vitest 3) and `playwright` to `devDependencies` in `apps/storybook/package.json`, then run `pnpm install` so `pnpm-lock.yaml` is updated. CI installs with `--frozen-lockfile`, so the committed lockfile must already include them.
- [x] T002 [P] Create `apps/storybook/vitest.config.ts` defining the `storybook` project: the `storybookTest({ configDir: '.storybook' })` plugin from `@storybook/addon-vitest/vitest-plugin`, `test.name: 'storybook'`, browser mode (`test.browser` with `enabled: true`, `provider: 'playwright'`, `headless: true`, `instances: [{ browser: 'chromium' }]`), and `setupFiles: ['.storybook/vitest.setup.ts']` (the existing setup file). This is what `vitest run --project storybook` needs.
- [x] T003 [P] Install the Chromium browser locally: `pnpm --filter @unbranded-ds/storybook exec playwright install --with-deps chromium`. Lets the gate run on this machine; CI does its own install.
- [x] T004 Build the packages the stories import and run the gate once: `pnpm --filter @unbranded-ds/tokens --filter @unbranded-ds/react build` then `pnpm --filter @unbranded-ds/storybook test:storybook`. Confirm the "No projects matched the filter" error is gone and every story passes. This is the first-ever real execution — the latent-failure moment (see T010).

**Checkpoint**: the runner exists and is green locally. User-story work can begin.

---

## Phase 3: User Story 1 - Interaction tests run in CI and block merge (Priority: P1) 🎯 MVP

**Goal**: The interaction (`play`) layer executes on every PR and a failing `play` turns CI red.

**Independent Test**: Break one story's `play` assertion, run the gate, confirm it fails and names the story; restore it and it passes.

- [x] T005 [US1] Add a `storybook-test` job to `.github/workflows/ci.yml`, `needs: verify`, parallel to `example-e2e`: checkout, setup pnpm, setup Node, `pnpm install --frozen-lockfile`, build `@unbranded-ds/tokens` + `@unbranded-ds/react`, `pnpm --filter @unbranded-ds/storybook exec playwright install --with-deps chromium`, then `pnpm --filter @unbranded-ds/storybook test:storybook`. Mirror the `example-e2e` job's structure.
- [x] T006 [US1] Verify the interaction layer catches a regression: temporarily make a story's `play` assertion fail, run `test:storybook`, confirm it fails and names the story, then restore the story. (Proves SC-001.)
- [ ] T007 [P] [US1] Mark the `storybook-test` check as a required status check in the repository's branch-protection settings so a red gate blocks merge (manual, repo-admin action — not a file change; needed for SC-004).

**Checkpoint**: interaction tests run in CI; a broken `play` fails and cannot merge.

---

## Phase 4: User Story 2 - Accessibility tests run in a real browser and block on real violations (Priority: P2)

**Goal**: The axe pass runs in browser mode (real contrast) and blocks on serious or critical violations.

**Independent Test**: Drop a rendered story's foreground/background below WCAG AA, run the gate, confirm the `color-contrast` rule fails and names the story; restore it and it passes.

**Note**: US2 rides the same runner and CI job as US1 — the browser-mode config (T002) and the `storybook-test` job (T005) already run the a11y pass on every story. US2's distinct deliverable is the proof that real contrast is computed.

- [x] T008 [US2] Verify the accessibility layer catches a contrast regression: temporarily drop a rendered story's foreground/background pair below AA (for example, set a near-background text color), run `test:storybook`, confirm the axe `color-contrast` rule fails and names the story, then restore. (Proves SC-002 and SC-003, and that browser-mode contrast computation works.)

**Checkpoint**: the accessibility gate runs in a real browser; a sub-AA story fails.

---

## Phase 5: User Story 3 - A contributor runs the same gate locally (Priority: P3)

**Goal**: The gate runs locally with the same configuration and outcome as CI.

**Independent Test**: On a clean checkout, run the gate command and confirm it executes the interaction and accessibility suite and reports pass/fail, with no "No projects matched" error.

- [x] T009 [US3] Confirm local parity (`pnpm --filter @unbranded-ds/storybook test:storybook` runs the full suite and matches CI), and document the local workflow in `apps/storybook/README.md`: the one-time `playwright install --with-deps chromium` and the `test:storybook` command. (Proves SC-005; the doc closes the loop for contributors.)

**Checkpoint**: a contributor can reproduce the CI gate locally.

---

## Phase 6: Polish & Cross-Cutting Concerns

- [x] T010 Triage the first real execution (T004). If it surfaced a genuine `play` or a11y failure, fix it in this PR as a real defect, excluding a single story or rule under a tracked follow-up only if the fix is too large (per the spec's latent-failure policy). If T004 was green, record that and take no action.
- [x] T011 Final gate: run `pnpm typecheck`, `pnpm build`, and `pnpm test:unit` (confirm the existing layers still pass), then `pnpm --filter @unbranded-ds/storybook test:storybook` (the new gate). All green confirms no regression and the gate passes on the current codebase.

---

## Dependencies & Execution Order

### Phase dependencies

- **Foundational (Phase 2)** blocks everything: no story can run until the `storybook` project exists and runs green (T001 → T002/T003 → T004).
- **US1 (Phase 3)** depends on Foundational. The CI job (T005) is the headline deliverable.
- **US2 (Phase 4)** depends on Foundational (browser-mode config) and rides US1's CI job. Independent of US1's verification.
- **US3 (Phase 5)** depends on Foundational. Independent of US1/US2.
- **Polish (Phase 6)** depends on the first run (T004) and the stories being wired.

### Within foundational

- T001 (deps + lockfile) first. T002 (write the config) and T003 (install Chromium) are parallel after T001 — different actions, no shared file. T004 (the first run) needs all three.

### Parallel opportunities

- T002 and T003 run in parallel after T001.
- T007 (branch protection) is a repo setting, independent of the file changes, and can happen any time after T005 lands.
- The verify tasks (T006, T008) are not parallel with each other: each mutates a story and runs the single gate process, so run them one at a time.

---

## Implementation Strategy

### MVP (Foundational + US1)

T001–T005 make the gate exist and run in CI; T006–T007 prove it catches a broken `play` and block merge. That alone closes the constitution's interaction-gate gap and is the meaningful MVP.

### Incremental delivery

1. Foundational → the runner exists and is green locally.
2. US1 → the gate runs in CI and blocks merge (interaction proven).
3. US2 → the accessibility/contrast proof.
4. US3 → local parity documented.
5. Polish → triage the first run, final full gate.

### Suggested commit grouping

Per the repo's small-atomic-commit norm: one commit for the runner (T001–T003: deps + lockfile + `vitest.config.ts`), one for the CI job (T005), and one for the README local-workflow note (T009). The verify tasks (T004, T006, T008) and the final gate (T011) are checks that gate the commits, not commits of their own. If T010 surfaces a fix, that is its own commit.

---

## Notes

- The feature is CI and test configuration only (FR-008). The one source change beyond config is a doc note in `apps/storybook/README.md` (T009) and, only if T004/T010 surfaces a real failure, a genuine defect fix.
- No changeset: the change touches `apps/storybook` and CI, not `packages/react` or `packages/tokens` (Constitution X).
- `[P]` = different files, no dependency on incomplete work. `[Story]` maps each task to its user story.
