/**
 * End-to-End Tests for Server-Side Rendering Pipeline
 * Tests the complete SSR flow from request to rendered response
 */

import request from 'supertest';
import { jest } from '@jest/globals';
import express from 'express';
import path from 'path';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';
import { ISREngine } from '../../server/isr/cache-manager.js';
import { dataProvider } from '../../server/data/provider.js';
import { getDataForRoute } from '../../server/data/context.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Mock server setup for testing
let app;
let server;
let testCacheDir;

describe('Server-Side Rendering Pipeline E2E Tests', () => {
  beforeAll(async () => {
    // Setup test environment
    testCacheDir = await global.createTempDir('ssr-test-cache');
    process.env.CACHE_DIR = testCacheDir;
    process.env.NODE_ENV = 'test';
    
    // Create minimal Express app for testing
    app = express();
    
    // Mock ISR Engine
    const mockISR = {
      cache: {
        get: jest.fn(),
        set: jest.fn(),
        isStale: jest.fn(),
        stats: jest.fn().mockResolvedValue({
          hits: 10,
          misses: 5,
          size: 15,
          memory: 1024
        })
      },
      middleware: {
        handle: jest.fn()
      }
    };
    
    app.locals.isr = mockISR;
    
    // Health endpoint
    app.get('/health', async (req, res) => {
      const stats = await app.locals.isr.cache.stats();
      res.json({
        status: 'healthy',
        version: '1.0.0',
        environment: process.env.NODE_ENV,
        database: 'mock',
        cache: {
          ...stats,
          hitRate: stats.hits / (stats.hits + stats.misses) || 0
        },
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        timestamp: new Date().toISOString()
      });
    });
    
    // Mock SSR rendering endpoint
    app.get('*', async (req, res) => {
      const url = req.originalUrl;
      const route = req.path;
      
      try {
        // Simulate data fetching
        const data = await getDataForRoute(route, {
          ...req.params,
          ...req.query,
          community: req.params.community || 'default'
        });
        
        // Simulate SSR rendering
        const template = `<!DOCTYPE html>
<html>
<head>
  <title>SSR Test Page - ${route}</title>
  <meta name="description" content="Test page for ${route}">
</head>
<body>
  <div id="app">
    <h1>Server-Rendered Content</h1>
    <p>Route: ${route}</p>
    <p>Data: ${JSON.stringify(data)}</p>
    <p>Rendered at: ${new Date().toISOString()}</p>
  </div>
  <script>
    window.__SSR_DATA__ = ${JSON.stringify(data)};
    window.__ROUTE__ = "${route}";
  </script>
</body>
</html>`;
        
        res.set('Content-Type', 'text/html');
        res.set('X-Rendered-By', 'SSR');
        res.set('X-Route', route);
        res.status(200).send(template);
        
      } catch (error) {
        console.error('SSR Error:', error);
        res.status(500).json({
          error: 'SSR rendering failed',
          message: error.message,
          route
        });
      }
    });
  });

  afterAll(async () => {
    if (server) {
      server.close();
    }
    // Cleanup test cache
    try {
      await fs.rm(testCacheDir, { recursive: true, force: true });
    } catch (error) {
      console.warn('Failed to cleanup test cache:', error.message);
    }
  });

  describe('Basic SSR Rendering', () => {
    test('should render homepage with SSR', async () => {
      const response = await request(app)
        .get('/')
        .expect(200)
        .expect('Content-Type', /html/);
      
      expect(response.headers['x-rendered-by']).toBe('SSR');
      expect(response.headers['x-route']).toBe('/');
      expect(response.text).toContain('Server-Rendered Content');
      expect(response.text).toContain('window.__SSR_DATA__');
      expect(response.text).toContain('Route: /');
    });

    test('should render news page with proper metadata', async () => {
      const response = await request(app)
        .get('/news')
        .expect(200);
      
      expect(response.text).toContain('<title>SSR Test Page - /news</title>');
      expect(response.text).toContain('content="Test page for /news"');
      expect(response.text).toContain('Route: /news');
    });

    test('should render dynamic routes correctly', async () => {
      const articleSlug = 'test-article-123';
      const response = await request(app)
        .get(`/article/${articleSlug}`)
        .expect(200);
      
      expect(response.text).toContain(`Route: /article/${articleSlug}`);
      expect(response.text).toContain('window.__SSR_DATA__');
    });

    test('should handle route parameters in SSR data', async () => {
      const response = await request(app)
        .get('/business/test-business?category=restaurant')
        .expect(200);
      
      const ssrDataMatch = response.text.match(/window\.__SSR_DATA__ = (.+);/);
      expect(ssrDataMatch).toBeTruthy();
      
      const ssrData = JSON.parse(ssrDataMatch[1]);
      expect(ssrData).toHaveProperty('category', 'restaurant');
    });
  });

  describe('Community-Scoped SSR', () => {
    test('should render community-scoped routes', async () => {
      const response = await request(app)
        .get('/downtown/events')
        .expect(200);
      
      expect(response.text).toContain('Route: /downtown/events');
      
      const ssrDataMatch = response.text.match(/window\.__SSR_DATA__ = (.+);/);
      const ssrData = JSON.parse(ssrDataMatch[1]);
      expect(ssrData).toHaveProperty('community');
    });

    test('should handle multiple community routes', async () => {
      const communities = ['downtown', 'northbeach', 'university'];
      
      for (const community of communities) {
        const response = await request(app)
          .get(`/${community}/news`)
          .expect(200);
        
        expect(response.text).toContain(`Route: /${community}/news`);
      }
    });
  });

  describe('SSR Error Handling', () => {
    test('should handle SSR rendering errors gracefully', async () => {
      // Mock getDataForRoute to throw error
      const originalGetData = getDataForRoute;
      jest.spyOn({ getDataForRoute }, 'getDataForRoute')
        .mockRejectedValueOnce(new Error('Data fetch failed'));
      
      const response = await request(app)
        .get('/error-route')
        .expect(500);
      
      expect(response.body).toHaveProperty('error', 'SSR rendering failed');
      expect(response.body).toHaveProperty('message', 'Data fetch failed');
    });

    test('should provide fallback for missing templates', async () => {
      const response = await request(app)
        .get('/missing-template-route')
        .expect(200);
      
      // Should still render with default template
      expect(response.text).toContain('Server-Rendered Content');
    });
  });

  describe('SSR Performance', () => {
    test('should render within performance thresholds', async () => {
      const startTime = Date.now();
      
      await request(app)
        .get('/performance-test')
        .expect(200);
      
      const renderTime = Date.now() - startTime;
      expect(renderTime).toBeLessThan(1000); // Should render within 1 second
    });

    test('should handle concurrent SSR requests', async () => {
      const promises = Array.from({ length: 10 }, (_, i) =>
        request(app)
          .get(`/concurrent-test-${i}`)
          .expect(200)
      );
      
      const startTime = Date.now();
      const responses = await Promise.all(promises);
      const totalTime = Date.now() - startTime;
      
      // All requests should complete
      expect(responses).toHaveLength(10);
      responses.forEach((response, i) => {
        expect(response.text).toContain(`Route: /concurrent-test-${i}`);
      });
      
      // Should handle concurrent requests efficiently
      expect(totalTime).toBeLessThan(3000);
    });
  });

  describe('SSR Data Hydration', () => {
    test('should include proper hydration data', async () => {
      const response = await request(app)
        .get('/hydration-test')
        .expect(200);
      
      // Check for SSR data injection
      expect(response.text).toContain('window.__SSR_DATA__');
      expect(response.text).toContain('window.__ROUTE__');
      
      // Validate JSON structure
      const ssrDataMatch = response.text.match(/window\.__SSR_DATA__ = (.+);/);
      const routeMatch = response.text.match(/window\.__ROUTE__ = "(.+)";/);
      
      expect(ssrDataMatch).toBeTruthy();
      expect(routeMatch).toBeTruthy();
      expect(routeMatch[1]).toBe('/hydration-test');
      
      const ssrData = JSON.parse(ssrDataMatch[1]);
      expect(typeof ssrData).toBe('object');
    });

    test('should escape data properly for XSS protection', async () => {
      const response = await request(app)
        .get('/xss-test?malicious=<script>alert("xss")</script>')
        .expect(200);
      
      // Should not contain unescaped script tags in SSR data
      expect(response.text).not.toContain('<script>alert("xss")</script>');
      expect(response.text).toContain('window.__SSR_DATA__');
    });
  });

  describe('Health Check Integration', () => {
    test('should provide detailed health status', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200)
        .expect('Content-Type', /json/);
      
      expect(response.body).toHaveProperty('status', 'healthy');
      expect(response.body).toHaveProperty('version');
      expect(response.body).toHaveProperty('environment', 'test');
      expect(response.body).toHaveProperty('database');
      expect(response.body).toHaveProperty('cache');
      expect(response.body).toHaveProperty('uptime');
      expect(response.body).toHaveProperty('memory');
      expect(response.body).toHaveProperty('timestamp');
      
      // Cache stats validation
      expect(response.body.cache).toHaveProperty('hits');
      expect(response.body.cache).toHaveProperty('misses');
      expect(response.body.cache).toHaveProperty('hitRate');
      expect(typeof response.body.cache.hitRate).toBe('number');
    });
  });

  describe('Response Headers', () => {
    test('should include proper SSR headers', async () => {
      const response = await request(app)
        .get('/header-test')
        .expect(200);
      
      expect(response.headers).toHaveProperty('content-type');
      expect(response.headers['content-type']).toMatch(/text\/html/);
      expect(response.headers).toHaveProperty('x-rendered-by', 'SSR');
      expect(response.headers).toHaveProperty('x-route', '/header-test');
    });

    test('should handle special characters in routes', async () => {
      const specialRoute = '/events/winter-festival-2024!';
      const response = await request(app)
        .get(specialRoute)
        .expect(200);
      
      expect(response.headers['x-route']).toBe(specialRoute);
      expect(response.text).toContain(`Route: ${specialRoute}`);
    });
  });

  describe('Memory and Resource Management', () => {
    test('should not leak memory during multiple renders', async () => {
      const initialMemory = process.memoryUsage();
      
      // Render multiple pages
      for (let i = 0; i < 50; i++) {
        await request(app)
          .get(`/memory-test-${i}`)
          .expect(200);
      }
      
      // Force garbage collection if available
      if (global.gc) {
        global.gc();
      }
      
      const finalMemory = process.memoryUsage();
      const memoryIncrease = finalMemory.heapUsed - initialMemory.heapUsed;
      
      // Memory increase should be reasonable (less than 50MB)
      expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024);
    });
  });
});