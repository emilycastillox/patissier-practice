/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true
  },
  basePath: process.env.NODE_ENV === 'production' ? '/patissier-practice' : '',
  assetPrefix: process.env.NODE_ENV === 'production' ? '/patissier-practice' : '',
};

export default nextConfig;