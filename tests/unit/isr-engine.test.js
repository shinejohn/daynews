// Unit tests for ISR Engine (Main ISR Middleware)
import { describe, test, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { ISRMiddleware } from '../../server/isr/isr-middleware.js';
import { CacheManager } from '../../server/isr/cache-manager.js';
import { RevalidationQueue } from '../../server/isr/revalidation-queue.js';
import {
  createMockRequest,
  createMockResponse,
  createMockNext,
  TestCacheManager,
  PerformanceTimer,
  waitFor,
  sleep
} from '../utils/test-helpers.js';
import fs from 'fs/promises';

// Mock dependencies
jest.mock('../../server/render.js', () => ({
  renderRoute: jest.fn()
}));

const { renderRoute } = await import('../../server/render.js');

describe('ISRMiddleware', () => {
  let middleware;
  let testCacheDir;
  let testCacheManager;
  let timer;

  beforeEach(async () => {
    testCacheDir = await global.createTempDir('isr-engine-test');
    middleware = new ISRMiddleware({
      cacheDir: testCacheDir,
      maxWorkers: 1,
      defaultTTL: 300
    });
    testCacheManager = new TestCacheManager(testCacheDir);
    timer = new PerformanceTimer();

    // Reset mocks
    renderRoute.mockReset();
    renderRoute.mockResolvedValue({
      html: '<html><body>Test Content</body></html>',
      context: { test: true }
    });

    // Mock console to avoid test noise
    global.mockConsole();
  });

  afterEach(async () => {
    try {
      await fs.rm(testCacheDir, { recursive: true, force: true });
    } catch (error) {
      console.warn('Could not clean up test cache directory:', error.message);
    }

    global.restoreConsole();
  });

  describe('constructor', () => {
    test('should initialize with default options', () => {
      const defaultMiddleware = new ISRMiddleware();
      
      expect(defaultMiddleware.cache).toBeInstanceOf(CacheManager);
      expect(defaultMiddleware.queue).toBeInstanceOf(RevalidationQueue);
      expect(defaultMiddleware.defaultTTL).toBe(300);
    });

    test('should initialize with custom options', () => {
      const customMiddleware = new ISRMiddleware({
        cacheDir: './custom-cache',
        maxWorkers: 4,
        defaultTTL: 600
      });

      expect(customMiddleware.defaultTTL).toBe(600);
      expect(customMiddleware.queue.maxWorkers).toBe(4);
    });

    test('should set up event listeners for revalidation queue', () => {
      expect(middleware.queue.listenerCount('revalidated')).toBe(1);
    });
  });

  describe('handle - Cache Hit', () => {
    test('should serve fresh cached content', async () => {
      const route = '/test-fresh';
      const req = createMockRequest({ path: route });
      const res = createMockResponse();
      const next = createMockNext();

      // Create fresh cache entry
      await testCacheManager.createCacheEntry(route, {
        html: '<html><body>Cached Content</body></html>',
        context: { cached: true }
      });

      await middleware.handle(req, res, next);

      expect(res.setHeader).toHaveBeenCalledWith('X-Cache', 'HIT');
      expect(res.setHeader).toHaveBeenCalledWith('X-Cache-Age', expect.any(Number));
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.end).toHaveBeenCalledWith('<html><body>Cached Content</body></html>');
      expect(renderRoute).not.toHaveBeenCalled();
      expect(next).not.toHaveBeenCalled();
    });

    test('should include proper headers for cached responses', async () => {
      const route = '/test-headers';
      const req = createMockRequest({ path: route });
      const res = createMockResponse();
      const next = createMockNext();

      const timestamp = Date.now() - 1000;
      await testCacheManager.createCacheEntry(route, {
        html: '<html><body>Header Test</body></html>'
      }, { timestamp });

      await middleware.handle(req, res, next);

      expect(res.set).toHaveBeenCalledWith({
        'Content-Type': 'text/html',
        'Last-Modified': new Date(timestamp).toUTCString()
      });
    });
  });

  describe('handle - Stale While Revalidate', () => {
    test('should serve stale content and trigger revalidation', async () => {
      const route = '/test-stale';
      const req = createMockRequest({ path: route });
      const res = createMockResponse();
      const next = createMockNext();

      // Create expired cache entry
      const expiredTime = Date.now() - 1000;
      await testCacheManager.createCacheEntry(route, {
        html: '<html><body>Stale Content</body></html>'
      }, { 
        timestamp: expiredTime, 
        ttl: 1 // 1 second TTL, already expired
      });

      // Spy on queue add method
      const queueAddSpy = jest.spyOn(middleware.queue, 'add');

      await middleware.handle(req, res, next);

      expect(res.setHeader).toHaveBeenCalledWith('X-Cache', 'STALE');
      expect(res.end).toHaveBeenCalledWith('<html><body>Stale Content</body></html>');
      expect(queueAddSpy).toHaveBeenCalledWith(route);
      expect(renderRoute).not.toHaveBeenCalled();
      expect(next).not.toHaveBeenCalled();

      queueAddSpy.mockRestore();
    });

    test('should handle concurrent requests to same stale route', async () => {
      const route = '/test-concurrent-stale';
      const requests = Array.from({ length: 3 }, () => ({
        req: createMockRequest({ path: route }),
        res: createMockResponse(),
        next: createMockNext()
      }));

      // Create expired cache entry
      await testCacheManager.createCacheEntry(route, {
        html: '<html><body>Stale Concurrent</body></html>'
      }, { ttl: 1 });

      // Wait for expiration
      await sleep(10);

      // Process all requests concurrently
      const promises = requests.map(({ req, res, next }) =>
        middleware.handle(req, res, next)
      );

      await Promise.all(promises);

      // All should receive stale content
      requests.forEach(({ res }) => {
        expect(res.setHeader).toHaveBeenCalledWith('X-Cache', 'STALE');
        expect(res.end).toHaveBeenCalledWith('<html><body>Stale Concurrent</body></html>');
      });
    });
  });

  describe('handle - Cache Miss', () => {
    test('should render and cache new content', async () => {
      const route = '/test-miss';
      const req = createMockRequest({ path: route });
      const res = createMockResponse();
      const next = createMockNext();

      const renderResult = {
        html: '<html><body>New Content</body></html>',
        context: { fresh: true }
      };
      renderRoute.mockResolvedValueOnce(renderResult);

      await middleware.handle(req, res, next);

      expect(renderRoute).toHaveBeenCalledWith(route);
      expect(res.setHeader).toHaveBeenCalledWith('X-Cache', 'MISS');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.end).toHaveBeenCalledWith(renderResult.html);
      expect(next).not.toHaveBeenCalled();

      // Verify content was cached
      const cached = await middleware.cache.get(route);
      expect(cached).not.toBeNull();
      expect(cached.html).toBe(renderResult.html);
      expect(cached.context).toEqual(renderResult.context);
    });

    test('should handle rendering errors', async () => {
      const route = '/test-error';
      const req = createMockRequest({ path: route });
      const res = createMockResponse();
      const next = createMockNext();

      const renderError = new Error('Rendering failed');
      renderRoute.mockRejectedValueOnce(renderError);

      await middleware.handle(req, res, next);

      expect(renderRoute).toHaveBeenCalledWith(route);
      expect(next).toHaveBeenCalledWith(renderError);
      expect(res.end).not.toHaveBeenCalled();

      // Verify nothing was cached
      const cached = await middleware.cache.get(route);
      expect(cached).toBeNull();
    });

    test('should respect custom TTL for different routes', async () => {
      const routes = [
        { path: '/news', expectedTTL: 300 },
        { path: '/about', expectedTTL: 86400 },
        { path: '/custom', expectedTTL: 300 }
      ];

      for (const { path, expectedTTL } of routes) {
        const req = createMockRequest({ path });
        const res = createMockResponse();
        const next = createMockNext();

        renderRoute.mockResolvedValueOnce({
          html: `<html><body>${path}</body></html>`,
          context: {}
        });

        await middleware.handle(req, res, next);

        const cached = await middleware.cache.get(path);
        expect(cached.ttl).toBe(expectedTTL * 1000); // TTL is stored in milliseconds
      }
    });
  });

  describe('getTTLForRoute', () => {
    test('should return correct TTL for news routes', () => {
      expect(middleware.getTTLForRoute('/')).toBe(300);
      expect(middleware.getTTLForRoute('/news')).toBe(300);
      expect(middleware.getTTLForRoute('/news/article')).toBe(300);
    });

    test('should return correct TTL for static routes', () => {
      expect(middleware.getTTLForRoute('/about')).toBe(86400);
      expect(middleware.getTTLForRoute('/contact')).toBe(86400);
      expect(middleware.getTTLForRoute('/about/team')).toBe(86400);
    });

    test('should return default TTL for unknown routes', () => {
      expect(middleware.getTTLForRoute('/unknown')).toBe(300);
      expect(middleware.getTTLForRoute('/custom/route')).toBe(300);
    });
  });

  describe('revalidate', () => {
    test('should delete cache and queue high-priority revalidation', async () => {
      const route = '/test-revalidate';

      // Create cache entry
      await testCacheManager.createCacheEntry(route, {
        html: '<html><body>To be revalidated</body></html>'
      });

      // Spy on queue add method
      const queueAddSpy = jest.spyOn(middleware.queue, 'add');

      const result = await middleware.revalidate(route);

      expect(result).toEqual({ revalidating: true, route });
      expect(await middleware.cache.get(route)).toBeNull();
      expect(queueAddSpy).toHaveBeenCalledWith(route, 'high');

      queueAddSpy.mockRestore();
    });

    test('should handle revalidation of non-existent cache', async () => {
      const route = '/non-existent';
      const queueAddSpy = jest.spyOn(middleware.queue, 'add');

      const result = await middleware.revalidate(route);

      expect(result).toEqual({ revalidating: true, route });
      expect(queueAddSpy).toHaveBeenCalledWith(route, 'high');

      queueAddSpy.mockRestore();
    });
  });

  describe('performance', () => {
    test('should serve cached content quickly', async () => {
      const route = '/performance-test';
      await testCacheManager.createCacheEntry(route, {
        html: '<html><body>Performance Test</body></html>'
      });

      const req = createMockRequest({ path: route });
      const res = createMockResponse();
      const next = createMockNext();

      const { time } = await timer.measure('cache-hit', async () => {
        await middleware.handle(req, res, next);
      });

      expect(time).toBeLessThan(50); // Should be very fast for cache hits
      expect(res.setHeader).toHaveBeenCalledWith('X-Cache', 'HIT');
    });

    test('should handle high concurrent load', async () => {
      const route = '/load-test';
      await testCacheManager.createCacheEntry(route, {
        html: '<html><body>Load Test</body></html>'
      });

      const concurrentRequests = 50;
      const promises = Array.from({ length: concurrentRequests }, async () => {
        const req = createMockRequest({ path: route });
        const res = createMockResponse();
        const next = createMockNext();
        await middleware.handle(req, res, next);
        return res;
      });

      const { time } = await timer.measure('concurrent-load', async () => {
        await Promise.all(promises);
      });

      const responses = await Promise.all(promises);

      expect(time).toBeLessThan(1000); // Should complete within 1 second
      responses.forEach(res => {
        expect(res.setHeader).toHaveBeenCalledWith('X-Cache', 'HIT');
        expect(res.end).toHaveBeenCalledWith('<html><body>Load Test</body></html>');
      });
    });
  });

  describe('error scenarios', () => {
    test('should handle cache corruption gracefully', async () => {
      const route = '/corrupt-cache';
      const req = createMockRequest({ path: route });
      const res = createMockResponse();
      const next = createMockNext();

      // Create corrupted cache file
      const cacheKey = middleware.cache.getCacheKey(route);
      const cachePath = middleware.cache.getCachePath(route);
      await fs.writeFile(cachePath, 'invalid json data');

      renderRoute.mockResolvedValueOnce({
        html: '<html><body>Recovered Content</body></html>',
        context: {}
      });

      await middleware.handle(req, res, next);

      expect(renderRoute).toHaveBeenCalledWith(route);
      expect(res.setHeader).toHaveBeenCalledWith('X-Cache', 'MISS');
      expect(res.end).toHaveBeenCalledWith('<html><body>Recovered Content</body></html>');
    });

    test('should handle filesystem errors during cache write', async () => {
      const route = '/cache-write-error';
      const req = createMockRequest({ path: route });
      const res = createMockResponse();
      const next = createMockNext();

      // Mock cache.set to fail
      const originalSet = middleware.cache.set;
      middleware.cache.set = jest.fn().mockRejectedValue(new Error('Disk full'));

      renderRoute.mockResolvedValueOnce({
        html: '<html><body>Content</body></html>',
        context: {}
      });

      // Should still serve the content even if caching fails
      await middleware.handle(req, res, next);

      expect(renderRoute).toHaveBeenCalledWith(route);
      expect(res.end).toHaveBeenCalledWith('<html><body>Content</body></html>');

      // Restore original method
      middleware.cache.set = originalSet;
    });

    test('should handle memory pressure gracefully', async () => {
      // Simulate memory pressure by creating many cache entries
      const routes = Array.from({ length: 100 }, (_, i) => `/memory-test-${i}`);
      
      for (const route of routes) {
        await testCacheManager.createCacheEntry(route, {
          html: `<html><body>Content ${route}</body></html>`
        });
      }

      const route = '/memory-test-new';
      const req = createMockRequest({ path: route });
      const res = createMockResponse();
      const next = createMockNext();

      renderRoute.mockResolvedValueOnce({
        html: '<html><body>New Content</body></html>',
        context: {}
      });

      await middleware.handle(req, res, next);

      expect(res.end).toHaveBeenCalledWith('<html><body>New Content</body></html>');
    });
  });

  describe('edge cases', () => {
    test('should handle routes with special characters', async () => {
      const route = '/test-route?param=value&other=123#fragment';
      const req = createMockRequest({ path: route });
      const res = createMockResponse();
      const next = createMockNext();

      renderRoute.mockResolvedValueOnce({
        html: '<html><body>Special Route</body></html>',
        context: {}
      });

      await middleware.handle(req, res, next);

      expect(renderRoute).toHaveBeenCalledWith(route);
      expect(res.end).toHaveBeenCalledWith('<html><body>Special Route</body></html>');
    });

    test('should handle empty routes', async () => {
      const route = '';
      const req = createMockRequest({ path: route });
      const res = createMockResponse();
      const next = createMockNext();

      renderRoute.mockResolvedValueOnce({
        html: '<html><body>Empty Route</body></html>',
        context: {}
      });

      await middleware.handle(req, res, next);

      expect(renderRoute).toHaveBeenCalledWith(route);
    });

    test('should handle very long routes', async () => {
      const route = '/very-long-route-' + 'a'.repeat(1000);
      const req = createMockRequest({ path: route });
      const res = createMockResponse();
      const next = createMockNext();

      renderRoute.mockResolvedValueOnce({
        html: '<html><body>Long Route</body></html>',
        context: {}
      });

      await middleware.handle(req, res, next);

      expect(renderRoute).toHaveBeenCalledWith(route);
      expect(res.end).toHaveBeenCalledWith('<html><body>Long Route</body></html>');
    });
  });

  describe('cache management', () => {
    test('should purge expired cache entries periodically', async () => {
      // This is more of an integration test, but important for long-running processes
      const expiredRoute = '/expired';
      const freshRoute = '/fresh';

      // Create expired entry
      await testCacheManager.createCacheEntry(expiredRoute, {
        html: '<html><body>Expired</body></html>'
      }, { 
        timestamp: Date.now() - 1000,
        ttl: 1 
      });

      // Create fresh entry
      await testCacheManager.createCacheEntry(freshRoute, {
        html: '<html><body>Fresh</body></html>'
      }, { ttl: 3600 });

      // Trigger purge manually (in real system this happens automatically)
      await middleware.cache.purgeExpired();

      const expiredResult = await middleware.cache.get(expiredRoute);
      const freshResult = await middleware.cache.get(freshRoute);

      expect(expiredResult).toBeNull();
      expect(freshResult).not.toBeNull();
    });

    test('should handle cache directory permission issues', async () => {
      // Create a middleware with invalid cache directory
      const invalidDir = '/invalid/cache/dir/that/does/not/exist';
      const invalidMiddleware = new ISRMiddleware({ cacheDir: invalidDir });

      const route = '/permission-test';
      const req = createMockRequest({ path: route });
      const res = createMockResponse();
      const next = createMockNext();

      renderRoute.mockResolvedValueOnce({
        html: '<html><body>Permission Test</body></html>',
        context: {}
      });

      // Should still work even if cache directory is invalid
      await invalidMiddleware.handle(req, res, next);

      expect(renderRoute).toHaveBeenCalledWith(route);
      expect(res.end).toHaveBeenCalledWith('<html><body>Permission Test</body></html>');
    });
  });
});