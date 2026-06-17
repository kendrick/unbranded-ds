# Phase 0 Research: Next.js 15 example app

The clarify session resolved the open product decisions, so this phase records the technical approach for each piece, grounded in the actual repo state (package exports, workspace, CI, the theme CSS artifacts). Decisions are stated with rationale and the alternatives weighed.

## 1. Workspace integration

**Decision**: Add `examples/*` to `pnpm-workspace.yaml`. The example's `package.json` is `private: true`, names itself `@unbranded-ds/example-nextjs`, and pins `@unbranded-ds/tokens` and `@unbranded-ds/react` at `workspace:*`.

**Rationale**: `private: true` keeps it out of `changeset` publishing and npm regardless of its name, satisfying FR-018's "excluded from publish." `workspace:*` tracks the local packages during development, and the README documents swapping these to published versions for the clone-out path (FR-007). The `examples/*` glob mirrors the existing `packages/*` and `apps/*` entries.

**Alternatives considered**: Naming it outside the `@unbranded-ds` scope to dodge the publish job's `--filter '@unbranded-ds/*'`. Rejected: the brief's acceptance criteria use `@unbranded-ds/example-nextjs`, and `private: true` plus a tightened publish filter (see §9) is cleaner than an off-scope name.

## 2. Canonical Tailwind wiring, and how themes load

**Decision**: `app/globals.css` opens with exactly the two canonical lines:

```css
@import 'tailwindcss';
@import '@unbranded-ds/react/preset.css';
```

Then, as clearly-commented additive imports, the theme CSS the app actually uses:

```css
@import '@unbranded-ds/tokens/themes/dark.css';
@import '@unbranded-ds/tokens/themes/vaporwave.css';
@import '@unbranded-ds/tokens/themes/compact.css';
```

**Rationale**: The verified exports confirm `@unbranded-ds/react/preset.css` and `@unbranded-ds/tokens/themes/*.css` (which map to `dist/css/tokens-*.css`). The preset carries the base/light layer and the utility-to-variable mappings; light is the default, so only dark, vaporwave, and compact need explicit imports. FR-003 constrains the _Tailwind/preset_ wiring to the two lines; the theme imports are a separate, labeled concern (loading the themes this app exercises), which keeps SC-004 honest: the base styling still traces to the two lines.

**Alternatives considered**: Importing every bundled theme. Rejected as misleading bloat; the app imports only what it uses. Bundling theme CSS into the preset. Rejected: that is a tokens-package decision, out of scope, and would defeat per-theme opt-in.

## 3. Flash-free bootstrap

**Decision**: `app/layout.tsx` inlines `getThemeBootstrapScript()` from `@unbranded-ds/tokens/runtime` in `<head>` via a `<script dangerouslySetInnerHTML>`, before any rendered content. `<ThemeProvider>` from `@unbranded-ds/react` wraps the body.

**Rationale**: The bootstrap sets `data-theme` and `data-density` from storage before first paint, which is the documented no-flash mechanism (Constitution III, spec 002/009). The provider then reconciles to storage on mount and is the single source of truth for the toggles. Both are already SSR-safe by design (the provider does not touch `window` during render), satisfying Constitution IX.6.

**Alternatives considered**: A client-only theme init in `useEffect`. Rejected: it paints the default first, then corrects, which is exactly the flash FR-004/SC-002 forbid.

## 4. Theme controls and the vaporwave showcase

**Decision**: The header hosts `<ThemeToggle>` (light/system/dark) and `<DensityToggle>` (comfortable/compact). The nested route (`app/showcase/`) hosts the vaporwave + compact section, wrapped in its own `<ThemeProvider forced={{ aesthetic: 'vaporwave', density: 'compact' }}>`.

**Rationale**: This uses the spec-011 `forced` API exactly as designed: a pinned subtree that ignores storage and renders its toggles disabled. Putting it on the nested route lets that route do double duty (FR-017): navigating to it proves theme/density persist across App Router navigation, and it is where the alternative-aesthetic composition lives. The section is labeled as an alternative aesthetic composed with compact density, not a color-scheme, and points to the color-scheme split brief.

**Alternatives considered**: Adding vaporwave as a selectable option on a custom control. Rejected in clarify: it diverges from the fixed `ThemeToggle` and implies vaporwave is a color-scheme sibling of light/dark, which the model does not support yet.

## 5. Container queries (Tailwind v4)

**Decision**: The home page includes a container-query demonstration that renders one component inside two different fixed-width wrappers side by side. Each wrapper is a query container (`@container`), and the component's layout responds to the wrapper width, not the viewport. Tailwind v4's built-in `@container` variant and `container-type: inline-size` carry this; base styles are written mobile-first (small-screen first, larger layered up).

**Rationale**: Side-by-side identical components in different-width containers is the clearest demonstration that the response is container-driven, not viewport-driven, with minimal app chrome (the clarify decision). Tailwind v4 ships container-query support, so no extra dependency is needed. This also seeds the design-system follow-up about a `container-type` recipe, since the example shows the hand-rolled version a preset helper would replace.

**Alternatives considered**: A collapsing app-shell sidebar. Rejected as more layout code to clone for the same lesson. Viewport media queries only. Rejected: it would not exercise container queries and weakens FR-015.

## 6. Consumer overrides

**Decision**: A self-hosted variable font loaded with `next/font/local`, applied by overriding the `--typography-font-sans` token; and a small `:root { --color-* }` block overriding a few palette tokens. Both sit in a clearly-commented, removable block.

**Rationale**: These are the documented override seam (spec 002): a consumer supplies their own values for the locked token names. Overriding token _values_ (not hardcoding component styles) is the sanctioned pattern, so it does not fight Constitution IV. Removing the block reverts to design-system defaults (SC-005). An open-licensed font ships in `fonts/` so the clone-out copy has no missing asset.

**Alternatives considered**: A Google-hosted font via `next/font/google`. Rejected: self-hosted via `next/font/local` is what the brief asks for and avoids a network dependency in a clone-out.

## 7. Component coverage

**Decision**: Demonstrate one example of each component exported from `@unbranded-ds/react`'s root, enumerated from `packages/react/src/index.ts`: Button, Card, Checkbox, Dialog, Input, Label, SegmentedControl, Select, Slider, Switch, Tabs, Tooltip, plus the theme controls (ThemeToggle, DensityToggle) in the header, SkipLink as the first focusable element, and VisuallyHidden where a label needs to be screen-reader-only. The `useTheme` hook and `cn` utility are exercised implicitly by the app.

**Rationale**: "All public react exports" (clarify) maps to the 16 component exports. Placing the theme controls, SkipLink, and VisuallyHidden in their natural homes (header, top of page, labels) keeps the showcase realistic rather than a catalog grid, satisfying FR-011 without reimplementing Storybook.

**Alternatives considered**: A bare component gallery. Rejected: the brief and Constitution XI want a realistic page, and Storybook already owns exhaustive per-state coverage.

## 8. End-to-end testing

**Decision**: `@playwright/test` with a `webServer` that runs `next build` then `next start` (production). Specs cover: renders with DS styling; no-flash on reload with a seeded dark preference; light/system/dark switch live; OS-follow while on system (via Playwright's `colorScheme` emulation); the pinned vaporwave + compact section; each demonstrated component present; narrow-width (360px) layout holds; theme/density persist across navigation to the nested route and back. `@axe-core/playwright` asserts no serious/critical violations on the home and showcase views. Functional assertions only, no screenshots.

**Rationale**: Production build is the only place the no-flash behavior is meaningful, since dev-mode hydration timing differs (clarify decision). Playwright's `emulateMedia({ colorScheme })` exercises OS-follow deterministically. axe on key views guards the example's own composition, complementing the components' existing Storybook a11y coverage. No snapshots keeps the suite stable and avoids overlapping Chromatic.

**Alternatives considered**: Dev-server target (faster, but fakes first-paint timing). Visual snapshots (drift coverage, but maintenance and flake, and Chromatic already covers component visuals). Both rejected in clarify.

## 9. CI integration

**Decision**: Add an `e2e` task to `turbo.json` (depends on `build`). Add an `example-e2e` job to `ci.yml` that installs, builds the packages, builds the example, installs the Playwright browser (`chromium` with `--with-deps`), then runs the example's `lint`, `typecheck`, and `e2e`. Tighten the existing `publish` job's build filter so it does not `next build` the example during Chromatic publish.

**Rationale**: The current `verify` job runs typecheck and build (which pick up the example as a workspace member once it has those scripts) but not lint, so the new job runs the example's lint explicitly to honor FR-018's "strict lint in CI." Keeping e2e in its own job isolates the browser install and the production build from the fast verify path. Tightening the publish filter avoids building a private example during the publish job.

**Alternatives considered**: Folding e2e into `verify`. Rejected: it would slow every run with a browser download and a production build. Adding a repo-wide `lint` step to `verify`. Noted as a latent gap (CI does not lint today) but out of scope here; the example lints itself in its own job.

## 10. SSR safety

**Decision**: Server components by default; mark only the interactive leaves (`'use client'`) that need the provider and toggles. No `window`/`document` access during render anywhere in the app.

**Rationale**: Next.js App Router is server-first, and the design system's provider and hook are already SSR-safe (Constitution IX.6). The bootstrap is an inline script string, not React-rendered logic, so it runs before hydration without a server/client mismatch.

**Alternatives considered**: Marking the whole app `'use client'`. Rejected: it abandons the App Router's server-first model the example is meant to demonstrate.
