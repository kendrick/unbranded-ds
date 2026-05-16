---
description: "Task list for spec 002 — Consumer DX preset"
---

# Tasks: Consumer DX preset

**Input**: Design documents from `/specs/002-consumer-dx-preset/`
**Prerequisites**: [plan.md](./plan.md), [spec.md](./spec.md), [research.md](./research.md), [data-model.md](./data-model.md), [contracts/](./contracts/), [quickstart.md](./quickstart.md)

**Tests**: Required. Constitution Section VI mandates three test layers for any component, and FR-006/007/014 require unit-test verification for the new tokens runtime exports. Project memory (`feedback_tests_required`) reinforces: every component ships with tests.

**Organization**: Tasks are grouped by user story to enable independent parallel implementation. After Phase 2 completes (it's essentially empty — see note), all four user stories can proceed in parallel by different developers.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel with other [P] tasks in the same phase (different files, no dependencies on incomplete tasks)
- **[Story]**: User story ID (US1, US2, US3, US4); omitted for Setup/Foundational/Polish phases
- Every task includes the exact file path it touches

## Path conventions

This is a multi-package monorepo. Paths are absolute from repo root:

- `packages/tokens/` — design tokens package
- `packages/react/` — React component library
- `apps/storybook/` — Storybook (no changes in this spec)
- `THEMING.md`, `README.md` at repo root

---

## Phase 1: Setup

**Purpose**: Project initialization. This spec edits an already-bootstrapped monorepo — no new tooling, no new packages.

No setup tasks needed. The branch `002-consumer-dx-preset` is already checked out. All locked tooling from constitution Section VIII is already installed.

---

## Phase 2: Foundational

**Purpose**: Blocking prerequisites for all user stories.

No foundational tasks needed. The four user stories share no upstream dependencies within this spec — each can proceed in parallel from this point. The existing `cn()` utility, Button-style component pattern, and Style Dictionary build are all in place.

**Checkpoint**: Foundation ready. All four user stories can begin in parallel.

---

## Phase 3: User Story 1 — Two-line Tailwind wiring for React consumers (Priority: P1) 🎯 MVP

**Goal**: A Tailwind+React consumer wires the design system with two `@import` lines instead of three. Components render with their intended styling on first paint.

**Independent test**: From a fresh Next.js 15 + Tailwind v4 project, install both packages, write `@import 'tailwindcss'` and `@import '@unbranded-ds/react/preset.css'` in `globals.css`, render a `<Button>`, verify it appears with intended styles.

**Affected files**: `packages/react/src/preset.css` (new), `packages/react/tsup.config.ts`, `packages/react/package.json`, plus a new unit test asserting the preset.css source content.

### Tests for User Story 1

- [x] T001 [P] [US1] Create unit test asserting `packages/react/src/preset.css` exists and contains exactly the two contracted directives (`@import '@unbranded-ds/tokens/preset.css'` and `@source "../@unbranded-ds/react"`), in `packages/react/src/preset.test.ts` (or co-located equivalent). Test MUST fail before implementation.
- [x] T002 [P] [US1] Create unit test asserting `packages/react/dist/preset.css` matches `packages/react/src/preset.css` byte-for-byte after build, in the same test file or a build verification spec. Skip on dev runs if dist not present.

### Implementation for User Story 1

- [x] T003 [P] [US1] Create `packages/react/src/preset.css` with exactly the two-directive content from [contracts/css-contracts.md](./contracts/css-contracts.md). No comments beyond a one-line file header.
- [x] T004 [P] [US1] Update `packages/react/tsup.config.ts` to add an `onSuccess` callback that copies `src/preset.css` to `dist/preset.css` using `node:fs/promises` (`copyFile`). Reference the pattern in [research.md R4](./research.md).
- [x] T005 [US1] Update `packages/react/package.json` `exports` field to add `"./preset.css": "./dist/preset.css"` alongside the existing `.` entry. Keep `files: ["dist"]` unchanged.

**Checkpoint**: Run `pnpm --filter @unbranded-ds/react build && pnpm --filter @unbranded-ds/react test`. T001 and T002 pass. `node_modules/@unbranded-ds/react/dist/preset.css` exists with the contracted content.

---

## Phase 4: User Story 2 — Two-line wiring for tokens-only consumers (Priority: P1)

**Goal**: A non-React consumer (Vue, Svelte, vanilla HTML) wires only the tokens package with two `@import` lines and gets the Tailwind utility surface backed by the design tokens.

**Independent test**: From a fresh Tailwind v4 project with only `@unbranded-ds/tokens` installed, write `@import 'tailwindcss'` and `@import '@unbranded-ds/tokens/preset.css'`. Confirm utility names like `bg-primary` are available.

**Affected files**: `packages/tokens/package.json`, plus an exports-shape unit test.

### Tests for User Story 2

- [x] T006 [P] [US2] Create unit test asserting `packages/tokens/package.json` `exports` field contains `./preset.css` mapping to `./dist/tailwind/preset.css`, and does NOT contain `./dist/tailwind/*` or `./dist/css/*` wildcard entries. Place at `packages/tokens/src/exports.test.ts` (or co-located equivalent). Test MUST fail before T007.

### Implementation for User Story 2

- [x] T007 [US2] Update `packages/tokens/package.json` `exports` field: add `"./preset.css": "./dist/tailwind/preset.css"`. Remove `"./dist/css/*": "./dist/css/*"` and `"./dist/tailwind/*": "./dist/tailwind/*"` entries. Keep `.` and `./runtime` entries unchanged. Keep `./dist/json/*` if currently present (no consumer-facing breakage from json wildcard).

**Checkpoint**: Run `pnpm --filter @unbranded-ds/tokens test`. T006 passes. Resolving `@unbranded-ds/tokens/preset.css` from a consumer succeeds; resolving `@unbranded-ds/tokens/dist/tailwind/preset.css` fails with an exports-mismatch error.

---

## Phase 5: User Story 3 — FOUC prevention helper (Priority: P2)

**Goal**: A theme-aware consumer inlines a single named import in `<head>` and prevents the flash-of-wrong-theme without copy-pasting script bodies.

**Independent test**: Build an app with a saved dark theme in `localStorage.unbranded-ds-theme`. Reload. Verify the dark theme is applied before first paint (no flash).

**Affected files**: `packages/tokens/src/runtime.ts`, `packages/tokens/src/runtime.test.ts` (new).

### Tests for User Story 3

- [x] T008 [P] [US3] Write unit test for `getThemeBootstrapScript()` returning a string containing the canonical key `'unbranded-ds-theme'` and the default theme `'light'`, in `packages/tokens/src/runtime.test.ts`. Test MUST fail before T013.
- [x] T009 [P] [US3] Write unit test for `getThemeBootstrapScript({ defaultTheme: 'dark' })` returning a string with `'dark'` as the fallback, in the same test file.
- [x] T010 [P] [US3] Write unit test asserting determinism: two consecutive calls to `getThemeBootstrapScript({ defaultTheme: 'dark' })` return byte-identical strings. SHA-256 hashes match. In the same test file.
- [x] T011 [P] [US3] Write integration test using jsdom + `new Function(scriptString)()` to verify `data-theme` gets set correctly when localStorage has a saved value, and falls back to the default when localStorage is empty. In the same test file.
- [x] T012 [P] [US3] Write unit test asserting `themeBootstrapScript === getThemeBootstrapScript()` (the constant equals the factory called with no args). In the same test file.

### Implementation for User Story 3

- [x] T013 [US3] Add a private `THEME_STORAGE_KEY = 'unbranded-ds-theme'` constant to `packages/tokens/src/runtime.ts` (not exported in this spec; ready for spec 007 to import). Add the `getThemeBootstrapScript({ defaultTheme = 'light' } = {})` factory function returning the template string per [research.md R5](./research.md). Add `themeBootstrapScript` as the module-load-time evaluation of `getThemeBootstrapScript()`. Wire TSDoc per [contracts/exports.md](./contracts/exports.md).

**Checkpoint**: Run `pnpm --filter @unbranded-ds/tokens test`. All of T008–T012 pass. Build (`pnpm --filter @unbranded-ds/tokens build`) succeeds and `dist/ts/runtime.js` includes both new exports.

---

## Phase 6: User Story 4 — `<VisuallyHidden>` component (Priority: P3)

**Goal**: A developer wraps screen-reader-only text in a polymorphic `<VisuallyHidden>` component and gets the canonical visually-hidden treatment without rolling their own.

**Independent test**: Render `<button><EyeIcon /><VisuallyHidden>Show settings</VisuallyHidden></button>`. Screen reader announces "Show settings". Visually, only the icon is visible.

**Affected files**: `packages/react/src/components/VisuallyHidden/` (new dir, four files), `packages/react/src/index.ts`.

### Tests for User Story 4

- [x] T014 [P] [US4] Write unit test asserting `<VisuallyHidden>` defaults to rendering a `<span>` element, in `packages/react/src/components/VisuallyHidden/VisuallyHidden.test.tsx`. Test MUST fail before T018.
- [x] T015 [P] [US4] Write unit test asserting `<VisuallyHidden as="div">` renders a `<div>` element, in the same test file.
- [x] T016 [P] [US4] Write unit test asserting `<VisuallyHidden>` applies the `sr-only` class and merges consumer-supplied `className` via `cn()`, in the same test file.
- [x] T017 [P] [US4] Write unit test asserting `<VisuallyHidden>` forwards other props (e.g., `data-testid`, `id`) through to the underlying element, in the same test file.

### Implementation for User Story 4

- [x] T018 [P] [US4] Implement `<VisuallyHidden>` polymorphic component in `packages/react/src/components/VisuallyHidden/VisuallyHidden.tsx` following the pattern in [research.md R1](./research.md) (TS generic over `keyof JSX.IntrinsicElements`, default `"span"`, `cn("sr-only", className)`, forwards all other props). Use `data-slot="visually-hidden"` for consistency with other components.
- [x] T019 [P] [US4] Create `packages/react/src/components/VisuallyHidden/index.ts` re-exporting `VisuallyHidden` and `VisuallyHiddenProps`.
- [x] T020 [P] [US4] Create `packages/react/src/components/VisuallyHidden/VisuallyHidden.stories.tsx` with: Default story (text wrapped in default `<span>`), IconButton story (the canonical "icon + visually hidden label" pattern with a `play` function exercising the accessible name via `expect(canvas.getByRole('button', { name: /show settings/i })).toBeInTheDocument()`), Polymorphic story (`as="div"`). Enable autodocs. Pass axe (constitution Section VI).

### Wiring for User Story 4

- [x] T021 [US4] Update `packages/react/src/index.ts` to add `export * from "./components/VisuallyHidden"`. Place in the existing alphabetical block.

**Checkpoint**: Run `pnpm --filter @unbranded-ds/react test`. All of T014–T017 pass. Run `pnpm --filter @unbranded-ds/storybook test-storybook` and confirm the three new stories load, the play function passes, and axe reports zero serious or critical violations.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Documentation, changelogs, and final verification. Every task in this phase is parallelizable — each touches a distinct file.

### Documentation

- [ ] T022 [P] Update `packages/tokens/README.md` to: replace the existing quickstart with the two-line wiring example, add a "Bootstrap script" section documenting both `themeBootstrapScript` and `getThemeBootstrapScript` (with the discoverability rule from FR-013 — explain when to reach for which), add a "Migrating from 0.1.0" section per [contracts/migration.md](./contracts/migration.md), add a Content Security Policy section per FR-014 covering nonce-based and hash-based patterns.
- [ ] T023 [P] Update `packages/react/README.md` to: replace the existing quickstart with the two-line wiring example, add a `<VisuallyHidden>` section with the canonical icon-button-label example, add a "Migrating from 0.1.0" section per [contracts/migration.md](./contracts/migration.md).
- [ ] T024 [P] Update `THEMING.md` to: replace the existing FOUC inline-script block (lines 132–145) with a reference to `themeBootstrapScript`, add a "FOUC prevention: choosing your approach" section per FR-015 covering both the inline-script path and the cookie-based-SSR roadmap item, add a "Future structural opportunities" note pointing at the `:root` light-defaults idea from the spec's future-opportunities section.
- [ ] T025 [P] Update root `README.md` to link the new migration sections from both packages where appropriate. Keep the existing top-level structure; this is a small additive edit.

### Changelogs (hand-authored per FR-016)

- [ ] T026 [P] Create `packages/tokens/CHANGELOG.md` with a 0.2.0 entry. Lead with "Breaking changes" section (wildcard export removal, `unbranded-ds-theme` localStorage key replacing the unstandardized prior pattern). Then "Added" (clean `./preset.css` export, `themeBootstrapScript`, `getThemeBootstrapScript`). Reference [contracts/migration.md](./contracts/migration.md) directly.
- [ ] T027 [P] Create `packages/react/CHANGELOG.md` with a 0.2.0 entry. Lead with "Added" (clean `./preset.css` export, `<VisuallyHidden>` component). Note: no breaking changes to the React package itself — the breaking change is in the tokens package; this changelog cross-references.

### Verification (sequential after all impls)

- [ ] T028 Bump versions: `packages/tokens/package.json` and `packages/react/package.json` from `0.1.0` to `0.2.0`. Update the internal `workspace:*` reference if needed (likely no-op since pnpm resolves at build time).
- [ ] T029 Run `pnpm install` to update the lockfile.
- [ ] T030 Run full CI locally: `pnpm lint && pnpm typecheck && pnpm test && pnpm build && pnpm --filter @unbranded-ds/storybook build-storybook && pnpm --filter @unbranded-ds/storybook test-storybook`. All green. The constitutional Section VI three-test-layer requirement is verified end-to-end here.
- [ ] T031 Walk through every example in [quickstart.md](./quickstart.md) manually in a scratch Next.js 15 app pointed at the locally-built packages. Verify each example produces the documented outcome. This validates User Stories 1, 3, and 4 against the actual built artifacts.
- [ ] T032 Verify the migration paths in [contracts/migration.md](./contracts/migration.md) by reproducing the 0.1.0 import statements in a scratch app, upgrading to the local 0.2.0 build, and confirming the failure → migration → working sequence matches what the docs promise.

---

## Dependencies & Execution Order

### Phase dependencies

- **Setup (Phase 1)**: empty
- **Foundational (Phase 2)**: empty — no truly blocking prerequisites in this spec
- **User Stories (Phases 3–6)**: all four can proceed in parallel from the start. No cross-story dependencies.
- **Polish (Phase 7)**: documentation and changelog tasks (T022–T027) are all `[P]` and can run in parallel as soon as the implementations they describe are done. Verification tasks (T028–T032) run sequentially after all implementations land.

### User story dependencies

| Story | Depends on | Blocks |
|---|---|---|
| US1 | nothing | nothing |
| US2 | nothing | nothing |
| US3 | nothing | nothing (but spec 007's `useTheme` will depend on the `THEME_STORAGE_KEY` constant landing here) |
| US4 | nothing | nothing |

### Within-story dependencies

- **US1**: T001+T002 (tests) can run in parallel. T003+T004+T005 (impl, all different files) can run in parallel. Tests before implementation per TDD spirit, but with separate files the order doesn't conflict at the file level.
- **US2**: T006 (test) → T007 (impl). Just two tasks.
- **US3**: T008–T012 (tests, all in one file) can be written sequentially or in one pass — they share `runtime.test.ts`. T013 (impl) follows.
- **US4**: T014–T017 (tests, all in one file) share `VisuallyHidden.test.tsx`. T018 (impl), T019 (index), T020 (stories) can run in parallel — different files. T021 (re-export from main index) follows T019.

### Polish dependencies

- T022–T027 are all in different files → fully parallel
- T028 (version bumps) and T029 (install) are sequential
- T030–T032 (verification) are sequential after everything else

---

## Parallel opportunities

This spec parallelizes well. Three layers of parallelism are available:

### Across user stories

After Phase 2 (empty), all four user stories can start simultaneously. With four developers, the wall-clock time is the longest single story (US4, the new component) plus the polish phase. With one developer, the natural order is US1 → US2 → US3 → US4 (or any permutation — they don't depend on each other).

### Within a user story

- **US1**: All three implementation tasks (T003, T004, T005) touch different files and have no inter-dependencies. Parallel.
- **US3**: Tests can be written in one editor session covering all five test cases; implementation is a single file edit. Limited within-story parallelism but the work is small.
- **US4**: T018 (component), T019 (index), T020 (stories) all touch different files — parallel. T014–T017 (tests) all share one file — sequential within the file but parallel to T018/T019/T020 if you accept the brief TS-compile-error state during overlap.

### Across polish

Every documentation and changelog task touches a distinct file:

- T022 `packages/tokens/README.md`
- T023 `packages/react/README.md`
- T024 `THEMING.md`
- T025 root `README.md`
- T026 `packages/tokens/CHANGELOG.md`
- T027 `packages/react/CHANGELOG.md`

All six can be in parallel editor sessions simultaneously.

### Parallel execution example (multi-developer scenario)

```text
Day 1:
  Dev A: T001 → T002 → T003+T004+T005 (in parallel) → US1 done
  Dev B: T006 → T007 → US2 done
  Dev C: T008–T012 → T013 → US3 done
  Dev D: T014–T017 → T018+T019+T020 (in parallel) → T021 → US4 done

Day 2 (single owner, polish):
  Pick T022–T027 in any order, each in a separate editor pane.
  Run T028–T032 sequentially.
```

### Parallel execution example (single-developer scenario)

Even solo, you can parallelize by tab-switching:

```text
Morning:
  T001+T006+T008+T014 (all tests, four different files) — write in parallel by tab.
  Verify all fail.

Afternoon:
  T003+T007+T013+T018 (implementations, four different files) — write in parallel.
  Re-run tests, see them pass.

End of day:
  T004, T005, T019, T020, T021 (small wiring + stories).

Day 2:
  Polish phase — open 6 markdown files in tabs, write all in parallel.
  Final verification (T028–T032) sequentially.
```

---

## Implementation strategy

### MVP scope

The spec's User Stories 1 and 2 (both P1) are the MVP — they unblock for-coleman's Tailwind wiring pain, which was the highest-impact item in the feedback. Cut a release with just US1 + US2 if needed; US3 (FOUC) and US4 (`<VisuallyHidden>`) can ride later.

### Recommended order for solo execution

1. **Phase 7 prep**: skim T022–T027 to understand the docs surface you'll touch.
2. **US3** first: smallest scope, highest "lock it down" value (the localStorage key is foundational for spec 007). T008–T013.
3. **US4** next: brings the new component into the world while the test patterns are fresh. T014–T021.
4. **US1** + **US2** together: package.json + preset.css are small and related. T001–T007.
5. **Polish**: T022–T027 in parallel tabs, then T028–T032 sequentially.

### Recommended order for team

Per the parallel-execution example above — four developers, four stories, one day.

---

## Notes

- `[P]` tasks touch different files. No file conflict means no merge conflict either.
- Every test task must be verified to FAIL before its corresponding implementation lands (TDD per constitution Section VI and project memory `feedback_tests_required`).
- Commit after each task or logical group. Project memory `feedback_commit_granularity` prefers small commits per task, not one bolus per phase.
- The bridge rules from spec 005's draft Section XI apply informally: prose in T022–T027 passes the humanizer skill, no three-item lists in any markdown touched by this spec, predictable slot/prop naming on `<VisuallyHidden>` (already enforced by the `as`-prop pattern from research.md R1).
- After T032 passes, the branch is ready for review and merge. The 0.2.0 release follows merge.
