'use client';

import { ColorSchemeToggle, DensityToggle, ThemeToggle } from '@unbranded-ds/react';
import Link from 'next/link';

// Client component: the toggles read the ThemeProvider via useTheme.
export function Header() {
	return (
		<header className="flex flex-col gap-3 border-b p-4 sm:flex-row sm:items-center sm:justify-between sm:p-6">
			<nav aria-label="Primary" className="flex items-center gap-4">
				<Link href="/" className="font-semibold">unbranded-ds</Link>
				<Link href="/showcase" className="text-muted-foreground hover:text-foreground">Showcase</Link>
			</nav>
			<div className="flex items-center gap-3">
				<ColorSchemeToggle />
				<ThemeToggle />
				<DensityToggle />
			</div>
		</header>
	);
}
