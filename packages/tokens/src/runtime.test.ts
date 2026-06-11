import { createHash } from 'node:crypto';
import { runInThisContext } from 'node:vm';
// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
	getThemeBootstrapScript,
	registerTheme,
	themeBootstrapScript,
	ThemeValidationError,
} from './runtime.js';

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

describe('registerTheme (resolve-then-inject, spec 008 US2)', () => {
	beforeEach(() => {
		// jsdom carries DOM state across tests; clear injected style blocks.
		document.head.innerHTML = '';
	});

	function injectedCss(themeName: string): string {
		const style = document.getElementById(`ds-theme-${themeName}`);
		return style?.textContent ?? '';
	}

	// A self-consistent AA-passing color block. The canonical DEFAULT colors
	// (from themes/light.json) sit a hair under 4.5:1 on the muted and
	// destructive pairs, so a partial theme that INHERITS them would now fail the
	// (correctly un-skipped) contrast gate. These tests are about merge/injection
	// mechanics, not the defaults' contrast, so they supply a passing color set
	// and let the NON-color categories demonstrate inheritance.
	const passingColors = {
		'background': '#f8f9fa',
		'foreground': '#212529',
		'primary': '#0d6efd',
		'primary-foreground': '#ffffff',
		'muted': '#e9ecef',
		'muted-foreground': '#495057',
		'border': '#dee2e6',
		'ring': '#0d6efd',
		'destructive': '#dc3545',
		'destructive-foreground': '#ffffff',
	};

	// T012a — a PARTIAL override must inject the FULL merged var set, not just the
	// keys it touched. This is what proves registerTheme iterates the RESOLVED
	// theme (validateTheme's merged return) rather than the raw input. The theme
	// touches only color + radius; every other category is inherited and must
	// still appear in the injected <style>.
	it('injects a complete <style> block for a partial theme (inherited categories appear)', () => {
		registerTheme({
			name: 'partial-runtime',
			displayName: 'Partial Runtime',
			tokens: {
				color: passingColors,
				radius: { md: '1rem' },
			},
		});
		const css = injectedCss('partial-runtime');

		// The overridden keys are present...
		expect(css).toContain('--color-primary:');
		expect(css).toContain('--radius-md: 1rem;');
		// ...and so are vars from categories the partial never mentioned.
		expect(css).toContain('--spacing-4:');
		expect(css).toContain('--typography-font-serif:');
		expect(css).toContain('--ease-standard:');
	});

	// T010 — motion's flat keys must emit Tailwind-aligned var names so a runtime
	// override actually lands on the same vars the build emits (--duration-*,
	// --ease-*), never --motion-*.
	it('emits Tailwind-aligned motion var names (--duration-*/--ease-*, not --motion-*)', () => {
		registerTheme({
			name: 'motion-runtime',
			displayName: 'Motion Runtime',
			tokens: {
				color: passingColors,
				motion: { 'duration-fast': '90ms' },
			},
		});
		const css = injectedCss('motion-runtime');

		expect(css).toContain('--duration-fast: 90ms;');
		expect(css).toContain('--ease-standard:');
		expect(css).not.toContain('--motion-');
	});

	it('accepts a full legacy theme unchanged (no regression)', () => {
		registerTheme({
			name: 'full-runtime',
			displayName: 'Full Runtime',
			tokens: {
				color: {
					'background': '#f8f9fa',
					'foreground': '#212529',
					'primary': '#0d6efd',
					'primary-foreground': '#ffffff',
					'muted': '#e9ecef',
					'muted-foreground': '#495057',
					'border': '#dee2e6',
					'ring': '#0d6efd',
					'destructive': '#dc3545',
					'destructive-foreground': '#ffffff',
				},
			},
		});
		expect(injectedCss('full-runtime')).toContain('--color-background:');
	});

	// The post-oklch-conversion contrast pass must fail an INHERITED pair too: a
	// theme overriding only the background is checked against the inherited
	// foreground after both convert to oklch. The old skip silently passed it.
	it('throws when an inherited contrast pair fails after oklch conversion', () => {
		expect(() =>
			registerTheme({
				name: 'inherited-fail-runtime',
				displayName: 'Inherited Fail Runtime',
				tokens: { color: { background: '#1a1a1a' } },
			}),
		).toThrow(ThemeValidationError);
	});
});
