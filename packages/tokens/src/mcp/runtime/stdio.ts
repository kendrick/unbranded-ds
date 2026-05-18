/**
 * Stdio transport harness for MCP servers in this monorepo.
 *
 * Wraps `@modelcontextprotocol/sdk`'s `McpServer` + stdio transport so each
 * MCP we ship (currently: the token-query MCP) registers tools through the
 * same shape. A future `@unbranded-ds/react` MCP imports this same function
 * with its own tool list per FR-029b.
 */

import type { ZodRawShape } from 'zod';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';

export interface McpTool<TInputShape extends ZodRawShape = ZodRawShape> {
	name: string;
	description: string;
	inputSchema: TInputShape;
	handler: (input: { [K in keyof TInputShape]: unknown }) => Promise<McpToolResult> | McpToolResult;
}

export interface McpToolResult {
	content: Array<{ type: 'text'; text: string }>;
	isError?: boolean;
	structuredContent?: Record<string, unknown>;
	[key: string]: unknown;
}

export interface CreateServerConfig {
	name: string;
	version: string;
	tools: McpTool[];
}

export function createServer(config: CreateServerConfig): McpServer {
	const server = new McpServer(
		{ name: config.name, version: config.version },
		{ capabilities: { tools: {} } },
	);

	for (const tool of config.tools) {
		server.registerTool(
			tool.name,
			{
				description: tool.description,
				inputSchema: tool.inputSchema,
			},
			async (input: unknown) => {
				const result = await tool.handler(input as { [K in keyof typeof tool.inputSchema]: unknown });
				return result;
			},
		);
	}

	return server;
}

export async function connectStdio(server: McpServer): Promise<void> {
	const transport = new StdioServerTransport();
	await server.connect(transport);
}
