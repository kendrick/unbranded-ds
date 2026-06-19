# Phase 1 Data Model: Re-home DS lint

This feature has no domain data — no entities, no persisted state, no schema. It is CI and configuration. The closest analog worth recording is the set of configuration artifacts the change touches and the role each plays, so the implementer and a future reader know what owns what.

## Configuration artifacts

| Artifact | Role | Change |
|---|---|---|
| `eslint.config.ts` (root) | The single flat config for the whole monorepo. Sets antfu base (react, typescript, stylistic), the jsx-a11y rule block, and scopes `no-hardcoded-colors` to `packages/react/src/components/**/*.tsx` as an error. | Add `'style/quote-props': 'off'` to the antfu `rules` block. Nothing else. |
| `.github/workflows/ci.yml` → `verify` job | The job named "Lint, typecheck, test, build" that today runs typecheck, sidecar validation, build, unit tests, and a Storybook build — but no lint. | Insert a `Lint` step running `pnpm lint`, after "Install dependencies", before "Typecheck". |
| `turbo.json` → `lint` task | Fans `pnpm lint` out to each package's `lint` script. | Unchanged. |
| `packages/react/package.json`, `packages/tokens/package.json` | Each defines `lint: eslint src/`. | Unchanged. |
| `apps/storybook/package.json` | Defines `lint: eslint .`. | Unchanged. |
| `packages/react/eslint/no-hardcoded-colors.js` | The custom rule the constitution (Section IV) mandates. | Unchanged. |
| `packages/react/eslint/no-hardcoded-colors.test.ts` | (new) RuleTester proof the rule fires. | Created. |
| `README.md` → CI section | Describes the gate for humans and agents. | Rewritten to match the real workflow; humanized. |

## Rule states (the only "state" in play)

The gate's behavior is defined by which rules fail the build:

- `no-hardcoded-colors`: **error** (blocks) — scoped to component source. Unchanged; now actually runs.
- `style/quote-props`: **error → off** — the 63 current failures; turned off as redundant style noise.
- antfu's other stylistic rules (`indent`, `semi`, `quotes`, `arrow-parens`, ...): **error** (blocks) — unchanged; antfu remains the JS/TS formatter.
- jsx-a11y rules: **error** (blocks) — unchanged.
- antfu's React rules (`react/no-context-provider`, `react/no-use-context`, `react/set-state-in-effect`, ...): **warning** (does not block) — the 8 existing warnings stay non-blocking under the errors-only gate.
