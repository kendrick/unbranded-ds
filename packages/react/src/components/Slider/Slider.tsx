/* eslint-disable react-refresh/only-export-components -- shadcn pattern co-locates sliderRootVariants with the Slider components */
'use client';

import type { VariantProps } from 'class-variance-authority';
import type * as React from 'react';
import { Slider as SliderPrimitive } from '@base-ui-components/react/slider';
import { cva } from 'class-variance-authority';

import { useEffect, useMemo } from 'react';
import { cn } from '../../lib/cn';
import { warn } from '../../lib/warn';

const sliderRootVariants = cva(
	'group/slider relative flex touch-none items-center select-none data-disabled:pointer-events-none data-disabled:opacity-50',
	{
		variants: {
			size: {
				sm: 'data-[orientation=horizontal]:h-4 data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-40 data-[orientation=vertical]:w-4',
				md: 'data-[orientation=horizontal]:h-5 data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-48 data-[orientation=vertical]:w-5',
				lg: 'data-[orientation=horizontal]:h-6 data-[orientation=horizontal]:w-full data-[orientation=vertical]:h-56 data-[orientation=vertical]:w-6',
			},
			orientation: {
				horizontal: 'flex-row',
				vertical: 'flex-col',
			},
			disabled: {
				true: 'pointer-events-none opacity-50',
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

const sliderControlVariants = cva(
	'relative flex w-full items-center group-data-[orientation=vertical]/slider:h-full group-data-[orientation=vertical]/slider:w-fit',
);

const sliderTrackVariants = cva(
	'relative grow overflow-hidden rounded-full bg-muted group-data-[orientation=horizontal]/slider:h-1.5 group-data-[orientation=horizontal]/slider:w-full group-data-[orientation=vertical]/slider:h-full group-data-[orientation=vertical]/slider:w-1.5',
);

const sliderIndicatorVariants = cva(
	'absolute rounded-full bg-primary group-data-[orientation=horizontal]/slider:h-full group-data-[orientation=vertical]/slider:w-full',
);

const sliderThumbVariants = cva(
	'block rounded-full border border-primary/50 bg-background shadow-xs ring-ring/50 transition-[color,box-shadow] outline-none focus-visible:ring-3 disabled:pointer-events-none disabled:opacity-50 data-disabled:pointer-events-none data-disabled:opacity-50',
	{
		variants: {
			size: {
				sm: 'size-3.5',
				md: 'size-4',
				lg: 'size-5',
			},
		},
		defaultVariants: {
			size: 'md',
		},
	},
);

// Base UI's onValueChange receives the value first, plus a details object.
// We narrow the public surface to just the array — consumers wiring
// onValueChange should not need to learn Base UI's event-details shape.
interface SliderRootProps
	extends Omit<
		SliderPrimitive.Root.Props<readonly number[]>,
		'value' | 'defaultValue' | 'onValueChange' | 'size' | 'orientation' | 'disabled'
	>,
	VariantProps<typeof sliderRootVariants> {
	value?: number[];
	defaultValue?: number[];
	min?: number;
	max?: number;
	step?: number;
	onValueChange?: (value: number[]) => void;
	size?: 'sm' | 'md' | 'lg';
	orientation?: 'horizontal' | 'vertical';
	disabled?: boolean;
	className?: string;
	// Optional in the TypeScript surface so Storybook's argTypes-driven type
	// inference doesn't force every story to declare children explicitly.
	// Runtime usage still composes children via the Control/Track/Thumb slots.
	children?: React.ReactNode;
}

interface SliderControlProps extends SliderPrimitive.Control.Props {
	className?: string;
}

interface SliderTrackProps extends SliderPrimitive.Track.Props {
	className?: string;
}

interface SliderIndicatorProps extends SliderPrimitive.Indicator.Props {
	className?: string;
}

interface SliderThumbProps extends SliderPrimitive.Thumb.Props {
	className?: string;
}

// Validation result for the Root's sanitized props. Validation runs once at
// the bottom of render, but warn calls happen in useEffect so SSR doesn't see
// console noise and we don't re-emit on every re-render.
interface SanitizedProps {
	min: number;
	max: number;
	step: number;
	value: number[] | undefined;
	defaultValue: number[] | undefined;
	warnings: Array<Parameters<typeof warn>[0]>;
}

function sanitize({
	min,
	max,
	step,
	value,
	defaultValue,
}: {
	min: number;
	max: number;
	step: number;
	value: number[] | undefined;
	defaultValue: number[] | undefined;
}): SanitizedProps {
	const warnings: Array<Parameters<typeof warn>[0]> = [];

	const safeMin = min;
	let safeMax = max;
	if (safeMin >= safeMax) {
		const swappedTo: [number, number] = [safeMin, safeMin + 1];
		warnings.push({
			component: 'Slider',
			issue: 'invalid-bounds',
			min,
			max,
			swappedTo,
		});
		safeMax = safeMin + 1;
	}

	let safeStep = step;
	if (safeStep <= 0) {
		warnings.push({
			component: 'Slider',
			issue: 'invalid-step',
			got: step,
			fallback: 1,
		});
		safeStep = 1;
	}

	const clamp = (values: number[], propName: 'value' | 'defaultValue'): number[] => {
		const clamped = values.map((v) => {
			if (v < safeMin)
				return safeMin;
			if (v > safeMax)
				return safeMax;
			return v;
		});
		const drifted = clamped.some((v, i) => v !== values[i]);
		if (drifted) {
			warnings.push({
				component: 'Slider',
				issue: 'value-out-of-range',
				prop: propName,
				got: values,
				clamped,
			});
		}
		return clamped;
	};

	return {
		min: safeMin,
		max: safeMax,
		step: safeStep,
		value: value === undefined ? undefined : clamp(value, 'value'),
		defaultValue:
			defaultValue === undefined ? undefined : clamp(defaultValue, 'defaultValue'),
		warnings,
	};
}

function SliderRoot({
	className,
	size = 'md',
	orientation = 'horizontal',
	disabled = false,
	min = 0,
	max = 100,
	step = 1,
	value,
	defaultValue,
	onValueChange,
	children,
	...props
}: SliderRootProps) {
	const sanitized = useMemo(
		() => sanitize({ min, max, step, value, defaultValue }),
		[min, max, step, value, defaultValue],
	);

	// Warnings emit on the client only — useEffect doesn't run on the server,
	// which keeps SSR output clean and avoids re-emitting on every render.
	useEffect(() => {
		for (const payload of sanitized.warnings) {
			warn(payload);
		}
	}, [sanitized.warnings]);

	// PageUp/PageDown should move 10% of the range, rounded to the nearest step.
	// Base UI honours `largeStep` natively; the default is 10, which is wrong
	// when the range is anything other than 0-100. Recompute it here.
	const largeStep = useMemo(() => {
		const tenPercent = (sanitized.max - sanitized.min) * 0.1;
		const rounded = Math.round(tenPercent / sanitized.step) * sanitized.step;
		return rounded > 0 ? rounded : sanitized.step;
	}, [sanitized.min, sanitized.max, sanitized.step]);

	const handleValueChange = onValueChange
		? (next: readonly number[]) => onValueChange([...next])
		: undefined;

	return (
		<SliderPrimitive.Root<readonly number[]>
			data-slot="slider-root"
			data-size={size}
			data-orientation={orientation}
			data-disabled={disabled ? '' : undefined}
			min={sanitized.min}
			max={sanitized.max}
			step={sanitized.step}
			largeStep={largeStep}
			value={sanitized.value}
			defaultValue={sanitized.defaultValue}
			onValueChange={handleValueChange}
			disabled={disabled}
			orientation={orientation}
			className={cn(sliderRootVariants({ size, orientation, disabled }), className)}
			{...props}
		>
			{children}
		</SliderPrimitive.Root>
	);
}

function SliderControl({ className, ...props }: SliderControlProps) {
	return (
		<SliderPrimitive.Control
			data-slot="slider-control"
			className={cn(sliderControlVariants(), className)}
			{...props}
		/>
	);
}

function SliderTrack({ className, ...props }: SliderTrackProps) {
	return (
		<SliderPrimitive.Track
			data-slot="slider-track"
			className={cn(sliderTrackVariants(), className)}
			{...props}
		/>
	);
}

function SliderIndicator({ className, ...props }: SliderIndicatorProps) {
	return (
		<SliderPrimitive.Indicator
			data-slot="slider-indicator"
			className={cn(sliderIndicatorVariants(), className)}
			{...props}
		/>
	);
}

function SliderThumb({ className, ...props }: SliderThumbProps) {
	return (
		<SliderPrimitive.Thumb
			data-slot="slider-thumb"
			className={cn(sliderThumbVariants(), className)}
			{...props}
		/>
	);
}

const Slider = {
	Root: SliderRoot,
	Control: SliderControl,
	Track: SliderTrack,
	Indicator: SliderIndicator,
	Thumb: SliderThumb,
};

export {
	Slider,
	sliderControlVariants,
	sliderIndicatorVariants,
	sliderRootVariants,
	sliderThumbVariants,
	sliderTrackVariants,
};

export type {
	SliderControlProps,
	SliderIndicatorProps,
	SliderRootProps,
	SliderThumbProps,
	SliderTrackProps,
};
