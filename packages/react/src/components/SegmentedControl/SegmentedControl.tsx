/* eslint-disable react-refresh/only-export-components -- shadcn pattern co-locates segmentedControlVariants with the SegmentedControl components */
'use client';

import type { VariantProps } from 'class-variance-authority';

import { Radio as RadioPrimitive } from '@base-ui-components/react/radio';
import { RadioGroup as RadioGroupPrimitive } from '@base-ui-components/react/radio-group';
import { cva } from 'class-variance-authority';
import * as React from 'react';

import { cn } from '../../lib/cn';
import { warn } from '../../lib/warn';

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

const segmentedControlItemVariants = cva(
	// Each item is a focusable segment. The selected segment lifts onto a
	// solid background; unselected segments fade. Inner corners stay subtle
	// because the outer wrapper provides the outer pill curve.
	'relative inline-flex shrink-0 cursor-pointer items-center justify-center gap-1.5 rounded-[calc(var(--radius-md)-2px)] border border-transparent font-medium whitespace-nowrap transition-colors outline-none select-none hover:text-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 aria-disabled:pointer-events-none aria-disabled:opacity-50 data-checked:bg-background data-checked:text-foreground data-checked:shadow-sm data-disabled:pointer-events-none data-disabled:opacity-50 dark:data-checked:bg-input/30 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*=\'size-\'])]:size-4',
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
	value?: string;
	defaultValue?: string;
	onValueChange?: (value: string) => void;
	size?: 'sm' | 'md' | 'lg';
	orientation?: 'horizontal' | 'vertical';
	disabled?: boolean;
	children: React.ReactNode;
	className?: string;
}

interface SegmentedControlItemProps {
	value: string;
	disabled?: boolean;
	children: React.ReactNode;
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
