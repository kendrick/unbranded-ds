/**
 * Emit a structured warning to the console for runtime validation failures.
 *
 * Used by components when an input is invalid but recoverable (e.g., Slider
 * receiving a value outside [min, max] — clamped, then warned). Agents and
 * dev tools parse the second argument as a JSON-shaped object directly, so
 * the shape stays stable.
 *
 * The wrapper does not throw on invalid input — that would break consumer
 * pages over a misconfiguration. See spec 004 FR-020 and FR-034.
 */

export interface WarnPayload {
	component: string;
	issue: string;
	[key: string]: unknown;
}

export function warn(payload: WarnPayload): void {
	console.warn('[unbranded-ds]', payload);
}
