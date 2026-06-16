# heliostat Development Guidelines

Auto-generated from all feature plans. Last updated: 2026-06-15

## Active Technologies
- TypeScript 5.x, strict, no `any` (Constitution VIII). React 19, Next.js 15 (App Router). + `next` ^15, `react`/`react-dom` 19, `@unbranded-ds/tokens` and `@unbranded-ds/react` at `workspace:*`, Tailwind CSS v4 (consumed through `@unbranded-ds/react/preset.css`), `next/font/local` (self-hosted font), `@playwright/test`, `@axe-core/playwright`. (015-nextjs-example-app)
- `localStorage` only, through the design system's existing keys (`unbranded-ds-theme`, `unbranded-ds-density`, `unbranded-ds-theme-preference`). No new storage. (015-nextjs-example-app)
- TypeScript 5.x, strict, no `any` (Constitution VIII). + Style Dictionary v4 (the token build, `sd.config.ts`), Zod (theme schema and validation), Tailwind CSS v4 (`@theme` preset, `@layer` cascade), `@base-ui-components/react` (SegmentedControl, reached through the toggles), React 19 (`useSyncExternalStore`), `@modelcontextprotocol/sdk` (the token-query MCP, re-pointed to three axes). (016-color-scheme-axis-split)
- `localStorage`, new per-axis keys. Color scheme gets `unbranded-ds-color-scheme` (concrete, the bootstrap key) plus `unbranded-ds-color-scheme-preference` (the stated intent, including `system`); `unbranded-ds-theme` is repurposed to hold the identity; `unbranded-ds-density` is unchanged. No migration of stored values (no consumers). (016-color-scheme-axis-split)

- TypeScript 5.x in `tsx`-tagged code blocks only (validated via `tsc --noEmit` per spec 005's compile validator). Sidecar prose is plain CommonMark. + All shipped in spec 005. The template at `packages/react/src/components/_template/Component.usage.md`, the validator at `scripts/validate-sidecars.ts`, the `AGENTS.md` component index, and the CI step that wires the validator into the verify job. (006-sidecar-retrofit)
- Filesystem only. 14 `<Component>.usage.md` files co-located with their `.tsx` source. One running inbox file: `specs/006-sidecar-retrofit/spec-007-inbox.md`. 15 `.changeset/*.md` files (14 component + 1 backfill). (006-sidecar-retrofit)
- TypeScript 5.x, strict mode, no `any` + `@base-ui-components/react`, `class-variance-authority`, Storybook 10.3 (`@storybook/react-vite`), react-docgen (Storybook-bundled) (007-autodoc-audit)
- N/A (prose-only edits to existing source files) (007-autodoc-audit)
- TypeScript 5.x, strict mode, no `any` + Style Dictionary v4 (DTCG build), Zod (theme schema + validation), Tailwind CSS v4 (`@theme` preset consumption) (008-token-schema-growth)
- Filesystem only. DTCG source files under `packages/tokens/src/tokens/`, built-in theme files under `packages/tokens/themes/`, generated artifacts under `packages/tokens/dist/`. (008-token-schema-growth)
- TypeScript 5.x, strict mode, no `any` + Tailwind CSS v4 (`@theme` preset consumption), `@base-ui-components/react`, `class-variance-authority`, Storybook 10.3 (interaction + a11y test runner) (010-constitution-retrofit)
- TypeScript 5.x, strict mode, no `any` + Style Dictionary v4 (DTCG build), Zod (theme schema + validation), Tailwind CSS v4 (`@theme` preset + cascade `@layer`), `@modelcontextprotocol/sdk` (token-query MCP) (009-theming-system-expansion)
- Filesystem only. DTCG theme sources under `packages/tokens/themes/<axis>/`; built artifacts under `packages/tokens/dist/`. (009-theming-system-expansion)
- TypeScript 5.x, strict mode, no `any` + Style Dictionary v4 (made the single resolver for bundled themes), Zod (schema/validation, unchanged), `@modelcontextprotocol/sdk` (the MCP, repointed) (014-resolution-unification)
- Filesystem only. New per-theme resolved-delta artifacts and the generated defaults baseline under `packages/tokens/dist/` and `packages/tokens/src/` respectively. (014-resolution-unification)
- TypeScript 5.x, strict mode, no `any` + `@base-ui-components/react`, `class-variance-authority`, Storybook 10.3 (interaction + a11y), the `warn()` helper (`lib/warn.ts`), jscodeshift (NEW, for the rename codemods) (013-api-vocabulary-harmonization)
- N/A (component library) (013-api-vocabulary-harmonization)
- TypeScript 5.x, strict mode, no `any` + React (peer; uses `useSyncExternalStore`), `@base-ui-components/react` (peer, reached via SegmentedControl), `lucide-react` ^1.8.0 (Sun/SunMoon/Moon icons, existing dep), `class-variance-authority` + `cn()` (existing), the `SegmentedControl` primitive (spec 004), `@unbranded-ds/tokens` runtime (storage-key constants, the `Axis` union, and a NEW "themes per axis" registry export). No `next-themes` runtime dependency (vocabulary alignment only). (011-theme-toggle)
- `localStorage`. Existing keys `unbranded-ds-theme` (now always holds a concrete theme) and `unbranded-ds-density`, plus one NEW companion key for the color-scheme `system` intent (working name `unbranded-ds-theme-preference`). Sidecars are markdown files on disk. (011-theme-toggle)

- TypeScript 5.x, strict mode, no `any` (Constitution Section VIII) (004-primitive-set-expansion)
- N/A (component library; no persisted data) (004-primitive-set-expansion)
- N/A. The MCP reads from the in-memory token map; sidecars are markdown files on disk. (005-agent-experience-foundation)

- TypeScript 5.x (existing); no language additions (003-versioning-workflow)
- filesystem only. `.changeset/*.md` files under `.changeset/`; `package.json` `version` field per package; `CHANGELOG.md` per package. No database, no external state. (003-versioning-workflow)

- TypeScript 5.x, strict mode, no `any` (per constitution Section VIII) (002-consumer-dx-preset)
- `localStorage` client-side, key `unbranded-ds-theme` (canonical, shared with future `useTheme` in spec 007) (002-consumer-dx-preset)

- TypeScript 5.x, strict mode, no `any` (EVER) + pnpm (workspaces), Turborepo, Style Dictionary v4 (DTCG), Tailwind CSS v4 (`@theme` directive), `@base-ui-components/react`, shadcn/ui (Base UI variant, `base-vega` style), `class-variance-authority`, `clsx` + `tailwind-merge`, `tsup` (ESM only), Storybook 10.3 (`@storybook/react-vite`), `@storybook/addon-mcp`, `@storybook/addon-vitest`, `@storybook/addon-a11y`, Chromatic (001-token-design-system)

## Project Structure

```text
src/
tests/
```

## Commands

npm test && npm run lint

## Code Style

TypeScript 5.x, strict mode, no `any` (EVER): Follow standard conventions

## Recent Changes
- 016-color-scheme-axis-split: Added TypeScript 5.x, strict, no `any` (Constitution VIII). + Style Dictionary v4 (the token build, `sd.config.ts`), Zod (theme schema and validation), Tailwind CSS v4 (`@theme` preset, `@layer` cascade), `@base-ui-components/react` (SegmentedControl, reached through the toggles), React 19 (`useSyncExternalStore`), `@modelcontextprotocol/sdk` (the token-query MCP, re-pointed to three axes).
- 015-nextjs-example-app: Added TypeScript 5.x, strict, no `any` (Constitution VIII). React 19, Next.js 15 (App Router). + `next` ^15, `react`/`react-dom` 19, `@unbranded-ds/tokens` and `@unbranded-ds/react` at `workspace:*`, Tailwind CSS v4 (consumed through `@unbranded-ds/react/preset.css`), `next/font/local` (self-hosted font), `@playwright/test`, `@axe-core/playwright`.

- 011-theme-toggle: Added TypeScript 5.x, strict mode, no `any` + React (peer; uses `useSyncExternalStore`), `@base-ui-components/react` (peer, reached via SegmentedControl), `lucide-react` ^1.8.0 (Sun/SunMoon/Moon icons, existing dep), `class-variance-authority` + `cn()` (existing), the `SegmentedControl` primitive (spec 004), `@unbranded-ds/tokens` runtime (storage-key constants, the `Axis` union, and a NEW "themes per axis" registry export). No `next-themes` runtime dependency (vocabulary alignment only).

<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->

`
