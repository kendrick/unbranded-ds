'use client';

import type * as React from 'react';

import { cn } from '../../lib/cn';

interface SkipLinkProps {
	/**
	 * The `id` of the element to jump to when the link is activated. The
	 * rendered anchor's `href` becomes `#${targetId}`.
	 */
	targetId?: string;
	/**
	 * The visible link text shown once the link receives focus. Screen readers
	 * read this label whether or not the link is visually rendered.
	 */
	children?: React.ReactNode;
	/**
	 * Extra Tailwind utilities merged onto the rendered anchor. Use it to
	 * override the focus-revealed treatment without redeclaring the hidden
	 * baseline.
	 */
	className?: string;
}

/**
 * A "skip to main content" link. Renders as a native `<a>` that stays
 * visually hidden until it receives keyboard focus, then reveals at the
 * top-left of the viewport so a keyboard or screen-reader user can jump
 * past long navigation. Addresses WCAG 2.4.1 (Bypass Blocks).
 *
 * The component is intentionally thin: it relies on native anchor behavior
 * for focus and scroll on activation, and it does not call
 * `preventDefault()` or run programmatic scroll. The consumer is
 * responsible for placing a matching `id` on the target element.
 *
 * Multiple `<SkipLink>` instances may share a page, each pointing at its
 * own `targetId`. The component takes no layout opinion on how stacked
 * instances render together.
 *
 * @example
 * ```tsx
 * <SkipLink />
 * <main id="main">...</main>
 * ```
 *
 * @example Multiple targets
 * ```tsx
 * <SkipLink targetId="main">Skip to main content</SkipLink>
 * <SkipLink targetId="nav">Skip to navigation</SkipLink>
 * <SkipLink targetId="footer">Skip to footer</SkipLink>
 * ```
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
