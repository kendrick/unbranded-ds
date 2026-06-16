# Implementation Plan: React Server Component-importable component package

**Branch**: `017-react-use-client` | **Date**: 2026-06-16 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/017-react-use-client/spec.md`

## Summary

`@unbranded-ds/react` bundles every component into one `dist/index.js` that carries no `'use client'` directive. The components all use hooks, so they are client components — but without the directive a React Server Component bundler drags their client-only code into the server graph and the build fails. A consumer's only escape today is to wrap every design-system usage in their own `'use client'` boundary, which the example app does in `app/components/app-shell.tsx`.

The fix is a tsup `banner` that prepends `'use client';` to the single bundled entry, declaring the whole package a client module (the clarified whole-entry approach). The public API does not change — same exports, same props, same behavior (FR-003). Two guards keep it from silently regressing: a Vitest unit test asserting the built `dist/index.js` begins with the directive, and the example app's `next build` (already run by the `example-e2e` CI job) once its server `layout.tsx` imports the design system directly. The example then drops the workaround-only `AppShell` wrapper, keeping `'use client'` only where a component holds genuine client state.

## Technical Context

**Language/Version**: TypeScript 5.x, strict, no `any` (Constitution VIII)
**Primary Dependencies**: tsup ^8 (the bundler gaining the banner), React 19 (peer), `@base-ui-components/react` (peer), Next.js 15 App Router (the RSC consumer and guard), Vitest ^3 (the directive unit test), `@playwright/test` (the example e2e that runs `next build`)
**Storage**: N/A — build/packaging change; no runtime or persisted state
**Testing**: Vitest unit test asserting the built bundle's first line is the directive (runs in the `verify` job after `pnpm build`), plus the example app's production `next build` via Playwright (the `example-e2e` job) as the real RSC-import guard
**Target Platform**: ESM consumers, specifically React Server Component bundlers — Next.js App Router and RSC-aware bundlers generally; non-RSC consumers are unaffected
**Project Type**: monorepo — a `packages/react` build-config change plus an `examples/nextjs-15-app-router` rewire
**Performance Goals**: N/A — one build-time directive line; zero runtime cost
**Constraints**: public API frozen (FR-003); tree-shaking preserved (`sideEffects: false` stays, the directive is not a runtime side effect); no new package (Constitution I)
**Scale/Scope**: one tsup config line, one unit test, dissolve one example wrapper and audit ~4 `'use client'` files, one changeset

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Section I (repository shape)** — PASS. No new package; the change lives in the existing `packages/react` build config and the example app.
- **Section IV (component set)** — PASS. No component added, removed, or renamed; this is packaging, not surface.
- **Section VI (testing)** — PASS. The three-layer rule governs components; this packaging change carries no new component, so no new stories, play functions, or a11y runs. It is guarded instead by a Vitest unit test (the built-bundle directive) and the example's `next build`, the layers that actually apply.
- **Section VIII (tooling baseline)** — PASS. tsup stays the bundler; a `banner` is configuration, not a substitution, so no amendment is needed.
- **Section IX.6 (SSR/RSC compatibility)** — PASS. This feature fulfills the commitment: it extends the existing SSR safety to a clean RSC *import*, which is the whole point.
- **Section X (changeset per PR)** — PASS. FR-007 ships a `.changeset/*.md` declaring a patch on `@unbranded-ds/react`.
- [x] **Section XI — does this change keep prose, API shape, docs surfaces, failure modes, and story coverage legible to both agents and humans? List any concessions.**
  - Prose: research, quickstart, the changeset, and commit/PR text pass through the `humanizer` skill before merge.
  - API shape: unchanged (FR-003), so no new vocabulary, props, or slots to harmonize.
  - Failure modes: both guards fail loudly and legibly — the unit test asserts the directive with a named expectation, and a regressed bundle makes the example's `next build` fail with the bundler's own RSC error.
  - Story coverage: no new component, so no story delta.
  - **Concession**: the whole-entry banner marks the pure `cn` helper (and erased types) as client-tagged from the main entry. A server-safe entry is deferred until a consumer needs one (clarified). This is an intentional, documented ergonomics trade, not a silent one.

No violations. Complexity Tracking below is intentionally empty.

## Project Structure

### Documentation (this feature)

```text
specs/017-react-use-client/
├── plan.md              # This file (/speckit.plan output)
├── research.md          # Phase 0 output — the banner, the guard split, the cn/types rationale
├── quickstart.md        # Phase 1 output — how to verify the RSC import end to end
├── checklists/
│   └── requirements.md  # /speckit.specify output (clarifications locked)
└── tasks.md             # /speckit.tasks output (NOT created here)
```

No `data-model.md` and no `contracts/`: there are no entities (the only "entity" is the built bundle, whose sole change is a leading directive line), and FR-003 freezes the public API, so there is no interface contract to define. The verifiable invariant — "the built bundle begins with `'use client'`" — is a build-output guarantee, captured in research and quickstart and enforced by the directive unit test, not an API surface.

### Source Code (repository root)

```text
packages/react/
├── tsup.config.ts                  # ADD banner: { js: "'use client';" }
└── src/
    └── use-client-directive.test.ts  # NEW unit test — built dist/index.js starts with the directive

examples/nextjs-15-app-router/
└── app/
    ├── layout.tsx                  # import ThemeProvider/SkipLink/Header from the DS directly (server component)
    └── components/
        ├── app-shell.tsx           # DELETE — the wrapper existed solely to be the 'use client' boundary
        └── header.tsx              # may drop 'use client' (no client state of its own; the toggles stay client refs)

.changeset/
└── <generated>.md                  # NEW — patch @unbranded-ds/react
```

**Structure Decision**: The fix is one line in `packages/react/tsup.config.ts`. The directive unit test lives under `packages/react/src/` so the existing `unit` Vitest project (glob `src/**/*.test.{ts,tsx}`) picks it up; it reads the built `dist/index.js`, so — like the token-query MCP smoke test — it depends on a prior `pnpm build`, which the `verify` job already runs first. The example rewire dissolves `AppShell` into the server `layout.tsx` (the layout becomes the server component that imports the DS), and audits the remaining `'use client'` files so only genuine client state keeps a boundary.

## Complexity Tracking

> No Constitution Check violations. No entries.
