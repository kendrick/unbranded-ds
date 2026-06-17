# XI.2 API & vocabulary audit (spec 013, US1)

**Date:** 2026-06-12 · **Status:** for review (the gate; no rename starts until this is approved)

The discovery audit for spec 013, under the non-negotiable constraint that the API stay compatible with shadcn/ui and Base UI. Scope: every component, four drift kinds (prop vocabulary, compound slots, polymorphic prop, prose-only failures). Canonical names default to the upstream name; only the design system's own drift is in scope.

## Headline

The library is **already compliant** on three of the four kinds, because it was built faithfully to shadcn/Base UI:

- **Prop vocabulary**: no bespoke variant-axis synonym anywhere. Components use shadcn's `variant` (flat value set) and `size`. No separate `intent`/`tone`/`appearance` prop exists.
- **Compound slots**: every compound exposes shadcn's public slot names (`Content`, `Trigger`, ...) or Base UI's (`Root`, `Track`, `Thumb`), built on Base UI internals. No public slot drifts.
- **Prose-only failures**: none in component source. The two components that warn (SegmentedControl, Slider) already use the structured `warn()` helper.

The **polymorphic prop** is the only finding, and it is not a rename list; it is a decision the clarify's "unify on `render`" answer cannot survive contact with the code (see below).

## Per-component result

| Component        | Prop vocab                     | Slots                            | Polymorphic             | Failures   | Status                 |
| ---------------- | ------------------------------ | -------------------------------- | ----------------------- | ---------- | ---------------------- |
| Button           | `variant`/`size` ✓             | n/a                              | n/a                     | none ✓     | compliant              |
| Card             | ✓                              | shadcn slots ✓                   | n/a                     | none ✓     | compliant              |
| Checkbox         | ✓                              | Base UI passthrough ✓            | none                    | none ✓     | compliant              |
| Dialog           | ✓                              | shadcn `Content`/`Trigger` ✓     | `render` passthrough    | none ✓     | compliant              |
| Input            | ✓                              | n/a                              | n/a                     | none ✓     | compliant              |
| Label            | ✓                              | n/a                              | n/a                     | none ✓     | compliant              |
| SegmentedControl | `variant`/`size` ✓             | ✓                                | none                    | `warn()` ✓ | compliant              |
| Select           | ✓                              | shadcn `Content`/`Trigger` ✓     | `render` passthrough    | none ✓     | compliant              |
| SkipLink         | ✓                              | n/a                              | none                    | none ✓     | compliant              |
| Slider           | ✓                              | Base UI `Root`/`Track`/`Thumb` ✓ | none                    | `warn()` ✓ | compliant              |
| Switch           | ✓                              | Base UI passthrough ✓            | none                    | none ✓     | compliant              |
| Tabs             | `variant` (`default`/`line`) ✓ | shadcn slots ✓                   | none                    | none ✓     | compliant              |
| Tooltip          | ✓                              | shadcn `Trigger`/`Content` ✓     | **`asChild`** (shadcn)  | none ✓     | compliant; see finding |
| VisuallyHidden   | ✓                              | n/a                              | **`as`** (element-type) | none ✓     | flagged; see finding   |

## The one finding: the polymorphic prop is three distinct mechanisms

The brief and the clarify (Q4: "unify on `render`, deprecate `as`") assumed one polymorphic prop split across `as` and `render`. The code has **three patterns that do different things**:

- **`as`** (VisuallyHidden): polymorphic _element type_; render as a `div` instead of a `span`. A leaf-primitive concern.
- **`asChild`** (Tooltip): the _Slot / merge_ pattern; attach the trigger's behavior to an existing child, no wrapper. This is **shadcn's (Radix's) idiom**, and a shadcn user expects it.
- **`render`** (the Base UI compounds): Base UI's prop, inherited by passthrough. This is **Base UI's idiom**.

They are not interchangeable. You cannot rename `as` to `asChild` (one swaps the element, the other merges onto a child), and renaming Tooltip's `asChild` to `render` would **break shadcn compatibility**; exactly the non-negotiable this spec is built to protect.

So "unify on `render`" is rejected by the compat constraint:

- `asChild` (Tooltip) is shadcn's convention → **keep** (not drift).
- `render` (Base UI compounds) is Base UI's convention → **keep** (not drift).
- `as` (VisuallyHidden) follows neither upstream, because Base UI does not back VisuallyHidden; it is our own primitive. It is the only candidate for "our own drift," and even it is a widely understood React pattern for a leaf element-swap.

## Recommendation

**Zero renames.** Instead:

1. **Document the polymorphic conventions by lineage** (in the constitution amendment and the relevant sidecars): shadcn-style Slot triggers use `asChild`; Base-UI-backed components use `render`; a simple element-swap primitive uses `as`. This is the deliberate "documented split" the clarify offered as the alternative to unification, and the compat constraint forces it.
2. **Decide VisuallyHidden's `as`** (the only genuinely open item): keep `as` (recommended; it is the right mechanism for a leaf element-swap primitive and reads naturally), or align it to the shared rule. There is no upstream to defer to here, so it is a house-style call.
3. **The structured-failure pass, the prop-vocabulary renames, and the slot renames are no-ops**; the audit records them compliant.

The substantive deliverable of spec 013 therefore reduces to: this audit (the compliance record), the **Section XI.2 amendment** (compat-first, which now must also encode the polymorphic-by-lineage rule), and the VisuallyHidden `as` decision.

## Open questions for the review gate

- Accept "zero renames, document the polymorphic split by lineage" over the clarify's "unify on `render`"? (Recommended; "unify on `render`" would break shadcn's `asChild`.)
- VisuallyHidden's `as`: keep, or change? (Recommended: keep.)
