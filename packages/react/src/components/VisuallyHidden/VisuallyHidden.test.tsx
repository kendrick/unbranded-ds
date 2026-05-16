import { cleanup, render } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { VisuallyHidden } from './VisuallyHidden';

describe('visuallyHidden', () => {
	afterEach(() => {
		cleanup();
	});

	it('renders a span by default', () => {
		const { getByText } = render(<VisuallyHidden>Hi</VisuallyHidden>);
		expect(getByText('Hi').tagName).toBe('SPAN');
	});

	it('renders the element specified by the as prop', () => {
		const { getByText } = render(<VisuallyHidden as="div">Hi</VisuallyHidden>);
		expect(getByText('Hi').tagName).toBe('DIV');
	});

	it('merges the sr-only class with a consumer className', () => {
		const { getByText } = render(
			<VisuallyHidden className="extra-class">Hi</VisuallyHidden>,
		);
		const el = getByText('Hi');
		expect(el.className).toContain('sr-only');
		expect(el.className).toContain('extra-class');
	});

	it('forwards arbitrary props to the underlying element', () => {
		const { getByTestId } = render(
			<VisuallyHidden data-testid="vh" id="my-id">
				Hi
			</VisuallyHidden>,
		);
		const el = getByTestId('vh');
		expect(el.getAttribute('data-testid')).toBe('vh');
		expect(el.getAttribute('id')).toBe('my-id');
	});
});
