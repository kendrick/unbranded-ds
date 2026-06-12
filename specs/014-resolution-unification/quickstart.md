# Quickstart: Resolution unification

How to implement and verify spec 014. All in `packages/tokens`.

## Prerequisites

- Branch `014-resolution-unification` off `main` (carries the 009 resolver, parity oracle, branded boundary)
- Baseline green: `pnpm --filter @unbranded-ds/tokens test && pnpm --filter @unbranded-ds/tokens build`

## Order of work

### 1. Foundational — the build emits the data (do first; everything reads it)

In `sd.config.ts`:
- Add a per-theme resolved-delta JSON emission: a Style Dictionary pass sourced on `themes/<axis>/<name>.json` ALONE (no base), emitting the theme's resolved keys as flat JSON. This mirrors the proven density-delta CSS path (compact already emits delta-only CSS this way).
- Emit the resolved base (`src/tokens/**`) and generate a committed `src/defaults.generated.ts` (a branded `ResolvedTokens`). Point `defaults.ts` at it (re-export) or replace it.

### 2. Repoint the consumers (parallel — two disjoint files)

- `src/mcp/compose.ts`: read each axis's delta artifact and fold via `composeTokens`, replacing `dtcgToResolved(getTheme())`.
- `src/themes-contrast.test.ts`: read the artifact (composed onto defaults) for the bundled-theme contrast check instead of raw DTCG.

### 3. Reduce and delete (after the repoints land)

- `src/resolution-parity.test.ts`: reduce the matrix to the thin canary (one composition, sample tokens: MCP == artifact-composed == CSS).
- `src/defaults.test.ts`: convert to the regenerate-and-diff check.
- Remove `dtcgToResolved` from `src/resolve.ts` and `src/index.ts`; drop its `resolve.test.ts` cases; switch the `validate.test.ts` helper to the artifact.

### 4. Verify

```bash
pnpm --filter @unbranded-ds/tokens build       # emits the delta artifacts + the resolved base
pnpm --filter @unbranded-ds/tokens test        # the 009 suites must pass UNCHANGED (the regression net)
pnpm typecheck
pnpm --filter @unbranded-ds/storybook build    # composition story still renders

# single-engine confirmation (SC-001):
grep -rn "dtcgToResolved" packages/tokens/src   # expect none in production code
# the canary, the regen check, and the MCP smoke all run inside the tokens test suite
```

## The regression net (what actually proves correctness)

The point of this spec is that **nothing consumer-facing changes**. So the strongest signal is that the unchanged 009 tests — composition, MCP tools, validate, runtime, contrast — pass without edits (beyond the repoint of the bundled-theme reader). If any of them needed a value changed, the refactor altered behavior and is wrong.

## Watch-outs

- **The artifact is the DELTA, not the full set.** A full-set artifact would clobber composition. Emit theme-alone (only the theme's keys).
- **`defaults ⊕ delta == CSS full` is the invariant.** If the canary fails, the base or the delta diverged from the CSS — likely a transform applied in one path but not the other. Both must come from the same Style Dictionary resolution.
- **The generated baseline is committed.** Regenerate it in the build and check it in; the regen-and-diff test fails CI if it drifts. Do not hand-edit it.
- **No build-order trap.** `defaults.generated.ts` is a committed source file, so `resolve.ts` imports it at typecheck/test time without waiting on the build.
- **Section III wording**: if the constitution's "themes validated, fail loudly" text is path-specific, add the one-line patch clarification in the same PR.
