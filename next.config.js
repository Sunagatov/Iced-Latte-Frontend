function parseRemoteImageSource(source) {
  const parsed = new URL(source)

  return {
    protocol: parsed.protocol.replace(':', ''),
    hostname: parsed.hostname,
    port: parsed.port,
    pathname: parsed.pathname === '/' ? undefined : parsed.pathname,
  }
}

function remoteImageSources() {
  return (process.env.NEXT_IMAGE_REMOTE_SOURCES ?? '')
    .split(',')
    .map((source) => source.trim())
    .filter(Boolean)
}

const imageSources = remoteImageSources()

const nextConfig = {
  output: 'standalone',
  compress: true,
  serverExternalPackages: [],
  images: {
    dangerouslyAllowLocalIP: process.env.NODE_ENV !== 'production',
    remotePatterns: imageSources.map(parseRemoteImageSource),
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
              ['img-src \'self\' data: blob:', ...imageSources].join(' '),
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
