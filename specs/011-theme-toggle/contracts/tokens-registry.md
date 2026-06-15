# Contract: `themesForAxis()` (tokens registry)

A new runtime export from `@unbranded-ds/tokens` that names the values available on an axis. It is the source of truth for `useTheme().available` and the data-driven toggles. Pure data, no React, so it respects the tokens package's React-free graph (Section II).

## Import

```ts
import { themesForAxis } from '@unbranded-ds/tokens';
```

## Signature

```ts
function themesForAxis(axis: Axis): string[];
```

## Behavior

- Returns the axis's built-in values, **including its file-less default** (clarify Q4). For `density` that is `['comfortable', 'compact']` even though only `compact.json` exists; `comfortable` is the base token set.
- Includes anything registered at runtime through `registerTheme` on that axis (clarify Q3), so a consumer's custom theme shows up in toggles without extra wiring.
- Order is stable, default first.

## Implementation notes (for `/speckit.tasks`)

- The built-in names per axis are known to the build. Surface them through a generated or maintained constant rather than reading the filesystem at runtime.
- `registerTheme` currently injects a `<style>` block only. To make runtime registrations visible here, it must also record the `(axis, name)` in a module-level registry that `themesForAxis` reads, seeded with the built-ins. This is the one behavior change to existing tokens code; it is additive and does not alter `registerTheme`'s signature or its injection behavior.
