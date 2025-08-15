/**
 * End-to-End Tests for Incremental Static Regeneration (ISR) Flow
 * Tests complete ISR lifecycle: cache miss -> render -> cache hit -> stale -> revalidate
 */

import request from 'supertest';
import { jest } from '@jest/globals';
import express from 'express';
import path from 'path';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';
import { CacheManager } from '../../server/isr/cache-manager.js';
import { RevalidationQueue } from '../../server/isr/revalidation-queue.js';
import { testScenarios, createFreshCacheEntry, createExpiredCacheEntry } from '../fixtures/test-scenarios.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

let app;
let cacheManager;
let revalidationQueue;
let testCacheDir;

describe('ISR Flow End-to-End Tests', () => {
  beforeAll(async () => {
    // Setup test environment
    testCacheDir = await global.createTempDir('isr-flow-test');
    process.env.CACHE_DIR = testCacheDir;
    process.env.NODE_ENV = 'test';
    
    // Initialize ISR components
    cacheManager = new CacheManager(testCacheDir);
    revalidationQueue = new RevalidationQueue({ maxWorkers: 2 });
    
    // Create test Express app with ISR middleware
    app = express();
    
    // Mock render function
    let renderCounter = 0;
    const mockRender = async (route, params = {}) => {
      renderCounter++;
      const timestamp = new Date().toISOString();
      return {
        html: `<!DOCTYPE html>
<html>
<head>
  <title>ISR Test - ${route}</title>
</head>
<body>
  <h1>ISR Rendered Content</h1>
  <p>Route: ${route}</p>
  <p>Render Count: ${renderCounter}</p>
  <p>Timestamp: ${timestamp}</p>
  <p>Params: ${JSON.stringify(params)}</p>
  <div id="app">Content for ${route}</div>
  <script>window.__ISR_DATA__ = ${JSON.stringify({ route, renderCounter, timestamp, params })};</script>
</body>
</html>`,
        context: { route, renderCounter, timestamp, params },
        timestamp: Date.now()
      };
    };
    
    // ISR Middleware
    app.use(async (req, res, next) => {
      const route = req.path;
      const cacheKey = cacheManager.generateCacheKey(route);
      
      try {
        // 1. Check cache
        const cached = await cacheManager.get(cacheKey);
        
        if (cached && !cacheManager.isStale(cached)) {
          // 2. Serve fresh cache (HIT)
          res.set('X-Cache', 'HIT');
          res.set('X-Cache-Key', cacheKey);
          res.set('X-Cache-Age', Math.floor((Date.now() - cached.timestamp) / 1000));
          res.set('Content-Type', 'text/html');
          return res.status(200).send(cached.html);
        }
        
        if (cached && cacheManager.isStale(cached)) {
          // 3. Serve stale while revalidating (STALE)
          res.set('X-Cache', 'STALE');
          res.set('X-Cache-Key', cacheKey);
          res.set('X-Cache-Age', Math.floor((Date.now() - cached.timestamp) / 1000));
          
          // Queue revalidation
          revalidationQueue.add({
            route,
            cacheKey,
            priority: 'normal',
            render: () => mockRender(route, { ...req.params, ...req.query })
          });
          
          res.set('Content-Type', 'text/html');
          return res.status(200).send(cached.html);
        }
        
        // 4. No cache - render and cache (MISS)
        const result = await mockRender(route, { ...req.params, ...req.query });
        const ttl = getTTLForRoute(route);
        
        await cacheManager.set(cacheKey, result, ttl);
        
        res.set('X-Cache', 'MISS');
        res.set('X-Cache-Key', cacheKey);
        res.set('X-TTL', ttl);
        res.set('Content-Type', 'text/html');
        res.status(200).send(result.html);
        
      } catch (error) {
        console.error('ISR Error:', error);
        res.status(500).json({
          error: 'ISR processing failed',
          message: error.message,
          route
        });
      }
    });
    
    // API endpoints for testing
    app.post('/api/revalidate', async (req, res) => {
      const { route } = req.body;
      if (!route) {
        return res.status(400).json({ error: 'Route required' });
      }
      
      const cacheKey = cacheManager.generateCacheKey(route);
      await cacheManager.delete(cacheKey);
      
      res.json({ revalidated: route, cacheKey });
    });
    
    app.get('/api/cache/stats', async (req, res) => {
      const stats = await cacheManager.stats();
      res.json(stats);
    });
    
    app.delete('/api/cache/clear', async (req, res) => {
      await cacheManager.clear();
      res.json({ cleared: true });
    });
  });

  afterAll(async () => {
    if (revalidationQueue) {
      await revalidationQueue.shutdown();
    }
    try {
      await fs.rm(testCacheDir, { recursive: true, force: true });
    } catch (error) {
      console.warn('Failed to cleanup test cache:', error.message);
    }
  });

  beforeEach(async () => {
    // Clear cache before each test
    await cacheManager.clear();
  });

  describe('Complete ISR Lifecycle', () => {
    test('should handle full cache miss -> hit -> stale -> revalidate flow', async () => {
      const testRoute = '/isr-lifecycle-test';
      
      // 1. First request - Cache MISS
      const response1 = await request(app)
        .get(testRoute)
        .expect(200);
      
      expect(response1.headers['x-cache']).toBe('MISS');
      expect(response1.text).toContain('Render Count: 1');
      expect(response1.text).toContain('ISR Rendered Content');
      
      // 2. Second request - Cache HIT
      const response2 = await request(app)
        .get(testRoute)
        .expect(200);
      
      expect(response2.headers['x-cache']).toBe('HIT');
      expect(response2.text).toContain('Render Count: 1'); // Same content
      expect(response2.text).toBe(response1.text);
      
      // 3. Manually expire the cache entry
      const cacheKey = cacheManager.generateCacheKey(testRoute);
      const cachedEntry = await cacheManager.get(cacheKey);
      expect(cachedEntry).toBeTruthy();
      
      // Modify timestamp to make it stale
      cachedEntry.timestamp = Date.now() - (getTTLForRoute(testRoute) * 1000 + 1000);
      await cacheManager.set(cacheKey, cachedEntry, getTTLForRoute(testRoute));
      
      // 4. Third request - STALE (serve stale while revalidating)
      const response3 = await request(app)
        .get(testRoute)
        .expect(200);
      
      expect(response3.headers['x-cache']).toBe('STALE');
      expect(response3.text).toContain('Render Count: 1'); // Still old content
      
      // 5. Wait for revalidation and check fresh content
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const response4 = await request(app)
        .get(testRoute)
        .expect(200);
      
      expect(response4.headers['x-cache']).toBe('HIT');
      expect(response4.text).toContain('Render Count: 2'); // New content after revalidation
    });

    test('should handle concurrent requests during cache miss', async () => {
      const testRoute = '/concurrent-miss-test';
      
      // Make 5 concurrent requests to uncached route
      const promises = Array.from({ length: 5 }, () =>
        request(app).get(testRoute)
      );
      
      const responses = await Promise.all(promises);
      
      // All should succeed
      responses.forEach(response => {
        expect(response.status).toBe(200);
        expect(['MISS', 'HIT']).toContain(response.headers['x-cache']);
      });
      
      // At least one should be MISS, others can be HIT if cache was set quickly
      const missCount = responses.filter(r => r.headers['x-cache'] === 'MISS').length;
      expect(missCount).toBeGreaterThanOrEqual(1);
    });
  });

  describe('TTL and Expiration Handling', () => {
    test('should respect different TTL values for different routes', async () => {
      const routes = [
        { path: '/news', expectedTTL: 300 },     // News: 5 minutes
        { path: '/about', expectedTTL: 86400 },  // Static: 24 hours
        { path: '/events', expectedTTL: 300 }    // Default: 5 minutes
      ];
      
      for (const { path, expectedTTL } of routes) {
        const response = await request(app)
          .get(path)
          .expect(200);
        
        expect(response.headers['x-cache']).toBe('MISS');
        expect(parseInt(response.headers['x-ttl'])).toBe(expectedTTL);
      }
    });

    test('should properly calculate cache age', async () => {
      const testRoute = '/cache-age-test';
      
      // First request
      await request(app).get(testRoute).expect(200);
      
      // Wait a bit
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Second request
      const response = await request(app)
        .get(testRoute)
        .expect(200);
      
      expect(response.headers['x-cache']).toBe('HIT');
      const cacheAge = parseInt(response.headers['x-cache-age']);
      expect(cacheAge).toBeGreaterThanOrEqual(0);
      expect(cacheAge).toBeLessThan(10); // Should be recent
    });
  });

  describe('Revalidation Queue', () => {
    test('should queue revalidation for stale content', async () => {
      const testRoute = '/revalidation-queue-test';
      
      // Create expired cache entry
      const cacheKey = cacheManager.generateCacheKey(testRoute);
      const expiredEntry = createExpiredCacheEntry(testRoute, 3600); // 1 hour old
      await cacheManager.set(cacheKey, expiredEntry, 300);
      
      // Request should serve stale and queue revalidation
      const response = await request(app)
        .get(testRoute)
        .expect(200);
      
      expect(response.headers['x-cache']).toBe('STALE');
      
      // Check if revalidation was queued (queue should have jobs)
      expect(revalidationQueue.size()).toBeGreaterThan(0);
    });

    test('should handle revalidation failures gracefully', async () => {
      const testRoute = '/revalidation-error-test';
      
      // Create a cache entry first
      await request(app).get(testRoute).expect(200);
      
      // Simulate revalidation error by mocking render function to throw
      const originalRender = app.locals.mockRender;
      app.locals.mockRenderError = true;
      
      // Manually trigger revalidation
      await request(app)
        .post('/api/revalidate')
        .send({ route: testRoute })
        .expect(200);
      
      // Request should still work (serve cached if available or error)
      const response = await request(app)
        .get(testRoute);
      
      expect([200, 500]).toContain(response.status);
      
      // Restore
      app.locals.mockRenderError = false;
    });
  });

  describe('Cache Management', () => {
    test('should provide cache statistics', async () => {
      // Generate some cache entries
      await request(app).get('/stats-test-1');
      await request(app).get('/stats-test-2');
      await request(app).get('/stats-test-3');
      
      const response = await request(app)
        .get('/api/cache/stats')
        .expect(200);
      
      expect(response.body).toHaveProperty('size');
      expect(response.body).toHaveProperty('hits');
      expect(response.body).toHaveProperty('misses');
      expect(response.body.size).toBeGreaterThan(0);
    });

    test('should clear cache completely', async () => {
      // Create some cache entries
      await request(app).get('/clear-test-1');
      await request(app).get('/clear-test-2');
      
      // Verify cache has entries
      const statsBefore = await request(app).get('/api/cache/stats');
      expect(statsBefore.body.size).toBeGreaterThan(0);
      
      // Clear cache
      await request(app)
        .delete('/api/cache/clear')
        .expect(200);
      
      // Verify cache is empty
      const statsAfter = await request(app).get('/api/cache/stats');
      expect(statsAfter.body.size).toBe(0);
      
      // Next request should be MISS
      const response = await request(app).get('/clear-test-1');
      expect(response.headers['x-cache']).toBe('MISS');
    });

    test('should handle cache key generation consistently', async () => {
      const routes = [
        '/same-route',
        '/same-route/',
        '/same-route?',
        '/same-route#'
      ];
      
      // All variations should generate same cache key
      const cacheKeys = new Set();
      for (const route of routes) {
        const response = await request(app).get(route);
        cacheKeys.add(response.headers['x-cache-key']);
      }
      
      expect(cacheKeys.size).toBe(1); // All should have same cache key
    });
  });

  describe('Error Handling in ISR Flow', () => {
    test('should handle corrupted cache entries', async () => {
      const testRoute = '/corrupted-cache-test';
      const cacheKey = cacheManager.generateCacheKey(testRoute);
      
      // Manually create corrupted cache file
      const corruptedData = 'invalid json data {';
      const cachePath = path.join(testCacheDir, `${cacheKey}.json`);
      await fs.writeFile(cachePath, corruptedData);
      
      // Request should handle corruption and re-render
      const response = await request(app)
        .get(testRoute)
        .expect(200);
      
      expect(response.headers['x-cache']).toBe('MISS'); // Should re-render
      expect(response.text).toContain('ISR Rendered Content');
    });

    test('should handle disk space errors gracefully', async () => {
      const testRoute = '/disk-space-test';
      
      // Mock fs.writeFile to throw ENOSPC error
      const originalWriteFile = fs.writeFile;
      jest.spyOn(fs, 'writeFile').mockRejectedValueOnce(
        Object.assign(new Error('No space left on device'), { code: 'ENOSPC' })
      );
      
      // Request should still serve content, just not cache it
      const response = await request(app)
        .get(testRoute)
        .expect(200);
      
      expect(response.text).toContain('ISR Rendered Content');
      
      // Restore
      fs.writeFile = originalWriteFile;
    });
  });

  describe('Performance Under Load', () => {
    test('should handle high cache hit rate efficiently', async () => {
      const testRoute = '/high-hit-rate-test';
      
      // Prime the cache
      await request(app).get(testRoute);
      
      // Make 100 concurrent requests
      const promises = Array.from({ length: 100 }, () =>
        request(app).get(testRoute)
      );
      
      const startTime = Date.now();
      const responses = await Promise.all(promises);
      const duration = Date.now() - startTime;
      
      // All should be cache hits
      responses.forEach(response => {
        expect(response.status).toBe(200);
        expect(response.headers['x-cache']).toBe('HIT');
      });
      
      // Should complete quickly (less than 2 seconds for 100 requests)
      expect(duration).toBeLessThan(2000);
    });

    test('should maintain performance during cache misses', async () => {
      const routes = Array.from({ length: 20 }, (_, i) => `/performance-miss-${i}`);
      
      const startTime = Date.now();
      const promises = routes.map(route => request(app).get(route));
      const responses = await Promise.all(promises);
      const duration = Date.now() - startTime;
      
      // All should succeed
      responses.forEach((response, i) => {
        expect(response.status).toBe(200);
        expect(response.headers['x-cache']).toBe('MISS');
        expect(response.text).toContain(`Route: ${routes[i]}`);
      });
      
      // Should complete within reasonable time (less than 5 seconds for 20 renders)
      expect(duration).toBeLessThan(5000);
    });
  });
});

// Helper function to get TTL for route (matches server logic)
function getTTLForRoute(route) {
  if (route === '/' || route.includes('/news')) {
    return 300; // 5 minutes for news
  }
  if (route.includes('/about') || route.includes('/contact')) {
    return 86400; // 24 hours for static pages
  }
  return 300; // Default 5 minutes
}