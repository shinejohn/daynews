# Data Layer Integration Tests

This directory contains comprehensive integration tests for the data layer of the Day News application. These tests ensure that database queries, mock vs real data switching, cache invalidation flows, API response validation, and error handling work correctly across the entire data stack.

## Test Files Overview

### 1. `data-provider.test.js`
Tests the Supabase data provider functionality including:

- **Database Query Integration**: Tests actual Supabase query generation and execution
- **Mock vs Real Data Switching**: Validates behavior when Supabase is available vs. mock mode
- **Data Structure Consistency**: Ensures consistent data formats across different methods
- **Error Handling**: Tests database connection failures and query errors
- **Performance**: Validates query efficiency with large datasets

#### Key Test Scenarios:
- News operations (fetch, search, view count increment)
- Events with RSVP count aggregation
- Business queries with rating calculations
- Search across multiple content types
- Homepage data aggregation
- Author and community data fetching

### 2. `data-context.test.js`
Tests the SSR data context system including:

- **Route Data Loading**: Validates data fetching for different routes
- **Community Scoping**: Tests community-specific data loading
- **Parameter Extraction**: Route parameter parsing and validation
- **Error Recovery**: Graceful handling of data loading failures
- **Performance**: Concurrent data loading and optimization

#### Key Test Scenarios:
- Homepage, news, events, business data loading
- Dynamic route parameter handling
- Community-scoped routes
- Search functionality
- Error handling and fallback mechanisms

### 3. `cache-invalidation.test.js`
Tests webhook-based cache invalidation including:

- **Webhook Processing**: Validates webhook payload handling
- **Route Invalidation**: Tests cache invalidation for affected routes
- **Community Scoping**: Community-specific route invalidation
- **Batch Operations**: High-frequency invalidation scenarios
- **Error Recovery**: Handles invalidation failures and retries

#### Key Test Scenarios:
- News, event, and business invalidation patterns
- Concurrent webhook processing
- Admin route filtering
- Performance under load
- Error handling and monitoring

### 4. `api-endpoints.test.js`
Tests API route functionality including:

- **HTTP Endpoints**: All API routes with various parameters
- **Response Validation**: Correct status codes and data formats
- **Error Handling**: 4xx and 5xx error scenarios
- **Performance**: Load testing and concurrent requests
- **Security**: Input sanitization and validation

#### Key Test Scenarios:
- News, events, business, deals, search endpoints
- Health check and monitoring endpoints
- Webhook invalidation endpoint
- Communities API
- Performance and load testing

## Test Environment Setup

### Prerequisites
```bash
# Install dependencies
npm install

# Set up test environment variables
export NODE_ENV=test
export SUPABASE_URL=http://localhost:54321
export SUPABASE_ANON_KEY=test-key
```

### Test Database
The integration tests can run in two modes:

1. **Mock Mode** (default): Uses mock data without requiring a real database
2. **Supabase Mode**: Connects to actual Supabase instance for real integration testing

To run with real Supabase:
```bash
export SUPABASE_URL=your-supabase-url
export SUPABASE_ANON_KEY=your-anon-key
npm run test:integration
```

## Running the Tests

### All Integration Tests
```bash
npm run test:integration
```

### Individual Test Files
```bash
# Data Provider tests
npx jest tests/integration/data-provider.test.js

# Data Context tests
npx jest tests/integration/data-context.test.js

# Cache Invalidation tests
npx jest tests/integration/cache-invalidation.test.js

# API Endpoints tests
npx jest tests/integration/api-endpoints.test.js
```

### With Coverage
```bash
npm run test:integration -- --coverage
```

### Watch Mode
```bash
npm run test:integration -- --watch
```

## Test Fixtures and Utilities

### Test Helpers (`../utils/test-helpers.js`)
- **Mock Creation**: Supabase client mocks, HTTP request/response mocks
- **Data Generation**: Realistic test data generation
- **Performance Timing**: Performance measurement utilities
- **Validation**: Response and data structure validation

### Test Fixtures (`../fixtures/`)
- **Sample Data**: Pre-generated test data for consistent testing
- **Scenarios**: Common test scenarios and edge cases
- **HTML Responses**: Sample HTML for ISR cache testing

## Key Testing Patterns

### 1. Mock vs Real Data Testing
```javascript
describe('Supabase Mode', () => {
  beforeEach(() => {
    process.env.SUPABASE_URL = 'http://localhost:54321';
    process.env.SUPABASE_ANON_KEY = 'test-key';
    // Test with real Supabase client
  });
});

describe('Mock Mode', () => {
  beforeEach(() => {
    delete process.env.SUPABASE_URL;
    delete process.env.SUPABASE_ANON_KEY;
    // Test with mock data
  });
});
```

### 2. API Integration Testing
```javascript
test('should fetch news with proper query parameters', async () => {
  const response = await request(app)
    .get('/api/news?community=downtown&limit=5')
    .expect(200);
    
  expect(response.body).toHaveLength(5);
  expect(dataProvider.getLatestNews).toHaveBeenCalledWith('downtown', 5);
});
```

### 3. Cache Invalidation Testing
```javascript
test('should invalidate related routes on webhook', async () => {
  await invalidationHandler.handleWebhook(webhookRequest, mockResponse);
  
  expect(isrEngine.revalidate).toHaveBeenCalledWith('/news');
  expect(isrEngine.revalidate).toHaveBeenCalledWith('/');
});
```

### 4. Error Handling Testing
```javascript
test('should handle database errors gracefully', async () => {
  mockDataProvider.getLatestNews.mockRejectedValue(new Error('DB Error'));
  
  const result = await getDataForRoute('/news', {});
  
  expect(result.error).toBe('DB Error');
  expect(result.community).toEqual({ id: 'downtown' });
});
```

## Performance Expectations

### Response Times
- Simple queries: < 100ms
- Complex aggregations: < 500ms
- Concurrent requests (20): < 2s
- Large datasets (1000 items): < 1s

### Cache Operations
- Single invalidation: < 50ms
- Batch invalidations (50): < 5s
- Webhook processing: < 200ms

### Memory Usage
- Test suite should not exceed 512MB
- No memory leaks during extended runs
- Proper cleanup of resources

## Debugging Tips

### Enable Debug Logging
```bash
DEBUG=test:* npm run test:integration
```

### Isolate Failing Tests
```bash
npx jest tests/integration/data-provider.test.js --testNamePattern="should fetch latest news"
```

### Check Test Coverage
```bash
npm run test:integration -- --coverage --coverageReporters=html
open coverage/lcov-report/index.html
```

### Performance Profiling
```bash
npx jest tests/integration/api-endpoints.test.js --detectOpenHandles --logHeapUsage
```

## Continuous Integration

### GitHub Actions Example
```yaml
- name: Run Integration Tests
  run: |
    npm run test:integration -- --coverage
    npm run test:integration -- --testNamePattern="Performance"
  env:
    NODE_ENV: test
    SUPABASE_URL: ${{ secrets.TEST_SUPABASE_URL }}
    SUPABASE_ANON_KEY: ${{ secrets.TEST_SUPABASE_KEY }}
```

## Common Issues and Solutions

### 1. Supabase Connection Failures
- Ensure test database is running
- Check environment variables
- Verify network connectivity

### 2. Mock Data Inconsistencies
- Use `generateTestData()` for consistent test data
- Validate data structure in tests
- Reset mocks between tests

### 3. Async/Await Issues
- Always await async operations
- Use proper error handling
- Clean up resources in teardown

### 4. Performance Test Flakiness
- Use performance timers consistently
- Account for system load variations
- Set reasonable thresholds

## Contributing

When adding new integration tests:

1. Follow existing naming conventions
2. Include both success and error scenarios
3. Test edge cases and boundary conditions
4. Add performance validations where appropriate
5. Update documentation for new test scenarios

### Test Checklist
- [ ] Tests run in both mock and real modes
- [ ] Error scenarios covered
- [ ] Performance expectations validated
- [ ] Documentation updated
- [ ] No test pollution (proper cleanup)
- [ ] Meaningful assertions and descriptions