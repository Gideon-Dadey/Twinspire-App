/**
 * Standalone output is required for the Docker image but symlink creation
 * fails on Windows without admin/dev mode. Opt-out locally via
 * `NEXT_DISABLE_STANDALONE=1` (used in CI on Linux containers).
 *
 * @type {import('next').NextConfig}
 */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  productionBrowserSourceMaps: false,
  ...(process.env.NEXT_DISABLE_STANDALONE === '1' ? {} : { output: 'standalone' }),

  experimental: {
    // `optimizePackageImports` rewrites barrel imports into deep subpath
    // imports. It works well for published packages (e.g. `lucide-react`)
    // but breaks on workspace packages like `@twinspire/ui` whose exports
    // are re-exports of re-exports (e.g. `export const TooltipProvider =
    // TooltipPrimitive.Provider`) — at runtime those names come back as
    // `undefined`. `transpilePackages` below already handles tree-shaking
    // for our workspaces, so we keep optimizePackageImports for npm-only.
    optimizePackageImports: ['lucide-react'],
    serverActions: { bodySizeLimit: '2mb' },
  },

  transpilePackages: ['@twinspire/ui', '@twinspire/utils', '@twinspire/types'],

  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      { protocol: 'https', hostname: '**.amazonaws.com' },
      { protocol: 'https', hostname: '**.cloudfront.net' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'cdn.twinspire.dev' },
      { protocol: 'http', hostname: 'localhost', port: '9000' },
    ],
    deviceSizes: [320, 375, 425, 640, 768, 1024, 1280, 1440, 1920, 2560],
    imageSizes: [16, 32, 64, 96, 128, 256, 384],
  },

  async headers() {
    const securityHeaders = [
      { key: 'X-DNS-Prefetch-Control', value: 'on' },
      { key: 'X-Frame-Options', value: 'DENY' },
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      {
        key: 'Permissions-Policy',
        value: 'camera=(), microphone=(), geolocation=(self), interest-cohort=()',
      },
      {
        key: 'Strict-Transport-Security',
        value: 'max-age=63072000; includeSubDomains; preload',
      },
    ];
    return [{ source: '/(.*)', headers: securityHeaders }];
  },

  logging: { fetches: { fullUrl: false } },
};

export default nextConfig;
