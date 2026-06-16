'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@unbranded-ds/react';

// Container queries (FR-015): the SAME card renders in two different-width
// containers. Each reflows by its own container width via Tailwind v4's
// `@container` + `@sm:` variants, not the viewport, so a copied component stays
// correct wherever it lands (a sidebar, a modal, full width).
function ResponsiveCard() {
	return (
		<div className="@container">
			<Card className="flex flex-col gap-3 @sm:flex-row @sm:items-center @sm:justify-between">
				<CardHeader>
					<CardTitle>Container-aware</CardTitle>
				</CardHeader>
				<CardContent className="text-muted-foreground">
					Wide containers lay this out in a row; narrow ones stack it.
				</CardContent>
			</Card>
		</div>
	);
}

export function CqDemo() {
	return (
		<section className="flex flex-col gap-4">
			<h2 className="text-xl font-semibold">Container queries</h2>
			<p className="text-muted-foreground">
				The same card in a wide and a narrow container. Each responds to its container, not the
				window.
			</p>
			<div className="flex flex-col gap-4 sm:flex-row">
				<div className="w-full rounded-lg border p-4 sm:w-2/3">
					<p className="mb-2 text-sm text-muted-foreground">Wide container</p>
					<ResponsiveCard />
				</div>
				<div className="w-full rounded-lg border p-4 sm:w-1/3">
					<p className="mb-2 text-sm text-muted-foreground">Narrow container</p>
					<ResponsiveCard />
				</div>
			</div>
		</section>
	);
}
