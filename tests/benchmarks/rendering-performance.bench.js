/**
 * SSR Rendering Performance Benchmarks
 * 
 * Tests server-side rendering performance including:
 * - Component render time analysis
 * - HTML generation speed
 * - Memory usage during rendering
 * - Large dataset handling
 * - Template compilation performance
 */

import { performance, PerformanceObserver } from 'perf_hooks';
import { createServer } from 'http';
import express from 'express';
import React from 'react';
import { renderToString, renderToStaticMarkup } from 'react-dom/server';
import fs from 'fs/promises';
import path from 'path';

// Performance tracking
let renderingMetrics = {
  render_operations: [],
  memory_usage: [],
  component_timings: {},
  template_compilations: []
};

const observer = new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
    if (entry.name.startsWith('render_') || entry.name.startsWith('component_')) {
      renderingMetrics.render_operations.push({
        operation: entry.name,
        duration: entry.duration,
        timestamp: Date.now()
      });
    }
  }
});

// Mock components for testing different complexity levels
const SimpleComponent = ({ title, content }) => 
  React.createElement('div', null, 
    React.createElement('h1', null, title),
    React.createElement('p', null, content)
  );

const ComplexComponent = ({ data }) => {
  const items = data || [];
  return React.createElement('div', { className: 'complex-component' },
    React.createElement('header', null,
      React.createElement('h1', null, 'Complex Component'),
      React.createElement('nav', null,
        React.createElement('ul', null,
          ['Home', 'About', 'Contact'].map((item, i) =>
            React.createElement('li', { key: i },
              React.createElement('a', { href: `/${item.toLowerCase()}` }, item)
            )
          )
        )
      )
    ),
    React.createElement('main', null,
      React.createElement('section', { className: 'content' },
        items.map((item, index) =>
          React.createElement('article', { key: index, className: 'article' },
            React.createElement('h2', null, item.title || `Article ${index}`),
            React.createElement('p', null, item.content || 'Default content'),
            React.createElement('div', { className: 'meta' },
              React.createElement('span', null, `Date: ${item.date || new Date().toLocaleDateString()}`),
              React.createElement('span', null, `Author: ${item.author || 'Anonymous'}`)
            )
          )
        )
      )
    ),
    React.createElement('footer', null,
      React.createElement('p', null, `© 2024 - ${items.length} items rendered`)
    )
  );
};

// Deeply nested component for stress testing
const DeepComponent = ({ depth, data }) => {
  if (depth <= 0) {
    return React.createElement('span', null, data || 'Leaf');
  }
  
  return React.createElement('div', { className: `depth-${depth}` },
    React.createElement('h3', null, `Level ${depth}`),
    React.createElement(DeepComponent, { depth: depth - 1, data })
  );
};

// News article component (realistic example)
const NewsArticleComponent = ({ article }) => 
  React.createElement('article', { className: 'news-article' },
    React.createElement('header', null,
      React.createElement('h1', null, article?.title || 'Default Title'),
      React.createElement('div', { className: 'meta' },
        React.createElement('span', { className: 'author' }, article?.author || 'Anonymous'),
        React.createElement('span', { className: 'date' }, article?.date || new Date().toLocaleDateString()),
        React.createElement('span', { className: 'category' }, article?.category || 'News')
      )
    ),
    React.createElement('div', { className: 'content' },
      React.createElement('p', { className: 'excerpt' }, article?.excerpt || 'Default excerpt'),
      React.createElement('div', { className: 'body', dangerouslySetInnerHTML: { 
        __html: article?.content || '<p>Default content</p>'.repeat(10) 
      }}),
      article?.tags && React.createElement('div', { className: 'tags' },
        article.tags.map((tag, i) =>
          React.createElement('span', { key: i, className: 'tag' }, tag)
        )
      )
    )
  );

// Homepage component with multiple sections
const HomepageComponent = ({ articles, events, businesses }) =>
  React.createElement('div', { className: 'homepage' },
    React.createElement('header', { className: 'hero' },
      React.createElement('h1', null, 'Local News Community'),
      React.createElement('p', null, 'Stay informed with local news, events, and business updates')
    ),
    React.createElement('main', null,
      React.createElement('section', { className: 'featured-news' },
        React.createElement('h2', null, 'Featured News'),
        articles?.slice(0, 5).map((article, i) =>
          React.createElement(NewsArticleComponent, { key: i, article })
        )
      ),
      React.createElement('section', { className: 'events' },
        React.createElement('h2', null, 'Upcoming Events'),
        events?.map((event, i) =>
          React.createElement('div', { key: i, className: 'event-card' },
            React.createElement('h3', null, event.title),
            React.createElement('p', null, event.date),
            React.createElement('p', null, event.description)
          )
        )
      ),
      React.createElement('section', { className: 'businesses' },
        React.createElement('h2', null, 'Local Businesses'),
        businesses?.map((business, i) =>
          React.createElement('div', { key: i, className: 'business-card' },
            React.createElement('h3', null, business.name),
            React.createElement('p', null, business.category),
            React.createElement('p', null, business.address)
          )
        )
      )
    )
  );

export class RenderingPerformanceBenchmark {
  constructor(options = {}) {
    this.options = options;
    this.testDataSizes = [10, 50, 100, 500, 1000];
    this.componentTypes = ['simple', 'complex', 'deep', 'article', 'homepage'];
    this.renderingMethods = ['renderToString', 'renderToStaticMarkup'];
    this.results = {};
  }

  async setup() {
    // Start performance monitoring
    observer.observe({ entryTypes: ['measure'] });
    
    // Reset metrics
    renderingMetrics = {
      render_operations: [],
      memory_usage: [],
      component_timings: {},
      template_compilations: []
    };
  }

  async cleanup() {
    observer.disconnect();
  }

  // Generate test data
  generateTestData(size, type = 'articles') {
    switch (type) {
      case 'articles':
        return Array.from({ length: size }, (_, i) => ({
          id: i,
          title: `Breaking News Article ${i + 1}: Major Development in Local Community`,
          content: `This is the detailed content for article ${i + 1}. `.repeat(20),
          excerpt: `Brief summary of article ${i + 1} with key highlights and important information.`,
          author: `Author ${(i % 10) + 1}`,
          date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toLocaleDateString(),
          category: ['Politics', 'Sports', 'Business', 'Entertainment', 'Technology'][i % 5],
          tags: [`tag${i % 3}`, `category${i % 4}`, `topic${i % 5}`],
          views: Math.floor(Math.random() * 10000),
          comments: Math.floor(Math.random() * 100)
        }));
      
      case 'events':
        return Array.from({ length: size }, (_, i) => ({
          id: i,
          title: `Community Event ${i + 1}`,
          description: `Join us for this exciting community event featuring local speakers and activities.`,
          date: new Date(Date.now() + Math.random() * 30 * 24 * 60 * 60 * 1000).toLocaleDateString(),
          location: `Venue ${(i % 5) + 1}`,
          organizer: `Organizer ${(i % 3) + 1}`
        }));
      
      case 'businesses':
        return Array.from({ length: size }, (_, i) => ({
          id: i,
          name: `Local Business ${i + 1}`,
          category: ['Restaurant', 'Retail', 'Service', 'Healthcare', 'Entertainment'][i % 5],
          address: `${100 + i} Main Street, City, State 12345`,
          phone: `(555) ${String(1000 + i).padStart(4, '0')}`,
          rating: 3 + Math.random() * 2,
          reviewCount: Math.floor(Math.random() * 500)
        }));
      
      default:
        return Array.from({ length: size }, (_, i) => ({
          id: i,
          title: `Item ${i + 1}`,
          content: `Content for item ${i + 1}`,
          date: new Date().toLocaleDateString()
        }));
    }
  }

  // Measure memory usage
  measureMemoryUsage() {
    const usage = process.memoryUsage();
    renderingMetrics.memory_usage.push({
      heapUsed: usage.heapUsed,
      heapTotal: usage.heapTotal,
      external: usage.external,
      rss: usage.rss,
      timestamp: Date.now()
    });
    return usage;
  }

  // Benchmark simple component rendering
  async benchmarkSimpleComponentRendering() {
    console.log('🔄 Testing simple component rendering...');
    const results = {};
    
    for (const method of this.renderingMethods) {
      const methodResults = {};
      
      for (const size of this.testDataSizes) {
        const iterations = Math.max(10, Math.floor(1000 / size));
        const times = [];
        const memoryUsages = [];
        
        for (let i = 0; i < iterations; i++) {
          const props = {
            title: `Test Title ${i}`,
            content: 'Test content '.repeat(size)
          };
          
          const initialMemory = this.measureMemoryUsage();
          
          performance.mark(`render_simple_${method}_start`);
          
          if (method === 'renderToString') {
            renderToString(React.createElement(SimpleComponent, props));
          } else {
            renderToStaticMarkup(React.createElement(SimpleComponent, props));
          }
          
          performance.mark(`render_simple_${method}_end`);
          performance.measure(
            `render_simple_${method}`,
            `render_simple_${method}_start`,
            `render_simple_${method}_end`
          );
          
          const measures = performance.getEntriesByName(`render_simple_${method}`);
          times.push(measures[measures.length - 1].duration);
          
          const finalMemory = this.measureMemoryUsage();
          memoryUsages.push(finalMemory.heapUsed - initialMemory.heapUsed);
          
          performance.clearMarks();
          performance.clearMeasures();
        }
        
        methodResults[`${size}_content_units`] = {
          iterations,
          avgTime: times.reduce((a, b) => a + b, 0) / times.length,
          minTime: Math.min(...times),
          maxTime: Math.max(...times),
          p95Time: this.calculatePercentile(times, 0.95),
          avgMemoryDelta: memoryUsages.reduce((a, b) => a + b, 0) / memoryUsages.length,
          throughput: iterations / (times.reduce((a, b) => a + b, 0) / 1000)
        };
      }
      
      results[method] = methodResults;
    }
    
    this.results.simpleComponentRendering = results;
    return results;
  }

  // Benchmark complex component rendering
  async benchmarkComplexComponentRendering() {
    console.log('🔄 Testing complex component rendering...');
    const results = {};
    
    for (const method of this.renderingMethods) {
      const methodResults = {};
      
      for (const size of this.testDataSizes) {
        const testData = this.generateTestData(size);
        const iterations = Math.max(5, Math.floor(100 / Math.log10(size + 1)));
        const times = [];
        const memoryUsages = [];
        
        for (let i = 0; i < iterations; i++) {
          const initialMemory = this.measureMemoryUsage();
          
          performance.mark(`render_complex_${method}_start`);
          
          if (method === 'renderToString') {
            renderToString(React.createElement(ComplexComponent, { data: testData }));
          } else {
            renderToStaticMarkup(React.createElement(ComplexComponent, { data: testData }));
          }
          
          performance.mark(`render_complex_${method}_end`);
          performance.measure(
            `render_complex_${method}`,
            `render_complex_${method}_start`,
            `render_complex_${method}_end`
          );
          
          const measures = performance.getEntriesByName(`render_complex_${method}`);
          times.push(measures[measures.length - 1].duration);
          
          const finalMemory = this.measureMemoryUsage();
          memoryUsages.push(finalMemory.heapUsed - initialMemory.heapUsed);
          
          performance.clearMarks();
          performance.clearMeasures();
        }
        
        methodResults[`${size}_items`] = {
          iterations,
          dataSize: size,
          avgTime: times.reduce((a, b) => a + b, 0) / times.length,
          minTime: Math.min(...times),
          maxTime: Math.max(...times),
          p95Time: this.calculatePercentile(times, 0.95),
          avgMemoryDelta: memoryUsages.reduce((a, b) => a + b, 0) / memoryUsages.length,
          throughput: iterations / (times.reduce((a, b) => a + b, 0) / 1000),
          itemsPerSecond: (size * iterations) / (times.reduce((a, b) => a + b, 0) / 1000)
        };
      }
      
      results[method] = methodResults;
    }
    
    this.results.complexComponentRendering = results;
    return results;
  }

  // Benchmark deep component nesting
  async benchmarkDeepComponentRendering() {
    console.log('🔄 Testing deep component nesting...');
    const results = {};
    const depthLevels = [5, 10, 15, 20, 25];
    
    for (const method of this.renderingMethods) {
      const methodResults = {};
      
      for (const depth of depthLevels) {
        const iterations = Math.max(10, Math.floor(200 / depth));
        const times = [];
        const memoryUsages = [];
        
        for (let i = 0; i < iterations; i++) {
          const initialMemory = this.measureMemoryUsage();
          
          performance.mark(`render_deep_${method}_start`);
          
          if (method === 'renderToString') {
            renderToString(React.createElement(DeepComponent, { 
              depth, 
              data: `Deep data at depth ${depth}` 
            }));
          } else {
            renderToStaticMarkup(React.createElement(DeepComponent, { 
              depth, 
              data: `Deep data at depth ${depth}` 
            }));
          }
          
          performance.mark(`render_deep_${method}_end`);
          performance.measure(
            `render_deep_${method}`,
            `render_deep_${method}_start`,
            `render_deep_${method}_end`
          );
          
          const measures = performance.getEntriesByName(`render_deep_${method}`);
          times.push(measures[measures.length - 1].duration);
          
          const finalMemory = this.measureMemoryUsage();
          memoryUsages.push(finalMemory.heapUsed - initialMemory.heapUsed);
          
          performance.clearMarks();
          performance.clearMeasures();
        }
        
        methodResults[`${depth}_levels_deep`] = {
          depth,
          iterations,
          avgTime: times.reduce((a, b) => a + b, 0) / times.length,
          minTime: Math.min(...times),
          maxTime: Math.max(...times),
          timePerLevel: (times.reduce((a, b) => a + b, 0) / times.length) / depth,
          avgMemoryDelta: memoryUsages.reduce((a, b) => a + b, 0) / memoryUsages.length,
          throughput: iterations / (times.reduce((a, b) => a + b, 0) / 1000)
        };
      }
      
      results[method] = methodResults;
    }
    
    this.results.deepComponentRendering = results;
    return results;
  }

  // Benchmark realistic homepage rendering
  async benchmarkHomepageRendering() {
    console.log('🔄 Testing homepage rendering with mixed content...');
    const results = {};
    const contentSizes = [
      { articles: 5, events: 3, businesses: 10 },
      { articles: 10, events: 5, businesses: 20 },
      { articles: 25, events: 10, businesses: 50 },
      { articles: 50, events: 20, businesses: 100 }
    ];
    
    for (const method of this.renderingMethods) {
      const methodResults = {};
      
      for (const sizes of contentSizes) {
        const articles = this.generateTestData(sizes.articles, 'articles');
        const events = this.generateTestData(sizes.events, 'events');
        const businesses = this.generateTestData(sizes.businesses, 'businesses');
        
        const iterations = Math.max(3, Math.floor(50 / (sizes.articles + sizes.events + sizes.businesses)));
        const times = [];
        const memoryUsages = [];
        const htmlSizes = [];
        
        for (let i = 0; i < iterations; i++) {
          const initialMemory = this.measureMemoryUsage();
          
          performance.mark(`render_homepage_${method}_start`);
          
          let html;
          if (method === 'renderToString') {
            html = renderToString(React.createElement(HomepageComponent, { 
              articles, events, businesses 
            }));
          } else {
            html = renderToStaticMarkup(React.createElement(HomepageComponent, { 
              articles, events, businesses 
            }));
          }
          
          performance.mark(`render_homepage_${method}_end`);
          performance.measure(
            `render_homepage_${method}`,
            `render_homepage_${method}_start`,
            `render_homepage_${method}_end`
          );
          
          const measures = performance.getEntriesByName(`render_homepage_${method}`);
          times.push(measures[measures.length - 1].duration);
          
          const finalMemory = this.measureMemoryUsage();
          memoryUsages.push(finalMemory.heapUsed - initialMemory.heapUsed);
          htmlSizes.push(Buffer.byteLength(html, 'utf8'));
          
          performance.clearMarks();
          performance.clearMeasures();
        }
        
        const sizeKey = `${sizes.articles}a_${sizes.events}e_${sizes.businesses}b`;
        methodResults[sizeKey] = {
          contentCounts: sizes,
          totalItems: sizes.articles + sizes.events + sizes.businesses,
          iterations,
          avgTime: times.reduce((a, b) => a + b, 0) / times.length,
          minTime: Math.min(...times),
          maxTime: Math.max(...times),
          avgMemoryDelta: memoryUsages.reduce((a, b) => a + b, 0) / memoryUsages.length,
          avgHtmlSize: htmlSizes.reduce((a, b) => a + b, 0) / htmlSizes.length,
          throughput: iterations / (times.reduce((a, b) => a + b, 0) / 1000),
          itemsPerSecond: (sizes.articles + sizes.events + sizes.businesses) * iterations / (times.reduce((a, b) => a + b, 0) / 1000)
        };
      }
      
      results[method] = methodResults;
    }
    
    this.results.homepageRendering = results;
    return results;
  }

  // Benchmark concurrent rendering
  async benchmarkConcurrentRendering() {
    console.log('🔄 Testing concurrent rendering performance...');
    const results = {};
    const concurrencyLevels = [1, 5, 10, 20];
    const testData = this.generateTestData(50);
    
    for (const concurrency of concurrencyLevels) {
      const rendersPerWorker = 10;
      const times = [];
      
      performance.mark('concurrent_render_start');
      
      const promises = Array.from({ length: concurrency }, async (_, workerIndex) => {
        const workerTimes = [];
        
        for (let i = 0; i < rendersPerWorker; i++) {
          const start = performance.now();
          
          // Mix different component types
          const componentType = i % 3;
          if (componentType === 0) {
            renderToString(React.createElement(SimpleComponent, { 
              title: `Worker ${workerIndex} Render ${i}`,
              content: 'Test content' 
            }));
          } else if (componentType === 1) {
            renderToString(React.createElement(ComplexComponent, { data: testData.slice(0, 20) }));
          } else {
            renderToString(React.createElement(NewsArticleComponent, { article: testData[i % testData.length] }));
          }
          
          workerTimes.push(performance.now() - start);
        }
        
        return workerTimes;
      });
      
      const allWorkerTimes = await Promise.all(promises);
      performance.mark('concurrent_render_end');
      performance.measure('concurrent_render_total', 'concurrent_render_start', 'concurrent_render_end');
      
      const totalTime = performance.getEntriesByName('concurrent_render_total')[0].duration;
      const allTimes = allWorkerTimes.flat();
      
      results[`${concurrency}_workers`] = {
        concurrency,
        totalRenders: concurrency * rendersPerWorker,
        totalTime,
        avgRenderTime: allTimes.reduce((a, b) => a + b, 0) / allTimes.length,
        maxRenderTime: Math.max(...allTimes),
        minRenderTime: Math.min(...allTimes),
        throughput: (concurrency * rendersPerWorker) / (totalTime / 1000),
        rendersPerSecond: (concurrency * rendersPerWorker) / (totalTime / 1000)
      };
      
      performance.clearMarks();
      performance.clearMeasures();
    }
    
    this.results.concurrentRendering = results;
    return results;
  }

  // Run all rendering benchmarks
  async runAllBenchmarks() {
    console.log('🚀 Starting SSR Rendering Performance Benchmarks...\n');
    
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
      results.simpleComponentRendering = await this.benchmarkSimpleComponentRendering();
      results.complexComponentRendering = await this.benchmarkComplexComponentRendering();
      results.deepComponentRendering = await this.benchmarkDeepComponentRendering();
      results.homepageRendering = await this.benchmarkHomepageRendering();
      results.concurrentRendering = await this.benchmarkConcurrentRendering();
      
      // Add performance metrics
      results.performanceMetrics = renderingMetrics;
      
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
# SSR Rendering Performance Benchmark Report
Generated: ${results.timestamp}

## System Information
- Node.js Version: ${results.system.nodeVersion}
- Platform: ${results.system.platform} ${results.system.arch}
- Initial Memory: ${Math.round(results.system.memory.heapUsed / 1024 / 1024)}MB

## Performance Summary

### Simple Component Rendering
`;
    
    if (results.simpleComponentRendering) {
      Object.entries(results.simpleComponentRendering).forEach(([method, metrics]) => {
        report += `\n**${method}:**\n`;
        Object.entries(metrics).forEach(([size, data]) => {
          report += `- ${size}: ${data.avgTime.toFixed(2)}ms avg, ${data.throughput.toFixed(0)} ops/sec\n`;
        });
      });
    }
    
    report += `
### Complex Component Rendering
`;
    
    if (results.complexComponentRendering) {
      Object.entries(results.complexComponentRendering).forEach(([method, metrics]) => {
        report += `\n**${method}:**\n`;
        Object.entries(metrics).forEach(([size, data]) => {
          report += `- ${size}: ${data.avgTime.toFixed(2)}ms avg, ${data.itemsPerSecond.toFixed(0)} items/sec\n`;
        });
      });
    }
    
    report += `
### Deep Component Nesting
`;
    
    if (results.deepComponentRendering) {
      Object.entries(results.deepComponentRendering).forEach(([method, metrics]) => {
        report += `\n**${method}:**\n`;
        Object.entries(metrics).forEach(([depth, data]) => {
          report += `- ${depth}: ${data.avgTime.toFixed(2)}ms avg, ${data.timePerLevel.toFixed(3)}ms per level\n`;
        });
      });
    }
    
    report += `
### Homepage Rendering (Mixed Content)
`;
    
    if (results.homepageRendering) {
      Object.entries(results.homepageRendering).forEach(([method, metrics]) => {
        report += `\n**${method}:**\n`;
        Object.entries(metrics).forEach(([config, data]) => {
          report += `- ${config}: ${data.avgTime.toFixed(2)}ms avg, ${Math.round(data.avgHtmlSize/1024)}KB HTML\n`;
        });
      });
    }
    
    report += `
### Concurrent Rendering Performance
`;
    
    if (results.concurrentRendering) {
      Object.entries(results.concurrentRendering).forEach(([workers, metrics]) => {
        report += `- ${workers}: ${metrics.rendersPerSecond.toFixed(0)} renders/sec, ${metrics.avgRenderTime.toFixed(2)}ms avg\n`;
      });
    }
    
    return report;
  }
}

// Export for direct usage
export const runRenderingBenchmarks = async (options = {}) => {
  const benchmark = new RenderingPerformanceBenchmark(options);
  return await benchmark.runAllBenchmarks();
};

// CLI execution
if (import.meta.url === `file://${process.argv[1]}`) {
  const benchmark = new RenderingPerformanceBenchmark();
  
  benchmark.runAllBenchmarks()
    .then(results => {
      console.log('\n' + '='.repeat(60));
      console.log(benchmark.generateReport());
      console.log('='.repeat(60));
      
      // Save results to file
      const filename = `rendering-benchmark-${Date.now()}.json`;
      fs.writeFile(filename, JSON.stringify(results, null, 2))
        .then(() => console.log(`\n📊 Detailed results saved to: ${filename}`))
        .catch(err => console.error('Failed to save results:', err));
    })
    .catch(error => {
      console.error('Benchmark failed:', error);
      process.exit(1);
    });
}