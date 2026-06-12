# Roadmap

Parked ideas and future directions for unbranded-ds. This is not the queue. Work that's actually next starts as a `tmp/` brief and becomes a numbered `specs/NNN/` spec. Entries here are principle-level sketches of where the system could go, captured so they aren't lost. Treat each as a starting point to revisit, not a design to build as written. The design system will move before any of these land, so these entries stay light on specifics.

## Derived Color Tokens (Themes as Seeds, Not Value Sets)

**Status:** parked. Revisit after specs 008 to 010 ship.

Today a theme hand-writes every color and the validator checks contrast after the fact. This idea flips that: a theme declares a handful of seed colors plus the *relationships* between them, and the system generates the rest. `primary-foreground` derived to stay readable on `primary`, `muted` mixed from `background` and `foreground`, and so on down. Generation happens in OKLCH, the perceptual space the tokens already use, so a brand theme becomes a few seeds and a hue rather than thirty tuned values. Contrast stops being a gate the author has to clear and becomes a guarantee of construction.

The reason to come back to it: an agent could author a theme from a prompt and have the validator prove it correct before it ships, which is exactly what the constitution's agent-and-human-legibility principle points at and what no other design system does today. It gets there by building on the OKLCH and contrast machinery already in the box, and it shrinks themes rather than growing them.

**Decisions that hold regardless of how the DS evolves:**

- It is a *resolver*, not a merge strategy. A derived theme resolves seeds-plus-rules into a final value set, and everything downstream consumes the resolved values. This is why spec 009's composition work should merge *resolved* values rather than source themes. Settle that and derived tokens slot underneath later with no rework.
- "Schema locked, values float" becomes "relationships locked, seeds float." That reframes Constitution Section III, and it overlaps with the Section III amendment spec 009 already makes for composition. One coherent Section III rewrite beats two consecutive ones.
- Contrast moves from check to generate. The unsolved seam: what happens to a derived pair when two color-bearing theme axes merge, whether to re-derive against the merged seed or keep each axis's own derived pair.

**Open questions for spec-time (don't answer now):**

- The authoring format for a computed value. DTCG handles aliases (`{color.primary}`) but not `mix()`, `mostReadable()`, or scale generation, so this needs a decided extension.
- How few seeds a theme can get away with, and which tokens are seeds versus derived.
- Whether the theme-extension tokens from spec 009 can themselves be derived, or stay literal.

**Deliberately omitted:** file paths, function signatures, schema shapes. Those rot before this gets built. The point of this entry is the shape of the bet, not its implementation.

## Resolution Unification (One Engine, Not Three)

**Status:** shipped in spec 014 (2026-06-12). Kept here as the record of the bet and its link to the derived-token entry above. Brief at `docs/workshops/2026-06-11/spec-014-resolution-unification.md`.

Spec 009 shipped composition on a resolution stack that already had more than one engine: Style Dictionary resolved themes into CSS at build, the JS side re-resolved the same themes at query/runtime, and `canonicalDefaultTokens` was a hand-maintained third copy. 009 kept them honest with a cross-surface parity oracle, which was the right call there but serviced the interest rather than paying the principal.

Spec 014 paid it. Style Dictionary already computed each theme's resolved set for the CSS, so it now emits that set as data too, and the MCP, the validator, and the defaults read it instead of re-resolving. Build-time themes resolve in exactly one engine; runtime consumer themes keep the JS resolver as the one isolated second context. The 009 parity oracle retired to a thin wiring canary, and the defaults drift guard became a regenerate-and-diff check. This is the foundation the derived-token entry above wants, since a single resolver stage is what derived tokens slot into.

**Decision that holds regardless:** the boundary stays typed. Even after the engines collapse, `ResolvedTokens` stays a branded type distinct from raw DTCG, so the runtime resolver can never silently accept the wrong shape.
