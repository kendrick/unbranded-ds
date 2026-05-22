# Data Model: Autodoc legibility audit

**Phase 1 output** | **Date**: 2026-05-22

This spec is prose-only — no runtime data structures, no database, no persisted state. The "data model" here is the set of structured entities the audit creates or modifies in source files.

## Entities

### TSDoc block (component-level)

A structured comment block attached to a component function or aggregating export declaration.

**Fields** (sections within the block):

| Section                     | Required    | Content                                                    |
| --------------------------- | ----------- | ---------------------------------------------------------- |
| One-line summary            | yes         | ≤ 120 chars, names the component                           |
| `@remarks`                  | yes         | 2-6 sentences, composition + semantics                     |
| `### Accessibility`         | yes         | ARIA pattern, roles, focus, screen reader                  |
| `### Keyboard interactions` | conditional | Markdown table, only for components with keyboard behavior |
| `### When to use`           | yes         | Bulleted consumer scenarios                                |
| `### When not to use`       | yes         | Bulleted alternatives with `{@link}`                       |
| `@example`                  | yes (1+)    | Compilable `tsx` blocks                                    |
| `@see`                      | conditional | APG URL (where relevant) + sibling `{@link}`               |

**Relationships**: one per component function (single) or one overview + N per-slot (compound). Per-slot blocks are a shorter form (one-line summary + accessibility + `@see` parent).

**Validation**: `@example` blocks compile via `tsc --noEmit` (FR-019 validator). Block must be declaration-attached (FR-021).

### TSDoc block (prop-level)

A structured comment block attached to a property in an exported interface or type.

**Fields**:

| Section                   | Required    | Content                        |
| ------------------------- | ----------- | ------------------------------ |
| Description (WHAT + WHEN) | yes         | One sentence, active voice     |
| Behavior nuance           | no          | One sentence, edge cases       |
| `Accessibility:` note     | no          | One sentence, prefixed         |
| `@defaultValue`           | conditional | Required when a default exists |
| `@example`                | no          | Only for hard-to-grasp props   |

**Relationships**: one per property on every exported prop interface across 14 components. Propagates to Storybook Controls panel via react-docgen.

**Validation**: WHAT + WHEN bar (FR-003) enforced by reviewer judgment. `@defaultValue` must match actual runtime default.

### Story description

A string value at `story.parameters.docs.description.story` in a `.stories.tsx` file.

**Fields**:

| Field            | Required | Content                          |
| ---------------- | -------- | -------------------------------- |
| Description text | yes      | One sentence naming the use case |

**Relationships**: one per named story across all 14 components. Independent of TSDoc (this is the only stories-meta surface with no TSDoc fallback).

**Validation**: humanizer review (no AI tells). Trivial variant stories get a tight one-sentence description.

### Inbox bullet

A drift item from `specs/006-sidecar-retrofit/spec-007-inbox.md`. Six exist at spec start. Each closes when the corresponding TSDoc edit lands.

**Fields**:

| Field      | Content                       |
| ---------- | ----------------------------- |
| Location   | File path + line range        |
| Component  | Which component               |
| Issue      | What's missing or wrong       |
| Resolution | The TSDoc edit that closes it |

**State transitions**: open → closed (struck through or removed in inbox file, with commit reference).

## Component catalog

The 14 components and their audit characteristics:

| Component        | Shape              | Slots | Keyboard | APG pattern  | Inbox bullets | Existing TSDoc           |
| ---------------- | ------------------ | ----- | -------- | ------------ | ------------- | ------------------------ |
| Button           | single             | —     | yes      | button       | #1            | none                     |
| Card             | compound (sibling) | 6     | no       | —            | —             | none                     |
| Checkbox         | single             | —     | yes      | checkbox     | —             | none                     |
| Dialog           | compound (sibling) | 9     | yes      | dialog-modal | #2, #3        | none                     |
| Input            | single             | —     | no       | —            | —             | none                     |
| Label            | single             | —     | no       | —            | —             | none                     |
| SegmentedControl | compound (dot)     | 2     | yes      | radio        | #6            | none                     |
| Select           | compound (sibling) | 9     | yes      | listbox      | —             | none                     |
| SkipLink         | single             | —     | no       | —            | —             | full                     |
| Slider           | compound (dot)     | 5     | yes      | slider       | #4, #5        | none                     |
| Switch           | single             | —     | yes      | switch       | —             | none                     |
| Tabs             | compound (sibling) | 3     | yes      | tabs         | —             | none                     |
| Tooltip          | compound (dot)     | 3     | yes      | tooltip      | —             | partial (props only)     |
| VisuallyHidden   | single             | —     | no       | —            | —             | partial (component only) |
