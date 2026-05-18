# Data Model: Agent experience foundation

This document describes the structural model — documents, MCP tool inputs/outputs, runtime primitives — for the artifacts this spec ships. There is no persisted data; the "model" is the shape of files on disk and the shape of MCP tool responses.

## AGENTS.md

**Location**: repository root.

**Shape**: Markdown document organized as a peer to `README.md`.

### Sections

| Section            | Required | Content                                                                                                                                                                             |
| ------------------ | -------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Project overview   | Yes      | One paragraph naming what the design system is and who consumes it (humans, agents).                                                                                                |
| MCP endpoints      | Yes      | Storybook MCP connection block (URL + client config snippet). Token-query MCP connection block (CLI command + client config snippet).                                               |
| Tool inventory     | Yes      | One entry per MCP tool: name, one-line purpose, one "useful when..." sentence (FR-003).                                                                                             |
| Worked example     | Yes      | At least one concrete agent-flow narrative ("scaffold a Card with a primary Button"; "what's `color.primary` in dark mode and does it pass contrast against my custom background"). |
| Component index    | Yes      | One row per shipped component: name, one-line summary, link to its `<Component>.usage.md`.                                                                                          |
| Sidecar convention | Yes      | Brief note on the `*.usage.md` convention so an agent that finds one sidecar can predict where the others live.                                                                     |
| Where to read more | Optional | Links to constitution, theming guide, spec directory.                                                                                                                               |

### Constraints

- Sections appear in the order above.
- Prose follows Section XI.1 rules (humanizer-passed, no three-item lists).
- README.md links to AGENTS.md from its Docs section so discovery works in either direction.

---

## Sidecar template (`packages/react/src/components/_template/Component.usage.md`)

**Shape**: Markdown document with named sections that every per-component sidecar mirrors. The template uses placeholder content that itself reads as good sidecar voice (the template is its own example, per FR-010).

### Sections

| Section            | Required    | Content                                                                                                                                                                                                                        |
| ------------------ | ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Heading            | Yes         | `# <Component>` with a one-line tagline immediately under it.                                                                                                                                                                  |
| When to use        | Yes         | One paragraph identifying the consumer scenario the component addresses. Active voice; no AI tells.                                                                                                                            |
| Import             | Yes         | A `tsx` code block showing the import statement. Compile-validated.                                                                                                                                                            |
| Props              | Yes         | Markdown table with columns `Prop`, `Type`, `Default`, `Description`. For compound components, one subsection per slot.                                                                                                        |
| Common patterns    | Yes         | One, two, or four code-block examples with surrounding prose. Never three. Each example is `tsx` and compile-validated.                                                                                                        |
| Accessibility      | Yes         | Plain-prose notes covering keyboard interaction, screen-reader announcements, ARIA roles, focus management. Names specific keys (e.g., "Escape closes the tooltip").                                                           |
| Variants and slots | Yes         | Lists the CVA variant axes with their values and defaults. For compound components, lists the slot components and their roles. If the component has no variants, the section states that explicitly with a one-line rationale. |
| Related            | Conditional | Per FR-015a, included when one or more sibling components or primitives are relevant. Omitted entirely when nothing relates (no empty placeholder).                                                                            |

### Constraints

- The Import section MUST contain exactly one `tsx` code block.
- Common patterns section MUST contain one, two, or four code blocks. Three is forbidden by Section XI.1.
- All `tsx` blocks are compile-validated by the CI step.
- Every prose passage passes humanizer review before the sidecar merges.

---

## Per-component sidecar (`<Component>.usage.md`)

**Shape**: Same as the template, with placeholders replaced by real content for the component.

### Compound-component variant (per FR-010a)

For Tooltip, Slider, SegmentedControl, and Tabs (any compound component with multiple slots):

- The sidecar is a single file at the top-level location (e.g., `Tooltip/Tooltip.usage.md`).
- The Props section has subsections — one per slot — each with its own prop table.
- The Variants and slots section names every slot with a one-line description of its role.

### Single-component variant

For Button, Card, Checkbox, Input, Label, Select, Switch, VisuallyHidden, SkipLink:

- The sidecar is a single file with a flat Props section (one table).
- The Variants and slots section names the CVA axes only.

---

## Token-query MCP tools

The four tools share a `{ component, issue, ... }` error shape (Section XI.4 / FR-027) and JSON-serializable input and output types. Each tool registers with the MCP server via the runtime `createServer({ tools, name, version })` call.

### `listThemes`

| Field  | Type                                                      | Notes                                                                   |
| ------ | --------------------------------------------------------- | ----------------------------------------------------------------------- |
| Input  | `{}` (no arguments)                                       |                                                                         |
| Output | `{ themes: Array<{ key: string; description: string }> }` | One entry per theme exposed by `@unbranded-ds/tokens`.                  |
| Errors | None                                                      | The token map is bundled with the package; listing is always available. |

### `palette`

| Field  | Type                                                                                                                                                                                                                  | Notes                                                                                                                     |
| ------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| Input  | `{ category: string; theme?: string }`                                                                                                                                                                                | `category` may be flat (`'color'`) or hierarchical (`'color.foreground'`). `theme` defaults to the package default theme. |
| Output | `{ category: string; theme: string; tokens: Array<{ name: string; value: string }> }`                                                                                                                                 | Tokens listed in the order they appear in the source map.                                                                 |
| Errors | `{ component: 'tokens-mcp', issue: 'unknown-category', got: string }` when `category` does not resolve to any subtree. `{ ..., issue: 'unknown-theme', got: string }` when `theme` does not resolve to a known theme. |

### `contrast`

| Field  | Type                                                                                                                                                                                                                                                                                                     | Notes                                                                                                                                                                |
| ------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Input  | `{ foreground: ColorOrToken; background: ColorOrToken; theme?: string }`                                                                                                                                                                                                                                 | `ColorOrToken` is `string` matching either a color string (hex, rgb, hsl) or a token reference. Token references resolve against `theme` (default: package default). |
| Output | `{ ratio: number; aa: { normal: boolean; large: boolean }; aaa: { normal: boolean; large: boolean }; foreground: { resolved: string }; background: { resolved: string } }`                                                                                                                               | Resolved colors echo back so the caller can verify the resolution.                                                                                                   |
| Errors | `{ component: 'tokens-mcp', issue: 'unparseable-color', input: string }` when the color string is not parseable. `{ ..., issue: 'unknown-token', token: string, theme: string }` when a token reference does not resolve. `{ ..., issue: 'unknown-theme', got: string }` when the theme name is unknown. |

### `lookupToken`

| Field  | Type                                                                                                                | Notes                                                                                                              |
| ------ | ------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| Input  | `{ token: string; theme?: string }`                                                                                 | `token` is a dotted token name like `'color.primary'`. `theme` defaults to package default.                        |
| Output | `{ token: string; theme: string; cssVariable: string; value: string }`                                              | `cssVariable` is the CSS custom property name (`--ds-color-primary`); `value` is the resolved value for the theme. |
| Errors | `{ component: 'tokens-mcp', issue: 'unknown-token', got: string }`. `{ ..., issue: 'unknown-theme', got: string }`. |

---

## Shared MCP runtime primitives (`packages/tokens/src/mcp/runtime/`)

### `stdio.ts`

**Exports**:

- `createServer(config: { name: string; version: string; tools: McpTool[] }): McpServer`

Where `McpTool` is the SDK's tool descriptor (`{ name, description, inputSchema, handler }`).

**Responsibilities**:

- Instantiate `@modelcontextprotocol/sdk`'s `Server` with the stdio transport
- Register the provided tools
- Wire lifecycle hooks (start, shutdown)
- Return the configured server for the caller to `.connect()` and `.run()`

### `errors.ts`

**Exports**:

- `mcpError(payload: McpErrorPayload): ToolResult`

Where `McpErrorPayload` matches Section XI.4 / FR-034: `{ component: string; issue: string; [key: string]: unknown }`.

**Responsibilities**:

- Wrap the structured payload in the MCP protocol's error envelope so the client receives `isError: true` plus the parseable payload as the message body.
- Ensure every tool's error shape is consistent.

### `testing.ts`

**Exports**:

- `spawnAndQuery(toolName: string, args: object): Promise<ToolResult>` — unit-test helper that spawns the server in-process (or as a subprocess for integration-level tests) and calls one tool.
- `runSmokeTest(): Promise<void>` — CI smoke test that asserts `tools/list` returns the expected four tool names.

**Responsibilities**:

- Centralize the subprocess plumbing tests would otherwise re-implement.
- Provide a single point to update when the MCP gains tools or changes its transport.

---

## Cross-artifact invariants

- Every MCP error payload includes at least `component: 'tokens-mcp'` and a non-empty `issue` field. Additional fields document the offending input.
- Every sidecar code block tagged `tsx` is compile-validated; non-`tsx` blocks (e.g., shell commands) are ignored by the validator.
- Every sidecar mentioned in `AGENTS.md`'s component index links to a `.usage.md` file that exists at the linked path once the corresponding sidecar PR has merged.
- The MCP and sidecar files for the same component agree on prop signatures, defaults, and described usage patterns (FR-013 and FR-014 — verified manually during the sidecar PR review).
