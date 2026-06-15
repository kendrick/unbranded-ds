# @unbranded-ds/tokens changelog

## 0.5.0

### Minor Changes

- a012325: Add theme controls: a `ThemeProvider`, the axis-aware `useTheme()` hook, and the `<ThemeToggle>` and `<DensityToggle>` sibling controls. The tokens package gains a browser-safe `themesForAxis()` registry export and now also exports the `Axis` type, `AXIS_ATTRIBUTE`, and the storage-key constants (including a new `THEME_PREFERENCE_STORAGE_KEY`) that the hook reads for its per-axis value lists and flash-free `system` persistence.
- ac9f6ef: Multi-axis theme composition and first-class theme-extension tokens.

  A consumer can apply an aesthetic theme (`data-theme`) and a density theme (`data-density`) at once; the page resolves to the union of the two, with density winning a collision via the cascade `@layer` order. Themes now live under `themes/<axis>/`, and two demo themes ship: `vaporwave` (aesthetic) and `compact` (density). A theme may declare tokens the schema does not (vaporwave's `shadow.neon` glow); those are now typed in the token map and visible through the token-query MCP, each carrying a `source: 'theme-extension'` discriminator.

  The MCP tools take a multi-axis `theme` input and resolve through one shared `composeTokens` resolver, the same one the validator and runtime use, guarded by a cross-surface parity test so the resolver, the emitted CSS, and the MCP cannot drift. That test immediately caught a latent base-token regression: `color.muted-foreground` and `color.destructive` in the base sources were never brought to AA alongside the light theme in spec 008, so any theme inheriting them shipped failing-contrast CSS. Both are now corrected.

  Amends Constitution Section III (1.1.1 to 1.2.0) to name the axes and the precedence. Additive and non-breaking: single-axis `data-theme` keeps working, and the typed token map's new `source` field is optional.

### Patch Changes

- bfd2c9b: Collapse the two resolution engines behind theme composition into one.

  Style Dictionary now emits each bundled theme's resolved delta and the resolved base as data, alongside the CSS it already produced. The token-query MCP and the bundled-theme validation read those artifacts instead of re-resolving the raw source, and `canonicalDefaultTokens` is generated from the resolved base rather than hand-maintained. A bundled theme is now resolved by exactly one engine, so the value the MCP reports matches the rendered CSS by construction.

  That makes the spec-009 parity scaffolding structurally unnecessary: the cross-surface matrix retires to a thin wiring canary, the hand-maintained defaults drift guard becomes a regenerate-and-diff check, and the `dtcgToResolved` bridge is removed. The net result is fewer tests and fewer code paths for the same behavior. Internal only: no consumer-facing theming change, and the existing composition, MCP, validation, and contrast tests pass unchanged.

## 0.4.0

### Minor Changes

- b42b8a7: Consume the spec 008 design tokens in component source. Focus rings now read `ring.width`, the overlay components read the `z-index` scale, and overlay open/close animations read the `motion` tokens, so a consumer theming any of those now sees the components respond.

  Adds a `z-index.max` token (9999) for the always-on-top focus-revealed SkipLink, so a focused skip link beats every overlay, including a consumer's own.

  The z-index work fixes a latent stacking bug: a tooltip opened inside a dialog now renders above it (tooltip 60 over overlay 50) instead of both sharing a hardcoded `z-50` with no defined order. No public component API changes; the only visible differences are the corrected overlay stacking and the design-system motion timing.

- ebc5c69: Grow the token schema and loosen runtime theme validation.

  New tokens: `font-serif`, a `motion` category (durations `fast`/`base`/`slow` and easings `standard`/`decelerate`/`accelerate`, emitted as Tailwind-aligned `--ease-*` and `--duration-*`), and `size-2xl`/`size-3xl`. Two optional, non-breaking additions land alongside them: `ring.width` and a `z-index` layering scale (`overlay`/`popover`/`tooltip`, ordered so a tooltip stacks above a dialog).

  `validateTheme` now accepts a partial theme. It resolves the override against the canonical defaults and validates the merged result, so a theme may change any subset of categories and inherit the rest. Contrast runs on the merged colors, so a pair where one side is overridden and the other inherited is no longer skipped. Existing complete themes keep validating without change; they inherit the new tokens from the defaults.

  The light theme's `muted-foreground` and `destructive` colors move slightly (4.40 and 3.61 to 4.55:1) to meet WCAG AA, which the previous contrast skip had hidden.

## 0.3.0

### Minor Changes

- f6b4d44: Add the token-query MCP server. Exposes four tools over stdio for agent consumption: `listThemes`, `palette`, `contrast`, and `lookupToken`. The server lives inside `@unbranded-ds/tokens` (no new package per Constitution Section I) and is exposed via the `unbranded-ds-tokens-mcp` binary entry. Configure your MCP client to spawn it as a subprocess — no hosting required, no network round-trip, tokens are local once the package is installed.

  The shared MCP runtime (`mcp/runtime/stdio.ts`, `mcp/runtime/errors.ts`, `mcp/runtime/testing.ts`) is exported from `@unbranded-ds/tokens/mcp` so future local stdio MCP servers in this monorepo can adopt the same primitives without re-implementing them.

  See `AGENTS.md` at the repo root for connection details, tool inventory, and a worked example.

All notable changes to this package are documented here.

This project adheres to semver. Pre-1.0 minor versions may include breaking changes.

> The 0.2.0 entry below was hand-authored before the Changesets workflow landed in spec 003. From 0.3.0 onward, entries are auto-generated from per-PR `.changeset/*.md` files. See [.changeset/README.md](../../.changeset/README.md) for the current contributor workflow.

## 0.2.0 — 2026-05-15

### Breaking changes

- **Removed wildcard exports.** The `./dist/tailwind/*` and `./dist/css/*` wildcard entries are gone from `package.json` `exports`. Consumers using the old paths must migrate to the clean aliases — see [README.md#migrating-from-010](./README.md#migrating-from-010).
- **Canonical localStorage key for theme persistence is now `unbranded-ds-theme`.** Earlier drafts used `ds-theme` (the snippet in THEMING.md from 0.1.0) or `theme` (proposed by an early consumer). The full org-prefixed key avoids collision with consumer apps that have their own theme persistence. Consumers who manually persisted to either older key lose their saved preference on first 0.2.0 load — their preference falls back to the default theme.

### Added

- **`./preset.css` clean export** mapping to `./dist/tailwind/preset.css`. Two-line Tailwind v4 wiring: `@import 'tailwindcss'; @import '@unbranded-ds/tokens/preset.css';`.
- **FOUC prevention helpers** from `./runtime`: `themeBootstrapScript` (string constant) and `getThemeBootstrapScript({ defaultTheme })` (factory function). Inline as `<script dangerouslySetInnerHTML={{ __html: ... }} />` in `<head>` to prevent the flash-of-wrong-theme on page reload. The constant defaults to `'light'`; pass `{ defaultTheme: 'dark' }` to the factory for dark-by-default apps. Factory output is deterministic across builds so consumers using SHA hash-based Content Security Policies can compute the hash once and trust it. Bootstrap script size: 193 bytes.

### Migration

See [README.md#migrating-from-010](./README.md#migrating-from-010) for the complete consumer-side change list and example diffs.

## 0.1.0 — 2026-04-10

Initial release. W3C DTCG token sources compiled via Style Dictionary into CSS variables, a Tailwind v4 `@theme` preset, JSON output, and a typed TypeScript token map. Three built-in themes (light, dark, brand) with WCAG AA contrast validation.
