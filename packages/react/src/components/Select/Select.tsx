'use client';

import { Select as SelectPrimitive } from '@base-ui-components/react/select';
import { CheckIcon, ChevronDownIcon, ChevronUpIcon } from 'lucide-react';

import * as React from 'react';
import { cn } from '../../lib/cn';

/**
 * A dropdown selection control with listbox semantics for picking one option from a list.
 *
 * @remarks
 * Composes Base UI's `Select` primitives into a 10-slot family. The `Select`
 * root manages open state, the selected value, and form integration — it
 * renders no DOM element on its own. {@link SelectTrigger} renders the button
 * that opens the popup, {@link SelectContent} renders the floating listbox via
 * an internal portal and positioner pipeline (so you do not need to mount
 * `SelectPortal` or `SelectPositioner` yourself), and {@link SelectItem}
 * elements live inside it. Type-ahead is wired by default: typing characters
 * while the popup is open jumps focus to the first item whose label starts
 * with that string. Pair {@link SelectGroup} with {@link SelectLabel} when the
 * option list spans multiple categories that benefit from accessible group
 * headings.
 *
 * ### Accessibility
 *
 * The trigger carries `role="combobox"` and `aria-haspopup="listbox"`, with
 * `aria-expanded` reflecting the popup state. The popup itself carries
 * `role="listbox"` and each {@link SelectItem} carries `role="option"` with
 * `aria-selected` on the active value. Focus moves into the listbox when the
 * popup opens and returns to the trigger on close — even if the close happened
 * via Escape, a pointer click outside, or item selection. The {@link
 * SelectValue} inside the trigger updates its announced text as the selection
 * changes, so screen-reader users do not need to re-open the list to confirm
 * their choice. Set `label` on a {@link SelectItem} that contains icons or
 * formatted children so type-ahead has the right string to match against.
 *
 * ### Keyboard interactions
 *
 * | Key | Description |
 * | --- | --- |
 * | `Space` / `Enter` | When trigger focused: opens the popup. |
 * | `Arrow Down` | Opens the popup if closed; otherwise moves focus to the next option. |
 * | `Arrow Up` | Opens the popup if closed; otherwise moves focus to the previous option. |
 * | `Home` | Moves focus to the first option. |
 * | `End` | Moves focus to the last option. |
 * | `[a-z]` | Type-ahead — moves focus to the first item whose label starts with the typed character. |
 * | `Enter` | When item focused: selects it and closes the popup. |
 * | `Escape` | Closes the popup and returns focus to the trigger without changing the selection. |
 * | `Tab` | Closes the popup and moves focus to the next focusable element. |
 *
 * ### When to use
 *
 * - The option list is long (roughly five or more) and showing every choice
 *   inline would clutter the form.
 * - Options are dynamic or data-driven and a hidden-until-opened control keeps
 *   the surface calm.
 * - You need consistent token-based styling and keyboard behavior that a
 *   native `<select>` cannot match.
 *
 * ### When not to use
 *
 * - Use {@link SegmentedControl} when the option set is small (two to five)
 *   and you want all choices visible at once for quick comparison.
 * - Use a checkbox group when users may pick more than one option from the
 *   same list — `Select` is single-select.
 * - Use {@link Dialog} when picking requires a richer modal flow with extra
 *   context, fields, or confirmation.
 *
 * @example Uncontrolled select with placeholder
 * ```tsx
 * import {
 *   Select,
 *   SelectContent,
 *   SelectItem,
 *   SelectTrigger,
 *   SelectValue,
 * } from '@unbranded-ds/react';
 *
 * export function FruitPicker() {
 *   return (
 *     <Select>
 *       <SelectTrigger style={{ width: '200px' }}>
 *         <SelectValue>Select a fruit</SelectValue>
 *       </SelectTrigger>
 *       <SelectContent>
 *         <SelectItem value="apple">Apple</SelectItem>
 *         <SelectItem value="banana">Banana</SelectItem>
 *         <SelectItem value="cherry">Cherry</SelectItem>
 *       </SelectContent>
 *     </Select>
 *   );
 * }
 * ```
 *
 * @example Grouped options with labels
 * ```tsx
 * import {
 *   Select,
 *   SelectContent,
 *   SelectGroup,
 *   SelectItem,
 *   SelectLabel,
 *   SelectSeparator,
 *   SelectTrigger,
 *   SelectValue,
 * } from '@unbranded-ds/react';
 *
 * export function FoodPicker() {
 *   return (
 *     <Select>
 *       <SelectTrigger style={{ width: '220px' }}>
 *         <SelectValue>Select a food</SelectValue>
 *       </SelectTrigger>
 *       <SelectContent>
 *         <SelectGroup>
 *           <SelectLabel>Fruits</SelectLabel>
 *           <SelectItem value="apple">Apple</SelectItem>
 *           <SelectItem value="banana">Banana</SelectItem>
 *         </SelectGroup>
 *         <SelectSeparator />
 *         <SelectGroup>
 *           <SelectLabel>Vegetables</SelectLabel>
 *           <SelectItem value="carrot">Carrot</SelectItem>
 *           <SelectItem value="lettuce">Lettuce</SelectItem>
 *         </SelectGroup>
 *       </SelectContent>
 *     </Select>
 *   );
 * }
 * ```
 *
 * @see https://www.w3.org/WAI/ARIA/apg/patterns/listbox/
 * @see {@link SegmentedControl}
 * @see {@link Dialog}
 */
function Select<Value, Multiple extends boolean | undefined = false>(
	props: SelectPrimitive.Root.Props<Value, Multiple>,
) {
	return <SelectPrimitive.Root {...props} />;
}

/**
 * Groups related options. Pair with {@link SelectLabel} to give the group a heading so assistive technology announces the category before its items.
 *
 * @see {@link Select} for full keyboard interactions and usage guidance.
 */
function SelectGroup({ className, ...props }: SelectPrimitive.Group.Props) {
	return (
		<SelectPrimitive.Group
			data-slot="select-group"
			className={cn('scroll-my-1 p-1', className)}
			{...props}
		/>
	);
}

/**
 * Renders the currently selected option's label inside the trigger. Falls back to its children (the placeholder) when nothing is selected. Pass a render function as children to format the live value (for example, to prepend a currency symbol or capitalize the label).
 *
 * @see {@link Select} for full keyboard interactions and usage guidance.
 */
function SelectValue({ className, ...props }: SelectPrimitive.Value.Props) {
	return (
		<SelectPrimitive.Value
			data-slot="select-value"
			className={cn('flex flex-1 text-left', className)}
			{...props}
		/>
	);
}

interface SelectTriggerOwnProps {
	/**
	 * Visual height of the trigger. `'default'` renders at `h-9` (36px) to match
	 * the standard form-row density that other inputs use. `'sm'` renders at
	 * `h-8` (32px) for compact toolbars, table-cell editors, and inline filter
	 * controls where the default would feel heavy. The value is applied via the
	 * `data-size` attribute, so any consumer overrides written against
	 * `data-size="sm"` selectors keep working.
	 *
	 * @defaultValue `'default'`
	 */
	size?: 'sm' | 'default';
}

type SelectTriggerProps = SelectPrimitive.Trigger.Props & SelectTriggerOwnProps;

/**
 * The button that opens the listbox. Owns the `size` axis and automatically appends a chevron icon — do not add one yourself.
 *
 * Accessibility: receives `role="combobox"`, `aria-haspopup="listbox"`, and a live `aria-expanded` from Base UI. Pair with a {@link Label} that points at the trigger via `htmlFor` so screen readers announce the field's purpose.
 *
 * @see {@link Select} for full keyboard interactions and usage guidance.
 */
function SelectTrigger({
	className,
	size = 'default',
	children,
	...props
}: SelectTriggerProps) {
	return (
		<SelectPrimitive.Trigger
			data-slot="select-trigger"
			data-size={size}
			className={cn(
				'flex w-fit items-center justify-between gap-1.5 rounded-md border border-input bg-transparent py-2 pr-2 pl-2.5 text-sm whitespace-nowrap shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 data-placeholder:text-muted-foreground data-[size=default]:h-9 data-[size=sm]:h-8 *:data-[slot=select-value]:line-clamp-1 *:data-[slot=select-value]:flex *:data-[slot=select-value]:items-center *:data-[slot=select-value]:gap-1.5 dark:bg-input/30 dark:hover:bg-input/50 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*=\'size-\'])]:size-4',
				className,
			)}
			{...props}
		>
			{children}
			<SelectPrimitive.Icon
				render={
					<ChevronDownIcon className="pointer-events-none size-4 text-muted-foreground" />
				}
			/>
		</SelectPrimitive.Trigger>
	);
}

interface SelectContentOwnProps {
	/**
	 * Which side of the trigger the popup opens on. The positioner may flip to
	 * the opposite side automatically when there is not enough room in the
	 * viewport, so this is best treated as a preferred side rather than a hard
	 * pin.
	 *
	 * @defaultValue `'bottom'`
	 */
	side?: 'top' | 'bottom' | 'left' | 'right' | 'inline-start' | 'inline-end';
	/**
	 * Pixel gap between the trigger and the edge of the popup. Increase when the
	 * trigger sits inside a dense control row where the default 4px gap reads as
	 * "touching"; decrease toward `0` when you want the popup to feel docked.
	 *
	 * @defaultValue `4`
	 */
	sideOffset?: number;
	/**
	 * Alignment of the popup relative to the trigger along the cross-axis.
	 * `'center'` keeps the popup centered under the trigger; `'start'` and
	 * `'end'` anchor the popup's leading or trailing edge to the trigger when
	 * the popup is much wider than the trigger and you want a clean alignment
	 * to one side.
	 *
	 * @defaultValue `'center'`
	 */
	align?: 'start' | 'center' | 'end';
	/**
	 * Pixel offset applied along the alignment axis. Useful when the popup
	 * needs to nudge a few pixels to clear a sibling icon or to line up with a
	 * grid column.
	 *
	 * @defaultValue `0`
	 */
	alignOffset?: number;
	/**
	 * When `true`, the popup scrolls on open so the selected item's text sits
	 * directly over the trigger's label — preserving the native `<select>`
	 * sensation that the chosen option does not visually jump when the list
	 * appears. Set to `false` for menu-like dropdowns where the popup should
	 * always open at the top of the list regardless of selection (the standard
	 * pattern for action menus or filter pickers). Base UI also disables this
	 * automatically when there is insufficient room or when touch input is
	 * detected.
	 *
	 * @defaultValue `true`
	 */
	alignItemWithTrigger?: boolean;
}

type SelectContentProps = SelectPrimitive.Popup.Props & SelectContentOwnProps;

/**
 * The dropdown panel that renders the listbox inside a portal. Owns the positioner props (`side`, `sideOffset`, `align`, `alignOffset`, `alignItemWithTrigger`) and bakes in scroll affordances at the top and bottom of long lists, so you do not need to render {@link SelectScrollUpButton} or {@link SelectScrollDownButton} yourself.
 *
 * @see {@link Select} for full keyboard interactions and usage guidance.
 */
function SelectContent({
	className,
	children,
	side = 'bottom',
	sideOffset = 4,
	align = 'center',
	alignOffset = 0,
	alignItemWithTrigger = true,
	...props
}: SelectContentProps) {
	return (
		<SelectPrimitive.Portal>
			<SelectPrimitive.Positioner
				side={side}
				sideOffset={sideOffset}
				align={align}
				alignOffset={alignOffset}
				alignItemWithTrigger={alignItemWithTrigger}
				className="isolate z-50"
			>
				<SelectPrimitive.Popup
					data-slot="select-content"
					data-align-trigger={alignItemWithTrigger}
					className={cn('relative isolate z-50 max-h-(--available-height) w-(--anchor-width) min-w-36 origin-(--transform-origin) overflow-x-hidden overflow-y-auto rounded-md bg-popover text-popover-foreground shadow-md ring-1 ring-foreground/10 duration-100 data-[align-trigger=true]:animate-none data-[side=bottom]:slide-in-from-top-2 data-[side=inline-end]:slide-in-from-left-2 data-[side=inline-start]:slide-in-from-right-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95', className)}
					{...props}
				>
					<SelectScrollUpButton />
					<SelectPrimitive.List>{children}</SelectPrimitive.List>
					<SelectScrollDownButton />
				</SelectPrimitive.Popup>
			</SelectPrimitive.Positioner>
		</SelectPrimitive.Portal>
	);
}

/**
 * A non-selectable heading inside a {@link SelectGroup}. Renders as a small muted line above the group's items and is automatically associated with the group for assistive technology.
 *
 * @see {@link Select} for full keyboard interactions and usage guidance.
 */
function SelectLabel({
	className,
	...props
}: SelectPrimitive.GroupLabel.Props) {
	return (
		<SelectPrimitive.GroupLabel
			data-slot="select-label"
			className={cn('px-2 py-1.5 text-xs text-muted-foreground', className)}
			{...props}
		/>
	);
}

/**
 * An individual selectable option. Required prop `value` is what gets reported through `onValueChange`. Set `label` explicitly when the item contains icons or formatted content so type-ahead has a clean string to match against; set `disabled` to keep an option visible but skipped during keyboard navigation.
 *
 * @see {@link Select} for full keyboard interactions and usage guidance.
 */
function SelectItem({
	className,
	children,
	...props
}: SelectPrimitive.Item.Props) {
	return (
		<SelectPrimitive.Item
			data-slot="select-item"
			className={cn(
				'relative flex w-full cursor-default items-center gap-2 rounded-sm py-1.5 pr-8 pl-2 text-sm outline-hidden select-none focus:bg-accent focus:text-accent-foreground not-data-[variant=destructive]:focus:**:text-accent-foreground data-disabled:pointer-events-none data-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*=\'size-\'])]:size-4 *:[span]:last:flex *:[span]:last:items-center *:[span]:last:gap-2',
				className,
			)}
			{...props}
		>
			<SelectPrimitive.ItemText className="flex flex-1 shrink-0 gap-2 whitespace-nowrap">
				{children}
			</SelectPrimitive.ItemText>
			<SelectPrimitive.ItemIndicator
				render={
					<span className="pointer-events-none absolute right-2 flex size-4 items-center justify-center" />
				}
			>
				<CheckIcon className="pointer-events-none" />
			</SelectPrimitive.ItemIndicator>
		</SelectPrimitive.Item>
	);
}

/**
 * A visual divider between {@link SelectItem} elements or {@link SelectGroup} blocks. Reach for this only when a {@link SelectGroup} + {@link SelectLabel} pairing does not provide enough visual separation on its own.
 *
 * @see {@link Select} for full keyboard interactions and usage guidance.
 */
function SelectSeparator({
	className,
	...props
}: SelectPrimitive.Separator.Props) {
	return (
		<SelectPrimitive.Separator
			data-slot="select-separator"
			className={cn('pointer-events-none -mx-1 my-1 h-px bg-border', className)}
			{...props}
		/>
	);
}

/**
 * Auto-rendered scroll affordance at the top of {@link SelectContent} when the option list overflows upward. Already included inside `SelectContent` — render directly only when overriding the default chevron icon or styles.
 *
 * @see {@link Select} for full keyboard interactions and usage guidance.
 */
function SelectScrollUpButton({
	className,
	...props
}: React.ComponentProps<typeof SelectPrimitive.ScrollUpArrow>) {
	return (
		<SelectPrimitive.ScrollUpArrow
			data-slot="select-scroll-up-button"
			className={cn(
				'top-0 z-10 flex w-full cursor-default items-center justify-center bg-popover py-1 [&_svg:not([class*=\'size-\'])]:size-4',
				className,
			)}
			{...props}
		>
			<ChevronUpIcon />
		</SelectPrimitive.ScrollUpArrow>
	);
}

/**
 * Auto-rendered scroll affordance at the bottom of {@link SelectContent} when the option list overflows downward. Already included inside `SelectContent` — render directly only when overriding the default chevron icon or styles.
 *
 * @see {@link Select} for full keyboard interactions and usage guidance.
 */
function SelectScrollDownButton({
	className,
	...props
}: React.ComponentProps<typeof SelectPrimitive.ScrollDownArrow>) {
	return (
		<SelectPrimitive.ScrollDownArrow
			data-slot="select-scroll-down-button"
			className={cn(
				'bottom-0 z-10 flex w-full cursor-default items-center justify-center bg-popover py-1 [&_svg:not([class*=\'size-\'])]:size-4',
				className,
			)}
			{...props}
		>
			<ChevronDownIcon />
		</SelectPrimitive.ScrollDownArrow>
	);
}

export {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectLabel,
	SelectScrollDownButton,
	SelectScrollUpButton,
	SelectSeparator,
	SelectTrigger,
	SelectValue,
};
export type { SelectContentProps, SelectTriggerProps };
