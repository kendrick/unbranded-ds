# Quickstart: Verifying the Storybook gate

The gate has no API surface — it is verified by running it and watching it pass on good stories and fail on bad ones. Each step maps to a success criterion.

## 1. The gate runs locally (SC-005)

One-time, install the browser the gate drives:

```bash
pnpm --filter @unbranded-ds/storybook exec playwright install --with-deps chromium
```

Then build the packages the stories import, and run the gate:

```bash
pnpm --filter @unbranded-ds/tokens --filter @unbranded-ds/react build
pnpm --filter @unbranded-ds/storybook test:storybook
```

It runs every story's `play` function and the axe pass in headless Chromium and reports pass/fail. It no longer errors with "No projects matched the filter," because `apps/storybook/vitest.config.ts` now defines the `storybook` project.

## 2. A broken interaction fails the gate (SC-001)

In any story with a `play` function, make an assertion fail (for example, expect the wrong text after a click). Run the gate: it fails and names the story and the assertion. Restore the story and it passes. This is the interaction layer actually executing, where today it does not.

## 3. A sub-AA story fails the gate (SC-002, SC-003)

In a story, force a low-contrast pair (for example, set a near-background foreground color on rendered text). Run the gate: the accessibility pass fails on the `color-contrast` rule and names the story. Restore it and it passes. The failure proves contrast is computed for real, which only happens because the gate runs in a browser.

## 4. CI runs the gate on every PR and blocks merge (SC-004)

The `storybook-test` job in `.github/workflows/ci.yml` runs on every pull request, in parallel with `example-e2e` and after `verify`. It installs Chromium and runs the same command. A red gate blocks merge. Nothing else in CI changes: `verify`, the Chromatic publish, and the MCP smoke test are untouched.

## 5. Coverage is automatic (SC-006)

The gate discovers stories from `.storybook/main.ts` (the existing `packages/react/src/**/*.stories.*` glob), so every component's stories — and any added later — run with no per-story opt-in.

## What you do not change

No component, token, or story is edited to make the gate pass. The gate reports the codebase as it is. If first execution surfaces a genuine failure, that is fixed as a real defect (see the spec's latent-failure edge case), not worked around.
