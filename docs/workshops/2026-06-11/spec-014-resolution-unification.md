# Spec 014 (provisional) — Resolution unification (single source of resolution truth)

**Provisional number:** 014. The number is a placeholder; speckit assigns the real one at specify time, as with the 010/013 briefs.
**Depends on:** 009 (composition, the shared `composeTokens`/`dtcgToResolved` resolver, the unified token map, and the cross-surface parity oracle all land first). This spec collapses the engines beneath them.
**Pays down:** the multi-engine resolution debt that 009 makes _safe_ but does not _remove_.

---

## Motivation

Spec 009 ships theme composition on top of a resolution stack that already has more than one engine, and it adds a parity oracle to keep them honest. The oracle is the right move for 009 — it turns silent drift into a loud CI failure across the full combination matrix. But it services the interest on the debt. It detects divergence; it does not eliminate the thing that can diverge. This spec eliminates it.

The debt, concretely:

- **Build-time themes are resolved twice.** Style Dictionary resolves each theme into CSS at build. The JS side (`resolveTheme`, and the MCP via `dtcgToResolved`) resolves the same themes again at query/runtime. Two implementations of "merge a theme onto the base," kept equal by a test rather than by construction.
- **`canonicalDefaultTokens` is a hand-maintained third copy** of the base values, kept in sync with the DTCG sources by a drift guard (`defaults.test.ts`) because the package ships `dist` only and can't import the JSON sources.
- The MCP historically walked raw DTCG and never called the resolver at all — 009's adapter bridges that, but the bridge is still a second path that _could_ drift.

The divergence is possible only where a single theme is resolved by two engines. That is exactly and only the build-time themes.

## The fix

Make Style Dictionary the single resolver for build-time themes, and have everyone read its output instead of re-resolving.

Style Dictionary already computes each theme's fully-resolved set (that is what the per-theme CSS build does). It just discards the data and emits only CSS. Have it **also emit the resolved set as data** (a per-theme resolved JSON, a sibling of the CSS), and repoint the MCP, the validator (for bundled themes), and the defaults baseline at that data. Then:

- **Build-time themes resolve once, in Style Dictionary.** The CSS and the resolved JSON are siblings of the same resolution, so they cannot disagree. `composeTokens` merges Style-Dictionary-emitted resolved deltas; the cascade merges the same values.
- **Runtime consumer themes keep the JS resolver.** This is the one genuinely necessary second engine, because those themes are supplied at runtime and Style Dictionary never sees them. They never overlap a build-time theme, so no theme is ever resolved by two engines.

Once that holds, the parity oracle from 009 becomes trivially true and is deleted, and `canonicalDefaultTokens` stops being hand-maintained (it is Style Dictionary's resolved base), so its drift guard retires too. The test that proved the invariant goes away because the invariant is now structural. That is what paying principal looks like.

## Scope

- Style Dictionary emits a canonical per-theme resolved artifact (JSON, and/or a typed map) alongside the CSS.
- The MCP reads the emitted resolved artifacts for bundled themes rather than walking raw DTCG. `dtcgToResolved` stops being a runtime bridge for build-time themes (it survives only where the runtime resolver genuinely needs it, if at all).
- `canonicalDefaultTokens` is generated from Style Dictionary's resolved base; `defaults.test.ts` retires.
- The 009 `resolution-parity.test.ts` is reduced to a thin structural assertion or removed, with a note recording why it is no longer load-bearing.
- The branded `ResolvedTokens` boundary from 009 stays — it keeps the runtime resolver honest about what it accepts.

## Out of scope

- The runtime consumer-theme resolver. It stays; it is the legitimate second context, and it is isolated.
- Derived tokens. This spec is about _where_ resolution happens, not _what_ resolution can compute. It clears the ground the derived-token roadmap entry wants to build on (a single resolver stage is exactly what derived tokens slot into).
- Any change to the composition semantics 009 settles (per-axis attributes, density-over-aesthetic, merge resolved deltas). This spec changes the plumbing under them, not the contract.

## Constitution

Section VIII mandates Style Dictionary as the token pipeline; this spec makes it _more_ central (the single resolver), so it is squarely aligned. No new tooling. Likely a patch or minor clarification to Section III's "themes validated, fail loudly" wording if the validation entry point moves, but no new principle.

## Why a separate spec, not folded into 009

Collapsing the engines restructures the build's emitted artifacts and repoints three consumers at them. Chaining that to the composition feature would couple a risky build refactor to a user-facing capability and balloon the blast radius. The clean split is the one 009 already takes: 009 makes the debt safe behind a parity oracle and a typed boundary; this spec removes the debt and deletes the oracle. Each is independently reviewable and independently revertable.
