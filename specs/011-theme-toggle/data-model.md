# Phase 1 Data Model: Theme controls

There is no persisted database. The data here is the in-memory theme state, its localStorage projection, and the per-axis value sets. The TypeScript below is illustrative; the authoritative definitions ship in `packages/react/src/hooks/useTheme/types.ts`.

## Axis

An independent theming dimension. The canonical list is the `Axis` union from `@unbranded-ds/tokens`.

- Today: `'aesthetic'` (attribute `data-theme`, storage key `unbranded-ds-theme`) and `'density'` (attribute `data-density`, storage key `unbranded-ds-density`).
- A future `color-scheme` axis is additive: a new union member, attribute, and storage key, with no change to the hook's shape (FR-009).

## Value vocabulary per axis

- `aesthetic`: `light`, `dark`, `brand`, `vaporwave` (built-ins); `light` is the default.
- `density`: `comfortable` (the file-less default) and `compact`.
- `available[axis]` comes from `themesForAxis(axis)` in the tokens registry: built-ins including the file-less default, plus any runtime `registerTheme` additions.

## Preference, Resolved, Forced, System

- **Preference** (`Record<Axis, string>`): the user's stated choice. On the aesthetic axis it may be `system` (follow the OS). On density it is always concrete.
- **Resolved** (`Record<Axis, string>`): the value applied to the DOM attribute. Equals the preference except when the preference is `system`, which resolves to `light` or `dark` from `prefers-color-scheme`.
- **Forced** (`Partial<Record<Axis, string>>`): a provider-pinned value that overrides preference and storage for that axis and cannot change through `set()`.
- **System** (`Partial<Record<Axis, string>>`): the current OS value for axes that have a signal (`aesthetic` only today, `light` or `dark`).

## Hook return shape

```ts
interface UseThemeReturn {
  preference: Record<Axis, string>;        // stated; aesthetic may be 'system'
  resolved: Record<Axis, string>;          // applied; system resolved to light/dark
  system: Partial<Record<Axis, string>>;   // OS value where a signal exists
  forced: Partial<Record<Axis, string>>;   // provider-pinned, non-overridable
  available: Record<Axis, string[]>;       // allowed values per axis (incl. file-less default)
  set: (partial: Partial<Record<Axis, string>>) => void; // one object, any subset of axes
}
```

## Storage model

| Key | Holds | Read by |
|-----|-------|---------|
| `unbranded-ds-theme` | the concrete applied aesthetic value (never `system`) | spec-002 bootstrap, hook |
| `unbranded-ds-theme-preference` | the stated aesthetic intent, including `system` (new companion key) | hook |
| `unbranded-ds-density` | the density value | spec-002 bootstrap, hook |

The bootstrap reads only the concrete keys, so it never applies a non-existent `data-theme="system"`. The hook treats the companion key as authoritative for intent, falling back to the concrete key and then the default.

## State transitions

- **Mount**: read storage (concrete keys plus the companion), resolve `system` against the OS, apply attributes if they differ, and subscribe to `prefers-color-scheme` if any axis is `system`.
- **`set(partial)`**: for each axis in the object, validate the value against `available[axis]` (or accept `system` on a signal axis), reject forced axes, persist (the concrete key always receives a concrete value; the companion key receives the intent), update the store, then re-resolve and re-apply attributes.
- **OS change while `system`**: re-resolve and re-apply the affected axis; do not write to storage.
- **Unmount**: remove the media-query listener.

## Validation rules

| Condition | Outcome |
|-----------|---------|
| value not in `available[axis]` and not `system` | `THEME_INVALID_VALUE` (warn, no-op) |
| `system` on an axis with no OS signal | `THEME_NO_SYSTEM_SOURCE` (warn, no-op) |
| `set()` targets a forced axis | `THEME_AXIS_FORCED` (warn, no-op) |
| `useTheme()` with no provider ancestor | `THEME_NO_PROVIDER` (throw) |
