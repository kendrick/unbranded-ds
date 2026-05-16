'use client';

import { Tooltip as TooltipPrimitive } from '@base-ui-components/react/tooltip';
import * as React from 'react';

import { cn } from '../../lib/cn';

// Threads the Provider-level portal target down to Content's Portal without
// asking consumers to pass it through both slots. Base UI's Provider only
// shares delay grouping; container is a Portal-level concern, so we bridge it
// here to keep our wrapper API single-pair-friendly per the contract.
const TooltipContainerContext = React.createContext<HTMLElement | null | undefined>(undefined);

interface TooltipProviderProps {
	children?: React.ReactNode;
	/**
	 * Hover delay before the tooltip opens, in milliseconds. Keyboard focus
	 * opens the tooltip immediately and ignores this value.
	 */
	delayDuration?: number;
	/**
	 * Portal mount target for `Tooltip.Content`. Defaults to `document.body`,
	 * which lets the tooltip escape ancestors that clip overflow.
	 */
	container?: HTMLElement | null;
	/**
	 * Fires when the open state changes from any source (hover, focus, tap,
	 * Escape, outside press).
	 */
	onOpenChange?: (open: boolean) => void;
}

function TooltipProvider({
	children,
	delayDuration = 700,
	container,
	onOpenChange,
}: TooltipProviderProps) {
	return (
		<TooltipContainerContext value={container}>
			<TooltipPrimitive.Provider delay={delayDuration}>
				<TooltipPrimitive.Root
					onOpenChange={
						onOpenChange
							? (open) => {
									onOpenChange(open);
								}
							: undefined
					}
				>
					<div data-slot="tooltip-provider" style={{ display: 'contents' }}>
						{children}
					</div>
				</TooltipPrimitive.Root>
			</TooltipPrimitive.Provider>
		</TooltipContainerContext>
	);
}

interface TooltipTriggerProps {
	children?: React.ReactNode;
	className?: string;
	/**
	 * When true, forwards trigger props to the single child element instead of
	 * rendering an extra `<button>`. Required for citation patterns like
	 * `<sup><a/></sup>` where the original DOM shape must be preserved.
	 */
	asChild?: boolean;
}

function TooltipTrigger({ asChild = false, className, children, ...props }: TooltipTriggerProps) {
	if (asChild) {
		const child = React.Children.only(children) as React.ReactElement<{ className?: string }>;
		// Base UI's `render` prop replaces the underlying element. Passing the
		// child element here is how we preserve the caller's DOM tag (e.g. an
		// <a> inside a <sup>) while still attaching tooltip event handlers.
		return (
			<TooltipPrimitive.Trigger
				data-slot="tooltip-trigger"
				render={React.cloneElement(child, {
					className: cn(className, child.props.className),
				})}
				{...props}
			/>
		);
	}

	return (
		<TooltipPrimitive.Trigger
			data-slot="tooltip-trigger"
			className={cn(className)}
			{...props}
		>
			{children}
		</TooltipPrimitive.Trigger>
	);
}

interface TooltipContentProps {
	children?: React.ReactNode;
	className?: string;
	/**
	 * Which edge of the trigger the content anchors against. Base UI flips this
	 * automatically when the chosen edge would clip against the viewport.
	 */
	side?: 'top' | 'right' | 'bottom' | 'left';
	/**
	 * Alignment of the content along the chosen side. `'start'` and `'end'`
	 * align to the leading and trailing edges of the trigger; `'center'`
	 * centers along the axis.
	 */
	align?: 'start' | 'center' | 'end';
}

function TooltipContent({
	children,
	className,
	side = 'top',
	align = 'center',
	...props
}: TooltipContentProps) {
	const container = React.use(TooltipContainerContext);

	return (
		<TooltipPrimitive.Portal container={container ?? undefined}>
			<TooltipPrimitive.Positioner side={side} align={align} sideOffset={4}>
				<TooltipPrimitive.Popup
					data-slot="tooltip-content"
					className={cn(
						'z-50 w-fit origin-(--transform-origin) rounded-md bg-popover px-3 py-1.5 text-xs text-popover-foreground shadow-md ring-1 ring-foreground/10 transition-[opacity,transform] duration-150 motion-reduce:transition-none motion-reduce:duration-0 data-instant:duration-0 data-open:opacity-100 data-closed:opacity-0',
						className,
					)}
					{...props}
				>
					{children}
				</TooltipPrimitive.Popup>
			</TooltipPrimitive.Positioner>
		</TooltipPrimitive.Portal>
	);
}

const Tooltip = {
	Provider: TooltipProvider,
	Trigger: TooltipTrigger,
	Content: TooltipContent,
};

export { Tooltip };
export type { TooltipContentProps, TooltipProviderProps, TooltipTriggerProps };
