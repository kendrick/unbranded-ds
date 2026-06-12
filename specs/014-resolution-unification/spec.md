# Feature Specification: Resolution unification (single source of resolution truth)

**Feature Branch**: `014-resolution-unification`
**Created**: 2026-06-12
**Status**: Draft
**Input**: User description: "Resolution unification: make Style Dictionary the single resolver for build-time themes; everyone reads its emitted resolved artifacts, collapsing the multi-engine debt and retiring the 009 parity oracle." (brief at `docs/workshops/2026-06-11/spec-014-resolution-unification.md`)

## Background

Spec 009 shipped theme composition on a resolution stack that already had more than one engine, and it added a cross-surface parity oracle to keep them honest. That oracle was the right move: it turned silent divergence into a loud CI failure across the full combination matrix, and on its first run it caught a real accessibility regression. But it services the *interest* on the debt. It detects divergence; it does not remove the thing that can diverge.

The debt is concrete. A bundled theme is resolved **twice**: Style Dictionary resolves it into CSS at build, and the JS side re-resolves the same theme for the token-query MCP and the validator. Two implementations of "merge a theme onto the base," kept equal by a test rather than by construction. On top of that, the inheritance baseline (`canonicalDefaultTokens`) is a hand-maintained third copy of the base values, kept honest by its own drift guard because the package ships only its built output and cannot import the source files.

The divergence is possible only where one theme is resolved by two engines, and that is exactly and only the build-time (bundled) themes. This spec removes that overlap: the build becomes the single resolver for bundled themes, and every other surface reads its emitted output instead of re-resolving. Once that holds, the parity oracle and the defaults drift guard become structurally unnecessary and retire. This is what paying the principal looks like, as opposed to the interim safety 009 bought.

This is plumbing. No consumer-facing theming behavior changes.

## Clarifications

### Session 2026-06-12

- Q: What should the build emit per bundled theme as the resolved artifact? → A: The theme's resolved DELTA (its own overridden keys, with build-resolved values). `composeTokens` folds deltas onto the base exactly as in 009; a theme's full set is the base composed with its delta. This mirrors the CSS (aesthetic = base+delta, density = delta), so parity holds by construction.
- Q: How far do we retire the 009 cross-surface parity oracle? → A: Remove the full (combination × token) matrix, but keep one thin canary asserting a sample theme's MCP value equals its emitted-artifact value equals its CSS value — guarding that the consumers actually read the artifact.
- Q: How is the generated `canonicalDefaultTokens` baseline produced and shipped? → A: A committed generated module produced from the build's resolved base, with a CI regenerate-and-diff check that replaces the hand-maintained drift guard. It stays a normal source file (no build-order problem) and the baseline is visible in the tree.
- Q: What happens to the 009 `dtcgToResolved` bridge once the MCP reads emitted artifacts? → A: Remove it entirely (export and tests included). No production caller remains once the MCP reads the resolved artifacts and the parity matrix is gone; runtime consumer themes use the flat runtime-document format, not raw DTCG.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Bundled themes resolve exactly once (Priority: P1) 🎯 MVP

The build emits each bundled theme's fully-resolved token set as data, alongside the CSS it already produces. The token-query MCP, the bundled-theme validation path, and the inheritance baseline all read that emitted data instead of re-resolving the theme themselves. A value an agent reads from the MCP for a bundled theme is, by construction, the same value the browser paints, because both come from one resolution.

**Why this priority**: This is the whole spec. Collapsing the build-time resolution to one engine is what removes the divergence; everything else (retiring the oracle, retiring the drift guard) follows from it. It delivers value on its own: even before the scaffolding is removed, the surfaces stop being able to disagree.

**Independent Test**: Point the MCP and the bundled-theme validation at the emitted resolved artifact, then confirm a bundled theme's reported values equal its emitted-CSS values for the full token set, without any cross-engine reconciliation step. Confirm no JS code path re-resolves a bundled DTCG theme.

**Acceptance Scenarios**:

1. **Given** a bundled theme, **When** the build runs, **Then** it emits a canonical resolved token artifact for that theme produced by the same resolution that produced its CSS.
2. **Given** the token-query MCP queried for a bundled theme, **When** it resolves a token, **Then** it reads the emitted resolved artifact rather than walking and re-resolving the raw source.
3. **Given** a bundled theme validated at build time, **When** validation runs, **Then** it reads the emitted resolved artifact rather than re-resolving.
4. **Given** the inheritance baseline (the canonical defaults), **When** it is produced, **Then** it is derived from the build's resolved base, not hand-maintained.

---

### User Story 2 - The interim scaffolding retires (Priority: P2)

The cross-surface parity matrix from 009 is removed and replaced by a thin canary, and the canonical-defaults drift guard is replaced by a regenerate-and-diff check, because the invariant each defended is now true by construction rather than by test. A maintainer stops paying the standing test tax, and a future reader sees one resolution path instead of two-kept-in-sync.

**Why this priority**: It is the payoff, and it only becomes safe to do *after* US1 makes the invariant structural. Removing the oracle before the engines collapse would drop the safety net while the divergence still exists. After US1, the oracle proves nothing a single source of truth doesn't already guarantee.

**Independent Test**: Remove the parity oracle and the defaults drift guard; confirm the suite stays green and that nothing else depended on them. Confirm a recorded note explains why each is no longer load-bearing.

**Acceptance Scenarios**:

1. **Given** the single-resolver change has landed, **When** the parity matrix is removed and replaced by the thin canary, **Then** the test suite stays green and a note records that the full-matrix invariant is now structural.
2. **Given** the generated baseline, **When** the defaults drift guard is removed, **Then** nothing else relies on the hand-maintained copy and the suite stays green.

---

### User Story 3 - The runtime path stays the one isolated second context (Priority: P3)

Consumer themes supplied at runtime keep their own JS resolver, untouched. That is the one genuinely necessary second engine, because those themes are never seen by the build. After this spec it is the *only* remaining second resolution context, it never overlaps a bundled theme, and the branded boundary still forbids feeding it the wrong shape.

**Why this priority**: It is the correctness boundary that makes US1 safe to state absolutely ("bundled themes resolve once"). It is mostly a verification-and-isolation story rather than new construction: confirm the runtime resolver is the sole survivor and that no bundled theme flows through it.

**Independent Test**: Confirm the runtime consumer-theme path resolves unchanged, that it is the only JS resolution path remaining, and that no bundled theme is routed through it. Confirm the branded `ResolvedTokens` boundary still holds.

**Acceptance Scenarios**:

1. **Given** a consumer runtime theme, **When** it is registered, **Then** it resolves through the JS resolver exactly as before (no behavior change).
2. **Given** the codebase after this spec, **When** the resolution paths are inventoried, **Then** the runtime consumer-theme resolver is the only second context, and no bundled theme is resolved by it.

---

### Edge Cases

- **A bundled theme declares a token the base does not** (a theme-extension like `shadow.neon`): it is part of that theme's resolved artifact and flows to the MCP and token map from the emitted data, unchanged from the 009 behavior.
- **The emitted resolved artifact and the emitted CSS could disagree**: they cannot, because both derive from one resolution. That impossibility is the point; it is what lets the parity oracle retire.
- **A consumer runtime theme names a token only a bundled theme defines**: handled by the runtime resolver exactly as today; the runtime path is unchanged.
- **The 009 `dtcgToResolved` bridge has no caller left** after the MCP repoints and the parity matrix is gone: it is removed entirely, and the test helpers that used it switch to the emitted artifact.
- **Composition still works**: `composeTokens` folds the build-emitted resolved deltas with the same density-over-aesthetic precedence; the composition contract from 009 is unchanged.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The build MUST emit, for each bundled theme, a canonical resolved token artifact — the theme's resolved DELTA (the keys it overrides, with build-resolved values) — produced by the same resolution that produces the theme's CSS, so the two cannot disagree. A theme's full resolved set is the base composed with its delta; `composeTokens` folds these deltas exactly as in 009.
- **FR-002**: The token-query MCP MUST read bundled-theme values from the emitted resolved artifact instead of re-resolving the raw source.
- **FR-003**: The bundled-theme validation path MUST read the emitted resolved artifact instead of re-resolving.
- **FR-004**: The inheritance baseline (`canonicalDefaultTokens`) MUST be derived from the build's resolved base as a committed generated module rather than hand-maintained.
- **FR-005**: After this spec, no bundled theme may be resolved by more than one engine; exactly one engine (the build) resolves bundled themes.
- **FR-006**: The 009 cross-surface parity MATRIX oracle MUST be removed and replaced by a thin canary asserting one sample theme's MCP value equals its emitted-artifact value equals its CSS value, with a recorded note that the full-matrix invariant is now structural.
- **FR-007**: The hand-maintained canonical-defaults drift guard MUST retire once the baseline is generated, replaced by a regenerate-and-diff CI check on the committed generated baseline.
- **FR-008**: The runtime consumer-theme resolver MUST remain unchanged in behavior and be the only second resolution context; the branded `ResolvedTokens` boundary stays.
- **FR-009**: `composeTokens` MUST keep the 009 composition contract (fold resolved deltas, density over aesthetic); it now folds build-emitted resolved deltas.
- **FR-010**: The 009 `dtcgToResolved` bridge MUST be removed entirely (export and tests included); no production caller remains after the MCP reads the emitted artifacts, and the runtime consumer-theme path uses the flat runtime document, not raw DTCG.
- **FR-011**: No consumer-facing theming behavior changes — per-axis attributes, density-over-aesthetic precedence, the public theming API, and the composition semantics are all unchanged.
- **FR-012**: Constitution Section III's "themes validated, fail loudly" wording MAY get a patch or minor clarification if the validation entry point moves; this spec introduces no new principle.

### Key Entities *(include if feature involves data)*

- **Resolved artifact**: the per-theme canonical resolved token set the build emits alongside the CSS. The single source of truth for a bundled theme's values; read by the MCP, the bundled-theme validator, and the baseline.
- **Build-time (bundled) theme**: a theme that ships in the package and is resolved once, by the build. The set of themes the divergence used to be possible across.
- **Runtime consumer theme**: a theme supplied at runtime, resolved by the JS resolver. The one legitimate second resolution context, isolated and never overlapping a bundled theme.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Every bundled theme is resolved by exactly one engine (the build); no JS code path re-resolves a bundled source theme.
- **SC-002**: For a bundled theme, the value the introspection surfaces report equals the value the rendered CSS carries by construction, so the cross-engine parity test is no longer required to prove it.
- **SC-003**: The inheritance baseline is generated from the build's resolved base; the hand-maintained copy and its drift guard are removed, replaced by a committed generated module and a regenerate-and-diff check.
- **SC-004**: The 009 `resolution-parity.test.ts` matrix is removed and replaced by a thin read-the-artifact canary, with a recorded rationale.
- **SC-005**: The runtime consumer-theme path behaves identically to before and is the only remaining second resolution context; the branded boundary holds.
- **SC-006**: No consumer-facing theming behavior changes; the existing theming and composition tests pass unchanged.

## Assumptions

- **The emitted resolved artifact is a per-theme resolved DELTA** (decided in clarify), in the package's built output, the natural sibling of the per-theme CSS. The exact file layout (per-theme JSON vs a combined map) is a planning detail; the artifact represents each theme's resolved overrides, which is what `composeTokens` folds.
- **The generated baseline is a committed module with a regenerate-and-diff CI check** (decided), replacing the hand-maintained `defaults.ts` and its drift guard.
- **`dtcgToResolved` is removed entirely** (decided): the MCP reads the resolved artifact and the parity matrix is gone, so no production caller remains; the test helpers that used it switch to the artifact.
- **The runtime consumer-theme format is the flat runtime document**, resolved by the JS resolver, which never sees a bundled source theme.
- **Spec 009 is shipped and on main**: `composeTokens`, the unified token map, the parity oracle, and the branded `ResolvedTokens` boundary all exist and are the starting point.

## Dependencies

- **Spec 009 (theming system expansion)** — provides the composition resolver, the unified token map, the parity oracle this spec retires, and the branded boundary it keeps.
- **The Style Dictionary build (Constitution Section VIII)** — becomes the single resolver for bundled themes; this spec makes it more central, not less.

## Out of Scope

- **The runtime consumer-theme resolver.** It stays; it is the legitimate second context, isolated.
- **Derived tokens.** This spec is about *where* resolution happens, not *what* resolution can compute. It clears the ground a derived-token spec would build on (a single resolver stage), but builds nothing of it.
- **Composition semantics and the public theming API.** Per-axis attributes, density-over-aesthetic, and the consumer-facing surface from 009 are unchanged; this changes the plumbing beneath them.
