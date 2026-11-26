import type { NextConfig } from 'next';

const config: NextConfig = {
  poweredByHeader: false,
  outputFileTracingIncludes: { "/g/\\[token\\]/invitation": ["./public/dashboard/bundle-v14.js"], "/api/publishing": ["./public/dashboard/bundle-v14.js"], "/i/\\[slug\\]": ["./public/dashboard/bundle-v14.js"] },
  async headers() {
    return [
      { source: '/:path*', headers: [
        { key: 'X-Robots-Tag', value: 'noindex, nofollow' },
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'Referrer-Policy', value: 'no-referrer' },
      ] },
    ];
  },
};
export default config;
