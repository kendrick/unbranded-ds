'use client';

import { Button, Card, CardContent, CardHeader, CardTitle, DensityToggle, ThemeProvider, ThemeToggle } from '@unbranded-ds/react';
import { useState } from 'react';

// Demonstrates ThemeProvider's `forced` API scoped to a subtree. The provider
// pins both axes on this section's own element (passed as `root`), so the
// toggles inside render disabled and the panel is vaporwave + compact no matter
// the app-wide theme. Scoping `forced` to a subtree needs the element as `root`,
// which only exists after mount, hence the callback ref + state.
//
// The data-theme/data-density attributes are also set directly so the panel
// paints correctly during SSR, before the provider's effect runs. The provider
// then re-affirms the same values on `root` and supplies the forced context the
// toggles read.
export function PinnedVaporwave() {
	const [root, setRoot] = useState<HTMLElement | null>(null);

	const content = (
		<Card>
			<CardHeader>
				<CardTitle>Vaporwave, compact</CardTitle>
			</CardHeader>
			<CardContent className="flex flex-col items-start gap-3">
				<p>Pinned with ThemeProvider&apos;s forced prop. The toggles below are disabled because both axes are forced here.</p>
				<div className="flex flex-wrap gap-3">
					<ThemeToggle aria-label="Pinned color scheme (forced)" />
					<DensityToggle aria-label="Pinned density (forced)" />
				</div>
				<Button>Pinned button</Button>
			</CardContent>
		</Card>
	);

	return (
		<section
			ref={setRoot}
			data-theme="vaporwave"
			data-density="compact"
			data-testid="pinned-vaporwave"
			className="rounded-lg border bg-background p-6 text-foreground"
		>
			{root
				? (
						<ThemeProvider forced={{ aesthetic: 'vaporwave', density: 'compact' }} root={root}>
							{content}
						</ThemeProvider>
					)
				: content}
		</section>
	);
}
