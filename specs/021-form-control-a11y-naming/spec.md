# Feature Specification: Fix the accessible-name pattern in form-control docs

**Feature Branch**: `021-form-control-a11y-naming`  
**Created**: 2026-06-17  
**Status**: Draft  
**Input**: User description: "@docs/workshops/2026-06-16/spec-021-form-control-a11y-naming.md"

## Clarifications

### Session 2026-06-17

- Q: Does spec 021 include the runtime `warn()` when a Checkbox/Switch/Slider renders with no accessible name, or stay documentation-only? → A: Ship the warning for Checkbox/Switch/Slider. User Story 3 / FR-007 is in scope; it carries a patch bump on `@unbranded-ds/react` and a unit test.
- Q: What does the warning inspect to decide a control is unnamed? → A: Props-only. It warns when neither `aria-label` nor `aria-labelledby` is set on the control. No post-mount DOM read or accessible-name computation.
- Q: What shape is the warning's opt-out (FR-008)? → A: None ships. The "named" rule is strictly `aria-label` or `aria-labelledby` (`title` does not count). The remedy for the rare control named another way (a Slider named by a native `<label>`) is to add `aria-labelledby`, which the warning message states. A per-instance suppress prop can be added later if real demand appears (additive, non-breaking).
- Q: Does the dev warning also cover Select and the File input, or only Checkbox/Switch/Slider? → A: Checkbox/Switch/Slider only. Select is named by its value/placeholder content and the File input by a native label or button text, so props-only detection would false-positive on them. They remain in the docs audit (FR-003) but out of the runtime warning.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Component docs teach the working accessible-name pattern (Priority: P1)

A developer building a form copies the documented example for Checkbox, Switch, or Slider straight out of the component's `@example` block or its usage sidecar. Today that example wraps the control in a native `<label>` (or wires one up with `htmlFor`). Because these controls render an ARIA-role element rather than a native form control, the native label names nothing, so the developer ships a control with no accessible name and an automated accessibility check flags it. After this change, the documented example shows the pattern that actually names the control: `aria-label` for an unlabeled control, or `aria-labelledby` pointing at a visible Label for a labeled one. The developer who copies it gets an accessible control on the first try.

**Why this priority**: This is the defect. The docs are actively teaching a pattern that produces inaccessible controls, and the value of the design system rests on its guidance being trustworthy. Fixing the guidance is the whole point of the spec; everything else is secondary.

**Independent Test**: Read the `@example` blocks for Checkbox, Switch, and Slider and their usage sidecars. Confirm none of them demonstrate the native-label pattern for the ARIA-role control and each demonstrates `aria-label` or `aria-labelledby`. Render any example that exists as a story and confirm the accessibility check reports an accessible name.

**Acceptance Scenarios**:

1. **Given** the Checkbox, Switch, and Slider `@example` blocks, **When** a developer reads them, **Then** each shows `aria-label` (unlabeled) or `aria-labelledby` referencing a visible Label (labeled), and none shows a bare native `<label>` naming the control.
2. **Given** the Checkbox, Switch, and Slider usage sidecars, **When** a developer reads them, **Then** they teach the same accessible-name pattern with no remaining instance of the broken native-label advice.
3. **Given** the Select and Input (including the File input) docs, **When** they are audited against the same rule, **Then** any that teach the broken pattern for a non-native control are corrected and any already-correct ones are confirmed.
4. **Given** a developer copies any corrected example verbatim, **When** the resulting control is checked for an accessible name, **Then** it has one with no further edits.

---

### User Story 2 - The Range slider example names both thumbs distinctly (Priority: P2)

A developer looking at the Range slider example sees two thumbs that are each named for what they do, "Minimum" and "Maximum", rather than both carrying the placeholder "Value" that spec 019 used only to clear the gate. The example models the real-world expectation that a two-thumb slider gives each thumb a distinct, meaningful name.

**Why this priority**: The placeholder is technically accessible but pedagogically wrong; it teaches developers to give both thumbs the same name. It is a smaller correctness fix than the core docs defect, and it is independently shippable, so it sits below P1.

**Independent Test**: Render the Range slider story and confirm it exposes exactly two thumbs whose accessible names are "Minimum" and "Maximum", and that the accessibility check passes.

**Acceptance Scenarios**:

1. **Given** the Range slider example, **When** it renders, **Then** its two thumbs report the accessible names "Minimum" and "Maximum" rather than a shared placeholder.
2. **Given** the Range slider example, **When** the accessibility check runs, **Then** it reports no accessible-name violation for either thumb.

---

### User Story 3 - A dev-time warning catches an unnamed control at the source (Priority: P3)

A developer renders a Checkbox, Switch, or Slider in development and forgets to give it an accessible name. Instead of finding out only when a story's accessibility check fails (or worse, never), they see a single development-time warning at render that names the offending control and points at the fix. A control that already carries `aria-label` or `aria-labelledby` produces no warning.

**Why this priority**: This is the only part of the work that changes shipped runtime code and therefore carries a `@unbranded-ds/react` version bump, and it has a real false-positive to manage (a control named by a mechanism props-only detection cannot see). It is a genuine ergonomic improvement that ships in this spec (clarified 2026-06-17); it stays at P3 because the documentation fix is the core value and the warning is the ergonomic add-on layered on top.

**Independent Test**: Render each of Checkbox, Switch, and Slider with no naming prop and confirm exactly one development warning fires per control identifying it; render each with `aria-label` and with `aria-labelledby` and confirm no warning fires.

**Acceptance Scenarios**:

1. **Given** a Checkbox, Switch, or Slider rendered in development with neither `aria-label` nor `aria-labelledby`, **When** it mounts, **Then** a single development warning fires naming the control and the remedy.
2. **Given** the same control rendered with a valid `aria-label` or `aria-labelledby`, **When** it mounts, **Then** no warning fires.
3. **Given** a production build, **When** any such control mounts, **Then** no warning fires regardless of naming.

---

### Edge Cases

- A `fieldset`/`legend` names the group, not the individual control. A Checkbox/Switch/Slider inside a fieldset with no name of its own is correctly flagged by axe and by the dev warning; this is not a false positive. (An earlier draft treated it as one; that was a misconception about how the accessible-name algorithm handles legends.)
- The props-only check will warn on a control that is named by a mechanism its own props cannot see — a native `<label>` association (which can name the Slider's range input), or a `title`. These cases are rare, and the patterns are either fragile or weakly named; the documented remedy is to add `aria-labelledby`/`aria-label`, which the warning message states. No suppression mechanism ships (see Clarifications, 2026-06-17).
- A Range slider has two thumbs; a single name on the slider root does not name both. Each thumb must be nameable independently, and the documented example must show how.
- A consumer who keeps the old native-label markup after the docs change is not broken: the controls' rendered DOM is unchanged, so existing code behaves exactly as before. The native label simply remains insufficient on its own to name the control.
- The Select trigger and the File input may or may not share the defect. The audit outcome for each is either a correction or an explicit confirmation that it is already correct; both are acceptable.
- For the dev warning specifically, "named" is decided strictly from the control's own `aria-label`/`aria-labelledby` props (`title` does not count); it does not attempt to resolve native or ancestor labelling. The automated accessibility check in stories remains the full source of truth.
- The dev warning is deliberately limited to Checkbox, Switch, and Slider (clarified 2026-06-17). Select is named by its selected value or placeholder content, and the File input by a native label or a button's text, so a props-only check would false-positive on both. They are covered by the documentation audit (FR-003) only, not the runtime warning.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The Checkbox, Switch, and Slider `@example` blocks MUST demonstrate the accessible-name pattern, `aria-label` for an unlabeled control and `aria-labelledby` referencing a visible Label for a labeled one, instead of a native `<label>` wrap or `htmlFor` association naming the control.
- **FR-002**: The Checkbox, Switch, and Slider usage sidecars MUST teach the same accessible-name pattern, with no remaining example of the broken native-label pattern.
- **FR-003**: The Select and Input docs (including the File input) MUST be audited against the same rule; any that teach the broken pattern for a non-native control MUST be corrected, and any already correct MUST be confirmed as such.
- **FR-004**: Every documented example that renders a Checkbox, Switch, Slider, or Select control MUST yield a control with an accessible name, verifiable by the automated accessibility check where the example exists as a story and by review or the sidecar compile-validator where it exists as documentation only.
- **FR-005**: The Range slider example MUST give its two thumbs the distinct accessible names "Minimum" and "Maximum" rather than a shared placeholder name.
- **FR-006**: The corrected guidance MUST NOT change the rendered DOM of the shipped controls. This is a documentation and example change, and the controls' current runtime behavior MUST be preserved (the dev warning of FR-007 is the sole permitted runtime addition, and it adds no DOM).
- **FR-007**: In a development build, the system MUST decide whether a Checkbox, Switch, or Slider is named by inspecting the control's own props only: it is "named" when `aria-label` or `aria-labelledby` is set. When neither is set, the system MUST emit exactly one development warning that identifies the control and states the remedy (add `aria-label`, or `aria-labelledby` referencing a visible label). It MUST NOT compute an accessible name from the DOM, and MUST NOT warn in a production build. This warning applies only to Checkbox, Switch, and Slider; Select and the File input are out of scope for the runtime warning (see Edge Cases).
- **FR-008**: No dedicated suppression mechanism for FR-007 ships in this spec. The documented remedy for a control named by a mechanism props-only detection cannot see (notably a Slider named by a native `<label>`) is to add `aria-labelledby`. A per-instance opt-out prop MAY be added in a later patch if real consumer demand appears; it would be additive and non-breaking.

### Key Entities

- **Form control with an ARIA role**: Checkbox, Switch, and Slider. Each renders a `role="checkbox"`/`"switch"`/`"slider"` element (Slider via a clipped `<input type="range">`) that a native `<label>` does not name. These are the controls the docs must teach to name with `aria-label`/`aria-labelledby`.
- **Documented example surface**: the `@example` block inside each component source and the matching `*.usage.md` sidecar. These are the artifacts that currently teach the broken pattern and that this feature corrects.
- **Range slider thumb**: one of the two draggable handles of a two-thumb slider, each of which needs its own accessible name ("Minimum", "Maximum").

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Zero occurrences of the broken native-label pattern remain in the Checkbox, Switch, and Slider `@example` blocks and usage sidecars, and in any Select or Input doc the audit found teaching it.
- **SC-002**: A developer who copies any corrected form-control example verbatim produces a control that passes an automated accessible-name check on the first attempt, with no additional edits.
- **SC-003**: 100% of the documented Checkbox, Switch, Slider, and Select examples that render as stories report an accessible name under the automated accessibility check (zero accessible-name violations across those component docs).
- **SC-004**: The Range slider example presents exactly two thumbs, each identifiable by a distinct accessible name ("Minimum" and "Maximum").
- **SC-005**: Every Checkbox, Switch, or Slider rendered in development with neither `aria-label` nor `aria-labelledby` surfaces exactly one warning; setting `aria-label` or `aria-labelledby` produces no warning, and no warning fires in a production build.

## Assumptions

- The dev-time warning (User Story 3 / FR-007) ships in this spec (clarified 2026-06-17, previously the open scope decision). It carries a patch bump on `@unbranded-ds/react`; User Stories 1 and 2 remain documentation-only with no bump.
- The correct accessible-name pattern is the one spec 019 applied to the stories: `aria-label` for an unlabeled control, `aria-labelledby` referencing a visible Label for a labeled one. This is settled and not re-opened here.
- No shipped consumer code is inaccessible today. The example Next.js app already uses the `aria-labelledby` pattern (`gallery.tsx`), so this is a documentation defect rather than a runtime one, and no consumer migration or breakage notice is required.
- "Audit Select and Input" means check their docs for the same broken native-label advice and correct only where the control being named is non-native (the Base UI Select trigger, the File input). A native `<input>` that a `<label htmlFor>` legitimately names is fine and stays as is.
- Verification reuses the existing automated accessibility pass for stories and the existing sidecar compile-validator for the markdown examples. No new test infrastructure is assumed.

## Dependencies

- Depends on spec 019 (the test-runner gate that surfaced this defect and supplies the reference fix pattern).
- The dev warning depends on the existing `lib/warn.ts` helper.
