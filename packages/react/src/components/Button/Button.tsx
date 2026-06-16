/* eslint-disable react-refresh/only-export-components -- shadcn pattern co-locates buttonVariants with the Button component */
import type * as React from 'react';
import { Button as ButtonPrimitive } from '@base-ui-components/react/button';
import { cva } from 'class-variance-authority';

import { cn } from '../../lib/cn';

const buttonVariants = cva(
	'group/button inline-flex shrink-0 items-center justify-center rounded-md border border-transparent bg-clip-padding text-sm font-medium whitespace-nowrap transition-all outline-none select-none focus-visible:border-ring focus-visible:ring-(length:--ring-width) focus-visible:ring-ring/50 active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-(length:--ring-width) aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*=\'size-\'])]:size-4',
	{
		variants: {
			variant: {
				default: 'bg-primary text-primary-foreground hover:bg-primary/80',
				outline:
          'border-border bg-background shadow-xs hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground dark:border-input dark:bg-input/30 dark:hover:bg-input/50',
				secondary:
          'bg-secondary text-secondary-foreground hover:bg-secondary/80 aria-expanded:bg-secondary aria-expanded:text-secondary-foreground',
				ghost:
          'hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground dark:hover:bg-muted/50',
				destructive:
          'bg-destructive-subtle text-destructive-subtle-foreground hover:bg-[color-mix(in_oklab,var(--color-destructive-subtle),var(--color-destructive)_12%)] focus-visible:border-destructive/40 focus-visible:ring-destructive/20',
				link: 'text-primary underline-offset-4 hover:underline',
			},
			size: {
				'default':
          'h-9 gap-1.5 px-2.5 in-data-[slot=button-group]:rounded-md has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2',
				'xs': 'h-6 gap-1 rounded-[min(var(--radius-md),8px)] px-2 text-xs in-data-[slot=button-group]:rounded-md has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*=\'size-\'])]:size-3',
				'sm': 'h-8 gap-1 rounded-[min(var(--radius-md),10px)] px-2.5 in-data-[slot=button-group]:rounded-md has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5',
				'lg': 'h-10 gap-1.5 px-2.5 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2',
				'icon': 'size-9',
				'icon-xs':
          'size-6 rounded-[min(var(--radius-md),8px)] in-data-[slot=button-group]:rounded-md [&_svg:not([class*=\'size-\'])]:size-3',
				'icon-sm':
          'size-8 rounded-[min(var(--radius-md),10px)] in-data-[slot=button-group]:rounded-md',
				'icon-lg': 'size-10',
			},
		},
		defaultVariants: {
			variant: 'default',
			size: 'default',
		},
	},
);

interface ButtonOwnProps {
	/**
	 * The button's visual treatment. Pick by user intent: `default` for the
	 * primary action on a surface, `destructive` for irreversible actions like
	 * deletion or sign-out, `outline` or `ghost` for de-emphasized secondary
	 * choices, `secondary` for lower-priority actions, `link` for inline
	 * navigation that keeps button semantics.
	 *
	 * @defaultValue `'default'`
	 */
	variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
	/**
	 * Height, padding, and shape of the button. Use `'sm'` or `'xs'` in dense
	 * toolbars, `'lg'` for touch-friendly CTAs, and the `icon-*` variants when
	 * the child is a solo icon that needs a square hit target.
	 *
	 * Accessibility: the `icon-*` sizes produce a square button with no visible
	 * label, so an `aria-label` is required for screen-reader users.
	 *
	 * @defaultValue `'default'`
	 */
	size?: 'default' | 'xs' | 'sm' | 'lg' | 'icon' | 'icon-xs' | 'icon-sm' | 'icon-lg';
	/**
	 * Merged on top of variant classes via `cn()`. Reach for it when a one-off
	 * spacing or color override is needed without forking the component.
	 */
	className?: string;
	/** Button label or icon content. */
	children?: React.ReactNode;
}

// ButtonPrimitive.Props is a discriminated union, so we intersect rather than extend.
type ButtonProps = ButtonPrimitive.Props & ButtonOwnProps;

/**
 * A button triggers an event or action — submitting a form, opening a dialog, canceling an operation.
 *
 * @remarks
 * Wraps Base UI's `Button` primitive and layers two CVA axes on top: `variant`
 * (six visual treatments mapped to user intent) and `size` (eight density and
 * shape options including square icon targets). Extra classes passed through
 * `className` are merged with variant styles via `cn()`, so consumers can
 * apply one-off overrides without forking the component.
 *
 * ### Accessibility
 *
 * Renders a native `<button>` element. Receives focus on Tab, activates on
 * Enter or Space, and announces its text content as the accessible name. When
 * `disabled` is set, the button leaves the tab order and is announced as
 * disabled. For icon-only buttons (`size="icon"` or any `icon-*` variant),
 * pass `aria-label` with a description of the action — the SVG child is
 * decorative and carries no accessible name on its own. The component applies
 * `focus-visible:ring` and `focus-visible:border-ring` styles for
 * keyboard-visible focus, meeting WCAG 2.4.7.
 *
 * ### Keyboard interactions
 *
 * | Key | Description |
 * | --- | --- |
 * | `Enter` | Activates the button. |
 * | `Space` | Activates the button. |
 * | `Tab` | Moves focus to the next focusable element. |
 *
 * ### When to use
 *
 * - The user needs a focusable, tappable target to fire an action (submit,
 *   confirm, delete, open a {@link Dialog}).
 * - You need to communicate action priority through visual weight — pair a
 *   `default` button with `outline` or `ghost` for a clear primary/secondary
 *   hierarchy.
 *
 * ### When not to use
 *
 * - Use {@link Switch} when the intent is toggling a persistent on/off setting
 *   rather than triggering a one-time action.
 * - Use a native `<a>` element for navigation that changes the URL. A `link`
 *   variant button retains button semantics and is not a navigation anchor.
 *
 * @example Minimal usage
 * ```tsx
 * import { Button } from '@unbranded-ds/react';
 *
 * export function SaveAction() {
 *   return <Button>Save changes</Button>;
 * }
 * ```
 *
 * @example Icon-only button with aria-label
 * ```tsx
 * import { Button } from '@unbranded-ds/react';
 *
 * export function CloseButton() {
 *   return (
 *     <Button variant="ghost" size="icon" aria-label="Close panel">
 *       <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
 *         <path d="M18 6 6 18M6 6l12 12" />
 *       </svg>
 *     </Button>
 *   );
 * }
 * ```
 *
 * @see https://www.w3.org/WAI/ARIA/apg/patterns/button/
 * @see {@link Dialog}
 * @see {@link Switch}
 */
function Button({
	className,
	variant = 'default',
	size = 'default',
	...props
}: ButtonProps) {
	return (
		<ButtonPrimitive
			data-slot="button"
			className={cn(buttonVariants({ variant, size, className }))}
			{...props}
		/>
	);
}

export { Button, buttonVariants };
export type { ButtonProps };
