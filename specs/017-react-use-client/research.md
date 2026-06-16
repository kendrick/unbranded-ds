# Phase 0 Research: React Server Component-importable component package

The clarification session (2026-06-16) settled the three open decisions. This consolidates the reasoning and records the one genuine technical finding — why a build banner, not a directive in source.

## Decision: declare the package a client module with a tsup `banner`

**Decision**: Add `banner: { js: "'use client';" }` to `packages/react/tsup.config.ts`, so the bundled `dist/index.js` begins with the directive and the whole entry is a client module.

**Rationale**: Every component uses hooks, so the entire surface is client anyway — one banner line marks all of it and closes the consumer break. It is also the *reliable* way to land the directive: esbuild (tsup's engine) does not faithfully carry a `'use client'` written at the top of `src/index.ts` through bundling into a single file — directives get hoisted or dropped as it concatenates modules. The banner is prepended to the final output verbatim, so it is guaranteed to be the literal first line, which is exactly what an RSC bundler scans for.

**Alternatives considered**:
- Per-component split (preserve each component's own directive in separate outputs) — rejected for now. It is more build complexity and only pays off when a genuinely server-safe export needs to stay server-importable, which no consumer needs yet. Deferred as a clean additive change.
- A `'use client'` line in `src/index.ts` — rejected. Unreliable through esbuild's bundling, as above.

## Decision: guard with a directive unit test plus the example's build

**Decision**: Two guards. A Vitest unit test asserts the built `dist/index.js` starts with `'use client'`. The example app's production `next build` — already run by the `example-e2e` CI job through Playwright's webServer — is the real RSC-import guard once `layout.tsx` (a server component) imports the design system directly.

**Rationale**: The directive line is a single, easily-lost piece of build config, so the cheap string assertion catches the obvious drop fast and on the package's own testing path. The deeper question — does a server component actually build against this bundle — is answered for real by the example, which imports the DS into a server component and builds it in CI. A dedicated RSC fixture would stand up a second Next/bundler setup to prove the same thing.

**Alternatives considered**:
- A dedicated minimal RSC smoke fixture inside `packages/react` — rejected as duplication of the example's build.
- Both the fixture and the example — rejected: cost without added coverage.

**Caveat recorded**: this couples the build-half of the guard to US3 landing (the example importing the DS server-side). US3 is in scope, so the coupling is acceptable; if the example were ever descoped, the directive unit test would remain but the build-guard would need a home.

## Decision: defer a server-safe entry for `cn`

**Decision**: Do not add a separate server-importable entry for the `cn` helper. The whole-entry banner marks it client-tagged from the main entry; revisit only if a consumer needs `cn` server-side.

**Rationale**: Types are erased at build, so type imports stay server-safe no matter what the bundle declares. `cn` merges class names and is called in component render — client — essentially always. Exposing a second entry now is speculative public API surface to document and version for a need nobody has expressed, and adding it later is a non-breaking additive change.

**Alternatives considered**:
- A server-safe `utils` entry exposing `cn` now — rejected (YAGNI).

## Confirmation: tree-shaking and `sideEffects` are unaffected

**Decision**: Keep `"sideEffects": false` in `packages/react/package.json` unchanged.

**Rationale**: A `'use client'` directive is a compile-time module-boundary marker, not executable side-effecting code, so a consumer's bundler still drops unused exports. The spec's tree-shaking edge case holds: declaring the entry a client module does not pin otherwise-dead code into a consumer's build.
