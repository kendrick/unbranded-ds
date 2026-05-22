import type { JSX } from 'react';
import * as React from 'react';

import { cn } from '../../lib/cn';

type VisuallyHiddenProps<T extends keyof JSX.IntrinsicElements = 'span'> = {
	/**
	 * The underlying HTML element to render. Set to `'div'` when the hidden
	 * content is block-level (a heading or paragraph that a `<span>` cannot
	 * legally contain), to `'h2'` (or another heading level) when surfacing a
	 * screen-reader-only landmark heading, or to any intrinsic element when a
	 * span would break the surrounding semantics or layout.
	 *
	 * @defaultValue `'span'`
	 */
	as?: T;
	/**
	 * Content that stays present in the accessibility tree while remaining
	 * off-screen. Reach for this primitive when text needs to exist in the DOM
	 * for assistive technology — refreshable braille displays, copy-paste
	 * selection, focus targets — rather than as a string attribute on another
	 * element.
	 */
	children?: React.ReactNode;
	/**
	 * Extra Tailwind classes merged with the built-in `sr-only` baseline via
	 * `cn()`. Reach for it to layer additional layout context like `contents`
	 * without redeclaring the hidden treatment.
	 */
	className?: string;
} & Omit<React.ComponentPropsWithoutRef<T>, 'as' | 'children' | 'className'>;

/**
 * An accessibility primitive that keeps text in the assistive-technology tree while removing it from the visual layout.
 *
 * @remarks
 * Applies Tailwind v4's built-in `.sr-only` utility — the component does not
 * redefine the class. The element is polymorphic through the `as` prop and
 * defaults to `<span>`, so the rendered HTML stays inline unless the consumer
 * opts into a block-level wrapper. Any extra props forward to the underlying
 * element, which makes `id` available for `aria-describedby` and `aria-labelledby`
 * wiring.
 *
 * The `sr-only` technique sits between `display: none` and plain in-flow text.
 * `display: none` and `visibility: hidden` both strip content from the
 * accessibility tree, so screen readers skip them. Plain text appears on screen.
 * The clip technique positions the element absolutely, collapses it to a 1×1
 * pixel box, clips overflow, and locks `white-space: nowrap` — enough to pull
 * the element out of the visual flow while leaving it fully present for
 * assistive technology. When the hidden content is itself focusable (a skip
 * link target, for example), it becomes visible on focus; the class does not
 * suppress focus rings.
 *
 * ### Accessibility
 *
 * Content rendered by `VisuallyHidden` participates in the DOM and the
 * accessibility tree. Screen readers announce it, refreshable braille displays
 * surface it, and keyboard users can copy-paste the text. Compare with
 * `aria-label`, which attaches a label string to an element without any DOM
 * presence — prefer `VisuallyHidden` when the content has standalone meaning
 * or needs to remain selectable. When a child element receives focus, the
 * hidden content becomes visible because the clip CSS releases on focus; that
 * behavior is what makes the technique compatible with skip links.
 *
 * ### When to use
 *
 * - Icon-only buttons that need an accessible name without visible text.
 * - Landmark regions (`<nav>`, `<aside>`, `<section>`) that lack a visible
 *   heading and need a programmatic label via `aria-labelledby`.
 * - Screen-reader-only descriptions paired with `aria-describedby` on form
 *   fields or interactive controls.
 *
 * ### When not to use
 *
 * - Use `aria-label` when the label is a short string with no standalone
 *   meaning and does not need to be selectable or present in the DOM.
 * - Use {@link Tooltip} when the supplemental text should appear visually on
 *   hover or focus rather than staying permanently hidden.
 * - Use {@link SkipLink} for the specific bypass-block pattern where the
 *   hidden link reveals on focus and moves keyboard users to a landmark.
 *
 * @example Icon button with screen-reader-only label
 * ```tsx
 * import { VisuallyHidden } from '@unbranded-ds/react';
 * import { Settings } from 'lucide-react';
 *
 * export function SettingsButton() {
 *   return (
 *     <button type="button">
 *       <Settings aria-hidden="true" />
 *       <VisuallyHidden>Open settings</VisuallyHidden>
 *     </button>
 *   );
 * }
 * ```
 *
 * @example Block-level wrapper via the as prop
 * ```tsx
 * import { VisuallyHidden } from '@unbranded-ds/react';
 *
 * export function HiddenSectionHeading() {
 *   return (
 *     <section aria-labelledby="related-heading">
 *       <VisuallyHidden as="h2" id="related-heading">
 *         Related articles
 *       </VisuallyHidden>
 *     </section>
 *   );
 * }
 * ```
 *
 * @see {@link SkipLink}
 * @see {@link Tooltip}
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
