import type { Meta, StoryObj } from '@storybook/react-vite';

import { registerTheme } from '@unbranded-ds/tokens/runtime';

import { ThemeProvider } from '../../hooks/useTheme';
import { DensityToggle } from './DensityToggle';

const meta = {
	title: 'Components/DensityToggle',
	component: DensityToggle,
	tags: ['autodocs'],
	decorators: [
		(Story) => (
			<ThemeProvider>
				<Story />
			</ThemeProvider>
		),
	],
} satisfies Meta<typeof DensityToggle>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	parameters: {
		docs: {
			description: {
				story:
					'Segments are data-driven from the tokens registry (`themesForAxis(\'density\')`), so comfortable and compact appear automatically. No `system` segment, because density has no OS signal.',
			},
		},
	},
};

export const Sizes: Story = {
	render: () => (
		<div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', alignItems: 'flex-start' }}>
			<DensityToggle size="sm" />
			<DensityToggle size="md" />
			<DensityToggle size="lg" />
		</div>
	),
};

export const Orientations: Story = {
	render: () => (
		<div style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start' }}>
			<DensityToggle orientation="horizontal" />
			<DensityToggle orientation="vertical" />
		</div>
	),
};

export const Forced: Story = {
	decorators: [
		(Story) => (
			<ThemeProvider forced={{ density: 'compact' }}>
				<Story />
			</ThemeProvider>
		),
	],
	parameters: {
		docs: { description: { story: 'A pinned density axis renders the toggle disabled.' } },
	},
};

export const CustomLabelsAndIcons: Story = {
	args: {
		labels: { comfortable: 'Roomy', compact: 'Tight' },
	},
};

// A self-consistent AA-passing color block. A partial theme inherits the
// canonical default colors, which sit just under 4.5:1 on a couple of pairs and
// would fail the contrast gate, so a runtime theme supplies its own passing set.
/* eslint-disable custom-rules/no-hardcoded-colors -- demo theme data for a runtime registerTheme example, not component styling; the values must be concrete hex to clear the contrast gate */
const PASSING_COLORS = {
	'background': '#f8f9fa',
	'foreground': '#212529',
	'primary': '#0d6efd',
	'primary-foreground': '#ffffff',
	'muted': '#e9ecef',
	'muted-foreground': '#495057',
	'border': '#dee2e6',
	'ring': '#0d6efd',
	'destructive': '#dc3545',
	'destructive-foreground': '#ffffff',
};
/* eslint-enable custom-rules/no-hardcoded-colors */

export const DataDrivenValues: Story = {
	beforeEach: () => {
		registerTheme(
			{
				name: 'cozy',
				displayName: 'Cozy',
				tokens: { color: PASSING_COLORS, spacing: { 4: '0.9rem' } },
			},
			'density',
		);
	},
	parameters: {
		docs: {
			description: {
				story:
					'Registering a density theme at runtime (`registerTheme(theme, \'density\')`) adds a "Cozy" segment with no change to the component; the toggle is data-driven from the registry.',
			},
		},
	},
};
