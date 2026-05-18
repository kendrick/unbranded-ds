import { describe, expect, it } from 'vitest';

import { mcpError, mcpResult } from './errors.js';

describe('mcpError', () => {
	it('wraps a structured payload with isError + parseable content', () => {
		const result = mcpError({ component: 'tokens-mcp', issue: 'unknown-theme', got: 'nope' });
		expect(result.isError).toBe(true);
		expect(result.structuredContent).toEqual({
			component: 'tokens-mcp',
			issue: 'unknown-theme',
			got: 'nope',
		});
		expect(result.content).toHaveLength(1);
		expect(result.content[0]?.type).toBe('text');
		expect(JSON.parse(result.content[0]!.text)).toEqual(result.structuredContent);
	});

	it('preserves additional context fields verbatim', () => {
		const payload = {
			component: 'tokens-mcp',
			issue: 'value-out-of-range',
			prop: 'value',
			got: 150,
			clamped: 100,
		};
		const result = mcpError(payload);
		expect(result.structuredContent).toEqual(payload);
	});
});

describe('mcpResult', () => {
	it('wraps a success payload with structured content', () => {
		const payload = { themes: ['light', 'dark'] };
		const result = mcpResult(payload);
		expect(result.isError).toBeUndefined();
		expect(result.structuredContent).toEqual(payload);
		expect(JSON.parse(result.content[0]!.text)).toEqual(payload);
	});
});
