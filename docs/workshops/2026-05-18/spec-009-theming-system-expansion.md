# Spec 009 — Theming system expansion

**Target version:** next minor bump after spec 008 (introduces multi-axis theme application and a typed surface for theme-extension tokens — both are breaking-shape changes for the `data-theme` API and the typed token map)
**Depends on:** 008 (schema additions plus per-category overrides; both prerequisites for the work here)
**Blocks:** 010 (the API retrofit may want to lean on multi-axis themes once available)
**Split from:** spec 008 — that spec stayed narrow to schema additions plus the small structural fix that lets themes override any category. This spec picks up the larger design questions surfaced during spec 005's `/speckit.implement`: composable theme axes and first-class theme-extension tokens.

---

## Motivation

The "themes as color skins" framing misses the heart of unbranded-ds. A genuinely themable design system has to support visual aesthetics that move more than color: brutalist (sharper radii, harder shadows, condensed type), solarpunk (serif typography, generous spacing, earth-toned colors), vaporwave (decorative typography, glow-style shadows, saturated colors). Spec 008 fixes the small structural issue that themes can only override `color`. This spec fixes the two bigger gaps:

1. **Composition.** Consumers want orthogonal axes: aesthetic AND density. "Vaporwave + compact" is one selection in the consumer's head and should be one selection in the API. Today themes are single-valued — a consumer who wants two axes either writes a combinatorial set of merged themes or nests `data-theme` DOM scopes, neither of which is the API they want.
2. **Extension tokens.** A vaporwave theme might want `shadows.neon` (a glow effect) that the base schema doesn't declare. Today the build emits these as CSS variables (THEMING.md says "extra tokens are allowed; forward compatible by design") but they don't show up in the typed token map and don't surface in the token-query MCP. Half-supported extension tokens are a footgun — agents using the MCP can't discover them, TypeScript consumers can't type-check against them.

Both gaps make the difference between a design system that supports aesthetic theming as a first-class concern and one that treats themes as color skins with a passthrough escape hatch.

---

## Context (theme composition — multiple axes)

The choices for representing multiple theme axes:

**Option A — multi-value `data-theme`.** `data-theme="vaporwave compact"` (space-separated like `className`). CSS variable resolution merges values from each named theme; later values override earlier ones on collision. Pro: one API stays. Con: ordering becomes load-bearing; merge semantics need careful documentation.

**Option B — separate `data-` attributes per axis.** `data-theme="vaporwave"` plus `data-density="compact"`. Each attribute is its own theme namespace with its own JSON files. Pro: orthogonality is explicit; CSS selectors stay simple (`[data-theme=vaporwave]` independent of `[data-density=compact]`). Con: more API surface; consumers need to know which axis a theme belongs to. Constitution Section III needs an update to name the recognized axes.

**Option C — theme inheritance / extension at the JSON level.** A `vaporwave-compact.json` declares `"extends": ["vaporwave", "compact"]` and the validator merges at build time. Pro: ordering is explicit per theme; runtime stays single-axis. Con: combinatorial explosion of theme files for N×M axes; consumers re-author every combination.

Decision belongs in clarify and affects the runtime, validator, and MCP. My read going in: Option B is the most ergonomically honest — it makes axes a first-class API surface, and the multi-attribute selector model is conventional in CSS frameworks. Option A is tempting for "less API" but the ordering semantics are subtle. Option C punts the complexity to JSON authoring.

Whichever option lands, the MCP tools (`lookupToken`, `palette`, `contrast`) need to accept the multi-axis input shape and merge during resolution.

---

## Context (per-theme token additions)

A vaporwave theme might want a `--shadow-neon` that the base schema doesn't declare. Today THEMING.md says "extra tokens beyond the schema are allowed; forward compatible by design" — those tokens DO emit as CSS variables. But two things don't follow through:

- The typed token map at `dist/ts/token-map.js` enumerates only schema-defined tokens. Theme-extension tokens are invisible to TypeScript consumers.
- The token-query MCP's `palette` and `lookupToken` tools walk the schema-defined token tree. Theme-extension tokens don't appear in the responses.

The fix:

- Build step: the typed token map is generated from the **union** of schema tokens AND any tokens found across the bundled theme JSON files. Theme-extension tokens get TypeScript types like `'shadows.neon': { name, category, type, cssVariable, source: 'theme-extension' }`.
- MCP: `palette` and `lookupToken` walk the resolved theme's actual contents and label theme-extension tokens with their source. The response shape distinguishes schema tokens from theme-extension tokens so consumers know which are portable across themes that don't carry them.

Constitution implication: Section III's "schema locked at build time" remains true for the built-in tokens. Theme-extension tokens are a documented escape hatch for per-theme primitives the schema doesn't generalize. The constitution may want a paragraph clarifying that the schema-lock applies to the canonical token set, not to extension tokens.

Decision to confirm during clarify: do consumer-defined theme-extension tokens get the same first-class TS-types + MCP-visibility treatment as schema tokens, or do we keep the current "passthrough as CSS variables only, no typed support" stance? Recommendation: full first-class treatment. Half-supported extension tokens are the kind of design-system rough edge that pushes consumers toward forking.

---

## Scope

### Theme composition

- Decide composition approach (Option A, B, or C). Lock in during clarify.
- Update Constitution Section III to reflect the chosen API. Section III currently says "Multiple themes may coexist on the page via nested `data-theme` scopes." That stays true regardless. The amendment adds whichever axis API the spec lands.
- Runtime: theme-application code resolves the active axis or axes into the appropriate CSS variable set. If Option B (multiple `data-` attributes), the runtime accepts each attribute and merges in the documented order. If Option A, the runtime parses the space-separated value. If Option C, the runtime stays single-axis but the validator merges at build time.
- Validator: `validateTheme()` handles the merge semantics of whichever option lands. The validator surfaces structured errors when two axes collide on a value and the consumer needs to disambiguate.
- MCP tools (`lookupToken`, `palette`, `contrast`): accept the multi-axis input shape. The `theme` parameter becomes either a string list (Option A) or an object keyed by axis name (Option B) or stays a string (Option C). The contract docs in `specs/005-agent-experience-foundation/contracts/token-query-mcp.md` get updated.
- A `vaporwave.json` and a `compact.json` ship in the repo as concrete examples of the composition API. The README's quickstart shows a `data-theme="vaporwave compact"` (or equivalent) example.

### Theme-extension tokens

- Build step: typed token map is generated from the union of schema tokens AND tokens found across the bundled theme JSON files. Theme-extension tokens get TypeScript types with a `source` discriminator.
- MCP tools: `palette` and `lookupToken` responses include theme-extension tokens AND label them as such in the response shape.
- THEMING.md: a "Theme-extension tokens" subsection explains the build flow, the TS types, and the MCP visibility. Includes a worked example showing how to add `shadows.neon` to a vaporwave theme and how the agent sees it through the MCP.

### Built-in theme examples

- Add `vaporwave.json` and `compact.json` to `packages/tokens/themes/` as demonstration themes that exercise the new capabilities. `vaporwave.json` overrides color, shadows (including an extension `shadows.neon`), and typography. `compact.json` overrides spacing and typography.line-heights.
- These ship in the npm package. Consumers can apply them directly via `data-theme` or use them as starting templates for their own theme files.

## Out of scope

- The full theme palette beyond the two demonstration themes. Brutalist and solarpunk are tempting examples but they're aesthetic choices for the project's later marketing, not API design work.
- Per-axis token validation (e.g., "compact density themes may only override spacing and typography"). The spec accepts any axis overriding any category; tighter rules can land in a future spec if needed.
- Component-level theme overrides. A consumer who wants Button to render differently in vaporwave can't do that through the theming system — they'd reach for a wrapper component or a CVA override. Component theming is a different design problem and out of scope.

## Acceptance criteria

- The chosen theme-composition approach works end-to-end: a consumer can apply `vaporwave` and `compact` simultaneously (whichever syntax the chosen option dictates) and the resolved CSS variables on the page reflect the union of the two themes per the chosen merge semantics.
- The validator surfaces a structured error when a theme JSON declares an invalid axis combination or conflicts with the chosen API.
- The token-query MCP's tools accept the multi-axis input shape and return the merged-resolved values.
- A theme JSON that declares a token not in the schema (e.g., `"shadows": { "neon": { "$value": "0 0 10px var(--color-primary)", "$type": "shadow" } }`) produces a working CSS variable, a typed entry in the token map with `source: 'theme-extension'`, and an MCP response that includes the token with its source label.
- `vaporwave.json` and `compact.json` ship in `packages/tokens/themes/` and pass validation. Both are documented in THEMING.md as worked examples.
- Constitution Section III is amended to reflect the chosen composition API. The amendment is a MINOR bump (new principle / materially expanded guidance).
- README quickstart demonstrates multi-axis theme application.

## Constitution check (bridge rules)

This spec amends Constitution Section III to name the chosen composition API. The amendment is a MINOR bump (1.1.x → 1.2.0). Section XI rules apply to all prose touched.

Specifically:

- THEMING.md additions pass through the humanizer skill
- Theme-extension token examples follow Section XI.1 prose rules (no three-item lists in the worked examples)
- MCP tool contract updates in `specs/005-agent-experience-foundation/contracts/token-query-mcp.md` go through the same prose pass

## References

- [tmp/spec-008-token-schema-growth.md](spec-008-token-schema-growth.md) — the smaller schema-additions spec this one builds on
- [.specify/memory/constitution.md](../.specify/memory/constitution.md) Section III — the theming contract that this spec amends
- [packages/tokens/src/schema.ts](../packages/tokens/src/schema.ts) — Zod schema that needs the composition update
- [packages/tokens/src/validate.ts](../packages/tokens/src/validate.ts) — `validateTheme()` that gets the merge semantics
- [packages/tokens/src/mcp/](../packages/tokens/src/mcp/) — MCP tools that need the multi-axis input shape
- [packages/tokens/src/token-map.ts](../packages/tokens/src/token-map.ts) — typed token map that gets the union-with-theme-extensions treatment
- [THEMING.md](../THEMING.md) — gets two new subsections (composition, theme-extension tokens)
