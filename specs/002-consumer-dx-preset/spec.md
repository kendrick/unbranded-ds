# Feature Specification: Consumer DX preset

**Feature Branch**: `002-consumer-dx-preset`
**Created**: 2026-05-15
**Status**: Draft
**Input**: User description: "Consumer DX preset bundle for unbranded-ds 0.2.0: two-line Tailwind wiring via package preset.css exports, themeBootstrapScript runtime helper, and sr-only utility"

## Clarifications

### Session 2026-05-15

- Q: Which localStorage key namespacing should be canonical? → A: `unbranded-ds-theme` (kebab-case, safe characters, matches npm package family)
- Q: Should we ship `.sr-only` ourselves, or rely on Tailwind's built-in? → A: Rely on Tailwind's built-in `.sr-only` (every consumer of unbranded-ds uses Tailwind per constitution Section IV); additionally ship a `<VisuallyHidden>` React component for prop-driven cases
- Q: What API shape should `themeBootstrapScript` take? → A: Ship both — a `themeBootstrapScript` constant (equivalent to default-light invocation) AND a `getThemeBootstrapScript({ defaultTheme })` factory for non-default-theme consumers (museum kiosks, theaters, video editors). Discoverability of both exports must be enforced via documentation requirements.
- Q: How should the spec handle strict Content Security Policy environments where `dangerouslySetInnerHTML`-style inline scripts are forbidden? → A: Document, do not bake. Inline script remains the recommended pattern with explicit nonce-based and hash-based CSP integration guidance. The factory's output is deterministic per `defaultTheme` so hashes stay stable across builds.
- Q: Should cookie-based server-side rendering (a CSP-clean alternative that avoids inline scripts entirely for SSR apps) be scoped into 002? → A: No, defer to a future spec. 0.2.0 ships inline script + CSP docs. THEMING.md must surface cookie-based SSR as a known design alternative so consumers can evaluate the design space, not just follow the recipe.
- Q: Should the bootstrap script validate the localStorage theme value against a known-themes list? → A: No, trust the value (option A). The script is meant to be tiny and run before paint; it has no list of runtime-registered custom themes at bootstrap time, so validation would break custom-theme consumers. Validation belongs at runtime in `useTheme()` (spec 007). Edge case: a saved value that does not match any loaded theme CSS produces a brief flash of broken-looking page until JS loads — accepted as an edge case for 002, with a follow-up note (see structural opportunity below).
- Q: What deprecation stance for the 0.1.0 wildcard exports (`./dist/tailwind/*`, `./dist/css/*`)? → A: Remove entirely in 0.2.0 (option C). This is a breaking change for any 0.1.0 consumer who has not migrated their imports. Acceptable because pre-1.0 semver permits breaking changes in minor bumps and we're committing to clear release notes, a migration guide, and prominent breaking-change announcement. Versioning workflow (Changesets adoption) becomes its own spec before 003 starts so subsequent breaking changes are managed via tooling.

## User Scenarios & Testing _(mandatory)_

### User Story 1 — Two-line Tailwind wiring for React consumers (Priority: P1)

A developer adopts `@unbranded-ds/react` in a Tailwind v4 application. They open their global stylesheet, write two `@import` lines, and any component from the library renders with its intended styling on the first page load.

**Why this priority**: The single highest-impact friction in the for-coleman feedback. The 0.1.0 wiring required three CSS lines with two different syntaxes and two paths that leak internal package layout. The failure mode is silent — components render unstyled with no error — and the consumer has to debug a Tailwind v4 mechanism (`@source`) that is not widely documented yet. Every Tailwind+React consumer hits this in their first ten minutes of using the design system.

**Independent Test**: Stand up a fresh Next.js 15 (App Router) project with Tailwind v4. Write exactly two lines in `app/globals.css` (`@import 'tailwindcss'` and `@import '@unbranded-ds/react/preset.css'`). Render a `<Button>` from `@unbranded-ds/react`. Verify it appears with the intended typography, color, padding, and radius rather than unstyled HTML.

**Acceptance Scenarios**:

1. **Given** a fresh Tailwind v4 project with `@unbranded-ds/react` installed, **When** the developer writes the two canonical `@import` lines and renders any shipped component, **Then** the component renders with its intended styles on first paint with no console warnings.
2. **Given** a project where the developer also adds `:root { --color-primary: ... }` overrides below the preset import, **When** the page renders, **Then** the consumer's color values win over the design system's defaults with no specificity battles.
3. **Given** the developer pins or upgrades Tailwind to a different patch version within v4, **When** the build runs, **Then** the preset still works because Tailwind is imported by the consumer, not by the design system preset.

---

### User Story 2 — Two-line wiring for tokens-only consumers (Priority: P1)

A developer building in Vue, Svelte, vanilla HTML, or another non-React stack wants to use the design tokens (color, spacing, typography, and so on) as Tailwind utilities without pulling in the React component library. They write two `@import` lines and get the full Tailwind utility surface backed by the design system's tokens.

**Why this priority**: The same constitutional principle (tokens are framework-agnostic, Section II of the constitution) demands that a non-React consumer pays no React-flavored cost. This story shares infrastructure with Story 1 but addresses a distinct audience. Without it, Story 1's fix risks leaking React concerns into the tokens layer.

**Independent Test**: Stand up a fresh Tailwind v4 project with `@unbranded-ds/tokens` installed (no React package). Write `@import 'tailwindcss'` and `@import '@unbranded-ds/tokens/preset.css'`. Confirm Tailwind utility names like `bg-primary`, `text-muted-foreground`, and `rounded-md` are available and produce the correct CSS variable references.

**Acceptance Scenarios**:

1. **Given** a Tailwind v4 project with only `@unbranded-ds/tokens` installed, **When** the developer writes the two-line preset import, **Then** all token-backed Tailwind utility names are available with no React package or React `@source` rule scanned.
2. **Given** the same project, **When** the developer adds `@import '@unbranded-ds/tokens/themes/light.css'` below the preset import, **Then** the upstream's default light-theme values are applied without forcing the consumer to wire them manually.

---

### User Story 3 — Flash-of-wrong-theme prevention helper (Priority: P2)

A developer building a theme-aware application (light, dark, brand, or custom) wants the saved theme to apply before first paint so users never see a brief flash of the wrong theme on page reload. They import a single helper, inline it as a script tag in `<head>`, and the issue is gone — no copy-paste of the script body, no per-project drift on the localStorage key.

**Why this priority**: Every theme-aware consumer needs this exact pattern. The 0.1.0 release documented it as a copy-paste snippet in [THEMING.md:132-145](THEMING.md#L132-L145), but copy-paste means consumers drift on the localStorage key and we have no way to update them centrally. The for-coleman feedback flagged the lack of a canonical helper as one of their top items.

**Independent Test**: Build an app that supports a saved dark theme. Without the helper: reload the page with the saved theme set to dark and observe the brief light-theme flash. With the helper inlined in `<head>`: reload the same page and observe that the dark theme is applied from the very first paint.

**Acceptance Scenarios**:

1. **Given** a consumer app where the user has previously saved a non-default theme to localStorage, **When** the page reloads, **Then** the saved theme is applied before first paint with no visible flash of the default theme.
2. **Given** a browser environment where localStorage is blocked or throws on access (private mode, certain embedded contexts), **When** the helper executes, **Then** it falls back gracefully to the default theme rather than throwing or breaking the page.
3. **Given** the consumer's app uses some other localStorage key for unrelated state, **When** the helper runs, **Then** it reads only from the canonical `unbranded-ds-theme` key and leaves other keys untouched.

---

### User Story 4 — Visually-hidden component for accessible markup (Priority: P3)

A developer writing accessible markup needs to provide screen-reader-only text for labels, ARIA descriptions, or skip-link targets. They wrap the relevant content in a `<VisuallyHidden>` React component from `@unbranded-ds/react` and get the canonical visually-hidden treatment without rolling their own. Tailwind's built-in `.sr-only` utility class remains available for static-markup cases where a wrapping component is overkill.

**Why this priority**: Lower priority than the other three because Tailwind ships `.sr-only` in its base layer and covers the static-markup case for free. The component is the prop-driven counterpart: useful when consumers want polymorphic rendering, easier autocomplete discovery, or to wrap dynamic children. Adding it ships a constitutional accessibility commitment (Section VI requires zero serious or critical axe violations) with an ergonomic surface beyond the className path.

**Independent Test**: In any consumer app, render `<button aria-label-by-content><EyeIcon /><VisuallyHidden>Show settings</VisuallyHidden></button>`. Use a screen reader to navigate to the button; verify "Show settings" is announced. Visually inspect; verify the hidden text occupies no visible space and the icon is the only visible content.

**Acceptance Scenarios**:

1. **Given** `@unbranded-ds/react` is installed and `<VisuallyHidden>` is imported, **When** the developer wraps text in `<VisuallyHidden>Page navigation</VisuallyHidden>` inside a `<nav>` element, **Then** the text is hidden from sighted users but announced by assistive technology.
2. **Given** an axe-core audit runs against a page where an icon button uses `<VisuallyHidden>` to provide its accessible name, **When** the audit completes, **Then** it reports the element as properly labeled rather than missing accessible text.
3. **Given** a developer prefers className over a wrapping component for static markup, **When** they apply `className="sr-only"` to an element, **Then** the element gets the canonical visually-hidden treatment from Tailwind's built-in utility (no work required from this design system).

---

### Edge Cases

- **Tailwind major version drift.** If a consumer pins Tailwind to a version the design system did not test against, the design system's preset continues to work because it does not import Tailwind itself. The consumer owns the Tailwind import line.
- **Consumer upgrades from 0.1.0 without changing imports.** Build fails or styles disappear because the old wildcard paths no longer resolve. The migration guide (FR-017) and CHANGELOG (FR-016) are the consumer's path back to a working state. This is the documented breaking change — discoverable in any of three obvious places: changelog, README migration section, GitHub release.
- **Override conflict if defaults are inlined.** A future change that inlined `tokens-light.css` into `preset.css` "for convenience" would force the upstream's default palette onto every consumer, and consumer overrides would have to fight a same-specificity ancestor declaration. The registration-only design must be preserved.
- **Wrong preset for the framework.** A tokens-only consumer who mistakenly imports `@unbranded-ds/react/preset.css` ends up with a `@source` directive pointing at a path that may not exist in their `node_modules`. Tailwind's `@source` is permissive and skips missing paths, so the build succeeds but the consumer pays a small scan cost. Documentation steers consumers to the correct preset for their framework.
- **localStorage unavailable in SSR contexts.** The bootstrap script is inlined as a `<script>` tag in HTML, so it only executes client-side. Server-side rendering of the same layout component must not call `localStorage` directly — only the inlined script reads it, and only on the client.
- **Strict CSP environments.** Apps that enforce `script-src` without `'unsafe-inline'` cannot run the inline bootstrap script without a nonce or hash. The inline pattern still works in this environment — the consumer attaches a `nonce` attribute to the `<script>` tag (matching their CSP nonce) or adds the script's SHA hash to their CSP allowlist. Documented in FR-014. Cookie-based server-side rendering is a roadmap alternative for consumers who want to avoid inline scripts entirely.
- **Unrecognized saved theme value.** If localStorage holds a value that does not correspond to any currently-loaded theme CSS, the bootstrap script still applies `data-theme="<that-value>"` and the page renders with whatever CSS rules match — typically the unprefixed `:root` defaults. The page is functional but may briefly look "off" until JS loads and either the runtime resolves a valid theme or the unknown theme's CSS arrives. This is accepted as an edge case in 0.2.0; the recommended hardening (making `:root` carry default theme values so unknown `data-theme` values degrade gracefully) is captured below as a future structural opportunity.

### Future structural opportunities (not in scope for 002)

- **Light defaults at `:root` for graceful degradation.** Currently each built-in theme CSS file scopes its declarations under `[data-theme="<name>"]`. If `tokens-light.css` additionally emitted the same declarations at `:root` (so light is the "no-attribute" default), the page would always have a coherent set of CSS variable values regardless of whether `data-theme` matches a loaded theme. Unknown `data-theme` values would degrade to "looks light-themed" instead of "looks unstyled." This is a tokens-package structural change; flag for a follow-up spec.

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: `@unbranded-ds/react` MUST expose a `./preset.css` package export that resolves to a CSS file consumable via `@import '@unbranded-ds/react/preset.css'`.
- **FR-002**: `@unbranded-ds/tokens` MUST expose a `./preset.css` package export that resolves to its Tailwind preset CSS file.
- **FR-003**: The React preset CSS MUST wrap the tokens preset (`@import '@unbranded-ds/tokens/preset.css'`) and MUST add a `@source` directive scoped to the React package's own files.
- **FR-004**: The two-line consumer wiring (`@import 'tailwindcss'` plus `@import '@unbranded-ds/react/preset.css'`) MUST successfully render any shipped `@unbranded-ds/react` component with its intended styling on first paint with no console warnings.
- **FR-005**: The Tailwind `@theme inline` block in the tokens preset MUST remain registration-only — it MUST NOT set default values for any token. Default values continue to live in separate per-theme CSS files.
- **FR-006**: `@unbranded-ds/tokens/runtime` MUST export both `themeBootstrapScript` (a constant string) and `getThemeBootstrapScript` (a factory function accepting an optional `{ defaultTheme }` parameter and returning a string). Both MUST read `localStorage.getItem('unbranded-ds-theme')`, fall back to the configured default theme on missing or blocked storage, and set `data-theme` on the document root element before first paint. The constant `themeBootstrapScript` MUST be equivalent to `getThemeBootstrapScript()` called with no arguments (light as the fallback default). Both exports MUST be backed by a single private constant for the localStorage key to prevent drift.
- **FR-007**: `themeBootstrapScript` MUST handle thrown exceptions from `localStorage` access (private browsing mode, sandboxed contexts) without breaking page load.
- **FR-008**: `@unbranded-ds/react` MUST export a `<VisuallyHidden>` component that renders its children in a visually-hidden but assistive-technology-accessible manner. The component MUST be polymorphic (accept an `as` prop or equivalent) so consumers can specify the underlying element type. The component MUST NOT redefine `.sr-only` — Tailwind's built-in utility is the canonical class-based path for the same outcome.
- **FR-009**: The 0.1.0 wildcard exports (`./dist/tailwind/*`, `./dist/css/*`) MUST be removed from the `exports` field of both packages in 0.2.0. This is a breaking change. The only canonical paths after 0.2.0 are the clean named exports (`./preset.css`, `./runtime`, etc.).
- **FR-016**: Each package (`@unbranded-ds/tokens`, `@unbranded-ds/react`) MUST ship a `CHANGELOG.md` file with a 0.2.0 entry that clearly names the breaking change (wildcard export removal), lists all additions (clean `./preset.css` exports, `themeBootstrapScript` + `getThemeBootstrapScript`, `<VisuallyHidden>` component), and references the migration guide.
- **FR-017**: The root README and each package README MUST include a "Migrating from 0.1.0" section showing the exact import-line replacements consumers need to make. The section MUST cover both the React-package path and the tokens-only path.
- **FR-018**: The 0.2.0 GitHub release notes MUST lead with the breaking-change section. Release-note structure MUST follow the same shape as the CHANGELOG entries so consumers reading either source see the same information.
- **FR-010**: Both packages' READMEs MUST document the two-line wiring as the canonical quickstart and MUST include a "consuming with overrides" recipe demonstrating the registration-only design pattern.
- **FR-011**: [THEMING.md](THEMING.md) MUST be updated to reference `themeBootstrapScript` instead of the copy-paste inline script currently at lines 132–145, and MUST include a worked example using `getThemeBootstrapScript({ defaultTheme: 'dark' })` for consumers who want a non-default fallback theme.
- **FR-012**: Both new `./preset.css` exports MUST be declared in their respective `package.json` `exports` fields and MUST be reachable via the clean package-name path with no `dist/` segment leaking into the consumer's import statement.
- **FR-013**: Both `themeBootstrapScript` and `getThemeBootstrapScript` MUST be documented in the `@unbranded-ds/tokens` README, in [THEMING.md](THEMING.md), and in TSDoc comments on each export. The documentation MUST make clear when a consumer reaches for the constant (default-light case, single-line inline) versus the factory (non-default fallback theme). Discoverability is a hard requirement, not a nice-to-have — having two exports with overlapping purpose creates a "which do I use" trap if the docs do not pull their weight.
- **FR-014**: The README, [THEMING.md](THEMING.md), and TSDoc on the bootstrap exports MUST include explicit Content Security Policy integration guidance covering both nonce-based CSP (for SSR frameworks like Next.js that mint per-request nonces) and hash-based CSP allowlists. `getThemeBootstrapScript({ defaultTheme })` MUST produce deterministic output across builds for any given `defaultTheme` argument so consumers using hash-based CSP can compute the hash once and trust it.
- **FR-015**: [THEMING.md](THEMING.md) MUST include a "FOUC prevention: choosing your approach" section that names the two viable design paths (the inline-script path shipped here, and cookie-based server-side rendering deferred to a future spec). The section MUST: state when each path is appropriate (client-rendered SPAs vs server-rendered apps), explain the CSP trade-off of the inline-script path, and explicitly mark cookie-based SSR as a roadmap item rather than a "rejected" alternative. The goal is for a consumer or agent reading the docs to evaluate the design space rather than just follow the recipe. The `prefers-color-scheme` media query MAY be mentioned as a complement to either path (OS-level signal) but not as a replacement (does not honor user override or custom themes).

### Key Entities

- **React preset CSS**: A new file shipped at `packages/react/dist/preset.css`. Wraps the tokens preset and adds a single `@source` directive scoped to the React package's own component sources. Reachable via the clean `@unbranded-ds/react/preset.css` path.
- **Tokens preset CSS**: The existing Tailwind `@theme inline` registration file. Continues to ship at `packages/tokens/dist/tailwind/preset.css` but gains a clean `@unbranded-ds/tokens/preset.css` alias.
- **themeBootstrapScript** (constant string): A new named export from `@unbranded-ds/tokens/runtime`. A string containing a self-executing function that reads the saved theme from localStorage and applies `data-theme` before first paint. Defaults to `'light'` when no theme is saved. Equivalent to `getThemeBootstrapScript()` called with no arguments.
- **getThemeBootstrapScript** (factory function): A new named export from `@unbranded-ds/tokens/runtime`. Accepts an optional `{ defaultTheme }` parameter and returns a stringified self-executing function with that theme as the fallback. The escape hatch for consumers who want a non-default starting theme (dark-default museum kiosks, theater apps, video editors).
- **`unbranded-ds-theme` localStorage key**: The canonical key for theme persistence in the design system. Shared by `themeBootstrapScript` (this spec) and any future theme hook (spec 007).
- **`<VisuallyHidden>` component**: A new React component shipped from `@unbranded-ds/react`. Renders its children in a visually-hidden but assistive-technology-accessible manner. Polymorphic — accepts an `as` prop to specify the underlying element type. The class-based path (`.sr-only`) is provided by Tailwind's base layer, not by this design system.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: The CSS wiring required of any Tailwind+React consumer drops from three lines in 0.1.0 to two lines in 0.2.0. The eliminated line is the leakiest of the three (the `node_modules/`-pathed `@source`).
- **SC-002**: A new consumer can take a fresh framework project, install the design system, write the two-line wiring, and render their first styled component without consulting any documentation beyond the package README's quickstart section. Measured by walking through the example app in spec 008 end-to-end.
- **SC-003**: The class of "components render unstyled with no console error" failure that for-coleman flagged as a first-ten-minutes pain is eliminated. Measured by zero recurrences of this report in the issue tracker or in the for-coleman team's follow-up integration after 0.2.0.
- **SC-004**: Any consumer who overrides palette, spacing, typography, or other token values via `:root { --token-name: ... }` declarations continues to have those overrides applied with no specificity conflicts. Measured by the for-coleman museum-palette swap continuing to work unchanged on upgrade.
- **SC-005**: Theme-aware consumers can adopt the FOUC-prevention pattern with a single named import and a single JSX/HTML line. No consumer needs to copy or maintain the body of the bootstrap script.
- **SC-006**: Any 0.1.0 consumer who upgrades to 0.2.0 without modifying their CSS import statements continues to render correctly. Backwards compatibility is verified by the existing CI test suite passing on the upgraded version.
- **SC-007**: Accessible markup using either Tailwind's built-in `.sr-only` utility or the new `<VisuallyHidden>` component produces zero axe-core violations of the "element-has-accessible-name" or related rules across the Storybook suite.

## Assumptions

- The consumer is using Tailwind CSS v4. The 0.1.0 release explicitly targets Tailwind v4 (see constitution Section VIII), and Tailwind v3 support is out of scope.
- The consumer's bundler supports CSS `@import` from npm packages — true for Vite, Next.js 15, modern Webpack, Parcel, and other current toolchains.
- The consumer's app is built with Node.js or a JavaScript runtime that respects `package.json` `exports` fields. Older bundlers that ignore `exports` are out of scope.
- The `unbranded-ds-theme` localStorage key is reserved by this design system. A consumer app that uses `unbranded-ds-theme` for unrelated purposes is unlikely; if a collision occurs, that is the consumer's responsibility to resolve.
- The `themeBootstrapScript` constant defaults the active theme to `'light'` when localStorage is empty or blocked. If localStorage contains a value that does not match any currently-loaded theme CSS (a custom theme registered at runtime but not yet loaded, a theme name removed between versions, or garbage), the script still applies `data-theme="<value>"` and the page renders with whatever CSS rules match — falling through to whatever `:root` defaults exist if nothing matches. Validation belongs at runtime in `useTheme()` (spec 007), not in the inline script. Consumers who want a different default theme (for example, a dark-by-default museum kiosk app) reach for the `getThemeBootstrapScript({ defaultTheme: 'dark' })` factory in this same iteration. The factory and the constant share a single private key constant so they cannot drift from one another or from `useTheme()` in spec 007.
- The 0.1.0 wildcard exports are removed in 0.2.0 as a breaking change. Pre-1.0 semver permits breaking changes in minor bumps, and the clear-release-notes commitments in FR-016 through FR-018 ensure consumers can recover. A separate "versioning workflow" spec (recommended before spec 003 starts) is expected to adopt Changesets so future breaking changes are managed via tooling rather than hand-authored release notes.

## Dependencies

- Tailwind v4's `@source` directive continues to function as documented. Constitution Section VIII locks Tailwind v4 as the styling toolchain, so this dependency is internal.
- Style Dictionary v4+ continues to emit the `@theme inline` registration block that the tokens preset depends on. The build is unchanged by this spec.
- Spec 003 (token schema growth) is independent of this spec but lands in the same 0.2.0 release. The two specs can be developed in parallel.
