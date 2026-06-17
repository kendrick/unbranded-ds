# Feature Specification: Storybook interaction and accessibility gate executes in CI

**Feature Branch**: `019-storybook-test-runner-ci`
**Created**: 2026-06-16
**Status**: Draft
**Input**: User description: "@docs/workshops/2026-06-16/spec-019-storybook-test-runner-ci.md"

## Clarifications

### Session 2026-06-16

- Q: How should the gate run in CI — its own job, or a step inside the existing verify job? → A: Its own job, parallel to the example end-to-end job, doing its own browser install, so the heavy browser setup stays off the common verify path.
- Q: What rendering should the accessibility gate check — each story as it renders by default, or every color-scheme/theme/density combination? → A: Default rendering per story. The full contrast matrix is already guarded by the tokens unit test (`themes-contrast.test.ts`), so this gate checks component accessibility on the default rendering and does not re-render the matrix.
- Q: If first run surfaces a latent play or a11y failure, how do we keep the required gate green? → A: Fix it in this PR (a justified bug-fix exception to the CI-only scope), excluding the one failing story or rule under a tracked follow-up only when the fix is too large for this PR.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Interaction tests run in CI and block merge (Priority: P1)

Every component ships `play` functions that exercise its primary interaction, and the constitution treats them as a required gate. Today they never run: the script meant to run them errors immediately because no test project is defined, and no CI job invokes it. So a story whose `play` throws sails through CI green. This story makes the interaction tests actually execute on every pull request, and a failing `play` turns the build red.

**Why this priority**: This is the headline. The constitution promises an interaction gate (Section VI.2) and it is currently a no-op, which is worse than having none: contributors and agents believe it runs. Restoring execution is the core value, and the other slices build on the runner this one stands up.

**Independent Test**: Break one story's `play` function (assert something false), open a pull request, and confirm CI fails and names the failing story. Restore it and CI passes.

**Acceptance Scenarios**:

1. **Given** a pull request where a story's `play` function throws, **When** CI runs, **Then** the build fails and the output names the failing story.
2. **Given** a pull request where every `play` function passes, **When** CI runs, **Then** the interaction gate passes.
3. **Given** a component whose stories are added after this lands, **When** CI runs, **Then** its `play` functions execute with no per-component CI wiring.

---

### User Story 2 - Accessibility tests run in a real browser and block on real violations (Priority: P2)

The constitution requires an accessibility gate that fails CI on any axe violation of serious or critical impact, and the a11y addon is already set to error. But the same missing runner means the axe pass never executes, and the color-contrast check in particular only works when stories render in a real browser. This story runs the accessibility checks on every pull request, in an environment that computes real contrast, so a sub-AA pair in any story fails the gate.

**Why this priority**: It is the accessibility half of the constitution's gate (Section VI.3, VII), and the contrast computation is the part most likely to catch a real regression. It is P2 rather than P1 only because it builds on the runner US1 stands up; the two ship together in practice.

**Independent Test**: Drop a rendered story's foreground/background pair below WCAG AA, open a pull request, and confirm the accessibility gate fails and names the axe rule and story. Restore it and the gate passes.

**Acceptance Scenarios**:

1. **Given** a pull request that introduces a serious or critical accessibility violation in a story, **When** CI runs, **Then** the build fails and the output names the axe rule and the story.
2. **Given** a pull request that drops a rendered story's foreground/background pair below WCAG AA, **When** CI runs, **Then** the accessibility gate fails, proving contrast is actually computed.
3. **Given** every story depicts an accessible state, **When** CI runs, **Then** the accessibility gate passes.

---

### User Story 3 - A contributor runs the same gate locally (Priority: P3)

A contributor wants to run the interaction and accessibility gate before pushing, to get the same pass/fail CI will give. Today the command exists in the Storybook app but errors with "No projects matched the filter," so there is no way to reproduce the gate locally. This story makes the command run the suite locally with the same configuration CI uses.

**Why this priority**: It tightens the development loop and avoids push-wait-fail churn, but it carries no merge-blocking guarantee on its own, and it depends on the runner from US1/US2 existing. Valuable, not load-bearing.

**Independent Test**: Run the gate command locally on a clean checkout and confirm it executes the interaction and accessibility suite and reports pass/fail, rather than erroring for a missing test project.

**Acceptance Scenarios**:

1. **Given** a local checkout, **When** the contributor runs the gate command, **Then** it runs the interaction and accessibility suite and reports the same outcome CI would, with no "No projects matched" error.

---

### Edge Cases

- **Render-only stories**: a story with no `play` function still gets its accessibility pass — the gate renders it and runs axe, so a11y coverage does not depend on having an interaction.
- **The browser is absent in CI**: the accessibility checks need a real browser to compute contrast, so the gate's CI environment must provision that browser, the way the example end-to-end job already does. Without it the gate cannot run and must fail loudly rather than skip silently.
- **A story that depicts a failure or disabled state**: such states are still expected to be accessible (a disabled control is a valid accessible state). A story that deliberately demonstrated a serious violation would need explicit exclusion; none exists today.
- **A latent pre-existing failure**: the very first execution runs `play` functions and axe passes that have never run. The expectation is a green gate on the current codebase (spec 018 closed the known contrast gap). If first execution surfaces a genuine failure, it is fixed in this pull request — a justified exception to the CI-only scope, since the gate just caught a real bug — and the one failing story or rule is excluded under a tracked follow-up only when the fix is too large for this PR. The gate is never loosened to pass.
- **Coexistence with the existing unit tests**: the new browser-rendered story gate runs alongside the existing fast unit tests, not in place of them; both run on a pull request.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Story `play` functions MUST execute on every pull request, and a `play` that throws MUST fail the build.
- **FR-002**: Story accessibility checks MUST execute on every pull request, and any axe violation MUST fail the build. The constitution's floor is serious or critical impact (VI.3, VII); this gate is deliberately stricter and fails on any violation, which still satisfies the floor.
- **FR-003**: The accessibility checks MUST run where color-contrast is actually computed, so a foreground/background pair below WCAG AA in a rendered story fails the gate. An environment that cannot compute contrast is insufficient.
- **FR-004**: The gate MUST run on every pull request and block merge on failure (Constitution VI: "CI must run all three on every pull request and block merge on failure").
- **FR-005**: The gate MUST cover all components' stories in their default rendering, and stories added later MUST be included without per-story or per-component CI wiring. It does NOT re-render each story across the color-scheme/theme/density matrix; that cross-axis contrast is already guarded by the tokens unit test (`themes-contrast.test.ts`), so this gate checks component accessibility on the default rendering.
- **FR-006**: A failing gate MUST identify the failing story and the specific assertion or accessibility rule, so a human or an agent can act on it without rerunning locally to discover what broke (Constitution XI).
- **FR-007**: The gate MUST be runnable locally with the same configuration CI uses and produce the same outcome; the command MUST NOT error for lack of a defined test project.
- **FR-008**: The plumbing itself MUST be limited to CI and test configuration and MUST NOT modify component, token, or story source merely to manufacture a passing gate. The one exception is a genuine failure the gate surfaces on first run, which is fixed as a real defect (see the latent-failure edge case), not worked around.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A pull request whose story `play` function throws fails CI, where today it passes.
- **SC-002**: A pull request that introduces a serious or critical accessibility violation in a story fails CI, where today it passes.
- **SC-003**: A pull request that drops a rendered story's foreground/background pair below WCAG AA fails CI through the accessibility gate, demonstrating that contrast is computed for real.
- **SC-004**: The interaction and accessibility gate runs on every pull request as a required check and blocks merge on failure.
- **SC-005**: A contributor runs the gate locally and gets the same pass/fail as CI; the command no longer errors with "No projects matched the filter."
- **SC-006**: The gate executes every story that carries a `play` function or an accessibility annotation, with no per-story opt-in.

## Assumptions

- Spec 018 (the destructive Button AA fix) is merged, so turning on real-contrast accessibility checks passes on the current codebase rather than failing on that pair. This is why the brief sequenced 018 first; it has landed.
- The existing stories depict valid, accessible states, and none intentionally demonstrates a serious or critical violation, so no story needs exclusion to make the gate green.
- The `play` functions currently written are deterministic and pass. The expectation is a green gate on the current main. A latent failure surfaced by first execution is a real defect, triaged separately from this plumbing (see the FR-008 edge case).
- The capability the gate needs — running stories with an axe pass that computes contrast in a real browser — is available through the Storybook testing tooling already present in the repo; no new product dependency is introduced.
- No changeset is required. The change touches the Storybook app and CI configuration, not `packages/react` or `packages/tokens`, so Constitution X's per-PR changeset rule does not apply.
- The gate runs as its own CI job, parallel to the example end-to-end job, with its own browser install, so the heavy browser setup stays off the common `verify` path that gates every pull request.
- The CI environment can install and run the same browser the example end-to-end job already installs, so provisioning it is a known, solved step.
