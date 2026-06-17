# Feature Specification: Token schema growth

**Feature Branch**: `008-token-schema-growth`
**Created**: 2026-05-25
**Status**: Draft
**Input**: User description: "Token schema growth — bring the missing token categories (serif font, motion, larger type sizes) into the canonical `@unbranded-ds/tokens` schema, and loosen theme validation so a theme can override any token category rather than only color." (full brief at `tmp/spec-008-token-schema-growth.md`)

## Background

The for-coleman team needed a serif font, motion tokens, and display-sized type — none of which the `@unbranded-ds/tokens` schema includes. They added the values themselves, leaning on the "extra tokens beyond the schema are allowed" line in THEMING.md as permission. That works, but it forces every consumer to reinvent the same handful of additions, and it blocks standardizing components like a future `<Heading size="2xl">` whose size names don't exist in the schema yet.

This spec brings the missing categories into the canonical schema (the for-coleman items B.1 `font-serif`, B.2 motion, B.3 larger type sizes) and documents the extension pattern (C.2) so future additions follow a known path. It also closes a structural gap surfaced during spec 005's implementation: the bundled theme files carry only `color` overrides, so every other category is design-system-fixed even though Constitution Section III says token values float at runtime for every category, not just color.

Adding required tokens is a breaking change to any existing consumer theme. Pre-1.0 that is acceptable; the version bump announces it in one cycle alongside the structural fix, keeping the breaking-change announcement to a single release.

## Clarifications

### Session 2026-05-25

- Q: Which layer does the validation loosening target, given that the build-time DTCG theme files and the runtime `validateTheme` format are different shapes? → A: Keep the two formats separate; they serve two real pipelines (ahead-of-time Style Dictionary builds for the static built-in themes, just-in-time `registerTheme` for consumer-supplied dynamic themes). `validateTheme` stays the runtime-theme validator, loosened to accept partial themes, and MUST resolve (merge the override onto the canonical defaults) before validating, so contrast and completeness check the merged result rather than the raw fragment. Built-in DTCG themes are verified by their resolved build output, not by `validateTheme`. THEMING.md documents the token-source-override vs runtime-theme distinction with an example of each.
- Q: How should the motion tokens be named in the output (CSS vars and Tailwind utilities)? → A: Tailwind-namespace-aligned. Easings emit as `--ease-{standard,decelerate,accelerate}` (generating `ease-*` utilities); durations emit as `--duration-{fast,base,slow}`. The schema category stays `motion`, but the build special-cases its variable naming rather than using `--motion-*`. The brief's `--easing-*` is corrected to `--ease-*`. Whether v4 auto-generates named `duration-*` utilities is confirmed during planning; easings generate `ease-*` regardless.
- Q: Does `brand.json` ship a demonstrative non-color override, or do the built-in themes stay color-only? → A: `brand.json` ships a richer multi-category non-color override (a `radius` override plus a `typography` override such as a font weight or font family), demonstrating more of the theming surface. `light.json` and `dark.json` stay color-only. This gives FR-014's THEMING.md example a real, shipped theme to reference.
- Q: Which packages bump for the release? → A: `@unbranded-ds/tokens` minor to 0.4.0 plus `@unbranded-ds/react` patch (a dependency-range bump to `^0.4.0` so react consumers receive the new tokens through the re-exported preset). Standard Changesets dependent-bump; no react source changes.

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Canonical tokens for serif, motion, and larger type (Priority: P1) 🎯 MVP

A consumer building an editorial or motion-aware component reaches for serif body type, animation durations and easings, and display-larger type sizes using canonical token names from `@unbranded-ds/tokens` — without redefining them in their own project. A component author writing a transition uses the shared duration and easing tokens so every animated component in the design system moves at a consistent speed and curve.

**Why this priority**: This is the core for-coleman ask (B.1 + B.2 + B.3) and the reason the spec exists. It delivers value on its own: even without the theme-override loosening (US2) or the documentation walkthrough (US3), shipping the new tokens lets consumers stop reinventing them. It also unblocks the spec 010 retrofit, which swaps primitive transitions to these motion tokens.

**Independent Test**: Add the new tokens to the schema and source files, run the build, and confirm a consumer can style a component with `font-serif`, a motion duration, a motion easing, and a `2xl`/`3xl` type size — all resolving to real CSS variables and Tailwind utilities — without authoring those values themselves.

**Acceptance Scenarios**:

1. **Given** the expanded schema, **When** a contributor inspects the typography category, **Then** it requires `font-serif`, `size-2xl`, and `size-3xl` in addition to the existing keys.
2. **Given** the expanded schema, **When** a contributor inspects the token categories, **Then** a top-level `motion` category exists with three duration keys (fast, base, slow) and three easing keys (standard, decelerate, accelerate).
3. **Given** the regenerated build artifacts, **When** a consumer writes a component using a motion duration and easing through Tailwind utility syntax, **Then** the styles resolve to the generated CSS variables and the animation runs at the token-defined speed and curve.
4. **Given** the regenerated build, **When** a consumer inspects the four output artifacts (CSS variables, Tailwind preset, TypeScript token map, JSON), **Then** every new token appears in all four.

---

### User Story 2 - Themes can override any token category (Priority: P2)

A consumer authoring a brand theme overrides border radius, default spacing, or a font family — not just colors — and the theme validates and produces a working CSS variable set. A consumer who only wants a color skin keeps writing color-only themes exactly as before; nothing about the existing color-theming path changes for them.

**Why this priority**: This aligns the implementation with Constitution Section III ("token values float at runtime" for every category). Most consumers theme only color, so this is a smaller audience than US1, but for brand themes that need different rounding or spacing it removes a hard wall. Bundling it in the same release as US1 keeps the breaking-change announcement to one cycle.

**Independent Test**: Author a theme that overrides `color` plus one non-color category (for example `radius`), validate it, and confirm it passes and generates a working CSS variable set where the non-color override takes effect and every untouched token inherits the canonical default.

**Acceptance Scenarios**:

1. **Given** a theme that overrides only `color` and `radius`, **When** it is validated, **Then** validation passes and the omitted categories inherit the canonical default values.
2. **Given** a theme that overrides a subset of keys within a category, **When** it is validated, **Then** validation passes and the omitted keys within that category inherit their canonical defaults.
3. **Given** a color-only theme written against the previous format, **When** it is validated under the expanded validator, **Then** it still passes — the existing color-theming path is unchanged.
4. **Given** the token-query MCP's palette lookup against a category the active theme now carries (for example `radius` or `motion`), **When** the lookup runs, **Then** it returns the resolved values rather than the `unknown-category` response it returned before. (No MCP code changes in this spec; the unblock is automatic once theme data carries the category.)

---

### User Story 3 - A documented path to extend the schema (Priority: P3)

A first-time contributor who needs a token category the schema doesn't have opens THEMING.md and follows a worked example that walks the full pipeline — adding a source file, updating the schema, updating the themes, regenerating, and verifying the new tokens in every output. A separate subsection shows how a brand theme overrides a non-color category, so the override capability from US2 has a documented entry point.

**Why this priority**: The extension capability already exists informally ("extra tokens beyond the schema are allowed"), but without a worked example a contributor is left guessing how a new token flows through the build into the dist outputs. This is documentation polish on top of the functional work in US1 and US2; it adds the most value once the tokens and the override capability are already in place.

**Independent Test**: A contributor unfamiliar with the token pipeline follows the THEMING.md walkthrough end to end to add a brand-new token category from scratch, and sees the new tokens appear in all four generated artifacts.

**Acceptance Scenarios**:

1. **Given** the updated THEMING.md, **When** a contributor reads the "Extending the schema" section, **Then** it walks the complete pipeline using the motion category as the worked example: source file, schema update, theme update, regenerate, verify in all four outputs.
2. **Given** the updated THEMING.md, **When** a contributor reads the "Overriding non-color tokens" subsection, **Then** it shows a brand theme overriding a non-color category (spacing or radius) and explains that omitted tokens inherit the default.
3. **Given** the updated THEMING.md, **When** a contributor reads it, **Then** it clearly separates a token-source override (a DTCG file consumed by the build) from a runtime theme document (the flat shape passed to `registerTheme` / `validateTheme`), with a complete worked example of each.

---

### User Story 4 - Optional tokens that absorb hardcoded drift (Priority: P3)

A component author who today hardcodes the same raw value in many places (a `ring-3` focus-ring width repeated 14 times, a `z-50` overlay layer across the four portal components) reaches instead for a canonical token, so the value is named once and a theme can vary it. The tokens land now; swapping the hardcoded usages over to them is a later retrofit.

**Why this priority**: These are latent tokens the codebase already implies. A value hardcoded 14 times is a token without a name. Introducing them is cheap (tokens-package only) and non-breaking, since they are optional and inherit defaults. It also sets up the spec 010 retrofit and documents a latent layering bug: the four portal components all stack at `z-50`, so a tooltip opened inside a dialog has no defined order over it. The ordered z-index scale is the fix the retrofit applies.

**Independent Test**: Add the `ring.width` token and the `z-index` scale to the schema and source defaults, run the build, and confirm both appear in all four artifacts and that a theme can override the ring width or a z-index stop, all without touching any component file.

**Acceptance Scenarios**:

1. **Given** the expanded schema, **When** a contributor inspects the token categories, **Then** a `ring` category with a `width` key and a `z-index` layering scale exist as optional tokens with canonical defaults.
2. **Given** a theme that omits `ring` and `z-index`, **When** it is validated and built, **Then** it inherits the default ring width and layering scale with no error (the optional-token path from US2).
3. **Given** the `z-index` scale, **When** a contributor inspects its stops, **Then** they are ordered so a tooltip layer sits above a dialog or overlay layer, giving nested overlays a defined stacking order.

---

### Edge Cases

- **A consumer theme omits a newly-required token** (for example, a brand theme written before this release that never mentions `font-serif`): the token inherits the canonical default. No error — partial themes are valid by design.
- **The canonical default set itself omits a required token** (a contributor adds a key to the schema but forgets to add its value to the source/default layer): validating a built-in theme surfaces a structured error naming the missing path, because there is no default left to inherit. This guards the completeness of the defaults, not the completeness of every consumer theme.
- **A theme overrides a token with a malformed value** (a non-string where a string is expected, or a color pair that fails WCAG AA contrast): the structured-error behavior holds; the WCAG AA contrast checks still apply, now against the resolved merged theme.
- **A partial theme overrides one side of a contrast pair and inherits the other** (for example, it overrides `color.background` but not `color.foreground`): validation merges the override onto the canonical defaults first, so the AA check runs against the inherited foreground and the overridden background. Without the merge, the current skip-when-a-side-is-absent behavior would silently pass a failing pair.
- **A consumer references a motion token through Tailwind that doesn't exist** (a typo like `duration-medium`): standard Tailwind behavior — the utility doesn't resolve. The token set defines fast, base, and slow; there is no `medium`.
- **Display-tier sizes** (`display-sm`, `display`, `display-lg`, `display-xl`) are requested by a consumer: not in scope for this spec. They are deferred until a component contract (likely a `<Heading>`) needs them, since naming display stops without a consumer is premature.

## Requirements _(mandatory)_

### Functional Requirements

**Schema additions (US1)**

- **FR-001**: The token schema MUST declare `font-serif` as a required key in the typography category.
- **FR-002**: The token schema MUST declare a new top-level `motion` category, peer to color, spacing, typography, radius, shadow, and opacity, with three required duration keys (fast, base, slow) and three required easing keys (standard, decelerate, accelerate). The emitted CSS variable names follow Tailwind's motion namespaces (`--ease-*`, `--duration-*`) per FR-006, not the `--motion-*` pattern the other categories use.
- **FR-003**: The token schema MUST declare `size-2xl` and `size-3xl` as required keys in the typography category.
- **FR-004**: The motion duration and easing values MUST adopt the conservative defaults from the brief (durations of 120ms / 240ms / 480ms; easings of the standard, decelerate, and accelerate cubic-bezier curves), sourced from established platform motion guidance.
- **FR-005**: Every newly required token MUST flow through the build into all four published artifacts: CSS custom properties, the Tailwind preset, the TypeScript token map, and the raw JSON.
- **FR-006**: The motion tokens MUST emit Tailwind-namespace-aligned CSS variables so they generate real utilities. Easings emit as `--ease-{standard,decelerate,accelerate}` (generating `ease-standard` and the like); durations emit as `--duration-{fast,base,slow}`. The build special-cases the motion category's variable naming rather than the `--{category}-{key}` pattern. Whether Tailwind v4 generates named `duration-*` utilities from a `--duration-*` namespace MUST be confirmed during planning; if it does not, durations fall back to arbitrary-value references like `duration-[var(--duration-base)]` while easings still generate `ease-*` utilities.

**Theme override loosening (US2)**

- **FR-007**: Theme validation MUST accept a theme that provides overrides for any token category, not only color.
- **FR-008**: Theme validation MUST accept a theme that overrides only a subset of categories, or only a subset of keys within a category, by resolving the override against the canonical defaults and validating the merged result. Every omitted token inherits the canonical default value; validation never runs against the raw fragment.
- **FR-009**: A color-only theme written against the prior format MUST continue to validate unchanged — the existing color-theming path MUST NOT regress.
- **FR-010**: The canonical default layer (the source token definitions and built-in themes that supply the inherited baseline) MUST define every required token, including the new ones. When a token has no inheritable default and is absent, validation MUST return a structured error naming the missing path.
- **FR-011**: All three built-in themes (the DTCG source files consumed by the Style Dictionary build) MUST carry values for every newly required token and MUST produce correct resolved build output under the expanded schema. They are verified through their built CSS output, not by feeding them to `validateTheme`, which validates the separate runtime-theme format.
- **FR-012**: WCAG AA contrast checks MUST run against the resolved (merged) theme, including pairs where one side is overridden and the other is inherited from the canonical defaults. Loosening category coverage MUST NOT weaken contrast validation; the current behavior of skipping a pair when one side is absent MUST be replaced by checking the merged result.
- **FR-021**: Resolve-then-validate MUST apply at both validation entry points: `validateTheme` and the post-conversion contrast check inside `registerTheme`. Both currently skip a contrast pair when either side is absent (`if (!fg || !bg) continue`); both MUST instead merge the partial override onto the canonical defaults before checking, so a theme that overrides one side of a pair is checked against the inherited other side.
- **FR-023**: The built-in `brand.json` MUST ship a multi-category non-color override that demonstrates the broader theming surface: a `radius` override (distinct corner rounding) plus a `typography` override (a font weight or font family). `light.json` and `dark.json` remain color-only. This gives FR-014's THEMING.md example a real, shipped theme to reference.

**Documentation (US3)**

- **FR-013**: THEMING.md MUST gain an "Extending the schema" section that walks the full pipeline — adding a source file, updating the schema, updating the themes, regenerating, and verifying the result in all four outputs — using the motion category as the worked example.
- **FR-014**: THEMING.md MUST gain an "Overriding non-color tokens" subsection that demonstrates a brand theme overriding a non-color category and explains the inherit-on-omit behavior.
- **FR-022**: THEMING.md MUST make the two distinct meanings of "theme" crystal clear, with a complete worked example of each. A **token-source override** is a DTCG file (`$value`/`$type`) under `packages/tokens/themes/`, consumed by the Style Dictionary build to bake a static `[data-theme]` CSS file. A **runtime theme document** is the flat `{ name, displayName, tokens }` shape passed to `registerTheme` / `validateTheme`, validated and injected as a `<style>` block at runtime. The section MUST name which pipeline each serves and state plainly that a reader should never have to guess which format a given file or function expects.

**Drift-killing optional tokens (US4)**

- **FR-017**: The schema MUST add a `ring` category with a `width` key as an optional token, with a canonical default equal to what the hardcoded `ring-3` usages resolve to (3px). Themes MAY override it; omitting it inherits the default.
- **FR-018**: The schema MUST add a `z-index` layering scale as optional tokens, with named stops covering the overlay and portal layers currently hardcoded to `z-50` (dialog/overlay, popover/select, tooltip). The stops MUST be ordered so a tooltip sits above a dialog, giving nested overlays a defined stacking order.
- **FR-019**: The drift-killing tokens (FR-017, FR-018) MUST be optional rather than required: a theme that omits them inherits the canonical defaults and existing themes do not break. They are the first in-repo consumers of the US2 inherit-on-omit mechanism.
- **FR-020**: This spec only INTRODUCES the drift-killing tokens in the tokens package. Replacing the hardcoded `ring-3` and `z-50` usages in component source, and the overlay-stacking fix that comes with it, are deferred to spec 010 alongside the motion-transition retrofit.

**Release**

- **FR-015**: The release MUST bump `@unbranded-ds/tokens` minor to 0.4.0 and `@unbranded-ds/react` patch (a dependency-range bump to `^0.4.0` so react consumers receive the new tokens through the re-exported preset; no react source changes). The changeset entry MUST announce the breaking change to consumer themes (the newly required tokens).
- **FR-016**: Validation error output MUST stay structured (a result shape carrying a code, a path, and a message per issue), consistent with the existing failure-mode pattern. Human-readable messages layer on top of the structured payload, never in place of it.

### Key Entities _(include if feature involves data)_

- **Token category**: A named group of related tokens (color, spacing, typography, radius, shadow, opacity, and the new motion). Each category defines a fixed set of token names known to the build at compile time. This spec adds one category (motion) and three keys to an existing category (typography).
- **Motion token**: A duration or an easing value. Durations express how long a transition runs; easings express its acceleration curve. Three of each, named by role rather than by raw value.
- **Token-source override**: A DTCG file (`$value`/`$type`) under `packages/tokens/themes/`, consumed by the Style Dictionary build and merged over the default token sources to bake a static `[data-theme]` CSS file. The built-in `light`/`dark`/`brand` themes are this kind. After this spec it may carry any category, not only color.
- **Runtime theme document**: The flat `{ name, displayName, tokens }` shape passed to `registerTheme` / `validateTheme`, validated (schema plus WCAG AA contrast on the resolved result) and injected as a `<style>` block at runtime. After this spec it may override any subset of any category; omitted tokens inherit the canonical defaults, and validation runs against the merged result.
- **Canonical default layer**: The source token definitions plus built-in themes that together provide a complete value for every required token. Partial consumer themes inherit from this layer; it must itself be complete.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: A consumer can style a component with serif type, a motion duration, a motion easing, and a `2xl` or `3xl` type size using only canonical token names, with no project-local token definitions.
- **SC-002**: All three built-in themes produce correct resolved build output under the expanded schema (they are build-time DTCG sources, not `validateTheme` inputs).
- **SC-003**: A theme that overrides only color plus one non-color category validates and produces a working CSS variable set in which the non-color override takes effect and every untouched token resolves to its canonical default.
- **SC-004**: A contributor who has never touched the token pipeline can add a brand-new token category from scratch by following the THEMING.md walkthrough and see the new tokens in all four generated artifacts.
- **SC-005**: A theme that is missing a required token with no inheritable default produces a structured, path-named validation error.
- **SC-006**: The palette lookup in the token-query MCP returns resolved values for any category the active theme carries, replacing the prior `unknown-category` response — with no change to MCP code.
- **SC-007**: The release ships with a changeset that announces the breaking change, and the new version is published.
- **SC-008**: A theme can override the ring width and a z-index stop, and a theme that omits both inherits the canonical defaults, all without any component file changing.
- **SC-009**: THEMING.md distinguishes a token-source override from a runtime theme document, with a complete worked example of each, so a contributor can tell which format a given file or API expects without reading source.

## Assumptions

- **Version target is 0.4.0, not 0.2.0.** The brief predates the spec 005/006/007 releases; both `@unbranded-ds/tokens` and `@unbranded-ds/react` are already published at 0.3.0. "Next minor bump" therefore resolves to 0.4.0. Adding required tokens is a breaking change to consumer themes, which pre-1.0 is communicated by a minor bump. `@unbranded-ds/react` takes a coordinated patch bump to repoint its tokens dependency at the new minor (see FR-015).
- **`brand.json` ships a multi-category non-color override; `light.json` and `dark.json` stay color-only.** Confirmed in the clarify session: `brand.json` overrides `radius` and a `typography` token (weight or font) to demonstrate the broader theming surface in a shipped built-in theme, giving FR-014's example real material to reference.
- **Motion tokens use the DTCG-standard types** (a duration type for durations, a cubic-bezier type for easings) in the source files, consistent with how the existing categories are authored.
- **Display-tier sizes stay out of scope.** Only `2xl` and `3xl` land now; `display-*` waits for a component contract that needs them.
- **The drift-killing tokens are optional; the for-coleman additions are required.** Spec 008 ships two tiers on purpose. The for-coleman set (font-serif, motion, 2xl/3xl) is required and breaking, which is what bumps the version. The ring width and z-index scale are optional and non-breaking. This is the "few required, generous optional" discipline: optional tokens are cheap to add once the US2 inherit-on-omit path exists.
- **Section XI of the constitution is now ratified** (the brief was written before ratification). Its prose and failure-mode rules apply formally to this spec: THEMING.md additions pass through the humanizer skill before merge, prose avoids the three-item-list tic, and validator errors stay structured. No components are added, so the per-component sidecar rule does not apply here.
- **The token-query MCP needs no code change.** Its palette lookup already reads the in-memory token map; once theme data carries the new categories, it resolves them automatically.

## Dependencies

- **Spec 003 (versioning workflow)** — the changeset tooling handles the multi-package bump and the breaking-change changelog entry.
- **The existing Style Dictionary build** — the new motion category and typography keys flow through the same four-artifact pipeline already in place.
- **The existing theme validation** — extended here to merge partial overrides on top of defaults rather than requiring every category to be present.

## Out of Scope

- **Display-tier type sizes** (`display-sm`, `display`, `display-lg`, `display-xl`) — deferred until a component contract requires them.
- **Density / touch-target tokens** (for-coleman item B.4) — deferred indefinitely.
- **Migrating consumer themes outside this repo** — that is the consumer's migration cost, announced by the version bump.
- **Theme composition** (multi-axis themes like `data-theme="vaporwave compact"`) — deferred to spec 012.
- **First-class theme-extension tokens** (TypeScript types and MCP visibility for tokens declared in a theme JSON but absent from the schema) — deferred to spec 012.
- **The spec 010 retrofit** that swaps primitive transitions onto these motion tokens — this spec only introduces the tokens; the retrofit consumes them later.
- **Letter-spacing / tracking and border-width tokens.** Deferred until a consumer needs them, following the "add a category when a consumer hits the wall" policy. The drift evidence isn't there yet; border widths are barely used explicitly in components today.
- **The component retrofit for the drift-killing tokens.** Swapping the hardcoded `ring-3` (14 usages) and `z-50` (6 usages) onto the FR-017 and FR-018 tokens, plus the overlay-stacking fix, is deferred to spec 010. This spec adds no component changes.
