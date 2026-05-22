---
'@unbranded-ds/react': patch
---

Apply the autodoc legibility audit to all 14 shipped components. Adds structured 6-section TSDoc to every component function (or aggregating export for compounds), per-prop TSDoc on every documented prop interface following the 3-section template with WHAT + WHEN context, per-story descriptions on every named story in Storybook, WAI-ARIA APG cross-references where a pattern applies, and compilable `@example` blocks that flow through the same validator pipeline as the sidecars. Closes the six TSDoc-drift bullets recorded by the spec 006 sidecar pass. Also repairs a pre-existing Tailwind `@source` path in the React package's preset.css so utility classes generate in Storybook builds. No runtime behavior or public API changes.
