import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  typescript: {
    // Strict type checking during builds
    ignoreBuildErrors: false,
  },
  eslint: {
    // Enforce ESLint during builds
    ignoreDuringBuilds: false,
  },
};

export default nextConfig;
