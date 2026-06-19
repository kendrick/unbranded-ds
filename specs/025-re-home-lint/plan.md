# Implementation Plan: Re-home DS lint so it actually runs

**Branch**: `025-re-home-lint` | **Date**: 2026-06-19 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/025-re-home-lint/spec.md`

## Summary

Lint scripts already exist for every DS package (`turbo lint` runs `eslint` in `react`, `tokens`, and `storybook`), the antfu flat config resolves cleanly, and the in-house `no-hardcoded-colors` rule is wired as an error on `packages/react/src/components/**/*.tsx`. The only thing missing is that CI never calls lint: the `verify` job is named "Lint, typecheck, test, build" but has no lint step, and the README repeats the claim. This plan adds a blocking lint step to `verify` (in the constitution's `install → lint → typecheck` position), clears the one stylistic rule producing 63 redundant errors so the gate lands green, proves `no-hardcoded-colors` fires with a RuleTester unit test, and corrects the README so the advertised gate matches reality.

The change is tooling and CI only. No component behavior, token value, or built artifact changes.

## Technical Context

**Language/Version**: TypeScript 5.x (strict, no `any`) for `eslint.config.ts` and the rule test; YAML for the workflow; Node 24 in CI.
**Primary Dependencies**: ESLint 9 (flat config) via `@antfu/eslint-config` ^9 and its peer plugins (`@eslint-react/eslint-plugin`, `eslint-plugin-format`, `eslint-plugin-jsx-a11y`, `eslint-plugin-react-refresh`), the in-house `no-hardcoded-colors` rule (`packages/react/eslint/no-hardcoded-colors.js`), Prettier ^3 (delegated by antfu for CSS/HTML/Markdown only), Turborepo (`turbo lint`), Vitest 3 (the rule test), GitHub Actions.
**Storage**: N/A — CI and config change, no runtime or persisted state.
**Testing**: Vitest with ESLint's `RuleTester` to prove `no-hardcoded-colors` fires (durable replacement for a manual add-and-revert). Acceptance otherwise verified by the gate itself going red on an introduced error and green on the cleaned tree.
**Target Platform**: GitHub Actions CI (ubuntu) and local developer machines.
**Project Type**: pnpm + Turborepo monorepo; this feature touches root config, the CI workflow, the README, and one new test under `packages/react`.
**Performance Goals**: Lint adds roughly one `turbo lint` run (~20s observed locally) to `verify`, reusing that job's existing install — no second environment setup, no extra free-tier minutes for a separate job.
**Constraints**: No package version bump, no shipped-output change (FR-010). Reuse `verify`'s install; respect the existing docs-only skip. TypeScript strict, no `any`.
**Scale/Scope**: Three linted packages (`react`, `tokens`, `storybook`); the diff is one workflow step, one eslint rule toggle, one README section, and one rule test.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-checked after Phase 1 design.*

- [x] **Section VIII — Tooling baseline and CI job graph.** The constitution specifies the CI graph as `install → lint → typecheck → unit → build → storybook build → storybook test-runner → chromatic publish → MCP smoke test`. The current `verify` job skips lint, so CI is out of conformance today. This plan adds the lint step in exactly that position (after install, before typecheck), restoring compliance. ESLint flat config + Prettier are both retained as the constitution requires; antfu stays the JS/TS formatter, Prettier keeps the CSS/HTML/Markdown formats it already owns. No toolchain substitution.
- [x] **Section IV — the lint rule that forbids hardcoded color.** `no-hardcoded-colors` is retained, now actually executes in CI, and gains a unit test proving it fires. This strengthens, never weakens, the rule the constitution mandates.
- [x] **Section X — Compliance review.** This Constitution Check is the required gate. On changesets: the change is non-shipping (root `eslint.config.ts`, the workflow, the README, plus one test under `packages/react`). No package version bumps, and the only `packages/react` touch is a test, which the changeset gate exempts (per commit 4307f95). No changeset expected; if the gate flags it, the change still carries no version impact.
- [x] **Section XI — agent and human legibility (REQUIRED gate).** No concessions.
  - XI.1 Prose: the README CI section is read by both humans and agents, so it goes through the `humanizer` skill before merge.
  - XI.4 Failure modes: lint output is already structured — each failure carries a rule ID, file, and line an agent can pattern-match. The gate surfaces machine-parseable codes, not just prose.
  - XI.5 Story/contract coverage: unaffected; no component or story changes.

No violations. Complexity Tracking is empty.

## Project Structure

### Documentation (this feature)

```text
specs/025-re-home-lint/
├── plan.md              # This file
├── spec.md              # Feature spec (with Clarifications)
├── research.md          # Phase 0 output — decisions and rejected alternatives
├── data-model.md        # Phase 1 output — configuration artifacts (no domain data)
├── contracts/
│   └── lint-gate.md     # Phase 1 output — the CI lint-gate contract
├── quickstart.md        # Phase 1 output — run/verify the gate locally
└── checklists/
    └── requirements.md   # Spec quality checklist (from /speckit-specify)
```

### Source Code (repository root)

```text
eslint.config.ts                                  # disable style/quote-props (clears the 63 errors); no other change
.github/workflows/ci.yml                          # add the Lint step to the verify job, after Install, before Typecheck
README.md                                         # correct the CI section to match the real gate (humanized)
packages/react/eslint/
├── no-hardcoded-colors.js                        # unchanged (the rule)
└── no-hardcoded-colors.test.ts                   # NEW — RuleTester unit test proving the rule fires
turbo.json                                        # unchanged (the lint task already exists)
packages/{react,tokens}/package.json              # unchanged (lint scripts already present)
apps/storybook/package.json                       # unchanged (lint script already present)
```

**Structure Decision**: This is not an `src/` feature. The work is concentrated in four files: the root flat config (`eslint.config.ts`), the CI workflow (`.github/workflows/ci.yml`), the `README.md` CI section, and one new rule test co-located with the rule it covers (`packages/react/eslint/`). The existing `turbo lint` plumbing and per-package lint scripts are reused unchanged.

## Complexity Tracking

No constitution violations. No entries.
