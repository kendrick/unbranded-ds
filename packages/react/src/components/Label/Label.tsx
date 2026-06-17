import * as React from 'react';

import { cn } from '../../lib/cn';

// Re-declare the consumer-relevant native <label> props so their TSDoc surfaces
// in IDE hover and Storybook Controls. react-docgen reads the JSDoc attached to
// interface members; the global lib.dom.d.ts descriptions do not propagate, so
// we restate them here with WHAT + WHEN guidance.
interface LabelOwnProps {
	/**
	 * ID of the form control this label describes. Set when the input and label
	 * are siblings rather than nested — the most common pattern in column-layout
	 * forms. Omit when the input is nested as a direct child and the browser can
	 * infer the association.
	 */
	htmlFor?: string;
	/**
	 * Label text and any inline decorations (required markers, icons). The click
	 * target extends to everything rendered here, so clicks on a required-marker
	 * asterisk also focus the paired control.
	 */
	children?: React.ReactNode;
	/**
	 * Merged with base classes via `cn()`. Reach for it when a one-off layout
	 * override is needed without forking the component.
	 */
	className?: string;
}

// Intersect with the full native prop set so consumers retain access to every
// HTML label attribute (id, aria-*, data-*, form, etc.). LabelOwnProps wins on
// overlap — TypeScript prefers the later type in a right-leaning intersection,
// which is what we want for the documented props.
type LabelProps = Omit<React.ComponentProps<'label'>, keyof LabelOwnProps>
	& LabelOwnProps;

/**
 * A thin semantic wrapper around `<label>` that applies design-token typography and disabled-state styling.
 *
 * @remarks
 * Renders a native `<label>` element with the design system's text styling
 * (`text-sm`, `leading-none`, `font-medium`) and `select-none` so dragging on
 * the label does not pick up text instead of focusing the control. Two wiring
 * patterns work: pass `htmlFor` pointing at an input's `id`, or nest the input
 * directly as a child so the browser infers the association. When the paired
 * input is a CSS peer and goes into `:disabled`, the `peer-disabled` classes
 * dim the label and apply `cursor-not-allowed`. When a wrapping element marks
 * itself with `data-disabled="true"` and the `group` class, the
 * `group-data-[disabled=true]` classes apply the same disabled treatment to
 * every Label inside.
 *
 * ### Accessibility
 *
 * Browsers and assistive technology compute the accessible name for the
 * associated control from the label's text content, so no extra `aria-label`
 * or `aria-labelledby` is needed on the input when a Label is properly
 * associated. Either association pattern — `htmlFor`/`id` or nesting —
 * satisfies WCAG 1.3.1 (Info and Relationships) and 2.4.6 (Headings and
 * Labels). Clicking anywhere within the rendered label, including inline
 * decorations like required markers, moves keyboard focus to the paired
 * input. Avoid wrapping non-form content in Label to get click-to-focus
 * behavior; the browser may report accessibility violations if a `<label>`
 * is associated with a non-labelable element.
 *
 * ### When to use
 *
 * - Every form control needs a visible text association. Pair Label with
 *   {@link Input}, {@link Checkbox}, {@link Switch}, or {@link Select}.
 * - Complex labels that combine field name with inline decorations like a
 *   required-marker asterisk or a help icon — the click target extends to the
 *   whole label.
 *
 * ### When not to use
 *
 * - When the field is decorated by an icon only and has no visible text label,
 *   use {@link VisuallyHidden} to supply the screen-reader name instead of a
 *   visible Label.
 * - When wrapping non-form content — `<label>` semantics are reserved for
 *   labelable form elements and misusing the element produces invalid HTML.
 *
 * @example Linked label and input via htmlFor
 * ```tsx
 * import { Input, Label } from '@unbranded-ds/react';
 *
 * export function EmailField() {
 *   return (
 *     <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
 *       <Label htmlFor="email">Email address</Label>
 *       <Input id="email" type="email" placeholder="you@example.com" />
 *     </div>
 *   );
 * }
 * ```
 *
 * @example Wrapping label with nested control
 * ```tsx
 * import { Input, Label } from '@unbranded-ds/react';
 *
 * export function UsernameField() {
 *   return (
 *     <Label>
 *       Username
 *       <Input placeholder="handle" />
 *     </Label>
 *   );
 * }
 * ```
 *
 * @see {@link Input}
 * @see {@link Checkbox}
 * @see {@link Switch}
 * @see {@link Select}
 */
function Label({ className, ...props }: LabelProps) {
	return (
		// eslint-disable-next-line jsx-a11y/label-has-associated-control -- this is a primitive wrapper; consumers wire the htmlFor or nest a control.
		<label
			data-slot="label"
			className={cn(
				'flex items-center gap-2 text-sm leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50',
				className,
			)}
			{...props}
		/>
	);
}

export { Label };
export type { LabelProps };
