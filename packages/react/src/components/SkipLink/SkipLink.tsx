'use client';

import type * as React from 'react';

import { cn } from '../../lib/cn';

interface SkipLinkProps {
	/**
	 * The `id` of the element to land on when the link is activated. The
	 * rendered anchor's `href` becomes `#${targetId}`. Change from the default
	 * when the page's primary content region uses an id other than `"main"` or
	 * when stacking multiple SkipLinks at different landmarks (nav, search,
	 * footer).
	 *
	 * Accessibility: the matching element must be focusable — natively
	 * focusable elements work, or add `tabIndex={-1}` to a wrapper so the
	 * browser shifts focus on activation, not just scroll.
	 *
	 * @defaultValue `'main'`
	 */
	targetId?: string;
	/**
	 * The visible link text shown once the link receives focus. Keep the
	 * default for the common single-skip case; change it when the link points
	 * at something other than the main content region so the label names the
	 * destination ("Skip to search", "Skip to footer"). Screen readers
	 * announce this label whether the link is visually rendered or not.
	 *
	 * @defaultValue `'Skip to main content'`
	 */
	children?: React.ReactNode;
	/**
	 * Extra Tailwind utilities merged onto the rendered anchor via `cn()`. Use
	 * it to adjust the focus-revealed treatment (position, color, ring) when a
	 * specific layout needs a different reveal spot, without redeclaring the
	 * hidden baseline.
	 */
	className?: string;
}

/**
 * A skip-to-content link that stays visually hidden until keyboard focus reveals it at the top of the viewport.
 *
 * @remarks
 * Renders a native `<a>` whose `href` points at the matching target `id`. At
 * rest the anchor carries Tailwind's `sr-only` class, which keeps it
 * off-screen for sighted users but in the accessibility tree. On
 * `focus-visible`, a paired `not-sr-only` plus a set of fixed-position styles
 * reveal the link at the upper-left of the viewport above other content.
 * Activation relies on standard browser anchor behavior — no JavaScript
 * intercepts the click or keypress, and the component never calls
 * `preventDefault()`. The consumer owns the matching `id` on the target
 * element. Multiple SkipLink instances may share a page, each pointing at its
 * own `targetId`.
 *
 * ### Accessibility
 *
 * Addresses WCAG 2.4.1 (Bypass Blocks) by giving keyboard and screen-reader
 * users a way past long navigation. For activation to shift focus (not just
 * scroll), the target element must be focusable — either a natively focusable
 * element or one with `tabIndex={-1}` added. Without a focusable target most
 * browsers scroll but leave focus where it was, which defeats the assistive
 * purpose. Screen readers announce the link label whether or not the link is
 * in the visual layout, so the label should name the destination. Multiple
 * instances on one page are valid; all share the same `top-2 left-2` reveal
 * coordinates, so only the focused one is visible at any given moment.
 *
 * ### When to use
 *
 * - Pages where navigation or other repeated content precedes the main region.
 * - Multi-landmark layouts where keyboard users benefit from jumping directly
 *   to nav, main, search, or footer.
 *
 * ### When not to use
 *
 * - When there is no repeated content to bypass — a single-region page whose
 *   first focusable element is already the main content.
 * - Use {@link VisuallyHidden} when you need content available to assistive
 *   technology but never revealed visually; SkipLink is specifically for the
 *   on-focus reveal pattern.
 *
 * @example Minimum viable usage
 * ```tsx
 * import { SkipLink } from '@unbranded-ds/react';
 *
 * export function Layout() {
 *   return (
 *     <>
 *       <SkipLink />
 *       <nav aria-label="Primary">
 *         <a href="#one">One</a>
 *       </nav>
 *       <main id="main" tabIndex={-1}>Page content</main>
 *     </>
 *   );
 * }
 * ```
 *
 * @example Multiple skip targets
 * ```tsx
 * import { SkipLink } from '@unbranded-ds/react';
 *
 * export function RichLayout() {
 *   return (
 *     <>
 *       <SkipLink targetId="main">Skip to main content</SkipLink>
 *       <SkipLink targetId="nav">Skip to navigation</SkipLink>
 *       <SkipLink targetId="footer">Skip to footer</SkipLink>
 *       <nav id="nav" aria-label="Primary" tabIndex={-1}>
 *         <a href="#one">One</a>
 *       </nav>
 *       <main id="main" tabIndex={-1}>Page content</main>
 *       <footer id="footer" tabIndex={-1}>End of page</footer>
 *     </>
 *   );
 * }
 * ```
 *
 * @see https://www.w3.org/WAI/WCAG21/Understanding/bypass-blocks
 * @see {@link VisuallyHidden}
 */
function SkipLink({
	targetId = 'main',
	children = 'Skip to main content',
	className,
}: SkipLinkProps) {
	return (
		<a
			data-slot="skip-link"
			href={`#${targetId}`}
			className={cn(
				'sr-only',
				'focus-visible:not-sr-only focus-visible:fixed focus-visible:top-2 focus-visible:left-2 focus-visible:z-50',
				'focus-visible:inline-flex focus-visible:items-center focus-visible:rounded-md focus-visible:border focus-visible:border-ring focus-visible:bg-primary focus-visible:px-3 focus-visible:py-2',
				'focus-visible:text-sm focus-visible:font-medium focus-visible:text-primary-foreground focus-visible:shadow-md',
				'focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50',
				className,
			)}
		>
			{children}
		</a>
	);
}

export { SkipLink };
export type { SkipLinkProps };
