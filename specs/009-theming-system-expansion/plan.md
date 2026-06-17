# Implementation Plan: Theming system expansion

**Branch**: `009-theming-system-expansion` | **Date**: 2026-06-11 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/009-theming-system-expansion/spec.md`

## Summary

Add multi-axis theme composition and first-class theme-extension tokens to `@unbranded-ds/tokens`. A consumer applies an aesthetic (`data-theme`) and a density (`data-density`) at once; the page resolves to the union of the two, density winning collisions. Non-schema tokens a theme declares (e.g. `shadows.neon`) become typed in the token map and visible through the token-query MCP, both labeled `source: 'theme-extension'`. The spec amends Constitution Section III (minor) to name the axes and the precedence.

The work is almost entirely in `packages/tokens`, plus docs and one Storybook composition story. The architectural spine is **one shared merge**: a `composeTokens(layers)` fold that the validator, the runtime, and the MCP all call, with the CSS cascade mirroring it via `@layer`. Getting that spine right — and bridging the two live theme formats (DTCG on disk vs the flat runtime document) through a single adapter — is what keeps the four resolution surfaces from drifting.

## Technical Context

**Language/Version**: TypeScript 5.x, strict mode, no `any`
**Primary Dependencies**: Style Dictionary v4 (DTCG build), Zod (theme schema + validation), Tailwind CSS v4 (`@theme` preset + cascade `@layer`), `@modelcontextprotocol/sdk` (token-query MCP)
**Storage**: Filesystem only. DTCG theme sources under `packages/tokens/themes/<axis>/`; built artifacts under `packages/tokens/dist/`.
**Testing**: Vitest (unit, in `packages/tokens`), the MCP smoke test (CI, `tools/list`), and one Storybook interaction `play` story for end-to-end composition.
**Target Platform**: Token artifacts consumed by browser + SSR React pipelines and by MCP clients.
**Project Type**: monorepo tokens package (`packages/tokens`); docs at repo root; one story in `apps/storybook`/`packages/react`.
**Performance Goals**: N/A (build-time generation + pure resolution functions).
**Constraints**: Additive / non-breaking (single-axis `data-theme` keeps working; token-map type stays compile-compatible). Tokens package keeps zero React/Storybook deps (Section II). Structured validation output (Section XI.4). All touched prose through the humanizer (Section XI.1).
**Scale/Scope**: One tokens package. Five resolution/build surfaces (resolver, validator, runtime, build, MCP) converge on one merge. Two demo themes, one theme-layout migration, one constitution amendment, two doc surfaces.

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

- [x] **Section I (Repository shape)** — no new package; all code in `packages/tokens`, docs at root, one story in the existing Storybook surface.
- [x] **Section II (Tokens independent of components)** — all work stays in `@unbranded-ds/tokens`; no React/Storybook/Base UI enters its dependency graph. The composition resolver and adapter are pure TS.
- [⚠] **Section III (Theming contract)** — **this spec amends Section III** via the governance procedure (Section X): it names the per-axis composition API (aesthetic/density), the density-over-aesthetic precedence, and clarifies that "schema locked at build time" applies to the canonical token set, not to per-theme extension tokens. This is a sanctioned MINOR amendment (1.1.1 → 1.2.0), not a violation. The amendment ships in this PR with its rationale (Section X requires the amending PR to update inconsistent specs — done here). "Themes validated; fail loudly" is preserved and extended (axis-conflict errors). "First paint must not flash" is preserved (the bootstrap script gains `data-density`).
- [x] **Section VI (Testing)** — the three-layer rule targets `packages/react` components; this is a tokens-package change, so the weight is **unit tests** (Vitest), plus the CI **MCP smoke test** (Section VII) and one **Storybook interaction** story for end-to-end composition + a11y. The testing strategy below is exhaustive by design.
- [x] **Section VII (MCP surface)** — the token-query MCP gains the multi-axis input and extension-token visibility. The post-publish `tools/list` smoke test still passes (same four tools); the contract doc and `SERVER_VERSION` are updated.
- [x] **Section VIII (Tooling baseline)** — no new tooling. CSS cascade `@layer` is native Tailwind v4 / standard CSS; Style Dictionary, Zod, and the MCP SDK are all already in the baseline.
- [x] **Section X (Governance / changeset)** — ships a `@unbranded-ds/tokens` **minor** changeset; the constitution amendment is part of the same PR per the amendment procedure.
- [x] **Section XI (Agent + human legibility)** — XI.1: THEMING.md, README, and the MCP contract pass through the humanizer. XI.3: the MCP stays the live view; THEMING.md is the offline record; both get the composition + extension-token story. XI.4: the axis-conflict failure is a structured `{ ok, issues: [{ code, path }] }`, and the MCP's "extension absent from the active theme" is a structured non-error response, not prose. No component API changes, so XI.2 is untouched.

No violations. One governed amendment (Section III), versioned and shipped in-PR.

## Project Structure

### Documentation (this feature)

```text
specs/009-theming-system-expansion/
├── plan.md              # This file
├── research.md          # Phase 0: the 8 architecture decisions
├── data-model.md        # Phase 1: entities + the resolver/source contracts
├── contracts/
│   ├── compose-resolver.md       # composeTokens + the DTCG↔flat adapter contract
│   └── token-query-mcp-v2.md     # the multi-axis MCP input + source-labeled output
├── quickstart.md        # Phase 1: implement + verify walkthrough (incl. the test matrix)
└── tasks.md             # Phase 2 (/speckit.tasks)
```

### Source Code (repository root)

```text
packages/tokens/
├── themes/
│   ├── aesthetic/        # NEW dir — light.json, dark.json, brand.json (moved), vaporwave.json (new)
│   └── density/          # NEW dir — compact.json (new)
├── src/
│   ├── resolve.ts        # extract mergeLayer; add composeTokens(layers); add dtcgToResolved adapter
│   ├── axes.ts           # NEW — listThemesByAxis() helper (build + MCP share it); axis→attribute map
│   ├── validate.ts       # compose per-axis; axis-conflict structured error
│   ├── runtime.ts        # per-axis selector emission; bootstrap writes data-density
│   ├── token-map.ts      # becomes generated/unified; gains optional `source` discriminator
│   ├── index.ts          # repoint exports at the unified token map
│   └── mcp/              # multi-axis input object; source labels; soft extension-absent response
├── sd.config.ts          # per-axis @layer CSS emission (density delta-only); token-map union+source
├── resolution-parity.test.ts   # NEW — the cross-surface oracle (JS == emitted CSS == MCP, all combos)
└── *.test.ts             # new + extended: compose, validate-axis, token-map drift, mcp, runtime

THEMING.md                # composition + theme-extension-tokens sections
README.md                 # multi-axis quickstart
.specify/memory/constitution.md   # Section III amendment (minor 1.1.1 → 1.2.0)
specs/005-agent-experience-foundation/contracts/token-query-mcp.md   # multi-axis + source fields
apps/storybook (or packages/react stories)   # one composition interaction story
.changeset/*.md           # @unbranded-ds/tokens: minor
```

**Structure Decision**: All code in `packages/tokens`. Themes migrate to an axis-directory layout (`themes/aesthetic/`, `themes/density/`) so the build, MCP, and validator learn a theme's axis from one source of truth (a shared `listThemesByAxis()` helper) rather than three hard-coded `readdir`s.

## Parallelization

The user asked to parallelize. This spec has a **hard foundational core** (the shared resolver + the axis layout) that the rest depends on, then a wide parallel wave of disjoint surfaces, each shipping its own tests.

### Foundational (blocks the wave)

- **F1 — the shared merge** (`src/resolve.ts`): extract `mergeLayer(base, override)` from today's `resolveTheme`, add `composeTokens(layers: ResolvedTokens[])` as a left fold (later layer wins per key), add the `dtcgToResolved()` adapter so the MCP and build speak the same flat shape. Ship `compose`/`mergeLayer` unit tests. **Everything downstream calls `composeTokens`.**
- **F2 — the axis layout** (`themes/aesthetic/*`, `themes/density/*`, `src/axes.ts`): create the two dirs, move light/dark/brand into `aesthetic/`, author the two demo themes (`vaporwave.json` with `shadows.neon`, `compact.json`), and add `listThemesByAxis()` + the axis→attribute map that the build and MCP both import.

F1 and F2 touch disjoint files, so they run in parallel with each other.

### Parallel wave (each consumes F1/F2, each ships its own tests)

| Unit                       | Files                                                                                  | What                                                                                                                                               |
| -------------------------- | -------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| **P1 Validator**           | `validate.ts` (+test)                                                                  | resolve per-axis → `composeTokens`; structured axis-conflict error; single-axis regression                                                         |
| **P2 Build + token-map**   | `sd.config.ts`, `token-map.ts`, `index.ts`, `exports.test.ts`, new `token-map.test.ts` | per-axis `@layer` CSS (density delta-only, density layer wins); generated token map = schema ∪ bundled-theme extensions with `source`; drift guard |
| **P3 MCP**                 | `src/mcp/*`, the contract doc (+tests)                                                 | multi-axis input object; `composeTokens` via the adapter; `source` labels; soft extension-absent response                                          |
| **P4 Runtime**             | `runtime.ts` (+test)                                                                   | per-axis selector emission; bootstrap writes `data-density`; cascade mirrors the resolver                                                          |
| **P5 Docs + constitution** | `THEMING.md`, `README.md`, `constitution.md`                                           | composition + extension sections (humanizer); Section III amendment                                                                                |

P2 owns all of `sd.config.ts` (both the CSS loop and the token-map format live there) plus the token-map export files — one owner avoids a same-file race. No two units share a file.

### Integration & release

- **I1** — the composition Storybook story (`data-theme="vaporwave"` + `data-density="compact"`, a `play` function asserting the composed result) + the `@layer`-order structural check on the emitted CSS.
- **I2** — full verification: tokens build, all unit tests, typecheck, lint, the MCP smoke test.
- **I3** — `@unbranded-ds/tokens` minor changeset.

So: **F1 ∥ F2 → {P1, P2, P3, P4, P5} in parallel → I1/I2 → changeset.** The wave is 5-wide; the foundational pair is the critical path.

## Testing Strategy

The user asked explicitly to test everything we should. Because this is a tokens-package change, almost all of it is unit-testable, and the one thing that isn't (the CSS cascade precedence) gets both a structural check and a browser story. Each parallel unit owns its tests; nothing is deferred to a single end-phase.

**Unit (Vitest, `packages/tokens`)**

- **composeTokens / mergeLayer** (F1): multi-layer fold, later-layer-wins-per-key, density-over-aesthetic on a deliberate overlap, single-layer identity, empty = defaults, and `resolveTheme`'s existing tests still green after the `mergeLayer` extraction (no regression).
- **validateTheme multi-axis** (P1): composes axes then validates the merged result; **WCAG contrast runs on the COMPOSED pair** (a density value that breaks an aesthetic's AA pair fails loudly); invalid axis combo (two themes on one axis) → structured `{ code, path, axes }`; single-axis path byte-identical to pre-009 (FR-005 regression).
- **token-map generation** (P2): every schema token present with `source:'schema'` and unchanged shape (additive); `shadows.neon` present with `source:'theme-extension'`, correct `type` + `cssVariable`; dedupe across themes; a **drift guard** asserting the map = schema ∪ bundled-theme extensions (modeled on `defaults.test.ts`, which has no token-map coverage today).
- **MCP** (P3): multi-axis input resolves composed values across `lookupToken`/`palette`/`contrast`; `source` labels present; `lookupToken` returns an extension token instead of hard-rejecting it (synthesized `cssVariable`); the soft "extension real but absent from active theme" response (`present:false`) distinguished from a genuine `unknown-token` typo; unrecognized axis ignored, others still apply; existing bare-string-input tests migrated to the object shape.
- **runtime** (P4): `registerTheme` emits the per-axis selector; composed vars equal `composeTokens` output (cascade mirrors resolver); bootstrap writes `data-density`.
- **demo themes** (F2/P2): `vaporwave.json` + `compact.json` validate and build; composing them yields the union; `shadows.neon` emits as `--shadow-neon`.

**Build / drift guards**: extend `exports.test.ts` if the token-map export repoints; the new token-map drift guard; `defaults.test.ts` only changes if `canonicalDefaultTokens` gains tokens (compact overrides existing schema keys, so likely no defaults change — confirm).

**Integration (Storybook, Sections V/VI)**: one story applies both attributes and, in a `play` function, asserts the composed computed values (the spec-010 pattern of reading resolved CSS on the element). A deliberate-overlap probe confirms **density wins** in a real browser — the one assertion a unit test on `composeTokens` can't make about the actual cascade. The story also carries the a11y check.

**CI smoke (Section VII)**: the post-publish `tools/list` MCP smoke test still returns the four tools.

**The resolution-parity oracle is the headline backstop** (`resolution-parity.test.ts`). For every `(aesthetic ∈ {light,dark,brand,vaporwave,∅}) × (density ∈ {compact,∅})` combination, for every token, it asserts three values agree: `composeTokens(...)` (the JS resolver), the value the emitted CSS yields (parse `dist` CSS, apply the known `@layer` order — no browser needed), and the MCP response. That single test catches all three drift modes at once — Style-Dictionary-vs-`resolveTheme` divergence (JS vs CSS), MCP drift (JS vs MCP), and `@layer` precedence bugs — across the full matrix, not hand-picked cases. The browser `play` story then confirms one combo against the real cascade.

This spec inherits a multi-engine resolution stack (SD at build, `resolveTheme` in JS, plus a hand-maintained defaults copy) kept in sync by convention; composition makes that fragility load-bearing. The oracle plus a **branded `ResolvedTokens` type** — so `dtcgToResolved` is the compiler-enforced _only_ door from DTCG to the flat shape — turn "an invariant we hope holds" into "any drift fails CI on the next commit." That services the interest on the debt; the principal (collapse the engines) is the follow-up spec at `docs/workshops/2026-06-11/spec-014-resolution-unification.md`, after which this oracle becomes trivially true and is deleted. See research D9.

## Research Summary

See [research.md](research.md). Nine decisions resolved against the actual code:

1. **One merge** — extract `mergeLayer`; `resolveTheme` and the new `composeTokens` both fold through it. No second hand-rolled merge.
2. **Compose by folding override deltas onto the base** — `composeTokens` = `resolveTheme` generalized to N ordered partials (density last wins). Each axis layer is its resolved _delta_, not a complete set: merging complete sets would clobber (density's inherited defaults would overwrite the aesthetic's colors). This matches the CSS delta-emission, so resolver and cascade agree by construction.
3. **Bridge the two formats** — one `dtcgToResolved()` adapter; the MCP routes through `composeTokens` instead of walking raw DTCG, so the MCP, validator, and runtime compose identically. This is the spec's "one shared resolver" made real, and the biggest drift risk if skipped.
4. **Axis = directory** — `themes/aesthetic/` + `themes/density/`, read via `listThemesByAxis()`. No in-file axis key (Style Dictionary would mis-parse it).
5. **Precedence = cascade `@layer`** — aesthetic and density emit into ordered layers (`@layer ds-aesthetic, ds-density;`), so density wins independent of consumer import order. Density emits its delta only, not the full base set.
6. **Token map = generated + unified** — retire the hand-authored/orphan-generated split; generate from schema ∪ bundled-theme extensions; `source?` is an optional field (additive) but always emitted as a value.
7. **MCP multi-axis input** — `theme` becomes `{ aesthetic?, density? }`; `source` computed from token-map membership (so MCP work doesn't block on the build change); a small startup union of all extension tokens powers the soft absent-response.
8. **Section III amendment** — minor bump; names the axes, the attributes, the precedence, and the schema-lock scope.
9. **Single typed boundary + parity oracle** — brand `ResolvedTokens` so `dtcgToResolved` is the compiler-enforced only door from DTCG; add a cross-surface `resolution-parity.test.ts` (JS == emitted CSS == MCP, all combos). This services the interest on the inherited multi-engine debt; the principal is paid by the resolution-unification follow-up (`docs/workshops/2026-06-11/spec-014-resolution-unification.md`).

## Complexity Tracking

> No constitution violations to justify. The Section III change is a governed amendment, tracked in the Constitution Check above, not a violation.

| Violation | Why Needed | Simpler Alternative Rejected Because |
| --------- | ---------- | ------------------------------------ |
| —         | —          | —                                    |
