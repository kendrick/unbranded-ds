# Tasks: Color-scheme and theme axis split

**Input**: Design documents from `/specs/016-color-scheme-axis-split/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Required. The constitution mandates unit, interaction, and a11y coverage for components (Section VI), and the token change carries validator and resolver units. Test tasks are included per story.

**Organization**: By user story. The token capability (US1) and the React surface (US2) are largely parallel after the foundational axis model; the in-repo cutover (US3) depends on both.

Paths are relative to the repo root. `T` = `packages/tokens`, `R` = `packages/react` below.

> **Implementation status (2026-06-16): COMPLETE.** All 33 tasks done. Verified locally: `@unbranded-ds/tokens` (typecheck, build, 136 unit tests — every one of the six identity×scheme cells AA on all five contrast pairs), `@unbranded-ds/react` (typecheck, 132 unit tests, build), the example app (typecheck, `next build`, Playwright e2e 11/11 including axe a11y on `/` and `/showcase`), and the Storybook build. Two caveats: (1) the Storybook test-runner (`vitest run --project storybook`) could not be invoked locally — vitest reports "No projects matched the filter 'storybook'", a pre-existing project-config/env matter unrelated to this spec (the stories compile via the green Storybook build); CI runs it normally. (2) Surfaced a PRE-EXISTING DS bug, out of 016 scope: the Button `destructive` variant (`bg-destructive/10 text-destructive`) is 4.1:1 against the default light palette, below AA. It was invisible before because the example never rendered DS light tokens; keep it in mind for a follow-up Button/destructive-token spec. The example deliberately leaves `light` as the file-less base (no `light.css` import) to match prior behavior and avoid rendering that failing pair.

## Phase 1: Setup (governance)

- [x] T001 Amend Constitution Section III in `.specify/memory/constitution.md` to the three-axis model: add the color-scheme axis, rename `aesthetic` to `theme`, set the layer order `@layer ds-color-scheme, ds-theme, ds-density;`, and clarify that `system` is a color-scheme intent. While editing the constitution, refresh Section IV's stale v0.1 component list (it predates specs 004/011) to reflect the shipped components, including `ColorSchemeToggle` and the identity `ThemeToggle`. MINOR version bump with a SYNC IMPACT REPORT covering both sections. (Ratify before the code implements it, so spec and constitution do not drift.)

---

## Phase 2: Foundational (Blocking Prerequisites)

**⚠️ CRITICAL**: The axis model below blocks every user story.

- [x] T002 Rename the `aesthetic` axis to `theme` and add `colorScheme` in `T/src/axis-constants.ts`: the `Axis` union (`'theme' | 'colorScheme' | 'density'`), `AXES`, and `AXIS_ATTRIBUTE` (`theme: data-theme`, `colorScheme: data-color-scheme`, `density: data-density`).
- [x] T003 Update `BUILT_IN_THEMES` in `T/src/registry.ts`: `colorScheme: ['light', 'dark']`, `theme: ['default', 'brand', 'vaporwave']`, density unchanged (depends on T002).
- [x] T004 [P] Update the `listThemesByAxis` seed and axis handling in `T/src/axes.ts` for the new axis set (depends on T002).
- [x] T005 [P] Add color-scheme storage keys and repurpose the theme key for identity in `T/src/client.ts`: `COLOR_SCHEME_STORAGE_KEY`, `COLOR_SCHEME_PREFERENCE_STORAGE_KEY`, `THEME_STORAGE_KEY` (now identity), `DENSITY_STORAGE_KEY` unchanged (depends on T002).

**Checkpoint**: the three-axis model exists and `T` typechecks.

---

## Phase 3: User Story 1 - Compose a color scheme with an aesthetic identity (Priority: P1) 🎯 MVP

**Goal**: Any identity renders in any color scheme, every combination validated AA.

**Independent Test**: Apply `data-theme="vaporwave"` with `data-color-scheme="dark"`, then `light`; both render the correct vaporwave palette and pass WCAG AA (the build validates all six cells).

- [x] T006 [P] [US1] Create `T/themes/color-scheme/dark.json` (the default-dark base) from the current `themes/aesthetic/dark.json`; light remains the file-less base.
- [x] T007 [P] [US1] Author `T/themes/theme/brand/light.json` (the current brand palette, which is light-backgrounded) and `T/themes/theme/brand/dark.json` (newly designed).
- [x] T008 [P] [US1] Author `T/themes/theme/vaporwave/light.json` (newly designed) and `T/themes/theme/vaporwave/dark.json` (today's vaporwave palette).
- [x] T009 [US1] Update `T/sd.config.ts` for per-combination emission: color-scheme themes under `[data-color-scheme="<name>"]` in `@layer ds-color-scheme`; theme palettes under the compound `[data-theme="<identity>"][data-color-scheme="<scheme>"]` in `@layer ds-theme`; density unchanged; and rewrite the `layer-order` line and comment (depends on T006-T008).
- [x] T010 [US1] Compose `[colorScheme, theme, density]` in that order in the `composeTokens` callers and `validateComposedTheme` in `T/src/resolve.ts` and `T/src/validate.ts`.
- [x] T011 [P] [US1] Add `{ foreground: 'color.muted-foreground', background: 'color.background', threshold: 4.5 }` to `contrastPairs` in `T/src/schema.ts` (the spec-015 gap).
- [x] T012 [US1] Update `getThemeBootstrapScript`/`themeBootstrapScript` in `T/src/runtime.ts` to set `data-color-scheme`, `data-theme`, `data-density` from three keys with defaults (`light`/`default`/`comfortable`), and update `registerTheme` for the new axis.
- [x] T013 [US1] Unit-test the validator over all six identity-by-scheme palettes (completeness + WCAG AA including the new pair) in `T/src/themes-contrast.test.ts` (depends on T009, T011).
- [x] T014 [P] [US1] Unit-test 3-axis composition (`composeTokens([colorScheme, theme, density])`, later wins per key) in `T/src/resolve.test.ts`.
- [x] T015 [P] [US1] Unit-test the bootstrap writes three attributes and keys with fallbacks in `T/src/runtime.test.ts`.

**Checkpoint**: any identity in any scheme builds and passes AA.

---

## Phase 4: User Story 2 - Separate controls for color scheme and identity (Priority: P2)

**Goal**: The color-scheme control and the identity control drive their axes independently; `system` follows the OS.

**Independent Test**: Operate `ColorSchemeToggle` through light/system/dark and confirm only the scheme changes; operate `ThemeToggle` and confirm only the identity changes; confirm `system` follows the OS.

- [x] T016 [US2] Update the store maps in `R/src/hooks/useTheme/themeStore.ts`: move `(prefers-color-scheme: dark)` to `SYSTEM_MEDIA.colorScheme`, add `SYSTEM_DEFAULTS.colorScheme = 'light'`, add the color-scheme `STORAGE_KEY`, and point `attachMedia` at `colorScheme` (depends on T002, T005).
- [x] T017 [US2] Add the top-level `colorScheme` convenience (resolved getter + setter shorthand) and update the axis-keyed types in `R/src/hooks/useTheme/useTheme.ts` and `types.ts` (depends on T016).
- [x] T018 [P] [US2] Rename the existing control to `R/src/components/ColorSchemeToggle/` (set `axis="colorScheme"`), moving its `index.ts`, stories, test, and sidecar (depends on T016).
- [x] T019 [P] [US2] Create the identity `R/src/components/ThemeToggle/` (`axis="theme"`, data-driven from `themesForAxis('theme')`, no `system` segment), with `index.ts`, stories, test, and sidecar, mirroring `DensityToggle` (depends on T016).
- [x] T020 [US2] Update `R/src/index.ts` to export `ColorSchemeToggle` and the new `ThemeToggle` (depends on T018, T019).
- [x] T021 [P] [US2] Update the hook sidecar `R/src/hooks/useTheme/useTheme.usage.md` and `AGENTS.md` with the three-axis shape, the `colorScheme` convenience, and the next-themes mapping.
- [x] T022 [US2] Unit-test the store in `R/src/hooks/useTheme/themeStore.test.ts`: `system` follows `colorScheme`, per-axis persistence, forcing per axis (depends on T016).
- [x] T023 [P] [US2] Interaction + a11y stories/tests (play functions, axe zero serious/critical) for `ColorSchemeToggle` and the new `ThemeToggle` (depends on T018, T019).

**Checkpoint**: both controls work independently; US1 and US2 together render and switch live.

---

## Phase 5: User Story 3 - The repo's own consumers move to the new axes (Priority: P2)

**Goal**: `main` is never on the old conflated model; the example app and stories demonstrate the new axes.

**Independent Test**: After this phase, no in-repo file applies light or dark through `data-theme`; the example app and every story render on the new axes.

- [x] T024 [P] [US3] Update the example app in `examples/nextjs-15-app-router/`: `app/globals.css` override selector to `[data-color-scheme]` and theme CSS imports; `app/components/pinned-vaporwave.tsx` to `data-theme="vaporwave" data-color-scheme="dark"` and `forced={{ theme, colorScheme, density }}`; `app/components/header.tsx` to add the new `ThemeToggle` (depends on US1, US2).
- [x] T025 [P] [US3] Update the example Playwright specs `examples/nextjs-15-app-router/tests/{theming,composition}.spec.ts` to assert `data-color-scheme` for light/dark and `data-theme` for identity.
- [x] T026 [P] [US3] Update Storybook in `apps/storybook/.storybook/`: split `preview.ts` into a color-scheme global and a theme global (two attributes and keys); replace the stale `preview-head.html` bootstrap (it reads the wrong `ds-theme` key) with the three-axis bootstrap.
- [x] T027 [P] [US3] Update package stories/tests on the old axis: `R/src/_theming/Composition.stories.tsx` (three attributes) and any remaining `aesthetic`/`data-theme` light-dark usage in stories and tests.
- [x] T028 [P] [US3] Update tokens self-references to three axes: `T/src/mcp/compose.ts`, `T/src/mcp/tools/listThemes.ts`, `T/src/runtime.test.ts`, `T/src/axes.test.ts`.

**Checkpoint**: the whole repo is on the new axes.

---

## Phase 6: User Story 4 - The axis model is extensible (Priority: P3)

**Goal**: A future axis can be added with only additive changes.

**Independent Test**: Following the documented extension steps for a hypothetical axis requires no edit to the existing axes or their resolution.

- [x] T029 [US4] Document the axis-extension steps (value set, attribute, theme files, optional control, layer placement) in `AGENTS.md` or a tokens doc, using the color-scheme addition as the worked example that proves it was purely additive.

---

## Phase 7: Polish & Cross-Cutting Concerns

- [x] T030 [P] Add `.changeset/*.md` declaring `@unbranded-ds/tokens` minor and `@unbranded-ds/react` minor.
- [x] T031 [P] Run the `humanizer` skill over the new and edited prose: the Section III amendment, the toggle sidecars, the hook sidecar, and AGENTS.md.
- [x] T032 Run the sidecar validator (`pnpm exec tsx scripts/validate-sidecars.ts`): the new `ColorSchemeToggle`/`ThemeToggle` sidecars compile and the react surface stays `node:fs`-free.
- [x] T033 Full local CI green: typecheck, lint, unit (tokens + react), build (tokens + react), Storybook build + test-runner (interaction + a11y), and the example app Playwright e2e.

---

## Dependencies & Execution Order

- **Setup (Phase 1)**: the Section III amendment, first (ratifies the model).
- **Foundational (Phase 2)**: T002 blocks T003/T004/T005 (they import `Axis`). Blocks all stories.
- **US1 (tokens) and US2 (react)**: both depend only on Foundational, and live in different packages, so they run in parallel. US2's full visual verification wants US1's CSS, but its store/control unit and interaction tests stand alone.
- **US3 (cutover)**: depends on US1 and US2 (the new axes and controls must exist to point consumers at them).
- **US4 (extensibility doc)**: any time after Foundational.
- **Polish**: after the stories it covers; T032/T033 last.

### Parallel opportunities

- Foundational: T004 and T005 together (after T002).
- US1: T006, T007, T008 together (separate theme files); then T011 alongside T009/T010/T012; the unit tests T014, T015 in parallel.
- US2: T018 and T019 together (separate component dirs); T021 alongside.
- US3: T024 through T028 are all separate areas and run together.
- Whole packages: the entire US1 (tokens) block runs alongside the entire US2 (react) block.

### Parallel example: US1 theme files

```bash
Task: "Author T/themes/theme/brand/{light,dark}.json"
Task: "Author T/themes/theme/vaporwave/{light,dark}.json"
Task: "Create T/themes/color-scheme/dark.json"
```

---

## Implementation Strategy

### MVP first

Setup + Foundational + US1. At that point the tokens compose: set `data-theme` and `data-color-scheme` by hand and vaporwave-dark and vaporwave-light both render and pass AA. That is the headline capability, shippable on its own.

### Incremental delivery

US1 (the capability) → US2 (the controls and hook) → US3 (move the repo's own consumers) → US4 (document extensibility). Polish (changeset, humanizer, CI) closes it.

### Notes

- `[P]` = different files, no incomplete dependency.
- Tests are required per the constitution (Section VI) and the token change; they are not optional here.
- The Section III amendment (T001) and the changeset (T030) are both required for merge.
- A humanizer pass on all new prose is owed before merge (T031).
