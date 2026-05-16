# Contract: TypeScript exports

The public TypeScript API surface added by this spec.

## `@unbranded-ds/tokens`

### `@unbranded-ds/tokens/runtime` — new named exports

```ts
/**
 * A self-executing JavaScript string that reads the saved theme from
 * localStorage (`unbranded-ds-theme`) and applies `data-theme` to the
 * document root before first paint. Falls back to `'light'` on missing,
 * blocked, or invalid storage.
 *
 * Inline as the body of a `<script>` tag in `<head>` to prevent the
 * flash-of-wrong-theme on page reload. Equivalent to
 * `getThemeBootstrapScript()` with no arguments.
 *
 * @example
 * ```tsx
 * import { themeBootstrapScript } from '@unbranded-ds/tokens/runtime'
 *
 * export default function RootLayout({ children }) {
 *   return (
 *     <html>
 *       <head>
 *         <script dangerouslySetInnerHTML={{ __html: themeBootstrapScript }} />
 *       </head>
 *       <body>{children}</body>
 *     </html>
 *   )
 * }
 * ```
 */
export const themeBootstrapScript: string

/**
 * Factory that returns a self-executing JavaScript string with a
 * caller-specified fallback theme. Use when the default starting theme
 * is not `'light'` (for example, dark-by-default kiosks, theaters, or
 * editorial apps).
 *
 * The output is deterministic across builds for any given `defaultTheme`
 * argument — consumers using SHA hash-based Content Security Policies
 * can compute the hash once and trust it across builds.
 *
 * @example
 * ```tsx
 * import { getThemeBootstrapScript } from '@unbranded-ds/tokens/runtime'
 *
 * const bootstrap = getThemeBootstrapScript({ defaultTheme: 'dark' })
 *
 * export default function RootLayout({ children }) {
 *   return (
 *     <html>
 *       <head>
 *         <script dangerouslySetInnerHTML={{ __html: bootstrap }} />
 *       </head>
 *       <body>{children}</body>
 *     </html>
 *   )
 * }
 * ```
 */
export function getThemeBootstrapScript(options?: {
  defaultTheme?: string
}): string
```

### `@unbranded-ds/tokens` — package.json exports map (after this spec)

```json
{
  "exports": {
    ".": {
      "types": "./dist/ts/index.d.ts",
      "import": "./dist/ts/index.js"
    },
    "./runtime": {
      "types": "./dist/ts/runtime.d.ts",
      "import": "./dist/ts/runtime.js"
    },
    "./preset.css": "./dist/tailwind/preset.css"
  }
}
```

The `./dist/css/*` and `./dist/tailwind/*` wildcard entries from 0.1.0 are removed (FR-009).

The `./themes/*` files (`light.css`, `dark.css`, `brand.css`) are referenced by THEMING.md's "register + defaults" pattern. Their export shape is unchanged by this spec; the relevant entries remain in the `files` field.

## `@unbranded-ds/react`

### `@unbranded-ds/react` — new named exports

```ts
/**
 * Renders its children in a visually-hidden but assistive-technology-accessible
 * manner. Useful for screen-reader-only labels on icon buttons, skip-link
 * targets, ARIA descriptions, and any context where sighted users do not
 * need the text but assistive technology does.
 *
 * Polymorphic — the `as` prop controls the underlying element type. Defaults
 * to `<span>`.
 *
 * Uses Tailwind's built-in `.sr-only` utility for the visually-hidden
 * treatment; does not redefine the class.
 *
 * @example Icon button with screen-reader label
 * ```tsx
 * import { VisuallyHidden } from '@unbranded-ds/react'
 *
 * <button>
 *   <EyeIcon />
 *   <VisuallyHidden>Show settings</VisuallyHidden>
 * </button>
 * ```
 *
 * @example As a block-level wrapper
 * ```tsx
 * <VisuallyHidden as="div">
 *   <h2>Section heading visible only to screen readers</h2>
 * </VisuallyHidden>
 * ```
 */
export function VisuallyHidden<
  T extends keyof JSX.IntrinsicElements = "span"
>(props: VisuallyHiddenProps<T>): React.ReactElement

export type VisuallyHiddenProps<T extends keyof JSX.IntrinsicElements = "span"> = {
  as?: T
  children?: React.ReactNode
  className?: string
} & Omit<React.ComponentPropsWithoutRef<T>, "as" | "children" | "className">
```

### `@unbranded-ds/react` — package.json exports map (after this spec)

```json
{
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js"
    },
    "./preset.css": "./dist/preset.css"
  }
}
```

A new `./preset.css` entry is the only addition. The `.` entry continues to export the component library.

## Removed exports (breaking changes)

These exports existed in 0.1.0 and are removed in 0.2.0:

| Package | Removed export | Replacement |
|---|---|---|
| `@unbranded-ds/tokens` | `./dist/css/*` (wildcard) | None — direct `dist/` paths are no longer canonical. Theme defaults still reachable via `./themes/<name>.css` |
| `@unbranded-ds/tokens` | `./dist/tailwind/*` (wildcard) | `./preset.css` (clean alias) |

Migration guidance lives in [contracts/migration.md](./migration.md) and is required by spec FR-017.
