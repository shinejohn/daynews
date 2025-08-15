# Performance Benchmark Suite

A comprehensive performance testing suite for the Day News application, measuring critical performance metrics across cache operations, SSR rendering, and data layer queries.

## Overview

This benchmark suite provides:
- **Cache Performance**: Tests cache read/write operations, hit ratios, memory usage, and TTL management
- **SSR Rendering**: Measures component rendering times, HTML generation speed, and concurrent rendering performance  
- **Data Layer**: Benchmarks database queries, pagination, filtering, and data transformation
- **Performance Regression Detection**: Compares against historical baselines to detect performance degradations
- **Comprehensive Reporting**: Generates detailed reports with actionable insights

## Quick Start

### Run All Benchmarks
```bash
npm run benchmark
# or
node tests/benchmarks/run-benchmarks.js
```

### Run Specific Benchmark Suites
```bash
# Cache only
node tests/benchmarks/run-benchmarks.js --suites cache

# Rendering and data layer
node tests/benchmarks/run-benchmarks.js --suites rendering,dataLayer

# Multiple iterations with verbose output
node tests/benchmarks/run-benchmarks.js --iterations 3 --verbose
```

## Individual Benchmark Files

### 1. Cache Performance (`cache-performance.bench.js`)

Tests cache operations including:
- **Write Performance**: Measures cache write times across different data sizes (1KB - 10MB)
- **Read Performance**: Tests cache read times and hit ratios with various access patterns
- **Concurrent Operations**: Evaluates performance under concurrent load (1-50 workers)
- **TTL Management**: Tests cache expiration and cleanup performance
- **Memory Usage**: Monitors memory consumption during cache operations
- **Hit Ratio Optimization**: Tests different access patterns (uniform, hot-spot, zipfian)

**Key Metrics:**
- Average write/read times
- Cache hit ratios
- Throughput (operations per second)
- Memory efficiency
- P95 response times

### 2. SSR Rendering Performance (`rendering-performance.bench.js`)

Benchmarks server-side rendering including:
- **Simple Components**: Basic component rendering performance
- **Complex Components**: Multi-section components with dynamic data
- **Deep Nesting**: Performance impact of deeply nested component trees
- **Homepage Rendering**: Realistic homepage with mixed content types
- **Concurrent Rendering**: Multiple simultaneous render operations

**Key Metrics:**
- Component render times
- HTML output size
- Memory usage during rendering
- Throughput (renders per second)
- Time per nesting level

### 3. Data Layer Performance (`data-layer.bench.js`)

Tests database and query performance including:
- **Simple Queries**: Basic SELECT operations with various limits
- **Filtered Queries**: WHERE clauses, text search, complex conditions
- **Sorted Queries**: ORDER BY performance across different columns
- **Paginated Queries**: LIMIT/OFFSET performance patterns
- **Concurrent Queries**: Multiple simultaneous database operations
- **Data Transformation**: JSON processing and data mapping performance

**Key Metrics:**
- Query execution times
- Records processed per second
- Memory usage during queries
- Concurrent query throughput
- Transformation overhead

## Benchmark Runner (`run-benchmarks.js`)

The main orchestrator that:
- Runs all benchmark suites
- Generates comprehensive reports
- Tracks historical performance data
- Detects performance regressions
- Provides CI/CD integration

### Command Line Options

```bash
node run-benchmarks.js [options]

Options:
  --suites <list>      Comma-separated list of suites to run (cache,rendering,dataLayer)
  --iterations <n>     Number of iterations to run (default: 1)
  --no-warmup          Skip system warmup
  --no-save            Don't save results to file
  --no-history         Don't compare with historical data
  --no-report          Don't generate markdown report
  --alert              Alert on performance regressions (exit code 1)
  --verbose            Show detailed reports
  --help               Show help message
```

## Performance Thresholds

The benchmarks include configurable performance thresholds:

### Cache Thresholds
- Average write time: < 50ms
- Average read time: < 10ms
- Hit ratio: > 90%
- Throughput: > 1000 ops/sec

### Rendering Thresholds  
- Simple component: < 5ms
- Complex component: < 100ms
- Homepage render: < 500ms
- Throughput: > 50 renders/sec

### Data Layer Thresholds
- Simple query: < 100ms
- Filtered query: < 200ms
- Pagination: < 150ms per page
- Throughput: > 100 queries/sec

## Output Files

Benchmarks generate several output files in `benchmark-results/`:

- `benchmark-results-[timestamp].json`: Raw benchmark data
- `benchmark-report-[timestamp].md`: Human-readable performance report
- `history.json`: Historical performance data for regression detection

## Integration Examples

### Package.json Scripts

Add to your `package.json`:
```json
{
  "scripts": {
    "benchmark": "node tests/benchmarks/run-benchmarks.js",
    "benchmark:cache": "node tests/benchmarks/run-benchmarks.js --suites cache",
    "benchmark:rendering": "node tests/benchmarks/run-benchmarks.js --suites rendering", 
    "benchmark:data": "node tests/benchmarks/run-benchmarks.js --suites dataLayer",
    "benchmark:ci": "node tests/benchmarks/run-benchmarks.js --alert --no-verbose"
  }
}
```

### CI/CD Integration

#### GitHub Actions
```yaml
name: Performance Benchmarks
on: [push, pull_request]

jobs:
  benchmark:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run benchmark:ci
      - uses: actions/upload-artifact@v3
        with:
          name: benchmark-results
          path: benchmark-results/
```

#### Docker
```dockerfile
# Add to your Dockerfile
COPY tests/benchmarks ./tests/benchmarks
RUN npm run benchmark:ci
```

## Interpreting Results

### Performance Report Sections

1. **System Information**: Hardware and environment details
2. **Execution Summary**: Duration and success rate
3. **Performance Metrics Overview**: Key performance indicators
4. **Performance Issues**: Regressions and threshold violations
5. **Performance Improvements**: Positive changes from previous runs

### Key Performance Indicators

- **Latency**: Time to complete individual operations
- **Throughput**: Operations completed per second
- **Memory Usage**: RAM consumption during operations
- **Hit Ratios**: Cache effectiveness (higher is better)
- **P95 Times**: 95th percentile response times (worst case scenarios)

### Regression Detection

The suite automatically detects:
- **Performance Regressions**: >20% slower than previous run
- **Threshold Violations**: Exceeding configured performance limits
- **Memory Leaks**: Increasing memory usage patterns
- **Throughput Degradation**: Reduced operations per second

## Troubleshooting

### Common Issues

1. **High Memory Usage**
   - Check for memory leaks in components
   - Review large dataset processing
   - Monitor garbage collection patterns

2. **Slow Cache Performance**
   - Verify cache configuration
   - Check disk I/O performance
   - Review cache key complexity

3. **Poor Rendering Performance**
   - Simplify component structure
   - Reduce data processing in render
   - Optimize React component props

4. **Slow Database Queries**
   - Add appropriate indexes
   - Optimize query structure
   - Review connection pooling

### Performance Optimization Tips

1. **Cache Optimization**
   - Use appropriate TTL values
   - Implement cache warming strategies
   - Monitor hit ratios regularly

2. **Rendering Optimization**
   - Minimize component re-renders
   - Use React.memo for expensive components
   - Optimize data structures passed to components

3. **Data Layer Optimization**
   - Use connection pooling
   - Implement query result caching
   - Optimize database schema

## Development

### Adding New Benchmarks

1. Create new benchmark file in `tests/benchmarks/`
2. Export a class with `runAllBenchmarks()` and `generateReport()` methods
3. Add to the benchmark runner imports and execution flow
4. Update this README with documentation

### Customizing Thresholds

Edit the `CONFIG.thresholds` object in `run-benchmarks.js`:

```javascript
const CONFIG = {
  thresholds: {
    cache: {
      avgWriteTime: 50,    // ms
      avgReadTime: 10,     // ms
      hitRatio: 0.9,       // 90%
      throughput: 1000     // ops/sec
    }
    // ... other thresholds
  }
};
```

## Contributing

When contributing performance improvements:

1. Run benchmarks before and after changes
2. Document performance impact in PR description
3. Include benchmark results in code review
4. Ensure no performance regressions are introduced

## License

This benchmark suite is part of the Day News project and follows the same license terms.