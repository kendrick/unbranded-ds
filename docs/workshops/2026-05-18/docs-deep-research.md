# Documentation Strategy for `unbranded-ds`: A Ranked Study of Best-in-Class Design System Docs + Copy-Pasteable TSDoc Templates

## TL;DR

- **Study Adobe React Aria + GitHub Primer + IBM Carbon as your three anchors.** React Aria is the gold standard for accessibility-as-architecture and is the closest match to your shadcn/Radix substrate; Carbon is the gold standard for designer/developer parity and per-component a11y reporting; Primer is the gold standard for transparent "known a11y issues" and design-time accessibility annotations. For your stated priorities (usability, a11y depth, designer+dev parity), use Carbon's *page template* as your skeleton, React Aria's *accessibility-first prose* as your model for what to write, and Primer's *known-issues link + annotation toolkit* as your transparency pattern.
- **In TSDoc, put accessibility in the IDE — not just on the docs site.** Adopt a strict 6-section component-level prose order (one-liner → `@remarks` extended description → "Accessibility" sub-section → "Keyboard interactions" sub-section → "When to use / alternatives" → `@example` → `@see`) and a strict 3-section prop-level order (description → behavior nuance → `@defaultValue` / a11y implication). Use TSDoc release tags (`@alpha`, `@beta`, `@public`, `@deprecated`) as canonicalized by the TSDoc spec and consumed by API Extractor and TypeDoc.
- **Treat MDX/Storybook as the designer surface; treat TSDoc as the developer surface — and make one canonical source.** Best-in-class systems (Carbon, Primer, Polaris) split content into Usage, Style/Anatomy, Code, and Accessibility tabs; in a shadcn-style repo you can mirror that split by keeping prose authority in the TSDoc on the source `.tsx` file and re-using/importing those same comments into the MDX doc site via TypeDoc or a `react-docgen` pipeline. Write component docs *before* implementation by stubbing the file with `@alpha` + a full TSDoc block, exporting only the type definition.

---

## Key Findings

1. **No existing shadcn-style docs system documents accessibility well — that is your differentiator.** shadcn/ui intentionally inherits a11y from Radix and writes almost no per-component a11y prose; Radix has the table but no usage/design guidance. `unbranded-ds` can occupy the gap.
2. **The richest a11y docs in the industry are tabular per-component with three discrete artifacts:** (a) a WAI-ARIA APG link at the top (React Aria's pattern), (b) an explicit keyboard interactions table (Radix's pattern), and (c) a conformance/test-status matrix per release (Carbon, USWDS).
3. **Status taxonomies converge on three to four labels.** TSDoc's `@alpha`/`@beta`/`@public`/`@deprecated` maps cleanly to Carbon's Draft/Preview/Stable, Workday's Labs/Preview/Main, and Atlassian's early-access/beta/stable badges. Pick one taxonomy and propagate it from the TSDoc tag → docs badge → CLI install warning.
4. **Designer-developer parity is achieved by separate-but-mirrored content surfaces.** Carbon's public markdown templates (Usage/Style/Code/Accessibility) and Primer's open-source Figma Annotation Toolkit are the two most-emulatable artifacts.
5. **The strongest transparency posture in the industry is GOV.UK's per-failure ledger plus USWDS's per-version VPAT.** Most teams can't afford a VPAT but every team can afford Primer's "Known accessibility issues" link out to a labelled GitHub issue search.

---

## Details

### Part A — Ranked Analysis: Which Design Systems to Study

#### Scoring framework

Each system is scored 1–5 on three axes that reflect your stated priorities:

1. **Docs usability** — IA, search, navigation, examples-on-page, copy-able code, in-place playgrounds.
2. **A11y documentation depth** — per-component WCAG mapping, keyboard tables, ARIA attribute disclosure, screen-reader testing notes, known-issues transparency, ACR/VPAT availability.
3. **Designer ↔ developer parity** — anatomy diagrams, do/don't, content guidance, when-to-use, alternatives, design tokens AND API docs in one place, status/lifecycle taxonomy.

The final ranking weights a11y heaviest (because you've declared it the differentiator), then docs usability, then parity.

#### The ranking

| Rank | System | Usability | A11y depth | Parity | Why it ranks here |
|------|--------|-----------|------------|--------|-------------------|
| 1 | **Adobe React Aria / React Spectrum** | 5 | 5 | 4 | Accessibility *is* the product. WAI-ARIA APG pattern reference at the top of every component; behavior, keyboard, focus, i18n explicitly enumerated. The closest analog to what `unbranded-ds` is technically. |
| 2 | **IBM Carbon** | 5 | 5 | 5 | The reference template for multi-audience docs. Per-component **Usage / Style / Code / Accessibility** tabs with a documented status taxonomy (Draft → Preview candidate → Preview → Stable) and a public testing-status matrix. |
| 3 | **GitHub Primer** | 4 | 5 | 5 | Best-in-class *transparency*: a per-component "Known accessibility issues" link plus an open-source Figma Annotation Toolkit and Primer A11y Presets that bridge design handoff. |
| 4 | **Shopify Polaris** | 5 | 4 | 5 | Best designer/UX-writing guidance and the cleanest do/don't pattern; a11y is covered foundationally but not consistently per-component. |
| 5 | **Radix Primitives** | 4 | 4 | 2 | Every component page has an *explicit* keyboard interactions table mapping `Key → Description`. Developer-only audience, but the API/keyboard pattern is what shadcn already ships on top of. |
| 6 | **GOV.UK Design System** | 5 | 5 | 3 | Documents WCAG 2.2 AA conformance and tracks individual failures publicly under the GitHub label `accessibility regulations failure` across both the GOV.UK Design System website repo and the GOV.UK Frontend codebase repo. Less applicable for product UI primitives but excellent transparency model. |
| 7 | **Atlassian Design System** | 4 | 3 | 4 | Strong status tags (e.g., `beta`, `early access`, `caution`, `deprecated`) shown right in the component index; weaker per-component a11y. |
| 8 | **Microsoft Fluent UI** | 3 | 4 | 4 | Strong on accessibility behaviors (`useAccessibility` hook surface); API Extractor / TSDoc pipeline is documented in-house. Docs site itself fragmented across Fluent 1/2 and Northstar. |
| 9 | **Workday Canvas Kit** | 4 | 4 | 4 | Explicit *Main / Preview / Labs* maturity buckets analogous to TSDoc's `@public`/`@beta`/`@alpha`. Useful precedent for status conventions. |
| 10 | **USWDS** | 4 | 5 | 3 | Publishes a real VPAT 2.5 ACR. Per the official accessibility documentation: "we assessed 44 components of USWDS 3.11.0 in March 2025 and published the report in May 2025." Lower parity for designers/devs because focus is government accessibility compliance. |
| 11 | **Nord (Nordhealth)** | 5 | 3 | 4 | Beautiful, highly opinionated information design — frequently cited as a docs reference. Less per-component a11y depth than Carbon/React Aria. |
| 12 | **Orbit (Kiwi.com)** | 4 | 3 | 3 | Categorizes components into UI / Layout / Utility / **Accessibility components** (a useful taxonomy), and ships explicit a11y helpers (`SkipLink`, `SkipNavigation`). |
| 13 | **Material Design (Google)** | 4 | 3 | 4 | Excellent visual specs and do/don't, but a11y per-component is shallower and the docs split between MDC, MUI, and m3.material.io is confusing. |
| 14 | **shadcn/ui** | 4 | 2 | 2 | Optimized for developer copy-paste; intentionally inherits a11y from Radix and provides almost no in-page a11y prose. **This is exactly the gap `unbranded-ds` should fill.** |
| 15 | **Salesforce Lightning Design System** | 3 | 3 | 3 | Comprehensive but legacy IA; some Aura/LWC API split confuses readers. Not a strong template. |

> Material Design and Salesforce Lightning are included for completeness but I'd skip them as primary models — they're too platform-specific and their docs IA is older than the others.

#### What makes Carbon strong (and where others exceed it)

**Carbon's strengths** (worth keeping as your template floor):

- **Four-tab template per component** — Usage, Style, Code, Accessibility — applied consistently across the catalog with documented markdown templates and "office hours" review process for contributors.
- **A documented status taxonomy**, mapped to the IBM Product Development Lifecycle (PDLC). Carbon's contribution checklist defines four explicit lifecycle labels (Draft → Preview candidate → Preview → Stable), each with a one-line definition (e.g., **Stable** = "Complete across code, kit, docs, design, and ready for production use."). Carbon's PDLC page also tells you publicly that **Preview was formerly called "experimental"** but was renamed to raise the bar of production-readiness — a clear precedent for `@alpha`/`@beta` semantics.
- **A public accessibility testing-status matrix** at `/components/overview/accessibility-status/` that tags every component across four dimensions: **Default state**, **Advanced states**, **Keyboard navigation**, **Screen reader**, with statuses **Tested** ("Passes all automated tests with no reported accessibility violations.") and **Manually tested** ("A human has manually tested this component, e.g. screen reader testing.").
- **Per-component a11y page structure** with a stable heading hierarchy: `## What Carbon provides` (sub: Keyboard interactions, Behavior) → `## Design recommendations` (sub: Labeling) → `## Development considerations` → `## Accessibility testing status`. Each page links out to the corresponding W3C ARIA APG pattern (e.g., Button page links to `https://www.w3.org/TR/wai-aria-practices-1.2/#button`).
- **Per-component a11y prose surfaces specific guidance for designers** (e.g., "Icon-only buttons … must be annotated with a label that will be exposed on hover or focus"), making the page useful at design-handoff, not just at code review.

**Where others exceed Carbon:**

- **React Aria — accessibility-as-architecture and APG-link-at-the-top.** React Aria component pages don't actually contain a keyboard-table; they place a single `HeaderInfo` reference to the W3C ARIA APG pattern at the top (e.g., ComboBox links to `https://www.w3.org/WAI/ARIA/apg/patterns/combobox/`) and a bulleted "Features" list. The "Keyboard navigation" bullet states behavior in prose: *"ComboBox can be opened and navigated using the arrow keys, along with page up/down, home/end, etc. The list of options is filtered while typing into the input, and items can be selected with the enter key."* The Dialog/useDialog page describes focus management verbatim: *"Focus is moved into the dialog on mount, and restored to the trigger element on unmount. While open, focus is contained within the dialog, preventing the user from tabbing outside."* This pattern — short, behavioral, vendor-neutral, and linked to the APG — is what you want inside your TSDoc.
- **Primer — known-issues transparency.** Every Primer component page renders an `<AccessibilityLink label="ComponentName"/>` that links to the open issues filed in the GitHub repo for that component, exposing not just what works but what's broken. This is unusual and powerful.
- **Radix — explicit keyboard interactions table.** Radix is the only system among your shadcn-substrate set that ships an explicit per-component table mapping `Key → Description` (e.g., Dialog: `Tab → Moves focus to the next focusable element. Escape → Closes the component and moves focus to Dialog.Trigger.`). Since your components inherit Radix behavior, you should reproduce these tables in your TSDoc verbatim where applicable.
- **GOV.UK — public WCAG-2.2-failure ledger.** Per the GOV.UK Design System accessibility statement: "The team documents WCAG 2.2 A and AA failures in two repositories under the 'accessibility regulations failure' issue label: GOV.UK Design System website label for accessibility regulations failures · GOV.UK Frontend codebase label for accessibility regulations failures." The pattern is more transparent than Carbon's "Tested / Manually tested" labels.
- **USWDS — actual VPAT.** USWDS publishes a VPAT 2.5 ACR covering 44 components (USWDS 3.11.0 assessed March 2025, published May 2025). If `unbranded-ds` ever wants to be picked up by government or enterprise consumers, publishing a per-major-version ACR is the gold standard.
- **Polaris — UX-writing prose embedded in component pages.** Polaris is unmatched at integrating content guidance into the component itself ("Do: 'Save changes' / Don't: 'Submit'").

#### Concrete patterns worth emulating per category

##### How they structure component pages

| System | Page template (top-level sections) |
|---|---|
| Carbon | `Usage` · `Style` · `Code` · `Accessibility` (tabbed) |
| React Aria | `Example` → `Features` → `Anatomy` → `Examples` → `Reusable wrappers` → … → `Props` → `Styling` → `Advanced customization` → `Testing` (single page) |
| Primer | `Overview` → `Examples` → `Accessibility` → `Anatomy` → `Options/Props` → `Status` → `Related links` |
| Polaris | `Examples` → `Best practices` → `Content guidelines` → `Accessibility` → `Props` |
| Radix | `Features` → `Installation` → `Anatomy` → `API Reference` → `Accessibility` (with **Keyboard Interactions** sub-table) → `Examples` |
| Atlassian | `Description (with status tag)` → `Examples` → `Props` (with deprecation banners inline) |

**Recommendation:** Adopt a 6-tab/section template: **Overview → Anatomy → Usage (Do/Don't) → API/Props → Accessibility → Examples**. This is the union of Carbon's four-tab template and Radix's explicit keyboard table, with Primer's anatomy diagram in slot 2.

##### How they document props/API

- **Carbon and Fluent UI** generate prop tables from TSDoc/`@fluentui/api-docs` via Microsoft's API Extractor pipeline.
- **React Aria** auto-generates prop tables from typed render props and includes a "Description" column populated from the TSDoc.
- **Radix** uses a `Name | Type | Default | Description` table on every component, with a small annotation `(*) Required` and inline links to types.
- **Atlassian** decorates props with status badges inline (`deprecated`, `beta`, `early access`).

**Recommendation:** Use `Name | Type | Default | Description` columns and route your prop documentation through TSDoc on the `interface ComponentProps` declaration so that both IDE tooltips and your docs site share a single source of truth. The TypeDoc default theme handles this natively; API Extractor is the production-grade option for monorepos like yours.

##### How they handle accessibility documentation specifically

| Pattern | Best example | What it looks like |
|---|---|---|
| **Per-component WCAG conformance statement** | Carbon, GOV.UK | "This component has been validated to meet the WCAG 2.1 AA and Section 508 accessibility guidelines, however changes made by the content owner can affect accessibility compliance." (verbatim from Carbon Button page) |
| **Per-component WCAG failure ledger** | GOV.UK | GitHub issue label `accessibility regulations failure` per failed WCAG 2.2 A/AA criterion, tracked across both the design-system website repo and the `govuk-frontend` codebase repo |
| **Keyboard interactions table** | Radix, plus implicit in Carbon's "What Carbon provides" prose | `Tab → Moves focus to next element` — two columns: Key (using `<kbd>` semantically) and Description |
| **ARIA attribute disclosure** | Radix, React Aria | Lists which ARIA roles/states are applied (e.g., Radix Dialog: "automatically has `role='dialog'`, `aria-modal='true'`") |
| **Screen reader testing notes per component** | Carbon (v10 docs) | Records test environment: `macOS Mojave 10.14.6 + VoiceOver + Chrome 77 + Carbon React 7.7.1` and tested-against-the-script results |
| **Accessibility design-handoff annotations** | Primer (Figma Annotation Toolkit), GitHub Annotation Toolkit | Reusable Figma stamps for landmarks, heading structure, focus management, live regions |
| **Known a11y issues link** | Primer | `<AccessibilityLink label="Button"/>` rendered on every component page |
| **Component-level ACR/VPAT** | USWDS | VPAT 2.5 ACR covering 44 components assessed in March 2025 and published in May 2025 against USWDS 3.11.0 |
| **Accessibility status matrix** | Carbon | Public table per component × {Default state, Advanced states, Keyboard navigation, Screen reader} × {Tested, Manually tested} |

**Recommendation for `unbranded-ds`:** Combine **Radix's keyboard table** (you can quote it directly from Radix's docs since your behavior is identical) with **Carbon's per-component WCAG conformance statement** and Carbon's testing-status matrix, plus **Primer's "Known issues" link** out to your GitHub issue tracker filtered by component label. This trio uniquely positions you as the most transparent shadcn-style design system available.

##### How they document usage guidance vs. technical API

- **Polaris and Carbon** are best at usage guidance: every component opens with a one-sentence definition, then "When to use" and "When not to use" sections with do/don't visuals.
- **Material Design** uses a "Behavior" section to capture interaction semantics that aren't quite API.
- **React Aria** intentionally separates usage prose from props — props live in their own auto-generated table at the bottom of the page, while usage is composed of named feature sections (Selection, Sections, Asynchronous loading, Validation, etc.).

##### Designer vs. developer parity tactics

- **Carbon's markdown templates are public and prescribe a Usage template, a Code template, and an Accessibility template separately**, so designers writing prose and engineers writing code own different files.
- **Primer's Annotation Toolkit** is the strongest tool for bridging design and engineering — it turns accessibility considerations into a Figma library of stamps designers drop on their canvases.
- **Atlassian** publishes a "Design component template" through Confluence (component basics → anatomy → states → content/accessibility/mobile guidance) — a useful checklist even if you don't use Confluence.
- **Nord** keeps a public *accessibility checklist* alongside the system, frequently cited as one of the best.
- **shadcn/ui** does effectively zero of this. That is the opportunity.

##### Versioning / status / experimental / deprecated handling

| System | Status taxonomy | How it's surfaced |
|---|---|---|
| Carbon | Draft, Preview candidate, Preview, Stable | Badge on component card; PDLC page documents semantics |
| Workday Canvas | Main, Preview, Labs | Separate npm packages (`@workday/canvas-kit-react`, `@workday/canvas-kit-preview-react`, `@workday/canvas-kit-labs-react`) |
| Atlassian | New, Beta, Early access, Caution, Deprecated | Inline tag on every component in the index |
| Fluent UI | API Extractor release tags | `@public`/`@beta`/`@alpha`/`@internal` in TSDoc |
| TSDoc spec | `@alpha`, `@beta`, `@public`, `@internal`, `@experimental`, `@deprecated` | TSDoc modifier tags; trimmable by API Extractor |

**Recommendation:** Align your status taxonomy with TSDoc release tags (which API Extractor and TypeDoc both natively respect) and mirror Atlassian's pattern of rendering the status as a visible badge on the docs site. Concretely: `@alpha` → Atlassian's "early access" badge; `@beta` → Atlassian's "beta" badge; `@public` → no badge (stable); `@deprecated` → red banner with `@see` migration target.

---

### Part B — Concrete TSDoc Prose Templates for shadcn-style Components

#### TSDoc spec recap (current, as of mid-2026)

TSDoc, the Microsoft-owned standard descended from JSDoc, distinguishes three tag kinds:

- **Block tags** — `@remarks`, `@param`, `@returns`, `@example`, `@defaultValue`, `@deprecated`, `@throws`, `@see`. Block tags always start their own line; their content extends until the next tag.
- **Modifier tags** — `@public`, `@beta`, `@alpha`, `@experimental`, `@internal`, `@readonly`, `@sealed`, `@override`, `@virtual`. They are bare switches with no content.
- **Inline tags** — `{@link}`, `{@inheritDoc}`, `{@label}`. They appear inline and are delimited by `{` and `}`.

Block-tag ordering convention (from the TSDoc spec and the API Extractor reference): the **summary** (un-tagged text) comes first; then `@remarks` for extended description; then `@param`/`@returns`/`@throws` (only applicable to functions/methods, not React components, but still relevant for hooks); then `@example` (one per snippet); then `@see`; then modifier tags last. Release tags **inherit recursively from the container** — marking a class/interface `@public` means all members are public unless individually overridden.

**TypeDoc-specific behavior to know:** TypeDoc honors `@example` as a heading-anchored fenced code block; it has a `jsDocCompatibility` option that lets `@example` and `@default` accept JSDoc-style content. TypeDoc resolves `{@link}` using TypeScript's symbol resolution by default. Multi-line `@example` blocks should always use fenced code (\`\`\`tsx).

**API Extractor specifics:** Use `@packageDocumentation` exactly once per `index.ts` entry to describe the whole package. Use `@alpha`/`@beta` to allow API Extractor to trim experimental APIs out of your public `.d.ts` rollup at release.

#### Recommended prose structure

**Component-level TSDoc (placed immediately above the `forwardRef`/function declaration that is the public surface):**

1. **One-line summary** (≤ 120 chars). Describes what the component is, in the same voice as Radix/React Aria ("A button triggers an event or action.").
2. **`@remarks` extended description.** 2–6 sentences. Composition behavior, intended slot, polymorphism (`asChild`), and any non-obvious render semantics.
3. **`### Accessibility` (using a Markdown heading inside the TSDoc).** ARIA pattern reference link, ARIA roles applied automatically, focus management behavior, screen reader name resolution.
4. **`### Keyboard interactions`.** A Markdown table of `Key | Description`, copied/adapted from Radix's docs or the WAI-ARIA APG.
5. **`### When to use`** and **`### When not to use`** (alternatives → use `{@link}` to point at sibling components).
6. **`@example`** — one per common usage; the *first* `@example` should be the minimum viable usage; subsequent ones should layer in `asChild`, controlled state, and a11y-relevant variants (e.g., icon-only).
7. **`@see`** for the Radix/React Aria/W3C APG link and any deeper design-doc URL.
8. **Modifier tag** (`@public` / `@beta` / `@alpha`) on its own final line.

**Prop-level TSDoc (placed above each property in `interface ComponentProps`):**

1. **One-sentence description.** What the prop does, in the active voice.
2. **(Optional) one-sentence behavior nuance.** Edge cases, controlled vs. uncontrolled, side effects on focus/ARIA.
3. **`@defaultValue`** — the literal default, using backticks (e.g., `` `false` ``).
4. **(Optional) accessibility implication** as a single sentence prefixed with "Accessibility:" so it's `Cmd+F`-discoverable in the rendered docs.
5. **(Optional) `@example`** — only for props whose behavior is hard to grasp from the type alone.

#### Worked example 1 — Button (simple)

```tsx
import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(/* … */);

/**
 * Props for the `Button` component.
 *
 * @public
 */
export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  /**
   * Render as the immediate child element, merging the Button's props and
   * behavior onto it (Radix `Slot` pattern).
   *
   * Use this to render a Button as an `<a>` (link) or a custom component
   * while preserving Button's styling, focus handling, and `aria-disabled`
   * semantics.
   *
   * Accessibility: when `asChild` is `true`, the child element MUST be a
   * focusable, semantically appropriate element (e.g. `<a href>` for
   * navigation). The component will not transform a non-focusable element
   * into a focusable one.
   *
   * @defaultValue `false`
   *
   * @example
   * ```tsx
   * <Button asChild>
   *   <a href="/docs">Read the docs</a>
   * </Button>
   * ```
   */
  asChild?: boolean;
}

/**
 * A button triggers an event or action — for example, submitting a form,
 * opening a dialog, or canceling an action.
 *
 * @remarks
 * `Button` renders a native `<button>` element by default and inherits all
 * of its accessibility primitives from the browser. Pass `asChild` to
 * compose with other elements (e.g. a Next.js `<Link>`) without losing the
 * button's visual treatment.
 *
 * `Button` is unstyled in the same sense that shadcn/ui is — the visual
 * treatment is composed from Tailwind classes via `class-variance-authority`
 * and can be overridden with `className` (merged via `cn()`).
 *
 * ### Accessibility
 *
 * - Implements the WAI-ARIA Button pattern; the rendered element is a
 *   native `<button>` and therefore exposes the implicit `role="button"`
 *   without explicit ARIA.
 * - The accessible name is computed from the button's text content. For
 *   icon-only buttons, supply an `aria-label`.
 * - When `disabled`, the browser sets the implicit `aria-disabled` state
 *   and removes the button from the focus order. If you need a button that
 *   is visually disabled but remains focusable (e.g. for tooltips that
 *   explain *why* it's disabled), use `aria-disabled` instead of `disabled`.
 *
 * ### Keyboard interactions
 *
 * | Key       | Description                                |
 * | --------- | ------------------------------------------ |
 * | `Space`   | Activates the button.                      |
 * | `Enter`   | Activates the button.                      |
 * | `Tab`     | Moves focus to the next focusable element. |
 *
 * ### When to use
 *
 * - Triggering an action (submit, save, delete, open dialog).
 * - Initiating a process that *stays on the current page*.
 *
 * ### When not to use
 *
 * - Use {@link Link} (or `<a>`) for navigation that changes the URL.
 * - Use {@link Toggle} for two-state on/off controls.
 * - Use {@link IconButton} when the only content is an icon (it enforces
 *   `aria-label`).
 *
 * @example
 * Basic usage:
 * ```tsx
 * <Button onClick={() => save()}>Save changes</Button>
 * ```
 *
 * @example
 * As a link (preserves keyboard activation as Enter, not Space):
 * ```tsx
 * <Button asChild variant="link">
 *   <a href="/settings">Settings</a>
 * </Button>
 * ```
 *
 * @example
 * Icon-only (always pair with `aria-label`):
 * ```tsx
 * <Button size="icon" aria-label="Close">
 *   <XIcon aria-hidden="true" />
 * </Button>
 * ```
 *
 * @see https://www.w3.org/WAI/ARIA/apg/patterns/button/ — WAI-ARIA Button pattern
 * @see {@link IconButton}
 * @public
 */
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";
```

#### Worked example 2 — Dialog (composed, focus-trapping, a11y-rich)

```tsx
import * as DialogPrimitive from "@radix-ui/react-dialog";

/**
 * A modal dialog that interrupts the user with important content and
 * expects a response.
 *
 * @remarks
 * `Dialog` is a compound component built on `@radix-ui/react-dialog`. Compose
 * it from the exported parts: `Dialog`, `DialogTrigger`, `DialogContent`,
 * `DialogHeader`, `DialogTitle`, `DialogDescription`, `DialogFooter`,
 * `DialogClose`. The compound shape mirrors Radix's primitive so all Radix
 * data attributes (`data-state="open|closed"`) are preserved for animations.
 *
 * Use {@link AlertDialog} instead when the dialog interrupts the user with
 * a destructive or irreversible action — `AlertDialog` enforces an explicit
 * Cancel control and uses `role="alertdialog"`.
 *
 * ### Accessibility
 *
 * - Applies `role="dialog"` and `aria-modal="true"` automatically on
 *   `DialogContent`.
 * - Labels itself via `aria-labelledby` pointing at `DialogTitle` and
 *   `aria-describedby` pointing at `DialogDescription`. **`DialogTitle` is
 *   required**; Radix will emit a development warning if it is missing.
 *   Use the `VisuallyHidden` primitive to hide it visually when the dialog
 *   is purely decorative.
 *
 * - **Focus management:** on open, focus is moved to the first focusable
 *   element inside `DialogContent` (override with the `onOpenAutoFocus`
 *   event on `DialogContent`). On close, focus is restored to the element
 *   that opened the dialog. While open, focus is trapped inside the dialog
 *   — `Tab` and `Shift+Tab` cycle within the dialog only.
 *
 * - **Inert background:** content outside the dialog is marked
 *   `aria-hidden="true"` while the dialog is open, so screen readers do
 *   not traverse it.
 *
 * ### Keyboard interactions
 *
 * | Key                | Description                                                |
 * | ------------------ | ---------------------------------------------------------- |
 * | `Space` / `Enter`  | When focus is on `DialogTrigger`, opens the dialog.        |
 * | `Tab`              | Moves focus to the next focusable element inside dialog.   |
 * | `Shift + Tab`      | Moves focus to the previous focusable element inside.      |
 * | `Escape`           | Closes the dialog and returns focus to `DialogTrigger`.    |
 *
 * ### When to use
 *
 * - Asking the user to confirm a non-destructive action.
 * - Requesting a small amount of focused input that blocks the underlying
 *   flow (e.g., naming a new file).
 *
 * ### When not to use
 *
 * - For destructive or irreversible actions, use {@link AlertDialog}.
 * - For non-blocking notifications, use {@link Toast}.
 * - For passive information disclosure, use {@link Popover} or
 *   {@link HoverCard}.
 *
 * @example
 * Minimum viable dialog:
 * ```tsx
 * <Dialog>
 *   <DialogTrigger asChild>
 *     <Button>Open</Button>
 *   </DialogTrigger>
 *   <DialogContent>
 *     <DialogTitle>Rename file</DialogTitle>
 *     <DialogDescription>
 *       Choose a new name for this document.
 *     </DialogDescription>
 *     <Input defaultValue="Untitled.txt" />
 *     <DialogFooter>
 *       <DialogClose asChild>
 *         <Button variant="ghost">Cancel</Button>
 *       </DialogClose>
 *       <Button onClick={save}>Save</Button>
 *     </DialogFooter>
 *   </DialogContent>
 * </Dialog>
 * ```
 *
 * @example
 * Controlled open state:
 * ```tsx
 * const [open, setOpen] = React.useState(false);
 * <Dialog open={open} onOpenChange={setOpen}>{/* … *\/}</Dialog>
 * ```
 *
 * @example
 * Decorative dialog with a visually-hidden title (still required by AT):
 * ```tsx
 * <DialogContent>
 *   <VisuallyHidden asChild>
 *     <DialogTitle>Image preview</DialogTitle>
 *   </VisuallyHidden>
 *   <img src="/preview.png" alt="" />
 * </DialogContent>
 * ```
 *
 * @see https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/
 * @see https://www.radix-ui.com/primitives/docs/components/dialog
 * @see {@link AlertDialog}
 * @public
 */
export const Dialog = DialogPrimitive.Root;

/**
 * The visible label of a {@link Dialog}.
 *
 * @remarks
 * `DialogTitle` is **required**. It is referenced by `aria-labelledby` on
 * the dialog content and provides the dialog's accessible name. Wrap in
 * {@link VisuallyHidden} if you need to hide it visually.
 *
 * Accessibility: rendered as an `<h2>` by default; pass `asChild` to
 * change the underlying heading level if the dialog appears inside a
 * deeper section hierarchy.
 *
 * @public
 */
export const DialogTitle = DialogPrimitive.Title;
```

#### Worked example 3 — Combobox (complex, keyboard-heavy)

```tsx
/**
 * Props for the `Combobox` component.
 *
 * @public
 */
export interface ComboboxProps<TValue> {
  /**
   * The list of selectable options.
   *
   * Accessibility: each option's `label` is used as the option's accessible
   * name. Provide a non-empty, human-readable label even for icon-led options.
   */
  options: ReadonlyArray<ComboboxOption<TValue>>;

  /**
   * The currently selected value (controlled).
   *
   * Leave undefined to use uncontrolled state; in that case the component
   * tracks its own selection internally and notifies via `onValueChange`.
   *
   * @defaultValue `undefined`
   */
  value?: TValue;

  /**
   * Called whenever the selected value changes, including via keyboard
   * (Enter on a highlighted option), pointer (click), or via the
   * type-ahead match-on-Enter behavior.
   *
   * @defaultValue `undefined`
   */
  onValueChange?: (value: TValue) => void;

  /**
   * Whether the combobox accepts custom (non-list) values typed by the user.
   *
   * Accessibility: when `true`, the combobox uses `aria-autocomplete="list"`
   * and the listbox is treated as a suggestion list rather than the
   * authoritative source of valid values. When `false`, the combobox uses
   * `aria-autocomplete="list"` but rejects values that don't match an option.
   *
   * @defaultValue `false`
   */
  allowsCustomValue?: boolean;

  /**
   * Custom filter function. Receives the current input value and the
   * option's label, and returns `true` to include the option.
   *
   * @defaultValue case-insensitive `startsWith` match
   */
  filter?: (inputValue: string, optionLabel: string) => boolean;
}

/**
 * A combobox combines a text input with a popover listbox, letting users
 * filter a list of options and select one.
 *
 * @remarks
 * `Combobox` follows the WAI-ARIA 1.2 combobox pattern with `aria-haspopup
 * ="listbox"`. It is built on `@radix-ui/react-popover` for positioning and
 * implements its own listbox / keyboard navigation in order to match the
 * APG keyboard contract precisely (Radix does not ship a combobox primitive
 * at the time of writing).
 *
 * Use {@link Select} when the set of options is small and known up-front
 * and the user does not need to type to filter — `Select` uses the simpler
 * `listbox` pattern and is easier for screen reader users.
 *
 * ### Accessibility
 *
 * - The text input has `role="combobox"`, `aria-expanded`,
 *   `aria-controls` pointing at the listbox `id`, and `aria-autocomplete
 *   ="list"`.
 * - The popover content has `role="listbox"` and is labeled via
 *   `aria-labelledby` pointing at the visible field label (or
 *   `aria-label` when no visible label is provided).
 * - Each option has `role="option"` and `aria-selected` reflecting the
 *   selection state. The highlighted (not yet selected) option is
 *   communicated via `aria-activedescendant` on the combobox input, so
 *   DOM focus stays on the input throughout — this is the WAI-ARIA APG
 *   recommended pattern.
 * - When the listbox is empty (no options match the current filter), an
 *   ARIA live region announces "No results."
 *
 * ### Keyboard interactions
 *
 * | Key                       | Description                                                       |
 * | ------------------------- | ----------------------------------------------------------------- |
 * | `ArrowDown`               | If closed, opens the listbox and highlights the first option. If open, moves highlight to the next option. |
 * | `ArrowUp`                 | If closed, opens the listbox and highlights the last option. If open, moves highlight to the previous option. |
 * | `Home`                    | Moves highlight to the first option.                              |
 * | `End`                     | Moves highlight to the last option.                               |
 * | `Enter`                   | Selects the highlighted option and closes the listbox.            |
 * | `Escape`                  | Closes the listbox without selecting; clears input if `allowsCustomValue` is `false`. |
 * | `Tab` / `Shift + Tab`     | Selects the highlighted option (if any), closes the listbox, and moves focus. |
 * | Printable characters      | Filter the option list; the listbox opens automatically.          |
 *
 * ### When to use
 *
 * - The user needs to select one value from a large or unknown list
 *   (countries, users, GitHub repos).
 *
 * ### When not to use
 *
 * - For a small, fixed list, use {@link Select}.
 * - For free-form multi-select tags, use {@link TagInput}.
 *
 * @example
 * Uncontrolled combobox over a known list:
 * ```tsx
 * <Combobox
 *   options={[
 *     { value: "us", label: "United States" },
 *     { value: "ca", label: "Canada" },
 *     { value: "mx", label: "Mexico" },
 *   ]}
 * />
 * ```
 *
 * @example
 * Controlled, allowing custom user-entered values:
 * ```tsx
 * const [value, setValue] = React.useState<string | undefined>();
 * <Combobox
 *   value={value}
 *   onValueChange={setValue}
 *   allowsCustomValue
 *   options={fruits}
 * />
 * ```
 *
 * @see https://www.w3.org/WAI/ARIA/apg/patterns/combobox/
 * @see {@link Select}
 * @public
 */
export function Combobox<TValue>(props: ComboboxProps<TValue>): JSX.Element {
  /* … */
}
```

#### Worked example 4 — Checkbox (form primitive)

```tsx
/**
 * Props for the `Checkbox` component.
 *
 * @public
 */
export interface CheckboxProps {
  /**
   * The controlled checked state. Use `"indeterminate"` for the
   * "partially checked" tri-state (e.g., a parent checkbox whose children
   * are mixed).
   *
   * Accessibility: `"indeterminate"` is exposed as `aria-checked="mixed"`,
   * which screen readers announce as "mixed". The visual rendering uses
   * a horizontal line glyph by default.
   *
   * @defaultValue `false` (uncontrolled defaults to `defaultChecked` or `false`)
   */
  checked?: boolean | "indeterminate";

  /**
   * Called when the checked state changes via user interaction.
   *
   * The callback receives the new state, including `"indeterminate"` →
   * `true` transitions. Indeterminate is not reachable via user input;
   * it must be set programmatically.
   */
  onCheckedChange?: (checked: boolean | "indeterminate") => void;

  /**
   * Whether the checkbox is required for form submission.
   *
   * Accessibility: when `true`, the underlying input receives
   * `aria-required="true"`. Pair with a visible required indicator
   * (e.g., an asterisk in the label) and a descriptive error message
   * via {@link FormMessage}.
   *
   * @defaultValue `false`
   */
  required?: boolean;
}

/**
 * A checkbox allows users to select one or more options from a set, or to
 * toggle a single binary option.
 *
 * @remarks
 * Built on `@radix-ui/react-checkbox`. The visible "check" glyph is
 * rendered by a child `Checkbox.Indicator`; the rendered DOM is a native
 * `<button role="checkbox">` so that all native browser focus rings and
 * form-association behavior apply.
 *
 * For a single yes/no setting that takes immediate effect (e.g., toggling
 * a feature), prefer {@link Switch} — it communicates "on/off" rather
 * than "checked/unchecked" and is more discoverable for screen reader users
 * in settings contexts.
 *
 * ### Accessibility
 *
 * - Implements the WAI-ARIA checkbox pattern with `role="checkbox"` and
 *   `aria-checked` reflecting `true | false | "mixed"`.
 * - The accessible name comes from the associated `<label>` element. Use
 *   {@link Label} and pass `htmlFor` matching the checkbox's `id`, or
 *   wrap the checkbox inside the label.
 * - When `disabled`, the component is removed from the focus order.
 *
 * ### Keyboard interactions
 *
 * | Key      | Description                                                  |
 * | -------- | ------------------------------------------------------------ |
 * | `Space`  | Toggles the checkbox between checked and unchecked. From the indeterminate state, transitions to `checked`. |
 * | `Tab`    | Moves focus to the next focusable element.                   |
 *
 * @example
 * ```tsx
 * <div className="flex items-center gap-2">
 *   <Checkbox id="terms" />
 *   <Label htmlFor="terms">Accept terms and conditions</Label>
 * </div>
 * ```
 *
 * @example
 * Controlled with indeterminate state (parent of a group):
 * ```tsx
 * <Checkbox
 *   checked={allSelected ? true : someSelected ? "indeterminate" : false}
 *   onCheckedChange={(c) => setAll(c === true)}
 * />
 * ```
 *
 * @see https://www.w3.org/WAI/ARIA/apg/patterns/checkbox/
 * @see {@link Switch}
 * @see {@link RadioGroup}
 * @public
 */
export const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  CheckboxProps & React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>
>(/* … */);
```

#### Documenting components that don't exist yet ("stubs")

This is a real and useful workflow because in your repo the registry, the docs site, and the consuming product can all be built ahead of implementation. The pattern:

**Step 1 — Create the file with a typed empty implementation:**

```tsx
// packages/ui/src/data-table/data-table.tsx
import * as React from "react";

/**
 * Props for the `DataTable` component.
 *
 * @alpha
 */
export interface DataTableProps<TRow> {
  /** Rows to render. */
  rows: ReadonlyArray<TRow>;
  /** Column definitions. */
  columns: ReadonlyArray<DataTableColumn<TRow>>;
}

/**
 * A data grid with column sorting, multi-row selection, and keyboard
 * navigation.
 *
 * @remarks
 * **Status: planned / not yet implemented.** This module exports a typed
 * stub that throws at runtime. The TSDoc here is the authoritative design
 * spec until implementation lands — feedback is welcome via GitHub issues
 * before the API is frozen at `@beta`.
 *
 * ### Accessibility (planned)
 *
 * - Will implement the WAI-ARIA grid pattern (`role="grid"`,
 *   `aria-rowcount`, `aria-colcount`, roving `tabindex` for cell focus).
 * - Will support arrow-key navigation between cells and `Home/End/PageUp
 *   /PageDown` for jump navigation.
 *
 * @see https://www.w3.org/WAI/ARIA/apg/patterns/grid/
 * @alpha
 */
export function DataTable<TRow>(_props: DataTableProps<TRow>): JSX.Element {
  throw new Error(
    "DataTable is not yet implemented. Track progress at " +
      "https://github.com/your-org/unbranded-ds/issues/42",
  );
}
```

**Step 2 — Conventions for stable docs while implementation evolves:**

- Mark with **`@alpha`** while shape may change. Graduate to **`@beta`** once API is frozen but implementation is unstable. Graduate to **`@public`** when stable. (API Extractor will trim `@alpha` items out of your public `.d.ts` rollup automatically — this is the same lever Workday Canvas Kit pulls with separate `@workday/canvas-kit-labs-react` packages, but at the symbol level instead of the package level.)
- Keep the prose stable: the TSDoc is the spec. Implementation changes should rarely require prose changes; if they do, the design contract has moved and that needs a SemVer minor/major.
- Add `**Status: planned / not yet implemented.**` as the first sentence of `@remarks` for `@alpha` symbols so an IDE tooltip flags it immediately.
- Wire your docs site renderer to badge `@alpha`/`@beta` symbols visibly (Atlassian's pattern). Wire your registry / CLI to refuse `--no-include-alpha` flag (your own convention).

#### Bridging designer and developer audiences

TSDoc primarily serves devs in the IDE. To reach designers and PMs you need a complementary MDX/Storybook surface — but the goal is **one source of truth, multiple presentations**.

**Architecture for `unbranded-ds`:**

```
packages/
  ui/                              # the components
    src/
      button/
        button.tsx                 # AUTHORITATIVE prose lives in TSDoc here
        button.stories.tsx         # Storybook: variants, states, do/don't
        button.mdx                 # docs-site MDX: anatomy diagram + design tokens + imports prose from button.tsx
  docs/                            # Next.js or Astro docs site
    components/[slug]/page.tsx     # renders the MDX, props table from TypeDoc JSON, and Storybook iframe
```

**Concrete recommendations, mirroring how the best-in-class systems do it:**

1. **Generate the props table from your TSDoc, don't hand-write it.** Use `react-docgen` (the engine Storybook and Styleguidist already use) or `@microsoft/api-extractor` + `api-documenter`. Storybook will render the prop table from the TSDoc-derived metadata automatically. Carbon and Fluent UI both do this in production via API Extractor; Atlassian uses `react-docgen-typescript`.

2. **Author the page in MDX with a fixed template** modeled on Carbon's four-tab template:
   - `## Overview` — pulls the component's TSDoc summary via `{@inheritDoc Button}` (or a build step that injects it).
   - `## Anatomy` — a Figma frame or SVG with numbered callouts (Primer's pattern; Atlassian's design-component template).
   - `## Usage` — when-to-use, when-not-to-use, do/don't (Polaris and Carbon are the references).
   - `## API` — auto-rendered from TSDoc.
   - `## Accessibility` — the **only** place where you re-author prose that's also in TSDoc; this prose can be the designer-flavored long form (whereas the TSDoc is the developer-flavored short form). Carbon does this split explicitly.
   - `## Examples` — Storybook iframes.

3. **Hand designers a Figma "Annotation Toolkit."** Per the official `github/annotation-toolkit` README: "The GitHub Annotation Toolkit is a fork of the CVS Health Inclusive Design team's Web Accessibility Annotation Kit (CC-BY 4.0)… This project is licensed under the terms of the CC-BY 4.0 license." It was open-sourced on September 22, 2025 (GitHub Changelog) and provides ready-made annotation stamps for landmarks, headings, focus order, live regions, and per-component a11y presets. Either fork it for `unbranded-ds` brand-neutrality or document how designers can use it as-is with your components — this single move closes the design-handoff gap better than any other practice in the industry. (Carbon, Polaris, and Atlassian all *talk about* accessibility annotations but no one else ships a free tool of this quality.)

4. **Surface "known a11y issues" per component.** Adopt Primer's pattern: in each MDX page, render a link to GitHub issues filtered to `label:a11y label:component/<name>`. Combined with a per-major-release ACR (USWDS's pattern), this is the highest transparency posture in the industry.

5. **Mirror the lifecycle status everywhere.** Whatever release tag is on the TSDoc (`@alpha`/`@beta`/`@public`/`@deprecated`) should appear (a) in the component card on the docs index (Atlassian's pattern), (b) as a badge on the component page (Carbon's pattern), and (c) in the CLI output when a user runs `npx unbranded-ds add <component>`.

---

## Recommendations

### Stage 1 — Foundations (week 1)
- Adopt the **6-section component-level TSDoc template** above and the **3-section prop-level TSDoc template**. Commit the templates as `.github/COMPONENT_TSDOC_TEMPLATE.md` and `.github/PROP_TSDOC_TEMPLATE.md`.
- Configure **TypeDoc** in the monorepo with `jsDocCompatibility.exampleTag: true` to allow your `@example` fenced blocks to render as code.
- Decide on release-tag semantics: `@alpha` = API may change, `@beta` = API frozen / impl unstable, `@public` = SemVer-stable, `@deprecated` = remove in next major.

### Stage 2 — Write docs ahead of code (weeks 1-4)
- For every component you plan to ship — *including* not-yet-implemented ones — create the file with the typed `interface` + a throwing stub function + full TSDoc + `@alpha` tag. This forces design decisions early and gives you a complete docs site before implementation.
- For each component, copy the relevant **Radix keyboard interactions table verbatim** into the TSDoc. (Radix's docs license allows this; your behavior is identical.)
- Link every Accessibility section to the relevant **W3C WAI-ARIA APG pattern** as a `@see`.

### Stage 3 — Docs site (weeks 2-6)
- Stand up an MDX docs site using Next.js or Astro with a fixed 6-section component-page template (Overview / Anatomy / Usage / API / Accessibility / Examples).
- Auto-generate prop tables from your TSDoc via `react-docgen-typescript` or API Extractor.
- Embed Storybook iframes for live examples.

### Stage 4 — Accessibility differentiator (weeks 6-12)
- Publish a **per-component accessibility status matrix** modeled on Carbon's (`carbondesignsystem.com/components/overview/accessibility-status/`): rows = components, columns = {Default state, Advanced states, Keyboard navigation, Screen reader}, statuses = {Tested, Manually tested, Not tested}.
- Adopt or fork the **GitHub Annotation Toolkit** for Figma (CC-BY-4.0) and link it from your docs.
- Set up the issue label scheme `a11y` + `component/<name>` and render the "Known a11y issues" link on every component page (Primer's pattern).
- For your first major release, consider publishing a **VPAT 2.5 ACR** modeled on USWDS's — they assessed 44 components of USWDS 3.11.0 in March 2025 and published the report in May 2025.

### Decision benchmarks (when to change course)
- If maintaining hand-written keyboard tables in TSDoc is more than 10% of doc churn → switch to `{@inheritDoc}` from a shared `keyboard-tables.ts` data file.
- If your props tables drift from your interfaces → stop hand-writing them; mandate `react-docgen` / API Extractor generation.
- If consumers ignore status tags → make `npx unbranded-ds add <component>` refuse to install `@alpha` components without `--include-alpha`.

---

## Caveats

- **Several "best practice" claims about competing systems are based on docs that change frequently.** I observed React Aria's pages directly: contrary to a widespread assumption, React Aria does **not** use a per-component `Key | Description` keyboard table — it uses a bulleted "Features" list and links once to the WAI-ARIA APG. The keyboard tables you may have seen actually live on the APG itself and in **Radix's docs** (where they're explicit and tabular). Use Radix as your tabular keyboard reference.
- **Carbon renamed its "experimental" status to "Preview"** to raise the bar for production-readiness. Don't reuse the word "experimental" in your status taxonomy without weighing this — Carbon's PDLC page explicitly says preview is "available to use in production" but "not stable yet."
- **The shadcn registry CLI strips non-declaration-attached comments on install.** Per GitHub issue #9206 (shadcn-ui/ui), titled *"[bug]: Registry install strips leading comments and JSDoc blocks not attached to declarations,"* CLI version 2.10.0+ has this behavior; the root cause is that ts-morph treats comments as "trivia" attached to nodes, and the CLI's `transform-import.ts` and `transform-rsc.ts` neither explicitly preserves leading trivia. Verbatim from the issue: *"Only JSDoc comments that are directly attached to a declaration (const, function, type) are preserved."* Test that your TSDoc blocks survive the install path; **always attach blocks directly to the declaration (`forwardRef`, `interface`, `type`) rather than floating them between imports**.
- **TypeDoc and TSDoc disagree about `@example`**: TSDoc treats the first line as a heading title; TypeDoc by default treats the whole tag content as a code block. Configure `jsDocCompatibility.exampleTag` deliberately and pick one convention across the repo.
- **USWDS's, GOV.UK's, and Carbon's a11y transparency are exceptional but expensive to maintain.** Don't promise an ACR/VPAT unless you have a sustained tester budget. The Primer "known issues link" model is the cheapest meaningful transparency posture and is the recommended starting point.
- **Designer-facing docs require *someone* to write them.** TSDoc is a developer artifact. The recommended MDX/Storybook layer above is necessary but adds an authoring surface; budget for it explicitly or accept that `unbranded-ds` will be a developer-only system in practice, like Radix and React Aria.