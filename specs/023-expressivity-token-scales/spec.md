# Feature Specification: Expressivity token scales (tracking and larger radii)

**Feature Branch**: `023-expressivity-token-scales`  
**Created**: 2026-06-18  
**Status**: Draft  
**Input**: User description: "@docs/workshops/2026-06-18/spec-023-expressivity-token-scales.md"

## Clarifications

### Session 2026-06-18

- Q: What CSS-variable name should the tracking scale emit? → A: `--tracking-*` (Tailwind's letter-spacing namespace, matching the motion tokens that emit `--duration-*` / `--ease-*`).
- Q: Are the new token keys required or optional in the schema? → A: Required, matching spec 008. The built-in themes inherit the base defaults and need no edits, so the only break is for a fully-specified external consumer theme, announced by the version bump.
- Q: How far do the tracking and radius scales reach? → A: Tailwind-aligned scales as the basis; the reference skin routes its most extreme values to the nearest stop rather than the scale extending to match them exactly. The default token vocabulary stays a curated general set.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Express wide letter-spacing through a token (Priority: P1)

A theme author skinning the design system into a wide, all-caps look (the tracking seen on a console UI or a luxury wordmark) wants to set letter-spacing on the components they style. Today there is no letter-spacing token, so they write a raw value like `0.18em` directly onto a design-system node, which leaves the sanctioned token channel. They want to set tracking the same way they set font weight or line height: by referencing a design token.

**Why this priority**: Letter-spacing is the single largest gap. In the reference skin it accounts for three of the five places the theme had to leave the design system, and unlike radii it has no existing channel at all.

**Independent Test**: Re-author the reference skin's tracking through the new token and run the expressivity audit; the letter-spacing findings drop to zero while the look is unchanged.

**Acceptance Scenarios**:

1. **Given** a theme that wants wide all-caps tracking on a component, **When** it applies the tracking token to a published part, **Then** the expressivity audit reports no raw-value finding for letter-spacing.
2. **Given** a dense layout that wants tighter-than-normal tracking, **When** it references the tight end of the tracking scale, **Then** it can do so without a raw value.

---

### User Story 2 - Build a chunky, asymmetric corner from radius tokens (Priority: P2)

A theme author wants the large, single-sided "elbow" corners of a console UI: a panel rounded heavily on one corner and square on the rest. The radius they want sits between the design system's small steps and a full pill, a size the scale doesn't currently offer, so they fall back to a raw length. They want to express the corner entirely from radius tokens, including the asymmetry.

**Why this priority**: Radii account for two of the five gaps, a smaller share than tracking. Part of the need (the asymmetry itself) is already met, because a per-corner radius composes from existing tokens, so the true gap is narrower: the scale lacks steps in the chunky size range.

**Independent Test**: Reroute the reference skin's elbow through radius tokens per corner and run the audit; the radius findings drop to zero.

**Acceptance Scenarios**:

1. **Given** a theme that wants a large asymmetric corner, **When** it composes the corner from radius tokens (one per corner), **Then** the audit reports no raw-value finding for border radius.
2. **Given** a theme that wants a chunky symmetric corner, **When** it references the nearest chunky radius step (around 1rem to 1.5rem), **Then** that step exists and no raw value is required.

---

### User Story 3 - The accessibility contract holds under the richer skin (Priority: P3)

After a skin expresses its complete look through the new tokens, it must remain accessible: text contrast and the automated accessibility pass must hold, in both light and dark, exactly as they did before. The point of the design system is range without giving up the contract.

**Why this priority**: This is an invariant, not new capability, but it is what makes the added expressiveness defensible rather than merely decorative.

**Independent Test**: Run the contrast validation and the automated accessibility pass over the reference skin in both color schemes; both are clean.

**Acceptance Scenarios**:

1. **Given** the reference skin rerouted through the new tokens, **When** the accessibility checks run in light and dark, **Then** there are no contrast or accessibility violations.

---

### Edge Cases

- A theme overrides only some stops of a new scale: the remaining stops inherit the design system's default values.
- An existing theme never references the new tokens: its rendered output is unchanged, because the new tokens carry default values it inherits.
- A fully-specified theme (one that declares every token) omits a newly required token: it receives a clear validation error naming the missing token. This is the announced breaking change for that class of consumer.
- A theme wants tracking or a radius beyond the ends of the new scales: it is bounded by the scale, and a value the scale doesn't offer surfaces as the next gap (the audit flags it). That is the intended signal for a future scale extension, not a reason to allow a raw value.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The token system MUST provide a letter-spacing (tracking) scale that theme authors reference like any other token scale, spanning at least tight, normal, and wide tracking.
- **FR-002**: A theme MUST be able to override the tracking scale's values, in whole or in part, like any other token category.
- **FR-003**: The radius scale MUST include steps in the size range between the current small steps and a full pill, so chunky corners are expressible through tokens.
- **FR-004**: Theme authors MUST be able to compose an asymmetric (per-corner) radius entirely from radius tokens, with no raw length required.
- **FR-005**: The new tokens MUST be available wherever existing tokens are (every generated artifact and the utility layer consumers use), so a theme reaches them through the normal channel.
- **FR-006**: A theme that does not reference the new tokens MUST render identically to before, inheriting the design system's default values for them.
- **FR-007**: The system MUST report a clear, structured validation error, naming the missing token, when a fully-specified theme omits a newly required token.
- **FR-008**: A maximally divergent reference skin MUST be able to express its complete intended look using only tokens, with no raw style value applied to any design-system node.
- **FR-009**: The accessibility contract (WCAG AA contrast on the declared pairs and the automated accessibility pass on the rendered skin) MUST continue to hold in both light and dark after the change.

### Key Entities *(include if feature involves data)*

- **Tracking scale**: a named set of letter-spacing values (tight through wide), its own top-level token category (a sibling of typography), overridable per theme.
- **Radius scale (extended)**: the existing corner-radius scale, grown with larger steps that fill the range between the small steps and a full pill.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: The reference skin expresses its complete look using only design tokens. The expressivity audit reports 0 blockers for it, down from the current 5.
- **SC-002**: The reference skin passes contrast validation and the automated accessibility pass with zero violations, in both light and dark.
- **SC-003**: No existing theme changes its rendered output. The emitted value of every pre-existing token is unchanged, and the existing theme contrast suite stays green.
- **SC-004**: A theme author can express wide or tight letter-spacing and chunky or asymmetric corners without writing a single raw length value on a design-system node.

## Assumptions

- The new tokens follow the design system's existing token conventions (build pipeline, utility alignment). The tracking scale emits `--tracking-*` (Tailwind's letter-spacing namespace, the way the motion tokens emit `--duration-*` and `--ease-*`); the larger radii stay `--radius-*`.
- New token keys are added as required, matching the precedent set when motion tokens and the larger type sizes were added. Because the design system's own base sources carry default values for them, the built-in themes inherit those values and need no edits; the only migration cost falls on a fully-specified external consumer theme, announced by a version bump.
- Asymmetric radii are achieved by composing per-corner radius tokens, not by introducing a new per-corner token type.
- The radius and tracking scales take Tailwind v4's scales as their basis. The reference skin routes its most extreme values to the nearest stop (for example, its 1.75rem elbow to the roughly 1.5rem step, and its widest 0.18em tracking to the roughly 0.1em stop) rather than the scale extending to match them exactly; the skin still reads as intended and still reaches zero raw values. The exact stop count and values are finalized in planning, including the tight end a dense layout needs.
- The reference skin used to validate the outcome is the LCARS fixture introduced by the expressivity-audit spike this work stacks on. That spike (the audit harness and the fixture) is a dependency, and the audit is the instrument that measures SC-001.
- The token-schema-growth feature (spec 008) is the precedent for how new token categories and scales are added and validated.
- Out of scope for this feature: density and touch-target tokens (a separate axis), the additional reference skins that will exercise other axes such as texture and motion, and shipping the reference skin as a registered product identity. Each of those is its own effort.
