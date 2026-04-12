# unbranded-ds

A token-driven design system. Themes, a React component library, and a Storybook that speaks MCP so agents can see what's in here.

## Packages

- [`@unbranded-ds/tokens`](./packages/tokens) — W3C DTCG tokens, three built-in themes (light, dark, brand), theme validation with WCAG AA contrast checks
- [`@unbranded-ds/react`](./packages/react) — 9 components from shadcn/ui's Base UI variant, styled through tokens only
- [`apps/storybook`](./apps/storybook) — Storybook 10.3 with a theme switcher, interaction tests, a11y audits, and an MCP server

## Docs

- [Theming](./THEMING.md) — writing themes, validating them, applying them at runtime, avoiding FOUC
- [MCP](./apps/storybook/README.md) — what agents can do, client setup, smoke test

## Getting started

```bash
pnpm install
pnpm --filter @unbranded-ds/tokens build
pnpm --filter @unbranded-ds/storybook dev
```

Storybook runs on `http://localhost:6006`. MCP endpoint is at `/mcp`.
