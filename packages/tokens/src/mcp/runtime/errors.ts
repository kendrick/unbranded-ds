/**
 * Structured error helper for MCP tool responses.
 *
 * Every MCP tool in this monorepo emits errors through this helper so the
 * shape stays consistent with Section XI.4 and the FR-034 pattern from
 * spec 004. The MCP protocol's error envelope (`isError: true`) carries
 * the parseable payload as the response body so clients can both flag the
 * error and pattern-match on the structured content.
 *
 * Payload shape: { component: string; issue: string; [key: string]: unknown }
 */

import type { McpToolResult } from './stdio.js';

export interface McpErrorPayload {
	component: string;
	issue: string;
	[key: string]: unknown;
}

export function mcpError(payload: McpErrorPayload): McpToolResult {
	return {
		isError: true,
		content: [
			{
				type: 'text',
				text: JSON.stringify(payload),
			},
		],
		structuredContent: payload,
	};
}

export function mcpResult(payload: Record<string, unknown>): McpToolResult {
	return {
		content: [
			{
				type: 'text',
				text: JSON.stringify(payload),
			},
		],
		structuredContent: payload,
	};
}
