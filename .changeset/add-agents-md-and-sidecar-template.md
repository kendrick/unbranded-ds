---
'@unbranded-ds/react': patch
---

Add the sidecar foundation: a `*.usage.md` template at `packages/react/src/components/_template/Component.usage.md` and the supporting CI step that compile-tests all `tsx`-tagged code blocks in sidecar files via `scripts/validate-sidecars.ts`. Per-component sidecars land in follow-up PRs as part of spec 005's retrofit. Repo-root `AGENTS.md` (the agent-facing entry point) lands in the same PR; it indexes every shipped component and names the two MCP endpoints.

No runtime impact on consumers — this is documentation infrastructure.
