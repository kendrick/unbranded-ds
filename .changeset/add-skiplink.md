---
'@unbranded-ds/react': minor
---

Add `<SkipLink>` — a keyboard-accessibility staple. Renders a visually-hidden anchor that reveals on focus and jumps to a target element. Default `targetId` is `'main'`. Multiple instances supported.

Drop a `<SkipLink />` as the first focusable element in your layout, then add `id="main"` to the matching content region. On first Tab the link reveals at the top-left of the viewport; pressing Enter triggers native browser anchor behavior to scroll and focus the target. For multi-landmark layouts, render several `<SkipLink>` instances with distinct `targetId`s — for example one each pointing at `main`, `nav`, and `footer` — and the consumer chooses how to stack them visually.
