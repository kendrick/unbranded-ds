# Implementation Plan: Next.js 15 example app

**Branch**: `015-nextjs-example-app` | **Date**: 2026-06-15 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/015-nextjs-example-app/spec.md`

## Summary

A Next.js 15 App Router starter under `examples/nextjs-15-app-router/` that wires `@unbranded-ds/tokens` and `@unbranded-ds/react` through the canonical two-line Tailwind import and proves the wiring works end to end. It demonstrates flash-free multi-axis theming (the light/system/dark and density toggles plus a pinned vaporwave + compact showcase on a nested route), the consumer-override seam (a self-hosted font and a palette override), one example of each public component, and a mobile-first layout that uses container queries. A Playwright suite runs against the production build, asserts the headline experiences plus axe on the key views, and runs in CI. The example is held to the repo's strict TypeScript and lint but is private and excluded from publish.

## Technical Context

**Language/Version**: TypeScript 5.x, strict, no `any` (Constitution VIII). React 19, Next.js 15 (App Router).
**Primary Dependencies**: `next` ^15, `react`/`react-dom` 19, `@unbranded-ds/tokens` and `@unbranded-ds/react` at `workspace:*`, Tailwind CSS v4 (consumed through `@unbranded-ds/react/preset.css`), `next/font/local` (self-hosted font), `@playwright/test`, `@axe-core/playwright`.
**Storage**: `localStorage` only, through the design system's existing keys (`unbranded-ds-theme`, `unbranded-ds-density`, `unbranded-ds-theme-preference`). No new storage.
**Testing**: Playwright end-to-end against the production build (`next build` then `next start`), with `@axe-core/playwright` for accessibility. Functional assertions only, no visual snapshots. No unit or component-fixture tests in the example.
**Target Platform**: Modern evergreen browsers; server-rendered by Next.js; mobile-first from 360px up.
**Project Type**: Example web application, a new workspace member under `examples/` (not a published package).
**Performance Goals**: Zero light frames before a saved dark theme settles (no flash); theme/density change applies within one interaction without reload; usable with no horizontal scroll at 360px.
**Constraints**: The Tailwind/preset wiring is exactly the two canonical lines (theme CSS and overrides are clearly separate, additive imports); responsive behavior uses container queries wherever they apply; SSR-safe (no `window`/`document` at render); excluded from the published build and any release manifest.
**Scale/Scope**: One app, two routes (home plus one nested), 16 public components demonstrated once each, one pinned theme composition, an e2e suite covering roughly eight headline flows plus axe.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-checked after Phase 1 design.*

This PR adds `examples/` and edits root config (`pnpm-workspace.yaml`, `turbo.json`, `.github/workflows/ci.yml`). It does not touch `packages/react/`, `packages/tokens/`, or `apps/storybook/` source, so the changeset-presence gate (Section X) is not triggered and no `.changeset` file is required. The Constitution Check is run anyway, per the plan template.

- [x] **Section XI — agent and human legibility**: This is the central gate here. The example and its README are explicitly artifacts agents read to scaffold a consumer app (Section XI.3 spirit). The README and any inline doc strings pass the humanizer skill before merge, avoid three-item-list tics, and are written for both audiences (FR-008). The wiring is predictable: the canonical two lines, then clearly-labeled additive theme imports and a removable override block. Failure framing for the vaporwave demo is explicit (it is an alternative aesthetic today, not a color-scheme), so neither a human nor an agent infers a composition the model does not support.
- [x] **Section II — tokens stay independent**: The example only consumes tokens through the preset, the CSS variable themes, and the `/runtime` bootstrap. It does not reach into token internals or add a React dependency to the tokens graph.
- [x] **Section III — theming contract**: The example demonstrates the contract rather than inventing a second one: the inline bootstrap sets both axes before paint (no flash), and vaporwave + compact compose through the documented per-axis attributes and cascade layers, not a runtime merge.
- [x] **Section IV — token-driven styling**: The example's own styling resolves through the preset utilities and CSS variables. The palette and font overrides deliberately set token *values* (`--color-*`, `--typography-font-sans`), which is the documented consumer-override seam, not hardcoded component styling. (The no-hardcoded-color lint rule is scoped to `packages/react/src/components/**` and does not cover the example, but the example follows the spirit.)

**Scope of the constitution here**: The constitution governs the design system's own packages (`packages/tokens`, `packages/react`, `apps/storybook`): their locked build and test toolchain (VIII), their components (IV), their stories and test layers (V, VI, IX). This feature adds a *consumer* example app under `examples/`. A design system does not dictate what its consumers use, any more than it governs what Storybook or a downstream adopter may build with. So Next.js, Playwright, and `@axe-core/playwright` are consumer choices outside the constitution's scope, not concessions to weigh or amend around, and the component gates (IV/V/VI/IX) simply do not apply to an app that has no components and no Storybook surface.

What the constitution does reach here is the repo-maintained prose and the way the example consumes the system:

- [x] **Section XI** holds: the README and wiring are written for both audiences (see above).
- [x] The example consumes tokens only through the public surface (II), demonstrates the existing theming contract rather than inventing a second one (III), and uses the documented override seam rather than hardcoded component styling (the spirit of IV).

**Section I (repository shape)**: adding `examples/` is a structural addition. Read strictly, Section I counts published packages, and a private consumer-demo app is a different category. Read conservatively, Section I's own "justified in writing" path covers it, and the spec provides that justification (the consumer is new adopters; no existing package can serve, since Storybook is a component gallery, not a runnable consumer app). Either reading lands at no amendment and no violation.

**Post-design re-check (after Phase 1)**: No new violations. The contracts keep the example a faithful token consumer and a dual-audience artifact, and nothing here asks the constitution to govern downstream consumption.

## Project Structure

### Documentation (this feature)

```text
specs/015-nextjs-example-app/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
│   ├── wiring.md        # the globals.css + layout bootstrap contract
│   ├── e2e.md           # what each Playwright spec guarantees
│   └── clone-out.md     # the copy-out-of-repo contract
└── tasks.md             # Phase 2 output (/speckit.tasks, not created here)
```

### Source Code (repository root)

```text
examples/nextjs-15-app-router/
├── package.json              # private: true, workspace:* deps, next + playwright scripts
├── next.config.ts
├── tsconfig.json             # extends the repo's strict base
├── playwright.config.ts      # webServer: next build && next start (production)
├── app/
│   ├── layout.tsx            # inlines getThemeBootstrapScript(); <ThemeProvider>; header with ThemeToggle + DensityToggle; SkipLink
│   ├── globals.css           # 2 canonical lines, then additive dark/vaporwave/compact theme imports, then a :root override block
│   ├── page.tsx              # home: one example of each public component + the two-container-width CQ demo
│   └── showcase/
│       └── page.tsx          # nested route: proves theme/density persist across nav; hosts the pinned vaporwave + compact section (forced)
├── components/               # small app-local glue only (e.g., the container-query demo wrapper), not DS components
├── fonts/                    # self-hosted font file for next/font/local
├── tests/                    # Playwright specs: theming, composition, components, responsive, a11y, nav-persistence
└── README.md                 # what it is/isn't, the clone-out command, a walkthrough of the interesting files, links to README + AGENTS.md

# Root edits this feature requires
pnpm-workspace.yaml           # add 'examples/*'
turbo.json                    # add an 'e2e' task (depends on build)
.github/workflows/ci.yml      # add an example-e2e job (build packages, build example, install browsers, lint+typecheck+e2e)
```

**Structure Decision**: A new `examples/` workspace tree (the documented Section I concession). The app keeps the App Router default shape so a cloner recognizes it. Demonstration glue that is not a design-system component lives in the app's own `components/` so the line between "the library" and "this app's code" stays obvious to a reader.

## Complexity Tracking

No constitution violations to track. The example is a consumer app, and the constitution governs the design system's own packages, not a consumer's framework or test tooling. The one structural addition, the `examples/` workspace member, is covered by Section I's written-justification path (see the Constitution Check above and the spec's Overview): the consumer is new adopters, and no existing package can serve as a runnable consumer app.
