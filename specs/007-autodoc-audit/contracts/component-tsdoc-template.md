# Component-level TSDoc template (6-section)

The canonical shape for the TSDoc block on every component function (single components) or aggregating export (compound components). This block renders in IDE hover AND propagates to the Storybook autodoc banner via react-docgen.

## Template

````typescript
/**
 * One-line summary (≤ 120 chars). Names what the component is. Active voice.
 *
 * @remarks
 * Extended description (2-6 sentences). Composition behavior, intended slot,
 * polymorphism (asChild when relevant), non-obvious render semantics.
 *
 * ### Accessibility
 *
 * ARIA pattern reference, roles applied automatically, focus management,
 * screen reader name resolution. Plain-prose enumeration.
 *
 * ### Keyboard interactions
 *
 * | Key | Description |
 * | --- | --- |
 * | `Enter` / `Space` | Activates the component. |
 *
 * (Omit this entire subsection for components without keyboard behavior:
 *  Card, Input, Label, SkipLink, VisuallyHidden.)
 *
 * ### When to use
 *
 * - Consumer scenario A.
 * - Consumer scenario B.
 *
 * ### When not to use
 *
 * - Use {@link SiblingComponent} when [alternative scenario].
 *
 * @example Minimum viable usage
 * ```tsx
 * import { Component } from '@unbranded-ds/react';
 *
 * export function Example() {
 *   return <Component>Content</Component>;
 * }
 * ```
 *
 * @example Non-obvious feature (e.g., controlled state, asChild, icon-only)
 * ```tsx
 * import { Component } from '@unbranded-ds/react';
 *
 * export function ControlledExample() {
 *   const [open, setOpen] = useState(false);
 *   return <Component open={open} onOpenChange={setOpen}>Content</Component>;
 * }
 * ```
 *
 * @see https://www.w3.org/WAI/ARIA/apg/patterns/<pattern>/
 * @see {@link SiblingComponent}
 */
````

## Rules

- The block MUST be attached directly to the declaration it documents (FR-021). No floating blocks between imports.
- The one-line summary must fit in 120 characters. It names the component in the same register as Radix / React Aria docs.
- `@remarks` carries the extended description. Storybook renders everything after the first paragraph break as the extended section.
- Subsection headings (`### Accessibility`, `### Keyboard interactions`, etc.) render as Markdown in both Storybook docs and IDE hover (VS Code, JetBrains).
- The keyboard table uses Radix-style `Key | Description` columns. Source from the sidecar accessibility prose and verify against Base UI primitive behavior.
- `@example` blocks must compile via `tsc --noEmit` (FR-019). Each example is preceded by a one-line label and fenced as `tsx`.
- `@see` links to the WAI-ARIA APG pattern URL (where one exists) and to sibling components via `{@link}`.
- Cross-references to sibling components use `{@link ComponentName}` notation, not plain prose (FR-020).

## Compound component placement

**Dot notation** (Slider, SegmentedControl, Tooltip): the full 6-section block goes on the object literal declaration (e.g., `const Slider = { Root: SliderRoot, ... }`). Per-slot functions get a shorter block: one-line summary + accessibility note + props pointer.

**Sibling exports** (Card, Dialog, Select, Tabs): the full 6-section block goes on the primary component function (e.g., `function Card(...)`). Per-slot functions get the same shorter block.

## Per-slot TSDoc (shorter form)

```typescript
/**
 * One-line summary of this slot's role in the compound.
 *
 * Accessibility: [any slot-specific ARIA or focus behavior].
 *
 * @see {@link ParentComponent} for full keyboard interactions and usage guidance.
 */
```
