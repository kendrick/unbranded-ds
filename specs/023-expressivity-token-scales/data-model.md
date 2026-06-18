# Phase 1 Data Model: Expressivity token scales

The "data" here is two token scales added to the canonical schema. Both are build-time DTCG sources compiled to the four artifacts; neither has runtime or persisted state.

## Entity: Tracking scale

A new top-level token category, `tracking`, holding letter-spacing values.

| Field (key) | Value | Emitted variable | Tailwind utility |
|-------------|-------|------------------|------------------|
| `tighter` | `-0.05em` | `--tracking-tighter` | `tracking-tighter` |
| `tight` | `-0.025em` | `--tracking-tight` | `tracking-tight` |
| `normal` | `0em` | `--tracking-normal` | `tracking-normal` |
| `wide` | `0.025em` | `--tracking-wide` | `tracking-wide` |
| `wider` | `0.05em` | `--tracking-wider` | `tracking-wider` |
| `widest` | `0.1em` | `--tracking-widest` | `tracking-widest` |

- **DTCG type**: `dimension` (em values; same `$type` family as the existing sizing tokens).
- **Schema**: a `trackingTokens` Zod object with the six required keys, added to `tokensSchema` as a required category.
- **Relationships**: a sibling of the other token categories. Overridable per theme like any category (a theme may set its own tracking values, whole or in part).
- **Validation rules**: all six keys required in the strict (merged) `themeSchema`. A fully-specified theme missing one fails validation with a structured issue naming the path (e.g. `tracking.widest`).

## Entity: Radius scale (extended)

The existing `radius` category, grown with three larger steps. Existing keys are unchanged.

| Field (key) | Value | Status | Emitted variable |
|-------------|-------|--------|------------------|
| `sm` | `0.25rem` | unchanged | `--radius-sm` |
| `md` | `0.375rem` | unchanged | `--radius-md` |
| `lg` | `0.5rem` | unchanged | `--radius-lg` |
| `xl` | `0.75rem` | **new** | `--radius-xl` |
| `2xl` | `1rem` | **new** | `--radius-2xl` |
| `3xl` | `1.5rem` | **new** | `--radius-3xl` |
| `full` | `9999px` | unchanged | `--radius-full` |

- **DTCG type**: `dimension`, matching the existing radius tokens.
- **Schema**: `radiiTokens` gains `xl`, `2xl`, `3xl` as required keys.
- **Relationships**: the same category components already consume via `rounded-*` utilities and `var(--radius-*)`.
- **Validation rules**: the three new keys required in the strict schema. Existing key values are unchanged, so no existing theme's rendered output changes (SC-003).
- **Composition rule**: an asymmetric corner is expressed by composing per-corner radius tokens (`border-radius: var(--radius-3xl) 0 var(--radius-3xl) 0`); no new per-corner token type exists.

## Inheritance and migration

- `canonicalDefaultTokens` (the generated baseline in `defaults.generated.ts`) is regenerated from the base sources, so it carries the new tracking and radius defaults.
- Built-in themes are partial overrides merged onto the defaults. None override `tracking` or the new radius keys, so all inherit the defaults and need no edits.
- A fully-specified external consumer theme (one declaring every token) must add the new keys or it fails validation. This is the announced breaking change, carried by the `@unbranded-ds/tokens` 0.5.0 → 0.6.0 minor bump.

## State transitions

None. Tokens are static build-time values.
