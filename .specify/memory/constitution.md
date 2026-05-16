<!--
SYNC IMPACT REPORT
==================
Version change:  1.0.0 → 1.0.1  [PATCH — clarification to existing tooling and compliance machinery]
Bump rationale:  Adopts `@changesets/cli` as the canonical versioning + changelog tool
                 (Section VIII tool-list addition) and extends Section X Compliance Review
                 with a per-PR changeset-presence rule. Both changes refine existing
                 machinery rather than introducing new principles, so PATCH is the correct
                 level per Section X's versioning policy.

Modified principles:
  - Section VIII (Tooling baseline): added `@changesets/cli` to the locked tool list.
  - Section X (Governance) Compliance Review: extended with a one-sentence rule requiring
    a `.changeset/*.md` file on every PR touching packages/react/ or packages/tokens/.

Added sections:       N/A (both edits extend existing sections).
Removed sections:     N/A.

Templates audited:
  ✅ .specify/templates/plan-template.md   — Constitution Check gate references Section X
                                             compliance review; no template change needed
                                             since the extension is within the same gate.
  ✅ .specify/templates/spec-template.md   — No change required.
  ✅ .specify/templates/tasks-template.md  — No change required.

Prior amendments:
  - 1.0.0 (2026-04-10): Initial ratification from template. Section X renamed from
    "Amendment" → "Governance" and expanded with versioning policy and compliance review.

Deferred TODOs:
  - TODO(RATIFICATION_DATE): Set to the date the team formally adopted this document.
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

- **The token schema is locked at build time.** The set of token _names_ (e.g. `color.primary`, `radius.md`, `spacing.4`) is fixed by `@unbranded-ds/tokens` and known to Tailwind at compile time. Components and utilities reference these names only.
- **Token values float at runtime.** A theme is a JSON document that supplies values for the locked schema. Themes are loaded by setting `data-theme` on a root element and injecting the corresponding CSS variables. Multiple themes may coexist on the page via nested `data-theme` scopes.
- **Themes are validated.** `@unbranded-ds/tokens` exports a Zod schema for theme files and a validation function that checks (a) schema conformance, (b) WCAG AA contrast for foreground/background pairs declared as such in the schema. Invalid themes fail loudly, never silently.
- **First paint must not flash.** The Storybook app and any consuming app must apply the active theme before first paint via a blocking inline script that reads the theme key from storage and sets `data-theme` plus an inline `<style>` of CSS variables.

Light and dark are themes like any other. Multi-brand and multi-tenant are the same mechanism applied more times. There is no second theming system.

---

## IV. Components: shadcn/ui Base UI variant, thin and unopinionated

Components are sourced from the Base UI flavor of shadcn/ui (the port that uses `@base-ui-components/react` primitives in place of Radix). Rules:

- Components are copied into `packages/react/src/components/` and owned by this repository. They are not consumed as a runtime dependency from upstream shadcn.
- Components must style themselves exclusively through Tailwind utilities that resolve to tokens. No hardcoded colors, radii, spacing, font sizes, or shadows. A lint rule enforces this.
- Components accept a `className` prop merged via `cn()` and must not break when consumers override styles.
- Components do not import from `@unbranded-ds/tokens` directly at runtime. They consume tokens through the Tailwind preset and CSS variables.
- The v0.1 component set is fixed: Button, Input, Label, Card, Dialog, Select, Checkbox, Switch, Tabs. Adding a tenth component requires a spec.

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
- MCP: **`@storybook/addon-mcp`**, published remotely via Chromatic.
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
6. Autodocs render with descriptions for every prop.
7. The component is exported from `packages/react/src/index.ts`.
8. CI is green end to end, including the post-publish MCP smoke test.

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

**Version**: 1.0.1 | **Ratified**: TODO(RATIFICATION_DATE): set to original adoption date | **Last Amended**: 2026-05-16
