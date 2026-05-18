/**
 * Test helpers for MCP servers in this monorepo.
 *
 * `callToolDirectly` lets unit tests invoke a tool's handler in-process
 * without spawning the stdio subprocess. The stdio plumbing is irrelevant
 * to per-tool logic and adds latency + brittleness; tests target the
 * handler function directly.
 *
 * `runSmokeTest` is the CI helper that DOES spawn the built binary,
 * sends `tools/list`, and asserts the response. It's the single place
 * the subprocess lifecycle lives.
 */

import type { Buffer } from 'node:buffer';

import type { McpTool, McpToolResult } from './stdio.js';
import { spawn } from 'node:child_process';
import process from 'node:process';

export async function callToolDirectly<TInputShape extends Record<string, unknown>>(
	tool: McpTool,
	input: TInputShape,
): Promise<McpToolResult> {
	const result = await tool.handler(input as never);
	return result;
}

export interface SmokeTestConfig {
	binaryPath: string;
	expectedTools: string[];
	timeoutMs?: number;
}

export interface SmokeTestResult {
	ok: boolean;
	toolsFound: string[];
	missing: string[];
	extra: string[];
}

export async function runSmokeTest(config: SmokeTestConfig): Promise<SmokeTestResult> {
	const timeout = config.timeoutMs ?? 10_000;

	const child = spawn(process.execPath, [config.binaryPath], {
		stdio: ['pipe', 'pipe', 'pipe'],
	});

	const responsePromise = new Promise<unknown>((resolveResponse, rejectResponse) => {
		const timer = setTimeout(() => {
			child.kill();
			rejectResponse(new Error(`Smoke test timed out after ${timeout}ms`));
		}, timeout);

		let buffer = '';
		child.stdout.on('data', (chunk: Buffer) => {
			buffer += chunk.toString('utf-8');
			const lines = buffer.split('\n');
			buffer = lines.pop() ?? '';
			for (const line of lines) {
				if (!line.trim())
					continue;
				try {
					const message = JSON.parse(line);
					if (message.id === 1 && message.result) {
						clearTimeout(timer);
						resolveResponse(message.result);
					}
				}
				catch {
					// Non-JSON line; ignore.
				}
			}
		});

		child.on('error', (err) => {
			clearTimeout(timer);
			rejectResponse(err);
		});
	});

	// Initialize then list tools.
	const initRequest = {
		jsonrpc: '2.0',
		id: 0,
		method: 'initialize',
		params: {
			protocolVersion: '2024-11-05',
			capabilities: {},
			clientInfo: { name: 'smoke-test', version: '0.0.0' },
		},
	};
	const listRequest = {
		jsonrpc: '2.0',
		id: 1,
		method: 'tools/list',
		params: {},
	};

	child.stdin.write(`${JSON.stringify(initRequest)}\n`);
	child.stdin.write(`${JSON.stringify(listRequest)}\n`);

	try {
		const result = await responsePromise;
		const tools = (result as { tools: Array<{ name: string }> }).tools ?? [];
		const toolsFound = tools.map((t) => t.name);
		const missing = config.expectedTools.filter((name) => !toolsFound.includes(name));
		const extra = toolsFound.filter((name) => !config.expectedTools.includes(name));

		return {
			ok: missing.length === 0 && extra.length === 0,
			toolsFound,
			missing,
			extra,
		};
	}
	finally {
		child.kill();
	}
}
