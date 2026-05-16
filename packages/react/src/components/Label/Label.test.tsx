import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Label } from './Label';

describe('label', () => {
	it('applies shadcn styling classes', () => {
		const { container } = render(<Label>Name</Label>);
		const label = container.firstElementChild!;
		expect(label.className).toContain('font-medium');
		expect(label.className).toContain('text-sm');
	});
});
