## The constitutional gap — workshop input

The current constitution at [.specify/memory/constitution.md:113-124](.specify/memory/constitution.md#L113-L124) says the MCP is a first-class deliverable but treats it as a publishing concern. What you're reaching for is consumption-side principles. Things to workshop (not a draft — bullets for you to react to):

- **Agents are a primary consumer of stories and autodocs.** Story `argTypes`, descriptions, and `tags` are written to be agent-legible before they're written to be pretty. (Already partly in Section V; could be stated explicitly.)
- **Predictable beats clever.** Component APIs use names and shapes an agent can guess from analogy — `<Component>`, `<Component.Trigger>`, `<Component.Content>`, `variant`/`size`/`intent`, never bespoke shorthand. No prop named `as` in one place and `polymorphic` in another.
- **The DS publishes more than a Storybook MCP.** Tokens are agent-queryable (which palette? what's the contrast for this pair? which token covers `accent-on-muted`?). A "design system MCP" is a stated future deliverable, distinct from the Storybook MCP.
- **Agent-side docs are a peer surface.** `README` has a "developer quickstart" and an "agent quickstart" of equal weight. The agent quickstart names the MCP, lists the tools, gives a worked example, and links the published Storybook.
- **Failure modes are legible.** Validation errors, missing tokens, broken theme contracts produce machine-readable structured output, not just human prose. (Already true of `validateTheme`; could be a stated principle.)
- **Story coverage is contract surface for agents.** "If a behavior isn't exercised in a story, it isn't shipped" (Section V) gains a sharper edge: it's also "if it isn't in a story, an agent can't find it."

The amendment is probably a new **Section XI: Agent consumption** (MINOR bump → 1.1.0). Section VII stays as-is; the new section captures the consumption-side philosophy and is what new specs check against.

## Revised sequencing

E.2 promotion pulls the agent-experience theme to the front of the queue. Reworked:

1. **Constitution amendment** — workshop XI, ratify 1.1.0. Cheap, foundational, governs everything downstream.
2. **G.1 + A.3 + A.4** — consumer DX win. Two-line wiring + `themeBootstrapScript` + `.sr-only`. Unchanged from before.
3. **E.2 expanded — "Building with unbranded-ds as an agent"** — not a paragraph anymore. A short standalone doc (`AGENTS.md` at repo root, or `apps/storybook/AGENTS.md`) covering: MCP connection string, tool inventory, worked example ("scaffold a Card with a primary Button"), token-query examples, the agent quickstart that the constitution promises. Pairs with light edits to story autodocs to make sure they're actually agent-legible.
4. **B.2 + B.3 + C.2** — schema growth (motion + type scale) + the extending-the-schema worked example. 0.2.0 bump.
5. **B.1** — `font-serif`, rides 0.2.0.
6. **D primitives** — one PR each: Tooltip → SkipLink → Slider → SegmentedControl. Each one is a chance to exercise the new Section XI principles.
7. **A.2** — compose `<ThemeToggle>` on SegmentedControl + `useTheme`.
8. **C.4 + C.5 + F.1** — small doc polish (validateTheme recipe, Storybook URL link, naming rationale). Roll into whichever PR is closest.
9. **E.1** — Next.js example app, last.

Order rationale: constitution first because every later spec checks against it; agent-docs next because it's the highest-conviction differentiator-bearing item; consumer-DX (G.1) high because it gates the example app at the end.

## Feeding into speckit

Concretely, three layers:

**Layer 1 — Constitution amendment (this week).**
Use `/speckit-constitution` or hand-edit. Single PR. Add Section XI. Bump SYNC IMPACT REPORT to 1.0.0 → 1.1.0. Update [.specify/templates/plan-template.md](.specify/templates/plan-template.md)'s Constitution Check gate to include "does this PR consider agent legibility (Section XI)?" as a checkbox. That last bit is what makes the principle bite — every future plan has to answer it.

**Layer 2 — Specs, one per coherent wave.** Each becomes a directory under `specs/`:
- `specs/002-consumer-dx-preset/` — G.1 + A.3 + A.4
- `specs/003-agent-experience/` — E.2 expanded + autodoc audit + (maybe) a token-query MCP if you want to scope that in
- `specs/004-token-schema-growth/` — B.1 + B.2 + B.3 + C.2
- `specs/005-primitive-set-expansion/` — D primitives (Tooltip, SkipLink, Slider, SegmentedControl) as a unified spec with one feature per primitive
- `specs/006-theme-toggle/` — A.2 + `useTheme` hook
- `specs/007-example-app/` — E.1

Run `/speckit-specify` on each in order — but the constitution amendment **must land first**, so each spec's Constitution Check has Section XI to point at.

**Layer 3 — Tasks per spec via `/speckit-tasks`** as you start each one. Standard speckit flow.

One thing I'd flag: spec 003 is the one that will need the most workshop time, because "agent legibility" is a concept that has to be operationalized into testable criteria. I'd suggest spending the first task of 003 on writing those criteria (e.g., "every story has X, every prop has Y, the MCP exposes Z") so the rest of the spec has measurable success conditions instead of vibes.

Want me to draft Section XI as a concrete amendment for you to react to, or do you want to workshop the bullets above first?
