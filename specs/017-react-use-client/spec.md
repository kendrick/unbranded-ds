# Feature Specification: React Server Component-importable component package

**Feature Branch**: `017-react-use-client`
**Created**: 2026-06-16
**Status**: Draft
**Input**: User description: "@docs/workshops/2026-06-15/spec-017-react-use-client.md"

## Clarifications

### Session 2026-06-16

- Q: How should the package declare itself a client module? → A: A whole-entry banner — prepend the directive to the single bundled entry, marking every export a client reference. A per-component split is deferred unless a consumer needs a server-safe export.
- Q: How should CI guard against the directive being dropped later? → A: A cheap directive check on the built bundle plus the example app's server-component build (US3) as the real RSC guard — no separate smoke fixture, since the example proves the same thing.
- Q: Should the class-name helper `cn` stay server-importable? → A: Defer — with the whole-entry approach `cn` is client-tagged from the main entry; add a server-safe entry only if a consumer needs it. Types are erased and stay server-safe regardless.

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Import a component into a server component without boilerplate (Priority: P1)

A developer building a Next.js App Router app (or any React Server Component setup) imports a design-system component — say `Button` — into a server component and runs the build. Today that build fails: the component uses client-only React features, the published bundle does not declare itself a client module, and the bundler drags client code into the server graph. The developer's only workaround is to wrap every design-system usage in their own `'use client'` boundary. After this change the import just works; the package declares itself a client module, so the consumer adds nothing.

**Why this priority**: Next.js App Router is the headline consumer target, and the constitution already commits to server-rendering compatibility (Section IX.6). A first import failing the build is the worst possible first impression, and the workaround is friction the library should absorb, not push onto every consumer.

**Independent Test**: Import a design-system component into a server component and build (the example app's server component is the in-repo instance). The build succeeds with no consumer-added `'use client'` boundary. Delivers a clean import on its own.

**Acceptance Scenarios**:

1. **Given** a server component in a Next.js App Router app, **When** it imports and renders a design-system component and the app builds, **Then** the build succeeds without the consumer adding a `'use client'` directive.
2. **Given** an existing client component that already uses design-system components, **When** the package ships the directive, **Then** that usage keeps working unchanged.
3. **Given** a consumer who imports a design-system component, **When** they inspect the published bundle, **Then** it declares itself a client module at the top.

---

### User Story 2 - The fix is guarded against regression (Priority: P2)

A contributor changes the build configuration or the bundler later. If that change drops the client-module declaration, CI fails, because a check confirms the published bundle still carries it and a server-component import of the package still builds. The gap that produced this defect — nothing verified the published bundle's server-importability — is closed.

**Why this priority**: The declaration is a single easily-lost line of build config. Without a guard, a future build change silently reintroduces the consumer break, which only surfaces in a consumer's app, not this repo.

**Independent Test**: Remove the directive from the build output and confirm the guard fails (the bundle directive check, or the example app's server-component build); restore it and the guard passes.

**Acceptance Scenarios**:

1. **Given** the build output, **When** CI runs, **Then** it verifies the published bundle declares itself a client module.
2. **Given** a server-component import of the package (the example app's server component), **When** CI builds it, **Then** it succeeds, and a regression that drops the declaration makes it fail.

---

### User Story 3 - The example demonstrates the direct-import pattern (Priority: P3)

The reference Next.js app currently wraps its design-system usage in `'use client'` boundaries as the interim pattern, including a shell component whose only job is to be that boundary. Once the package carries the declaration, the example imports the design system directly into its server components and drops the wrapper that existed solely to work around the gap, showing consumers the intended, boilerplate-free pattern. Components that hold their own client state keep their boundary, because that is legitimate, not a workaround.

**Why this priority**: It turns the example from a "here's the workaround" demo into a "here's how it's meant to work" demo, but it depends on US1 landing and carries no user-facing value on its own.

**Independent Test**: With the package shipping the declaration, the example imports a design-system component into a server component (no blanket wrapper), and its build and end-to-end suite stay green.

**Acceptance Scenarios**:

1. **Given** the package ships the declaration, **When** the example removes the workaround-only wrapper and imports the design system into a server component, **Then** the app builds and its existing end-to-end tests pass.

---

### Edge Cases

- **Pure utility imported server-side**: the package also exports a class-name helper. With the whole entry declared a client module, importing that helper from the main entry into a server component would treat it as client. A consumer needing it server-side is an edge case, handled by a separate server-safe entry only if it actually arises (out of scope here).
- **Type-only imports**: types are erased at build time, so they remain server-safe regardless of the declaration.
- **Existing client-component consumers**: the declaration must not change behavior for the current pattern (importing into a client component).
- **Tree-shaking**: declaring the entry a client module must not prevent a consumer's bundler from dropping unused exports.
- **Non-Next.js bundlers**: the declaration is a standard React convention; consumers on other RSC-aware bundlers get the same benefit, and consumers with no RSC concept are unaffected.

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: A design-system component imported into a React Server Component MUST build without the consumer adding a `'use client'` boundary.
- **FR-002**: The published package MUST declare itself a client module so a React Server Component bundler treats its exports as client references rather than dragging client code into the server graph.
- **FR-003**: The public API MUST NOT change — same exports, same component props, same runtime behavior. This is a packaging and labeling change only.
- **FR-004**: The fix MUST be guarded against regression by a check that the built bundle declares itself a client module AND a server-component build that imports the package. The example app's server-component import (FR-005) serves as that build, so no separate smoke fixture is added. A change that drops the declaration MUST fail CI.
- **FR-005**: The example app MUST demonstrate importing the design system directly into a server component, dropping any wrapper that exists solely to satisfy the previously-missing declaration, while keeping boundaries that wrap genuine client state.
- **FR-006**: Existing client-component usage of the design system MUST keep working unchanged after the declaration ships.
- **FR-007**: The change MUST ship with a changeset declaring the affected package and bump level.

### Key Entities _(include if feature involves data)_

- **Published bundle**: the built entry of the component package that consumers import. The change is whether this artifact declares itself a client module at its top; its exports and their behavior are unchanged.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: A Next.js App Router build that imports a design-system component into a server component succeeds, where it fails today.
- **SC-002**: The published bundle declares itself a client module at the top, verifiable by inspecting the build output.
- **SC-003**: A regression that drops the declaration is caught by CI (the bundle directive check, or the example app's server-component build), so the consumer break cannot silently return.
- **SC-004**: The example app builds and passes its end-to-end suite with the design system imported into a server component and no workaround-only wrapper.

## Assumptions

- The whole-entry approach is the default: the package declares its single entry a client module, marking all exports client. This solves the consumer break in one step; a per-component split that keeps genuinely server-safe exports server-importable is deferred unless a consumer needs one.
- The class-name helper and types are the only non-component exports. Types are erased and stay server-safe; a server-side need for the helper is an edge case handled by a separate entry only if it arises.
- The components are inherently client components (they use hooks); this feature labels them so RSC consumers can import them, rather than converting them to server components.
- There are no external consumers depending on the current declaration-less bundle in a way the declaration would break; existing client-component usage is unaffected.
- The example app's server-component build (its end-to-end CI job) is the regression signal for the consumer-facing break; no separate smoke fixture is added, since the example proves the same RSC import.
