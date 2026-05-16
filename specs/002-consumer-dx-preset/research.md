# Phase 0 Research: Consumer DX preset

## R1 — Polymorphic component pattern for `<VisuallyHidden>`

**Decision**: Use an `as` prop with default value `"span"`. Type the prop as `keyof JSX.IntrinsicElements` (or a constrained subset like `"span" | "div" | "p"`). Component signature:

```ts
type VisuallyHiddenProps<T extends keyof JSX.IntrinsicElements = "span"> = {
  as?: T
} & Omit<React.ComponentPropsWithoutRef<T>, "as">
```

**Rationale**: For a single tiny utility component, this is the lightest pattern that delivers polymorphism without dragging in a Slot/asChild abstraction. Other components in the codebase don't currently use polymorphism, so introducing a heavier pattern just for `<VisuallyHidden>` would be overengineering.

**Alternatives considered**:
- Radix-style `Slot` component (`asChild` pattern): more powerful, but the codebase doesn't use Radix and pulling it in for one component is overkill. Could be revisited if more polymorphic components surface (e.g., in spec 005's primitive expansion).
- Base UI's `useRender` primitive: exists in `@base-ui-components/react` per recent versions, but adds an indirect dependency for a 15-line component. Not worth it.
- Fixed element (always `<span>`): simpler, but blocks use cases like wrapping inline-block content where `<div>` would be more appropriate.

## R2 — Whether shadcn/ui or Base UI ship a first-party `VisuallyHidden`

**Decision**: Roll our own. Neither shadcn/ui nor `@base-ui-components/react` provide a first-party `VisuallyHidden` primitive.

**Rationale**: The component is approximately 15 lines (function signature, polymorphic forwarding, applying `.sr-only` via `className`). Adopting an external implementation would not save meaningful code while adding a dependency. The constitution Section IV says components are copied from upstream — when nothing upstream exists to copy, rolling our own following the same patterns is the next-best path.

**Alternatives considered**:
- Radix's `@radix-ui/react-visually-hidden`: well-tested, used by many DS. But the codebase deliberately avoids Radix in favor of Base UI (constitution Section IV).
- `react-aria` from Adobe: provides `<VisuallyHidden>`. Quality library but heavy compared to the work needed here.

## R3 — CSS approach for `<VisuallyHidden>`

**Decision**: Apply Tailwind's built-in `.sr-only` utility via `className`. The component body is essentially:

```tsx
<Tag {...rest} className={cn("sr-only", className)} />
```

**Rationale**: Spec FR-008 explicitly forbids redefining `.sr-only` ourselves (rationale: Tailwind v4 ships it; redefining creates a maintenance surface for no benefit). Using Tailwind's utility through `className` honors that constraint and produces the canonical visually-hidden CSS pattern (clip-path, absolute positioning, 1px sizing, overflow-hidden, whitespace-nowrap, border-0).

**Alternatives considered**:
- Inline `style={...}` with hardcoded CSS values: violates the "no hardcoded values" rule in constitution Section IV.
- A bespoke Tailwind utility we register via `@theme`: explicitly forbidden by spec FR-008.

## R4 — Shipping `preset.css` via tsup

**Decision**: Use tsup's `onSuccess` hook to invoke a small `node:fs` script that copies `src/preset.css` to `dist/preset.css`. Updated `tsup.config.ts`:

```ts
import { defineConfig } from "tsup"
import { copyFile } from "node:fs/promises"

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm"],
  dts: true,
  sourcemap: true,
  clean: true,
  external: ["react", "react-dom", "@base-ui-components/react"],
  onSuccess: async () => {
    await copyFile("src/preset.css", "dist/preset.css")
  },
})
```

**Rationale**: tsup does not bundle CSS, but the file is tiny and static — a plain copy is correct. The `onSuccess` hook runs after every build (including watch mode), so dev iteration stays fast.

**Alternatives considered**:
- A separate `scripts/copy-preset.mjs` invoked via package.json `postbuild`: works but adds indirection. tsup's `onSuccess` is the canonical extension point and keeps the build config in one file.
- Letting consumers `@import '@unbranded-ds/react/src/preset.css'` directly (no copy step): would require `src/` to be published in `files`, which exposes implementation detail. Bad.
- Using tsup's `loader` to "compile" CSS: tsup is a JS bundler; misusing it for CSS is a path to brittle builds.

## R5 — `themeBootstrapScript` content shape

**Decision**: A self-executing function wrapped in a try/catch, with the localStorage key and default theme both interpolated into the string at factory call time. Target output for `getThemeBootstrapScript({ defaultTheme: "light" })`:

```js
(function(){try{document.documentElement.setAttribute('data-theme',localStorage.getItem('unbranded-ds-theme')||'light')}catch(e){document.documentElement.setAttribute('data-theme','light')}})()
```

That's 199 bytes — well under the 250-byte target from Technical Context. The try/catch covers private-browsing and sandboxed contexts where `localStorage` access throws.

**Rationale**: Tiny, deterministic, custom-theme-friendly (no validation), CSP-stable (deterministic SHA hash for a given `defaultTheme`).

**Alternatives considered**:
- Multi-statement script with separate validation: makes the script larger and breaks custom themes (see /speckit.clarify Q5).
- Async with `Promise`: pointless for a synchronous DOM operation.
- Setting a CSS variable instead of a `data-theme` attribute: the existing theme CSS files are scoped to `[data-theme="..."]`, so the attribute is what needs to match.

## R6 — Deterministic factory output

**Decision**: The factory returns a template string with the `defaultTheme` interpolated. The localStorage key is interpolated from a module-private constant. No closures over external state, no runtime randomness, no environment-dependent values.

**Verification approach**:

```ts
// In a unit test
const a = getThemeBootstrapScript({ defaultTheme: "dark" })
const b = getThemeBootstrapScript({ defaultTheme: "dark" })
expect(a).toBe(b) // byte-for-byte equal
const hashA = createHash("sha256").update(a).digest("base64")
const hashB = createHash("sha256").update(b).digest("base64")
expect(hashA).toBe(hashB)
```

**Rationale**: Required by spec FR-014 — consumers using hash-based CSP allowlists need to compute the hash once and trust it across builds. If the factory output drifted (e.g., included a build timestamp), consumers would need to recompute hashes per build, breaking the hash-allowlist workflow.

## R7 — Test strategy for the bootstrap script

**Decision**: Three test layers, matching the existing testing baseline (constitution Section VI):

- **Unit (Vitest)**: Assert the factory returns the expected string for the default arg and for a non-default `defaultTheme`. Assert determinism (two calls return byte-identical output). Assert the key constant is present in the output.
- **Integration (Vitest + jsdom)**: `new Function(scriptString)()` in a jsdom environment with a pre-seeded `localStorage`. Verify `document.documentElement.getAttribute('data-theme')` matches the expected value.
- **CSP determinism (Vitest)**: Compute SHA-256 of the factory output twice; verify equality. This is the same test as part of unit-level determinism, but explicitly framed for the CSP contract.

**Rationale**: These tests cover the spec's FR-006 (behavior), FR-007 (blocked-storage safety), FR-014 (CSP hash stability) and pass under the existing CI configuration (constitution Section VIII names Vitest + jsdom).

No Storybook coverage for the bootstrap script — it's a string, not a component. Storybook coverage applies to `<VisuallyHidden>` (the React component) per constitution Section V.

**Alternatives considered**:
- Headless-browser integration tests (Playwright): overkill for a string-output helper. The jsdom path covers the contract.
- Snapshot testing the script string: tempting but brittle — any byte change (even a whitespace tweak) would fail the snapshot. Direct assertions on key + default substrings are sturdier.
