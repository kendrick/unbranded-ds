# Spec 016 — Color-scheme axis split

**Target version:** minor across `@unbranded-ds/tokens` and `@unbranded-ds/react` (additive axis, with a compat path for the current attribute)
**Depends on:** 009 (multi-axis theming), 011 (theme controls and the deferred seam), 014 (resolution unification)
**Blocks:** a clean vaporwave-light / vaporwave-dark story, and any future aesthetic identity that needs both color schemes
**Status:** brief (not yet specified)

> Captured on 2026-06-15 while clarifying spec 015 (the Next.js example app). Building the example surfaced that "vaporwave + dark" is not expressible today, which is the color-scheme split spec 011 deferred. Recorded here so the work is real rather than a comment in another spec.

## Motivation

The aesthetic axis (`data-theme`) currently holds `light`, `dark`, `brand`, and `vaporwave` as mutually exclusive values. That conflates two independent concerns:

- Color scheme: light versus dark, with `system` resolving against the OS.
- Aesthetic identity: the default look versus `brand` versus `vaporwave`.

Because they share one axis, a consumer cannot say "the vaporwave identity, in dark." They get vaporwave (which ships a single baked palette) or dark, never both. The `system` value is the tell: it is a color-scheme intent that resolves to light or dark, sitting on an axis that is otherwise about identity. Spec 011 named this and left an additive seam; this is the spec that uses it.

## The target model

Color scheme becomes its own axis, composed with aesthetic identity and density:

- A color-scheme axis with `light`, `dark`, and the `system` intent.
- The aesthetic axis narrows to identity only: `default`, `brand`, `vaporwave`, and future identities.
- The three axes compose through the cascade, so `vaporwave` + `dark` + `compact` all apply together, the same way density refines an aesthetic base today.

`useTheme` is already axis-agnostic (it keys over the axis set), so adding an axis is the additive change spec 011 designed for. The headline consumer win is that `ThemeToggle` finally drives a real color-scheme axis instead of a light/dark subset of the identity axis, and an identity control can sit beside it.

## What it touches

- Token sources: each aesthetic identity needs a light and a dark variant, so `vaporwave` (one palette today) has to decompose into both. Restructure `themes/<axis>/` accordingly.
- Resolution and cascade (the spec-014 resolver, the `@layer` order) so three axes compose deterministically and color-scheme sits at the right precedence.
- The runtime: `AXIS_ATTRIBUTE` gains the color-scheme attribute, the bootstrap writes it before paint, and the registry learns the new axis.
- The react surface: `ThemeToggle` re-points to the color-scheme axis; an aesthetic-identity control may be added. `DensityToggle` is unaffected (it is already its own axis).
- Storage and bootstrap keys, plus a migration story for the current `unbranded-ds-theme` value that holds light/dark today.

## Open questions for the spec

- Does color-scheme take a new attribute (for example `data-color-scheme`) while `data-theme` becomes identity, or does `data-theme` keep holding light/dark for backward compatibility while identity moves to a new attribute? The choice drives the consumer migration.
- How do existing single-palette identities (`vaporwave`, `brand`) split into light and dark without a visual regression? Some may need design work, not just a mechanical split.
- What compat window do shipped consumers get? A codemod plus a deprecation period, in the style of spec 013's jscodeshift renames, is the likely shape.
- How does the next-themes vocabulary alignment read once color-scheme is the axis most users think of as "the theme"?

## Scope guardrails

- This is a theming-system change, not an example-app change. Spec 015 only signposts it.
- Backward compatibility for current `data-theme` light/dark consumers is in scope; a hard break is not.
- New aesthetic identities beyond what exists today are out of scope; this spec splits the axis, it does not expand the palette set.

## Constitution check

- Section XI legibility: the axis model and the migration are exactly the kind of thing agents reason about, so the docs, sidecars, and the next-themes mapping must stay crystal clear for both audiences.
- A humanizer pass on this brief and all downstream prose is owed before merge.

## References

- Spec 011 — theme controls, where the color-scheme split was deferred with an additive seam
- Spec 009 — multi-axis theming (the aesthetic and density axes)
- Spec 014 — resolution unification (the resolver this would extend)
- Spec 015 — the example app whose clarification surfaced this
