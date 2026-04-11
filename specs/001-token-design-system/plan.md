# Implementation Plan: Token-Driven Design System v0.1

**Branch**: `001-token-design-system` | **Date**: 2026-04-10 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/001-token-design-system/spec.md`

## Summary

Build a minimal, themable, token-driven design system as a pnpm + Turborepo monorepo with three packages: a standalone tokens package (W3C DTCG format, compiled by Style Dictionary v4 into CSS variables, Tailwind v4 preset, TypeScript types, and JSON), a React component library of nine components sourced from shadcn/ui's Base UI variant and styled exclusively via token-derived Tailwind utilities, and a Storybook 10.3 documentation app with MCP endpoint, theme switching, interaction tests, and accessibility audits. Published to Chromatic with MCP smoke-tested in CI.

## Technical Context

**Language/Version**: TypeScript 5.x, strict mode, no `any` (EVER)
**Primary Dependencies**: pnpm (workspaces), Turborepo, Style Dictionary v4 (DTCG), Tailwind CSS v4 (`@theme` directive), `@base-ui-components/react`, shadcn/ui (Base UI variant, `base-vega` style), `class-variance-authority`, `clsx` + `tailwind-merge`, `tsup` (ESM only), Storybook 10.3 (`@storybook/react-vite`), `@storybook/addon-mcp`, `@storybook/addon-vitest`, `@storybook/addon-a11y`, Chromatic  
**Storage**: N/A (file-based token JSON, no database)  
**Testing**: Vitest (unit tests), `@storybook/addon-vitest` (interaction tests via play functions), `@storybook/addon-a11y` with axe-core (accessibility), Vitest workspace with two projects  
**Target Platform**: Web (npm packages + Storybook app)  
**Project Type**: Library (monorepo: 2 packages + 1 app)  
**Performance Goals**: Theme switch <100ms, clean build from fresh clone  
**Constraints**: ESM only, no CSS-in-JS, no Sass, 9 components max for v0.1, no VR testing  
**Scale/Scope**: 9 components, 3 themes, 6 token categories (color, spacing, typography, radii, shadows, opacity)

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

| Section                | Requirement                                          | Status | Notes                                         |
| ---------------------- | ---------------------------------------------------- | ------ | --------------------------------------------- |
| I. Repository shape    | 3 packages: tokens, react, storybook                 | PASS   | Exactly 3 packages, no more                   |
| II. Tokens independent | Zero React/Storybook deps in tokens                  | PASS   | Token package has only Style Dictionary + Zod |
| III. Theming contract  | Schema locked, values float, validation              | PASS   | All tokens required per clarification         |
| IV. Components         | shadcn/ui Base UI, 9 components, no hardcoded colors | PASS   | Official Base UI variant available            |
| V. Stories             | Co-located, Default + variants + play functions      | PASS   | All 9 components will have stories            |
| VI. Testing            | 3 layers: unit, interaction, a11y                    | PASS   | Vitest workspace separates concerns           |
| VII. Deployment        | Chromatic, MCP, no VR                                | PASS   | `--skip` flag disables VR                     |
| VIII. Tooling          | All locked choices align                             | PASS   | Research confirms all tools available         |
| IX. DoD                | All criteria covered                                 | PASS   | Spec + plan cover all 8 DoD items             |
| X. Governance          | Constitution amendment for changes                   | PASS   | No amendments needed                          |

**Gate result**: PASS. No violations. Proceeding.

## Project Structure

### Documentation (this feature)

```text
specs/001-token-design-system/
├── plan.md              # This file
├── research.md          # Phase 0 output (completed)
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
│   ├── tokens-api.md    # Token package public API
│   ├── react-api.md     # Component library public API
│   └── mcp-surface.md   # MCP endpoint contract
└── tasks.md             # Phase 2 output (via /speckit.tasks)
```

### Source Code (repository root)

```text
packages/
├── tokens/                          # @unbranded-ds/tokens
│   ├── package.json
│   ├── tsconfig.json
│   ├── sd.config.ts                 # Style Dictionary v4 config
│   ├── src/
│   │   ├── index.ts                 # Main exports: validateTheme, schema, token map
│   │   ├── schema.ts                # Zod schema for theme validation
│   │   ├── validate.ts              # validateTheme() implementation
│   │   └── tokens/                  # W3C DTCG source tokens
│   │       ├── color.json
│   │       ├── spacing.json
│   │       ├── typography.json
│   │       ├── radii.json
│   │       ├── shadows.json
│   │       └── opacity.json
│   ├── themes/                      # Built-in theme files
│   │   ├── light.json
│   │   ├── dark.json
│   │   └── brand.json
│   └── dist/                        # Build output (4 artifacts)
│       ├── css/
│       │   ├── tokens-light.css     # [data-theme="light"] { ... }
│       │   ├── tokens-dark.css      # [data-theme="dark"] { ... }
│       │   └── tokens-brand.css     # [data-theme="brand"] { ... }
│       ├── tailwind/
│       │   └── preset.css           # @theme inline { --color-*: ...; --spacing-*: ...; }
│       ├── ts/
│       │   ├── tokens.ts            # Typed token map
│       │   └── tokens.d.ts          # Type declarations
│       └── json/
│           └── tokens.json          # Raw JSON output
│
├── react/                           # @unbranded-ds/react
│   ├── package.json
│   ├── tsconfig.json
│   ├── tsup.config.ts               # ESM-only build
│   ├── vitest.config.ts             # Vitest workspace (2 projects)
│   ├── .storybook/
│   │   └── vitest.setup.ts          # Storybook test setup
│   ├── src/
│   │   ├── index.ts                 # Barrel export for all components
│   │   ├── lib/
│   │   │   └── cn.ts                # clsx + tailwind-merge utility
│   │   └── components/
│   │       ├── Button/
│   │       │   ├── index.ts
│   │       │   ├── Button.tsx
│   │       │   ├── Button.stories.tsx
│   │       │   └── Button.test.tsx
│   │       ├── Input/
│   │       │   ├── index.ts
│   │       │   ├── Input.tsx
│   │       │   ├── Input.stories.tsx
│   │       │   └── Input.test.tsx
│   │       ├── Label/
│   │       │   └── ... (same pattern)
│   │       ├── Card/
│   │       │   └── ...
│   │       ├── Dialog/
│   │       │   └── ...
│   │       ├── Select/
│   │       │   └── ...
│   │       ├── Checkbox/
│   │       │   └── ...
│   │       ├── Switch/
│   │       │   └── ...
│   │       └── Tabs/
│   │           └── ...
│   └── eslint/
│       └── no-hardcoded-colors.ts   # Custom ESLint rule
│
apps/
└── storybook/                       # Storybook 10.3 app
    ├── package.json
    ├── .storybook/
    │   ├── main.ts                  # Addons: mcp, vitest, a11y, autodocs
    │   ├── preview.ts               # Theme switcher, a11y config
    │   ├── preview-head.html        # FOUC-prevention blocking script
    │   └── vitest.setup.ts          # Test setup
    └── stories/                     # App-level stories (if any)

# Root-level files
├── pnpm-workspace.yaml
├── turbo.json
├── package.json                     # Root workspace package
├── tsconfig.base.json               # Shared TS config
├── eslint.config.ts                 # Flat config with custom color rule
├── .prettierrc
├── .github/
│   └── workflows/
│       └── ci.yml                   # Single CI workflow
├── scripts/
│   └── mcp-smoke-test.ts           # MCP endpoint smoke test
├── THEMING.md
└── README.md
```

**Structure Decision**: Monorepo with 3 packages as mandated by the constitution. `packages/tokens` and `packages/react` are publishable npm packages. `apps/storybook` is the documentation/testing app. All co-located under pnpm workspaces with Turborepo orchestration.

## Complexity Tracking

No constitution violations to justify. All constraints are met within the prescribed architecture.

## Post-Design Constitution Re-Check

| Section                | Status | Notes                                                     |
| ---------------------- | ------ | --------------------------------------------------------- |
| I. Repository shape    | PASS   | 3 packages, no additions                                  |
| II. Tokens independent | PASS   | No React deps in tokens package                           |
| III. Theming contract  | PASS   | Schema locked, all tokens required, Zod + WCAG validation |
| IV. Components         | PASS   | 9 components from shadcn/ui Base UI variant               |
| V. Stories             | PASS   | Co-located in component dirs                              |
| VI. Testing            | PASS   | Vitest workspace with 2 projects (unit + storybook)       |
| VII. Deployment        | PASS   | Chromatic with `--skip`, MCP auto-published               |
| VIII. Tooling          | PASS   | All locked tools confirmed available                      |
| IX. DoD                | PASS   | All criteria addressed in plan                            |
| X. Governance          | PASS   | No amendments needed                                      |
