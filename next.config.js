/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [
      'raw.githubusercontent.com',
      // Add any other domains you need to load images from
    ],
  },
};

module.exports = nextConfig;
