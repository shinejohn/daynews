/**
 * End-to-End Tests for Multi-Community Routing System
 * Tests community-scoped routes, fallbacks, and dynamic community detection
 */

import request from 'supertest';
import { jest } from '@jest/globals';
import express from 'express';
import path from 'path';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';
import { routeConfig } from '../../server/route-config.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

let app;
let testCacheDir;

// Mock communities database
const mockCommunities = [
  {
    id: 'downtown',
    name: 'Downtown',
    slug: 'downtown',
    active: true,
    settings: { timezone: 'America/New_York', locale: 'en-US' }
  },
  {
    id: 'northbeach',
    name: 'North Beach',
    slug: 'northbeach',
    active: true,
    settings: { timezone: 'America/New_York', locale: 'en-US' }
  },
  {
    id: 'university',
    name: 'University District',
    slug: 'university',
    active: true,
    settings: { timezone: 'America/New_York', locale: 'en-US' }
  },
  {
    id: 'disabled',
    name: 'Disabled Community',
    slug: 'disabled',
    active: false,
    settings: { timezone: 'America/New_York', locale: 'en-US' }
  }
];

describe('Community Routing End-to-End Tests', () => {
  beforeAll(async () => {
    testCacheDir = await global.createTempDir('community-routing-test');
    process.env.CACHE_DIR = testCacheDir;
    process.env.NODE_ENV = 'test';
    process.env.DEFAULT_COMMUNITY_ID = 'downtown';
    
    app = express();
    app.use(express.json());
    
    // Community resolution middleware
    app.use('/:community?/*', async (req, res, next) => {
      const communitySlug = req.params.community;
      const path = req.path;
      
      // Skip API and static routes
      if (path.startsWith('/api') || path.startsWith('/assets') || path.startsWith('/health')) {
        return next();
      }
      
      if (communitySlug && !path.startsWith('/api')) {
        // Check if first segment is a valid community
        const community = mockCommunities.find(c => c.slug === communitySlug && c.active);
        
        if (community) {
          // Valid community route
          req.community = community;
          req.routeType = 'community-scoped';
          req.baseRoute = req.path.replace(`/${communitySlug}`, '') || '/';
        } else {
          // Invalid community - check if it's actually a route
          const possibleRoute = `/${communitySlug}${req.path.slice(communitySlug.length + 1)}`;
          if (routeConfig.routes[possibleRoute]) {
            // It's actually a regular route, not a community
            req.url = possibleRoute;
            req.routeType = 'regular';
            req.baseRoute = possibleRoute;
          } else {
            // Invalid community and not a valid route
            return res.status(404).json({
              error: 'Community not found',
              community: communitySlug,
              available: mockCommunities.filter(c => c.active).map(c => c.slug)
            });
          }
        }
      } else {
        // Regular route (no community prefix)
        req.community = mockCommunities.find(c => c.id === process.env.DEFAULT_COMMUNITY_ID);
        req.routeType = 'regular';
        req.baseRoute = req.path;
      }
      
      next();
    });
    
    // Mock page renderer
    app.use('*', async (req, res) => {
      const route = req.originalUrl;
      const community = req.community;
      const routeType = req.routeType;
      const baseRoute = req.baseRoute;
      
      try {
        // Simulate route configuration lookup
        const routeKey = community && routeType === 'community-scoped' 
          ? `/:community${baseRoute}`
          : baseRoute;
          
        const config = routeConfig.routes[routeKey] || routeConfig.routes[baseRoute];
        
        if (!config && baseRoute !== '/') {
          return res.status(404).json({
            error: 'Route not found',
            route: baseRoute,
            routeKey,
            community: community?.slug
          });
        }
        
        // Mock data based on community and route
        const pageData = {
          community: {
            id: community?.id,
            name: community?.name,
            slug: community?.slug,
            settings: community?.settings
          },
          route: {
            path: route,
            baseRoute,
            routeType,
            config: config || { component: 'HomePage', renderingMode: 'ISR' }
          },
          content: {
            title: `${config?.component || 'Page'} - ${community?.name || 'Default'}`,
            timestamp: new Date().toISOString()
          }
        };
        
        // Generate HTML response
        const html = `<!DOCTYPE html>
<html>
<head>
  <title>${pageData.content.title}</title>
  <meta name="community" content="${community?.slug || 'default'}">
  <meta name="route-type" content="${routeType}">
</head>
<body>
  <div id="app">
    <header>
      <h1>${pageData.content.title}</h1>
      <nav>
        <span class="community-name">${community?.name || 'Default Community'}</span>
        <span class="route-info">${baseRoute} (${routeType})</span>
      </nav>
    </header>
    <main>
      <section class="route-details">
        <p>Full Route: ${route}</p>
        <p>Base Route: ${baseRoute}</p>
        <p>Community: ${community?.slug || 'none'}</p>
        <p>Component: ${config?.component || 'Unknown'}</p>
        <p>TTL: ${config?.ttl || 300}s</p>
      </section>
      <section class="content">
        <p>This is the ${config?.component || 'default'} component rendered for the ${community?.name || 'default'} community.</p>
      </section>
    </main>
  </div>
  <script>
    window.__COMMUNITY_DATA__ = ${JSON.stringify(pageData)};
    window.__ROUTE_CONFIG__ = ${JSON.stringify(config || {})};
  </script>
</body>
</html>`;
        
        res.set({
          'Content-Type': 'text/html',
          'X-Community': community?.slug || 'default',
          'X-Route-Type': routeType,
          'X-Base-Route': baseRoute,
          'X-Component': config?.component || 'Unknown'
        });
        
        res.status(200).send(html);
        
      } catch (error) {
        console.error('Community routing error:', error);
        res.status(500).json({
          error: 'Community routing failed',
          message: error.message,
          route,
          community: community?.slug
        });
      }
    });
    
    // API endpoints for testing
    app.get('/api/communities', (req, res) => {
      res.json(mockCommunities.filter(c => c.active));
    });
    
    app.get('/api/communities/:slug', (req, res) => {
      const community = mockCommunities.find(c => c.slug === req.params.slug);
      if (!community) {
        return res.status(404).json({ error: 'Community not found' });
      }
      res.json(community);
    });
    
    app.get('/health', (req, res) => {
      res.json({ status: 'healthy', communities: mockCommunities.length });
    });
  });

  afterAll(async () => {
    try {
      await fs.rm(testCacheDir, { recursive: true, force: true });
    } catch (error) {
      console.warn('Failed to cleanup test cache:', error.message);
    }
  });

  describe('Basic Community Routing', () => {
    test('should route to community homepage', async () => {
      const response = await request(app)
        .get('/downtown/')
        .expect(200);
      
      expect(response.headers['x-community']).toBe('downtown');
      expect(response.headers['x-route-type']).toBe('community-scoped');
      expect(response.headers['x-base-route']).toBe('/');
      expect(response.text).toContain('Downtown');
      expect(response.text).toContain('Community: downtown');
    });

    test('should route to community-scoped pages', async () => {
      const routes = [
        { path: '/downtown/news', baseRoute: '/news' },
        { path: '/downtown/events', baseRoute: '/events' },
        { path: '/downtown/businesses', baseRoute: '/businesses' },
        { path: '/northbeach/announcements', baseRoute: '/announcements' }
      ];
      
      for (const { path, baseRoute } of routes) {
        const response = await request(app)
          .get(path)
          .expect(200);
        
        const community = path.split('/')[1];
        expect(response.headers['x-community']).toBe(community);
        expect(response.headers['x-route-type']).toBe('community-scoped');
        expect(response.headers['x-base-route']).toBe(baseRoute);
        expect(response.text).toContain(`Community: ${community}`);
      }
    });

    test('should handle regular routes without community prefix', async () => {
      const response = await request(app)
        .get('/news')
        .expect(200);
      
      expect(response.headers['x-community']).toBe('downtown'); // Default community
      expect(response.headers['x-route-type']).toBe('regular');
      expect(response.headers['x-base-route']).toBe('/news');
      expect(response.text).toContain('Default Community');
    });
  });

  describe('Community Validation', () => {
    test('should reject invalid communities', async () => {
      const response = await request(app)
        .get('/invalid-community/news')
        .expect(404);
      
      expect(response.body).toHaveProperty('error', 'Community not found');
      expect(response.body).toHaveProperty('community', 'invalid-community');
      expect(response.body).toHaveProperty('available');
      expect(response.body.available).toEqual(['downtown', 'northbeach', 'university']);
    });

    test('should reject disabled communities', async () => {
      const response = await request(app)
        .get('/disabled/news')
        .expect(404);
      
      expect(response.body).toHaveProperty('error', 'Community not found');
      expect(response.body).toHaveProperty('community', 'disabled');
    });

    test('should handle ambiguous routes correctly', async () => {
      // When 'news' could be a community or route, it should be treated as a route
      const response = await request(app)
        .get('/news')
        .expect(200);
      
      expect(response.headers['x-route-type']).toBe('regular');
      expect(response.headers['x-base-route']).toBe('/news');
    });
  });

  describe('Dynamic Route Parameters', () => {
    test('should handle community-scoped dynamic routes', async () => {
      const routes = [
        '/downtown/article/test-article-123',
        '/northbeach/event/summer-festival',
        '/university/business/campus-bookstore'
      ];
      
      for (const route of routes) {
        const response = await request(app)
          .get(route)
          .expect(200);
        
        const [, community, ...pathParts] = route.split('/');
        const baseRoute = '/' + pathParts.join('/');
        
        expect(response.headers['x-community']).toBe(community);
        expect(response.headers['x-route-type']).toBe('community-scoped');
        expect(response.text).toContain(`Community: ${community}`);
        expect(response.text).toContain(`Full Route: ${route}`);
      }
    });

    test('should pass route parameters correctly', async () => {
      const response = await request(app)
        .get('/downtown/article/my-test-article?category=local&sort=date')
        .expect(200);
      
      expect(response.headers['x-community']).toBe('downtown');
      expect(response.text).toContain('Full Route: /downtown/article/my-test-article?category=local&sort=date');
      
      // Check that data includes parameters
      const dataMatch = response.text.match(/window\.__COMMUNITY_DATA__ = (.+);/);
      expect(dataMatch).toBeTruthy();
    });
  });

  describe('Route Configuration Integration', () => {
    test('should use correct TTL for community routes', async () => {
      const routes = [
        { path: '/downtown/news', expectedTTL: 300 },
        { path: '/downtown/announcements', expectedTTL: 1800 },
        { path: '/downtown/businesses', expectedTTL: 21600 }
      ];
      
      for (const { path, expectedTTL } of routes) {
        const response = await request(app)
          .get(path)
          .expect(200);
        
        expect(response.text).toContain(`TTL: ${expectedTTL}s`);
      }
    });

    test('should identify correct components for routes', async () => {
      const routes = [
        { path: '/downtown/', component: 'HomePage' },
        { path: '/downtown/events', component: 'EventsPage' },
        { path: '/downtown/announcements', component: 'AnnouncementsPage' }
      ];
      
      for (const { path, component } of routes) {
        const response = await request(app)
          .get(path)
          .expect(200);
        
        expect(response.headers['x-component']).toBe(component);
        expect(response.text).toContain(`Component: ${component}`);
      }
    });
  });

  describe('Community API Integration', () => {
    test('should provide communities API', async () => {
      const response = await request(app)
        .get('/api/communities')
        .expect(200);
      
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body).toHaveLength(3); // Only active communities
      
      const slugs = response.body.map(c => c.slug);
      expect(slugs).toEqual(['downtown', 'northbeach', 'university']);
    });

    test('should provide individual community details', async () => {
      const response = await request(app)
        .get('/api/communities/downtown')
        .expect(200);
      
      expect(response.body).toHaveProperty('id', 'downtown');
      expect(response.body).toHaveProperty('name', 'Downtown');
      expect(response.body).toHaveProperty('slug', 'downtown');
      expect(response.body).toHaveProperty('active', true);
      expect(response.body).toHaveProperty('settings');
    });

    test('should handle non-existent community API requests', async () => {
      const response = await request(app)
        .get('/api/communities/nonexistent')
        .expect(404);
      
      expect(response.body).toHaveProperty('error', 'Community not found');
    });
  });

  describe('Nested Community Routes', () => {
    test('should handle deeply nested community routes', async () => {
      const deepRoutes = [
        '/downtown/classifieds/confirmation',
        '/northbeach/events/eventcreator',
        '/university/business/premium-enrollment'
      ];
      
      for (const route of deepRoutes) {
        const response = await request(app)
          .get(route)
          .expect(200);
        
        const community = route.split('/')[1];
        expect(response.headers['x-community']).toBe(community);
        expect(response.text).toContain(`Community: ${community}`);
      }
    });

    test('should maintain route hierarchy in community context', async () => {
      const response = await request(app)
        .get('/downtown/classifieds/payment')
        .expect(200);
      
      expect(response.headers['x-community']).toBe('downtown');
      expect(response.headers['x-base-route']).toBe('/classifieds/payment');
      expect(response.text).toContain('Base Route: /classifieds/payment');
    });
  });

  describe('Error Handling and Edge Cases', () => {
    test('should handle empty community segments', async () => {
      const response = await request(app)
        .get('//news') // Double slash
        .expect(200);
      
      // Should treat as regular route
      expect(response.headers['x-route-type']).toBe('regular');
    });

    test('should handle trailing slashes consistently', async () => {
      const routes = [
        '/downtown/news',
        '/downtown/news/'
      ];
      
      for (const route of routes) {
        const response = await request(app)
          .get(route)
          .expect(200);
        
        expect(response.headers['x-community']).toBe('downtown');
        expect(response.headers['x-route-type']).toBe('community-scoped');
      }
    });

    test('should handle special characters in community routes', async () => {
      const response = await request(app)
        .get('/downtown/events/winter-festival-2024!')
        .expect(200);
      
      expect(response.headers['x-community']).toBe('downtown');
      expect(response.text).toContain('winter-festival-2024!');
    });

    test('should handle query parameters in community routes', async () => {
      const response = await request(app)
        .get('/downtown/search?q=test%20query&page=1&filter=local')
        .expect(200);
      
      expect(response.headers['x-community']).toBe('downtown');
      expect(response.text).toContain('search?q=test%20query&page=1&filter=local');
    });
  });

  describe('Performance and Caching', () => {
    test('should handle concurrent community route requests', async () => {
      const communities = ['downtown', 'northbeach', 'university'];
      const routes = ['/', '/news', '/events', '/businesses'];
      
      const requests = communities.flatMap(community =>
        routes.map(route => 
          request(app).get(`/${community}${route}`)
        )
      );
      
      const startTime = Date.now();
      const responses = await Promise.all(requests);
      const duration = Date.now() - startTime;
      
      // All requests should succeed
      responses.forEach((response, index) => {
        expect(response.status).toBe(200);
        
        const communityIndex = Math.floor(index / routes.length);
        const expectedCommunity = communities[communityIndex];
        expect(response.headers['x-community']).toBe(expectedCommunity);
      });
      
      // Should complete within reasonable time
      expect(duration).toBeLessThan(3000);
    });

    test('should maintain performance with complex routing logic', async () => {
      const complexRoutes = [
        '/downtown/classifieds/selectcommunities?category=housing&budget=1000',
        '/northbeach/events/calendar?month=2024-03&view=grid',
        '/university/businesses?category=restaurants&sort=rating&page=2'
      ];
      
      const startTime = Date.now();
      const promises = complexRoutes.map(route => request(app).get(route));
      const responses = await Promise.all(promises);
      const duration = Date.now() - startTime;
      
      responses.forEach(response => {
        expect(response.status).toBe(200);
        expect(response.headers['x-route-type']).toBe('community-scoped');
      });
      
      expect(duration).toBeLessThan(1000);
    });
  });

  describe('Community Context Data', () => {
    test('should inject community data into pages', async () => {
      const response = await request(app)
        .get('/downtown/events')
        .expect(200);
      
      const dataMatch = response.text.match(/window\.__COMMUNITY_DATA__ = (.+);/);
      expect(dataMatch).toBeTruthy();
      
      const communityData = JSON.parse(dataMatch[1]);
      expect(communityData.community).toEqual({
        id: 'downtown',
        name: 'Downtown',
        slug: 'downtown',
        settings: { timezone: 'America/New_York', locale: 'en-US' }
      });
      
      expect(communityData.route).toHaveProperty('routeType', 'community-scoped');
      expect(communityData.route).toHaveProperty('baseRoute', '/events');
    });

    test('should provide route configuration data', async () => {
      const response = await request(app)
        .get('/downtown/announcements')
        .expect(200);
      
      const configMatch = response.text.match(/window\.__ROUTE_CONFIG__ = (.+);/);
      expect(configMatch).toBeTruthy();
      
      const routeConfig = JSON.parse(configMatch[1]);
      expect(routeConfig).toHaveProperty('component', 'AnnouncementsPage');
      expect(routeConfig).toHaveProperty('renderingMode', 'ISR');
      expect(routeConfig).toHaveProperty('ttl', 1800);
    });
  });
});