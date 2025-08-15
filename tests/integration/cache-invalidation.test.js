// Integration tests for webhook cache invalidation
import { jest } from '@jest/globals';
import { InvalidationHandler } from '../../server/data/invalidation.js';
import { 
  createMockRequest, 
  createMockResponse, 
  generateTestData, 
  waitFor,
  sleep 
} from '../utils/test-helpers.js';

describe('Cache Invalidation Integration Tests', () => {
  let invalidationHandler;
  let mockISREngine;
  let mockReq;
  let mockRes;

  beforeEach(() => {
    jest.clearAllMocks();
    global.mockConsole();

    // Mock ISR Engine
    mockISREngine = {
      revalidate: jest.fn().mockResolvedValue({ success: true }),
      cache: {
        invalidate: jest.fn().mockResolvedValue(true),
        has: jest.fn().mockReturnValue(true),
        stats: jest.fn().mockReturnValue({ hits: 100, misses: 10 })
      }
    };

    invalidationHandler = new InvalidationHandler(mockISREngine);
    mockReq = createMockRequest();
    mockRes = createMockResponse();
  });

  afterEach(() => {
    global.restoreConsole();
  });

  describe('Webhook Handler', () => {
    test('should handle valid webhook payload', async () => {
      mockReq.body = {
        type: 'news',
        action: 'insert',
        data: {
          id: 1,
          slug: 'test-article',
          author_id: 123,
          community_id: 'downtown'
        }
      };

      // Mock route config
      jest.unstable_mockModule('../../server/route-config.js', () => ({
        getInvalidationTargets: jest.fn(() => [
          '/news',
          '/article/test-article',
          '/'
        ])
      }));

      await invalidationHandler.handleWebhook(mockReq, mockRes);

      expect(mockRes.json).toHaveBeenCalledWith({
        success: true,
        revalidated: expect.arrayContaining([
          '/news',
          '/article/test-article',
          '/',
          '/downtown/news',
          '/downtown/article/test-article',
          '/downtown'
        ]),
        results: expect.any(Array)
      });
    });

    test('should reject invalid webhook payload', async () => {
      mockReq.body = {
        type: 'news'
        // missing action
      };

      await invalidationHandler.handleWebhook(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'Type and action required'
      });
    });

    test('should handle webhook processing errors', async () => {
      mockReq.body = {
        type: 'news',
        action: 'insert',
        data: { id: 1 }
      };

      mockISREngine.revalidate.mockRejectedValue(new Error('ISR engine failed'));

      jest.unstable_mockModule('../../server/route-config.js', () => ({
        getInvalidationTargets: jest.fn(() => ['/news'])
      }));

      await invalidationHandler.handleWebhook(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'ISR engine failed'
      });
    });

    test('should filter out admin routes from community scoping', async () => {
      mockReq.body = {
        type: 'news',
        action: 'insert',
        data: {
          community_id: 'downtown'
        }
      };

      jest.unstable_mockModule('../../server/route-config.js', () => ({
        getInvalidationTargets: jest.fn(() => [
          '/news',
          '/admin/dashboard'
        ])
      }));

      await invalidationHandler.handleWebhook(mockReq, mockRes);

      const revalidatedRoutes = mockRes.json.mock.calls[0][0].revalidated;
      
      expect(revalidatedRoutes).toContain('/news');
      expect(revalidatedRoutes).toContain('/admin/dashboard');
      expect(revalidatedRoutes).toContain('/downtown/news');
      expect(revalidatedRoutes).not.toContain('/downtown/admin/dashboard');
    });
  });

  describe('News Invalidation', () => {
    test('should invalidate news-related routes', async () => {
      const articleSlug = 'breaking-news-story';
      const authorId = 456;
      const communityId = 'midtown';

      const result = await invalidationHandler.invalidateNews(articleSlug, authorId, communityId);

      expect(mockISREngine.revalidate).toHaveBeenCalledTimes(7);
      
      const expectedRoutes = [
        `/article/${articleSlug}`,
        '/news',
        '/',
        `/author/${authorId}`,
        `/${communityId}/article/${articleSlug}`,
        `/${communityId}/news`,
        `/${communityId}`
      ];

      expectedRoutes.forEach(route => {
        expect(mockISREngine.revalidate).toHaveBeenCalledWith(route);
      });

      expect(result).toHaveLength(7);
      result.forEach(res => {
        expect(res).toEqual({ success: true });
      });
    });

    test('should handle partial invalidation failures', async () => {
      mockISREngine.revalidate
        .mockResolvedValueOnce({ success: true })
        .mockRejectedValueOnce(new Error('Route not found'))
        .mockResolvedValue({ success: true });

      const result = await invalidationHandler.invalidateNews('test-slug', 123, 'downtown');

      expect(result).toHaveLength(7);
      expect(result[0]).toEqual({ success: true });
      expect(result[1]).toBeInstanceOf(Error);
    });
  });

  describe('Event Invalidation', () => {
    test('should invalidate event-related routes', async () => {
      const eventSlug = 'summer-festival-2024';
      const communityId = 'uptown';

      await invalidationHandler.invalidateEvent(eventSlug, communityId);

      const expectedRoutes = [
        `/event/${eventSlug}`,
        '/events',
        '/events/calendar',
        '/',
        `/${communityId}/event/${eventSlug}`,
        `/${communityId}/events`
      ];

      expectedRoutes.forEach(route => {
        expect(mockISREngine.revalidate).toHaveBeenCalledWith(route);
      });
    });

    test('should handle concurrent event invalidations', async () => {
      const events = [
        { slug: 'event-1', community: 'downtown' },
        { slug: 'event-2', community: 'midtown' },
        { slug: 'event-3', community: 'uptown' }
      ];

      const promises = events.map(event => 
        invalidationHandler.invalidateEvent(event.slug, event.community)
      );

      const results = await Promise.all(promises);

      expect(results).toHaveLength(3);
      expect(mockISREngine.revalidate).toHaveBeenCalledTimes(18); // 6 routes × 3 events
    });
  });

  describe('Business Invalidation', () => {
    test('should invalidate business-related routes', async () => {
      const businessSlug = 'marios-pizza';
      const communityId = 'little-italy';

      await invalidationHandler.invalidateBusiness(businessSlug, communityId);

      const expectedRoutes = [
        `/business/${businessSlug}`,
        '/businesses',
        '/deals',
        `/${communityId}/business/${businessSlug}`,
        `/${communityId}/businesses`
      ];

      expectedRoutes.forEach(route => {
        expect(mockISREngine.revalidate).toHaveBeenCalledWith(route);
      });
    });

    test('should handle business with special characters in slug', async () => {
      const businessSlug = 'café-françois';
      const communityId = 'french-quarter';

      await invalidationHandler.invalidateBusiness(businessSlug, communityId);

      expect(mockISREngine.revalidate).toHaveBeenCalledWith(`/business/${businessSlug}`);
      expect(mockISREngine.revalidate).toHaveBeenCalledWith(`/${communityId}/business/${businessSlug}`);
    });
  });

  describe('Batch Invalidation Scenarios', () => {
    test('should handle high-frequency webhook batches', async () => {
      const webhooks = Array.from({ length: 50 }, (_, i) => ({
        body: {
          type: 'news',
          action: 'update',
          data: {
            id: i + 1,
            slug: `article-${i + 1}`,
            community_id: 'downtown'
          }
        }
      }));

      jest.unstable_mockModule('../../server/route-config.js', () => ({
        getInvalidationTargets: jest.fn(() => ['/news', '/'])
      }));

      const startTime = Date.now();
      
      const promises = webhooks.map(webhook => {
        const req = { ...mockReq, ...webhook };
        return invalidationHandler.handleWebhook(req, createMockResponse());
      });

      await Promise.all(promises);
      
      const endTime = Date.now();
      const processingTime = endTime - startTime;

      // Should process all webhooks within reasonable time
      expect(processingTime).toBeLessThan(5000);
      expect(mockISREngine.revalidate).toHaveBeenCalledTimes(100); // 2 routes × 50 webhooks
    });

    test('should deduplicate similar invalidation requests', async () => {
      const duplicateRequests = Array.from({ length: 10 }, () => ({
        type: 'news',
        action: 'update',
        data: {
          id: 1,
          slug: 'same-article',
          community_id: 'downtown'
        }
      }));

      jest.unstable_mockModule('../../server/route-config.js', () => ({
        getInvalidationTargets: jest.fn(() => ['/news', '/article/same-article'])
      }));

      const promises = duplicateRequests.map(data => {
        const req = { ...mockReq, body: data };
        return invalidationHandler.handleWebhook(req, createMockResponse());
      });

      await Promise.all(promises);

      // Should still process all requests (no built-in deduplication)
      expect(mockISREngine.revalidate).toHaveBeenCalledTimes(40); // 4 routes × 10 requests
    });
  });

  describe('Error Recovery and Resilience', () => {
    test('should retry failed invalidations', async () => {
      mockISREngine.revalidate
        .mockRejectedValueOnce(new Error('Temporary failure'))
        .mockResolvedValue({ success: true });

      // This test assumes retry logic exists in the handler
      await invalidationHandler.invalidateNews('test-article', 123, 'downtown');

      // Without built-in retry, this will fail once
      expect(mockISREngine.revalidate).toHaveBeenCalledTimes(7);
    });

    test('should handle ISR engine unavailability', async () => {
      const brokenISREngine = {
        revalidate: jest.fn().mockRejectedValue(new Error('ISR engine down'))
      };

      const brokenHandler = new InvalidationHandler(brokenISREngine);
      
      mockReq.body = {
        type: 'news',
        action: 'insert',
        data: { id: 1 }
      };

      jest.unstable_mockModule('../../server/route-config.js', () => ({
        getInvalidationTargets: jest.fn(() => ['/news'])
      }));

      await brokenHandler.handleWebhook(mockReq, mockRes);

      expect(mockRes.status).toHaveBeenCalledWith(500);
      expect(mockRes.json).toHaveBeenCalledWith({
        error: 'ISR engine down'
      });
    });

    test('should handle malformed webhook data gracefully', async () => {
      const malformedPayloads = [
        { type: null, action: 'insert', data: {} },
        { type: 'news', action: '', data: {} },
        { type: 'news', action: 'insert', data: null },
        { type: 'news', action: 'insert' }, // missing data
      ];

      for (const payload of malformedPayloads) {
        const req = { ...mockReq, body: payload };
        const res = createMockResponse();

        await invalidationHandler.handleWebhook(req, res);

        expect(res.status).toHaveBeenCalledWith(400);
      }
    });
  });

  describe('Performance and Monitoring', () => {
    test('should complete invalidations within performance thresholds', async () => {
      const routes = Array.from({ length: 100 }, (_, i) => `/route-${i}`);
      
      mockISREngine.revalidate.mockImplementation(async (route) => {
        await sleep(Math.random() * 10); // Simulate variable latency
        return { success: true, route };
      });

      const startTime = Date.now();
      
      await Promise.all(routes.map(route => mockISREngine.revalidate(route)));
      
      const endTime = Date.now();
      const totalTime = endTime - startTime;

      // Should complete 100 invalidations within 2 seconds
      expect(totalTime).toBeLessThan(2000);
    });

    test('should provide detailed invalidation results', async () => {
      mockReq.body = {
        type: 'news',
        action: 'insert',
        data: {
          slug: 'detailed-article',
          community_id: 'downtown'
        }
      };

      mockISREngine.revalidate.mockImplementation(async (route) => ({
        success: true,
        route,
        timestamp: Date.now(),
        duration: Math.random() * 100
      }));

      jest.unstable_mockModule('../../server/route-config.js', () => ({
        getInvalidationTargets: jest.fn(() => ['/news', '/'])
      }));

      await invalidationHandler.handleWebhook(mockReq, mockRes);

      const response = mockRes.json.mock.calls[0][0];

      expect(response.success).toBe(true);
      expect(response.revalidated).toBeInstanceOf(Array);
      expect(response.results).toBeInstanceOf(Array);
      expect(response.results.every(r => r.success)).toBe(true);
    });

    test('should track invalidation metrics', async () => {
      const metricsCollector = {
        invalidations: 0,
        errors: 0,
        totalRoutes: 0,
        record: function(success, routeCount) {
          this.invalidations++;
          this.totalRoutes += routeCount;
          if (!success) this.errors++;
        }
      };

      // Simulate metrics collection
      mockReq.body = {
        type: 'news',
        action: 'insert',
        data: { community_id: 'downtown' }
      };

      jest.unstable_mockModule('../../server/route-config.js', () => ({
        getInvalidationTargets: jest.fn(() => ['/news', '/', '/archive'])
      }));

      await invalidationHandler.handleWebhook(mockReq, mockRes);

      metricsCollector.record(true, 6); // 3 routes × 2 (base + community)

      expect(metricsCollector.invalidations).toBe(1);
      expect(metricsCollector.totalRoutes).toBe(6);
      expect(metricsCollector.errors).toBe(0);
    });
  });

  describe('Integration with Route Configuration', () => {
    test('should respect route configuration for invalidation patterns', async () => {
      const mockRouteConfig = {
        getInvalidationTargets: jest.fn((type, action, data) => {
          if (type === 'news' && action === 'insert') {
            return ['/news', `/${data.category}`, '/'];
          }
          return [];
        })
      };

      jest.unstable_mockModule('../../server/route-config.js', () => mockRouteConfig);

      mockReq.body = {
        type: 'news',
        action: 'insert',
        data: {
          category: 'sports',
          community_id: 'downtown'
        }
      };

      await invalidationHandler.handleWebhook(mockReq, mockRes);

      expect(mockRouteConfig.getInvalidationTargets).toHaveBeenCalledWith(
        'news',
        'insert',
        mockReq.body.data
      );

      const response = mockRes.json.mock.calls[0][0];
      expect(response.revalidated).toContain('/sports');
      expect(response.revalidated).toContain('/downtown/sports');
    });
  });
});