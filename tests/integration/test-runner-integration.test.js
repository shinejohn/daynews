/**
 * Integration test to verify the comprehensive test runner works correctly
 */

import { TestRunner, TEST_SUITES, CONFIG } from '../run-all-tests.js';
import { TestSummaryGenerator } from '../test-summary-generator.js';
import fs from 'fs/promises';
import path from 'path';

describe('Comprehensive Test System Integration', () => {
  let testOutputDir;
  
  beforeAll(async () => {
    // Create temporary test directory
    testOutputDir = path.join(__dirname, '../../test-results-temp');
    await fs.mkdir(testOutputDir, { recursive: true });
  });
  
  afterAll(async () => {
    // Clean up temporary directory
    try {
      await fs.rm(testOutputDir, { recursive: true });
    } catch (error) {
      // Directory might not exist, ignore error
    }
  });

  describe('TestRunner', () => {
    test('should initialize with default options', () => {
      const runner = new TestRunner();
      
      expect(runner.options).toBeDefined();
      expect(runner.options.suites).toEqual(Object.keys(TEST_SUITES));
      expect(runner.options.parallel).toBe(true);
      expect(runner.options.coverage).toBe(true);
      expect(runner.results).toEqual({});
      expect(runner.totalStats).toBeDefined();
    });

    test('should initialize with custom options', () => {
      const options = {
        suites: ['unit', 'integration'],
        parallel: false,
        coverage: false,
        verbose: true
      };
      
      const runner = new TestRunner(options);
      
      expect(runner.options.suites).toEqual(['unit', 'integration']);
      expect(runner.options.parallel).toBe(false);
      expect(runner.options.coverage).toBe(false);
      expect(runner.options.verbose).toBe(true);
    });

    test('should collect system information', () => {
      const runner = new TestRunner();
      
      expect(runner.systemInfo).toBeDefined();
      expect(runner.systemInfo.timestamp).toBeDefined();
      expect(runner.systemInfo.nodeVersion).toBe(process.version);
      expect(runner.systemInfo.platform).toBe(process.platform);
      expect(runner.systemInfo.arch).toBe(process.arch);
      expect(runner.systemInfo.cpus).toBeGreaterThan(0);
      expect(runner.systemInfo.memory).toBeDefined();
      expect(runner.systemInfo.environment).toBeDefined();
    });

    test('should validate test suite configuration', () => {
      Object.entries(TEST_SUITES).forEach(([key, config]) => {
        expect(config).toBeDefined();
        expect(config.name).toBeDefined();
        expect(config.pattern).toBeDefined();
        expect(config.description).toBeDefined();
        expect(typeof config.timeout).toBe('number');
        expect(typeof config.parallel).toBe('boolean');
        expect(typeof config.coverage).toBe('boolean');
        expect(typeof config.order).toBe('number');
      });
    });

    test('should process coverage data correctly', () => {
      const runner = new TestRunner();
      
      const mockCoverageMap = {
        'file1.js': {
          s: { '1': 1, '2': 0, '3': 1 }, // statements
          b: { '1': [1, 0], '2': [1, 1] }, // branches  
          f: { '1': 1, '2': 0 } // functions
        }
      };
      
      const processed = runner.processCoverage(mockCoverageMap);
      
      expect(processed).toBeDefined();
      expect(processed.statements.total).toBe(3);
      expect(processed.statements.covered).toBe(2);
      expect(processed.statements.percentage).toBeCloseTo(66.67, 1);
      
      expect(processed.branches.total).toBe(4);
      expect(processed.branches.covered).toBe(3);
      expect(processed.branches.percentage).toBe(75);
      
      expect(processed.functions.total).toBe(2);
      expect(processed.functions.covered).toBe(1);
      expect(processed.functions.percentage).toBe(50);
    });

    test('should update total statistics correctly', () => {
      const runner = new TestRunner();
      
      const mockStats1 = { passed: 5, failed: 1, skipped: 2, total: 8 };
      const mockStats2 = { passed: 3, failed: 0, skipped: 1, total: 4 };
      
      runner.updateTotalStats(mockStats1);
      runner.updateTotalStats(mockStats2);
      
      expect(runner.totalStats.passed).toBe(8);
      expect(runner.totalStats.failed).toBe(1);
      expect(runner.totalStats.skipped).toBe(3);
      expect(runner.totalStats.total).toBe(12);
    });

    test('should check coverage thresholds correctly', () => {
      const runner = new TestRunner();
      runner.totalStats.coverage = {
        statements: { percentage: 85 },
        branches: { percentage: 70 }, // Below threshold
        functions: { percentage: 85 },
        lines: { percentage: 85 }
      };
      
      const thresholdCheck = runner.checkCoverageThresholds();
      
      expect(thresholdCheck.passed).toBe(false);
      expect(thresholdCheck.violations).toHaveLength(1);
      expect(thresholdCheck.violations[0].metric).toBe('branches');
      expect(thresholdCheck.violations[0].current).toBe('70.0');
      expect(thresholdCheck.violations[0].threshold).toBe(75);
    });
  });

  describe('TestSummaryGenerator', () => {
    test('should initialize with default options', () => {
      const generator = new TestSummaryGenerator();
      
      expect(generator.options).toBeDefined();
      expect(generator.options.format).toBe('html');
      expect(generator.options.includeCharts).toBe(true);
      expect(generator.options.includeHistory).toBe(true);
      expect(generator.options.includeDetails).toBe(true);
      expect(generator.options.theme).toBe('modern');
    });

    test('should initialize with custom options', () => {
      const options = {
        format: 'markdown',
        includeCharts: false,
        includeHistory: false,
        theme: 'dark'
      };
      
      const generator = new TestSummaryGenerator(options);
      
      expect(generator.options.format).toBe('markdown');
      expect(generator.options.includeCharts).toBe(false);
      expect(generator.options.includeHistory).toBe(false);
      expect(generator.options.theme).toBe('dark');
    });

    test('should calculate trend metrics correctly', () => {
      const generator = new TestSummaryGenerator();
      
      const history = [{
        tests: { passed: 10, failed: 2, total: 12 },
        duration: 5000,
        coverage: {
          statements: { percentage: 80 },
          branches: { percentage: 75 },
          functions: { percentage: 85 },
          lines: { percentage: 82 }
        }
      }];
      
      const currentRun = {
        tests: { passed: 12, failed: 1, total: 13 },
        duration: 4500,
        coverage: {
          statements: { percentage: 85 },
          branches: { percentage: 78 },
          functions: { percentage: 88 },
          lines: { percentage: 86 }
        }
      };
      
      const trends = generator.calculateTrendMetrics(history, currentRun);
      
      expect(trends.testCountTrend).toBe(1);
      expect(trends.passRateTrend).toBeCloseTo(8.97, 1); // Improvement in pass rate
      expect(trends.durationTrend).toBe(-500); // Faster execution
      expect(trends.coverageTrend).toBeCloseTo(3.75, 1); // Better coverage
    });

    test('should calculate stability metrics correctly', () => {
      const generator = new TestSummaryGenerator();
      
      // Mock history with varying pass rates
      const history = [];
      for (let i = 0; i < 10; i++) {
        history.push({
          tests: { passed: 8 + Math.floor(Math.random() * 4), failed: Math.floor(Math.random() * 2), total: 10 },
          duration: 4000 + Math.floor(Math.random() * 1000),
          results: {
            unit: { success: Math.random() > 0.1 },
            integration: { success: Math.random() > 0.2 }
          }
        });
      }
      
      const stability = generator.calculateStabilityMetrics(history);
      
      expect(stability.averagePassRate).toBeGreaterThan(0);
      expect(stability.averagePassRate).toBeLessThanOrEqual(100);
      expect(stability.passRateStability).toBeGreaterThanOrEqual(0);
      expect(stability.passRateStability).toBeLessThanOrEqual(100);
      expect(stability.averageDuration).toBeGreaterThan(0);
      expect(stability.durationStability).toBeGreaterThanOrEqual(0);
      expect(Array.isArray(stability.flakySuites)).toBe(true);
    });

    test('should generate chart data correctly', () => {
      const generator = new TestSummaryGenerator();
      
      const history = [
        { tests: { passed: 8, total: 10 }, duration: 4000 },
        { tests: { passed: 9, total: 10 }, duration: 3800 }
      ];
      
      const currentRun = {
        tests: { passed: 10, total: 10 },
        duration: 3500,
        coverage: {
          statements: { percentage: 85 },
          branches: { percentage: 78 },
          functions: { percentage: 88 },
          lines: { percentage: 86 }
        },
        results: {
          unit: { stats: { total: 5 } },
          integration: { stats: { total: 3 } },
          e2e: { stats: { total: 2 } }
        }
      };
      
      const charts = generator.generateChartData(history, currentRun);
      
      expect(charts.passRateChart).toBeDefined();
      expect(charts.passRateChart.labels).toHaveLength(3);
      expect(charts.passRateChart.datasets[0].data).toEqual([80, 90, 100]);
      
      expect(charts.durationChart).toBeDefined();
      expect(charts.durationChart.labels).toHaveLength(3);
      expect(charts.durationChart.datasets[0].data).toEqual([4000, 3800, 3500]);
      
      expect(charts.coverageChart).toBeDefined();
      expect(charts.coverageChart.labels).toEqual(['Statements', 'Branches', 'Functions', 'Lines']);
      expect(charts.coverageChart.datasets[0].data).toEqual([85, 78, 88, 86]);
      
      expect(charts.testDistributionChart).toBeDefined();
      expect(charts.testDistributionChart.labels).toEqual(['unit', 'integration', 'e2e']);
      expect(charts.testDistributionChart.datasets[0].data).toEqual([5, 3, 2]);
    });
  });

  describe('Integration', () => {
    test('configuration constants should be valid', () => {
      expect(CONFIG).toBeDefined();
      expect(CONFIG.outputDir).toBeDefined();
      expect(CONFIG.historyFile).toBeDefined();
      expect(CONFIG.coverageThresholds).toBeDefined();
      expect(typeof CONFIG.maxRetries).toBe('number');
      expect(typeof CONFIG.retryDelay).toBe('number');
      
      // Validate coverage thresholds
      Object.entries(CONFIG.coverageThresholds).forEach(([metric, threshold]) => {
        expect(typeof threshold).toBe('number');
        expect(threshold).toBeGreaterThan(0);
        expect(threshold).toBeLessThanOrEqual(100);
      });
    });

    test('test suites should be properly ordered', () => {
      const suites = Object.entries(TEST_SUITES);
      const sortedSuites = suites.sort((a, b) => a[1].order - b[1].order);
      
      expect(sortedSuites[0][0]).toBe('unit');
      expect(sortedSuites[1][0]).toBe('integration');
      expect(sortedSuites[2][0]).toBe('e2e');
      expect(sortedSuites[3][0]).toBe('benchmarks');
    });

    test('file paths should be properly constructed', () => {
      const runner = new TestRunner();
      
      expect(CONFIG.outputDir).toContain('test-results');
      expect(CONFIG.historyFile).toContain('test-history.json');
      
      // Test patterns should be valid
      Object.values(TEST_SUITES).forEach(config => {
        expect(config.pattern).toContain('tests/');
        expect(config.pattern).toContain('**/*');
      });
    });
  });
});