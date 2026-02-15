/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: '/hook/:id',
        destination: '/api/webhook/:id',
      },
    ]
  },
}

module.exports = nextConfig