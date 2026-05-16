import { createHash } from 'node:crypto';
import { runInThisContext } from 'node:vm';
// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getThemeBootstrapScript, themeBootstrapScript } from './runtime.js';

describe('getThemeBootstrapScript', () => {
	it('returns a string containing the canonical storage key and the default \'light\' fallback', () => {
		const script = getThemeBootstrapScript();
		expect(typeof script).toBe('string');
		expect(script).toContain('unbranded-ds-theme');
		expect(script).toContain('\'light\'');
	});

	it('uses a caller-supplied defaultTheme as the fallback and omits \'light\'', () => {
		const script = getThemeBootstrapScript({ defaultTheme: 'dark' });
		expect(typeof script).toBe('string');
		expect(script).toContain('||\'dark\'');
		expect(script).not.toContain('\'light\'');
	});

	it('returns byte-identical strings (and matching SHA-256 hashes) across consecutive calls', () => {
		const a = getThemeBootstrapScript({ defaultTheme: 'dark' });
		const b = getThemeBootstrapScript({ defaultTheme: 'dark' });
		expect(a).toBe(b);

		const hashA = createHash('sha256').update(a).digest('hex');
		const hashB = createHash('sha256').update(b).digest('hex');
		expect(hashA).toBe(hashB);
	});

	describe('when executed in jsdom', () => {
		beforeEach(() => {
			document.documentElement.removeAttribute('data-theme');
			vi.restoreAllMocks();
		});

		it('sets data-theme from a stored localStorage value', () => {
			vi.spyOn(Storage.prototype, 'getItem').mockReturnValue('dark');
			const script = getThemeBootstrapScript();
			runInThisContext(script);
			expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
		});

		it('falls back to the default theme when localStorage returns null', () => {
			vi.spyOn(Storage.prototype, 'getItem').mockReturnValue(null);
			const script = getThemeBootstrapScript();
			runInThisContext(script);
			expect(document.documentElement.getAttribute('data-theme')).toBe('light');
		});
	});

	it('themeBootstrapScript constant equals getThemeBootstrapScript() with no args', () => {
		expect(themeBootstrapScript).toBe(getThemeBootstrapScript());
	});
});
