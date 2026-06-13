# Specification Quality Checklist: API and vocabulary harmonization

**Purpose**: Validate specification completeness and quality before proceeding to planning
**Created**: 2026-06-12
**Feature**: [spec.md](../spec.md)

## Content Quality

- [X] No implementation details (languages, frameworks, APIs)
- [X] Focused on user value and business needs
- [X] Written for non-technical stakeholders
- [X] All mandatory sections completed

## Requirement Completeness

- [X] No [NEEDS CLARIFICATION] markers remain
- [X] Requirements are testable and unambiguous
- [X] Success criteria are measurable
- [X] Success criteria are technology-agnostic (no implementation details)
- [X] All acceptance scenarios are defined
- [X] Edge cases are identified
- [X] Scope is clearly bounded
- [X] Dependencies and assumptions identified

## Feature Readiness

- [X] All functional requirements have clear acceptance criteria
- [X] User scenarios cover primary flows
- [X] Feature meets measurable outcomes defined in Success Criteria
- [X] No implementation details leak into specification

## Notes

- **Clarify session 2026-06-12 resolved seven decisions under one non-negotiable constraint: shadcn/ui + Base UI compatibility.** Upstream conventions win conflicts with XI.2 (and this spec amends XI.2 to be compat-first); slots match Base UI's anatomy; polymorphism unifies on `render`; the rename scope is only the design system's own drift; deprecation uses a window. Two questions (folding `intent`, flattening `variant`) turned out **moot**: a clarify-time audit preview found the components already on shadcn's flat `variant`/`size`, with no `intent`/`tone`/`appearance` prop. The richer 2D variant model is parked on the ROADMAP. The net effect: 013 shrinks to the `as`→`render` unification, slot alignment to Base UI, structured failures, and the XI.2 amendment, with the prop-vocabulary renames likely empty pending the formal audit.
- **The exact rename list is deliberately not in the spec.** This is a discovery-first spec: US1 (the audit) is the gating P1 deliverable that produces the bounded per-component list, and every rename FR is scoped to "every entry the audit flags" rather than a hard-coded set. That is the brief's central discipline ("no rename starts before the list is reviewed"), not an omission.
- **The spec names concrete vocabulary** (`variant`/`size`/`intent`/`disabled`, the `*.Root`/`*.Trigger`/`*.Content`/`*.Item` slots, the `as`/`render` props, the `{ code, path, message }` shape). These are the existing API surface and Constitution Section XI.2's canonical set, not implementation choices being made here.
- **Forced to spec number 013** (not the sequential 011) to match the brief and keep 011 (theme-toggle) and 012 (example-app) reserved for those queued briefs. Done out of numeric order, after 014, per the post-009 ranking.
- **This is the breaking half of the constitution retrofit** (Part B). Part A (token consumption, non-breaking) shipped as spec 010. The split keeps the breaking API redesign in its own release.
