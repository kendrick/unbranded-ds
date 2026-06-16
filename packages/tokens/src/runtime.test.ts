import { createHash } from 'node:crypto';
import { runInThisContext } from 'node:vm';
// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { hexToOklch } from './color.js';
import { resolveTheme } from './resolve.js';
import {
	getThemeBootstrapScript,
	registerTheme,
	themeBootstrapScript,
	ThemeValidationError,
} from './runtime.js';

const AXIS_ATTRS = ['data-color-scheme', 'data-theme', 'data-density'];

describe('getThemeBootstrapScript', () => {
	it('contains all three storage keys and the light/default/comfortable fallbacks', () => {
		const script = getThemeBootstrapScript();
		expect(typeof script).toBe('string');
		expect(script).toContain('unbranded-ds-color-scheme');
		expect(script).toContain('unbranded-ds-theme');
		expect(script).toContain('unbranded-ds-density');
		expect(script).toContain('\'light\''); // color-scheme default
		expect(script).toContain('\'default\''); // theme/identity default
		expect(script).toContain('\'comfortable\''); // density default
	});

	it('uses caller-supplied per-axis defaults as the fallbacks', () => {
		const script = getThemeBootstrapScript({
			defaultColorScheme: 'dark',
			defaultTheme: 'brand',
			defaultDensity: 'compact',
		});
		expect(script).toContain('||\'dark\'');
		expect(script).toContain('||\'brand\'');
		expect(script).toContain('||\'compact\'');
	});

	it('returns byte-identical strings (and matching SHA-256 hashes) across consecutive calls', () => {
		const a = getThemeBootstrapScript({ defaultColorScheme: 'dark' });
		const b = getThemeBootstrapScript({ defaultColorScheme: 'dark' });
		expect(a).toBe(b);

		const hashA = createHash('sha256').update(a).digest('hex');
		const hashB = createHash('sha256').update(b).digest('hex');
		expect(hashA).toBe(hashB);
	});

	describe('when executed in jsdom', () => {
		beforeEach(() => {
			for (const a of AXIS_ATTRS)
				document.documentElement.removeAttribute(a);
			vi.restoreAllMocks();
		});

		it('sets all three attributes from stored localStorage values', () => {
			vi.spyOn(Storage.prototype, 'getItem').mockImplementation((key) => {
				if (key === 'unbranded-ds-color-scheme')
					return 'dark';
				if (key === 'unbranded-ds-theme')
					return 'brand';
				if (key === 'unbranded-ds-density')
					return 'compact';
				return null;
			});
			runInThisContext(getThemeBootstrapScript());
			expect(document.documentElement.getAttribute('data-color-scheme')).toBe('dark');
			expect(document.documentElement.getAttribute('data-theme')).toBe('brand');
			expect(document.documentElement.getAttribute('data-density')).toBe('compact');
		});

		it('falls back to the per-axis defaults when localStorage returns null', () => {
			vi.spyOn(Storage.prototype, 'getItem').mockReturnValue(null);
			runInThisContext(getThemeBootstrapScript());
			expect(document.documentElement.getAttribute('data-color-scheme')).toBe('light');
			expect(document.documentElement.getAttribute('data-theme')).toBe('default');
			expect(document.documentElement.getAttribute('data-density')).toBe('comfortable');
		});
	});

	it('themeBootstrapScript constant equals getThemeBootstrapScript() with no args', () => {
		expect(themeBootstrapScript).toBe(getThemeBootstrapScript());
	});

	// Spec 016 FR-006: first paint must set ALL THREE axes so a composed selection
	// doesn't flash one attribute in before the others resolve. The color-scheme key
	// holds a concrete value (never `system`), so the bootstrap never touches
	// matchMedia — the flash-free invariant.
	it('sets all three attributes and never reads matchMedia', () => {
		const script = getThemeBootstrapScript();
		for (const a of AXIS_ATTRS)
			expect(script).toContain(a);
		expect(script).toContain('unbranded-ds-color-scheme');
		expect(script).toContain('unbranded-ds-theme');
		expect(script).toContain('unbranded-ds-density');
		expect(script).not.toContain('matchMedia');
	});

	it('resolves each axis independently from its own key', () => {
		for (const a of AXIS_ATTRS)
			document.documentElement.removeAttribute(a);
		vi.spyOn(Storage.prototype, 'getItem').mockImplementation((key) =>
			key === 'unbranded-ds-density' ? 'compact' : null,
		);
		runInThisContext(getThemeBootstrapScript());
		expect(document.documentElement.getAttribute('data-density')).toBe('compact');
		// the other two had no stored value, so they took their defaults — the axes
		// are resolved independently.
		expect(document.documentElement.getAttribute('data-color-scheme')).toBe('light');
		expect(document.documentElement.getAttribute('data-theme')).toBe('default');
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
	// (the light base) sit a hair under 4.5:1 on the muted and destructive pairs,
	// so a partial theme that INHERITS them would now fail the (correctly
	// un-skipped) contrast gate. These tests are about merge/injection mechanics,
	// not the defaults' contrast, so they supply a passing color set and let the
	// NON-color categories demonstrate inheritance.
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

	// Spec 009 FR-001: a theme registered under the density axis keys its <style>
	// on [data-density="<name>"], not [data-theme]. The id is axis-qualified
	// (ds-density-<name>) so it can coexist with a theme block of the same name.
	it('emits a [data-density] selector when registered under the density axis', () => {
		registerTheme(
			{
				name: 'compact-runtime',
				displayName: 'Compact Runtime',
				tokens: { color: passingColors, spacing: { 4: '0.75rem' } },
			},
			'density',
		);
		const style = document.getElementById('ds-density-compact-runtime');
		expect(style).not.toBeNull();
		expect(style?.textContent).toContain('[data-density="compact-runtime"]');
		expect(style?.textContent).not.toContain('[data-theme=');
		expect(style?.textContent).toContain('--spacing-4: 0.75rem;');
	});

	// FR-005: the default (theme/identity) path is unchanged — still [data-theme]
	// under the historical ds-theme-<name> id, even though id derivation now runs
	// through the axis attribute.
	it('keeps the [data-theme] selector and historical id for the default axis', () => {
		registerTheme({
			name: 'default-axis-runtime',
			displayName: 'Default Axis Runtime',
			tokens: { color: passingColors },
		});
		const style = document.getElementById('ds-theme-default-axis-runtime');
		expect(style).not.toBeNull();
		expect(style?.textContent).toContain('[data-theme="default-axis-runtime"]');
	});

	// The resolution-parity oracle (spec 009): each emitted block's vars must equal
	// resolveTheme(partial). Non-color categories pass through verbatim; colors are
	// the same value run through hexToOklch. Asserting an INHERITED var (spacing,
	// untouched by the partial) proves the block carries the full merged set, not
	// just the override.
	it('injects vars equal to resolveTheme(partial) (incl. an inherited one)', () => {
		const partial = {
			color: passingColors,
			radius: { md: '1rem' },
		};
		registerTheme({
			name: 'parity-runtime',
			displayName: 'Parity Runtime',
			tokens: partial,
		});
		const css = injectedCss('parity-runtime');
		// resolveTheme returns the strict tokens shape, so radius/spacing/color are
		// required props — index them directly rather than through a Record cast
		// (the package's noUncheckedIndexedAccess would make a cast possibly-undefined).
		const resolved = resolveTheme(partial);

		// Overridden non-color var — verbatim from the resolver.
		expect(css).toContain(`--radius-md: ${resolved.radius.md};`);
		// Inherited non-color var — present and equal to the resolved default.
		expect(css).toContain(`--spacing-4: ${resolved.spacing[4]};`);
		// Color var — the resolved value passed through hexToOklch.
		expect(css).toContain(`--color-primary: ${hexToOklch(resolved.color.primary)};`);
	});
});
