import type { JSX } from 'react';
import * as React from 'react';

import { cn } from '../../lib/cn';

type VisuallyHiddenProps<T extends keyof JSX.IntrinsicElements = 'span'> = {
	as?: T;
	children?: React.ReactNode;
	className?: string;
} & Omit<React.ComponentPropsWithoutRef<T>, 'as' | 'children' | 'className'>;

/**
 * Renders its children in a visually-hidden but assistive-technology-accessible
 * manner. Useful for screen-reader-only labels on icon buttons, skip-link
 * targets, ARIA descriptions, and any context where sighted users do not need
 * the text but assistive technology does.
 *
 * Polymorphic — the `as` prop controls the underlying element type, defaulting
 * to `<span>`.
 *
 * Uses Tailwind v4's built-in `.sr-only` utility for the visually-hidden
 * treatment; does not redefine the class.
 *
 * @example Icon button with screen-reader label
 * ```tsx
 * import { VisuallyHidden } from '@unbranded-ds/react'
 *
 * <button>
 *   <EyeIcon />
 *   <VisuallyHidden>Show settings</VisuallyHidden>
 * </button>
 * ```
 *
 * @example As a block-level wrapper
 * ```tsx
 * <VisuallyHidden as="div">
 *   <h2>Section heading visible only to screen readers</h2>
 * </VisuallyHidden>
 * ```
 */
function VisuallyHidden<T extends keyof JSX.IntrinsicElements = 'span'>({
	as,
	className,
	children,
	...props
}: VisuallyHiddenProps<T>) {
	const Tag = (as ?? 'span') as React.ElementType;
	return (
		<Tag
			data-slot="visually-hidden"
			className={cn('sr-only', className)}
			{...props}
		>
			{children}
		</Tag>
	);
}

export { VisuallyHidden };
export type { VisuallyHiddenProps };
