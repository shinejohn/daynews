// Common test scenarios for the ISR system
export const testScenarios = {
  // Cache scenarios
  cacheHit: {
    description: 'Fresh cache entry exists and should be served immediately',
    route: '/fresh-content',
    cacheData: {
      html: '<html><body>Fresh cached content</body></html>',
      context: { page: 'test', cached: true, timestamp: Date.now() },
      ttl: 3600000, // 1 hour
      fresh: true
    },
    expectedHeaders: {
      'X-Cache': 'HIT'
    }
  },

  cacheMiss: {
    description: 'No cache entry exists, content must be rendered and cached',
    route: '/new-content',
    renderResult: {
      html: '<html><body>Newly rendered content</body></html>',
      context: { page: 'test', rendered: true }
    },
    expectedHeaders: {
      'X-Cache': 'MISS'
    }
  },

  staleWhileRevalidate: {
    description: 'Stale cache exists, serve stale content while revalidating in background',
    route: '/stale-content',
    cacheData: {
      html: '<html><body>Stale cached content</body></html>',
      context: { page: 'test', stale: true },
      timestamp: Date.now() - 3700000, // 1 hour and 1 minute ago
      ttl: 3600000, // 1 hour TTL (expired)
      fresh: false
    },
    expectedHeaders: {
      'X-Cache': 'STALE'
    }
  },

  // Route-specific TTL scenarios
  newsRoute: {
    description: 'News routes should have short TTL (5 minutes)',
    routes: ['/', '/news', '/news/local', '/trending'],
    expectedTTL: 300
  },

  staticRoute: {
    description: 'Static routes should have long TTL (24 hours)',
    routes: ['/about', '/contact', '/terms', '/privacy'],
    expectedTTL: 86400
  },

  dynamicRoute: {
    description: 'Dynamic routes should use default TTL',
    routes: ['/events/123', '/business/abc', '/search?q=test'],
    expectedTTL: 300
  },

  // Error scenarios
  renderError: {
    description: 'Render function throws error',
    route: '/error-route',
    error: new Error('Simulated render error'),
    expectsNext: true
  },

  // Performance scenarios
  concurrentRequests: {
    description: 'Multiple requests for different routes simultaneously',
    routes: [
      '/concurrent-1',
      '/concurrent-2', 
      '/concurrent-3',
      '/concurrent-4',
      '/concurrent-5'
    ],
    expectedParallel: true
  },

  // Edge cases
  longRoute: {
    description: 'Very long route path',
    route: '/very-long-route-' + 'segment-'.repeat(20) + 'end',
    expectsCaching: true
  },

  routeWithQuery: {
    description: 'Route with complex query parameters',
    route: '/search?q=test%20query&page=1&sort=date&filter=local&category=news',
    expectsCaching: true
  },

  routeWithSpecialChars: {
    description: 'Route with special characters',
    route: '/events/winter-festival-2024!',
    expectsCaching: true
  },

  // Revalidation scenarios
  manualRevalidation: {
    description: 'Manual revalidation of specific route',
    route: '/revalidate-me',
    initialCache: {
      html: '<html><body>Original content</body></html>',
      context: { version: 1 }
    },
    afterRevalidation: {
      html: '<html><body>Updated content</body></html>',
      context: { version: 2 }
    }
  },

  // Integration scenarios
  fullPageFlow: {
    description: 'Complete page request flow from cache miss to cache hit',
    route: '/integration-test',
    steps: [
      { action: 'request', expectCache: 'MISS' },
      { action: 'request', expectCache: 'HIT' },
      { action: 'wait', duration: 'ttl + 1' },
      { action: 'request', expectCache: 'STALE' }
    ]
  }
};

// Test data generators
export const generateRouteVariations = (basePath) => {
  return [
    basePath,
    basePath + '/',
    basePath + '?v=1',
    basePath + '?timestamp=' + Date.now(),
    basePath + '#section1'
  ];
};

export const generateCacheKey = (route) => {
  const crypto = await import('crypto');
  return crypto.createHash('md5').update(route).digest('hex');
};

export const createExpiredCacheEntry = (route, ageInSeconds = 3600) => {
  const timestamp = Date.now() - (ageInSeconds * 1000);
  return {
    route,
    html: `<html><body>Expired content for ${route}</body></html>`,
    context: { expired: true, route },
    timestamp,
    ttl: 300000, // 5 minutes
    expiresAt: timestamp + 300000
  };
};

export const createFreshCacheEntry = (route, ttlInSeconds = 3600) => {
  const timestamp = Date.now();
  const ttlMs = ttlInSeconds * 1000;
  return {
    route,
    html: `<html><body>Fresh content for ${route}</body></html>`,
    context: { fresh: true, route },
    timestamp,
    ttl: ttlMs,
    expiresAt: timestamp + ttlMs
  };
};

// Performance benchmarks
export const performanceBenchmarks = {
  cacheHit: {
    description: 'Cache hit should be under 10ms',
    maxTime: 10,
    scenario: 'cacheHit'
  },
  
  cacheMiss: {
    description: 'Cache miss should be under 100ms (excluding render time)',
    maxTime: 100,
    scenario: 'cacheMiss'
  },
  
  concurrentRequests: {
    description: '10 concurrent requests should complete within 200ms',
    maxTime: 200,
    concurrency: 10
  }
};

// Error test cases
export const errorScenarios = {
  corruptedCache: {
    description: 'Corrupted cache file should be handled gracefully',
    route: '/corrupted',
    cacheContent: 'invalid json content {'
  },
  
  missingCacheDir: {
    description: 'Missing cache directory should be created automatically',
    cacheDir: '/non/existent/directory'
  },
  
  diskSpaceError: {
    description: 'Disk space errors should be handled gracefully',
    simulateError: 'ENOSPC'
  }
};

export default {
  testScenarios,
  generateRouteVariations,
  generateCacheKey,
  createExpiredCacheEntry,
  createFreshCacheEntry,
  performanceBenchmarks,
  errorScenarios
};