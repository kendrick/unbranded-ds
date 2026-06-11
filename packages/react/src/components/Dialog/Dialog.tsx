'use client';

import { Dialog as DialogPrimitive } from '@base-ui-components/react/dialog';
import { XIcon } from 'lucide-react';

import * as React from 'react';
import { cn } from '../../lib/cn';
import { Button } from '../Button/Button';

/**
 * A modal overlay that traps focus and requires the user to act before returning to the underlying page.
 *
 * @remarks
 * Composes Base UI's `Dialog` primitives into a 10-slot family. The `Dialog`
 * root itself renders no DOM element — it manages open state via context and
 * lets `DialogContent` render the panel inside a portal. The `modal` prop
 * picks the dismissal model: `true` (default) traps focus, locks page scroll,
 * and blocks pointer events outside the panel; `false` leaves all three open;
 * `'trap-focus'` traps focus only, which suits slide-out panels that coexist
 * with the rest of the page. Pass `handle` plus a `payload` from the trigger
 * to associate triggers that live outside the Dialog's subtree and to thread
 * per-trigger data into the panel's children render function.
 *
 * ### Accessibility
 *
 * Focus moves into the panel when the dialog opens — by default to the first
 * tabbable element, or to a specific target via `initialFocus` on
 * `DialogContent`. Tab and Shift+Tab cycle within the panel while it is open;
 * nothing outside is keyboard-reachable. Escape closes the dialog and returns
 * focus to the trigger that opened it (override with `finalFocus` when the
 * trigger is no longer in the DOM). Page scroll on `<body>` is locked while
 * `modal={true}`. The popup carries `role="dialog"` and `aria-modal="true"`;
 * it is wired to `DialogTitle` via `aria-labelledby` and to
 * `DialogDescription` via `aria-describedby` when both are rendered. Always
 * render `DialogTitle` — without it the dialog has no accessible name and
 * fails automated a11y checks.
 *
 * ### Keyboard interactions
 *
 * | Key | Description |
 * | --- | --- |
 * | `Tab` | Cycles focus forward within the focus trap. |
 * | `Shift + Tab` | Cycles focus backward within the focus trap. |
 * | `Escape` | Closes the dialog and returns focus to the trigger. |
 * | `Enter` / `Space` | Activates the focused button (trigger, close, or action). |
 *
 * ### When to use
 *
 * - The user must confirm an action before it proceeds (especially destructive ones).
 * - You need a short, single-purpose form whose state would be lost if the user navigated away.
 * - The user must acknowledge information before the underlying page becomes interactive again.
 *
 * ### When not to use
 *
 * - Purely informational content with no required action. Reach for {@link Tooltip}.
 * - Grouping related content on the page without a focus trap. Reach for {@link Card}.
 * - Inline disclosure that should stay on the same page (use an accordion or `<details>`).
 *
 * @example Simple confirmation dialog
 * ```tsx
 * import {
 *   Dialog,
 *   DialogTrigger,
 *   DialogContent,
 *   DialogHeader,
 *   DialogTitle,
 *   DialogDescription,
 *   DialogFooter,
 *   DialogClose,
 * } from '@unbranded-ds/react';
 * import { Button } from '@unbranded-ds/react';
 *
 * export function ConfirmationDialog() {
 *   return (
 *     <Dialog>
 *       <DialogTrigger render={<Button />}>Save changes</DialogTrigger>
 *       <DialogContent>
 *         <DialogHeader>
 *           <DialogTitle>Save changes</DialogTitle>
 *           <DialogDescription>
 *             Your edits will be published immediately.
 *           </DialogDescription>
 *         </DialogHeader>
 *         <DialogFooter>
 *           <DialogClose render={<Button variant="outline" />}>Cancel</DialogClose>
 *           <Button>Save</Button>
 *         </DialogFooter>
 *       </DialogContent>
 *     </Dialog>
 *   );
 * }
 * ```
 *
 * @example Destructive confirmation with pointer-dismissal disabled
 * ```tsx
 * import {
 *   Dialog,
 *   DialogTrigger,
 *   DialogContent,
 *   DialogHeader,
 *   DialogTitle,
 *   DialogDescription,
 *   DialogFooter,
 *   DialogClose,
 * } from '@unbranded-ds/react';
 * import { Button } from '@unbranded-ds/react';
 *
 * export function DeleteDialog() {
 *   return (
 *     <Dialog disablePointerDismissal>
 *       <DialogTrigger render={<Button variant="destructive" />}>
 *         Delete account
 *       </DialogTrigger>
 *       <DialogContent>
 *         <DialogHeader>
 *           <DialogTitle>Delete account</DialogTitle>
 *           <DialogDescription>
 *             This action cannot be undone. All your data will be removed permanently.
 *           </DialogDescription>
 *         </DialogHeader>
 *         <DialogFooter>
 *           <DialogClose render={<Button variant="outline" />}>Cancel</DialogClose>
 *           <Button variant="destructive">Delete</Button>
 *         </DialogFooter>
 *       </DialogContent>
 *     </Dialog>
 *   );
 * }
 * ```
 *
 * @example Form dialog with initialFocus on the first input
 * ```tsx
 * import * as React from 'react';
 * import {
 *   Dialog,
 *   DialogTrigger,
 *   DialogContent,
 *   DialogHeader,
 *   DialogTitle,
 *   DialogFooter,
 *   DialogClose,
 * } from '@unbranded-ds/react';
 * import { Button } from '@unbranded-ds/react';
 * import { Input } from '@unbranded-ds/react';
 * import { Label } from '@unbranded-ds/react';
 *
 * export function EditProfileDialog() {
 *   const nameRef = React.useRef<HTMLInputElement>(null);
 *
 *   return (
 *     <Dialog>
 *       <DialogTrigger render={<Button />}>Edit profile</DialogTrigger>
 *       <DialogContent initialFocus={nameRef}>
 *         <DialogHeader>
 *           <DialogTitle>Edit profile</DialogTitle>
 *         </DialogHeader>
 *         <Label htmlFor="profile-name">Name</Label>
 *         <Input id="profile-name" ref={nameRef} defaultValue="Jane Smith" />
 *         <DialogFooter>
 *           <DialogClose render={<Button variant="outline" />}>Cancel</DialogClose>
 *           <Button>Save</Button>
 *         </DialogFooter>
 *       </DialogContent>
 *     </Dialog>
 *   );
 * }
 * ```
 *
 * @see https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/
 * @see {@link Tooltip}
 * @see {@link Card}
 */
function Dialog({ ...props }: DialogPrimitive.Root.Props) {
	return <DialogPrimitive.Root data-slot="dialog" {...props} />;
}

/**
 * Opens the dialog on click. Renders a `<button>` by default; pass `render` to swap the element (commonly `render={<Button />}`).
 *
 * Accessibility: announces the trigger as `aria-haspopup="dialog"` and reflects the open state via `aria-expanded`. Pair with {@link Button} via `render` to keep all button styling and focus behavior without an extra DOM wrapper.
 *
 * @see {@link Dialog} for full keyboard interactions and usage guidance.
 */
function DialogTrigger({ ...props }: DialogPrimitive.Trigger.Props) {
	return <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props} />;
}

/**
 * Portal mount point for the dialog panel. Rendered automatically by {@link DialogContent}.
 *
 * Accessibility: reach for this bare slot only when overriding the default `container` (to mount inside a specific DOM node) or `keepMounted` (to keep the panel in the tree across closes for animation or state preservation).
 *
 * @see {@link Dialog} for full keyboard interactions and usage guidance.
 */
function DialogPortal({ ...props }: DialogPrimitive.Portal.Props) {
	return <DialogPrimitive.Portal data-slot="dialog-portal" {...props} />;
}

/**
 * Closes the dialog when activated. Renders a `<button>` by default; pass `render` to style it as a named cancel or close action (commonly `render={<Button variant="outline" />}`).
 *
 * Accessibility: keeps native button semantics so screen readers announce the close action and Enter or Space activates it.
 *
 * @see {@link Dialog} for full keyboard interactions and usage guidance.
 */
function DialogClose({ ...props }: DialogPrimitive.Close.Props) {
	return <DialogPrimitive.Close data-slot="dialog-close" {...props} />;
}

/**
 * Backdrop rendered behind the dialog panel. Rendered automatically by {@link DialogContent}.
 *
 * Accessibility: reach for this bare slot only when overriding the default backdrop treatment beyond what passing `className` to {@link DialogContent} covers (for example, a darker scrim or a custom blur effect).
 *
 * @see {@link Dialog} for full keyboard interactions and usage guidance.
 */
function DialogOverlay({
	className,
	...props
}: DialogPrimitive.Backdrop.Props) {
	return (
		<DialogPrimitive.Backdrop
			data-slot="dialog-overlay"
			className={cn(
				'fixed inset-0 isolate z-(--z-index-overlay) bg-foreground/10 duration-(--duration-fast) supports-backdrop-filter:backdrop-blur-xs data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0',
				className,
			)}
			{...props}
		/>
	);
}

interface DialogContentOwnProps {
	/**
	 * When `true`, renders an X icon close button in the panel's top-right corner. Set to `false` when {@link DialogFooter} already provides a named close action — pairing both creates visual noise and duplicates the close affordance.
	 *
	 * Accessibility: the rendered icon button carries `aria-label="Close"` via a visually-hidden span, so screen readers still announce a close action even though the visible glyph is an icon.
	 *
	 * @defaultValue `true`
	 */
	showCloseButton?: boolean;
	/**
	 * Controls which element receives focus when the dialog opens. Pass a `RefObject` to focus a specific input (the standard pattern for form dialogs where the first field should be ready to type into), or a function to vary by interaction type. Set `false` to suppress focus movement entirely when an external system manages focus.
	 *
	 * Accessibility: overriding the default (first tabbable element) is helpful for form dialogs, where landing on the close button instead of the first input creates an extra keystroke for every user.
	 */
	initialFocus?: DialogPrimitive.Popup.Props['initialFocus'];
	/**
	 * Controls which element receives focus when the dialog closes. Defaults to the trigger that opened the dialog. Override when the trigger is removed from the DOM as part of the action (for example, deleting a row whose row-level menu opened the dialog), so focus has a sensible destination instead of falling back to `<body>`.
	 *
	 * Accessibility: returning focus to a predictable location after close meets WCAG 2.4.3 (Focus Order); leaving focus on `<body>` strands keyboard users.
	 */
	finalFocus?: DialogPrimitive.Popup.Props['finalFocus'];
}

type DialogContentProps = DialogPrimitive.Popup.Props & DialogContentOwnProps;

/**
 * The floating dialog panel rendered inside a portal with the overlay behind it. The most-composed slot: owns focus management (`initialFocus`, `finalFocus`) and the built-in X icon close button (`showCloseButton`).
 *
 * Accessibility: receives `role="dialog"` and `aria-modal="true"` from Base UI, plus `aria-labelledby` and `aria-describedby` wired automatically when {@link DialogTitle} and {@link DialogDescription} are rendered.
 *
 * @see {@link Dialog} for full keyboard interactions and usage guidance.
 */
function DialogContent({
	className,
	children,
	showCloseButton = true,
	...props
}: DialogContentProps) {
	return (
		<DialogPortal>
			<DialogOverlay />
			<DialogPrimitive.Popup
				data-slot="dialog-content"
				className={cn(
					'fixed top-1/2 left-1/2 z-(--z-index-overlay) grid w-full max-w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2 gap-6 rounded-xl bg-popover p-6 text-sm text-popover-foreground ring-1 ring-foreground/10 duration-(--duration-fast) outline-none sm:max-w-md data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95',
					className,
				)}
				{...props}
			>
				{children}
				{showCloseButton && (
					<DialogPrimitive.Close
						data-slot="dialog-close"
						render={(
							<Button
								variant="ghost"
								className="absolute top-4 right-4"
								size="icon-sm"
							/>
						)}
					>
						<XIcon />
						<span className="sr-only">Close</span>
					</DialogPrimitive.Close>
				)}
			</DialogPrimitive.Popup>
		</DialogPortal>
	);
}

/**
 * Vertical layout wrapper for the dialog's title and description. Renders a `<div>` with a column flex layout and a small gap.
 *
 * @see {@link Dialog} for full keyboard interactions and usage guidance.
 */
function DialogHeader({ className, ...props }: React.ComponentProps<'div'>) {
	return (
		<div
			data-slot="dialog-header"
			className={cn('flex flex-col gap-2', className)}
			{...props}
		/>
	);
}

interface DialogFooterOwnProps {
	/**
	 * When `true`, appends an outline-styled "Close" {@link DialogClose} button at the end of the footer's action row. This is the inverse pattern from {@link DialogContent}'s same-named prop: `DialogContent`'s renders the X icon top-right and defaults to `true`, while `DialogFooter`'s renders a named text close button at the end of the action row and defaults to `false`. Reach for `DialogFooter`'s variant when you've hidden `DialogContent`'s X (`showCloseButton={false}`) and want a named close action in the footer instead — common in flows where a visible label like "Close" reads more clearly than a glyph.
	 *
	 * @defaultValue `false`
	 */
	showCloseButton?: boolean;
}

type DialogFooterProps = React.ComponentProps<'div'> & DialogFooterOwnProps;

/**
 * Horizontal layout wrapper for action buttons. Stacks vertically on mobile and flips to a row end-aligned on larger viewports. Can optionally render its own named close button via `showCloseButton`.
 *
 * Accessibility: the column-reverse layout on mobile places the primary action visually below the cancel — the DOM order still matches the visual order, so tab order matches reading order on all viewports.
 *
 * @see {@link Dialog} for full keyboard interactions and usage guidance.
 */
function DialogFooter({
	className,
	showCloseButton = false,
	children,
	...props
}: DialogFooterProps) {
	return (
		<div
			data-slot="dialog-footer"
			className={cn(
				'flex flex-col-reverse gap-2 sm:flex-row sm:justify-end',
				className,
			)}
			{...props}
		>
			{children}
			{showCloseButton && (
				<DialogPrimitive.Close render={<Button variant="outline" />}>
					Close
				</DialogPrimitive.Close>
			)}
		</div>
	);
}

/**
 * The dialog's accessible heading. Renders an `<h2>` and is wired to the panel via `aria-labelledby`. Always render this — without it, the dialog has no accessible name and fails automated a11y checks.
 *
 * Accessibility: screen readers announce the title first when focus enters the dialog. Keep the text concise (a few words) so it scans quickly in audio.
 *
 * @see {@link Dialog} for full keyboard interactions and usage guidance.
 */
function DialogTitle({ className, ...props }: DialogPrimitive.Title.Props) {
	return (
		<DialogPrimitive.Title
			data-slot="dialog-title"
			className={cn('leading-none font-medium', className)}
			{...props}
		/>
	);
}

/**
 * Supporting text beneath the title. Renders a `<p>` and is wired to the panel via `aria-describedby` when present. Anchor tags inside it pick up underline styling automatically.
 *
 * Accessibility: the `aria-describedby` association is only applied when this component is rendered, so omitting it is safe when the title alone is self-explanatory (no orphan ARIA reference is left dangling).
 *
 * @see {@link Dialog} for full keyboard interactions and usage guidance.
 */
function DialogDescription({
	className,
	...props
}: DialogPrimitive.Description.Props) {
	return (
		<DialogPrimitive.Description
			data-slot="dialog-description"
			className={cn(
				'text-sm text-muted-foreground *:[a]:underline *:[a]:underline-offset-3 *:[a]:hover:text-foreground',
				className,
			)}
			{...props}
		/>
	);
}

export {
	Dialog,
	DialogClose,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogOverlay,
	DialogPortal,
	DialogTitle,
	DialogTrigger,
};
export type { DialogContentProps, DialogFooterProps };
