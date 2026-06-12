---
'@unbranded-ds/tokens': patch
---

Collapse the two resolution engines behind theme composition into one.

Style Dictionary now emits each bundled theme's resolved delta and the resolved base as data, alongside the CSS it already produced. The token-query MCP and the bundled-theme validation read those artifacts instead of re-resolving the raw source, and `canonicalDefaultTokens` is generated from the resolved base rather than hand-maintained. A bundled theme is now resolved by exactly one engine, so the value the MCP reports matches the rendered CSS by construction.

That makes the spec-009 parity scaffolding structurally unnecessary: the cross-surface matrix retires to a thin wiring canary, the hand-maintained defaults drift guard becomes a regenerate-and-diff check, and the `dtcgToResolved` bridge is removed. The net result is fewer tests and fewer code paths for the same behavior. Internal only: no consumer-facing theming change, and the existing composition, MCP, validation, and contrast tests pass unchanged.
