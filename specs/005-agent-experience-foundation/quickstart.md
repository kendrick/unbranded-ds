# Quickstart: Agent experience foundation

After this spec lands, here's what consumers — humans and agents — can do with the new surfaces.

## For agents: chat with `@unbranded-ds/tokens`

### Install

```bash
pnpm add @unbranded-ds/tokens@^0.3.0
```

(The version may be different; check `@unbranded-ds/tokens`'s latest after this spec ships.)

### Configure your MCP client

Add to your MCP client config (Claude Code, Claude Desktop, Cursor):

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

### Try a query

Ask your agent:

> What's `color.primary` in the dark theme right now?

The agent calls `lookupToken` with `{ token: 'color.primary', theme: 'dark' }` and gets back the CSS variable name and the resolved value.

Or:

> I have a custom Card background `#1a1a1a`. Does my body text on it pass AA contrast?

The agent calls `contrast` with `{ foreground: 'color.foreground', background: '#1a1a1a' }` and gets back the contrast ratio plus pass/fail for AA-normal, AA-large, AAA-normal, AAA-large.

## For humans: read the sidecars

Open `packages/react/src/components/<Component>/<Component>.usage.md` in your editor or on GitHub. The file structure is:

- **Heading and tagline** — what the component is
- **When to use** — the consumer scenario
- **Import** — paste-ready import statement
- **Props** — table with type, default, and a description that explains WHEN to reach for each prop
- **Common patterns** — code blocks with prose explaining each
- **Accessibility** — keyboard, screen-reader, ARIA notes
- **Variants and slots** — CVA axes and (for compound components) slot roles
- **Related** — sibling or related primitives, when relevant

Every code block is compile-tested in CI. If you copy a block into your app and it breaks, that's a bug in the sidecar, not in your app.

## For contributors: add a new sidecar

If you're adding a new component to the design system:

1. Copy `packages/react/src/components/_template/Component.usage.md` into your new component's directory and rename to `<Component>.usage.md`.
2. Replace placeholder content section by section. Keep the section names and the section order.
3. Apply the prose rules from Section XI.1: no three-item lists, no AI tells, specific over generic.
4. Run a humanizer review on every prose passage before opening the PR.
5. Add an entry to `AGENTS.md`'s Component index table.
6. Add a `.changeset/add-<component>-sidecar.md` with a `@unbranded-ds/react: patch` bump.

CI will:

- Extract all `tsx` code blocks from your sidecar
- Run `tsc --noEmit` against each one
- Fail the build if anything doesn't compile

## For contributors: add a new MCP tool

If you want to extend the token-query MCP with a new tool:

1. Create the handler in `packages/tokens/src/mcp/tools/<toolName>.ts`. Define the Zod input schema, implement the handler, export both.
2. Register the tool in `packages/tokens/src/mcp/server.ts` by adding to the `tools` array passed to `createServer()`.
3. Add unit tests at `packages/tokens/src/mcp/tools/<toolName>.test.ts` covering the success path, every documented error state, and any edge cases.
4. Update `packages/tokens/src/mcp/smoke.test.ts` to expect the new tool in the `tools/list` response.
5. Update `AGENTS.md`'s Tool inventory section with the new tool's three-line entry (name, purpose, useful-when).
6. Update `contracts/token-query-mcp.md` with the new tool's input/output/error contract.
7. Use `mcpError()` from the runtime for any error responses so the shape stays consistent.

## For contributors: extend the audit

The autodoc audit (US3) is a one-time pass on the existing components. To run a similar audit on a new component:

1. Open the component's `<Component>.stories.tsx` and `<Component>.tsx`.
2. For each of the four prose surfaces (component-level description in stories meta, every prop's `argTypes` description, every named story's `parameters.docs.description.story`, every TSDoc block in source), run the prose through the humanizer skill.
3. Confirm every prop description explains WHY a consumer would reach for the prop, not only WHAT it does.
4. Commit per logical group; use git history as the audit ledger.

## Bundle size

The token-query MCP server adds no runtime cost to consumers of `@unbranded-ds/tokens`. It runs as a separate subprocess; its dependencies (`@modelcontextprotocol/sdk`) are not pulled into the consumer's bundle.

The sidecar files are markdown only and do not affect package size unless they are included in the `files` field of `@unbranded-ds/react`'s `package.json` (a separate decision, out of scope for this spec).

## Compatibility

- Node.js: the MCP server requires Node 18+ (the MCP SDK's minimum). Stated in `@unbranded-ds/tokens`'s `engines` field.
- MCP clients: Any client that supports stdio transport — Claude Code, Claude Desktop, Cursor, and others.
- Sidecars: GitHub-flavored markdown. Renders correctly in VS Code, GitHub, and standard markdown viewers.
- `AGENTS.md`: Plain markdown. The agents.md community convention treats it as the canonical agent entry point.
