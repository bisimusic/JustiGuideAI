/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Enable API routes
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
  // Environment variables that should be available on the client
  env: {
    // Add any public env vars here
  },
}

module.exports = nextConfig
