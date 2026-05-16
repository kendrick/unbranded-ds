# Implementation Plan: Consumer DX preset

**Branch**: `002-consumer-dx-preset` | **Date**: 2026-05-15 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification at [/specs/002-consumer-dx-preset/spec.md](./spec.md)

## Summary

Ship a clean two-line Tailwind wiring API for `@unbranded-ds/react` and `@unbranded-ds/tokens` consumers, paired with a canonical FOUC-prevention helper exported from the tokens runtime and a `<VisuallyHidden>` React component for accessible markup. Remove the legacy `./dist/tailwind/*` and `./dist/css/*` wildcard exports as a deliberate breaking change in 0.2.0, with first-class release notes and migration guidance making the break discoverable in three places (CHANGELOG, README, GitHub release).

The technical approach: add a clean `./preset.css` export to both packages, ship a tiny wrapper preset.css in the React package that adds the `@source` directive scoped to its own files, and ship `themeBootstrapScript` plus a `getThemeBootstrapScript({ defaultTheme })` factory backed by a single private localStorage-key constant. The build pipeline adds a CSS copy step to the React package's tsup config so the wrapper preset reaches `dist/preset.css`. The `<VisuallyHidden>` component is a thin polymorphic span using Tailwind's built-in `.sr-only` utility — no new CSS, just a typed React API.

## Technical Context

**Language/Version**: TypeScript 5.x, strict mode, no `any` (per constitution Section VIII)
**Primary Dependencies**:

- `@unbranded-ds/tokens` (workspace) — adds `themeBootstrapScript`, `getThemeBootstrapScript`, `./preset.css` export
- `@unbranded-ds/react` (workspace) — adds `<VisuallyHidden>` component, `./preset.css` export, dist preset wrapper
- Tailwind CSS v4 (consumer-side; the new preset.css uses `@source` directive)
- `@base-ui-components/react` (already a peer dep; possibly used for polymorphic primitive — see Phase 0)
- `class-variance-authority`, `clsx`, `tailwind-merge` (already in use via `cn()`)
- `tsup` (existing bundler; needs CSS copy step added)
- Style Dictionary v4 (existing tokens build; no SD changes in this spec)

**Storage**: `localStorage` client-side, key `unbranded-ds-theme` (canonical, shared with future `useTheme` in spec 007)
**Testing**: Vitest (unit, for the tokens runtime exports and React component logic), Storybook play functions (interaction, for `<VisuallyHidden>` and the example FOUC flow), `@storybook/addon-a11y` + test-runner (a11y, the `<VisuallyHidden>` component must pass axe), Storybook MCP introspection (the new component appears in MCP tool output)
**Target Platform**: Modern browsers supporting ESM and `localStorage`. The bootstrap script is SSR-safe (it's a string, not executed during SSR — only inlined as HTML).
**Project Type**: Multi-package monorepo (`@unbranded-ds/tokens`, `@unbranded-ds/react`, plus `apps/storybook` for verification). No new packages.
**Performance Goals**:

- Bootstrap script content under 250 bytes (small enough to inline without CSP hash concerns)
- `getThemeBootstrapScript({ defaultTheme })` returns deterministic output across builds for any given argument (required by FR-014 for hash-based CSP)
- Tailwind preset adds zero runtime cost beyond what Tailwind already does
- React preset.css adds one `@source` scan of `node_modules/@unbranded-ds/react` to the consumer's Tailwind build — measurable but small (~100 files)

**Constraints**:

- Pre-1.0: breaking changes allowed in minor bumps (this spec ships 0.2.0 with a breaking change)
- ESM only (constitution Section VIII)
- No CSS-in-JS, no Sass (constitution Section VIII)
- `@theme inline` block remains registration-only — never inline default values (constitution Section III, spec FR-005)
- Wildcard exports must be removed cleanly; the new clean exports must be the only resolvable canonical paths after 0.2.0 (spec FR-009)

**Scale/Scope**:

- 2 packages modified
- 1 new React component (`<VisuallyHidden>`)
- 2 new runtime exports (`themeBootstrapScript` constant, `getThemeBootstrapScript` factory)
- 2 new clean `./preset.css` export paths (one per package)
- 1 new build artifact (`packages/react/dist/preset.css`)
- ~3 doc files updated (root README, both package READMEs, THEMING.md)
- 2 new CHANGELOG.md files (one per package, hand-authored — Changesets tooling lands in a later spec)
- 0 NEEDS CLARIFICATION items (resolved during `/speckit.clarify`)

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

| Section                                                   | Status         | Notes                                                                                                                                                                                                                                                                                                                  |
| --------------------------------------------------------- | -------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| I. Repository shape                                       | PASS           | No new packages. Two existing packages modified, `apps/storybook` untouched.                                                                                                                                                                                                                                           |
| II. Tokens independent of components                      | PASS           | The tokens `./preset.css` export is framework-agnostic. The React wrapper preset adds the `@source` directive and lives in the React package, keeping framework concern out of tokens. FR-001 through FR-003 enforce this layering.                                                                                    |
| III. Theming contract (schema locked, values float)       | PASS           | No schema changes. `@theme inline` remains registration-only (FR-005). FOUC prevented by `themeBootstrapScript` (FR-006). Bridge rule: validation moves to runtime (spec 007's `useTheme`), not the bootstrap script.                                                                                                  |
| IV. Components: shadcn/ui Base UI, thin and unopinionated | PASS with note | `<VisuallyHidden>` is not a Base UI primitive. Phase 0 research item: confirm whether shadcn/ui's Base UI variant ships one we copy, or whether we roll our own following the same patterns (CVA + `cn()` + named function component). Component will use Tailwind's built-in `.sr-only` utility, no hardcoded values. |
| V. Stories are source of truth                            | PASS           | `<VisuallyHidden>` ships with `.stories.tsx`, autodocs, and at least one `play` function.                                                                                                                                                                                                                              |
| VI. Testing (three layers)                                | PASS           | `<VisuallyHidden>` ships unit tests + interaction play + a11y. The tokens runtime exports ship unit tests.                                                                                                                                                                                                             |
| VII. Deployment and MCP surface                           | PASS           | No deployment changes. Storybook MCP introspects the new component automatically once its stories ship.                                                                                                                                                                                                                |
| VIII. Tooling baseline                                    | PASS           | All locked tools still in use. No new tools added in this spec (Changesets adoption is a separate spec, queued before 003).                                                                                                                                                                                            |
| IX. Definition of done for any component                  | PASS           | `<VisuallyHidden>` follows the existing structure: `index.ts`, `<Component>.tsx`, `<Component>.stories.tsx`, `<Component>.test.tsx`. Exported from `packages/react/src/index.ts`.                                                                                                                                      |
| X. Governance                                             | PASS           | No constitution amendment in this spec.                                                                                                                                                                                                                                                                                |

**Bridge rules from Section XI (not yet ratified)**: prose passes humanizer, no three-item lists, predictable slot/prop naming on `<VisuallyHidden>`. Sidecar `*.usage.md` files NOT required (those land in spec 005).

No violations. No entries needed in Complexity Tracking.

## Project Structure

### Documentation (this feature)

```text
specs/002-consumer-dx-preset/
├── plan.md                         # This file
├── research.md                     # Phase 0 output
├── data-model.md                   # Phase 1 output
├── quickstart.md                   # Phase 1 output
├── contracts/
│   ├── exports.md                  # TS API contract per package
│   ├── css-contracts.md            # preset.css file contracts
│   └── migration.md                # 0.1.0 → 0.2.0 import-line mapping
├── checklists/
│   └── requirements.md             # Spec quality checklist (from /speckit.specify)
├── spec.md                         # Source-of-truth feature spec
└── tasks.md                        # Created by /speckit.tasks (not this command)
```

### Source Code (repository root)

```text
packages/
├── tokens/
│   ├── src/
│   │   ├── runtime.ts                          # Add: themeBootstrapScript, getThemeBootstrapScript, THEME_STORAGE_KEY (private)
│   │   └── runtime.test.ts                     # New: unit tests for the bootstrap exports
│   ├── dist/                                   # Built — preset.css already lives at dist/tailwind/preset.css
│   ├── package.json                            # Modify exports: add ./preset.css, remove ./dist/tailwind/*, ./dist/css/* wildcards
│   ├── README.md                               # Update: two-line quickstart + bootstrap script docs + Migrating from 0.1.0
│   └── CHANGELOG.md                            # New: 0.2.0 entry hand-authored (FR-016)
├── react/
│   ├── src/
│   │   ├── components/
│   │   │   └── VisuallyHidden/
│   │   │       ├── VisuallyHidden.tsx          # New component
│   │   │       ├── VisuallyHidden.stories.tsx  # New stories with play function
│   │   │       ├── VisuallyHidden.test.tsx     # New unit tests
│   │   │       └── index.ts                    # Public re-export
│   │   ├── preset.css                          # New source: 2-line wrapper (@import tokens + @source)
│   │   └── index.ts                            # Modify: export VisuallyHidden
│   ├── dist/
│   │   └── preset.css                          # New built artifact (copied via tsup onSuccess hook or postbuild script)
│   ├── tsup.config.ts                          # Modify: add CSS copy step
│   ├── package.json                            # Modify exports: add ./preset.css
│   ├── README.md                               # Update: two-line quickstart + VisuallyHidden docs + Migrating from 0.1.0
│   └── CHANGELOG.md                            # New: 0.2.0 entry hand-authored (FR-016)
├── THEMING.md                                  # Update: reference themeBootstrapScript + FOUC design-space section + future structural opportunity note
└── README.md                                   # Update: link to migration guide if appropriate
```

**Structure Decision**: Two-package modification within the existing monorepo. No new packages, no new top-level directories. The `<VisuallyHidden>` component slot under `packages/react/src/components/` follows the existing component-folder pattern (`Button/`, `Card/`, etc.). The React package's source `preset.css` lives at `packages/react/src/preset.css` (not under `components/`) because it is a build artifact source, not a React component.

## Phase 0: Outline & Research

See [research.md](./research.md) for full output. Summary of items resolved:

- Polymorphic component pattern for `<VisuallyHidden>` — `as` prop with `"span"` default, typed via generic
- Confirmed neither Base UI nor shadcn/ui ship a first-party `VisuallyHidden`; roll our own (~15 lines)
- CSS approach: use Tailwind's built-in `.sr-only` utility via `className` (FR-008 forbids redefining the utility ourselves)
- Shipping `preset.css` via tsup: use the `onSuccess` hook for a `node:fs` copy from `src/preset.css` to `dist/preset.css`
- `themeBootstrapScript` content shape: self-executing function with try/catch, under 250 bytes, deterministic output for any `defaultTheme` argument
- Test strategy: unit-test factory output, integration-test via jsdom + `new Function()`, CSP determinism via SHA-hash equality

No NEEDS CLARIFICATION items remain.

## Phase 1: Design & Contracts

**Prerequisites**: [research.md](./research.md) complete.

### Data Model

See [data-model.md](./data-model.md). Captures the five entities from the spec plus their relationships, validation rules, and shape.

### Contracts

See [contracts/](./contracts/). Three sub-documents:

- [contracts/exports.md](./contracts/exports.md) — The TypeScript public API: every new export from each package, with type signatures
- [contracts/css-contracts.md](./contracts/css-contracts.md) — The CSS file contracts: what `tokens/preset.css` declares, what `react/preset.css` declares, what guarantees each provides to Tailwind v4
- [contracts/migration.md](./contracts/migration.md) — The 0.1.0 → 0.2.0 import-line mapping that powers FR-017 and the README migration sections

### Quickstart

See [quickstart.md](./quickstart.md). A consumer-facing two-line wiring example plus a bootstrap-script example plus a `<VisuallyHidden>` example. Validates that the consumer-facing API matches the spec's user stories.

### Agent context update

Run `.specify/scripts/bash/update-agent-context.sh claude` after this plan lands. The new technology surface to record:

- `themeBootstrapScript` and `getThemeBootstrapScript` runtime exports from `@unbranded-ds/tokens`
- `<VisuallyHidden>` polymorphic component from `@unbranded-ds/react`
- The canonical two-line Tailwind v4 wiring (`@import 'tailwindcss'; @import '@unbranded-ds/react/preset.css';`)
- The `unbranded-ds-theme` localStorage key (already in memory; mention in CLAUDE.md so the agent sees it without loading memory)

## Post-Phase-1 Constitution Re-Check

All gates from the initial Constitution Check still PASS after Phase 1 design. No new violations introduced. The polymorphic `as` prop pattern for `<VisuallyHidden>` is a known React idiom and does not conflict with constitution Section IV (the component is still thin and uses tokens only via Tailwind utilities).

## Complexity Tracking

No constitution violations. This section intentionally left empty.
