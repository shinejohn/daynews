#!/usr/bin/env node
/**
 * Performance Benchmark Runner with Comprehensive Reporting
 * 
 * Features:
 * - Orchestrates all benchmark suites
 * - Generates comprehensive reports
 * - Performance regression detection
 * - Historical data tracking
 * - CI/CD integration support
 * - Alert thresholds and notifications
 */

import { performance } from 'perf_hooks';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { CachePerformanceBenchmark } from './cache-performance.bench.js';
import { RenderingPerformanceBenchmark } from './rendering-performance.bench.js';
import { DataLayerPerformanceBenchmark } from './data-layer.bench.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration constants
const CONFIG = {
  outputDir: path.join(__dirname, '../../benchmark-results'),
  historyFile: path.join(__dirname, '../../benchmark-results/history.json'),
  thresholds: {
    cache: {
      avgWriteTime: 50,    // ms
      avgReadTime: 10,     // ms
      hitRatio: 0.9,       // 90%
      throughput: 1000     // ops/sec
    },
    rendering: {
      simpleComponentTime: 5,   // ms
      complexComponentTime: 100, // ms
      homepageRenderTime: 500,   // ms
      throughput: 50            // renders/sec
    },
    dataLayer: {
      simpleQueryTime: 100,     // ms
      filteredQueryTime: 200,   // ms
      paginationTime: 150,      // ms per page
      throughput: 100           // queries/sec
    }
  },
  regressionThreshold: 0.2 // 20% performance degradation threshold
};

class BenchmarkRunner {
  constructor(options = {}) {
    this.options = {
      suites: options.suites || ['cache', 'rendering', 'dataLayer'],
      iterations: options.iterations || 1,
      warmup: options.warmup !== false,
      saveResults: options.saveResults !== false,
      compareWithHistory: options.compareWithHistory !== false,
      generateReport: options.generateReport !== false,
      alertOnRegression: options.alertOnRegression !== false,
      outputFormat: options.outputFormat || 'json',
      verbose: options.verbose || false,
      ...options
    };
    
    this.results = {};
    this.startTime = Date.now();
    this.systemInfo = this.collectSystemInfo();
  }

  collectSystemInfo() {
    return {
      timestamp: new Date().toISOString(),
      nodeVersion: process.version,
      platform: process.platform,
      arch: process.arch,
      cpus: require('os').cpus().length,
      memory: {
        total: require('os').totalmem(),
        free: require('os').freemem(),
        process: process.memoryUsage()
      },
      environment: {
        NODE_ENV: process.env.NODE_ENV || 'development',
        CI: process.env.CI || false,
        buildId: process.env.BUILD_ID || null
      }
    };
  }

  async setupOutputDirectory() {
    try {
      await fs.mkdir(CONFIG.outputDir, { recursive: true });
    } catch (error) {
      console.warn('Failed to create output directory:', error.message);
    }
  }

  async warmupSystem() {
    if (!this.options.warmup) return;
    
    console.log('🔥 Warming up system...');
    
    // Simple CPU warmup
    const warmupStart = performance.now();
    let counter = 0;
    while (performance.now() - warmupStart < 1000) {
      counter += Math.random();
    }
    
    // Memory allocation warmup
    const largeArray = new Array(100000).fill(null).map(() => Math.random());
    
    // Force garbage collection if available
    if (global.gc) {
      global.gc();
    }
    
    console.log('✅ System warmup completed');
  }

  async runCacheBenchmark() {
    if (!this.options.suites.includes('cache')) return null;
    
    console.log('\n🚀 Running Cache Performance Benchmarks...');
    const benchmark = new CachePerformanceBenchmark();
    
    try {
      const results = await benchmark.runAllBenchmarks();
      return {
        suite: 'cache',
        success: true,
        results,
        report: benchmark.generateReport()
      };
    } catch (error) {
      console.error('Cache benchmark failed:', error);
      return {
        suite: 'cache',
        success: false,
        error: error.message,
        results: null
      };
    }
  }

  async runRenderingBenchmark() {
    if (!this.options.suites.includes('rendering')) return null;
    
    console.log('\n🎨 Running Rendering Performance Benchmarks...');
    const benchmark = new RenderingPerformanceBenchmark();
    
    try {
      const results = await benchmark.runAllBenchmarks();
      return {
        suite: 'rendering',
        success: true,
        results,
        report: benchmark.generateReport()
      };
    } catch (error) {
      console.error('Rendering benchmark failed:', error);
      return {
        suite: 'rendering',
        success: false,
        error: error.message,
        results: null
      };
    }
  }

  async runDataLayerBenchmark() {
    if (!this.options.suites.includes('dataLayer')) return null;
    
    console.log('\n📊 Running Data Layer Performance Benchmarks...');
    const benchmark = new DataLayerPerformanceBenchmark();
    
    try {
      const results = await benchmark.runAllBenchmarks();
      return {
        suite: 'dataLayer',
        success: true,
        results,
        report: benchmark.generateReport()
      };
    } catch (error) {
      console.error('Data layer benchmark failed:', error);
      return {
        suite: 'dataLayer',
        success: false,
        error: error.message,
        results: null
      };
    }
  }

  async loadHistoricalData() {
    try {
      const historyData = await fs.readFile(CONFIG.historyFile, 'utf-8');
      return JSON.parse(historyData);
    } catch (error) {
      console.log('No historical data found, starting fresh');
      return { runs: [] };
    }
  }

  async saveHistoricalData(currentRun) {
    if (!this.options.saveResults) return;
    
    try {
      const history = await this.loadHistoricalData();
      history.runs = history.runs || [];
      history.runs.push(currentRun);
      
      // Keep only last 50 runs to prevent file bloat
      if (history.runs.length > 50) {
        history.runs = history.runs.slice(-50);
      }
      
      await fs.writeFile(CONFIG.historyFile, JSON.stringify(history, null, 2));
      console.log(`📊 Historical data updated: ${CONFIG.historyFile}`);
    } catch (error) {
      console.warn('Failed to save historical data:', error.message);
    }
  }

  calculatePerformanceMetrics(results) {
    const metrics = {
      cache: {},
      rendering: {},
      dataLayer: {}
    };

    // Cache metrics
    if (results.cache?.success && results.cache.results.cacheWrites) {
      const cacheWrites = Object.values(results.cache.results.cacheWrites);
      metrics.cache.avgWriteTime = cacheWrites.reduce((acc, w) => acc + w.avgTime, 0) / cacheWrites.length;
      
      const cacheReads = Object.values(results.cache.results.cacheReads);
      metrics.cache.avgReadTime = cacheReads.reduce((acc, r) => acc + r.avgTime, 0) / cacheReads.length;
      metrics.cache.avgHitRatio = cacheReads.reduce((acc, r) => acc + r.hitRatio, 0) / cacheReads.length;
      
      const concurrentOps = Object.values(results.cache.results.concurrentOperations);
      metrics.cache.maxThroughput = Math.max(...concurrentOps.map(op => op.throughput));
    }

    // Rendering metrics
    if (results.rendering?.success && results.rendering.results.simpleComponentRendering) {
      const simpleRendering = Object.values(results.rendering.results.simpleComponentRendering.renderToString || {});
      metrics.rendering.avgSimpleComponentTime = simpleRendering.reduce((acc, s) => acc + s.avgTime, 0) / simpleRendering.length;
      
      if (results.rendering.results.homepageRendering) {
        const homepageRendering = Object.values(results.rendering.results.homepageRendering.renderToString || {});
        metrics.rendering.avgHomepageTime = homepageRendering.reduce((acc, h) => acc + h.avgTime, 0) / homepageRendering.length;
      }
      
      if (results.rendering.results.concurrentRendering) {
        const concurrentRendering = Object.values(results.rendering.results.concurrentRendering);
        metrics.rendering.maxThroughput = Math.max(...concurrentRendering.map(r => r.rendersPerSecond));
      }
    }

    // Data Layer metrics
    if (results.dataLayer?.success && results.dataLayer.results.simpleQueries) {
      const allSimpleQueries = Object.values(results.dataLayer.results.simpleQueries).flatMap(table => Object.values(table));
      metrics.dataLayer.avgSimpleQueryTime = allSimpleQueries.reduce((acc, q) => acc + q.avgTime, 0) / allSimpleQueries.length;
      
      if (results.dataLayer.results.filteredQueries) {
        const allFilteredQueries = Object.values(results.dataLayer.results.filteredQueries).flatMap(table => Object.values(table));
        metrics.dataLayer.avgFilteredQueryTime = allFilteredQueries.reduce((acc, q) => acc + q.avgTime, 0) / allFilteredQueries.length;
      }
      
      if (results.dataLayer.results.concurrentQueries) {
        const concurrentQueries = Object.values(results.dataLayer.results.concurrentQueries);
        metrics.dataLayer.maxThroughput = Math.max(...concurrentQueries.map(q => q.queriesPerSecond));
      }
    }

    return metrics;
  }

  detectPerformanceRegressions(currentMetrics, historicalData) {
    if (!historicalData.runs || historicalData.runs.length === 0) {
      return { regressions: [], improvements: [] };
    }

    const lastRun = historicalData.runs[historicalData.runs.length - 1];
    if (!lastRun.metrics) return { regressions: [], improvements: [] };

    const regressions = [];
    const improvements = [];
    const threshold = CONFIG.regressionThreshold;

    const checkMetric = (category, metric, current, previous, lowerIsBetter = true) => {
      if (typeof current !== 'number' || typeof previous !== 'number') return;
      
      const change = lowerIsBetter ? 
        (current - previous) / previous :
        (previous - current) / previous;
      
      if (change > threshold) {
        regressions.push({
          category,
          metric,
          current,
          previous,
          changePercent: (change * 100).toFixed(1),
          severity: change > 0.5 ? 'high' : change > 0.3 ? 'medium' : 'low'
        });
      } else if (change < -0.1) { // 10% improvement threshold
        improvements.push({
          category,
          metric,
          current,
          previous,
          changePercent: (Math.abs(change) * 100).toFixed(1)
        });
      }
    };

    // Check cache metrics
    if (currentMetrics.cache && lastRun.metrics.cache) {
      checkMetric('cache', 'avgWriteTime', currentMetrics.cache.avgWriteTime, lastRun.metrics.cache.avgWriteTime);
      checkMetric('cache', 'avgReadTime', currentMetrics.cache.avgReadTime, lastRun.metrics.cache.avgReadTime);
      checkMetric('cache', 'avgHitRatio', currentMetrics.cache.avgHitRatio, lastRun.metrics.cache.avgHitRatio, false);
      checkMetric('cache', 'maxThroughput', currentMetrics.cache.maxThroughput, lastRun.metrics.cache.maxThroughput, false);
    }

    // Check rendering metrics
    if (currentMetrics.rendering && lastRun.metrics.rendering) {
      checkMetric('rendering', 'avgSimpleComponentTime', currentMetrics.rendering.avgSimpleComponentTime, lastRun.metrics.rendering.avgSimpleComponentTime);
      checkMetric('rendering', 'avgHomepageTime', currentMetrics.rendering.avgHomepageTime, lastRun.metrics.rendering.avgHomepageTime);
      checkMetric('rendering', 'maxThroughput', currentMetrics.rendering.maxThroughput, lastRun.metrics.rendering.maxThroughput, false);
    }

    // Check data layer metrics
    if (currentMetrics.dataLayer && lastRun.metrics.dataLayer) {
      checkMetric('dataLayer', 'avgSimpleQueryTime', currentMetrics.dataLayer.avgSimpleQueryTime, lastRun.metrics.dataLayer.avgSimpleQueryTime);
      checkMetric('dataLayer', 'avgFilteredQueryTime', currentMetrics.dataLayer.avgFilteredQueryTime, lastRun.metrics.dataLayer.avgFilteredQueryTime);
      checkMetric('dataLayer', 'maxThroughput', currentMetrics.dataLayer.maxThroughput, lastRun.metrics.dataLayer.maxThroughput, false);
    }

    return { regressions, improvements };
  }

  checkPerformanceThresholds(metrics) {
    const violations = [];
    const warnings = [];

    // Cache thresholds
    if (metrics.cache) {
      if (metrics.cache.avgWriteTime > CONFIG.thresholds.cache.avgWriteTime) {
        violations.push({
          category: 'cache',
          metric: 'avgWriteTime',
          value: metrics.cache.avgWriteTime,
          threshold: CONFIG.thresholds.cache.avgWriteTime,
          unit: 'ms'
        });
      }
      
      if (metrics.cache.avgReadTime > CONFIG.thresholds.cache.avgReadTime) {
        violations.push({
          category: 'cache',
          metric: 'avgReadTime',
          value: metrics.cache.avgReadTime,
          threshold: CONFIG.thresholds.cache.avgReadTime,
          unit: 'ms'
        });
      }
      
      if (metrics.cache.avgHitRatio < CONFIG.thresholds.cache.hitRatio) {
        warnings.push({
          category: 'cache',
          metric: 'avgHitRatio',
          value: (metrics.cache.avgHitRatio * 100).toFixed(1),
          threshold: (CONFIG.thresholds.cache.hitRatio * 100).toFixed(1),
          unit: '%'
        });
      }
    }

    // Rendering thresholds
    if (metrics.rendering) {
      if (metrics.rendering.avgSimpleComponentTime > CONFIG.thresholds.rendering.simpleComponentTime) {
        violations.push({
          category: 'rendering',
          metric: 'avgSimpleComponentTime',
          value: metrics.rendering.avgSimpleComponentTime,
          threshold: CONFIG.thresholds.rendering.simpleComponentTime,
          unit: 'ms'
        });
      }
      
      if (metrics.rendering.avgHomepageTime > CONFIG.thresholds.rendering.homepageRenderTime) {
        violations.push({
          category: 'rendering',
          metric: 'avgHomepageTime',
          value: metrics.rendering.avgHomepageTime,
          threshold: CONFIG.thresholds.rendering.homepageRenderTime,
          unit: 'ms'
        });
      }
    }

    // Data layer thresholds
    if (metrics.dataLayer) {
      if (metrics.dataLayer.avgSimpleQueryTime > CONFIG.thresholds.dataLayer.simpleQueryTime) {
        violations.push({
          category: 'dataLayer',
          metric: 'avgSimpleQueryTime',
          value: metrics.dataLayer.avgSimpleQueryTime,
          threshold: CONFIG.thresholds.dataLayer.simpleQueryTime,
          unit: 'ms'
        });
      }
      
      if (metrics.dataLayer.avgFilteredQueryTime > CONFIG.thresholds.dataLayer.filteredQueryTime) {
        violations.push({
          category: 'dataLayer',
          metric: 'avgFilteredQueryTime',
          value: metrics.dataLayer.avgFilteredQueryTime,
          threshold: CONFIG.thresholds.dataLayer.filteredQueryTime,
          unit: 'ms'
        });
      }
    }

    return { violations, warnings };
  }

  generateSummaryReport(runResults) {
    const { results, metrics, regressions, thresholdViolations, totalDuration } = runResults;
    
    let report = `
# Performance Benchmark Summary Report
Generated: ${new Date().toISOString()}

## System Information
- Node.js: ${this.systemInfo.nodeVersion}
- Platform: ${this.systemInfo.platform} ${this.systemInfo.arch}
- CPUs: ${this.systemInfo.cpus}
- Memory: ${Math.round(this.systemInfo.memory.total / 1024 / 1024 / 1024)}GB total
- Environment: ${this.systemInfo.environment.NODE_ENV}

## Execution Summary
- Total Duration: ${(totalDuration / 1000).toFixed(2)}s
- Suites Run: ${this.options.suites.join(', ')}
- Success Rate: ${Object.values(results).filter(r => r?.success).length}/${Object.values(results).filter(r => r !== null).length}

## Performance Metrics Overview
`;

    if (metrics.cache) {
      report += `
### Cache Performance
- Average Write Time: ${metrics.cache.avgWriteTime?.toFixed(2)}ms
- Average Read Time: ${metrics.cache.avgReadTime?.toFixed(2)}ms  
- Average Hit Ratio: ${(metrics.cache.avgHitRatio * 100)?.toFixed(1)}%
- Max Throughput: ${metrics.cache.maxThroughput?.toFixed(0)} ops/sec
`;
    }

    if (metrics.rendering) {
      report += `
### Rendering Performance
- Simple Component Time: ${metrics.rendering.avgSimpleComponentTime?.toFixed(2)}ms
- Homepage Render Time: ${metrics.rendering.avgHomepageTime?.toFixed(2)}ms
- Max Throughput: ${metrics.rendering.maxThroughput?.toFixed(0)} renders/sec
`;
    }

    if (metrics.dataLayer) {
      report += `
### Data Layer Performance
- Simple Query Time: ${metrics.dataLayer.avgSimpleQueryTime?.toFixed(2)}ms
- Filtered Query Time: ${metrics.dataLayer.avgFilteredQueryTime?.toFixed(2)}ms
- Max Throughput: ${metrics.dataLayer.maxThroughput?.toFixed(0)} queries/sec
`;
    }

    // Performance Issues
    if (regressions.regressions.length > 0 || thresholdViolations.violations.length > 0) {
      report += `
## ⚠️  Performance Issues Detected

### Regressions from Previous Run
`;
      regressions.regressions.forEach(reg => {
        report += `- **${reg.category}.${reg.metric}**: ${reg.changePercent}% slower (${reg.previous?.toFixed(2)} → ${reg.current?.toFixed(2)}) [${reg.severity}]\n`;
      });

      report += `
### Threshold Violations
`;
      thresholdViolations.violations.forEach(viol => {
        report += `- **${viol.category}.${viol.metric}**: ${viol.value?.toFixed(2)}${viol.unit} (threshold: ${viol.threshold}${viol.unit})\n`;
      });
    }

    // Improvements
    if (regressions.improvements.length > 0) {
      report += `
## ✅ Performance Improvements
`;
      regressions.improvements.forEach(imp => {
        report += `- **${imp.category}.${imp.metric}**: ${imp.changePercent}% faster (${imp.previous?.toFixed(2)} → ${imp.current?.toFixed(2)})\n`;
      });
    }

    // Warnings
    if (thresholdViolations.warnings.length > 0) {
      report += `
## ⚠️  Performance Warnings
`;
      thresholdViolations.warnings.forEach(warn => {
        report += `- **${warn.category}.${warn.metric}**: ${warn.value}${warn.unit} (expected: >${warn.threshold}${warn.unit})\n`;
      });
    }

    return report;
  }

  async saveResults(runResults) {
    if (!this.options.saveResults) return;

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `benchmark-results-${timestamp}.json`;
    const filepath = path.join(CONFIG.outputDir, filename);

    try {
      await fs.writeFile(filepath, JSON.stringify(runResults, null, 2));
      console.log(`📊 Results saved to: ${filepath}`);

      if (this.options.generateReport) {
        const reportFilename = `benchmark-report-${timestamp}.md`;
        const reportFilepath = path.join(CONFIG.outputDir, reportFilename);
        const report = this.generateSummaryReport(runResults);
        
        await fs.writeFile(reportFilepath, report);
        console.log(`📝 Report saved to: ${reportFilepath}`);
      }
    } catch (error) {
      console.warn('Failed to save results:', error.message);
    }
  }

  async runAllBenchmarks() {
    console.log('🚀 Starting Performance Benchmark Suite...\n');
    console.log(`System: ${this.systemInfo.platform} ${this.systemInfo.arch}`);
    console.log(`Node.js: ${this.systemInfo.nodeVersion}`);
    console.log(`Suites: ${this.options.suites.join(', ')}\n`);
    
    await this.setupOutputDirectory();
    await this.warmupSystem();
    
    const startTime = performance.now();
    
    // Run all benchmark suites
    const results = {};
    
    for (let iteration = 0; iteration < this.options.iterations; iteration++) {
      if (this.options.iterations > 1) {
        console.log(`\n📊 Running iteration ${iteration + 1}/${this.options.iterations}`);
      }
      
      const iterationResults = {};
      
      // Run benchmarks sequentially to avoid interference
      iterationResults.cache = await this.runCacheBenchmark();
      iterationResults.rendering = await this.runRenderingBenchmark();
      iterationResults.dataLayer = await this.runDataLayerBenchmark();
      
      // Store results (average if multiple iterations)
      Object.entries(iterationResults).forEach(([suite, result]) => {
        if (result && result.success) {
          if (!results[suite]) {
            results[suite] = result;
          } else if (this.options.iterations > 1) {
            // TODO: Implement result averaging for multiple iterations
          }
        } else if (result) {
          results[suite] = result;
        }
      });
    }
    
    const totalDuration = performance.now() - startTime;
    
    // Calculate performance metrics
    const metrics = this.calculatePerformanceMetrics(results);
    
    // Compare with historical data
    const historicalData = this.options.compareWithHistory ? await this.loadHistoricalData() : { runs: [] };
    const regressions = this.detectPerformanceRegressions(metrics, historicalData);
    
    // Check performance thresholds
    const thresholdViolations = this.checkPerformanceThresholds(metrics);
    
    const runResults = {
      systemInfo: this.systemInfo,
      options: this.options,
      results,
      metrics,
      regressions,
      thresholdViolations,
      totalDuration,
      timestamp: new Date().toISOString()
    };
    
    // Save results and generate reports
    await this.saveResults(runResults);
    await this.saveHistoricalData(runResults);
    
    return runResults;
  }

  async displayResults(runResults) {
    console.log('\n' + '='.repeat(80));
    console.log('🏁 BENCHMARK RESULTS SUMMARY');
    console.log('='.repeat(80));
    
    const report = this.generateSummaryReport(runResults);
    console.log(report);
    
    // Display detailed reports if requested
    if (this.options.verbose) {
      console.log('\n' + '='.repeat(80));
      console.log('📋 DETAILED REPORTS');
      console.log('='.repeat(80));
      
      Object.entries(runResults.results).forEach(([suite, result]) => {
        if (result && result.success && result.report) {
          console.log(`\n### ${suite.toUpperCase()} DETAILED REPORT`);
          console.log(result.report);
        }
      });
    }
    
    console.log('\n' + '='.repeat(80));
  }
}

// CLI argument parsing
function parseCliArgs() {
  const args = process.argv.slice(2);
  const options = {
    suites: ['cache', 'rendering', 'dataLayer'],
    iterations: 1,
    warmup: true,
    saveResults: true,
    compareWithHistory: true,
    generateReport: true,
    alertOnRegression: false,
    verbose: false
  };

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--suites':
        options.suites = args[++i].split(',');
        break;
      case '--iterations':
        options.iterations = parseInt(args[++i]);
        break;
      case '--no-warmup':
        options.warmup = false;
        break;
      case '--no-save':
        options.saveResults = false;
        break;
      case '--no-history':
        options.compareWithHistory = false;
        break;
      case '--no-report':
        options.generateReport = false;
        break;
      case '--alert':
        options.alertOnRegression = true;
        break;
      case '--verbose':
        options.verbose = true;
        break;
      case '--help':
        console.log(`
Performance Benchmark Runner

Usage: node run-benchmarks.js [options]

Options:
  --suites <list>      Comma-separated list of suites to run (cache,rendering,dataLayer)
  --iterations <n>     Number of iterations to run (default: 1)
  --no-warmup          Skip system warmup
  --no-save            Don't save results to file
  --no-history         Don't compare with historical data
  --no-report          Don't generate markdown report
  --alert              Alert on performance regressions
  --verbose            Show detailed reports
  --help               Show this help message

Examples:
  node run-benchmarks.js                           # Run all suites
  node run-benchmarks.js --suites cache,rendering  # Run specific suites
  node run-benchmarks.js --iterations 3 --verbose  # Run 3 times with detailed output
`);
        process.exit(0);
        break;
    }
  }

  return options;
}

// Export for programmatic usage
export { BenchmarkRunner, CONFIG };

// CLI execution
if (import.meta.url === `file://${process.argv[1]}`) {
  const options = parseCliArgs();
  const runner = new BenchmarkRunner(options);
  
  runner.runAllBenchmarks()
    .then(async (results) => {
      await runner.displayResults(results);
      
      // Exit with error code if there are critical performance issues
      const hasCriticalIssues = results.regressions.regressions.some(r => r.severity === 'high') ||
                               results.thresholdViolations.violations.length > 0;
      
      if (hasCriticalIssues && options.alertOnRegression) {
        console.error('\n❌ Critical performance issues detected!');
        process.exit(1);
      } else {
        console.log('\n✅ Benchmark suite completed successfully');
        process.exit(0);
      }
    })
    .catch(error => {
      console.error('\n❌ Benchmark suite failed:', error);
      process.exit(1);
    });
}