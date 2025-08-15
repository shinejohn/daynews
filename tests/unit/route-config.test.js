// Unit tests for Route Configuration and TTL Management
import { describe, test, expect, beforeEach } from '@jest/globals';
import {
  routeConfig,
  invalidationRules,
  getRouteConfig,
  shouldUseISR,
  getTTL,
  getInvalidationTargets
} from '../../server/route-config.js';

describe('Route Configuration', () => {
  describe('routeConfig structure', () => {
    test('should have valid structure', () => {
      expect(routeConfig).toHaveProperty('routes');
      expect(routeConfig).toHaveProperty('isrRoutes');
      expect(routeConfig).toHaveProperty('csrRoutes');
      expect(routeConfig).toHaveProperty('ttlConfig');
      expect(routeConfig).toHaveProperty('categories');
      
      expect(typeof routeConfig.routes).toBe('object');
      expect(Array.isArray(routeConfig.isrRoutes)).toBe(true);
      expect(Array.isArray(routeConfig.csrRoutes)).toBe(true);
      expect(typeof routeConfig.ttlConfig).toBe('object');
      expect(typeof routeConfig.categories).toBe('object');
    });

    test('should have consistent route entries', () => {
      Object.entries(routeConfig.routes).forEach(([route, config]) => {
        // Required fields
        expect(config).toHaveProperty('component');
        expect(config).toHaveProperty('renderingMode');
        expect(config).toHaveProperty('ttl');
        expect(config).toHaveProperty('needsAuth');
        expect(config).toHaveProperty('hasDataFetch');
        expect(config).toHaveProperty('dataQueries');
        expect(config).toHaveProperty('category');

        // Data types
        expect(typeof config.component).toBe('string');
        expect(['ISR', 'CSR', 'SSR']).toContain(config.renderingMode);
        expect(typeof config.ttl).toBe('number');
        expect(typeof config.needsAuth).toBe('boolean');
        expect(typeof config.hasDataFetch).toBe('boolean');
        expect(Array.isArray(config.dataQueries)).toBe(true);
        expect(typeof config.category).toBe('string');

        // TTL should be positive
        expect(config.ttl).toBeGreaterThan(0);
      });
    });

    test('should have valid TTL ranges', () => {
      Object.entries(routeConfig.ttlConfig).forEach(([route, ttl]) => {
        expect(typeof ttl).toBe('number');
        expect(ttl).toBeGreaterThan(0);
        expect(ttl).toBeLessThanOrEqual(86400); // Max 24 hours
      });
    });

    test('should have consistent ISR routes list', () => {
      const isrRoutesFromConfig = Object.entries(routeConfig.routes)
        .filter(([, config]) => config.renderingMode === 'ISR')
        .map(([route]) => route)
        .filter(route => !route.includes(':community')); // Filter community-scoped routes

      routeConfig.isrRoutes.forEach(route => {
        const hasMatchingConfig = isrRoutesFromConfig.some(configRoute => 
          configRoute === route || 
          (configRoute.includes(':') && route.includes(':'))
        );
        expect(hasMatchingConfig).toBe(true);
      });
    });

    test('should categorize routes properly', () => {
      Object.entries(routeConfig.categories).forEach(([category, routes]) => {
        expect(Array.isArray(routes)).toBe(true);
        
        routes.forEach(route => {
          const config = routeConfig.routes[route] || 
                        routeConfig.routes[`/:community${route}`];
          expect(config).toBeDefined();
          expect(config.category).toBe(category);
        });
      });
    });
  });

  describe('getRouteConfig', () => {
    test('should return config for exact route match', () => {
      const config = getRouteConfig('/settings');
      
      expect(config).toBeDefined();
      expect(config.component).toBe('UserSettingsPage');
      expect(config.renderingMode).toBe('ISR');
      expect(config.ttl).toBe(300);
    });

    test('should return config for dynamic routes', () => {
      const config = getRouteConfig('/profile/johndoe');
      
      expect(config).toBeDefined();
      expect(config.component).toBe('UserProfilePage');
      expect(config.renderingMode).toBe('ISR');
    });

    test('should handle dynamic route with multiple parameters', () => {
      const config = getRouteConfig('/article/test-article-slug');
      
      expect(config).toBeDefined();
      expect(config.component).toBe('ArticleDetailPage');
      expect(config.ttl).toBe(3600);
    });

    test('should return null for non-existent routes', () => {
      const config = getRouteConfig('/non-existent-route');
      expect(config).toBeNull();
    });

    test('should handle complex dynamic routes', () => {
      const config = getRouteConfig('/event/summer-festival-2024');
      
      expect(config).toBeDefined();
      expect(config.component).toBe('EventDetailPage');
      expect(config.category).toBe('events');
    });

    test('should match community-scoped routes', () => {
      const config = getRouteConfig('/settings');
      const communityConfig = getRouteConfig('/:community/settings');
      
      expect(config).toBeDefined();
      expect(communityConfig).toBeDefined();
      expect(config.component).toBe(communityConfig.component);
    });

    test('should handle routes with query parameters', () => {
      // Query parameters should be ignored for route matching
      const config1 = getRouteConfig('/settings');
      const config2 = getRouteConfig('/settings?tab=profile');
      
      expect(config1).toBeDefined();
      expect(config1).toEqual(config2);
    });

    test('should handle routes with trailing slashes consistently', () => {
      const config1 = getRouteConfig('/settings');
      const config2 = getRouteConfig('/settings/');
      
      // Both should match the same route config
      expect(config1).toBeDefined();
      expect(config2).toBeDefined();
    });
  });

  describe('shouldUseISR', () => {
    test('should return true for ISR routes', () => {
      expect(shouldUseISR('/')).toBe(true);
      expect(shouldUseISR('/settings')).toBe(true);
      expect(shouldUseISR('/events')).toBe(true);
      expect(shouldUseISR('/businesses')).toBe(true);
    });

    test('should return false for non-existent routes', () => {
      expect(shouldUseISR('/non-existent')).toBe(false);
    });

    test('should handle dynamic routes', () => {
      expect(shouldUseISR('/profile/username123')).toBe(true);
      expect(shouldUseISR('/article/my-article-slug')).toBe(true);
      expect(shouldUseISR('/event/holiday-party')).toBe(true);
    });

    test('should return false for CSR routes if any exist', () => {
      // Currently all routes are ISR, but test the logic
      const mockRoute = '/mock-csr-route';
      
      // Temporarily modify config for test
      const originalConfig = routeConfig.routes[mockRoute];
      routeConfig.routes[mockRoute] = {
        component: 'MockComponent',
        renderingMode: 'CSR',
        ttl: 300,
        needsAuth: false,
        hasDataFetch: false,
        dataQueries: [],
        category: 'test'
      };
      
      expect(shouldUseISR(mockRoute)).toBe(false);
      
      // Restore original config
      if (originalConfig) {
        routeConfig.routes[mockRoute] = originalConfig;
      } else {
        delete routeConfig.routes[mockRoute];
      }
    });
  });

  describe('getTTL', () => {
    test('should return correct TTL for configured routes', () => {
      expect(getTTL('/')).toBe(300);
      expect(getTTL('/settings')).toBe(300);
      expect(getTTL('/businesses')).toBe(21600); // 6 hours
      expect(getTTL('/memorials')).toBe(86400); // 24 hours
    });

    test('should return default TTL for non-existent routes', () => {
      expect(getTTL('/non-existent')).toBe(300);
    });

    test('should handle dynamic routes', () => {
      expect(getTTL('/article/test-slug')).toBe(3600); // 1 hour
      expect(getTTL('/event/test-event')).toBe(1800); // 30 minutes
      expect(getTTL('/profile/username')).toBe(300); // 5 minutes
    });

    test('should have reasonable TTL values', () => {
      Object.values(routeConfig.ttlConfig).forEach(ttl => {
        expect(ttl).toBeGreaterThan(0);
        expect(ttl).toBeLessThanOrEqual(86400); // Max 24 hours
      });
    });

    test('should prioritize specific routes over general patterns', () => {
      // More specific routes should have their own TTL
      expect(getTTL('/photos')).toBe(3600);
      expect(getTTL('/photos/upload')).toBe(300);
    });
  });

  describe('TTL Strategy', () => {
    test('should have appropriate TTL for content types', () => {
      // News content - shorter TTL for freshness
      expect(getTTL('/article/test')).toBe(3600);
      expect(getTTL('/')).toBe(300); // Homepage
      
      // Static content - longer TTL
      expect(getTTL('/businesses')).toBe(21600);
      expect(getTTL('/memorials')).toBe(86400);
      
      // User content - medium TTL
      expect(getTTL('/events')).toBe(300);
      expect(getTTL('/announcements')).toBe(1800);
    });

    test('should balance performance and freshness', () => {
      const highTrafficRoutes = ['/', '/events', '/businesses', '/classifieds'];
      const longCacheRoutes = ['/memorials', '/businesses', '/photos'];
      
      highTrafficRoutes.forEach(route => {
        const ttl = getTTL(route);
        expect(ttl).toBeGreaterThan(60); // At least 1 minute
        expect(ttl).toBeLessThanOrEqual(21600); // At most 6 hours
      });

      longCacheRoutes.forEach(route => {
        const ttl = getTTL(route);
        expect(ttl).toBeGreaterThanOrEqual(3600); // At least 1 hour
      });
    });
  });

  describe('invalidationRules', () => {
    test('should have valid structure', () => {
      expect(typeof invalidationRules).toBe('object');
      
      Object.entries(invalidationRules).forEach(([rule, targets]) => {
        expect(rule).toMatch(/^[a-z_]+:[a-z_]+$/); // Format: type:action
        expect(Array.isArray(targets)).toBe(true);
        
        targets.forEach(target => {
          expect(typeof target).toBe('string');
          expect(target.startsWith('/')).toBe(true);
        });
      });
    });

    test('should include logical invalidation patterns', () => {
      expect(invalidationRules['news:publish']).toContain('/');
      expect(invalidationRules['news:publish']).toContain('/news');
      expect(invalidationRules['event:update']).toContain('/events');
      expect(invalidationRules['business:review']).toContain('/businesses');
    });

    test('should support dynamic route invalidation', () => {
      expect(invalidationRules['news:publish']).toContain('/author/:authorId');
      expect(invalidationRules['event:update']).toContain('/event/:slug');
      expect(invalidationRules['business:review']).toContain('/business/:slug');
    });
  });

  describe('getInvalidationTargets', () => {
    test('should return targets for known invalidation rules', () => {
      const targets = getInvalidationTargets('news', 'publish', { authorId: '123' });
      
      expect(Array.isArray(targets)).toBe(true);
      expect(targets).toContain('/');
      expect(targets).toContain('/news');
      expect(targets).toContain('/author/123');
    });

    test('should return empty array for unknown rules', () => {
      const targets = getInvalidationTargets('unknown', 'action');
      expect(targets).toEqual([]);
    });

    test('should replace dynamic parameters correctly', () => {
      const targets = getInvalidationTargets('event', 'update', {
        slug: 'summer-festival'
      });
      
      expect(targets).toContain('/event/summer-festival');
      expect(targets).toContain('/events');
      expect(targets).toContain('/events/calendar');
    });

    test('should handle missing parameter data', () => {
      const targets = getInvalidationTargets('business', 'review', {});
      
      expect(Array.isArray(targets)).toBe(true);
      // Should still return targets, but with unresolved placeholders
      expect(targets.some(target => target.includes(':slug'))).toBe(true);
    });

    test('should support multiple parameter replacement', () => {
      // Add a rule with multiple parameters for testing
      const originalRules = { ...invalidationRules };
      invalidationRules['test:multi'] = ['/category/:category/item/:itemId'];
      
      const targets = getInvalidationTargets('test', 'multi', {
        category: 'news',
        itemId: '456'
      });
      
      expect(targets).toContain('/category/news/item/456');
      
      // Restore original rules
      Object.assign(invalidationRules, originalRules);
    });

    test('should handle special characters in parameters', () => {
      const targets = getInvalidationTargets('news', 'publish', {
        authorId: 'user-name_123'
      });
      
      expect(targets).toContain('/author/user-name_123');
    });
  });

  describe('route categorization', () => {
    test('should have all major categories', () => {
      const expectedCategories = [
        'user', 'general', 'forms', 'events', 
        'business', 'auth', 'news', 'marketplace'
      ];
      
      expectedCategories.forEach(category => {
        expect(routeConfig.categories).toHaveProperty(category);
        expect(Array.isArray(routeConfig.categories[category])).toBe(true);
        expect(routeConfig.categories[category].length).toBeGreaterThan(0);
      });
    });

    test('should categorize routes logically', () => {
      // User-related routes
      expect(routeConfig.categories.user).toContain('/settings');
      expect(routeConfig.categories.user).toContain('/profile/:username');
      
      // Business routes
      expect(routeConfig.categories.business).toContain('/businesses');
      
      // News routes
      expect(routeConfig.categories.news).toContain('/article/:slug');
      
      // Event routes
      expect(routeConfig.categories.events).toContain('/events/calendar');
      expect(routeConfig.categories.events).toContain('/event/:slug');
      
      // Marketplace routes
      expect(routeConfig.categories.marketplace).toContain('/classifieds');
      expect(routeConfig.categories.marketplace).toContain('/classified/:id');
    });
  });

  describe('community-scoped routes', () => {
    test('should have community variants for main routes', () => {
      const mainRoutes = ['/settings', '/events', '/businesses', '/classifieds'];
      
      mainRoutes.forEach(route => {
        const mainConfig = getRouteConfig(route);
        const communityRoute = `/:community${route}`;
        const communityConfig = routeConfig.routes[communityRoute];
        
        expect(mainConfig).toBeDefined();
        expect(communityConfig).toBeDefined();
        expect(communityConfig.communityScoped).toBe(true);
        expect(communityConfig.component).toBe(mainConfig.component);
      });
    });

    test('should maintain consistent TTL across community variants', () => {
      const routes = ['/settings', '/events', '/businesses'];
      
      routes.forEach(route => {
        const mainTTL = getTTL(route);
        const communityTTL = getTTL(`/:community${route}`);
        
        expect(mainTTL).toBe(communityTTL);
      });
    });
  });

  describe('performance considerations', () => {
    test('should have efficient route lookup', () => {
      const testRoutes = [
        '/',
        '/settings',
        '/events',
        '/profile/testuser',
        '/article/test-article',
        '/business/test-business'
      ];
      
      const startTime = process.hrtime();
      
      // Perform many route lookups
      for (let i = 0; i < 1000; i++) {
        testRoutes.forEach(route => {
          getRouteConfig(route);
          shouldUseISR(route);
          getTTL(route);
        });
      }
      
      const [seconds, nanoseconds] = process.hrtime(startTime);
      const milliseconds = seconds * 1000 + nanoseconds / 1000000;
      
      // Should complete 3000 lookups in reasonable time
      expect(milliseconds).toBeLessThan(100);
    });

    test('should balance cache duration with content freshness', () => {
      // Dynamic content should have shorter TTL
      const dynamicRoutes = ['/article/:slug', '/event/:slug', '/profile/:username'];
      dynamicRoutes.forEach(route => {
        const config = getRouteConfig(route.replace(':slug', 'test').replace(':username', 'test'));
        expect(config.ttl).toBeLessThanOrEqual(3600); // Max 1 hour
      });

      // Static content can have longer TTL
      const staticRoutes = ['/memorials', '/businesses', '/photos'];
      staticRoutes.forEach(route => {
        const config = getRouteConfig(route);
        expect(config.ttl).toBeGreaterThanOrEqual(3600); // Min 1 hour
      });
    });
  });

  describe('edge cases', () => {
    test('should handle malformed routes', () => {
      expect(getRouteConfig('')).toBeNull();
      expect(getRouteConfig(null)).toBeNull();
      expect(getRouteConfig(undefined)).toBeNull();
    });

    test('should handle routes with special characters', () => {
      const specialRoute = '/article/test-article-with-special-chars-123';
      const config = getRouteConfig(specialRoute);
      expect(config).toBeDefined();
    });

    test('should handle very long routes', () => {
      const longRoute = '/article/' + 'a'.repeat(200);
      const config = getRouteConfig(longRoute);
      expect(config).toBeDefined();
    });

    test('should handle invalidation with missing parameters gracefully', () => {
      const targets = getInvalidationTargets('news', 'publish');
      expect(Array.isArray(targets)).toBe(true);
      // Should still work even without parameter data
    });
  });
});