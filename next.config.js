/** @type {import('next').NextConfig} */

module.exports = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['ipfs.infura.io', 'casey-lin1989.infura-ipfs.io'],
  },
  env: {
    BASE_URL: process.env.BASE_URL,
  },
};
