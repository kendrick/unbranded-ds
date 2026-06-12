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

## Theme axes (spec 009)

Three of the four tools resolve token values, and all three take the same `theme` input: an axis object, not a bare theme name.

```ts
theme?: { aesthetic?: string; density?: string }   // omit a key to skip that axis
```

A theme belongs to exactly one axis. `aesthetic` (applied through `data-theme`) carries the palette and type; `density` (applied through `data-density`) refines spacing and line-heights. Each tool folds the named axes through `composeTokens`, density last, so a density theme wins any key the two axes both set. No tool merges on its own. They all call `composeAxes(theme)`, the one resolver, which keeps every surface composing the same way.

Single-axis callers keep working through two conveniences. An omitted or empty `theme` falls back to `{ aesthetic: 'light' }`, the pre-009 default. And an axis that names a theme we don't ship contributes nothing rather than failing: the other axes still resolve, and the unknown name is reported, not thrown.

`source` rides along on the token outputs. A token in the locked schema reads `source: 'schema'`; a token a bundled theme adds past the schema reads `source: 'theme-extension'`. The classification comes from `tokenMap` membership at query time, so a caller can tell a canonical token from a theme-scoped one without consulting the build.

## Tools

Four tools, each declared with a Zod-derived input schema:

### `listThemes`

```ts
input: {} (no arguments)

output: {
  themes: Array<{
    key: string;          // 'light', 'dark', 'brand', 'vaporwave', 'compact'
    axis: 'aesthetic' | 'density';  // which slot this theme fills
    description: string;  // one-line description from the theme metadata
  }>
}
```

No error states. The `axis` field tells a caller which slot a theme goes in (`aesthetic` vs `density`) before handing it back as a `theme` input.

### `palette`

```ts
input: {
  category: string;   // 'color' or 'color.foreground' — flat or dotted path
  theme?: { aesthetic?: string; density?: string };  // axes; see above
}

output: {
  category: string;
  theme: { aesthetic?: string; density?: string };
  tokens: Array<{
    name: string;     // 'color.primary' (fully qualified)
    value: string;    // resolved value under the composed axes
    source: 'schema' | 'theme-extension';
  }>
}

errors:
  - { component: 'tokens-mcp', issue: 'unknown-category', got: <category> }
```

The token set comes from `tokenMap` (schema plus bundled extensions), so the list is stable across axes; each entry's `value` is read from the composed tree and `source` tags where the token comes from. A category nothing matches returns the `unknown-category` error.

### `contrast`

```ts
input: {
  foreground: string;  // hex/rgb/hsl/oklch color OR token reference (e.g. 'color.primary')
  background: string;  // same
  theme?: { aesthetic?: string; density?: string };  // axes; see above
}

output: {
  ratio: number;       // WCAG contrast ratio, 1.0 to 21.0
  aa: { normal: boolean; large: boolean };
  aaa: { normal: boolean; large: boolean };
  foreground: { resolved: string };  // the resolved color value
  background: { resolved: string };
}

errors:
  - { component: 'tokens-mcp', issue: 'unparseable-color', prop: <string>, input: <string>, resolved: <string> }
  - { component: 'tokens-mcp', issue: 'unknown-token', token: <string> }
```

The axes compose once; both sides resolve against that one tree. A side that looks like a token but doesn't resolve there is an `unknown-token` error; anything else is treated as a literal color string.

### `lookupToken`

```ts
input: {
  token: string;       // dotted token name, e.g. 'color.primary'
  theme?: { aesthetic?: string; density?: string };  // axes; see above
}

// resolved — the token is in the map and the active axes declare it
output: {
  token: string;
  theme: { aesthetic?: string; density?: string };
  source: 'schema' | 'theme-extension';
  present: true;
  cssVariable: string; // e.g. '--color-primary'
  value: string;       // resolved value under the composed axes
}

// soft absent — a real extension token that the active axes don't carry
output: {
  token: string;
  theme: { aesthetic?: string; density?: string };
  source: 'theme-extension';
  present: false;
  note: string;        // 'theme-extension token; the active theme(s) do not declare it'
}

errors:
  - { component: 'tokens-mcp', issue: 'unknown-token', got: <string> }
```

The token resolves against the composed axes, so a value can come from either one. Four outcomes:

- In the map and present in the composition → resolved, `source` from the map (`schema` or `theme-extension`).
- A theme-extension token the active axes don't declare → soft `present: false` with a `note`, NOT an error, so the caller learns it's theme-scoped to some other theme.
- Present in the composition but absent from the map → a resolved theme-extension answer with `cssVariable` synthesized from the dot-path (`shadow.neon` → `--shadow-neon`).
- In no theme at all → the `unknown-token` error.

A non-schema token that some theme declares resolves on its own merits; only a token no theme defines is rejected. (Before 009 any token outside the locked schema was a hard reject.)

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

The MCP versions with `@unbranded-ds/tokens`. Spec 005 first shipped it at `0.3.0`; spec 009's multi-axis input and `source` fields land at `SERVER_VERSION` `0.5.0`. Future MCP changes that add tools or alter responses bump the package minor; bug fixes bump patch.
