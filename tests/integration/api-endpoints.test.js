// Integration tests for API routes
import { jest } from '@jest/globals';
import express from 'express';
import request from 'supertest';
import apiRouter from '../../server/api.js';
import { DataProvider } from '../../server/data/provider.js';
import { InvalidationHandler } from '../../server/data/invalidation.js';
import { 
  generateTestData, 
  createSupabaseMock, 
  PerformanceTimer,
  waitFor
} from '../utils/test-helpers.js';

describe('API Endpoints Integration Tests', () => {
  let app;
  let mockDataProvider;
  let mockISREngine;
  let originalEnv;

  beforeAll(() => {
    originalEnv = { ...process.env };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  beforeEach(async () => {
    jest.clearAllMocks();
    global.mockConsole();

    // Create Express app with API routes
    app = express();
    app.use(express.json());
    
    // Mock ISR engine
    mockISREngine = {
      revalidate: jest.fn().mockResolvedValue({ success: true }),
      cache: {
        stats: jest.fn().mockReturnValue({
          hits: 150,
          misses: 25,
          size: 50,
          maxSize: 1000
        })
      }
    };
    
    app.locals.isr = mockISREngine;

    // Mock data provider
    mockDataProvider = {
      getLatestNews: jest.fn(),
      getNewsArticle: jest.fn(),
      getUpcomingEvents: jest.fn(),
      getTodaysEvents: jest.fn(),
      getBusinesses: jest.fn(),
      getBusiness: jest.fn(),
      getActiveDeals: jest.fn(),
      searchContent: jest.fn(),
      supabase: createSupabaseMock({
        'communities_list': {
          data: [
            { id: 'downtown', name: 'Downtown', slug: 'downtown' },
            { id: 'midtown', name: 'Midtown', slug: 'midtown' }
          ],
          error: null
        }
      })
    };

    // Mock the data provider module
    jest.unstable_mockModule('../../server/data/provider.js', () => ({
      dataProvider: mockDataProvider
    }));

    app.use('/api', apiRouter);
  });

  afterEach(() => {
    global.restoreConsole();
  });

  describe('Health Check Endpoint', () => {
    test('should return health status with cache stats', async () => {
      const response = await request(app)
        .get('/api/health')
        .expect(200);

      expect(response.body).toMatchObject({
        status: 'ok',
        cache: {
          hits: 150,
          misses: 25,
          size: 50,
          maxSize: 1000
        },
        database: expect.any(String),
        timestamp: expect.any(String)
      });

      expect(new Date(response.body.timestamp)).toBeInstanceOf(Date);
    });

    test('should handle missing ISR engine gracefully', async () => {
      app.locals.isr = undefined;

      const response = await request(app)
        .get('/api/health')
        .expect(200);

      expect(response.body.cache).toBeUndefined();
    });
  });

  describe('News Endpoints', () => {
    beforeEach(() => {
      const mockArticles = generateTestData('article', 5);
      mockDataProvider.getLatestNews.mockResolvedValue(mockArticles);
      mockDataProvider.getNewsArticle.mockResolvedValue(mockArticles[0]);
    });

    test('should fetch latest news with default parameters', async () => {
      const response = await request(app)
        .get('/api/news')
        .expect(200);

      expect(mockDataProvider.getLatestNews).toHaveBeenCalledWith('downtown', 20);
      expect(response.body).toHaveLength(5);
      expect(response.body[0]).toHaveProperty('title');
      expect(response.body[0]).toHaveProperty('id');
    });

    test('should fetch news with custom community and limit', async () => {
      await request(app)
        .get('/api/news?community=midtown&limit=10')
        .expect(200);

      expect(mockDataProvider.getLatestNews).toHaveBeenCalledWith('midtown', 10);
    });

    test('should handle invalid limit parameter gracefully', async () => {
      await request(app)
        .get('/api/news?limit=abc')
        .expect(200);

      expect(mockDataProvider.getLatestNews).toHaveBeenCalledWith('downtown', NaN);
    });

    test('should fetch individual news article', async () => {
      const response = await request(app)
        .get('/api/news/test-article-slug')
        .expect(200);

      expect(mockDataProvider.getNewsArticle).toHaveBeenCalledWith('test-article-slug');
      expect(response.body).toHaveProperty('title');
    });

    test('should return 404 for non-existent article', async () => {
      mockDataProvider.getNewsArticle.mockResolvedValue(null);

      const response = await request(app)
        .get('/api/news/non-existent')
        .expect(404);

      expect(response.body).toEqual({ error: 'Article not found' });
    });

    test('should handle news fetch errors', async () => {
      mockDataProvider.getLatestNews.mockRejectedValue(new Error('Database connection failed'));

      const response = await request(app)
        .get('/api/news')
        .expect(500);

      expect(response.body).toEqual({ error: 'Database connection failed' });
    });
  });

  describe('Events Endpoints', () => {
    beforeEach(() => {
      const mockEvents = generateTestData('event', 10);
      const mockTodaysEvents = generateTestData('event', 3);
      
      mockDataProvider.getUpcomingEvents.mockResolvedValue(mockEvents);
      mockDataProvider.getTodaysEvents.mockResolvedValue(mockTodaysEvents);
    });

    test('should fetch upcoming events with default parameters', async () => {
      const response = await request(app)
        .get('/api/events')
        .expect(200);

      expect(mockDataProvider.getUpcomingEvents).toHaveBeenCalledWith('downtown', 7);
      expect(response.body).toHaveLength(10);
    });

    test('should fetch upcoming events with custom days parameter', async () => {
      await request(app)
        .get('/api/events?community=uptown&days=30')
        .expect(200);

      expect(mockDataProvider.getUpcomingEvents).toHaveBeenCalledWith('uptown', 30);
    });

    test('should fetch today\'s events', async () => {
      const response = await request(app)
        .get('/api/events/today')
        .expect(200);

      expect(mockDataProvider.getTodaysEvents).toHaveBeenCalledWith('downtown');
      expect(response.body).toHaveLength(3);
    });

    test('should handle events fetch errors', async () => {
      mockDataProvider.getUpcomingEvents.mockRejectedValue(new Error('Events service down'));

      const response = await request(app)
        .get('/api/events')
        .expect(500);

      expect(response.body).toEqual({ error: 'Events service down' });
    });
  });

  describe('Business Endpoints', () => {
    beforeEach(() => {
      const mockBusinesses = generateTestData('business', 8);
      mockDataProvider.getBusinesses.mockResolvedValue(mockBusinesses);
      mockDataProvider.getBusiness.mockResolvedValue(mockBusinesses[0]);
    });

    test('should fetch businesses with default parameters', async () => {
      const response = await request(app)
        .get('/api/businesses')
        .expect(200);

      expect(mockDataProvider.getBusinesses).toHaveBeenCalledWith('downtown', undefined, 20);
      expect(response.body).toHaveLength(8);
    });

    test('should fetch businesses with category filter', async () => {
      await request(app)
        .get('/api/businesses?category=restaurant&limit=15')
        .expect(200);

      expect(mockDataProvider.getBusinesses).toHaveBeenCalledWith('downtown', 'restaurant', 15);
    });

    test('should fetch individual business', async () => {
      const response = await request(app)
        .get('/api/businesses/joes-pizza')
        .expect(200);

      expect(mockDataProvider.getBusiness).toHaveBeenCalledWith('joes-pizza');
      expect(response.body).toHaveProperty('name');
    });

    test('should return 404 for non-existent business', async () => {
      mockDataProvider.getBusiness.mockResolvedValue(null);

      const response = await request(app)
        .get('/api/businesses/non-existent')
        .expect(404);

      expect(response.body).toEqual({ error: 'Business not found' });
    });
  });

  describe('Deals Endpoint', () => {
    test('should fetch active deals', async () => {
      const mockDeals = [
        { id: 1, title: '50% Off Pizza', business: 'Mario\'s', valid_until: '2024-12-31' },
        { id: 2, title: 'Buy One Get One', business: 'Coffee Shop', valid_until: '2024-11-30' }
      ];
      
      mockDataProvider.getActiveDeals.mockResolvedValue(mockDeals);

      const response = await request(app)
        .get('/api/deals')
        .expect(200);

      expect(mockDataProvider.getActiveDeals).toHaveBeenCalledWith('downtown');
      expect(response.body).toHaveLength(2);
      expect(response.body[0]).toHaveProperty('title');
    });

    test('should handle deals with different communities', async () => {
      await request(app)
        .get('/api/deals?community=westside')
        .expect(200);

      expect(mockDataProvider.getActiveDeals).toHaveBeenCalledWith('westside');
    });
  });

  describe('Search Endpoint', () => {
    beforeEach(() => {
      const mockSearchResults = {
        news: generateTestData('article', 3),
        businesses: generateTestData('business', 2),
        events: generateTestData('event', 1)
      };
      
      mockDataProvider.searchContent.mockResolvedValue(mockSearchResults);
    });

    test('should perform search with query parameter', async () => {
      const response = await request(app)
        .get('/api/search?q=pizza restaurant')
        .expect(200);

      expect(mockDataProvider.searchContent).toHaveBeenCalledWith('downtown', 'pizza restaurant', 'all');
      expect(response.body).toHaveProperty('news');
      expect(response.body).toHaveProperty('businesses');
      expect(response.body).toHaveProperty('events');
    });

    test('should handle search with type filter', async () => {
      await request(app)
        .get('/api/search?q=pizza&type=businesses')
        .expect(200);

      expect(mockDataProvider.searchContent).toHaveBeenCalledWith('downtown', 'pizza', 'businesses');
    });

    test('should return 400 for missing query parameter', async () => {
      const response = await request(app)
        .get('/api/search')
        .expect(400);

      expect(response.body).toEqual({ error: 'Query parameter required' });
    });

    test('should handle search errors', async () => {
      mockDataProvider.searchContent.mockRejectedValue(new Error('Search index unavailable'));

      const response = await request(app)
        .get('/api/search?q=test')
        .expect(500);

      expect(response.body).toEqual({ error: 'Search index unavailable' });
    });
  });

  describe('Communities Endpoint', () => {
    test('should fetch active communities', async () => {
      const response = await request(app)
        .get('/api/communities')
        .expect(200);

      expect(response.body).toHaveLength(2);
      expect(response.body[0]).toHaveProperty('id');
      expect(response.body[0]).toHaveProperty('name');
      expect(response.body[0]).toHaveProperty('slug');
    });

    test('should handle Supabase query errors', async () => {
      const errorMock = createSupabaseMock({
        'communities_list': { data: null, error: { message: 'Table access denied' } }
      });
      
      mockDataProvider.supabase = errorMock;

      const response = await request(app)
        .get('/api/communities')
        .expect(500);

      expect(response.body).toEqual({ error: 'Table access denied' });
    });
  });

  describe('Webhook Invalidation Endpoint', () => {
    test('should handle valid invalidation webhook', async () => {
      // Mock route config
      jest.unstable_mockModule('../../server/route-config.js', () => ({
        getInvalidationTargets: jest.fn(() => ['/news', '/'])
      }));

      const webhookPayload = {
        type: 'news',
        action: 'insert',
        data: {
          id: 1,
          slug: 'new-article',
          community_id: 'downtown'
        }
      };

      const response = await request(app)
        .post('/api/webhook/invalidate')
        .send(webhookPayload)
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('revalidated');
      expect(response.body.revalidated).toContain('/news');
      expect(response.body.revalidated).toContain('/');
    });

    test('should handle invalid webhook payload', async () => {
      const response = await request(app)
        .post('/api/webhook/invalidate')
        .send({ type: 'news' }) // missing action
        .expect(400);

      expect(response.body).toEqual({ error: 'Type and action required' });
    });

    test('should handle webhook processing errors', async () => {
      mockISREngine.revalidate.mockRejectedValue(new Error('Revalidation failed'));

      jest.unstable_mockModule('../../server/route-config.js', () => ({
        getInvalidationTargets: jest.fn(() => ['/news'])
      }));

      const response = await request(app)
        .post('/api/webhook/invalidate')
        .send({
          type: 'news',
          action: 'update',
          data: { id: 1 }
        })
        .expect(500);

      expect(response.body).toEqual({ error: 'Revalidation failed' });
    });
  });

  describe('API Performance and Load Testing', () => {
    test('should handle concurrent requests efficiently', async () => {
      mockDataProvider.getLatestNews.mockResolvedValue(generateTestData('article', 5));
      
      const timer = new PerformanceTimer();
      const concurrentRequests = 20;
      
      const { time } = await timer.measure('concurrent_requests', async () => {
        const requests = Array.from({ length: concurrentRequests }, () =>
          request(app).get('/api/news')
        );
        
        const responses = await Promise.all(requests);
        
        responses.forEach(response => {
          expect(response.status).toBe(200);
          expect(response.body).toHaveLength(5);
        });
      });

      // All requests should complete within 2 seconds
      expect(time).toBeLessThan(2000);
      expect(mockDataProvider.getLatestNews).toHaveBeenCalledTimes(concurrentRequests);
    });

    test('should handle large response payloads efficiently', async () => {
      const largeDataset = generateTestData('article', 1000);
      mockDataProvider.getLatestNews.mockResolvedValue(largeDataset);

      const timer = new PerformanceTimer();
      
      const { time } = await timer.measure('large_payload', async () => {
        const response = await request(app)
          .get('/api/news?limit=1000')
          .expect(200);
        
        expect(response.body).toHaveLength(1000);
      });

      // Large payload should be processed within 1 second
      expect(time).toBeLessThan(1000);
    });

    test('should handle API rate limiting gracefully', async () => {
      // Simulate rapid requests
      const rapidRequests = Array.from({ length: 100 }, (_, i) =>
        request(app).get(`/api/news?timestamp=${i}`)
      );

      const responses = await Promise.all(rapidRequests);
      
      // All requests should succeed (no built-in rate limiting)
      responses.forEach(response => {
        expect(response.status).toBe(200);
      });
    });
  });

  describe('Error Handling and Edge Cases', () => {
    test('should handle malformed JSON in request body', async () => {
      const response = await request(app)
        .post('/api/webhook/invalidate')
        .type('json')
        .send('{"invalid": json}')
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    test('should handle extremely long query parameters', async () => {
      const longQuery = 'a'.repeat(10000);
      
      const response = await request(app)
        .get(`/api/search?q=${longQuery}`)
        .expect(200);

      expect(mockDataProvider.searchContent).toHaveBeenCalledWith('downtown', longQuery, 'all');
    });

    test('should handle special characters in URL parameters', async () => {
      const specialSlug = 'café-français-&-more';
      
      await request(app)
        .get(`/api/news/${encodeURIComponent(specialSlug)}`)
        .expect(200);

      expect(mockDataProvider.getNewsArticle).toHaveBeenCalledWith(specialSlug);
    });

    test('should validate content types appropriately', async () => {
      const response = await request(app)
        .post('/api/webhook/invalidate')
        .type('text/plain')
        .send('plain text data')
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('Data Validation and Sanitization', () => {
    test('should validate numeric parameters', async () => {
      await request(app)
        .get('/api/news?limit=-5')
        .expect(200);

      expect(mockDataProvider.getLatestNews).toHaveBeenCalledWith('downtown', -5);
    });

    test('should sanitize SQL injection attempts', async () => {
      const maliciousQuery = "'; DROP TABLE news; --";
      
      await request(app)
        .get(`/api/search?q=${encodeURIComponent(maliciousQuery)}`)
        .expect(200);

      expect(mockDataProvider.searchContent).toHaveBeenCalledWith('downtown', maliciousQuery, 'all');
    });

    test('should handle XSS attempts in search queries', async () => {
      const xssQuery = '<script>alert("xss")</script>';
      
      await request(app)
        .get(`/api/search?q=${encodeURIComponent(xssQuery)}`)
        .expect(200);

      expect(mockDataProvider.searchContent).toHaveBeenCalledWith('downtown', xssQuery, 'all');
    });
  });

  describe('Cache Headers and HTTP Semantics', () => {
    test('should set appropriate cache headers for different endpoints', async () => {
      const newsResponse = await request(app)
        .get('/api/news')
        .expect(200);

      // API responses should not be cached by default
      expect(newsResponse.headers['cache-control']).toBeUndefined();
    });

    test('should handle HEAD requests appropriately', async () => {
      mockDataProvider.getLatestNews.mockResolvedValue([]);

      const response = await request(app)
        .head('/api/news')
        .expect(200);

      expect(response.body).toEqual({});
      expect(mockDataProvider.getLatestNews).toHaveBeenCalled();
    });

    test('should return appropriate status codes for different scenarios', async () => {
      // Test various status codes
      mockDataProvider.getNewsArticle.mockResolvedValue(null);
      await request(app).get('/api/news/non-existent').expect(404);

      mockDataProvider.getBusiness.mockResolvedValue(null);
      await request(app).get('/api/businesses/non-existent').expect(404);

      await request(app).get('/api/search').expect(400); // missing query
    });
  });
});