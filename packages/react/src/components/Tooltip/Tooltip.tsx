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
	/**
	 * The tooltip tree. Must contain both a `Tooltip.Trigger` and a
	 * `Tooltip.Content` so the provider has something to open against.
	 */
	children?: React.ReactNode;
	/**
	 * Milliseconds the tooltip waits before opening on hover. Increase when
	 * triggers cluster densely and accidental hovers are common; decrease
	 * to ~200ms for tooltips on critical actions where instant feedback
	 * matters.
	 *
	 * Accessibility: keyboard focus opens the tooltip immediately and
	 * ignores this value, so the delay only governs pointer hover.
	 *
	 * @defaultValue `700`
	 */
	delayDuration?: number;
	/**
	 * Portal mount target for `Tooltip.Content`. Pass a specific element
	 * when an ancestor clips overflow and the tooltip needs to escape,
	 * or when a fixed-positioned ancestor owns the stacking context you
	 * want the panel to land in.
	 *
	 * @defaultValue `document.body`
	 */
	container?: HTMLElement | null;
	/**
	 * Fires when the open state changes from any source — hover, focus,
	 * tap, Escape, or outside press. Use to sync the tooltip's open
	 * state with external analytics, animations, or coordinated UI
	 * changes.
	 */
	onOpenChange?: (open: boolean) => void;
}

/**
 * Owns hover delay timing, portal mount target, and open-state callbacks
 * for one tooltip pair. Wrap your trigger and content in a Provider —
 * typical usage is one Provider per Trigger/Content pair.
 *
 * @see {@link Tooltip} for full keyboard interactions and usage guidance.
 */
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
	/**
	 * The trigger content. When `asChild` is unset, this renders inside the
	 * default `<button>`; when `asChild` is set, this must be a single
	 * element that receives the tooltip props directly.
	 */
	children?: React.ReactNode;
	/**
	 * Applied to the trigger element. Merged with the child's className via
	 * `cn()` when `asChild` is set, so utility classes survive the swap.
	 */
	className?: string;
	/**
	 * When true, forwards trigger props to the single child element instead
	 * of rendering an extra `<button>`. Reach for it for citation patterns
	 * like `<sup><a/></sup>` where the original DOM shape must be preserved
	 * for screen readers and inline typography.
	 *
	 * @defaultValue `false`
	 */
	asChild?: boolean;
}

/**
 * The element that opens the tooltip on hover, focus, or tap. Renders a
 * `<button>` by default; pass `asChild` to attach behavior to an existing
 * element without an extra wrapper.
 *
 * @see {@link Tooltip} for full keyboard interactions and usage guidance.
 */
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
	/**
	 * The tooltip text or content. Keep it short — tooltips are glanceable
	 * labels, not paragraphs of body copy.
	 */
	children?: React.ReactNode;
	/**
	 * Merged with the default panel classes via `cn()`. Use to adjust
	 * max-width or typography on a per-tooltip basis without forking the
	 * component.
	 */
	className?: string;
	/**
	 * Which edge of the trigger the content anchors against. Override the
	 * default when the surrounding layout makes another edge a better fit.
	 *
	 * Base UI flips this automatically when the chosen edge would clip
	 * against the viewport, so this is a preference rather than a hard
	 * constraint.
	 *
	 * @defaultValue `'top'`
	 */
	side?: 'top' | 'right' | 'bottom' | 'left';
	/**
	 * Alignment of the content along the chosen side. Pick `'start'` or
	 * `'end'` for triggers anchored to one edge of a layout, `'center'` for
	 * symmetric placements.
	 *
	 * @defaultValue `'center'`
	 */
	align?: 'start' | 'center' | 'end';
}

/**
 * The floating tip rendered in a portal. Owns positioning (`side`,
 * `align`) and handles enter/exit transitions with reduced-motion
 * support.
 *
 * Accessibility: carries `role="tooltip"` and is wired to the trigger
 * via `aria-describedby` automatically.
 *
 * @see {@link Tooltip} for full keyboard interactions and usage guidance.
 */
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

/**
 * A small popover surface that surfaces auxiliary information on hover, keyboard focus, or tap.
 *
 * @remarks
 * Composes three slots: {@link Tooltip.Provider} (owns hover delay,
 * portal target, and open-state callback), {@link Tooltip.Trigger}
 * (the focusable target that opens the panel), and
 * {@link Tooltip.Content} (the floating tip rendered through a portal).
 * Each slot wraps a Base UI Tooltip primitive, so assistive technology
 * hears a standard `role="tooltip"` description wired to the trigger
 * through `aria-describedby`.
 *
 * The content renders inside `document.body` by default, which lets it
 * escape ancestors that clip overflow. When `prefers-reduced-motion:
 * reduce` is active, the open and close transitions are skipped
 * entirely per WCAG SC 2.3.3 — no consumer configuration required.
 *
 * ### Accessibility
 *
 * The trigger is wired to the content via `aria-describedby`
 * automatically, and the content carries `role="tooltip"` so screen
 * readers announce it as a tooltip rather than a live region or
 * dialog. Pointer hover opens the panel after the configured
 * `delayDuration`; keyboard focus opens it immediately and bypasses
 * the delay; tap toggles it open and closed on touch devices.
 * Pressing Escape closes the tooltip and returns focus to the
 * trigger. Blur and outside press also dismiss it. Because the
 * content portals out of its parent tree, it can escape ancestors
 * with `overflow: hidden` or `overflow: clip` without consumers
 * restructuring the DOM.
 *
 * ### Keyboard interactions
 *
 * | Key | Description |
 * | --- | --- |
 * | `Tab` | Moves focus to the trigger and opens the tooltip immediately, bypassing the hover delay. |
 * | `Escape` | Closes the tooltip and returns focus to the trigger. |
 *
 * Pointer hover and touch tap also open the tooltip but follow
 * different timing rules — hover waits for `delayDuration`, tap is
 * instantaneous.
 *
 * ### When to use
 *
 * - Surfacing supplementary information for icon-only buttons,
 *   abbreviations, truncated text, or terse labels where the full
 *   context doesn't fit visually.
 * - Citation hovers in editorial content, where the source detail
 *   should appear on demand without breaking the reading flow.
 *
 * ### When not to use
 *
 * - Use {@link Dialog} when the content requires user action or a
 *   focus trap — tooltips are informational only and dismiss on blur.
 * - Use {@link VisuallyHidden} when the accessible label should be
 *   permanently available to screen readers rather than disclosed on
 *   hover or focus.
 * - Write a clear visible label when the information is essential to
 *   understanding the action; tooltips shouldn't carry load-bearing
 *   content.
 *
 * @example Basic hover tooltip
 * ```tsx
 * import { Tooltip } from '@unbranded-ds/react';
 *
 * export function SaveButton() {
 *   return (
 *     <Tooltip.Provider>
 *       <Tooltip.Trigger>Save</Tooltip.Trigger>
 *       <Tooltip.Content>Saves your changes immediately</Tooltip.Content>
 *     </Tooltip.Provider>
 *   );
 * }
 * ```
 *
 * @example Citation pattern with asChild
 * ```tsx
 * import { Tooltip } from '@unbranded-ds/react';
 *
 * export function CitationTooltip() {
 *   return (
 *     <p>
 *       Reading text with a footnote
 *       <sup>
 *         <Tooltip.Provider>
 *           <Tooltip.Trigger asChild>
 *             <a href="#source-1" className="ml-0.5 text-primary underline">
 *               [1]
 *             </a>
 *           </Tooltip.Trigger>
 *           <Tooltip.Content>Source: Smith et al., 2024</Tooltip.Content>
 *         </Tooltip.Provider>
 *       </sup>
 *       {' '}and more body text after it.
 *     </p>
 *   );
 * }
 * ```
 *
 * @example Alternative side and alignment
 * ```tsx
 * import { Tooltip } from '@unbranded-ds/react';
 *
 * export function PositionedTooltip() {
 *   return (
 *     <Tooltip.Provider>
 *       <Tooltip.Trigger>Right-anchored</Tooltip.Trigger>
 *       <Tooltip.Content side="right" align="start">
 *         Anchored to the right, start-aligned
 *       </Tooltip.Content>
 *     </Tooltip.Provider>
 *   );
 * }
 * ```
 *
 * @see https://www.w3.org/WAI/ARIA/apg/patterns/tooltip/
 * @see {@link Dialog}
 * @see {@link VisuallyHidden}
 */
const Tooltip = {
	Provider: TooltipProvider,
	Trigger: TooltipTrigger,
	Content: TooltipContent,
};

export { Tooltip };
export type { TooltipContentProps, TooltipProviderProps, TooltipTriggerProps };
