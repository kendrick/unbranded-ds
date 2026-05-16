import { describe, expect, it } from 'vitest';
import badContrast from './__fixtures__/bad-contrast.json';
import extraTokens from './__fixtures__/extra-tokens.json';
import missingToken from './__fixtures__/missing-token.json';
import validCustom from './__fixtures__/valid-custom.json';
import { validateTheme } from './validate';

describe('validateTheme', () => {
	it('accepts a valid theme with hex colors', () => {
		const result = validateTheme(validCustom);
		expect(result.ok).toBe(true);
	});

	it('accepts a valid theme with oklch colors', () => {
		const oklchTheme = {
			...validCustom,
			name: 'oklch-test',
			tokens: {
				...validCustom.tokens,
				color: {
					'background': 'oklch(1.0000 0.0000 0)',
					'foreground': 'oklch(0.1400 0.0000 0)',
					'primary': 'oklch(0.2100 0.0000 0)',
					'primary-foreground': 'oklch(0.9800 0.0000 0)',
					'muted': 'oklch(0.9500 0.0000 0)',
					'muted-foreground': 'oklch(0.4500 0.0000 0)',
					'border': 'oklch(0.9000 0.0000 0)',
					'ring': 'oklch(0.2100 0.0000 0)',
					'destructive': 'oklch(0.5000 0.2000 25.00)',
					'destructive-foreground': 'oklch(1.0000 0.0000 0)',
				},
			},
		};
		const result = validateTheme(oklchTheme);
		expect(result.ok).toBe(true);
	});

	it('rejects theme with missing tokens and returns MISSING_TOKEN issues', () => {
		const result = validateTheme(missingToken);
		expect(result.ok).toBe(false);
		if (!result.ok) {
			const codes = result.issues.map((i) => i.code);
			expect(codes).toContain('MISSING_TOKEN');
			const paths = result.issues.map((i) => i.path);
			expect(paths.some((p) => p.includes('primary'))).toBe(true);
		}
	});

	it('rejects theme with bad contrast and returns CONTRAST_FAILURE issues', () => {
		const result = validateTheme(badContrast);
		expect(result.ok).toBe(false);
		if (!result.ok) {
			const contrastIssues = result.issues.filter(
				(i) => i.code === 'CONTRAST_FAILURE',
			);
			expect(contrastIssues.length).toBeGreaterThan(0);
			for (const issue of contrastIssues) {
				expect(issue.ratio).toBeDefined();
				expect(issue.threshold).toBeDefined();
				expect(issue.ratio!).toBeLessThan(issue.threshold!);
			}
		}
	});

	it('accepts theme with extra tokens (forward-compatible)', () => {
		const result = validateTheme(extraTokens);
		expect(result.ok).toBe(true);
	});

	it('rejects completely malformed input', () => {
		const result = validateTheme({ foo: 'bar' });
		expect(result.ok).toBe(false);
	});

	it('rejects null input', () => {
		const result = validateTheme(null);
		expect(result.ok).toBe(false);
	});
});
