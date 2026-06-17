# Implementation Plan: Storybook interaction and accessibility gate executes in CI

**Branch**: `019-storybook-test-runner-ci` | **Date**: 2026-06-16 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/019-storybook-test-runner-ci/spec.md`

## Summary

The constitution requires two Storybook test layers — interaction (`play` functions) and accessibility (axe, failing on serious or critical impact) — and Section VIII even lists "storybook test-runner (interaction + a11y)" as a CI pipeline step. Both are written (`a11y: { test: 'error' }` is set, every component ships `play` functions) but neither runs: `apps/storybook` has a `test:storybook` script pointing at a `vitest --project storybook` that no config defines, so it errors with "No projects matched the filter," and no CI job invokes it.

The fix is small and mechanical. Add the missing `vitest.config.ts` in `apps/storybook` that defines the `storybook` project using `@storybook/addon-vitest`'s `storybookTest()` plugin in browser mode (Playwright, Chromium) so axe computes real contrast, reusing the existing `.storybook/vitest.setup.ts`. Add the two browser-mode dev dependencies (`@vitest/browser`, `playwright`) that the optional peer needs. Add a dedicated CI job — parallel to `example-e2e`, with its own Chromium install — that builds the packages the stories import, then runs the gate. The gate checks each story in its default rendering; the cross-axis contrast matrix stays covered by the tokens unit test. No component, token, or story changes, unless first execution surfaces a genuine failure, which is then fixed as a real defect.

## Technical Context

**Language/Version**: TypeScript 5.x, strict, no `any` (Constitution VIII)
**Primary Dependencies**: Vitest 3 (browser mode), `@vitest/browser` (^3, the optional peer that is currently absent), `playwright` (Chromium; `playwright@1.61.0` is already in the workspace store), `@storybook/addon-vitest` ^10.3 (`storybookTest()` plugin, already a devDep), `@storybook/addon-a11y` ^10.3 (axe, `test: 'error'` already set), Storybook 10.3 `@storybook/react-vite`, GitHub Actions
**Storage**: N/A — CI and test configuration; no runtime or persisted state
**Testing**: this feature *is* test infrastructure. It executes the interaction (`play`) and accessibility (axe) layers across every story in headless Chromium, the layers Constitution VI.2/VI.3 require
**Target Platform**: GitHub Actions (ubuntu) for the gate, plus local developer runs
**Project Type**: monorepo — a test-config addition in `apps/storybook` plus a new CI job in the existing workflow
**Performance Goals**: no hard CI-time budget (per clarification); correctness first. The gate is one Chromium job running in parallel with `example-e2e`, so it does not extend the critical path beyond that job
**Constraints**: CI and test configuration only (FR-008), with the one exception of a genuine failure the gate surfaces on first run; Vitest stays at 3 (no forced move to 4 — `addon-vitest@10.3` accepts `@vitest/browser ^3`); the accessibility pass checks each story's default rendering, not the full axis matrix (already a tokens unit test); no changeset (no `packages/react` or `packages/tokens` change)
**Scale/Scope**: one `vitest.config.ts`, two dev dependencies, one CI job. Plus a possible defect fix if first execution is not green

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Section I (repository shape)** — PASS. No new package. The change lives in the existing `apps/storybook` and the CI workflow; adding dev dependencies to the private Storybook app is within its role.
- **Section VI (testing: three layers)** — PASS, and the point. This makes layers 2 (interaction) and 3 (accessibility) actually execute and block merge, which they do not today. It fulfills VI rather than straining it.
- **Section VII (deployment / MCP surface)** — PASS. The Chromatic publish and MCP smoke test are untouched; the new gate is a separate job and does not change the publish path.
- **Section VIII (tooling baseline)** — PASS. It uses exactly the mandated tools: Vitest, the Storybook Test addon, `@storybook/addon-a11y`, and the test-runner. Section VIII's own CI pipeline line already names "storybook test-runner (interaction + a11y)" as a step, so this closes the gap between the described pipeline and the workflow rather than introducing tooling. The browser provider (`@vitest/browser` + `playwright`) is the implementation of that mandated runner, not a new tool category, so no amendment is needed.
- **Section X (changeset per PR)** — PASS. No changeset is required: the change touches `apps/storybook` and CI, not `packages/react` or `packages/tokens`. This Constitution Check satisfies the compliance-review requirement for the PR.
- [x] **Section XI — does this change keep prose, API shape, docs surfaces, failure modes, and story coverage legible to both agents and humans? List any concessions.**
  - Prose: research, quickstart, and commit/PR text pass through the `humanizer` skill before merge.
  - API shape: no component or token API changes.
  - Failure modes: the gate's output names the failing story and the specific assertion or axe rule (FR-006), so a human or agent can act without rerunning to discover what broke. This is the structured, legible failure XI.4 asks for.
  - Story coverage: this directly enforces XI.5 and Section V — "if a behavior is not exercised in a story it is not shipped" — by actually running the stories that were previously written and ignored.
  - **Stricter-than-floor a11y (decided)**: the existing `a11y: { test: 'error' }` fails on any axe violation, stricter than the constitution's serious/critical floor. Confirmed as the intended behavior during analysis on 2026-06-16 (FR-002 updated to match). It is compliant — serious/critical still fail — and if a low-impact violation ever proves noisy, the threshold can be scoped later.

No violations. Complexity Tracking below is intentionally empty.

## Project Structure

### Documentation (this feature)

```text
specs/019-storybook-test-runner-ci/
├── plan.md              # This file (/speckit.plan output)
├── research.md          # Phase 0 output — browser-mode provider, the deps, the CI-job shape, the a11y threshold
├── quickstart.md        # Phase 1 output — how to run and verify the gate, locally and in CI
├── checklists/
│   └── requirements.md  # /speckit.specify output (clarifications locked)
└── tasks.md             # /speckit.tasks output (NOT created here)
```

No `data-model.md` and no `contracts/`: there are no entities, and the feature exposes no public interface — it wires existing test layers into CI. The verifiable invariants are behavioral (a broken `play` fails CI, a sub-AA story fails CI), captured in quickstart and the spec's success criteria.

### Source Code (repository root)

```text
apps/storybook/
├── vitest.config.ts            # NEW — defines the `storybook` vitest project: storybookTest() plugin,
│                               #       browser mode (Playwright, Chromium, headless), reusing the setup file
├── package.json                # ADD devDeps: @vitest/browser (^3, the absent optional peer) + playwright
└── .storybook/
    └── vitest.setup.ts         # EXISTING — already calls setProjectAnnotations; reused as setupFiles (no change expected)

.github/workflows/ci.yml        # NEW job `storybook-test` (needs: verify), parallel to example-e2e:
                                #   build tokens + react → install Chromium → run test:storybook
```

**Structure Decision**: The `test:storybook` script already exists and points at `vitest run --project storybook`; the only reason it errors is the missing project definition. Adding `apps/storybook/vitest.config.ts` is the whole fix on the test side. The CI side mirrors the existing `example-e2e` job exactly — its own runner, its own `playwright install --with-deps chromium`, after a package build — because that job already proves the browser-install pattern works here. The gate runs as its own job (clarified) so the heavy browser install stays off the `verify` path that gates every PR, while the workflow stays a single `ci.yml` with a job graph (Section VIII's "one workflow, one job graph").

## Complexity Tracking

> No Constitution Check violations. No entries.
