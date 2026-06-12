export { canonicalDefaultTokens } from './defaults.js';

export { composeTokens, dtcgToResolved, resolveTheme } from './resolve.js';
export type { ResolvedLayer } from './resolve.js';

export { contrastPairs, partialThemeSchema, themeSchema } from './schema.js';
export type { ContrastPair, PartialTheme, Theme } from './schema.js';

export { tokenMap } from './token-map.js';
export type { TokenCategory, TokenDefinition, TokenSource } from './token-map.js';

export { checkThemeCompleteness, validateTheme } from './validate.js';
export type { ValidationIssue, ValidationResult } from './validate.js';
