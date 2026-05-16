---
'@unbranded-ds/react': minor
---

Add `<Tooltip>` — a token-styled, ARIA-compliant tooltip wrapping Base UI's Tooltip primitives. Exposes `Tooltip.Provider`, `Tooltip.Trigger`, and `Tooltip.Content` with sensible defaults: 700ms hover delay, `side="top"`, `align="center"`, and a Portal that mounts to `document.body` so content escapes ancestors with `overflow: hidden`.

Wrap any element with `<Tooltip.Trigger asChild>` to preserve the original DOM shape, which is what the citation pattern (`<sup><a>[1]</a></sup>`) requires. The open and close transitions go instant when the user has `prefers-reduced-motion: reduce` set, via Tailwind's `motion-reduce:` variant, so the component stays compliant with WCAG SC 2.3.3 without consumer work.
