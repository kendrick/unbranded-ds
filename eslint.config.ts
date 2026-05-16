import antfu from '@antfu/eslint-config';
// @ts-expect-error -- eslint-plugin-jsx-a11y lacks first-party types
import jsxA11y from 'eslint-plugin-jsx-a11y';
import noHardcodedColors from './packages/react/eslint/no-hardcoded-colors.js';

export default antfu(
	{
		react: true,
		typescript: true,

		formatters: {
			css: true,
			html: true,
			markdown: true,
		},
		stylistic: {
			indent: 'tab',
			semi: true,
			quotes: 'single',
		},

		rules: {
			'camelcase': ['error', { ignoreImports: true }],
			'style/multiline-ternary': 'off',
			'style/arrow-parens': ['error', 'always'],
		},

		ignores: [
			'.agents',
			'.claude',
			'.specify',
			'node_modules',
			'dist',
			'build',
			'storybook-static',
			'*.min.*',
			'**/.agents',
			'**/.claude',
			'**/.specify/**',
		],
	},

	// Markdown overrides
	{
		files: ['**/*.md'],
		rules: {
			'style/no-mixed-spaces-and-tabs': 'off',
		},
	},

	// Design docs: specs & .specify directories
	{
		files: ['**/.specify/**', '**/specs/**'],
		rules: {
			'import/no-duplicates': 'off',
		},
	},

	// No hardcoded colors in component source
	{
		files: ['packages/react/src/components/**/*.tsx'],
		plugins: {
			'custom-rules': {
				rules: {
					'no-hardcoded-colors': noHardcodedColors,
				},
			},
		},
		rules: {
			'custom-rules/no-hardcoded-colors': 'error',
		},
	},

	// Accessibility (jsx-a11y) - Strict Mode
	{
		plugins: {
			'jsx-a11y': jsxA11y,
		},
		rules: {
			'jsx-a11y/alt-text': 'error',
			'jsx-a11y/anchor-has-content': 'error',
			'jsx-a11y/anchor-is-valid': 'error',
			'jsx-a11y/aria-activedescendant-has-tabindex': 'error',
			'jsx-a11y/aria-props': 'error',
			'jsx-a11y/aria-proptypes': 'error',
			'jsx-a11y/aria-role': 'error',
			'jsx-a11y/aria-unsupported-elements': 'error',
			'jsx-a11y/click-events-have-key-events': 'error',
			'jsx-a11y/heading-has-content': 'error',
			'jsx-a11y/html-has-lang': 'error',
			'jsx-a11y/img-redundant-alt': 'error',
			'jsx-a11y/interactive-supports-focus': 'error',
			'jsx-a11y/label-has-associated-control': 'error',
			'jsx-a11y/media-has-caption': 'error',
			'jsx-a11y/mouse-events-have-key-events': 'error',
			'jsx-a11y/no-access-key': 'error',
			'jsx-a11y/no-autofocus': 'warn',
			'jsx-a11y/no-distracting-elements': 'error',
			'jsx-a11y/no-interactive-element-to-noninteractive-role': 'error',
			'jsx-a11y/no-noninteractive-element-interactions': 'error',
			'jsx-a11y/no-noninteractive-element-to-interactive-role': 'error',
			'jsx-a11y/no-noninteractive-tabindex': 'error',
			'jsx-a11y/no-redundant-roles': 'error',
			'jsx-a11y/no-static-element-interactions': 'error',
			'jsx-a11y/role-has-required-aria-props': 'error',
			'jsx-a11y/role-supports-aria-props': 'error',
			'jsx-a11y/scope': 'error',
			'jsx-a11y/tabindex-no-positive': 'error',
		},
	},

	// Markdown code fences are illustrative content, not real code.
	// Disables rules that fire on example JSX/HTML inside docs.
	// Placed last so it wins over rule blocks above (later-wins in flat config).
	{
		files: ['**/*.md', '**/*.md/**'],
		rules: {
			'react-hooks/rules-of-hooks': 'off',
			'react-hooks/exhaustive-deps': 'off',
			'jsx-a11y/html-has-lang': 'off',
			'jsx-a11y/label-has-associated-control': 'off',
			'react/dom-no-dangerously-set-innerhtml': 'off',
			'react-dom/no-dangerously-set-innerhtml': 'off',
			'style/max-statements-per-line': 'off',
			'ts/no-unused-expressions': 'off',
			'no-unused-expressions': 'off',
		},
	},
);
