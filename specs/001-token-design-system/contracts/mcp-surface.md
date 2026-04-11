# Contract: MCP Endpoint Surface

**Date**: 2026-04-10

---

## Endpoint

**Local dev**: `http://localhost:6006/mcp`  
**Published (Chromatic)**: `https://main--<appid>.chromatic.com/mcp`

The MCP server is provided by `@storybook/addon-mcp` and runs within the Storybook dev server (local) or alongside the published Storybook (Chromatic).

---

## Protocol

JSON-RPC over HTTP (Model Context Protocol). The endpoint responds to standard MCP method calls.

---

## Required Tools (smoke test assertion)

The `tools/list` response must include tools that enable an agent to:

1. **List components** — Retrieve all nine components and their metadata.
2. **Get component stories** — For a given component, retrieve all story names, args, and descriptions.
3. **Get story details** — For a given story, retrieve argument definitions, prop types, and documentation.
4. **Run story tests** — Execute a story's play function and report pass/fail (if supported by the addon).

The exact tool names are defined by `@storybook/addon-mcp` and may include:
- `get_components` or similar
- `get_stories`
- `get_story_args`
- `run_story_tests`

---

## MCP Smoke Test (CI)

The smoke test script (`scripts/mcp-smoke-test.ts`) must:

1. Send a JSON-RPC `tools/list` request to the published Chromatic MCP endpoint.
2. Assert the response contains the expected tool set (component listing, story retrieval).
3. Optionally: send a `get_components` (or equivalent) call and assert all nine components are listed.
4. Exit 0 on success, non-zero on failure.
5. Fail if the endpoint is unreachable or returns an error.

---

## Client Configuration

### Claude Code

```bash
npx mcp-add --type http --url "https://main--<appid>.chromatic.com/mcp" --client-id "cdf3737dff9d485485968e50b63fd8b4" --scope project
```

### Claude Desktop (`claude_desktop_config.json`)

```json
{
  "mcpServers": {
    "unbranded-ds": {
      "type": "http",
      "url": "https://main--<appid>.chromatic.com/mcp"
    }
  }
}
```

### Cursor (`.cursor/mcp.json`)

```json
{
  "mcpServers": {
    "unbranded-ds": {
      "type": "http",
      "url": "https://main--<appid>.chromatic.com/mcp"
    }
  }
}
```

Replace `<appid>` with the actual Chromatic project app ID after initial setup.

---

## Access Control

The MCP endpoint is public by default (mirrors Storybook access on Chromatic). Authentication is a paid Chromatic feature and is out of scope for v0.1.
