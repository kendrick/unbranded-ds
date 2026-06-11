# Post-008 pickup notes

Cold-start context for picking up specs 010, 011, and 012 after spec 005 (constitution amendment + agent-experience foundation) and spec 008 (token schema growth) have shipped. Written 2026-05-15 with full session context. Assume by the time you read this, the original session is gone.

---

## First thing to do when you sit back down

The workshop output lives in `/tmp` right now, which evaporates on reboot. Before doing anything else:

```bash
mkdir -p docs/workshops/2026-05-15
mv /tmp/agent-first-workshop.md docs/workshops/2026-05-15/
mv /tmp/feedback-triage.md docs/workshops/2026-05-15/
mv /tmp/constitution-amendment-section-xi.md docs/workshops/2026-05-15/
mv /tmp/working-memory-kit-evaluation.md docs/workshops/2026-05-15/
mv /tmp/spec-*.md docs/workshops/2026-05-15/
mv /tmp/post-008-pickup-notes.md docs/workshops/2026-05-15/
git add docs/workshops/2026-05-15/
git commit -m "docs: capture 2026-05-15 workshop output"
```

If the move already happened, the docs live wherever you moved them — adjust the references in this file accordingly.

---

## State check: what 005 should have produced

Before starting 010 or 011, verify that 005 actually landed all of these. If anything is missing, that's what 010 is for.

- [.specify/memory/constitution.md](.specify/memory/constitution.md) at version 1.1.0 with Section XI present
- [.specify/templates/plan-template.md](.specify/templates/plan-template.md) has a Section XI checkbox in its Constitution Check gate
- An `AGENTS.md` exists at the repo root, peer to `README.md`
- Every component under `packages/react/src/components/` has a `<Component>.usage.md` sidecar (13 components total: the original 9 plus the 4 from spec 004)
- A template at `packages/react/src/components/_template/Component.usage.md` exists
- Every component's autodocs prose has been audited (humanizer pass, no three-item lists)
- The token-query MCP decision is recorded — either "required before 1.0" with a spec stub, or "planned for 1.0" with no commitment

If any of those are missing or weak, 010 is where you fix them.

---

## Spec 010 — Constitution-driven retrofit

There is no brief for this one because what 010 contains depends entirely on what 005 surfaces. Probably trivial. Possibly absorbed into 005's tasks list and never needed.

### How to know what to put in 010

When you come back, check three sources:

- The 005 spec's tasks list — any tasks marked "moved to 010" or "out of scope, retrofit later"
- GitHub issues filed against the 0.2.0 or 0.3.0 release with the "constitution" or "section-xi" label
- A diff between the existing nine components' autodocs before and after 005's audit. Anything that got rewritten in 005 may have parallel patterns in the four new primitives that didn't get caught.

### Likely candidates for retrofit

- **Slot name harmonization.** Section XI says `*.Trigger`, `*.Content`, `*.Item`, `*.Root` must mean the same thing across components. The existing nine were written before this rule. Spec 005 audits them but may not refactor breaking ones. 010 might land breaking slot-rename changes paired with a minor bump.
- **Prop name harmonization.** Variant axes should be `variant`, `size`, `intent`, `disabled` — no bespoke synonyms. Same situation: 005 surfaces, 010 fixes.
- **Polymorphic prop unification.** If different components use different prop names (`as` vs `polymorphic` vs `render`), pick one and rename the others. Likely a breaking change.
- **Structured failure output.** Any component or validator currently throwing or warning with prose only — refactor to a structured payload.
- **`AGENTS.md` content gaps.** If the agent quickstart, MCP tool inventory, or sidecar index in `AGENTS.md` has holes, fill them.
- **Motion token swap.** Primitive components (especially Tooltip from spec 004) use Tailwind's built-in duration utilities for their open/close transitions because the DS motion tokens did not exist when 004 shipped. Now that spec 008 has introduced the motion token category, swap the primitive transitions to use the DS tokens (`duration-base`, `easing-standard`, etc.) so the design system controls the timing surface.

### When 010 is empty

It's a real possibility. If 005 was thorough, 010 has nothing in it. Don't fabricate work — skip 010 and move to 011.

---

## Spec 011 — ThemeToggle

The brief lives at `docs/workshops/2026-05-15/spec-011-theme-toggle.md` (or `/tmp/spec-011-theme-toggle.md` if you haven't moved it yet). Three things in that brief are easy to misread cold:

### Why the for-coleman component was modified

The original for-coleman proposal was a single `<ThemeToggle>` component that baked in three opinions: the localStorage key, the use of `document.documentElement`, and a specific three-state UX. For an "unbranded" DS, that's a lot of opinion to ship as one component.

The workshop decision: split into a `useTheme()` hook (owns the persistence and listener logic) plus a thin `<ThemeToggle>` component (twenty lines, composes the hook with `<SegmentedControl>`). Consumers wanting a different UX (a switch, a button cycle, a dropdown) compose their own using `useTheme()` directly.

The hook is the load-bearing primitive; the component is a default convenience.

### The localStorage key is `unbranded-ds-theme`

This is in memory (see `~/.claude/projects/-Users-k-arnett-repos-unbranded-ds/memory/project_ds_theme_localstorage_key.md`). The key is shared between `themeBootstrapScript` (shipped in spec 002) and `useTheme` (ships in spec 011). They must not drift. If they drift, consumers get FOUC even with correct wiring.

If you're about to type `theme` or `theme-preference` or anything else, stop. Use `unbranded-ds-theme`. Ideally export the constant from `@unbranded-ds/tokens/runtime` so neither package can drift from the other.

### Why the hook returns an object, not a tuple

Section XI of the constitution (ratified in spec 005) says failure modes and APIs are structured for agent legibility. A tuple `[theme, setTheme]` reads fine to humans but is harder for an agent introspecting the return shape than `{ theme, preference, setPreference }`. Named fields are pattern-matchable.

This is a subtle Section XI compliance point that's easy to miss when reaching for the React idiom.

### SegmentedControl dependency

`<ThemeToggle>` composes on top of `<SegmentedControl>` (ships in spec 004). If for some reason 004 didn't ship SegmentedControl as planned, that's an 011 blocker — not something to work around in 011.

---

## Spec 012 — Next.js 15 example app

The brief at `docs/workshops/2026-05-15/spec-012-example-app.md` is fairly complete. Two reminders that might fade:

### The example is a starter, not a tutorial

This came up in the workshop. The example demonstrates the canonical wiring and the primitive set. It does not teach Tailwind, React, or Next.js. The README should make this clear so consumers don't expect step-by-step instruction.

### The custom font override demonstrates the consumer-overrides pattern from spec 002

Spec 002 explicitly preserves the consumer-overrides design — `@theme inline` is registration-only, values live in separate files, consumers add their own `:root { --color-* }` declarations. The example app's use of `next/font/local` plus a `:root { --typography-font-sans: ... }` override is the canonical demonstration of this pattern. If you're tempted to simplify the example by skipping the override, don't — that override is the whole point of the example being more than a hello-world.

---

## Things that are easy to forget if you cold-start

- **`unbranded-ds-theme`** is the localStorage key. Not `theme`, not `color-mode`, not `preferred-theme`. See memory.
- **The constitution amendment draft** is at `docs/workshops/2026-05-15/constitution-amendment-section-xi.md`. If 005 didn't ratify it cleanly, that's where to look.
- **Three-item lists are still forbidden** after the constitution ratifies. Check your own prose, including this doc if you edit it.
- **The for-coleman feedback** lives at [TODO.md](TODO.md). All six spec briefs pull the relevant context inline, so you shouldn't need TODO.md, but it's there if you do.
- **The auto-memory** at `~/.claude/projects/-Users-k-arnett-repos-unbranded-ds/memory/` contains: agent-first differentiator, prose rules, commit granularity, test quality, tests-required, and the unbranded-ds-theme key. New sessions read it automatically.

---

## When you're done with 012

The for-coleman feedback is fully addressed. The release that includes 012 is the moment to consider:

- Reaching out to for-coleman with a "here's what we shipped" note
- Closing the loop on [TODO.md](TODO.md) — either delete it or move it to `docs/workshops/2026-05-15/` and rename to `for-coleman-feedback.md` for historical record
- Evaluating [working-memory-kit](https://github.com/kendrick/working-memory-kit) per the notes at `docs/workshops/2026-05-15/working-memory-kit-evaluation.md`
- Deciding whether to start the next set of specs (display sizes, more primitives, the token-query MCP if it was deferred)
