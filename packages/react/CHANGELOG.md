# @unbranded-ds/react changelog

## 0.5.1

### Patch Changes

- 4b71862: Drop the redundant quotes inside the icon size-guard (`[&_svg:not([class*=size-])]`) on Button, Tabs, Select, and SegmentedControl. The quoted form escaped into the generated CSS as `[class*=\'size-\']`, which Tailwind's CSS optimizer couldn't parse and flagged on every build. Unquoted, the selector matches the same elements, so component rendering is unchanged.
- Updated dependencies [d32f629]
- Updated dependencies [e3a0654]
- Updated dependencies [22b015b]
  - @unbranded-ds/tokens@0.7.0

## 0.5.0

### Minor Changes

- 54ec4fc: Split the conflated theme axis into two composable axes: a color scheme (light/dark, on `data-color-scheme`, plus a `system` intent that follows the OS) and an aesthetic identity (default/brand/vaporwave, keeping `data-theme`, renamed internally from `aesthetic` to `theme`). They join the existing density axis.

  Tokens: each identity now ships a complete authored palette per color scheme — six cells, every one validated WCAG AA, including the muted-foreground/background pair that slipped through in spec 015. The build emits per-combination CSS under compound `[data-theme][data-color-scheme]` selectors in the cascade order `@layer ds-color-scheme, ds-theme, ds-density;`, with new per-axis storage keys and a three-attribute flash-free bootstrap.

  React: `useTheme()` gains a top-level `colorScheme` convenience (the resolved value plus a one-arg setter) for the common light/dark case; the axis maps stay the source of truth. The old `ThemeToggle` is renamed `ColorSchemeToggle` (light/system/dark), and a new data-driven `ThemeToggle` drives the identity axis.

  No migration path ships: there are no external consumers yet, so this is a clean break rather than a deprecation window.

- 9105983: Fix the destructive Button's contrast and ship the soft destructive treatment as a reusable token.

  The Button's `destructive` variant rendered the destructive color as text on a translucent tint, which fell to about 4.1:1 in the light themes — below WCAG AA. It now paints a new canonical `destructive-subtle` surface with a darker `destructive-subtle-foreground`, authored to pass AA in every identity-by-scheme cell (all six) and surface-independent so it holds on cards and the page background alike.

  A sixth declared contrast pair guards `destructive-subtle-foreground` on `destructive-subtle`, so a theme that drifts below 4.5:1 fails the build with a structured issue; the matrix test also checks the hover state. The pair is canonical and reusable, mirroring `muted`/`muted-foreground`, for any component that needs destructive content on a quiet surface.

### Patch Changes

- bbd8d1f: Fix the accessible-name guidance for the ARIA-role form controls, and warn in development when one renders unnamed.

  Checkbox, Switch, and Slider render a `role="checkbox"`/`"switch"`/`"slider"` element, which a native `<label>` does not name — only `aria-label` or `aria-labelledby` does. The docs taught the native-label pattern, so a developer who copied an example shipped an unnamed control. The `@example` blocks and usage sidecars now show the working pattern: `aria-label` for an unlabeled control, or a visible `<Label id>` paired with `aria-labelledby` for a labeled one. The wrapping `<label>` (Checkbox) and `htmlFor` association (Switch) stay for click-to-toggle.

  A development-only warning now fires when one of these controls mounts with neither `aria-label` nor `aria-labelledby`, naming the control and the fix. It reads props only, never the DOM, and production builds strip it. Neither the warning nor the doc fixes change any rendered DOM.

- c1b4f49: Define the popover surface token so Dialog, Tooltip, and Select content render on a real, opaque background.

  The Dialog, Tooltip, and Select content components style themselves with `bg-popover` / `text-popover-foreground`, but the color schema never defined a `popover` token, so those surfaces resolved to unset CSS variables and rendered transparent. The accessibility gate then measured the Dialog description's muted-foreground text against the overlay showing through instead of a solid panel. That read 3.98:1, below the 4.5:1 floor for WCAG AA.

  `popover` and `popover-foreground` are now canonical color tokens, authored per theme cell as a flat copy of that cell's `background` / `foreground`; elevation stays visual, from the components' ring and shadow. Because `muted-foreground` on `background` already passes AA, the description clears the threshold with no `muted-foreground` change. Two new declared contrast pairs guard `popover-foreground` / `popover` and `muted-foreground` / `popover` across all six identity-by-scheme cells, so a theme that omits the pair or drifts below 4.5:1 fails the build with a structured issue. The spec-020 color-contrast quarantine on the two Dialog stories is gone.

- 4e7426e: The published bundle now declares itself a client module, so React Server Component consumers (Next.js App Router) can import a component without their own `'use client'` boundary. The components have always been client components — they use hooks — but the bundle never said so, so importing one into a server component pulled client code into the server graph and broke the build. A tsup banner adds the directive. No public API change: same exports, same props, same behavior.
- Updated dependencies [54ec4fc]
- Updated dependencies [9105983]
- Updated dependencies [c1b4f49]
  - @unbranded-ds/tokens@0.6.0

## 0.4.0

### Minor Changes

- a012325: Add theme controls: a `ThemeProvider`, the axis-aware `useTheme()` hook, and the `<ThemeToggle>` and `<DensityToggle>` sibling controls. The tokens package gains a browser-safe `themesForAxis()` registry export and now also exports the `Axis` type, `AXIS_ATTRIBUTE`, and the storage-key constants (including a new `THEME_PREFERENCE_STORAGE_KEY`) that the hook reads for its per-axis value lists and flash-free `system` persistence.

### Patch Changes

- Updated dependencies [bfd2c9b]
- Updated dependencies [a012325]
- Updated dependencies [ac9f6ef]
  - @unbranded-ds/tokens@0.5.0

## 0.3.1

### Patch Changes

- b42b8a7: Consume the spec 008 design tokens in component source. Focus rings now read `ring.width`, the overlay components read the `z-index` scale, and overlay open/close animations read the `motion` tokens, so a consumer theming any of those now sees the components respond.

  Adds a `z-index.max` token (9999) for the always-on-top focus-revealed SkipLink, so a focused skip link beats every overlay, including a consumer's own.

  The z-index work fixes a latent stacking bug: a tooltip opened inside a dialog now renders above it (tooltip 60 over overlay 50) instead of both sharing a hardcoded `z-50` with no defined order. No public component API changes; the only visible differences are the corrected overlay stacking and the design-system motion timing.

- Updated dependencies [b42b8a7]
- Updated dependencies [ebc5c69]
  - @unbranded-ds/tokens@0.4.0

## 0.3.0

### Minor Changes

- 0e96a30: Add `<SegmentedControl>` — a mutually-exclusive selection control built on Base UI's RadioGroup primitives, styled as a connected pill. Keyboard navigation follows the WAI-ARIA radiogroup pattern: horizontal orientation uses Left and Right arrows, vertical uses Up and Down, with cross-axis keys ignored.

  The wrapper exposes `Root` and `Item` slots that match Base UI's slot names exactly. CVA variants cover `size` (`sm`, `md`, `lg`), `orientation`, and `disabled`. Controlled (`value` + `onValueChange`) and uncontrolled (`defaultValue`) usage both work. Rendering with zero children emits a structured warning under the `[unbranded-ds]` console namespace; rendering with one or two items is fine.

- a2ef880: Add `<SkipLink>` — a keyboard-accessibility staple. Renders a visually-hidden anchor that reveals on focus and jumps to a target element. Default `targetId` is `'main'`. Multiple instances supported.

  Drop a `<SkipLink />` as the first focusable element in your layout, then add `id="main"` to the matching content region. On first Tab the link reveals at the top-left of the viewport; pressing Enter triggers native browser anchor behavior to scroll and focus the target. For multi-landmark layouts, render several `<SkipLink>` instances with distinct `targetId`s — for example one each pointing at `main`, `nav`, and `footer` — and the consumer chooses how to stack them visually.

- 2de9e1c: Add `<Slider>` — a draggable numeric input wrapping Base UI's Slider primitives. Supports single-value (`[50]`) and range (`[20, 80]`) from day one. Pointer drag, keyboard, and touch all resolve to the same `onValueChange` pathway, with `aria-valuenow` exposed on every thumb. Invalid props (value out of range, `step <= 0`, `min >= max`) clamp to safe defaults and emit a structured `console.warn('[unbranded-ds]', { component: 'Slider', issue, ... })` instead of throwing, so a misconfigured slider never breaks the page that hosts it.
- d7dc002: Add `<Tooltip>` — a token-styled, ARIA-compliant tooltip wrapping Base UI's Tooltip primitives. Exposes `Tooltip.Provider`, `Tooltip.Trigger`, and `Tooltip.Content` with sensible defaults: 700ms hover delay, `side="top"`, `align="center"`, and a Portal that mounts to `document.body` so content escapes ancestors with `overflow: hidden`.

  Wrap any element with `<Tooltip.Trigger asChild>` to preserve the original DOM shape, which is what the citation pattern (`<sup><a>[1]</a></sup>`) requires. The open and close transitions go instant when the user has `prefers-reduced-motion: reduce` set, via Tailwind's `motion-reduce:` variant, so the component stays compliant with WCAG SC 2.3.3 without consumer work.

- 83b2aa2: Export `CardAction` from the Card barrel. The component was already defined in `Card.tsx` but missing from `Card/index.ts`, so consumers couldn't import it. Surfaced while authoring the Card sidecar for spec 006.

### Patch Changes

- a75aea9: Add the sidecar foundation: a `*.usage.md` template at `packages/react/src/components/_template/Component.usage.md` and the supporting CI step that compile-tests all `tsx`-tagged code blocks in sidecar files via `scripts/validate-sidecars.ts`. Per-component sidecars land in follow-up PRs as part of spec 005's retrofit. Repo-root `AGENTS.md` (the agent-facing entry point) lands in the same PR; it indexes every shipped component and names the two MCP endpoints.

  No runtime impact on consumers — this is documentation infrastructure.

- 19a716e: Add usage sidecar for Button.
- abbc0b7: Add usage sidecar for Card.
- 48f0f2f: Add usage sidecar for Checkbox.
- e7a13f3: Add usage sidecar for Dialog.
- 40738bd: Add usage sidecar for Input.
- 38e2750: Add usage sidecar for Label.
- 785877e: Add usage sidecar for SegmentedControl.
- 4b00038: Add usage sidecar for Select.
- edb6dcb: Add usage sidecar for SkipLink.
- e7361ed: Add usage sidecar for Slider.
- 4673da7: Add usage sidecar for Switch.
- 9c5c807: Add usage sidecar for Tabs.
- f1d5caa: Add usage sidecar for Tooltip.
- 5d4fcf3: Add usage sidecar for VisuallyHidden.
- c1fa7ad: Apply the autodoc legibility audit to all 14 shipped components. Adds structured 6-section TSDoc to every component function (or aggregating export for compounds), per-prop TSDoc on every documented prop interface following the 3-section template with WHAT + WHEN context, per-story descriptions on every named story in Storybook, WAI-ARIA APG cross-references where a pattern applies, and compilable `@example` blocks that flow through the same validator pipeline as the sidecars. Closes the six TSDoc-drift bullets recorded by the spec 006 sidecar pass. Also repairs a pre-existing Tailwind `@source` path in the React package's preset.css so utility classes generate in Storybook builds. No runtime behavior or public API changes.
- d21e326: Backfill inter-sidecar Related links after the per-component cohort completes.
- Updated dependencies [f6b4d44]
  - @unbranded-ds/tokens@0.3.0

All notable changes to this package are documented here.

This project adheres to semver. Pre-1.0 minor versions may include breaking changes.

> The 0.2.0 entry below was hand-authored before the Changesets workflow landed in spec 003. From 0.3.0 onward, entries are auto-generated from per-PR `.changeset/*.md` files. See [.changeset/README.md](../../.changeset/README.md) for the current contributor workflow.

## 0.2.0 — 2026-05-15

### Added

- **`./preset.css` clean export** that wraps the tokens preset and adds the `@source` directive scoped to the React package's own dist files. Two-line Tailwind v4 wiring: `@import 'tailwindcss'; @import '@unbranded-ds/react/preset.css';`. Replaces the three-line wiring that 0.1.0 consumers wrote manually.
- **`<VisuallyHidden>` component.** A polymorphic React component for screen-reader-only markup. Uses Tailwind v4's built-in `.sr-only` utility (does not redefine the class). The `as` prop controls the underlying element type and defaults to `<span>`. Ships with full TSDoc, three stories, a play function that verifies the accessible-name pattern, and unit tests covering polymorphism and prop forwarding.

### Companion changes in `@unbranded-ds/tokens`

This package picks up the canonical `./preset.css` export and the new `themeBootstrapScript` and `getThemeBootstrapScript` runtime exports from `@unbranded-ds/tokens@0.2.0`. The breaking change in that companion package (wildcard export removal) affects React consumers whose stylesheets import from `@unbranded-ds/tokens/dist/...` paths. See the [tokens CHANGELOG](../tokens/CHANGELOG.md) for the breaking-change details and migration guide.

### Migration

See [README.md#migrating-from-010](./README.md#migrating-from-010) for the consumer-side change list.

## 0.1.0 — 2026-04-10

Initial release. Nine React components from shadcn/ui's Base UI variant, styled through `@unbranded-ds/tokens`. The full component set: Button, Card, Checkbox, Dialog, Input, Label, Select, Switch, Tabs.
