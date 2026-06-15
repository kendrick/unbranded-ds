# AGENTS.md

unbranded-ds is a token-driven design system designed for both human and agent consumers. Humans browse stories in Storybook and component docs in IDEs. Agents query autodocs through the Storybook MCP, look up tokens through the token-query MCP, and read per-component sidecar files on a local clone. Neither audience is primary — Section XI of the constitution makes legibility for both a non-negotiable principle.

This document is the entry point for agents. If you're a human, [`README.md`](./README.md) is your starting point — and links back here.

## MCP endpoints

unbranded-ds publishes two complementary MCP servers.

### Storybook MCP

Hosted via Chromatic alongside the published Storybook. Exposes component metadata, stories, prop signatures, and accessibility annotations for every shipped component.

Endpoint: `https://<your-chromatic-project>.chromatic.com/mcp` (substitute the project URL — see the deployment log on the latest `main` push for the exact value).

Client configuration block (Claude Code, Claude Desktop, Cursor):

```json
{
	"mcpServers": {
		"unbranded-ds-storybook": {
			"url": "https://<your-chromatic-project>.chromatic.com/mcp"
		}
	}
}
```

### Token-query MCP

Local, runs as a stdio subprocess of your MCP client. Exposes theme listing, named token lookup, palette enumeration, and WCAG contrast math against the bundled tokens map. No network round-trip — the data ships with the npm package you already installed.

Client configuration block:

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

If you have the package installed locally, you can also point at the binary directly:

```json
{
	"mcpServers": {
		"unbranded-ds-tokens": {
			"command": "node",
			"args": ["./node_modules/@unbranded-ds/tokens/dist/ts/mcp/server.js"]
		}
	}
}
```

## Tool inventory

### Token-query MCP

- `listThemes` — list available themes with their keys and one-line descriptions.
  Useful when you want to enumerate brand, light, and dark themes before picking one for a downstream operation.

- `palette` — return all tokens in a category. Accepts a top-level name like `'color'` or a dotted path like `'color.foreground'`.
  Useful when authoring a component and you need to know what colors, spacing values, or radii the active theme exposes.

- `contrast` — compute the WCAG contrast ratio between two colors and report pass/fail for AA-normal, AA-large, AAA-normal, and AAA-large. Accepts hex, rgb, or hsl strings AND named token references like `'color.primary'`.
  Useful when validating a color pair before committing it to a theme or design.

- `lookupToken` — return the resolved CSS variable name and current value for a named token in a given theme.
  Useful when you need to know what `color.primary` actually resolves to in the dark theme right now.

### Storybook MCP

The Storybook MCP's tool set evolves with [`@storybook/addon-mcp`](https://github.com/storybookjs/addon-mcp). For the authoritative list, call `tools/list` on the live endpoint. As of this writing, the addon exposes component listing, story-by-name lookup, autodocs introspection, and a11y annotations per component.

## Worked example

You want to scaffold a Card containing a primary Button, and you want the button text to pass AA contrast against the card surface. Here's how an agent works that out end-to-end:

1. Call the Storybook MCP's component listing to confirm Card and Button are available.
2. Call `getComponent({ name: 'Card' })` and `getComponent({ name: 'Button' })` to read prop signatures and patterns.
3. Read the local sidecars at [`packages/react/src/components/Card/Card.usage.md`](./packages/react/src/components/Card/Card.usage.md) and [`packages/react/src/components/Button/Button.usage.md`](./packages/react/src/components/Button/Button.usage.md) for offline-readable usage patterns.
4. Call the token-query MCP's `contrast({ foreground: 'color.primary-foreground', background: 'color.card' })` to confirm AA-normal passes for the button text on the card.
5. Compose the result and write it into the consumer's app.

The whole flow takes four MCP calls plus two local file reads. No network is required for the token-query step.

## Component index

Every shipped component has a `<Component>.usage.md` sidecar next to its source. Links resolve as each sidecar PR merges; this index is updated alongside the sidecar work in spec 005.

| Component        | Summary                                                                                              | Sidecar                                                                                                 |
| ---------------- | ---------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| Button           | Token-styled button with variant, size, and an asChild render slot.                                  | [Button.usage.md](./packages/react/src/components/Button/Button.usage.md)                               |
| Card             | Container surface with rounded corners and shadow tokens.                                            | [Card.usage.md](./packages/react/src/components/Card/Card.usage.md)                                     |
| Checkbox         | Token-styled checkbox built on Base UI's Checkbox primitive.                                         | [Checkbox.usage.md](./packages/react/src/components/Checkbox/Checkbox.usage.md)                         |
| DensityToggle    | Density-axis control, data-driven from the theme registry; pairs with ThemeToggle.                  | [DensityToggle.usage.md](./packages/react/src/components/DensityToggle/DensityToggle.usage.md)          |
| Dialog           | Modal dialog with title, description, and action slots.                                              | [Dialog.usage.md](./packages/react/src/components/Dialog/Dialog.usage.md)                               |
| Input            | Single-line text input.                                                                              | [Input.usage.md](./packages/react/src/components/Input/Input.usage.md)                                  |
| Label            | Form label, pairs with Input.                                                                        | [Label.usage.md](./packages/react/src/components/Label/Label.usage.md)                                  |
| SegmentedControl | Connected pill control built on radio-group semantics with strict-axis arrow navigation.             | [SegmentedControl.usage.md](./packages/react/src/components/SegmentedControl/SegmentedControl.usage.md) |
| Select           | Compound select control with trigger, value, and item slots.                                         | [Select.usage.md](./packages/react/src/components/Select/Select.usage.md)                               |
| SkipLink         | Visually-hidden "skip to main content" anchor for keyboard accessibility (WCAG 2.4.1).               | [SkipLink.usage.md](./packages/react/src/components/SkipLink/SkipLink.usage.md)                         |
| Slider           | Numeric range input supporting single-value and range modes with pointer, keyboard, and touch input. | [Slider.usage.md](./packages/react/src/components/Slider/Slider.usage.md)                               |
| Switch           | Token-styled toggle switch.                                                                          | [Switch.usage.md](./packages/react/src/components/Switch/Switch.usage.md)                               |
| Tabs             | Tab-style navigation with panel content keyed by value.                                              | [Tabs.usage.md](./packages/react/src/components/Tabs/Tabs.usage.md)                                     |
| ThemeToggle      | Light/system/dark color-scheme control wired to useTheme; the for-coleman pattern.                   | [ThemeToggle.usage.md](./packages/react/src/components/ThemeToggle/ThemeToggle.usage.md)                |
| Tooltip          | Contextual hover and focus tooltip; supports asChild for inline-element wrapping (citation pattern). | [Tooltip.usage.md](./packages/react/src/components/Tooltip/Tooltip.usage.md)                            |
| VisuallyHidden   | Polymorphic component for screen-reader-only content.                                                | [VisuallyHidden.usage.md](./packages/react/src/components/VisuallyHidden/VisuallyHidden.usage.md)       |

## Hook index

Theme state is read and set through a hook plus its provider, rather than a component. Both ship a sidecar like the components do.

| Export | Summary | Sidecar |
| --- | --- | --- |
| useTheme | Multi-axis theme hook: per-axis preference, resolved, forced, available, and one set(partial). The next-themes analog. | [useTheme.usage.md](./packages/react/src/hooks/useTheme/useTheme.usage.md) |
| ThemeProvider | Single source of truth for theme state; the home for defaults and forced. | [useTheme.usage.md](./packages/react/src/hooks/useTheme/useTheme.usage.md) |

## Sidecar convention

Every shipped component has a `<Component>.usage.md` file co-located with its source. The file structure is documented in [`specs/005-agent-experience-foundation/contracts/sidecar-shape.md`](./specs/005-agent-experience-foundation/contracts/sidecar-shape.md), and the canonical template lives at [`packages/react/src/components/_template/Component.usage.md`](./packages/react/src/components/_template/Component.usage.md).

Code blocks in sidecars tagged `tsx` are validated for compile-correctness in CI via `scripts/validate-sidecars.ts`. If you copy a sidecar example into your app and it breaks, that's a bug in the sidecar, not in your app.

## Where to read more

- [Constitution](./.specify/memory/constitution.md) — the non-negotiable principles. Section XI is the one that mandates agent and human legibility as co-equal.
- [Theming](./THEMING.md) — how tokens, themes, and runtime JSON themes work.
- [`specs/`](./specs/) — feature specs, plans, and tasks. Recent specs cover the consumer DX preset (002), the versioning workflow (003), the primitive set expansion (004), and the agent-experience foundation (005, this work).
