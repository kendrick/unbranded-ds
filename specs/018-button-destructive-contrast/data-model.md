# Phase 1 Data Model: Accessible destructive Button across every theme

The "data" here is two new canonical color tokens, their values across the six cells, and the contrast pair that guards them.

## New canonical tokens

| Token                                 | Role                                                    | Type  | Required | CSS variable                            | Tailwind utility                     |
| ------------------------------------- | ------------------------------------------------------- | ----- | -------- | --------------------------------------- | ------------------------------------ |
| `color.destructive-subtle`            | The opaque subtle destructive surface the button paints | color | yes      | `--color-destructive-subtle`            | `bg-destructive-subtle`              |
| `color.destructive-subtle-foreground` | The destructive text/icon color on that surface         | color | yes      | `--color-destructive-subtle-foreground` | `text-destructive-subtle-foreground` |

Both are added to `colorTokens` in `packages/tokens/src/schema.ts` (alongside `destructive` / `destructive-foreground`), so the strict `themeSchema` requires them in any merged theme. Because validation runs on the merged result (`resolveTheme` folds a partial onto `canonicalDefaultTokens` first), a partial consumer theme that omits them inherits the canonical default and still validates. The token map tags them `source: 'schema'` automatically (they are canonical, not theme-extension), so the token-query MCP lists them like any other token.

## Per-cell value matrix

Each cell authors both tokens as opaque colors that clear the contrast pair with headroom. The surface is a low-chroma destructive color (high lightness in light cells, low lightness in dark cells); the foreground is a destructive-hued text dark or light enough to clear ≥5:1 at rest (so the hover darken stays ≥4.5:1).

| Cell            | File                                     | Surface intent                   | Foreground intent      |
| --------------- | ---------------------------------------- | -------------------------------- | ---------------------- |
| default-light   | `src/tokens/color.json` (canonical base) | pale destructive                 | dark destructive text  |
| default-dark    | `themes/color-scheme/dark.json`          | deep destructive                 | light destructive text |
| brand-light     | `themes/theme/brand/light.json`          | pale destructive                 | dark destructive text  |
| brand-dark      | `themes/theme/brand/dark.json`           | deep destructive                 | light destructive text |
| vaporwave-light | `themes/theme/vaporwave/light.json`      | pale destructive (vaporwave hue) | dark destructive text  |
| vaporwave-dark  | `themes/theme/vaporwave/dark.json`       | deep destructive (vaporwave hue) | light destructive text |

Exact oklch values are authored and verified during implementation with the package's own `contrastRatio` (the tsx check that proved the spec-016 palettes), not eyeballed. The build regenerates `src/tokens/defaults.generated.ts` from the canonical base.

## Contrast pair

Added to `contrastPairs` in `packages/tokens/src/schema.ts`:

```ts
{ foreground: 'color.destructive-subtle-foreground', background: 'color.destructive-subtle', threshold: 4.5 }
```

This is the sixth declared pair (after `foreground`/`background`, `primary-foreground`/`primary`, `muted-foreground`/`muted`, `destructive-foreground`/`destructive`, and `muted-foreground`/`background`). Every surface that iterates `contrastPairs` inherits the guard: `validateResolved`, the runtime post-oklch-conversion check in `runtime.ts`, the per-cell matrix test (`themes-contrast.test.ts`), and the token-query MCP contrast tool.

## Validation rules

- Each of the six cells MUST resolve the pair at ≥4.5:1 (FR-001, FR-007); the matrix test fails the build otherwise.
- The pair MUST hold against the button's hover state too (FR-003); authored with rest-state headroom and asserted in the Button/contrast tests.
- The hover/focus realization MUST stay surface-independent (the opaque base composites predictably) (FR-005).
- The existing `destructive` / `destructive-foreground` pair is unchanged and still validated (FR-010).

## State / lifecycle

None. These are static design tokens compiled to CSS variables at build time; there is no runtime state machine.
