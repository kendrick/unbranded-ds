import type { Preview } from '@storybook/react-vite';
// Named imports, not `import React from 'react'`: under the Vitest browser
// dep-optimizer the default import resolves to null, so `React.useEffect` threw
// in the test-runner (spec 019). Named imports work the same in dev, build, and test.
import { createElement, useEffect } from 'react';

// Three axes (spec 016): the color scheme (light/dark) and the aesthetic identity
// (default/brand/vaporwave) ride separate attributes, so each identity ships a
// cell per scheme. The compact density is imported last so its cascade layer wins
// a collision.
import '@unbranded-ds/tokens/themes/light.css';
import '@unbranded-ds/tokens/themes/dark.css';
import '@unbranded-ds/tokens/themes/brand-light.css';
import '@unbranded-ds/tokens/themes/brand-dark.css';
import '@unbranded-ds/tokens/themes/vaporwave-light.css';
import '@unbranded-ds/tokens/themes/vaporwave-dark.css';
import '@unbranded-ds/tokens/themes/compact.css';
import './styles.css';

const preview: Preview = {
	globalTypes: {
		colorScheme: {
			description: 'Color scheme (light/dark)',
			toolbar: {
				title: 'Color scheme',
				icon: 'sun',
				items: [
					{ value: 'light', title: 'Light' },
					{ value: 'dark', title: 'Dark' },
				],
				dynamicTitle: true,
			},
		},
		theme: {
			description: 'Aesthetic identity',
			toolbar: {
				title: 'Theme',
				icon: 'paintbrush',
				items: [
					{ value: 'default', title: 'Default' },
					{ value: 'brand', title: 'Brand' },
					{ value: 'vaporwave', title: 'Vaporwave' },
				],
				dynamicTitle: true,
			},
		},
	},
	initialGlobals: {
		colorScheme: 'light',
		theme: 'default',
	},
	decorators: [
		(Story, context) => {
			const colorScheme = context.globals.colorScheme || 'light';
			const theme = context.globals.theme || 'default';

			useEffect(() => {
				const d = document.documentElement;
				d.setAttribute('data-color-scheme', colorScheme);
				d.setAttribute('data-theme', theme);
				localStorage.setItem('unbranded-ds-color-scheme', colorScheme);
				localStorage.setItem('unbranded-ds-theme', theme);
			}, [colorScheme, theme]);

			return createElement(
				'div',
				{
					'data-color-scheme': colorScheme,
					'data-theme': theme,
					'style': {
						backgroundColor: 'var(--color-background)',
						color: 'var(--color-foreground)',
						minHeight: '100vh',
						padding: '1rem',
					},
				},
				createElement(Story),
			);
		},
	],
	parameters: {
		a11y: {
			test: 'error',
		},
		chromatic: {
			disableSnapshot: true,
		},
	},
};

export default preview;
