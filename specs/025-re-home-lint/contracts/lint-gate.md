# Contract: The CI lint gate

The interface this feature exposes is a CI gate plus a local command. This is its contract — what runs, what blocks, and what a contributor can rely on.

## Command

`pnpm lint` (root) → `turbo lint` → each package's `lint` script:

- `@unbranded-ds/react` → `eslint src/`
- `@unbranded-ds/tokens` → `eslint src/`
- `@unbranded-ds/storybook` → `eslint .`

The same command runs locally and in CI, against the same `eslint.config.ts`, so a local run reproduces the CI result (FR-009, SC-005).

## CI surface

- **Where**: a step named `Lint` in the `verify` job, after "Install dependencies" and before "Typecheck".
- **Trigger**: pull requests and pushes to `main`, subject to the existing docs-only skip (a docs-only PR does not run lint).
- **Blocking**: yes, from the first commit that lands the step. No advisory phase.

## Pass / fail semantics

| Condition | Result |
|---|---|
| Any ESLint **error** in a covered package | Step fails, `verify` fails, merge blocked |
| ESLint **warnings** only (e.g. the 8 existing `react/*` warnings) | Step passes, warnings printed but non-blocking |
| A literal color in `packages/react/src/components/**/*.tsx` | `no-hardcoded-colors` error → blocked |
| Config fails to resolve (missing rule file, missing peer plugin) | Step fails loudly — never silently skipped |
| Docs-only PR | Step does not run (existing skip) |

Errors-only is ESLint's default exit behavior; the gate adds no `--max-warnings` flag.

## What the gate covers and does not

- **Covers**: `@unbranded-ds/react`, `@unbranded-ds/tokens`, `@unbranded-ds/storybook` source.
- **Does not cover here**: the example app (`@unbranded-ds/example-nextjs`), which keeps linting itself in its own job (FR-006, unchanged). Generated files (`defaults.generated.ts`) and `dist/` are excluded via the existing config ignores.

## Honesty guarantee (US3)

After this change, every CI job name describes the checks it runs, and the README's CI section matches the workflow. No job or doc advertises a lint check it does not perform.
