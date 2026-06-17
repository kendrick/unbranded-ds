# Contract: the popover surface token

The observable contract of the new tokens — what a consumer, an agent, or the token-query MCP can rely on, and what the build enforces.

## Emitted tokens

After the build, the design system emits two new CSS custom properties wherever it emits color tokens (the base layer and every theme cell):

```css
--color-popover: <that cell's background value>;
--color-popover-foreground: <that cell's foreground value>;
```

Tailwind v4's `@theme` maps these to the `bg-popover` and `text-popover-foreground` utilities automatically, so the existing `Dialog`, `Tooltip`, and `Select` content classes resolve to a real, opaque surface with no component change.

## Token map / MCP

`token-map.ts` gains two entries, both `source: 'schema'`:

```jsonc
{
  "color.popover":            { "cssVariable": "--color-popover",            "category": "color", "type": "color", "source": "schema" },
  "color.popover-foreground": { "cssVariable": "--color-popover-foreground", "category": "color", "type": "color", "source": "schema" }
}
```

The token-query MCP reads the map, so `popover` and `popover-foreground` become queryable (palette, semantic lookup) with no MCP code change. They report as canonical schema tokens, not theme extensions.

## Validation contract

| Condition | Result |
|-----------|--------|
| A bundled cell omits `popover` or `popover-foreground` | `validateComposedTheme` fails that cell with a coded completeness issue; the build does not ship. |
| Either popover pair measures below 4.5:1 in any cell | `themes-contrast.test.ts` fails that cell with the pair and ratio; the build does not ship. |
| A consumer *partial* theme omits popover | Inherits `canonicalDefaultTokens.color.popover` (the default surface); no failure. |
| A consumer theme declares popover below AA | Theme validation returns `{ ok: false, issues }` with the pair, consistent with the existing contract. |

## Behavior the fix guarantees

- The `Dialog`, `Tooltip`, and `Select` content surfaces render fully opaque; nothing behind them shows through.
- The Dialog description (`muted-foreground` on the popover surface) clears WCAG AA, because the surface equals `background` and `muted-foreground`/`background` already passes.
- No existing token value changes, so no other validated text/background pair moves.

## Non-goals (explicit)

- No distinct "elevated" popover tone — the value is flat-equal to `background`; elevation stays visual (ring + shadow).
- No `muted-foreground` change, global or scoped.
- No component public-API or rendered-structure change beyond the surface becoming opaque.
- No new `card` or other surface token; this defines `popover` only.
