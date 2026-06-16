import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { FlatCompat } from '@eslint/eslintrc';

// Self-contained Next.js flat config. It does NOT extend the monorepo's root
// config, so the directory lints the same way after it is copied out.
const compat = new FlatCompat({ baseDirectory: dirname(fileURLToPath(import.meta.url)) });

const config = [
	...compat.extends('next/core-web-vitals', 'next/typescript'),
	{ ignores: ['.next/**', 'next-env.d.ts', 'playwright-report/**', 'test-results/**'] },
];

export default config;
