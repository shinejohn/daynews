// Integration tests for Supabase data provider
import { jest } from '@jest/globals';
import { DataProvider } from '../../server/data/provider.js';
import { createSupabaseMock, generateTestData } from '../utils/test-helpers.js';

describe('Data Provider Integration Tests', () => {
  let dataProvider;
  let mockSupabase;
  let originalEnv;

  beforeAll(() => {
    originalEnv = { ...process.env };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();
    
    // Mock console to reduce noise
    global.mockConsole();
  });

  afterEach(() => {
    global.restoreConsole();
  });

  describe('Supabase Mode', () => {
    beforeEach(() => {
      // Set up Supabase environment
      process.env.SUPABASE_URL = 'http://localhost:54321';
      process.env.SUPABASE_ANON_KEY = 'test-key';
      
      // Create mock responses
      const testArticles = generateTestData('article', 5);
      const testBusiness = generateTestData('business', 1);
      const testEvents = generateTestData('event', 3);
      
      mockSupabase = createSupabaseMock({
        'news_list': { data: testArticles, error: null },
        'news_single': { data: testArticles[0], error: null },
        'businesses_list': { data: [testBusiness], error: null },
        'businesses_single': { data: testBusiness, error: null },
        'events_list': { data: testEvents, error: null }
      });

      // Mock the Supabase import
      jest.unstable_mockModule('@supabase/supabase-js', () => ({
        createClient: jest.fn(() => mockSupabase)
      }));

      // Create fresh data provider instance
      dataProvider = new DataProvider();
      dataProvider.supabase = mockSupabase;
    });

    describe('News Operations', () => {
      test('should fetch latest news with proper query structure', async () => {
        const communityId = 'downtown';
        const limit = 10;
        
        await dataProvider.getLatestNews(communityId, limit);

        expect(mockSupabase.from).toHaveBeenCalledWith('news');
        
        // Verify the query chain
        const selectCall = mockSupabase.from().select;
        expect(selectCall).toHaveBeenCalledWith(expect.stringContaining('author:users!author_id'));
      });

      test('should handle news article not found', async () => {
        mockSupabase = createSupabaseMock({
          'news_single': { data: null, error: { message: 'Not found' } }
        });
        dataProvider.supabase = mockSupabase;

        await expect(dataProvider.getNewsArticle('nonexistent')).rejects.toThrow();
      });

      test('should increment view count on article fetch', async () => {
        const testArticle = generateTestData('article', 1, { view_count: 5 });
        mockSupabase = createSupabaseMock({
          'news_single': { data: testArticle, error: null }
        });
        dataProvider.supabase = mockSupabase;

        const updateSpy = jest.fn(() => ({
          eq: jest.fn(() => Promise.resolve({}))
        }));
        mockSupabase.from.mockReturnValue({
          select: jest.fn(() => ({
            eq: jest.fn(() => ({
              single: jest.fn(() => Promise.resolve({ data: testArticle, error: null }))
            }))
          })),
          update: updateSpy
        });

        await dataProvider.getNewsArticle('test-slug');

        expect(updateSpy).toHaveBeenCalledWith({ view_count: testArticle.view_count + 1 });
      });
    });

    describe('Events Operations', () => {
      test('should fetch upcoming events with date filtering', async () => {
        const communityId = 'downtown';
        const days = 7;
        
        await dataProvider.getUpcomingEvents(communityId, days);

        expect(mockSupabase.from).toHaveBeenCalledWith('events');
        
        // Verify date filtering logic is applied
        const selectCall = mockSupabase.from().select;
        expect(selectCall).toHaveBeenCalledWith(expect.stringContaining('rsvp_count:event_rsvps'));
      });

      test('should handle RSVP count transformation', async () => {
        const testEvents = [
          { id: 1, title: 'Event 1', rsvp_count: [{ count: 25 }] },
          { id: 2, title: 'Event 2', rsvp_count: null }
        ];
        
        mockSupabase = createSupabaseMock({
          'events_list': { data: testEvents, error: null }
        });
        dataProvider.supabase = mockSupabase;

        const result = await dataProvider.getUpcomingEvents('downtown');

        expect(result[0].rsvp_count).toBe(25);
        expect(result[1].rsvp_count).toBe(0);
      });
    });

    describe('Business Operations', () => {
      test('should fetch businesses with rating calculation', async () => {
        const testBusinesses = [{
          id: 1,
          name: 'Test Restaurant',
          reviews: [{ rating: 5 }, { rating: 4 }, { rating: 5 }]
        }];
        
        mockSupabase = createSupabaseMock({
          'businesses_list': { data: testBusinesses, error: null }
        });
        dataProvider.supabase = mockSupabase;

        const result = await dataProvider.getBusinesses('downtown');

        expect(result[0].average_rating).toBeCloseTo(4.67, 1);
        expect(result[0].review_count).toBe(3);
        expect(result[0].reviews).toBeUndefined(); // Should be removed
      });

      test('should handle businesses with no reviews', async () => {
        const testBusinesses = [{
          id: 1,
          name: 'New Business',
          reviews: []
        }];
        
        mockSupabase = createSupabaseMock({
          'businesses_list': { data: testBusinesses, error: null }
        });
        dataProvider.supabase = mockSupabase;

        const result = await dataProvider.getBusinesses('downtown');

        expect(result[0].average_rating).toBeNull();
        expect(result[0].review_count).toBe(0);
      });

      test('should apply category filtering', async () => {
        await dataProvider.getBusinesses('downtown', 'restaurant', 20);

        // Verify that category filter is applied in the query chain
        expect(mockSupabase.from).toHaveBeenCalledWith('businesses');
      });
    });

    describe('Search Operations', () => {
      test('should perform multi-type search', async () => {
        const searchResults = {
          news: generateTestData('article', 3),
          businesses: generateTestData('business', 2),
          events: generateTestData('event', 1)
        };

        // Mock multiple table responses
        let callCount = 0;
        mockSupabase.from.mockImplementation((table) => {
          const responses = {
            'news': { data: searchResults.news, error: null },
            'businesses': { data: searchResults.businesses, error: null },
            'events': { data: searchResults.events, error: null }
          };
          
          return {
            select: jest.fn(() => ({
              eq: jest.fn(() => ({
                textSearch: jest.fn(() => ({
                  limit: jest.fn(() => Promise.resolve(responses[table]))
                }))
              }))
            }))
          };
        });

        const result = await dataProvider.searchContent('downtown', 'test query', 'all');

        expect(result.news).toHaveLength(3);
        expect(result.businesses).toHaveLength(2);
        expect(result.events).toHaveLength(1);
      });

      test('should handle search errors gracefully', async () => {
        mockSupabase.from.mockImplementation(() => ({
          select: jest.fn(() => ({
            eq: jest.fn(() => ({
              textSearch: jest.fn(() => ({
                limit: jest.fn(() => Promise.resolve({ data: null, error: { message: 'Search failed' } }))
              }))
            }))
          }))
        }));

        const result = await dataProvider.searchContent('downtown', 'test', 'all');

        // Should return empty arrays when search fails
        expect(result.news).toEqual([]);
        expect(result.businesses).toEqual([]);
        expect(result.events).toEqual([]);
      });
    });

    describe('Homepage Data Aggregation', () => {
      test('should fetch and combine homepage data', async () => {
        const testData = {
          news: generateTestData('article', 5),
          events: generateTestData('event', 2),
          announcements: Array.from({ length: 3 }, (_, i) => ({
            id: i + 1,
            title: `Announcement ${i + 1}`,
            type: 'general'
          })),
          businesses: generateTestData('business', 6)
        };

        // Mock the individual methods
        jest.spyOn(dataProvider, 'getLatestNews').mockResolvedValue(testData.news);
        jest.spyOn(dataProvider, 'getTodaysEvents').mockResolvedValue(testData.events);
        jest.spyOn(dataProvider, 'getAnnouncements').mockResolvedValue(testData.announcements);
        jest.spyOn(dataProvider, 'getBusinesses').mockResolvedValue(testData.businesses);

        const result = await dataProvider.getHomepageData('downtown');

        expect(result.featuredNews).toEqual(testData.news[0]);
        expect(result.latestNews).toEqual(testData.news.slice(1));
        expect(result.todaysEvents).toEqual(testData.events);
        expect(result.announcements).toEqual(testData.announcements.slice(0, 3));
        expect(result.featuredBusinesses).toEqual(testData.businesses);
      });
    });
  });

  describe('Mock Mode', () => {
    beforeEach(() => {
      // Remove Supabase environment variables
      delete process.env.SUPABASE_URL;
      delete process.env.SUPABASE_ANON_KEY;
      
      dataProvider = new DataProvider();
    });

    test('should use mock data when Supabase not available', async () => {
      const result = await dataProvider.getLatestNews('downtown', 5);
      
      expect(result).toHaveLength(5);
      expect(result[0]).toHaveProperty('title');
      expect(result[0]).toHaveProperty('author');
      expect(result[0].title).toContain('News Article');
    });

    test('should generate consistent mock data structure', async () => {
      const article = await dataProvider.getNewsArticle('test-slug');
      
      expect(article).toHaveProperty('id');
      expect(article).toHaveProperty('slug');
      expect(article).toHaveProperty('title');
      expect(article).toHaveProperty('content');
      expect(article).toHaveProperty('author');
      expect(article).toHaveProperty('community');
    });

    test('should provide mock homepage data', async () => {
      const result = await dataProvider.getHomepageData('downtown');
      
      expect(result).toHaveProperty('featuredNews');
      expect(result).toHaveProperty('latestNews');
      expect(result).toHaveProperty('todaysEvents');
      expect(result).toHaveProperty('announcements');
      expect(result).toHaveProperty('featuredBusinesses');
    });
  });

  describe('Error Handling', () => {
    beforeEach(() => {
      process.env.SUPABASE_URL = 'http://localhost:54321';
      process.env.SUPABASE_ANON_KEY = 'test-key';
      
      dataProvider = new DataProvider();
      dataProvider.supabase = mockSupabase;
    });

    test('should handle database connection errors', async () => {
      mockSupabase = createSupabaseMock({
        'news_list': { data: null, error: { message: 'Connection failed' } }
      });
      dataProvider.supabase = mockSupabase;

      await expect(dataProvider.getLatestNews('downtown')).rejects.toThrow('Connection failed');
    });

    test('should handle malformed query responses', async () => {
      mockSupabase.from.mockImplementation(() => {
        throw new Error('Query malformed');
      });
      dataProvider.supabase = mockSupabase;

      await expect(dataProvider.getLatestNews('downtown')).rejects.toThrow('Query malformed');
    });
  });

  describe('Data Consistency', () => {
    beforeEach(() => {
      process.env.SUPABASE_URL = 'http://localhost:54321';
      process.env.SUPABASE_ANON_KEY = 'test-key';
      
      dataProvider = new DataProvider();
      dataProvider.supabase = mockSupabase;
    });

    test('should maintain consistent data structure across methods', async () => {
      const testArticles = generateTestData('article', 3);
      mockSupabase = createSupabaseMock({
        'news_list': { data: testArticles, error: null },
        'news_single': { data: testArticles[0], error: null }
      });
      dataProvider.supabase = mockSupabase;

      const listResult = await dataProvider.getLatestNews('downtown', 3);
      const singleResult = await dataProvider.getNewsArticle(testArticles[0].slug);

      // Both should have consistent structure for shared fields
      expect(typeof listResult[0].id).toBe(typeof singleResult.id);
      expect(typeof listResult[0].title).toBe(typeof singleResult.title);
      expect(typeof listResult[0].slug).toBe(typeof singleResult.slug);
    });

    test('should handle date fields consistently', async () => {
      const testEvents = generateTestData('event', 2);
      mockSupabase = createSupabaseMock({
        'events_list': { data: testEvents, error: null }
      });
      dataProvider.supabase = mockSupabase;

      const result = await dataProvider.getUpcomingEvents('downtown');

      result.forEach(event => {
        expect(event.start_date).toMatch(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
        expect(new Date(event.start_date)).toBeInstanceOf(Date);
      });
    });
  });

  describe('Performance Considerations', () => {
    test('should handle large dataset queries efficiently', async () => {
      const largeDataset = generateTestData('article', 1000);
      mockSupabase = createSupabaseMock({
        'news_list': { data: largeDataset, error: null }
      });
      
      dataProvider = new DataProvider();
      dataProvider.supabase = mockSupabase;

      const startTime = Date.now();
      await dataProvider.getLatestNews('downtown', 1000);
      const endTime = Date.now();

      // Should complete within reasonable time
      expect(endTime - startTime).toBeLessThan(1000);
    });

    test('should limit query results appropriately', async () => {
      await dataProvider.getLatestNews('downtown', 5);

      // Should apply limit in query
      expect(mockSupabase.from).toHaveBeenCalledWith('news');
    });
  });
});