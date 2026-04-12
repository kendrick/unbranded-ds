# Tasks: Token-Driven Design System v0.1

**Input**: Design documents from `/specs/001-token-design-system/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Three test layers are required by the spec (unit, interaction, a11y). Test tasks are included.

**Organization**: Tasks are grouped by user story. Each story is independently testable after its phase completes.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

This is a pnpm monorepo:
- `packages/tokens/` — `@unbranded-ds/tokens`
- `packages/react/` — `@unbranded-ds/react`
- `apps/storybook/` — Storybook 10.3 app

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Initialize the monorepo structure, install dependencies, configure tooling.

- [ ] T001 Initialize pnpm workspace with `pnpm-workspace.yaml` listing `packages/*` and `apps/*`
- [ ] T002 Configure Turborepo in `turbo.json` with build/dev/test/lint pipelines and dependency graph (tokens → react → storybook)
- [ ] T003 Create root `package.json` with workspace scripts: `dev`, `build`, `test`, `lint`, `typecheck`, `test:storybook`
- [ ] T004 Create shared TypeScript config in `tsconfig.base.json` with strict mode, ESM, path aliases
- [ ] T005 [P] Configure ESLint flat config in `eslint.config.ts` with TypeScript rules and Prettier integration
- [ ] T006 [P] Create `.prettierrc` with project formatting rules
- [ ] T007 [P] Create `packages/tokens/package.json` for `@unbranded-ds/tokens` with zero React dependencies, Style Dictionary and Zod as dependencies
- [ ] T008 [P] Create `packages/react/package.json` for `@unbranded-ds/react` with `@unbranded-ds/tokens` dependency, `react`/`react-dom`/`@base-ui-components/react` as peer dependencies, `clsx`/`tailwind-merge`/`class-variance-authority` as dependencies, tsup for build
- [ ] T009 [P] Create `apps/storybook/package.json` with `@storybook/react-vite`, `@storybook/addon-mcp`, `@storybook/addon-vitest`, `@storybook/addon-a11y` dependencies
- [ ] T010 [P] Create `packages/tokens/tsconfig.json` extending base config
- [ ] T011 [P] Create `packages/react/tsconfig.json` extending base config
- [ ] T012 [P] Create `apps/storybook/tsconfig.json` extending base config
- [ ] T013 Run `pnpm install` and verify clean dependency resolution

**Checkpoint**: Monorepo structure complete, `pnpm install` succeeds, all packages recognized.

---

## Phase 2: Foundational — Token Pipeline (Blocking Prerequisites)

**Purpose**: Build the entire token pipeline that ALL user stories depend on. No component or story work can begin until tokens compile and themes validate.

**CRITICAL**: No user story work can begin until this phase is complete.

- [x] T014 [P] Author color tokens in W3C DTCG format in `packages/tokens/src/tokens/color.json` — background, foreground, primary, primary-foreground, muted, muted-foreground, border, ring, destructive, destructive-foreground (light theme values as `$value`)
- [x] T015 [P] Author spacing tokens in `packages/tokens/src/tokens/spacing.json` — spacing scale (1–16, px)
- [x] T016 [P] Author typography tokens in `packages/tokens/src/tokens/typography.json` — font-sans, font-mono, size-sm/base/lg/xl, weight-normal/medium/semibold/bold, leading-normal/tight/relaxed
- [x] T017 [P] Author radii tokens in `packages/tokens/src/tokens/radii.json` — sm, md, lg, full
- [x] T018 [P] Author shadow tokens in `packages/tokens/src/tokens/shadows.json` — sm, md, lg
- [x] T019 [P] Author opacity tokens in `packages/tokens/src/tokens/opacity.json` — disabled, hover
- [x] T020 Configure Style Dictionary v4 in `packages/tokens/sd.config.ts` — define 4 output platforms: CSS variables (scoped under `[data-theme]`), Tailwind v4 preset (CSS `@theme inline` block), TypeScript types, raw JSON
- [x] T021 [P] Author light theme in `packages/tokens/themes/light.json` with all required token values
- [x] T022 [P] Author dark theme in `packages/tokens/themes/dark.json` with all required token values
- [x] T023 [P] Author brand theme in `packages/tokens/themes/brand.json` with all required token values (visually distinct from light/dark)
- [x] T024 Implement Zod schema for theme validation in `packages/tokens/src/schema.ts` — schema mirrors token structure, enforces all tokens present with correct types
- [x] T025 Implement contrast pair declarations in `packages/tokens/src/schema.ts` — define foreground/background pairs (foreground↔background, primary-foreground↔primary, muted-foreground↔muted, destructive-foreground↔destructive) with WCAG AA thresholds
- [x] T026 Implement `validateTheme()` in `packages/tokens/src/validate.ts` — schema conformance via Zod + WCAG AA contrast checking for all declared pairs, returns `{ ok, theme }` or `{ ok, issues }`
- [x] T027 Implement `registerTheme()` in `packages/tokens/src/runtime.ts` — validates theme, injects `<style>` block scoped to `[data-theme="<name>"]`
- [x] T028 Create barrel export in `packages/tokens/src/index.ts` — export `validateTheme`, `themeSchema`, `tokenMap`, `registerTheme`, `contrastPairs`
- [x] T029 Run Style Dictionary build and verify 4 artifacts output to `packages/tokens/dist/` — CSS vars (3 theme files), Tailwind preset CSS, TypeScript types, raw JSON
- [x] T030 Verify Tailwind preset (`packages/tokens/dist/tailwind/preset.css`) contains `@theme inline` entries for all 6 token namespaces (`--color-*`, `--spacing-*`, `--font-*`, `--radius-*`, `--shadow-*`, `--opacity-*`)

**Checkpoint**: `pnpm --filter @unbranded-ds/tokens build` succeeds. Four artifacts in `dist/`. `validateTheme()` accepts the 3 built-in themes and rejects a deliberately broken fixture.

---

## Phase 3: User Story 1 — Consume Components with Token-Based Theming (Priority: P1)

**Goal**: Nine components styled exclusively via tokens, renderable under any valid theme, with theme switching via `data-theme` attribute.

**Independent Test**: Import any component, render under light/dark/brand themes by changing `data-theme`, verify all visual properties change correctly.

### Implementation for User Story 1

- [x] T031 [US1] Create `cn()` utility in `packages/react/src/lib/cn.ts` — `clsx` + `tailwind-merge` wrapper
- [ ] T032 [US1] Create custom ESLint rule in `packages/react/eslint/no-hardcoded-colors.ts` — forbids hex, rgb, hsl, named-color literals in `packages/react/src/components/**`; register in root `eslint.config.ts`
- [x] T033 [US1] Configure tsup in `packages/react/tsup.config.ts` — ESM only, external peer deps, declaration files
- [x] T034 [P] [US1] Implement Button component in `packages/react/src/components/Button/Button.tsx` — CVA variants (variant: default/destructive/outline/secondary/ghost/link; size: default/sm/lg/icon), forwarded ref, className via cn()
- [x] T035 [P] [US1] Implement Input component in `packages/react/src/components/Input/Input.tsx` — forwarded ref, className via cn(), all HTML input attributes
- [x] T036 [P] [US1] Implement Label component in `packages/react/src/components/Label/Label.tsx` — forwarded ref, className via cn(), htmlFor support
- [x] T037 [P] [US1] Implement Card component with sub-components in `packages/react/src/components/Card/Card.tsx` — Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter
- [x] T038 [P] [US1] Implement Dialog component in `packages/react/src/components/Dialog/Dialog.tsx` — wraps `@base-ui-components/react` Dialog, sub-components: DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose
- [x] T039 [P] [US1] Implement Select component in `packages/react/src/components/Select/Select.tsx` — wraps `@base-ui-components/react` Select, sub-components: SelectTrigger, SelectContent, SelectItem, SelectValue
- [x] T040 [P] [US1] Implement Checkbox component in `packages/react/src/components/Checkbox/Checkbox.tsx` — wraps `@base-ui-components/react` Checkbox, supports checked/indeterminate/disabled
- [x] T041 [P] [US1] Implement Switch component in `packages/react/src/components/Switch/Switch.tsx` — wraps `@base-ui-components/react` Switch, supports checked/disabled
- [x] T042 [P] [US1] Implement Tabs component in `packages/react/src/components/Tabs/Tabs.tsx` — wraps `@base-ui-components/react` Tabs, sub-components: TabsList, TabsTrigger, TabsContent
- [x] T043 [P] [US1] Create `index.ts` barrel export for each component: `packages/react/src/components/{Button,Input,Label,Card,Dialog,Select,Checkbox,Switch,Tabs}/index.ts`
- [x] T044 [US1] Create root barrel export in `packages/react/src/index.ts` — export all 9 components + cn utility
- [ ] T045 [US1] Run ESLint no-hardcoded-colors rule across all components — verify zero violations (no hex/rgb/hsl/named colors in component source)
- [x] T046 [US1] Run `pnpm --filter @unbranded-ds/react build` via tsup — verify ESM bundle output with declarations

### Unit Tests for User Story 1

- [x] T047 [P] [US1] Unit test for Button variants in `packages/react/src/components/Button/Button.test.tsx` — verify all CVA variant classes applied correctly
- [x] T048 [P] [US1] Unit test for Input in `packages/react/src/components/Input/Input.test.tsx` — verify styling and className merge
- [x] T049 [P] [US1] Unit test for Label in `packages/react/src/components/Label/Label.test.tsx` — verify styling classes
- [x] T050 [P] [US1] Unit test for Card sub-components in `packages/react/src/components/Card/Card.test.tsx` — verify each sub-component renders with correct structure
- [x] T051 [P] [US1] Unit test for cn() utility in `packages/react/src/lib/cn.test.ts` — verify class merging and Tailwind conflict resolution

**Checkpoint**: All 9 components build. ESLint color rule passes. Unit tests green. `pnpm build` succeeds for tokens + react packages.

---

## Phase 4: User Story 2 — Browse and Interact with Components in Documentation App (Priority: P2)

**Goal**: Storybook 10.3 app with all 9 components documented, interactive examples, theme switcher, FOUC prevention, interaction tests, and a11y audits.

**Independent Test**: Open Storybook, navigate to each component, verify stories render, switch themes via toolbar, confirm no flash.

### Implementation for User Story 2

- [ ] T052 [US2] Configure Storybook main config in `apps/storybook/.storybook/main.ts` — addons: `@storybook/addon-vitest`, `@storybook/addon-a11y`, `@storybook/addon-mcp`; framework: `@storybook/react-vite`; autodocs enabled globally
- [ ] T053 [US2] Configure Storybook preview in `apps/storybook/.storybook/preview.ts` — global decorators for theme provider, toolbar items for theme switcher (light/dark/brand), `parameters.a11y.test: 'error'` for CI failures
- [ ] T054 [US2] Create FOUC-prevention blocking script in `apps/storybook/.storybook/preview-head.html` — reads `ds-theme` from localStorage, sets `data-theme` + inline `<style>` of CSS variables before first paint
- [ ] T055 [US2] Configure Vitest workspace in `packages/react/vitest.config.ts` — two projects: project 1 (`**/*.test.tsx`, standard Vitest), project 2 (`**/*.stories.tsx`, `@storybook/addon-vitest` plugin with `.storybook/vitest.setup.ts`)
- [ ] T056 [US2] Create Storybook Vitest setup file in `apps/storybook/.storybook/vitest.setup.ts` — initialize Storybook test environment
- [ ] T057 [P] [US2] Write Button stories in `packages/react/src/components/Button/Button.stories.tsx` — Default, all 6 variants, all 4 sizes, Disabled, Loading, WithIcon; play function: click + verify
- [ ] T058 [P] [US2] Write Input stories in `packages/react/src/components/Input/Input.stories.tsx` — Default, Disabled, WithPlaceholder, WithLabel, File; play function: type + verify value
- [ ] T059 [P] [US2] Write Label stories in `packages/react/src/components/Label/Label.stories.tsx` — Default, WithInput, Required; argTypes with prop descriptions
- [ ] T060 [P] [US2] Write Card stories in `packages/react/src/components/Card/Card.stories.tsx` — Default, WithHeader, WithFooter, FullExample; argTypes for all sub-components
- [ ] T061 [P] [US2] Write Dialog stories in `packages/react/src/components/Dialog/Dialog.stories.tsx` — Default, Controlled, WithForm, Nested; play function: open → interact → close
- [ ] T062 [P] [US2] Write Select stories in `packages/react/src/components/Select/Select.stories.tsx` — Default, WithPlaceholder, Disabled, ManyOptions; play function: open → select → verify
- [ ] T063 [P] [US2] Write Checkbox stories in `packages/react/src/components/Checkbox/Checkbox.stories.tsx` — Default, Checked, Indeterminate, Disabled, WithLabel; play function: toggle + verify
- [ ] T064 [P] [US2] Write Switch stories in `packages/react/src/components/Switch/Switch.stories.tsx` — Default, Checked, Disabled, WithLabel; play function: toggle + verify
- [ ] T065 [P] [US2] Write Tabs stories in `packages/react/src/components/Tabs/Tabs.stories.tsx` — Default, Controlled, ManyTabs, Disabled; play function: click tab → verify panel switch
- [ ] T066 [US2] Verify Storybook runs locally with `pnpm dev` — install Chrome DevTools MCP for programmatic testing, verify all 9 components listed, autodocs render, theme switcher works, Tests panel shows green, Accessibility panel shows no serious/critical violations
- [ ] T067 [US2] Verify FOUC prevention — switch to dark theme, hard-reload page, confirm no flash of light theme

**Checkpoint**: Storybook runs locally. All 9 components documented with stories. Theme switcher works without FOUC. All play functions pass. Zero serious/critical a11y violations.

---

## Phase 5: User Story 3 — Author and Validate a Custom Brand Theme (Priority: P2)

**Goal**: Theme validation workflow with clear pass/fail feedback, schema conformance checking, and WCAG AA contrast enforcement.

**Independent Test**: Write a theme JSON file, run validateTheme, verify success for valid files and specific errors for invalid files.

### Unit Tests for User Story 3

- [ ] T068 [P] [US3] Create valid theme fixture in `packages/tokens/src/__fixtures__/valid-custom.json` — schema-complete with passing contrast
- [ ] T069 [P] [US3] Create missing-token fixture in `packages/tokens/src/__fixtures__/missing-token.json` — omit `color.primary` to trigger schema error
- [ ] T070 [P] [US3] Create bad-contrast fixture in `packages/tokens/src/__fixtures__/bad-contrast.json` — set `color.foreground` to low-contrast value against `color.background`
- [ ] T071 [P] [US3] Create extra-tokens fixture in `packages/tokens/src/__fixtures__/extra-tokens.json` — valid theme plus unknown token names

### Implementation for User Story 3

- [ ] T072 [US3] Unit test `validateTheme()` in `packages/tokens/src/validate.test.ts` — test valid theme returns `{ ok: true }`, missing token returns `MISSING_TOKEN` issue with correct path, bad contrast returns `CONTRAST_FAILURE` with ratio and threshold, extra tokens accepted with warning
- [ ] T073 [US3] Unit test Zod schema in `packages/tokens/src/schema.test.ts` — test schema rejects malformed input, accepts all 3 built-in themes
- [ ] T074 [US3] Verify `THEMING.md` at repo root documents: how to author a theme, how to validate, how to apply at runtime, FOUC-prevention pattern — update if incomplete

**Checkpoint**: validateTheme unit tests green. All 3 built-in themes pass validation. Broken fixtures rejected with specific error messages.

---

## Phase 6: User Story 4 — AI Agent Introspects via MCP Endpoint (Priority: P3)

**Goal**: Published Storybook exposes MCP endpoint that agents can query for components, stories, args, and docs.

**Independent Test**: Send `tools/list` to the MCP endpoint and verify expected tool set is present.

### Implementation for User Story 4

- [ ] T075 [US4] Verify `@storybook/addon-mcp` is registered in `apps/storybook/.storybook/main.ts` (done in T052) and `/mcp` endpoint responds on local dev server
- [ ] T076 [US4] Write MCP smoke test script in `scripts/mcp-smoke-test.ts` — sends JSON-RPC `tools/list` to a given endpoint URL, asserts expected tools are present (component listing, story retrieval), exits non-zero on failure
- [ ] T077 [US4] Test smoke script locally against `http://localhost:6006/mcp` — verify it passes and lists all 9 components
- [ ] T078 [US4] Document MCP connection in `README.md` — production Chromatic Storybook URL (placeholder), published MCP endpoint URL, copy-pasteable config blocks for Claude Code, Claude Desktop, and Cursor, example agent queries, public access note

**Checkpoint**: Local `/mcp` endpoint responds to `tools/list`. Smoke test script passes locally. README has MCP documentation.

---

## Phase 7: User Story 5 — Continuous Integration Pipeline (Priority: P3)

**Goal**: Single GitHub Actions workflow that runs all quality checks and blocks merge on any failure.

**Independent Test**: Open a PR with a deliberately broken change and verify the pipeline catches it.

### Implementation for User Story 5

- [ ] T079 [US5] Create GitHub Actions workflow in `.github/workflows/ci.yml` — trigger on PR and push to main; job graph: pnpm install (with cache) → lint → typecheck → unit tests → build all → build storybook → interaction + a11y tests → Chromatic publish (with `skip: true` for VR) → MCP smoke test
- [ ] T080 [US5] Configure Chromatic publish step — use `chromaui/action` with `projectToken: ${{ secrets.CHROMATIC_PROJECT_TOKEN }}`, `skip: true`, `exitZeroOnChanges: true`; requires `fetch-depth: 0` in checkout
- [ ] T081 [US5] Configure MCP smoke test step — run `scripts/mcp-smoke-test.ts` against the Chromatic-published endpoint URL from the Chromatic action output
- [ ] T082 [US5] Document Chromatic setup in `README.md` — how to obtain `CHROMATIC_PROJECT_TOKEN`, how to set it as a repository secret, what the CI pipeline does at each step

**Checkpoint**: CI workflow file is valid. All steps defined in correct dependency order. Documentation complete.

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Final integration, documentation, and validation across all user stories.

- [ ] T083 Complete `README.md` — installation, local dev, theming overview (link to THEMING.md), testing (3 layers), Chromatic setup, MCP connection, contributing guide
- [ ] T084 Run `pnpm install && pnpm build` from fresh clone — verify clean build per SC-004
- [ ] T085 Run `pnpm test` — verify all unit tests + interaction tests + a11y audits pass (0 serious/critical violations)
- [ ] T086 Run `pnpm lint && pnpm typecheck` — verify zero lint errors and zero type errors
- [ ] T087 Verify theme switcher in Storybook — flip between light, dark, brand themes; confirm no FOUC; confirm persistence across navigation
- [ ] T088 Verify nested theme scoping — render components in two nested `data-theme` containers, confirm independent scoping
- [ ] T089 Run quickstart.md validation — follow the quickstart steps from scratch and verify a consumer can install, configure, render components, and switch themes in under 15 minutes
- [ ] T090 Final commit and verify `pnpm build` is green end-to-end

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Phase 1 — BLOCKS all user stories
- **US1 (Phase 3)**: Depends on Phase 2 — components need compiled tokens and Tailwind preset
- **US2 (Phase 4)**: Depends on Phase 3 — stories need components to exist
- **US3 (Phase 5)**: Depends on Phase 2 only — validation tests need token schema but not components
- **US4 (Phase 6)**: Depends on Phase 4 — MCP needs Storybook with stories
- **US5 (Phase 7)**: Depends on Phases 3–6 — CI tests everything
- **Polish (Phase 8)**: Depends on all prior phases

### User Story Dependencies

```text
Phase 1 (Setup)
    │
Phase 2 (Foundational: Token Pipeline)
    │
    ├── Phase 3: US1 (Components) ──┐
    │                                ├── Phase 4: US2 (Storybook + Stories) ──┐
    │                                │                                        │
    └── Phase 5: US3 (Validation) ──┘                                        ├── Phase 6: US4 (MCP)
                                                                              │
                                                                              └── Phase 7: US5 (CI)
                                                                                     │
                                                                              Phase 8 (Polish)
```

### Key Parallel Opportunities

- **Phase 1**: T005–T012 are all parallelizable (different files)
- **Phase 2**: T014–T019 (token source files), T021–T023 (theme files) are all parallelizable
- **Phase 3**: T034–T042 (9 components) are all parallelizable; T047–T051 (unit tests) are all parallelizable
- **Phase 4**: T057–T065 (9 story files) are all parallelizable
- **Phase 5**: T068–T071 (test fixtures) are all parallelizable
- **US1 and US3 can run in parallel** after Phase 2 (US3 doesn't need components)

### Within Each User Story

- Setup infrastructure before implementation
- Models/utilities before components
- Components before stories
- Stories before interaction/a11y testing
- All tests must pass before moving to next priority

---

## Parallel Example: User Story 1 — Components

```bash
# After Phase 2 complete, launch all 9 components in parallel:
Task T034: "Implement Button in packages/react/src/components/Button/Button.tsx"
Task T035: "Implement Input in packages/react/src/components/Input/Input.tsx"
Task T036: "Implement Label in packages/react/src/components/Label/Label.tsx"
Task T037: "Implement Card in packages/react/src/components/Card/Card.tsx"
Task T038: "Implement Dialog in packages/react/src/components/Dialog/Dialog.tsx"
Task T039: "Implement Select in packages/react/src/components/Select/Select.tsx"
Task T040: "Implement Checkbox in packages/react/src/components/Checkbox/Checkbox.tsx"
Task T041: "Implement Switch in packages/react/src/components/Switch/Switch.tsx"
Task T042: "Implement Tabs in packages/react/src/components/Tabs/Tabs.tsx"
```

## Parallel Example: User Story 2 — Stories

```bash
# After all components exist, launch all 9 story files in parallel:
Task T057: "Write Button stories in packages/react/src/components/Button/Button.stories.tsx"
Task T058: "Write Input stories in packages/react/src/components/Input/Input.stories.tsx"
# ... (all 9)
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (Token Pipeline)
3. Complete Phase 3: User Story 1 (9 Components)
4. **STOP and VALIDATE**: Build succeeds, ESLint passes, unit tests green, components render under all 3 themes
5. This proves the core pipeline: tokens → Tailwind → components → theming

### Incremental Delivery

1. Setup + Foundational → Token pipeline proven
2. US1 (Components) → Core library usable (MVP)
3. US3 (Validation) → Theme authoring workflow complete (can run parallel with US1)
4. US2 (Storybook + Stories) → Full documentation surface
5. US4 (MCP) → Agent introspection enabled
6. US5 (CI) → Automated quality gates
7. Polish → Release-ready

### Parallel Opportunities Summary

With multiple developers:
1. **All together**: Phase 1 (Setup) + Phase 2 (Token Pipeline)
2. **Split**: Developer A on US1 (Components), Developer B on US3 (Validation)
3. **After US1**: Developer A on US2 (Storybook), Developer B on US4 (MCP prep)
4. **Final**: US5 (CI) once all testable artifacts exist

---

## Notes

- [P] tasks = different files, no shared state
- [Story] label maps each task to its user story for traceability
- The spec requires 3 test layers — unit tests (Phase 3), interaction tests via play functions (Phase 4), a11y audits (Phase 4) — all must pass
- The no-hardcoded-colors ESLint rule (T032) must run during T045 and in CI (T079)
- Commit after each task or logical group
- Stop at any checkpoint to validate the current story independently
