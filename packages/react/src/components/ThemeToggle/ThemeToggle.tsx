'use client';

import type { ReactNode } from 'react';

import { themesForAxis } from '@unbranded-ds/tokens/client';
import * as React from 'react';

import { AxisToggle } from '../_internal/AxisToggle';

export interface ThemeToggleProps {
	/** Per-value label overrides, keyed by identity value; English defaults otherwise. */
	'labels'?: Record<string, string>;
	/** Per-value icons, keyed by identity value; none by default. */
	'icons'?: Record<string, ReactNode>;
	'size'?: 'sm' | 'md' | 'lg';
	'orientation'?: 'horizontal' | 'vertical';
	'aria-label'?: string;
	'className'?: string;
	'id'?: string;
}

// English defaults for the built-in identities. A value with no entry (a custom
// runtime theme) falls back to its raw name in AxisToggle.
const DEFAULT_LABELS: Record<string, string> = {
	default: 'Default',
	brand: 'Brand',
	vaporwave: 'Vaporwave',
};

/**
 * The aesthetic-identity control: a segmented control over the `theme` axis of
 * `useTheme()` (default / brand / vaporwave). Like `<DensityToggle>` and unlike
 * `<ColorSchemeToggle>`, its segments are data-driven from the tokens registry
 * (`themesForAxis('theme')`), so a newly registered identity appears with no
 * change here. There is no `system` segment — identity has no OS signal; that
 * belongs to `<ColorSchemeToggle>` (spec 016 split the two apart). Must run inside
 * a `<ThemeProvider>`.
 *
 * @example
 * ```tsx
 * import { ThemeProvider, ThemeToggle } from '@unbranded-ds/react';
 *
 * <ThemeProvider>
 *   <ThemeToggle />
 * </ThemeProvider>
 * ```
 *
 * @see {@link useTheme} for the per-axis API and the next-themes vocabulary mapping.
 */
export function ThemeToggle({
	labels,
	icons,
	...rest
}: ThemeToggleProps): React.JSX.Element {
	return (
		<AxisToggle
			axis="theme"
			values={themesForAxis('theme')}
			groupLabel="Theme"
			labels={{ ...DEFAULT_LABELS, ...labels }}
			icons={icons}
			{...rest}
		/>
	);
}
