# Data Model: API and vocabulary harmonization

**Phase 1 output** | **Date**: 2026-06-12

No persisted data. The "model" is the audit's structured output and the artifacts each rename produces.

## Entities

### Audit entry

One flagged drift from the shared/upstream vocabulary. The audit is a list of these; the approved list is the exact scope of every rename.

| Field         | Meaning                                                                             |
| ------------- | ----------------------------------------------------------------------------------- |
| `component`   | the component the entry belongs to                                                  |
| `kind`        | `prop` \| `slot` \| `polymorphic` \| `failure`                                      |
| `current`     | the current name (or the prose-only failure site)                                   |
| `canonical`   | the proposed name, defaulting to the upstream (shadcn/Base UI) name                 |
| `blastRadius` | the stories, sidecars, TSDoc blocks, tests, and example-app sites that move with it |
| `codemod`     | `mechanical` (a codemod covers it) \| `manual` (a documented step)                  |
| `disposition` | `deprecate` (window) \| `hard-break`, per the audit's recommendation                |
| `status`      | `compliant` (no change) \| `flagged`                                                |

A component with no drift is recorded `compliant`, not omitted, so the audit is provably complete.

### Rename

A single name change drawn from an approved `flagged` entry: a prop, a slot, or the polymorphic prop. Carries its lockstep doc and test updates, its codemod (if mechanical), and its deprecation alias (if `deprecate`).

### Deprecation alias

The shim that keeps a renamed prop's old name working for one minor. Maps the old prop onto the new one and emits a structured `warn()` payload (`{ code: 'deprecated-prop', path, message }`). Removed the next minor.

### Codemod

A jscodeshift transform under `codemods/`, one per mechanical rename, that rewrites a consumer's old prop/import to the new name. Tested against a sample snippet.

### Structured failure

A `warn()` `{ code, path, message }` payload replacing a prose-only warning or throw the audit flagged (US5), including the deprecation warnings.

## The shared vocabulary (the target names)

- **Variant axes**: `variant` (shadcn's flat value set), `size`. No separate `intent` prop (shadcn folds it into `variant`).
- **Compound slots**: shadcn's public names (`Content`, `Trigger`, `Item`, ...) for shadcn-style compounds; Base UI's `Popup`/`Positioner` stay internal. XI.2's generic pattern only where a compound follows neither upstream.
- **Polymorphic**: Base UI's `render`. `as` is the deprecated alias.

## Rules

- A canonical name MUST default to the upstream name; XI.2's generic name is the fallback only where upstream is silent.
- A prop/slot inherited unchanged from upstream is never renamed (only our own drift is in scope).
- Each rename's sidecar, TSDoc, stories, and tests move in the same change; no in-repo doc or test references a stale name after its rename ships.
- A rename does not change component behavior beyond the name (semantics stay put).

## Invariants after the change

- Every component's variant-axis props and public slot names track shadcn/Base UI; a consumer who knows upstream predicts ours.
- The polymorphic prop is `render` library-wide; `as` works only as the deprecated alias during its window.
- Every flagged prose-only failure emits a structured `{ code, path, message }`.
- Section XI.2 reads compat-first; the constitution matches the practice.
