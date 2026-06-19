# Phase 0 Research: Re-home DS lint

All clarify-cycle questions were answered before planning. Phase 0's job here was to confirm the mechanism each decision implies against the real config, and one decision needed refinement once the config was inspected.

## D1 — How to clear the 63 `quote-props` errors

**Decision**: Disable the single `style/quote-props` rule in `eslint.config.ts`. Do not disable antfu's whole stylistic set.

**Rationale**: The clarify answer was "keep antfu, drop its style rules, because Prettier owns formatting." Inspecting the config showed that premise is only half true. antfu's stylistic set (configured with `indent: 'tab'`, `semi: true`, `quotes: 'single'`) is the active JS/TS formatter in this repo, not Prettier. There is no dedicated Prettier config (no `.prettierrc`, no `prettier` key), Prettier is not run in CI, and antfu's `formatters` option already delegates only CSS/HTML/Markdown to Prettier. So disabling the entire stylistic set would pull the JS/TS formatter out from under the codebase and leave a vacuum that Prettier's defaults (two-space, double-quote) would later fill as a tree-wide reformat — the opposite of the "no churn" intent.

All 63 errors are the one rule `style/quote-props` (antfu default `consistent-as-needed`). Turning off that rule clears every one of them, churns no source, and leaves antfu's formatting otherwise intact. This honors the intent of the clarify answer (neutralize the redundant style noise) while staying surgical.

**Alternatives considered**:
- `stylistic: false` (the literal reading of the clarify answer). Rejected: removes the JS/TS formatter, invites a Prettier-default reformat of the whole tree, and conflicts with the tab/single-quote style the code already uses.
- `eslint --fix` to make quote usage consistent (the clarify Q's option B). Rejected: the user chose disable over auto-fix; this would also edit `@unbranded-ds/tokens` source (~63 lines in `schema.ts` / `schema.test.ts`) for a cosmetic rule.

**Surfaced to the user**: yes — this narrows the clarify decision from "all stylistic" to "the one noisy rule," for the reason above. Open to reverting to a wholesale `stylistic: false` if the intent really was to adopt Prettier as the JS/TS formatter, but that is a larger, separate change.

## D2 — Errors-only gate

**Decision**: Rely on ESLint's default exit behavior (non-zero on errors, zero on warnings). No `--max-warnings` flag.

**Rationale**: FR-012 wants the gate to fail on errors only and leave the 8 existing `@unbranded-ds/react` warnings non-blocking. That is exactly ESLint's default, so the correct config is no extra flag. Adding `--max-warnings 0` would do the opposite — block on the 8 warnings — which the clarify cycle explicitly ruled out.

**Alternatives considered**: `--max-warnings 0` with the 8 warnings fixed or baselined. Rejected per the clarify decision; the warnings move to a follow-up.

## D3 — Where lint runs in CI

**Decision**: A blocking step inside the existing `verify` job, placed after "Install dependencies" and before "Typecheck", running `pnpm lint`.

**Rationale**: Lint is a single `turbo lint` command, so it reuses `verify`'s install with no second environment setup. The position matches the constitution's Section VIII job graph (`install → lint → typecheck → ...`). The job is already named "Lint, typecheck, test, build," so adding the step makes the name honest with no rename needed.

**Alternatives considered**: a separate parallel `lint` job (rejected — re-installs deps, extra minutes, and Section VIII describes one job graph); a pre-commit `lint-staged` hook (rejected for this spec — the clarify cycle deferred it).

## D4 — Coverage

**Decision**: Run `pnpm lint` (`turbo lint`) unfiltered, covering `@unbranded-ds/react`, `@unbranded-ds/tokens`, and `@unbranded-ds/storybook`.

**Rationale**: `turbo.json` defines a `lint` task and all three packages ship a `lint` script (`eslint src/` for react/tokens, `eslint .` for storybook). The example app lints itself in its own job and is untouched. No filtering is needed; the broadest coverage is also the simplest command.

## D5 — Proving `no-hardcoded-colors` fires

**Decision**: Add a Vitest test using ESLint's `RuleTester` against `no-hardcoded-colors`, co-located at `packages/react/eslint/no-hardcoded-colors.test.ts`.

**Rationale**: US2/FR-003/SC-001 require proof the rule actually catches a literal color in component source. A RuleTester test is the durable, repeatable form of that proof: valid cases (token-backed color) pass, invalid cases (literal hex/rgb/hsl) report the expected error. It also fits the project's rule that custom logic gets tested. The rule has no test today.

**Alternatives considered**: a manual add-color/run/revert check (rejected — not durable, not part of CI); a Storybook story (rejected — the rule is lint-time, not a render behavior).

## D6 — README accuracy

**Decision**: Rewrite the CI section so it matches the real workflow: `verify` does lint now, and the section stops mislabeling the job set (it currently says "two jobs" and folds the Storybook test-runner into `verify`, when there are more jobs and the test-runner is its own `storybook-test` job).

**Rationale**: FR-005 requires the README to describe lint accurately, and US3's principle is that the repo stops advertising a gate it doesn't run. Correcting the lint claim while leaving the adjacent inaccuracies in the same paragraph would be a half-fix. The rewrite goes through the `humanizer` skill before merge (Section XI.1).

## D7 — Prettier's role

**Decision**: Leave Prettier as it is — a local `pnpm format` script with no dedicated config, plus antfu's `formatters` delegation for CSS/HTML/Markdown. Do not wire Prettier into CI in this spec.

**Rationale**: Prettier is not the JS/TS formatter here (antfu stylistic is), it is not in the CI gate, and a sample of the files carrying `quote-props` errors already passes `prettier --check`. Pulling Prettier into the gate or making it the JS/TS formatter is a separate decision with tree-wide reach, out of scope for re-homing lint. Recorded so the next person knows the dual setup is intentional-for-now, not an oversight.
