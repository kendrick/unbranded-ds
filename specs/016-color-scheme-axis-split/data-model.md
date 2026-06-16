# Phase 1 Data Model: Color-scheme and theme axis split

The "data" here is the theming axis model and the palette matrix, plus the storage and the hook shape. Tasks decompose against these.

## Axes

| Axis | Attribute | Values | System signal | File-less default |
|------|-----------|--------|---------------|-------------------|
| `colorScheme` (new) | `data-color-scheme` | `light`, `dark` (plus the `system` intent) | yes (`prefers-color-scheme`) | `light` (the base token set) |
| `theme` (was `aesthetic`) | `data-theme` | `default`, `brand`, `vaporwave` | no | `default` (no override file) |
| `density` (unchanged) | `data-density` | `comfortable`, `compact` | no | `comfortable` |

`system` is not a registry value; it is a stated intent on the color-scheme axis that resolves to `light` or `dark` from the OS (`resolvePreference`).

## Palette matrix

Each cell is a complete authored palette. Six shipped palettes; every cell must pass WCAG AA (including the new `muted-foreground`/`background` pair).

| identity \ scheme | light | dark |
|-------------------|-------|------|
| `default` | base token set, `[data-color-scheme="light"]` | `themes/color-scheme/dark.json`, `[data-color-scheme="dark"]` |
| `brand` | `themes/theme/brand/light.json`, `[data-theme="brand"][data-color-scheme="light"]` | `themes/theme/brand/dark.json`, compound selector |
| `vaporwave` | `themes/theme/vaporwave/light.json` (newly designed) | `themes/theme/vaporwave/dark.json` (today's vaporwave palette) |

Cascade: `@layer ds-color-scheme, ds-theme, ds-density;`. The compound theme selector wins over the bare color-scheme base; density refines last.

## Storage keys

| Key | Holds | Read by |
|-----|-------|---------|
| `unbranded-ds-color-scheme` (new) | the concrete color scheme (`light`/`dark`) | bootstrap + store |
| `unbranded-ds-color-scheme-preference` (new) | the stated color-scheme intent, including `system` | store only |
| `unbranded-ds-theme` (repurposed) | the identity (`default`/`brand`/`vaporwave`) | bootstrap + store |
| `unbranded-ds-density` (unchanged) | density | bootstrap + store |

No migration of previously stored values (no consumers with saved state).

## `useTheme` return shape

Axis-keyed over the three axes, plus the convenience:

- `preference: Record<Axis, string>` — stated per axis; `colorScheme` may be `'system'`.
- `resolved: Record<Axis, string>` — applied per axis; `system` resolved to light/dark.
- `system: Partial<Record<Axis, string>>` — OS value where there is a signal (`colorScheme` only).
- `forced: Partial<Record<Axis, string>>` — pinned per axis.
- `available: Record<Axis, string[]>` — allowed values per axis from the registry.
- `set: (partial) => void` — set any subset of axes.
- `colorScheme` (new convenience) — the resolved color scheme, with a setter shorthand for `set({ colorScheme })`.

`Axis = 'theme' | 'colorScheme' | 'density'`.

## next-themes mapping (documented for legibility)

| next-themes | here |
|-------------|------|
| `theme` | the `theme` (identity) axis |
| `resolvedTheme` | `colorScheme.resolved` |
| `systemTheme` | `colorScheme.system` |
| `setTheme` | `set({ ... })` or the `colorScheme` setter |
| `themes` | `available` per axis |
