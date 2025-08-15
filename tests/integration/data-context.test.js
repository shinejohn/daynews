// Integration tests for SSR data context
import { jest } from '@jest/globals';
import { getDataForRoute, extractRouteParams } from '../../server/data/context.js';
import { DataProvider } from '../../server/data/provider.js';
import { createSupabaseMock, generateTestData } from '../utils/test-helpers.js';

describe('Data Context Integration Tests', () => {
  let originalEnv;
  let mockDataProvider;

  beforeAll(() => {
    originalEnv = { ...process.env };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  beforeEach(() => {
    jest.clearAllMocks();
    global.mockConsole();

    // Mock the data provider
    mockDataProvider = {
      getHomepageData: jest.fn(),
      getLatestNews: jest.fn(),
      getNewsArticle: jest.fn(),
      getAuthors: jest.fn(),
      getTodaysEvents: jest.fn(),
      getUpcomingEvents: jest.fn(),
      getEvent: jest.fn(),
      getBusinesses: jest.fn(),
      getBusiness: jest.fn(),
      getActiveDeals: jest.fn(),
      getClassifieds: jest.fn(),
      getAnnouncements: jest.fn(),
      getMemorials: jest.fn(),
      searchContent: jest.fn(),
      getHub: jest.fn(),
      getHubs: jest.fn(),
      getCategories: jest.fn()
    };

    // Mock the data provider module
    jest.unstable_mockModule('../../server/data/provider.js', () => ({
      dataProvider: mockDataProvider
    }));
  });

  afterEach(() => {
    global.restoreConsole();
  });

  describe('Route Data Loading', () => {
    test('should load homepage data correctly', async () => {
      const mockHomepageData = {
        featuredNews: generateTestData('article', 1),
        latestNews: generateTestData('article', 4),
        todaysEvents: generateTestData('event', 2),
        announcements: [],
        featuredBusinesses: generateTestData('business', 6)
      };

      mockDataProvider.getHomepageData.mockResolvedValue(mockHomepageData);

      const result = await getDataForRoute('/', {});

      expect(mockDataProvider.getHomepageData).toHaveBeenCalledWith('downtown');
      expect(result.featuredNews).toEqual(mockHomepageData.featuredNews);
      expect(result.community).toEqual({ id: 'downtown' });
    });

    test('should handle community-specific routes', async () => {
      const mockHomepageData = { featuredNews: [], latestNews: [] };
      mockDataProvider.getHomepageData.mockResolvedValue(mockHomepageData);

      const result = await getDataForRoute('/', { community: 'midtown' });

      expect(mockDataProvider.getHomepageData).toHaveBeenCalledWith('midtown');
      expect(result.community).toEqual({ id: 'midtown' });
    });

    test('should load news list data', async () => {
      const mockArticles = generateTestData('article', 20);
      mockDataProvider.getLatestNews.mockResolvedValue(mockArticles);

      const result = await getDataForRoute('/news', { community: 'downtown' });

      expect(mockDataProvider.getLatestNews).toHaveBeenCalledWith('downtown', 20);
      expect(result.articles).toEqual(mockArticles);
    });

    test('should load individual article with related articles', async () => {
      const mockArticle = generateTestData('article', 1);
      const mockRelated = generateTestData('article', 5);
      
      mockDataProvider.getNewsArticle.mockResolvedValue(mockArticle);
      mockDataProvider.getLatestNews.mockResolvedValue(mockRelated);

      const result = await getDataForRoute('/article/test-slug', { slug: 'test-slug' });

      expect(mockDataProvider.getNewsArticle).toHaveBeenCalledWith('test-slug');
      expect(mockDataProvider.getLatestNews).toHaveBeenCalledWith('downtown', 5);
      expect(result.article).toEqual(mockArticle);
      expect(result.relatedArticles).toEqual(mockRelated);
    });
  });

  describe('Events Data Loading', () => {
    test('should load events page data', async () => {
      const mockTodaysEvents = generateTestData('event', 3);
      const mockUpcomingEvents = generateTestData('event', 10);

      mockDataProvider.getTodaysEvents.mockResolvedValue(mockTodaysEvents);
      mockDataProvider.getUpcomingEvents.mockResolvedValue(mockUpcomingEvents);

      const result = await getDataForRoute('/events', {});

      expect(mockDataProvider.getTodaysEvents).toHaveBeenCalledWith('downtown');
      expect(mockDataProvider.getUpcomingEvents).toHaveBeenCalledWith('downtown', 30);
      expect(result.todaysEvents).toEqual(mockTodaysEvents);
      expect(result.upcomingEvents).toEqual(mockUpcomingEvents);
    });

    test('should load calendar events with extended timeframe', async () => {
      const mockEvents = generateTestData('event', 20);
      mockDataProvider.getUpcomingEvents.mockResolvedValue(mockEvents);

      const result = await getDataForRoute('/events/calendar', {});

      expect(mockDataProvider.getUpcomingEvents).toHaveBeenCalledWith('downtown', 60);
      expect(result.events).toEqual(mockEvents);
    });

    test('should load individual event data', async () => {
      const mockEvent = generateTestData('event', 1);
      mockDataProvider.getEvent.mockResolvedValue(mockEvent);

      const result = await getDataForRoute('/event/summer-festival', { slug: 'summer-festival' });

      expect(mockDataProvider.getEvent).toHaveBeenCalledWith('summer-festival');
      expect(result.event).toEqual(mockEvent);
    });
  });

  describe('Business Data Loading', () => {
    test('should load businesses directory with categories', async () => {
      const mockBusinesses = generateTestData('business', 15);
      const mockCategories = [
        { id: 1, name: 'Restaurant', slug: 'restaurant' },
        { id: 2, name: 'Retail', slug: 'retail' }
      ];

      mockDataProvider.getBusinesses.mockResolvedValue(mockBusinesses);
      mockDataProvider.getCategories.mockResolvedValue(mockCategories);

      const result = await getDataForRoute('/businesses', {});

      expect(mockDataProvider.getBusinesses).toHaveBeenCalledWith('downtown');
      expect(mockDataProvider.getCategories).toHaveBeenCalled();
      expect(result.businesses).toEqual(mockBusinesses);
      expect(result.categories).toEqual(mockCategories);
    });

    test('should load individual business with nearby businesses', async () => {
      const mockBusiness = generateTestData('business', 1);
      const mockNearbyBusinesses = generateTestData('business', 6);

      mockDataProvider.getBusiness.mockResolvedValue(mockBusiness);
      mockDataProvider.getBusinesses.mockResolvedValue(mockNearbyBusinesses);

      const result = await getDataForRoute('/business/joes-cafe', { slug: 'joes-cafe' });

      expect(mockDataProvider.getBusiness).toHaveBeenCalledWith('joes-cafe');
      expect(mockDataProvider.getBusinesses).toHaveBeenCalledWith('downtown', null, 6);
      expect(result.business).toEqual(mockBusiness);
      expect(result.nearbyBusinesses).toEqual(mockNearbyBusinesses);
    });
  });

  describe('Search Data Loading', () => {
    test('should perform search and return results', async () => {
      const mockSearchResults = {
        news: generateTestData('article', 5),
        businesses: generateTestData('business', 3),
        events: generateTestData('event', 2)
      };

      mockDataProvider.searchContent.mockResolvedValue(mockSearchResults);

      const result = await getDataForRoute('/search', { q: 'pizza restaurant' });

      expect(mockDataProvider.searchContent).toHaveBeenCalledWith('downtown', 'pizza restaurant');
      expect(result.results).toEqual(mockSearchResults);
    });

    test('should handle empty search query', async () => {
      const result = await getDataForRoute('/search', {});

      expect(mockDataProvider.searchContent).not.toHaveBeenCalled();
      expect(result.community).toEqual({ id: 'downtown' });
    });
  });

  describe('Route Parameter Extraction', () => {
    test('should extract single parameter from route', () => {
      const params = extractRouteParams('/article/my-test-article', '/article/:slug');
      
      expect(params).toEqual({ slug: 'my-test-article' });
    });

    test('should extract multiple parameters from route', () => {
      const params = extractRouteParams('/user/123/posts/456', '/user/:userId/posts/:postId');
      
      expect(params).toEqual({ userId: '123', postId: '456' });
    });

    test('should handle routes without parameters', () => {
      const params = extractRouteParams('/news', '/news');
      
      expect(params).toEqual({});
    });

    test('should handle non-matching routes', () => {
      const params = extractRouteParams('/events', '/news');
      
      expect(params).toEqual({});
    });
  });

  describe('Community Scoping', () => {
    test('should handle community-scoped routes', async () => {
      mockDataProvider.getHomepageData.mockResolvedValue({});

      await getDataForRoute('/midtown/', { community: 'midtown' });

      expect(mockDataProvider.getHomepageData).toHaveBeenCalledWith('midtown');
    });

    test('should normalize community-scoped routes', async () => {
      const mockArticles = generateTestData('article', 5);
      mockDataProvider.getLatestNews.mockResolvedValue(mockArticles);

      await getDataForRoute('/downtown/news', { community: 'downtown' });

      expect(mockDataProvider.getLatestNews).toHaveBeenCalledWith('downtown', 20);
    });

    test('should use default community when not specified', async () => {
      process.env.DEFAULT_COMMUNITY_ID = 'central';
      mockDataProvider.getHomepageData.mockResolvedValue({});

      const result = await getDataForRoute('/', {});

      expect(mockDataProvider.getHomepageData).toHaveBeenCalledWith('central');
      expect(result.community).toEqual({ id: 'central' });
    });
  });

  describe('Error Handling', () => {
    test('should handle data provider errors gracefully', async () => {
      mockDataProvider.getHomepageData.mockRejectedValue(new Error('Database connection failed'));

      const result = await getDataForRoute('/', {});

      expect(result.error).toBe('Database connection failed');
      expect(result.community).toEqual({ id: 'downtown' });
    });

    test('should handle partial data loading failures', async () => {
      mockDataProvider.getNewsArticle.mockResolvedValue(generateTestData('article', 1));
      mockDataProvider.getLatestNews.mockRejectedValue(new Error('Related articles failed'));

      const result = await getDataForRoute('/article/test-slug', { slug: 'test-slug' });

      expect(result.error).toBe('Related articles failed');
      expect(result.community).toEqual({ id: 'downtown' });
    });

    test('should log errors appropriately', async () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      mockDataProvider.getHomepageData.mockRejectedValue(new Error('Test error'));

      await getDataForRoute('/', {});

      expect(consoleSpy).toHaveBeenCalledWith(
        'Error loading data for /:',
        expect.any(Error)
      );

      consoleSpy.mockRestore();
    });
  });

  describe('Route Configuration Integration', () => {
    test('should respect route configuration for data fetching', async () => {
      // Mock getRouteConfig to return no data fetch requirement
      jest.unstable_mockModule('../../server/route-config.js', () => ({
        getRouteConfig: jest.fn(() => ({ hasDataFetch: false }))
      }));

      const result = await getDataForRoute('/static-page', {});

      expect(result).toEqual({});
      expect(mockDataProvider.getHomepageData).not.toHaveBeenCalled();
    });

    test('should handle routes with data requirements', async () => {
      jest.unstable_mockModule('../../server/route-config.js', () => ({
        getRouteConfig: jest.fn(() => ({ hasDataFetch: true }))
      }));

      mockDataProvider.getHomepageData.mockResolvedValue({ test: 'data' });

      const result = await getDataForRoute('/', {});

      expect(result.test).toBe('data');
    });
  });

  describe('Data Consistency Across Routes', () => {
    test('should maintain consistent community context across all routes', async () => {
      const testRoutes = [
        '/',
        '/news',
        '/events',
        '/businesses',
        '/search'
      ];

      // Mock all required methods
      mockDataProvider.getHomepageData.mockResolvedValue({});
      mockDataProvider.getLatestNews.mockResolvedValue([]);
      mockDataProvider.getTodaysEvents.mockResolvedValue([]);
      mockDataProvider.getUpcomingEvents.mockResolvedValue([]);
      mockDataProvider.getBusinesses.mockResolvedValue([]);
      mockDataProvider.getCategories.mockResolvedValue([]);
      mockDataProvider.searchContent.mockResolvedValue({});

      const results = await Promise.all(
        testRoutes.map(route => getDataForRoute(route, { community: 'testtown' }))
      );

      results.forEach(result => {
        expect(result.community).toEqual({ id: 'testtown' });
      });
    });

    test('should handle concurrent data loading correctly', async () => {
      mockDataProvider.getHomepageData.mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve({ test: 'data1' }), 100))
      );
      mockDataProvider.getLatestNews.mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve([{ test: 'data2' }]), 50))
      );

      const [homepageResult, newsResult] = await Promise.all([
        getDataForRoute('/', {}),
        getDataForRoute('/news', {})
      ]);

      expect(homepageResult.test).toBe('data1');
      expect(newsResult.articles[0].test).toBe('data2');
    });
  });

  describe('Performance Considerations', () => {
    test('should not perform unnecessary data fetches for static routes', async () => {
      await getDataForRoute('/static-about', {});

      expect(mockDataProvider.getHomepageData).not.toHaveBeenCalled();
      expect(mockDataProvider.getLatestNews).not.toHaveBeenCalled();
    });

    test('should handle large parameter sets efficiently', async () => {
      const largeParams = {};
      for (let i = 0; i < 1000; i++) {
        largeParams[`param${i}`] = `value${i}`;
      }

      mockDataProvider.getHomepageData.mockResolvedValue({});

      const startTime = Date.now();
      await getDataForRoute('/', largeParams);
      const endTime = Date.now();

      expect(endTime - startTime).toBeLessThan(100);
    });
  });
});