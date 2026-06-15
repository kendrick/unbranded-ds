/**
 * Resolve a stated preference to an applied value. `system` resolves to the
 * supplied OS value (falling back to `light` when no signal is available);
 * every other value is concrete and passes through unchanged.
 */
export function resolvePreference(
	preference: string,
	systemValue: string | undefined,
): string {
	return preference === 'system' ? (systemValue ?? 'light') : preference;
}
