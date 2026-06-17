# useTheme

The load-bearing primitive: read and set the theme across every axis from one hook, behind a `<ThemeProvider>`. It is the multi-axis analog of `next-themes`' `useTheme`.

## Import

```tsx
import { ThemeProvider, useTheme } from '@unbranded-ds/react';
```

## Axes

There are three orthogonal axes (spec 016), each on its own `data-*` attribute:

- `colorScheme` — `light` / `dark`, plus the OS-following `system` intent (`data-color-scheme`).
- `theme` — the aesthetic identity: `default` / `brand` / `vaporwave` (`data-theme`).
- `density` — `comfortable` / `compact` (`data-density`).

## Return shape

| Field         | Type                            | Description                                                                         |
| ------------- | ------------------------------- | ----------------------------------------------------------------------------------- |
| `preference`  | `Record<Axis, string>`          | Stated choice per axis; the `colorScheme` axis may be `'system'`.                   |
| `resolved`    | `Record<Axis, string>`          | Applied value per axis; `'system'` resolved to light or dark.                       |
| `system`      | `Partial<Record<Axis, string>>` | OS value for each axis that has a signal (`colorScheme` only).                      |
| `forced`      | `Partial<Record<Axis, string>>` | Provider-pinned value per axis; an absent key is not forced.                        |
| `available`   | `Record<Axis, string[]>`        | Allowed values per axis (registry built-ins plus runtime registrations).            |
| `set`         | `(partial) => void`             | Set any subset of axes in one object.                                               |
| `colorScheme` | `ColorSchemeConvenience`        | The common case: `{ resolved, preference, system, set }` for the color-scheme axis. |

The `colorScheme` convenience is a flattened view of the most-used axis plus a one-arg setter, so `colorScheme.set('dark')` replaces the verbose `set({ colorScheme: 'dark' })`. The axis maps stay the source of truth; the convenience just reads from them.

## If you know next-themes, here is the translation

The vocabulary tracks `next-themes` where a concept maps one-to-one, and renames only where the multi-axis shape forces it. The shape itself, a provider plus a hook, mirrors next-themes. The one thing to internalize: next-themes' `theme` (the named look) is our **identity** axis, while its `resolvedTheme`/`systemTheme` (light/dark) are our **color-scheme** axis. Spec 016 split what next-themes conflates.

| Ours                                      | next-themes       | Difference                                                            |
| ----------------------------------------- | ----------------- | --------------------------------------------------------------------- |
| `preference.theme`                        | `theme`           | The aesthetic identity (default/brand/vaporwave), not light/dark.     |
| `colorScheme.resolved`                    | `resolvedTheme`   | The applied light/dark, with `system` resolved.                       |
| `colorScheme.system`                      | `systemTheme`     | The OS light/dark.                                                    |
| `colorScheme.preference`                  | —                 | The stated color-scheme intent; may be `'system'`.                    |
| `forced`                                  | `forcedTheme`     | Per-axis pinned value.                                                |
| `available`                               | `themes`          | Per-axis lists rather than one flat list.                             |
| `set(partial)` / `colorScheme.set(value)` | `setTheme(value)` | One object setting any subset of axes, or the color-scheme shorthand. |

## Why multi-axis, and why a provider

Theming here is more than light and dark. The density axis (`data-density`, spec 009) and the color-scheme/identity split (spec 016) mean a single-value `theme` cannot represent the state; `useTheme` is keyed over the axes, and a future axis is additive. The `<ThemeProvider>` is the single source of truth and the home for `defaults` and `forced`, mirroring next-themes as a deliberate compat-first choice. First-paint flash is prevented by the spec-002 `themeBootstrapScript`, which this hook stays in lockstep with through shared storage keys (the color-scheme key always holds a concrete value, never `system`).

## Example

```tsx
import { ThemeProvider, useTheme } from '@unbranded-ds/react';

function ThemeReadout() {
	const { resolved, set, colorScheme } = useTheme();
	return (
		<div>
			<button type="button" onClick={() => colorScheme.set('dark')}>
				{`scheme: ${colorScheme.resolved}`}
			</button>
			<button type="button" onClick={() => set({ theme: 'brand', density: 'compact' })}>
				{`${resolved.theme} / ${resolved.density}`}
			</button>
		</div>
	);
}

export function App() {
	return (
		<ThemeProvider>
			<ThemeReadout />
		</ThemeProvider>
	);
}
```

## Failure modes

`set()` with a value not in `available[axis]`, a value on a forced axis, or `'system'` on an axis with no OS signal each warn through the `warn()` helper with a stable `code` and no-op. Calling `useTheme()` with no `<ThemeProvider>` ancestor throws `THEME_NO_PROVIDER`.
