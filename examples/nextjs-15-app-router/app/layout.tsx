import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { SkipLink, ThemeProvider } from '@unbranded-ds/react';
import { getThemeBootstrapScript } from '@unbranded-ds/tokens/runtime';
import localFont from 'next/font/local';
import { Header } from './components/header';
import './globals.css';

// Self-hosted font (FR-013). next/font/local must run in a server module, so it
// stays here in the layout. It exposes the face as the CSS variable the override
// block in globals.css points `--typography-font-sans` at.
const localSans = localFont({
	src: '../fonts/inter-variable.woff2',
	variable: '--font-local-sans',
	display: 'swap',
	weight: '100 900',
});

export const metadata: Metadata = {
	title: 'unbranded-ds — Next.js 15 example',
	description: 'A clone-able starter wired up with @unbranded-ds/tokens and @unbranded-ds/react.',
};

export default function RootLayout({ children }: { children: ReactNode }) {
	return (
		// suppressHydrationWarning: the bootstrap script sets data-color-scheme,
		// data-theme, and data-density on <html> before React hydrates, which is an
		// intended attribute mismatch.
		<html lang="en" className={localSans.variable} suppressHydrationWarning>
			<head>
				{/* Flash-free: apply all three axes before first paint (spec 002/009/016). */}
				<script dangerouslySetInnerHTML={{ __html: getThemeBootstrapScript() }} />
			</head>
			<body className="bg-background text-foreground">
				{/* This layout is a server component. Since @unbranded-ds/react ships
				    'use client' (spec 017), it imports the provider, skip link, and
				    header directly, with no client wrapper of its own. {children} are
				    server pages passed through ThemeProvider's client boundary as props. */}
				<ThemeProvider>
					<SkipLink />
					<Header />
					<main id="main" tabIndex={-1} className="mx-auto max-w-5xl p-4 sm:p-6">
						{children}
					</main>
				</ThemeProvider>
			</body>
		</html>
	);
}
