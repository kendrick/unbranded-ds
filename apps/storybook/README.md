# Storybook + MCP

Storybook 10.3 ships an MCP server via `@storybook/addon-mcp`. Agents can browse components, pull docs, preview stories, and run interaction tests over JSON-RPC.

## Endpoints

- Local dev: `http://localhost:6006/mcp`
- Chromatic: `https://main--<appid>.chromatic.com/mcp` (swap in your Chromatic app ID)

## Tools

Six tools, exposed by the addon:

| Tool | What it does |
|---|---|
| `list-all-documentation` | Lists every component and its metadata |
| `get-documentation` | Full docs for a component: props, examples, stories |
| `get-documentation-for-story` | Docs for a single story variant |
| `preview-stories` | Preview URLs for specific stories |
| `run-story-tests` | Runs play functions, reports pass/fail |
| `get-storybook-story-instructions` | Guidance for writing new stories |

## Client setup

### Claude Code

```bash
npx mcp-add --type http --url "https://main--<appid>.chromatic.com/mcp" --scope project
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

## Smoke test

To check that an endpoint is alive and exposing the tools we expect:

```bash
pnpm dlx tsx scripts/mcp-smoke-test.ts
```

Defaults to `http://localhost:6006/mcp`. Pass a URL to point at a different one:

```bash
pnpm dlx tsx scripts/mcp-smoke-test.ts https://main--abc123.chromatic.com/mcp
```

Non-zero exit if anything's missing. CI runs it after Chromatic publish.

## Access

The endpoint is as public as the Storybook. Auth is a paid Chromatic feature and out of scope for v0.1.
