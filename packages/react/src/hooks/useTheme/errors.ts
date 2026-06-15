/**
 * Stable failure codes for the theme hook (spec 011 FR-017, Constitution
 * Section XI.4). An agent matches on these. The first three are recoverable and
 * warned through the `warn()` helper (no-op); `THEME_NO_PROVIDER` is thrown.
 */
export const THEME_INVALID_VALUE = 'THEME_INVALID_VALUE';
export const THEME_AXIS_FORCED = 'THEME_AXIS_FORCED';
export const THEME_NO_SYSTEM_SOURCE = 'THEME_NO_SYSTEM_SOURCE';
export const THEME_NO_PROVIDER = 'THEME_NO_PROVIDER';

/**
 * Thrown when `useTheme()` runs with no `<ThemeProvider>` ancestor. There is no
 * usable state to return, so a structured throw surfaces the wiring mistake at
 * once rather than masking it with fabricated defaults (clarify Q6).
 */
export class ThemeProviderError extends Error {
	readonly code = THEME_NO_PROVIDER;
	constructor(message: string) {
		super(message);
		this.name = 'ThemeProviderError';
	}
}
