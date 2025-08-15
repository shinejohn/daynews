# End-to-End Tests

This directory contains comprehensive end-to-end tests for the Day News ISR (Incremental Static Regeneration) server endpoints. These tests validate the complete request/response cycles, ISR cache behavior, community-based routing, and performance under various load conditions.

## Test Files Overview

### 1. `server-rendering.test.js`
Tests the complete Server-Side Rendering (SSR) pipeline from request to rendered response.

**Key Features Tested:**
- Basic SSR rendering with proper HTML output
- SSR data hydration and injection
- Community-scoped SSR rendering
- Error handling and fallback mechanisms
- Performance thresholds for rendering
- Concurrent request handling
- Memory management during SSR
- XSS protection in data injection
- Response headers and metadata

**Coverage:**
- Homepage and dynamic route rendering
- Route parameter handling
- Community context injection
- Error boundaries and graceful degradation
- Performance under load (concurrent rendering)
- Memory leak detection

### 2. `isr-flow.test.js`
Tests the complete Incremental Static Regeneration lifecycle: cache miss → render → cache hit → stale → revalidate.

**Key Features Tested:**
- Complete ISR cache lifecycle
- Cache hit/miss/stale behavior
- TTL (Time To Live) management
- Revalidation queue processing
- Concurrent request handling during cache operations
- Cache key generation and consistency
- Error handling in ISR flow
- Performance benchmarks for cache operations

**Coverage:**
- Cache miss → hit → stale → revalidate flow
- Different TTL values for different route types
- Concurrent requests to uncached routes
- Stale-while-revalidate functionality
- Cache corruption handling
- Disk space error handling
- High cache hit rate performance
- Cache management API endpoints

### 3. `community-routing.test.js`
Tests the multi-community routing system with community-scoped routes and fallbacks.

**Key Features Tested:**
- Community-scoped route resolution
- Community validation and rejection
- Dynamic route parameters in community context
- Route configuration integration
- Community API endpoints
- Nested and deeply nested routes
- Error handling for invalid communities
- Performance with complex routing logic

**Coverage:**
- Basic community routing (`/downtown/news`)
- Invalid community rejection
- Ambiguous route handling
- Community-scoped dynamic routes
- Route configuration lookup
- Community API integration
- Complex nested routes
- Edge cases (trailing slashes, special characters)
- Community data injection into pages

### 4. `performance.test.js`
Performance benchmarks and load testing to ensure the system meets performance requirements.

**Key Features Tested:**
- Baseline performance measurements
- Cache performance optimization
- Concurrent request handling
- Resource-intensive operations
- Error handling under load
- Memory management and leak detection
- Performance monitoring and metrics collection
- Realistic load patterns
- Sustained load testing

**Coverage:**
- Response time benchmarks (fast requests < 10ms)
- Cache hit performance (< 10ms)
- High cache hit rates (90%+)
- Concurrent request handling (50+ concurrent)
- Mixed workload efficiency
- Burst traffic handling
- CPU/memory intensive operations
- Error recovery and resilience
- Long-term stability testing
- Memory leak detection

## Running the Tests

### Prerequisites
```bash
# Ensure all dependencies are installed
npm install

# Set up test environment variables
export NODE_ENV=test
export CACHE_DIR=./test-cache
```

### Run All E2E Tests
```bash
npm run test:e2e
```

### Run Individual Test Files
```bash
# SSR Pipeline Tests
npx jest tests/e2e/server-rendering.test.js

# ISR Flow Tests  
npx jest tests/e2e/isr-flow.test.js

# Community Routing Tests
npx jest tests/e2e/community-routing.test.js

# Performance Tests
npx jest tests/e2e/performance.test.js
```

### Run with Coverage
```bash
npm run test:coverage -- tests/e2e/
```

### Run in Watch Mode
```bash
npx jest --watch tests/e2e/
```

## Test Environment Setup

The tests use a complete Express.js application that simulates the production server environment with:

- **ISR Engine**: Full cache management and revalidation
- **Community Routing**: Multi-community route resolution
- **SSR Pipeline**: Complete server-side rendering
- **Performance Monitoring**: Real-time metrics collection
- **Error Simulation**: Controlled error conditions for testing

## Performance Benchmarks

### Expected Performance Targets

| Metric | Target | Test Coverage |
|--------|---------|---------------|
| Fast Response Time | < 10ms | ✅ Baseline tests |
| Cache Hit Response | < 10ms | ✅ Cache performance |
| Cache Hit Rate | > 90% | ✅ Load testing |
| Concurrent Requests | 50+ simultaneous | ✅ Concurrency tests |
| Throughput | 50+ RPS | ✅ Load patterns |
| Memory Usage | < 200MB increase | ✅ Memory management |
| Error Recovery | < 1s | ✅ Error handling |

### Load Testing Scenarios

1. **Realistic Traffic Pattern**: 70% homepage, 20% articles, 10% other pages
2. **Burst Traffic**: 100 requests in quick succession
3. **Sustained Load**: Continuous requests over 5+ seconds
4. **Mixed Workload**: Combination of fast, cached, and CPU-intensive requests
5. **Memory Pressure**: Large response handling

## Browser-Like Interactions

The tests simulate real browser behavior including:

- **Full HTTP Request/Response Cycles**: Complete headers, status codes, content
- **Community Context Switching**: Testing community-specific routing
- **Cache Behavior**: Real-world cache miss/hit patterns
- **Error Conditions**: Network failures, server errors, corrupted data
- **Performance Under Load**: Concurrent users, burst traffic
- **Resource Management**: Memory usage, cleanup, garbage collection

## Debugging and Troubleshooting

### Debug Mode
```bash
# Run with detailed logging
DEBUG=* npm run test:e2e

# Run specific test with verbose output
npx jest --verbose tests/e2e/performance.test.js
```

### Performance Profiling
```bash
# Run with performance monitoring
NODE_OPTIONS="--max-old-space-size=4096" npm run test:e2e
```

### Common Issues

1. **Cache Directory Conflicts**: Tests create temporary cache directories that are cleaned up automatically
2. **Port Conflicts**: Tests use in-memory Express apps, no port binding required
3. **Memory Limits**: Performance tests may require higher memory limits
4. **Timeout Issues**: Long-running performance tests have extended timeouts

## Test Data and Fixtures

Tests use realistic data fixtures:
- **Mock Communities**: Downtown, North Beach, University District
- **Route Configurations**: Real route mappings with TTL values  
- **Performance Scenarios**: Based on actual usage patterns
- **Error Conditions**: Realistic failure modes

## Continuous Integration

These tests are designed for CI/CD environments:
- **Deterministic Results**: No random failures
- **Resource Management**: Proper cleanup and isolation
- **Performance Baselines**: Consistent benchmarks
- **Parallel Execution**: Tests can run concurrently
- **Comprehensive Coverage**: End-to-end validation

## Contributing

When adding new E2E tests:
1. Follow the existing pattern of realistic simulation
2. Include both positive and negative test cases  
3. Add performance benchmarks for new features
4. Ensure proper cleanup in `afterAll` hooks
5. Document expected behavior and performance targets
6. Test error conditions and edge cases

## Monitoring and Metrics

The tests collect detailed metrics:
- **Response Times**: P50, P95, P99 percentiles
- **Cache Performance**: Hit rates, miss penalties
- **Memory Usage**: Heap usage, garbage collection
- **Error Rates**: Success/failure ratios
- **Throughput**: Requests per second under load

These metrics help identify performance regressions and optimization opportunities.