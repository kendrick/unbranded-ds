# Research: Theming system expansion

**Phase 0 output** | **Date**: 2026-06-11 | Grounded against the actual `packages/tokens` source.

## D1 — One merge implementation

**Decision**: Extract the per-key override loop from `resolveTheme` (`resolve.ts:51-63`) into `mergeLayer(base, override)`. `resolveTheme(partial)` becomes `mergeLayer(seedFromDefaults, partial)`; the new `composeTokens(layers: ResolvedTokens[])` is a left fold of `mergeLayer` over the layers. One merge, two entry points.

**Rationale**: `resolveTheme` already merges a single partial onto `canonicalDefaultTokens` per-key (not category-replace), is pure and SSR-safe, and is the spec-008 resolve-then-validate primitive. Composition is the same operation applied to N layers. A second, hand-rolled merge in the MCP or the build is exactly the "two code paths diverge on precedence" failure the spec forbids.

**Alternatives**: a bespoke compose in the MCP (rejected — guarantees drift); category-replace merge (rejected — `resolveTheme` is per-key and the existing tests pin that).

## D2 — Compose by folding resolved override deltas onto the base

**Decision**: `composeTokens(orderedPartials)` folds each axis's **resolved override delta** onto the defaults base, in order, density last (so density wins shared keys). It is `resolveTheme` generalized to N ordered partials: `orderedPartials.reduce(mergeLayer, seedFromDefaults())`. Each partial holds the axis's overrides with values already in resolved/final form (and, once derived tokens exist, derived within that axis's context before folding).

**Correction over the first draft**: an earlier framing said "resolve each axis to a *complete* set, then merge the complete sets." That clobbers. A complete density set carries *default* colors (compact never set them); merging it last would overwrite the aesthetic's colors with defaults. The axis layers must be deltas (the keys that axis actually set), not full sets. This also keeps the JS fold consistent with the CSS emission (D5), where density emits its delta on top of the aesthetic base — so the resolver and the cascade agree by construction, not by luck.

**Rationale**: "Resolved, not source" still holds — each axis's override *values* are resolved before folding, which is what lets derived tokens slot in later as a per-axis resolve stage. `validateTheme`'s completeness + contrast checks operate on the folded result unchanged.

**Alternatives**: merge complete sets (rejected — clobbers, per above); merge raw source partials then resolve once (rejected — couples the result to authoring shape and blocks the derived-token future).

## D3 — Bridge the two theme formats with one adapter

**Decision**: Add `dtcgToResolved(dtcgTheme): ResolvedTokens` (flatten `$value`s into the flat runtime shape). The MCP converts each axis's on-disk DTCG theme through it, then calls the same `composeTokens`. The runtime/validator already speak the flat shape.

**Rationale**: This is the load-bearing finding. Two live formats exist: the DTCG files in `themes/` (read by the build and the MCP) and the flat `{name, displayName, tokens}` runtime document (consumed by `validateTheme`/`registerTheme`/`resolveTheme`). The MCP today reads raw DTCG and never calls the resolver (`grep` confirms zero resolver usage in `src/mcp/`). If the MCP keeps merging axes itself, it becomes the second merge of D1. The adapter is the single seam that lets all surfaces compose identically.

**Rationale, sharpened**: whatever the MCP composes MUST equal what `registerTheme` injects and what the CSS cascade renders, or a queried value won't match the painted value. The adapter + shared `composeTokens` is how that equality holds.

**Alternatives**: author the bundled themes in the flat runtime shape too (rejected — the build needs DTCG `$type`; would fork every theme file); let the MCP merge DTCG directly (rejected — the drift seam).

## D4 — Axis declared by directory

**Decision**: `themes/aesthetic/` and `themes/density/`. Move light/dark/brand into `aesthetic/`; `compact.json` goes in `density/`. A shared `listThemesByAxis()` helper (`src/axes.ts`) is the single source the build (`sd.config.ts` readdir), the MCP loader (`mcp/themes.ts`), and `listThemes` all read.

**Rationale**: The shipped DTCG files have no metadata slot, and a top-level `"axis"` key would be parsed by Style Dictionary as a malformed token group. A DTCG `$extensions` block works but every reader would have to strip it. A directory split needs zero new file syntax, keeps the files pure DTCG, and gives one source of truth. The file move is part of the spec's minor bump.

**Alternatives**: per-file `axis` key (rejected — SD mis-parses); `$extensions` block (rejected — more parsing in three readers); a flat `themes/` + `axes.json` manifest (viable fallback, mirrors the existing out-of-band `THEME_DESCRIPTIONS`; rejected as primary because a manifest drifts from the files it describes).

## D5 — CSS precedence via cascade layers

**Decision**: Emit aesthetic themes into `@layer ds-aesthetic` and density themes into `@layer ds-density`, with a layer-order declaration `@layer ds-aesthetic, ds-density;`. Density's layer always wins, independent of consumer import order. Density themes emit **only their overrides** (the delta), not the full resolved base set.

**Rationale**: Both axis selectors are single-attribute specificity (`[data-theme=x]`, `[data-density=y]` are both 0-1-0), so specificity alone can't make density win — it would fall to last-declared, which depends on the consumer's import order (brittle, and FR-002 demands deterministic). Cascade layers make precedence explicit and import-order-independent, and Tailwind v4 is layer-native. The delta-only emission matters: today each theme file emits the *full* resolved set (`sd.config.ts:173`), so a density file built the old way would redeclare every color var and clobber the aesthetic axis on non-density tokens.

**Implementation note**: the built-in `css/variables` format has no `@layer` option, so this needs a small custom format that wraps the variable block in `@layer NAME { … }`. The selector and format live at `sd.config.ts:182-185`.

**Alternatives**: rely on import order (rejected — brittle, non-deterministic, fails FR-002); raise density selector specificity artificially (rejected — fragile, fights the cascade).

## D6 — Token map: generated and unified

**Decision**: Retire the hand-authored/orphan-generated split. Generate the exported token map from the union of schema tokens (`source:'schema'`) and tokens found by walking the bundled theme JSONs that are not in the schema (`source:'theme-extension'`). Repoint `src/index.ts`/exports at the generated map. `source?` is an **optional** field on `TokenDefinition` (additive — existing entries and consumer imports keep compiling) but is always emitted as a concrete value so consumers can switch on it.

**Rationale**: Two maps exist today — the hand-authored `src/token-map.ts` (the one consumers import) and the orphan generated `dist/ts/tokens.ts` (built from `src/tokens/**` only, exported by nothing). Spec 009 says "the build must generate the token map," so unify on the generated path and remove the duplication. Reuse the battle-tested `walkSubtree` from `mcp/themes.ts:97-134` for the extension walk; reuse `tokenToCssVar` for the motion-aware naming. Dedupe by dot-path across themes (first-wins + build warning on `$type` conflict). No token-map test exists today — add a drift guard modeled on `defaults.test.ts`.

**Alternatives**: keep the hand-authored map and bolt extensions on (rejected — perpetuates the duplication and the generator still wouldn't see theme files); make `source` required (rejected — breaks existing object literals and consumer code, violating the additive decision).

## D7 — MCP multi-axis input

**Decision**: Replace each tool's `theme?: string` with `theme?: { aesthetic?: string; density?: string }`. Each tool calls a shared `composeAxes()` (built on `dtcgToResolved` + `composeTokens`). `palette`/`lookupToken` add a `source` field computed from token-map membership. `lookupToken` stops hard-rejecting non-schema tokens; a token present in the composed tree but absent from the map returns `source:'theme-extension'` with a synthesized `cssVariable`. A token that is a real extension in some bundled theme but absent from the active composition returns a soft `{ present: false, source: 'theme-extension' }` response; only a token in no theme at all stays a hard `unknown-token`.

**Rationale**: This realizes FR-006/009/011 and the spec's "merge during resolution." `source` can be computed purely from `tokenMap` membership, so the MCP work does not block on the build-side map change. The three-way classification (schema / extension-present / extension-absent-but-real / unknown) needs a small startup union of all extension tokens across bundled themes — cheap state alongside `loadThemes()`. Existing tests pass bare strings (`palette.test.ts:34`, `lookupToken.test.ts`) and must migrate to the object shape.

**Alternatives**: accept `string | { … }` for back-compat (viable, but the spec frames the MCP change as a contract update — a clean object input is defensible and the contract doc is updated either way).

## D8 — Section III amendment

**Decision**: Amend Constitution Section III (minor, 1.1.1 → 1.2.0) to (a) name the per-axis composition API and the recognized axes (aesthetic via `data-theme`, density via `data-density`), (b) state the density-over-aesthetic precedence, and (c) clarify that "the token schema is locked at build time" applies to the canonical token set, while theme-extension tokens are a documented per-theme escape hatch. Preserve "themes validated, fail loudly" (extended with axis-conflict errors) and "first paint must not flash" (bootstrap gains `data-density`).

**Rationale**: Section III is the theming contract and currently describes single-valued `data-theme`. The composition API is a material expansion (a MINOR per Section X). The amendment ships in this PR with its rationale, per the Section X amendment procedure.

**Alternatives**: leave Section III and document composition only in THEMING.md (rejected — Section III is the binding contract; drift between it and the implemented API is a governance bug).

## D9 — Single typed resolution boundary + a parity oracle (the robustness backstop)

**Decision**: Two hardenings against the multi-engine drift this spec inherits:

1. **One enforced boundary.** Make `ResolvedTokens` a branded/nominal type distinct from raw DTCG, so the compiler forbids any surface from consuming a raw DTCG theme. `dtcgToResolved()` becomes the *only* door from DTCG to the flat shape; the MCP cannot accidentally walk raw DTCG, because the types won't allow it. This turns a convention ("everyone should go through the resolver") into a compile error.
2. **A cross-surface parity oracle.** A `resolution-parity.test.ts` that, for every `(aesthetic ∈ {light,dark,brand,vaporwave,∅}) × (density ∈ {compact,∅})` combination, for every token, asserts three values agree: `composeTokens(...)` (the JS resolver), the value the **emitted CSS** yields (parse `dist` CSS, apply the known `@layer` order — no browser needed), and the **MCP** response. The browser `play` story then confirms one combo against the real cascade.

**Rationale**: This spec is built on a resolution stack that already has two engines (Style Dictionary at build, `resolveTheme` in JS) plus a hand-maintained `canonicalDefaultTokens`, kept in sync by convention and a single drift guard. Composition adds a fourth consumer (the MCP) and makes that latent fragility load-bearing. The parity oracle is the one test that catches all three failure modes at once — SD-vs-`resolveTheme` divergence (JS vs CSS), MCP drift (JS vs MCP), and `@layer` precedence bugs (CSS order) — across the full combination matrix rather than hand-picked cases.

**Honest scope note**: the oracle *services the interest* on the debt — it detects divergence loudly but the two engines remain. The principal (collapse build-time resolution to one engine: have Style Dictionary emit its resolved sets as data and have the MCP/validator/defaults read them instead of re-resolving) is deliberately **out of scope for 009** and carried into a follow-up spec (`docs/workshops/2026-06-11/spec-014-resolution-unification.md`). When that lands, the parity oracle becomes trivially true and is deleted. 009 makes the debt safe; the follow-up pays it.

**Alternatives**: parity oracle alone, no branded type (rejected — leaves the boundary a convention); collapse the engines inside 009 (rejected — chains a risky build refactor to the composition feature and balloons the blast radius).
