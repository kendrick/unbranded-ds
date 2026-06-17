# Phase 1 Data Model: Next.js 15 example app

The example persists no new data. It reads and writes the design system's existing theme and density preferences. "Model" here means the structural pieces the app is built from: its routes, the theme state it surfaces, the components it demonstrates, the override targets, and the testable experiences. Tasks decompose against these.

## Routes

| Route       | Type   | Purpose                                                                                                                                                      |
| ----------- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `/`         | home   | Canonical wiring on display; one example of each component; the two-container-width container-query demo; the header (ThemeToggle, DensityToggle, SkipLink). |
| `/showcase` | nested | Proves theme and density persist across navigation with no flash; hosts the pinned vaporwave + compact section via `forced`.                                 |

## Theme state (existing keys, no new storage)

| Key                             | Axis                                 | Values                                          | Written by               |
| ------------------------------- | ------------------------------------ | ----------------------------------------------- | ------------------------ |
| `unbranded-ds-theme`            | aesthetic (holds color-scheme today) | `light`, `dark`, and the other aesthetic values | bootstrap and provider   |
| `unbranded-ds-density`          | density                              | `comfortable`, `compact`                        | bootstrap and provider   |
| `unbranded-ds-theme-preference` | color-scheme intent                  | `system`                                        | provider (companion key) |

The app touches these only through `getThemeBootstrapScript()` and `useTheme()` / `ThemeProvider`. It introduces none of its own.

## Demonstrated components (from `packages/react/src/index.ts`)

- Header and controls: `ThemeToggle`, `DensityToggle`.
- Navigation and accessibility: `SkipLink` (first focusable element), `VisuallyHidden` (screen-reader-only labels).
- Content: `Button`, `Card`, `Checkbox`, `Dialog`, `Input`, `Label`, `SegmentedControl`, `Select`, `Slider`, `Switch`, `Tabs`, `Tooltip`.
- Exercised implicitly by the app: the `useTheme` hook and the `cn` utility.

## Override targets (the consumer-override seam)

| Target                   | Mechanism                                 | Demonstrates                                    |
| ------------------------ | ----------------------------------------- | ----------------------------------------------- |
| `--typography-font-sans` | `next/font/local` plus a `:root` override | Swapping the font token for a self-hosted face. |
| a few `--color-*`        | `:root` override block                    | Repainting palette tokens.                      |

Both live in one clearly-marked, removable block. Removing it reverts to design-system defaults (SC-005).

## Testable experiences (drive the e2e specs)

Render with DS styling, no-flash on reload, live toggle switch, OS-follow on `system`, the pinned composition, each component present, narrow-width layout holds, cross-route persistence, and axe clean. Each maps to a functional requirement and a Playwright spec; see [contracts/e2e.md](./contracts/e2e.md).
