'use client';

import type { Axis } from '@unbranded-ds/tokens/client';
import type { ReactNode } from 'react';

import * as React from 'react';

import { useTheme } from '../../hooks/useTheme';
import { SegmentedControl } from '../SegmentedControl';

export interface AxisToggleProps {
	/** The theme axis this control drives. */
	'axis': Axis;
	/** Segment values, in display order. */
	'values': string[];
	/** Default accessible group name, used when no `aria-label` is supplied. */
	'groupLabel': string;
	/** Per-value visible labels; a value with no entry falls back to the raw value. */
	'labels'?: Record<string, string>;
	/** Per-value icons rendered inline before the label. */
	'icons'?: Record<string, ReactNode>;
	'size'?: 'sm' | 'md' | 'lg';
	'orientation'?: 'horizontal' | 'vertical';
	'aria-label'?: string;
	'className'?: string;
	'id'?: string;
}

/**
 * Private shared shell behind `<ThemeToggle>` and `<DensityToggle>`. Wires a
 * `<SegmentedControl>` to one axis of `useTheme()`: the selected segment tracks
 * the stated `preference`, selecting one routes to `set()`, a forced axis renders
 * disabled, and the control stays unresolved (no segment selected) until mounted
 * so the server and first client render agree (spec 011 FR-008, FR-013, FR-014).
 * Not exported from the package.
 */
export function AxisToggle({
	axis,
	values,
	groupLabel,
	labels,
	icons,
	size,
	orientation,
	className,
	id,
	'aria-label': ariaLabel,
}: AxisToggleProps): React.JSX.Element {
	const { preference, forced, set } = useTheme();

	// Unresolved until mounted: an empty value matches no segment, so the server
	// and the first client render show no selection (no hydration mismatch, no
	// layout shift). The selected segment appears once mounted.
	const [mounted, setMounted] = React.useState(false);
	React.useEffect(() => {
		setMounted(true);
	}, []);

	const onValueChange = (next: string): void => {
		const update: Partial<Record<Axis, string>> = {};
		update[axis] = next;
		set(update);
	};

	return (
		<SegmentedControl.Root
			aria-label={ariaLabel ?? groupLabel}
			id={id}
			className={className}
			size={size}
			orientation={orientation}
			disabled={forced[axis] != null}
			value={mounted ? preference[axis] : ''}
			onValueChange={onValueChange}
		>
			{values.map((value) => (
				<SegmentedControl.Item key={value} value={value}>
					{icons?.[value]}
					{labels?.[value] ?? value}
				</SegmentedControl.Item>
			))}
		</SegmentedControl.Root>
	);
}
