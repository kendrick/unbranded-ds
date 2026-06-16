'use client';

import type { ReactNode } from 'react';

import { Moon, Sun, SunMoon } from 'lucide-react';
import * as React from 'react';

import { AxisToggle } from '../_internal/AxisToggle';

type ColorScheme = 'light' | 'system' | 'dark';

export interface ColorSchemeToggleProps {
	/** Per-segment label overrides; English defaults otherwise. */
	'labels'?: Partial<Record<ColorScheme, string>>;
	/** Per-segment icon overrides; lucide Sun / SunMoon / Moon otherwise. */
	'icons'?: Partial<Record<ColorScheme, ReactNode>>;
	'size'?: 'sm' | 'md' | 'lg';
	'orientation'?: 'horizontal' | 'vertical';
	'aria-label'?: string;
	'className'?: string;
	'id'?: string;
}

const DEFAULT_LABELS: Record<ColorScheme, string> = {
	light: 'Light',
	system: 'System',
	dark: 'Dark',
};

/**
 * The drop-in color-scheme control: a fixed light / system / dark
 * {@link SegmentedControl} wired to the `colorScheme` axis of `useTheme()`.
 * Persisted, system-aware, keyboard-navigable, and accessible. Must run inside a
 * `<ThemeProvider>`.
 *
 * @remarks
 * The three segments are fixed (the others are data-driven), because color scheme
 * is a closed set: light, dark, and the OS-following `system` intent. It is its
 * own axis (spec 016), independent of the aesthetic identity — so this control and
 * `<ThemeToggle>` never fight over a shared attribute. For an explicit two-state
 * light/dark control with no `system`, compose on `useTheme()` directly; see the
 * sidecar recipe.
 *
 * @example
 * ```tsx
 * import { ColorSchemeToggle, ThemeProvider } from '@unbranded-ds/react';
 *
 * <ThemeProvider>
 *   <ColorSchemeToggle />
 * </ThemeProvider>
 * ```
 *
 * @see {@link useTheme} for the per-axis API and the next-themes vocabulary mapping.
 */
export function ColorSchemeToggle({
	labels,
	icons,
	...rest
}: ColorSchemeToggleProps): React.JSX.Element {
	const mergedIcons: Record<string, ReactNode> = {
		light: icons?.light ?? <Sun aria-hidden />,
		system: icons?.system ?? <SunMoon aria-hidden />,
		dark: icons?.dark ?? <Moon aria-hidden />,
	};

	return (
		<AxisToggle
			axis="colorScheme"
			values={['light', 'system', 'dark']}
			groupLabel="Color scheme"
			labels={{ ...DEFAULT_LABELS, ...labels }}
			icons={mergedIcons}
			{...rest}
		/>
	);
}
