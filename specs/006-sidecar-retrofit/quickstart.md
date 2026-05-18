# Quickstart: Authoring a sidecar

**Spec**: [spec.md](./spec.md) | **Plan**: [plan.md](./plan.md)
**Date**: 2026-05-18

This is the per-PR author guide for writing one component sidecar. Follow it once per component until all 14 ship. The backfill PR has its own short procedure at the end.

## Before you start

Read these once. You won't need to re-read on subsequent PRs.

- The base sidecar contract at [specs/005-agent-experience-foundation/contracts/sidecar-shape.md](../005-agent-experience-foundation/contracts/sidecar-shape.md) — defines section order and content
- This spec's amendments at [contracts/sidecar-shape-amendments.md](./contracts/sidecar-shape-amendments.md) — narrows the contract in three places
- The canonical example at `packages/react/src/components/_template/Component.usage.md` — Button-based working template

## Per-component PR — 8 steps

### 1. Pick a component

Components remaining: check `packages/react/src/components/` for directories that still lack a `<Component>.usage.md`. The cohort can land in any order (FR-assumption). Pick by familiarity, by importance, or alphabetically — all work.

### 2. Branch and copy the template

```bash
git checkout main && git pull
git checkout -b sidecar/<component-kebab>
cp packages/react/src/components/_template/Component.usage.md \
   packages/react/src/components/<Component>/<Component>.usage.md
```

### 3. Read the component source and stories

Open `<Component>.tsx` and `<Component>.stories.tsx` side-by-side. You'll pull from both:

- **Prop table**: from `<Component>.tsx`. The TS interface or props type gives you the `Type` column and required-vs-optional. The destructuring default in the function body (`function Foo({ size = 'md', ...props })`) gives you the `Default` column. If `argTypes` in the stories disagrees with the runtime default, the code wins — note the drift for step 7.
- **Common patterns**: from `<Component>.stories.tsx`. Each story exemplifies one usage pattern. Pick the ones that map to consumer use cases (e.g., `Primary`, `Destructive`, `WithIcon`) and reproduce them as `tsx` code blocks.
- **Accessibility**: from `<Component>.tsx` (look for ARIA props, keyboard handlers, focus management) and `<Component>.test.tsx` (interaction tests reveal expected keyboard behavior). When the component wraps a Base UI primitive, the primitive's accessibility behavior carries through unless overridden.

### 4. Write the sidecar

Section by section, in order. Use the canonical example as a voice reference, not a literal template — your component's content will differ.

**Heading + tagline**: `# <Component>` plus a one-line tagline naming the component's role.

**When to use**: One paragraph. Active voice. Concrete consumer scenarios. No marketing voice ("powerful," "intuitive," "robust" → out).

**Import**: One `tsx` block with the import statement. The validator will compile it.

**Props**: Table for single-component sidecars (Button, Checkbox, Input, Label, SkipLink, Switch, VisuallyHidden). Per-export subsections for compound sidecars (Card, Dialog, SegmentedControl, Select, Slider, Tabs, Tooltip). Per amendment 2, every named export gets a subsection — full table for core slots, one-line "inherits all props from X" for escape-hatch slots.

**Common patterns**: 2-5 `tsx` code blocks, each preceded by a one-paragraph use-case explanation. Multi-component examples are allowed when needed (e.g., `<Label><Input /></Label>`). All blocks compile through `tsc --noEmit`.

**Accessibility**: Plain-prose narrative. Name specific keys (`Tab`, `Enter`, `Space`, `Escape`, `ArrowDown`), specific behaviors (focus moves, content announces), specific ARIA roles. Mention `prefers-reduced-motion` when the component has transitions.

**Variants and slots**: Lists CVA axes (e.g., `variant: default, destructive, outline, secondary, ghost, link`). For compounds, names each slot with its role. For components with neither variants nor slots (Label, SkipLink, VisuallyHidden), use the canonical placeholder text from spec 005's contract.

**Related** (forward-only on this PR): Only link to sidecars that already exist on `main`. If a relevant peer's sidecar isn't merged yet, leave it for the backfill PR. If nothing is currently relevant, omit the section entirely.

### 5. Validate locally

```bash
pnpm exec tsx scripts/validate-sidecars.ts
```

Confirms every `tsx` block in every sidecar compiles. Iterate on any errors before pushing.

### 6. Run prose through humanizer

Open the new sidecar in your editor. Apply the humanizer rules:

- Remove em-dash overuse (one or two per sidecar maximum)
- Remove "serves as," "ensures," "leverages," "robust," "powerful," "intuitive"
- Restructure any three-item lists (drop to two, add a fourth, or convert to a sentence) — code lists like `'a' | 'b' | 'c'` are exempt
- Cut signposting ("In this section we'll explore," "Let's now look at")
- Replace passive voice with active

### 7. Add the changeset

Create `.changeset/add-<component-kebab>-sidecar.md`:

```markdown
---
'@unbranded-ds/react': patch
---

Add usage sidecar for <Component>.
```

### 8. Optional: append to spec-007-inbox

If while reading the component source you noticed TSDoc/JSDoc drift (a stale comment, a missing description on a prop, an outdated reference to old behavior), append a bullet to `specs/006-sidecar-retrofit/spec-007-inbox.md`:

```markdown
- `packages/react/src/components/<Component>/<Component>.tsx:42-48` — TSDoc on `variant` prop still claims "for primary CTAs" but the prop's actual scope is broader. Observed while authoring `<Component>.usage.md`.
```

Create the file with a brief header (purpose, link back to this spec) if it doesn't exist yet — you're the first to observe drift on this cohort.

**Do not modify any `.tsx` file in this PR**, even to fix the drift you noticed. Spec 007 handles all TSDoc work.

### 9. Open the PR

PR title: `docs: add <Component> sidecar`
PR body: link to this spec, name the source-of-truth checks the reviewer should run (props table matches `<Component>.tsx`, patterns match `<Component>.stories.tsx`, prose ran through humanizer, no three-item lists, validator passes), and call out the changeset.

The reviewer will:

1. Open the new sidecar alongside `<Component>.tsx` and `<Component>.stories.tsx`
2. Spot-check 2-3 props against the source-of-truth rule
3. Spot-check 1-2 common patterns against the stories
4. Re-run the validator locally if any code block changed during review
5. Scan for three-item lists, em-dash runs, AI tells in prose

## Backfill PR (after all 14 land)

When every `<Component>.usage.md` is on `main`, open one final PR to populate inter-sidecar Related sections.

1. `git checkout main && git pull`
2. `git checkout -b sidecar/related-backfill`
3. For each sidecar, look at its peers and ask: "Is there a sibling component a consumer would also need to know about?" Add the link if so. The single-component sidecars naturally cluster (Label → Input, Switch; Button → Dialog, Tooltip), and compound sidecars often link to single components used inside them.
4. Re-run `pnpm exec tsx scripts/validate-sidecars.ts` (no `tsx` blocks should change, but the validator is fast).
5. Add `.changeset/sidecar-related-backfill.md`:

   ```markdown
   ---
   '@unbranded-ds/react': patch
   ---

   Backfill inter-sidecar Related links after the per-component cohort completes.
   ```

6. Open the PR. Title: `docs: backfill sidecar Related sections`. Body: link to this spec, call out that this is the FR-014a backfill, note no `.tsx` changes.

## Common pitfalls

- **Three-item lists slipping in**: the easiest way to catch your own is to scan for "X, Y, and Z" plus bulleted lists with exactly three bullets at the same indent level. Code unions (`'a' | 'b' | 'c'`) are exempt.
- **Restating Base UI's behavior in Accessibility prose**: when the component is a thin wrapper, the accessibility section can be short. Say what the component adds, not what every primitive does. "Inherits the accessibility behavior of Base UI's Switch primitive" is fine if there's nothing component-specific to add — but be specific about the focus, keyboard, and announcement behaviors a consumer needs to know.
- **Fixing TSDoc inline**: tempting, especially for one-line fixes. Don't. Inbox it; spec 007 handles it.
- **Adding Related links forward**: only link to sidecars on `main` at PR-author time. The backfill PR will handle forward links.
- **Forgetting the changeset**: `changeset-check.yml` will block merge. The changeset is one short file; create it before opening the PR.
- **`argTypes` and code disagree**: the code wins. Note the drift in the inbox; do not edit the stories in this PR.
