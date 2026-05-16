# heliostat Development Guidelines

Auto-generated from all feature plans. Last updated: 2026-05-15

## Active Technologies

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

- 002-consumer-dx-preset: Added TypeScript 5.x, strict mode, no `any` (per constitution Section VIII)

- 001-token-design-system: Added TypeScript 5.x, strict mode, no `any` (EVER) + pnpm (workspaces), Turborepo, Style Dictionary v4 (DTCG), Tailwind CSS v4 (`@theme` directive), `@base-ui-components/react`, shadcn/ui (Base UI variant, `base-vega` style), `class-variance-authority`, `clsx` + `tailwind-merge`, `tsup` (ESM only), Storybook 10.3 (`@storybook/react-vite`), `@storybook/addon-mcp`, `@storybook/addon-vitest`, `@storybook/addon-a11y`, Chromatic

<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->
