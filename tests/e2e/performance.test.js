/**
 * End-to-End Performance Benchmarks and Load Testing
 * Tests system performance under various load conditions and measures key metrics
 */

import request from 'supertest';
import { jest } from '@jest/globals';
import express from 'express';
import path from 'path';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';
import { performance, PerformanceObserver } from 'perf_hooks';
import { CacheManager } from '../../server/isr/cache-manager.js';
import { performanceBenchmarks } from '../fixtures/test-scenarios.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

let app;
let cacheManager;
let testCacheDir;
let performanceMetrics = {};

// Performance observer for detailed metrics
const obs = new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
    if (!performanceMetrics[entry.name]) {
      performanceMetrics[entry.name] = [];
    }
    performanceMetrics[entry.name].push(entry.duration);
  }
});

describe('Performance Benchmarks E2E Tests', () => {
  beforeAll(async () => {
    testCacheDir = await global.createTempDir('performance-test');
    process.env.CACHE_DIR = testCacheDir;
    process.env.NODE_ENV = 'test';
    
    // Start performance monitoring
    obs.observe({ entryTypes: ['measure', 'navigation', 'resource'] });
    
    // Initialize cache manager
    cacheManager = new CacheManager(testCacheDir);
    
    // Create performance test app
    app = express();
    app.use(express.json());
    
    // Request counter for load testing
    let requestCounter = 0;
    let renderCounter = 0;
    
    // Mock heavy computation for testing
    const heavyComputation = async (duration = 100) => {
      const start = Date.now();
      while (Date.now() - start < duration) {
        // CPU-intensive loop
        Math.random();
      }
    };
    
    // Simulated database delay
    const simulateDBQuery = async (delay = 50) => {
      await new Promise(resolve => setTimeout(resolve, delay));
      return { data: `db-result-${Date.now()}`, rows: Math.floor(Math.random() * 100) };
    };
    
    // Performance monitoring middleware
    app.use((req, res, next) => {
      requestCounter++;
      const startTime = performance.now();
      
      // Add performance headers
      res.on('finish', () => {
        const duration = performance.now() - startTime;
        res.set({
          'X-Response-Time': `${duration.toFixed(2)}ms`,
          'X-Request-Count': requestCounter.toString()
        });
        
        // Record performance metric
        performance.mark(`request-end-${req.path}`);
        performance.measure(
          `request-${req.path}`,
          `request-start-${req.path}`,
          `request-end-${req.path}`
        );
      });
      
      performance.mark(`request-start-${req.path}`);
      next();
    });
    
    // Cache simulation middleware
    app.use('/cached/*', async (req, res, next) => {
      const cacheKey = cacheManager.generateCacheKey(req.path);
      const cached = await cacheManager.get(cacheKey);
      
      if (cached && !cacheManager.isStale(cached)) {
        // Fast cache hit
        res.set('X-Cache', 'HIT');
        return res.status(200).json({
          message: 'Cached response',
          path: req.path,
          cached: true,
          timestamp: cached.timestamp
        });
      }
      
      // Cache miss - simulate slow render
      renderCounter++;
      await heavyComputation(200); // 200ms render time
      await simulateDBQuery(100);   // 100ms DB query
      
      const result = {
        message: 'Fresh response',
        path: req.path,
        cached: false,
        renderCount: renderCounter,
        timestamp: Date.now()
      };
      
      // Cache the result
      await cacheManager.set(cacheKey, result, 300); // 5 min TTL
      
      res.set('X-Cache', 'MISS');
      res.status(200).json(result);
    });
    
    // Fast endpoint for baseline testing
    app.get('/fast', (req, res) => {
      res.json({ message: 'Fast response', timestamp: Date.now() });
    });
    
    // Slow endpoint for testing performance limits
    app.get('/slow', async (req, res) => {
      const delay = parseInt(req.query.delay) || 1000;
      await new Promise(resolve => setTimeout(resolve, delay));
      res.json({ message: 'Slow response', delay, timestamp: Date.now() });
    });
    
    // CPU intensive endpoint
    app.get('/cpu-intensive', async (req, res) => {
      const duration = parseInt(req.query.duration) || 500;
      await heavyComputation(duration);
      res.json({ message: 'CPU intensive response', duration, timestamp: Date.now() });
    });
    
    // Memory intensive endpoint
    app.get('/memory-intensive', (req, res) => {
      const size = parseInt(req.query.size) || 1000;
      const largeData = new Array(size * 1000).fill('x'.repeat(100));
      res.json({
        message: 'Memory intensive response',
        size: largeData.length,
        timestamp: Date.now()
      });
    });
    
    // Database simulation endpoint
    app.get('/db-heavy', async (req, res) => {
      const queries = parseInt(req.query.queries) || 10;
      const results = [];
      
      for (let i = 0; i < queries; i++) {
        const result = await simulateDBQuery(50);
        results.push(result);
      }
      
      res.json({
        message: 'Database heavy response',
        queries,
        results: results.length,
        timestamp: Date.now()
      });
    });
    
    // Error rate testing
    app.get('/unreliable', (req, res) => {
      const errorRate = parseFloat(req.query.errorRate) || 0.1;
      
      if (Math.random() < errorRate) {
        return res.status(500).json({
          error: 'Simulated server error',
          timestamp: Date.now()
        });
      }
      
      res.json({ message: 'Reliable response', timestamp: Date.now() });
    });
    
    // Metrics endpoint
    app.get('/metrics', async (req, res) => {
      const cacheStats = await cacheManager.stats();
      const memUsage = process.memoryUsage();
      
      res.json({
        requests: requestCounter,
        renders: renderCounter,
        cache: cacheStats,
        memory: memUsage,
        performance: Object.keys(performanceMetrics).reduce((acc, key) => {
          const times = performanceMetrics[key];
          acc[key] = {
            count: times.length,
            avg: times.reduce((a, b) => a + b, 0) / times.length,
            min: Math.min(...times),
            max: Math.max(...times),
            p95: times.sort((a, b) => a - b)[Math.floor(times.length * 0.95)]
          };
          return acc;
        }, {}),
        timestamp: Date.now()
      });
    });
  });

  afterAll(async () => {
    obs.disconnect();
    try {
      await fs.rm(testCacheDir, { recursive: true, force: true });
    } catch (error) {
      console.warn('Failed to cleanup test cache:', error.message);
    }
  });

  beforeEach(() => {
    // Clear performance metrics for each test
    performanceMetrics = {};
  });

  describe('Baseline Performance', () => {
    test('should handle fast requests under 10ms', async () => {
      const response = await request(app)
        .get('/fast')
        .expect(200);
      
      const responseTime = parseFloat(response.headers['x-response-time']);
      expect(responseTime).toBeLessThan(10);
      expect(response.body.message).toBe('Fast response');
    });

    test('should maintain consistent performance across multiple requests', async () => {
      const responses = await Promise.all(
        Array.from({ length: 20 }, () => request(app).get('/fast'))
      );
      
      const responseTimes = responses.map(r => 
        parseFloat(r.headers['x-response-time'])
      );
      
      const avgResponseTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
      const maxResponseTime = Math.max(...responseTimes);
      
      expect(avgResponseTime).toBeLessThan(5);
      expect(maxResponseTime).toBeLessThan(15);
    });
  });

  describe('Cache Performance', () => {
    test('should serve cached content under 10ms', async () => {
      const route = '/cached/test-performance';
      
      // First request (cache miss)
      const miss = await request(app)
        .get(route)
        .expect(200);
      
      expect(miss.headers['x-cache']).toBe('MISS');
      const missTime = parseFloat(miss.headers['x-response-time']);
      expect(missTime).toBeGreaterThan(200); // Should include render time
      
      // Second request (cache hit)
      const hit = await request(app)
        .get(route)
        .expect(200);
      
      expect(hit.headers['x-cache']).toBe('HIT');
      const hitTime = parseFloat(hit.headers['x-response-time']);
      expect(hitTime).toBeLessThan(10); // Should be fast
      
      // Hit should be significantly faster than miss
      expect(hitTime).toBeLessThan(missTime / 10);
    });

    test('should maintain high cache hit rate under load', async () => {
      const routes = ['/cached/route1', '/cached/route2', '/cached/route3'];
      
      // Prime cache
      for (const route of routes) {
        await request(app).get(route);
      }
      
      // Generate load
      const requests = Array.from({ length: 100 }, (_, i) => {
        const route = routes[i % routes.length];
        return request(app).get(route);
      });
      
      const responses = await Promise.all(requests);
      
      const hitCount = responses.filter(r => r.headers['x-cache'] === 'HIT').length;
      const hitRate = hitCount / responses.length;
      
      expect(hitRate).toBeGreaterThan(0.9); // 90%+ hit rate
    });
  });

  describe('Concurrent Request Handling', () => {
    test('should handle 50 concurrent fast requests', async () => {
      const concurrency = 50;
      const startTime = performance.now();
      
      const promises = Array.from({ length: concurrency }, () =>
        request(app).get('/fast')
      );
      
      const responses = await Promise.all(promises);
      const totalTime = performance.now() - startTime;
      
      // All requests should succeed
      responses.forEach(response => {
        expect(response.status).toBe(200);
      });
      
      // Should complete within reasonable time (less than 1 second)
      expect(totalTime).toBeLessThan(1000);
      
      // Calculate throughput
      const throughput = concurrency / (totalTime / 1000); // requests per second
      expect(throughput).toBeGreaterThan(50);
    });

    test('should handle mixed workload efficiently', async () => {
      const workloads = [
        { path: '/fast', count: 20 },
        { path: '/cached/mixed1', count: 10 },
        { path: '/cached/mixed2', count: 10 },
        { path: '/cpu-intensive?duration=100', count: 5 }
      ];
      
      const requests = workloads.flatMap(({ path, count }) =>
        Array.from({ length: count }, () => request(app).get(path))
      );
      
      const startTime = performance.now();
      const responses = await Promise.all(requests);
      const totalTime = performance.now() - startTime;
      
      // All requests should succeed
      responses.forEach(response => {
        expect(response.status).toBe(200);
      });
      
      // Mixed workload should complete within 2 seconds
      expect(totalTime).toBeLessThan(2000);
    });

    test('should handle burst traffic without degradation', async () => {
      // Simulate traffic burst: 100 requests in quick succession
      const burstSize = 100;
      const requests = Array.from({ length: burstSize }, (_, i) =>
        request(app).get(`/fast?burst=${i}`)
      );
      
      const startTime = performance.now();
      const responses = await Promise.all(requests);
      const endTime = performance.now();
      
      // Check response times don't degrade significantly
      const responseTimes = responses.map(r => 
        parseFloat(r.headers['x-response-time'])
      );
      
      const firstQuartile = responseTimes.slice(0, 25);
      const lastQuartile = responseTimes.slice(-25);
      
      const firstAvg = firstQuartile.reduce((a, b) => a + b, 0) / firstQuartile.length;
      const lastAvg = lastQuartile.reduce((a, b) => a + b, 0) / lastQuartile.length;
      
      // Last quartile shouldn't be more than 3x slower than first
      expect(lastAvg).toBeLessThan(firstAvg * 3);
      
      // All requests should succeed
      expect(responses.every(r => r.status === 200)).toBe(true);
    });
  });

  describe('Resource Intensive Operations', () => {
    test('should handle CPU-intensive requests within limits', async () => {
      const response = await request(app)
        .get('/cpu-intensive?duration=300')
        .expect(200);
      
      const responseTime = parseFloat(response.headers['x-response-time']);
      expect(responseTime).toBeLessThan(500); // Should complete within 500ms
      expect(response.body.duration).toBe(300);
    });

    test('should handle memory-intensive requests efficiently', async () => {
      const initialMemory = process.memoryUsage().heapUsed;
      
      const response = await request(app)
        .get('/memory-intensive?size=1000')
        .expect(200);
      
      // Force garbage collection if available
      if (global.gc) {
        global.gc();
      }
      
      const finalMemory = process.memoryUsage().heapUsed;
      const memoryIncrease = finalMemory - initialMemory;
      
      expect(response.body.size).toBe(1000000);
      // Memory increase should be reasonable (cleanup should occur)
      expect(memoryIncrease).toBeLessThan(200 * 1024 * 1024); // Less than 200MB
    });

    test('should handle database-heavy operations', async () => {
      const response = await request(app)
        .get('/db-heavy?queries=20')
        .expect(200);
      
      const responseTime = parseFloat(response.headers['x-response-time']);
      expect(response.body.queries).toBe(20);
      expect(response.body.results).toBe(20);
      
      // Should complete within reasonable time (20 queries * 50ms + overhead)
      expect(responseTime).toBeLessThan(1500);
    });
  });

  describe('Error Handling Under Load', () => {
    test('should maintain performance with intermittent errors', async () => {
      const requests = Array.from({ length: 50 }, () =>
        request(app).get('/unreliable?errorRate=0.2') // 20% error rate
      );
      
      const responses = await Promise.all(requests);
      
      const successCount = responses.filter(r => r.status === 200).length;
      const errorCount = responses.filter(r => r.status === 500).length;
      
      // Should have some errors but not all
      expect(errorCount).toBeGreaterThan(0);
      expect(successCount).toBeGreaterThan(30); // At least 60% success
      
      // Success responses should still be fast
      const successfulResponses = responses.filter(r => r.status === 200);
      const avgResponseTime = successfulResponses
        .map(r => parseFloat(r.headers['x-response-time']))
        .reduce((a, b) => a + b, 0) / successfulResponses.length;
      
      expect(avgResponseTime).toBeLessThan(20);
    });

    test('should recover from error conditions', async () => {
      // Generate high error rate initially
      await Promise.all(
        Array.from({ length: 10 }, () =>
          request(app).get('/unreliable?errorRate=0.8')
        )
      );
      
      // Then test normal operation
      const normalRequests = Array.from({ length: 10 }, () =>
        request(app).get('/fast')
      );
      
      const responses = await Promise.all(normalRequests);
      
      // All normal requests should succeed
      responses.forEach(response => {
        expect(response.status).toBe(200);
      });
    });
  });

  describe('Performance Monitoring and Metrics', () => {
    test('should collect performance metrics', async () => {
      // Generate some traffic
      await Promise.all([
        request(app).get('/fast'),
        request(app).get('/cached/metrics-test'),
        request(app).get('/cpu-intensive?duration=100')
      ]);
      
      const response = await request(app)
        .get('/metrics')
        .expect(200);
      
      expect(response.body).toHaveProperty('requests');
      expect(response.body).toHaveProperty('renders');
      expect(response.body).toHaveProperty('cache');
      expect(response.body).toHaveProperty('memory');
      expect(response.body).toHaveProperty('performance');
      
      expect(response.body.requests).toBeGreaterThan(0);
      expect(typeof response.body.memory.heapUsed).toBe('number');
    });

    test('should track performance trends', async () => {
      const iterations = 10;
      const results = [];
      
      for (let i = 0; i < iterations; i++) {
        const start = performance.now();
        await request(app).get('/fast');
        const duration = performance.now() - start;
        results.push(duration);
        
        // Small delay between requests
        await new Promise(resolve => setTimeout(resolve, 10));
      }
      
      // Performance should be consistent (low variance)
      const avg = results.reduce((a, b) => a + b, 0) / results.length;
      const variance = results.reduce((acc, val) => acc + Math.pow(val - avg, 2), 0) / results.length;
      const stdDev = Math.sqrt(variance);
      
      // Standard deviation should be low (consistent performance)
      expect(stdDev).toBeLessThan(avg * 0.5); // Less than 50% of average
    });
  });

  describe('Load Testing Scenarios', () => {
    test('should handle realistic news site load pattern', async () => {
      // Simulate realistic traffic: 70% homepage, 20% articles, 10% other
      const trafficPattern = [
        ...Array(70).fill('/cached/homepage'),
        ...Array(20).fill('/cached/article-popular'),
        ...Array(10).fill('/cached/events')
      ];
      
      // Shuffle to simulate random access
      const shuffled = trafficPattern.sort(() => Math.random() - 0.5);
      
      const startTime = performance.now();
      const responses = await Promise.all(
        shuffled.map(path => request(app).get(path))
      );
      const totalTime = performance.now() - startTime;
      
      // All requests should succeed
      responses.forEach(response => {
        expect(response.status).toBe(200);
      });
      
      // Should handle 100 requests within 3 seconds
      expect(totalTime).toBeLessThan(3000);
      
      // Calculate throughput
      const throughput = responses.length / (totalTime / 1000);
      expect(throughput).toBeGreaterThan(30); // 30+ RPS
    });

    test('should handle sustained load over time', async () => {
      const duration = 5000; // 5 seconds
      const requestInterval = 50; // Request every 50ms
      const expectedRequests = duration / requestInterval;
      
      const responses = [];
      const startTime = Date.now();
      
      while (Date.now() - startTime < duration) {
        responses.push(
          request(app).get('/fast').then(r => ({ 
            status: r.status, 
            time: Date.now() - startTime 
          }))
        );
        await new Promise(resolve => setTimeout(resolve, requestInterval));
      }
      
      const results = await Promise.all(responses);
      
      // Should maintain consistent success rate
      const successRate = results.filter(r => r.status === 200).length / results.length;
      expect(successRate).toBeGreaterThan(0.95); // 95%+ success
      
      // Should maintain reasonable throughput
      expect(results.length).toBeGreaterThan(expectedRequests * 0.8);
    });
  });

  describe('Memory Management Under Load', () => {
    test('should not exhibit memory leaks during extended operation', async () => {
      const initialMemory = process.memoryUsage().heapUsed;
      
      // Generate sustained traffic
      for (let batch = 0; batch < 5; batch++) {
        await Promise.all(
          Array.from({ length: 20 }, () => request(app).get('/fast'))
        );
        
        // Force garbage collection between batches
        if (global.gc) {
          global.gc();
        }
      }
      
      const finalMemory = process.memoryUsage().heapUsed;
      const memoryIncrease = finalMemory - initialMemory;
      
      // Memory increase should be minimal (less than 50MB)
      expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024);
    });

    test('should handle memory pressure gracefully', async () => {
      // Create memory pressure with large responses
      const largeRequests = Array.from({ length: 10 }, () =>
        request(app).get('/memory-intensive?size=5000')
      );
      
      const responses = await Promise.all(largeRequests);
      
      // All requests should complete successfully
      responses.forEach(response => {
        expect(response.status).toBe(200);
      });
      
      // System should still be responsive after memory pressure
      const quickResponse = await request(app).get('/fast');
      expect(quickResponse.status).toBe(200);
      
      const responseTime = parseFloat(quickResponse.headers['x-response-time']);
      expect(responseTime).toBeLessThan(50); // Still fast after memory pressure
    });
  });
});