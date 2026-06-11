# Contract: Expanded token vocabulary

The public token surface after this spec. Consumers (human and agent) reference these names; once shipped they are locked vocabulary.

## New required tokens

Adding these to the required schema is the breaking change to consumer runtime themes.

### Typography (extend existing category)

```jsonc
// packages/tokens/src/tokens/typography.json — additions
"font-serif": { "$value": "ui-serif, Georgia, Cambria, \"Times New Roman\", Times, serif", "$type": "fontFamily" },
"size-2xl":   { "$value": "1.5rem",   "$type": "dimension" },
"size-3xl":   { "$value": "1.875rem", "$type": "dimension" }
```

Emit as `--typography-font-serif`, `--typography-size-2xl`, `--typography-size-3xl` (existing `--typography-*` convention).

### Motion (new category)

```jsonc
// packages/tokens/src/tokens/motion.json
{
  "motion": {
    "duration": {
      "fast": { "$value": "120ms", "$type": "duration" },
      "base": { "$value": "240ms", "$type": "duration" },
      "slow": { "$value": "480ms", "$type": "duration" }
    },
    "easing": {
      "standard":   { "$value": "cubic-bezier(0.4, 0, 0.2, 1)", "$type": "cubicBezier" },
      "decelerate": { "$value": "cubic-bezier(0, 0, 0.2, 1)",   "$type": "cubicBezier" },
      "accelerate": { "$value": "cubic-bezier(0.4, 0, 1, 1)",   "$type": "cubicBezier" }
    }
  }
}
```

Emit (special-cased in `sd.config.ts`) as Tailwind-aligned names:
- `--ease-standard`, `--ease-decelerate`, `--ease-accelerate` → real `ease-*` utilities.
- `--duration-fast`, `--duration-base`, `--duration-slow` → plain CSS vars (no `duration-*` namespace in v4).

## New optional tokens

Optional: absent from a theme means inherit the default; never a validation error. Not a breaking change.

### Ring (new category)

```jsonc
// packages/tokens/src/tokens/ring.json
{ "ring": { "width": { "$value": "3px", "$type": "dimension" } } }
```

Default `3px` matches what the hardcoded `ring-3` usages resolve to. Emits `--ring-width`.

### Z-index (new category)

```jsonc
// packages/tokens/src/tokens/z-index.json — illustrative stops; finalize in tasks
{ "z-index": {
    "overlay": { "$value": "50", "$type": "number" },
    "popover": { "$value": "55", "$type": "number" },
    "tooltip": { "$value": "60", "$type": "number" }
} }
```

Ordered so `tooltip` sits above `popover`/`overlay`, giving nested overlays a defined stacking order (the latent `z-50` bug). Exact stop names and values are settled in tasks; the ordering invariant is the contract. Emits `--z-index-overlay` etc.

## Schema (Zod) shape

- `motionTokens` added to `themeSchema.tokens` as a **required** object with `duration` and `easing` sub-objects (or flattened keys, implementer's call) — required.
- `typographyTokens` gains `font-serif`, `size-2xl`, `size-3xl` — required.
- `ringTokens`, `zIndexTokens` added — **optional** (`.optional()` or `.partial()` on the category) so a theme omitting them validates by inheritance.
- All category objects loosen so a runtime theme may provide a partial subset; the validator merges onto defaults before checking (see `validate-theme.md`).

## TypeScript token map (`sd.config.ts`)

Extend `categoryMap` and the `TokenCategory` union to include the new categories:

```ts
const categoryMap = { color, spacing, typography, radius: 'radii', shadow: 'shadows', opacity, motion: 'motion', ring: 'ring', 'z-index': 'z-index' }
type TokenCategory = "color" | "spacing" | "typography" | "radii" | "shadows" | "opacity" | "motion" | "ring" | "z-index"
```

Every new token MUST appear in all four artifacts: CSS vars, Tailwind preset, TS token map, JSON.
