---
'@unbranded-ds/tokens': minor
---

Add the token-query MCP server. Exposes four tools over stdio for agent consumption: `listThemes`, `palette`, `contrast`, and `lookupToken`. The server lives inside `@unbranded-ds/tokens` (no new package per Constitution Section I) and is exposed via the `unbranded-ds-tokens-mcp` binary entry. Configure your MCP client to spawn it as a subprocess — no hosting required, no network round-trip, tokens are local once the package is installed.

The shared MCP runtime (`mcp/runtime/stdio.ts`, `mcp/runtime/errors.ts`, `mcp/runtime/testing.ts`) is exported from `@unbranded-ds/tokens/mcp` so future local stdio MCP servers in this monorepo can adopt the same primitives without re-implementing them.

See `AGENTS.md` at the repo root for connection details, tool inventory, and a worked example.
