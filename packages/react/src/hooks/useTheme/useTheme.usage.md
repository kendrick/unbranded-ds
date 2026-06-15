# useTheme

The load-bearing primitive: read and set the theme across every axis from one hook, behind a `<ThemeProvider>`. It is the multi-axis analog of `next-themes`' `useTheme`.

## Import

```tsx
import { ThemeProvider, useTheme } from '@unbranded-ds/react';
```

## Return shape

| Field        | Type                            | Description                                                              |
| ------------ | ------------------------------- | ------------------------------------------------------------------------ |
| `preference` | `Record<Axis, string>`          | Stated choice per axis; the aesthetic axis may be `'system'`.            |
| `resolved`   | `Record<Axis, string>`          | Applied value per axis; `'system'` resolved to light or dark.            |
| `system`     | `Partial<Record<Axis, string>>` | OS value for each axis that has a signal (aesthetic today).              |
| `forced`     | `Partial<Record<Axis, string>>` | Provider-pinned value per axis; an absent key is not forced.             |
| `available`  | `Record<Axis, string[]>`        | Allowed values per axis (registry built-ins plus runtime registrations). |
| `set`        | `(partial) => void`             | Set any subset of axes in one object.                                    |

## If you know next-themes, here is the translation

The vocabulary tracks `next-themes` where a concept maps one-to-one, and renames only where the multi-axis shape forces it. The shape itself, a provider plus a hook, mirrors next-themes.

| Ours           | next-themes       | Difference                                                                                                           |
| -------------- | ----------------- | -------------------------------------------------------------------------------------------------------------------- |
| `preference`   | `theme`           | A per-axis map, renamed so a field that looks like next-themes' string is not secretly an object. May be `'system'`. |
| `resolved`     | `resolvedTheme`   | Per-axis map; same idea.                                                                                             |
| `system`       | `systemTheme`     | Per-axis; only axes with an OS signal appear.                                                                        |
| `forced`       | `forcedTheme`     | Per-axis pinned value.                                                                                               |
| `available`    | `themes`          | Per-axis lists rather than one flat list.                                                                            |
| `set(partial)` | `setTheme(value)` | One object setting any subset of axes in a single call.                                                              |

## Why multi-axis, and why a provider

Theming here is more than light and dark. Spec 009 added a density axis (`data-density`) alongside the aesthetic axis (`data-theme`), and spec 014 unified how those resolve, so a single-value `theme` cannot represent the state; `useTheme` is keyed over the axes, and a future axis is additive. The `<ThemeProvider>` is the single source of truth and the home for `defaults` and `forced`, mirroring next-themes as a deliberate compat-first choice. First-paint flash is prevented by the spec-002 `themeBootstrapScript`, which this hook stays in lockstep with through shared storage keys.

## Example

```tsx
import { ThemeProvider, useTheme } from '@unbranded-ds/react';

function ThemeReadout() {
	const { resolved, set } = useTheme();
	return (
		<button type="button" onClick={() => set({ aesthetic: 'dark', density: 'compact' })}>
			{`${resolved.aesthetic} / ${resolved.density}`}
		</button>
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
