import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Input } from './Input';

describe('input', () => {
	it('applies base styling classes', () => {
		const { container } = render(<Input />);
		const input = container.firstElementChild!;
		expect(input.className).toContain('border');
		expect(input.className).toContain('rounded');
	});

	it('merges consumer className', () => {
		const { container } = render(<Input className="w-64" />);
		const input = container.firstElementChild!;
		expect(input.className).toContain('w-64');
	});
});
