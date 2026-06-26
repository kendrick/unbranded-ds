# Quickstart: Re-home DS lint

How to make the change, verify it locally, and confirm the gate does what it claims.

## Run lint the way CI will

```bash
pnpm lint
```

This runs `turbo lint` across `react`, `tokens`, and `storybook`. Before the fix it fails with 63 `style/quote-props` errors in `@unbranded-ds/tokens` and prints 8 `react/*` warnings (non-blocking). After the fix it should pass.

## The change, in four edits

1. **`eslint.config.ts`** — in the antfu `rules` block, add:
   ```ts
   'style/quote-props': 'off',
   ```
   That clears all 63 errors (they are all this one rule). Leave the rest of antfu's stylistic config alone — it is the JS/TS formatter.

2. **`.github/workflows/ci.yml`** — in the `verify` job, add a step between "Install dependencies" and "Typecheck":
   ```yaml
   - name: Lint
     run: pnpm lint
   ```
   The job is already named "Lint, typecheck, test, build," so no rename is needed.

3. **`packages/react/eslint/no-hardcoded-colors.test.ts`** (new) — a `RuleTester` test: a token-backed color is valid, a literal hex/rgb/hsl in component source reports the rule's error. Run it with the package's Vitest.

4. **`README.md`** — rewrite the CI section so it says `verify` lints, and so it stops claiming "two jobs" / folding the Storybook test-runner into `verify`. Run it through the `humanizer` skill before committing.

## Verify the gate is real

```bash
# 1. Lint is green on the cleaned tree
pnpm lint

# 2. no-hardcoded-colors actually fires (durable proof)
pnpm --filter @unbranded-ds/react test   # the RuleTester test passes

# 3. Manual sanity: a literal color is caught
#    Add `style={{ color: '#ff0000' }}` to any component in
#    packages/react/src/components/**, then:
pnpm lint                                  # fails with custom-rules/no-hardcoded-colors
#    Revert the edit; lint goes green again.

# 4. Errors-only: the 8 react warnings print but do NOT fail
pnpm lint   # exit 0 despite the warnings
```

## Confirm CI honesty (US3)

Read `.github/workflows/ci.yml` job names against their steps, and the README CI section against the workflow. No job or sentence should claim a lint check that is not run.
