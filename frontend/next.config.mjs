/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  async rewrites() {
    return [
      {
        source: '/api/backend/:path*',
        destination:
          process.env.NODE_ENV === 'production'
            ? 'https://fighter-billi.onrender.com/:path*'
            : 'http://127.0.0.1:8000/:path*',
      },
    ]
  },
}

export default nextConfig
