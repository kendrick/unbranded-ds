import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { warn } from './warn';

describe('warn', () => {
	beforeEach(() => {
		vi.spyOn(console, 'warn').mockImplementation(() => {});
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	it('emits via console.warn with the [unbranded-ds] prefix', () => {
		warn({ component: 'Slider', issue: 'value-out-of-range' });
		expect(console.warn).toHaveBeenCalledWith(
			'[unbranded-ds]',
			expect.objectContaining({
				component: 'Slider',
				issue: 'value-out-of-range',
			}),
		);
	});

	it('passes through additional payload fields verbatim', () => {
		warn({
			component: 'Slider',
			issue: 'value-out-of-range',
			prop: 'value',
			got: 150,
			clamped: 100,
		});
		expect(console.warn).toHaveBeenCalledWith('[unbranded-ds]', {
			component: 'Slider',
			issue: 'value-out-of-range',
			prop: 'value',
			got: 150,
			clamped: 100,
		});
	});

	it('treats the payload as a plain object — no transformation', () => {
		const payload = { component: 'SegmentedControl', issue: 'no-items' };
		warn(payload);
		const callArgs = vi.mocked(console.warn).mock.calls[0];
		expect(callArgs?.[1]).toBe(payload);
	});
});
