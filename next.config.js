const nextConfig = {
  output: 'standalone',
  compress: true,
  serverExternalPackages: [],
  images: {
    dangerouslyAllowLocalIP: process.env.NODE_ENV !== 'production',
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
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
          {
            key: 'Content-Security-Policy',
            value: [
              'default-src \'self\'',
              'script-src \'self\' \'unsafe-inline\' \'unsafe-eval\'', // unsafe-eval required by Next.js dev mode
              'style-src \'self\' \'unsafe-inline\'',
              'img-src \'self\' data: blob: https://iced-latte-bucket-for-products.s3.eu-west-2.amazonaws.com https://*.supabase.co http://localhost:9000',
              'font-src \'self\'',
              'connect-src \'self\'',
              'frame-ancestors \'none\'',
            ].join('; '),
          },
        ],
      },
    ]
  },
}

module.exports = nextConfig
