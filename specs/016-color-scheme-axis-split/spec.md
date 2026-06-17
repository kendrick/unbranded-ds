# Feature Specification: Color-scheme and theme axis split

**Feature Branch**: `016-color-scheme-axis-split`
**Created**: 2026-06-15
**Status**: Draft
**Input**: User description: "@docs/workshops/2026-06-15/spec-016-color-scheme-axis-split.md - color scheme (light/dark) and theme (aesthetic/brand) are the two axes this spec deals with; the model should accommodate future axes like high contrast and spacing additively"

## Overview

Today a single attribute (`data-theme`) holds `light`, `dark`, `brand`, and `vaporwave` as mutually exclusive values. That conflates two independent concerns: a **color scheme** (light or dark, with a system intent that follows the OS) and a **theme**, meaning the aesthetic identity (the default look, `brand`, `vaporwave`). Because they share one axis, "vaporwave in dark" cannot be expressed: a consumer gets vaporwave or dark, never both.

This feature splits them into two composable axes, color scheme and theme, sitting alongside the density axis that already exists. Any aesthetic identity then renders in any color scheme at any density. It also sets up the general pattern so future axes (high contrast, spacing, and the like) can be added additively later, without rebuilding what ships here.

A vocabulary note, because it bites: most people, and `next-themes`, use "theme" to mean light versus dark. Here, per the steer driving this spec, "theme" names the aesthetic identity and "color scheme" names light versus dark. The docs and the agent-facing mapping have to make that split unambiguous, or every reader trips on it.

## Clarifications

### Session 2026-06-15

- Q: Which data-\* attribute holds which axis, and how do consumers migrate? → A: `data-theme` becomes the theme (identity) axis, matching the vocabulary; color scheme moves to a new `data-color-scheme`. Current `data-theme="light"/"dark"` consumers migrate via a codemod, with the legacy form honored through a deprecation window.
- Q: How do the identities decompose into light and dark? → A: Hand-design a light and a dark variant for each identity (default, brand, vaporwave), no algorithmic derivation, so the AA-contrast bar is cleared reliably.
- Q: Does a control for the theme axis ship here? → A: Yes, a data-driven identity toggle mirroring the existing DensityToggle, alongside the re-pointed color-scheme control.
- Q: How do identity and color scheme combine in the tokens? → A: Each identity ships an explicit light and dark palette, selected by the `data-theme` plus `data-color-scheme` attribute pair (authored per combination), not composed from separate layers.
- Q: How do today's `data-theme` values map? → A: `light`/`dark` become the default identity in that scheme; `brand`/`vaporwave` keep their current palette as the scheme it most resembles (vaporwave as dark) with the opposite scheme newly designed, so the existing look is preserved.
- Q: What are the two controls named? → A: `ColorSchemeToggle` (the renamed light/system/dark control) and `ThemeToggle` (the new identity control, since theme now means identity).
- Q: How is the legacy form supported? → A: It is not. There are no external consumers yet, so this is a clean break: no deprecation window, runtime shim, or public codemod.
- Q: How does `useTheme` present the axes? → A: The axis-keyed shape (preference/resolved/set over colorScheme, theme, density) plus a top-level `colorScheme` convenience, with the next-themes mapping documented.
- Q: What does this spec update directly? → A: All in-repo consumers (the spec-015 example app, the Storybook stories, any other usage) move to the new axes in this change.

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Compose a color scheme with an aesthetic identity (Priority: P1)

A consumer applies the vaporwave identity and, independently, a dark color scheme, and gets vaporwave rendered dark. Switching the color scheme to light gives vaporwave rendered light, with the identity unchanged. The same holds for the default and brand identities, and the result composes with density.

**Why this priority**: This is the whole point. The conflated axis makes this impossible today, and every other story depends on the axes actually being separable.

**Independent Test**: Apply each shipped identity with each color scheme (and a density), and confirm the rendered palette is the correct identity-in-that-scheme, with no value from one axis leaking into the other.

**Acceptance Scenarios**:

1. **Given** the vaporwave identity, **When** the color scheme is set to dark, **Then** the page renders vaporwave in dark.
2. **Given** the vaporwave identity in dark, **When** the color scheme is switched to light, **Then** the page renders vaporwave in light and the identity does not change.
3. **Given** any identity and any color scheme, **When** a density is also applied, **Then** all three compose, with deterministic precedence on a token collision.

---

### User Story 2 - Separate controls for color scheme and identity (Priority: P2)

The color-scheme control switches light, system, and dark and follows the OS while on system, driving the color-scheme axis only. A separate identity control switches the aesthetic identity, driving the theme axis only. Operating one does not move the other.

**Why this priority**: The current control drives a light/dark subset of the conflated axis, which is the visible symptom of the problem. Once the axes split, the controls have to follow, or consumers cannot reach the new capability.

**Independent Test**: Operate the color-scheme control through light, system, and dark and confirm only the color scheme changes; operate the identity control and confirm only the identity changes; confirm system still follows the OS.

**Acceptance Scenarios**:

1. **Given** the brand identity, **When** the color-scheme control is set to dark, **Then** the scheme is dark and the identity stays brand.
2. **Given** the color-scheme control set to system, **When** the OS color scheme changes, **Then** the page follows, with the identity unchanged.
3. **Given** any color scheme, **When** the identity control switches identities, **Then** the identity changes and the color scheme stays put.

---

### User Story 3 - The repo's own consumers move to the new axes (Priority: P2)

There are no external consumers yet, so this is a clean cut. The example app (spec 015), the Storybook stories, and any other in-repo usage move to the split axes in the same change, so `main` is never left rendering the old conflated model, and the new capability is demonstrated where people already look.

**Why this priority**: Shipping the axis split without updating the repo's own consumers would strand the example app and the stories on a model that no longer exists. Keeping them consistent in the same change is what makes the cut clean.

**Independent Test**: After the change, confirm the example app and every story render on the new axes (`data-color-scheme` plus `data-theme` identity plus the renamed controls), and that no in-repo file still applies light or dark through `data-theme`.

**Acceptance Scenarios**:

1. **Given** the spec-015 example app, **When** it renders after this change, **Then** it uses `data-color-scheme` for light/dark, `data-theme` for identity, and `ColorSchemeToggle` plus `ThemeToggle`.
2. **Given** the repo, **When** it is searched for the old conflated usage, **Then** no story or source file applies light or dark through `data-theme`.

---

### User Story 4 - The axis model is extensible (Priority: P3)

A future axis (high contrast, spacing, or another preference) can be added additively: a new attribute, its theme values, and an optional control, with no edit to the existing axes or the resolver's handling of them, and no break for consumers. This spec builds the color-scheme and theme axes and leaves a documented seam for the rest.

**Why this priority**: The steer is explicit that other axes are coming. Designing the split as a general axis model rather than a one-off keeps the next addition cheap, but it is the lowest priority because the headline value lands without it.

**Independent Test**: Follow the documented extension steps for a hypothetical axis and confirm they are purely additive (no change to existing axis files or the existing axes' resolution), and that omitting the new axis leaves everything unchanged.

**Acceptance Scenarios**:

1. **Given** the shipped axis model, **When** a new axis is added per the documented steps, **Then** only additive changes are required and the existing axes are untouched.
2. **Given** a consumer who does not adopt the new axis, **When** they upgrade, **Then** nothing about their existing axes changes.

---

### Edge Cases

- A future identity ships only one color scheme: the missing scheme MUST resolve to a defined, legible fallback rather than a broken palette, and the gap MUST be documented. (Every identity shipped here has both, per FR-004.)
- The example app currently applies `data-theme="vaporwave"`: it moves to `data-theme="vaporwave"` (identity) plus `data-color-scheme="dark"` (vaporwave's natural scheme), with no visual change.
- The color scheme is `system` and an identity is active: the OS resolves the scheme, and the identity stays orthogonal.
- A shipped identity-by-color-scheme combination fails WCAG AA contrast (the muted-foreground pair surfaced by spec 015 is the known offender): it must fail loudly before release, not ship.

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: Color scheme MUST be its own axis, with the values `light` and `dark` and a `system` intent that resolves to one of them from the OS.
- **FR-002**: The theme (aesthetic identity) axis MUST hold identity values only (`default`, `brand`, `vaporwave`, and future identities) and MUST no longer carry light or dark.
- **FR-003**: Color scheme, theme, and density MUST compose, so any identity renders in any color scheme at any density. Each identity-and-color-scheme pair is an explicitly authored palette, selected by the `data-theme` and `data-color-scheme` attribute pair; density then refines it through the existing cascade (spec 014), with deterministic precedence on a token collision.
- **FR-004**: Each shipped aesthetic identity (default, brand, vaporwave) MUST ship a hand-designed light variant and a hand-designed dark variant, with no algorithmic derivation. For an identity that exists today as a single palette, that palette is kept as the color scheme it already is and the opposite scheme is newly designed, so the current look survives the split: brand's current palette is light-backgrounded, so it becomes `brand-light` (and `brand-dark` is new); vaporwave's becomes `vaporwave-dark` (and `vaporwave-light` is new). Today's `light` and `dark` become the default identity's two schemes.
- **FR-005**: Every shipped identity-by-color-scheme combination MUST pass WCAG AA contrast for the declared pairs, and the validator MUST extend to the pairs that currently slip through (the muted-foreground/background pair surfaced by spec 015). A failing combination MUST fail loudly before release.
- **FR-006**: The first-paint bootstrap MUST apply every active axis (color scheme, theme, density) before paint with no flash, including resolving the `system` color scheme.
- **FR-007**: The color-scheme control (the existing light/system/dark control, renamed `ColorSchemeToggle`) MUST drive the color-scheme axis via `data-color-scheme`. A separate, data-driven control for the theme axis is provided (FR-013).
- **FR-008**: The theme (identity) axis MUST be applied via `data-theme`, and the color-scheme axis via a new `data-color-scheme` attribute. `data-theme` no longer carries `light` or `dark`; those move to `data-color-scheme`.
- **FR-009**: This change MUST move every in-repo consumer (the spec-015 example app, the Storybook stories, and any other usage) to the new axes in the same change, so `main` never renders the old conflated model. There are no external consumers, so there is no deprecation window, runtime shim, or public codemod.
- **FR-010**: The axis model MUST be extensible so a future axis (high contrast, spacing, or another) can be added with only additive changes (a new attribute, its values, an optional control), with no edit to existing axes or the resolver's handling of them. This spec establishes the pattern and builds only the color-scheme and theme axes.
- **FR-011**: Each axis's preference MUST persist under its own storage key (`data-theme`/identity reuses the existing theme key; color scheme gets a new key plus a companion for the `system` intent; density is unchanged). No migration of previously stored values is required, since there are no consumers with saved state to preserve.
- **FR-012**: `useTheme` MUST keep its axis-keyed shape (preference/resolved/set over color scheme, theme, density) and MUST add a top-level `colorScheme` convenience (get and set), since color scheme is the axis consumers reach for most. The agent-facing and human-facing surfaces (`useTheme`, the `next-themes` mapping, sidecars, AGENTS.md) MUST stay legible for both audiences (Constitution XI) and MUST document the mapping explicitly: `resolvedTheme` to `colorScheme.resolved`, `systemTheme` to `colorScheme.system`, and `theme` to the identity axis, so a reader knows color scheme means light/dark and theme means identity.
- **FR-013**: A control for the theme (identity) axis MUST ship as a data-driven component named `ThemeToggle` (theme now means identity), mirroring the existing DensityToggle with its values coming from the registered identities. The existing light/dark `ThemeToggle` is renamed `ColorSchemeToggle` (FR-007), so the `ThemeToggle` name is reused for the identity control; in-repo usage is updated accordingly (FR-009).

### Key Entities

- **Axis**: a named dimension of theming. Each axis has an attribute, a set of allowed values, an independent stored preference, and an optional control. The shipped axes are color scheme, theme, and density; the model admits more.
- **Color scheme**: the axis holding `light`, `dark`, and the `system` intent.
- **Theme (aesthetic identity)**: the axis holding `default`, `brand`, `vaporwave`, and future identities.
- **Density**: the existing axis (`comfortable`, `compact`), unchanged here.
- **Resolved theme**: the composition of the active value on each axis, produced by the cascade.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: A consumer can render every shipped aesthetic identity in both light and dark, confirmed by applying each identity in each color scheme and seeing the correct palette.
- **SC-002**: Vaporwave-dark and vaporwave-light both exist as the headline proof, and both pass WCAG AA contrast.
- **SC-003**: After this change, no in-repo file (the example app, the Storybook stories, or package source) applies light or dark through `data-theme`; the example app and every story run on the new axes.
- **SC-004**: The color-scheme control switches light, system, and dark independently of the active identity, and `system` follows the OS.
- **SC-005**: Every shipped identity-by-color-scheme combination passes WCAG AA for the declared pairs, including the muted pair that previously slipped through, and a deliberately broken combination is caught before release.
- **SC-006**: Adding a new axis later requires only additive changes, demonstrated by following the documented extension steps without editing any existing axis or the existing axes' resolution.
- **SC-007**: A reader, human or agent, can determine from the docs and the vocabulary mapping what color scheme and theme each mean and how they compose, without reading source.

## Assumptions

- "Theme" names the aesthetic-identity axis and "color scheme" names light versus dark, per the steer driving this spec. The vocabulary section makes the `next-themes` tension explicit rather than hoping no one notices it.
- Density already exists as its own axis and is unchanged here; "spacing" as a future axis overlaps it, so the clearest near-term future axis is high contrast.
- Other axes (high contrast, spacing) are out of scope to build; this spec establishes the extensible pattern and a documented seam, and ships only the color-scheme and theme axes.
- There are no external consumers yet, so this is a clean break: no deprecation window, runtime shim, or public codemod. The repo's own consumers (the example app, the stories) are updated directly in this change.
- This spec extends the existing resolution and cascade (spec 014) rather than replacing it, and reuses the existing density axis and `useTheme` axis-agnostic shape (spec 011).

## Out of Scope

- Building axes beyond color scheme and theme (high contrast, spacing, and others). Only the extensible seam is established.
- New aesthetic identities beyond `default`, `brand`, and `vaporwave`. The palette set is unchanged; this splits the axis, it does not grow the identities.
- Replacing `next-themes` or its vocabulary; this aligns to it and documents where the names diverge.
- A public migration codemod and a deprecation window. With no external consumers, the cut is clean and the repo's own usage is updated directly.
