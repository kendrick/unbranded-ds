# Feature Specification: Re-home DS lint so it actually runs

**Feature Branch**: `025-re-home-lint`
**Created**: 2026-06-18
**Status**: Draft
**Input**: Workshop brief `docs/workshops/2026-06-18/spec-025-re-home-lint.md`. Surfaced triaging issue #98: lint was pulled from CI in Phase 7 for a crash that is now fixed, but lint never came back for the design system's own packages, while the CI job name and the README still claim it runs.

## Clarifications

### Session 2026-06-19

- Q: Which ESLint stack should gate the DS packages, given Prettier already owns formatting and antfu's stylistic rules produce 63 redundant `quote-props` errors? → A: Keep antfu but disable its stylistic rule set; retain antfu's TypeScript-correctness, React, and jsx-a11y rules plus the in-house `no-hardcoded-colors`. (Plan Phase 0 refined the mechanism: antfu, not Prettier, is the JS/TS formatter here, so only the redundant `style/quote-props` rule is disabled rather than the whole stylistic set; Prettier keeps CSS, HTML, and Markdown. See FR-011.)
- Q: Which packages should the CI lint step cover? → A: Every DS package with a `lint` script — `@unbranded-ds/react`, `@unbranded-ds/tokens`, and the `@unbranded-ds/storybook` app — through `pnpm lint` / `turbo lint`. The example app lints itself separately.
- Q: Where should lint run in CI? → A: A blocking step inside the existing `verify` job, reusing its install. Not a separate job, and no pre-commit lint-staged hook in this spec.
- Q: How do we reach a green tree and turn blocking on? → A: Fix to green and block from day one, with no advisory-first phase. The 63 `quote-props` errors clear by disabling antfu's style rules rather than hand-editing each one.
- Q: Should the gate treat lint warnings as failures? → A: Errors-only gate. The 8 existing `@unbranded-ds/react` warnings stay non-blocking and are tracked for a separate follow-up.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - DS package changes are actually linted in CI (Priority: P1)

A contributor or agent opens a pull request that touches a DS package (`@unbranded-ds/react`, `@unbranded-ds/tokens`, or the `@unbranded-ds/storybook` app). Lint runs against that package source as part of the gate, and an error is reported on the pull request before it can merge.

**Why this priority**: This is the whole point. Today the DS packages are linted nowhere: not in CI, not on commit. The gate the repo advertises does not exist for the packages it most needs to cover. Everything else in this spec is in service of this.

**Independent Test**: Introduce a deliberate lint error (for example, an unused import) in `packages/react` source, push it on a branch, and confirm the CI lint check reports the error and fails. Revert and confirm the check goes green.

**Acceptance Scenarios**:

1. **Given** a pull request that modifies `@unbranded-ds/react` source containing a lint error, **When** CI runs, **Then** the lint step fails and names the error.
2. **Given** a pull request that modifies `@unbranded-ds/tokens` source with no errors, **When** CI runs, **Then** the lint step passes.
3. **Given** the current `main` tree, **When** lint runs across all linted DS packages, **Then** it completes without the Phase 7 configuration crash (no missing rule file, no missing peer plugin).

---

### User Story 2 - The token-discipline rule is proven to fire (Priority: P1)

`no-hardcoded-colors` is the one DS-specific lint rule the project actually cares about: it enforces the constitution's rule that color comes from tokens, never literal hex/rgb in component source. It is wired into the config (scoped to `packages/react/src/components/**/*.tsx` as an error) but has never run end to end against real component source, so nobody can say whether it matches the right files or fires at all.

**Why this priority**: A rule that is configured but never exercised is indistinguishable from no rule. Confirming it fires against component source is what makes the token guard real rather than nominal, and it is cheap to verify once User Story 1 lands.

**Independent Test**: Add a hardcoded color (e.g. `color: '#ff0000'`) to a real component in `packages/react`, run lint, and confirm `no-hardcoded-colors` reports it as an error. Remove it and confirm the error clears.

**Acceptance Scenarios**:

1. **Given** a component file in `@unbranded-ds/react` containing a literal color value, **When** lint runs, **Then** `no-hardcoded-colors` reports it as an error.
2. **Given** the same component using a token-backed color instead, **When** lint runs, **Then** `no-hardcoded-colors` reports nothing for that line.

---

### User Story 3 - The repo stops advertising a gate it doesn't have (Priority: P2)

A maintainer or prospective contributor reads the CI job names and the README's CI section to understand what the gate enforces. What they read matches what CI actually does.

**Why this priority**: The gap is currently hidden twice over. The `verify` job is named "Lint, typecheck, test, build" but runs no lint, and the README's CI section says verify lints. A silent absence is worse than an honest gap, because a reader checking either source concludes the gate exists. This story corrects the advertising to match what ships; it depends on the outcome of User Story 1 but is independently verifiable.

**Independent Test**: Read every CI job name and the README CI section against the actual workflow steps; confirm no job or doc claims a lint check that isn't run, and that lint coverage is described accurately.

**Acceptance Scenarios**:

1. **Given** the CI workflow after this change, **When** a reader compares each job's name to its steps, **Then** no job advertises "lint" unless it runs lint.
2. **Given** the README's CI section after this change, **When** a reader compares it to the workflow, **Then** its description of lint coverage and whether lint blocks merge matches reality.

---

### Edge Cases

- **Pre-existing violations in the current tree.** Lint today shows 63 errors in `@unbranded-ds/tokens` (61 `style/quote-props`, plus 2 `regexp/no-super-linear-backtracking` in test files) and 8 warnings in `@unbranded-ds/react`. The blocking gate cannot land green until the errors are gone: the 61 clear by disabling the `style/quote-props` rule (FR-011), and the 2 are narrowly suppressed with a rationale (test-time parsing of trusted repo files, not user input). The 8 warnings stay non-blocking (FR-012).
- **Generated and built output.** Generated files (for example `defaults.generated.ts`) and build output (`dist/`) must be excluded from lint so generated code can't trip rules the authored source would never hit.
- **A package with no lintable source.** Lint over such a package must no-op cleanly rather than error on an empty match.
- **The config fails to resolve.** If lint ever cannot run to completion, that is a blocker to surface, not a check to silently skip. The whole point is to remove a silent absence, not relocate one.
- **Docs-only changes.** A docs-only pull request need not run lint, consistent with the workflow's existing docs-only skip for the heavy jobs.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Lint MUST run in CI against every DS package that has a `lint` script — today `@unbranded-ds/react`, `@unbranded-ds/tokens`, and the `@unbranded-ds/storybook` app — through `pnpm lint` / `turbo lint`, on pull requests and pushes to `main`, subject to the existing docs-only skip.
- **FR-002**: A lint error in DS package source MUST fail the CI run and block merge, starting with the commit that lands this gate. There is no advisory-first phase.
- **FR-003**: The `no-hardcoded-colors` rule MUST be exercised against real component source such that a literal color value in a component is reported as an error.
- **FR-004**: No CI job MAY advertise "lint" in its name unless it runs lint; job names MUST describe the checks they actually perform.
- **FR-005**: The README's CI section MUST describe lint accurately: which packages are covered and that lint blocks merge.
- **FR-006**: The existing example-app lint (`@unbranded-ds/example-nextjs`) MUST continue to run and MUST NOT be duplicated or regressed by this change.
- **FR-007**: The lint configuration MUST resolve and run to completion without the Phase 7 failure modes (the missing `no-hardcoded-colors` rule file, the absent antfu peer plugins). This holds today: `turbo lint` runs, and the only failures are rule violations, not configuration errors.
- **FR-008**: Any lint errors in the current DS package tree MUST be resolved so the blocking gate lands green. The pre-existing errors are 61 `style/quote-props` errors plus 2 `regexp/no-super-linear-backtracking` errors in `@unbranded-ds/tokens` test files. The 61 MUST be resolved by disabling the `style/quote-props` rule (see FR-011), not by hand-editing; the 2 are narrowly suppressed with a stated rationale (the regexes parse the repo's own source and generated CSS at test time, never user input, so the backtracking the rule guards against is not a DoS vector here).
- **FR-009**: Lint MUST be runnable locally through a single documented command (`pnpm lint`) that produces the same result CI enforces, so a contributor can reproduce a CI lint failure before pushing.
- **FR-010**: This change MUST be tooling and CI only: it MUST NOT alter any component behavior, token value, or built artifact, beyond the lint-config and CI changes themselves.
- **FR-011**: The ESLint config MUST keep the antfu base, which remains the JS/TS formatter (tabs, single quotes, semi). It MUST disable only `style/quote-props` — the single stylistic rule producing 61 of the 63 pre-existing errors — rather than the whole stylistic set, because disabling the set wholesale would leave JS/TS formatting unenforced and invite a Prettier-default reformat of the tree. Prettier keeps the formats antfu already delegates to it (CSS, HTML, Markdown); it is not the JS/TS formatter and is not wired into this gate. The retained ESLint rules are antfu's TypeScript-correctness, React, stylistic (minus `quote-props`), and jsx-a11y rules plus the in-house `no-hardcoded-colors`.
- **FR-012**: The CI gate MUST fail on lint errors only; warnings MUST NOT fail the build. The 8 existing `@unbranded-ds/react` warnings are accepted as non-blocking and tracked for a separate follow-up, not fixed here.
- **FR-013**: Lint MUST run as a blocking step inside the existing `verify` CI job, reusing that job's dependency install, rather than as a separate job. This spec adds no `pre-commit` hook.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A hardcoded color introduced into any DS component is caught before merge 100% of the time (it cannot reach `main` undetected).
- **SC-002**: A change to any linted DS package carrying a lint error cannot merge while the error is present.
- **SC-003**: Every CI job's name matches the checks it runs; zero jobs claim a check they do not perform.
- **SC-004**: The README's CI description and the actual CI gate agree when read side by side; a reader cannot be misled about whether lint runs or blocks.
- **SC-005**: A contributor can reproduce the exact CI lint result locally with one command, with no separate setup beyond installing dependencies.
- **SC-006**: Lint over the full set of linted DS packages passes on `main` at the moment the gate becomes blocking (the gate lands green).
- **SC-007**: The gate fails on errors only. A new lint error blocks merge; the project's already-accepted warnings do not, and they remain visible in lint output.

## Assumptions

The brief left three decisions open; `/speckit-clarify` (session 2026-06-19) settled them, and they are reflected in the requirements above. Recorded here for context:

- **ESLint stack: keep antfu, disable the one redundant style rule.** antfu remains the JS/TS formatter; only `style/quote-props` is disabled (FR-011) — the rule producing 61 of the 63 errors — which clears them without hand-editing and without pulling the formatter out from under the tree. The remaining 2 (`regexp/no-super-linear-backtracking` in tokens test files) are narrowly suppressed with a rationale. Prettier keeps the CSS, HTML, and Markdown formats antfu delegates to it. The retained rules are antfu's TypeScript-correctness, React, stylistic (minus `quote-props`), and jsx-a11y checks plus the in-house `no-hardcoded-colors`.
- **Placement: a blocking step in `verify`.** Lint is one `pnpm lint` command, so it runs as a step inside the existing `verify` job and reuses its install (FR-013). No separate job, and no `pre-commit` `lint-staged` hook in this spec (a possible later add).
- **Timing: blocks from day one.** Pre-existing errors are resolved within this spec so the gate lands green and blocking immediately, with no advisory-first phase (FR-002, FR-008).
- **Warnings: errors-only gate.** The 8 `@unbranded-ds/react` warnings stay non-blocking and are tracked for a follow-up rather than fixed here (FR-012).
- **The Phase 7 crash is resolved (confirmed).** `turbo lint` resolves and runs today; the only failures are rule violations, not config errors. No dependency installation work is expected (FR-007).
- **Scope is the DS's own packages.** The example app lints itself and is out of scope except for the no-regression guarantee (FR-006). Per the project's constitution-scope rule, the example app's own toolchain is not governed here.
