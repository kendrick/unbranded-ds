# Implementation Plan: Expressivity token scales (tracking and larger radii)

**Branch**: `023-expressivity-token-scales` | **Date**: 2026-06-18 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/023-expressivity-token-scales/spec.md`

## Summary

Grow the canonical token schema by two scales so divergent themes express their full look through tokens instead of raw values: a `tracking` (letter-spacing) scale and larger `radius` steps that fill the gap between `lg` and the full pill. Both adopt Tailwind v4's scales as their basis. The reference skin (the LCARS fixture from the expressivity spike) is rerouted through the new tokens and the expressivity audit drops from 5 blockers to 0, while the contrast suite and the Storybook a11y pass stay green. This is additive schema growth on the spec 008 model: new required keys carried by the base sources, so the built-in themes inherit them and only a fully-specified external consumer theme sees a breaking change, announced by a tokens version bump.

## Technical Context

**Language/Version**: TypeScript 5.x, strict, no `any` (Constitution VIII)  
**Primary Dependencies**: Style Dictionary v4 (the token build, `sd.config.ts`), Zod (theme schema + `contrastPairs`), Tailwind CSS v4 (`@theme` preset maps `--tracking-*` / `--radius-*` to utilities). No new dependencies.  
**Storage**: N/A — build-time DTCG JSON compiled to CSS variables, a Tailwind preset, JSON, and a typed token map. No runtime or persisted state.  
**Testing**: Vitest in `packages/tokens` (`schema.test`, `validate.test`, `themes-contrast.test`, `defaults.test`, `token-map.test`), the Storybook a11y test-runner over the LCARS fixture stories, and `scripts/expressivity-audit.mjs` as the acceptance instrument.  
**Target Platform**: build-time tokens consumed by React + Tailwind in the browser.  
**Project Type**: pnpm monorepo; this feature touches `packages/tokens` (schema, sources, defaults) and the root `fixtures/` corpus (the reference-skin reroute).  
**Performance Goals**: N/A (build-time token emission).  
**Constraints**: the new tokens MUST flow to all four emitted artifacts (Constitution II); the emitted value of every pre-existing token MUST be unchanged (SC-003); WCAG AA contrast on declared pairs MUST be preserved (tracking and radius are not color, so no contrast impact is expected).  
**Scale/Scope**: 1 schema file, 1 `sd.config` token-map type edit, 2 DTCG sources (one new `tracking.json`, one edited `radii.json`), 1 regenerated defaults module, ~2 test updates plus 2 validation assertions, 1 fixture reroute, 1 docs note, 1 changeset.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-checked after Phase 1 design.*

- **Section II (tokens → four artifacts)**: PASS. The CSS variables, Tailwind preset, and JSON emitters are category-agnostic, so the new tokens flow to them automatically. The one exception is the TS token map: its format hardcodes a `TokenCategory` union and `categoryMap` in `sd.config.ts`, so the brand-new `tracking` category must be added there (task T004a) or the generated `tokens.ts` fails typecheck. Radius adds keys to an existing category and needs no such edit.
- **Section III (schema locked, values float)**: PASS. Growing the canonical set is the sanctioned move (the lock binds the set; it does not forbid deliberate additions — precedent spec 008). New keys are required; themes remain validated against the grown schema; values still float per theme. No new theme-extension tokens.
- **Section VIII (tooling baseline)**: PASS. Style Dictionary, Zod, Tailwind v4, TypeScript strict — no substitutions, no new tools, no `any`.
- **Section X (governance)**: PASS with action. This touches `packages/tokens`, so the PR MUST carry a `.changeset/*.md` (a minor bump on the spec 008 model). Tracked as a task.
- [x] **Section XI — legibility (REQUIRED gate)**: PASS, no concessions.
  - **Prose (XI.1)**: the THEMING.md additions (the tracking scale, composing asymmetric radii from the scale) pass through the `humanizer` skill; no three-item lists.
  - **API shape (XI.2)**: the new tokens are predictable from analogy — `--tracking-*` is the Tailwind letter-spacing namespace (the way `motion` emits `--duration-*` / `--ease-*`), and `--radius-xl/2xl/3xl` extend the existing Tailwind-named radius scale.
  - **Docs surfaces (XI.3)**: the token-query MCP (`palette`, `lookupToken`) reads the resolved token map, so the new tokens surface automatically once the sources carry them. Verified as a Phase 0 task; no MCP code change expected.
  - **Failure modes (XI.4)**: a fully-specified theme that omits a newly required token fails `validateTheme()` with the existing structured `{ ok, issues: [{ code, path, message }] }` shape (FR-007).
  - **Story coverage (XI.5)**: the LCARS fixture stories already exercise the skin; after the reroute they still run under the a11y test-runner in both schemes.

## Project Structure

### Documentation (this feature)

```text
specs/023-expressivity-token-scales/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output (the two token scales)
├── quickstart.md        # Phase 1 output
├── contracts/
│   └── token-scales.md  # Phase 1 output (the token + validation contract)
└── tasks.md             # Phase 2 output (/speckit.tasks — NOT created here)
```

### Source code (repository root)

```text
packages/tokens/
├── src/
│   ├── schema.ts                 # ADD: trackingTokens category + radius xl/2xl/3xl keys
│   ├── tokens/
│   │   ├── tracking.json         # NEW: the letter-spacing scale (DTCG source)
│   │   └── radii.json            # EDIT: add xl / 2xl / 3xl
│   ├── defaults.generated.ts     # REGENERATED by the build (do not hand-edit)
│   ├── schema.test.ts            # EDIT if it pins the category set
│   └── token-map.test.ts         # EDIT if it pins the token set
└── sd.config.ts                  # EDIT: add "tracking" to the TokenCategory union + categoryMap (token-map format)

fixtures/themes/lcars/
└── parts.css                     # EDIT: reroute tracking + elbow radius through the new tokens

THEMING.md                        # EDIT: tracking scale + asymmetric-radius composition note
.changeset/<name>.md              # NEW: @unbranded-ds/tokens minor bump
```

**Structure Decision**: This is a tokens-package schema growth plus a one-file fixture reroute. No new packages or directories (Constitution I). The reference skin lives in the root `fixtures/` corpus introduced by the expressivity spike this branch stacks on.

## Complexity Tracking

No constitution violations. No entries.
