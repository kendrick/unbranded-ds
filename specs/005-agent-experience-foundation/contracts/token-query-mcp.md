# Contract: Token-query MCP

The token-query MCP is a stdio-transport MCP server exposed via the `@unbranded-ds/tokens` npm package. Consumers configure their MCP client to spawn it as a subprocess.

## Connection

### Package side

`@unbranded-ds/tokens` adds a `bin` entry:

```json
{
	"bin": {
		"unbranded-ds-tokens-mcp": "./dist/mcp/server.js"
	}
}
```

The binary entry is built by `tsup` from `packages/tokens/src/mcp/server.ts` and prefaced with `#!/usr/bin/env node`.

### Consumer side

MCP client configuration block (Claude Code, Claude Desktop, Cursor):

```json
{
	"mcpServers": {
		"unbranded-ds-tokens": {
			"command": "npx",
			"args": ["@unbranded-ds/tokens", "unbranded-ds-tokens-mcp"]
		}
	}
}
```

Or, if the package is installed locally:

```json
{
	"mcpServers": {
		"unbranded-ds-tokens": {
			"command": "node",
			"args": ["./node_modules/@unbranded-ds/tokens/dist/mcp/server.js"]
		}
	}
}
```

## Tools

Four tools, each declared with a Zod-derived input schema:

### `listThemes`

```ts
input: {} (no arguments)

output: {
  themes: Array<{
    key: string;          // 'light', 'dark', 'brand'
    description: string;  // one-line description from the theme metadata
  }>
}
```

No error states.

### `palette`

```ts
input: {
  category: string;   // 'color' or 'color.foreground' — flat or dotted path
  theme?: string;     // defaults to package default
}

output: {
  category: string;
  theme: string;
  tokens: Array<{
    name: string;     // 'color.primary' (fully qualified)
    value: string;    // resolved value for the active theme
  }>
}

errors:
  - { component: 'tokens-mcp', issue: 'unknown-category', got: <category> }
  - { component: 'tokens-mcp', issue: 'unknown-theme', got: <theme> }
```

### `contrast`

```ts
input: {
  foreground: string;  // hex/rgb/hsl color OR token reference (e.g. 'color.primary')
  background: string;  // same
  theme?: string;
}

output: {
  ratio: number;       // WCAG contrast ratio, 1.0 to 21.0
  aa: { normal: boolean; large: boolean };
  aaa: { normal: boolean; large: boolean };
  foreground: { resolved: string };  // hex form of the resolved color
  background: { resolved: string };
}

errors:
  - { component: 'tokens-mcp', issue: 'unparseable-color', input: <string> }
  - { component: 'tokens-mcp', issue: 'unknown-token', token: <string>, theme: <theme> }
  - { component: 'tokens-mcp', issue: 'unknown-theme', got: <string> }
```

### `lookupToken`

```ts
input: {
  token: string;       // dotted token name, e.g. 'color.primary'
  theme?: string;
}

output: {
  token: string;
  theme: string;
  cssVariable: string; // e.g. '--ds-color-primary'
  value: string;       // resolved value
}

errors:
  - { component: 'tokens-mcp', issue: 'unknown-token', got: <string> }
  - { component: 'tokens-mcp', issue: 'unknown-theme', got: <string> }
```

## Error contract

Every tool error payload follows Section XI.4 and FR-027:

```ts
{
  component: 'tokens-mcp',  // constant for this MCP
  issue: string,             // kebab-cased issue identifier
  [key: string]: unknown,    // additional context fields
}
```

The payload is wrapped by `runtime/errors.ts`'s `mcpError()` helper into the MCP protocol's `isError: true` response. Clients receive both the protocol-level error flag and the parseable payload.

## Lifecycle

- Server startup: load the token map once, register tools, connect stdio transport
- Per-call: tool handler receives parsed input (already validated by the SDK against its Zod schema), returns output or error payload
- No persistent state between calls; no warm-up beyond initial token-map load

## Smoke test

CI step (`packages/tokens/src/mcp/smoke.test.ts`) does the following:

1. Builds the MCP binary via `pnpm --filter @unbranded-ds/tokens build`
2. Spawns the binary as a subprocess
3. Sends a `tools/list` request via the stdio protocol
4. Asserts the response includes exactly four tools with the names above and the expected input-schema shapes
5. Sends a `tools/call` for `listThemes` and asserts the response contains a non-empty `themes` array
6. Exits the subprocess cleanly

The smoke test runs as part of the verify job, before the publish job. A failed smoke test blocks the release.

## Unit tests

Per-tool tests (`packages/tokens/src/mcp/tools/*.test.ts`) call the tool handler functions directly with mocked input objects. Coverage targets:

- Each tool's success path
- Each tool's error states (one test per documented `issue`)
- Edge inputs (empty arguments, malformed colors, unknown tokens)
- The `contrast` tool's dual input format (color string AND token reference)
- The `palette` tool's flat and hierarchical category resolution

Runtime tests (`packages/tokens/src/mcp/runtime/*.test.ts`):

- `mcpError()` produces a protocol-compliant error envelope
- `createServer()` registers tools with the SDK
- `spawnAndQuery()` correctly invokes a tool and parses the result

## Versioning

The MCP versions with `@unbranded-ds/tokens`. The first published version (this spec) is `@unbranded-ds/tokens@0.3.0` (or whatever minor lands after spec 004's `0.3.0`). Future MCP changes that add tools or alter responses bump the package minor; bug fixes bump patch.
