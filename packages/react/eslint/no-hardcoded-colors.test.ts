import { RuleTester } from 'eslint';
import { afterAll, describe, it } from 'vitest';
import rule from './no-hardcoded-colors.js';

// The constitution (Section IV) mandates this rule, but until now nothing exercised
// it, so a regression that stopped it firing would have gone unnoticed. RuleTester is
// the durable proof: ESLint runs the rule against each case and fails if a real color
// slips through or a token-backed value gets flagged. Wire its lifecycle to Vitest so
// each case registers as a test.
RuleTester.afterAll = afterAll;
RuleTester.describe = describe;
RuleTester.it = it;
RuleTester.itOnly = it.only;

const ruleTester = new RuleTester({
	languageOptions: {
		ecmaVersion: 2022,
		sourceType: 'module',
	},
});

ruleTester.run('no-hardcoded-colors', rule, {
	valid: [
		// Token-backed colors are the whole point of the rule — they must pass.
		{ code: 'const c = "var(--color-primary)";' },
		{ code: 'const className = "bg-primary text-muted-foreground";' },
		// A plain string must not trip the named-color word match.
		{ code: 'const label = "Save changes";' },
	],
	invalid: [
		{ code: 'const c = "#ff0000";', errors: [{ messageId: 'hardcoded' }] },
		{ code: 'const c = "#fff";', errors: [{ messageId: 'hardcoded' }] },
		{ code: 'const c = "rgb(255, 0, 0)";', errors: [{ messageId: 'hardcoded' }] },
		{ code: 'const c = "hsl(0, 100%, 50%)";', errors: [{ messageId: 'hardcoded' }] },
		{ code: 'const c = "red";', errors: [{ messageId: 'hardcoded' }] },
		// Template literals are checked through the TemplateElement visitor.
		{ code: 'const c = `#abcdef`;', errors: [{ messageId: 'hardcoded' }] },
	],
});
