// Test utility functions for Version B ISR system
import { jest } from '@jest/globals';
import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';

/**
 * Cache Testing Utilities
 */
export class TestCacheManager {
  constructor(cacheDir = global.TEST_CONFIG?.cacheDir || './test-cache') {
    this.cacheDir = cacheDir;
  }

  async init() {
    await fs.mkdir(this.cacheDir, { recursive: true });
  }

  async createCacheEntry(route, data, options = {}) {
    const cacheKey = crypto.createHash('md5').update(route).digest('hex');
    const cachePath = path.join(this.cacheDir, `${cacheKey}.json`);
    
    const cacheData = {
      route,
      html: data.html || '<html><body>Test Content</body></html>',
      context: data.context || {},
      timestamp: options.timestamp || Date.now(),
      ttl: (options.ttl || 300) * 1000,
      expiresAt: (options.timestamp || Date.now()) + ((options.ttl || 300) * 1000),
      ...data
    };

    await fs.writeFile(cachePath, JSON.stringify(cacheData));
    return { cacheData, cachePath };
  }

  async getCacheFiles() {
    try {
      const files = await fs.readdir(this.cacheDir);
      return files.filter(f => f.endsWith('.json'));
    } catch {
      return [];
    }
  }

  async clearCache() {
    try {
      await fs.rm(this.cacheDir, { recursive: true, force: true });
      await fs.mkdir(this.cacheDir, { recursive: true });
    } catch (error) {
      console.warn('Could not clear test cache:', error.message);
    }
  }
}

/**
 * HTTP Testing Utilities
 */
export function createMockRequest(overrides = {}) {
  return {
    path: '/',
    method: 'GET',
    headers: {},
    query: {},
    params: {},
    body: {},
    url: '/',
    originalUrl: '/',
    ...overrides
  };
}

export function createMockResponse() {
  const res = {
    status: jest.fn().mockReturnThis(),
    set: jest.fn().mockReturnThis(),
    setHeader: jest.fn().mockReturnThis(),
    end: jest.fn().mockReturnThis(),
    send: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
    headers: {},
    statusCode: 200
  };

  // Track what was sent
  res.end.mockImplementation((data) => {
    res._data = data;
    return res;
  });

  res.send.mockImplementation((data) => {
    res._data = data;
    return res;
  });

  res.json.mockImplementation((data) => {
    res._data = JSON.stringify(data);
    return res;
  });

  return res;
}

export function createMockNext() {
  return jest.fn();
}

/**
 * Data Generation Utilities
 */
export function generateTestData(type, count = 1, overrides = {}) {
  const generators = {
    article: () => ({
      id: crypto.randomUUID(),
      title: `Test Article ${Date.now()}`,
      content: 'This is test article content.',
      author: 'Test Author',
      published_at: new Date().toISOString(),
      slug: `test-article-${Date.now()}`,
      status: 'published'
    }),
    
    business: () => ({
      id: crypto.randomUUID(),
      name: `Test Business ${Date.now()}`,
      description: 'Test business description',
      address: '123 Test Street',
      phone: '555-0123',
      email: 'test@example.com',
      category: 'restaurant'
    }),
    
    event: () => ({
      id: crypto.randomUUID(),
      title: `Test Event ${Date.now()}`,
      description: 'Test event description',
      start_date: new Date().toISOString(),
      end_date: new Date(Date.now() + 3600000).toISOString(),
      location: 'Test Venue',
      organizer: 'Test Organizer'
    }),
    
    user: () => ({
      id: crypto.randomUUID(),
      email: `test${Date.now()}@example.com`,
      username: `testuser${Date.now()}`,
      created_at: new Date().toISOString(),
      role: 'user'
    })
  };

  const generator = generators[type];
  if (!generator) {
    throw new Error(`Unknown test data type: ${type}`);
  }

  if (count === 1) {
    return { ...generator(), ...overrides };
  }

  return Array.from({ length: count }, () => ({ ...generator(), ...overrides }));
}

/**
 * Route Testing Utilities
 */
export function createTestRoute(path, component = 'TestComponent', options = {}) {
  return {
    path,
    component,
    ttl: 300,
    revalidate: false,
    prerender: false,
    ...options
  };
}

export function generateRouteVariations(basePath, params = {}) {
  const variations = [basePath];
  
  // Add query parameter variations
  const queryParams = Object.entries(params);
  if (queryParams.length > 0) {
    const queryString = queryParams.map(([k, v]) => `${k}=${v}`).join('&');
    variations.push(`${basePath}?${queryString}`);
  }

  // Add trailing slash variation
  if (!basePath.endsWith('/')) {
    variations.push(`${basePath}/`);
  }

  return variations;
}

/**
 * Async Testing Utilities
 */
export function waitFor(condition, timeout = 5000, interval = 100) {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    
    const check = async () => {
      try {
        const result = await condition();
        if (result) {
          resolve(result);
          return;
        }
      } catch (error) {
        if (Date.now() - startTime >= timeout) {
          reject(new Error(`Timeout waiting for condition: ${error.message}`));
          return;
        }
      }
      
      if (Date.now() - startTime >= timeout) {
        reject(new Error('Timeout waiting for condition'));
        return;
      }
      
      setTimeout(check, interval);
    };
    
    check();
  });
}

export function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Validation Utilities
 */
export function validateCacheEntry(entry) {
  const required = ['route', 'html', 'timestamp', 'ttl', 'expiresAt'];
  const missing = required.filter(field => !(field in entry));
  
  if (missing.length > 0) {
    throw new Error(`Cache entry missing required fields: ${missing.join(', ')}`);
  }

  if (typeof entry.html !== 'string') {
    throw new Error('Cache entry html must be a string');
  }

  if (entry.timestamp > Date.now()) {
    throw new Error('Cache entry timestamp cannot be in the future');
  }

  if (entry.expiresAt <= entry.timestamp) {
    throw new Error('Cache entry expiresAt must be after timestamp');
  }

  return true;
}

export function validateHttpResponse(response) {
  if (!response || typeof response !== 'object') {
    throw new Error('Invalid response object');
  }

  if (typeof response.status !== 'function') {
    throw new Error('Response must have status method');
  }

  if (typeof response.set !== 'function') {
    throw new Error('Response must have set method');
  }

  if (typeof response.end !== 'function') {
    throw new Error('Response must have end method');
  }

  return true;
}

/**
 * Performance Testing Utilities
 */
export class PerformanceTimer {
  constructor() {
    this.times = new Map();
  }

  start(label) {
    this.times.set(label, process.hrtime());
  }

  end(label) {
    const start = this.times.get(label);
    if (!start) {
      throw new Error(`No timer started for label: ${label}`);
    }

    const [seconds, nanoseconds] = process.hrtime(start);
    const milliseconds = seconds * 1000 + nanoseconds / 1000000;
    
    this.times.delete(label);
    return milliseconds;
  }

  measure(label, fn) {
    this.start(label);
    const result = fn();
    
    if (result && typeof result.then === 'function') {
      return result.then(
        (value) => {
          const time = this.end(label);
          return { value, time };
        },
        (error) => {
          this.end(label);
          throw error;
        }
      );
    }

    const time = this.end(label);
    return { value: result, time };
  }
}

/**
 * Mock Creation Utilities
 */
export function createSupabaseMock(responses = {}) {
  const mockClient = {
    from: jest.fn((table) => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn(() => 
            Promise.resolve(responses[`${table}_single`] || { data: null, error: null })
          )
        })),
        limit: jest.fn(() => 
          Promise.resolve(responses[`${table}_list`] || { data: [], error: null })
        ),
        order: jest.fn().mockReturnThis(),
        range: jest.fn().mockReturnThis()
      })),
      insert: jest.fn(() => 
        Promise.resolve(responses[`${table}_insert`] || { data: null, error: null })
      ),
      update: jest.fn(() => ({
        eq: jest.fn(() => 
          Promise.resolve(responses[`${table}_update`] || { data: null, error: null })
        )
      })),
      delete: jest.fn(() => ({
        eq: jest.fn(() => 
          Promise.resolve(responses[`${table}_delete`] || { data: null, error: null })
        )
      }))
    })),
    auth: {
      getUser: jest.fn(() => 
        Promise.resolve(responses.auth_user || { data: { user: null }, error: null })
      )
    }
  };

  return mockClient;
}

export function createExpressMock() {
  return {
    use: jest.fn(),
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
    listen: jest.fn((port, callback) => {
      if (callback) callback();
      return { close: jest.fn() };
    })
  };
}

export default {
  TestCacheManager,
  createMockRequest,
  createMockResponse,
  createMockNext,
  generateTestData,
  createTestRoute,
  generateRouteVariations,
  waitFor,
  sleep,
  validateCacheEntry,
  validateHttpResponse,
  PerformanceTimer,
  createSupabaseMock,
  createExpressMock
};