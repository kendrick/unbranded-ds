import type { Meta, StoryObj } from '@storybook/react-vite';

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
					'Three fixed segments (light, system, dark) wired to the aesthetic axis. Selecting one persists it and applies `data-theme` to the document root.',
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
			<ThemeToggle size="sm" />
			<ThemeToggle size="md" />
			<ThemeToggle size="lg" />
		</div>
	),
	parameters: {
		docs: { description: { story: 'The three sizes, forwarded to the underlying SegmentedControl.' } },
	},
};

export const Orientations: Story = {
	render: () => (
		<div style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start' }}>
			<ThemeToggle orientation="horizontal" />
			<ThemeToggle orientation="vertical" />
		</div>
	),
	parameters: {
		docs: { description: { story: 'Horizontal and vertical layouts.' } },
	},
};

export const Forced: Story = {
	decorators: [
		(Story) => (
			<ThemeProvider forced={{ aesthetic: 'dark' }}>
				<Story />
			</ThemeProvider>
		),
	],
	parameters: {
		docs: {
			description: {
				story: 'A pinned aesthetic axis (`forced={{ aesthetic: \'dark\' }}`) renders the toggle disabled.',
			},
		},
	},
};

export const AestheticIsBrand: Story = {
	decorators: [
		(Story) => (
			<ThemeProvider defaults={{ aesthetic: 'brand' }}>
				<Story />
			</ThemeProvider>
		),
	],
	parameters: {
		docs: {
			description: {
				story:
					'When the aesthetic value is `brand` or `vaporwave` (neither light nor dark), no segment is selected and the control stays enabled. Color-scheme is not yet its own axis.',
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
