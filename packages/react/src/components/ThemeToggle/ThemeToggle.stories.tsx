import type { Meta, StoryObj } from '@storybook/react-vite';

import { registerTheme } from '@unbranded-ds/tokens/runtime';
import { expect, userEvent, within } from 'storybook/test';

import { ThemeProvider } from '../../hooks/useTheme';
import { ThemeToggle } from './ThemeToggle';

const meta = {
	title: 'Components/ThemeToggle',
	component: ThemeToggle,
	tags: ['autodocs'],
	decorators: [
		(Story) => (
			<ThemeProvider>
				<Story />
			</ThemeProvider>
		),
	],
} satisfies Meta<typeof ThemeToggle>;

export default meta;
type Story = StoryObj<typeof meta>;

function checkedLabel(canvasElement: HTMLElement): string | null | undefined {
	return within(canvasElement)
		.getAllByRole('radio')
		.find((radio) => radio.getAttribute('aria-checked') === 'true')
		?.textContent;
}

export const Default: Story = {
	parameters: {
		docs: {
			description: {
				story:
					'Segments are data-driven from the tokens registry (`themesForAxis(\'theme\')`), so default, brand, and vaporwave appear automatically. No `system` segment — that belongs to `<ColorSchemeToggle>`. Selecting one applies `data-theme` to the document root.',
			},
		},
	},
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		await userEvent.click(canvas.getByText('Brand'));
		expect(checkedLabel(canvasElement)).toBe('Brand');
	},
};

export const Sizes: Story = {
	render: () => (
		<div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', alignItems: 'flex-start' }}>
			<ThemeToggle size="sm" />
			<ThemeToggle size="md" />
			<ThemeToggle size="lg" />
		</div>
	),
};

export const Orientations: Story = {
	render: () => (
		<div style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start' }}>
			<ThemeToggle orientation="horizontal" />
			<ThemeToggle orientation="vertical" />
		</div>
	),
};

export const Forced: Story = {
	decorators: [
		(Story) => (
			<ThemeProvider forced={{ theme: 'brand' }}>
				<Story />
			</ThemeProvider>
		),
	],
	parameters: {
		docs: { description: { story: 'A pinned theme axis (`forced={{ theme: \'brand\' }}`) renders the toggle disabled.' } },
	},
};

export const CustomLabelsAndIcons: Story = {
	args: {
		labels: { default: 'Plain', brand: 'Brand', vaporwave: 'Retro' },
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
				name: 'sunset',
				displayName: 'Sunset',
				tokens: { color: PASSING_COLORS },
			},
			'theme',
		);
	},
	parameters: {
		docs: {
			description: {
				story:
					'Registering an identity at runtime (`registerTheme(theme, \'theme\')`) adds a "sunset" segment with no change to the component; the toggle is data-driven from the registry.',
			},
		},
	},
};
