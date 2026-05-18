# Contract: `AGENTS.md` shape

A single `AGENTS.md` at the repository root. Peer to `README.md`. Loosely follows the [agents.md](https://agents.md) community convention but adapts section content to this design system's needs.

## File location

`AGENTS.md` at the repository root, alongside `README.md`. The README's Docs section links to AGENTS.md so discovery works in both directions.

## Section structure (in order)

### 1. Heading and overview

```markdown
# AGENTS.md

unbranded-ds is a token-driven design system designed for both human and
agent consumers. This document is the entry point for agents.

(One short paragraph naming the project, the two consumer audiences, and
what an agent will find here.)
```

### 2. MCP endpoints

Two configuration blocks, one for each published MCP. Each block names the connection, the command (or URL), and a snippet a consumer can paste directly into their MCP client config.

```markdown
## MCP endpoints

### Storybook MCP

Live, hosted via Chromatic. Provides component metadata, stories, and
introspection over every shipped component.

Endpoint: `https://<chromatic-build-url>/mcp`

Client configuration (Claude Code, Claude Desktop, Cursor):

\`\`\`json
{
"mcpServers": {
"unbranded-ds-storybook": {
"url": "https://<chromatic-build-url>/mcp"
}
}
}
\`\`\`

### Token-query MCP

Local, runs as a stdio subprocess of your MCP client. Provides theme
listing, token lookup, palette enumeration, and WCAG contrast math.

Client configuration:

\`\`\`json
{
"mcpServers": {
"unbranded-ds-tokens": {
"command": "npx",
"args": ["@unbranded-ds/tokens", "unbranded-ds-tokens-mcp"]
}
}
}
\`\`\`
```

### 3. Tool inventory

For each published MCP, list every tool. Each entry follows the FR-003 three-line format:

```markdown
## Tool inventory

### Token-query MCP

- `listThemes` — list available themes with their keys and one-line descriptions.
  Useful when you want to enumerate brand/light/dark before picking one.

- `palette` — return all tokens in a category (flat name or dotted path).
  Useful when authoring a component and you need to know what colors,
  spacing, or radii the active theme exposes.

- `contrast` — compute the WCAG contrast ratio between two colors plus
  pass/fail for AA/AAA, normal/large. Accepts hex/rgb/hsl color strings
  OR named token references.
  Useful when validating a color pair before committing it to a theme.

- `lookupToken` — return the resolved CSS variable name and current value
  for a named token in a given theme.
  Useful when you need to know what `color.primary` resolves to in the
  dark theme right now.

### Storybook MCP

- (Tools enumerated by `@storybook/addon-mcp`; see the live `tools/list`
  on the Storybook MCP endpoint for the authoritative list. The Storybook
  MCP's tool set evolves with the addon.)
```

### 4. Worked example

At least one concrete agent-flow narrative. The example shows what an agent does, what tools it calls, and what it gets back.

```markdown
## Worked example

You want to scaffold a Card with a primary Button. Here's the agent flow:

1. Call the Storybook MCP's `listComponents` to find both Card and Button.
2. Call `getComponent(name: 'Card')` and `getComponent(name: 'Button')`
   to read their prop signatures and usage patterns.
3. Read the local sidecars at
   `packages/react/src/components/Card/Card.usage.md` and
   `packages/react/src/components/Button/Button.usage.md` for
   offline-readable usage patterns.
4. Write the component using the canonical pattern from each sidecar.
5. (Optional) Call the token-query MCP's `contrast` with `color.primary`
   and `color.background` to confirm the button's text meets AA contrast
   on the card's surface.
```

### 5. Component index

Markdown table with one row per shipped component: name, one-line summary, link to sidecar.

```markdown
## Component index

| Component | Summary                                                   | Sidecar                                                                 |
| --------- | --------------------------------------------------------- | ----------------------------------------------------------------------- |
| Button    | Token-styled button with size, variant, and intent axes.  | [Button.usage.md](packages/react/src/components/Button/Button.usage.md) |
| Card      | Container surface with rounded corners and shadow tokens. | [Card.usage.md](packages/react/src/components/Card/Card.usage.md)       |
| ...       | ...                                                       | ...                                                                     |
```

### 6. Sidecar convention

Brief note so an agent that finds one sidecar can predict where the others live.

```markdown
## Sidecar convention

Every shipped component has a `<Component>.usage.md` file co-located
with its source. The shape is documented in
[specs/005-agent-experience-foundation/contracts/sidecar-shape.md](specs/005-agent-experience-foundation/contracts/sidecar-shape.md).

The template at
[packages/react/src/components/\_template/Component.usage.md](packages/react/src/components/_template/Component.usage.md)
shows the expected structure with placeholder content.
```

### 7. Where to read more (optional)

Links to constitution, theming guide, and the spec directory.

```markdown
## Where to read more

- [Constitution](.specify/memory/constitution.md) — the non-negotiable
  principles, including Section XI on agent and human legibility.
- [Theming](THEMING.md) — how tokens, themes, and runtime JSON themes work.
- [specs/](specs/) — feature specs, plans, and tasks.
```

## Constraints

- Sections appear in the order listed above.
- Prose follows Section XI.1 rules (humanizer-passed, no three-item lists, specific over generic).
- The Component index table updates each time a new sidecar PR merges. Stale rows are deleted in the same PR that retires a component (none planned).
- The MCP configuration snippets use `<chromatic-build-url>` and `<package-version>` as placeholders ONLY when the literal values are not yet known. At publish time, the values are filled in.

## What this contract does NOT cover

- Auto-generation of the component index from filesystem state. The index is maintained manually in this spec; a future spec could automate it.
- Per-package `AGENTS.md` files (one for `@unbranded-ds/tokens`, one for `@unbranded-ds/react`). Deferred to a future spec.
- Linting or testing the `AGENTS.md` content. The file is reviewed manually as part of the PR that creates or updates it.
