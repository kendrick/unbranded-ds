# @unbranded-ds/react changelog

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
