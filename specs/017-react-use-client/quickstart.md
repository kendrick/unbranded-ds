# Quickstart: Verifying the RSC Import

This feature has no API surface to exercise — it is verified by building and inspecting, end to end. Each step maps to a success criterion.

## 1. The built bundle declares itself a client module (SC-002)

Build the package and look at the top of the entry:

```bash
pnpm --filter @unbranded-ds/react build
head -n 1 packages/react/dist/index.js
# → 'use client';
```

The directive must be the literal first line. The Vitest unit test under `packages/react/src/` asserts exactly this against the built artifact, so it runs after `pnpm build` (the same build-first order the token-query MCP smoke test relies on).

## 2. A regression is caught (SC-003)

Remove the `banner` from `packages/react/tsup.config.ts`, rebuild, and the directive unit test fails — the first line is no longer `'use client'`. Restore it and the test passes. The example's `next build` (step 4) fails the same way if the directive is gone, because a server component then imports client code with no boundary.

## 3. A server component imports the design system without boilerplate (SC-001)

In the example app, `app/layout.tsx` is a server component. After this change it imports `ThemeProvider`, `SkipLink`, and `Header` from `@unbranded-ds/react` directly — no `'use client'` wrapper around them, no local `AppShell` shim. The workaround-only `app/components/app-shell.tsx` is deleted; its structure moves into the layout. Components that hold genuine client state keep their own boundary.

## 4. The example builds and its e2e suite passes (SC-004)

```bash
pnpm --filter @unbranded-ds/tokens --filter @unbranded-ds/react build
pnpm --filter @unbranded-ds/example-nextjs e2e
```

Playwright's webServer runs the production `next build` then `next start`. The build succeeding — with a server component importing the design system directly — is the real RSC-import guard. This is the `example-e2e` CI job; nothing new is added to CI beyond the directive unit test, which rides the existing `verify` job.

## What you do not need to do

You do not change any import path, prop, or component behavior. Existing client-component usage keeps working untouched (FR-006). This is a packaging and labeling change — the directive is the only difference in what ships.
