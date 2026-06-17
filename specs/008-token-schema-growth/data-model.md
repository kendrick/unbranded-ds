# Data Model: Token schema growth

**Phase 1 output** | **Date**: 2026-05-25

No runtime database. The "data model" is the token vocabulary, the two theme representations, and the merge semantics the validator enforces.

## Token categories after this spec

| Category     | Status    | Keys added                                                             | DTCG `$type`              | Required?    |
| ------------ | --------- | ---------------------------------------------------------------------- | ------------------------- | ------------ |
| `color`      | unchanged | —                                                                      | `color`                   | required     |
| `spacing`    | unchanged | —                                                                      | `dimension`               | required     |
| `typography` | extended  | `font-serif`, `size-2xl`, `size-3xl`                                   | `fontFamily`, `dimension` | required     |
| `radius`     | unchanged | —                                                                      | `dimension`               | required     |
| `shadow`     | unchanged | —                                                                      | `shadow`                  | required     |
| `opacity`    | unchanged | —                                                                      | `number`                  | required     |
| `motion`     | **new**   | `duration.{fast,base,slow}`, `easing.{standard,decelerate,accelerate}` | `duration`, `cubicBezier` | required     |
| `ring`       | **new**   | `width`                                                                | `dimension`               | **optional** |
| `z-index`    | **new**   | layering scale (e.g. `overlay`, `popover`, `tooltip`)                  | `number`                  | **optional** |

Two tiers: the for-coleman additions are required (breaking, drives the version bump); `ring` and `z-index` are optional (inherit defaults, non-breaking). The optional tokens are the first in-repo consumers of the inherit-on-omit mechanism.

### Motion token output naming (special case)

The `motion` category is the one category whose emitted CSS-var names diverge from the `--{category}-{key}` pattern, to align with Tailwind v4:

| Token                      | Emitted CSS var     | Tailwind utility                            |
| -------------------------- | ------------------- | ------------------------------------------- |
| `motion.easing.standard`   | `--ease-standard`   | `ease-standard` (real utility)              |
| `motion.easing.decelerate` | `--ease-decelerate` | `ease-decelerate`                           |
| `motion.easing.accelerate` | `--ease-accelerate` | `ease-accelerate`                           |
| `motion.duration.fast`     | `--duration-fast`   | none; via `duration-[var(--duration-fast)]` |
| `motion.duration.base`     | `--duration-base`   | none; via arbitrary value                   |
| `motion.duration.slow`     | `--duration-slow`   | none; via arbitrary value                   |

The build special-cases motion var naming in `sd.config.ts`.

## The two theme representations (the Q1 distinction)

This is the model the THEMING.md distinction documents. Both are called "theme" in the codebase; they are different artifacts on different pipelines.

### Token-source override (build-time)

- **Shape**: DTCG. `{ "color": { "background": { "$value": "...", "$type": "color" } }, "radius": { ... } }`. No `name`/`displayName`/`tokens` wrapper.
- **Location**: `packages/tokens/themes/*.json`.
- **Consumer**: Style Dictionary. The build merges `src/tokens/**` (defaults) under each theme file and emits `dist/css/tokens-<theme>.css` scoped to `[data-theme="<theme>"]`.
- **Validation**: by build output (the CSS is correct), not by `validateTheme`.
- **After this spec**: may carry any category. `brand.json` carries `color` + `radius` + a `typography` override; `light`/`dark` stay color-only.

### Runtime theme document (just-in-time)

- **Shape**: flat. `{ "name": "...", "displayName": "...", "tokens": { "color": { "background": "oklch(...)" }, "radius": { ... } } }`. String values, not DTCG objects.
- **API**: `registerTheme(theme)` validates via `validateTheme(theme)`, then injects a `<style>[data-theme="<name>"]{ --category-key: value }` block at runtime.
- **Validation**: `validateTheme` — Zod schema conformance + WCAG AA contrast on the resolved (merged) result.
- **After this spec**: may override any subset of any category; omitted tokens inherit the canonical defaults; validation runs against the merged result.

## Canonical default layer

The resolved `src/tokens` set: a complete value for every required token. Both pipelines treat it as the inheritance baseline. Partial runtime themes merge onto it; built-in token-source overrides merge onto it at build. It must itself be complete — a required token missing from the defaults is the one MISSING_TOKEN error that can fire after merge.

## Validation: resolve-then-validate

```
validateTheme(partial):
  resolved = deepMerge(canonicalDefaults, partial.tokens)   # override wins
  1. schema check: every required token present in resolved? else MISSING_TOKEN(path)
  2. type check: every value the right shape? else INVALID_TYPE(path)
  3. contrast check: for each contrast pair, resolve BOTH sides from `resolved`
       (never skip when one side came from defaults) — else CONTRAST_FAILURE(pair)
  return { ok: true, theme: resolved } | { ok: false, issues }
```

`registerTheme` applies the same resolve-then-check before its post-oklch-conversion contrast pass. Both call sites currently skip a pair when one side is absent; both stop skipping by validating the merged result.

**ValidationIssue shape** (unchanged, Section XI.4): `{ path, code: 'MISSING_TOKEN' | 'INVALID_TYPE' | 'UNKNOWN_TOKEN' | 'CONTRAST_FAILURE', message, expected?, actual?, ratio?, threshold? }`.

## Contrast pairs (unchanged)

The four declared pairs stay color-only: `foreground/background`, `primary-foreground/primary`, `muted-foreground/muted`, `destructive-foreground/destructive`, all at 4.5:1. Loosening category coverage does not touch them; they now resolve both sides from the merged theme.

## Entities summary

- **Token category**: a named group with a fixed key set known at build time. This spec adds `motion`, `ring`, `z-index` and three `typography` keys.
- **Token-source override**: a DTCG theme file consumed by the build (see above).
- **Runtime theme document**: a flat theme object validated and injected at runtime (see above).
- **Canonical default layer**: the complete resolved `src/tokens` baseline both representations inherit from.
- **Validation issue**: structured `{ code, path, message }` result, layered with human-readable text.
