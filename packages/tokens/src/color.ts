/**
 * Color parsing and conversion utilities.
 * Supports hex (#rgb, #rrggbb) and oklch(L C H) formats.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type RGB = [number, number, number]; // 0–255
type LinearRGB = [number, number, number]; // 0–1 linear
type OklabColor = [number, number, number]; // L, a, b
type OklchColor = [number, number, number]; // L, C, H (H in degrees)

// ---------------------------------------------------------------------------
// Hex parsing
// ---------------------------------------------------------------------------

function hexToRgb(hex: string): RGB | null {
	const clean = hex.replace(/^#/, '');
	let r: number, g: number, b: number;

	if (clean.length === 3) {
		r = Number.parseInt(clean[0]! + clean[0]!, 16);
		g = Number.parseInt(clean[1]! + clean[1]!, 16);
		b = Number.parseInt(clean[2]! + clean[2]!, 16);
	}
	else if (clean.length === 6) {
		r = Number.parseInt(clean.slice(0, 2), 16);
		g = Number.parseInt(clean.slice(2, 4), 16);
		b = Number.parseInt(clean.slice(4, 6), 16);
	}
	else {
		return null;
	}

	if (Number.isNaN(r) || Number.isNaN(g) || Number.isNaN(b))
		return null;
	return [r, g, b];
}

// ---------------------------------------------------------------------------
// oklch parsing
// ---------------------------------------------------------------------------

const OKLCH_RE
	= /^oklch\(\s*([\d.]+)(%?)\s+([\d.]+)\s+([\d.]+(?:deg)?)\s*(?:\/\s*[\d.]+%?\s*)?\)$/i;

function parseOklch(str: string): OklchColor | null {
	const m = OKLCH_RE.exec(str.trim());
	if (!m)
		return null;

	let L = Number.parseFloat(m[1]!);
	if (m[2] === '%')
		L /= 100;
	const C = Number.parseFloat(m[3]!);
	const H = Number.parseFloat(m[4]!);

	if (Number.isNaN(L) || Number.isNaN(C) || Number.isNaN(H))
		return null;
	return [L, C, H];
}

// ---------------------------------------------------------------------------
// Conversions: sRGB ↔ linear RGB ↔ OKLab ↔ OKLCh
// ---------------------------------------------------------------------------

function srgbToLinear(c: number): number {
	const s = c / 255;
	return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
}

function linearToSrgb(c: number): number {
	const clamped = Math.max(0, Math.min(1, c));
	return clamped <= 0.0031308
		? Math.round(clamped * 12.92 * 255)
		: Math.round((1.055 * clamped ** (1 / 2.4) - 0.055) * 255);
}

function rgbToLinear(rgb: RGB): LinearRGB {
	return [srgbToLinear(rgb[0]), srgbToLinear(rgb[1]), srgbToLinear(rgb[2])];
}

function linearRgbToOklab(rgb: LinearRGB): OklabColor {
	const [r, g, b] = rgb;
	const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
	const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
	const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);

	return [
		0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
		1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
		0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
	];
}

function oklabToLinearRgb(lab: OklabColor): LinearRGB {
	const [L, a, b] = lab;
	const l = L + 0.3963377774 * a + 0.2158037573 * b;
	const m = L - 0.1055613458 * a - 0.0638541728 * b;
	const s = L - 0.0894841775 * a - 1.291485548 * b;

	const l3 = l * l * l;
	const m3 = m * m * m;
	const s3 = s * s * s;

	return [
		4.0767416621 * l3 - 3.3077115913 * m3 + 0.2309699292 * s3,
		-1.2684380046 * l3 + 2.6097574011 * m3 - 0.3413193965 * s3,
		-0.0041960863 * l3 - 0.7034186147 * m3 + 1.707614701 * s3,
	];
}

function oklabToOklch(lab: OklabColor): OklchColor {
	const [L, a, b] = lab;
	const C = Math.sqrt(a * a + b * b);
	let H = (Math.atan2(b, a) * 180) / Math.PI;
	if (H < 0)
		H += 360;
	return [L, C, H];
}

function oklchToOklab(lch: OklchColor): OklabColor {
	const [L, C, H] = lch;
	const hRad = (H * Math.PI) / 180;
	return [L, C * Math.cos(hRad), C * Math.sin(hRad)];
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Parse any supported color string into linear RGB for luminance calculation.
 * Returns null if the format is unrecognized.
 */
export function parseColor(value: string): LinearRGB | null {
	// Try hex
	const rgb = hexToRgb(value);
	if (rgb)
		return rgbToLinear(rgb);

	// Try oklch
	const oklch = parseOklch(value);
	if (oklch) {
		const lab = oklchToOklab(oklch);
		return oklabToLinearRgb(lab);
	}

	return null;
}

/**
 * Compute WCAG 2.x relative luminance from linear RGB.
 */
export function relativeLuminance(rgb: LinearRGB): number {
	return 0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2];
}

/**
 * Compute WCAG 2.x contrast ratio between two colors.
 */
export function contrastRatio(a: LinearRGB, b: LinearRGB): number {
	const la = relativeLuminance(a);
	const lb = relativeLuminance(b);
	const lighter = Math.max(la, lb);
	const darker = Math.min(la, lb);
	return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Mix two oklch color strings in OKLab space — matching the CSS
 * `color-mix(in oklab, a, b <t>%)` the Button's destructive hover uses — and
 * return linear RGB for contrast math. `t` is the weight of `b` (0..1). Returns
 * null if either string is unparseable. (spec 018: verifying the hover surface.)
 */
export function mixOklchToLinear(a: string, b: string, t: number): LinearRGB | null {
	const ao = parseOklch(a);
	const bo = parseOklch(b);
	if (!ao || !bo)
		return null;
	const al = oklchToOklab(ao);
	const bl = oklchToOklab(bo);
	const mixed: OklabColor = [
		al[0] + (bl[0] - al[0]) * t,
		al[1] + (bl[1] - al[1]) * t,
		al[2] + (bl[2] - al[2]) * t,
	];
	return oklabToLinearRgb(mixed);
}

/**
 * Convert a hex color string to oklch() CSS function.
 * Returns the original string if it's already oklch or unparseable.
 */
export function hexToOklch(value: string): string {
	if (!value.startsWith('#'))
		return value;

	const rgb = hexToRgb(value);
	if (!rgb)
		return value;

	const linear = rgbToLinear(rgb);
	const lab = linearRgbToOklab(linear);
	const [L, C, H] = oklabToOklch(lab);

	// High precision to minimize round-trip contrast drift
	const lStr = L.toFixed(6);
	const cStr = C.toFixed(6);
	const hStr = H.toFixed(4);

	return `oklch(${lStr} ${cStr} ${hStr})`;
}

/**
 * Convert an oklch color to hex (for round-trip testing).
 */
export function oklchToHex(value: string): string | null {
	const oklch = parseOklch(value);
	if (!oklch)
		return null;

	const lab = oklchToOklab(oklch);
	const linear = oklabToLinearRgb(lab);
	const r = linearToSrgb(linear[0]);
	const g = linearToSrgb(linear[1]);
	const b = linearToSrgb(linear[2]);

	return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}
