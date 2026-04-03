const nextConfig = {
  output: 'standalone',
  compress: true,
  serverExternalPackages: [],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'iced-latte-bucket-for-products.s3.eu-west-2.amazonaws.com',
      },
      {
        protocol: 'https',
        hostname: '*.supabase.co',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
      },
    ],
  },
}

module.exports = nextConfig
