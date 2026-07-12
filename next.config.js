// eslint-disable-next-line @typescript-eslint/no-require-imports
const { withSentryConfig } = require('@sentry/nextjs')

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
const scriptSrc = [
  'script-src',
  '\'self\'',
  '\'unsafe-inline\'',
  ...(process.env.NODE_ENV === 'production' ? [] : ['\'unsafe-eval\'']),
  'https://challenges.cloudflare.com',
  'https://*.googletagmanager.com',
].join(' ')
const analyticsSources = [
  'https://*.google-analytics.com',
  'https://*.analytics.google.com',
  'https://*.googletagmanager.com',
]
const sentryDsn = process.env.NEXT_PUBLIC_SENTRY_DSN || process.env.SENTRY_DSN

function sentryConnectSourceFor(dsn) {
  if (!dsn) return undefined

  try {
    return new URL(dsn).origin
  } catch {
    return undefined
  }
}

const sentryConnectSource = sentryConnectSourceFor(sentryDsn)

function canonicalFrontendOrigin() {
  const configuredOrigin =
    process.env.NEXT_PUBLIC_FRONTEND_URL || 'https://iced-latte.uk'

  try {
    return new URL(configuredOrigin)
  } catch {
    return new URL('https://iced-latte.uk')
  }
}

const nextConfig = {
  output: 'standalone',
  compress: true,
  serverExternalPackages: [],
  images: {
    dangerouslyAllowLocalIP: process.env.NODE_ENV !== 'production',
    remotePatterns: imageSources.map(parseRemoteImageSource),
  },
  async redirects() {
    const canonicalOrigin = canonicalFrontendOrigin()
    const canonicalHost = canonicalOrigin.hostname

    if (canonicalHost.startsWith('www.')) {
      return []
    }

    return [
      {
        source: '/:path*',
        has: [{ type: 'host', value: `www.${canonicalHost}` }],
        destination: `${canonicalOrigin.origin}/:path*`,
        permanent: true,
      },
    ]
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
              scriptSrc,
              'style-src \'self\' \'unsafe-inline\'',
              [
                'img-src \'self\' data: blob:',
                ...imageSources,
                ...analyticsSources,
              ].join(' '),
              'font-src \'self\'',
              [
                'connect-src \'self\'',
                ...analyticsSources,
                ...(sentryConnectSource ? [sentryConnectSource] : []),
              ].join(' '),
              'frame-src https://challenges.cloudflare.com',
              'frame-ancestors \'none\'',
            ].join('; '),
          },
        ],
      },
    ]
  },
}

module.exports = withSentryConfig(nextConfig, {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  authToken: process.env.SENTRY_AUTH_TOKEN,
  silent: !process.env.CI,
  widenClientFileUpload: true,
})
