<!--
SYNC IMPACT REPORT
==================
Version change:  1.3.0 → 1.4.0  [MINOR — Section III three-axis split; Section IV component-set refresh]
Bump rationale:  Spec 016 splits the conflated aesthetic axis into two composable
                 axes: a color-scheme axis (`data-color-scheme`, light/dark, plus a
                 `system` intent resolved from the OS) and a theme/identity axis
                 (`data-theme`, the former `aesthetic` axis renamed), joining the
                 existing density axis under the layer order `@layer ds-color-scheme,
                 ds-theme, ds-density;`. The axis rename is an internal vocabulary
                 change with no external consumers (clean break); Section III's
                 theming principle is expanded and re-grounded, not removed or
                 redefined incompatibly, so the bump is MINOR rather than MAJOR.
                 Section IV's frozen "v0.1 nine" list was stale (it predated specs
                 004 and 011) and is refreshed to the shipped set, now naming
                 ColorSchemeToggle and the identity ThemeToggle.

Modified principles:
  - Section III (Theming contract): three orthogonal axes instead of two. Adds the
    color-scheme axis (`data-color-scheme`, light/dark + a `system` intent), renames
    the `aesthetic` axis to `theme` (`data-theme`, identity only), and sets the layer
    order `@layer ds-color-scheme, ds-theme, ds-density;` — later layer wins, so an
    identity overrides the color-scheme base and density overrides both. The flash-free
    bootstrap now reads per-axis keys and sets all three attributes. "Light and dark are
    themes like any other" is replaced: they are the color-scheme axis, composed with the
    identity rather than conflated into it.
  - Section IV (component set): the frozen v0.1 nine is refreshed to the 17 shipped
    components, and the "tenth component requires a spec" clause is generalized.

Added sections:       N/A.
Removed sections:     N/A.

Templates audited:
  ✅ .specify/templates/plan-template.md   — No change required.
  ✅ .specify/templates/spec-template.md   — No change required.
  ✅ .specify/templates/tasks-template.md  — No change required.

Prior amendments:
  - 1.3.0 (2026-06-12): Reframed Section XI.2's API-shape vocabulary as
    compatibility-first: where a component wraps shadcn/ui or Base UI, its public
    prop and slot names follow the upstream convention, and the shared vocabulary
    governs only introduced props/slots. Encoded the polymorphic-by-lineage rule
    (asChild / render / as) and folded `intent` into `variant`. Per spec 013.
  - 1.2.0 (2026-06-12): Expanded Section III with the per-axis theme composition
    API and theme-extension tokens. Per spec 009.
  - 1.1.1 (2026-05-16): Extended Section VIII's MCP entry with
    `@modelcontextprotocol/sdk` as the runtime for local stdio MCP servers.
    Per spec 005.
  - 1.1.0 (2026-05-16): Added Section XI (Agent and human legibility are
    co-equal). Per spec 005.
  - 1.0.2 (2026-05-16): Added SSR safety to Section IX Definition of Done as
    bullet 6. Per spec 004.
  - 1.0.1 (2026-05-16): Adopted `@changesets/cli` in Section VIII and extended
    Section X Compliance Review with the per-PR changeset-presence rule. Per
    spec 003.
  - 1.0.0 (2026-04-10): Initial ratification from template. Section X renamed
    from "Amendment" → "Governance" and expanded with versioning policy and
    compliance review.

Deferred TODOs:
  - Spec 005 partial — US1 (sidecar foundation: AGENTS.md + template + CI
    validator) and US4 (token-query MCP, 4 tools, shared runtime) shipped
    in this branch. US2 (14 per-component sidecar retrofits) deferred to
    a follow-up spec (working name: 006-sidecar-retrofit). US3 (autodoc
    audit across 4 prose surfaces × 14 components) deferred to a follow-up
    spec (007-autodoc-audit). Both follow-ups depend on this branch's
    sidecar template + compile validator being on main.
  - The sidecar *.usage.md convention referenced in XI.3 has its template
    and CI validator on this branch. Per-component retrofits land in
    spec 006; the deferred entry closes when all 14 sidecars have shipped.
  - TODO(RATIFICATION_DATE): still unset from 1.0.0.
-->

# Constitution

A minimal, themable, token-driven design system built on shadcn/ui (Base UI variant), distributed as a slim pnpm monorepo, documented and tested in Storybook 10.3+, and consumable by AI agents via the Storybook MCP server published through Chromatic.

This constitution defines the non-negotiable principles. Specs, plans, and tasks must conform to it. When a spec conflicts with the constitution, the constitution wins and the spec must be revised.

---

## I. Repository shape

The repository is a pnpm + Turborepo monorepo with three packages and no more until justified in writing:

- `packages/tokens` — design tokens, build pipeline, and emitted artifacts (CSS variables, Tailwind preset, TypeScript types, JSON). Zero runtime dependencies on React or any component code.
- `packages/react` — the component library. Depends on `@unbranded-ds/tokens`. Built with `tsup`. Ships ESM only. Marks `react`, `react-dom`, and `@base-ui-components/react` as peer dependencies.
- `apps/storybook` — the Storybook 10.3+ application, built on `@storybook/react-vite`. Depends on `@unbranded-ds/tokens` and `@unbranded-ds/react`. This is the deliverable surface for humans (docs, manual QA) and agents (MCP introspection).

A new package requires a written justification in the spec that names the consumer and explains why an existing package cannot serve.

---

## II. Tokens are independent of components

Tokens are authored in W3C Design Tokens Community Group format (`$value` / `$type`) and compiled with Style Dictionary into four artifacts, all published from `@unbranded-ds/tokens`:

1. CSS custom properties, scoped under `[data-theme="<n>"]` selectors.
2. A Tailwind preset that maps utility names to those CSS variables (never to hardcoded values).
3. TypeScript types and a typed token map for programmatic access.
4. Raw JSON, for downstream consumers (Figma sync, native, marketing sites, agents).

The tokens package must build and publish without any React, Storybook, or Base UI code in its dependency graph. A consumer who only wants tokens must be able to install `@unbranded-ds/tokens` alone and get value from it.

---

## III. Theming contract: schema locked, values float

Theming supports runtime JSON themes. The contract is:

- **The canonical token schema is locked at build time.** The set of canonical token _names_ (e.g. `color.primary`, `radius.md`, `spacing.4`) is fixed by `@unbranded-ds/tokens` and known to Tailwind at compile time. Components and utilities reference these names only. A theme may also declare a **theme-extension token** the schema does not: a per-theme primitive the canonical set has no reason to generalize, such as vaporwave's `shadow.neon`. These are a documented escape hatch outside the locked schema. They emit as CSS variables, and the bundled themes' extensions carry a typed `source: 'theme-extension'` discriminator in the token map and the token-query MCP. The lock binds the canonical set; it does not forbid extension tokens.
- **Token values float at runtime.** A theme is a JSON document that supplies values for the locked schema. Themes are loaded by setting an axis attribute on a root element and injecting the corresponding CSS variables. Themes compose across three orthogonal axes, one theme per axis: a **color-scheme** axis applied via `data-color-scheme` (light or dark, the base the others refine), a **theme** axis applied via `data-theme` (the aesthetic identity — palette, type, shadows; this was the `aesthetic` axis before spec 016), and a **density** axis applied via `data-density` (spacing, line-height). The page resolves to the union of the active axes; on a token collision the later cascade layer wins, enforced by `@layer ds-color-scheme, ds-theme, ds-density;` rather than any runtime merge — an identity overrides the color-scheme base, and density overrides both. `system` is a color-scheme intent, not a stored concrete value: it resolves to light or dark from the OS before paint. Multiple themes may still coexist on the page via nested scopes; per-axis composition is the orthogonal mechanism for combining axes at one scope.
- **Themes are validated.** `@unbranded-ds/tokens` exports a Zod schema for theme files and a validation function that checks (a) schema conformance, (b) WCAG AA contrast for foreground/background pairs declared as such in the schema. Invalid themes fail loudly, never silently.
- **First paint must not flash.** The Storybook app and any consuming app must apply the active axes before first paint via a blocking inline script that reads the per-axis keys from storage (resolving the color-scheme `system` intent against the OS) and sets `data-color-scheme`, `data-theme`, and `data-density`, plus an inline `<style>` of CSS variables.

Light and dark are the color-scheme axis, composed with the aesthetic identity rather than conflated into it. Multi-brand and multi-tenant are the identity axis applied more times. There is no second theming system.

---

## IV. Components: shadcn/ui Base UI variant, thin and unopinionated

Components are sourced from the Base UI flavor of shadcn/ui (the port that uses `@base-ui-components/react` primitives in place of Radix). Rules:

- Components are copied into `packages/react/src/components/` and owned by this repository. They are not consumed as a runtime dependency from upstream shadcn.
- Components must style themselves exclusively through Tailwind utilities that resolve to tokens. No hardcoded colors, radii, spacing, font sizes, or shadows. A lint rule enforces this.
- Components accept a `className` prop merged via `cn()` and must not break when consumers override styles.
- Components do not import from `@unbranded-ds/tokens` directly at runtime. They consume tokens through the Tailwind preset and CSS variables.
- The component set grows only by spec. As of spec 016 it is Button, Card, Checkbox, ColorSchemeToggle, DensityToggle, Dialog, Input, Label, SegmentedControl, Select, SkipLink, Slider, Switch, Tabs, ThemeToggle, Tooltip, and VisuallyHidden — the original v0.1 nine, the primitives added by spec 004, and the theming controls from specs 011 and 016 (which split the old color/identity toggle into `ColorSchemeToggle` for light/dark/system and `ThemeToggle` for the aesthetic identity). Adding another component still requires a spec.

---

## V. Stories are the source of truth

Every component has a `*.stories.tsx` file in `packages/react/src/components/<Component>/`. Stories are co-located with components, not in a separate directory. Each component must ship:

- A `Default` story.
- One story per meaningful variant or state (sizes, intents, disabled, loading, error, open, etc.).
- At least one `play` function that exercises the primary interaction (click, type, open, select, toggle).
- Autodocs enabled, with `argTypes` and descriptions sufficient for an agent to understand the component without reading source.

Stories are the contract surface for: documentation, manual QA, interaction tests, accessibility tests, and MCP introspection. If a behavior is not exercised in a story, it is not considered shipped.

---

## VI. Testing: three layers, all visible in Storybook where possible

Three test layers are required. Visual regression is explicitly out of scope for v1.

1. **Unit tests** (Vitest, in `packages/react`) for pure functions, variants logic (`cva`), and any non-component utilities. Run in CI. Not visible in Storybook UI.
2. **Interaction tests** via Storybook `play` functions, executed by the Storybook Test addon (Vitest-powered) in dev and by the Storybook test-runner in CI. Visible in the Storybook UI under the Tests panel during development.
3. **Accessibility tests** via `@storybook/addon-a11y`, with the test-runner integration configured to fail CI on any axe violation of `serious` or `critical` impact. Visible in the Storybook UI under the Accessibility panel during development.

A component is not done until all three layers pass. CI must run all three on every pull request and block merge on failure.

---

## VII. Deployment and the MCP surface

Storybook deploys to **Chromatic** on every push to `main` and gets a unique build URL on every pull request. Chromatic is used as a Storybook publishing host only — visual regression is **disabled** for v0.1 and must not be enabled without amending this constitution. The deployment must:

- Publish the built Storybook to a stable Chromatic project URL.
- Publish the Storybook MCP server alongside the Storybook build using Chromatic's first-party MCP publishing feature.
- Post per-PR build links as a GitHub check.
- Document the MCP connection string in the repository README, including the exact configuration block a user pastes into their MCP client (Claude Code, Claude Desktop, Cursor).

The MCP surface is a first-class deliverable, not an afterthought. A release that breaks MCP introspection is a broken release. The MCP endpoint must be smoke-tested in CI after publish: a `tools/list` call against the published endpoint must return the expected tool set, or the release fails.

The Storybook is public by default. Authentication on the published Storybook is a paid Chromatic feature and is out of scope for v0.1; if a future client engagement requires private hosting, that triggers a constitution amendment.

---

## VIII. Tooling baseline

Non-negotiable toolchain choices, locked to keep specs from re-litigating them:

- Package manager: **pnpm** (workspaces).
- Task runner: **Turborepo**.
- Language: **TypeScript**, strict mode, no `any` (EVER).
- Component bundler: **tsup**, ESM only.
- Token pipeline: **Style Dictionary** v4+.
- Styling: **Tailwind CSS** v4 via the `@unbranded-ds/tokens` preset. No CSS-in-JS, no Sass.
- Class merging: **`clsx` + `tailwind-merge`** exposed as `cn()`.
- Variants: **`class-variance-authority`**.
- Storybook: **Storybook 10.3 or higher**, builder **`@storybook/react-vite`** (Vite-only — required by `@storybook/addon-mcp`).
- Testing: **Vitest** (unit), **Storybook Test addon** (interaction), **`@storybook/addon-a11y`** + **test-runner** (a11y).
- MCP: **`@storybook/addon-mcp`** (Storybook MCP, published remotely via Chromatic) and **`@modelcontextprotocol/sdk`** (used to build local stdio MCP servers in this monorepo — first instance: the token-query MCP on `@unbranded-ds/tokens`).
- Linting: **ESLint** (flat config) + **Prettier**. A custom rule forbids hex/rgb/hsl literals in `packages/react/src/components/**`.
- CI: **GitHub Actions**. One workflow, one job graph: install → lint → typecheck → unit → build → storybook build → storybook test-runner (interaction + a11y) → chromatic publish → MCP smoke test.
- Versioning + changelog: **`@changesets/cli`** (workspace dev dependency). Per-PR `.changeset/*.md` files aggregate into per-package CHANGELOG.md entries and version bumps via `pnpm changeset version`. Publish via `changesets/action` GitHub Action.
- Deploy: **Chromatic** (Storybook publishing only, VR disabled).

Substituting any of these requires amending this constitution.

---

## IX. Definition of done for any component

A component PR is mergeable only when all of the following are true:

1. Source lives in `packages/react/src/components/<Component>/` with `index.ts`, `<Component>.tsx`, `<Component>.stories.tsx`, and `<Component>.test.tsx` (if unit tests apply).
2. All styling resolves through tokens. The lint rule passes.
3. Stories cover Default plus all meaningful variants and states.
4. At least one `play` function exists and passes.
5. Axe reports zero `serious` or `critical` violations across all stories for the component.
6. The component renders server-side without accessing `window`, `document`, or other browser-only globals at render time. Browser-API access is deferred to `useEffect` or equivalent post-mount hooks. This preserves SSR compatibility for Next.js, Remix, and other server-rendering consumers.
7. Autodocs render with descriptions for every prop.
8. The component is exported from `packages/react/src/index.ts`.
9. CI is green end to end, including the post-publish MCP smoke test.

---

## X. Governance

**Amendment procedure.** This constitution may be amended only by a pull request that
(a) edits this file, (b) explains the change in the PR description, and (c) updates any
specs and tasks rendered inconsistent by the change. Drift between specs and constitution
is a bug in the spec, not the constitution.

**Versioning policy.** The constitution version follows semantic versioning:

- MAJOR: A principle removed, renamed, or redefined in a backward-incompatible way,
  or the repository shape changed structurally.
- MINOR: A new principle or section added, or existing guidance materially expanded.
- PATCH: Clarifications, wording fixes, typo corrections, or non-semantic refinements.

When the bump type is ambiguous, the author MUST state their reasoning in the PR description
before the version is finalized.

**Compliance review.** Every PR that touches `packages/react/`, `packages/tokens/`, or
`apps/storybook/` MUST include a Constitution Check confirming the change does not violate
any section of this document. The plan template's Constitution Check gate implements this
requirement. Additionally, every PR that touches `packages/react/` or `packages/tokens/`
MUST include at least one `.changeset/*.md` file declaring which packages bump and at what
level (per spec 003's adoption of `@changesets/cli`); the CI check `changeset-check.yml`
enforces this. A PR that cannot pass either check MUST either (a) not be merged, or (b)
trigger a constitution amendment before merge.

---

## XI. Agent and human legibility are co-equal

The design system has two consumers. Humans browse stories and docs. Agents query autodocs, MCP tool output, sidecar files, and structured error responses. Neither audience is primary. The same artifact has to work for both.

This is the principle that separates unbranded-ds from a design system that happens to publish an MCP endpoint.

### XI.1 Prose

Every piece of written content — story descriptions, autodoc strings, README files, sidecar usage docs, error messages — is written for both audiences:

- Prose passes through the `humanizer` skill before merge. The AI tells documented in that skill (em-dash overuse, "serves as" phrasing, promotional vocabulary, hedging, signposting) are removed.
- Lists of exactly three items are restructured. Add a fourth item, drop to two, convert to a sentence, or split into nested bullets. Three-item lists are an LLM tic and read as one to a careful editor. The rule applies to both bulleted lists and inline prose ("X, Y, and Z").
- Prose is specific over generic and active over passive.

### XI.2 API shape

Component APIs are predictable from analogy, and they stay compatible with the upstream libraries they wrap (shadcn/ui and Base UI). Compatibility is the higher rule: where a component wraps an upstream library, its public prop and slot names follow that library's convention, so a consumer or agent who knows shadcn/Base UI predicts ours. The shared vocabulary below governs props and slots the design system introduces, not ones inherited from upstream.

- Compound slots follow the upstream convention the public API uses. Our shadcn-style compounds expose shadcn's public slot names (`Content`, `Trigger`, `Item`, and so on), built on Base UI's internal anatomy (`Popup`, `Positioner`), which stays internal. A compound that follows neither upstream uses the generic `*.Root` / `*.Trigger` / `*.Content` / `*.Item` pattern consistently.
- Variant axes use shadcn's vocabulary: `variant` (with shadcn's flat value set, where a semantic treatment like `destructive` is a variant value) and `size`. There is no separate `intent` prop, and no bespoke synonyms (`tone`, `appearance`, `kind`).
- Polymorphic rendering follows lineage, because the upstream idioms differ and solve different problems. A shadcn-style Slot trigger uses `asChild`; a Base-UI-backed component uses `render`; a leaf element-swap primitive the design system owns uses `as`. These are distinct mechanisms, not synonyms, so they are documented rather than collapsed into one prop.

An agent who has read one component, and knows shadcn/Base UI, should be able to guess the prop surface of the next one and be right.

### XI.3 Documentation surfaces

The design system publishes two complementary documentation surfaces for agent consumption:

- The Storybook MCP server, published via Chromatic, is the live remote source (see Section VII).
- A planned token-query MCP exposes theme listing, palette, contrast math, and semantic token lookup. This is a distinct contract from the Storybook MCP and is planned before 1.0.
- Per-component sidecar usage docs live at `packages/react/src/components/<Component>/<Component>.usage.md`. They mirror the MCP's component guidance: import path, prop table, common patterns, accessibility notes, examples. An agent or human with a local clone can answer "how do I use Button" with no network connection.
- A top-level `AGENTS.md` indexes the sidecar docs and names the MCP endpoints. It is a peer document to `README.md`, not a footnote.

Local sidecar docs are not a fallback for the MCP. They are the canonical record an agent pattern-matches against offline. The MCP is the live, queryable view of the same content.

### XI.4 Failure modes

Validation failures produce structured output, not only prose:

- `validateTheme()` returns a typed `{ ok, issues }` shape with codes and paths. This is the existing pattern (Section III) and the model for any future validator.
- A missing token, a broken contrast pair, a failing theme validation, a malformed sidecar doc all surface with codes an agent can pattern-match.

Human-readable error messages are layered on top of the structured payload, not in place of it.

### XI.5 Story coverage as dual-audience contract

The rule from Section V — "if a behavior is not exercised in a story, it is not considered shipped" — sharpens here. A behavior with no story is invisible to humans browsing the deployed Storybook and invisible to agents introspecting the MCP. Both failure modes count, and either alone is enough to block merge.

---

**Version**: 1.4.0 | **Ratified**: TODO(RATIFICATION_DATE): set to original adoption date | **Last Amended**: 2026-06-16
