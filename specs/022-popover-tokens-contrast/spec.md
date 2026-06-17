# Feature Specification: Popover tokens and the Dialog description contrast fix

**Feature Branch**: `022-popover-tokens-contrast`  
**Created**: 2026-06-17  
**Status**: Draft  
**Input**: User description: "@docs/workshops/2026-06-16/spec-022-popover-tokens-and-dialog-contrast.md"

## Clarifications

### Session 2026-06-17

- Q: How should the popover surface be defined — a new canonical token, repointing to an existing surface, or a preset alias? → A: Add a canonical `color.popover` + `color.popover-foreground` token pair to the schema, authored per theme cell (light/dark × default/brand/vaporwave). The components keep referencing the popover surface unchanged; the gap is closed in the token set.
- Q: What value should the popover surface take — flat (equal to `background`) or a distinct elevated surface? → A: Flat. `color.popover` takes each theme's `background` value and `color.popover-foreground` takes `foreground`; elevation stays visual via ring and shadow. Because `muted-foreground` on `background` is already a validated AA-passing pair, the Dialog description passes with no `muted-foreground` change.
- Q: Which popover contrast pairs should the token validation suite guard? → A: Both `popover-foreground` / `popover` and `muted-foreground` / `popover`, mirroring the two-pair coverage the base `background` already has, so a future identity that diverges `popover` from `background` cannot silently ship an inaccessible surface.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Popover surfaces have a real, opaque background (Priority: P1)

The Dialog, Tooltip, and Select content surfaces all ask for a "popover" background and foreground color, but the design system never defines that color pair. So those surfaces have no opaque fill of their own: a dialog panel is measured against whatever shows through it rather than against a solid color. This story gives the popover surface a real, defined, opaque background and a matching foreground, so every component built on it sits on a solid color instead of a gap.

**Why this priority**: This is the root cause. With no opaque popover background, the accessibility gate measures dialog text against bleed-through, which is both the likely source of the contrast failure and a real visual defect on its own. Fixing the surface is the foundation everything else builds on, and on the brief's own hypothesis it may resolve the contrast failure outright.

**Independent Test**: Open a Dialog, a Tooltip, and a Select menu. Confirm each content surface resolves to a concrete, fully opaque background color (nothing behind the surface shows through) and a defined text color, in the default light theme.

**Acceptance Scenarios**:

1. **Given** an open Dialog, Tooltip, or Select menu, **When** its content surface renders, **Then** the surface has a defined, fully opaque background color and a defined foreground color rather than a missing or transparent one.
2. **Given** the popover surface is defined, **When** a dialog panel overlaps page content, **Then** none of the page content behind the panel is visible through it.

---

### User Story 2 - Dialog description text meets WCAG AA (Priority: P1)

A person reading an open dialog sees its description text. Today that text uses the muted-foreground color and fails WCAG AA contrast against the surface it resolves to (measured at 3.98:1, below the 4.5:1 floor for normal text). This story makes the description text, and any muted text on a popover surface, meet AA against that surface so it is legible.

**Why this priority**: This is the headline accessibility defect the gate caught. Illegible description text is a real barrier for low-vision users, and it is the failure that forced the quarantine. It is P1 alongside Story 1 because the two together are the accessible-dialog outcome. With the popover surface set to the base `background` value (clarified 2026-06-17), the description passes via the already-validated `muted-foreground` / `background` pair, so this story is verification: confirm the description clears AA and that no muted text on a popover surface regresses.

**Independent Test**: Open a dialog with a description and run the contrast check. Confirm the description text measures at least 4.5:1 against the popover surface in the default light theme.

**Acceptance Scenarios**:

1. **Given** an open dialog with a description, **When** contrast is measured, **Then** the description text meets at least 4.5:1 against the popover surface (3:1 if the text qualifies as large).
2. **Given** any muted text rendered on a popover surface, **When** contrast is measured, **Then** it meets the WCAG AA threshold for its size.
3. **Given** the popover surface equals the base `background` value, **When** the Dialog description renders, **Then** it clears AA through the existing `muted-foreground` / `background` relationship with no change to the `muted-foreground` value.

---

### User Story 3 - The fix holds across the whole theme matrix (Priority: P2)

The design system ships multiple color schemes (light, dark), multiple identities (default, brand, vaporwave), and multiple densities. A contrast fix that passes only in the default light theme is not actually fixed. This story validates the popover surface and its on-surface text across every shipped combination, the way the existing token-level contrast checks guard other pairs, so the dialog is accessible in dark and in the brand and vaporwave identities too.

**Why this priority**: The default light theme is one cell of a larger grid. Dark schemes and alternate identities ship their own palettes and routinely fail where light passes. Without matrix coverage the fix is unverified for most of what users actually see, but it sits below the P1 stories because the core correction must exist before it can be validated everywhere.

**Independent Test**: Run the token-level contrast validation across every color-scheme, identity, and density combination. Confirm the popover surface pair and the on-surface muted-text pair pass in all of them, including dark, brand, and vaporwave.

**Acceptance Scenarios**:

1. **Given** the corrected popover surface and on-surface text colors, **When** they are validated across every shipped color-scheme, identity, and density combination, **Then** all combinations meet WCAG AA with none failing.
2. **Given** a new or changed color pair, **When** the automated token-level contrast suite runs, **Then** it covers the popover pair so a future regression in any theme fails loudly.

---

### User Story 4 - The accessibility quarantine is removed (Priority: P3)

Spec 020 had to quarantine the `color-contrast` rule on two Dialog stories to ship, pointing the suppression comments at this work. This story removes that quarantine and confirms the accessibility gate passes for those stories on its own merits, with no accessibility rules disabled.

**Why this priority**: Removing the quarantine is the visible "done" signal and restores full gate enforcement on the affected stories. It is genuinely valuable but strictly downstream: it can only happen once the contrast actually passes, so it sits last.

**Independent Test**: Remove the `color-contrast` suppression from the two affected Dialog stories and run the accessibility gate. Confirm both pass with no rules disabled.

**Acceptance Scenarios**:

1. **Given** the contrast fix is in place, **When** the `color-contrast` quarantine is removed from the two affected Dialog stories, **Then** the accessibility gate passes for both with no accessibility rules disabled.
2. **Given** the quarantine is gone, **When** the full accessibility gate runs, **Then** no popover-surface contrast violation is reported on any Dialog, Tooltip, or Select story.

---

### Edge Cases

- **Dark scheme**: dark themes often invert which pairs pass. The popover surface and its muted text must meet AA in dark, not only light, and the surface must stay fully opaque there.
- **Alternate identities**: the brand and vaporwave identities ship their own authored palettes. Each must carry a valid popover surface pair, or theme validation must flag a missing or out-of-AA pair loudly rather than silently shipping an inaccessible surface.
- **No shared-token change**: the fix sets the popover pair to each theme's existing `background` / `foreground` values and changes no shared color, so it cannot regress an existing pair. The matrix validation still re-runs every pair to confirm this rather than assuming it.
- **Surfaces beyond Dialog**: Tooltip and Select content use the same popover surface. They must remain accessible after the change even though only the Dialog stories were quarantined; the fix must not improve Dialog at their expense.
- **Consumer themes**: if the popover surface becomes a token the schema requires, a consumer-authored theme that omits it must fail validation loudly, consistent with how the design system already validates declared contrast pairs, rather than rendering a transparent or inaccessible surface.
- **Large vs normal text**: the AA threshold is 4.5:1 for normal text and 3:1 for large text. The description is normal text and must clear 4.5:1; the validation must apply the right threshold per text role.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The popover surface used by the Dialog, Tooltip, and Select content components MUST resolve to a defined, fully opaque background color. No content behind the surface may show through it.
- **FR-002**: The popover surface MUST have a defined foreground (text) color paired with that background.
- **FR-003**: Text rendered on the popover surface — including the Dialog description that currently uses the muted-foreground color — MUST meet WCAG AA contrast against that surface: at least 4.5:1 for normal text and at least 3:1 for large text.
- **FR-004**: The automated token-level contrast suite MUST add and validate two popover pairs — `popover-foreground` / `popover` and `muted-foreground` / `popover` — across every shipped combination of color scheme, identity, and density, mirroring the two-pair coverage the base `background` already has. Every combination MUST meet WCAG AA.
- **FR-005**: The fix MUST NOT change `muted-foreground` or any other shared color value. It defines `color.popover` equal to each theme's `background` and `color.popover-foreground` equal to `foreground`, so the Dialog description passes through the existing `muted-foreground` / `background` relationship, and no text-on-background pair the design system already validates may regress.
- **FR-006**: The `color-contrast` accessibility quarantine on the two affected Dialog stories MUST be removed, and the accessibility gate MUST pass for those stories with no accessibility rules disabled.
- **FR-007**: The change MUST NOT alter the public API or rendered structure of the Dialog, Tooltip, or Select components. This is a token and styling correction, and the components continue to consume the popover surface the same way.
- **FR-008**: The popover surface ships as a new canonical token pair (`color.popover` + `color.popover-foreground`) in the schema, authored per theme cell. Theme validation MUST cover the popover pairs so a theme that omits them or declares them below AA fails validation loudly rather than shipping silently.

### Key Entities

- **Popover surface**: the shared background-plus-foreground color pair that Dialog content, Tooltip content, and Select content render themselves on. Today the components reference it but the design system does not define it. This feature defines it as a new canonical token pair (`color.popover` + `color.popover-foreground`) in the schema, authored per theme cell.
- **Muted-text-on-popover pair**: the combination of the muted-foreground text color and the popover background that the Dialog description renders. This is the pair that fails AA today and must pass after the fix.
- **Theme matrix**: the full grid of shipped color-scheme, identity, and density combinations against which the corrected pairs must be validated. Light/default is one cell; dark, brand, and vaporwave are the cells most likely to expose a regression.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: The Dialog description text, and any muted text on a popover surface, meets WCAG AA contrast (at least 4.5:1 for normal text) against its surface in every shipped theme combination.
- **SC-002**: The Dialog, Tooltip, and Select content surfaces each render fully opaque, with none of the content behind them visible through the surface.
- **SC-003**: 100% of the shipped color-scheme, identity, and density combinations pass the popover surface and on-surface text contrast check, with zero failing combinations.
- **SC-004**: The two previously quarantined Dialog stories pass the accessibility gate with zero accessibility rules disabled.
- **SC-005**: No text-on-background pair that passed before this change regresses below WCAG AA — the full token contrast validation stays green.

## Assumptions

- The popover surface is defined as a new canonical token pair (`color.popover` + `color.popover-foreground`) in the token schema, authored per color scheme and identity, rather than repointing the components to an existing surface token (clarified 2026-06-17). The components keep referencing the popover surface unchanged; the gap is closed in the token set.
- The contrast fix follows the precedent set when the destructive Button pair was corrected: define or adjust the token values, then validate the affected pairs across the theme matrix with an automated check, rather than hand-tuning a single story.
- Defining the opaque popover surface as each theme's `background` value resolves the contrast failure with no `muted-foreground` change (clarified 2026-06-17). The description's `muted-foreground` text then resolves to the already-validated `muted-foreground` / `background` pair, which clears AA in every shipped cell. The failure today is purely that the surface is transparent, so the muted text is measured against the overlay bleed-through rather than the base surface.
- The change is confined to design tokens and the styling those tokens drive. No component public API, prop, or structural change is in scope.
- Verification reuses the existing automated accessibility gate on stories and the existing token-level contrast validation across the theme matrix. No new test infrastructure is assumed.

## Dependencies

- Depends on spec 020 (the test-runner layer-order fix that made token styling resolve in the gate, which is what surfaced this failure). Without it the gate measures unstyled components and the defect stays hidden.
- Follows the model of spec 018 (the destructive-Button AA contrast fix) for correcting a token-driven contrast pair and validating it across the theme matrix.
- Blocks removal of the `color-contrast` quarantine that spec 020 added to the two affected Dialog stories.
