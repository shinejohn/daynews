/**
 * Data Layer Performance Benchmarks
 * 
 * Tests database query performance including:
 * - Query execution time analysis
 * - Connection pool management
 * - Complex query optimization
 * - Bulk operation performance
 * - Data transformation overhead
 */

import { performance, PerformanceObserver } from 'perf_hooks';
import fs from 'fs/promises';
import path from 'path';

// Performance tracking
let dataLayerMetrics = {
  query_operations: [],
  connection_metrics: [],
  memory_usage: [],
  transformation_times: []
};

const observer = new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
    if (entry.name.startsWith('query_') || entry.name.startsWith('data_')) {
      dataLayerMetrics.query_operations.push({
        operation: entry.name,
        duration: entry.duration,
        timestamp: Date.now()
      });
    }
  }
});

// Mock Supabase client for testing
class MockSupabaseClient {
  constructor(options = {}) {
    this.latency = options.latency || 50; // Base latency in ms
    this.errorRate = options.errorRate || 0.01; // 1% error rate
    this.connectionPool = options.connectionPool || 10;
    this.activeConnections = 0;
  }

  // Simulate network latency and processing time
  async simulateLatency(complexity = 1) {
    const baseLatency = this.latency * complexity;
    const jitter = Math.random() * 20; // 0-20ms jitter
    const totalLatency = baseLatency + jitter;
    
    await new Promise(resolve => setTimeout(resolve, totalLatency));
    
    // Simulate occasional errors
    if (Math.random() < this.errorRate) {
      throw new Error('Simulated database error');
    }
    
    return totalLatency;
  }

  // Mock table access
  from(tableName) {
    return new MockQueryBuilder(this, tableName);
  }
}

class MockQueryBuilder {
  constructor(client, tableName) {
    this.client = client;
    this.tableName = tableName;
    this.queryConfig = {
      select: '*',
      filters: [],
      ordering: null,
      limit: null,
      offset: null
    };
  }

  select(columns) {
    this.queryConfig.select = columns;
    return this;
  }

  eq(column, value) {
    this.queryConfig.filters.push({ type: 'eq', column, value });
    return this;
  }

  gt(column, value) {
    this.queryConfig.filters.push({ type: 'gt', column, value });
    return this;
  }

  gte(column, value) {
    this.queryConfig.filters.push({ type: 'gte', column, value });
    return this;
  }

  lt(column, value) {
    this.queryConfig.filters.push({ type: 'lt', column, value });
    return this;
  }

  lte(column, value) {
    this.queryConfig.filters.push({ type: 'lte', column, value });
    return this;
  }

  ilike(column, pattern) {
    this.queryConfig.filters.push({ type: 'ilike', column, pattern });
    return this;
  }

  or(conditions) {
    this.queryConfig.filters.push({ type: 'or', conditions });
    return this;
  }

  order(column, options = {}) {
    this.queryConfig.ordering = { column, ascending: options.ascending !== false };
    return this;
  }

  range(from, to) {
    this.queryConfig.offset = from;
    this.queryConfig.limit = to - from + 1;
    return this;
  }

  limit(count) {
    this.queryConfig.limit = count;
    return this;
  }

  async execute() {
    // Calculate query complexity based on operations
    let complexity = 1;
    complexity += this.queryConfig.filters.length * 0.2;
    if (this.queryConfig.ordering) complexity += 0.3;
    if (this.queryConfig.limit) complexity += 0.1;
    
    const latency = await this.client.simulateLatency(complexity);
    
    // Generate mock data based on table
    const data = this.generateMockData();
    
    return {
      data,
      error: null,
      status: 200,
      statusText: 'OK'
    };
  }

  generateMockData() {
    const baseCount = this.queryConfig.limit || Math.floor(Math.random() * 100) + 10;
    
    switch (this.tableName) {
      case 'news':
        return Array.from({ length: baseCount }, (_, i) => ({
          id: `news_${i}`,
          title: `Breaking News Article ${i + 1}`,
          content: `Detailed content for news article ${i + 1}. `.repeat(50),
          excerpt: `Brief summary of article ${i + 1}`,
          author_id: `author_${i % 10}`,
          category: ['Politics', 'Sports', 'Business', 'Technology', 'Health'][i % 5],
          created_at: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
          updated_at: new Date().toISOString(),
          view_count: Math.floor(Math.random() * 10000),
          featured_image: `https://example.com/image${i}.jpg`,
          tags: [`tag${i % 5}`, `category${i % 3}`],
          community_id: `community_${i % 5}`
        }));
        
      case 'events':
        return Array.from({ length: baseCount }, (_, i) => ({
          id: `event_${i}`,
          title: `Community Event ${i + 1}`,
          description: `Detailed description for event ${i + 1}`,
          start_date: new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
          end_date: new Date(Date.now() + Math.random() * 31 * 24 * 60 * 60 * 1000).toISOString(),
          venue_name: `Venue ${i % 5}`,
          location: `Location ${i % 10}`,
          organizer_id: `organizer_${i % 3}`,
          category: ['Music', 'Sports', 'Education', 'Community', 'Business'][i % 5],
          created_at: new Date().toISOString(),
          community_id: `community_${i % 5}`
        }));
        
      case 'businesses':
        return Array.from({ length: baseCount }, (_, i) => ({
          id: `business_${i}`,
          name: `Local Business ${i + 1}`,
          description: `Description for business ${i + 1}`,
          category: ['Restaurant', 'Retail', 'Service', 'Healthcare', 'Entertainment'][i % 5],
          address: `${100 + i} Main Street`,
          city: `City ${i % 3}`,
          phone: `555-${String(1000 + i).padStart(4, '0')}`,
          email: `business${i}@example.com`,
          website: `https://business${i}.example.com`,
          rating: 3 + Math.random() * 2,
          review_count: Math.floor(Math.random() * 500),
          created_at: new Date().toISOString(),
          community_id: `community_${i % 5}`
        }));
        
      default:
        return Array.from({ length: baseCount }, (_, i) => ({
          id: `item_${i}`,
          name: `Item ${i + 1}`,
          created_at: new Date().toISOString()
        }));
    }
  }
}

export class DataLayerPerformanceBenchmark {
  constructor(options = {}) {
    this.options = options;
    this.supabase = new MockSupabaseClient({
      latency: options.latency || 50,
      errorRate: options.errorRate || 0.001
    });
    this.querySizes = [10, 50, 100, 500, 1000];
    this.concurrencyLevels = [1, 5, 10, 25];
    this.results = {};
  }

  async setup() {
    // Start performance monitoring
    observer.observe({ entryTypes: ['measure'] });
    
    // Reset metrics
    dataLayerMetrics = {
      query_operations: [],
      connection_metrics: [],
      memory_usage: [],
      transformation_times: []
    };
  }

  async cleanup() {
    observer.disconnect();
  }

  // Measure memory usage
  measureMemoryUsage() {
    const usage = process.memoryUsage();
    dataLayerMetrics.memory_usage.push({
      heapUsed: usage.heapUsed,
      heapTotal: usage.heapTotal,
      external: usage.external,
      rss: usage.rss,
      timestamp: Date.now()
    });
    return usage;
  }

  // Benchmark simple SELECT queries
  async benchmarkSimpleQueries() {
    console.log('🔄 Testing simple SELECT queries...');
    const results = {};
    const tables = ['news', 'events', 'businesses'];
    
    for (const table of tables) {
      const tableResults = {};
      
      for (const limit of this.querySizes) {
        const iterations = Math.max(10, Math.floor(500 / limit));
        const times = [];
        const memoryUsages = [];
        
        for (let i = 0; i < iterations; i++) {
          const initialMemory = this.measureMemoryUsage();
          
          performance.mark(`query_simple_${table}_start`);
          
          const result = await this.supabase
            .from(table)
            .select('*')
            .limit(limit)
            .execute();
          
          performance.mark(`query_simple_${table}_end`);
          performance.measure(
            `query_simple_${table}`,
            `query_simple_${table}_start`,
            `query_simple_${table}_end`
          );
          
          const measures = performance.getEntriesByName(`query_simple_${table}`);
          times.push(measures[measures.length - 1].duration);
          
          const finalMemory = this.measureMemoryUsage();
          memoryUsages.push(finalMemory.heapUsed - initialMemory.heapUsed);
          
          performance.clearMarks();
          performance.clearMeasures();
        }
        
        tableResults[`limit_${limit}`] = {
          limit,
          iterations,
          avgTime: times.reduce((a, b) => a + b, 0) / times.length,
          minTime: Math.min(...times),
          maxTime: Math.max(...times),
          p95Time: this.calculatePercentile(times, 0.95),
          avgMemoryDelta: memoryUsages.reduce((a, b) => a + b, 0) / memoryUsages.length,
          throughput: iterations / (times.reduce((a, b) => a + b, 0) / 1000),
          recordsPerSecond: (limit * iterations) / (times.reduce((a, b) => a + b, 0) / 1000)
        };
      }
      
      results[table] = tableResults;
    }
    
    this.results.simpleQueries = results;
    return results;
  }

  // Benchmark filtered queries
  async benchmarkFilteredQueries() {
    console.log('🔄 Testing filtered queries...');
    const results = {};
    const tables = ['news', 'events', 'businesses'];
    
    const filterConfigs = [
      { name: 'single_eq', filters: (qb) => qb.eq('category', 'Sports') },
      { name: 'multiple_eq', filters: (qb) => qb.eq('category', 'Sports').eq('community_id', 'community_1') },
      { name: 'range_filter', filters: (qb) => qb.gte('created_at', '2024-01-01').lte('created_at', '2024-12-31') },
      { name: 'text_search', filters: (qb) => qb.ilike('title', '%news%') },
      { name: 'complex_or', filters: (qb) => qb.or('category.eq.Sports,category.eq.Business') }
    ];
    
    for (const table of tables) {
      const tableResults = {};
      
      for (const filterConfig of filterConfigs) {
        const iterations = 20;
        const times = [];
        const resultCounts = [];
        
        for (let i = 0; i < iterations; i++) {
          performance.mark(`query_filtered_${table}_${filterConfig.name}_start`);
          
          let query = this.supabase.from(table).select('*');
          query = filterConfig.filters(query);
          const result = await query.limit(100).execute();
          
          performance.mark(`query_filtered_${table}_${filterConfig.name}_end`);
          performance.measure(
            `query_filtered_${table}_${filterConfig.name}`,
            `query_filtered_${table}_${filterConfig.name}_start`,
            `query_filtered_${table}_${filterConfig.name}_end`
          );
          
          const measures = performance.getEntriesByName(`query_filtered_${table}_${filterConfig.name}`);
          times.push(measures[measures.length - 1].duration);
          resultCounts.push(result.data?.length || 0);
          
          performance.clearMarks();
          performance.clearMeasures();
        }
        
        tableResults[filterConfig.name] = {
          filterType: filterConfig.name,
          iterations,
          avgTime: times.reduce((a, b) => a + b, 0) / times.length,
          minTime: Math.min(...times),
          maxTime: Math.max(...times),
          avgResultCount: resultCounts.reduce((a, b) => a + b, 0) / resultCounts.length,
          throughput: iterations / (times.reduce((a, b) => a + b, 0) / 1000)
        };
      }
      
      results[table] = tableResults;
    }
    
    this.results.filteredQueries = results;
    return results;
  }

  // Benchmark sorted queries
  async benchmarkSortedQueries() {
    console.log('🔄 Testing sorted queries...');
    const results = {};
    const tables = ['news', 'events', 'businesses'];
    
    const sortConfigs = [
      { name: 'created_at_desc', sort: (qb) => qb.order('created_at', { ascending: false }) },
      { name: 'created_at_asc', sort: (qb) => qb.order('created_at', { ascending: true }) },
      { name: 'title_asc', sort: (qb) => qb.order('title', { ascending: true }) }
    ];
    
    for (const table of tables) {
      const tableResults = {};
      
      for (const sortConfig of sortConfigs) {
        for (const limit of [50, 100, 500]) {
          const iterations = Math.max(5, Math.floor(100 / Math.log10(limit)));
          const times = [];
          
          for (let i = 0; i < iterations; i++) {
            performance.mark(`query_sorted_${table}_${sortConfig.name}_start`);
            
            let query = this.supabase.from(table).select('*');
            query = sortConfig.sort(query);
            await query.limit(limit).execute();
            
            performance.mark(`query_sorted_${table}_${sortConfig.name}_end`);
            performance.measure(
              `query_sorted_${table}_${sortConfig.name}`,
              `query_sorted_${table}_${sortConfig.name}_start`,
              `query_sorted_${table}_${sortConfig.name}_end`
            );
            
            const measures = performance.getEntriesByName(`query_sorted_${table}_${sortConfig.name}`);
            times.push(measures[measures.length - 1].duration);
            
            performance.clearMarks();
            performance.clearMeasures();
          }
          
          const configKey = `${sortConfig.name}_limit_${limit}`;
          tableResults[configKey] = {
            sortType: sortConfig.name,
            limit,
            iterations,
            avgTime: times.reduce((a, b) => a + b, 0) / times.length,
            minTime: Math.min(...times),
            maxTime: Math.max(...times),
            throughput: iterations / (times.reduce((a, b) => a + b, 0) / 1000)
          };
        }
      }
      
      results[table] = tableResults;
    }
    
    this.results.sortedQueries = results;
    return results;
  }

  // Benchmark paginated queries
  async benchmarkPaginatedQueries() {
    console.log('🔄 Testing paginated queries...');
    const results = {};
    const pageSize = 20;
    const totalPages = 10;
    
    const tables = ['news', 'events', 'businesses'];
    
    for (const table of tables) {
      const times = [];
      const pageTimes = [];
      
      performance.mark(`query_pagination_${table}_start`);
      
      for (let page = 0; page < totalPages; page++) {
        const pageStart = performance.now();
        
        await this.supabase
          .from(table)
          .select('*')
          .range(page * pageSize, (page + 1) * pageSize - 1)
          .order('created_at', { ascending: false })
          .execute();
        
        const pageTime = performance.now() - pageStart;
        pageTimes.push(pageTime);
      }
      
      performance.mark(`query_pagination_${table}_end`);
      performance.measure(
        `query_pagination_${table}`,
        `query_pagination_${table}_start`,
        `query_pagination_${table}_end`
      );
      
      const measures = performance.getEntriesByName(`query_pagination_${table}`);
      const totalTime = measures[measures.length - 1].duration;
      
      results[table] = {
        pageSize,
        totalPages,
        totalTime,
        avgPageTime: pageTimes.reduce((a, b) => a + b, 0) / pageTimes.length,
        minPageTime: Math.min(...pageTimes),
        maxPageTime: Math.max(...pageTimes),
        pagesPerSecond: totalPages / (totalTime / 1000),
        recordsPerSecond: (totalPages * pageSize) / (totalTime / 1000)
      };
      
      performance.clearMarks();
      performance.clearMeasures();
    }
    
    this.results.paginatedQueries = results;
    return results;
  }

  // Benchmark concurrent queries
  async benchmarkConcurrentQueries() {
    console.log('🔄 Testing concurrent queries...');
    const results = {};
    
    for (const concurrency of this.concurrencyLevels) {
      const queriesPerWorker = 10;
      const times = [];
      
      performance.mark(`query_concurrent_${concurrency}_start`);
      
      const promises = Array.from({ length: concurrency }, async (_, workerIndex) => {
        const workerTimes = [];
        
        for (let i = 0; i < queriesPerWorker; i++) {
          const table = ['news', 'events', 'businesses'][i % 3];
          
          const start = performance.now();
          await this.supabase
            .from(table)
            .select('*')
            .limit(50)
            .execute();
          
          workerTimes.push(performance.now() - start);
        }
        
        return workerTimes;
      });
      
      const allWorkerTimes = await Promise.all(promises);
      
      performance.mark(`query_concurrent_${concurrency}_end`);
      performance.measure(
        `query_concurrent_${concurrency}`,
        `query_concurrent_${concurrency}_start`,
        `query_concurrent_${concurrency}_end`
      );
      
      const totalTime = performance.getEntriesByName(`query_concurrent_${concurrency}`)[0].duration;
      const allTimes = allWorkerTimes.flat();
      
      results[`${concurrency}_workers`] = {
        concurrency,
        totalQueries: concurrency * queriesPerWorker,
        totalTime,
        avgQueryTime: allTimes.reduce((a, b) => a + b, 0) / allTimes.length,
        maxQueryTime: Math.max(...allTimes),
        minQueryTime: Math.min(...allTimes),
        throughput: (concurrency * queriesPerWorker) / (totalTime / 1000),
        queriesPerSecond: (concurrency * queriesPerWorker) / (totalTime / 1000)
      };
      
      performance.clearMarks();
      performance.clearMeasures();
    }
    
    this.results.concurrentQueries = results;
    return results;
  }

  // Benchmark data transformation
  async benchmarkDataTransformation() {
    console.log('🔄 Testing data transformation performance...');
    const results = {};
    
    // Get sample data
    const newsData = await this.supabase.from('news').select('*').limit(1000).execute();
    const events = await this.supabase.from('events').select('*').limit(500).execute();
    const businesses = await this.supabase.from('businesses').select('*').limit(500).execute();
    
    const transformations = {
      'simple_mapping': (data) => data.map(item => ({
        id: item.id,
        title: item.title || item.name,
        date: item.created_at
      })),
      
      'complex_aggregation': (data) => {
        const grouped = data.reduce((acc, item) => {
          const key = item.category || 'uncategorized';
          if (!acc[key]) acc[key] = [];
          acc[key].push(item);
          return acc;
        }, {});
        
        return Object.entries(grouped).map(([category, items]) => ({
          category,
          count: items.length,
          items: items.slice(0, 5)
        }));
      },
      
      'search_indexing': (data) => data.map(item => ({
        id: item.id,
        searchableText: [
          item.title,
          item.content || item.description,
          item.category,
          ...(item.tags || [])
        ].filter(Boolean).join(' ').toLowerCase(),
        metadata: {
          type: item.title ? 'news' : 'other',
          date: item.created_at,
          category: item.category
        }
      })),
      
      'api_response_formatting': (data) => ({
        data: data.map(item => ({
          id: item.id,
          attributes: {
            title: item.title || item.name,
            content: item.content || item.description,
            dates: {
              created: item.created_at,
              updated: item.updated_at
            }
          },
          relationships: {
            community: item.community_id,
            author: item.author_id
          }
        })),
        meta: {
          total: data.length,
          generated: new Date().toISOString()
        }
      })
    };
    
    const datasets = {
      news: newsData.data,
      events: events.data,
      businesses: businesses.data
    };
    
    for (const [datasetName, data] of Object.entries(datasets)) {
      const datasetResults = {};
      
      for (const [transformName, transformFunc] of Object.entries(transformations)) {
        const iterations = 10;
        const times = [];
        const memoryUsages = [];
        
        for (let i = 0; i < iterations; i++) {
          const initialMemory = this.measureMemoryUsage();
          
          performance.mark(`data_transform_${datasetName}_${transformName}_start`);
          
          const result = transformFunc(data);
          
          performance.mark(`data_transform_${datasetName}_${transformName}_end`);
          performance.measure(
            `data_transform_${datasetName}_${transformName}`,
            `data_transform_${datasetName}_${transformName}_start`,
            `data_transform_${datasetName}_${transformName}_end`
          );
          
          const measures = performance.getEntriesByName(`data_transform_${datasetName}_${transformName}`);
          times.push(measures[measures.length - 1].duration);
          
          const finalMemory = this.measureMemoryUsage();
          memoryUsages.push(finalMemory.heapUsed - initialMemory.heapUsed);
          
          performance.clearMarks();
          performance.clearMeasures();
        }
        
        datasetResults[transformName] = {
          inputSize: data.length,
          iterations,
          avgTime: times.reduce((a, b) => a + b, 0) / times.length,
          minTime: Math.min(...times),
          maxTime: Math.max(...times),
          avgMemoryDelta: memoryUsages.reduce((a, b) => a + b, 0) / memoryUsages.length,
          recordsPerSecond: (data.length * iterations) / (times.reduce((a, b) => a + b, 0) / 1000),
          throughput: iterations / (times.reduce((a, b) => a + b, 0) / 1000)
        };
      }
      
      results[datasetName] = datasetResults;
    }
    
    this.results.dataTransformation = results;
    return results;
  }

  // Run all data layer benchmarks
  async runAllBenchmarks() {
    console.log('🚀 Starting Data Layer Performance Benchmarks...\n');
    
    await this.setup();
    
    try {
      const results = {
        timestamp: new Date().toISOString(),
        system: {
          nodeVersion: process.version,
          platform: process.platform,
          arch: process.arch,
          memory: process.memoryUsage()
        }
      };
      
      // Run all benchmark tests
      results.simpleQueries = await this.benchmarkSimpleQueries();
      results.filteredQueries = await this.benchmarkFilteredQueries();
      results.sortedQueries = await this.benchmarkSortedQueries();
      results.paginatedQueries = await this.benchmarkPaginatedQueries();
      results.concurrentQueries = await this.benchmarkConcurrentQueries();
      results.dataTransformation = await this.benchmarkDataTransformation();
      
      // Add performance metrics
      results.performanceMetrics = dataLayerMetrics;
      
      this.results = results;
      return results;
      
    } finally {
      await this.cleanup();
    }
  }

  // Helper method to calculate percentiles
  calculatePercentile(arr, percentile) {
    const sorted = [...arr].sort((a, b) => a - b);
    const index = Math.ceil(sorted.length * percentile) - 1;
    return sorted[Math.max(0, index)];
  }

  // Generate performance report
  generateReport() {
    const results = this.results;
    if (!results || Object.keys(results).length === 0) {
      return 'No benchmark results available. Run benchmarks first.';
    }
    
    let report = `
# Data Layer Performance Benchmark Report
Generated: ${results.timestamp}

## System Information
- Node.js Version: ${results.system.nodeVersion}
- Platform: ${results.system.platform} ${results.system.arch}
- Initial Memory: ${Math.round(results.system.memory.heapUsed / 1024 / 1024)}MB

## Performance Summary

### Simple Query Performance
`;
    
    if (results.simpleQueries) {
      Object.entries(results.simpleQueries).forEach(([table, metrics]) => {
        report += `\n**${table} Table:**\n`;
        Object.entries(metrics).forEach(([limit, data]) => {
          report += `- ${limit}: ${data.avgTime.toFixed(2)}ms avg, ${data.recordsPerSecond.toFixed(0)} records/sec\n`;
        });
      });
    }
    
    report += `
### Filtered Query Performance
`;
    
    if (results.filteredQueries) {
      Object.entries(results.filteredQueries).forEach(([table, metrics]) => {
        report += `\n**${table} Table:**\n`;
        Object.entries(metrics).forEach(([filter, data]) => {
          report += `- ${filter}: ${data.avgTime.toFixed(2)}ms avg, ${data.throughput.toFixed(0)} ops/sec\n`;
        });
      });
    }
    
    report += `
### Pagination Performance
`;
    
    if (results.paginatedQueries) {
      Object.entries(results.paginatedQueries).forEach(([table, data]) => {
        report += `- ${table}: ${data.avgPageTime.toFixed(2)}ms per page, ${data.pagesPerSecond.toFixed(1)} pages/sec\n`;
      });
    }
    
    report += `
### Concurrent Query Performance
`;
    
    if (results.concurrentQueries) {
      Object.entries(results.concurrentQueries).forEach(([workers, metrics]) => {
        report += `- ${workers}: ${metrics.queriesPerSecond.toFixed(0)} queries/sec, ${metrics.avgQueryTime.toFixed(2)}ms avg\n`;
      });
    }
    
    report += `
### Data Transformation Performance
`;
    
    if (results.dataTransformation) {
      Object.entries(results.dataTransformation).forEach(([dataset, metrics]) => {
        report += `\n**${dataset} Dataset:**\n`;
        Object.entries(metrics).forEach(([transform, data]) => {
          report += `- ${transform}: ${data.recordsPerSecond.toFixed(0)} records/sec processed\n`;
        });
      });
    }
    
    return report;
  }
}

// Export for direct usage
export const runDataLayerBenchmarks = async (options = {}) => {
  const benchmark = new DataLayerPerformanceBenchmark(options);
  return await benchmark.runAllBenchmarks();
};

// CLI execution
if (import.meta.url === `file://${process.argv[1]}`) {
  const benchmark = new DataLayerPerformanceBenchmark();
  
  benchmark.runAllBenchmarks()
    .then(results => {
      console.log('\n' + '='.repeat(60));
      console.log(benchmark.generateReport());
      console.log('='.repeat(60));
      
      // Save results to file
      const filename = `data-layer-benchmark-${Date.now()}.json`;
      fs.writeFile(filename, JSON.stringify(results, null, 2))
        .then(() => console.log(`\n📊 Detailed results saved to: ${filename}`))
        .catch(err => console.error('Failed to save results:', err));
    })
    .catch(error => {
      console.error('Benchmark failed:', error);
      process.exit(1);
    });
}