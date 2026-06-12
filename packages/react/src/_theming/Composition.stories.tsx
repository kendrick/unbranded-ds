import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';
import { Button } from '../components/Button/Button';

// Spec 009: multi-axis theme composition. An aesthetic theme (data-theme) and a
// density theme (data-density) apply at once; density wins a collision via the
// cascade @layer order. This story renders under both attributes and asserts the
// resolved custom properties — the real-browser confirmation of the parity oracle.

interface DemoProps {
	theme?: string;
	density?: string;
}

function CompositionDemo({ theme, density }: DemoProps) {
	return (
		<div
			data-theme={theme}
			data-density={density}
			data-testid="composition-root"
			style={{
				display: 'flex',
				flexDirection: 'column',
				gap: 'var(--spacing-4)',
				padding: 'var(--spacing-6)',
				background: 'var(--color-background)',
				color: 'var(--color-foreground)',
				borderRadius: 'var(--radius-lg)',
			}}
		>
			<strong>
				{theme ?? 'base'}
				{density ? ` + ${density}` : ''}
			</strong>
			<div
				style={{
					height: '2rem',
					borderRadius: 'var(--radius-md)',
					background: 'var(--color-primary)',
					boxShadow: 'var(--shadow-neon)',
				}}
			/>
			<Button>Primary action</Button>
		</div>
	);
}

const meta = {
	title: 'Theming/Composition',
	component: CompositionDemo,
} satisfies Meta<typeof CompositionDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const VaporwaveCompact: Story = {
	name: 'Vaporwave + Compact',
	args: { theme: 'vaporwave', density: 'compact' },
	parameters: {
		docs: {
			description: {
				story:
					'The aesthetic axis (vaporwave) and the density axis (compact) applied together. The panel takes vaporwave color and its neon-glow extension token, while compact tightens the spacing — and where the two axes touch the same token, density wins.',
			},
		},
	},
	play: async ({ canvasElement }) => {
		const root = canvasElement.querySelector<HTMLElement>(
			'[data-testid="composition-root"]',
		)!;
		const cs = getComputedStyle(root);
		// density wins the spacing collision: compact's 0.8rem, not the 1rem base
		expect(cs.getPropertyValue('--spacing-4').trim()).toBe('0.8rem');
		// the aesthetic axis contributes its palette and its extension token
		expect(cs.getPropertyValue('--shadow-neon').trim().length).toBeGreaterThan(0);
		expect(cs.getPropertyValue('--color-primary').trim().length).toBeGreaterThan(0);
	},
};
