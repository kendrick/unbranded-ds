# Quickstart: Theming system expansion

How to implement and verify spec 009. Almost all of it is in `packages/tokens`.

## Prerequisites

- Branch `009-theming-system-expansion` off `main` (carries spec 008 tokens 0.4.0)
- `pnpm install` done
- Baseline green: `pnpm --filter @unbranded-ds/tokens test && pnpm --filter @unbranded-ds/tokens build`

## Order of work

### 1. Foundational (do first — everything depends on these)

- **F1 the shared merge** (`src/resolve.ts`): extract `mergeLayer`, add `composeTokens(layers)` and `dtcgToResolved()`. Ship the compose/merge unit tests. Confirm `resolveTheme`'s existing tests still pass after the extraction.
- **F2 the axis layout**: create `themes/aesthetic/` (move light/dark/brand in, add `vaporwave.json` with `shadows.neon`) and `themes/density/` (add `compact.json`); add `src/axes.ts` (`listThemesByAxis()` + the axis→attribute map).

### 2. Parallel wave (after F1/F2 — five disjoint owners, each ships tests)

- **P1 validator** (`validate.ts`): compose per-axis; `AXIS_CONFLICT` structured error; single-axis regression test.
- **P2 build + token-map** (`sd.config.ts`, `token-map.ts`, `index.ts`, `exports.test.ts`, new `token-map.test.ts`): per-axis `@layer` CSS (density delta-only, `@layer ds-aesthetic, ds-density;`), generated token map = schema ∪ bundled extensions with `source`, drift guard.
- **P3 MCP** (`src/mcp/*`, contract doc): multi-axis input object; `composeAxes` via the adapter; `source` labels; soft extension-absent response; migrate bare-string tests.
- **P4 runtime** (`runtime.ts`): per-axis selector emission; bootstrap writes `data-density`; composed-vars-equal-`composeTokens` test.
- **P5 docs + constitution** (`THEMING.md`, `README.md`, `constitution.md`): composition + extension sections (humanizer); Section III amendment (1.1.1 → 1.2.0).

### 3. Integration + release

- **I1** composition story: apply `data-theme="vaporwave" data-density="compact"`, a `play` function asserting the composed computed values, plus a deliberate-overlap probe that density wins. Carries the a11y check.
- **I2** verify (below).
- **I3** `pnpm changeset` → `@unbranded-ds/tokens: minor`.

## Verify

```bash
pnpm --filter @unbranded-ds/tokens test       # unit: compose, validate-axis, token-map drift, mcp, runtime
pnpm --filter @unbranded-ds/tokens build       # emits per-axis @layer CSS + the unified token map
pnpm typecheck
pnpm --filter @unbranded-ds/react lint
pnpm --filter @unbranded-ds/storybook build && pnpm --filter @unbranded-ds/storybook test:storybook   # composition story + a11y

# precedence, three independent checks (must agree):
#  1. composeTokens unit test  — the resolver
#  2. grep the emitted CSS for "@layer ds-aesthetic, ds-density;" — the build order
#  3. the browser play story    — the cascade

# extension token end-to-end:
grep -r "shadow-neon" packages/tokens/dist/css        # emits as a CSS var
#  + token-map.test asserts source:'theme-extension'  + an MCP lookupToken test returns it
```

## The test matrix (what "test everything" means here)

| Surface | Must assert |
|---------|-------------|
| `composeTokens` | fold, density-wins on overlap, single=identity, empty=defaults; `resolveTheme` unchanged |
| `validateTheme` | composed contrast fails loudly; `AXIS_CONFLICT` on two-on-one-axis; single-axis byte-identical |
| token map | schema `source:'schema'` shape unchanged; `shadows.neon` `source:'theme-extension'`; drift guard; dedupe |
| MCP | multi-axis resolve; `source` labels; extension returned not rejected; soft absent vs hard unknown; unknown axis ignored |
| runtime | per-axis selector; composed vars = `composeTokens`; bootstrap `data-density` |
| demo themes | validate + build; compose to the union; `shadows.neon` emits |
| build | `@layer` order; density delta-only (doesn't clobber aesthetic non-density tokens) |
| CI | MCP `tools/list` smoke still green |

## Watch-outs

- **The DTCG↔flat seam is the risk.** The MCP must route through `dtcgToResolved` + `composeTokens`, not a second merge. The invariant `MCP.resolve === runtime.inject === validate.composed` is what the tests defend.
- **Density emits its delta, not the full set** — else it clobbers aesthetic's non-density tokens. Verify the emitted density CSS contains only compact's overrides.
- **`source` is optional** on `TokenDefinition` — keep existing entries compiling; always emit a value.
- **Moving light/dark/brand** into `themes/aesthetic/` updates the build readdir and the MCP loader (both via `listThemesByAxis`). Confirm `dist/css` filenames stay `tokens-<name>.css` (the export glob is unchanged).
- **Section III amendment ships in this PR** with its rationale (governance procedure). The changeset is tokens-minor; the constitution bump is 1.1.1 → 1.2.0.
