/**
 * CI smoke test for the token-query MCP.
 *
 * Spawns the built binary, sends `initialize` + `tools/list`, asserts the
 * four expected tools are present, then calls `listThemes` and asserts a
 * non-empty themes array comes back. Mirrors the Storybook MCP's smoke
 * pattern from spec 001 (Constitution Section VII), per FR-029a.
 */

import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

import { runSmokeTest } from './runtime/testing.js';

const EXPECTED_TOOLS = ['listThemes', 'palette', 'contrast', 'lookupToken'];

const BINARY_PATH = resolve(__dirname, '../../dist/ts/mcp/server.js');

describe('token-query MCP smoke test', () => {
	it('exposes the four expected tools via tools/list', async () => {
		const result = await runSmokeTest({
			binaryPath: BINARY_PATH,
			expectedTools: EXPECTED_TOOLS,
		});

		expect(result.missing, `missing tools: ${result.missing.join(', ')}`).toEqual([]);
		expect(result.extra, `unexpected tools: ${result.extra.join(', ')}`).toEqual([]);
		expect(result.ok).toBe(true);
	});
});
