/* eslint-disable react-refresh/only-export-components -- shadcn pattern co-locates tabsListVariants with the Tabs components */
import type { VariantProps } from 'class-variance-authority';
import type * as React from 'react';
import { Tabs as TabsPrimitive } from '@base-ui-components/react/tabs';
import { cva } from 'class-variance-authority';

import { cn } from '../../lib/cn';

interface TabsOwnProps {
	/**
	 * The active tab in controlled mode. Pair with `onValueChange` and own the
	 * state yourself when external logic — a URL parameter, a sidebar choice, a
	 * notification deep link — needs to drive which panel is visible. Use `null`
	 * to render no active tab.
	 */
	value?: unknown;
	/**
	 * Seeds the active tab for uncontrolled usage. Set when the parent has no
	 * reason to read or write the selection; the component then manages it
	 * internally. Ignored once `value` is set.
	 */
	defaultValue?: unknown;
	/**
	 * Layout direction of the tab strip relative to its panels. `'horizontal'`
	 * stacks the list above the panels; `'vertical'` places the list beside
	 * them. The choice also flips which arrow keys move focus between tabs —
	 * Left/Right in horizontal, Up/Down in vertical — so pick by reading
	 * direction, not just visual layout.
	 *
	 * Accessibility: the chosen orientation propagates to children via
	 * `data-orientation` and governs arrow-key behavior per the WAI-ARIA Tabs
	 * pattern.
	 *
	 * @defaultValue `'horizontal'`
	 */
	orientation?: 'horizontal' | 'vertical';
	/**
	 * Fires when the active tab changes. The second argument carries
	 * `activationDirection` (`'left'`, `'right'`, `'up'`, `'down'`, or
	 * `'none'`) when the change came from a keyboard navigation, which can
	 * drive directional transition animations on the panel.
	 */
	onValueChange?: TabsPrimitive.Root.Props['onValueChange'];
	/**
	 * Merged with the root's flex-layout classes via `cn()`. Reach for it when
	 * a one-off spacing or layout override is needed without forking the
	 * component.
	 */
	className?: string;
	/**
	 * The tabs tree. Compose a {@link TabsList} (containing {@link TabsTrigger}
	 * elements) with one {@link TabsContent} per trigger, matched by `value`.
	 */
	children?: React.ReactNode;
}

type TabsProps = TabsPrimitive.Root.Props & TabsOwnProps;

/**
 * A compound that organizes content into labeled panels and reveals one at a time.
 *
 * @remarks
 * Wraps Base UI's `Tabs` primitives and exposes them as four sibling exports:
 * `Tabs` (the state-managing root), `TabsList` (the trigger group, carrying
 * the `variant` axis), `TabsTrigger` (a tab button), and `TabsContent` (a
 * panel). The root passes the active value and orientation to its children
 * through Base UI context, so triggers and panels stay in sync as long as
 * their `value` props match. Orientation is reflected as `data-orientation`
 * on the root and consumed by the children's group-data Tailwind selectors,
 * which is why layout flips automatically when you switch between
 * `'horizontal'` and `'vertical'`. Activation mode — whether arrow keys move
 * focus only, or focus plus activation together — is controlled by
 * `activateOnFocus` on {@link TabsList} rather than on the root.
 *
 * ### Accessibility
 *
 * The three-part ARIA wiring is automatic: {@link TabsList} carries
 * `role="tablist"`, each {@link TabsTrigger} carries `role="tab"` plus an
 * `aria-controls` reference to its panel, and each {@link TabsContent}
 * carries `role="tabpanel"` plus `aria-labelledby` pointing back at its
 * trigger. The only consumer responsibility is keeping each trigger's
 * `value` prop in sync with the matching panel. Disabled triggers receive
 * `aria-disabled` and are skipped during arrow-key navigation. Tab moves
 * focus out of the tab list rather than cycling through triggers, matching
 * the WAI-ARIA Tabs pattern.
 *
 * ### Keyboard interactions
 *
 * | Key | Description |
 * | --- | --- |
 * | `Arrow Right` / `Arrow Left` | In a horizontal tab list, moves focus between triggers. |
 * | `Arrow Down` / `Arrow Up` | In a vertical tab list, moves focus between triggers. |
 * | `Home` | Moves focus to the first trigger. |
 * | `End` | Moves focus to the last trigger. |
 * | `Enter` / `Space` | Activates the focused trigger in manual-activation mode. |
 * | `Tab` | Moves focus out of the tab list to the next focusable element. |
 *
 * ### When to use
 *
 * - The page has several distinct sections of content that share the same
 *   region and the user picks one at a time without leaving the page.
 * - The selection should expose proper ARIA tab semantics and arrow-key
 *   navigation that conditional rendering or accordion patterns lack.
 *
 * ### When not to use
 *
 * - Use {@link SegmentedControl} when the choice is a value (a filter, a
 *   sort order, a unit) with no associated content panel.
 * - Use {@link Dialog} when switching content should happen in a
 *   focus-trapped overlay rather than inline on the page.
 * - Reach for inline disclosure (an accordion) when the sections are
 *   sequential reveals rather than parallel choices — for example, a form
 *   that progressively unlocks steps.
 *
 * @example Uncontrolled tabs
 * ```tsx
 * import { Tabs, TabsList, TabsTrigger, TabsContent } from '@unbranded-ds/react';
 *
 * export function AccountTabs() {
 *   return (
 *     <Tabs defaultValue="account">
 *       <TabsList>
 *         <TabsTrigger value="account">Account</TabsTrigger>
 *         <TabsTrigger value="password">Password</TabsTrigger>
 *       </TabsList>
 *       <TabsContent value="account">
 *         <p>Manage your account settings.</p>
 *       </TabsContent>
 *       <TabsContent value="password">
 *         <p>Change your password here.</p>
 *       </TabsContent>
 *     </Tabs>
 *   );
 * }
 * ```
 *
 * @example Line variant on a vertical tab list
 * ```tsx
 * import { Tabs, TabsList, TabsTrigger, TabsContent } from '@unbranded-ds/react';
 *
 * export function SettingsTabs() {
 *   return (
 *     <Tabs defaultValue="profile" orientation="vertical">
 *       <TabsList variant="line">
 *         <TabsTrigger value="profile">Profile</TabsTrigger>
 *         <TabsTrigger value="notifications">Notifications</TabsTrigger>
 *         <TabsTrigger value="security">Security</TabsTrigger>
 *       </TabsList>
 *       <TabsContent value="profile">
 *         <p>Profile settings.</p>
 *       </TabsContent>
 *       <TabsContent value="notifications">
 *         <p>Notification preferences.</p>
 *       </TabsContent>
 *       <TabsContent value="security">
 *         <p>Security settings.</p>
 *       </TabsContent>
 *     </Tabs>
 *   );
 * }
 * ```
 *
 * @see https://www.w3.org/WAI/ARIA/apg/patterns/tabs/
 * @see {@link SegmentedControl}
 * @see {@link Dialog}
 */
function Tabs({
	className,
	orientation = 'horizontal',
	...props
}: TabsProps) {
	return (
		<TabsPrimitive.Root
			data-slot="tabs"
			data-orientation={orientation}
			className={cn(
				'group/tabs flex gap-2 data-horizontal:flex-col',
				className,
			)}
			{...props}
		/>
	);
}

/**
 * CVA helper exposing the same list container styling as a standalone class
 * generator. Exported so consumers building a custom container — a
 * filterable list, a non-Tabs segmented surface — can apply the design
 * system's list treatment without re-implementing the variant rules.
 */
const tabsListVariants = cva(
	'group/tabs-list inline-flex w-fit items-center justify-center rounded-lg p-[3px] text-muted-foreground group-data-horizontal/tabs:h-9 group-data-vertical/tabs:h-fit group-data-vertical/tabs:flex-col data-[variant=line]:rounded-none',
	{
		variants: {
			variant: {
				default: 'bg-muted',
				line: 'gap-1 bg-transparent',
			},
		},
		defaultVariants: {
			variant: 'default',
		},
	},
);

interface TabsListOwnProps {
	/**
	 * Visual style of the list container. `'default'` shows a muted pill
	 * background that pairs with most surfaces; `'line'` uses a transparent
	 * background plus an underline indicator on the active tab — reach for it
	 * on white or image backgrounds where the muted pill would clash.
	 *
	 * @defaultValue `'default'`
	 */
	variant?: 'default' | 'line';
	/**
	 * Whether arrow-key navigation activates the focused tab as it moves.
	 * `true` (automatic activation) is right for lightweight panels where the
	 * user benefits from instant preview as they scan; `false` (manual
	 * activation) is right when panel content is expensive to render or
	 * switching triggers a side effect like a network request — the user then
	 * presses Enter or Space to commit.
	 *
	 * Accessibility: both modes are conformant per the WAI-ARIA Tabs pattern.
	 * The choice is a UX decision, not an a11y decision.
	 *
	 * @defaultValue `false`
	 */
	activateOnFocus?: boolean;
	/**
	 * Whether arrow-key focus wraps from the last tab back to the first (and
	 * vice versa). Keep on for long tab lists where users may not realize
	 * they've reached the end; turn off when the list is short enough that
	 * the boundary is obvious and wrapping would feel disorienting.
	 *
	 * @defaultValue `true`
	 */
	loopFocus?: boolean;
	/**
	 * Merged with the list's layout classes via `cn()`.
	 */
	className?: string;
	/**
	 * The {@link TabsTrigger} children.
	 */
	children?: React.ReactNode;
}

type TabsListProps = TabsPrimitive.List.Props
	& TabsListOwnProps
	& VariantProps<typeof tabsListVariants>;

/**
 * Groups tab trigger buttons with `role="tablist"`. Owns the `variant` axis
 * and arrow-key focus behavior.
 *
 * Accessibility: provides the `tablist` landmark and orchestrates arrow-key
 * roving focus across its {@link TabsTrigger} children.
 *
 * @see {@link Tabs} for full keyboard interactions and usage guidance.
 */
function TabsList({
	className,
	variant = 'default',
	...props
}: TabsListProps) {
	return (
		<TabsPrimitive.List
			data-slot="tabs-list"
			data-variant={variant}
			className={cn(tabsListVariants({ variant }), className)}
			{...props}
		/>
	);
}

interface TabsTriggerOwnProps {
	/**
	 * Identifies which panel this trigger activates. Must match the `value`
	 * on the corresponding {@link TabsContent}. Required on every trigger.
	 */
	value: TabsPrimitive.Tab.Props['value'];
	/**
	 * Prevents activation and marks the trigger as disabled for assistive
	 * technology. The disabled trigger is skipped during arrow-key navigation
	 * rather than receiving focus and rejecting activation.
	 *
	 * Accessibility: applies `aria-disabled` so screen readers announce the
	 * disabled state.
	 */
	disabled?: boolean;
	/**
	 * Merged with the trigger's style classes via `cn()`.
	 */
	className?: string;
	/**
	 * The tab label. Combine text with an icon when the topic benefits from a
	 * recognizable glyph; the layout reserves icon spacing automatically via
	 * `has-data-[icon=inline-start|end]` selectors.
	 */
	children?: React.ReactNode;
}

type TabsTriggerProps = Omit<TabsPrimitive.Tab.Props, 'value'>
	& TabsTriggerOwnProps;

/**
 * An individual tab button with `role="tab"`. Requires a `value` prop
 * matching its {@link TabsContent}.
 *
 * Accessibility: receives `role="tab"` and `aria-controls` pointing at its
 * paired panel; carries `aria-disabled` when `disabled` is set.
 *
 * @see {@link Tabs} for full keyboard interactions and usage guidance.
 */
function TabsTrigger({ className, ...props }: TabsTriggerProps) {
	return (
		<TabsPrimitive.Tab
			data-slot="tabs-trigger"
			className={cn(
				'relative inline-flex h-[calc(100%-1px)] flex-1 items-center justify-center gap-1.5 rounded-md border border-transparent px-2 py-1 text-sm font-medium whitespace-nowrap text-foreground/60 transition-all group-data-vertical/tabs:w-full group-data-vertical/tabs:justify-start hover:text-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-1 focus-visible:outline-ring disabled:pointer-events-none disabled:opacity-50 has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 aria-disabled:pointer-events-none aria-disabled:opacity-50 dark:text-muted-foreground dark:hover:text-foreground group-data-[variant=default]/tabs-list:data-active:shadow-sm group-data-[variant=line]/tabs-list:data-active:shadow-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*=size-])]:size-4',
				'group-data-[variant=line]/tabs-list:bg-transparent group-data-[variant=line]/tabs-list:data-active:bg-transparent dark:group-data-[variant=line]/tabs-list:data-active:border-transparent dark:group-data-[variant=line]/tabs-list:data-active:bg-transparent',
				'data-active:bg-background data-active:text-foreground dark:data-active:border-input dark:data-active:bg-input/30 dark:data-active:text-foreground',
				'after:absolute after:bg-foreground after:opacity-0 after:transition-opacity group-data-horizontal/tabs:after:inset-x-0 group-data-horizontal/tabs:after:bottom-[-5px] group-data-horizontal/tabs:after:h-0.5 group-data-vertical/tabs:after:inset-y-0 group-data-vertical/tabs:after:-right-1 group-data-vertical/tabs:after:w-0.5 group-data-[variant=line]/tabs-list:data-active:after:opacity-100',
				className,
			)}
			{...props}
		/>
	);
}

interface TabsContentOwnProps {
	/**
	 * The tab value this panel corresponds to. Must match the `value` on its
	 * {@link TabsTrigger}. Required on every panel.
	 */
	value: TabsPrimitive.Panel.Props['value'];
	/**
	 * Whether to keep the panel's DOM node mounted while it is hidden. Set
	 * `true` when remounting is expensive (heavy lists, third-party widgets)
	 * or when the panel carries its own scroll position that should survive
	 * tab switches — the panel is hidden via `hidden` and CSS rather than
	 * unmounted. Leave `false` when panels are cheap and you want each one to
	 * mount fresh on activation.
	 *
	 * @defaultValue `false`
	 */
	keepMounted?: boolean;
	/**
	 * Merged with the panel's default classes via `cn()`.
	 */
	className?: string;
	/**
	 * The panel content.
	 */
	children?: React.ReactNode;
}

type TabsContentProps = Omit<TabsPrimitive.Panel.Props, 'value'>
	& TabsContentOwnProps;

/**
 * A panel shown when its corresponding {@link TabsTrigger} is active.
 * Requires a `value` prop matching its trigger.
 *
 * Accessibility: receives `role="tabpanel"` and `aria-labelledby` pointing
 * at its paired trigger, so screen readers announce the panel's accessible
 * name from the trigger's text.
 *
 * @see {@link Tabs} for full keyboard interactions and usage guidance.
 */
function TabsContent({ className, ...props }: TabsContentProps) {
	return (
		<TabsPrimitive.Panel
			data-slot="tabs-content"
			className={cn('flex-1 text-sm outline-none', className)}
			{...props}
		/>
	);
}

export { Tabs, TabsContent, TabsList, tabsListVariants, TabsTrigger };
export type { TabsContentProps, TabsListProps, TabsProps, TabsTriggerProps };
