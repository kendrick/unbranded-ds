# Spec 012 — Next.js 15 example app

**Target version:** independent (lives under `examples/`, not in a published package)
**Depends on:** 002 (canonical two-line wiring), 004 (primitives demonstrated), 005 (sidecars referenced from the app's README), 008 (motion tokens demonstrated), 011 (ThemeToggle demonstrated)
**Blocks:** none
**Bundles for-coleman items:** E.1

---

## Motivation

The for-coleman team currently IS the example app for `@unbranded-ds`, but they're a real project with project-specific concerns layered on top. A stripped-down, copy-paste-able starter under `examples/` unblocks new consumers significantly. It's also the proof that the canonical wiring from spec 002 actually works as advertised.

This spec lands last for two reasons. The example demonstrates the canonical wiring, the full primitive set, AND the agent docs — so it depends on most of the prior specs. And building it earlier would document a moving target.

---

## For-coleman context (E.1)

> A minimal, copy-paste-able starter showing `@unbranded-ds/tokens` + `@unbranded-ds/react` wired up in a Next.js 15 App Router project with:
> - Tailwind v4 preset import
> - Theme bootstrap script in `app/layout.tsx`
> - A `ThemeToggle` (once A.2 lands)
> - `next/font/local` for self-hosted fonts that override the schema's font tokens
>
> for-coleman currently IS this example, but it's a real project rather than a minimal template. Even a stripped-down version under `examples/` would unblock new consumers significantly.

---

## Scope

### Project location and shape

- New directory at `examples/nextjs-15-app-router/`
- Standalone pnpm workspace member, included in the root `pnpm-workspace.yaml`
- Pins `@unbranded-ds/tokens` and `@unbranded-ds/react` to `workspace:*` so it tracks the local versions during development
- Excluded from publishing (no `publishConfig`, not in any release manifest)

### What the example demonstrates

- **Tailwind wiring.** `app/globals.css` contains exactly the canonical two lines from spec 002:
  ```css
  @import 'tailwindcss';
  @import '@unbranded-ds/react/preset.css';
  ```
- **Theme bootstrap.** `app/layout.tsx` inlines the `themeBootstrapScript` from `@unbranded-ds/tokens/runtime` in the `<head>` to prevent FOUC.
- **Theme toggle.** The header includes the `<ThemeToggle>` from spec 011. Switching light/auto/dark works without page reload.
- **Custom font that overrides token defaults.** Uses `next/font/local` to load a self-hosted font and applies it via a `:root { --typography-font-sans: ... }` override, demonstrating the "consumer overrides" pattern from spec 002's docs.
- **Custom palette.** A `:root { --color-* }` block in `globals.css` overrides several colors, demonstrating the same override pattern for color tokens.
- **One example using each new primitive.** A page that uses Button (existing), Tooltip (spec 004), Slider (spec 004), SkipLink (spec 004), and the four other existing components, in plausible contexts.
- **Motion tokens in use.** A simple transition somewhere (e.g., on the ThemeToggle, or a Card hover) uses `--duration-base` and `--easing-standard` from spec 008.

### What the example does NOT include

- A real backend or data fetching — keep it a static demo
- Authentication, payments, or other application concerns
- Storybook (the example pulls from the published one, doesn't reimplement it)
- Tests (the example is a starter, not a test fixture)

### README

The `examples/nextjs-15-app-router/README.md` covers:

- What this example is and isn't (a starter, not a tutorial)
- The exact `pnpm create` or copy-paste command to get a fresh copy outside the monorepo
- A walkthrough of the four interesting files (globals.css, layout.tsx, the override block, the page using the primitives)
- A link back to the main README and AGENTS.md (from spec 005)

## Out of scope

- A second example app for a non-Next.js framework (deferred until there's demand)
- A Vue or Svelte example (no Vue/Svelte React package exists yet)
- Deployment configuration (Vercel, Netlify, etc.) — left to the consumer
- A CMS integration, an i18n setup, or any application-pattern-of-the-week

## Acceptance criteria

- `pnpm install && pnpm --filter @unbranded-ds/example-nextjs dev` (or equivalent) starts the example on a local port without manual setup
- The example renders without FOUC when the saved theme is dark and the page is reloaded
- Switching the OS color scheme while the toggle is in `auto` updates the example live
- The example uses each of the four new primitives from spec 004 at least once in a realistic context
- A consumer can copy the entire `examples/nextjs-15-app-router/` directory out of the repo, change the `workspace:*` deps to real version numbers, and have it work
- The example's README explains the wiring and links the relevant docs

## Constitution check

Section XI is fully ratified at this point. The example app honors:

- Humanizer pass on the README and any inline doc strings
- No three-item lists in the README
- Predictable wiring (the example is itself an artifact agents will read to learn how to scaffold a new consumer app)
- The README at `examples/nextjs-15-app-router/README.md` is itself a candidate for agent consumption — write it for both audiences

## References

- [TODO.md](TODO.md) section E.1 — original for-coleman request
- [/tmp/feedback-triage.md](/tmp/feedback-triage.md) — placement at the end of the sequence
- [/tmp/agent-first-workshop.md](/tmp/agent-first-workshop.md) — sequencing rationale
- Spec 002 — canonical Tailwind wiring (the API the example demonstrates)
- Spec 008 — motion tokens (used in the example's transitions)
- Spec 004 — primitives (each one demonstrated in the example)
- Spec 005 — AGENTS.md and sidecars (linked from the example's README)
- Spec 011 — ThemeToggle (demonstrated in the example's header)
