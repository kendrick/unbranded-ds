// ---------------------------------------------------------------------------
// canonicalDefaultTokens — the inheritance baseline for partial themes.
//
// A consumer runtime theme may override any subset of categories/keys (spec 008
// US2). The validator merges the override onto THIS set, then validates the
// complete merged result; every omitted token inherits the value here.
//
// GENERATED (spec 014): the baseline is generated from Style Dictionary's
// resolved base (`src/tokens/**`) into `defaults.generated.ts` and re-exported
// here so the import path (`./defaults.js`) stays stable. The values are raw
// `$value`s — exactly what the runtime injects — so display transforms (ms→s,
// oklch normalization) live only in the emitted CSS, not in the inherited
// baseline. Do not hand-edit `defaults.generated.ts`; `pnpm build` regenerates
// it, and `defaults.test.ts` is the regenerate-and-diff guard.
//
// This replaces the previous hand-maintained copy: the build is now the single
// resolver, so the baseline can no longer drift from the source it should mirror
// (the spec-009 muted-foreground/destructive drift that the parity oracle caught
// was exactly that hand-maintained gap).
// ---------------------------------------------------------------------------

export { canonicalDefaultTokens } from './defaults.generated.js';
