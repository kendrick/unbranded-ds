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

- [AGENTS.md](./AGENTS.md) — entry point for agent consumers. Names the published MCP endpoints (Storybook + token-query), inventories the tools, indexes every shipped component, and points at the per-component sidecar files.
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

GitHub Actions runs on every pull request and every push to `main`. A `changes` job runs first and flags docs-only PRs so the browser-heavy jobs can skip them. The rest:

- `verify` — lint, typecheck, validate the sidecar docs, build every package, run the unit tests, and build Storybook. Lint covers the `tokens`, `react`, and `storybook` packages and fails on errors; the React 19 idiom warnings stay advisory. Any failure blocks the PR.
- `storybook-test` — the Storybook interaction and accessibility tests, in a real browser via Playwright. Skipped on docs-only PRs.
- `example-e2e` — lints and typechecks the example app, then runs its Playwright end-to-end suite against a production build. Skipped on docs-only PRs.
- `publish` — depends on `verify`. Publishes Storybook to Chromatic (visual regression disabled, so no snapshots are consumed) and runs the MCP smoke test against the published endpoint.

### Chromatic setup

You'll need a `CHROMATIC_PROJECT_TOKEN` repo secret to publish. To get one:

1. Sign in at [chromatic.com](https://www.chromatic.com) and create a project for this repo
2. Copy the project token from the project settings
3. In GitHub, go to **Settings → Secrets and variables → Actions → New repository secret**
4. Name it `CHROMATIC_PROJECT_TOKEN`, paste the token, save

Once the secret is set, the publish job will run on the next PR or push to `main`. Without the token, the publish job will fail but `verify` still blocks merges on real issues.
