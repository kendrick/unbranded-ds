# Research: Autodoc legibility audit

**Phase 0 output** | **Date**: 2026-05-22

## Current TSDoc coverage

Audited all 14 component `.tsx` files. The baseline is sparse:

- **Full TSDoc** (component function + per-prop): SkipLink only
- **Partial TSDoc** (per-prop but no component function, or component function but no per-prop): Tooltip (prop interfaces documented, functions not), VisuallyHidden (component function documented, no per-prop breakdown)
- **No TSDoc**: Button, Card, Checkbox, Dialog, Input, Label, SegmentedControl, Select, Slider, Switch, Tabs

11 of 14 components need TSDoc written from scratch. The remaining 3 need restructuring to match the 6-section component template and 3-section prop template.

## Current story description coverage

Audited all 14 `.stories.tsx` files:

- **Component-level description** (`meta.parameters.docs.description.component`): present in 5 (SegmentedControl, Tooltip, SkipLink, VisuallyHidden, Tabs — though Tabs needs confirmation)
- **Story-level descriptions** (`parameters.docs.description.story`): present in SegmentedControl (all stories), Tooltip (2 of 4), SkipLink (all), VisuallyHidden (all)
- **argTypes descriptions**: present in SegmentedControl (6 props), Tooltip (3 props), SkipLink (3 props), Slider (10 props)
- **AI tells**: none detected in existing prose

Under TSDoc-as-canonical (Q5-collapse), the component-level description in `stories.tsx` becomes an optional override. The default path is that react-docgen propagates the TSDoc from the component function to the Storybook banner. The audit removes `meta.parameters.docs.description.component` when it would just duplicate TSDoc, and keeps it only when Storybook-specific content is genuinely needed (FR-007).

Similarly, `argTypes.description` values that duplicate TSDoc get removed (FR-008). The 4 components with argTypes descriptions need cross-referencing against the new per-prop TSDoc to decide which overrides survive.

## react-docgen propagation in Storybook 10.3

Decision: TSDoc-as-canonical works out of the box.

Storybook 10.3 ships `@storybook/react-docgen` which extracts JSDoc/TSDoc from component source at build time. The extracted content populates:

- `component.parameters.docs.description.component` (the autodoc banner) — from the TSDoc on the component function
- `argTypes[prop].description` (the Controls panel) — from the TSDoc on prop interface properties

Markdown in TSDoc renders correctly: headings, tables, code blocks, links, and bold/italic all display in the docs addon. The `@remarks` tag content appends to the one-line summary in the rendered output. `@example` blocks render as fenced code.

Rationale: this is the standard Storybook pipeline. No custom configuration needed. The existing `apps/storybook` setup already uses `@storybook/react-vite` with the docs addon enabled.

Alternatives considered: maintaining descriptions in both TSDoc and `stories.tsx` (rejected — duplicates source of truth, drift risk proven by spec-006 inbox bullets).

## WAI-ARIA APG pattern URLs

Decision: link the 10 components that have a direct APG pattern. Omit `@see` APG for the 4 without one.

| Component        | APG Pattern URL                                                         |
| ---------------- | ----------------------------------------------------------------------- |
| Button           | `https://www.w3.org/WAI/ARIA/apg/patterns/button/`                      |
| Card             | — (presentational container, no APG pattern)                            |
| Checkbox         | `https://www.w3.org/WAI/ARIA/apg/patterns/checkbox/`                    |
| Dialog           | `https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/`                |
| Input            | — (plain `<input>`, no dedicated APG pattern)                           |
| Label            | — (form label, no dedicated APG pattern)                                |
| SegmentedControl | `https://www.w3.org/WAI/ARIA/apg/patterns/radio/` (built on RadioGroup) |
| Select           | `https://www.w3.org/WAI/ARIA/apg/patterns/listbox/`                     |
| SkipLink         | — (bypass block technique, not an APG pattern)                          |
| Slider           | `https://www.w3.org/WAI/ARIA/apg/patterns/slider/`                      |
| Switch           | `https://www.w3.org/WAI/ARIA/apg/patterns/switch/`                      |
| Tabs             | `https://www.w3.org/WAI/ARIA/apg/patterns/tabs/`                        |
| Tooltip          | `https://www.w3.org/WAI/ARIA/apg/patterns/tooltip/`                     |
| VisuallyHidden   | — (utility, no APG pattern)                                             |

Rationale: FR-016 says "relevant WAI-ARIA APG pattern." Card, Input, Label, SkipLink, and VisuallyHidden don't map to an APG interaction pattern. Fabricating a link to the nearest loosely-related pattern would mislead consumers. SkipLink implements WCAG 2.4.1's bypass-blocks success criterion, not an APG pattern — the `@see` can reference the WCAG SC instead.

## Validator extension approach (FR-019)

Decision: extend the existing `scripts/validate-sidecars.ts` to also extract `@example` blocks from `.tsx` source TSDoc.

Implementation:

1. Add a `findTsxSourceFiles(root)` function that walks `packages/react/src/components/**/*.tsx` (excluding `.stories.tsx`, `.test.tsx`, and `__ssr__` files)
2. Add an `extractTsDocExamples(content, file)` function that parses TSDoc comments and pulls code from `@example` tags (the content between `@example` and the next tag or comment close)
3. Feed extracted blocks through the same `wrapBlock` + `tsc --noEmit` pipeline
4. Update the main function to run both sidecar validation and TSDoc example validation, reporting failures from both

Rationale: reuses the existing compile infrastructure. One validator, one CI step, same error format. No new dependencies.

Alternatives considered: separate validator script (rejected — duplicates the temp-dir + tsc plumbing, adds a second CI step to maintain).

## Compound component shape catalog

Needed for FR-010's placement rules (overview TSDoc on aggregating export + per-slot TSDoc):

**Dot notation** (object literal as aggregating export):

- **Slider**: `Slider` object → `.Root`, `.Control`, `.Track`, `.Indicator`, `.Thumb` (5 slots)
- **SegmentedControl**: `SegmentedControl` object → `.Root`, `.Item` (2 slots)
- **Tooltip**: `Tooltip` object → `.Provider`, `.Trigger`, `.Content` (3 slots)

**Sibling exports** (separate named exports, primary component is the aggregating surface):

- **Card**: `Card` (primary) + `CardHeader`, `CardTitle`, `CardDescription`, `CardAction`, `CardContent`, `CardFooter` (6 slots)
- **Dialog**: `Dialog` (primary) + `DialogTrigger`, `DialogPortal`, `DialogClose`, `DialogOverlay`, `DialogContent`, `DialogHeader`, `DialogFooter`, `DialogTitle`, `DialogDescription` (9 slots)
- **Select**: `Select` (primary) + `SelectGroup`, `SelectValue`, `SelectTrigger`, `SelectContent`, `SelectLabel`, `SelectItem`, `SelectSeparator`, `SelectScrollUpButton`, `SelectScrollDownButton` (9 slots)
- **Tabs**: `Tabs` (primary) + `TabsList`, `TabsTrigger`, `TabsContent` (3 slots)

For dot-notation compounds, the overview TSDoc goes on the object literal declaration. For sibling-export compounds, the overview TSDoc goes on the primary component function (e.g., `Card`, `Dialog`).

## Sidecar alignment strategy

Each component has a `.usage.md` sidecar shipped by spec 006. The sidecar's prose is the intent reference for the TSDoc audit. The mapping is structural, not copy-paste:

| Sidecar section                   | TSDoc target                                                   |
| --------------------------------- | -------------------------------------------------------------- |
| Title + opening paragraph         | One-line summary                                               |
| "When to use"                     | `@remarks` extended description + `### When to use` subsection |
| "When not to use" (where present) | `### When not to use` subsection                               |
| Props table Description column    | Per-prop TSDoc (WHAT + WHEN)                                   |
| Accessibility section             | `### Accessibility` subsection                                 |
| Keyboard interaction details      | `### Keyboard interactions` table                              |
| Common patterns code blocks       | `@example` blocks                                              |
| Related components                | `@see {@link ...}` cross-references                            |

The TSDoc paraphrases with the same intent, same use cases named, same WHAT + WHEN bar. Verbatim copying would create a maintenance burden when one surface updates and the other doesn't.
