/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Environment variables that should be available on the client
  env: {
    // Add any public env vars here
  },
  // Exclude admin pages from build
  pageExtensions: ['tsx', 'ts', 'jsx', 'js'],
  webpack: (config, { isServer }) => {
    // Exclude admin pages from client-side bundle
    if (!isServer) {
      config.resolve.alias = {
        ...config.resolve.alias,
      };
    }
    return config;
  },
  // Exclude admin routes from static generation
  async generateBuildId() {
    return 'build-' + Date.now();
  },
}

module.exports = nextConfig
