const nextConfig = {
  images: {
    domains: ['134.209.25.111', '172.19.0.7', '172.19.0.2'],
  },
  eslint: {
      // use pre-commit hooks and explicit `npm run lint`
      ignoreDuringBuilds: true,
  },
}

module.exports = nextConfig
