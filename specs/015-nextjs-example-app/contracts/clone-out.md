# Contract: clone-out

The promise that the directory is portable, which is the spec's reason to exist (US1, SC-001).

## Steps (documented in the example's README)

1. Copy `examples/nextjs-15-app-router/` out of the monorepo.
2. In `package.json`, change the two `workspace:*` dependencies (`@unbranded-ds/tokens`, `@unbranded-ds/react`) to published version numbers.
3. Install (`pnpm install`, or npm/yarn).
4. Run it (`pnpm dev`, or `build` then `start`).

## Invariants

- No remaining reference to the monorepo: the app imports only the published package specifiers (`@unbranded-ds/react`, `@unbranded-ds/react/preset.css`, `@unbranded-ds/tokens/runtime`, `@unbranded-ds/tokens/themes/*.css`), never a relative path into `packages/` (FR-007).
- The two canonical lines plus the theme imports resolve identically from the published packages.
- The README's clone steps call out the `workspace:*` to version-number swap explicitly, so the most common mistake (forgetting it) is self-explanatory.

## Scope line

The in-repo Playwright suite runs against `workspace:*`, the local packages. The clone-out path itself (a published-version copy outside the repo) is documented and manual, not exercised by CI, because testing it would require a real publish. The README is the contract for the clone-out, and SC-001 is the human-followable guarantee. This boundary is stated so no one reads the green CI suite as proof the clone-out works.
