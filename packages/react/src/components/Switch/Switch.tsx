'use client';

import type * as React from 'react';
import { Switch as SwitchPrimitive } from '@base-ui-components/react/switch';

import { cn } from '../../lib/cn';

interface SwitchOwnProps {
	/**
	 * Track and thumb dimensions. Reach for `'sm'` in dense layouts — sidebar
	 * settings rows, compact table cells — where the default size reads as
	 * too heavy. Stick with `'default'` everywhere else so a switch carries
	 * the same weight as neighboring form controls.
	 *
	 * @defaultValue `'default'`
	 */
	size?: 'sm' | 'default';
	/**
	 * Controlled on/off state. Set this when a parent component owns the
	 * value — for example, when toggling the switch also enables a downstream
	 * section or fires a save. Pair with `onCheckedChange` to receive updates.
	 */
	checked?: boolean;
	/**
	 * Uncontrolled initial state. Set this when the parent doesn't need to
	 * read or react to the value in React state — the switch tracks its own
	 * state internally from this starting point.
	 *
	 * @defaultValue `false`
	 */
	defaultChecked?: boolean;
	/**
	 * Prevents interaction and renders the switch at reduced opacity. Use
	 * when the setting is unavailable for a reason the surrounding UI already
	 * explains (entitlement, dependency on another control). The hidden input
	 * is not submitted with the form while disabled.
	 *
	 * Accessibility: removes the switch from the tab order and announces it
	 * as disabled.
	 *
	 * @defaultValue `false`
	 */
	disabled?: boolean;
	/**
	 * Displays the current state without allowing the user to change it. Use
	 * when the value should remain visible and focusable but is locked by
	 * permissions or by an upstream control. Unlike `disabled`, the switch
	 * stays in the tab order and is announced normally.
	 *
	 * @defaultValue `false`
	 */
	readOnly?: boolean;
	/**
	 * Marks the hidden input as required for native form validation. Set this
	 * when a form expects the user to consciously confirm an on state before
	 * submission (terms acceptance, consent toggles).
	 *
	 * @defaultValue `false`
	 */
	required?: boolean;
	/**
	 * Field name submitted with a form. Set this when the switch is part of
	 * a standard HTML form post and the server expects a specific key.
	 */
	name?: string;
	/**
	 * Value submitted when the switch is off. By default, unchecked switches
	 * submit nothing — set this when a downstream form processor expects an
	 * explicit unchecked value rather than a missing key.
	 */
	uncheckedValue?: string;
	/**
	 * Fires when the user toggles the switch. Receives the new boolean state
	 * and event details. Use in controlled mode to update parent state or
	 * trigger a side effect like a network save.
	 */
	onCheckedChange?: SwitchPrimitive.Root.Props['onCheckedChange'];
	/**
	 * Ref to the hidden `<input>` element. Use when integrating with
	 * uncontrolled form libraries (react-hook-form's `register`, Formik's
	 * field refs) that read the underlying input directly.
	 */
	inputRef?: React.Ref<HTMLInputElement>;
	/**
	 * Merged on top of the component's classes via `cn()`. Reach for it when
	 * a one-off spacing or layout override is needed without forking the
	 * component.
	 */
	className?: string;
}

// SwitchPrimitive.Root.Props is a discriminated union, so we intersect rather than extend.
type SwitchProps = SwitchPrimitive.Root.Props & SwitchOwnProps;

/**
 * An immediate-action toggle that flips a setting the moment a user acts — Wi-Fi, notifications, airplane mode.
 *
 * @remarks
 * Wraps Base UI's `Switch.Root` and `Switch.Thumb` primitives and layers a
 * `size` axis on top via a `data-size` attribute on the root. Track and thumb
 * dimensions are driven by Tailwind data-attribute selectors rather than a
 * CVA call — the effect is the same as a CVA axis. The component reads
 * `data-checked` and `data-unchecked` to animate the thumb position, and
 * `aria-invalid` styling activates automatically when the underlying input
 * is marked invalid.
 *
 * ### Accessibility
 *
 * Renders a `<span>` with `role="switch"` and a hidden `<input>` beside it.
 * `aria-checked` reflects the binary state — `true` when on, `false` when off.
 * Unlike {@link Checkbox}, a switch has no mixed or indeterminate state.
 * A visible focus ring appears on `:focus-visible` so keyboard users get a
 * clear indicator without pointer clicks picking it up. The component
 * doesn't inject label text on its own — pair every Switch with a
 * `<Label>`, `aria-label`, or `aria-labelledby` so assistive tech can
 * announce what setting the switch controls.
 *
 * ### Keyboard interactions
 *
 * | Key | Description |
 * | --- | --- |
 * | `Space` | Toggles the switch between on and off. |
 * | `Tab` | Moves focus to the next focusable element. |
 *
 * ### When to use
 *
 * - The user is flipping a setting that takes effect immediately — no Save
 *   button, no confirmation step.
 * - The mental model matches a physical on/off switch: airplane mode,
 *   notifications, dark mode.
 *
 * ### When not to use
 *
 * - Use {@link Checkbox} when the control is part of a submitted form, a
 *   list of selectable options, or anything where the outcome won't apply
 *   until the user hits Save.
 * - Use a radio group when the user is picking one option from a set of
 *   mutually exclusive choices.
 *
 * @example Paired with a Label
 * ```tsx
 * import { Switch, Label } from '@unbranded-ds/react';
 *
 * export function AirplaneMode() {
 *   return (
 *     <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
 *       <Switch id="airplane-mode" />
 *       <Label htmlFor="airplane-mode">Airplane mode</Label>
 *     </div>
 *   );
 * }
 * ```
 *
 * @example Controlled toggle
 * ```tsx
 * import { useState } from 'react';
 * import { Switch, Label } from '@unbranded-ds/react';
 *
 * export function NotificationsToggle() {
 *   const [enabled, setEnabled] = useState(false);
 *   return (
 *     <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
 *       <Switch
 *         id="notifications"
 *         checked={enabled}
 *         onCheckedChange={(checked) => setEnabled(checked)}
 *       />
 *       <Label htmlFor="notifications">Push notifications</Label>
 *     </div>
 *   );
 * }
 * ```
 *
 * @see https://www.w3.org/WAI/ARIA/apg/patterns/switch/
 * @see {@link Checkbox}
 */
function Switch({
	className,
	size = 'default',
	...props
}: SwitchProps) {
	return (
		<SwitchPrimitive.Root
			data-slot="switch"
			data-size={size}
			className={cn(
				'peer group/switch relative inline-flex shrink-0 items-center rounded-full border border-transparent shadow-xs transition-all outline-none after:absolute after:-inset-x-3 after:-inset-y-2 focus-visible:border-ring focus-visible:ring-(length:--ring-width) focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-(length:--ring-width) aria-invalid:ring-destructive/20 data-[size=default]:h-[18.4px] data-[size=default]:w-[32px] data-[size=sm]:h-[14px] data-[size=sm]:w-[24px] dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 data-checked:bg-primary data-unchecked:bg-input dark:data-unchecked:bg-input/80 data-disabled:cursor-not-allowed data-disabled:opacity-50',
				className,
			)}
			{...props}
		>
			<SwitchPrimitive.Thumb
				data-slot="switch-thumb"
				className="pointer-events-none block rounded-full bg-background ring-0 transition-transform group-data-[size=default]/switch:size-4 group-data-[size=sm]/switch:size-3 group-data-[size=default]/switch:data-checked:translate-x-[calc(100%-2px)] group-data-[size=sm]/switch:data-checked:translate-x-[calc(100%-2px)] dark:data-checked:bg-primary-foreground group-data-[size=default]/switch:data-unchecked:translate-x-0 group-data-[size=sm]/switch:data-unchecked:translate-x-0 dark:data-unchecked:bg-foreground"
			/>
		</SwitchPrimitive.Root>
	);
}

export { Switch };
export type { SwitchProps };
