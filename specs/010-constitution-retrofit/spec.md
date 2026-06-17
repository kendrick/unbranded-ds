# Feature Specification: Constitution-driven retrofit (Part A — token consumption)

**Feature Branch**: `010-constitution-retrofit`
**Created**: 2026-06-11
**Status**: Draft
**Input**: User description: "Constitution-driven retrofit Part A: consume the spec 008 motion, ring, and z-index tokens in component source, replacing hardcoded ring-3, z-50, and transition values, and fix the nested-overlay stacking order." (brief at `docs/workshops/2026-06-11/spec-010-constitution-retrofit.md`)

## Background

Spec 008 introduced three token groups but deliberately stopped at the tokens-package boundary: it shipped `ring.width`, an ordered `z-index` scale, and a `motion` category (durations and easings), and left the component-source consumption to spec 010. This spec is that consumption pass. Components currently hardcode the values those tokens now name: a `ring-3` focus ring repeated 14 times, a `z-50` stacking layer shared by the overlay components, and Tailwind built-in timings on the overlay open/close animations.

Swapping each onto its token makes the value themeable (a consumer who overrides `ring.width` or a motion duration now sees components respond) and puts the timing, focus, and layering surface under design-system control. One of the swaps also fixes a live bug: the overlay components all stack at `z-50`, so a tooltip opened inside a dialog has no defined order over it. The ordered z-index scale gives nested overlays a defined stacking order.

This spec is **Part A only**. The breaking API and vocabulary harmonization that specs 005, 006, and 007 deferred (prop and slot renames per Section XI.2) is **Part B, split to spec 013**. Part A is non-breaking; it adds one optional `z-index.max` token to `@unbranded-ds/tokens` (a minor bump) for the SkipLink layer, and ships the component swaps as a `@unbranded-ds/react` patch with no consumer migration.

## Clarifications

### Session 2026-06-11

- Q: The `z-index` scale has three stops (overlay/popover/tooltip) but four components hardcode `z-50`. Which stop should SkipLink use? → A: Exclude SkipLink from the scale swap. It is a focus-revealed bypass-block link, not part of the overlay-nesting family; its standalone `focus-visible:z-50` is retained. The swap applies to Dialog (overlay), Select (popover), and Tooltip (tooltip).
- Q: How broad is the motion-token swap, given the codebase mixes overlay enter/exit animations with ubiquitous micro-transitions? → A: Overlay enter/exit only. The open/close animations on Tooltip, Dialog, and Select move onto the motion tokens; the micro-transitions on interactive components (hover, focus, active via `transition-all`/`transition-colors`) keep their current inline timings and are out of scope.
- Revised during implementation: SkipLink is no longer excluded from the z-index work (reversing Q1). A new `z-index.max` token (9999) was added to `@unbranded-ds/tokens` and SkipLink's `focus-visible:z-50` now reads it, so a focused skip link sits above every overlay and no hardcoded z-index remains anywhere. This makes the spec a two-package release (`@unbranded-ds/tokens` minor + `@unbranded-ds/react` patch).

Two items confirmed against the codebase rather than asked:

- The `z-index` scale stops shipped by spec 008 are overlay (50), popover (55), tooltip (60). Dialog maps to overlay, Select to popover, Tooltip to tooltip.
- Default token values match the hardcoded values they replace (`ring.width` is 3px, the value `ring-3` resolves to), so the swap is visually identical at the default and only the nested-overlay stacking order changes.

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Nested overlays stack correctly (Priority: P1) 🎯 MVP

A user opens a tooltip on a control inside an open dialog. The tooltip renders above the dialog, not behind or tangled with it. More broadly, the three overlay-family components (Dialog, Select, Tooltip) read their layer from the ordered `z-index` scale instead of all sitting at the same `z-50`, so any nesting of overlays has a defined order. SkipLink, a focus-revealed bypass link, reads a new `z-index.max` token (9999) so a focused skip link sits above every overlay.

**Why this priority**: This is the highest-value half of the retrofit because it fixes a live bug. The same-layer `z-50` collision is a real defect sitting in `main` today, reachable the moment a consumer puts a tooltip inside a dialog. Fixing it also delivers the themeable-layering benefit as a side effect.

**Independent Test**: Render a tooltip trigger inside an open dialog, activate the tooltip, and confirm it paints above the dialog surface. Grep component source and confirm no portal component hardcodes `z-50`.

**Acceptance Scenarios**:

1. **Given** a tooltip trigger inside an open dialog, **When** the tooltip opens, **Then** it renders above the dialog overlay and content.
2. **Given** the three overlay-family components (Dialog, Select, Tooltip), **When** their source is inspected, **Then** each reads its stacking layer from the spec 008 `z-index` scale (Dialog→overlay, Select→popover, Tooltip→tooltip) rather than a hardcoded `z-50`.
3. **Given** a consumer theme that overrides a `z-index` scale stop, **When** the component renders, **Then** the overridden layer value takes effect.

---

### User Story 2 - Animated primitives use the design-system motion tokens (Priority: P2)

A component author (and a consumer theming motion) sees the overlay components animate at the design system's timing and curve. The open and close transitions on Tooltip, Dialog, and Select read the `motion` durations and easings instead of Tailwind's built-in timing utilities. The micro-transitions on interactive components (hover, focus, and active state changes) keep their current inline timings and are out of scope.

**Why this priority**: It puts the overlay animation timing under design-system control, so motion is consistent across overlays and a consumer can retune it through tokens. It is a smaller user-visible change than the bug fix, and it depends on nothing in US1.

**Independent Test**: Inspect the overlay components (Tooltip, Dialog, Select) and confirm their open/close transitions reference the `motion` tokens (a token easing and a duration via the token variable) rather than hardcoded timings. Confirm the open and close interactions still pass.

**Acceptance Scenarios**:

1. **Given** the overlay components (Tooltip, Dialog, Select), **When** their open/close transitions are inspected, **Then** timing and easing reference the spec 008 `motion` tokens.
2. **Given** a consumer theme that overrides a motion duration, **When** an overlay opens or closes, **Then** it runs at the overridden duration.
3. **Given** the existing interaction tests, **When** they run, **Then** the open, close, and toggle behaviors still pass.

---

### User Story 3 - Focus-ring width comes from a token (Priority: P3)

Every component's focus-visible ring reads its width from the `ring.width` token instead of a hardcoded `ring-3`. A consumer who wants thicker focus rings for an accessibility preference can set the token once and have every component follow.

**Why this priority**: It is the most mechanical swap (14 identical usages) and the lowest user-visible change, since the default matches today's appearance. It earns its place by making focus-ring thickness themeable, but it carries no urgency.

**Independent Test**: Grep component source for `ring-3` and confirm none remain. Confirm focus rings render identically at the default token value, and that overriding `ring.width` changes the rendered ring thickness.

**Acceptance Scenarios**:

1. **Given** the component source, **When** it is grepped for the hardcoded `ring-3`, **Then** none remain; every focus ring reads `ring.width`.
2. **Given** the default token value, **When** a component receives focus, **Then** the ring renders identically to today (3px).
3. **Given** a consumer theme that overrides `ring.width`, **When** a component receives focus, **Then** the ring renders at the overridden width.

---

### Edge Cases

- **A component with no transition, ring, or portal layer**: untouched. The retrofit only edits components that hold one of the three hardcoded values.
- **A consumer who relied on the literal `z-50`**: the value was an internal implementation detail, never a public API. The scale's overlay stop resolves to a compatible base value, so a standalone (non-nested) overlay renders at the same depth.
- **Motion timing differs from the old built-in**: where an overlay's open/close used a Tailwind duration that differs from the token duration, its animation speed changes to the design-system timing. This is intended (the point is DS-controlled timing), not a regression. Interaction tests assert behavior, not exact duration.
- **`ring-1` is not `ring-3`**: the hairline `ring-1` rings on cards and popovers are a border treatment, a different concern from the focus-ring width. Only `ring-3` (the focus ring, 14 sites) maps to `ring.width`; `ring-1` is left as-is.
- **Reduced motion**: any existing `prefers-reduced-motion` handling stays intact; the token swap changes which duration value is referenced, not whether reduced-motion short-circuits it.

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: The overlay components MUST read their stacking layer from the `z-index` scale: Dialog from `overlay`, Select from `popover`, Tooltip from `tooltip`. SkipLink's focus-revealed layer MUST read a new `z-index.max` token (9999) added to `@unbranded-ds/tokens`, so a focused skip link sits above every overlay. No component source may hardcode `z-50`.
- **FR-002**: A tooltip rendered inside an open dialog MUST stack above the dialog. Nested overlays MUST have a defined order derived from the scale.
- **FR-003**: The open and close (enter/exit) animations on the overlay components — Tooltip, Dialog, Select — MUST reference the `motion` tokens for duration and easing rather than Tailwind built-in timing utilities. The micro-transitions on interactive components (hover, focus, active state changes via `transition-all` / `transition-colors`) are out of scope and keep their current inline timings.
- **FR-004**: Every focus-visible ring MUST read its width from the `ring.width` token. No component source may hardcode `ring-3`.
- **FR-005**: This spec MUST NOT change public component API or behavior, except for the corrected nested-overlay stacking order. It is non-breaking.
- **FR-006**: The existing component test suite, the Storybook interaction tests, and the accessibility tests MUST stay green. SSR safety (Section IX bullet 6) MUST remain intact.
- **FR-007**: Default rendered output MUST match today at the default token values (identical focus-ring thickness and standalone-overlay depth); only the nested-overlay order and the design-system motion timing change.
- **FR-008**: The release MUST ship a `.changeset/*.md` declaring a `@unbranded-ds/react` patch. No consumer migration note is required.

### Key Entities _(include if feature involves data)_

- **Token consumption site**: a single location in component source that hardcodes a value the spec 008 schema now names. Three kinds: a `ring-3` focus ring (14 sites), a `z-50` overlay layer in Dialog, Select, and Tooltip (SkipLink's focus-reveal z excluded), and a built-in enter/exit transition timing on an overlay component (Tooltip, Dialog, Select). Each in-scope site is rewritten to reference its token.
- **Overlay layer**: the stacking depth of one of the three overlay-family components (Dialog, Select, Tooltip). After this spec, each maps to a named stop in the `z-index` scale (`overlay`, `popover`, `tooltip`) rather than the shared `z-50`.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: A tooltip opened inside a dialog renders above the dialog, verified by an interaction test.
- **SC-002**: No component source contains a hardcoded `ring-3` or `z-50`, or a built-in overlay transition timing where a design-system token now exists, verified by grep. SkipLink reads `z-index.max`; zero hardcoded z-index values remain anywhere.
- **SC-003**: A consumer theme that overrides `ring.width`, a `z-index` stop, or a motion duration changes the corresponding rendered output, with no component code change.
- **SC-004**: The component test suite, interaction tests, and accessibility tests stay green, and SSR safety holds.
- **SC-005**: Default rendered output is unchanged at the default token values; the only visible differences are the corrected nested-overlay order and the design-system motion timing.
- **SC-006**: The release ships as a `@unbranded-ds/react` patch with no consumer migration note.

## Assumptions

- **Spec 008 is on main.** `ring.width`, the `z-index` scale, and the `motion` category shipped in 0.4.0 and are available for consumption. Verified.
- **Default token values equal the hardcoded values they replace.** `ring.width` is 3px; the `z-index` overlay stop resolves to a base compatible with the old `z-50` for standalone overlays. So the swap is visually identical at the default except for the nested-overlay fix.
- **The exact `z-index` stop set is taken from the spec 008 tokens as shipped.** The plan verifies the stop names and the per-component mapping before the swap.
- **Motion timing changes are intended.** Where a primitive's old built-in duration differs from the design-system token, the new timing is the design-system value by design.
- **Part B is out of scope.** The breaking API and vocabulary renames are spec 013.

## Dependencies

- **Spec 008 (token schema growth)** merged to main — provides `ring.width`, the `z-index` scale, and the `motion` tokens this spec consumes.

## Out of Scope

- **Part B: API and vocabulary harmonization** (prop and slot renames per Section XI.2, polymorphic prop unification, structured failure output). Split to spec 013; breaking, needs its own clarify cycle.
- **New tokens, new components, new variants.**
- **Behavior changes** beyond the corrected nested-overlay stacking order.
- **Changing the motion token values themselves** — spec 008 set them.
- **Enabling visual regression** — Chromatic VR stays disabled per the constitution; interaction and a11y tests guard the retrofit.
