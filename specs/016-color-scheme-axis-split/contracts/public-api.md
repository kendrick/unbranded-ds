# Contract: public API after the split

What consumers and agents see on `@unbranded-ds/react` and `@unbranded-ds/tokens`.

## Data attributes

- `data-color-scheme="light|dark"` — the color scheme. New.
- `data-theme="default|brand|vaporwave"` — the aesthetic identity. No longer holds light/dark.
- `data-density="comfortable|compact"` — unchanged.

All three are written before paint by the bootstrap and composed through the cascade.

## Controls (`@unbranded-ds/react`)

- `ColorSchemeToggle` — the renamed light/system/dark control, driving the color-scheme axis. Same props as today's `ThemeToggle` (size, orientation, labels, icons, aria-label defaulting to "Color scheme"). Fixed segments light/system/dark.
- `ThemeToggle` — new, drives the theme (identity) axis. Data-driven from `themesForAxis('theme')` (so `default`/`brand`/`vaporwave` appear automatically, like `DensityToggle`). No `system` segment.
- `DensityToggle` — unchanged.

Both toggles render disabled when their axis is forced, and stay unselected until mounted (the `AxisToggle` behavior, unchanged).

## `useTheme` (`@unbranded-ds/react`)

Axis-keyed over `theme`, `colorScheme`, `density`, plus a top-level `colorScheme` convenience (resolved getter and a setter shorthand). See [data-model.md](../data-model.md) for the full shape and the next-themes mapping. `ThemeProvider`'s `defaults` and `forced` are keyed by the new axis names (`{ theme, colorScheme, density }`).

## Bootstrap (`@unbranded-ds/tokens/runtime`)

`getThemeBootstrapScript({ defaultColorScheme?, defaultTheme?, defaultDensity? })` returns a self-executing string that sets all three attributes before paint from the three concrete keys, falling back to `light` / `default` / `comfortable`. `themeBootstrapScript` is the zero-arg form. The output (and therefore its CSP hash) changes.

## Theme CSS (`@unbranded-ds/tokens/themes/*.css`)

The subpath glob still resolves theme CSS. The emitted set changes to reflect the matrix: the color-scheme base (`light`, `dark`) and the per-identity, per-scheme palettes. Consumers import the schemes and identities they use, the same additive pattern as before.

## Storage keys (`@unbranded-ds/tokens/client`)

`COLOR_SCHEME_STORAGE_KEY`, `COLOR_SCHEME_PREFERENCE_STORAGE_KEY`, `THEME_STORAGE_KEY` (now identity), `DENSITY_STORAGE_KEY`. Exported as constants so the bootstrap and the store share one source of truth.
