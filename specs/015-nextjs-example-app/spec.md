# Feature Specification: Next.js 15 example app

**Feature Branch**: `015-nextjs-example-app`
**Created**: 2026-06-15
**Status**: Draft
**Input**: User description: "@docs/workshops/2026-05-18/spec-012-example-app.md - keep the first example app simple and clone-able"

> Numbering note: this is "spec 012" in the workshop docs. The spec-kit directory took the next sequential slot (015) because 013 and 014 were created ahead of it. Same feature, two numbers.

## Overview

A minimal, copy-paste-able Next.js 15 (App Router) starter that wires up `@unbranded-ds/tokens` and `@unbranded-ds/react`. It is the working proof that the canonical wiring from spec 002 does what the docs say, and it is an artifact agents read when they scaffold a new consumer app.

The steering for this first example is **simple and clone-able**, which the clarifications below settled as a rule about structure, not feature count: the example demonstrates the full primitive set, multi-axis theming, and the consumer-override seam, organized so it still clones out cleanly and reads mobile-first. The canonical wiring and the clone-out path are the spine; the demonstrations hang off them without obscuring them. The published Storybook stays the home for exhaustive per-component states; the starter shows each primitive once, in a realistic context.

## Clarifications

### Session 2026-06-15

- Q: How many components should the starter demonstrate? → A: One example of each published primitive in a plausible context (the brief's full set), kept clone-able and mobile-first rather than trimmed.
- Q: How far should theming go in the example? → A: Light/system/dark plus density, and an imported vaporwave + compact composition that demonstrates multi-axis composition.
- Q: How much of the consumer-override pattern should the starter show in code? → A: Both a self-hosted font override and a color-palette override, in code.
- Q (volunteered mid-session): Responsive posture? → A: Mobile-first, accomplished with container queries wherever they apply; design-system augmentations to ease this are noted as follow-ups, not built here.
- Q (volunteered mid-session): Tests? → A: The scope grew past a POC, so ship Playwright end-to-end tests for the headline experiences and run them in CI. This is a deliberate exception to the brief's no-tests stance; unit and component-fixture tests stay out.
- Q: Demo content structure? → A: A single primary page plus one nested App Router route.
- Q: How to demonstrate vaporwave, given it is one aesthetic value today? → A: Pin a vaporwave + compact section via the `forced` API, frame it as an alternative aesthetic rather than a color-scheme, and signpost the planned color-scheme split. Spec the split as separate future work.
- Q: What exercises the container queries? → A: Render one component in two different container widths side by side, each reflowing by its own container.
- Q: Which components count as "each primitive"? → A: Every component exported from the public root of `@unbranded-ds/react`, enumerated at plan time.
- Q: What does the e2e suite run against? → A: The production build (`next build` then `next start`).
- Q: How deep on visuals? → A: Functional assertions only; no visual snapshots, since Chromatic still covers component visuals through Storybook.
- Q: Include accessibility checks? → A: Yes, axe assertions on the key views.
- Q: How does the example participate in CI? → A: Strict lint and typecheck plus the Playwright suite, excluded from the published build and release.
- Q: What does the nested route demonstrate? → A: Theme and density persistence across navigation with no flash, and it hosts the pinned vaporwave + compact showcase.

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Clone a working starter and run it (Priority: P1)

A developer who has never used the design system copies `examples/nextjs-15-app-router/` out of the monorepo, changes the two `workspace:*` dependencies to published version numbers, installs, and runs it. They get a Next.js App Router app whose pages are already styled by the design system, with no extra setup, config hunting, or undocumented steps.

**Why this priority**: This is the whole point. If the example does not clone out and run, nothing else about it matters. It is the MVP on its own: the canonical two-line Tailwind import plus the package dependencies, in a project that boots.

**Independent Test**: Copy the directory outside the repo, swap the two deps to real versions, run install and the dev server. The app starts on a local port and renders a page whose colors, spacing, and type come from the design system, with no manual wiring.

**Acceptance Scenarios**:

1. **Given** a fresh checkout of the monorepo, **When** a developer runs install and starts the example through the workspace, **Then** the dev server boots on a local port and the page renders with design-system styling.
2. **Given** the example directory copied outside the repo with the two `workspace:*` deps changed to published versions, **When** the developer installs and runs it, **Then** it boots and renders identically, with no reference back to the monorepo.
3. **Given** the running example, **When** a developer reads `globals.css`, **Then** the design-system styling traces to exactly the two canonical import lines from spec 002 and nothing more.

---

### User Story 2 - Themed correctly on first paint, switchable live (Priority: P2)

A visitor loads the example with a previously saved dark theme. The page paints dark immediately, with no flash of the light theme first. A control in the header switches between light, system, and dark without a reload, and while set to system the page follows the operating system's color scheme as it changes.

**Why this priority**: Flash-free theming is the headline thing consumers struggle to wire by hand, and it is the reason the bootstrap script and the theme controls exist. Demonstrating it correctly is the example's most load-bearing teaching moment after the basic wiring.

**Independent Test**: Save the dark theme, reload, and confirm no light flash. Operate the header control and confirm light/system/dark switch live. With the control on system, change the OS color scheme and confirm the page follows.

**Acceptance Scenarios**:

1. **Given** a saved dark theme, **When** the page is reloaded, **Then** it paints dark on the first frame with no intermediate light flash.
2. **Given** the running example, **When** the visitor changes the header control between light, system, and dark, **Then** the theme changes immediately without a page reload.
3. **Given** the header control set to system, **When** the operating system color scheme changes, **Then** the example updates live to match.
4. **Given** storage is blocked, **When** the page loads, **Then** the example falls back to the documented defaults rather than erroring.
5. **Given** the pinned showcase on the nested route, **When** it renders, **Then** the vaporwave aesthetic and compact density apply together through `forced`, labeled as an alternative aesthetic composed with compact density rather than a color-scheme variant.
6. **Given** a chosen theme and density on the home page, **When** the visitor navigates to the nested route and back, **Then** both persist with no flash.

---

### User Story 3 - See how to override the defaults (Priority: P3)

A consumer evaluating the system wants to know how to make it look like their brand, not the default. The starter shows the override pattern in place: a way to supply their own font and their own colors on top of the design-system tokens, written so it is obvious which lines to change and which to delete.

**Why this priority**: "How do I customize this" is the first question after "does it run." A clone-able starter that shows the override seam is far more useful than one that only shows the defaults. It is P3 because the example still teaches the core wiring without it, but showing both the font and palette overrides in code is what makes the customization seam concrete.

**Independent Test**: Confirm the custom font and custom colors render in the running example, and that removing the override block reverts the look to the design-system defaults with no other change.

**Acceptance Scenarios**:

1. **Given** the running example, **When** a developer inspects the customization block, **Then** it is clearly marked as consumer-owned overrides layered on top of the design-system tokens.
2. **Given** the override block, **When** a developer removes it, **Then** the example reverts to design-system defaults and still runs.

---

### User Story 4 - See components rendering with the tokens (Priority: P3)

A developer wants to confirm that real components, not just raw CSS variables, pick up the design-system styling. The starter uses each published primitive at least once across plausible, mobile-first layouts, so the proof is "these components look right out of the box," while exhaustive per-state coverage stays in Storybook.

**Why this priority**: It closes the loop from tokens to components. The published Storybook documents every component's states; the starter shows each primitive once in a realistic, mobile-first context to prove the set works end to end.

**Independent Test**: Load the page and confirm the included components render with design-system styling and respond to the active theme and density.

**Acceptance Scenarios**:

1. **Given** the running example, **When** the demonstration page loads, **Then** the included components render with design-system styling.
2. **Given** the active theme or density changes, **When** the page is already open, **Then** the included components reflect the change.

---

### User Story 5 - Keep the example from rotting (Priority: P3)

A maintainer changes a component, a token, or the wiring and needs to know the example still works without manually clicking through every flow. End-to-end tests cover the headline experiences and run in CI, so a regression fails loudly instead of decaying silently until a consumer hits it.

**Why this priority**: The example grew past a proof-of-concept, so it earns the same maintenance guardrails as the rest of the repo. It is P3 because the tests presuppose the experiences they guard and therefore follow the stories above, but given the expanded scope they are not optional.

**Independent Test**: Run the e2e suite against the built example; it exercises the headline flows and fails if any regress.

**Acceptance Scenarios**:

1. **Given** the example, **When** the e2e suite runs in CI, **Then** it covers first-paint theming, live toggle switching, OS-follow on system, the vaporwave + compact composition, each demonstrated primitive rendering, and the narrow-width layout.
2. **Given** a regression such as a reappearing flash or a dead toggle, **When** the suite runs, **Then** it fails and names the broken experience.

---

### Edge Cases

- Storage is blocked or unavailable (privacy mode, disabled cookies): the bootstrap falls back to the documented defaults for both axes rather than throwing.
- The page is opened with no saved preference at all: it paints the default theme and density on the first frame.
- A consumer clones the directory but forgets to change the `workspace:*` deps: the README's clone steps call this out so the failure is self-explanatory.
- JavaScript is disabled: the page still renders with the default (or pre-saved) theme, even though the toggle cannot operate.
- A component is placed in a narrow container such as a sidebar or modal rather than full width: container-query-driven layout keeps it correct instead of relying on the viewport width.

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: The example MUST live at `examples/nextjs-15-app-router/` as a workspace member that pins `@unbranded-ds/tokens` and `@unbranded-ds/react` at `workspace:*`, and MUST be excluded from publishing.
- **FR-002**: The example MUST start from the workspace with a single documented command and no manual setup beyond a normal install.
- **FR-003**: The base Tailwind wiring MUST be exactly the two canonical import lines from spec 002, with no additional design-system configuration. The theme CSS files (dark, vaporwave, compact) and the consumer override block are separate, clearly-labeled additive imports in the same file, not part of the two-line wiring.
- **FR-004**: The example MUST inline the theme bootstrap so both the aesthetic and density axes are applied before first paint, preventing a flash of the wrong theme on reload.
- **FR-005**: The header MUST include the theme control from spec 011, and switching light/system/dark MUST take effect without a page reload.
- **FR-006**: While the theme control is set to system, the example MUST follow the operating system color scheme live.
- **FR-007**: The example MUST be self-contained enough that copying the directory out of the repo and replacing the two `workspace:*` deps with published versions yields a working app, with no remaining dependency on the monorepo.
- **FR-008**: The example MUST include a README that explains what it is and is not, gives the exact command to get a fresh copy outside the monorepo, walks through the few interesting files, and links the main README and AGENTS.md. The README MUST pass a humanizer pass and be written for both human and agent readers (Constitution Section XI).
- **FR-009**: The example MUST NOT include a backend, data fetching, authentication, unit-test fixtures, or its own Storybook; it stays a static starter. End-to-end tests are a deliberate exception (see FR-016): the expanded scope needs a guardrail against rot, which the brief's blanket no-tests stance predates.
- **FR-010**: The example MUST demonstrate the density axis in addition to the aesthetic axis, consistent with the post-009 theming model (both axes are real and composable).
- **FR-011**: The example MUST include at least one example of each component exported from the public root of `@unbranded-ds/react`, in plausible, mobile-first contexts, so component-level styling is proven across the whole published surface. The exact set is enumerated from the package exports at plan time. It still does not reimplement Storybook's exhaustive states and controls; it shows each component working once, in a realistic page.
- **FR-012**: The example MUST demonstrate the aesthetic and density toggles (light/system/dark and comfortable/compact). It MUST also showcase the vaporwave aesthetic composed with the compact density in a section pinned through the spec-011 `forced` API (a `ThemeProvider` with `forced={{ aesthetic: 'vaporwave', density: 'compact' }}`), so multi-axis composition is shown rather than described. The section MUST be framed accurately: vaporwave is an alternative aesthetic value today, a sibling of light/dark rather than a color-scheme layered on them, and the framing MUST point to the planned color-scheme axis split (see Design-system follow-ups) so the demo does not imply a composition the model does not yet support.
- **FR-013**: The example MUST demonstrate consumer overrides in code: both a self-hosted font applied over the font token (via `next/font/local`) and a `:root` color-palette override on the design-system color tokens, each clearly marked as consumer-owned and removable.
- **FR-014**: At least one interactive element (the home page's Card on hover) MUST use a transition built from the motion tokens (`--duration-*` and `--easing-*`), so motion is shown as token-driven rather than hardcoded.
- **FR-015**: The example MUST be mobile-first: base styles target small screens and enhancements layer up. Responsive behavior MUST be expressed with container queries wherever a container query can express it, falling back to viewport queries only where it genuinely cannot. It MUST include a concrete container-query demonstration that renders one component in two different container widths side by side, each reflowing by its own container rather than the viewport. The example is the reference pattern consumers and agents copy, so the approach it models matters as much as the result it produces.
- **FR-016**: The example MUST ship an end-to-end test suite (Playwright) that runs against the production build (`next build` then `next start`), since the no-flash behavior is only meaningful at production hydration timing. The suite covers the headline experiences with functional assertions and no visual snapshots: it renders with design-system styling, paints a saved theme with no flash on reload, switches light/system/dark live, follows the OS while on system, shows the pinned vaporwave + compact composition, renders each demonstrated component, holds its layout at a narrow width, and keeps theme and density across navigation to the nested route. It MUST also run axe accessibility assertions on the key views. The suite MUST run in CI so a regression fails loudly rather than rotting unnoticed.
- **FR-017**: The example MUST be structured as a single primary page plus one nested App Router route. The nested route MUST demonstrate that theme and density persist across client navigation with no flash (the bootstrap and provider live in the root layout), and it MUST host the pinned vaporwave + compact showcase from FR-012.
- **FR-018**: The example MUST be held to the repository's strict TypeScript and lint rules and MUST run its Playwright suite in CI, but MUST be excluded from the published build and any release manifest. It is reference code that agents copy, so the same checks as the packages keep it honest without it becoming a shipped artifact.

### Key Entities

This feature persists no new data. It reads and writes the existing theme and density preferences through the storage keys the design system already owns; it introduces no entities of its own.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: A developer can go from "I have the published packages" to "the example is running outside the monorepo" by following only the README, with no steps discovered by trial and error.
- **SC-002**: On reload with a saved dark theme, the example shows zero frames of the light theme before settling (no visible flash).
- **SC-003**: Switching the theme control, or changing the OS scheme while on system, updates the page within one interaction and with no reload.
- **SC-004**: The base design-system styling traces to the two canonical import lines, verifiable by reading one file; the theme imports and the override block are clearly-labeled additions in that same file rather than hidden configuration.
- **SC-005**: Removing the consumer-override block reverts the example to design-system defaults with no other change, showing that overrides are additive and optional.
- **SC-006**: A reader (human or agent) can identify every file they would edit to adapt the starter to a new project from the README walkthrough alone.
- **SC-007**: The example is legible and usable at a 360px-wide viewport with no horizontal scroll, and its responsive layout shifts are driven by container size rather than the viewport wherever a container query applies.
- **SC-008**: The end-to-end suite passes against the production build and runs in CI; a deliberately introduced regression in any headline experience (theme flash, a toggle, OS-follow, the composition, a component, narrow-width layout) causes a failure.
- **SC-009**: axe reports no serious or critical violations on the example's key views, and theme and density survive navigation to the nested route and back with no flash.

## Assumptions

- The example targets Next.js 15 with the App Router, since that is the framework the brief names and the most common consumer target today. A non-Next.js example is deferred until there is demand.
- The example is a starter, not a tutorial and not a test fixture; it ships no tests of its own, consistent with the brief.
- The example reflects the component API as of spec 013 (vocabulary harmonization) and the theming model as of spec 014 (resolution unification), since it lands after both.
- "Simple and clone-able" governs structure and clarity, not feature count (per the clarifications): the example demonstrates the full primitive set, multi-axis theming, and the override seam, organized so it still clones out cleanly and reads mobile-first. Storybook stays the home for exhaustive per-component states; the example shows each primitive once, in context.
- Mobile-first with container queries is the default responsive posture, per the steering. Container queries are preferred because the starter gets copied into layouts the design system cannot predict (a sidebar, a modal, a full page), and querying the container rather than the viewport is what keeps a copied component correct in its new home.
- Deployment configuration (Vercel, Netlify, and the like) is left to the consumer and out of scope.

## Out of Scope

- A second example for a non-Next.js framework (deferred until demand exists).
- A Vue or Svelte example (no such React package exists yet).
- Deployment configuration for any host.
- CMS integration, internationalization, or other application-pattern demonstrations.
- Reimplementing Storybook or any component documentation the published Storybook already provides.
- Unit tests or any component-test fixture for the library itself (the example is not a test harness). End-to-end smoke tests of the example's own experience are in scope per FR-016.

## Design-system follow-ups

Discovered while specifying and clarifying this example, recorded so the next agent sees them rather than rediscovering them. None of this is in scope here. The first item is a planned theming change with its own brief; the rest are container-query ergonomics, candidates for a future tokens or preset spec.

- The color-scheme axis split, captured as its own brief. Today the aesthetic axis conflates color-scheme (light/dark, with `system` resolving against the OS) and aesthetic identity (default, brand, vaporwave) into one set of mutually-exclusive values, so vaporwave-light and vaporwave-dark cannot be expressed. Splitting color-scheme into its own axis, composed with aesthetic identity, is the planned direction, and spec 011 left an additive seam for it. See [spec-016-color-scheme-axis-split.md](../../docs/workshops/2026-05-18/spec-016-color-scheme-axis-split.md). This example signposts the split rather than waiting on it (FR-012).
- A container-type recipe in the preset. Tailwind v4 supports `@container`, but a consumer still hand-writes `container-type` to opt a region in. The preset could ship a documented recipe or utility so a layout region becomes a query container in one line.
- Container-query breakpoint tokens. Expose named breakpoint tokens usable inside `@container` min-width queries, so consumers thread responsive thresholds against the system's sizes instead of magic numbers.
- Container-query-aware components. Audit the published components for ones that should reflow on their container's width rather than the viewport (a toolbar, a card, the SegmentedControl). A copied component lands in containers the library cannot predict, so container-relative behavior is what keeps it correct.
- Density that follows the container. The density axis and container queries solve adjacent problems. A recipe for "switch to compact below a container width" would give responsive ergonomics without per-component overrides, and this example is the natural place to first demonstrate it.

Discovered during implementation (the spec 015 build):

- The library ships no `'use client'` directive, so React Server Component consumers must wrap usage in their own client boundary. Captured as its own brief: [spec-017-react-use-client.md](../../docs/workshops/2026-05-18/spec-017-react-use-client.md). The example uses a client `AppShell` as the interim pattern; once the directive ships, the example could import the design system directly into server components.
- The vaporwave theme's `muted-foreground` fails WCAG AA contrast on its own background (3.83:1, caught by axe on the showcase route). The theme validator only checks the declared foreground/background pairs, so this slipped through. Worth reviewing the vaporwave (and likely dark) muted pairs, or widening the validator's checked pairs.
- The built preset CSS emits a lightningcss escaping warning on a `size-` selector during the example's build. Cosmetic (the build still succeeds), but a clean target for a preset pass.
