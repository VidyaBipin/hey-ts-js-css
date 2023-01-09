/** @type {import('next').NextConfig} */
const headers = [{ key: 'Cache-Control', value: 'public, max-age=3600' }];
const withPWA = require('next-pwa')({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development'
});

module.exports = withTM(
  withPWA({
    reactStrictMode: false,
    trailingSlash: false,
    transpilePackages: ['lens', 'data', 'abis'],
    experimental: {
      scrollRestoration: true,
      newNextLinkBehavior: true
    },
    async rewrites() {
      return [
        {
          source: '/sitemap.xml',
          destination: 'https://sitemap.lenster.xyz/sitemap.xml'
        },
        {
          source: '/sitemaps/:match*',
          destination: 'https://sitemap.lenster.xyz/sitemaps/:match*'
        }
      ];
    },
    async redirects() {
      return [
        { source: '/u/:handle(.+).lens', destination: '/u/:handle', permanent: true },
        { source: '/u/:handle(.+).test', destination: '/u/:handle', permanent: true },
        {
          source: '/discord',
          destination: 'https://discord.com/invite/B8eKhSSUwX',
          permanent: true
        },
        {
          source: '/donate',
          destination: 'https://gitcoin.co/grants/5007/lenster',
          permanent: true
        }
      ];
    },
    async headers() {
      return [
        {
          source: '/(.*)',
          headers: [
            { key: 'X-Content-Type-Options', value: 'nosniff' },
            { key: 'X-XSS-Protection', value: '1; mode=block' },
            { key: 'Referrer-Policy', value: 'strict-origin' }
          ]
        },
        { source: '/about', headers },
        { source: '/privacy', headers },
        { source: '/thanks', headers }
      ];
    }
  })
);
