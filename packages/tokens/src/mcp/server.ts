#!/usr/bin/env node
/**
 * Token-query MCP server entry point.
 *
 * Spawned as a stdio subprocess by an MCP client. Registers the four
 * tools (`listThemes`, `palette`, `contrast`, `lookupToken`) and connects
 * the stdio transport. Lifecycle is the SDK's; this entry point just wires
 * the pieces together.
 */

import process from 'node:process';

import { connectStdio, createServer } from './runtime/stdio.js';
import { contrast } from './tools/contrast.js';
import { listThemes } from './tools/listThemes.js';
import { lookupToken } from './tools/lookupToken.js';
import { palette } from './tools/palette.js';

const SERVER_NAME = 'unbranded-ds-tokens-mcp';
const SERVER_VERSION = '0.3.0';

async function main(): Promise<void> {
	const server = createServer({
		name: SERVER_NAME,
		version: SERVER_VERSION,
		tools: [listThemes, palette, contrast, lookupToken],
	});
	await connectStdio(server);
}

main().catch((err: unknown) => {
	console.error('[unbranded-ds-tokens-mcp] startup error:', err);
	process.exit(1);
});
