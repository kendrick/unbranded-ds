import type { Meta, StoryObj } from '@storybook/react-vite';

import { expect, userEvent, within } from 'storybook/test';

import { ThemeProvider } from '../../hooks/useTheme';
import { ColorSchemeToggle } from './ColorSchemeToggle';

const meta = {
	title: 'Components/ColorSchemeToggle',
	component: ColorSchemeToggle,
	tags: ['autodocs'],
	decorators: [
		(Story) => (
			<ThemeProvider>
				<Story />
			</ThemeProvider>
		),
	],
} satisfies Meta<typeof ColorSchemeToggle>;

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
					'Three fixed segments (light, system, dark) wired to the `colorScheme` axis. Selecting one persists it and applies `data-color-scheme` to the document root, independent of the aesthetic identity.',
			},
		},
	},
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		await userEvent.click(canvas.getByText('Dark'));
		expect(checkedLabel(canvasElement)).toBe('Dark');
	},
};

export const SystemFollowing: Story = {
	parameters: {
		docs: {
			description: {
				story:
					'Selecting **System** follows the OS via `prefers-color-scheme`. The live OS-change path (the resolved value flipping when the OS theme changes) is exercised deterministically in the unit suite, `themeStore.test.ts`.',
			},
		},
	},
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		await userEvent.click(canvas.getByText('System'));
		expect(checkedLabel(canvasElement)).toBe('System');
	},
};

export const Sizes: Story = {
	render: () => (
		<div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', alignItems: 'flex-start' }}>
			<ColorSchemeToggle size="sm" />
			<ColorSchemeToggle size="md" />
			<ColorSchemeToggle size="lg" />
		</div>
	),
	parameters: {
		docs: { description: { story: 'The three sizes, forwarded to the underlying SegmentedControl.' } },
	},
};

export const Orientations: Story = {
	render: () => (
		<div style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start' }}>
			<ColorSchemeToggle orientation="horizontal" />
			<ColorSchemeToggle orientation="vertical" />
		</div>
	),
	parameters: {
		docs: { description: { story: 'Horizontal and vertical layouts.' } },
	},
};

export const Forced: Story = {
	decorators: [
		(Story) => (
			<ThemeProvider forced={{ colorScheme: 'dark' }}>
				<Story />
			</ThemeProvider>
		),
	],
	parameters: {
		docs: {
			description: {
				story: 'A pinned color-scheme axis (`forced={{ colorScheme: \'dark\' }}`) renders the toggle disabled.',
			},
		},
	},
};

export const CustomLabelsAndIcons: Story = {
	args: {
		labels: { light: 'Día', system: 'Auto', dark: 'Noche' },
	},
	parameters: {
		docs: { description: { story: 'Per-segment `labels` (and `icons`) overrides.' } },
	},
};
