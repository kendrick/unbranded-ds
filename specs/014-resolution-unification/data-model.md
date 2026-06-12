# Data Model: Resolution unification

**Phase 1 output** | **Date**: 2026-06-12

No persisted data. The "model" is the emitted resolved artifact and the single resolution flow that consumes it.

## Entities

### Resolved-delta artifact

The build's per-theme output: for theme `T`, the resolved values of exactly the keys `T` declares (its overrides), with the same Style Dictionary transforms the CSS applies.

- **Shape**: flat `{ category: { flatKey: resolvedValue } }` — the same flat shape `composeTokens` already folds (009's `ResolvedLayer`).
- **Produced by**: a Style Dictionary pass sourced on the theme file alone (no base), mirroring 009's density-delta CSS.
- **Read by**: the MCP (`compose.ts`), the bundled-theme contrast check, and the parity canary.
- **Property**: `defaults ⊕ artifact(T) == the full set Style Dictionary emits for T's CSS`, by construction (same transforms, same resolution).

### Generated defaults baseline

The resolved base (`src/tokens/**`) emitted as a committed `defaults.generated.ts`. Replaces the hand-maintained `canonicalDefaultTokens`.

- **Shape**: a complete `ResolvedTokens` (every category/key), branded.
- **Guarded by**: a regenerate-and-diff check (regenerate from the resolved base, compare to the committed file).

### Build-time (bundled) theme

A theme that ships in the package, resolved once by Style Dictionary into both its CSS and its delta artifact. The set of themes the old divergence was possible across; now single-engine.

### Runtime consumer theme

A theme supplied at runtime in the flat runtime-document format, resolved by the JS resolver (`resolveTheme`). The one legitimate second resolution context, isolated, never overlapping a bundled theme. Unchanged by this spec.

## The one resolution flow (after this spec)

```
build:    src/tokens/** ──SD──▶ resolved base ──gen──▶ defaults.generated.ts (committed)
          themes/<axis>/<name>.json ──SD (theme-alone)──▶ resolved-delta artifact + delta/full CSS
                                                            │
read by:  ├─ MCP compose:    composeTokens([artifact(aesthetic), artifact(density)]) onto defaults
          ├─ bundled validate: artifact composed onto defaults → contrast check
          └─ CSS cascade:    @layer ds-aesthetic < ds-density (the same SD-resolved values)

runtime:  consumer flat doc ──resolveTheme──▶ folded onto defaults   (the one isolated JS path)
```

Every bundled-theme reader folds Style-Dictionary-emitted deltas; none re-resolves. `composeTokens`, `mergeLayer`, and the branded boundary are unchanged from 009.

## Invariants after the change

- Each bundled theme is resolved by exactly one engine (the build).
- A bundled theme's MCP value equals its CSS value by construction — no test required to prove it, only a canary to confirm the artifact is actually read.
- `canonicalDefaultTokens` is generated, not hand-maintained.
- `dtcgToResolved` does not exist.
- The runtime consumer-theme path is the only JS resolution path, and no bundled theme flows through it.
- No consumer-facing theming behavior changes; the 009 composition contract holds.
