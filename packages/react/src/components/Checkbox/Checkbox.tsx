import type * as React from 'react';
import { Checkbox as CheckboxPrimitive } from '@base-ui-components/react/checkbox';

import { CheckIcon } from 'lucide-react';
import { cn } from '../../lib/cn';

interface CheckboxOwnProps {
	/**
	 * Controlled checked state. Pair with `onCheckedChange` when the parent owns
	 * the value — gating a submit button on terms acceptance, syncing with URL
	 * state, or wiring into a form library.
	 */
	checked?: boolean;
	/**
	 * Uncontrolled initial checked state. Reach for this when the value lives
	 * inside the form on submit and the parent does not need to read it during
	 * render.
	 *
	 * @defaultValue `false`
	 */
	defaultChecked?: boolean;
	/**
	 * Prevents pointer and keyboard interaction and lowers opacity. Use when the
	 * option exists but is unavailable in the current context (a paid feature
	 * on a free plan, an action gated by another field).
	 *
	 * Accessibility: removes the checkbox from the tab order and announces it
	 * as disabled to assistive technology.
	 *
	 * @defaultValue `false`
	 */
	disabled?: boolean;
	/**
	 * Renders the checkbox in a mixed state — neither checked nor unchecked.
	 * Reach for it on a parent "select all" control when its children are
	 * partially selected.
	 *
	 * Accessibility: sets `aria-checked="mixed"` so screen readers announce the
	 * tri-state correctly.
	 *
	 * @defaultValue `false`
	 */
	indeterminate?: boolean;
	/**
	 * Displays the current value without permitting changes. Use when the field
	 * should remain focusable and copyable but locked against edits, for
	 * example on a read-only view of a previously submitted form.
	 *
	 * @defaultValue `false`
	 */
	readOnly?: boolean;
	/**
	 * Marks the hidden `<input>` required for native form validation. Use when
	 * the surrounding `<form>` relies on the browser's built-in validation to
	 * block submission until the box is checked (terms of service, age gates).
	 *
	 * @defaultValue `false`
	 */
	required?: boolean;
	/**
	 * The field name submitted with a form. Set this when the checkbox is part
	 * of a `<form>` POST or a `FormData` payload.
	 */
	name?: string;
	/**
	 * The value submitted when the checkbox is checked. Set this when the form
	 * needs a specific string rather than the default `"on"`.
	 */
	value?: string;
	/**
	 * Fires when the user toggles the checkbox. Pair with `checked` for the
	 * controlled pattern, or use it alongside `defaultChecked` to react to
	 * changes without owning the state.
	 */
	onCheckedChange?: CheckboxPrimitive.Root.Props['onCheckedChange'];
	/**
	 * Ref to the hidden `<input>` element. Reach for this when integrating
	 * with uncontrolled form libraries (react-hook-form `register`) or when
	 * imperatively focusing the field after a validation error.
	 */
	inputRef?: React.Ref<HTMLInputElement>;
	/**
	 * Merged with the component's classes via `cn()`. Reach for it when a
	 * one-off spacing or color override is needed without forking the
	 * component.
	 */
	className?: string;
}

type CheckboxProps = CheckboxPrimitive.Root.Props & CheckboxOwnProps;

/**
 * A token-styled checkbox for opt-in, opt-out, multi-select list items, and indeterminate parent states.
 *
 * @remarks
 * Wraps Base UI's `Checkbox.Root` and `Checkbox.Indicator` primitives and
 * paints them with design tokens. Checked, disabled, and indeterminate visuals
 * are driven by `data-checked` / `data-disabled` attributes that the primitive
 * applies; invalid styling activates from `aria-invalid` on the underlying
 * input. Two internal slots are rendered for downstream targeting:
 * `data-slot="checkbox"` (root) and `data-slot="checkbox-indicator"` (icon
 * container). Extra classes passed through `className` are merged via `cn()`.
 *
 * ### Accessibility
 *
 * Renders a `<span role="checkbox">` paired with a hidden `<input>` so the
 * field participates in form submission while keeping a styleable visual
 * surface. `aria-checked` reflects the current state, including
 * `aria-checked="mixed"` when `indeterminate` is true. Focus is keyboard-only
 * visible: the focus ring shows on `:focus-visible`, not on pointer clicks.
 * Pair every standalone checkbox with a `<Label>` (or `aria-label` /
 * `aria-labelledby`) so screen readers can announce what the checkbox
 * controls — the component does not inject a label of its own.
 *
 * ### Keyboard interactions
 *
 * | Key | Description |
 * | --- | --- |
 * | `Space` | Toggles the checked state. |
 * | `Tab` | Moves focus to the next focusable element. |
 *
 * ### When to use
 *
 * - The user opts into or out of a single option independently — a newsletter
 *   subscription, a terms acceptance, a filter toggle.
 * - A parent control summarizes a list of child checkboxes that may be
 *   partially selected (drive it with `indeterminate`).
 * - The selection is part of a form that gets submitted, rather than a
 *   setting that applies immediately.
 *
 * ### When not to use
 *
 * - Use {@link Switch} when the change takes effect immediately without a
 *   submit step (theme preference, notification toggle).
 * - Use a radio group when the choices are mutually exclusive and exactly
 *   one must be selected.
 *
 * @example Uncontrolled checkbox with a label
 * ```tsx
 * import { Checkbox, Label } from '@unbranded-ds/react';
 *
 * export function AcceptTerms() {
 *   return (
 *     // eslint-disable-next-line jsx-a11y/label-has-associated-control
 *     <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
 *       <Checkbox name="terms" />
 *       <Label>Accept terms and conditions</Label>
 *     </label>
 *   );
 * }
 * ```
 *
 * @example Controlled checkbox that gates a submit button
 * ```tsx
 * import { useState } from 'react';
 * import { Checkbox, Label } from '@unbranded-ds/react';
 *
 * export function SubscribeToggle() {
 *   const [subscribed, setSubscribed] = useState(false);
 *
 *   return (
 *     // eslint-disable-next-line jsx-a11y/label-has-associated-control
 *     <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
 *       <Checkbox
 *         checked={subscribed}
 *         onCheckedChange={(checked) => setSubscribed(checked)}
 *         name="subscribe"
 *       />
 *       <Label>Subscribe to updates</Label>
 *     </label>
 *   );
 * }
 * ```
 *
 * @see https://www.w3.org/WAI/ARIA/apg/patterns/checkbox/
 * @see {@link Switch}
 * @see {@link Label}
 */
function Checkbox({ className, ...props }: CheckboxProps) {
	return (
		<CheckboxPrimitive.Root
			data-slot="checkbox"
			className={cn(
				'peer relative flex size-4 shrink-0 items-center justify-center rounded-[4px] border border-input shadow-xs transition-shadow outline-none group-has-disabled/field:opacity-50 after:absolute after:-inset-x-3 after:-inset-y-2 focus-visible:border-ring focus-visible:ring-(length:--ring-width) focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-(length:--ring-width) aria-invalid:ring-destructive/20 aria-invalid:aria-checked:border-primary dark:bg-input/30 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 data-checked:border-primary data-checked:bg-primary data-checked:text-primary-foreground dark:data-checked:bg-primary',
				className,
			)}
			{...props}
		>
			<CheckboxPrimitive.Indicator
				data-slot="checkbox-indicator"
				className="grid place-content-center text-current transition-none [&>svg]:size-3.5"
			>
				<CheckIcon />
			</CheckboxPrimitive.Indicator>
		</CheckboxPrimitive.Root>
	);
}

export { Checkbox };
export type { CheckboxProps };
