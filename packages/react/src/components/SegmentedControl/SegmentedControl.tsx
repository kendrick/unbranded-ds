/* eslint-disable react-refresh/only-export-components -- shadcn pattern co-locates segmentedControlVariants with the SegmentedControl components */
'use client';

import type { VariantProps } from 'class-variance-authority';

import { Radio as RadioPrimitive } from '@base-ui-components/react/radio';
import { RadioGroup as RadioGroupPrimitive } from '@base-ui-components/react/radio-group';
import { cva } from 'class-variance-authority';
import * as React from 'react';

import { cn } from '../../lib/cn';
import { warn } from '../../lib/warn';

/**
 * CVA helper for the Root container's connected-pill styling. Exported so
 * consumers building a custom radiogroup surface — a filter rail, a
 * non-SegmentedControl pill group — can apply the same border, padding, and
 * orientation rules without re-implementing them.
 */
const segmentedControlRootVariants = cva(
	// Connected pill: rounded outer wrapper that clips inner items via overflow.
	// Border + background give the container a visible footprint distinct from
	// the inner items. The flex direction inverts on the vertical axis.
	'group/segmented-control inline-flex w-fit overflow-hidden rounded-md border border-input bg-muted p-0.5 text-muted-foreground outline-none aria-disabled:cursor-not-allowed aria-disabled:opacity-50',
	{
		variants: {
			size: {
				sm: 'gap-px text-xs',
				md: 'gap-px text-sm',
				lg: 'gap-px text-base',
			},
			orientation: {
				horizontal: 'flex-row',
				vertical: 'flex-col',
			},
			disabled: {
				true: 'pointer-events-none',
				false: '',
			},
		},
		defaultVariants: {
			size: 'md',
			orientation: 'horizontal',
			disabled: false,
		},
	},
);

/**
 * CVA helper for an individual segment's styling — height, padding, font scale,
 * and the selected/unselected treatment. Items pull their `size` and
 * `orientation` from the Root's context, so direct callers of this helper
 * must pass those values explicitly.
 */
const segmentedControlItemVariants = cva(
	// Each item is a focusable segment. The selected segment lifts onto a
	// solid background; unselected segments fade. Inner corners stay subtle
	// because the outer wrapper provides the outer pill curve.
	'relative inline-flex shrink-0 cursor-pointer items-center justify-center gap-1.5 rounded-[calc(var(--radius-md)-2px)] border border-transparent font-medium whitespace-nowrap transition-colors outline-none select-none hover:text-foreground focus-visible:border-ring focus-visible:ring-(length:--ring-width) focus-visible:ring-ring/50 aria-disabled:pointer-events-none aria-disabled:opacity-50 data-checked:bg-background data-checked:text-foreground data-checked:shadow-sm data-disabled:pointer-events-none data-disabled:opacity-50 dark:data-checked:bg-input/30 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*=\'size-\'])]:size-4',
	{
		variants: {
			size: {
				sm: 'h-7 px-2 text-xs',
				md: 'h-8 px-2.5 text-sm',
				lg: 'h-10 px-3.5 text-base',
			},
			orientation: {
				horizontal: 'flex-1',
				vertical: 'w-full justify-start',
			},
		},
		defaultVariants: {
			size: 'md',
			orientation: 'horizontal',
		},
	},
);

interface SegmentedControlRootProps {
	/**
	 * The selected value in controlled mode. Set this when external logic — a
	 * URL parameter, a keyboard shortcut, a server response — needs to read or
	 * drive the selection. The parent then owns state and must update `value`
	 * from `onValueChange` for the selection to visually change. Pair with
	 * `onValueChange`; omit `defaultValue` when using `value`.
	 */
	value?: string;
	/**
	 * Seeds the selected value for uncontrolled usage. Reach for it when no
	 * external code needs to react to or drive the selection — the component
	 * then manages state internally. Ignored once `value` is set.
	 */
	defaultValue?: string;
	/**
	 * Fires with the newly selected value when the user picks an item by click
	 * or keyboard. The callback receives only the new value as a string. In
	 * controlled mode this is where you commit the change to whatever owns the
	 * state.
	 */
	onValueChange?: (value: string) => void;
	/**
	 * Visual size of each segment. Drives item height, horizontal padding, and
	 * label font scale across the whole group. Use `'sm'` in dense toolbars
	 * where vertical space is at a premium, `'md'` for typical inline use, and
	 * `'lg'` when the control is a primary affordance on a comfortable
	 * page-level surface.
	 *
	 * @defaultValue `'md'`
	 */
	size?: 'sm' | 'md' | 'lg';
	/**
	 * Layout axis of the segment strip. `'horizontal'` lays items in a row —
	 * the right fit for toolbars and view switchers; `'vertical'` lays them in
	 * a column — the right fit for sidebar-style filter rails. The choice also
	 * flips which arrow keys move focus and selection: Left/Right in
	 * horizontal, Up/Down in vertical. Cross-axis arrows are intentional
	 * no-ops.
	 *
	 * Accessibility: the chosen orientation propagates to children via
	 * `data-orientation` and is reflected as `aria-orientation` on the group,
	 * per the WAI-ARIA radiogroup pattern.
	 *
	 * @defaultValue `'horizontal'`
	 */
	orientation?: 'horizontal' | 'vertical';
	/**
	 * When `true`, the entire control is non-interactive. The Root sets
	 * `aria-disabled="true"` and pointer events are suppressed. Use this when
	 * the whole group should be unavailable; reach for `Item.disabled` on a
	 * single segment when one option is unavailable while the rest remain
	 * active.
	 *
	 * @defaultValue `false`
	 */
	disabled?: boolean;
	/**
	 * One or more `<SegmentedControl.Item>` children. A dev-mode warning fires
	 * if the Root has no children — empty groups are usually a bug.
	 */
	children: React.ReactNode;
	/**
	 * Merged with the Root's CVA classes via `cn()`. Reach for it when a
	 * one-off spacing or layout override is needed without forking the
	 * component.
	 */
	className?: string;
}

interface SegmentedControlItemProps {
	/**
	 * Identifies which selection this segment represents. Matched against the
	 * Root's `value` or `defaultValue` to determine the checked state.
	 * Required on every Item.
	 */
	value: string;
	/**
	 * When `true`, only this segment is non-interactive while the rest of the
	 * group remains active. The item carries both `aria-disabled` and
	 * `data-disabled`, and keyboard navigation skips over it. Use this to
	 * signal that an option exists but is unavailable in the current context,
	 * rather than hiding it entirely. For disabling the whole control, use
	 * `disabled` on the Root instead.
	 *
	 * @defaultValue `false`
	 */
	disabled?: boolean;
	/**
	 * The visible label. Text, an icon, or both — the layout keeps icons
	 * inline with the label automatically.
	 */
	children: React.ReactNode;
	/**
	 * Merged with the Item's CVA classes via `cn()`.
	 */
	className?: string;
}

// Component-level context propagates the Root's size and orientation down to
// each Item without forcing the consumer to repeat the props at every leaf.
interface SegmentedControlContextValue {
	size: NonNullable<VariantProps<typeof segmentedControlItemVariants>['size']>;
	orientation: NonNullable<VariantProps<typeof segmentedControlItemVariants>['orientation']>;
}

const SegmentedControlContext = React.createContext<SegmentedControlContextValue>({
	size: 'md',
	orientation: 'horizontal',
});

/**
 * The radiogroup container that owns selection state, keyboard handling, and
 * size/orientation context propagation to child Items.
 *
 * Accessibility: renders with `role="radiogroup"` (via Base UI's RadioGroup)
 * and reflects the chosen orientation as `aria-orientation`. When `disabled`
 * is set, the group carries `aria-disabled="true"`.
 *
 * @see {@link SegmentedControl} for full keyboard interactions and usage guidance.
 */
function Root({
	className,
	size = 'md',
	orientation = 'horizontal',
	disabled = false,
	value,
	defaultValue,
	onValueChange,
	children,
	...props
}: SegmentedControlRootProps) {
	// Empty-children warning runs post-mount so SSR stays clean. React's
	// Children.count traverses only the direct children, which is what the
	// "no items" edge case actually targets.
	React.useEffect(() => {
		if (React.Children.count(children) === 0) {
			warn({ component: 'SegmentedControl', issue: 'no-items' });
		}
	}, [children]);

	// Base UI's RadioGroup wraps CompositeRoot with orientation='both', so
	// all four arrow keys move focus by default and Home/End are disabled
	// (enableHomeAndEndKeys: false). FR-025 requires strict-axis arrows AND
	// Home/End in both orientations (WAI-ARIA radiogroup pattern), so we
	// intercept those keys in the capture phase before CompositeRoot's own
	// handler sees them.
	const onKeyDownCapture = (event: React.KeyboardEvent<HTMLDivElement>): void => {
		const isCrossAxis
			= (orientation === 'horizontal' && (event.key === 'ArrowUp' || event.key === 'ArrowDown'))
				|| (orientation === 'vertical' && (event.key === 'ArrowLeft' || event.key === 'ArrowRight'));
		if (isCrossAxis) {
			event.preventDefault();
			event.stopPropagation();
			return;
		}
		if (event.key === 'Home' || event.key === 'End') {
			event.preventDefault();
			event.stopPropagation();
			const items = event.currentTarget.querySelectorAll<HTMLElement>(
				'[data-slot="segmented-control-item"]:not([data-disabled])',
			);
			if (items.length === 0) {
				return;
			}
			const target = event.key === 'Home' ? items[0] : items[items.length - 1];
			target?.focus();
			target?.click();
		}
	};

	const contextValue = React.useMemo<SegmentedControlContextValue>(
		() => ({ size, orientation }),
		[size, orientation],
	);

	return (
		<SegmentedControlContext.Provider value={contextValue}>
			<RadioGroupPrimitive
				data-slot="segmented-control-root"
				data-orientation={orientation}
				data-size={size}
				aria-orientation={orientation}
				disabled={disabled}
				value={value}
				defaultValue={defaultValue}
				onValueChange={(next) => {
					if (typeof next === 'string') {
						onValueChange?.(next);
					}
				}}
				onKeyDownCapture={onKeyDownCapture}
				className={cn(
					segmentedControlRootVariants({ size, orientation, disabled }),
					className,
				)}
				{...props}
			>
				{children}
			</RadioGroupPrimitive>
		</SegmentedControlContext.Provider>
	);
}

/**
 * An individual selectable segment. Reads `size` and `orientation` from Root
 * via context so consumers don't repeat them at every leaf.
 *
 * Accessibility: renders with `role="radio"` (via Base UI's Radio). When
 * `disabled` is set, the item carries both `aria-disabled` and
 * `data-disabled`, and arrow-key navigation skips over it.
 *
 * @see {@link SegmentedControl} for full keyboard interactions and usage guidance.
 */
function Item({
	className,
	value,
	disabled = false,
	children,
	...props
}: SegmentedControlItemProps) {
	// Pull size/orientation from the Root via context so the Item picks up
	// CVA variants without the consumer wiring them at every leaf.
	const { size, orientation } = React.useContext(SegmentedControlContext);

	return (
		<RadioPrimitive.Root
			data-slot="segmented-control-item"
			value={value}
			disabled={disabled}
			className={cn(
				segmentedControlItemVariants({ size, orientation }),
				className,
			)}
			{...props}
		>
			{children}
		</RadioPrimitive.Root>
	);
}

/**
 * A mutually-exclusive selection control rendered as a connected pill — built on RadioGroup semantics.
 *
 * @remarks
 * Composes two slots: {@link SegmentedControl.Root} (the radiogroup container
 * that owns selection state) and {@link SegmentedControl.Item} (a single
 * segment). Both wrap Base UI's `RadioGroup` and `Radio` primitives, so
 * assistive technology hears a standard radiogroup with one radio per option.
 * The Root propagates `size` and `orientation` to each Item through React
 * context — pass them once on the Root and every Item picks them up without
 * the consumer wiring them at the leaves.
 *
 * Keyboard handling diverges from Base UI's defaults in two deliberate ways.
 * Base UI's `RadioGroup` configures `CompositeRoot` with `orientation='both'`
 * (so all four arrow keys move focus regardless of layout) and disables
 * Home/End. The WAI-ARIA radiogroup pattern expects the opposite: arrow keys
 * are strictly on-axis, and Home/End jump to the first and last items. The
 * Root intercepts cross-axis arrows and Home/End in the capture phase before
 * the composite handler sees them, so cross-axis arrows become genuine no-ops
 * and Home/End behave as the pattern specifies.
 *
 * ### Accessibility
 *
 * The Root carries `role="radiogroup"` and reflects the layout axis as
 * `aria-orientation`. Each Item carries `role="radio"`. When keyboard
 * navigation moves focus to a new item, selection moves with it — the focused
 * item becomes the checked radio. Items with `disabled={true}` carry both
 * `aria-disabled` and `data-disabled`, and arrow-key navigation skips over
 * them rather than landing focus on a non-interactive option. When the whole
 * control is disabled via `Root.disabled`, the group itself carries
 * `aria-disabled="true"`.
 *
 * ### Keyboard interactions
 *
 * | Key | Description |
 * | --- | --- |
 * | `Arrow Left` / `Arrow Right` | In a horizontal control, moves focus and selection to the previous/next enabled item. No-op in a vertical control. |
 * | `Arrow Up` / `Arrow Down` | In a vertical control, moves focus and selection to the previous/next enabled item. No-op in a horizontal control. |
 * | `Home` | Moves focus and selection to the first enabled item, in both orientations. |
 * | `End` | Moves focus and selection to the last enabled item, in both orientations. |
 * | `Space` | Selects the focused item (standard radio behavior). |
 * | `Tab` | Moves focus out of the group to the next focusable element. |
 *
 * ### When to use
 *
 * - Two to five equally-weighted options that should stay visible at all
 *   times — toolbars, view switchers, filter bars.
 * - The selection is a value (a filter, a sort order, a unit) rather than a
 *   pointer at a content panel.
 * - The user benefits from seeing every option side by side, not from
 *   revealing them only on click.
 *
 * ### When not to use
 *
 * - Use {@link Tabs} when the selection controls a content panel below it.
 * - Use {@link Select} when the option list is long, dynamic, or should stay
 *   hidden until opened.
 * - Use {@link Switch} for a single on/off binary state.
 * - Use {@link Slider} for continuous or finely-stepped values rather than
 *   discrete named options.
 *
 * @example Uncontrolled with a size variant
 * ```tsx
 * import { SegmentedControl } from '@unbranded-ds/react';
 *
 * export function ViewSwitcher() {
 *   return (
 *     <SegmentedControl.Root defaultValue="week" size="sm">
 *       <SegmentedControl.Item value="day">Day</SegmentedControl.Item>
 *       <SegmentedControl.Item value="week">Week</SegmentedControl.Item>
 *       <SegmentedControl.Item value="month">Month</SegmentedControl.Item>
 *     </SegmentedControl.Root>
 *   );
 * }
 * ```
 *
 * @example Controlled selection
 * ```tsx
 * import * as React from 'react';
 * import { SegmentedControl } from '@unbranded-ds/react';
 *
 * export function ControlledViewSwitcher() {
 *   const [view, setView] = React.useState('week');
 *
 *   return (
 *     <SegmentedControl.Root value={view} onValueChange={setView}>
 *       <SegmentedControl.Item value="day">Day</SegmentedControl.Item>
 *       <SegmentedControl.Item value="week">Week</SegmentedControl.Item>
 *       <SegmentedControl.Item value="month">Month</SegmentedControl.Item>
 *     </SegmentedControl.Root>
 *   );
 * }
 * ```
 *
 * @see https://www.w3.org/WAI/ARIA/apg/patterns/radio/
 * @see {@link Tabs}
 * @see {@link Select}
 * @see {@link Switch}
 * @see {@link Slider}
 */
const SegmentedControl = {
	Root,
	Item,
};

export {
	SegmentedControl,
	segmentedControlItemVariants,
	segmentedControlRootVariants,
};
export type { SegmentedControlItemProps, SegmentedControlRootProps };
