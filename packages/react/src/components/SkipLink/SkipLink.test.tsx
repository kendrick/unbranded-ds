import { cleanup, render } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { SkipLink } from './SkipLink';

describe('skipLink', () => {
	afterEach(() => {
		cleanup();
	});

	it('defaults targetId to "main" and renders href="#main"', () => {
		const { getByRole } = render(<SkipLink />);
		const link = getByRole('link');
		expect(link.getAttribute('href')).toBe('#main');
	});

	it('builds href from a custom targetId', () => {
		const { getByRole } = render(<SkipLink targetId="content" />);
		const link = getByRole('link');
		expect(link.getAttribute('href')).toBe('#content');
	});

	it('renders the default "Skip to main content" text', () => {
		const { getByRole } = render(<SkipLink />);
		expect(getByRole('link').textContent).toBe('Skip to main content');
	});

	it('passes custom children through unchanged', () => {
		const { getByRole } = render(<SkipLink>Jump to nav</SkipLink>);
		expect(getByRole('link').textContent).toBe('Jump to nav');
	});

	it('merges a consumer className with the sr-only baseline via cn()', () => {
		const { getByRole } = render(<SkipLink className="custom-class" />);
		const link = getByRole('link');
		expect(link.className).toContain('sr-only');
		expect(link.className).toContain('focus-visible:not-sr-only');
		expect(link.className).toContain('custom-class');
	});

	it('renders an <a> element, not a <button>', () => {
		// Guards against accidental refactors to a button — the spec requires
		// native anchor behavior so the browser handles focus and scroll.
		const { getByRole } = render(<SkipLink />);
		expect(getByRole('link').tagName).toBe('A');
	});

	it('applies the data-slot="skip-link" attribute', () => {
		const { getByRole } = render(<SkipLink />);
		expect(getByRole('link').getAttribute('data-slot')).toBe('skip-link');
	});
});
