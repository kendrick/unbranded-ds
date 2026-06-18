---
'@unbranded-ds/tokens': minor
---

Add a `tracking` (letter-spacing) scale and larger `radius` steps, the two token scales a maximally divergent skin (the LCARS expressivity fixture) could not express through tokens before.

`tracking` is its own top-level category, like `motion`, that emits Tailwind's `--tracking-*` namespace (`tracking-tighter` through `tracking-widest`). `radius` gains `xl` (0.75rem), `2xl` (1rem), and `3xl` (1.5rem) between `lg` and the full pill; an asymmetric corner composes per-corner from the scale.

Both are required keys. The built-in themes inherit the new defaults and need no change. A fully-specified external theme must add the new keys, which is the breaking part of this pre-1.0 minor bump.
