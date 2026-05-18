# Tasks: Agent experience foundation

**Input**: Design documents from `/specs/005-agent-experience-foundation/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/agents-md-shape.md, contracts/sidecar-shape.md, contracts/token-query-mcp.md, quickstart.md

**Tests**: Tests are required per FR-029a (MCP smoke + per-tool units) and per-spec convention (every new module ships with tests). Test tasks are included throughout.

**Organization**: Tasks are grouped by user story so each story can be implemented, tested, and shipped independently. US1 must complete before US2-US4 can fully land (US2 needs the template, US4 lands the constitution amendment that sits alongside US1's work). US2, US3, and US4 are then independent and can run in parallel.

## Format

`- [ ] [ID] [P?] [Story?] Description with file path`

- **[P]**: Can run in parallel with other [P] tasks (different files, no dependencies on incomplete tasks in the same phase)
- **[Story]**: Maps to user stories from spec.md (US1, US2, US3, US4)
- All file paths are absolute from the repo root

## Path conventions

- The token-query MCP lives in `packages/tokens/src/mcp/`
- Sidecars live alongside their component sources at `packages/react/src/components/<Component>/<Component>.usage.md`
- The sidecar template lives at `packages/react/src/components/_template/Component.usage.md`
- The compile validator lives at `scripts/validate-sidecars.ts`
- `AGENTS.md` is at the repo root

---

## Phase 1: Setup (package preparation)

**Purpose**: Add the new dependency and binary entry to `@unbranded-ds/tokens` so subsequent work can import and build the MCP.

- [x] T001 Add `@modelcontextprotocol/sdk` as a devDependency in `/Users/k.arnett/repos/unbranded-ds/packages/tokens/package.json` at the latest stable version compatible with the project's Node and TypeScript versions
- [x] T002 Add a `bin` entry to `/Users/k.arnett/repos/unbranded-ds/packages/tokens/package.json` mapping `unbranded-ds-tokens-mcp` to `./dist/mcp/server.js`
- [x] T003 Run `pnpm install` from the repo root to update `pnpm-lock.yaml` with the new dependency

**Checkpoint**: Package configuration ready. Foundational work can begin.

---

## Phase 2: Foundational (blocking prerequisites)

**Purpose**: Land the constitution amendment that legitimizes the MCP SDK addition before any work that depends on the SDK lands. Although the amendment can travel in the same PR as US4's MCP implementation, sequencing it here keeps the constitution coherent throughout the rest of the spec's work.

- [x] T004 Apply PATCH amendment to `/Users/k.arnett/repos/unbranded-ds/.specify/memory/constitution.md`: bump version 1.1.0 → 1.1.1, replace the Section VIII MCP entry with the expanded text from research.md's "Section VIII PATCH amendment" decision (adds `@modelcontextprotocol/sdk` alongside `@storybook/addon-mcp`), and update the SYNC IMPACT REPORT to reflect the new amendment with a Prior amendments entry for 1.1.0

**Checkpoint**: Constitution ready. User story implementation can begin.

---

## Phase 3: User Story 1 — Sidecar foundation (Priority: P1) — MVP

**Goal**: Ship the agent-readable foundation: a sidecar `*.usage.md` template that demonstrates the structure, a CI validator that compile-tests sidecar code blocks, a repo-root `AGENTS.md` indexing the MCP endpoints and shipped components, and a README link so AGENTS.md is discoverable.

**Independent Test**: A consumer clones the repo. Opening `AGENTS.md` shows the MCP connection blocks, tool inventory, worked example, and a component index (links to the future per-component sidecars). Opening `packages/react/src/components/_template/Component.usage.md` shows the canonical sidecar structure with placeholder content that reads as good sidecar voice. CI's verify job runs `validate-sidecars.ts` and finds no broken code blocks in the template.

- [x] T005 [US1] Create the sidecar compile validator at `/Users/k.arnett/repos/unbranded-ds/scripts/validate-sidecars.ts`. The script: walks `packages/react/src/components/**/*.usage.md`, extracts all code blocks tagged `tsx`, wraps each in a minimal TSX scaffold with `import * as React from 'react'` and `import { Component } from '@unbranded-ds/react'` resolved against the workspace, writes the wrapped blocks to a temp directory, runs `tsc --noEmit` against them, and reports compile errors with file + line context. Exits non-zero on any failure. ~100 lines of TypeScript.
- [x] T006 [US1] Add a `validate-sidecars` step to `/Users/k.arnett/repos/unbranded-ds/.github/workflows/ci.yml` that runs `pnpm exec tsx scripts/validate-sidecars.ts` in the verify job after lint and before unit tests. Failing the step blocks the PR.
- [x] T007 [P] [US1] Create the sidecar template at `/Users/k.arnett/repos/unbranded-ds/packages/react/src/components/_template/Component.usage.md` following the contract at `specs/005-agent-experience-foundation/contracts/sidecar-shape.md`. Use Button as the placeholder example so the template is realistic. Include every required section (Heading, When to use, Import, Props, Common patterns with exactly two or four examples, Accessibility, Variants and slots, Related). Apply Section XI.1 prose rules. Compile-test the `tsx` blocks locally before opening the PR.
- [x] T008 [P] [US1] Create `/Users/k.arnett/repos/unbranded-ds/AGENTS.md` at the repo root following the contract at `specs/005-agent-experience-foundation/contracts/agents-md-shape.md`. Include every required section (Overview, MCP endpoints with both Storybook MCP and token-query MCP blocks, Tool inventory with the four token-query tools formatted per FR-003's three-line shape, Worked example, Component index table with all 14 shipped components linking to their sidecars, Sidecar convention, Where to read more). The component index links point at sidecars that don't yet exist; they resolve as US2's PRs land.
- [x] T009 [US1] Update `/Users/k.arnett/repos/unbranded-ds/README.md`'s Docs section to add a link to `AGENTS.md` so discovery works in both directions.
- [x] T010 [US1] Create `/Users/k.arnett/repos/unbranded-ds/.changeset/add-agents-md-and-sidecar-template.md` declaring `@unbranded-ds/react: patch` (docs-only addition; the template lives inside the react package).

**Checkpoint**: AGENTS.md, template, and validator are live. CI catches broken sidecar code blocks. US2, US3, and US4 can now run in parallel.

---

## Phase 4: User Story 2 — Sidecar retrofit (Priority: P2) — DEFERRED to spec 005a

> Status: deferred during `/speckit.implement`. The sidecar template and CI validator shipped on this branch as part of US1, so spec 005a inherits a ready foundation. The 14 per-component tasks below remain as the canonical detail; 005a's `/speckit.tasks` run lifts them. See "Deferred work" at the end of spec.md.

**Goal**: Ship a `<Component>.usage.md` next to every shipped component's source. 14 sidecars total, one PR per component per FR-032.

**Independent Test**: For each of the 14 components, the directory contains a `<Component>.usage.md` that follows the template. Cross-referencing any one sidecar against the component's TypeScript signatures shows agreement on props, defaults, and described usage. The CI validator passes on every sidecar.

Each task below is one PR. Each PR adds its component's sidecar AND a `.changeset/add-<component>-sidecar.md` declaring `@unbranded-ds/react: patch`. AGENTS.md's component index links resolve once each PR merges.

- [ ] T011 [P] [US2] Create `/Users/k.arnett/repos/unbranded-ds/packages/react/src/components/Button/Button.usage.md` following the template. Source content from `Button.tsx`, `Button.stories.tsx`, and the existing autodocs. Compile-test the `tsx` blocks. Add `.changeset/add-button-sidecar.md` declaring `@unbranded-ds/react: patch`.
- [ ] T012 [P] [US2] Create `/Users/k.arnett/repos/unbranded-ds/packages/react/src/components/Card/Card.usage.md` (same pattern as T011). Add changeset.
- [ ] T013 [P] [US2] Create `/Users/k.arnett/repos/unbranded-ds/packages/react/src/components/Checkbox/Checkbox.usage.md`. Add changeset.
- [ ] T014 [P] [US2] Create `/Users/k.arnett/repos/unbranded-ds/packages/react/src/components/Dialog/Dialog.usage.md`. Compound-style sidecar with slot subsections (Root, Trigger, Content, Title, Description, etc.) per FR-010a. Add changeset.
- [ ] T015 [P] [US2] Create `/Users/k.arnett/repos/unbranded-ds/packages/react/src/components/Input/Input.usage.md`. Add changeset.
- [ ] T016 [P] [US2] Create `/Users/k.arnett/repos/unbranded-ds/packages/react/src/components/Label/Label.usage.md`. Single-component sidecar; one usage pattern is fine if Label has only one canonical case (per clarification, every sidecar still gets a Related section when relevant). Add changeset.
- [ ] T017 [P] [US2] Create `/Users/k.arnett/repos/unbranded-ds/packages/react/src/components/SegmentedControl/SegmentedControl.usage.md`. Compound-style sidecar with Root and Item slot subsections. Add changeset.
- [ ] T018 [P] [US2] Create `/Users/k.arnett/repos/unbranded-ds/packages/react/src/components/Select/Select.usage.md`. Compound-style sidecar with the Select slot tree. Add changeset.
- [ ] T019 [P] [US2] Create `/Users/k.arnett/repos/unbranded-ds/packages/react/src/components/SkipLink/SkipLink.usage.md`. Single-component sidecar. Add changeset.
- [ ] T020 [P] [US2] Create `/Users/k.arnett/repos/unbranded-ds/packages/react/src/components/Slider/Slider.usage.md`. Compound-style sidecar with Root, Control, Track, Indicator, Thumb subsections. Add changeset.
- [ ] T021 [P] [US2] Create `/Users/k.arnett/repos/unbranded-ds/packages/react/src/components/Switch/Switch.usage.md`. Add changeset.
- [ ] T022 [P] [US2] Create `/Users/k.arnett/repos/unbranded-ds/packages/react/src/components/Tabs/Tabs.usage.md`. Compound-style sidecar with Root, List, Trigger, Content subsections. Add changeset.
- [ ] T023 [P] [US2] Create `/Users/k.arnett/repos/unbranded-ds/packages/react/src/components/Tooltip/Tooltip.usage.md`. Compound-style sidecar with Provider, Trigger, Content subsections. Add changeset.
- [ ] T024 [P] [US2] Create `/Users/k.arnett/repos/unbranded-ds/packages/react/src/components/VisuallyHidden/VisuallyHidden.usage.md`. Single-component sidecar. Add changeset.

**Checkpoint**: Every shipped component has a sidecar next to its source. AGENTS.md's component index links all resolve.

---

## Phase 5: User Story 3 — Autodoc legibility audit (Priority: P3) — DEFERRED to spec 005b

> Status: deferred during `/speckit.implement`. The 14 per-component audit tasks below remain as the canonical detail; spec 005b's `/speckit.tasks` run lifts them. FR-030 (revised during clarify) already allows the TSDoc-edit scope these tasks need. See "Deferred work" at the end of spec.md.


**Goal**: Run the humanizer audit across four prose surfaces — `argTypes` descriptions, component-level descriptions, story-level descriptions, and TSDoc comments — for every shipped component. Fix issues in place; git history is the audit ledger.

**Independent Test**: Reviewer reads every component's stories.tsx (component-level + argTypes + story-level descriptions) and `.tsx` source TSDoc. Every prop description explains both WHAT and WHEN; no three-item prose lists remain; no em-dash overuse; no promotional vocabulary.

Each task audits one component across all four prose surfaces. Audit work runs in parallel with US2 since the files don't overlap (`.usage.md` vs `.stories.tsx`/`.tsx`).

- [ ] T025 [P] [US3] Audit prose in `/Users/k.arnett/repos/unbranded-ds/packages/react/src/components/Button/Button.stories.tsx` (component-level, argTypes, story-level descriptions) and `/Users/k.arnett/repos/unbranded-ds/packages/react/src/components/Button/Button.tsx` (TSDoc comments). Apply humanizer pass per Section XI.1. Confirm every prop description explains WHY a consumer would reach for it.
- [ ] T026 [P] [US3] Audit Card prose in `/Users/k.arnett/repos/unbranded-ds/packages/react/src/components/Card/Card.stories.tsx` and `/Users/k.arnett/repos/unbranded-ds/packages/react/src/components/Card/Card.tsx`.
- [ ] T027 [P] [US3] Audit Checkbox prose in `/Users/k.arnett/repos/unbranded-ds/packages/react/src/components/Checkbox/Checkbox.stories.tsx` and `/Users/k.arnett/repos/unbranded-ds/packages/react/src/components/Checkbox/Checkbox.tsx`.
- [ ] T028 [P] [US3] Audit Dialog prose in `/Users/k.arnett/repos/unbranded-ds/packages/react/src/components/Dialog/Dialog.stories.tsx` and `/Users/k.arnett/repos/unbranded-ds/packages/react/src/components/Dialog/Dialog.tsx`.
- [ ] T029 [P] [US3] Audit Input prose in `/Users/k.arnett/repos/unbranded-ds/packages/react/src/components/Input/Input.stories.tsx` and `/Users/k.arnett/repos/unbranded-ds/packages/react/src/components/Input/Input.tsx`.
- [ ] T030 [P] [US3] Audit Label prose in `/Users/k.arnett/repos/unbranded-ds/packages/react/src/components/Label/Label.stories.tsx` and `/Users/k.arnett/repos/unbranded-ds/packages/react/src/components/Label/Label.tsx`.
- [ ] T031 [P] [US3] Audit SegmentedControl prose in `/Users/k.arnett/repos/unbranded-ds/packages/react/src/components/SegmentedControl/SegmentedControl.stories.tsx` and `/Users/k.arnett/repos/unbranded-ds/packages/react/src/components/SegmentedControl/SegmentedControl.tsx`.
- [ ] T032 [P] [US3] Audit Select prose in `/Users/k.arnett/repos/unbranded-ds/packages/react/src/components/Select/Select.stories.tsx` and `/Users/k.arnett/repos/unbranded-ds/packages/react/src/components/Select/Select.tsx`.
- [ ] T033 [P] [US3] Audit SkipLink prose in `/Users/k.arnett/repos/unbranded-ds/packages/react/src/components/SkipLink/SkipLink.stories.tsx` and `/Users/k.arnett/repos/unbranded-ds/packages/react/src/components/SkipLink/SkipLink.tsx`. Include the "Multiple skip targets" named story description.
- [ ] T034 [P] [US3] Audit Slider prose in `/Users/k.arnett/repos/unbranded-ds/packages/react/src/components/Slider/Slider.stories.tsx` and `/Users/k.arnett/repos/unbranded-ds/packages/react/src/components/Slider/Slider.tsx`. Include the touch-input named story description.
- [ ] T035 [P] [US3] Audit Switch prose in `/Users/k.arnett/repos/unbranded-ds/packages/react/src/components/Switch/Switch.stories.tsx` and `/Users/k.arnett/repos/unbranded-ds/packages/react/src/components/Switch/Switch.tsx`.
- [ ] T036 [P] [US3] Audit Tabs prose in `/Users/k.arnett/repos/unbranded-ds/packages/react/src/components/Tabs/Tabs.stories.tsx` and `/Users/k.arnett/repos/unbranded-ds/packages/react/src/components/Tabs/Tabs.tsx`.
- [ ] T037 [P] [US3] Audit Tooltip prose in `/Users/k.arnett/repos/unbranded-ds/packages/react/src/components/Tooltip/Tooltip.stories.tsx` and `/Users/k.arnett/repos/unbranded-ds/packages/react/src/components/Tooltip/Tooltip.tsx`. Include the "Wrapping an inline element" named story description.
- [ ] T038 [P] [US3] Audit VisuallyHidden prose in `/Users/k.arnett/repos/unbranded-ds/packages/react/src/components/VisuallyHidden/VisuallyHidden.stories.tsx` and `/Users/k.arnett/repos/unbranded-ds/packages/react/src/components/VisuallyHidden/VisuallyHidden.tsx`.

**Checkpoint**: All 14 component prose surfaces pass humanizer review. Storybook autodocs and MCP responses both read better for both audiences.

---

## Phase 6: User Story 4 — Token-query MCP (Priority: P4)

**Goal**: Ship the stdio token-query MCP with four tools, the shared runtime infrastructure that a future MCP can adopt, smoke and unit tests, CI integration, and the AGENTS.md tool inventory.

**Independent Test**: An MCP client configured with the connection block from `AGENTS.md` connects to the spawned MCP, calls `tools/list`, and gets back the four tools. Each tool returns structured JSON for valid inputs and a typed error payload for invalid inputs. A consumer can answer "what's `color.primary` in dark mode?" with a single `lookupToken` call. CI's smoke test passes.

### Runtime infrastructure (foundation for the tools)

- [X] T039 [US4] Create `/Users/k.arnett/repos/unbranded-ds/packages/tokens/src/mcp/runtime/stdio.ts` exposing `createServer({ name, version, tools })` that instantiates `@modelcontextprotocol/sdk`'s `Server` with the stdio transport, registers the provided tools, and returns the configured server.
- [X] T040 [P] [US4] Create `/Users/k.arnett/repos/unbranded-ds/packages/tokens/src/mcp/runtime/errors.ts` exposing `mcpError(payload: { component: string; issue: string; [key: string]: unknown })` that wraps the structured payload in the MCP protocol's error envelope (`isError: true` with the parseable payload as the message body) per Section XI.4 and FR-027.
- [X] T041 [US4] Create `/Users/k.arnett/repos/unbranded-ds/packages/tokens/src/mcp/runtime/testing.ts` exposing `spawnAndQuery(toolName, args)` for unit tests (in-process call into the tool handler with mocked input) and `runSmokeTest()` for CI (spawns the built binary, calls `tools/list`, asserts the four expected tools). Depends on stdio.ts.
- [X] T042 [P] [US4] Create unit tests at `/Users/k.arnett/repos/unbranded-ds/packages/tokens/src/mcp/runtime/stdio.test.ts` covering `createServer` configuration, tool registration, and lifecycle handling with a mocked SDK.
- [X] T043 [P] [US4] Create unit tests at `/Users/k.arnett/repos/unbranded-ds/packages/tokens/src/mcp/runtime/errors.test.ts` covering the `mcpError` payload wrapping for each expected error shape.
- [X] T044 [P] [US4] Create unit tests at `/Users/k.arnett/repos/unbranded-ds/packages/tokens/src/mcp/runtime/testing.test.ts` covering `spawnAndQuery` invocation patterns.

### Per-tool implementation

- [X] T045 [P] [US4] Create `/Users/k.arnett/repos/unbranded-ds/packages/tokens/src/mcp/tools/listThemes.ts` implementing the `listThemes` tool per `contracts/token-query-mcp.md`. Returns the theme keys exposed by `@unbranded-ds/tokens` with their descriptions.
- [X] T046 [P] [US4] Create `/Users/k.arnett/repos/unbranded-ds/packages/tokens/src/mcp/tools/palette.ts` implementing the `palette` tool. Accepts flat (`'color'`) or hierarchical (`'color.foreground'`) categories per the clarified contract; walks the token tree from the given prefix. Emits `unknown-category` and `unknown-theme` errors via `mcpError`.
- [X] T047 [P] [US4] Create `/Users/k.arnett/repos/unbranded-ds/packages/tokens/src/mcp/tools/contrast.ts` implementing the `contrast` tool. Accepts color strings (hex/rgb/hsl) or named token references for both `foreground` and `background`; resolves tokens against the active theme; reuses the existing WCAG contrast math from `@unbranded-ds/tokens` (expose the function from `validateTheme` internals if not already public). Emits `unparseable-color`, `unknown-token`, and `unknown-theme` errors.
- [X] T048 [P] [US4] Create `/Users/k.arnett/repos/unbranded-ds/packages/tokens/src/mcp/tools/lookupToken.ts` implementing the `lookupToken` tool. Returns the resolved CSS variable name and current value; emits `unknown-token` and `unknown-theme` errors.

### Per-tool tests

- [X] T049 [P] [US4] Create `/Users/k.arnett/repos/unbranded-ds/packages/tokens/src/mcp/tools/listThemes.test.ts` covering the success path.
- [X] T050 [P] [US4] Create `/Users/k.arnett/repos/unbranded-ds/packages/tokens/src/mcp/tools/palette.test.ts` covering: success for flat category; success for hierarchical category; `unknown-category` error; `unknown-theme` error.
- [X] T051 [P] [US4] Create `/Users/k.arnett/repos/unbranded-ds/packages/tokens/src/mcp/tools/contrast.test.ts` covering: success with two hex colors; success with token references resolved against a theme; `unparseable-color` error; `unknown-token` error; AA/AAA/normal/large flags computed correctly.
- [X] T052 [P] [US4] Create `/Users/k.arnett/repos/unbranded-ds/packages/tokens/src/mcp/tools/lookupToken.test.ts` covering: success path; `unknown-token` error; `unknown-theme` error; default-theme fallback when `theme` omitted.

### Server + integration

- [X] T053 [US4] Create `/Users/k.arnett/repos/unbranded-ds/packages/tokens/src/mcp/server.ts` as the binary entry point. Includes the `#!/usr/bin/env node` shebang. Calls `createServer({ name: 'unbranded-ds-tokens-mcp', version, tools })` with all four tools registered, then connects and runs. Depends on T039–T048.
- [X] T054 [US4] Create `/Users/k.arnett/repos/unbranded-ds/packages/tokens/src/mcp/smoke.test.ts` per FR-029a. Builds the binary, spawns it, sends `tools/list`, asserts all four tools are present with their expected input schemas; sends a `tools/call` for `listThemes` and asserts non-empty themes.
- [X] T055 [US4] Create `/Users/k.arnett/repos/unbranded-ds/packages/tokens/src/mcp/index.ts` re-exporting the runtime primitives so a future `@unbranded-ds/react` MCP can adopt them.
- [X] T056 [US4] Update `/Users/k.arnett/repos/unbranded-ds/packages/tokens/tsup.config.ts` to add `src/mcp/server.ts` as a build entry with the `#!/usr/bin/env node` banner.
- [X] T057 [US4] Add an MCP smoke test step to `/Users/k.arnett/repos/unbranded-ds/.github/workflows/ci.yml` in the verify job, after the package build step, running `pnpm --filter @unbranded-ds/tokens test smoke`.
- [X] T058 [US4] Update `/Users/k.arnett/repos/unbranded-ds/AGENTS.md`'s Tool inventory section with the four token-query tools using the FR-003 three-line format (name, purpose, useful-when). Update the MCP endpoints section to include the token-query connection block.
- [X] T059 [US4] Create `/Users/k.arnett/repos/unbranded-ds/.changeset/add-tokens-mcp.md` declaring `@unbranded-ds/tokens: minor` (new feature).

**Checkpoint**: Token-query MCP is built, tested, and CI-smoke-tested. AGENTS.md documents the connection. The package is ready for the next release.

---

## Phase 7: Polish & Cross-Cutting

**Purpose**: Final integration verification across all four user stories' output.

- [X] T060 [P] Run `pnpm exec tsx scripts/validate-sidecars.ts` locally and verify all 14 sidecars plus the template pass compile-validation.
- [X] T061 [P] Run `pnpm test` across all packages and verify all unit tests pass (including the new MCP runtime + per-tool + smoke tests).
- [X] T062 [P] Run `pnpm build` (Turbo) across all packages and verify the MCP binary builds at `packages/tokens/dist/mcp/server.js` with the shebang in place.
- [X] T063 Run `pnpm --filter @unbranded-ds/storybook build` and verify all stories still compile (the audit edits should not break stories).
- [X] T064 Final humanizer pass on `AGENTS.md` prose. Confirm no three-item lists, no em-dash overuse, no promotional language. The file passes its own contract.
- [X] T065 Verify `/Users/k.arnett/repos/unbranded-ds/.specify/memory/constitution.md` is at version 1.1.1 with both the Section XI principle (from the prior `/speckit.constitution` invocation) and the Section VIII MCP-SDK amendment from T004 present.

---

## Dependencies & Execution Order

### Phase dependencies

```text
Phase 1 (Setup — package config)
    ↓
Phase 2 (Foundational — constitution amendment)
    ↓
Phase 3 (US1 — Sidecar foundation: template, AGENTS.md, validator)
    ↓
    ├── Phase 4 (US2 — 14 sidecar PRs)              ⎫
    ├── Phase 5 (US3 — 14 audit tasks)              ⎬ run in parallel
    └── Phase 6 (US4 — Token-query MCP)             ⎭
    ↓ (all three complete)
Phase 7 (Polish & Cross-Cutting)
```

### Within-phase dependencies

**Phase 3 (US1)**:

```text
T005 (validator script) → T006 (CI integration)
T007 (template) [P with T008]
T008 (AGENTS.md) [P with T007]
T009 (README link)
T010 (changeset)
```

**Phase 6 (US4)** has internal layering:

```text
T039 (runtime/stdio.ts) ──┐
T040 (runtime/errors.ts) [P]
        ↓
T041 (runtime/testing.ts)
        ↓
T042, T043, T044 (runtime tests) [P]
        ↓
T045, T046, T047, T048 (tools) [P]
        ↓
T049, T050, T051, T052 (tool tests) [P]
        ↓
T053 (server.ts) ← consumes all tools + runtime
        ↓
T054 (smoke test) ← consumes server
        ↓
T055 (index.ts re-exports)
T056 (tsup config update)
T057 (CI smoke test step)
T058 (AGENTS.md update)
T059 (changeset)
```

### Cross-phase file conflicts

`AGENTS.md` is touched by T008 (US1 initial) and T058 (US4 update). Sequence T058 after T008. If both PRs are open simultaneously, expect a merge conflict on AGENTS.md; resolve in the order PRs merge.

The 14 sidecar PRs in Phase 4 are file-isolated (different `<Component>/<Component>.usage.md` paths). The 14 audit tasks in Phase 5 are also file-isolated (different `<Component>.stories.tsx` and `<Component>.tsx` paths). US2 and US3 do not conflict.

### Per-component independence

Phase 4 (US2): T011–T024 are 14 independent PRs. Phase 5 (US3): T025–T038 are 14 independent commits. A consumer can land them in any order. Per-PR changesets in Phase 4 each declare `@unbranded-ds/react: patch`.

---

## Parallel Execution Strategy

The user-story phases (US1–US4) are designed to be implemented by separate developers or agents in parallel after US1 completes. The branch structure expects multiple PRs open simultaneously.

### Within US1 (single agent, ~7 tasks)

After T005 (validator script) completes, T006 (CI integration), T007 (template), T008 (AGENTS.md), and T009 (README link) can issue parallel-ish tool calls. T010 (changeset) is the last task.

### Across US2, US3, US4 (multiple agents/developers)

```text
After US1 (T010) merges:
  Track A (US2): 14 parallel sidecar PRs (T011–T024)
  Track B (US3): 14 parallel audit tasks (T025–T038)
  Track C (US4): MCP build (T039–T059), internally sequenced

  Each track is independent of the others' files.
  AGENTS.md is the one shared file; resolve in merge order.
```

For US2 and US3, the 14 tasks per phase can be split across multiple developers or agents — one component per track.

### Polish phase

T060, T061, T062 are independent verification tasks ([P]). T063, T064, T065 are sequential after the others.

---

## Implementation Strategy

### MVP scope (single-story shipping option)

If pressure forces a partial release, the MVP is **User Story 1 — Sidecar foundation**:

- Setup (T001–T003) + Foundational (T004) + Phase 3 (T005–T010)
- Ships: AGENTS.md, sidecar template, compile validator, CI integration
- Consumers can read AGENTS.md and the template; the per-component sidecars come in follow-up PRs

This is a reasonable MVP because it establishes the agent-experience foundation even without the retrofit or MCP. Subsequent specs can land US2, US3, US4 independently.

### Incremental delivery (recommended)

1. Land Setup + Foundational (T001–T004) as a small PR — package config + constitution amendment.
2. Land US1 (T005–T010) as the foundation PR — validator, AGENTS.md, template.
3. Open three parallel tracks:
   - US2: 14 sidecar PRs (one per component)
   - US3: 14 audit commits (one per component, can bundle into fewer PRs at the developer's discretion since the task list doesn't mandate per-component PRs for audit work)
   - US4: MCP build (one or more PRs covering the runtime, tools, server, and CI integration)
4. Run Phase 7 polish (T060–T065) after all three tracks have landed.

### Sequencing notes

- The constitution amendment (T004) and the MCP work (US4) can land in the same PR or different PRs. If different, T004 lands first so the MCP work imports `@modelcontextprotocol/sdk` against a constitution that legitimizes it.
- T058 (AGENTS.md update for the MCP) and T011–T024 (sidecars that update AGENTS.md's component index) all touch `AGENTS.md`. If multiple PRs touch the file, expect merge conflicts to resolve in PR order. A future spec could automate the index from filesystem state.

---

## Task counts

| Phase                             | Count  | Notes                                                                           |
| --------------------------------- | ------ | ------------------------------------------------------------------------------- |
| Phase 1: Setup                    | 3      | Package config + lockfile                                                       |
| Phase 2: Foundational             | 1      | Constitution PATCH amendment                                                    |
| Phase 3: US1 (sidecar foundation) | 6      | Validator + template + AGENTS.md + README link + changeset                      |
| Phase 4: US2 (sidecar retrofit)   | 14     | One PR per component                                                            |
| Phase 5: US3 (autodoc audit)      | 14     | One task per component, all parallel                                            |
| Phase 6: US4 (token-query MCP)    | 21     | Runtime + 4 tools + tests + server + integration + AGENTS.md update + changeset |
| Phase 7: Polish                   | 6      | Validation, build, humanizer pass, constitution check                           |
| **Total**                         | **65** |                                                                                 |

Parallel opportunities: 3 cross-phase tracks (US2, US3, US4) after US1 completes; within each track, all tasks marked [P] can run concurrently. Within US4, up to 4 tool-implementation tasks and 4 tool-test tasks run simultaneously. Within polish, 3 [P] tasks run together.
