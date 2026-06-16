# Phase 0 Research: Accessible destructive Button across every theme

The spec's Clarifications settled the shape (soft tint, dedicated canonical tokens, all six cells, surface-independent). This records the realization decisions that follow.

## 1. The token pair: names and shape

**Decision**: Add two canonical color tokens, `destructive-subtle` (the surface the button paints) and `destructive-subtle-foreground` (its text/icon color). They mirror the existing `muted` / `muted-foreground` pair in naming and role.

**Rationale**: The codebase's color tokens already follow `<role>` / `<role>-foreground` (`primary`/`primary-foreground`, `muted`/`muted-foreground`, `destructive`/`destructive-foreground`). A subtle destructive surface with its own legible foreground is the same shape, so the names are predictable for a consumer or agent (Constitution XI.2). The existing `destructive` / `destructive-foreground` pair stays unchanged for solid destructive usage.

**Alternatives considered**: Reuse `destructive` as the text on a new `destructive-subtle` surface — rejected, because `destructive` on the subtle tint is exactly the 4.1:1 failure; the text must be a distinct, darker value. A single combined token — rejected, contrast needs both sides named.

## 2. Opaque surface, not a translucent tint

**Decision**: `destructive-subtle` is an opaque color per cell, not an alpha composite like the current `bg-destructive/10`.

**Rationale**: The spec requires surface independence (AA on the page background and on card/muted surfaces). A translucent tint composites differently over each surface, so its contrast drifts with whatever sits behind it. An opaque token paints the same color regardless of surface, so the validated pair holds everywhere the button appears.

**Alternatives considered**: Keep a translucent tint and validate it against every standard surface — rejected as fragile (each new surface is a new contrast case, and a consumer's custom surface is unbounded).

## 3. Hover and focus states

**Decision**: Hover darkens the subtle surface by compositing a small amount of `destructive` over the opaque `destructive-subtle` (`color-mix` in oklab), keeping it surface-independent and token-driven without a third canonical token. Focus keeps the existing `destructive`-based ring and border. The foreground is authored with headroom (target ≥5:1 at rest) so the hover darken stays ≥4.5:1.

**Rationale**: Preserves the current hover affordance (the surface deepens on hover) while honoring the two-token decision from clarify. Hover is the worst case for a dark-on-light foreground (a darker surface lowers contrast), so authoring rest-state headroom is what guarantees FR-003.

**Alternatives considered**: A third `destructive-subtle-hover` canonical token — rejected (clarify chose a pair; a derived darken is enough and the contrast test guards it). A Tailwind `brightness` filter — rejected (not token-driven, and it shifts unpredictably per cell).

## 4. Growing the canonical schema, safely

**Decision**: Add both keys to `colorTokens` in `schema.ts` as required, and add their values to the canonical baseline (`src/tokens/color.json`) plus every cell. The resolve-then-validate flow (`resolveTheme` merges a partial onto `canonicalDefaultTokens` before the strict check) means a consumer theme that omits the pair inherits the default and still validates.

**Rationale**: Required keys keep the pair first-class and guaranteed present in any merged theme, matching every other color token. Because completeness is checked on the merged result, not the raw partial, requiring them is not a breaking burden on partial consumer themes (Constitution III's documented resolve flow).

**Alternatives considered**: Make them optional — rejected, it would let a bundled cell silently omit the pair and fall back to a default that may not suit that cell's palette.

## 5. The validator guard and the per-cell matrix

**Decision**: Add `{ foreground: 'color.destructive-subtle-foreground', background: 'color.destructive-subtle', threshold: 4.5 }` to `contrastPairs` in `schema.ts`. The existing `themes-contrast.test.ts` iterates `contrastPairs` across all six cells, so the new pair is validated everywhere automatically; add one explicit assertion naming it so the intent is legible.

**Rationale**: This is the exact pattern spec 016 used for `muted-foreground`/`background`. It flows into `validateResolved`, the runtime post-conversion check, and the token-query MCP contrast tool, all of which iterate `contrastPairs` — so the guard is consistent across every surface that checks contrast.

**Alternatives considered**: A bespoke one-off test for the destructive button only — rejected, it would not guard runtime-registered themes or the MCP.

## 6. The Button variant

**Decision**: Change the `destructive` CVA entry to `bg-destructive-subtle text-destructive-subtle-foreground`, with hover via the `color-mix` darken and the existing focus ring, and drop the `dark:` overrides.

**Rationale**: The `dark:` overrides (`dark:bg-destructive/20`, etc.) existed to boost the translucent tint in dark mode. With per-cell opaque tokens, the single `bg-destructive-subtle` utility already resolves to the right value in each cell (the dark cells author a dark-appropriate subtle surface), so the dark-only branches become redundant and are removed.

**Alternatives considered**: Keep the `dark:` branches pointing at the new tokens — rejected as dead weight once the tokens are cell-aware.

## 7. Authoring targets per cell

**Decision**: For each of the six cells, author `destructive-subtle` as an opaque low-chroma destructive surface (light cells: high lightness; dark cells: low lightness) and `destructive-subtle-foreground` as a destructive-hued text that clears ≥5:1 at rest (so hover stays ≥4.5:1). Verify with the package's own `contrastRatio` (the same tsx check used to validate the spec-016 palettes) before wiring, then lock it in the matrix test.

**Rationale**: Empirical verification against `color.ts` is how the six spec-016 palettes were proven AA; reusing it keeps authoring deterministic rather than guesswork.

**Alternatives considered**: Eyeballing values — rejected; the 4.1:1 bug is precisely what eyeballing missed.

## 8. Re-enabling the example's light scheme

**Decision**: Once the pair passes in every cell, re-add `@import '@unbranded-ds/tokens/themes/light.css';` to the example's `globals.css` (the import spec 016 removed to dodge the failing button).

**Rationale**: Closes the spec-016 workaround and proves the fix end to end — the example's default-light view renders DS tokens and the Playwright axe pass on `/` stays clean (FR-009, SC-002).

**Alternatives considered**: Leave light file-less — rejected, it leaves default-light visibly unstyled and the workaround in place.
