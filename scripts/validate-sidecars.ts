#!/usr/bin/env tsx
/**
 * Validates sidecar code examples compile.
 *
 * Walks `packages/react/src/components/**\/*.usage.md`, extracts code
 * blocks tagged `tsx`, smart-wraps each so JSX is in proper context, then
 * runs `tsc --noEmit` against the lot. A failing extraction or compile
 * error exits the process non-zero.
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
	const files = await findUsageFiles(COMPONENTS_ROOT);

	if (files.length === 0) {
		console.log('No sidecar files found yet. Nothing to validate.');
		return;
	}

	const allBlocks: CodeBlock[] = [];
	for (const file of files) {
		const content = await readFile(file, 'utf-8');
		allBlocks.push(...extractTsxBlocks(content, file));
	}

	if (allBlocks.length === 0) {
		console.log(`No tsx code blocks found across ${files.length} sidecar(s). Nothing to validate.`);
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
			console.error(`\nSidecar validation failed.`);
			console.error(`Block-to-source mapping (block file → sidecar location):`);
			for (let i = 0; i < allBlocks.length; i++) {
				const block = allBlocks[i]!;
				const blockFile = `block-${String(i).padStart(3, '0')}.tsx`;
				console.error(`  ${blockFile} ← ${relative(REPO_ROOT, block.file)}:${block.line}`);
			}
			console.error(`Temp dir kept for inspection: ${tempDir}`);
			process.exit(1);
		}

		console.log(
			`✓ Validated ${allBlocks.length} sidecar code block(s) across ${files.length} file(s).`,
		);
	} finally {
		await rm(tempDir, { recursive: true, force: true });
	}
}

main().catch((err) => {
	console.error(err);
	process.exit(1);
});
