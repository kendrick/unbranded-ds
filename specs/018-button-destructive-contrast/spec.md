# Feature Specification: Accessible destructive Button across every theme

**Feature Branch**: `018-button-destructive-contrast`
**Created**: 2026-06-16
**Status**: Draft
**Input**: User description: "@docs/workshops/2026-06-16/spec-018-button-destructive-contrast.md"

## Clarifications

### Session 2026-06-16

- Q: How should the destructive Button meet AA while staying recognizably destructive? → A: A soft tint backed by dedicated tokens — a destructive-subtle surface token and a darker destructive text token, authored per cell so each clears 4.5:1, rather than switching to a solid fill or merely retuning the current alpha tint.
- Q: Which theme cells must the destructive Button pass AA in? → A: All six shipped cells (default / brand / vaporwave × light / dark), joining the spec-016 per-cell AA matrix.
- Q: On which surfaces must the destructive Button hold AA? → A: Any standard design-system surface — the page background and card/muted surfaces — so the treatment is surface-independent, not reliant on a translucent tint that shifts over whatever sits behind it.
- Q: Should the new destructive-subtle token pair be canonical reusable tokens or Button-private? → A: Canonical and reusable — a destructive-subtle surface token plus its foreground, provided by every theme like muted/muted-foreground, so future components reuse the same AA-guaranteed pair.

## User Scenarios & Testing _(mandatory)_

### User Story 1 - A legible destructive button in any theme (Priority: P1)

A person using a product built on the design system encounters a destructive action (Delete, Remove, Discard) rendered with the Button's `destructive` style. In the light color scheme today, that button shows the destructive red as text on a pale red tint at about 4.1:1 — below the WCAG AA threshold, so low-vision and many sighted users struggle to read it. After this change the destructive button is legible at AA in every shipped theme: light and dark, across the default, brand, and vaporwave identities.

**Why this priority**: This is the accessibility defect the spec exists to fix. A core interactive control that fails AA is a merge-blocking issue under the project's accessibility commitment, and destructive actions are exactly the ones a user must read clearly before acting.

**Independent Test**: Render the `destructive` Button in each of the six identity-by-color-scheme combinations and measure the contrast between its label (and icon) and its background. Every combination meets at least 4.5:1 for the normal-size text. Delivers a legible destructive control on its own, with no other change required.

**Acceptance Scenarios**:

1. **Given** the light color scheme with the default identity, **When** a destructive Button renders, **Then** its text-to-background contrast is at least 4.5:1.
2. **Given** any shipped identity (default, brand, vaporwave) in either color scheme, **When** a destructive Button renders, **Then** its text-to-background contrast is at least 4.5:1.
3. **Given** a destructive Button, **When** it is hovered or focused, **Then** the label stays at least 4.5:1 against the hover or focus background.
4. **Given** a destructive Button beside the other variants, **When** a user scans the row, **Then** the destructive action still reads as destructive rather than as a neutral or default button.

---

### User Story 2 - The design system catches a sub-AA destructive treatment automatically (Priority: P2)

A contributor changes a palette, a token, or the destructive Button's styling. If that change drops the destructive treatment below AA, the build fails with a clear contrast error, the same way the other declared foreground/background pairs are guarded. The gap that hid this defect — the validator checked the solid `destructive-foreground` on `destructive` pairing the button never actually uses — is closed.

**Why this priority**: Without a guard, the fix decays. The defect survived two specs precisely because no automated check covered the destructive text-on-surface relationship. This makes the fix durable rather than a one-time patch.

**Independent Test**: Introduce a deliberately failing destructive value in a theme, run the token validation, and confirm the build reports a structured contrast failure naming the offending pair and cell. Revert and confirm the build passes.

**Acceptance Scenarios**:

1. **Given** the token validator, **When** it runs over the shipped themes, **Then** it checks the destructive button's text-on-surface contrast pair in addition to the existing pairs.
2. **Given** a theme whose destructive treatment would render below AA, **When** the validator runs, **Then** it fails with a structured issue identifying the pair and the theme.

---

### User Story 3 - The example app demonstrates a fully styled light mode (Priority: P3)

The reference Next.js app currently leaves its light color scheme on the file-less base (it does not load the light design-system tokens) specifically to avoid rendering the failing destructive button. Once the destructive treatment passes AA, the example loads the light scheme like any other, so its default-light view is fully design-system-styled and its accessibility scan stays clean.

**Why this priority**: It closes the workaround spec 016 left behind and proves the fix end to end in a real consumer, but it depends on US1 and US2 landing first and carries no user-facing value on its own.

**Independent Test**: With the light scheme loaded in the example app, run the accessibility scan on its primary views; it reports zero serious or critical violations, and the destructive button on the home page passes contrast.

**Acceptance Scenarios**:

1. **Given** the example app with the light scheme active, **When** its primary views are scanned for accessibility, **Then** there are no serious or critical contrast violations.

---

### Edge Cases

- **Hover and focus states**: the destructive button darkens its background on hover and shows a focus ring; the label must stay AA against those states too, not only the resting background.
- **Disabled destructive button**: a disabled control is exempt from the AA contrast requirement under WCAG, so the dimmed disabled state is out of scope and must not be forced to meet 4.5:1.
- **Destructive text on a non-default surface**: if the button sits on a colored card rather than the page background, the soft treatment should still hold AA, or the guarding pair must reflect the surface the button actually paints on.
- **Icon-only destructive button**: a destructive button with only an icon and no text must also meet AA for the icon against its background.
- **A future identity or color scheme**: any newly added theme cell inherits the same AA requirement for the destructive button automatically.

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: The destructive Button MUST meet WCAG AA contrast (at least 4.5:1 for normal-size text and any meaningful icon) between its label and its background, in every shipped identity-by-color-scheme combination.
- **FR-002**: The destructive Button MUST keep a tinted destructive treatment — a subtle destructive-colored surface with destructive-colored text, not a solid fill — so it stays consistent with the design system's restrained variant set while still reading as destructive rather than as the default or neutral variants.
- **FR-003**: The hover and focus states of the destructive Button MUST also meet AA between the label and the state's background.
- **FR-004**: The destructive treatment MUST be backed by a canonical, reusable token pair — a destructive-subtle surface and its foreground — that every theme provides (mirroring `muted` / `muted-foreground`), defaulted in the canonical baseline so a theme that omits it still resolves. This is a deliberate addition to the locked canonical schema (Constitution Section III).
- **FR-005**: The destructive treatment MUST be surface-independent: it MUST meet AA on every standard design-system surface the button can sit on — the page background and card/muted surfaces — not only the base background.
- **FR-006**: The token validation MUST check the destructive-subtle surface against its foreground (the pair the button actually renders), closing the gap where only the unused solid `destructive-foreground` / `destructive` pairing was checked.
- **FR-007**: The new contrast guard MUST be validated across all six shipped identity-by-color-scheme cells, joining the per-cell AA matrix rather than checking the default cell alone.
- **FR-008**: A theme or token change that would drop the destructive treatment below AA MUST fail the build with a structured contrast issue that names the pair and the affected theme.
- **FR-009**: The example app MUST render its default light view with design-system tokens and pass its accessibility scan with no serious or critical violations.
- **FR-010**: The change MUST NOT weaken any existing guarantee: the solid `destructive` / `destructive-foreground` relationship stays valid for solid destructive usage, and no other variant's contrast regresses.
- **FR-011**: The change MUST ship with a changeset declaring the affected packages and bump levels, per the repository's versioning policy.

### Key Entities _(include if feature involves data)_

- **Destructive-subtle token pair**: a canonical, reusable pair every theme provides — a subtle destructive surface and its foreground — that the destructive Button paints with, authored per cell so each clears AA. Mirrors `muted` / `muted-foreground` and is available to any future component that needs destructive content on a quiet surface.
- **Contrast pair (destructive)**: the declared foreground/background relationship the validator checks against AA — the destructive-subtle surface against its foreground — added so the destructive button's real rendered pairing is guarded for every shipped theme cell.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: The destructive Button passes automated WCAG AA contrast checks in 100% of shipped theme combinations, up from failing in the three light cells at roughly 4.1:1 today.
- **SC-002**: An accessibility scan of the example app's primary views reports zero serious or critical contrast violations with the light scheme loaded.
- **SC-003**: A deliberately introduced sub-AA destructive value is caught by the build, so no such regression can reach a release undetected.
- **SC-004**: In a design review across the shipped themes, the destructive Button still reads as a destructive action in every combination, distinct from the default and neutral variants.

## Assumptions

- The destructive base color may stay as it is; the defect is the variant's use of that color as text on a pale tint, so the fix is contained to the variant and the new destructive-subtle token pair, without re-theming.
- There are no external consumers yet, so introducing the destructive-subtle token pair is a clean change coordinated through a changeset, with no migration window required.
- Disabled destructive buttons follow WCAG's exemption for inactive controls and are out of scope for the AA requirement.
- The dark color scheme's destructive button already meets AA and must be preserved, not regressed, by the fix.
- The exact subtle-surface realization (an opaque subtle token versus a translucent tint validated to pass on every standard surface) and the hover/focus token derivation are planning details, bounded by FR-005's surface-independence requirement.
