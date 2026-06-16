# Spec 017 — Ship `'use client'` from @unbranded-ds/react

**Target version:** patch or minor on `@unbranded-ds/react` (build-only change; the public API does not change)
**Depends on:** nothing
**Blocks:** clean React Server Component consumption (the Next.js App Router example, spec 015, and any RSC consumer)
**Status:** brief (not yet specified)

> Captured on 2026-06-15 while building spec 015 (the Next.js example). The first `next build` failed because importing anything from `@unbranded-ds/react` into a server component pulled hook-using code with no `'use client'` directive. Recorded so the fix is real work, not a footnote.

## The problem

The components use React hooks (`useState`, `useEffect`, `useSyncExternalStore`), so they are client components. `tsup` bundles the whole library into one `dist/index.js` and does not emit a `'use client'` directive at the top. In a React Server Component world (Next.js App Router, and RSC generally), that means:

- Importing `Button` (or anything) into a server component fails the build, because the bundle drags client-only code (for example `Slider`'s `useEffect`) into the server graph without a directive.
- The consumer's only workaround today is to wrap every design-system usage in their own `'use client'` boundary. Spec 015 does exactly this (`app/components/app-shell.tsx`, the gallery), which works but is friction the library should absorb.

This is the headline consumer target (Constitution IX.6 already commits to Next.js SSR), so the gap matters.

## The fix

Make the published bundle carry the directive. Two viable shapes:

- A `tsup` banner that prepends `'use client'` to the entry (`banner: { js: '"use client";' }`). Simplest. It marks the whole entry as a client module, including pure utilities like `cn`, which is harmless (they still work in both server and client components when imported from a client-tagged module, and a consumer who wants `cn` server-side can import the util directly).
- Per-component directive preservation (split output, keep each component's own `'use client'`). More precise, lets genuinely server-safe exports stay server-importable, but more build complexity.

Recommendation: start with the banner (one line, solves the consumer break), and revisit per-component splitting only if a consumer needs a server-importable export.

## What it touches

- `packages/react` build config (`tsup`), and a verification that the built `dist/index.js` begins with the directive.
- Possibly a smoke test: import the package into a tiny RSC fixture and confirm it builds, so this does not regress.
- A changeset (this is a `packages/react` change).

## Open questions

- Banner vs per-component split (above).
- Does any current export need to stay server-importable (for example `cn`, or types)? Types are erased; `cn` is the only pure runtime util. If a server-side `cn` matters, expose it from a separate entry.
- Should the example (spec 015) then drop its `app-shell` client wrapper and import the design system directly into server components, as the better-DX demonstration? Likely yes, once this ships.

## Scope guardrails

- Build-only. No public API or behavior change.
- Not about converting components to server components (they are inherently client); it is about labeling them so RSC consumers can import them.

## References

- Spec 015 — the Next.js example whose build surfaced this; it currently wraps usage in `'use client'` boundaries as the interim pattern.
- Constitution IX.6 — the SSR-compatibility commitment this extends to RSC.
