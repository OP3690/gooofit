// Performance Optimization Configuration for GoooFit
// This file contains performance optimization settings and recommendations

module.exports = {
  // Core Web Vitals Targets
  coreWebVitals: {
    lcp: 2500, // Largest Contentful Paint (ms) - Target: < 2.5s
    fid: 100,  // First Input Delay (ms) - Target: < 100ms
    cls: 0.1,  // Cumulative Layout Shift - Target: < 0.1
    ttfb: 800, // Time to First Byte (ms) - Target: < 800ms
    fcp: 1800  // First Contentful Paint (ms) - Target: < 1.8s
  },

  // Image Optimization
  images: {
    formats: ['webp', 'avif', 'jpg', 'png'],
    sizes: [16, 32, 192, 512],
    lazyLoading: true,
    compression: {
      quality: 85,
      progressive: true
    }
  },

  // JavaScript Optimization
  javascript: {
    bundleAnalysis: true,
    codeSplitting: true,
    treeShaking: true,
    minification: true,
    sourceMaps: false // Disable in production
  },

  // CSS Optimization
  css: {
    purgeUnused: true,
    criticalCSS: true,
    minification: true,
    autoprefixer: true
  },

  // Caching Strategy
  caching: {
    staticAssets: '1 year',
    images: '1 month',
    css: '1 week',
    js: '1 week',
    html: '1 day'
  },

  // CDN Configuration
  cdn: {
    enabled: true,
    domains: [
      'https://cdn.gooofit.com',
      'https://static.gooofit.com'
    ]
  },

  // Preload Critical Resources
  preload: [
    '/fonts/main-font.woff2',
    '/css/critical.css',
    '/js/critical.js'
  ],

  // Service Worker Configuration
  serviceWorker: {
    enabled: true,
    cacheStrategy: 'stale-while-revalidate',
    offlineFallback: '/offline.html'
  }
};
