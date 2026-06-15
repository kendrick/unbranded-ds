# Tasks: Theme controls (provider, hook, and per-axis toggles)

**Input**: Design documents from `/specs/011-theme-toggle/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: REQUIRED, not optional. Constitution Section VI mandates unit, interaction, and a11y layers, and every component ships with tests. Unit tests are written test-first and must fail before their implementation task.

**Organization**: By user story (US1 to US5) in priority order. `[P]` marks a task that can run in parallel with its siblings (different files, no dependency on an incomplete task).

## Format: `[ID] [P?] [Story?] Description`

---

## Phase 1: Setup

**Purpose**: Directory scaffolding and release bookkeeping. The monorepo already exists, so this phase is light.

- [x] T001 Create the directory skeleton: `packages/react/src/hooks/useTheme/`, `packages/react/src/components/ThemeToggle/`, `packages/react/src/components/DensityToggle/`, `packages/react/src/components/_internal/`
- [x] T002 [P] Add a changeset in `.changeset/` declaring `@unbranded-ds/react` (minor) and `@unbranded-ds/tokens` (minor)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Shared types and the tokens registry that every story builds on.

**⚠️ CRITICAL**: No user story can begin until this phase is complete.

- [x] T003 [P] Write a failing unit test for the theme registry in `packages/tokens/src/registry.test.ts` (built-ins include the file-less `comfortable` default; `registerTheme` additions appear; stable order, default first)
- [x] T004 [P] Add the companion-key constant `THEME_PREFERENCE_STORAGE_KEY = 'unbranded-ds-theme-preference'` to `packages/tokens/src/runtime.ts`
- [x] T005 [P] Define the shared types in `packages/react/src/hooks/useTheme/types.ts` (`Axis`-keyed `preference`/`resolved`/`system`/`forced`/`available`, `UseThemeReturn`, `ThemeProviderProps`)
- [x] T006 Implement `themesForAxis(axis)` plus the runtime registry in `packages/tokens/src/registry.ts`, export it from `packages/tokens/src/index.ts`, and have `registerTheme` additively record `(axis, name)`; makes T003 pass

**Checkpoint**: Types and the value-source registry exist. User stories can begin.

---

## Phase 3: User Story 1 - Composable multi-axis theme state (Priority: P1) 🎯 MVP

**Goal**: `<ThemeProvider>` plus `useTheme()` deliver per-axis read and one-object `set(partial)`, with persistence, live system-following, and SSR safety.

**Independent Test**: Wrap a tree in `<ThemeProvider>`, call `useTheme()`, `set({ density: 'compact' })`, reload, and confirm persistence; flip the OS scheme while at `system` and confirm live update; render on a server with no `window`.

### Tests for User Story 1 (write first, must fail)

- [x] T007 [P] [US1] Failing unit test for resolve logic in `packages/react/src/hooks/useTheme/resolve.test.ts` (`system` resolves to light/dark; concrete values pass through)
- [x] T008 [P] [US1] Failing unit test for the store in `packages/react/src/hooks/useTheme/themeStore.test.ts` (per-axis localStorage read/write; `matchMedia` subscribe/update/cleanup; `getServerSnapshot` returns defaults with no `window`; companion-key `system` re-entry on mount)
- [x] T009 [P] [US1] Failing render test for the hook + provider in `packages/react/src/hooks/useTheme/useTheme.test.tsx` (`set(partial)` touches only named axes; return shape; `defaults` and `forced` applied; `THEME_NO_PROVIDER` throws; `THEME_INVALID_VALUE`/`THEME_AXIS_FORCED`/`THEME_NO_SYSTEM_SOURCE` warn via `warn()`)
- [x] T010 [P] [US1] Failing SSR test (in the `__ssr__` harness) asserting the provider renders without touching `window`/`localStorage` and hydrates with no mismatch

### Implementation for User Story 1

- [x] T011 [P] [US1] Implement the failure codes and `ThemeProviderError` (code `THEME_NO_PROVIDER`) in `packages/react/src/hooks/useTheme/errors.ts` per contracts/failures.md
- [x] T012 [P] [US1] Implement `resolve.ts` (preference → resolved per axis, `system` via `prefers-color-scheme`); makes T007 pass
- [x] T013 [US1] Implement `themeStore.ts` (`useSyncExternalStore` store: read/write the concrete + companion + density keys, apply `data-*` to `root`, `matchMedia` subscription with cleanup, `getServerSnapshot` = defaults, `forced` overrides storage); depends on T005, T012, T004; makes T008 pass
- [x] T014 [US1] Implement `ThemeProvider.tsx` (context, `defaults`, `forced`, `root`, single source of truth); depends on T013
- [x] T015 [US1] Implement `useTheme.ts` (assemble the return from the store + `themesForAxis` for `available`; `set(partial)` validates and warns; throws `THEME_NO_PROVIDER` outside a provider); depends on T014, T011, T006; makes T009 and T010 pass
- [x] T016 [P] [US1] Create `hooks/useTheme/index.ts` and add `export * from './hooks/useTheme'` to `packages/react/src/index.ts`
- [x] T017 [P] [US1] Write a basic `hooks/useTheme/useTheme.usage.md` sidecar (import path, return-shape table, examples), and extend the spec-005 sidecar validator glob to cover `packages/react/src/hooks/**` so the hook sidecar is validated in CI (FR-021/SC-007); the next-themes mapping and alignment note land in US5

**Checkpoint**: US1 is functional and independently testable. This is the MVP.

---

## Phase 4: User Story 2 - Drop-in color-scheme toggle (Priority: P2)

**Goal**: `<ThemeToggle>` gives a persisted, system-aware, accessible light/system/dark control.

**Independent Test**: Render `<ThemeToggle>` inside a provider, confirm three segments, select dark and confirm the applied scheme persists, and confirm the live OS-change path.

### Tests for User Story 2 (write first, must fail)

- [x] T018 [P] [US2] Failing test in `packages/react/src/components/ThemeToggle/ThemeToggle.test.tsx` (three fixed segments; selecting calls `set({ aesthetic })`; `brand`/`vaporwave` shows no selection and stays enabled; forced → disabled; unresolved until mounted)

### Implementation for User Story 2

- [x] T019 [US2] Implement the private `AxisToggle.tsx` in `packages/react/src/components/_internal/` (renders `SegmentedControl` from a values list; wires `value`=resolved and `onValueChange`=`set`; `aria-label`, `labels`, `icons`; disables when the axis is forced; renders unresolved until mounted); depends on US1
- [x] T020 [US2] Implement `ThemeToggle.tsx` (fixed light/system/dark over the aesthetic axis; Sun/SunMoon/Moon defaults; indeterminate on `brand`/`vaporwave`) on top of `AxisToggle`; depends on T019; makes T018 pass
- [x] T021 [P] [US2] Write `ThemeToggle.stories.tsx` (Default with a `play`, SystemFollowing with a media-emulation `play`, Sizes, Orientations, Forced, AestheticIsBrand, CustomLabelsAndIcons; all under a `<ThemeProvider>` decorator)
- [x] T022 [P] [US2] Write `ThemeToggle.usage.md` sidecar, including the two-state light/dark `useTheme()` recipe (FR-016)
- [x] T023 [P] [US2] Create `ThemeToggle/index.ts` and add `export * from './components/ThemeToggle'` to the package index

**Checkpoint**: US1 and US2 both work independently.

---

## Phase 5: User Story 3 - A second axis, and combinations for free (Priority: P3)

**Goal**: `<DensityToggle>` plus a compositional story prove that combinations emerge from independent controls.

**Independent Test**: Render `<ThemeToggle>` and `<DensityToggle>` together, set aesthetic to vaporwave and density to compact, and confirm both `data-*` attributes apply independently.

### Tests for User Story 3 (write first, must fail)

- [x] T024 [P] [US3] Failing test in `packages/react/src/components/DensityToggle/DensityToggle.test.tsx` (segments come from `available.density` including `comfortable`; no `system` segment; a `registerTheme` addition shows a new segment; forced → disabled)

### Implementation for User Story 3

- [x] T025 [US3] Implement `DensityToggle.tsx` (data-driven from `available.density`, no system segment) on `AxisToggle`; depends on T019 (AxisToggle) and US1; makes T024 pass
- [x] T026 [P] [US3] Write `DensityToggle.stories.tsx` (Default, Sizes, Orientations, Forced, CustomLabelsAndIcons, DataDrivenValues that registers a theme; provider decorator)
- [x] T027 [P] [US3] Write `DensityToggle.usage.md` sidecar
- [x] T028 [P] [US3] Create `DensityToggle/index.ts` and add `export * from './components/DensityToggle'` to the package index
- [x] T029 [US3] Write `hooks/useTheme/Theming.stories.tsx` (the `Theming` group: `Playground` exercising `useTheme`/`set`, `Composition` rendering both toggles over one provider with the live `resolved` pair, `ProviderConfig` demonstrating `defaults` and `forced`); depends on T020 and T025

**Checkpoint**: All three controls work; the multi-axis composition is demonstrable in Storybook and the MCP.

---

## Phase 6: User Story 4 - Pin an axis (Priority: P4)

**Goal**: A consumer can lock an axis so end users cannot change it. (The `forced` plumbing ships in US1's provider/store/hook and US2's `AxisToggle`; this phase proves the journey end to end and closes any gap.)

**Independent Test**: Render `<ThemeProvider forced={{ density: 'compact' }}>` with a `<DensityToggle>`; confirm the toggle is disabled, `set({ density })` is a no-op emitting `THEME_AXIS_FORCED`, and the forced value wins over a different stored value.

### Tests for User Story 4 (write first, must fail)

- [x] T030 [P] [US4] Failing integration test in `packages/react/src/hooks/useTheme/forced.test.tsx` (forced axis applied over stored value; `<DensityToggle>` disabled under `forced`; `set()` on the forced axis is a no-op and emits `THEME_AXIS_FORCED`)

### Implementation for User Story 4

- [x] T031 [US4] Close any gap the test surfaces in the `forced` path across `themeStore.ts`, `useTheme.ts`, and `_internal/AxisToggle.tsx`; makes T030 pass

**Checkpoint**: Pinning works end to end and is independently testable.

---

## Phase 7: User Story 5 - Predictable, and documented as such (Priority: P5)

**Goal**: An agent or developer who knows next-themes can predict the API and find the alignment documented in TSDoc, the sidecars, and the MCP.

**Independent Test**: The sidecar validator passes; the next-themes mapping table appears in `useTheme` TSDoc and its sidecar; the `Theming` group is introspectable via the MCP.

### Implementation for User Story 5

- [x] T032 [P] [US5] Add the next-themes mapping table to `useTheme` TSDoc and `useTheme.usage.md`, a one-line pointer to it from `ThemeProvider` and each toggle's TSDoc, plus the why-multi-axis alignment note with links to specs 002, 009, and 014
- [x] T033 [P] [US5] Add the "if you know next-themes" framing to `ThemeToggle.usage.md` and `DensityToggle.usage.md`
- [x] T034 [P] [US5] Add `AGENTS.md` index entries for `useTheme`, `ThemeProvider`, `ThemeToggle`, and `DensityToggle`
- [x] T035 [US5] Run the `humanizer` skill over every prose surface this feature adds (sidecars, TSDoc, story descriptions) and revise in place per its audit loop
- [x] T036 [US5] Verify SC-006/SC-008 (the `Theming` group surfaces the hook and provider in MCP introspection) and SC-007 (the sidecar validator fails on a missing or broken sidecar)

**Checkpoint**: Both audiences can predict and discover the API.

---

## Phase 8: Polish & Cross-Cutting Concerns

- [ ] T037 [P] Run the quickstart.md walkthrough end to end (bootstrap + provider + both toggles + a pinned axis); confirm no first-paint flash and a live OS-change update
- [ ] T038 [P] Confirm axe reports zero serious or critical violations across all new stories
- [ ] T039 Run the full local CI chain (lint, typecheck, unit, build, storybook build, test-runner) and confirm green per Section IX

---

## Dependencies & Execution Order

### Phase dependencies

- **Setup (Phase 1)**: no dependencies.
- **Foundational (Phase 2)**: after Setup. Blocks all stories.
- **US1 (Phase 3)**: after Foundational. The base every other story builds on.
- **US2 (Phase 4)**: after US1 (needs the hook).
- **US3 (Phase 5)**: after US2 (reuses the private `AxisToggle` built in T019) and US1.
- **US4 (Phase 6)**: after US2 (forced spans provider, hook, and `AxisToggle`).
- **US5 (Phase 7)**: after US1 to US3 (documents what exists).
- **Polish (Phase 8)**: after all desired stories.

### Within a story

- Tests are written first and must fail before the implementation task that satisfies them.
- Store before provider before hook (T013 → T014 → T015).
- `AxisToggle` (T019) before either concrete toggle (T020, T025).

## Parallel Opportunities

The user asked to parallelize aggressively. The widest windows:

- **Foundational**: T003, T004, T005 run together (registry test, tokens constant, react types, three different files). T006 follows T003.
- **US1 tests**: T007, T008, T009, T010 run together (four different test files). In implementation, T011 and T012 run together before the T013 → T014 → T015 chain; T016 and T017 run together after.
- **US2 / US3 trailing tasks**: stories, sidecars, and index wiring (T021/T022/T023; T026/T027/T028) are each `[P]` within their story.
- **US5**: T032, T033, T034 run together (different doc files), then T035 (humanizer) over the combined result.
- **Cross-story**: US2 and US3 cannot fully overlap because US3's `DensityToggle` needs `AxisToggle` from T019. Once T019 lands, US3's stories/sidecar/index can proceed alongside US2's trailing tasks.

### Parallel example: US1 tests

```bash
# Launch the four US1 test files together (all must fail first):
Task: "resolve.test.ts"        # T007
Task: "themeStore.test.ts"     # T008
Task: "useTheme.test.tsx"      # T009
Task: "__ssr__ provider test"  # T010
```

### Parallel example: Foundational

```bash
Task: "registry.test.ts"                    # T003
Task: "THEME_PREFERENCE_STORAGE_KEY const"  # T004
Task: "useTheme/types.ts"                   # T005
```

## Implementation Strategy

### MVP first

1. Setup + Foundational.
2. US1 (provider + hook). **Stop and validate**: the hook persists, follows the OS, and renders SSR-safe. This alone is the reusable core the for-coleman team kept rebuilding.

### Incremental delivery

US1 (MVP) → US2 (the visible color-scheme toggle, completes the for-coleman scorecard) → US3 (density sibling + the compositional story) → US4 (pinning) → US5 (the alignment docs). Each adds value without breaking the prior stories.

## Notes

- `[P]` = different files, no incomplete-task dependency.
- `AxisToggle` is a private internal and is never exported from the package index.
- `forced` is implemented in US1 (provider/store/hook) and US2 (`AxisToggle`), so the Forced stories in US2/US3 are self-consistent; US4 is the end-to-end pinning slice.
- Test our wrapper logic, not SegmentedControl's keyboard baseline (covered in spec 004): assert that selection routes to `set()` with the right axis, not the arrow-key mechanics.
- Commit after each task or logical group.
