# unbranded-ds DX feedback

Lightweight evidence-based feedback collected while integrating `@unbranded-ds/tokens@0.1.0` and `@unbranded-ds/react@0.1.0` into for-coleman. Goal: help the monorepo become as kickass as possible for downstream consumers.

Format: each item names the gap, why it matters, and a concrete suggested resolution. Items are ordered by how often a real consumer hits them.

---

## A. Components to port FROM for-coleman INTO unbranded-ds

These were built locally in for-coleman because they didn't exist upstream. Every one is generic — no museum coupling — and several DS-driven projects would build them again. Direct candidates for the upstream `@unbranded-ds/react` package.

### A.1 `<VariableText>` — variable-font axis primitive

- **Why**: Variable fonts are everywhere now. A primitive that maps a 0..1 progress value to `font-variation-settings` is missing infrastructure for anyone doing scroll-tied typography, kinetic type, or animated emphasis.
- **What it does**: Accepts `axis` (e.g., `'wght' | 'ital' | 'slnt'`), `range` (`[from, to]`), `progress` (`0..1`), and an optional polymorphic `as` prop. Renders children with the computed `font-variation-settings`. Snaps to `range[1]` on `prefers-reduced-motion`. Mirrors `wght` to `font-weight` so non-variable fallbacks degrade gracefully.
- **Suggested location**: `packages/react/src/components/VariableText/`.
- **Reference implementation**: see `components/scene/variable-text.tsx` in for-coleman. ~70 lines, zero deps beyond `framer-motion`'s `useReducedMotion` (or roll your own if you'd rather not depend on framer-motion).

### A.2 `<ThemeToggle>` — ternary segmented control (light/auto/dark)

- **Why**: Every DS-driven app rebuilds this. The pattern is well-defined (localStorage persistence + system fallback + live media-query listener for the auto state) but each consumer reimplements. Shipping the canonical version means consumers can drop it in.
- **What it does**: Three-state segmented control. Persists to `localStorage` (key `'theme'`). When in `auto`, listens to `prefers-color-scheme` changes mid-session. Sets `data-theme` on `document.documentElement`. Accessible: semantic `<fieldset>` + radio inputs, visually-hidden but keyboard-navigable.
- **Suggested location**: `packages/react/src/components/ThemeToggle/`.
- **Reference**: `components/theme-toggle.tsx` in for-coleman. ~100 lines + ~40 lines of CSS.

### A.3 `themeBootstrapScript` — FOUC-prevention helper

- **Why**: Every consumer needs this exact pattern: an inline script in `<head>` that reads the saved theme from localStorage and sets `data-theme` on `<html>` before the first paint. Without it, dark-mode users see a light-flash on every reload. Re-deriving the script from scratch is error-prone (e.g., forgetting to handle blocked localStorage).
- **What it does**: Exports a stringified IIFE that consumers inline via `<script dangerouslySetInnerHTML={{ __html: themeBootstrapScript }} />`.
- **Suggested location**: `@unbranded-ds/tokens/runtime` (since it pairs with the theme system, not the React components). Single named export.
- **Reference**: the `THEME_BOOTSTRAP` constant in `app/layout.tsx` in for-coleman. ~10 lines.

### A.4 Visually-hidden utility (sr-only)

- **Why**: Already on the upstream gap list informally; making it formal closes the loop. Every accessible app needs ARIA-only text.
- **Options**:
  1. Tailwind utility in the preset.css (`@theme inline { /* … */ }`) that emits `.sr-only` with the canonical clip-path pattern.
  2. A `<VisuallyHidden>` component (Radix-style, polymorphic).
  3. Both — the utility for static markup, the component for prop-driven cases.
- **Suggested location**: utility in `@unbranded-ds/tokens/dist/tailwind/preset.css`. Component in `@unbranded-ds/react`.
- **Reference**: the `.sr-only` class in for-coleman's `globals.css`. ~10 lines.

---

## B. Token schema additions

Real gaps in `@unbranded-ds/tokens@0.1.0`'s schema that downstream consumers will all hit.

### B.1 `font-serif` typography token

The schema declares `font-sans` and `font-mono` but not `font-serif`. Editorial / curatorial / museum / book-style sites need serif body type. for-coleman added it via `--typography-font-serif` and treated unbranded-ds's "extra tokens beyond the schema are allowed" line as permission, but it should be in the canonical schema. One-line addition.

### B.2 Motion tokens (durations + easings)

The schema has zero motion tokens. Real apps need:

```
--duration-fast:     120ms
--duration-base:     240ms
--duration-slow:     480ms

--easing-standard:   cubic-bezier(0.4, 0, 0.2, 1)
--easing-decelerate: cubic-bezier(0, 0, 0.2, 1)
--easing-accelerate: cubic-bezier(0.4, 0, 1, 1)
```

Material Design and iOS HIG both define this set. Without it, every consumer rolls their own.

### B.3 Type scale beyond `xl`

Schema currently stops at `size-xl` (1.25rem). Editorial sites need display sizes — `2xl`, `3xl`, `display-sm`, `display`, `display-lg`, `display-xl`. Even if the values are stylistic and per-project, naming the scale stops in the schema means components like `<Heading size="display-lg">` can be standard.

### B.4 (Maybe) density / touch-target tokens

`--touch-target` (default 44pt) is something every interactive component needs to honor. Apple HIG defines 44pt minimum; tablet kiosk apps want bigger. Could ship as an opt-in module. Lower priority than B.1–B.3.

---

## C. Documentation gaps

The package has a strong README and a solid THEMING.md. These are the gaps a first-time consumer hits.

### C.1 Tailwind preset import path isn't visible from the README

To wire the tokens into Tailwind v4, the consumer needs:

```css
@import 'tailwindcss';
@import '@unbranded-ds/tokens/dist/tailwind/preset.css';
```

The `dist/tailwind/preset.css` path is discoverable only by reading `package.json`'s `exports` field. Add a "Quickstart with Tailwind v4" section to the tokens README showing the exact import line. Same for the CSS-only (no Tailwind) path: `@unbranded-ds/tokens/dist/css/tokens-light.css` + `tokens-dark.css`.

### C.2 No example of extending the schema

THEMING.md says "extra tokens beyond the schema are allowed; forward compatible by design." Excellent. But there's no example showing:

- How to add a new token type (e.g., `motion`) and have it flow through Style Dictionary into the dist outputs.
- How to add a new value in an existing type (e.g., adding `size-2xl`) and surface it as a Tailwind utility.
- How a downstream theme JSON can carry extra tokens that won't be in `@unbranded-ds`'s validation schema.

Even a single end-to-end example covering one of these would unblock consumers.

### C.3 FOUC-prevention pattern isn't documented

THEMING.md covers "applying themes at runtime" but doesn't show the inline-script-in-head pattern that every consumer needs. Add a "Preventing flash-of-wrong-theme" section. Pairs with A.3 above.

### C.4 `validateTheme()` invocation context

The runtime exports `validateTheme()`. Unclear where consumers should call it:

- In a build script (CI)?
- In a Vitest test as part of the project's test suite?
- At runtime when a theme is registered?

Add a recipe under "Validating your custom themes" showing the recommended pattern. for-coleman's `tests/unit/design-tokens.spec.ts` does WCAG contrast checks at test time but never calls `validateTheme` — partly because the integration pattern wasn't obvious.

### C.5 Per-component prop tables

`@unbranded-ds/react` ships 9 components but consumers can't see the prop surface without reading the `.d.ts` files or running Storybook locally. Two paths:

1. Publish the Storybook to a public URL (Chromatic was mentioned in the CI; if a URL exists, link it from the React package README).
2. Add a barebones per-component table to `packages/react/README.md`: name → variants → notable props → quick example.

Storybook is the better source of truth long-term; a README table is the cheap unblocker right now.

### C.6 `publishConfig.access` reminder

When for-coleman first installed `@unbranded-ds/tokens@0.1.0`, the package returned 404 from anonymous npm queries — published as private despite `publishConfig.access: 'public'` being in package.json. The fix was `npm access set status=public @unbranded-ds/tokens`. Worth a one-line callout in the contributor README: "if you fork and publish under your own scope, double-check access after `pnpm publish`."

---

## D. Missing primitives (the gap list)

Components for-coleman needed but `@unbranded-ds/react` doesn't ship yet. Each is generic (not museum-specific). Listed roughly by demand frequency.

| Primitive                 | Demand | Notes                                                                                                                                                                                  |
| ------------------------- | ------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Slider / Range**        | High   | Scenes 5/6/7 need it (tempo, jungle tempo, chop velocity). Standard ARIA-compliant range input. Base UI has `Slider`; thin shadcn-style wrapper would mirror your existing components. |
| **Tooltip**               | High   | Citation hover, control labels. Base UI has `Tooltip`.                                                                                                                                 |
| **Toast / Status region** | High   | BYOA load-result announcements (ARIA live region).                                                                                                                                     |
| **Skip link**             | High   | Keyboard a11y requirement. Hidden until focused, jumps to main content.                                                                                                                |
| **Segmented control**     | Med    | Theme toggle (A.2 above). If `<ThemeToggle>` lands as a specific component, a generic `<SegmentedControl>` is the underlying primitive.                                                |
| **VisuallyHidden**        | Med    | A.4 above. Either utility class or component.                                                                                                                                          |
| **Form**                  | Med    | Wrapping `<Input>` + `<Label>` + error message in an accessible pattern. Base UI has `Form`.                                                                                           |

---

## E. Examples & templates

### E.1 `examples/nextjs-15-app-router/` directory

A minimal, copy-paste-able starter showing `@unbranded-ds/tokens` + `@unbranded-ds/react` wired up in a Next.js 15 App Router project with:

- Tailwind v4 preset import
- Theme bootstrap script in `app/layout.tsx`
- A `ThemeToggle` (once A.2 lands)
- `next/font/local` for self-hosted fonts that override the schema's font tokens

for-coleman currently IS this example, but it's a real project rather than a minimal template. Even a stripped-down version under `examples/` would unblock new consumers significantly.

### E.2 MCP-for-agents documentation

The README mentions the Storybook speaks MCP so agents can see what's in there. As an agent-built project, for-coleman didn't actually wire this up — partly because the consumer-side path wasn't obvious. A "How agents use unbranded-ds" doc would explain:

- What MCP endpoint to point an agent at
- What queries it supports
- A worked example (e.g., "Claude Code, scaffold a component using the Card primitive")

---

## F. Misc observations

- **Token naming**: the schema uses `--typography-font-sans` (long form). Many DS use shorter `--font-sans`. Mostly preference; the long form is more discoverable but longer to type. Worth a note in the README explaining the rationale.
- **`oklch` vs `hex`**: the live tokens are oklch. The schema accepts hex. The conversion happens at registration time. Worth mentioning: contrast math is more accurate against the linearized sRGB derived from oklch than from hex (perceptually-uniform luminance). for-coleman's contrast audit (see `tests/unit/design-tokens.spec.ts`) is a possible model for downstream WCAG validation.

---

## G. Build & distribution

Decisions about how the packages are exposed to consumers' build pipelines. These determine the first ten minutes of a consumer's experience. The single biggest opportunity in this whole document is G.1 — it's the first thing every Tailwind+React consumer hits.

### G.1 Bundle Tailwind wiring into `@unbranded-ds/react/preset.css`

**What a consumer hits today.** To use `@unbranded-ds/react` components in a Tailwind v4 app, the consumer's `globals.css` needs _two_ statements with _different syntax_ and _inscrutable paths_:

```css
@import 'tailwindcss';
@import '@unbranded-ds/tokens/dist/tailwind/preset.css';
@source "../node_modules/@unbranded-ds/react";
```

That's three lines, two of which leak internal package layout (`dist/tailwind/`, `node_modules/`), and a mixed-syntax pair (`@import` vs `@source`) that the consumer has to know is _one_ concern (tell-Tailwind-about-the-DS).

**Why the obvious-seeming fix is wrong.** The intuitive move is to put `@source "../@unbranded-ds/react"` into `@unbranded-ds/tokens/dist/tailwind/preset.css` so the consumer only needs one `@import`. But `@unbranded-ds/tokens` is intentionally framework-agnostic — Vue, Svelte, vanilla-HTML, and native-mobile consumers all pull from it. Teaching the tokens package to scan a specific React package leaks framework concern into the wrong layer. A non-React consumer would be paying the cost of a `@source` rule that doesn't apply to them.

**The right layering.** `@source` belongs in the package whose files need scanning. That's `@unbranded-ds/react`. The React package owns the Tailwind-scanning concern for its own dist; tokens stays agnostic.

**Recommended pattern — what to ship:**

1. Add a clean export alias in `@unbranded-ds/tokens/package.json` so the path is package-name-only, no `dist/` leakage:

   ```json
   "exports": {
     ".": { "types": "./dist/ts/index.d.ts", "import": "./dist/ts/index.js" },
     "./runtime": { "types": "./dist/ts/runtime.d.ts", "import": "./dist/ts/runtime.js" },
     "./preset.css": "./dist/tailwind/preset.css"
   }
   ```

2. Ship a new file `@unbranded-ds/react/dist/preset.css` that internally wraps the tokens preset and adds the React-specific source scan:

   ```css
   /* @unbranded-ds/react/dist/preset.css */
   @import '@unbranded-ds/tokens/preset.css';
   @source "../@unbranded-ds/react";
   ```

   The `@source` path is relative to the file it sits in. Inside `node_modules/@unbranded-ds/react/dist/preset.css`, `../@unbranded-ds/react` resolves to `node_modules/@unbranded-ds/react`, which is what we want Tailwind to scan.

3. Add a matching export alias in `@unbranded-ds/react/package.json`:

   ```json
   "exports": {
     ".": { "types": "./dist/index.d.ts", "import": "./dist/index.js" },
     "./preset.css": "./dist/preset.css"
   }
   ```

**What the consumer writes after this lands:**

```css
@import 'tailwindcss';
@import '@unbranded-ds/react/preset.css';
```

Two lines, both clean package-name paths. One for Tailwind itself, one for the DS layer (tokens + scanning, fully wired). The two-step structure mirrors the consumer's mental model — "I'm using Tailwind, and I'm using this design system on top."

A Vue/Svelte/vanilla consumer who only wants tokens gets the same shape:

```css
@import 'tailwindcss';
@import '@unbranded-ds/tokens/preset.css';
```

**Why not collapse to one line by importing Tailwind from inside the DS preset?** Tempting, but couples the DS to a specific Tailwind major. If the consumer upgrades or pins Tailwind to a version the DS preset didn't expect, breakage with confusing errors. Letting the consumer own their `@import 'tailwindcss'` line is the conventional, correct boundary. Two clean lines beats one fragile line.

**Why this preserves consumer overrides (critical — do not break).** The `@theme` block in `tokens/preset.css` is _registration-only_. It says "the Tailwind utility name `color-background` resolves to whatever the CSS variable `--color-background` is set to" — it does NOT set `--color-background` to a default value. Default values live in _separate_ files (`tokens/dist/css/tokens-{light,dark}.css`, generated from `themes/{light,dark}.json`). Consumers compose:

- **Register only** (override everything): `@import '@unbranded-ds/react/preset.css'` + consumer's own `:root { --color-background: ... }` declarations. This is what for-coleman does — we replace the whole palette with museum-specific oklch values. The `@theme` block gives us the Tailwind utility names (`bg-primary`, etc.); our cascade-later declarations provide the values they resolve to.
- **Register + defaults** (consume the design system as designed): the consumer adds `@import '@unbranded-ds/tokens/themes/light.css'` (and dark) below the preset import to bring in the upstream's default values. Then optionally adds their own overrides below those.

The DS-side rule: **never bundle values into `preset.css`**. If a future change inlines `tokens-light.css` into `preset.css` "for convenience," it would force the upstream's default palette onto every consumer, and overrides would have to fight a same-specificity ancestor declaration. The registration-only design is what makes for-coleman's full palette swap possible with a single `:root { ... }` block. Keep them separate.

**Documentation note:** the package's README should show the two-line wiring as the quickstart, plus a "consuming with overrides" recipe that demonstrates the registration-only / values-separate pattern. This obsoletes most of feedback item **C.1** (which described documenting the inscrutable three-line path) — the right fix is to make the two-line path the actual API, not document a workaround.

**Why this is the highest-leverage item in the doc.** Every Tailwind-using consumer hits this in their first ten minutes. Without the fix, components silently render unstyled and the consumer has to debug "why doesn't my Button look like the Storybook" — which boils down to a Tailwind v4 mechanism (`@source`) that isn't widely documented yet. With the fix, the consumer is up and running on the canonical paths in a single `pnpm add` + two-line `globals.css`.

### G.2 Mirror the clean import paths across all framework packages

Whatever pattern G.1 sets for `@unbranded-ds/react`, repeat for future framework packages (`@unbranded-ds/vue`, `@unbranded-ds/svelte`, `@unbranded-ds/solid`, etc.) so consumers don't have to learn per-package wiring. Each framework package exposes `./preset.css` that wraps tokens + adds its own `@source`. Predictable.

### G.3 Consider what to do about the existing flat-CSS exports

`@unbranded-ds/tokens/dist/css/tokens-{light,dark,brand}.css` and `@unbranded-ds/tokens/dist/tailwind/preset.css` are currently exposed via the wildcard `./dist/css/*` and `./dist/tailwind/*` entries. These work but expose `dist/`. With G.1's named aliases (`./preset.css`, etc.), the wildcards become legacy.

Two options:

- **Keep wildcards** as escape hatches for advanced use. Backwards-compatible.
- **Remove wildcards** in a 1.0 release to enforce the named API. Cleaner but breaks anyone using the long path.

Probably keep them through 0.x and revisit at 1.0. The clean aliases just become the recommended path in docs.

---

## Summary — ranked impact

If I had to rank by "would have saved the most time during for-coleman integration":

1. **G.1** — bundle Tailwind wiring into `@unbranded-ds/react/preset.css`. First-ten-minutes pain for every Tailwind consumer. Three inscrutable lines → two clean lines. Also fixes the silent-failure mode where components render unstyled with no obvious error.
2. **A.1** `<VariableText>` and **A.2** `<ThemeToggle>` shipping upstream (port them and we save ~170 lines locally + one-line swap on the consumer side).
3. **B.2** Motion tokens (durations + easings).
4. **C.2** Schema extension example.
5. **C.3** FOUC-prevention doc (pairs with **A.3** `themeBootstrapScript`).
6. **D** missing primitives — especially Slider and Tooltip.

Happy to PR any of these upstream when the museum hits the next quiet stretch.
