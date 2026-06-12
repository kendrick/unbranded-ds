# Contract: The shared compose resolver

The one merge that the validator, runtime, and MCP all call. New code in `packages/tokens/src/resolve.ts` (+ `src/axes.ts`). Pure, SSR-safe, no mutation.

## `mergeLayer` (extracted, internal)

```ts
// Per-key override of one complete token set onto another. Extracted verbatim
// from today's resolveTheme inner loop (resolve.ts:51-63): seed from base,
// override per key, skip `undefined` so inherited values survive. Per-key, not
// category-replace.
function mergeLayer(base: ResolvedTokens, override: Partial<ResolvedTokens>): ResolvedTokens
```

`resolveTheme(partial)` is refactored to `mergeLayer(seedFromDefaults(), partial)` — same behavior, same existing tests pass.

## `composeTokens` (new, exported)

```ts
// resolveTheme generalized to N ordered OVERRIDE layers. Fold each axis's
// resolved delta onto the defaults base, left to right; later layers win per key.
// Callers pass [aestheticOverrides, densityOverrides] so density wins.
//   composeTokens(parts) === parts.reduce(mergeLayer, seedFromDefaults())
export function composeTokens(orderedPartials: Array<Partial<ResolvedTokens>>): ResolvedTokens
```

- Empty list → the defaults seed. Order-significant: the last layer wins collisions.
- Each layer is an axis's **resolved override delta** (the keys that axis set, values in final form) — NOT a complete set. Merging complete sets would clobber: a complete density set carries default colors compact never set, which would overwrite the aesthetic's colors. The delta-fold is also what matches the CSS emission (aesthetic = full base layer, density = delta layer on top), so the resolver and the cascade agree by construction.
- "Resolved, not source": each delta's values are resolved before folding (and, once derived tokens exist, derived within that axis's context first) — which is what lets a derived-token resolver stage slot in later.

## `dtcgToResolved` (new, exported)

```ts
// Flatten a DTCG theme ({cat:{key:{$value,$type}}}) into the flat runtime shape
// ({cat:{key:string}}). Reuses the walkSubtree recursion from mcp/themes.ts.
export function dtcgToResolved(dtcg: DtcgTheme): Partial<ResolvedTokens>
```

The bridge between the on-disk DTCG themes and the flat resolver. The MCP uses this so it composes through `composeTokens` rather than walking raw DTCG — the seam that keeps MCP/validator/runtime from drifting.

**Branded boundary (D9).** `ResolvedTokens` is a branded/nominal type, distinct from raw DTCG. `dtcgToResolved` is the only function that produces it from a DTCG theme. The compiler then forbids any surface (the MCP especially) from feeding raw DTCG where a `ResolvedTokens` is expected — the single boundary is enforced by types, not convention. This is the cheap structural half of the robustness backstop; the parity oracle is the other half.

## `listThemesByAxis` (new, `src/axes.ts`)

```ts
export type Axis = 'aesthetic' | 'density';
export const AXIS_ATTRIBUTE: Record<Axis, string>; // { aesthetic: 'data-theme', density: 'data-density' }
// Reads themes/<axis>/*.json; the single source the build + MCP + validator share.
export function listThemesByAxis(): Record<Axis, string[]>
```

## Validator usage

`validateTheme` generalizes its resolve step: resolve each named axis to a complete set, `composeTokens([aesthetic, density])`, then run the existing completeness + contrast checks on the composed result. Add an axis-conflict check (two themes on one axis) → structured `{ ok: false, issues: [{ code: 'AXIS_CONFLICT', path, message }] }`.

## Runtime usage

`registerTheme` emits the composed vars under the per-axis attribute selectors inside the ordered cascade layers. The injected values MUST equal `composeTokens(...)`. The bootstrap script writes both `data-theme` and `data-density`.

## Invariant

For the same axis pair, all four surfaces agree per token:

```
composeTokens(axes) === emittedCSS.cascade(axes) === MCP.resolve(axes) === validate(axes).composed
```

One `composeTokens`, one `dtcgToResolved`, no second merge anywhere. `resolution-parity.test.ts` proves this across every `(aesthetic × density)` combination and every token (parsing the emitted CSS + applying the known `@layer` order, so no browser is needed); the browser `play` story confirms one combo against the real cascade. The emitted-CSS arm is what also catches a Style-Dictionary-vs-`resolveTheme` divergence — the deeper inherited seam that the resolution-unification follow-up exists to remove.
