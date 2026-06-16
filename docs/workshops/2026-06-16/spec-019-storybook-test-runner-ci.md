# Spec 019 — Wire the Storybook interaction + a11y test-runner into CI

**Target version:** no package version change (CI + test config only)
**Depends on:** spec-018 (the Button destructive contrast fix) should land first or together, because a real-browser a11y run will fail on that 4.1:1 pair
**Blocks:** the constitution's Section VI/VII guarantee that interaction and a11y tests run and block merge
**Status:** brief (not yet specified)

> Captured on 2026-06-16 while building spec 016. Trying to run the Storybook test-runner locally as a final check surfaced that it does not run at all — not locally, not in CI. Recorded because the constitution promises this gate and it is currently a no-op.

## The problem

The constitution requires three test layers, two of which live in Storybook: interaction tests via `play` functions (Section VI.2) and accessibility tests via `@storybook/addon-a11y` with the test-runner failing CI on any serious or critical axe violation (Section VI.3, VII). Every component ships `play` functions and `a11y: { test: 'error' }` is set in `.storybook/preview.ts`, so the intent is there.

But nothing runs them:

- `apps/storybook/package.json` has `"test:storybook": "vitest run --project storybook"`, yet there is no vitest config anywhere that defines a `storybook` project (no `storybookTest()` plugin wired). Running it errors immediately: `No projects matched the filter "storybook"`.
- `.github/workflows/ci.yml`'s `verify` job runs typecheck, sidecar validation, `pnpm build`, `pnpm test:unit`, and Storybook **build** — but never `test:storybook`. The publish job does Chromatic + the MCP smoke test. No job executes the play functions or the axe pass.

So the interaction and a11y assertions are written and then ignored. A story whose `play` fails, or one with a serious axe violation, sails through CI. Spec 016's new stories (`ColorSchemeToggle`, the identity `ThemeToggle`, the three-axis `Composition` and `Theming` stories) all carry `play` functions that have never actually run in CI.

## The fix

- Add the vitest project config the `test:storybook` script expects, using `@storybook/addon-vitest`'s `storybookTest()` plugin (already a dependency), in browser mode via the Playwright provider so axe can compute real contrast.
- Add a CI step in the `verify` job (after the Storybook build, or as its own job) that runs `pnpm --filter @unbranded-ds/storybook test:storybook`, including the Playwright browser install the example-e2e job already does.
- Land spec-018 first: once axe runs in a real browser, the destructive button's 4.1:1 pair will fail this gate. Sequencing avoids shipping a red CI step.

## What it touches

- A new `vitest.config.ts` (or equivalent) under `apps/storybook` defining the `storybook` project.
- `.github/workflows/ci.yml` (a new test-runner step + Playwright browser install).
- Possibly `.storybook/preview.ts` or the setup file if the project config needs annotations beyond what `vitest.setup.ts` provides.

## Open questions

- Browser mode (Playwright, real contrast) vs jsdom/happy-dom (faster, but axe cannot compute color-contrast)? The constitution's a11y promise needs real contrast, so browser mode — which is also why spec-018 must precede this.
- Own CI job (parallel to example-e2e) or a step inside `verify`? A separate job keeps the browser install isolated and the matrix readable.
- Does Chromatic's run already cover any of this? Chromatic here is publish-only with visual regression disabled (Section VII), so no — it does not run the test-runner.

## Scope guardrails

This is CI and test-config plumbing, not new product surface. It should not change any component or token. Its job is to make the gate the constitution already describes actually execute.
