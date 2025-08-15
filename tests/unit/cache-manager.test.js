// Unit tests for CacheManager
import { describe, test, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { CacheManager } from '../../server/isr/cache-manager.js';
import { TestCacheManager, validateCacheEntry, PerformanceTimer, sleep } from '../utils/test-helpers.js';
import fs from 'fs/promises';
import path from 'path';

describe('CacheManager', () => {
  let cacheManager;
  let testCacheManager;
  let testCacheDir;
  let timer;

  beforeEach(async () => {
    testCacheDir = await global.createTempDir('cache-manager-test');
    cacheManager = new CacheManager(testCacheDir);
    testCacheManager = new TestCacheManager(testCacheDir);
    timer = new PerformanceTimer();
    await cacheManager.init();
    
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
    test('should create cache manager with default directory', () => {
      const defaultManager = new CacheManager();
      expect(defaultManager.cacheDir).toBe('./cache');
    });

    test('should create cache manager with custom directory', () => {
      expect(cacheManager.cacheDir).toBe(testCacheDir);
    });
  });

  describe('getCacheKey', () => {
    test('should generate consistent MD5 hash for route', () => {
      const route = '/test-route';
      const key1 = cacheManager.getCacheKey(route);
      const key2 = cacheManager.getCacheKey(route);
      
      expect(key1).toBe(key2);
      expect(key1).toMatch(/^[a-f0-9]{32}$/);
    });

    test('should generate different keys for different routes', () => {
      const key1 = cacheManager.getCacheKey('/route1');
      const key2 = cacheManager.getCacheKey('/route2');
      
      expect(key1).not.toBe(key2);
    });
  });

  describe('set and get', () => {
    test('should store and retrieve cache data', async () => {
      const route = '/test-route';
      const data = {
        html: '<html><body>Test</body></html>',
        context: { page: 'test' }
      };

      const cacheData = await cacheManager.set(route, data, 300);
      const retrieved = await cacheManager.get(route);

      expect(retrieved).toEqual(cacheData);
      expect(retrieved.route).toBe(route);
      expect(retrieved.html).toBe(data.html);
      expect(retrieved.context).toEqual(data.context);
      validateCacheEntry(retrieved);
    });

    test('should return null for non-existent cache', async () => {
      const retrieved = await cacheManager.get('/non-existent');
      expect(retrieved).toBeNull();
    });

    test('should set TTL correctly', async () => {
      const route = '/test-ttl';
      const data = { html: '<html></html>', context: {} };
      const ttl = 600; // 10 minutes

      const cacheData = await cacheManager.set(route, data, ttl);
      
      expect(cacheData.ttl).toBe(ttl * 1000); // Should be in milliseconds
      expect(cacheData.expiresAt).toBe(cacheData.timestamp + (ttl * 1000));
    });
  });

  describe('delete', () => {
    test('should delete existing cache entry', async () => {
      const route = '/test-delete';
      const data = { html: '<html></html>', context: {} };

      await cacheManager.set(route, data);
      const result = await cacheManager.delete(route);
      const retrieved = await cacheManager.get(route);

      expect(result).toBe(true);
      expect(retrieved).toBeNull();
    });

    test('should return false for non-existent cache entry', async () => {
      const result = await cacheManager.delete('/non-existent');
      expect(result).toBe(false);
    });
  });

  describe('isStale', () => {
    test('should return true for null cache data', () => {
      expect(cacheManager.isStale(null)).toBe(true);
      expect(cacheManager.isStale(undefined)).toBe(true);
    });

    test('should return true for expired cache', () => {
      const expiredCache = {
        expiresAt: Date.now() - 1000 // 1 second ago
      };
      expect(cacheManager.isStale(expiredCache)).toBe(true);
    });

    test('should return false for fresh cache', () => {
      const freshCache = {
        expiresAt: Date.now() + 1000 // 1 second from now
      };
      expect(cacheManager.isStale(freshCache)).toBe(false);
    });
  });

  describe('purgeExpired', () => {
    test('should remove expired cache entries', async () => {
      // Create expired cache entry
      const expiredTime = Date.now() - 1000;
      await testCacheManager.createCacheEntry('/expired', 
        { html: '<html></html>' }, 
        { timestamp: expiredTime, ttl: 1 }
      );

      // Create fresh cache entry
      await testCacheManager.createCacheEntry('/fresh', 
        { html: '<html></html>' }, 
        { ttl: 3600 }
      );

      await cacheManager.purgeExpired();

      const expiredResult = await cacheManager.get('/expired');
      const freshResult = await cacheManager.get('/fresh');

      expect(expiredResult).toBeNull();
      expect(freshResult).not.toBeNull();
    });

    test('should handle empty cache directory', async () => {
      // This should not throw an error
      await expect(cacheManager.purgeExpired()).resolves.toBeUndefined();
    });
  });

  describe('error handling', () => {
    test('should handle file system errors gracefully', async () => {
      // Try to read from a file that doesn't exist
      const result = await cacheManager.get('/non-existent');
      expect(result).toBeNull();
    });

    test('should handle invalid JSON in cache files', async () => {
      // Create invalid cache file
      const cacheKey = cacheManager.getCacheKey('/invalid');
      const cachePath = cacheManager.getCachePath('/invalid');
      await fs.writeFile(cachePath, 'invalid json content');

      const result = await cacheManager.get('/invalid');
      expect(result).toBeNull();
    });

    test('should handle permission errors during cache write', async () => {
      // Create a read-only directory
      const readOnlyDir = path.join(testCacheDir, 'readonly');
      await fs.mkdir(readOnlyDir, { recursive: true });
      await fs.chmod(readOnlyDir, 0o444); // Read-only

      const readOnlyManager = new CacheManager(readOnlyDir);
      const data = { html: '<html></html>', context: {} };

      // Should handle the error gracefully
      await expect(readOnlyManager.set('/test', data)).rejects.toThrow();

      // Restore permissions for cleanup
      await fs.chmod(readOnlyDir, 0o755);
    });

    test('should handle disk full scenarios', async () => {
      // Mock fs.writeFile to simulate disk full
      const originalWriteFile = fs.writeFile;
      fs.writeFile = jest.fn().mockRejectedValue(new Error('ENOSPC: no space left on device'));

      const data = { html: '<html></html>', context: {} };

      await expect(cacheManager.set('/disk-full', data)).rejects.toThrow('ENOSPC');

      // Restore original function
      fs.writeFile = originalWriteFile;
    });
  });

  describe('performance', () => {
    test('should handle large cache entries efficiently', async () => {
      const route = '/large-content';
      const largeHtml = '<html><body>' + 'x'.repeat(100000) + '</body></html>';
      const data = { html: largeHtml, context: { large: true } };

      const { time: writeTime } = await timer.measure('large-write', async () => {
        await cacheManager.set(route, data);
      });

      const { time: readTime } = await timer.measure('large-read', async () => {
        await cacheManager.get(route);
      });

      expect(writeTime).toBeLessThan(1000); // Should write in less than 1s
      expect(readTime).toBeLessThan(100);   // Should read in less than 100ms
    });

    test('should handle many concurrent cache operations', async () => {
      const routes = Array.from({ length: 50 }, (_, i) => `/concurrent-${i}`);
      const data = { html: '<html><body>Concurrent Test</body></html>', context: {} };

      const { time: writeTime } = await timer.measure('concurrent-writes', async () => {
        const promises = routes.map(route => cacheManager.set(route, data));
        await Promise.all(promises);
      });

      const { time: readTime } = await timer.measure('concurrent-reads', async () => {
        const promises = routes.map(route => cacheManager.get(route));
        await Promise.all(promises);
      });

      expect(writeTime).toBeLessThan(2000); // Should complete within 2 seconds
      expect(readTime).toBeLessThan(500);   // Should read all within 500ms

      // Verify all entries were created
      const cacheFiles = await testCacheManager.getCacheFiles();
      expect(cacheFiles.length).toBeGreaterThanOrEqual(routes.length);
    });

    test('should have consistent performance with cache size growth', async () => {
      const baseTimes = [];
      const largeTimes = [];

      // Test with small cache
      for (let i = 0; i < 5; i++) {
        const { time } = await timer.measure(`base-${i}`, async () => {
          await cacheManager.set(`/base-${i}`, { html: '<html></html>', context: {} });
        });
        baseTimes.push(time);
      }

      // Create large cache (100 entries)
      for (let i = 0; i < 100; i++) {
        await cacheManager.set(`/load-${i}`, { html: '<html></html>', context: {} });
      }

      // Test performance with large cache
      for (let i = 0; i < 5; i++) {
        const { time } = await timer.measure(`large-${i}`, async () => {
          await cacheManager.set(`/large-${i}`, { html: '<html></html>', context: {} });
        });
        largeTimes.push(time);
      }

      const avgBaseTime = baseTimes.reduce((a, b) => a + b, 0) / baseTimes.length;
      const avgLargeTime = largeTimes.reduce((a, b) => a + b, 0) / largeTimes.length;

      // Performance shouldn't degrade significantly with cache size
      expect(avgLargeTime).toBeLessThan(avgBaseTime * 3);
    });
  });

  describe('concurrent operations', () => {
    test('should handle concurrent reads and writes safely', async () => {
      const route = '/concurrent-rw';
      const initialData = { html: '<html><body>Initial</body></html>', context: { version: 1 } };
      
      await cacheManager.set(route, initialData);

      // Start multiple readers and writers
      const readers = Array.from({ length: 10 }, () => cacheManager.get(route));
      const writers = Array.from({ length: 5 }, (_, i) => 
        cacheManager.set(route, { 
          html: `<html><body>Version ${i + 2}</body></html>`, 
          context: { version: i + 2 } 
        })
      );

      const results = await Promise.all([...readers, ...writers]);
      const readResults = results.slice(0, 10);
      const writeResults = results.slice(10);

      // All reads should return valid cache entries
      readResults.forEach(result => {
        expect(result).not.toBeNull();
        expect(result.html).toContain('html');
      });

      // All writes should succeed
      writeResults.forEach(result => {
        expect(result).not.toBeNull();
        expect(result.route).toBe(route);
      });
    });

    test('should handle concurrent deletes safely', async () => {
      const routes = Array.from({ length: 20 }, (_, i) => `/delete-${i}`);
      
      // Create all cache entries
      for (const route of routes) {
        await cacheManager.set(route, { html: '<html></html>', context: {} });
      }

      // Delete all concurrently
      const deletePromises = routes.map(route => cacheManager.delete(route));
      const results = await Promise.all(deletePromises);

      // All deletes should succeed
      results.forEach(result => {
        expect(result).toBe(true);
      });

      // Verify all entries are deleted
      for (const route of routes) {
        const cached = await cacheManager.get(route);
        expect(cached).toBeNull();
      }
    });
  });

  describe('cache expiry edge cases', () => {
    test('should handle entries expiring at exact boundary', async () => {
      const route = '/boundary-test';
      const now = Date.now();
      const ttl = 1; // 1 second
      
      const data = { html: '<html></html>', context: {} };
      await cacheManager.set(route, data, ttl);
      
      const cached = await cacheManager.get(route);
      expect(cached.expiresAt).toBe(now + 1000);
      
      // Should not be stale immediately
      expect(cacheManager.isStale(cached)).toBe(false);
      
      // Wait for expiry
      await sleep(1100);
      
      // Should be stale now
      expect(cacheManager.isStale(cached)).toBe(true);
    });

    test('should handle very short TTL values', async () => {
      const route = '/short-ttl';
      const data = { html: '<html></html>', context: {} };
      
      await cacheManager.set(route, data, 0.001); // 1ms
      await sleep(10); // Wait longer than TTL
      
      const cached = await cacheManager.get(route);
      expect(cacheManager.isStale(cached)).toBe(true);
    });

    test('should handle very long TTL values', async () => {
      const route = '/long-ttl';
      const data = { html: '<html></html>', context: {} };
      const longTTL = 86400; // 24 hours
      
      const cached = await cacheManager.set(route, data, longTTL);
      
      expect(cached.ttl).toBe(longTTL * 1000);
      expect(cached.expiresAt).toBe(cached.timestamp + (longTTL * 1000));
      expect(cacheManager.isStale(cached)).toBe(false);
    });
  });

  describe('cache key generation', () => {
    test('should handle special characters in routes', () => {
      const specialRoutes = [
        '/route with spaces',
        '/route?param=value&other=123',
        '/route#fragment',
        '/route/with/unicode/characters/测试',
        '/route/with/émojis/👍',
        '/route/with\backslashes',
        '/route/with|pipes'
      ];

      specialRoutes.forEach(route => {
        const key = cacheManager.getCacheKey(route);
        expect(key).toMatch(/^[a-f0-9]{32}$/);
        expect(key.length).toBe(32);
      });
    });

    test('should generate unique keys for similar routes', () => {
      const similarRoutes = [
        '/article/123',
        '/article/124',
        '/article/12',
        '/article/1234',
        '/articles/123',
        '/article/123/',
        '/article/123?view=full'
      ];

      const keys = similarRoutes.map(route => cacheManager.getCacheKey(route));
      const uniqueKeys = new Set(keys);
      
      expect(uniqueKeys.size).toBe(keys.length);
    });

    test('should handle empty and null routes', () => {
      expect(() => cacheManager.getCacheKey('')).not.toThrow();
      expect(() => cacheManager.getCacheKey(null)).not.toThrow();
      expect(() => cacheManager.getCacheKey(undefined)).not.toThrow();
      
      const emptyKey = cacheManager.getCacheKey('');
      const nullKey = cacheManager.getCacheKey(null);
      const undefinedKey = cacheManager.getCacheKey(undefined);
      
      expect(emptyKey).toMatch(/^[a-f0-9]{32}$/);
      expect(nullKey).toMatch(/^[a-f0-9]{32}$/);
      expect(undefinedKey).toMatch(/^[a-f0-9]{32}$/);
    });
  });

  describe('cache directory management', () => {
    test('should create cache directory if it does not exist', async () => {
      const newCacheDir = path.join(testCacheDir, 'new-cache');
      const newManager = new CacheManager(newCacheDir);
      
      await newManager.init();
      
      const stats = await fs.stat(newCacheDir);
      expect(stats.isDirectory()).toBe(true);
    });

    test('should handle nested cache directory paths', async () => {
      const nestedDir = path.join(testCacheDir, 'level1', 'level2', 'cache');
      const nestedManager = new CacheManager(nestedDir);
      
      await nestedManager.init();
      
      const stats = await fs.stat(nestedDir);
      expect(stats.isDirectory()).toBe(true);
      
      // Should be able to cache normally
      const data = { html: '<html></html>', context: {} };
      await nestedManager.set('/test', data);
      
      const cached = await nestedManager.get('/test');
      expect(cached).not.toBeNull();
    });

    test('should handle cache directory creation failures gracefully', async () => {
      // Try to create cache in a location that requires root access
      const restrictedManager = new CacheManager('/root/cache');
      
      // Should not throw, but log error
      await expect(restrictedManager.init()).resolves.toBeUndefined();
    });
  });

  describe('data integrity', () => {
    test('should preserve complex data structures', async () => {
      const route = '/complex-data';
      const complexData = {
        html: '<html><body>Complex Test</body></html>',
        context: {
          nested: {
            array: [1, 2, 3, { deep: 'value' }],
            boolean: true,
            number: 42,
            string: 'test string',
            nullValue: null,
            undefinedValue: undefined
          },
          metadata: {
            timestamp: Date.now(),
            version: '1.0.0',
            tags: ['test', 'cache', 'isr']
          }
        }
      };

      await cacheManager.set(route, complexData);
      const retrieved = await cacheManager.get(route);

      expect(retrieved.html).toBe(complexData.html);
      expect(retrieved.context.nested.array).toEqual(complexData.context.nested.array);
      expect(retrieved.context.nested.boolean).toBe(complexData.context.nested.boolean);
      expect(retrieved.context.metadata).toEqual(complexData.context.metadata);
      expect(retrieved.context.nested.nullValue).toBe(null);
      expect(retrieved.context.nested.undefinedValue).toBe(null); // JSON converts undefined to null
    });

    test('should handle very large context objects', async () => {
      const route = '/large-context';
      const largeContext = {
        bigArray: Array.from({ length: 10000 }, (_, i) => ({ id: i, value: `item-${i}` })),
        bigString: 'x'.repeat(50000),
        nested: {}
      };

      // Create deeply nested structure
      let current = largeContext.nested;
      for (let i = 0; i < 100; i++) {
        current.next = { level: i, data: `level-${i}` };
        current = current.next;
      }

      const data = {
        html: '<html><body>Large Context</body></html>',
        context: largeContext
      };

      const { time } = await timer.measure('large-context', async () => {
        await cacheManager.set(route, data);
        return await cacheManager.get(route);
      });

      expect(time).toBeLessThan(2000); // Should handle large data reasonably fast

      const retrieved = await cacheManager.get(route);
      expect(retrieved.context.bigArray).toHaveLength(10000);
      expect(retrieved.context.bigString.length).toBe(50000);
    });
  });

  describe('batch operations', () => {
    test('should handle batch cache operations efficiently', async () => {
      const batchSize = 100;
      const routes = Array.from({ length: batchSize }, (_, i) => `/batch-${i}`);
      const data = { html: '<html><body>Batch Test</body></html>', context: { batch: true } };

      // Batch write
      const { time: batchWriteTime } = await timer.measure('batch-write', async () => {
        const promises = routes.map(route => cacheManager.set(route, data));
        await Promise.all(promises);
      });

      // Batch read
      const { time: batchReadTime } = await timer.measure('batch-read', async () => {
        const promises = routes.map(route => cacheManager.get(route));
        await Promise.all(promises);
      });

      expect(batchWriteTime).toBeLessThan(5000); // 100 writes in less than 5 seconds
      expect(batchReadTime).toBeLessThan(1000);  // 100 reads in less than 1 second

      // Verify all entries exist
      for (const route of routes.slice(0, 10)) { // Verify first 10
        const cached = await cacheManager.get(route);
        expect(cached).not.toBeNull();
        expect(cached.context.batch).toBe(true);
      }
    });

    test('should handle mixed batch operations', async () => {
      const routes = Array.from({ length: 50 }, (_, i) => `/mixed-${i}`);
      
      // Create initial cache entries
      for (let i = 0; i < 25; i++) {
        await cacheManager.set(routes[i], { html: '<html></html>', context: {} });
      }

      // Mix of reads, writes, and deletes
      const operations = [
        ...routes.slice(0, 15).map(route => () => cacheManager.get(route)),
        ...routes.slice(15, 35).map(route => () => cacheManager.set(route, { html: '<html>New</html>', context: {} })),
        ...routes.slice(35, 50).map(route => () => cacheManager.delete(route))
      ];

      const { time } = await timer.measure('mixed-batch', async () => {
        const promises = operations.map(op => op());
        await Promise.all(promises);
      });

      expect(time).toBeLessThan(3000); // Should complete mixed operations quickly
    });
  });
});