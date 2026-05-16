---
description: "Task list for spec 003 — Versioning and release workflow"
---

# Tasks: Versioning and release workflow

**Input**: Design documents from `/specs/003-versioning-workflow/`
**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/](./contracts/), [quickstart.md](./quickstart.md)

**Tests**: This is infrastructure work; no unit tests apply. Validation is via manual smoke tests at three checkpoints (after each user story's implementation lands) and the eventual SC-005 integration moment when spec 006 ships through this workflow end-to-end.

**Organization**: Tasks are grouped by user story. After the small Setup phase (3 sequential tasks), all four user stories plus the constitution amendment can proceed in parallel — different files, no cross-story dependencies.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel with other [P] tasks in the same phase
- **[Story]**: User story ID (US1, US2, US3, US4); omitted for Setup, Constitution, and Polish phases
- Every task includes the exact file path or external system it touches

## Path conventions

Workspace root: `/Users/k.arnett/repos/unbranded-ds`. All paths below are relative to repo root unless noted.

---

## Phase 1: Setup

**Purpose**: Install the tool and scaffold the `.changeset/` directory. Three sequential tasks because each depends on the previous.

- [x] T001 Install `@changesets/cli` at the workspace root as a `devDependency` (pinned with `^` to the latest stable major). Run `pnpm add -Dw @changesets/cli`. Modifies `package.json` and `pnpm-lock.yaml`.
- [x] T002 Run `pnpm changeset init` to scaffold the `.changeset/` directory. This creates `.changeset/config.json` (default config) and `.changeset/README.md` (default contributor doc). Both will be customized in later tasks.
- [x] T003 Customize `.changeset/config.json` to match the exact content specified in [contracts/changeset-format.md](./contracts/changeset-format.md): `access: "public"`, `baseBranch: "main"`, `updateInternalDependencies: "patch"`, `ignore: ["@unbranded-ds/storybook"]`, `commit: false`. Keep the `$schema` reference for editor autocomplete.

**Checkpoint**: Run `pnpm changeset --version` and confirm the CLI is installed. Run `cat .changeset/config.json` and confirm the customized fields match the contract.

---

## Phase 2: Foundational

**Purpose**: Blocking prerequisites that gate all user stories.

No foundational tasks needed beyond Setup. After Phase 1 completes, all four user stories share no further dependencies and can proceed in parallel by different developers (or by one developer in any order).

**Checkpoint**: Setup verified. All user-story phases can begin.

---

## Phase 3: User Story 1 — Maintainer captures intent per PR (Priority: P1)

**Goal**: A maintainer can run `pnpm changeset` from the repo root, walk through the prompts, and produce a valid `.changeset/*.md` file. The contributor doc explains the workflow and quality bar with worked examples.

**Independent test**: Run `pnpm changeset` locally on a scratch branch. Pick affected packages and a bump level. Confirm a markdown file is created under `.changeset/` with the expected frontmatter and the description you wrote. Verify the doc at `.changeset/README.md` explains the workflow clearly enough that a fresh contributor could follow it.

**Affected files**: `.changeset/README.md`, root `README.md`.

### Implementation for User Story 1

- [x] T004 [P] [US1] Replace the scaffolded `.changeset/README.md` with the contributor doc per FR-010. The doc MUST cover: when to run `pnpm changeset`, how to pick a bump level, what to write in the description (with the FR-013 quality bar explicit), what happens after the PR merges. Include one worked example of a breaking-change changeset (multi-paragraph migration content) and one of a non-breaking changeset (one-liner). Use the breaking-change example from [contracts/changeset-format.md](./contracts/changeset-format.md) as the template.
- [x] T005 [P] [US1] Add a one-line pointer in root `README.md` directing contributors to `.changeset/README.md` for the versioning workflow. Place under the existing "Getting started" section or a comparable contributor-facing location.

### Smoke test for User Story 1

- [ ] T006 [US1] Run `pnpm changeset` locally on the current branch. Pick `@unbranded-ds/react` with a `patch` bump and write a one-line description. Confirm a `.changeset/<slug>.md` file appears with valid frontmatter and the expected body. Delete the test file before committing (or commit and treat as the first real changeset for this branch).

**Checkpoint**: User Story 1 fully functional. A contributor following the doc can create a valid changeset end-to-end.

---

## Phase 4: User Story 2 — CI catches PRs without changesets (Priority: P1)

**Goal**: PRs touching `packages/tokens/` or `packages/react/` without a `.changeset/*.md` file fail CI with a clearly-named error that points the contributor at the contributor doc.

**Independent test**: Open a PR that modifies a file under `packages/tokens/` or `packages/react/` without adding a changeset. Confirm `changeset-check.yml` fails with the named error message. Add a changeset, push, confirm the check passes.

**Affected files**: `.github/workflows/changeset-check.yml` (new).

### Implementation for User Story 2

- [x] T007 [P] [US2] Create `.github/workflows/changeset-check.yml` per the contract in [contracts/ci-workflows.md](./contracts/ci-workflows.md). Trigger on pull requests against `main`. Two jobs: a `detect` step that checks whether `git diff --name-only origin/main...HEAD` includes anything under `packages/(tokens|react)/`, and a `verify changeset present` step that runs `pnpm changeset status --since=origin/main --output=/tmp/status.json` and fails with a named `::error::` message when zero new changesets are found. The error message MUST point the contributor at `.changeset/README.md`.

### Smoke test for User Story 2

- [ ] T008 [US2] After the workflow lands, open a test PR that modifies a file under `packages/react/src/` without adding a changeset. Confirm CI reports the named failure with the expected error text. Add a changeset to the same PR, push, confirm CI passes. Close the test PR without merging.

**Checkpoint**: User Story 2 fully functional. The CI guard prevents merge of changeset-less PRs.

---

## Phase 5: User Story 3 — Release shepherd reviews "Version Packages" PR (Priority: P2)

**Goal**: After changesets land on `main`, the `release.yml` workflow opens a single "Version Packages" PR. Merging that PR triggers `pnpm changeset publish` and publishes the affected packages to npm.

**Independent test**: Land one or two PRs with changesets on `main`. Confirm a "Version Packages" PR opens within 2 minutes containing the version bumps, CHANGELOG diffs, and removal of consumed changeset files. Merge the PR. Confirm a publish step runs and the new versions appear on npm.

**Affected files**: `.github/workflows/release.yml` (new), GitHub repo secrets (NPM_TOKEN, external).

### Implementation for User Story 3

- [x] T009 [P] [US3] Create `.github/workflows/release.yml` per the contract in [contracts/ci-workflows.md](./contracts/ci-workflows.md). Trigger on push to `main`. Single job using `changesets/action@v1` with `version: pnpm changeset version` and `publish: pnpm changeset publish`. Set `commit` and `title` to `chore(release): version packages`. Build the packages (`pnpm --filter '@unbranded-ds/*' build`) before the action step. Include the `concurrency` group and `permissions: contents: write, pull-requests: write, id-token: write`. Env: `GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}`, `NPM_TOKEN: ${{ secrets.NPM_TOKEN }}`.
- [x] T010 [P] [US3] Configure OIDC trusted publishing on each published npm package. **Reversed during implementation** from the original NPM_TOKEN approach when npm's UI surfaced an active warning against 2FA-bypass tokens and pointed at trusted publishing instead. For each of `@unbranded-ds/tokens` and `@unbranded-ds/react`: package page → Settings → Trusted Publisher → Add Trusted Publisher → GitHub Actions → repo `kendrick/unbranded-ds`, workflow `release.yml`. No GitHub repo secret needed; the workflow's existing `id-token: write` permission lets the runner mint a short-lived OIDC token per publish. See spec.md Clarifications Q2 amendment for the full reasoning. The release.yml workflow has been updated to drop the NPM_TOKEN env var and enable `NPM_CONFIG_PROVENANCE: "true"` for verified-provenance attestation on published versions.

### Smoke test for User Story 3

- [ ] T011 [US3] Once both T009 and T010 are done AND at least one real changeset has landed on `main`, confirm the "Version Packages" PR opens automatically with the expected diff. Either merge it to verify publish (if the team is ready to ship 0.3.0), OR close it without merge and let the next real release validate the publish path. SC-005 (spec 006 ships entirely through this workflow) is the durable integration test.

**Checkpoint**: User Story 3 fully functional. The release pipeline opens Version Packages PRs and publishes on merge.

---

## Phase 6: User Story 4 — Retroactive 0.2.0 migration note (Priority: P3)

**Goal**: The hand-authored 0.2.0 CHANGELOG entries stay intact (per FR-009) and a header note above each 0.2.0 entry explains the one-time exception for future readers.

**Independent test**: Read each package's CHANGELOG.md. Confirm the 0.2.0 entry is unchanged and a header note above it points future readers at the Changesets workflow.

**Affected files**: `packages/tokens/CHANGELOG.md`, `packages/react/CHANGELOG.md`.

### Implementation for User Story 4

- [x] T012 [P] [US4] Add the header note from [research.md R7](./research.md) to `packages/tokens/CHANGELOG.md` immediately above the `## 0.2.0` heading. The note MUST point at `.changeset/README.md` for the current workflow.
- [x] T013 [P] [US4] Add the same header note (or one calibrated to the React package's content) to `packages/react/CHANGELOG.md` immediately above the `## 0.2.0` heading. Same pointer-at-`.changeset/README.md` requirement.

**Checkpoint**: User Story 4 done. The 0.2.0 entries are now contextualized for any reader who lands on them without knowing the workflow history.

---

## Phase 7: Constitution amendment (FR-008)

**Purpose**: Amend the constitution per FR-008 and the exact text in [research.md R8](./research.md). Touches a single file in three places (Section VIII, Section X, SYNC IMPACT REPORT, version footer).

- [x] T014 [P] Amend `.specify/memory/constitution.md` per [research.md R8](./research.md):
  1. Insert the `@changesets/cli` bullet into Section VIII's tool list (after the `CI` line)
  2. Replace Section X's Compliance Review paragraph with the extended version that includes the changeset-presence rule
  3. Update the SYNC IMPACT REPORT at the top to reflect a PATCH-level version bump and explain the change rationale
  4. Update the version footer at the bottom from the current version to the new one (1.0.0 → 1.0.1 if no other amendment has landed; whatever the current + patch is if spec 005 landed first)

This task is `[P]` because it touches a different file than every other implementation task. Within the file, the four edits land in one cohesive amendment — implement them together as one editing pass to keep the SYNC IMPACT REPORT consistent with the actual changes.

**Checkpoint**: Constitution amended. The new compliance rule is in force.

---

## Phase 8: Polish & cross-cutting verification

**Purpose**: Confirm nothing broke and the spec's success criteria are testable against the shipped state.

- [ ] T015 [P] Run `pnpm install && pnpm lint && pnpm typecheck && pnpm test && pnpm build && pnpm --filter @unbranded-ds/storybook build` locally and confirm everything stays green. The existing `ci.yml` pipeline MUST be unaffected by this spec's changes.
- [ ] T016 [P] Walk every example in [quickstart.md](./quickstart.md) end-to-end on a scratch branch. Each example should produce the documented outcome. Anything that doesn't match means an FR is violated; fix and re-walk before reporting complete.
- [ ] T017 Mark all tasks complete in this file and prepare the commit per the existing commit-granularity preference (one commit per logical group, not one big bolus).

---

## Dependencies & execution order

### Phase dependencies

- **Setup (Phase 1)**: T001 → T002 → T003 (sequential, same files or dependent)
- **Foundational (Phase 2)**: empty after Setup
- **User Stories (Phases 3–6) + Constitution (Phase 7)**: all five tracks proceed in parallel from this point. Different files, no cross-track dependencies.
- **Polish (Phase 8)**: depends on the five implementation tracks completing; verification tasks (T015, T016) are themselves `[P]` because they touch separate concerns; T017 is the final wrap-up

### Within-story dependencies

- **US1**: T004 + T005 parallel (different files). T006 (smoke test) follows both
- **US2**: T007 alone; T008 (smoke test) follows
- **US3**: T009 + T010 parallel (different concerns — workflow file vs npm setup). T011 (smoke test) follows both
- **US4**: T012 + T013 parallel (different files)
- **Constitution**: T014 alone, parallel with everything else above

---

## Parallel opportunities

This spec parallelizes well. After the 3-task Setup phase completes, **8 parallel implementation tasks** can run simultaneously across 5 tracks. Then 3 smoke tests serialize after their respective implementation tasks. Then polish.

### Across user stories (after Setup)

```text
   T004 [US1 doc]
   T005 [US1 README link]
   T007 [US2 changeset-check workflow]
   T009 [US3 release workflow]
   T010 [US3 NPM_TOKEN provisioning]
   T012 [US4 tokens CHANGELOG header]
   T013 [US4 react CHANGELOG header]
   T014 [Constitution amendment]
```

All 8 tasks touch distinct files (or external systems). No conflicts. With one developer in parallel editor sessions: ~30 minutes of focused work. With multiple developers: closer to 5–10 minutes wall-clock.

### Smoke tests (after their implementations)

```text
   T006 [US1] depends on T004 + T005
   T008 [US2] depends on T007
   T011 [US3] depends on T009 + T010 + at least one real changeset on main
```

These three are independent of each other and can run in parallel once their prerequisites complete.

### Polish (after all implementation)

```text
   T015 (full CI sanity)
   T016 (quickstart walkthrough)
```

Both polish tasks can run in parallel; they touch separate verification surfaces. T017 (final wrap-up) is sequential after both.

### Parallel execution example (single-developer scenario)

```text
Morning:
  T001 → T002 → T003 (Setup — sequential, 5 minutes total)

Mid-morning:
  Open 8 editor tabs. Work each in turn:
    T004 (.changeset/README.md)
    T005 (root README.md)
    T007 (.github/workflows/changeset-check.yml)
    T009 (.github/workflows/release.yml)
    T012 (packages/tokens/CHANGELOG.md)
    T013 (packages/react/CHANGELOG.md)
    T014 (.specify/memory/constitution.md)
  Plus a browser tab for T010 (NPM_TOKEN provisioning on npmjs.com + GitHub Secrets).

Afternoon:
  T006 (run pnpm changeset locally)
  T008 (open a test PR, verify CI)
  T011 (validate against next real release OR defer to SC-005)
  T015 + T016 (full CI sanity + quickstart walkthrough)
  T017 (commit per logical groups)
```

### Parallel execution example (multi-developer scenario)

```text
Dev A: T001 → T002 → T003 (Setup)
Then:
  Dev A: T004 + T005 → T006   (US1)
  Dev B: T007 → T008           (US2)
  Dev C: T009 + T010 → T011    (US3)
  Dev D: T012 + T013           (US4)
  Dev E: T014                  (Constitution)
Wrap-up:
  Dev A: T015 + T016 + T017
```

Wall-clock time from Setup-complete to ship-ready: about 30 minutes with 5 developers.

---

## Implementation strategy

### MVP scope

The two P1 user stories (US1 + US2) plus the Setup phase are the MVP. After those complete, the workflow exists and is enforced; the release pipeline (US3) can land in a follow-up if you want to ship more conservatively. Realistically though, all five tracks are small enough to land together — the parallel structure makes "do everything" not much slower than "do just MVP."

### Recommended order for solo execution

1. **Setup** sequentially: T001 → T002 → T003 (small, fast, foundational)
2. **Tab batch**: open T004, T005, T007, T009, T012, T013, T014 in parallel editor tabs. Work each in turn. Each is a single-file edit or a small new file.
3. **External tab**: T010 (NPM_TOKEN) in a browser. Do this between or alongside the editor work.
4. **Smoke tests**: T006 (local `pnpm changeset` run), T008 (open a test PR), T011 (defer to next real release if no test changeset exists yet).
5. **Polish**: T015 + T016 + T017.

### Recommended order for team

Per the parallel-execution example above. 5 developers, ~30 minutes wall-clock from Setup to ship-ready.

---

## Notes

- `[P]` tasks touch different files (or different external systems). No file conflict means no merge conflict either.
- This spec adds no unit tests; the workflow's correctness is established via the three manual smoke tests (T006, T008, T011) and the durable integration check at SC-005 (spec 006 ships through this workflow).
- Commit per logical group, not per phase. Project memory `feedback_commit_granularity` prefers small commits. A reasonable split: one commit for Setup (T001–T003), one per user story, one for the constitution amendment, one for the polish updates.
- The bridge rules from spec 005's draft Section XI apply informally to all new prose: humanizer pass on the contributor doc, no three-item lists in any markdown touched, predictable command shapes (already enforced by Changesets itself).
- T011's smoke test is intentionally deferrable. If you ship US1 + US2 + Setup but haven't had a real release yet, the release workflow exists but hasn't been exercised. SC-005 (spec 006's release) is the canonical integration moment; treat T011 as "verified at that point" if you don't want a dedicated test release.
