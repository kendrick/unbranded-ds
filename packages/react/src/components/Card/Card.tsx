import * as React from 'react';

import { cn } from '../../lib/cn';

interface CardOwnProps {
	/**
	 * Spacing scale for the entire card tree. The value propagates via
	 * `data-size` so CardHeader, CardContent, and CardFooter all read it
	 * through Tailwind's group modifier. Reach for `'sm'` in dense grids
	 * (dashboards, sidebars) where the default reads as too airy.
	 *
	 * @defaultValue `'default'`
	 */
	size?: 'default' | 'sm';
	/**
	 * Merged on top of the card's base classes via `cn()`. Reach for it when
	 * a one-off override is needed — a tighter max-width on a single instance,
	 * a different background, a custom ring color — without forking the
	 * component.
	 */
	className?: string;
	/**
	 * The card tree. Compose with {@link CardHeader}, {@link CardContent}, and
	 * optionally {@link CardFooter}. A leading `<img>` is rounded to match the
	 * card's top corners; a trailing `<img>` is rounded at the bottom.
	 */
	children?: React.ReactNode;
}

type CardProps = React.ComponentProps<'div'> & CardOwnProps;

/**
 * A surface container that groups related content and actions into a distinct visual unit.
 *
 * @remarks
 * Card is a compound component built from seven sibling exports: the root
 * `Card` shell plus six slot components ({@link CardHeader}, {@link CardTitle},
 * {@link CardDescription}, {@link CardAction}, {@link CardContent},
 * {@link CardFooter}). The root owns the `size` axis and exposes it as a
 * `data-size` attribute; the slots read that attribute through Tailwind's
 * `group/card` context class, so toggling `size` on the parent restyles the
 * whole tree without prop drilling. Images placed as the first or last child
 * of `Card` are corner-rounded automatically to align with the card's outer
 * radius.
 *
 * ### Accessibility
 *
 * Card itself is a non-interactive container. It carries no ARIA role by
 * default and is not focusable, so screen readers treat it as ordinary flow
 * content. CardTitle renders as a `<div>` rather than a semantic heading —
 * the component cannot know its position in the document outline, so it
 * leaves heading level to the consumer. When heading hierarchy matters,
 * nest an `<h2>` or `<h3>` inside CardTitle. Interactive elements placed
 * inside the card (buttons, links, form fields) carry their own keyboard
 * and screen-reader semantics; no extra ARIA work is needed on the shell.
 * Avoid attaching an `onClick` to the Card itself — that produces an
 * undiscoverable keyboard target with no role. Wrap the interactive region
 * in a `<button>` or `<a>` instead.
 *
 * ### When to use
 *
 * - Grouping related content into a distinct visual unit — a profile
 *   summary, a settings panel, a pricing tier, a dashboard tile.
 * - Grid layouts where peer items need consistent framing.
 * - Surface-level grouping of an information block plus its primary actions.
 *
 * ### When not to use
 *
 * - When the grouping is purely structural with no visual surface — use a
 *   plain `<section>` or `<div>`.
 * - When the content requires a focus trap or must be acted on before
 *   continuing — use {@link Dialog} instead.
 * - When the entire surface needs to be a single clickable target — build
 *   your own wrapper around the shell so the interaction has real button or
 *   link semantics.
 *
 * @example Minimal header and content
 * ```tsx
 * import {
 *   Card,
 *   CardHeader,
 *   CardTitle,
 *   CardDescription,
 *   CardContent,
 * } from '@unbranded-ds/react';
 *
 * export function SummaryCard() {
 *   return (
 *     <Card>
 *       <CardHeader>
 *         <CardTitle>Account summary</CardTitle>
 *         <CardDescription>Your current plan and usage at a glance.</CardDescription>
 *       </CardHeader>
 *       <CardContent>
 *         <p>You have used 4 of 10 seats.</p>
 *       </CardContent>
 *     </Card>
 *   );
 * }
 * ```
 *
 * @example Full layout with footer actions
 * ```tsx
 * import {
 *   Card,
 *   CardHeader,
 *   CardTitle,
 *   CardDescription,
 *   CardContent,
 *   CardFooter,
 * } from '@unbranded-ds/react';
 * import { Button } from '@unbranded-ds/react';
 *
 * export function NotificationsCard() {
 *   return (
 *     <Card>
 *       <CardHeader>
 *         <CardTitle>Notifications</CardTitle>
 *         <CardDescription>Manage your notification preferences.</CardDescription>
 *       </CardHeader>
 *       <CardContent>
 *         <p>Choose which events you want to be notified about.</p>
 *       </CardContent>
 *       <CardFooter style={{ gap: '8px' }}>
 *         <Button variant="outline">Cancel</Button>
 *         <Button>Save</Button>
 *       </CardFooter>
 *     </Card>
 *   );
 * }
 * ```
 *
 * @see {@link Dialog}
 * @see {@link Button}
 */
function Card({ className, size = 'default', ...props }: CardProps) {
	return (
		<div
			data-slot="card"
			data-size={size}
			className={cn(
				'group/card flex flex-col gap-6 overflow-hidden rounded-xl bg-card py-6 text-sm text-card-foreground shadow-xs ring-1 ring-foreground/10 has-[>img:first-child]:pt-0 data-[size=sm]:gap-4 data-[size=sm]:py-4 *:[img:first-child]:rounded-t-xl *:[img:last-child]:rounded-b-xl',
				className,
			)}
			{...props}
		/>
	);
}

/**
 * The header region of a {@link Card}. Grid layout that expands to two columns when a {@link CardAction} is present.
 *
 * @see {@link Card} for full usage guidance.
 */
function CardHeader({ className, ...props }: React.ComponentProps<'div'>) {
	return (
		<div
			data-slot="card-header"
			className={cn(
				'group/card-header @container/card-header grid auto-rows-min items-start gap-1 rounded-t-xl px-6 group-data-[size=sm]/card:px-4 has-data-[slot=card-action]:grid-cols-[1fr_auto] has-data-[slot=card-description]:grid-rows-[auto_auto] [.border-b]:pb-6 group-data-[size=sm]/card:[.border-b]:pb-4',
				className,
			)}
			{...props}
		/>
	);
}

/**
 * Display heading text inside a {@link CardHeader}. Renders as a `<div>` — the consumer decides the semantic heading level by wrapping children in `<h2>`, `<h3>`, etc.
 *
 * Accessibility: the component does not pick a heading level on its own because it cannot know its position in the document outline. Nest the appropriate heading element inside when outline order matters.
 *
 * @see {@link Card} for full usage guidance.
 */
function CardTitle({ className, ...props }: React.ComponentProps<'div'>) {
	return (
		<div
			data-slot="card-title"
			className={cn(
				'text-base leading-normal font-medium group-data-[size=sm]/card:text-sm',
				className,
			)}
			{...props}
		/>
	);
}

/**
 * Muted supporting text beneath the title in a {@link CardHeader}.
 *
 * @see {@link Card} for full usage guidance.
 */
function CardDescription({ className, ...props }: React.ComponentProps<'div'>) {
	return (
		<div
			data-slot="card-description"
			className={cn('text-sm text-muted-foreground', className)}
			{...props}
		/>
	);
}

/**
 * A pinned action slot in the {@link CardHeader}'s top-right corner. CardHeader expands to two columns when this slot is present, with the action spanning both rows of the title/description column.
 *
 * @see {@link Card} for full usage guidance.
 */
function CardAction({ className, ...props }: React.ComponentProps<'div'>) {
	return (
		<div
			data-slot="card-action"
			className={cn(
				'col-start-2 row-span-2 row-start-1 self-start justify-self-end',
				className,
			)}
			{...props}
		/>
	);
}

/**
 * The main body region of a {@link Card}. Horizontal padding tracks the parent Card's `size`.
 *
 * @see {@link Card} for full usage guidance.
 */
function CardContent({ className, ...props }: React.ComponentProps<'div'>) {
	return (
		<div
			data-slot="card-content"
			className={cn('px-6 group-data-[size=sm]/card:px-4', className)}
			{...props}
		/>
	);
}

/**
 * The footer action bar of a {@link Card}. Flex layout for action buttons at the card's bottom edge; horizontal padding and optional top-border spacing track the parent Card's `size`.
 *
 * @see {@link Card} for full usage guidance.
 */
function CardFooter({ className, ...props }: React.ComponentProps<'div'>) {
	return (
		<div
			data-slot="card-footer"
			className={cn(
				'flex items-center rounded-b-xl px-6 group-data-[size=sm]/card:px-4 [.border-t]:pt-6 group-data-[size=sm]/card:[.border-t]:pt-4',
				className,
			)}
			{...props}
		/>
	);
}

export {
	Card,
	CardAction,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
};
export type { CardProps };
