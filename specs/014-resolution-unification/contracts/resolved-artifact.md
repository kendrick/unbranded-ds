# Contract: The emitted resolved-delta artifact

The one new interface 014 introduces: the build-emitted resolved delta that every bundled-theme reader consumes instead of re-resolving.

## Producer (the build)

For each bundled theme `themes/<axis>/<name>.json`, Style Dictionary emits a resolved-delta artifact:

```
artifact(name) = { [category]: { [flatKey]: resolvedValue } }
```

- Sourced on the theme file ALONE (no base `src/tokens/**`), so only the theme's own declared keys appear.
- Values carry the same transforms as the theme's CSS (oklch normalization, ms→s, etc.), produced by the same resolution.
- Flat shape, identical to 009's `ResolvedLayer` — what `composeTokens` folds.
- Layout (per-theme JSON file vs a combined map) is an implementation detail; the contract is the per-theme delta content.

The defaults baseline is the same idea over the base source:

```
defaults = SD-resolved(src/tokens/**)   →  committed defaults.generated.ts (branded ResolvedTokens)
```

## Consumers (read, never re-resolve)

```ts
// MCP composition (compose.ts) — replaces dtcgToResolved(getTheme())
composeTokens([artifact(aesthetic), artifact(density)])   // folds onto defaults; density last wins

// Bundled-theme contrast validation
validate(compose(artifact(theme)) over defaults)

// Parity canary (the reduced oracle)
assert mcpValue(theme, token) === composed(artifact, token) === cssValue(theme, token)   // one sample
```

The branded `ResolvedTokens` boundary stays: the artifact is the flat resolved shape, and the compiler still forbids feeding raw DTCG where resolved tokens are expected.

## Invariant

```
defaults ⊕ artifact(theme) == the full set the theme's CSS carries
```

By construction, because both derive from one Style Dictionary resolution. This is the property that lets the parity matrix retire to a canary.

## What is removed

- `dtcgToResolved` (no caller once the MCP reads the artifact).
- The `(combination × token)` parity matrix (replaced by the canary above).
- The hand-maintained `canonicalDefaultTokens` + its drift guard (replaced by the generated baseline + a regenerate-and-diff check).
