---
'@unbranded-ds/tokens': minor
'@unbranded-ds/react': patch
---

Consume the spec 008 design tokens in component source. Focus rings now read `ring.width`, the overlay components read the `z-index` scale, and overlay open/close animations read the `motion` tokens, so a consumer theming any of those now sees the components respond.

Adds a `z-index.max` token (9999) for the always-on-top focus-revealed SkipLink, so a focused skip link beats every overlay, including a consumer's own.

The z-index work fixes a latent stacking bug: a tooltip opened inside a dialog now renders above it (tooltip 60 over overlay 50) instead of both sharing a hardcoded `z-50` with no defined order. No public component API changes; the only visible differences are the corrected overlay stacking and the design-system motion timing.
