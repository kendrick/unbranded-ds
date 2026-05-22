# Quickstart: Autodoc legibility audit

How to start working on this spec after reading the plan.

## Prerequisites

1. Branch `007-autodoc-audit` checked out
2. Dependencies installed: `pnpm install`
3. Specs 005 and 006 merged to `main` (already true as of 2026-05-18)

## Workflow per component

Each component is an independent unit of work. For each one:

1. **Read the sidecar** at `packages/react/src/components/<Component>/<Component>.usage.md` — this is the intent reference for the prose you're writing.

2. **Read the source** at `packages/react/src/components/<Component>/<Component>.tsx` — understand the component shape (single vs compound), existing TSDoc (if any), prop interfaces, and exports.

3. **Write component-level TSDoc** on the component function (or aggregating export for compounds) following `contracts/component-tsdoc-template.md`. For compounds, also write shorter per-slot TSDoc on each slot function.

4. **Write per-prop TSDoc** on every property in the exported prop interface(s) following `contracts/prop-tsdoc-template.md`. Apply the WHAT + WHEN bar from FR-003.

5. **Read the stories** at `packages/react/src/components/<Component>/<Component>.stories.tsx`. Remove duplicate `argTypes.description` values that now match TSDoc (FR-008). Add `parameters.docs.description.story` to every named story (FR-009). Remove or keep `meta.parameters.docs.description.component` per FR-007 (keep only if Storybook-specific content is genuinely needed).

6. **Check inbox bullets** — if this component has an assigned bullet from `specs/006-sidecar-retrofit/spec-007-inbox.md`, confirm the TSDoc edit resolves it.

7. **Verify**: run `pnpm typecheck` and `pnpm exec tsx scripts/validate-sidecars.ts` to confirm `@example` blocks compile and types are clean.

## Validator extension

Before or alongside the first component batch, extend `scripts/validate-sidecars.ts` to extract and compile `@example` blocks from `.tsx` source TSDoc. See `research.md` for the implementation approach.

## Verification commands

```bash
pnpm typecheck                              # type-check all packages
pnpm exec tsx scripts/validate-sidecars.ts  # compile-check sidecar + TSDoc examples
pnpm test:unit                              # unit tests
pnpm --filter @unbranded-ds/storybook build # storybook build (catches rendering issues)
```

## Changeset

Each PR ships a changeset:

```bash
pnpm changeset
# select @unbranded-ds/react, patch level
# message: "Audit TSDoc and story descriptions for <component(s)>"
```
