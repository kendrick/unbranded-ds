# @unbranded-ds/react

React component library for the unbranded-ds design system. Built on `@base-ui-components/react` primitives in the shadcn/ui style. Styled exclusively through `@unbranded-ds/tokens` — no hardcoded values.

## Quickstart

In any Tailwind v4 React project, add two lines to your global stylesheet:

```css
@import 'tailwindcss';
@import '@unbranded-ds/react/preset.css';
```

That's the whole wiring. The `./preset.css` export wraps the tokens preset and adds the Tailwind `@source` directive scoped to the React package's own files. Any shipped component now renders with its intended styling on the first page load.

```tsx
import { Button } from '@unbranded-ds/react';

export default function Page() {
	return <Button>Hello unbranded</Button>;
}
```

To bring in default theme values, also import a theme file from the tokens package below the preset import:

```css
@import 'tailwindcss';
@import '@unbranded-ds/react/preset.css';
@import '@unbranded-ds/tokens/themes/light.css';
@import '@unbranded-ds/tokens/themes/dark.css';
```

## What's in the package

Ten React components:

- `<Button>`, `<Card>`, `<Checkbox>`, `<Dialog>`, `<Input>`, `<Label>`, `<Select>`, `<Switch>`, `<Tabs>` — adopted from shadcn/ui's Base UI variant
- `<VisuallyHidden>` — rolled in-house (Base UI does not ship a primitive for this)

Plus the `cn()` className-merging utility.

## `<VisuallyHidden>`

Polymorphic React component for screen-reader-only markup. Useful for icon-button labels, skip-link targets, ARIA descriptions, and any context where sighted users do not need the text but assistive technology does.

```tsx
import { VisuallyHidden } from '@unbranded-ds/react';
import { EyeIcon } from 'lucide-react';

<button>
	<EyeIcon />
	<VisuallyHidden>Show settings</VisuallyHidden>
</button>;
```

Screen readers announce "Show settings"; sighted users see only the icon.

The component uses Tailwind v4's built-in `.sr-only` utility internally — it does not define a custom class. For static markup, the class is also available directly:

```tsx
<span className="sr-only">Same effect, no component</span>;
```

The `as` prop controls the underlying element, defaulting to `<span>`:

```tsx
<VisuallyHidden as="div">
	<h2>Section heading visible only to screen readers</h2>
</VisuallyHidden>;
```

## Migrating from 0.1.0

The 0.2.0 wiring is two lines instead of three. The leakiest line — the `@source` directive pointing at `node_modules/@unbranded-ds/react` — is now bundled into the new `./preset.css` export:

```diff
- @import 'tailwindcss';
- @import '@unbranded-ds/tokens/dist/tailwind/preset.css';
- @source "../node_modules/@unbranded-ds/react";
+ @import 'tailwindcss';
+ @import '@unbranded-ds/react/preset.css';
```

The companion breaking change lives in [`@unbranded-ds/tokens@0.2.0`](../tokens/CHANGELOG.md) (wildcard export removal). If your stylesheet imports anything from `@unbranded-ds/tokens/dist/...`, see the [tokens README migration section](../tokens/README.md#migrating-from-010) for the full set of changes.

`<VisuallyHidden>` is a pure addition — no migration required to adopt it. Existing 0.1.0 markup using Tailwind's `.sr-only` className continues to work unchanged.

## Storybook + MCP

Component documentation is published via Chromatic with an MCP server attached so AI agents can introspect the component surface. See [apps/storybook](../../apps/storybook) for the local Storybook setup and MCP wiring.

## License

MIT.
