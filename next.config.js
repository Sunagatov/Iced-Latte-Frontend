const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'iced-latte-bucket-for-products.s3.eu-west-2.amazonaws.com',
      },
    ],
  },
}

module.exports = nextConfig
