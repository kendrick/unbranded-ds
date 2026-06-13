# Research: API and vocabulary harmonization

**Phase 0 output** | **Date**: 2026-06-12 | Grounded against `packages/react` and the clarify session.

## D1 — Compatibility is the canonical authority; XI.2 is amended to say so

**Decision**: A component's prop/slot names mirror the upstream library its public API follows (shadcn/ui, on Base UI internals). The XI.2 shared vocabulary governs only props/slots the design system introduces. Section XI.2 is amended to be compat-first (a minor bump).

**Rationale**: The non-negotiable constraint is that a consumer or agent who knows shadcn/Base UI can predict our API. That only holds if our names track upstream. XI.2 as originally written prescribed a bespoke vocabulary, which conflicts with upstream in two places (a separate `intent` prop shadcn does not have; generic `Content` vs Base UI's `Popup`). The amendment resolves the conflict in upstream's favor and makes the constitution match the practice.

**Alternatives**: keep XI.2 as written and override case-by-case (rejected — leaves the constitution inconsistent with reality); rename to XI.2's bespoke names (rejected by the constraint).

## D2 — The three rename categories are near-empty (grounding)

**Decision**: The plan does not assume a large rename. The audit (US1) confirms compliance and surfaces a short tail.

**Findings**:

- **Prop vocabulary**: Button already uses shadcn's flat `variant` set (`default | destructive | outline | secondary | ghost | link`) and `size`; Tabs uses `variant`; SegmentedControl uses `variant`/`size`. No `intent`/`tone`/`appearance` prop exists. The "bespoke synonym" class the brief assumed is not present.
- **Slots**: the compounds expose shadcn's public slot names (`Dialog.Content`, etc.), built on Base UI's internal `Popup`/`Positioner`/`Portal`/`Backdrop`. They already follow the shadcn convention.
- **Polymorphic**: only Tooltip declares its own `as`; the Base-UI-backed components inherit Base UI's `render` by passthrough. The `as`→`render` rename is a short tail (Tooltip, VisuallyHidden, possibly SkipLink).

**Rationale**: The library was built faithfully to shadcn/Base UI. This is the discovery-first discipline paying off: the bounded list is small, and the spec's value is the audit proving it plus the lasting XI.2 amendment, not a sweeping rename.

## D3 — The slot target is shadcn's public names, not Base UI's raw anatomy

**Decision**: Align public compound slots to shadcn's convention (which they already use). Base UI's `Popup`/`Positioner` stay internal and are never re-exposed as renamed public slots.

**Rationale**: `Dialog.Content` (public, shadcn) wraps Base UI's `Popup` (internal). Renaming the public slot to `Popup` would break shadcn compat and rename a slot we name correctly, contradicting "only our own drift." This corrects the clarify's first reading of Q3 ("match Base UI's anatomy"), which would have been backwards.

**Alternatives**: rename public slots to Base UI's anatomy (rejected — breaks shadcn compat, large unnecessary break).

## D4 — Reuse `warn()` for structured failures and deprecation warnings

**Decision**: The structured-failure pass (US5) and the deprecation warnings both route through the existing `warn()` helper (`lib/warn.ts`, `WarnPayload` = `{ code, path, message }`). No new failure shape.

**Rationale**: XI.4's model already ships. The work is applying it where prose-only warnings/throws remain (the audit flags them), and using it for the deprecation-alias warning, so a deprecation notice is itself machine-parseable.

## D5 — Deprecation window via a prop-alias wrapper

**Decision**: Each renamed prop accepts both the old and new name for one minor. A small per-component alias maps the deprecated prop onto the new one and emits a structured `warn()` payload (code like `deprecated-prop`, path naming the component and old prop). Removed the next minor. The audit recommends a hard break only where a soft landing is impractical.

**Rationale**: Softest for consumers and for the in-repo consumers (stories, sidecars, the future example app). The structured warning lets an agent detect the deprecation programmatically.

**Alternatives**: hard-break every rename (rejected as the default; harsher, though the audit may pick it for a specific rename).

## D6 — Codemods via jscodeshift

**Decision**: Add jscodeshift as a dev dependency; one transform per mechanical rename (a prop or import rename), under a new `codemods/` directory, each tested against a sample consumer snippet.

**Rationale**: jscodeshift is the standard for React prop/import codemods. A mechanical rename (`as`→`render`, a prop synonym) is a clean transform; a non-mechanical change (a semantic shift) gets a documented manual step instead, per the audit's codemod-feasibility call.

**Alternatives**: hand-written find-replace scripts (rejected — fragile on JSX/TS); no codemods (rejected — FR-010 requires them for mechanical renames).
