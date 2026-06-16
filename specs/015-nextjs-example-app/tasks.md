# Tasks: Next.js 15 example app

**Input**: Design documents from `/specs/015-nextjs-example-app/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: The example ships a Playwright end-to-end suite (FR-016, US5). Those are the only tests requested; there are no unit or component-fixture tests. The e2e specs are authored after the experiences exist, as regression guards, not test-first.

**Organization**: Tasks are grouped by user story. Note the honest caveat in Dependencies: this is one app, so `app/layout.tsx` and `app/globals.css` are a shared wiring spine that serializes across US1 to US3. The parallelism lives in the satellite files (README, the nested route, the container-query demo, and the five e2e specs).

All paths are relative to the repo root. The example lives at `examples/nextjs-15-app-router/` (abbreviated **EX/** below).

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Create the workspace member and its toolchain.

- [x] T001 Create `EX/package.json`: `private: true`, name `@unbranded-ds/example-nextjs`, `@unbranded-ds/tokens` and `@unbranded-ds/react` at `workspace:*`, scripts (`dev`, `build`, `start`, `lint`, `typecheck`, `e2e`), and dev deps (`next`@^15, `react`/`react-dom`@19, `@playwright/test`, `@axe-core/playwright`).
- [x] T002 Add `'examples/*'` to the `packages:` list in `pnpm-workspace.yaml`.
- [x] T003 [P] Create `EX/next.config.ts` and `EX/tsconfig.json` (extends the repo's strict base, App Router, no `any`).
- [x] T004 [P] Create `EX/eslint.config.mjs` (extends the repo flat config) and `EX/.gitignore` (`.next/`, `playwright-report/`, `test-results/`, `node_modules/`).
- [x] T005 Run `pnpm install` from the repo root to link the workspace and resolve the example's deps.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: The minimal app shell every story builds on.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [x] T006 Create `EX/app/layout.tsx` skeleton: `<html>`/`<body>`, metadata, imports `./globals.css`, renders `{children}`. Server component, no `window`/`document` at render. (Theming, header, and font are layered on in later phases.)
- [x] T007 [P] Create `EX/app/globals.css` with EXACTLY the two canonical lines: `@import 'tailwindcss';` then `@import '@unbranded-ds/react/preset.css';`.
- [x] T008 [P] Create `EX/app/page.tsx`: a minimal home rendering one design-system-styled element, proving the wiring resolves.

**Checkpoint**: `pnpm --filter @unbranded-ds/example-nextjs dev` boots and the page renders with design-system styling.

---

## Phase 3: User Story 1 - Clone a working starter and run it (Priority: P1) 🎯 MVP

**Goal**: A clone-able starter that boots and renders design-system-styled output, with a README that documents the clone-out path.

**Independent Test**: Copy `EX/` out of the repo, swap the two `workspace:*` deps to published versions, install, run. It boots and renders identically, with no reference back to the monorepo.

- [x] T009 [US1] Finalize `EX/package.json` scripts and confirm `private: true` excludes it from publish; verify `dev` boots and the home renders design-system-styled content tracing to the two canonical lines (SC-004). Confirm the app imports only published `@unbranded-ds/*` specifiers, with no relative path into `packages/` (FR-007).
- [x] T010 [P] [US1] Write `EX/README.md`: what it is and is not, the exact clone-out command (swap `workspace:*` to published versions), a walkthrough of `globals.css`, `layout.tsx`, `page.tsx`, and `showcase/page.tsx`, and links to the root README and AGENTS.md.

**Checkpoint**: US1 is independently demonstrable: the starter clones out and runs.

---

## Phase 4: User Story 2 - Themed correctly on first paint, switchable live (Priority: P2)

**Goal**: Flash-free theming, live toggles, OS-follow, and the pinned vaporwave + compact composition on the nested route.

**Independent Test**: Dark saved then reload shows no flash; the header control switches light/system/dark live; on system the page follows the OS; `/showcase` shows vaporwave + compact; navigating there and back preserves the choice.

- [x] T011 [US2] Expand `EX/app/layout.tsx`: inline `getThemeBootstrapScript()` from `@unbranded-ds/tokens/runtime` in `<head>` before content, and wrap `<body>` in `<ThemeProvider>`.
- [x] T012 [US2] Add the header to `EX/app/layout.tsx`: `<SkipLink>` as the first focusable element, then `<ThemeToggle>` and `<DensityToggle>`.
- [x] T013 [P] [US2] Add the theme CSS imports to `EX/app/globals.css`: `@unbranded-ds/tokens/themes/{dark,vaporwave,compact}.css`, clearly labeled as additive.
- [x] T014 [P] [US2] Create `EX/app/showcase/page.tsx`: a section wrapped in `<ThemeProvider forced={{ aesthetic: 'vaporwave', density: 'compact' }}>`, labeled as an alternative aesthetic composed with compact density (not a color-scheme) and linking the color-scheme split note.
- [x] T015 [US2] Add navigation between `/` and `/showcase` (a link in the header) so cross-route persistence is exercisable.

**Checkpoint**: US1 and US2 both work; theming is flash-free and live, and the composition renders on the nested route.

---

## Phase 5: User Story 3 - See how to override the defaults (Priority: P3)

**Goal**: The consumer-override seam, shown in code with a self-hosted font and a palette override.

**Independent Test**: The custom font and colors render; removing the override block reverts to design-system defaults with no other change.

- [x] T016 [US3] Add a self-hosted variable font under `EX/fonts/` and declare it with `next/font/local` in `EX/app/layout.tsx`, exposing it as `--font-local-sans`.
- [x] T017 [US3] Add the clearly-commented, removable override block to `EX/app/globals.css`: `:root { --typography-font-sans: var(--font-local-sans), ...; --color-*: ...; }` (depends on T016 for the font variable).

**Checkpoint**: All of US1 to US3 work; the override seam is concrete and reversible.

---

## Phase 6: User Story 4 - See components rendering with the tokens (Priority: P3)

**Goal**: One example of each public component, plus the container-query demonstration, all mobile-first.

**Independent Test**: Each demonstrated component renders with design-system styling and responds to the active theme and density; the container-query demo's two instances reflow by their own container width.

- [x] T018 [US4] Build the component showcase in `EX/app/page.tsx`: one example each of Button, Card, Checkbox, Dialog, Input, Label, SegmentedControl, Select, Slider, Switch, Tabs, and Tooltip in realistic, mobile-first contexts. Include a Card hover transition built from the motion tokens (`--duration-*`, `--easing-*`) so motion is token-driven (FR-014).
- [x] T019 [US4] Add a `VisuallyHidden` label where a control needs a screen-reader-only name, and confirm `SkipLink` (from T012) targets the main content in `EX/app/page.tsx`.
- [x] T020 [P] [US4] Create `EX/app/components/cq-demo.tsx`: one component rendered inside two fixed-width `@container` wrappers side by side, each reflowing by its container, and place it on the home page.

**Checkpoint**: Every public component is demonstrated, and container queries are exercised.

---

## Phase 7: User Story 5 - Keep the example from rotting (Priority: P3)

**Goal**: A Playwright suite against the production build, plus axe, wired into CI.

**Independent Test**: `pnpm --filter @unbranded-ds/example-nextjs e2e` passes against `next build` then `next start`; the CI job is green and fails on a deliberately introduced regression.

- [x] T021 [US5] Create `EX/playwright.config.ts`: `webServer` runs `next build` then `next start` (production), a chromium project, and a `baseURL`.
- [x] T022 [P] [US5] Write `EX/tests/theming.spec.ts`: no-flash on reload with a seeded dark preference, live light/system/dark switching, and OS-follow via `emulateMedia({ colorScheme })`.
- [x] T023 [P] [US5] Write `EX/tests/composition.spec.ts`: `/showcase` shows vaporwave + compact via `forced`, and theme/density persist across navigation to `/showcase` and back.
- [x] T024 [P] [US5] Write `EX/tests/components.spec.ts`: each demonstrated component is present and visible on the home page.
- [x] T025 [P] [US5] Write `EX/tests/responsive.spec.ts`: at a 360px viewport there is no horizontal scroll, and the container-query demo's two instances render differently.
- [x] T026 [P] [US5] Write `EX/tests/a11y.spec.ts`: `@axe-core/playwright` on `/` and `/showcase` reports no serious or critical violations.
- [x] T027 [US5] Add an `e2e` task to `turbo.json` (depends on `build`) and confirm the example's `e2e` script runs through it.
- [x] T028 [US5] Add an `example-e2e` job to `.github/workflows/ci.yml` (build packages, build the example, `playwright install --with-deps chromium`, run the example's `lint`, `typecheck`, and `e2e`), and tighten the `publish` job's build filter so it does not build the private example.

**Checkpoint**: The headline experiences are guarded in CI; a regression fails loudly.

---

## Phase 8: Polish & Cross-Cutting Concerns

- [x] T029 [P] Run the `humanizer` skill over `EX/README.md`, the inline doc comments, and the showcase labels; revise in place.
- [x] T030 [P] Verify SSR-safety across the app: no `window`/`document` at render, and only interactive leaves carry `'use client'`.
- [x] T031 Walk through `quickstart.md` end to end (dev, production build, e2e, and the six by-hand validations).
- [x] T032 [P] Final gate: the example's `typecheck` and `lint` are clean and `e2e` is green locally.

---

## Dependencies & Execution Order

### Phase dependencies

- **Setup (Phase 1)**: no dependencies.
- **Foundational (Phase 2)**: after Setup. Blocks all stories.
- **User stories (Phases 3 to 7)**: after Foundational. US1 is the MVP. US2 to US5 layer on in priority order, but see the file-level caveat below.
- **Polish (Phase 8)**: after the stories it covers.

### The shared-file caveat (why this is only partly parallel)

This is a single app, so two files are a sequential spine:

- `EX/app/layout.tsx`: T006 → T011 → T012 → T015 → T016. One owner, in order.
- `EX/app/globals.css`: T007 → T013 → T017. One owner, in order.

Stories are independently **testable** (each adds a verifiable behavior), but they are not fully independent to **edit**, because US1/US2/US3 all touch that spine. Cross-story parallelism is real only in the satellite files.

### Within each story

- US3 T017 depends on T016 (needs `--font-local-sans`).
- US4 T018 and T019 both edit `page.tsx`, so they are sequential; T020 is a separate file.
- US5 specs (T022 to T026) are independent files; T021 (config) and T027/T028 (turbo, CI) are separate again.

---

## Parallel Opportunities

These are the genuine concurrency wins (different files, no incomplete dependency):

- **Setup**: T003 and T004 together.
- **Foundational**: T007 and T008 together (alongside T006).
- **Across the satellites**, once Foundational is done: T010 (README), T014 (the `/showcase` route), and T020 (the container-query demo) are independent files that can be built in parallel with the layout/globals spine.
- **The whole e2e suite**: T022, T023, T024, T025, T026 are five independent spec files. This is the largest single parallel block. They can be authored concurrently once the experiences they assert exist.

### Parallel example: the e2e suite (US5)

```bash
# After US2 to US4 exist, author all five specs at once:
Task: "Write EX/tests/theming.spec.ts"
Task: "Write EX/tests/composition.spec.ts"
Task: "Write EX/tests/components.spec.ts"
Task: "Write EX/tests/responsive.spec.ts"
Task: "Write EX/tests/a11y.spec.ts"
```

---

## Implementation Strategy

### MVP first

1. Phase 1 Setup, then Phase 2 Foundational (the app boots, DS-styled).
2. Phase 3 US1: clone-ability and README.
3. **Stop and validate**: the starter clones out and runs. That alone is a shippable MVP.

### Incremental delivery

US2 (theming) → US3 (overrides) → US4 (components and CQ) → US5 (the e2e guard). Each adds a verifiable behavior without breaking the last.

### Realistic multi-agent split

One agent owns the wiring spine (`layout.tsx` and `globals.css` across US1 to US3, in order). In parallel, others take: the README (T010), the `/showcase` route (T014), the component showcase and CQ demo (T018 to T020), and the five e2e specs (T022 to T026). The spine owner and the satellite owners converge before US5's CI wiring (T027, T028). This is less parallel than a multi-component feature, because one app funnels through one layout and one stylesheet.

---

## Notes

- `[P]` = different files, no incomplete dependency.
- The e2e specs are regression guards authored against the finished experiences, not test-first.
- Humanizer pass on prose (README, comments, labels) is owed before merge (T029), per the repo-wide prose rule.
- Commit per task or logical group; the example is `private` and carries no changeset (it touches no `packages/` source).
