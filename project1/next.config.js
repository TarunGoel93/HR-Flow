/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Disable static page generation for dynamic routes
  experimental: {
    appDir: true,
  },
  // Skip static optimization for specific pages
  async redirects() {
    return [];
  },
};

module.exports = nextConfig;