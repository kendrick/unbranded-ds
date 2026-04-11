# Quickstart: Token-Driven Design System v0.1

**Branch**: `001-token-design-system` | **Date**: 2026-04-10

---

## Prerequisites

- Node.js 20+
- pnpm 9+

---

## Setup from Fresh Clone

```bash
git clone <repo-url> && cd heliostat
pnpm install
pnpm build
```

The build runs via Turborepo and produces all artifacts in dependency order: tokens first, then react, then storybook.

---

## Local Development

### Start Storybook (primary dev surface)

```bash
pnpm dev
```

Opens Storybook at `http://localhost:6006`. The MCP endpoint is available at `http://localhost:6006/mcp`.

### Build tokens only

```bash
pnpm --filter @unbranded-ds/tokens build
```

### Build component library only

```bash
pnpm --filter @unbranded-ds/react build
```

---

## Testing

### Run all tests

```bash
pnpm test
```

Runs the Vitest workspace — both unit tests and story interaction tests.

### Run unit tests only

```bash
pnpm --filter @unbranded-ds/react test:unit
```

### Run interaction + a11y tests via Storybook

```bash
pnpm test:storybook
```

Runs story play functions and accessibility audits. Requires a built Storybook (or the dev server running).

---

## Linting & Type Checking

```bash
pnpm lint          # ESLint flat config + Prettier check
pnpm typecheck     # tsc --noEmit across workspace
```

---

## Theme Validation

Validate a theme file against the token schema:

```typescript
import { validateTheme } from '@unbranded-ds/tokens';
import myTheme from './my-theme.json';

const result = validateTheme(myTheme);
if (!result.ok) {
  console.error(result.issues);
}
```

---

## Consuming the Design System

### Install

```bash
pnpm add @unbranded-ds/tokens @unbranded-ds/react @base-ui-components/react
```

### Configure Tailwind

```css
/* app.css */
@import "tailwindcss";
@import "@unbranded-ds/tokens/dist/tailwind/preset.css";
@import "@unbranded-ds/tokens/dist/css/tokens-light.css";
@import "@unbranded-ds/tokens/dist/css/tokens-dark.css";
```

### Use Components

```tsx
import { Button, Card } from '@unbranded-ds/react';

export function App() {
  return (
    <div data-theme="light">
      <Card>
        <Button variant="default" size="default">
          Click me
        </Button>
      </Card>
    </div>
  );
}
```

### Switch Themes

```tsx
document.documentElement.setAttribute('data-theme', 'dark');
```

---

## Key Scripts (root package.json)

| Script | Description |
|--------|-------------|
| `pnpm dev` | Start Storybook dev server |
| `pnpm build` | Build all packages (Turborepo) |
| `pnpm test` | Run all tests (Vitest workspace) |
| `pnpm lint` | ESLint + Prettier check |
| `pnpm typecheck` | TypeScript strict check |
| `pnpm test:storybook` | Run interaction + a11y tests |
