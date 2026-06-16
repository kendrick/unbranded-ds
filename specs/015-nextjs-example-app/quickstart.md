# Quickstart: Next.js 15 example app

How to run, validate, and read the example.

## Run it (inside the monorepo)

```bash
pnpm install
pnpm --filter @unbranded-ds/example-nextjs dev
```

Open the printed localhost URL.

## Build and run the e2e suite (what CI does)

```bash
pnpm --filter @unbranded-ds/example-nextjs build
pnpm --filter @unbranded-ds/example-nextjs exec playwright install --with-deps chromium
pnpm --filter @unbranded-ds/example-nextjs e2e   # runs against `next build` then `next start`
```

## Validate the headline experiences by hand

- Reload with a dark theme saved: it paints dark with no flash.
- Operate the header control through light, system, and dark: each applies live.
- Set the control to system, then change the OS appearance: the page follows.
- Visit `/showcase`: vaporwave and compact apply together; navigate back and your earlier choice persists.
- Narrow the window toward 360px: no horizontal scroll, and the two container-query instances reflow differently.
- Delete the override block in `globals.css`: the look reverts to design-system defaults.

## The files worth reading

- `app/globals.css`: the two canonical lines, the additive theme imports, and the override block.
- `app/layout.tsx`: the inline bootstrap, the provider, and the header.
- `app/page.tsx`: each component in context, plus the container-query demo.
- `app/showcase/page.tsx`: the navigation-persistence proof and the pinned vaporwave + compact section.

## Clone it out of the repo

See [contracts/clone-out.md](./contracts/clone-out.md) and the example's own README: copy the directory, swap the two `workspace:*` deps to published versions, install, and run.
