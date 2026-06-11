# Constitution amendment: add Section XI (Agent and human legibility)

Apply the following three edits to `.specify/memory/constitution.md`. Bump 1.0.0 → 1.1.0 (MINOR — new principle added).

---

## Edit 1 — Replace the SYNC IMPACT REPORT block at the top of the file

```markdown
<!--
SYNC IMPACT REPORT
==================
Version change:  1.0.0 → 1.1.0  [MINOR — new Section XI added]
Bump rationale:  Adds the consumption-side principle that pairs with Section VII's
                 publishing-side rule. Section VII says "the MCP surface is a
                 first-class deliverable"; Section XI says agents and humans are
                 first-class consumers of every artifact the design system ships,
                 and names the concrete practices that make that real (humanizer
                 pass on prose, no three-item lists, predictable API shapes,
                 sidecar usage docs, a planned token-query MCP, structured
                 failure output, story-coverage as dual-audience contract).

Modified principles:
  - Section V (Stories are the source of truth): unchanged in text, but its
    "if it isn't in a story, it isn't shipped" rule is referenced and sharpened
    in Section XI's closing subsection.

Added sections:
  - XI – Agent and human legibility are co-equal.

Removed sections:  N/A.

Templates audited:
  ⚠ .specify/templates/plan-template.md   — Constitution Check gate needs a
                                             checkbox for Section XI (does this
                                             change consider agent legibility?).
                                             Update in the same PR.
  ✅ .specify/templates/spec-template.md   — No change required; existing MUST
                                             language already covers the new
                                             rules when authors invoke them.
  ✅ .specify/templates/tasks-template.md  — No change required.

Deferred TODOs:
  - The token-query MCP referenced in XI.3 has no spec yet. Track as
    specs/00X-token-query-mcp once primary work begins. Planned for 1.0.
  - The sidecar *.usage.md convention referenced in XI.3 has no template yet.
    Add packages/react/src/components/_template/Component.usage.md when the
    first new component PR lands under Section XI.
  - TODO(RATIFICATION_DATE): still unset from 1.0.0.
-->
```

---

## Edit 2 — Insert the new section between current Section X (Governance) and the version footer

```markdown
---

## XI. Agent and human legibility are co-equal

The design system has two consumers. Humans browse stories and docs. Agents query autodocs, MCP tool output, sidecar files, and structured error responses. Neither audience is primary. The same artifact has to work for both.

This is the principle that separates unbranded-ds from a design system that happens to publish an MCP endpoint.

### XI.1 Prose

Every piece of written content — story descriptions, autodoc strings, README files, sidecar usage docs, error messages — is written for both audiences:

- Prose passes through the `humanizer` skill before merge. The AI tells documented in that skill (em-dash overuse, "serves as" phrasing, promotional vocabulary, hedging, signposting) are removed.
- Lists of exactly three items are restructured. Add a fourth item, drop to two, convert to a sentence, or split into nested bullets. Three-item lists are an LLM tic and read as one to a careful editor. The rule applies to both bulleted lists and inline prose ("X, Y, and Z").
- Prose is specific over generic and active over passive.

### XI.2 API shape

Component APIs are predictable from analogy:

- Compound components use the `<Component.Slot>` pattern consistently. A `*.Trigger` on one component means the same thing as a `*.Trigger` on any other, and the same holds for `*.Root`, `*.Content`, `*.Item`, and any future slot name.
- Variant axes use a small shared vocabulary: `variant`, `size`, `intent`, `disabled`. No bespoke synonyms across components.
- Polymorphic rendering, when present, uses one prop name across the codebase.

An agent who has read one component should be able to guess the prop surface of the next one and be right.

### XI.3 Documentation surfaces

The design system publishes two complementary documentation surfaces for agent consumption:

- The Storybook MCP server, published via Chromatic, is the live remote source (see Section VII).
- A planned token-query MCP exposes theme listing, palette, contrast math, and semantic token lookup. This is a distinct contract from the Storybook MCP and is planned before 1.0.
- Per-component sidecar usage docs live at `packages/react/src/components/<Component>/<Component>.usage.md`. They mirror the MCP's component guidance: import path, prop table, common patterns, accessibility notes, examples. An agent or human with a local clone can answer "how do I use Button" with no network connection.
- A top-level `AGENTS.md` indexes the sidecar docs and names the MCP endpoints. It is a peer document to `README.md`, not a footnote.

Local sidecar docs are not a fallback for the MCP. They are the canonical record an agent pattern-matches against offline. The MCP is the live, queryable view of the same content.

### XI.4 Failure modes

Validation failures produce structured output, not only prose:

- `validateTheme()` returns a typed `{ ok, issues }` shape with codes and paths. This is the existing pattern (Section III) and the model for any future validator.
- A missing token, a broken contrast pair, a failing theme validation, a malformed sidecar doc all surface with codes an agent can pattern-match.

Human-readable error messages are layered on top of the structured payload, not in place of it.

### XI.5 Story coverage as dual-audience contract

The rule from Section V — "if a behavior is not exercised in a story, it is not considered shipped" — sharpens here. A behavior with no story is invisible to humans browsing the deployed Storybook and invisible to agents introspecting the MCP. Both failure modes count, and either alone is enough to block merge.

---
```

---

## Edit 3 — Replace the version footer at the bottom of the file

```markdown
**Version**: 1.1.0 | **Ratified**: TODO(RATIFICATION_DATE): set to original adoption date | **Last Amended**: 2026-05-15
```

---

## Edit 4 — Update the plan template's Constitution Check gate

Add one line to `.specify/templates/plan-template.md`'s Constitution Check section so every future plan has to answer Section XI. The exact phrasing depends on the template's existing format, but the addition is:

```markdown
- [ ] Section XI — does this change keep prose, API shape, docs surfaces, failure modes, and story coverage legible to both agents and humans? List any concessions.
```

Land Edit 4 in the same PR as Edits 1–3.

---

## Notes for whoever reviews the PR

- The amendment is structurally a sibling of Section VII, not a replacement. Section VII still owns "we publish the MCP." Section XI owns "the things we publish are designed for both consumers."
- The "no three-item list" rule is the one most likely to feel pedantic. Keep it. Once you start counting, you see how often LLM drafts default to three, and the rule is what trains the eye.
- The `*.usage.md` sidecar convention has no first implementation yet. The first component PR under 1.1.0 should establish a template at `packages/react/src/components/_template/Component.usage.md` so subsequent PRs copy from a known shape.
- The token-query MCP is the largest deferred commitment in this amendment. It is named in XI.3 as planned before 1.0. If that constraint is too aggressive, soften the wording to "planned for 1.0" and remove the `before 1.0` deadline.
