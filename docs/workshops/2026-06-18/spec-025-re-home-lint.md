# Spec 025 — Re-home DS lint so it actually runs

**Target version:** no package version change (CI + tooling config only)
**Depends on:** nothing hard. #97 already restored the missing `no-hardcoded-colors` rule file, and the antfu peer plugins it choked on are now devDeps, so the original crash is likely gone
**Blocks:** a real lint gate on the DS packages. Today the gate is advertised but absent
**Status:** brief (not yet specified); needs a decision, see Options. The spec number is provisional.

> Surfaced on 2026-06-18 triaging the old issue backlog (#98). Phase 7 pulled `pnpm lint` out of CI because the antfu config crashed, and it was never put back. The crash looks fixed now, but lint still runs nowhere for the DS's own packages, while both the CI job name and the README claim it does.

## The problem

Lint was removed from CI during Phase 7 for a real reason: `eslint.config.ts` referenced a `no-hardcoded-colors` rule file that didn't exist, and antfu's config wanted peer plugins that weren't installed. Both of those are resolved now. #97 brought the rule file back, `eslint.config.ts` wires `no-hardcoded-colors` as an `error`, and the peer plugins (`@eslint-react/eslint-plugin`, `eslint-plugin-format`, `eslint-plugin-react-refresh`, `eslint-plugin-jsx-a11y`) all sit in root devDeps. So the thing that justified pulling lint is gone.

What didn't come back is lint itself. The `verify` job in `.github/workflows/ci.yml` is named "Lint, typecheck, test, build," and its steps are checkout, install, typecheck, sidecar validation, `pnpm build`, `pnpm test:unit`, and a Storybook build. There is no `pnpm lint` step. The only place eslint runs in CI is the example app's own job (`pnpm --filter @unbranded-ds/example-nextjs lint`). The husky hook is `pre-push` running typecheck, not a `pre-commit` eslint pass.

So `@unbranded-ds/react` and `@unbranded-ds/tokens` are linted nowhere, neither in CI nor on commit. The `no-hardcoded-colors` rule, the one DS-specific check we actually care about, has never run end to end against component source. And the gap is hidden twice over: the CI job is literally named "Lint…" and the README's CI section says verify runs lint. A reader checking either would conclude the gate exists. It doesn't, and a silent absence is worse than an honest gap because it reads as covered.

## Options (needs a decision)

- Eslint stack. Keep antfu now that its peer deps are installed, or swap to a leaner `@typescript-eslint` + `eslint-plugin-jsx-a11y` + the in-house `no-hardcoded-colors` rule. #98 flagged antfu as possibly more opinion than this repo wants; that call is still open.
- Where it runs. A blocking `pnpm lint` step inside `verify`, an advisory job (`continue-on-error: true`) that shows in PR checks without gating, a `pre-commit` lint-staged `eslint --fix`, or some combination. #98's original proposal paired lint-staged with an advisory CI job.
- Blocking from day one, or advisory first and flip to required once it runs green across the whole tree.

## Regardless of which option wins

- The DS packages get linted somewhere reliable, not just the example app.
- `no-hardcoded-colors` is confirmed to fire against real component source.
- The CI job name and the README's CI section get corrected to match whatever actually ships, so the repo stops advertising a gate it doesn't have.

## What it touches

- `.github/workflows/ci.yml` (the lint step or job; rename `verify` if lint stays out of it).
- Root `package.json`, the per-package `lint` scripts, and the `turbo lint` pipeline.
- `eslint.config.ts` (confirm a clean run; possibly slim the stack).
- `.husky/` and root config if a `pre-commit` lint-staged hook lands.
- `README.md` (the CI section currently overstates what `verify` does).

## Scope guardrails

Tooling and CI plumbing, not product surface. No component or token changes. The job is to make the lint gate the repo already advertises actually exist, and to stop lying about it where it doesn't.
