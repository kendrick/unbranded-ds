# Research: Token-Driven Design System v0.1

**Branch**: `001-token-design-system` | **Date**: 2026-04-10

---

## 1. Storybook 10.3 and MCP Addon

**Decision**: Use Storybook 10.3 with `@storybook/react-vite` builder and `@storybook/addon-mcp`.

**Rationale**: Storybook 10.3 is the current stable release (April 2026) and is the first version with production MCP support for React. The `@storybook/addon-mcp` addon runs an MCP server within the Storybook dev server, exposing a `/mcp` endpoint (e.g., `http://localhost:6006/mcp`). It is Vite-only, which aligns with the constitution's requirement for `@storybook/react-vite`. React is the only supported framework for MCP currently.

**Alternatives considered**:
- Storybook 8.x: Does not have MCP support. The addon requires 10.3+.
- Webpack builder: Not compatible with `@storybook/addon-mcp`. Vite is mandatory.

**Key details**:
- Install: `npx storybook add @storybook/addon-mcp`
- Dev endpoint: `http://localhost:6006/mcp`
- Published endpoint (Chromatic): `https://main--<appid>.chromatic.com/mcp`
- The MCP server includes server instructions in the initialize response, guiding agents on available tools.

---

## 2. Storybook Test Addon (Vitest Integration)

**Decision**: Use `@storybook/addon-vitest` for interaction tests via play functions.

**Rationale**: `@storybook/addon-vitest` is the current production addon (replaces the earlier `@storybook/experimental-addon-test`). It transforms stories with play functions into Vitest tests, running them in the Storybook UI's Tests panel during dev and as standard Vitest tests in CI.

**Alternatives considered**:
- `@storybook/experimental-addon-test`: Deprecated, now integrated into `@storybook/addon-vitest`.
- `@storybook/test-runner` (Jest + Playwright): Heavier, slower. Still usable for CI-only a11y checks but the Vitest addon is preferred for interaction tests.

**Key details**:
- Vitest workspace config separates unit tests (`**/*.test.tsx`) from story tests (`**/*.stories.tsx`) into two projects.
- For Vitest 4.x: use `projects` array in `vitest.config.ts`. For Vitest 3.x: use `vitest.workspace.ts`.
- Stories with play functions automatically become Vitest tests.
- Setup file: `.storybook/vitest.setup.ts` initializes the test environment.

---

## 3. Accessibility Testing in CI

**Decision**: Use `@storybook/addon-a11y` with `parameters.a11y.test` set to `'error'` for CI failures. Use the Vitest addon integration for running a11y checks.

**Rationale**: The a11y addon uses Deque's axe-core and integrates with the Vitest addon in Storybook 10.3. Setting `parameters.a11y.test: 'error'` causes a11y violations of serious/critical impact to fail the test run. This replaces the older pattern of using `@storybook/test-runner` with axe-playwright for CI.

**Alternatives considered**:
- `@storybook/test-runner` with axe-playwright: Still works but heavier (requires Playwright). The Vitest addon integration is lighter and runs in the same test infrastructure.
- Manual axe-core integration in unit tests: Duplicates what the addon provides automatically.

**Key details**:
- Install: `@storybook/addon-a11y`
- Config: `parameters: { a11y: { test: 'error' } }` in `.storybook/preview.ts`
- Violations are visible in the Accessibility panel during dev.
- In CI, violations fail the Vitest test run alongside interaction tests.

---

## 4. shadcn/ui Base UI Variant

**Decision**: Use shadcn/ui's official Base UI support to source the nine v0.1 components.

**Rationale**: As of January 2026, shadcn/ui officially supports Base UI as an alternative primitive layer alongside Radix. The CLI (`npx shadcn create`) allows choosing Base UI, and `components.json` configures the style variant (e.g., `base-vega`). All component examples have been rebuilt for both Radix and Base UI, with a consistent API regardless of primitive library. This means we can use `npx shadcn add` to scaffold Base UI-based components and then own the source.

**Alternatives considered**:
- basecn.dev (community project): Less maintained than the official shadcn support.
- Building from scratch on Base UI primitives: Unnecessary now that shadcn has official support.
- Radix-based shadcn/ui: Would work but the constitution specifies Base UI (`@base-ui-components/react`).

**Key details**:
- Config: `components.json` with `"style": "base-vega"` (or similar Base UI style key).
- Package: `@base-ui-components/react` as peer dependency.
- 4 of 9 components (Button, Input, Label, Card) are pure styled HTML — no Base UI primitives needed.
- 5 of 9 components (Dialog, Select, Checkbox, Switch, Tabs) use Base UI primitives for accessibility and interaction logic.

---

## 5. Style Dictionary v4 and W3C DTCG Format

**Decision**: Use Style Dictionary v4 with DTCG format (`$value`, `$type`).

**Rationale**: Style Dictionary v4 is stable and has first-class DTCG format support. The W3C DTCG spec itself went stable in October 2025. While the very latest DTCG format (2025.10) has partial support in v4 (full support deferred to v5), the core `$value`/`$type` format works fully in v4 and meets our needs.

**Alternatives considered**:
- Style Dictionary v3: Does not support DTCG format natively.
- Style Dictionary v5: Would have full 2025.10 support but may not be stable yet. v4 is sufficient.
- Tokens Studio: Commercial tool, unnecessary complexity for v0.1.

**Key details**:
- Token source files use `$value` and `$type` properties (DTCG format).
- Output CSS custom properties scoped under `[data-theme="<name>"]` via custom format/file configuration.
- Output Tailwind preset, TypeScript types, and raw JSON via separate format configurations.
- Zod schema for theme validation is hand-authored to match the token schema, not auto-generated by Style Dictionary.

---

## 6. Tailwind CSS v4 Theming with CSS Variables

**Decision**: Use Tailwind v4's CSS-first `@theme` directive with runtime CSS variables scoped under `[data-theme]` selectors.

**Rationale**: Tailwind v4 replaces the JS config file (`tailwind.config.js`) with CSS-first configuration via the `@theme` directive. CSS variables defined with the `--color-*` namespace automatically generate color utility classes. Themes are scoped via `[data-theme]` attribute selectors in `@layer base`, and utilities resolve to `var(--color-*)` at runtime. This eliminates the v3 pain of RGB channel conversion and alpha compositing.

**Alternatives considered**:
- Tailwind v3 with JS config: Constitution locks Tailwind v4.
- CSS-in-JS (Emotion, styled-components): Constitution prohibits.
- Sass: Constitution prohibits.

**Key details**:
- `@theme` directive defines token-to-utility mappings: `@theme { --color-primary: initial; }` creates `bg-primary`, `text-primary`, etc.
- Runtime values come from CSS variables set by the active theme's `[data-theme]` scope.
- Use `@theme inline` for variables that reference runtime CSS variables.
- The Tailwind preset from `@unbranded-ds/tokens` will be a CSS file (not JS) that declares `@theme` entries for all token namespaces.
- No JS tailwind.config needed — configuration is pure CSS.

---

## 7. Chromatic Publishing and MCP

**Decision**: Use Chromatic for Storybook publishing with `--skip` flag to disable VR snapshots. MCP endpoint is published automatically.

**Rationale**: Chromatic publishes the MCP server alongside Storybook automatically — no additional opt-in required. The `--skip` flag publishes without consuming VR snapshots (the constitution disables VR for v0.1). The MCP endpoint follows the pattern `https://main--<appid>.chromatic.com/mcp` for the default branch permalink.

**Alternatives considered**:
- Self-hosted Storybook: Would not get automatic MCP publishing.
- Vercel/Netlify: Can host Storybook but no MCP integration.
- Chromatic with VR enabled: Constitution explicitly disables VR for v0.1.

**Key details**:
- GitHub Action: `chromaui/action` with `skip: true` and `projectToken: ${{ secrets.CHROMATIC_PROJECT_TOKEN }}`.
- Checkout requires `fetch-depth: 0` for Chromatic to detect changes.
- MCP endpoint URL: `https://main--<appid>.chromatic.com/mcp`
- MCP client config: `npx mcp-add --type http --url "<endpoint>" --client-id "cdf3737dff9d485485968e50b63fd8b4" --scope project`
- Public Storybook = public MCP endpoint (auth is a paid Chromatic feature, out of scope for v0.1).
- MCP smoke test: Send JSON-RPC `tools/list` to the published endpoint and assert expected tools are present.

---

## 8. Vitest Workspace Configuration

**Decision**: Configure Vitest as a workspace with two projects: one for unit tests, one for story/interaction tests.

**Rationale**: Unit tests (`*.test.tsx`) and story tests (`*.stories.tsx`) must coexist in the same component directories without interfering. The Vitest workspace pattern separates them into two projects with different include globs and setup files.

**Alternatives considered**:
- Single Vitest config with complex include/exclude: Fragile, error-prone.
- Separate test directories: Constitution requires co-location.

**Key details**:
- Project 1 (unit): `include: ['**/*.test.tsx']`, standard Vitest config.
- Project 2 (storybook): `include: ['**/*.stories.tsx']`, uses `@storybook/addon-vitest` plugin and `.storybook/vitest.setup.ts`.
- Both projects share the same root but different setup files.
- For Vitest 4.x: `projects` array in `vitest.config.ts`. For Vitest 3.x: `vitest.workspace.ts`.
