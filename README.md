```
◦◦    ◦◦ ◦◦    ◦◦ ◦◦◦◦◦◦◦  ◦◦◦◦◦◦◦     ◦◦    ◦◦    ◦◦ ◦◦◦◦◦◦   ◦◦◦◦◦◦◦◦ ◦◦◦◦◦◦
◦◦    ◦◦ ◦◦◦   ◦◦ ◦◦   ◦◦  ◦◦   ◦◦    ◦◦◦◦   ◦◦◦   ◦◦ ◦◦   ◦◦  ◦◦       ◦◦   ◦◦
◦◦    ◦◦ ◦◦◦◦  ◦◦ ◦◦   ◦◦  ◦◦   ◦◦   ◦◦  ◦◦  ◦◦◦◦  ◦◦ ◦◦    ◦◦ ◦◦       ◦◦    ◦◦
◦◦    ◦◦ ◦◦ ◦◦ ◦◦ ◦◦◦◦◦◦◦  ◦◦◦◦◦◦◦  ◦◦    ◦◦ ◦◦ ◦◦ ◦◦ ◦◦    ◦◦ ◦◦◦◦◦◦   ◦◦    ◦◦
◦◦    ◦◦ ◦◦  ◦◦◦◦ ◦◦   ◦◦  ◦◦ ◦◦    ◦◦◦◦◦◦◦◦ ◦◦  ◦◦◦◦ ◦◦    ◦◦ ◦◦       ◦◦    ◦◦
◦◦    ◦◦ ◦◦   ◦◦◦ ◦◦   ◦◦  ◦◦  ◦◦   ◦◦    ◦◦ ◦◦   ◦◦◦ ◦◦   ◦◦  ◦◦       ◦◦   ◦◦
 ◦◦◦◦◦◦  ◦◦    ◦◦ ◦◦◦◦◦◦◦  ◦◦   ◦◦  ◦◦    ◦◦ ◦◦    ◦◦ ◦◦◦◦◦◦   ◦◦◦◦◦◦◦◦ ◦◦◦◦◦◦
                                                         u n b r a n d e d ◦ d s
```

# unbranded-ds

A token-driven design system. Themes, a React component library, and a Storybook that speaks MCP so agents can see what's in here.

## Packages

- [`@unbranded-ds/tokens`](./packages/tokens) — W3C DTCG tokens, three built-in themes (light, dark, brand), theme validation with WCAG AA contrast checks. [Migrating from 0.1.0 →](./packages/tokens/README.md#migrating-from-010)
- [`@unbranded-ds/react`](./packages/react) — 10 React components styled through tokens only. Nine adopted from shadcn/ui's Base UI variant; `<VisuallyHidden>` rolled in-house. [Migrating from 0.1.0 →](./packages/react/README.md#migrating-from-010)
- [`apps/storybook`](./apps/storybook) — Storybook 10.3 with a theme switcher, interaction tests, a11y audits, and an MCP server

## Docs

- [Theming](./THEMING.md) — writing themes, validating them, applying them at runtime, avoiding FOUC
- [MCP](./apps/storybook/README.md) — what agents can do, client setup, smoke test
- [Changesets workflow](./.changeset/README.md) — per-PR versioning files, picking bump levels, CHANGELOG generation, and release-PR review

## Getting started

```bash
pnpm install
pnpm --filter @unbranded-ds/tokens build
pnpm --filter @unbranded-ds/storybook dev
```

Storybook runs on `http://localhost:6006`. MCP endpoint is at `/mcp`.

## CI

GitHub Actions runs on every PR and push to `main`. The pipeline has two jobs:

**verify** — lint, typecheck, unit tests, build every package, build Storybook, run the Storybook interaction and a11y tests. Any failure blocks the PR.

**publish** — depends on verify. Publishes Storybook to Chromatic (with `skip: true` so no visual regression snapshots are consumed) and runs the MCP smoke test against the published endpoint.

### Chromatic setup

You'll need a `CHROMATIC_PROJECT_TOKEN` repo secret to publish. To get one:

1. Sign in at [chromatic.com](https://www.chromatic.com) and create a project for this repo
2. Copy the project token from the project settings
3. In GitHub, go to **Settings → Secrets and variables → Actions → New repository secret**
4. Name it `CHROMATIC_PROJECT_TOKEN`, paste the token, save

Once the secret is set, the publish job will run on the next PR or push to `main`. Without the token, the publish job will fail but `verify` still blocks merges on real issues.
