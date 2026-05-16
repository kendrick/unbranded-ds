import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const SRC_PRESET = resolve(__dirname, 'preset.css');
const DIST_PRESET = resolve(__dirname, '../dist/preset.css');

const TOKENS_IMPORT = `@import '@unbranded-ds/tokens/preset.css';`;
const REACT_SOURCE = `@source "../@unbranded-ds/react";`;

function stripNoise(contents: string): string[] {
	return contents
		.split('\n')
		.map((line) => line.trim())
		.filter((line) => line.length > 0 && !line.startsWith('//') && !line.startsWith('/*'));
}

describe('react preset.css source', () => {
	it('contains exactly the two contracted directives', async () => {
		const contents = await readFile(SRC_PRESET, 'utf8');
		const lines = stripNoise(contents);

		expect(lines).toHaveLength(2);
		expect(lines).toContain(TOKENS_IMPORT);
		expect(lines).toContain(REACT_SOURCE);
	});
});

describe('react preset.css dist', () => {
	it.skipIf(!existsSync(DIST_PRESET))(
		'matches src preset.css byte-for-byte after build',
		async () => {
			const [src, dist] = await Promise.all([
				readFile(SRC_PRESET),
				readFile(DIST_PRESET),
			]);
			expect(dist.equals(src)).toBe(true);
		},
	);
});
