# Prop-level TSDoc template (3-section)

The canonical shape for TSDoc on every property in an exported prop interface or type. This content propagates to Storybook's Controls panel via react-docgen.

## Template

````typescript
interface ComponentProps {
	/**
	 * WHAT clause — WHEN clause. [One sentence, active voice.]
	 *
	 * Optional behavior nuance. [One sentence. Edge cases, controlled vs
	 * uncontrolled, side effects on focus/ARIA. Only when the type signature
	 * doesn't communicate the nuance.]
	 *
	 * Accessibility: [One sentence. Only when setting this prop has an
	 * ARIA/keyboard/focus consequence. Prefixed with "Accessibility:" for
	 * Cmd+F discoverability.]
	 *
	 * @defaultValue `false`
	 *
	 * @example
	 * ```tsx
	 * <Component prop="value" />
	 * ```
	 */
	prop: string;
}
````

## The WHAT + WHEN bar (FR-003)

Every prop description MUST contain both:

- **WHAT**: one short clause naming the prop's effect on the component
- **WHEN**: one short clause naming the consumer decision context — what makes a consumer choose this prop or pick a value

### Anti-patterns (reject these)

| Pattern                                                                                    | Problem                                      |
| ------------------------------------------------------------------------------------------ | -------------------------------------------- |
| `"The visual style of the button."`                                                        | WHAT only, no WHEN                           |
| `"The visual style of the button. Reach for this when you want a different visual style."` | Filler WHEN that restates the prop's purpose |
| `"Controls the size."`                                                                     | WHAT only, generic                           |

### Good examples

`delayDuration`: "Milliseconds the tooltip waits before opening on hover. Increase when triggers cluster densely and accidental hovers are common; decrease to ~200ms for tooltips on critical actions."

`variant`: "The button's visual treatment. Pick by user intent: `default` for the primary action, `destructive` for irreversible actions (delete, sign out), `outline` or `ghost` for de-emphasized choices, `link` for inline navigation."

`disabled`: "Removes the element from tab order and suppresses pointer events. Pair with a visible explanation when the reason for disabling isn't obvious from surrounding context."

## Rules

- `@defaultValue` is required when a default exists. Use backtick-wrapped literal values (e.g., `` `false` ``, `` `'default'` ``).
- The optional `Accessibility:` prefix makes a11y implications findable via search. Reserve for props where setting the value changes ARIA roles, focus behavior, or screen reader announcements.
- The optional `@example` is for props whose behavior is hard to grasp from the type signature alone. Most props don't need one.
- Per-prop TSDoc paraphrases the sidecar prop-table Description column with the same intent. Same WHAT + WHEN, same use cases named — not verbatim copied.
