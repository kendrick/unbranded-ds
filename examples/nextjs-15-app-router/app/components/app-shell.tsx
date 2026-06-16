'use client';

import type { ReactNode } from 'react';
import { SkipLink, ThemeProvider } from '@unbranded-ds/react';
import { Header } from './header';

// The design-system components are client components (they use hooks), and the
// published bundle does not carry a top-level 'use client' directive, so the
// provider, the skip link, and the toggles live behind this boundary. Server
// pages still render inside <main> as children passed through from the layout.
export function AppShell({ children }: { children: ReactNode }) {
	return (
		<ThemeProvider>
			<SkipLink />
			<Header />
			<main id="main" tabIndex={-1} className="mx-auto max-w-5xl p-4 sm:p-6">
				{children}
			</main>
		</ThemeProvider>
	);
}
