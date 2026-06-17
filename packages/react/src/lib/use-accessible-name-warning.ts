'use client';

import { useEffect } from 'react';
import { warn } from './warn';

// Type `process.env.NODE_ENV` without taking a dependency on @types/node. The
// consumer's bundler replaces this exact expression and strips the dev-only
// branch below; the module-scoped ambient keeps it typed even where node
// globals aren't in `types` (e.g. the sidecar example validator).
declare const process: { env: { NODE_ENV?: string } };

/**
 * The prop subset that can name an ARIA-role control. A wrapping `<label>` or an
 * `htmlFor` association toggles the hidden input but does not name a
 * `role="checkbox"`/`"switch"`/`"slider"` element — only these two props do.
 */
interface AccessibleNameProps {
	'aria-label'?: string;
	'aria-labelledby'?: string;
}

const REMEDY = 'Add aria-label, or aria-labelledby referencing a visible label.';

/**
 * Dev-only guard that warns when a Checkbox, Switch, or Slider thumb renders
 * with no accessible name.
 *
 * These controls expose an ARIA role rather than a native form element, so a
 * native `<label>` names nothing on them — a real defect the docs used to teach.
 * Detection is props-only: it reads the control's own `aria-label` /
 * `aria-labelledby` and never computes a name from the DOM, which keeps it
 * simple and predictable at the cost of a known false positive (a Slider named
 * by a native `<label>`, whose remedy is to add `aria-labelledby`). The
 * automated axe check in stories stays the full source of truth.
 *
 * The warning emits from `useEffect`, never at render, so SSR output stays clean
 * (Constitution IX.6), and the body is gated to development so a consumer's
 * production bundler dead-code-eliminates it.
 *
 * @param component - the calling control, recorded in the warn payload
 * @param props - the control's own props; only the two ARIA naming props are read
 */
function useAccessibleNameWarning(
	component: 'Checkbox' | 'Switch' | 'Slider',
	props: AccessibleNameProps,
): void {
	const named
		= isNonEmpty(props['aria-label']) || isNonEmpty(props['aria-labelledby']);

	useEffect(() => {
		if (process.env.NODE_ENV === 'production')
			return;
		if (named)
			return;
		warn({ component, issue: 'missing-accessible-name', remedy: REMEDY });
	}, [component, named]);
}

// An empty or whitespace-only value names nothing, so it must not count as named.
function isNonEmpty(value: string | undefined): boolean {
	return typeof value === 'string' && value.trim().length > 0;
}

export { useAccessibleNameWarning };
export type { AccessibleNameProps };
