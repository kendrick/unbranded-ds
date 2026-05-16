# @unbranded-ds/react changelog

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
