import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect } from 'storybook/test';
import { Button } from '../components/Button/Button';

// Spec 016: three-axis theme composition. A color scheme (data-color-scheme), an
// aesthetic identity (data-theme), and a density (data-density) apply at once;
// later cascade layers win a collision (identity over the color-scheme base,
// density over both). This story renders under all three attributes and asserts
// the resolved custom properties — the real-browser confirmation of the parity
// oracle. An identity palette only lands when its color scheme is also set, since
// each cell is a compound `[data-theme][data-color-scheme]` selector.

interface DemoProps {
	colorScheme?: string;
	theme?: string;
	density?: string;
}

function CompositionDemo({ colorScheme, theme, density }: DemoProps) {
	return (
		<div
			data-color-scheme={colorScheme}
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
				{[colorScheme, theme, density].filter(Boolean).join(' + ') || 'base'}
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
	name: 'Vaporwave dark + Compact',
	args: { colorScheme: 'dark', theme: 'vaporwave', density: 'compact' },
	parameters: {
		docs: {
			description: {
				story:
					'The vaporwave identity in dark (a compound cell) and the compact density applied together. The panel takes vaporwave color and its neon-glow extension token, while compact tightens the spacing — and where the axes touch the same token, density wins.',
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
		// the identity contributes its palette and its extension token
		expect(cs.getPropertyValue('--shadow-neon').trim().length).toBeGreaterThan(0);
		expect(cs.getPropertyValue('--color-primary').trim().length).toBeGreaterThan(0);
	},
};
