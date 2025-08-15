/**
 * Cache Performance Benchmarks
 * 
 * Tests cache operations including:
 * - Cache read/write performance
 * - Hit ratio optimization
 * - Memory usage monitoring
 * - Cache invalidation performance
 * - TTL management efficiency
 */

import { performance, PerformanceObserver } from 'perf_hooks';
import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import { CacheManager } from '../../server/isr/cache-manager.js';

// Performance monitoring setup
let performanceMetrics = {
  cache_operations: [],
  memory_usage: [],
  cache_hits: 0,
  cache_misses: 0,
  total_operations: 0
};

const observer = new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
    if (entry.name.startsWith('cache_')) {
      performanceMetrics.cache_operations.push({
        operation: entry.name,
        duration: entry.duration,
        timestamp: Date.now()
      });
    }
  }
});

export class CachePerformanceBenchmark {
  constructor(options = {}) {
    this.cacheDir = options.cacheDir || path.join(process.cwd(), 'test-cache-bench');
    this.cacheManager = new CacheManager(this.cacheDir);
    this.testDataSizes = [1, 10, 100, 1000, 10000]; // KB sizes
    this.concurrencyLevels = [1, 5, 10, 25, 50];
    this.ttlTestValues = [1, 5, 30, 300, 3600]; // seconds
    this.results = {};
  }

  async setup() {
    // Clean up any existing cache
    try {
      await fs.rm(this.cacheDir, { recursive: true, force: true });
      await fs.mkdir(this.cacheDir, { recursive: true });
    } catch (error) {
      // Directory might not exist, that's okay
    }
    
    // Start performance monitoring
    observer.observe({ entryTypes: ['measure'] });
    
    // Reset metrics
    performanceMetrics = {
      cache_operations: [],
      memory_usage: [],
      cache_hits: 0,
      cache_misses: 0,
      total_operations: 0
    };
  }

  async cleanup() {
    observer.disconnect();
    try {
      await fs.rm(this.cacheDir, { recursive: true, force: true });
    } catch (error) {
      console.warn('Failed to cleanup cache directory:', error.message);
    }
  }

  // Generate test data of specific size
  generateTestData(sizeKB) {
    const sizeBytes = sizeKB * 1024;
    const content = 'x'.repeat(Math.max(1, sizeBytes - 200)); // Account for metadata
    return {
      html: `<html><body>${content}</body></html>`,
      context: {
        title: `Test Data ${sizeKB}KB`,
        description: `Test cache data of ${sizeKB}KB size`,
        data: { size: sizeKB, timestamp: Date.now() }
      },
      metadata: {
        size: sizeKB,
        generated: new Date().toISOString()
      }
    };
  }

  // Measure memory usage
  measureMemoryUsage() {
    const usage = process.memoryUsage();
    performanceMetrics.memory_usage.push({
      heapUsed: usage.heapUsed,
      heapTotal: usage.heapTotal,
      external: usage.external,
      rss: usage.rss,
      timestamp: Date.now()
    });
    return usage;
  }

  // Basic cache write performance test
  async benchmarkCacheWrites() {
    console.log('🔄 Testing cache write performance...');
    const results = {};
    
    for (const size of this.testDataSizes) {
      const testData = this.generateTestData(size);
      const iterations = Math.max(10, Math.floor(1000 / size)); // Fewer iterations for larger data
      const times = [];
      
      for (let i = 0; i < iterations; i++) {
        const key = `write-test-${size}kb-${i}`;
        
        performance.mark('cache_write_start');
        await this.cacheManager.set(key, testData, 300);
        performance.mark('cache_write_end');
        
        performance.measure('cache_write_operation', 'cache_write_start', 'cache_write_end');
        
        const measures = performance.getEntriesByName('cache_write_operation');
        times.push(measures[measures.length - 1].duration);
        
        performance.clearMarks();
        performance.clearMeasures();
      }
      
      results[`${size}KB`] = {
        iterations,
        avgTime: times.reduce((a, b) => a + b, 0) / times.length,
        minTime: Math.min(...times),
        maxTime: Math.max(...times),
        p95Time: this.calculatePercentile(times, 0.95),
        p99Time: this.calculatePercentile(times, 0.99),
        throughput: iterations / (times.reduce((a, b) => a + b, 0) / 1000) // ops/sec
      };
    }
    
    this.results.cacheWrites = results;
    return results;
  }

  // Basic cache read performance test
  async benchmarkCacheReads() {
    console.log('🔄 Testing cache read performance...');
    const results = {};
    
    // First, populate cache with test data
    for (const size of this.testDataSizes) {
      const testData = this.generateTestData(size);
      for (let i = 0; i < 10; i++) {
        await this.cacheManager.set(`read-test-${size}kb-${i}`, testData, 300);
      }
    }
    
    // Now benchmark reads
    for (const size of this.testDataSizes) {
      const iterations = Math.max(50, Math.floor(5000 / size));
      const times = [];
      let hits = 0;
      
      for (let i = 0; i < iterations; i++) {
        const key = `read-test-${size}kb-${i % 10}`;
        
        performance.mark('cache_read_start');
        const result = await this.cacheManager.get(key);
        performance.mark('cache_read_end');
        
        performance.measure('cache_read_operation', 'cache_read_start', 'cache_read_end');
        
        const measures = performance.getEntriesByName('cache_read_operation');
        times.push(measures[measures.length - 1].duration);
        
        if (result) hits++;
        
        performance.clearMarks();
        performance.clearMeasures();
      }
      
      results[`${size}KB`] = {
        iterations,
        hits,
        hitRate: hits / iterations,
        avgTime: times.reduce((a, b) => a + b, 0) / times.length,
        minTime: Math.min(...times),
        maxTime: Math.max(...times),
        p95Time: this.calculatePercentile(times, 0.95),
        throughput: iterations / (times.reduce((a, b) => a + b, 0) / 1000) // ops/sec
      };
    }
    
    this.results.cacheReads = results;
    return results;
  }

  // Concurrent cache operations test
  async benchmarkConcurrentOperations() {
    console.log('🔄 Testing concurrent cache operations...');
    const results = {};
    
    for (const concurrency of this.concurrencyLevels) {
      const testData = this.generateTestData(10); // 10KB test data
      const operationsPerWorker = 20;
      const times = [];
      
      performance.mark('concurrent_ops_start');
      
      const promises = Array.from({ length: concurrency }, async (_, workerIndex) => {
        const workerTimes = [];
        
        for (let i = 0; i < operationsPerWorker; i++) {
          const key = `concurrent-${concurrency}-${workerIndex}-${i}`;
          
          // Mix of read and write operations
          const start = performance.now();
          if (i % 3 === 0) {
            // Write operation
            await this.cacheManager.set(key, testData, 300);
          } else {
            // Read operation (might miss on first attempts)
            await this.cacheManager.get(key);
          }
          const end = performance.now();
          
          workerTimes.push(end - start);
        }
        
        return workerTimes;
      });
      
      const allWorkerTimes = await Promise.all(promises);
      performance.mark('concurrent_ops_end');
      performance.measure('concurrent_ops_total', 'concurrent_ops_start', 'concurrent_ops_end');
      
      const totalTime = performance.getEntriesByName('concurrent_ops_total')[0].duration;
      const allTimes = allWorkerTimes.flat();
      
      results[`${concurrency}_workers`] = {
        concurrency,
        totalOperations: concurrency * operationsPerWorker,
        totalTime,
        avgOperationTime: allTimes.reduce((a, b) => a + b, 0) / allTimes.length,
        maxOperationTime: Math.max(...allTimes),
        throughput: (concurrency * operationsPerWorker) / (totalTime / 1000),
        operationsPerSecond: (concurrency * operationsPerWorker) / (totalTime / 1000)
      };
      
      performance.clearMarks();
      performance.clearMeasures();
    }
    
    this.results.concurrentOperations = results;
    return results;
  }

  // TTL and expiration performance test
  async benchmarkTTLManagement() {
    console.log('🔄 Testing TTL and cache expiration performance...');
    const results = {};
    
    for (const ttl of this.ttlTestValues) {
      const testData = this.generateTestData(5); // 5KB test data
      const numEntries = 100;
      const times = {
        writes: [],
        reads: [],
        expirationChecks: []
      };
      
      // Write entries with specific TTL
      for (let i = 0; i < numEntries; i++) {
        const key = `ttl-test-${ttl}s-${i}`;
        
        const start = performance.now();
        await this.cacheManager.set(key, testData, ttl);
        times.writes.push(performance.now() - start);
      }
      
      // Read entries before expiration
      for (let i = 0; i < numEntries; i++) {
        const key = `ttl-test-${ttl}s-${i}`;
        
        const start = performance.now();
        const result = await this.cacheManager.get(key);
        times.reads.push(performance.now() - start);
      }
      
      // Wait for shorter TTLs to expire
      if (ttl <= 5) {
        await new Promise(resolve => setTimeout(resolve, (ttl + 1) * 1000));
        
        // Check expiration detection performance
        for (let i = 0; i < numEntries; i++) {
          const key = `ttl-test-${ttl}s-${i}`;
          
          const start = performance.now();
          const result = await this.cacheManager.get(key);
          times.expirationChecks.push(performance.now() - start);
        }
      }
      
      results[`${ttl}s_TTL`] = {
        ttl,
        numEntries,
        writePerformance: {
          avg: times.writes.reduce((a, b) => a + b, 0) / times.writes.length,
          max: Math.max(...times.writes),
          min: Math.min(...times.writes)
        },
        readPerformance: {
          avg: times.reads.reduce((a, b) => a + b, 0) / times.reads.length,
          max: Math.max(...times.reads),
          min: Math.min(...times.reads)
        },
        expirationCheckPerformance: times.expirationChecks.length > 0 ? {
          avg: times.expirationChecks.reduce((a, b) => a + b, 0) / times.expirationChecks.length,
          max: Math.max(...times.expirationChecks),
          min: Math.min(...times.expirationChecks)
        } : null
      };
    }
    
    this.results.ttlManagement = results;
    return results;
  }

  // Cache invalidation performance test
  async benchmarkCacheInvalidation() {
    console.log('🔄 Testing cache invalidation performance...');
    const testData = this.generateTestData(10);
    const numEntries = 500;
    const results = {};
    
    // Populate cache
    const keys = [];
    for (let i = 0; i < numEntries; i++) {
      const key = `invalidation-test-${i}`;
      keys.push(key);
      await this.cacheManager.set(key, testData, 3600);
    }
    
    // Test individual key deletion
    const individualDeletionTimes = [];
    const keysToDelete = keys.slice(0, 50);
    
    for (const key of keysToDelete) {
      const start = performance.now();
      await this.cacheManager.delete(key);
      individualDeletionTimes.push(performance.now() - start);
    }
    
    results.individualDeletion = {
      numDeleted: keysToDelete.length,
      avgTime: individualDeletionTimes.reduce((a, b) => a + b, 0) / individualDeletionTimes.length,
      maxTime: Math.max(...individualDeletionTimes),
      minTime: Math.min(...individualDeletionTimes),
      throughput: keysToDelete.length / (individualDeletionTimes.reduce((a, b) => a + b, 0) / 1000)
    };
    
    // Test bulk expiration cleanup
    const start = performance.now();
    await this.cacheManager.purgeExpired();
    const bulkCleanupTime = performance.now() - start;
    
    results.bulkCleanup = {
      time: bulkCleanupTime,
      entriesProcessed: numEntries - keysToDelete.length
    };
    
    this.results.cacheInvalidation = results;
    return results;
  }

  // Memory usage monitoring during cache operations
  async benchmarkMemoryUsage() {
    console.log('🔄 Testing memory usage patterns...');
    const results = {};
    const testSizes = [1, 10, 100]; // KB
    
    for (const size of testSizes) {
      const initialMemory = this.measureMemoryUsage();
      const testData = this.generateTestData(size);
      const numEntries = Math.floor(10000 / size); // Adjust based on size
      const memorySnapshots = [initialMemory];
      
      // Gradually populate cache and monitor memory
      for (let i = 0; i < numEntries; i++) {
        await this.cacheManager.set(`memory-test-${size}kb-${i}`, testData, 3600);
        
        if (i % Math.floor(numEntries / 10) === 0) {
          memorySnapshots.push(this.measureMemoryUsage());
        }
      }
      
      const finalMemory = this.measureMemoryUsage();
      memorySnapshots.push(finalMemory);
      
      // Force garbage collection if available
      if (global.gc) {
        global.gc();
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      const postGCMemory = this.measureMemoryUsage();
      
      results[`${size}KB_entries`] = {
        numEntries,
        dataSize: size,
        initialHeap: initialMemory.heapUsed,
        finalHeap: finalMemory.heapUsed,
        postGCHeap: postGCMemory.heapUsed,
        memoryGrowth: finalMemory.heapUsed - initialMemory.heapUsed,
        memoryPerEntry: (finalMemory.heapUsed - initialMemory.heapUsed) / numEntries,
        gcRecovered: finalMemory.heapUsed - postGCMemory.heapUsed,
        memorySnapshots: memorySnapshots.map(snap => snap.heapUsed)
      };
    }
    
    this.results.memoryUsage = results;
    return results;
  }

  // Cache hit ratio optimization test
  async benchmarkCacheHitRatio() {
    console.log('🔄 Testing cache hit ratio patterns...');
    const testData = this.generateTestData(10);
    const totalOperations = 1000;
    const uniqueKeys = 100;
    const results = {};
    
    // Simulate different access patterns
    const patterns = {
      uniform: () => Math.floor(Math.random() * uniqueKeys),
      hotSpot: () => Math.random() < 0.8 ? Math.floor(Math.random() * 20) : Math.floor(Math.random() * uniqueKeys),
      sequential: (() => { let counter = 0; return () => counter++ % uniqueKeys; })(),
      zipfian: () => {
        // Simple Zipfian distribution approximation
        const rank = Math.floor(Math.random() * uniqueKeys) + 1;
        return Math.floor(uniqueKeys / rank);
      }
    };
    
    for (const [patternName, patternFunc] of Object.entries(patterns)) {
      let hits = 0;
      let misses = 0;
      const accessTimes = [];
      
      // Clear cache for this pattern test
      await fs.rm(this.cacheDir, { recursive: true, force: true });
      await fs.mkdir(this.cacheDir, { recursive: true });
      
      for (let i = 0; i < totalOperations; i++) {
        const keyIndex = patternFunc();
        const key = `pattern-test-${patternName}-${keyIndex}`;
        
        const start = performance.now();
        let result = await this.cacheManager.get(key);
        
        if (!result) {
          // Cache miss - populate cache
          await this.cacheManager.set(key, testData, 300);
          misses++;
        } else {
          hits++;
        }
        
        accessTimes.push(performance.now() - start);
      }
      
      results[patternName] = {
        totalOperations,
        hits,
        misses,
        hitRatio: hits / totalOperations,
        avgAccessTime: accessTimes.reduce((a, b) => a + b, 0) / accessTimes.length,
        maxAccessTime: Math.max(...accessTimes),
        minAccessTime: Math.min(...accessTimes)
      };
    }
    
    this.results.hitRatioPatterns = results;
    return results;
  }

  // Run all benchmarks
  async runAllBenchmarks() {
    console.log('🚀 Starting Cache Performance Benchmarks...\n');
    
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
      results.cacheWrites = await this.benchmarkCacheWrites();
      results.cacheReads = await this.benchmarkCacheReads();
      results.concurrentOperations = await this.benchmarkConcurrentOperations();
      results.ttlManagement = await this.benchmarkTTLManagement();
      results.cacheInvalidation = await this.benchmarkCacheInvalidation();
      results.memoryUsage = await this.benchmarkMemoryUsage();
      results.hitRatioPatterns = await this.benchmarkCacheHitRatio();
      
      // Add performance metrics
      results.performanceMetrics = performanceMetrics;
      
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
# Cache Performance Benchmark Report
Generated: ${results.timestamp}

## System Information
- Node.js Version: ${results.system.nodeVersion}
- Platform: ${results.system.platform} ${results.system.arch}
- Initial Memory: ${Math.round(results.system.memory.heapUsed / 1024 / 1024)}MB

## Performance Summary

### Cache Write Performance
`;
    
    if (results.cacheWrites) {
      Object.entries(results.cacheWrites).forEach(([size, metrics]) => {
        report += `
**${size} Data:**
- Average Time: ${metrics.avgTime.toFixed(2)}ms
- Throughput: ${metrics.throughput.toFixed(0)} ops/sec
- P95 Time: ${metrics.p95Time.toFixed(2)}ms
`;
      });
    }
    
    report += `
### Cache Read Performance
`;
    
    if (results.cacheReads) {
      Object.entries(results.cacheReads).forEach(([size, metrics]) => {
        report += `
**${size} Data:**
- Average Time: ${metrics.avgTime.toFixed(2)}ms
- Hit Rate: ${(metrics.hitRate * 100).toFixed(1)}%
- Throughput: ${metrics.throughput.toFixed(0)} ops/sec
`;
      });
    }
    
    report += `
### Concurrent Operations Performance
`;
    
    if (results.concurrentOperations) {
      Object.entries(results.concurrentOperations).forEach(([workers, metrics]) => {
        report += `
**${metrics.concurrency} Concurrent Workers:**
- Throughput: ${metrics.throughput.toFixed(0)} ops/sec
- Average Operation Time: ${metrics.avgOperationTime.toFixed(2)}ms
- Max Operation Time: ${metrics.maxOperationTime.toFixed(2)}ms
`;
      });
    }
    
    report += `
### Cache Hit Ratio by Access Pattern
`;
    
    if (results.hitRatioPatterns) {
      Object.entries(results.hitRatioPatterns).forEach(([pattern, metrics]) => {
        report += `
**${pattern.charAt(0).toUpperCase() + pattern.slice(1)} Pattern:**
- Hit Ratio: ${(metrics.hitRatio * 100).toFixed(1)}%
- Average Access Time: ${metrics.avgAccessTime.toFixed(2)}ms
`;
      });
    }
    
    report += `
### Memory Usage Analysis
`;
    
    if (results.memoryUsage) {
      Object.entries(results.memoryUsage).forEach(([config, metrics]) => {
        report += `
**${config}:**
- Memory Growth: ${Math.round(metrics.memoryGrowth / 1024 / 1024)}MB
- Memory per Entry: ${Math.round(metrics.memoryPerEntry / 1024)}KB
- GC Recovered: ${Math.round(metrics.gcRecovered / 1024 / 1024)}MB
`;
      });
    }
    
    return report;
  }
}

// Export for direct usage
export const runCacheBenchmarks = async (options = {}) => {
  const benchmark = new CachePerformanceBenchmark(options);
  return await benchmark.runAllBenchmarks();
};

// CLI execution
if (import.meta.url === `file://${process.argv[1]}`) {
  const benchmark = new CachePerformanceBenchmark();
  
  benchmark.runAllBenchmarks()
    .then(results => {
      console.log('\n' + '='.repeat(60));
      console.log(benchmark.generateReport());
      console.log('='.repeat(60));
      
      // Save results to file
      const filename = `cache-benchmark-${Date.now()}.json`;
      fs.writeFile(filename, JSON.stringify(results, null, 2))
        .then(() => console.log(`\n📊 Detailed results saved to: ${filename}`))
        .catch(err => console.error('Failed to save results:', err));
    })
    .catch(error => {
      console.error('Benchmark failed:', error);
      process.exit(1);
    });
}