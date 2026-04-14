#!/usr/bin/env tsx
/**
 * MCP smoke test — sends JSON-RPC calls to a Storybook MCP endpoint
 * and verifies the expected tool set is available.
 *
 * Usage:
 *   tsx scripts/mcp-smoke-test.ts [endpoint-url]
 *
 * Defaults to http://localhost:6006/mcp if no URL provided.
 * Exits 0 on success, non-zero on failure.
 */

// Tools available on any MCP endpoint (dev or published).
// Published Storybook is a static build and doesn't expose interactive
// tools like run-story-tests or preview-stories — those need a live runtime.
const REQUIRED_TOOLS = [
	"list-all-documentation",
	"get-documentation",
	"get-documentation-for-story",
];

const DEFAULT_ENDPOINT = "http://localhost:6006/mcp";

type JsonRpcResponse = {
	jsonrpc: string;
	id: number;
	result?: unknown;
	error?: { code: number; message: string };
};

async function callMcp(
	endpoint: string,
	method: string,
	id: number,
	params?: unknown,
): Promise<JsonRpcResponse> {
	const body = { jsonrpc: "2.0", id, method, ...(params ? { params } : {}) };

	const response = await fetch(endpoint, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Accept: "application/json, text/event-stream",
		},
		body: JSON.stringify(body),
	});

	if (!response.ok) {
		throw new Error(`HTTP ${response.status}: ${await response.text()}`);
	}

	const text = await response.text();
	// Strip SSE framing if present (event: message\ndata: {...})
	const jsonLine = text
		.split("\n")
		.map((l) => l.trim())
		.find((l) => l.startsWith("data:") || l.startsWith("{"));

	if (!jsonLine) {
		throw new Error(`No JSON response body: ${text}`);
	}

	const json = jsonLine.startsWith("data:")
		? jsonLine.slice(5).trim()
		: jsonLine;

	return JSON.parse(json) as JsonRpcResponse;
}

async function main() {
	// Normalize: collapse repeated slashes after the protocol so both
	// `https://host/` + `/mcp` (yielding `//mcp`) and `https://host` + `mcp`
	// resolve to the same URL.
	const rawEndpoint = process.argv[2] ?? DEFAULT_ENDPOINT;
	const endpoint = rawEndpoint.replace(/([^:])\/{2,}/g, "$1/");
	let failed = false;

	console.log(`MCP smoke test against ${endpoint}\n`);

	// 1. Initialize handshake
	console.log("→ initialize");
	try {
		const init = await callMcp(endpoint, "initialize", 1, {
			protocolVersion: "2024-11-05",
			capabilities: {},
			clientInfo: { name: "mcp-smoke-test", version: "0.1" },
		});
		if (init.error) {
			console.error(`  ✗ initialize failed: ${init.error.message}`);
			failed = true;
		} else {
			const result = init.result as { serverInfo?: { name?: string } };
			console.log(`  ✓ connected to ${result.serverInfo?.name ?? "server"}`);
		}
	} catch (err) {
		console.error(`  ✗ initialize threw: ${(err as Error).message}`);
		process.exit(1);
	}

	// 2. List tools and verify required set is present
	console.log("\n→ tools/list");
	try {
		const toolsResp = await callMcp(endpoint, "tools/list", 2);
		if (toolsResp.error) {
			console.error(`  ✗ tools/list failed: ${toolsResp.error.message}`);
			process.exit(1);
		}

		const tools =
			(toolsResp.result as { tools?: Array<{ name: string }> }).tools ?? [];
		const toolNames = tools.map((t) => t.name);
		console.log(`  ✓ ${tools.length} tools returned`);

		for (const required of REQUIRED_TOOLS) {
			if (toolNames.includes(required)) {
				console.log(`  ✓ ${required}`);
			} else {
				console.error(`  ✗ missing required tool: ${required}`);
				failed = true;
			}
		}
	} catch (err) {
		console.error(`  ✗ tools/list threw: ${(err as Error).message}`);
		process.exit(1);
	}

	// 3. Verify documentation listing returns our components
	console.log("\n→ list-all-documentation");
	try {
		const docsResp = await callMcp(endpoint, "tools/call", 3, {
			name: "list-all-documentation",
			arguments: {},
		});
		if (docsResp.error) {
			console.error(`  ✗ list-all-documentation failed: ${docsResp.error.message}`);
			failed = true;
		} else {
			const result = docsResp.result as {
				content?: Array<{ text?: string }>;
			};
			const text = result.content?.[0]?.text ?? "";
			const expectedComponents = [
				"Button",
				"Input",
				"Label",
				"Card",
				"Dialog",
				"Select",
				"Checkbox",
				"Switch",
				"Tabs",
			];
			const found = expectedComponents.filter((c) => text.includes(c));
			console.log(`  ✓ ${found.length}/${expectedComponents.length} expected components present`);
			if (found.length < expectedComponents.length) {
				const missing = expectedComponents.filter((c) => !found.includes(c));
				console.error(`  ✗ missing: ${missing.join(", ")}`);
				failed = true;
			}
		}
	} catch (err) {
		console.error(`  ✗ list-all-documentation threw: ${(err as Error).message}`);
		failed = true;
	}

	console.log();
	if (failed) {
		console.error("✗ smoke test FAILED");
		process.exit(1);
	}
	console.log("✓ smoke test passed");
}

main().catch((err) => {
	console.error(`Unexpected error: ${(err as Error).message}`);
	process.exit(1);
});
