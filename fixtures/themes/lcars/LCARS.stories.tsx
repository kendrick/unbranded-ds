// This fixture lives outside the packages, beyond the automatic-JSX-runtime scope
// that covers the in-package stories, so the classic runtime needs React in scope.
// A namespace import, not default: under the Vitest browser dep-optimizer the
// default `import React` resolves to null (see preview.ts).
import * as React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import {
	Button,
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
	Input,
	Label,
	Switch,
} from '@unbranded-ds/react';
import './parts.css';

// LCARS — the first expressivity fixture (spec-023 spike). An honest attempt at a
// wildly divergent skin through sanctioned channels ONLY: the look's color, flat
// surfaces, and condensed type ride the validated theme pipeline (the lcars
// identity), and the elbow radii + all-caps tracking the token schema can't yet
// express ride the audited parts.css layer. The composition below reaches for
// nothing private — public components and variants, no inline literal styles, no
// arbitrary classes — so the audit scores the CSS gaps, not the fixture.
//
// Each story self-scopes the skin on its own wrapper (data-theme + data-color-scheme
// together — the identity is a compound cell), so the Storybook test-runner's axe
// pass evaluates real LCARS contrast. The guard proving the a11y contract holds
// under the skin is the whole point: range UNDER invariant contract.

function ConsolePanel() {
	return (
		// Consumer's own page chrome — not a DS node, so the audit ignores it.
		<div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-4)', maxWidth: '32rem' }}>
			<Card>
				<CardHeader>
					<CardTitle>Navigation Control</CardTitle>
					<CardDescription>Stardate 47988.1 — all systems nominal.</CardDescription>
				</CardHeader>
				<CardContent>
					<div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-3)' }}>
						<div style={{ display: 'grid', gap: 'var(--spacing-2)' }}>
							<Label htmlFor="lcars-heading">Heading</Label>
							<Input id="lcars-heading" defaultValue="225 mark 7" />
						</div>
						<div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)' }}>
							<Switch id="lcars-inertial" aria-labelledby="lcars-inertial-label" defaultChecked />
							<Label id="lcars-inertial-label" htmlFor="lcars-inertial">Inertial dampers</Label>
						</div>
					</div>
				</CardContent>
				<CardFooter>
					<div style={{ display: 'flex', gap: 'var(--spacing-2)' }}>
						<Button>Engage</Button>
						<Button variant="outline">Standby</Button>
						<Button variant="destructive">Red alert</Button>
					</div>
				</CardFooter>
			</Card>
		</div>
	);
}

function Skin({ scheme }: { scheme: 'light' | 'dark' }) {
	return (
		<div
			data-theme="lcars"
			data-color-scheme={scheme}
			style={{
				background: 'var(--color-background)',
				color: 'var(--color-foreground)',
				padding: 'var(--spacing-6)',
				minHeight: '100vh',
			}}
		>
			<ConsolePanel />
		</div>
	);
}

const meta = {
	title: 'Fixtures/LCARS',
	component: Skin,
	parameters: { layout: 'fullscreen' },
} satisfies Meta<typeof Skin>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Dark: Story = {
	name: 'LCARS — dark',
	args: { scheme: 'dark' },
};

export const Light: Story = {
	name: 'LCARS — light',
	args: { scheme: 'light' },
};
