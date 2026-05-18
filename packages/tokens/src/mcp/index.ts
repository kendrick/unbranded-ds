/**
 * Token-query MCP — public re-exports.
 *
 * A future `@unbranded-ds/react` MCP (or any other local stdio MCP in this
 * monorepo) imports the runtime primitives from here to avoid re-implementing
 * the stdio transport, error envelope, or testing scaffolding (FR-029b).
 */

export { mcpError, mcpResult } from './runtime/errors.js';
export type { McpErrorPayload } from './runtime/errors.js';
export { connectStdio, createServer } from './runtime/stdio.js';
export type { CreateServerConfig, McpTool, McpToolResult } from './runtime/stdio.js';
export { callToolDirectly, runSmokeTest } from './runtime/testing.js';
export type { SmokeTestConfig, SmokeTestResult } from './runtime/testing.js';
