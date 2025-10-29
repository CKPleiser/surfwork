const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Security headers
  poweredByHeader: false,

  // Enable React strict mode for better error catching
  reactStrictMode: true,

  // Image optimization
  images: {
    formats: ['image/avif', 'image/webp'], // Modern formats first
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days cache
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },

  // Performance optimizations
  swcMinify: true,
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
  },

  // Optimize bundle size
  experimental: {
    optimizePackageImports: [
      'lucide-react',
      '@radix-ui/react-icons',
      '@tanstack/react-query',
      '@supabase/supabase-js',
      'date-fns',
    ],
    // Note: optimizeCss removed - requires critters package and can cause build issues
  },

  // Reduce module resolution overhead
  modularizeImports: {
    'lucide-react': {
      transform: 'lucide-react/dist/esm/icons/{{kebabCase member}}',
      skipDefaultConversion: true,
    },
    'date-fns': {
      transform: 'date-fns/{{member}}',
    },
    'lodash': {
      transform: 'lodash/{{member}}',
    },
  },

  // Webpack optimizations for production
  webpack: (config, { dev, isServer }) => {
    if (!dev && !isServer) {
      // Optimize bundle splitting for better caching
      config.optimization.splitChunks = {
        chunks: 'all',
        maxInitialRequests: 25,
        minSize: 20000,
        cacheGroups: {
          default: false,
          vendors: false,
          // Framework code (React, Next.js)
          framework: {
            name: 'framework',
            test: /[\\/]node_modules[\\/](react|react-dom|next|scheduler)[\\/]/,
            priority: 50,
            enforce: true,
          },
          // Large packages that change infrequently
          tanstack: {
            name: 'tanstack',
            test: /[\\/]node_modules[\\/](@tanstack)[\\/]/,
            priority: 40,
          },
          supabase: {
            name: 'supabase',
            test: /[\\/]node_modules[\\/](@supabase)[\\/]/,
            priority: 30,
            chunks: 'async', // Only load when needed
          },
          radix: {
            name: 'radix',
            test: /[\\/]node_modules[\\/](@radix-ui)[\\/]/,
            priority: 30,
          },
          // Lucide icons - heavy dependency
          lucide: {
            name: 'lucide',
            test: /[\\/]node_modules[\\/](lucide-react)[\\/]/,
            priority: 25,
          },
          // Common vendor chunks
          commons: {
            name: 'commons',
            minChunks: 2,
            priority: 20,
          },
        },
      };

      // Enable module concatenation for smaller bundles
      config.optimization.concatenateModules = true;

      // Reduce bundle size with proper tree-shaking
      config.optimization.usedExports = true;
      config.optimization.sideEffects = true;
    }
    return config;
  },
}

module.exports = withBundleAnalyzer(nextConfig)
