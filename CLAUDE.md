# heliostat Development Guidelines

Auto-generated from all feature plans. Last updated: 2026-05-18

## Active Technologies
- TypeScript 5.x in `tsx`-tagged code blocks only (validated via `tsc --noEmit` per spec 005's compile validator). Sidecar prose is plain CommonMark. + All shipped in spec 005. The template at `packages/react/src/components/_template/Component.usage.md`, the validator at `scripts/validate-sidecars.ts`, the `AGENTS.md` component index, and the CI step that wires the validator into the verify job. (006-sidecar-retrofit)
- Filesystem only. 14 `<Component>.usage.md` files co-located with their `.tsx` source. One running inbox file: `specs/006-sidecar-retrofit/spec-007-inbox.md`. 15 `.changeset/*.md` files (14 component + 1 backfill). (006-sidecar-retrofit)

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
- 006-sidecar-retrofit: Added TypeScript 5.x in `tsx`-tagged code blocks only (validated via `tsc --noEmit` per spec 005's compile validator). Sidecar prose is plain CommonMark. + All shipped in spec 005. The template at `packages/react/src/components/_template/Component.usage.md`, the validator at `scripts/validate-sidecars.ts`, the `AGENTS.md` component index, and the CI step that wires the validator into the verify job.

- 005-agent-experience-foundation: Added TypeScript 5.x, strict mode, no `any` (Constitution Section VIII)
- 004-primitive-set-expansion: Added TypeScript 5.x, strict mode, no `any` (Constitution Section VIII)


<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->
