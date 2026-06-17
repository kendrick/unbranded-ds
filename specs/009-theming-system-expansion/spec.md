# Feature Specification: Theming system expansion

**Feature Branch**: `009-theming-system-expansion`
**Created**: 2026-06-11
**Status**: Draft
**Input**: User description: "Theming system expansion: multi-axis theme composition and first-class theme-extension tokens with typed token map and MCP visibility." (brief at `docs/workshops/2026-05-18/spec-009-theming-system-expansion.md`)

## Background

Spec 008 fixed the small structural gap that let a theme override only `color`; now a theme can override any token category. But "themes as color skins" still misses the heart of unbranded-ds. A genuinely themable design system supports aesthetics that move more than color: brutalist (sharper radii, harder shadows, condensed type), solarpunk (serif typography, generous spacing, earthy color), vaporwave (decorative type, glow shadows, saturated color). Two gaps block that today.

**Composition.** Consumers want orthogonal axes at once: an aesthetic _and_ a density. "Vaporwave plus compact" is one choice in the consumer's head and should be one choice in the API. Today a theme is single-valued, so a consumer who wants two axes either hand-authors every combination as a merged theme or nests `data-theme` DOM scopes. Neither is the API they want.

**Extension tokens.** A vaporwave theme might want `shadows.neon` (a glow) that the base schema does not declare. The build already emits such tokens as CSS variables (THEMING.md calls extra tokens "forward compatible by design"), but they are invisible to the typed token map and to the token-query MCP. An agent introspecting the MCP cannot discover them; a TypeScript consumer cannot type-check against them. Half-supported extension tokens are a rough edge that pushes consumers toward forking.

This spec closes both gaps and amends Constitution Section III to name the composition API. The amendment is a MINOR bump (1.1.x to 1.2.0).

## Clarifications

One decision was settled before this pass and is not re-opened: **composition merges _resolved_ values, not source themes.** Each axis resolves to its final value set first, then the resolved sets merge. This keeps the door open for derived tokens (a roadmap item) to slot in as a different resolver with no rework, and it matches the resolve-then-validate model spec 008 established.

### Session 2026-06-11

- Q: How should a consumer apply multiple theme axes at once (vaporwave + compact)? → A: Per-axis `data-` attributes (Option B): `data-theme="vaporwave"` + `data-density="compact"`. Each axis is its own namespace; Section III names the recognized axes.
- Q: When two active axes set the same token, how is the conflict resolved? → A: Deterministic precedence — a fixed, documented axis order decides automatically; ordinary value collisions never error. The validator's structured error is reserved for invalid combinations (e.g. two themes on one axis).
- Q: Under deterministic precedence, which axis wins a collision? → A: Density over aesthetic — density refines an aesthetic base, so the density theme's value wins on overlap.
- Q: Are theme axes a fixed DS-defined set, or consumer-extensible? → A: Fixed set for this spec — **aesthetic** and **density**, named in Section III. Consumers pick one theme per axis; defining new axes is a later spec.
- Q: Do consumer-defined non-schema tokens get full first-class support? → A: Yes — a typed token-map entry plus MCP visibility, each carrying a `source: 'theme-extension'` discriminator.
- Q: Whose extension tokens appear in the build-time typed token map? → A: Bundled themes only. Consumer-authored theme tokens get runtime MCP visibility but not build-time TS types (the package build cannot see consumer files); the limitation is documented.
- Q: Is the typed-token-map change additive or breaking? → A: Additive / non-breaking. Existing schema-token entries keep their shape (`source` optional, defaulted to `'schema'`); extension entries and the discriminator are purely added. Ships as a minor; the runtime stays additive (single-axis `data-theme` keeps working).

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Compose orthogonal theme axes (Priority: P1) 🎯 MVP

A consumer wants an aesthetic and a density at the same time: "vaporwave, and compact." They express both as one selection, and the page reflects the union of the two themes' values per a documented merge order. Adding a second axis does not force them to hand-author a combined theme or nest DOM scopes.

**Why this priority**: This is the headline of the spec and the thing that separates aesthetic theming as a first-class concern from color-skinning with an escape hatch. It delivers value on its own: even without the extension-token work (US2), shipping composition lets a consumer stack a density axis on an aesthetic axis.

**Independent Test**: Apply two demonstration themes on orthogonal axes (an aesthetic and a density) simultaneously, and confirm the resolved CSS variables on the page are the union of the two, with collisions resolved in the documented order. Confirm a single-axis theme still works unchanged.

**Acceptance Scenarios**:

1. **Given** two themes on orthogonal axes (aesthetic + density), **When** a consumer applies both at once, **Then** the resolved CSS variables reflect the union of the two themes' values, and a collision resolves to the documented winner.
2. **Given** an existing single-axis theme, **When** it is applied the way it was before this spec, **Then** it resolves exactly as before (no regression to the existing theming path).
3. **Given** an invalid axis combination (e.g. two themes assigned to the same axis), **When** the theme is validated, **Then** the validator returns a structured error naming the axis and the conflict. (Ordinary value collisions between different axes resolve silently by the density-over-aesthetic precedence, not as errors.)
4. **Given** the resolved theme, **When** the runtime applies it, **Then** the merge operates on each axis's _resolved_ values (not raw source fragments), so the result is independent of how each axis was authored.

---

### User Story 2 - First-class theme-extension tokens (Priority: P2)

A consumer adds a token the base schema does not declare (a `shadows.neon` glow on a vaporwave theme). It works as a CSS variable, _and_ it shows up as a typed entry in the token map and in the token-query MCP, labeled as a theme-extension token so consumers know it is not portable to themes that lack it. An agent introspecting the MCP can discover it; a TypeScript consumer can type-check against it.

**Why this priority**: It removes the footgun in the current passthrough behavior, where extension tokens exist but are invisible to the two agent-and-human surfaces (the typed map and the MCP). It is a smaller audience than composition but central to the agent-legibility differentiator. It depends on nothing in US1.

**Independent Test**: Author a theme that declares a non-schema token, build, and confirm the token appears (a) as a working CSS variable, (b) as a typed token-map entry with a `source` discriminator, and (c) in an MCP `lookupToken`/`palette` response labeled as a theme-extension token.

**Acceptance Scenarios**:

1. **Given** a theme JSON declaring a token outside the schema, **When** the build runs, **Then** the typed token map includes that token with a discriminator marking it a theme-extension (distinct from schema tokens).
2. **Given** the same extension token, **When** an agent queries the token-query MCP, **Then** the response includes the token and labels its source as a theme-extension.
3. **Given** the same extension token, **When** it is rendered, **Then** it resolves to a working CSS variable exactly as the current passthrough behavior already provides.
4. **Given** a consumer reading the response, **When** they inspect an extension token, **Then** the shape tells them it is not guaranteed to exist in themes that do not carry it.

---

### User Story 3 - Demonstration themes and documentation (Priority: P3)

A consumer learning the system applies the shipped `vaporwave` and `compact` themes directly, or uses them as starting templates, and reads THEMING.md and the README to understand composition and extension tokens. The demo themes are real, validated artifacts that exercise both new capabilities.

**Why this priority**: Composition and extension tokens are abstract until there is something to apply and a doc that shows the pattern. This makes both real. It is documentation-and-examples polish on top of US1 and US2, so it lands once those capabilities exist.

**Independent Test**: A consumer applies `vaporwave` and `compact` from the published package, sees them render and compose, and follows the THEMING.md sections to add their own composed theme and their own extension token.

**Acceptance Scenarios**:

1. **Given** the published package, **When** a consumer applies `vaporwave` and `compact` together, **Then** both render and compose per the chosen API, and `vaporwave`'s extension token (`shadows.neon`) is visible through the MCP.
2. **Given** THEMING.md, **When** a consumer reads it, **Then** it has a composition section and a theme-extension-tokens section, each with a worked example, and the README quickstart shows a multi-axis application.
3. **Given** the two demo themes, **When** they are validated, **Then** both pass.

---

### Edge Cases

- **Two axes collide on the same token**: the density axis wins (the documented precedence) and the merge resolves silently. The validator's structured error is reserved for invalid combinations (e.g. two themes on one axis), not ordinary cross-axis value overlaps.
- **An attribute names a theme the system does not recognize**: that axis resolves to nothing (the others still apply) rather than failing the whole page. Because the axis set is fixed (aesthetic, density), an unrecognized _axis attribute_ is simply ignored.
- **A theme-extension token shadows a schema token name**: treated as a collision; the resolution and the token map keep them distinguishable by source so a consumer can tell which one they are getting.
- **A consumer queries the MCP for a theme-extension token that the active theme does not carry**: the response indicates the token is a theme-extension absent from the active theme, not a hard "unknown token" error, so the consumer learns it is theme-scoped.
- **A single-axis (pre-009) theme**: keeps working unchanged. Composition is additive; the existing single-theme path is preserved.
- **Extension token fails the existing structured-value checks** (malformed value, or a color pair that should meet contrast): the existing validation behavior applies unchanged.

## Requirements _(mandatory)_

### Functional Requirements

**Composition (US1)**

- **FR-001**: The theming system MUST let a consumer apply more than one theme on orthogonal axes simultaneously, expressed through **per-axis `data-` attributes** (`data-theme` for the aesthetic axis, `data-density` for the density axis). The recognized axes are a fixed set for this spec: **aesthetic** and **density**.
- **FR-002**: The runtime MUST resolve the active axes into a single CSS-variable set that is the union of each axis's values, with collisions resolved by a documented, deterministic axis precedence: **density overrides aesthetic**.
- **FR-003**: The merge MUST operate on each axis's **resolved** values, not its raw source fragments, so the result does not depend on how each axis theme was authored. (Settled decision; see Clarifications.)
- **FR-004**: `validateTheme()` MUST handle the merge semantics and MUST return a structured error (code + path + the involved axes) for an **invalid axis combination** (e.g. two themes assigned to the same axis). Ordinary value collisions between different axes are NOT errors — they resolve silently by the density-over-aesthetic precedence.
- **FR-005**: The single-axis theming path that existed before this spec MUST continue to work unchanged. Composition is additive.
- **FR-006**: The token-query MCP tools (`lookupToken`, `palette`, `contrast`) MUST accept the multi-axis input shape (an object keyed by axis name) and return values resolved across the active axes.
- **FR-007**: Constitution Section III MUST be amended to name the per-axis composition API, the recognized axes (**aesthetic, density**), and the density-over-aesthetic precedence. The amendment is a MINOR version bump.

**Theme-extension tokens (US2)**

- **FR-008**: The build MUST generate the typed token map from the union of schema tokens AND any tokens found across the **bundled** theme JSON files (consumer-authored theme tokens are out of scope for build-time typing). Every entry MUST carry a `source` discriminator (`'schema'` | `'theme-extension'`), and the change MUST be **additive** — existing schema-token entries keep their current shape (`source` optional or defaulted to `'schema'`) so current TypeScript consumers keep compiling.
- **FR-009**: The token-query MCP's `lookupToken` and `palette` responses MUST include theme-extension tokens and label them by source, so a consumer can tell schema tokens from theme-extension tokens.
- **FR-010**: A theme-extension token MUST continue to resolve to a working CSS variable, preserving the current passthrough behavior.
- **FR-011**: The response shape MUST make clear that a theme-extension token is not guaranteed to exist in themes that do not declare it (it is theme-scoped, not part of the locked schema).
- **FR-012**: Constitution Section III's "schema locked at build time" MUST be clarified to apply to the canonical token set, not to per-theme extension tokens (which are a documented escape hatch).

**Demonstration themes and docs (US3)**

- **FR-013**: `vaporwave.json` and `compact.json` MUST ship in `packages/tokens/themes/` and pass validation. `vaporwave` overrides color, shadows (including the `shadows.neon` extension token), and typography; `compact` overrides spacing and typography line-heights.
- **FR-014**: THEMING.md MUST gain a composition section and a theme-extension-tokens section, each with a worked example (composing two axes; adding `shadows.neon` and seeing it through the MCP).
- **FR-015**: The README quickstart MUST demonstrate multi-axis theme application using the shipped demo themes.

**Constraints**

- **FR-016**: All validation output MUST stay structured (`{ ok, issues: [{ code, path, message }] }`), consistent with the existing failure-mode pattern (Section XI.4). Human-readable messages layer on top.
- **FR-017**: The MCP tool contract at `specs/005-agent-experience-foundation/contracts/token-query-mcp.md` MUST be updated to reflect the multi-axis input shape and the extension-token response fields.

### Key Entities _(include if feature involves data)_

- **Theme axis**: a named dimension of theming, applied via its own `data-` attribute — `data-theme` (aesthetic) and `data-density` (density). Each axis carries its own set of theme files. A consumer activates at most one theme per axis at a time.
- **Composed theme**: the runtime result of resolving every active axis to its values and merging the resolved sets, density overriding aesthetic on collision. Independent of how each axis was authored.
- **Theme-extension token**: a token a theme declares that the base schema does not. It resolves as a CSS variable and is theme-scoped (not part of the locked schema). It is typed in the build-time token map when it comes from a bundled theme, and is visible at runtime through the MCP for any theme; either way it carries a `source: 'theme-extension'` discriminator.
- **Recognized axis set**: the fixed pair this spec ships — **aesthetic** (`data-theme`) and **density** (`data-density`) — named in Constitution Section III after the amendment. Density takes precedence over aesthetic on collision. Consumer-defined axes are a later spec.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: A consumer can apply two orthogonal themes (an aesthetic and a density) as one selection, and the page's resolved variables are the union of the two with collisions resolved deterministically.
- **SC-002**: A single-axis theme applied the pre-009 way renders identically to before (no regression).
- **SC-003**: A theme-extension token declared in a theme JSON appears as a working CSS variable, a typed token-map entry with a `source` discriminator, and an MCP response labeled as a theme-extension.
- **SC-004**: The token-query MCP accepts the multi-axis input shape and returns values resolved across active axes.
- **SC-005**: `vaporwave.json` and `compact.json` ship, pass validation, and compose; `vaporwave`'s `shadows.neon` is visible through the MCP.
- **SC-006**: A consumer can follow THEMING.md to compose two axes and to add their own extension token, and the README quickstart shows multi-axis application.
- **SC-007**: Constitution Section III is amended (minor bump) to name the composition API and clarify the schema-lock scope.
- **SC-008**: An invalid axis combination (two themes assigned to one axis) produces a structured, path-named validator error; ordinary cross-axis value collisions resolve silently by the density-over-aesthetic precedence.

## Assumptions

- **Composition uses per-axis attributes (Option B), decided.** `data-theme` (aesthetic) + `data-density` (density), a fixed two-axis set for this spec. Consumer-defined axes are a later spec.
- **Axis precedence is density-over-aesthetic, decided.** Ordinary cross-axis value collisions resolve silently by that order; only invalid combinations (two themes on one axis) raise a structured validator error.
- **Extension tokens get full first-class treatment, decided.** Typed map + MCP visibility with a `source` discriminator. Build-time typing covers bundled themes only; consumer theme tokens get runtime MCP visibility but not build-time TS types.
- **The typed-token-map change is additive (non-breaking), decided.** Existing schema-token entries keep their shape; the `source` field and extension entries are purely added. Ships as a minor.
- **Composition merges resolved values, not source themes.** Settled (see Clarifications), to keep derived tokens viable later with no rework.
- **Spec 008 is shipped and published** (`tokens@0.4.0`), providing the per-category override loosening and the resolve-then-validate model this spec builds on. Verified.
- **The two demo themes are the only ones in scope.** Brutalist and solarpunk are marketing aesthetics, not API work (out of scope).
- **No per-axis validation rules.** Any axis may override any category; tighter per-axis rules ("density themes may only touch spacing") are a future spec.

## Dependencies

- **Spec 008 (token schema growth)** merged and published — provides per-category overrides and the resolve-then-validate validator this spec extends.
- **Spec 005 (agent experience foundation)** — provides the token-query MCP and its contract doc, which this spec extends for multi-axis input and extension-token visibility.
- **The Style Dictionary build** — extended so the typed token map is generated from the union of schema + theme-extension tokens.

## Out of Scope

- **The full aesthetic palette** beyond the two demonstration themes (brutalist, solarpunk) — marketing choices, not API design.
- **Per-axis token validation** ("a density theme may only override spacing and typography") — a future spec; this spec accepts any axis overriding any category.
- **Component-level theme overrides** (making Button render differently under vaporwave) — a different design problem; consumers use a wrapper or CVA override.
- **Derived/computed tokens** — the roadmap's seeds-and-relationships idea. This spec only ensures composition merges resolved values so derived tokens can slot in later.
