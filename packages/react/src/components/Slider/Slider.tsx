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
	'block rounded-full border border-primary/50 bg-background shadow-xs ring-ring/50 transition-[color,box-shadow] outline-none focus-visible:ring-(length:--ring-width) disabled:pointer-events-none disabled:opacity-50 data-disabled:pointer-events-none data-disabled:opacity-50',
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
	/**
	 * Controlled value as a number array. Pass `[50]` for a single-thumb slider
	 * or `[20, 80]` for a range. Reach for this when external logic — a URL
	 * parameter, a stored preference, another control — needs to read or drive
	 * the value. The parent then owns state and must update `value` from
	 * `onValueChange` for the thumb to visually move. Values outside
	 * `[min, max]` are clamped at render time and a structured warning is
	 * emitted.
	 */
	value?: number[];
	/**
	 * Uncontrolled initial value as a number array. Same shape as `value`:
	 * `[50]` for a single thumb, `[20, 80]` for a range. Use this when no
	 * external code needs to react to or drive the current value — the
	 * component then manages state internally.
	 */
	defaultValue?: number[];
	/**
	 * Lower bound of the value range, inclusive. The thumb cannot move below
	 * this point and `Home` jumps the focused thumb here. When `min >= max`
	 * the component clamps to `[min, min + 1]` and emits a structured warning
	 * rather than rendering a degenerate range.
	 *
	 * @defaultValue `0`
	 */
	min?: number;
	/**
	 * Upper bound of the value range, inclusive. The thumb cannot move above
	 * this point and `End` jumps the focused thumb here.
	 *
	 * @defaultValue `100`
	 */
	max?: number;
	/**
	 * Increment applied by keyboard and drag. PageUp and PageDown move 10% of
	 * the range, rounded to the nearest `step`. Values at or below zero are
	 * non-sensical for an increment and fall back to `1` with a structured
	 * warning.
	 *
	 * @defaultValue `1`
	 */
	step?: number;
	/**
	 * Fires on every value change — keyboard, drag, or touch. Receives the new
	 * value as `number[]`, matching the shape of `value` and `defaultValue`.
	 * Base UI's event-details object is stripped from this signature; the
	 * array is all consumers need. In controlled mode this is where the
	 * parent commits the change to whatever owns the state.
	 */
	onValueChange?: (value: number[]) => void;
	/**
	 * Visual size axis. Affects track height and thumb diameter so dense
	 * panels can use `'sm'` while comfortable surfaces use `'lg'`.
	 *
	 * @defaultValue `'md'`
	 */
	size?: 'sm' | 'md' | 'lg';
	/**
	 * Layout axis. `'horizontal'` lays the track along the inline axis — the
	 * right fit for most form layouts; `'vertical'` lays it along the block
	 * axis and is useful for compact side panels like volume rails. The
	 * orientation also flips which arrow keys increment the value:
	 * Right/Left in horizontal, Up/Down in vertical, with the other pair
	 * still working as cross-axis equivalents per WAI-ARIA's pattern.
	 *
	 * @defaultValue `'horizontal'`
	 */
	orientation?: 'horizontal' | 'vertical';
	/**
	 * When `true`, the entire slider is non-interactive. Drag, keyboard, and
	 * focus on every thumb are blocked, but the slider still renders at its
	 * current value so the disabled state stays legible.
	 *
	 * @defaultValue `false`
	 */
	disabled?: boolean;
	/**
	 * Merged with the Root's CVA classes via `cn()`. Reach for it when a
	 * one-off spacing or layout override is needed without forking the
	 * component.
	 */
	className?: string;
	// Optional in the TypeScript surface so Storybook's argTypes-driven type
	// inference doesn't force every story to declare children explicitly.
	// Runtime usage still composes children via the Control/Track/Thumb slots.
	/**
	 * The slot tree below the Root. A standard composition nests
	 * `Slider.Control` → `Slider.Track` → `Slider.Indicator` with one or more
	 * `Slider.Thumb` siblings of the track.
	 */
	children?: React.ReactNode;
}

interface SliderControlProps extends SliderPrimitive.Control.Props {
	/**
	 * Merged with the Control's CVA classes via `cn()`. Use it to tweak the
	 * positioning wrapper that holds the track and thumbs without forking the
	 * component.
	 */
	className?: string;
}

interface SliderTrackProps extends SliderPrimitive.Track.Props {
	/**
	 * Merged with the Track's CVA classes via `cn()`. Use it to override the
	 * track's background, radius, or thickness for a single composition.
	 */
	className?: string;
}

interface SliderIndicatorProps extends SliderPrimitive.Indicator.Props {
	/**
	 * Merged with the Indicator's CVA classes via `cn()`. Use it to recolor or
	 * restyle the filled portion of the track for a specific composition.
	 */
	className?: string;
}

interface SliderThumbProps extends SliderPrimitive.Thumb.Props {
	/**
	 * Merged with the Thumb's CVA classes via `cn()`. Use it to restyle a
	 * single thumb — for example, to color the high and low thumbs of a range
	 * slider distinctly.
	 */
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

/**
 * The state manager. Owns the value array, range bounds, step, and orientation,
 * and sets context for every descendant slot. Sanitizes inputs (swaps inverted
 * bounds, replaces non-positive steps with `1`, clamps out-of-range values) and
 * recomputes `largeStep` at 10% of the actual range so PageUp/PageDown behave
 * correctly outside the 0-100 default.
 *
 * Accessibility: forwards orientation to descendants as `aria-orientation` on
 * each thumb. When `disabled` is set, every thumb leaves the tab order and
 * pointer events are suppressed on the group.
 *
 * @see {@link Slider} for full keyboard interactions and usage guidance.
 */
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

/**
 * The interactive control area. Pointer and touch events on this element
 * translate to value changes via Base UI's geometry math. Wraps the Track and
 * Thumb children and positions them on the orientation axis.
 *
 * @see {@link Slider} for full keyboard interactions and usage guidance.
 */
function SliderControl({ className, ...props }: SliderControlProps) {
	return (
		<SliderPrimitive.Control
			data-slot="slider-control"
			className={cn(sliderControlVariants(), className)}
			{...props}
		/>
	);
}

/**
 * The visual rail that represents the slider's full numeric range. Hosts the
 * filled Indicator inside it. Every composition needs exactly one track
 * inside the Control.
 *
 * @see {@link Slider} for full keyboard interactions and usage guidance.
 */
function SliderTrack({ className, ...props }: SliderTrackProps) {
	return (
		<SliderPrimitive.Track
			data-slot="slider-track"
			className={cn(sliderTrackVariants(), className)}
			{...props}
		/>
	);
}

/**
 * The filled portion of the track. Stretches from `min` to the thumb position
 * for a single-thumb slider, or fills the segment between the two thumbs in
 * range mode. Omit it from the tree when an unfilled track is preferred.
 *
 * @see {@link Slider} for full keyboard interactions and usage guidance.
 */
function SliderIndicator({ className, ...props }: SliderIndicatorProps) {
	return (
		<SliderPrimitive.Indicator
			data-slot="slider-indicator"
			className={cn(sliderIndicatorVariants(), className)}
			{...props}
		/>
	);
}

/**
 * The draggable handle representing one value in the array. Render multiple
 * Thumbs for a range slider — one per value. Each Thumb carries its own
 * `role="slider"` and `aria-valuenow` / `aria-valuemin` / `aria-valuemax`.
 *
 * Accessibility: give each thumb in a range slider an `aria-label` describing
 * which bound it controls (e.g., `"Minimum price"`) so screen-reader users
 * understand which thumb they're adjusting.
 *
 * @see {@link Slider} for full keyboard interactions and usage guidance.
 */
function SliderThumb({ className, ...props }: SliderThumbProps) {
	return (
		<SliderPrimitive.Thumb
			data-slot="slider-thumb"
			className={cn(sliderThumbVariants(), className)}
			{...props}
		/>
	);
}

/**
 * A draggable input for selecting one value or a range from a continuous numeric scale.
 *
 * @remarks
 * Composes five slots: {@link Slider.Root} owns the state, {@link Slider.Control}
 * captures pointer geometry, {@link Slider.Track} draws the rail,
 * {@link Slider.Indicator} fills the active segment, and {@link Slider.Thumb}
 * is the draggable handle. All five wrap Base UI's `Slider` primitives with
 * token styling. Single-value vs range mode is determined by the number of
 * Thumb children: one Thumb for a single value, two Thumbs for a range.
 *
 * The Root sanitizes its inputs before forwarding them to Base UI. Inverted
 * bounds (`min >= max`) swap to `[min, min + 1]`, non-positive `step` falls
 * back to `1`, and out-of-range values clamp to `[min, max]`. Every fix emits
 * a structured warning through `warn()` so consumers see the problem in dev
 * without breaking the render. `largeStep` (PageUp/PageDown) is recomputed to
 * 10% of `(max - min)` because Base UI's hard-coded default of `10` is wrong
 * for any range other than 0-100.
 *
 * ### Accessibility
 *
 * Each Thumb renders with `role="slider"` and exposes `aria-valuenow`,
 * `aria-valuemin`, and `aria-valuemax` to assistive technology. The Root
 * reflects layout as `aria-orientation`. Focus moves to a Thumb on Tab, and
 * screen readers announce the current value as the Thumb moves. Pass an
 * `aria-label` to the Root (or to each Thumb in range mode) so the control
 * has a name independent of its visual position. When `disabled` is set,
 * every thumb leaves the focus order and pointer/touch events are suppressed.
 *
 * ### Keyboard interactions
 *
 * | Key | Description |
 * | --- | --- |
 * | `Arrow Right` / `Arrow Up` | Increments the focused thumb by `step`. |
 * | `Arrow Left` / `Arrow Down` | Decrements the focused thumb by `step`. |
 * | `Page Up` | Increments by 10% of the range, rounded to the nearest `step`. |
 * | `Page Down` | Decrements by 10% of the range, rounded to the nearest `step`. |
 * | `Home` | Jumps the focused thumb to `min`. |
 * | `End` | Jumps the focused thumb to `max`. |
 * | `Tab` | Moves focus to the next focusable element (or the next thumb in a range slider). |
 *
 * ### When to use
 *
 * - Continuous or finely-stepped numeric values where seeing position on the
 *   scale matters — volume, brightness, opacity, zoom.
 * - Range filters where the user picks both a lower and upper bound — price
 *   ranges, date windows.
 * - Settings where the exact figure matters less than its relative position.
 *
 * ### When not to use
 *
 * - Use {@link SegmentedControl} when the options are discrete named values
 *   rather than a position on a numeric scale.
 * - Use {@link Input} with `type="number"` when the user needs to type an
 *   exact figure without scanning a track.
 * - Use {@link Switch} for a single on/off binary state.
 *
 * @example Basic single-thumb slider
 * ```tsx
 * import { Slider } from '@unbranded-ds/react';
 *
 * export function BasicSlider() {
 *   return (
 *     <div style={{ width: '320px' }}>
 *       <Slider.Root defaultValue={[50]} min={0} max={100} step={1}>
 *         <Slider.Control>
 *           <Slider.Track>
 *             <Slider.Indicator />
 *           </Slider.Track>
 *           <Slider.Thumb />
 *         </Slider.Control>
 *       </Slider.Root>
 *     </div>
 *   );
 * }
 * ```
 *
 * @example Range slider with two thumbs
 * ```tsx
 * import { Slider } from '@unbranded-ds/react';
 *
 * export function PriceRangeSlider() {
 *   return (
 *     <div style={{ width: '320px' }}>
 *       <Slider.Root defaultValue={[20, 80]}>
 *         <Slider.Control>
 *           <Slider.Track>
 *             <Slider.Indicator />
 *           </Slider.Track>
 *           <Slider.Thumb aria-label="Minimum price" />
 *           <Slider.Thumb aria-label="Maximum price" />
 *         </Slider.Control>
 *       </Slider.Root>
 *     </div>
 *   );
 * }
 * ```
 *
 * @example Controlled slider with a value readout
 * ```tsx
 * import { useState } from 'react';
 * import { Slider } from '@unbranded-ds/react';
 *
 * export function ControlledSlider() {
 *   const [value, setValue] = useState<number[]>([42]);
 *   return (
 *     <div style={{ width: '320px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
 *       <Slider.Root value={value} onValueChange={setValue}>
 *         <Slider.Control>
 *           <Slider.Track>
 *             <Slider.Indicator />
 *           </Slider.Track>
 *           <Slider.Thumb />
 *         </Slider.Control>
 *       </Slider.Root>
 *       <output>{`Value: ${value[0]}`}</output>
 *     </div>
 *   );
 * }
 * ```
 *
 * @see https://www.w3.org/WAI/ARIA/apg/patterns/slider/
 * @see {@link SegmentedControl}
 * @see {@link Input}
 * @see {@link Switch}
 */
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
