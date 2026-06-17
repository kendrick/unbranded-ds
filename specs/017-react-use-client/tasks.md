---
description: "Task list for spec 017 — React Server Component-importable component package"
---

# Tasks: React Server Component-importable component package

**Input**: Design documents from `/specs/017-react-use-client/`
**Prerequisites**: [plan.md](./plan.md) (required), [spec.md](./spec.md) (user stories), [research.md](./research.md), [quickstart.md](./quickstart.md)

**Tests**: One test is in scope — the directive unit test (US2's regression guard, FR-004). It is the feature's guard, not optional TDD scaffolding, so it appears as a real task. No other test tasks are generated.

**Organization**: Tasks are grouped by user story. US1 (the banner) is the MVP and the prerequisite for US2 and US3; US2 and US3 touch disjoint files and are independent of each other.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[Story]**: US1, US2, US3 — maps to the spec's user stories

## Path Conventions

Monorepo. The fix lives in `packages/react/`; the demonstration lives in `examples/nextjs-15-app-router/`. Paths below are repo-root-relative and exact.

---

## Phase 1: Setup

No setup tasks. No new package, dependency, or scaffolding — tsup, Vitest (the `unit` project, glob `src/**/*.test.{ts,tsx}`), and the example's Playwright e2e are already configured. The first change is the banner in US1.

---

## Phase 2: Foundational

No standalone foundational phase. The one blocking prerequisite for US2 and US3 — the bundle carrying the directive — is US1's own deliverable, so it lives in US1 rather than ahead of it.

---

## Phase 3: User Story 1 - Import a component into a server component without boilerplate (Priority: P1) 🎯 MVP

**Goal**: The published bundle declares itself a client module, so a React Server Component can import a design-system component and build with no consumer-added `'use client'` boundary.

**Independent Test**: Build `@unbranded-ds/react` and confirm `dist/index.js` begins with `'use client';`. Importing a component into a server component then builds clean (the example layout in US3 is the in-repo instance).

### Implementation for User Story 1

- [x] T001 [US1] Add a `'use client'` banner to the build in `packages/react/tsup.config.ts` — set `banner: { js: "'use client';" }` in the tsup config object, so the bundled entry begins with the directive. (Per research: a banner is the reliable way to land the directive as the literal first line; esbuild does not carry a source-level directive through bundling.)
- [x] T002 [US1] Build the package (`pnpm --filter @unbranded-ds/react build`) and confirm `packages/react/dist/index.js` first line is `'use client';` (`head -n 1`). Maps to AS3 / SC-002.

**Checkpoint**: The bundle declares itself a client module. A server component can import the design system and build — the consumer break is closed.

---

## Phase 4: User Story 2 - The fix is guarded against regression (Priority: P2)

**Goal**: A future build change that drops the directive fails CI.

**Independent Test**: Remove the banner, rebuild, and the directive unit test fails; restore it and the test passes.

**Note on the two-part guard (per clarification)**: the _directive check_ is the new unit test below. The _server-component build_ half is delivered by US3 — the example app's production `next build` in the `example-e2e` CI job — not a separate smoke fixture. So US2's only new artifact is the unit test; the build-guard rides US3.

### Implementation for User Story 2

- [x] T003 [P] [US2] Add a Vitest unit test at `packages/react/src/use-client-directive.test.ts` that reads the built `packages/react/dist/index.js` via `node:fs` and asserts its first line is `'use client';`. The `unit` project's glob (`src/**/*.test.{ts,tsx}`) picks it up; the test reads the build artifact, so it depends on a prior `pnpm build` — the same build-first order the token-query MCP smoke test relies on, which the `verify` CI job already runs.
- [x] T004 [US2] Verify the guard trips: temporarily remove the banner from `tsup.config.ts`, rebuild, confirm T003's test fails, then restore the banner and confirm it passes (quickstart step 2). Run this in isolation — it mutates the shared build config, so no concurrent `@unbranded-ds/react` build (T002, T008) should overlap it.

**Checkpoint**: A dropped directive is caught — by the unit test on the package's own path, and by the example build once US3 lands.

---

## Phase 5: User Story 3 - The example demonstrates the direct-import pattern (Priority: P3)

**Goal**: The example imports the design system directly into a server component and drops the wrapper that existed only to be the `'use client'` boundary, keeping boundaries that wrap genuine client state.

**Independent Test**: With the banner shipped, the example drops `AppShell`, the server `layout.tsx` imports the design system directly, and the example's `next build` plus Playwright e2e stay green.

### Implementation for User Story 3

- [x] T005 [US3] Rewrite `examples/nextjs-15-app-router/app/layout.tsx` to import `ThemeProvider`, `SkipLink`, and `Header` from `@unbranded-ds/react` directly and render them inline in the server layout, moving `AppShell`'s structure (the `<main id="main">` wrapper around `{children}`) into the layout. The layout stays a server component (`next/font/local` still runs here); `{children}` continue to pass through as server content inside the client `ThemeProvider`.
- [x] T006 [US3] Delete `examples/nextjs-15-app-router/app/components/app-shell.tsx` — the wrapper existed solely to be the `'use client'` boundary the package now carries itself.
- [x] T007 [P] [US3] Audit the remaining `'use client'` files under `examples/nextjs-15-app-router/app/components/` (`header.tsx`, `gallery.tsx`, `cq-demo.tsx`, `pinned-vaporwave.tsx`): keep the directive where the component holds its own client state (hooks, handlers), drop it where it only stood in for the missing package directive. `header.tsx` composes the client toggles but holds no state of its own, so it is the prime candidate to become a server component; verify each of the others against its actual usage before removing anything.
- [x] T008 [US3] Build the packages and run the example end to end: `pnpm --filter @unbranded-ds/tokens --filter @unbranded-ds/react build` then `pnpm --filter @unbranded-ds/example-nextjs e2e`. Playwright's webServer runs the production `next build` (the real RSC-import guard) then `next start`; confirm the build and the suite pass. Maps to SC-004.

**Checkpoint**: The example shows the intended boilerplate-free pattern, and its production build is the live RSC guard for US2.

---

## Phase 6: Polish & Cross-Cutting Concerns

- [x] T009 [P] Add a changeset at `.changeset/react-rsc-use-client.md` declaring a **patch** on `@unbranded-ds/react` (build-only change; the public API is unchanged). Satisfies FR-007 and Constitution X. Prose passes through the `humanizer` skill before merge.
- [x] T010 Run the CI-equivalent locally as the final gate: `pnpm typecheck`, `pnpm build`, `pnpm test:unit` (now including T003's directive test), and the example e2e (T008). Green across all confirms the guard works, the example builds RSC-clean, and existing client-component usage is unchanged (FR-006).

---

## Dependencies & Execution Order

### Story dependencies

- **US1 (P1)** — the banner. No dependencies. The prerequisite for US2 and US3 (both need the directive to exist before they can pass).
- **US2 (P2)** — depends on US1 (the test asserts the directive the banner produces). Independent of US3 (different files: `packages/react` vs `examples/`).
- **US3 (P3)** — depends on US1 (the example imports the design system server-side, which only builds once the directive ships). Independent of US2.

### Within each story

- US1: T001 → T002 (build after the banner).
- US2: T003 → T004 (the guard-trip check needs the test in place).
- US3: T005 → T006 (delete the wrapper after its content moves to the layout); T007 is parallel to T005 (different files); T008 last (needs the rewired example).

### Parallel opportunities

- After T001 lands, US2 (T003) and US3 (T005, T007) proceed in parallel — disjoint files.
- T004 is the exception: it mutates `tsup.config.ts`, so it must not overlap any `@unbranded-ds/react` build (T002, T008).
- T009 (changeset) is independent and can be written any time.

---

## Implementation Strategy

### MVP (US1 only)

T001 + T002 close the consumer break on their own — the bundle declares itself a client module and a server component can import the design system. Ship-ready as a patch even before US2/US3.

### Incremental delivery

1. US1 → the break is fixed (MVP).
2. US2 → the directive unit test guards the package path.
3. US3 → the example demonstrates the clean pattern and its build becomes the live RSC guard.
4. Polish → changeset + the full local CI gate.

### Suggested commit grouping

Per the repo's small-atomic-commit norm: one commit for US1 (banner + build confirm), one for US2 (the directive test), one for US3 (the example rewire — layout + wrapper deletion + the `'use client'` audit together, since they are one logical change), and one for the changeset. The final validation (T010) gates the push, not a commit of its own.

---

## Notes

- The feature is build-and-packaging only — no public API, prop, or behavior change (FR-003). That is why there are no component/story/a11y tasks: Section VI's three-layer rule governs components, and none is added.
- `[P]` = different files, no dependency on incomplete work. `[Story]` maps each task to its user story for traceability.
- Verify the example build genuinely exercises a server-component import of the design system before relying on it as the guard — that coupling is US2's build-half (per the clarification).
