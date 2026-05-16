# Research: Primitive set expansion

This document records the technical decisions made during planning for spec 004. The spec is fully clarified — eleven questions were resolved during `/speckit.clarify` on 2026-05-16, recorded in spec.md's `## Clarifications` section. This file captures the implementation-level decisions that shape how those clarifications get realized.

## Decision: Wrap Base UI Tooltip primitives for `<Tooltip>`

**Decision**: `<Tooltip>` exposes `Provider`, `Trigger`, and `Content` slot components that pass through to `@base-ui-components/react`'s Tooltip primitives. The wrapper adds CVA variant styling and the tokens-driven visual treatment.

**Rationale**:

- Constitution Section IV mandates Base UI as the primitive source for components in this package
- Base UI handles open and close state, escape-to-dismiss, hover and focus triggers, portal mounting, and touch behavior (tap-to-toggle, outside-tap dismissal)
- Spec FR-036 requires exact slot-name parity with Base UI; the wrapper's `Trigger` is Base UI's `Trigger`
- `asChild` pass-through preserves the inline-element wrapping pattern needed by US1 acceptance scenario 5

**Alternatives considered**:

- Rolling our own tooltip on top of the native `popover` API or Floating UI directly: rejected because it duplicates effort, ties us to browser support nuances, and creates a divergent API surface from the rest of the package
- Wrapping Radix Tooltip instead of Base UI: rejected per Constitution Section IV (Base UI variant of shadcn/ui only)

## Decision: Wrap Base UI Slider primitives for `<Slider>`

**Decision**: `<Slider>` exposes `Root`, `Control`, `Track`, `Thumb`, and `Indicator` slot components from `@base-ui-components/react`'s Slider. The wrapper supports both single-value (`value: [50]`) and range (`value: [20, 80]`) usage from day one of 0.3.0.

**Rationale**:

- Base UI's Slider handles drag, pointer events, touch (tap-to-position, drag-with-finger), keyboard (Arrow keys, Home, End, PageUp, PageDown), and ARIA labeling on each thumb
- Range support is built in via a multi-thumb configuration on `Slider.Root`
- Always-array shape for `value` and `defaultValue` (FR-016, clarification Round 2 Q1) matches Base UI's pattern and gives `onValueChange` a single signature

**Alternatives considered**:

- Native HTML `<input type="range">`: rejected because the native element cannot do range (two-thumb) mode without pairing two inputs, which loses the connected ARIA semantics
- Discriminated-union value shape (`number` for single, `[number, number]` for range): rejected during clarification — uniform `number[]` is simpler for consumers and matches Base UI

## Decision: Wrap Base UI RadioGroup for `<SegmentedControl>`

**Decision**: `<SegmentedControl>` exposes `Root` and `Item` slot components that pass through to `@base-ui-components/react`'s RadioGroup primitives. The wrapper styles them as a connected, pill-shaped segmented control via CVA + Tailwind utilities. ARIA semantics use `role="radiogroup"` with `role="radio"` items (FR-024).

**Rationale**:

- Mutually-exclusive selection from a fixed set is the exact ARIA model of a radio group; the visual difference between "radio buttons" and "segmented control" is purely Tailwind styling
- Base UI's RadioGroup handles focus management, roving-tabindex, and arrow-key navigation; we constrain the navigation to strict-axis arrows per FR-025 (clarification Round 3 Q2)
- Slot names `Root` and `Item` match Base UI's RadioGroup exactly, satisfying FR-036
- Rolling our own with `<input type="radio">` plus styled labels would duplicate Base UI's keyboard and focus work

**Alternatives considered**:

- Roll our own using native `<input type="radio">` elements with styled labels: rejected because Base UI's RadioGroup already gives us correct ARIA, focus management, and keyboard behavior for free
- Wrap Base UI's Tabs primitive: rejected — Tabs has different semantics (tabpanel content, value-keyed visibility) that do not fit a presentation-only selection control

## Decision: Implement `<SkipLink>` as a native anchor, no Base UI wrapper

**Decision**: `<SkipLink>` renders a native `<a href="#${targetId}">` element with the `.sr-only` utility (from spec 002) for the hidden state and a `focus-visible` reveal for the focused state. The component does NOT call `preventDefault()` or perform programmatic scroll.

**Rationale**:

- Resolved during clarification (Round 4 Q4) — native browser behavior is sufficient
- Activating an anchor with a matching fragment ID natively scrolls to and focuses the target element
- No JS required for the core a11y pattern, which preserves graceful degradation when JS fails
- Base UI does not expose a SkipLink primitive (it's an a11y idiom, not a UI primitive), which justifies the in-house implementation — and the surface area is genuinely tiny (≈10 lines plus styles)
- The `.sr-only` utility shipping in 0.2.0 already covers the visually-hidden state

**Alternatives considered**:

- Button with programmatic focus and scroll: rejected during clarification — loses no-JS behavior and reintroduces complexity (manual focus calls, manual scroll behavior) for no a11y or UX benefit
- Anchor with `preventDefault()` and custom scroll behavior: rejected — the spec calls out browser-native focus and scroll as authoritative (FR-011)

## Decision: Structured warning format

**Decision**: All structured warnings emit via `console.warn('[unbranded-ds]', payload)` where `payload` is a plain JSON-shaped object containing at minimum `{ component: string, issue: string }` and additional context-specific fields. No separate `report()` API. No custom window events.

**Rationale**:

- Resolved during clarification (Round 4 Q1)
- Agents and dev tools parse the `console.warn` second argument as an object literal directly
- No new wrapper API surface to learn, maintain, or document
- Production-build strip via dead-code elimination is trivial if a future spec wants it (wrap calls in a `__DEV__` flag), but not required for 0.3.0

**Alternatives considered**:

- Dedicated `report(event)` utility function: rejected — adds wrapper-specific API consumers would have to learn
- Custom `window.dispatchEvent` event: rejected — devtools-only path, requires consumers to opt into a listener, console output goes silent

**Payload shape examples** (per-component details in `data-model.md`):

```ts
// Slider out-of-range
{ component: 'Slider', issue: 'value-out-of-range', prop: 'value', got: 150, clamped: 100 }

// Slider invalid step
{ component: 'Slider', issue: 'invalid-step', got: -2, fallback: 1 }

// Slider invalid bounds
{ component: 'Slider', issue: 'invalid-bounds', min: 50, max: 10, swappedTo: [50, 51] }

// SegmentedControl empty item set
{ component: 'SegmentedControl', issue: 'no-items' }
```

## Decision: SSR safety via post-mount-only browser-API access

**Decision**: Every component renders server-side without accessing `window`, `document`, or other browser-only globals at render time. All browser-API access (focus management, viewport queries, portal-target lookup) happens inside `useEffect` or `useLayoutEffect` post-mount.

**Rationale**:

- Codified in Constitution Section IX bullet 6 (added 1.0.2 alongside this spec)
- Base UI primitives are already SSR-safe; the wrapper inherits and must not regress
- React 18's `useId` is available where stable IDs are needed during render, so we never need `Math.random()` or DOM lookups for ID generation

**Alternatives considered**:

- Conditional `typeof window !== 'undefined'` checks scattered throughout render: rejected — leaks hydration mismatches and is harder to audit
- A blanket `'use client'` directive: out of scope — that is a Next.js-specific concern, not a wrapper-package concern. Consumers add the directive in their app code if their framework needs it.

## Decision: Reduced-motion handling for `<Tooltip>` transitions

**Decision**: When `prefers-reduced-motion: reduce` is true, the Tooltip open and close transitions are skipped entirely (instant show and hide). Tailwind's `motion-reduce:` variant applies the override directly in CSS.

**Rationale**:

- Resolved during clarification (Round 1 Q3)
- WCAG SC 2.3.3 compliance
- Tailwind v4 has the `motion-reduce:` modifier built in; no JS required to detect the OS preference
- A CSS-only approach avoids hydration mismatches and runtime cost

**Alternatives considered**:

- Shorten the transition to ~50ms instead of skipping: rejected — partial motion can still bother sensitive users; the spec's standard is "skip"
- JS-based detection via `matchMedia('(prefers-reduced-motion: reduce)')`: rejected — CSS-only is cheaper, avoids a re-render, and works on initial paint

## Decision: CVA variants follow the shared vocabulary

**Decision**: All four components use `class-variance-authority` with the shared vocabulary:

- `size`: `'sm' | 'md' | 'lg'` (Slider, SegmentedControl)
- `orientation`: `'horizontal' | 'vertical'` (Slider, SegmentedControl)
- `disabled`: `boolean` (Slider, SegmentedControl; SkipLink and Tooltip do not have a meaningful disabled state)

Tooltip has no `size` or `orientation` CVA variants — its positioning is via `side` and `align` props on `Tooltip.Content`, which are pass-through to Base UI and not CVA axes. SkipLink has no CVA variants at all — its visible state is focus-driven, not a variant.

**Rationale**:

- FR-037 (shared variant vocabulary)
- Consistency with existing Button, Card, Input, Switch, Tabs, etc.

**Alternatives considered**:

- Per-component bespoke variant names (e.g., `tone`, `weight`): rejected — explicitly prohibited by FR-037

## Decision: Storybook story patterns

**Decision**: Each component ships with the following stories at minimum:

- **Default** — the simplest working render
- **Variant stories** — one story per CVA variant axis (e.g., "Sizes", "Orientations", "Disabled")
- **State stories** where applicable (e.g., "Range" for Slider, "Multiple Items Selected" not applicable since SegmentedControl is single-select)
- **Required named stories** per FR-030:
  - Tooltip: "Wrapping an inline element" — demonstrates `<Tooltip.Trigger asChild>` over a non-button child
  - SkipLink: "Multiple skip targets" — three SkipLinks pointing at different `targetId`s
  - Slider: a touch-event play function variant using `pointerType: 'touch'`, verifying tap-to-position and drag-with-finger

**Rationale**:

- Constitution Section V: stories are the contract surface for documentation, manual QA, interaction tests, accessibility tests, and MCP introspection
- Spec FR-030 mandates the named stories

**Alternatives considered**:

- One sprawling kitchen-sink story per component: rejected — autodocs work better with discrete stories per variant, and play functions need focused setup

## Decision: Per-PR changeset granularity

**Decision**: Each of the four component PRs adds its own `.changeset/*.md` file declaring `@unbranded-ds/react: minor`. The Version Packages PR opened by Changesets after each merge is held until all four merge, so the four bumps coalesce into one `0.3.0` release.

**Rationale**:

- FR-038 and SC-006 require a single bundled release
- Each PR independently satisfies the `changeset-check.yml` gate
- Per-PR changesets give each component its own CHANGELOG entry once Changesets processes the release

**Alternatives considered**:

- One bundled changeset on the last PR: rejected — earlier PRs would fail the changeset-check gate
- Four separate minor releases (0.3.0 → 0.6.0): rejected per spec — the four are part of one cohesive scope
