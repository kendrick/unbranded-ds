#!/usr/bin/env tsx
/**
 * Validates sidecar and TSDoc code examples compile.
 *
 * Walks `packages/react/src/components/**\/*.usage.md`, extracts code
 * blocks tagged `tsx`, smart-wraps each so JSX is in proper context, then
 * runs `tsc --noEmit` against the lot. Also extracts `@example` code
 * blocks from TSDoc comments in component `.tsx` source files and compiles
 * those through the same pipeline.
 *
 * Authors write blocks two ways and the validator handles both:
 *   1. Pure imports or statements ("import { X } from 'y';").
 *   2. JSX usage that may include imports above.
 *
 * The validator detects which shape a block is and wraps accordingly.
 *
 * See spec 005 FR-017a and contracts/sidecar-shape.md for the rule.
 */

import { spawnSync } from 'node:child_process';
import { mkdtemp, readdir, readFile, rm, writeFile } from 'node:fs/promises';
import { dirname, join, relative, resolve } from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

interface CodeBlock {
	file: string;
	line: number;
	code: string;
}

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(SCRIPT_DIR, '..');
const REACT_PKG_ROOT = resolve(REPO_ROOT, 'packages/react');
const COMPONENTS_ROOT = resolve(REACT_PKG_ROOT, 'src/components');
const HOOKS_ROOT = resolve(REACT_PKG_ROOT, 'src/hooks');

async function findUsageFiles(root: string): Promise<string[]> {
	const found: string[] = [];

	async function walk(dir: string): Promise<void> {
		const entries = await readdir(dir, { withFileTypes: true });
		for (const entry of entries) {
			if (entry.name.startsWith('.') || entry.name === 'node_modules' || entry.name === 'dist') {
				continue;
			}
			const full = join(dir, entry.name);
			if (entry.isDirectory()) {
				await walk(full);
			} else if (entry.name.endsWith('.usage.md')) {
				found.push(full);
			}
		}
	}

	try {
		await walk(root);
	} catch (err) {
		if ((err as NodeJS.ErrnoException).code === 'ENOENT') {
			return [];
		}
		throw err;
	}
	return found;
}

function extractTsxBlocks(content: string, file: string): CodeBlock[] {
	const blocks: CodeBlock[] = [];
	const lines = content.split('\n');
	let inBlock = false;
	let blockStartLine = 0;
	let currentBlock: string[] = [];

	for (let i = 0; i < lines.length; i++) {
		const line = lines[i]!;
		if (!inBlock && line.trim() === '```tsx') {
			inBlock = true;
			blockStartLine = i + 2;
			currentBlock = [];
		} else if (inBlock && line.trim() === '```') {
			blocks.push({ file, line: blockStartLine, code: currentBlock.join('\n') });
			inBlock = false;
		} else if (inBlock) {
			currentBlock.push(line);
		}
	}

	return blocks;
}

/**
 * Excluded filename patterns for TSDoc source scanning. Stories, tests, and
 * the SSR smoke-test file aren't authored API surfaces, so their comments
 * aren't part of the public contract we want to compile-check.
 */
function isExcludedTsxFile(name: string): boolean {
	return (
		name.endsWith('.stories.tsx') ||
		name.endsWith('.test.tsx') ||
		name.startsWith('__ssr__')
	);
}

async function findTsxSourceFiles(root: string): Promise<string[]> {
	const found: string[] = [];

	async function walk(dir: string): Promise<void> {
		const entries = await readdir(dir, { withFileTypes: true });
		for (const entry of entries) {
			if (entry.name.startsWith('.') || entry.name === 'node_modules' || entry.name === 'dist') {
				continue;
			}
			const full = join(dir, entry.name);
			if (entry.isDirectory()) {
				await walk(full);
			} else if (entry.name.endsWith('.tsx') && !isExcludedTsxFile(entry.name)) {
				found.push(full);
			}
		}
	}

	try {
		await walk(root);
	} catch (err) {
		if ((err as NodeJS.ErrnoException).code === 'ENOENT') {
			return [];
		}
		throw err;
	}
	return found;
}

/**
 * Tags that end an `@example` section inside a TSDoc comment. When the
 * parser hits one of these it knows the current example is finished.
 */
const TSDOC_SECTION_TAGS = new Set([
	'@example',
	'@see',
	'@remarks',
	'@param',
	'@returns',
	'@defaultValue',
	'@deprecated',
	'@throws',
	'@public',
	'@internal',
	'@readonly',
	'@override',
	'@sealed',
	'@virtual',
	'@typeParam',
]);

function extractTsDocExamples(content: string, file: string): CodeBlock[] {
	const blocks: CodeBlock[] = [];
	const lines = content.split('\n');

	// Walk through the file looking for TSDoc comment blocks (/** ... */)
	let inComment = false;
	let inExample = false;
	let inCodeFence = false;
	let currentBlock: string[] = [];
	let blockStartLine = 0;

	for (let i = 0; i < lines.length; i++) {
		const raw = lines[i]!;
		const trimmed = raw.trim();

		// Detect comment open — could share a line with content after `/**`
		if (!inComment && trimmed.startsWith('/**')) {
			inComment = true;
			// If the comment also closes on the same line, skip it entirely
			if (trimmed.endsWith('*/') && trimmed !== '/**') {
				inComment = false;
				continue;
			}
			continue;
		}

		if (!inComment) continue;

		// Detect comment close
		if (trimmed === '*/' || trimmed.endsWith('*/')) {
			// If we were inside a code fence that was never closed, discard it
			if (inCodeFence) {
				inCodeFence = false;
				currentBlock = [];
			}
			inComment = false;
			inExample = false;
			continue;
		}

		// Strip the leading ` * ` (or ` *` with no trailing space) from the line
		const stripped = raw.replace(/^\s*\*\s?/, '');

		// Check for @-tags that start or end an example section
		const tagMatch = stripped.match(/^@(\w+)/);
		if (tagMatch && TSDOC_SECTION_TAGS.has(tagMatch[0])) {
			// If we were inside a code fence, flush it (shouldn't happen in
			// well-formed comments, but handle gracefully)
			if (inCodeFence) {
				blocks.push({ file, line: blockStartLine, code: currentBlock.join('\n') });
				inCodeFence = false;
				currentBlock = [];
			}
			inExample = tagMatch[0] === '@example';
			continue;
		}

		if (!inExample) continue;

		// Inside an @example section — look for tsx code fences
		if (!inCodeFence && stripped.trim() === '```tsx') {
			inCodeFence = true;
			blockStartLine = i + 2; // 1-indexed, next line
			currentBlock = [];
		} else if (inCodeFence && stripped.trim() === '```') {
			blocks.push({ file, line: blockStartLine, code: currentBlock.join('\n') });
			inCodeFence = false;
			currentBlock = [];
		} else if (inCodeFence) {
			currentBlock.push(stripped);
		}
	}

	return blocks;
}

function wrapBlock(block: CodeBlock): string {
	const { code, file, line } = block;
	const header = `// Source: ${relative(REPO_ROOT, file)}:${line}\n`;

	const alreadyExportsFunction = /^export\s+(?:function|default|const)/m.test(code);
	if (alreadyExportsFunction) {
		const reactImport = code.includes('react') ? '' : "import * as React from 'react';\n";
		return `${header}${reactImport}${code}\n`;
	}

	const lines = code.split('\n');
	const imports: string[] = [];
	const body: string[] = [];
	let pastImports = false;
	for (const raw of lines) {
		if (!pastImports && (raw.startsWith('import ') || raw.trim() === '')) {
			imports.push(raw);
		} else {
			pastImports = true;
			body.push(raw);
		}
	}

	const bodyText = body.join('\n').trim();
	const hasJsx = /<[A-Z][\w.]*[\s/>]/.test(bodyText) || /<\/[A-Z]/.test(bodyText);

	if (!hasJsx) {
		// Pure imports or statements; make it a module so tsc treats it as one.
		return `${header}${code}\nexport {};\n`;
	}

	const reactImport = imports.some((i) => i.includes('react'))
		? ''
		: "import * as React from 'react';";
	const importBlock = [reactImport, ...imports].filter(Boolean).join('\n');
	return `${header}${importBlock}\n\nexport function _Example() {\n  return (\n    <>\n${body.map((l) => `      ${l}`).join('\n')}\n    </>\n  );\n}\n`;
}

async function main(): Promise<void> {
	// --- Sidecar blocks ---
	const sidecarFiles = [
		...(await findUsageFiles(COMPONENTS_ROOT)),
		...(await findUsageFiles(HOOKS_ROOT)),
	];
	const sidecarBlocks: CodeBlock[] = [];
	for (const file of sidecarFiles) {
		const content = await readFile(file, 'utf-8');
		sidecarBlocks.push(...extractTsxBlocks(content, file));
	}

	// --- TSDoc @example blocks ---
	const tsxSourceFiles = [
		...(await findTsxSourceFiles(COMPONENTS_ROOT)),
		...(await findTsxSourceFiles(HOOKS_ROOT)),
	];
	const tsdocBlocks: CodeBlock[] = [];
	for (const file of tsxSourceFiles) {
		const content = await readFile(file, 'utf-8');
		tsdocBlocks.push(...extractTsDocExamples(content, file));
	}

	const allBlocks = [...sidecarBlocks, ...tsdocBlocks];

	if (allBlocks.length === 0) {
		console.log(
			`No code blocks found (${sidecarFiles.length} sidecar(s), ${tsxSourceFiles.length} source file(s)). Nothing to validate.`,
		);
		return;
	}

	// Use a directory inside packages/react so node_modules resolution finds `react`,
	// `react/jsx-runtime`, etc. (pnpm hoists these into the package, not the workspace root).
	const tempDir = await mkdtemp(join(REACT_PKG_ROOT, '.sidecar-validate-'));

	try {
		const blockFiles: string[] = [];
		for (let i = 0; i < allBlocks.length; i++) {
			const block = allBlocks[i]!;
			const fileName = `block-${String(i).padStart(3, '0')}.tsx`;
			const filePath = join(tempDir, fileName);
			await writeFile(filePath, wrapBlock(block));
			blockFiles.push(fileName);
		}

		const tsconfig = {
			compilerOptions: {
				strict: true,
				target: 'ES2022',
				module: 'ESNext',
				moduleResolution: 'bundler',
				jsx: 'react-jsx',
				esModuleInterop: true,
				skipLibCheck: true,
				noEmit: true,
				baseUrl: REPO_ROOT,
				paths: {
					'@unbranded-ds/react': ['packages/react/src/index.ts'],
					'@unbranded-ds/react/*': ['packages/react/src/*'],
					'@unbranded-ds/tokens': ['packages/tokens/src/index.ts'],
					'@unbranded-ds/tokens/client': ['packages/tokens/src/client.ts'],
					'@unbranded-ds/tokens/runtime': ['packages/tokens/src/runtime.ts'],
				},
				types: [],
			},
			include: blockFiles,
		};
		await writeFile(join(tempDir, 'tsconfig.json'), JSON.stringify(tsconfig, null, 2));

		const result = spawnSync('pnpm', ['exec', 'tsc', '-p', tempDir], {
			stdio: 'inherit',
			cwd: REPO_ROOT,
		});

		if (result.status !== 0) {
			console.error(`\nCode-example validation failed.`);
			console.error(`Block-to-source mapping (block file → origin):`);
			for (let i = 0; i < allBlocks.length; i++) {
				const block = allBlocks[i]!;
				const blockFile = `block-${String(i).padStart(3, '0')}.tsx`;
				console.error(`  ${blockFile} ← ${relative(REPO_ROOT, block.file)}:${block.line}`);
			}
			console.error(`Temp dir kept for inspection: ${tempDir}`);
			process.exit(1);
		}

		console.log(
			`✓ Validated ${sidecarBlocks.length} sidecar block(s) across ${sidecarFiles.length} file(s) + ${tsdocBlocks.length} TSDoc @example block(s) across ${tsxSourceFiles.length} source file(s).`,
		);
	} finally {
		await rm(tempDir, { recursive: true, force: true });
	}
}

main().catch((err) => {
	console.error(err);
	process.exit(1);
});
