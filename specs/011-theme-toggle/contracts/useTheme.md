# Contract: `useTheme()`

The load-bearing primitive. Reads the nearest `<ThemeProvider>` and returns the multi-axis theme state plus one setter.

## Import

```ts
import { useTheme } from '@unbranded-ds/react';
```

## Signature

```ts
function useTheme(): UseThemeReturn;
```

No arguments. Configuration (`defaults`, `forced`, `root`) lives on the provider, so every `useTheme()` call in the tree reflects one shared state.

## Return

```ts
interface UseThemeReturn {
  preference: Record<Axis, string>;        // stated choice; aesthetic may be 'system'
  resolved: Record<Axis, string>;          // applied value; 'system' resolved to light/dark
  system: Partial<Record<Axis, string>>;   // current OS value where a signal exists (aesthetic only)
  forced: Partial<Record<Axis, string>>;   // provider-pinned, non-overridable
  available: Record<Axis, string[]>;       // allowed values per axis, incl. the file-less default
  set: (partial: Partial<Record<Axis, string>>) => void; // one object, any subset of axes
}
```

`Axis` is the union exported by `@unbranded-ds/tokens` (`'aesthetic' | 'density'` today).

## If you know `next-themes`, here is the translation (FR-019)

| `useTheme()` (ours) | `next-themes` | Difference |
|---------------------|---------------|------------|
| `preference` | `theme` | Ours is a per-axis map and renamed, because a field called `theme` that is secretly an object is a false friend. The aesthetic axis may be `'system'`, like next-themes' `theme`. |
| `resolved` | `resolvedTheme` | Per-axis map; same idea (`system` resolved to a concrete value). |
| `system` | `systemTheme` | Per-axis; only axes with an OS signal appear (aesthetic). |
| `forced` | `forcedTheme` | Per-axis; the pinned value set on the provider. |
| `available` | `themes` | Per-axis lists rather than one flat list. |
| `set(partial)` | `setTheme(value)` | One object setting any subset of axes in a single call, rather than one value. |

The provider-plus-hook shape itself mirrors next-themes. The multi-axis object shape is ours; the concepts and names track upstream wherever they map one-to-one.

## Behavior

- `preference[axis]` is the stated value; `resolved[axis]` is what the DOM attribute carries. They differ only when the preference is `system`.
- `set({ aesthetic: 'vaporwave', density: 'compact' })` updates both axes in one call; omitted axes are untouched.
- `set` validates against `available[axis]` (or accepts `system` on a signal axis) and refuses forced axes; see [failures.md](failures.md).
- Calling `useTheme()` with no `<ThemeProvider>` ancestor throws `THEME_NO_PROVIDER`.
- SSR-safe: returns the provider defaults during the server render and the first client render, then reconciles to stored values on mount.
