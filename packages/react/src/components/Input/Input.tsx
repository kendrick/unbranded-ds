import { Input as InputPrimitive } from '@base-ui-components/react/input';
import type * as React from 'react';

import { cn } from '../../lib/cn';

// Re-declare the most consumer-relevant native <input> props so their TSDoc
// surfaces in IDE hover and Storybook Controls. react-docgen reads the JSDoc
// attached to interface members; the global lib.dom.d.ts descriptions do not
// propagate, so we restate them here with WHAT + WHEN guidance.
interface InputOwnProps {
	/**
	 * The HTML input type. Common values: `'text'` (default), `'email'`
	 * (mobile keyboards plus native email validation), `'password'` (masks
	 * input), `'file'` (file picker rendered through the styled native
	 * button), `'number'` (numeric keyboards and spinner controls), `'search'`,
	 * `'tel'`, `'url'`.
	 *
	 * Accessibility: the chosen type drives the soft-keyboard layout on touch
	 * devices and the built-in validation surfaces browsers present on form
	 * submission.
	 *
	 * @defaultValue `'text'`
	 */
	type?: React.HTMLInputTypeAttribute;
	/**
	 * Hint text shown when the input is empty. Use for format examples
	 * (`you@example.com`) or short prompts. Not a substitute for a Label —
	 * placeholders disappear on focus and are not announced consistently by
	 * assistive technology.
	 */
	placeholder?: string;
	/**
	 * Removes the input from the tab order, suppresses pointer events, and
	 * drops opacity to signal the non-interactive state. Set when the field
	 * is contextually unavailable (form not ready, dependent on another
	 * choice) rather than as a permanent state.
	 *
	 * Accessibility: screen readers announce the field as disabled when it
	 * gains focus via assistive navigation.
	 *
	 * @defaultValue `false`
	 */
	disabled?: boolean;
	/**
	 * Marks the field as required for form submission. Browsers surface a
	 * native validation message if the field is empty at submit time.
	 *
	 * Accessibility: pair with a visible required indicator near the Label so
	 * sighted users see the constraint before they reach submission.
	 *
	 * @defaultValue `false`
	 */
	required?: boolean;
	/**
	 * Form field name submitted as the key in form-encoded payloads. Required
	 * when the input participates in an uncontrolled `<form>` submission and
	 * the server needs to identify the value.
	 */
	name?: string;
	/**
	 * Controlled value. Pass alongside `onChange` to drive the field from
	 * React state. Omit (or use `defaultValue`) for an uncontrolled field.
	 */
	value?: string | number | readonly string[];
	/**
	 * Initial value for an uncontrolled field. Use when you want the browser
	 * to manage the value and only read it on submit or via a ref.
	 */
	defaultValue?: string | number | readonly string[];
	/**
	 * Fires on every keystroke (and on programmatic value changes). Read
	 * `event.target.value` to get the new string. Required when the field is
	 * controlled via `value`.
	 */
	onChange?: React.ChangeEventHandler<HTMLInputElement>;
	/**
	 * Extra Tailwind classes merged with the component's defaults via `cn()`.
	 * Reach for it for width adjustments (`w-64`, `max-w-sm`) or one-off
	 * spacing tweaks without forking the component.
	 */
	className?: string;
}

// Intersect with the full native prop set so consumers retain access to every
// HTML input attribute (id, aria-*, data-*, autoComplete, etc.). InputOwnProps
// wins on overlap — TypeScript prefers the later type in a right-leaning
// intersection, which is what we want for the documented props.
type InputProps = Omit<React.ComponentProps<'input'>, keyof InputOwnProps> &
	InputOwnProps;

/**
 * A single-line text field for collecting short, unformatted strings from the user.
 *
 * @remarks
 * Wraps Base UI's `Input` primitive and applies the design system's token-driven
 * field styling — border, radius, focus ring, disabled opacity, and dark-mode
 * variants — directly through Tailwind classes. There is no CVA axis; the
 * component renders one shape and lets visual state ride on native attributes:
 * `:focus-visible` for the focus ring, `[aria-invalid="true"]` for the
 * destructive border and ring, `:disabled` for the dimmed pointer-events-none
 * treatment. The `file:` Tailwind variants restyle the browser's native file
 * button so `type="file"` matches the rest of the field surface.
 *
 * ### Accessibility
 *
 * Renders a native `<input>` element, so keyboard and screen-reader semantics
 * come from the browser without additional ARIA work. Tab moves focus into the
 * field; once focused, the user types freely. Pair every Input with a
 * {@link Label} associated via `htmlFor`/`id` so assistive technology
 * announces the field's purpose — placeholders are not a substitute. When
 * `aria-invalid="true"` is present, screen readers announce the field as
 * invalid on focus; combine it with a visible error message wired up through
 * `aria-describedby` so the error text is discoverable both visually and
 * programmatically. Browsers surface native validation for `required`, `type`,
 * and `pattern` constraints on form submission. The component applies a
 * `focus-visible:ring` suppressed on mouse and touch focus, meeting WCAG 2.4.7.
 *
 * ### When to use
 *
 * - Collecting a short, unformatted string: search query, email, password,
 *   numeric value, file selection.
 * - Any form field whose value applies on submit rather than immediately.
 *
 * ### When not to use
 *
 * - Use a `<textarea>` when the user needs to enter long-form text across
 *   multiple lines.
 * - Use {@link Select} when the valid values are a fixed enumerated list
 *   rather than free-form input.
 * - Use {@link Checkbox} or {@link Switch} when the value is boolean rather
 *   than a string or number.
 *
 * @example Paired with a Label
 * ```tsx
 * import { Input, Label } from '@unbranded-ds/react';
 *
 * export function EmailField() {
 *   return (
 *     <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
 *       <Label htmlFor="email">Email</Label>
 *       <Input id="email" type="email" placeholder="you@example.com" />
 *     </div>
 *   );
 * }
 * ```
 *
 * @example Error state via aria-invalid
 * ```tsx
 * import { Input, Label } from '@unbranded-ds/react';
 *
 * export function UsernameField() {
 *   return (
 *     <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
 *       <Label htmlFor="username">Username</Label>
 *       <Input
 *         id="username"
 *         aria-invalid="true"
 *         aria-describedby="username-error"
 *         defaultValue="taken@handle"
 *       />
 *       <span id="username-error" role="alert">That username is already taken.</span>
 *     </div>
 *   );
 * }
 * ```
 *
 * @see {@link Label}
 */
function Input({ className, type, ...props }: InputProps) {
	return (
		<InputPrimitive
			type={type}
			data-slot="input"
			className={cn(
				'h-9 w-full min-w-0 rounded-md border border-input bg-transparent px-2.5 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm dark:bg-input/30 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40',
				className,
			)}
			{...props}
		/>
	);
}

export { Input };
export type { InputProps };
