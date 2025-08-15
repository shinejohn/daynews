# Version B ISR Test Suite

This directory contains the comprehensive test suite for the Version B Incremental Static Regeneration (ISR) system.

## 📁 Directory Structure

```
tests/
├── fixtures/           # Mock data and sample responses
│   ├── sample-articles.json
│   ├── sample-businesses.json
│   ├── sample-events.json
│   ├── sample-users.json
│   ├── sample-cache-entries.json
│   └── sample-html-responses.js
├── integration/        # Integration tests for system components
│   └── isr-middleware.test.js
├── unit/              # Unit tests for individual components
│   └── cache-manager.test.js
├── utils/             # Test utilities and helpers
│   └── test-helpers.js
├── setup.js           # Global test setup and configuration
├── run-tests.js       # Custom test runner
└── README.md          # This file
```

## 🚀 Running Tests

### Quick Start

```bash
# Run all tests
npm test

# Run unit tests only
npm run test:unit

# Run integration tests only
npm run test:integration

# Run tests in watch mode
npm run test:watch

# Run tests with coverage report
npm run test:coverage

# Get help with test commands
npm run test:help
```

### Advanced Usage

```bash
# Run specific test files
npm test -- --testPathPattern="cache-manager"

# Run tests with verbose output
npm test -- --verbose

# Run tests matching a pattern
npm test -- --testNamePattern="cache hit"

# Run tests and update snapshots
npm test -- --updateSnapshot
```

## 🔧 Test Configuration

The test suite is configured with:

- **Jest** as the test runner
- **ES Module** support (matching project configuration)
- **Custom test helpers** for ISR-specific testing
- **Mock data fixtures** for consistent test scenarios
- **Performance timing** utilities
- **Automatic cleanup** of test cache directories

### Environment Variables

```bash
NODE_ENV=test                    # Set automatically
CACHE_DIR=./test-cache          # Test-specific cache directory
SUPABASE_URL=http://localhost:54321  # Test Supabase instance
SUPABASE_ANON_KEY=test-key      # Test API key
```

## 📝 Writing Tests

### Unit Tests

Unit tests focus on individual components in isolation:

```javascript
import { describe, test, expect, beforeEach } from '@jest/globals';
import { CacheManager } from '../../server/isr/cache-manager.js';
import { TestCacheManager } from '../utils/test-helpers.js';

describe('CacheManager', () => {
  let cacheManager;
  let testCacheDir;

  beforeEach(async () => {
    testCacheDir = await global.createTempDir('cache-test');
    cacheManager = new CacheManager(testCacheDir);
  });

  test('should cache and retrieve data', async () => {
    const data = { html: '<html></html>', context: {} };
    await cacheManager.set('/test', data);
    const result = await cacheManager.get('/test');
    expect(result.html).toBe(data.html);
  });
});
```

### Integration Tests

Integration tests verify system components working together:

```javascript
import { ISRMiddleware } from '../../server/isr/isr-middleware.js';
import { createMockRequest, createMockResponse } from '../utils/test-helpers.js';

describe('ISR Integration', () => {
  test('should handle cache miss and render', async () => {
    const middleware = new ISRMiddleware({ cacheDir: testCacheDir });
    const req = createMockRequest({ path: '/test' });
    const res = createMockResponse();
    
    await middleware.handle(req, res, jest.fn());
    
    expect(res.setHeader).toHaveBeenCalledWith('X-Cache', 'MISS');
  });
});
```

## 🛠 Test Utilities

### TestCacheManager

Helper for creating and managing test cache entries:

```javascript
import { TestCacheManager } from '../utils/test-helpers.js';

const testCache = new TestCacheManager('./test-cache');
await testCache.createCacheEntry('/test', {
  html: '<html></html>',
  context: {}
}, { ttl: 300 });
```

### Mock Creators

Utilities for creating test doubles:

```javascript
import { 
  createMockRequest,
  createMockResponse,
  createSupabaseMock,
  generateTestData
} from '../utils/test-helpers.js';

const req = createMockRequest({ path: '/test', method: 'GET' });
const res = createMockResponse();
const supabase = createSupabaseMock({ users_list: { data: [] } });
const article = generateTestData('article', 1, { title: 'Custom Title' });
```

### Performance Testing

Measure test performance:

```javascript
import { PerformanceTimer } from '../utils/test-helpers.js';

const timer = new PerformanceTimer();
const { time } = await timer.measure('operation', async () => {
  // Your test operation
});
console.log(`Operation took ${time}ms`);
```

## 📊 Fixtures

Test fixtures provide consistent mock data:

- `sample-articles.json` - News articles with complete metadata
- `sample-businesses.json` - Business directory entries
- `sample-events.json` - Community events
- `sample-users.json` - User profiles and journalists
- `sample-cache-entries.json` - Pre-configured cache entries
- `sample-html-responses.js` - HTML response templates

### Using Fixtures

```javascript
const articles = await global.readFixture('sample-articles.json');
const htmlResponse = await global.readFixture('sample-html-responses.js');
```

## 🔍 Coverage Reports

Coverage reports are generated in the `coverage/` directory:

```bash
npm run test:coverage
open coverage/lcov-report/index.html  # View HTML report
```

Coverage includes:
- **Statement coverage** - Lines of code executed
- **Branch coverage** - Conditional branches taken
- **Function coverage** - Functions called
- **Line coverage** - Individual lines executed

## 🐛 Debugging Tests

### Debug Mode

Run tests with Node.js debugging:

```bash
node --inspect-brk node_modules/.bin/jest --runInBand
```

### Console Output

Use the mock console utilities:

```javascript
beforeEach(() => {
  global.mockConsole();
});

afterEach(() => {
  global.restoreConsole();
});
```

### Test Isolation

Each test runs in isolation with:
- Fresh cache directories
- Reset mocks
- Clean environment variables
- Automatic cleanup

## ⚡ Performance Considerations

- Tests use temporary directories for cache operations
- Concurrent test execution is supported
- Automatic cleanup prevents disk space issues
- Performance timing helps identify slow tests

## 🤝 Contributing

When adding new tests:

1. **Unit tests** for new ISR components
2. **Integration tests** for component interactions
3. **Fixtures** for new data types
4. **Helpers** for common test patterns
5. **Documentation** for complex test scenarios

### Test Naming Convention

- `describe()` blocks use component/feature names
- `test()` descriptions start with "should"
- Test files end with `.test.js`
- Use descriptive test names that explain the scenario

### Best Practices

- Test both success and error scenarios
- Use fixtures for consistent test data
- Clean up resources in `afterEach`
- Mock external dependencies
- Test performance-critical paths
- Include edge cases and boundary conditions

## 📚 Additional Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Testing Library](https://testing-library.com/)
- [MSW (Mock Service Worker)](https://mswjs.io/)
- [Supertest HTTP Testing](https://github.com/visionmedia/supertest)

For questions or issues with the test suite, check the existing tests for examples or create an issue in the project repository.