import type { Preview } from '@storybook/react-vite';
import React from 'react';

import '@unbranded-ds/tokens/themes/light.css';
import '@unbranded-ds/tokens/themes/dark.css';
import '@unbranded-ds/tokens/themes/brand.css';
// Spec 009 axes: aesthetic themes (above + vaporwave) and a density theme
// (compact). Density is imported last so its cascade layer wins a collision.
import '@unbranded-ds/tokens/themes/vaporwave.css';
import '@unbranded-ds/tokens/themes/compact.css';
import './styles.css';

const preview: Preview = {
	globalTypes: {
		theme: {
			description: 'Theme for components',
			toolbar: {
				title: 'Theme',
				icon: 'paintbrush',
				items: [
					{ value: 'light', title: 'Light' },
					{ value: 'dark', title: 'Dark' },
					{ value: 'brand', title: 'Brand' },
				],
				dynamicTitle: true,
			},
		},
	},
	initialGlobals: {
		theme: 'light',
	},
	decorators: [
		(Story, context) => {
			const theme = context.globals.theme || 'light';

			React.useEffect(() => {
				document.documentElement.setAttribute('data-theme', theme);
				localStorage.setItem('unbranded-ds-theme', theme);
			}, [theme]);

			return React.createElement(
				'div',
				{
					'data-theme': theme,
					'style': {
						backgroundColor: 'var(--color-background)',
						color: 'var(--color-foreground)',
						minHeight: '100vh',
						padding: '1rem',
					},
				},
				React.createElement(Story),
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
