# Implementation Plan: Color-scheme and theme axis split

**Branch**: `016-color-scheme-axis-split` | **Date**: 2026-06-15 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/016-color-scheme-axis-split/spec.md`

## Summary

Split today's conflated `data-theme` into two composable axes: a new **color scheme** axis (`light`, `dark`, with the `system` intent) on a new `data-color-scheme` attribute, and the **theme** axis (the aesthetic identity: `default`, `brand`, `vaporwave`), which keeps `data-theme` and is renamed from `aesthetic` to `theme` internally. Density is unchanged. Each identity ships hand-designed light and dark palettes (authored per combination), so any identity renders in any color scheme. The existing light/system/dark control is renamed `ColorSchemeToggle` and re-pointed to the new axis; a new data-driven `ThemeToggle` drives the identity axis. The bootstrap, storage keys, the store, the resolver and build, and the contrast validator extend to three axes, and every in-repo consumer (the spec-015 example app, Storybook, the package stories and tests) moves over in the same change. There are no external consumers, so it is a clean break: no codemod, no deprecation window.

## Technical Context

**Language/Version**: TypeScript 5.x, strict, no `any` (Constitution VIII).
**Primary Dependencies**: Style Dictionary v4 (the token build, `sd.config.ts`), Zod (theme schema and validation), Tailwind CSS v4 (`@theme` preset, `@layer` cascade), `@base-ui-components/react` (SegmentedControl, reached through the toggles), React 19 (`useSyncExternalStore`), `@modelcontextprotocol/sdk` (the token-query MCP, re-pointed to three axes).
**Storage**: `localStorage`, new per-axis keys. Color scheme gets `unbranded-ds-color-scheme` (concrete, the bootstrap key) plus `unbranded-ds-color-scheme-preference` (the stated intent, including `system`); `unbranded-ds-theme` is repurposed to hold the identity; `unbranded-ds-density` is unchanged. No migration of stored values (no consumers).
**Testing**: Vitest (unit, the store and resolver and validator), Storybook interaction + a11y test-runner (the renamed and new controls), the contrast validator over every identity-by-scheme palette.
**Target Platform**: the design-system packages (`@unbranded-ds/tokens`, `@unbranded-ds/react`), `apps/storybook`, and the `examples/nextjs-15-app-router` consumer.
**Project Type**: design-system monorepo packages (the system itself, not a consumer app).
**Performance Goals**: flash-free first paint with three axes set before paint; a theme or color-scheme switch applies within one interaction.
**Constraints**: every shipped identity-by-color-scheme combination passes WCAG AA; a clean break (no codemod or deprecation); the change requires a Section III constitution amendment and a changeset; the browser-safe token surface (`axis-constants`, `client`) stays free of `node:fs`.
**Scale/Scope**: three axes; three identities times two schemes (six palettes) plus density; roughly 30 in-repo files touched across tokens, react, storybook, and the example app.

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-checked after Phase 1 design._

This change edits `packages/tokens` and `packages/react` (and `apps/storybook`, `examples/`), so the constitution applies in full and the Section X gates are triggered.

- [x] **Section II — tokens stay independent**: the new `colorScheme` axis constants land in the browser-safe `axis-constants.ts` and `client.ts` (no `node:fs`); the build, resolver, and validator changes stay node-side. The browser type graph stays clean (the spec-015 `/client` invariant holds).
- [x] **Section IV / V / VI / IX — components**: the renamed `ColorSchemeToggle` and the new identity `ThemeToggle` style through tokens, ship `Default` plus variant stories with a `play` function, pass axe with zero serious or critical violations, render SSR-safe, and are exported from `packages/react/src/index.ts`.
- [x] **Section XI — agent and human legibility**: central here. The vocabulary split (color scheme means light/dark, theme means identity), the `useTheme` mapping plus the `colorScheme` convenience, the renamed controls, the sidecars, and AGENTS.md must be unambiguous for both audiences (FR-012). The `next-themes` mapping is documented (`resolvedTheme` to `colorScheme.resolved`, and so on).

**Governed changes this plan requires** (tracked in Complexity Tracking):

- [!] **Section III — theming contract (amendment required)**: Section III currently codifies a two-axis model in normative text: "an aesthetic axis applied via `data-theme` ... and a density axis applied via `data-density` ... density overrides aesthetic, enforced by CSS cascade layers (`@layer ds-aesthetic, ds-density;`)." This feature splits color scheme out, renames `aesthetic` to `theme`, and adds a third layer. That is a deliberate evolution of the contract, not a violation, and it must be ratified by amending Section III (a MINOR bump, the same shape as 1.2.0 which expanded III for per-axis composition). The amendment updates the axis list, the layer order, and the `system`/color-scheme wording, and carries a SYNC IMPACT REPORT. The no-flash and validated-contrast clauses of Section III are preserved and strengthened (the bootstrap writes three axes; the validator gains the `muted-foreground`/`background` pair).
- [x] **Section X — governance**: a `.changeset/*.md` is required (both packages bump, minor). The Section III amendment is itself a governed edit with the constitution version bumped and the sync report filled.

**Post-design re-check (after Phase 1)**: No new violations surfaced. The design keeps the new axis constants browser-safe (II), confines the change to the existing packages plus the in-repo consumers, and treats the vocabulary, the `useTheme` mapping, and the renamed controls as the central legibility work (XI). The two governed actions stand and are now concrete: the Section III amendment (three-axis model, `@layer ds-color-scheme, ds-theme, ds-density`, color-scheme wording) and the changeset. Both are in-scope and required for merge, not optional.

## Project Structure

### Documentation (this feature)

```text
specs/016-color-scheme-axis-split/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output (the axis model, the palette matrix, storage, useTheme shape)
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
│   ├── public-api.md          # the renamed/new controls, useTheme, the data attributes, theme CSS
│   ├── token-architecture.md  # the per-combination palette model + cascade/layer order
│   └── migration.md           # the in-repo cutover (no external codemod)
└── tasks.md             # Phase 2 output (/speckit.tasks)
```

### Source Code (change points, from the architecture map)

```text
packages/tokens/
├── src/axis-constants.ts   # Axis 'aesthetic' -> 'theme'; add 'colorScheme'; AXIS_ATTRIBUTE += data-color-scheme
├── src/registry.ts         # BUILT_IN_THEMES: colorScheme [light,dark]; theme [default,brand,vaporwave]
├── src/axes.ts             # listThemesByAxis seed gains colorScheme
├── src/client.ts           # storage key constants: add color-scheme keys; repurpose THEME key for identity
├── src/runtime.ts          # getThemeBootstrapScript writes 3 attributes + 3 keys + defaults; registerTheme
├── src/resolve.ts          # composeTokens callers pass [colorScheme, theme, density]
├── src/schema.ts           # contrastPairs += { muted-foreground / background }
├── src/validate.ts         # validateComposedTheme composes 3 layers
├── src/mcp/{compose,tools/listThemes}.ts  # thread the third axis
├── sd.config.ts            # per-combination emission + @layer ds-color-scheme, ds-theme, ds-density
└── themes/                 # color-scheme/{dark}.json (light = base); theme/{brand,vaporwave}/{light,dark}.json

packages/react/
├── src/hooks/useTheme/{themeStore,resolve,useTheme,types}.ts  # SYSTEM_MEDIA/DEFAULTS/STORAGE_KEY -> colorScheme; attachMedia; colorScheme convenience
├── src/components/ColorSchemeToggle/   # renamed from ThemeToggle (axis="colorScheme")
├── src/components/ThemeToggle/         # NEW identity toggle (axis="theme", data-driven)
├── src/components/_internal/AxisToggle.tsx  # unchanged
└── src/index.ts            # export ColorSchemeToggle + the new ThemeToggle

apps/storybook/.storybook/   # preview.ts decorator + toolbar (two globals); fix the stale preview-head.html key
examples/nextjs-15-app-router/  # globals.css override selector, header, pinned-vaporwave forced keys, the Playwright specs
```

**Structure Decision**: changes land in the existing packages; no new package. The one structural addition is the `themes/` reorganization into a color-scheme axis and a per-identity, per-scheme theme axis, which the build derives from the directory layout.

## Complexity Tracking

| Item                                                                     | Why needed                                                                                                                                                                                                                   | Note                                                                                                                                             |
| ------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| Section III amendment                                                    | The feature evolves the theming contract from two axes to three, with color scheme split out. Section III states the old model normatively, so it must be ratified.                                                          | A MINOR constitution bump with a sync report, the same shape as the 1.2.0 per-axis-composition amendment. Not a violation; a governed evolution. |
| Renaming `aesthetic` to `theme` and `ThemeToggle` to `ColorSchemeToggle` | The vocabulary (theme means identity) only holds if the axis key, the attribute, and the control names agree. Leaving `aesthetic`, or a `ThemeToggle` that drives color scheme, would re-create the conflation in the names. | A clean rename is safe because there are no external consumers; the in-repo usage is updated in the same change.                                 |
