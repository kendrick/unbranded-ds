# Research: Resolution unification

**Phase 0 output** | **Date**: 2026-06-12 | Grounded against the 009 implementation on main.

## D1 — Emit each theme's resolved DELTA via theme-alone Style Dictionary sourcing

**Decision**: For each bundled theme, run a Style Dictionary pass sourced on the theme file alone (`themes/<axis>/<name>.json`, without the base `src/tokens/**`) and emit its resolved tokens as a JSON artifact. That is the theme's resolved delta: only the keys the theme declares, with the same transforms the CSS applies.

**Rationale**: This mechanism is already proven. 009's density themes emit delta CSS exactly this way — `dist/css/tokens-compact.css` carries only compact's spacing and line-height keys because the build sources `themes/density/compact.json` alone. 014 adds a JSON sibling using the same theme-alone source, extended to all themes (aesthetic included, which keeps its full CSS but gains a delta JSON). Because the transforms are per-token and identical to the CSS path, the artifact's values equal the CSS values for those keys.

**Why delta, not full** (clarify Q1): `composeTokens` folds ordered deltas onto the base. A full per-theme set would clobber on composition (a complete density set carries default colors that overwrite the aesthetic). The delta keeps 009's `composeTokens` contract byte-for-byte, and `defaults ⊕ delta` reconstructs the full set, matching the CSS by construction. This is the structural property that lets the parity matrix retire.

**Alternatives**: full resolved set per theme (rejected — clobbers composition, and the delta is what the cascade and `composeTokens` both need); both full and delta (rejected — two artifacts to keep coherent for no gain).

## D2 — Generate the defaults baseline from the resolved base; commit it

**Decision**: Style Dictionary emits the resolved base (`src/tokens/**`) as data; a committed `defaults.generated.ts` is generated from it. `resolve.ts` imports the generated baseline. `defaults.test.ts` becomes a regenerate-and-diff check.

**Rationale**: `canonicalDefaultTokens` is hand-maintained today only because the package ships `dist` and `defaults.ts` cannot import the JSON sources at runtime (the original header says so). Generating a committed `.ts` module sidesteps that: it is a normal source file at typecheck/test time, so there is no build-order dependency, and the source tree still shows the baseline. The base is `src/tokens/**`, which after 009's `color.json` fix equals the light theme's colors — exactly what `canonicalDefaultTokens` holds today, so this is behavior-preserving. The regenerate-and-diff check replaces the hand-typed drift guard with a structural one: regenerate, compare to the committed file, fail CI on mismatch.

**Alternatives**: emit into `dist` only and import from there (rejected — build-order dependency, baseline invisible in the tree); keep hand-maintaining `defaults.ts` (rejected — that is the debt this spec pays).

## D3 — Repoint the MCP and the bundled-theme validation at the artifact

**Decision**: `src/mcp/compose.ts` reads each axis's delta artifact and folds via the existing `composeTokens`, replacing `dtcgToResolved(getTheme())`. The bundled-theme contrast check (`themes-contrast.test.ts`) reads the artifact composed onto the generated defaults instead of walking raw DTCG.

**Rationale**: This is what makes a bundled theme resolved by exactly one engine. The MCP stops re-resolving; it reads Style Dictionary's output. The fold stays `composeTokens` (density over aesthetic), so the composition contract is untouched. The branded `ResolvedTokens` boundary stays and keeps the runtime resolver from accepting the wrong shape.

**Alternatives**: keep the MCP walking DTCG and trust the parity test (rejected — that is the second engine the spec removes).

## D4 — Remove `dtcgToResolved`

**Decision**: Delete `dtcgToResolved` from `resolve.ts` and `index.ts`, drop its `resolve.test.ts` cases, and switch the `validate.test.ts` helper that used it to the emitted artifact.

**Rationale**: Its only purpose was the MCP's DTCG-to-flat bridge (009). After the MCP reads the artifact and the parity matrix is gone, the production caller set is empty (the runtime consumer-theme path uses the flat runtime-document format, not raw DTCG). Removing it shrinks the surface and removes the last "second path that could drift."

**Alternatives**: keep it exported as a utility (rejected — no caller, and keeping a DTCG-to-flat bridge invites a future second resolution path, the exact shape of the debt).

## D5 — Reduce the parity matrix to a thin canary

**Decision**: Replace the `(combination × token)` oracle with one assertion: for a representative composition (vaporwave + compact), the MCP value equals the emitted-artifact-composed value equals the CSS value, for a sample of tokens.

**Rationale**: The matrix existed to catch divergence between two engines. With one engine, divergence is impossible by construction — except for one residual failure mode the structure does not prevent: a consumer reading stale or wrong data instead of the emitted artifact. The canary guards exactly that wiring, cheaply, without the full-matrix tax.

**Alternatives**: remove the test entirely (defensible, but the wiring canary is near-free insurance against a repoint regressing); keep the matrix (rejected — the standing tax this spec exists to remove).

## D6 — Section III wording

**Decision**: Confirm during implementation whether Section III's "themes are validated; fail loudly" wording references the old validation path closely enough to need a patch-level clarification. No new principle; the behavior (themes validated, fail loudly) is preserved.

**Rationale**: The validation entry point for bundled themes moves to the artifact, but the guarantee is unchanged. Section X requires the amending PR to keep specs and constitution consistent; if the wording is path-specific, a one-line patch clarification keeps them aligned.
