# Quickstart: API and vocabulary harmonization

How to implement and verify spec 013. Discovery-gated: the audit runs first, and no rename starts before it is reviewed.

## Prerequisites

- Branch `013-api-vocabulary-harmonization` off `main`
- Baseline green: `pnpm --filter @unbranded-ds/react test && pnpm typecheck`
- Read the spec's Clarifications: shadcn/Base UI compat is non-negotiable; upstream names win; only our own drift is in scope.

## Order of work

### 1. The audit (the gate — do this first, no renames yet)

Produce `specs/013-api-vocabulary-harmonization/audit.md` per `contracts/audit-format.md`: every component, each flagged drift with its canonical (upstream-default) name, blast radius, codemod feasibility, and disposition. Mark compliant components compliant. **Get it reviewed and approved before touching a component.** Grounding says expect broad compliance and a short tail (the polymorphic `as`, plus anything the audit surfaces). Run the audit prose through the humanizer.

### 2. The renames (parallel, per-component, only after approval)

For each approved `flagged` entry, in the component's own change:

- rename the prop/slot to the canonical name;
- add the deprecation alias (old name accepted, warns via `warn()`) unless the disposition is hard-break;
- update the sidecar, TSDoc, stories, and tests in the SAME change (no stale references);
- write the codemod (mechanical) or the documented manual step.

Disjoint component files, so the tail runs in parallel.

### 3. Structured failures

Route any prose-only warning/throw the audit flagged through `warn()`'s `{ code, path, message }`.

### 4. Migration + governance

- Migration note in the changeset and CHANGELOG: every rename old→new, with the codemod command for the mechanical ones.
- Amend Constitution Section XI.2 to be compat-first (minor bump); update the Sync Impact Report.
- `pnpm changeset` → `@unbranded-ds/react` minor.

### 5. Verify

```bash
pnpm --filter @unbranded-ds/react test          # renamed components green (unit + interaction + a11y)
pnpm typecheck
pnpm --filter @unbranded-ds/react lint
pnpm --filter @unbranded-ds/storybook build && pnpm --filter @unbranded-ds/storybook test:storybook
# the deprecation path: old name still works and warns; the codemods transform a sample snippet
# grep for stale names: no in-repo doc/story/test references a renamed old name
```

## Watch-outs

- **The audit is the gate.** No rename before it is reviewed. Every rename traces to an approved entry.
- **Upstream names win.** Default canonical names to shadcn/Base UI; never rename a prop/slot we inherit unchanged from upstream. Public slots already follow shadcn (`Content`) — leave them; Base UI's `Popup`/`Positioner` are internal, not public slots.
- **Lockstep docs.** A rename that ships without its sidecar/TSDoc update violates XI.3 and FR-007.
- **Names, not semantics.** A rename must not change behavior beyond the name.
- **The XI.2 amendment ships in this PR**, with its rationale (the compat-first reframe). It is the lasting change here.
