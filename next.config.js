const nextConfig = {

  compiler: {
    // Suppress hydration warnings for browser extension attributes
    suppressHydrationWarning: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'iced-latte-bucket-for-products.s3.eu-west-2.amazonaws.com',
      },
    ],
  },
  eslint: {
    // use pre-commit hooks and explicit npm run lint
    ignoreDuringBuilds: true,
  },
}

module.exports = nextConfig
