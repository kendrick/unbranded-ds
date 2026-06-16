import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
	// Lint runs as its own step (the `lint` script, enforced in CI per FR-018),
	// so the production build stays a pure compile. Type errors still fail it.
	eslint: { ignoreDuringBuilds: true },
};

export default nextConfig;
