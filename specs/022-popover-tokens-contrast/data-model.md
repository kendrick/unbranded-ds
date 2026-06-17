# Phase 1 Data Model: Popover tokens and the Dialog description contrast fix

This feature has no runtime data. The "entities" are the new token pair, the contrast pairs that guard it, and the matrix of cells each must hold across. All are build-time token definitions.

## The popover token pair

Two new canonical color tokens added to `colorTokens` in `schema.ts`:

| Token | CSS variable | Type | Value per cell |
|-------|--------------|------|----------------|
| `color.popover` | `--color-popover` | color | equal to that cell's `color.background` |
| `color.popover-foreground` | `--color-popover-foreground` | color | equal to that cell's `color.foreground` |

Both carry `source: 'schema'` in the token map (they are canonical, not theme-extension). The `--z-index-popover` token is unrelated and unchanged — different prefix, no collision.

## The contrast pairs

Two entries appended to the exported `contrastPairs` array, both at the AA threshold for normal text:

| Foreground | Background | Threshold |
|------------|------------|-----------|
| `color.popover-foreground` | `color.popover` | 4.5 |
| `color.muted-foreground` | `color.popover` | 4.5 |

This mirrors the two-pair coverage `background` already has (`foreground`/`background` and `muted-foreground`/`background`). The array length moves from 6 to 8. `themes-contrast.test.ts` derives its checks from this array, so both pairs are validated across every cell with no test edit.

## The cell matrix

Each cell is one shipped color-scheme × identity combination, authored as a complete palette file. Every cell must declare the popover pair from its own background/foreground:

| Cell | File | popover source |
|------|------|----------------|
| default · light | `src/tokens/color.json` | this file's `background` / `foreground` |
| default · dark | `themes/color-scheme/dark.json` | this file's `background` / `foreground` |
| brand · light | `themes/theme/brand/light.json` | this file's `background` / `foreground` |
| brand · dark | `themes/theme/brand/dark.json` | this file's `background` / `foreground` |
| vaporwave · light | `themes/theme/vaporwave/light.json` | this file's `background` / `foreground` |
| vaporwave · dark | `themes/theme/vaporwave/dark.json` | this file's `background` / `foreground` |

Density is a fourth axis but carries no color, so it multiplies the cells without adding popover values. Because `popover` equals `background` and `popover-foreground`/`popover` therefore equals the already-passing `foreground`/`background` relationship per cell, every cell passes AA by construction; the matrix test confirms it rather than assuming it.

## Validation rules

- **Completeness**: `popover` and `popover-foreground` are required keys in the strict `themeSchema`. A composed theme missing either fails `validateComposedTheme` (a coded issue, not a silent pass). Consumer *partial* themes merge onto `canonicalDefaultTokens` first, so a consumer who omits popover inherits the default rather than failing.
- **Contrast**: each new pair must reach 4.5:1 in every cell, enforced by the matrix loop in `themes-contrast.test.ts` via the `contrastPairs` array.
- **No regression**: the existing six pairs must stay green; adding a surface equal to `background` cannot lower any of them, and the matrix re-runs all pairs to confirm.

## State transitions

None. The tokens are static build-time values; the validation is a build-time gate.
