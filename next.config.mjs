import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./i18n.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Allow Three.js and other packages
  webpack: (config) => {
    config.externals = config.externals || [];
    return config;
  },
};

export default withNextIntl(nextConfig);
