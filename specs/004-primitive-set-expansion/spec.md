# Feature Specification: Primitive set expansion

**Feature Branch**: `004-primitive-set-expansion`
**Created**: 2026-05-16
**Status**: Draft
**Input**: User description: "Primitive set expansion — add Tooltip, SkipLink, Slider, and SegmentedControl components" (full brief at `tmp/spec-004-primitive-set-expansion.md`)

## Clarifications

### Session 2026-05-16

- Q: What should `<Tooltip.Provider delayDuration>` default to? → A: 700ms (matches Base UI's default)
- Q: What should `<Tooltip.Content side>` default to? → A: `top` (matches Base UI; most conventional)
- Q: How should Tooltip handle `prefers-reduced-motion: reduce`? → A: Skip the transition entirely (instant show/hide per WCAG SC 2.3.3)
- Q: What shape should `<Slider value>` and `defaultValue` use? → A: Always `number[]` (single is `[50]`, range is `[20, 80]`); matches Base UI
- Q: How should Slider handle invalid configurations (`step <= 0`, `min >= max`)? → A: Same clamp-and-warn pattern as out-of-range values; component keeps rendering
- Q: How should `<SegmentedControl>` behave with fewer than three items? → A: Render normally, no warning (the "three or more" guidance is advisory)
- Q: Which arrow keys navigate `<SegmentedControl>`? → A: Strict axis — horizontal uses Left/Right only, vertical uses Up/Down only (WAI-ARIA radiogroup pattern)
- Q: What does a "structured warning" look like in practice? → A: `console.warn('[unbranded-ds]', { component, issue, prop, ... })` — no new wrapper API surface; second arg is a JSON-shaped object
- Q: Is RTL support in scope for 0.3.0? → A: Inherit Base UI's RTL handling for wrapped primitives; no wrapper-added RTL tests in this release. Documented as an assumption.
- Q: Should the spec require SSR safety as an explicit FR? → A: SSR safety is a cross-cutting expectation, not spec-004-specific. Codified in Constitution Section IX (amended to 1.0.2 on 2026-05-16 alongside this spec) — all components in `packages/react` render server-side without `window` / `document` access at render time.
- Q: How should `<SkipLink>` be implemented? → A: Native `<a href="#targetId">` element relying on browser anchor behavior for focus and scroll; no `preventDefault`, no programmatic scroll

## User Scenarios & Testing _(mandatory)_

Four consumer-facing user stories, one per component. Each is independently shippable: a consumer who needs only one of these primitives gets full value from the corresponding PR. The recommended ship order matches priority (Tooltip first, SegmentedControl last), but no story depends on another's code.

### User Story 1 - Tooltip for contextual help (Priority: P1)

A consumer building a DS-driven application needs to show short contextual information when a user hovers or focuses an element. Examples include citation hovers in a research UI, control labels on a complex form, and icon-button explanations.

Today the consumer must wire `@base-ui-components/react`'s Tooltip primitive themselves, style it from scratch against tokens, and verify keyboard and screen-reader behavior. After this feature, importing `<Tooltip>` from `@unbranded-ds/react` delivers a token-styled, ARIA-compliant tooltip with one line of import.

**Why this priority**: Tooltip is the highest-demand primitive in the for-coleman feedback, has the smallest design surface of the four, and unblocks the citation hover and control-label patterns that appear in nearly every consumer integration.

**Independent Test**: A consumer adds `<Tooltip.Provider>`, `<Tooltip.Trigger>`, and `<Tooltip.Content>` to a page. Hovering or keyboard-focusing the trigger reveals the content. Pressing Escape dismisses it. Axe reports no `serious` or `critical` violations.

**Acceptance Scenarios**:

1. **Given** a page with a Tooltip wrapping a button, **When** a user hovers the button with a pointer, **Then** the tooltip content appears after the configured delay and disappears on pointer leave
2. **Given** a page with a Tooltip wrapping a button, **When** a keyboard user tabs focus to the button, **Then** the tooltip content appears without requiring hover and disappears on blur
3. **Given** an open tooltip, **When** the user presses Escape, **Then** the tooltip closes and focus remains on the trigger
4. **Given** a tooltip with `side="top"` and `align="center"`, **When** the tooltip opens, **Then** it renders above the trigger and is horizontally centered relative to it
5. **Given** a `<Tooltip.Trigger asChild>` wrapping a non-button inline element (`<sup>`, `<a>`, or `<span>`), **When** the user hovers or focuses that element, **Then** the tooltip opens and the original DOM shape is preserved (no extra `<button>` is injected)
6. **Given** a Tooltip rendered inside a container with `overflow: hidden`, **When** the tooltip opens, **Then** its content is not clipped by the container, because the content portals out to `document.body`

---

### User Story 2 - SkipLink for keyboard accessibility (Priority: P2)

A consumer building any keyboard-accessible page needs a "skip to main content" link as the first focusable element so that screen-reader and keyboard-only users can bypass long navigation. WCAG 2.4.1 requires this pattern; building it correctly involves a focus-visible reveal of an otherwise-hidden link plus a programmatic jump to a content anchor.

Today the consumer either rolls this by hand or skips it entirely (which fails an a11y audit). After this feature, importing `<SkipLink>` and placing it at the top of the layout delivers the pattern without any custom CSS or focus management.

**Why this priority**: A11y staple required for WCAG compliance. The implementation is small (roughly ten lines plus styles), the design has no debatable surface, and it complements the `.sr-only` utility shipped in spec 002.

**Independent Test**: A consumer renders `<SkipLink>` as the first child of their layout. Pressing Tab on page load reveals the link and focuses it; pressing Enter scrolls and focuses the element matching `targetId` (default `main`).

**Acceptance Scenarios**:

1. **Given** a page with `<SkipLink>` placed before all other interactive content, **When** a keyboard user presses Tab once after page load, **Then** the SkipLink becomes visible and receives focus
2. **Given** a focused SkipLink with the default `targetId` of `main`, **When** the user presses Enter, **Then** the viewport scrolls to and focuses the element with `id="main"`
3. **Given** a SkipLink with `targetId="content"` and a corresponding `<main id="content">`, **When** the user activates the link, **Then** focus moves to that element
4. **Given** a SkipLink that has not yet been focused, **When** the page renders, **Then** the link is visually hidden but remains in the DOM and accessible to screen readers
5. **Given** a page with three SkipLinks pointing to different `targetId`s, **When** the user tabs through them, **Then** each is independently focusable and activatable, and pressing Enter on any one moves focus to its own target

---

### User Story 3 - Slider for numeric range input (Priority: P3)

A consumer building UIs with continuous numeric controls (audio volume, BPM, color hue, opacity, threshold sliders) needs a draggable slider that also supports keyboard input. The for-coleman application has three concrete uses: tempo control, jungle-mode tempo, and chop velocity.

Today, building a slider that handles drag, keyboard arrows, Home/End, PageUp/PageDown, ARIA labeling, and value display is a significant per-application investment. After this feature, importing `<Slider>` delivers all of that with token-driven styling.

**Why this priority**: Real demand in the for-coleman scorecard. Largest design surface of the four (track, thumb, indicator, optional value display, optional second thumb for range mode), which is why it ships third rather than first. Tooltip and SkipLink land faster and clear the way.

**Independent Test**: A consumer renders `<Slider>` with min, max, step, and a default value. Drag changes the value; arrow keys increment and decrement by step; Home and End jump to min and max. A range variant accepts two values and renders two thumbs.

**Acceptance Scenarios**:

1. **Given** a Slider with `min=0`, `max=100`, `step=1`, `defaultValue=50`, **When** a user presses Right Arrow while the thumb is focused, **Then** the value becomes 51
2. **Given** the same Slider, **When** the user presses Home, **Then** the value becomes 0; **When** the user presses End, **Then** the value becomes 100
3. **Given** the same Slider, **When** a user drags the thumb along the track, **Then** the value updates continuously and the indicator visually reflects the new position
4. **Given** a range Slider with two values `[20, 80]`, **When** the user focuses the lower thumb and presses Right Arrow, **Then** only the lower value increments and the upper value is unchanged
5. **Given** a disabled Slider, **When** the user attempts to drag or use keyboard, **Then** the value does not change and the thumb does not receive focus

---

### User Story 4 - SegmentedControl for mutually-exclusive selection (Priority: P4)

A consumer needs a connected, multi-option control where exactly one option is selected at a time. The canonical use case is the upcoming ThemeToggle in spec 008 (light, dark, system), but the primitive is generic: view-mode toggles, filter sets, and segmented navigation are all common patterns.

Today the consumer either uses radio inputs (correct semantics, wrong visual) or styled buttons with manual ARIA wiring (correct visual, fragile semantics). After this feature, importing `<SegmentedControl>` delivers a connected control with radio-input semantics under the hood.

**Why this priority**: Lower immediate demand than the others, but ships now because spec 008's ThemeToggle composes this primitive. Landing it here unblocks 008 without requiring a primitive-only release in between.

**Independent Test**: A consumer renders `<SegmentedControl.Root defaultValue="medium">` with three `<SegmentedControl.Item value="small|medium|large">` children. Clicking an item changes the selection; arrow keys navigate; only one item is selected at any time.

**Acceptance Scenarios**:

1. **Given** a SegmentedControl with three items and the middle one selected, **When** the user clicks the first item, **Then** the first item becomes selected and the middle item deselects
2. **Given** the same control with focus on the selected item, **When** the user presses Right Arrow, **Then** the next item receives focus and becomes selected
3. **Given** the same control, **When** rendered as HTML, **Then** it is announced as a radiogroup with the correct number of options to assistive technology
4. **Given** a disabled SegmentedControl, **When** the user attempts to interact, **Then** no selection change occurs and items do not receive focus

---

### Edge Cases

- **Tooltip with empty or undefined content**: The component renders nothing and emits no portal node, rather than an empty bubble.
- **SkipLink target does not exist**: If the element matching `targetId` is missing, activation is a no-op. The component does not throw, since runtime errors would break consumer pages over a misconfiguration.
- **Slider value out of bounds**: A controlled value below `min` or above `max` is clamped to the nearest valid value, and the component emits a structured warning identifying the prop, the offending value, and the clamped result.
- **Slider with `step` larger than `max - min`**: The slider snaps to `min` and `max` as the only valid stops; arrow keys jump between them.
- **Range Slider with thumb collision**: When dragging one thumb past the other, the thumbs do not cross; the dragged thumb stops at the other's current value minus one step.
- **SegmentedControl with two items**: Renders and behaves correctly with no warning. The "three or more" guidance from the brief is advisory, not a component-enforced constraint.
- **SegmentedControl with no items**: Renders an empty wrapper and emits a structured warning.

## Requirements _(mandatory)_

### Functional Requirements

**Tooltip**

- **FR-001**: `<Tooltip>` MUST expose `Trigger`, `Content`, and `Provider` slot components matching the existing slot vocabulary across the package
- **FR-002**: `<Tooltip.Content>` MUST accept a `side` prop with values `top`, `right`, `bottom`, `left` (default: `top`) and an `align` prop with values `start`, `center`, `end` (default: `center`)
- **FR-003**: `<Tooltip.Provider>` MUST accept a `delayDuration` prop (numeric, milliseconds) that controls how long the user must hover before the tooltip opens. Default: `700` (matches Base UI).
- **FR-004**: Tooltip open and close transitions MUST use Tailwind's built-in duration utilities in this release; a follow-up after spec 006 will migrate to DS motion tokens. When the user's `prefers-reduced-motion: reduce` is set, the wrapper MUST skip the transition entirely (instant show/hide), per WCAG SC 2.3.3.
- **FR-005**: Tooltip MUST be dismissable by pressing Escape, with focus remaining on the trigger
- **FR-006**: Tooltip MUST be reachable and dismissable via keyboard alone
- **FR-007**: On touch devices, Tooltip MUST inherit Base UI's default tap-to-toggle behavior with outside-tap dismissal. The wrapper MUST NOT override this behavior or expose alternate touch modes via prop. Designs that need inline content on small screens render that content directly rather than wrapping it in Tooltip.
- **FR-008**: Tooltip content MUST portal to `document.body` by default, escaping ancestor `overflow: hidden` or `overflow: clip` boundaries. Base UI's `container` prop on `Tooltip.Provider` MUST pass through to allow consumers to mount the portal at a different node. Default stacking-context defers to consumer CSS for this release; a z-index token spec will land in a future release.

**SkipLink**

- **FR-009**: `<SkipLink>` MUST render visually hidden when not focused and visible when focused, using the `.sr-only` utility from spec 002 plus a `focus-visible` reveal
- **FR-010**: `<SkipLink>` MUST accept a `targetId` prop (default `main`) identifying the element to jump to on activation
- **FR-011**: `<SkipLink>` MUST be implemented as a native `<a href="#${targetId}">` element. Activation MUST rely on browser anchor behavior to move keyboard focus and viewport scroll to the target. The wrapper MUST NOT call `preventDefault()` or perform programmatic scroll — this preserves no-JS behavior and avoids divergence from native focus semantics.
- **FR-012**: `<SkipLink>` MUST remain accessible to screen readers even when visually hidden
- **FR-013**: Multiple `<SkipLink>` instances on the same page MUST work independently, each pointing at its own `targetId`. The component MUST NOT take a layout opinion on how multiple instances render together; composing their layout is the consumer's responsibility.

**Slider**

- **FR-014**: `<Slider>` MUST expose `Root`, `Control`, `Track`, `Thumb`, and `Indicator` slot components
- **FR-015**: `<Slider>` MUST support single-value usage (one thumb, one value) and range usage (two thumbs, two values) from this release
- **FR-016**: `<Slider>` MUST accept `min`, `max`, `step`, `value` (controlled), `defaultValue` (uncontrolled), and an `onValueChange` callback. `value` and `defaultValue` MUST be `number[]` in all cases: single-value usage uses a one-element array (`[50]`), range usage uses a two-element array (`[20, 80]`). The `onValueChange` callback receives the same shape.
- **FR-017**: `<Slider>` MUST support the variant axes `size` (`sm`, `md`, `lg`), `orientation` (`horizontal`, `vertical`), and `disabled` (boolean)
- **FR-018**: `<Slider>` MUST support keyboard interaction: Arrow keys change by `step`, Home and End jump to min and max, PageUp and PageDown change by a larger increment (10% of range by default)
- **FR-019**: `<Slider>` MUST support touch input: tap-to-position on the track and drag-with-finger on the thumb. All input modes (pointer drag, keyboard, touch) resolve to the same value-change pathway.
- **FR-020**: When a controlled value is outside `[min, max]`, `<Slider>` MUST clamp the value and emit a structured warning per FR-034 with `{ component: 'Slider', issue: 'value-out-of-range', prop, got, clamped }`. The same clamp-and-warn pattern MUST apply to other invalid configurations: `step <= 0` falls back to `1` (`issue: 'invalid-step'`); `min >= max` swaps to `[min, min+1]` (`issue: 'invalid-bounds'`). The component MUST keep rendering; invalid props are never grounds for throwing.
- **FR-021**: `<Slider>` MUST be ARIA-compliant: each thumb exposes `role="slider"`, `aria-valuemin`, `aria-valuemax`, and `aria-valuenow`

**SegmentedControl**

- **FR-022**: `<SegmentedControl>` MUST expose `Root` and `Item` slot components
- **FR-023**: `<SegmentedControl>` MUST support the variant axes `size` (`sm`, `md`, `lg`), `orientation` (`horizontal`, `vertical`), and `disabled` (boolean)
- **FR-024**: `<SegmentedControl>` MUST be implemented on radio-input semantics (`role="radiogroup"` with `role="radio"` items) so assistive technology announces it correctly
- **FR-025**: `<SegmentedControl>` MUST support keyboard navigation following the WAI-ARIA radiogroup pattern. In horizontal orientation, Left and Right Arrow move focus and selection between items; in vertical orientation, Up and Down Arrow do the same. Cross-axis arrow keys are no-ops. Home and End jump to the first and last items in both orientations.
- **FR-026**: `<SegmentedControl>` MUST allow controlled (`value` + `onValueChange`) and uncontrolled (`defaultValue`) usage

**Cross-cutting (applies to all four components)**

- **FR-027**: Each component MUST live in `packages/react/src/components/<Component>/` with at minimum `index.ts`, `<Component>.tsx`, `<Component>.stories.tsx`, and `<Component>.test.tsx`
- **FR-028**: Each component MUST be re-exported from `packages/react/src/index.ts`
- **FR-029**: Each component MUST style itself entirely through Tailwind utilities that resolve to tokens; the existing lint rule against hardcoded colors, radii, spacing, font sizes, and shadows applies
- **FR-030**: Each component's Storybook page MUST include a Default story plus one story per meaningful variant or state, and at least one `play` function exercising the primary interaction. Required named stories: a "Wrapping an inline element" story on Tooltip demonstrating `<Tooltip.Trigger asChild>` over a non-button child; a "Multiple skip targets" story on SkipLink exercising tab-through behavior across multiple instances; a touch-event play function variant on Slider (using `pointerType: 'touch'`) that verifies tap-to-position and drag-with-finger.
- **FR-031**: Each component's autodocs prose MUST be written for both human and agent audiences and MUST pass a humanizer review before merge
- **FR-032**: Autodocs prose MUST NOT contain three-item prose enumerations; variant enums with three options (e.g., `size: 'sm' | 'md' | 'lg'`) are code lists and are exempt
- **FR-033**: Each component MUST report zero `serious` or `critical` axe violations across all of its stories
- **FR-034**: Where a component performs runtime validation (e.g., Slider out-of-range values), it MUST emit a structured warning via `console.warn('[unbranded-ds]', payload)` where `payload` is a plain JSON-shaped object with at minimum `{ component: string, issue: string }` and additional fields describing the context. Agents and dev tools parsing the console can read the second argument directly. The wrapper MUST NOT add a separate `report()` API or custom window events for this.
- **FR-035**: Slot component names MUST match across components: a `Root` is a `Root` everywhere, a `Trigger` is a `Trigger` everywhere, an `Item` is an `Item` everywhere
- **FR-036**: Slot names MUST also match Base UI's primitive slot names exactly — no renames, no aliases. Base UI's composition documentation is authoritative for slot composition. The wrapper adds CVA-driven styling and variants only.
- **FR-037**: Variant prop names MUST use the shared vocabulary (`variant`, `size`, `intent`, `disabled`); bespoke synonyms are not allowed
- **FR-038**: Each component PR MUST include a `.changeset/*.md` file declaring `@unbranded-ds/react: minor`; the Version Packages PR is held until all four merge and ships them together in `@unbranded-ds/react@0.3.0`

### Key Entities

- **Tooltip**: A floating-content primitive composed of `Trigger`, `Content`, and `Provider`. Attributes: position (`side`, `align`), delay (`delayDuration`), open state. Wraps `@base-ui-components/react`'s Tooltip primitives.
- **SkipLink**: A keyboard-only navigation primitive. Attributes: `targetId`, focus-visible state, accessible label. Built directly on the `.sr-only` utility plus a focus-reveal pattern.
- **Slider**: A numeric-range input primitive composed of `Root`, `Control`, `Track`, `Thumb`, and `Indicator`. Attributes: `min`, `max`, `step`, `value` or `defaultValue` (single or two-element for range), `orientation`, `size`, `disabled`. Wraps `@base-ui-components/react`'s Slider primitives.
- **SegmentedControl**: A mutually-exclusive selection primitive composed of `Root` and `Item`. Attributes: `value` or `defaultValue`, item set, `orientation`, `size`, `disabled`. Built on radio-input semantics.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: A consumer can render a working Tooltip, SkipLink, Slider, or SegmentedControl in five lines or fewer of import-and-use code, with no custom CSS required
- **SC-002**: Keyboard-only users can complete every primary interaction in every component (open and dismiss Tooltip, activate SkipLink, change Slider value, change SegmentedControl selection) without a pointer
- **SC-003**: Every story across the four components reports zero `serious` or `critical` axe violations in CI
- **SC-004**: The for-coleman scorecard moves from 4 of 6 to 5 of 6 component-coverage items after this release lands; the remaining item (ThemeToggle) is unblocked by SegmentedControl
- **SC-005**: An agent querying the published MCP endpoint can retrieve autodocs for each of the four new components, with prop descriptions sufficient to compose a working example without reading source
- **SC-006**: All four components ship in a single `@unbranded-ds/react@0.3.0` release; the Version Packages PR opened by Changesets is held until each of the four component PRs has merged to main

## Assumptions

- All four components ship in the same `@unbranded-ds/react@0.3.0` release. Each PR adds its own changeset declaring a minor bump on `@unbranded-ds/react`; the Version Packages PR is held until all four merge, so the four bumps coalesce into one minor.
- The Slider supports both single-value and range modes from day one of 0.3.0, per the for-coleman brief. Range mode is not deferred.
- Tooltip touch-device behavior follows Base UI's primitive defaults (long-press to open, tap-outside to close). The wrapper does not override this.
- The recommended PR order (Tooltip, SkipLink, Slider, SegmentedControl) reflects priority and review-cost ordering. The components have no code-level dependencies on each other, so a parallel-implementation track is feasible if reviewer bandwidth allows.
- Constitution Section XI is not yet ratified. The bridge rules listed in the brief (predictable slot and prop naming, humanizer on autodocs, no prose three-item lists, structured failure output) apply to this work as if Section XI were live.
- Sidecar `*.usage.md` files are not part of this spec. They land in spec 005's retrofit, which will be informed by the four components shipped here.
- The Toast / Status region, the `<VisuallyHidden>` component as a public export, and the Form wrapper are deferred to later specs and are explicitly out of scope.
- RTL (right-to-left language) behavior is inherited from Base UI's primitive handling for Tooltip and Slider. The wrapper adds no RTL-specific logic and the spec does not require RTL-specific story coverage in 0.3.0. Components must not break when rendered in an RTL context, but verification is on the consumer until a future spec adds explicit RTL test coverage.

## Dependencies

- Spec 002 (consumer DX preset) must be live, since SkipLink uses the `.sr-only` utility that 002 wired up. Shipped as `@unbranded-ds/tokens@0.2.0` and `@unbranded-ds/react@0.2.0` on 2026-05-15 and manually published to npm on 2026-05-16.
- Spec 003 (versioning workflow) must be live, since this spec is the first to use the Changesets-managed release flow and the new `changeset-check.yml` PR gate. Merged to main 2026-05-16.
- `@base-ui-components/react` provides the underlying Tooltip and Slider primitives.

## Out of Scope

- Toast / Status region — deferred to a dedicated future spec covering portaling, queueing, and ARIA live regions
- `<VisuallyHidden>` component as a public export — the `.sr-only` Tailwind utility shipped in spec 002 covers the common case
- Form wrapper — deferred until there is a clear opinion on field-level error patterns
- ThemeToggle — lands in spec 008, which composes the SegmentedControl shipped here
- Sidecar `*.usage.md` files — land in spec 005's retrofit
- DS motion tokens for the Tooltip transition — Tailwind's built-in duration utilities are used in this release; a follow-up after spec 006 ships motion tokens will migrate
