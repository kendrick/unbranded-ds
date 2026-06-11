# Spec 007 — Autodoc legibility audit

**Target version:** next patch bump after spec 006 (prose-only edits to existing stories and TSDoc; no behavior or API changes)
**Depends on:** 005 (Section XI ratified; the humanizer-pass rule is now binding)
**Blocks:** 010 (the API retrofit may surface from this audit; spec 010 lands the actual refactors)
**Bundles for-coleman items:** none — this is purely an internal quality pass surfaced during spec 005

---

## Motivation

Section XI.1 says every piece of written content passes through the humanizer skill before merge. The 14 currently shipped components were authored before XI.1 was ratified. Their stories and TSDoc comments contain prose that doesn't meet the rule: three-item lists, em-dash overuse, "serves as" phrasing, promotional vocabulary, hedging, signposting. Some prop descriptions explain WHAT a prop does without explaining WHEN a consumer would reach for it (per FR-019 from spec 005).

This spec is a focused, in-place pass on the four prose surfaces that surface in Storybook autodocs and the MCP. Git history is the audit ledger; no parallel audit-log doc.

---

## Scope

### Four prose surfaces per component

Per FR-021a from spec 005:

1. The component-level `description` in `stories.tsx` meta
2. Every prop's `argTypes.description` in `stories.tsx`
3. Every named story's `parameters.docs.description.story`
4. Every TSDoc comment block in the component's `.tsx` source

FR-030 (revised during spec 005's clarify) explicitly permits prose edits to `.tsx` files since they don't change behavior or public API. The constraint that does apply: this spec MUST NOT change component behavior or API. API-shape issues that the audit surfaces (e.g., a prop name that violates Section XI.2's shared vocabulary) get deferred to spec 010.

### The 14 components

Same set as spec 006:

- Button, Card, Checkbox, Dialog, Input, Label, Select, Switch, Tabs (0.1.0)
- VisuallyHidden (0.2.0)
- Tooltip, SkipLink, Slider, SegmentedControl (0.3.0)

### What the audit fixes

For every prose surface:

- Three-item prose enumerations restructured to two, four, or a sentence
- Em-dash overuse replaced with commas, periods, or parentheses
- Promotional vocabulary ("powerful", "seamless", "groundbreaking") removed
- Hedging and signposting ("In order to", "It's important to note that") trimmed
- Copula avoidance ("serves as", "stands as") replaced with `is`/`are`/`has`
- Prop descriptions that only say WHAT updated to also say WHEN — the consumer scenario that warrants reaching for the prop

### PR organization

Up to the implementer. The spec doesn't mandate one-PR-per-component. A single bulk PR works because the audit is mechanical and each change is small. Multiple PRs (one per component, or grouped by category like "primitives" vs "compound") also work.

If multiple PRs, each carries a `.changeset/audit-<scope>.md` declaring `@unbranded-ds/react: patch`.

## Out of scope

- Component API renames (e.g., a prop named `tone` should be `intent` per Section XI.2's shared vocabulary). Defers to spec 010.
- Component behavior changes. Same — defers to spec 010.
- Sidecars themselves. Those are spec 006. The autodoc audit and the sidecar retrofit are independent passes — no merge conflict between them since they touch different files.
- New components, new variants, new tests beyond regression. Strictly a prose pass.

## Acceptance criteria

- Every component's component-level `description` in stories.tsx identifies the consumer scenario the component addresses.
- Every prop's `argTypes.description` explains both WHAT the prop does AND WHEN a consumer would reach for it (per FR-019).
- Every named story's `parameters.docs.description.story` passes humanizer review.
- Every TSDoc comment block in the 14 component `.tsx` source files passes humanizer review.
- No three-item prose lists remain in any of the audited surfaces. (Variant enums with three options like `size: 'sm' | 'md' | 'lg'` are code lists and are exempt.)
- The audit does not change behavior or public API. Component tests still pass. Storybook stories still render.

## Constitution check

Section XI is ratified at this point (spec 005, constitution 1.1.0). The relevant rules:

- XI.1 — prose rules: the entire spec is one big application of these
- XI.5 — story coverage as dual-audience contract: this spec sharpens the existing surface; doesn't add or remove behavior, so the contract stays intact

Section IX bullet 6 (SSR safety) applies: the audit may edit `.tsx` source for TSDoc only. Behavior or rendering changes that compromise SSR are out of scope.

## References

- [specs/005-agent-experience-foundation/spec.md](specs/005-agent-experience-foundation/spec.md) — US3 acceptance scenarios; FR-018 through FR-021a; the revised FR-030 that permits TSDoc edits
- [specs/005-agent-experience-foundation/tasks.md](specs/005-agent-experience-foundation/tasks.md) — T025 through T038 carry the canonical per-component audit task detail
- `humanizer` skill — the canonical reference for which AI tells get caught
- [.specify/memory/constitution.md](.specify/memory/constitution.md) Section XI.1 — the rule being enforced
