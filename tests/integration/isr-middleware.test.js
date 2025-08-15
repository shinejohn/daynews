// Integration tests for ISR Middleware
import { describe, test, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { ISRMiddleware } from '../../server/isr/isr-middleware.js';
import { 
  createMockRequest, 
  createMockResponse, 
  createMockNext,
  TestCacheManager,
  waitFor,
  PerformanceTimer 
} from '../utils/test-helpers.js';
import fs from 'fs/promises';

// Mock the render module
jest.unstable_mockModule('../../server/render.js', () => ({
  renderRoute: jest.fn()
}));

const { renderRoute } = await import('../../server/render.js');

describe('ISRMiddleware Integration', () => {
  let middleware;
  let testCacheManager;
  let testCacheDir;
  let timer;

  beforeEach(async () => {
    testCacheDir = await global.createTempDir('isr-middleware-test');
    testCacheManager = new TestCacheManager(testCacheDir);
    timer = new PerformanceTimer();
    
    middleware = new ISRMiddleware({
      cacheDir: testCacheDir,
      defaultTTL: 300,
      maxWorkers: 1
    });

    // Reset mocks
    renderRoute.mockReset();
  });

  afterEach(async () => {
    try {
      await fs.rm(testCacheDir, { recursive: true, force: true });
    } catch (error) {
      console.warn('Could not clean up test cache directory:', error.message);
    }
  });

  describe('cache hit scenarios', () => {
    test('should serve fresh cache with HIT status', async () => {
      const route = '/test-fresh';
      const req = createMockRequest({ path: route });
      const res = createMockResponse();
      const next = createMockNext();

      // Create fresh cache entry
      const testHtml = '<html><body>Cached Content</body></html>';
      await testCacheManager.createCacheEntry(route, {
        html: testHtml,
        context: { cached: true }
      }, { ttl: 3600 }); // 1 hour TTL

      await middleware.handle(req, res, next);

      expect(res.setHeader).toHaveBeenCalledWith('X-Cache', 'HIT');
      expect(res.setHeader).toHaveBeenCalledWith('X-Cache-Age', expect.any(Number));
      expect(res.end).toHaveBeenCalledWith(testHtml);
      expect(renderRoute).not.toHaveBeenCalled();
      expect(next).not.toHaveBeenCalled();
    });

    test('should serve stale cache with STALE status and trigger revalidation', async () => {
      const route = '/test-stale';
      const req = createMockRequest({ path: route });
      const res = createMockResponse();
      const next = createMockNext();

      // Create stale cache entry
      const testHtml = '<html><body>Stale Content</body></html>';
      const expiredTime = Date.now() - 1000; // 1 second ago
      await testCacheManager.createCacheEntry(route, {
        html: testHtml,
        context: { stale: true }
      }, { timestamp: expiredTime, ttl: 1 }); // 1 second TTL

      await middleware.handle(req, res, next);

      expect(res.setHeader).toHaveBeenCalledWith('X-Cache', 'STALE');
      expect(res.end).toHaveBeenCalledWith(testHtml);
      expect(next).not.toHaveBeenCalled();
      
      // Revalidation should be queued (we can't easily test async queue processing)
      // but we can verify the response was served immediately
    });
  });

  describe('cache miss scenarios', () => {
    test('should render and cache new content with MISS status', async () => {
      const route = '/test-miss';
      const req = createMockRequest({ path: route });
      const res = createMockResponse();
      const next = createMockNext();

      const renderedHtml = '<html><body>Newly Rendered</body></html>';
      const renderResult = {
        html: renderedHtml,
        context: { page: 'test', rendered: true }
      };

      renderRoute.mockResolvedValue(renderResult);

      const { time } = await timer.measure('cache-miss', async () => {
        await middleware.handle(req, res, next);
      });

      expect(renderRoute).toHaveBeenCalledWith(route);
      expect(res.setHeader).toHaveBeenCalledWith('X-Cache', 'MISS');
      expect(res.end).toHaveBeenCalledWith(renderedHtml);
      expect(next).not.toHaveBeenCalled();

      // Verify content was cached
      const cached = await middleware.cache.get(route);
      expect(cached).not.toBeNull();
      expect(cached.html).toBe(renderedHtml);
      expect(cached.context).toEqual(renderResult.context);

      console.log(`Cache miss handled in ${time.toFixed(2)}ms`);
    });

    test('should handle render errors', async () => {
      const route = '/test-error';
      const req = createMockRequest({ path: route });
      const res = createMockResponse();
      const next = createMockNext();

      const renderError = new Error('Render failed');
      renderRoute.mockRejectedValue(renderError);

      await middleware.handle(req, res, next);

      expect(renderRoute).toHaveBeenCalledWith(route);
      expect(next).toHaveBeenCalledWith(renderError);
      expect(res.end).not.toHaveBeenCalled();
    });
  });

  describe('TTL configuration', () => {
    test('should use correct TTL for different route types', () => {
      expect(middleware.getTTLForRoute('/')).toBe(300); // News route
      expect(middleware.getTTLForRoute('/news')).toBe(300); // News route
      expect(middleware.getTTLForRoute('/about')).toBe(86400); // Static route
      expect(middleware.getTTLForRoute('/contact')).toBe(86400); // Static route
      expect(middleware.getTTLForRoute('/events')).toBe(300); // Default
    });

    test('should cache content with appropriate TTL', async () => {
      const route = '/about';
      const req = createMockRequest({ path: route });
      const res = createMockResponse();
      const next = createMockNext();

      renderRoute.mockResolvedValue({
        html: '<html><body>About page</body></html>',
        context: { page: 'about' }
      });

      await middleware.handle(req, res, next);

      const cached = await middleware.cache.get(route);
      expect(cached.ttl).toBe(86400 * 1000); // 24 hours in milliseconds
    });
  });

  describe('revalidation', () => {
    test('should revalidate specific route', async () => {
      const route = '/test-revalidate';
      
      // Create initial cache entry
      await testCacheManager.createCacheEntry(route, {
        html: '<html><body>Original</body></html>',
        context: { version: 1 }
      });

      const result = await middleware.revalidate(route);

      expect(result).toEqual({
        revalidating: true,
        route
      });

      // Cache should be deleted
      const cached = await middleware.cache.get(route);
      expect(cached).toBeNull();
    });
  });

  describe('performance', () => {
    test('cache hit should be faster than cache miss', async () => {
      const route = '/performance-test';
      
      // Setup render mock with artificial delay
      renderRoute.mockImplementation(() => {
        return new Promise(resolve => {
          setTimeout(() => {
            resolve({
              html: '<html><body>Slow render</body></html>',
              context: {}
            });
          }, 100); // 100ms delay
        });
      });

      // First request (cache miss)
      const req1 = createMockRequest({ path: route });
      const res1 = createMockResponse();
      const next1 = createMockNext();

      const { time: missTime } = await timer.measure('miss', async () => {
        await middleware.handle(req1, res1, next1);
      });

      // Second request (cache hit)
      const req2 = createMockRequest({ path: route });
      const res2 = createMockResponse();
      const next2 = createMockNext();

      const { time: hitTime } = await timer.measure('hit', async () => {
        await middleware.handle(req2, res2, next2);
      });

      expect(hitTime).toBeLessThan(missTime);
      expect(hitTime).toBeLessThan(50); // Cache hit should be very fast
      
      console.log(`Cache miss: ${missTime.toFixed(2)}ms, Cache hit: ${hitTime.toFixed(2)}ms`);
    });
  });

  describe('concurrent requests', () => {
    test('should handle multiple concurrent requests efficiently', async () => {
      const routes = ['/concurrent-1', '/concurrent-2', '/concurrent-3'];
      
      renderRoute.mockImplementation((route) => {
        return Promise.resolve({
          html: `<html><body>Content for ${route}</body></html>`,
          context: { route }
        });
      });

      const requests = routes.map(route => {
        const req = createMockRequest({ path: route });
        const res = createMockResponse();
        const next = createMockNext();
        return middleware.handle(req, res, next);
      });

      const { time } = await timer.measure('concurrent', async () => {
        await Promise.all(requests);
      });

      // All requests should complete
      expect(renderRoute).toHaveBeenCalledTimes(3);
      
      // All content should be cached
      for (const route of routes) {
        const cached = await middleware.cache.get(route);
        expect(cached).not.toBeNull();
        expect(cached.route).toBe(route);
      }

      console.log(`${routes.length} concurrent requests handled in ${time.toFixed(2)}ms`);
    });
  });

  describe('edge cases', () => {
    test('should handle routes with query parameters', async () => {
      const route = '/search?q=test&page=1';
      const req = createMockRequest({ path: route });
      const res = createMockResponse();
      const next = createMockNext();

      renderRoute.mockResolvedValue({
        html: '<html><body>Search results</body></html>',
        context: { query: 'test', page: 1 }
      });

      await middleware.handle(req, res, next);

      const cached = await middleware.cache.get(route);
      expect(cached).not.toBeNull();
      expect(cached.route).toBe(route);
    });

    test('should handle very long routes', async () => {
      const longRoute = '/very-long-route-' + 'x'.repeat(200);
      const req = createMockRequest({ path: longRoute });
      const res = createMockResponse();
      const next = createMockNext();

      renderRoute.mockResolvedValue({
        html: '<html><body>Long route content</body></html>',
        context: {}
      });

      await middleware.handle(req, res, next);

      const cached = await middleware.cache.get(longRoute);
      expect(cached).not.toBeNull();
    });
  });
});