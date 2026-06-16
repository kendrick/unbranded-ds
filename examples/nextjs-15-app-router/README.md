# Next.js 15 Starter for unbranded-ds

A small, copy-paste-able Next.js 15 (App Router) app wired up with `@unbranded-ds/tokens` and `@unbranded-ds/react`. It exists to prove the canonical wiring works and to give you a known-good starting point.

It is a starter, not a tutorial and not a component catalog. The published Storybook documents every component and all its states; this app shows how to wire the system into a real project: the two-line Tailwind import, the flash-free theme bootstrap, the theme and density controls, the override seam, and a mobile-first layout that leans on container queries.

## Run It in the Monorepo

```bash
pnpm install
pnpm --filter @unbranded-ds/example-nextjs dev
```

Open the printed localhost URL.

## Copy It Out of the Monorepo

This directory is meant to leave home. Copy `examples/nextjs-15-app-router/` anywhere, then:

1. In `package.json`, change the two `workspace:*` dependencies to published version numbers:

   ```diff
   - "@unbranded-ds/react": "workspace:*",
   - "@unbranded-ds/tokens": "workspace:*",
   + "@unbranded-ds/react": "^1.0.0",
   + "@unbranded-ds/tokens": "^1.0.0",
   ```

   This is the step people forget. The app imports only the published package specifiers, so once the versions are real, nothing points back at the monorepo.

2. Install and run:

   ```bash
   pnpm install
   pnpm dev
   ```

## The Files Worth Reading

- `app/globals.css`: the two canonical import lines are all you need for design-system styling. Below them sit the theme CSS this app loads (dark, vaporwave, compact) and a clearly-marked override block. Delete the override block and the look reverts to the defaults.
- `app/layout.tsx`: inlines the theme bootstrap in `<head>` so the saved theme and density apply before first paint (no flash), loads a self-hosted font with `next/font/local`, and renders the app shell.
- `app/components/app-shell.tsx`: the `ThemeProvider`, the skip link, and the header live here behind a `'use client'` boundary, because the design-system components are client components. Server pages still render as children inside `<main>`.
- `app/page.tsx`: one example of each published component, a card whose hover transition is driven by the motion tokens, and the container-query demo.
- `app/showcase/page.tsx`: proves the theme and density survive navigation, and pins a vaporwave plus compact panel by setting both axis attributes on its container.

## A Note on Consuming the Components

The design-system components use React hooks, so they are client components. Import them inside your own `'use client'` components, the way `app-shell.tsx` and `app/components/gallery.tsx` do here. Server components can still render those client pieces as children.

## Testing

A Playwright suite in `tests/` guards the headline behaviors (no-flash theming, the live toggles, the multi-axis composition, the components rendering, the narrow-width layout) and runs accessibility checks with axe. It runs against the production build:

```bash
pnpm --filter @unbranded-ds/example-nextjs exec playwright install --with-deps chromium
pnpm --filter @unbranded-ds/example-nextjs e2e
```

## Learn More

- The main [README](../../README.md) for the design system.
- [AGENTS.md](../../AGENTS.md) for the agent-facing index of components, hooks, and the MCP endpoints.
