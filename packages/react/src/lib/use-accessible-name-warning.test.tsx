import { renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useAccessibleNameWarning } from './use-accessible-name-warning';

// The behavior matrix from contracts/accessible-name-warning.md. renderHook does
// not wrap in StrictMode, so the dev double-invoke can't make "called once" flaky.
describe('useAccessibleNameWarning', () => {
	let warnSpy: ReturnType<typeof vi.spyOn>;
	const originalEnv = process.env.NODE_ENV;

	beforeEach(() => {
		warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
	});

	afterEach(() => {
		vi.restoreAllMocks();
		process.env.NODE_ENV = originalEnv;
	});

	it('warns once when neither aria-label nor aria-labelledby is set', () => {
		renderHook(() => useAccessibleNameWarning('Checkbox', {}));
		expect(warnSpy).toHaveBeenCalledTimes(1);
		expect(warnSpy).toHaveBeenCalledWith(
			'[unbranded-ds]',
			expect.objectContaining({
				component: 'Checkbox',
				issue: 'missing-accessible-name',
				remedy: expect.stringContaining('aria-label'),
			}),
		);
	});

	it('stays silent when aria-label is a non-empty string', () => {
		renderHook(() => useAccessibleNameWarning('Switch', { 'aria-label': 'Airplane mode' }));
		expect(warnSpy).not.toHaveBeenCalled();
	});

	it('stays silent when aria-labelledby is a non-empty string', () => {
		renderHook(() => useAccessibleNameWarning('Slider', { 'aria-labelledby': 'label-id' }));
		expect(warnSpy).not.toHaveBeenCalled();
	});

	it('warns when aria-label is an empty string, since empty names nothing', () => {
		renderHook(() => useAccessibleNameWarning('Checkbox', { 'aria-label': '' }));
		expect(warnSpy).toHaveBeenCalledTimes(1);
		expect(warnSpy).toHaveBeenCalledWith(
			'[unbranded-ds]',
			expect.objectContaining({ issue: 'missing-accessible-name' }),
		);
	});

	it('warns when aria-label is whitespace only', () => {
		renderHook(() => useAccessibleNameWarning('Checkbox', { 'aria-label': '   ' }));
		expect(warnSpy).toHaveBeenCalledTimes(1);
	});

	it('reports the calling component in the payload', () => {
		renderHook(() => useAccessibleNameWarning('Switch', {}));
		expect(warnSpy).toHaveBeenCalledWith(
			'[unbranded-ds]',
			expect.objectContaining({ component: 'Switch' }),
		);
	});

	it('stays silent in a production build, even with no name', () => {
		process.env.NODE_ENV = 'production';
		renderHook(() => useAccessibleNameWarning('Checkbox', {}));
		expect(warnSpy).not.toHaveBeenCalled();
	});
});
