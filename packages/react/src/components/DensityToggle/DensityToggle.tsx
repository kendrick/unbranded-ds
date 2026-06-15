'use client';

import type { ReactNode } from 'react';

import { themesForAxis } from '@unbranded-ds/tokens/client';
import * as React from 'react';

import { AxisToggle } from '../_internal/AxisToggle';

export interface DensityToggleProps {
	/** Per-value label overrides, keyed by density value; English defaults otherwise. */
	'labels'?: Record<string, string>;
	/** Per-value icons, keyed by density value; none by default (density has no canonical icon). */
	'icons'?: Record<string, ReactNode>;
	'size'?: 'sm' | 'md' | 'lg';
	'orientation'?: 'horizontal' | 'vertical';
	'aria-label'?: string;
	'className'?: string;
	'id'?: string;
}

// English defaults for the built-in values. A value with no entry (a custom
// runtime theme) falls back to its raw name in AxisToggle.
const DEFAULT_LABELS: Record<string, string> = {
	comfortable: 'Comfortable',
	compact: 'Compact',
	expanded: 'Expanded',
};

/**
 * The density control: a segmented control over the density axis of
 * `useTheme()`. Unlike `<ThemeToggle>`, its segments are data-driven from the
 * tokens registry (`themesForAxis('density')`), so a newly authored density
 * value appears with no change here. There is no `system` segment, because
 * density has no OS signal. Must run inside a `<ThemeProvider>`.
 *
 * @example
 * ```tsx
 * import { ThemeProvider, DensityToggle } from '@unbranded-ds/react';
 *
 * <ThemeProvider>
 *   <DensityToggle />
 * </ThemeProvider>
 * ```
 *
 * @see {@link useTheme} for the per-axis API and the next-themes vocabulary mapping.
 */
export function DensityToggle({
	labels,
	icons,
	...rest
}: DensityToggleProps): React.JSX.Element {
	return (
		<AxisToggle
			axis="density"
			values={themesForAxis('density')}
			groupLabel="Density"
			labels={{ ...DEFAULT_LABELS, ...labels }}
			icons={icons}
			{...rest}
		/>
	);
}
