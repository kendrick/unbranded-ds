# Contract: Sidecar `*.usage.md` shape

Every `<Component>.usage.md` file follows the structure defined here. The template at `packages/react/src/components/_template/Component.usage.md` is the canonical reference and is itself an example of the structure.

## File location

Sidecars live alongside their component source:

```
packages/react/src/components/<Component>/
├── <Component>.tsx
├── <Component>.stories.tsx
├── <Component>.test.tsx
├── <Component>.usage.md        # this contract
└── index.ts
```

For compound components (Tooltip, Slider, SegmentedControl, Tabs), exactly one `<Component>.usage.md` lives at the top-level component directory. Slots are subsections inside that file, not separate files.

## File structure

A sidecar consists of these sections, in this order:

### 1. Heading

```markdown
# <Component>

One-line tagline that names the component's role.
```

### 2. When to use

A single paragraph identifying the consumer scenario the component addresses. Active voice. No promotional language. Specific over generic.

Example:

```markdown
## When to use

Use Tooltip to surface short contextual information when a user hovers,
focuses, or taps an element. Common cases include citation hovers in
editorial content and label clarifications on icon-only buttons.
```

### 3. Import

A single `tsx` code block showing the import statement:

```markdown
## Import

\`\`\`tsx
import { Tooltip } from '@unbranded-ds/react';
\`\`\`
```

The block is compile-validated by the CI step (see FR-017a).

### 4. Props

Markdown table with columns: `Prop`, `Type`, `Default`, `Description`.

For single-component sidecars, one table.

For compound-component sidecars, one subsection per slot (e.g., `### Provider props`, `### Trigger props`, `### Content props`), each with its own table.

The Description column explains both WHAT the prop does AND WHEN a consumer would reach for it (per FR-019 — same standard the autodoc audit enforces).

### 5. Common patterns

One, two, or four code blocks tagged `tsx`. Each block is preceded by a one-paragraph explanation that names the use case. Never three blocks (Section XI.1).

Example:

```markdown
## Common patterns

### Wrapping an inline element

When you want a tooltip on a non-button inline element like a citation
marker, pass `asChild` to the trigger so the wrapper doesn't inject an
extra `<button>`.

\`\`\`tsx
<Tooltip.Provider>
<sup>
<Tooltip.Trigger asChild>
<a href="#source">[P-04]</a>
</Tooltip.Trigger>
</sup>
<Tooltip.Content>Spencer interview, NPR 2017</Tooltip.Content>
</Tooltip.Provider>
\`\`\`

### Custom positioning

...
```

### 6. Accessibility

Plain-prose narrative covering keyboard interaction, screen-reader announcements, ARIA roles, focus management. Names specific keys and behaviors.

Example:

```markdown
## Accessibility

Tooltip opens when the trigger receives keyboard focus or pointer hover
(after the configured delay). Pressing Escape closes the tooltip and
returns focus to the trigger. On touch devices, tap toggles open/close.
The content is announced as a tooltip role to assistive technology.

When `prefers-reduced-motion: reduce` is set, the open and close transitions
are skipped entirely per WCAG SC 2.3.3.
```

### 7. Variants and slots

Lists the CVA variant axes with their values and defaults. For compound components, lists the slot components and their roles.

Example:

```markdown
## Variants and slots

Tooltip has no CVA variant axes. Its positioning is via `side` and
`align` props on `Tooltip.Content`, which are pass-through props from
Base UI rather than CVA axes.

### Slots

- `Tooltip.Provider`: configuration boundary (delayDuration, container).
- `Tooltip.Trigger`: the element that opens the tooltip.
- `Tooltip.Content`: the floating panel.
```

For a component with no variants AND no slots (e.g., Label, SkipLink), the section reads:

```markdown
## Variants and slots

No CVA variant axes. No compound slots; the component is rendered as a
single element.
```

### 8. Related (conditional)

Per FR-015a, this section appears when one or more sibling components or primitives are relevant. The section is omitted entirely when nothing relates — no empty placeholder.

Example:

```markdown
## Related

- [Dialog](../Dialog/Dialog.usage.md) — when the content needs to be
  modally focused and the user actively interacts with it, prefer Dialog.
- [Popover](../Popover/Popover.usage.md) (planned) — when the content
  is interactive but not modal.
```

## Validation

### Prose

- Section XI.1 rules apply: no three-item lists, no em-dash overuse, no AI tells.
- Humanizer pass MUST happen before merge.

### Code blocks

- `tsx`-tagged blocks are compile-validated by `scripts/validate-sidecars.ts`.
- Other languages (`bash`, `json`) are not validated.
- A failing extraction or compile error blocks the verify job.

### Cross-checks

- Prop signatures and defaults in the sidecar MUST agree with the component's TypeScript signatures and `argTypes` defaults (FR-013).
- Usage patterns in the sidecar MUST agree with the component's stories (FR-014).
- Accessibility notes MUST capture what the component does for keyboard and screen reader users (FR-015).

These cross-checks are manual review activities for v1; future automation could compare sidecar prop tables against generated component metadata.

## What this contract does NOT cover

- Sidecar rendering inside Storybook (deferred to a future spec).
- Auto-generation of sidecars from component metadata (deferred per the manual-authoring decision in research.md).
- Inclusion of sidecar files in the published `@unbranded-ds/react` npm artifact (separate decision tied to the package's `files` field; not addressed here).
