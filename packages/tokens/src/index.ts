export { canonicalDefaultTokens } from './defaults.js';

export { resolveTheme } from './resolve.js';

export { contrastPairs, partialThemeSchema, themeSchema } from './schema.js';
export type { ContrastPair, PartialTheme, Theme } from './schema.js';

export { tokenMap } from './token-map.js';
export type { TokenCategory, TokenDefinition } from './token-map.js';

export { checkThemeCompleteness, validateTheme } from './validate.js';
export type { ValidationIssue, ValidationResult } from './validate.js';
