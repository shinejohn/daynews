#!/usr/bin/env node
/**
 * Comprehensive Test Runner Script
 * 
 * Features:
 * - Runs all test suites in order (unit → integration → e2e → benchmarks)
 * - Provides comprehensive summary reports
 * - Handles failures gracefully with detailed error information
 * - Generates coverage reports with thresholds
 * - Can run specific test categories with filtering options
 * - Parallel test execution when appropriate
 * - Performance metrics and timing data
 * - CI/CD integration support
 * - Historical test data tracking
 */

import { spawn, exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs/promises';
import { performance } from 'perf_hooks';
import { fileURLToPath } from 'url';

const execAsync = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.join(__dirname, '..');

// Test suite configuration
const TEST_SUITES = {
  unit: {
    name: 'Unit Tests',
    pattern: 'tests/unit/**/*.test.js',
    description: 'Fast, isolated tests for individual components and functions',
    timeout: 30000,
    parallel: true,
    coverage: true,
    order: 1
  },
  integration: {
    name: 'Integration Tests',
    pattern: 'tests/integration/**/*.test.js',
    description: 'Tests for component interactions and system integration',
    timeout: 60000,
    parallel: false,
    coverage: true,
    order: 2
  },
  e2e: {
    name: 'End-to-End Tests',
    pattern: 'tests/e2e/**/*.test.js',
    description: 'Full system tests simulating user interactions',
    timeout: 120000,
    parallel: false,
    coverage: false,
    order: 3
  },
  benchmarks: {
    name: 'Performance Benchmarks',
    pattern: 'tests/benchmarks/**/*.bench.js',
    description: 'Performance and load testing benchmarks',
    timeout: 300000,
    parallel: false,
    coverage: false,
    order: 4,
    runner: 'benchmark'
  }
};

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m'
};

// Configuration constants
const CONFIG = {
  outputDir: path.join(projectRoot, 'test-results'),
  historyFile: path.join(projectRoot, 'test-results', 'test-history.json'),
  coverageThresholds: {
    statements: 80,
    branches: 75,
    functions: 80,
    lines: 80
  },
  maxRetries: 2,
  retryDelay: 1000
};

function colorize(text, color) {
  return `${colors[color]}${text}${colors.reset}`;
}

function formatTime(milliseconds) {
  if (milliseconds < 1000) return `${Math.round(milliseconds)}ms`;
  if (milliseconds < 60000) return `${(milliseconds / 1000).toFixed(2)}s`;
  return `${(milliseconds / 60000).toFixed(2)}m`;
}

class TestRunner {
  constructor(options = {}) {
    this.options = {
      suites: options.suites || Object.keys(TEST_SUITES),
      parallel: options.parallel !== false,
      coverage: options.coverage !== false,
      verbose: options.verbose || false,
      failFast: options.failFast || false,
      retry: options.retry !== false,
      generateReport: options.generateReport !== false,
      saveHistory: options.saveHistory !== false,
      ...options
    };
    
    this.results = {};
    this.startTime = Date.now();
    this.systemInfo = null;
    this.totalStats = {
      passed: 0,
      failed: 0,
      skipped: 0,
      total: 0,
      duration: 0,
      coverage: null
    };
  }

  async collectSystemInfo() {
    const os = await import('os');
    return {
      timestamp: new Date().toISOString(),
      nodeVersion: process.version,
      platform: process.platform,
      arch: process.arch,
      cpus: os.cpus().length,
      memory: {
        total: os.totalmem(),
        free: os.freemem(),
        process: process.memoryUsage()
      },
      environment: {
        NODE_ENV: process.env.NODE_ENV || 'test',
        CI: process.env.CI || false,
        buildId: process.env.BUILD_ID || null
      }
    };
  }

  async setupOutputDirectory() {
    try {
      await fs.mkdir(CONFIG.outputDir, { recursive: true });
      console.log(colorize(`📁 Test results will be saved to: ${CONFIG.outputDir}`, 'dim'));
    } catch (error) {
      console.warn(colorize(`⚠️  Failed to create output directory: ${error.message}`, 'yellow'));
    }
  }

  printHeader() {
    console.log('\n' + '='.repeat(80));
    console.log(colorize('🧪 COMPREHENSIVE TEST SUITE RUNNER', 'cyan'));
    console.log('='.repeat(80));
    console.log(colorize(`System: ${this.systemInfo.platform} ${this.systemInfo.arch}`, 'dim'));
    console.log(colorize(`Node.js: ${this.systemInfo.nodeVersion}`, 'dim'));
    console.log(colorize(`Suites: ${this.options.suites.join(', ')}`, 'dim'));
    console.log(colorize(`Started: ${new Date().toLocaleString()}`, 'dim'));
    console.log();
  }

  printUsage() {
    console.log(colorize('Usage:', 'bright'));
    console.log('  npm test [-- options]');
    console.log('  node tests/run-all-tests.js [options]');
    console.log();
    console.log(colorize('Options:', 'bright'));
    console.log('  --suites <list>      Comma-separated test suites to run (unit,integration,e2e,benchmarks)');
    console.log('  --parallel           Run tests in parallel where possible (default: true)');
    console.log('  --no-parallel        Run tests sequentially');
    console.log('  --coverage           Generate coverage reports (default: true)');
    console.log('  --no-coverage        Skip coverage generation');
    console.log('  --verbose            Show detailed test output');
    console.log('  --fail-fast          Stop on first test failure');
    console.log('  --no-retry           Disable test retries on failure');
    console.log('  --no-report          Skip generating summary report');
    console.log('  --no-history         Skip saving test history');
    console.log('  --help               Show this help message');
    console.log();
    console.log(colorize('Examples:', 'bright'));
    console.log('  npm test                                    # Run all test suites');
    console.log('  npm test -- --suites unit,integration      # Run specific suites');
    console.log('  npm test -- --verbose --coverage           # Verbose output with coverage');
    console.log('  npm test -- --fail-fast                    # Stop on first failure');
    console.log();
    console.log(colorize('Available Test Suites:', 'bright'));
    Object.entries(TEST_SUITES).forEach(([key, config]) => {
      console.log(`  ${colorize(key.padEnd(12), 'yellow')} ${config.description}`);
    });
  }

  async runJestSuite(suiteKey, config) {
    const startTime = performance.now();
    console.log(colorize(`\n🔍 Running ${config.name}...`, 'blue'));
    console.log(colorize(`   Pattern: ${config.pattern}`, 'dim'));

    const jestArgs = [
      '--testPathPattern', config.pattern,
      '--testTimeout', config.timeout.toString(),
      '--detectOpenHandles',
      '--forceExit',
      '--json'
    ];

    if (this.options.coverage && config.coverage) {
      jestArgs.push('--coverage');
    }

    if (this.options.verbose) {
      jestArgs.push('--verbose');
    }

    if (config.parallel && this.options.parallel) {
      jestArgs.push('--maxWorkers=4');
    } else {
      jestArgs.push('--runInBand');
    }

    return new Promise((resolve, reject) => {
      const jest = spawn('npx', ['jest', ...jestArgs], {
        cwd: projectRoot,
        stdio: ['ignore', 'pipe', 'pipe'],
        env: {
          ...process.env,
          NODE_ENV: 'test',
          NODE_OPTIONS: '--experimental-vm-modules',
          FORCE_COLOR: '0' // Disable colors for JSON parsing
        }
      });

      let stdout = '';
      let stderr = '';

      jest.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      jest.stderr.on('data', (data) => {
        stderr += data.toString();
        if (this.options.verbose) {
          process.stderr.write(data);
        }
      });

      jest.on('close', (code) => {
        const duration = performance.now() - startTime;
        
        try {
          // Parse Jest JSON output
          let results;
          try {
            results = JSON.parse(stdout);
          } catch (parseError) {
            // If JSON parsing fails, create a basic result from exit code
            console.log('Could not parse Jest JSON output, creating basic result from exit code');
            results = {
              success: code === 0,
              numPassedTests: code === 0 ? 1 : 0,
              numFailedTests: code === 0 ? 0 : 1,
              numTotalTests: 1,
              numPassedTestSuites: code === 0 ? 1 : 0,
              numFailedTestSuites: code === 0 ? 0 : 1,
              numTotalTestSuites: 1,
              testResults: stderr ? [{ message: stderr }] : []
            };
          }
          
          const suiteResult = {
            suite: suiteKey,
            name: config.name,
            success: code === 0,
            exitCode: code,
            duration,
            stats: {
              passed: results.numPassedTests || 0,
              failed: results.numFailedTests || 0,
              skipped: results.numPendingTests || 0,
              total: results.numTotalTests || 0,
              testSuites: {
                passed: results.numPassedTestSuites || 0,
                failed: results.numFailedTestSuites || 0,
                total: results.numTotalTestSuites || 0
              }
            },
            coverage: results.coverageMap ? this.processCoverage(results.coverageMap) : null,
            errors: [],
            warnings: []
          };

          if (results.testResults) {
            results.testResults.forEach(testFile => {
              if (testFile.message) {
                suiteResult.errors.push({
                  file: testFile.name,
                  message: testFile.message
                });
              }
            });
          }

          if (stderr && !suiteResult.success) {
            suiteResult.errors.push({
              type: 'stderr',
              message: stderr
            });
          }

          this.updateTotalStats(suiteResult.stats);
          resolve(suiteResult);
        } catch (parseError) {
          console.error(colorize(`❌ Failed to parse test results for ${config.name}`, 'red'));
          console.error(colorize(`Parse error: ${parseError.message}`, 'red'));
          if (this.options.verbose) {
            console.log('Raw stdout:', stdout);
            console.log('Raw stderr:', stderr);
          }
          
          reject(new Error(`Failed to parse test results: ${parseError.message}`));
        }
      });

      jest.on('error', (error) => {
        reject(new Error(`Failed to start Jest: ${error.message}`));
      });
    });
  }

  async runBenchmarkSuite(suiteKey, config) {
    const startTime = performance.now();
    console.log(colorize(`\n⚡ Running ${config.name}...`, 'magenta'));

    try {
      const { stdout, stderr } = await execAsync('node tests/benchmarks/run-benchmarks.js --no-verbose', {
        cwd: projectRoot,
        timeout: config.timeout,
        env: {
          ...process.env,
          NODE_ENV: 'test',
          NODE_OPTIONS: '--experimental-vm-modules'
        }
      });

      const duration = performance.now() - startTime;
      
      return {
        suite: suiteKey,
        name: config.name,
        success: true,
        duration,
        output: stdout,
        stats: {
          passed: 1, // Benchmark success
          failed: 0,
          skipped: 0,
          total: 1
        },
        benchmarkData: this.parseBenchmarkOutput(stdout)
      };
    } catch (error) {
      const duration = performance.now() - startTime;
      
      return {
        suite: suiteKey,
        name: config.name,
        success: false,
        duration,
        error: error.message,
        stats: {
          passed: 0,
          failed: 1,
          skipped: 0,
          total: 1
        }
      };
    }
  }

  processCoverage(coverageMap) {
    if (!coverageMap) return null;
    
    const summary = {
      statements: { covered: 0, total: 0, percentage: 0 },
      branches: { covered: 0, total: 0, percentage: 0 },
      functions: { covered: 0, total: 0, percentage: 0 },
      lines: { covered: 0, total: 0, percentage: 0 }
    };

    Object.values(coverageMap).forEach(file => {
      if (file.s) {
        Object.values(file.s).forEach(count => {
          summary.statements.total++;
          if (count > 0) summary.statements.covered++;
        });
      }
      
      if (file.b) {
        Object.values(file.b).forEach(branches => {
          branches.forEach(count => {
            summary.branches.total++;
            if (count > 0) summary.branches.covered++;
          });
        });
      }
      
      if (file.f) {
        Object.values(file.f).forEach(count => {
          summary.functions.total++;
          if (count > 0) summary.functions.covered++;
        });
      }
    });

    // Calculate percentages
    Object.keys(summary).forEach(key => {
      const { covered, total } = summary[key];
      summary[key].percentage = total > 0 ? (covered / total) * 100 : 100;
    });

    return summary;
  }

  parseBenchmarkOutput(output) {
    // Simple benchmark data extraction - can be enhanced based on actual benchmark output format
    const benchmarkData = {
      suites: [],
      metrics: {},
      performance: {}
    };

    // Extract basic metrics from benchmark output
    const lines = output.split('\n');
    lines.forEach(line => {
      if (line.includes('ops/sec')) {
        const match = line.match(/(\d+\.?\d*)\s+ops\/sec/);
        if (match) {
          benchmarkData.metrics.throughput = parseFloat(match[1]);
        }
      }
      if (line.includes('ms avg')) {
        const match = line.match(/(\d+\.?\d*)\s*ms\s+avg/);
        if (match) {
          benchmarkData.metrics.avgTime = parseFloat(match[1]);
        }
      }
    });

    return benchmarkData;
  }

  updateTotalStats(suiteStats) {
    this.totalStats.passed += suiteStats.passed || 0;
    this.totalStats.failed += suiteStats.failed || 0;
    this.totalStats.skipped += suiteStats.skipped || 0;
    this.totalStats.total += suiteStats.total || 0;
  }

  async runSuite(suiteKey, config) {
    let attempt = 0;
    const maxAttempts = this.options.retry ? CONFIG.maxRetries + 1 : 1;

    while (attempt < maxAttempts) {
      try {
        if (attempt > 0) {
          console.log(colorize(`🔄 Retrying ${config.name} (attempt ${attempt + 1}/${maxAttempts})...`, 'yellow'));
          await new Promise(resolve => setTimeout(resolve, CONFIG.retryDelay * attempt));
        }

        let result;
        if (config.runner === 'benchmark') {
          result = await this.runBenchmarkSuite(suiteKey, config);
        } else {
          result = await this.runJestSuite(suiteKey, config);
        }

        if (result.success || !this.options.retry) {
          return result;
        }

        attempt++;
      } catch (error) {
        if (attempt >= maxAttempts - 1) {
          return {
            suite: suiteKey,
            name: config.name,
            success: false,
            error: error.message,
            attempts: attempt + 1,
            stats: { passed: 0, failed: 1, skipped: 0, total: 1 }
          };
        }
        attempt++;
      }
    }
  }

  printSuiteResult(result) {
    const status = result.success ? 
      colorize('✅ PASSED', 'green') : 
      colorize('❌ FAILED', 'red');
    
    const duration = formatTime(result.duration || 0);
    const stats = result.stats || {};
    
    console.log(`\n${status} ${colorize(result.name, 'bright')} (${duration})`);
    
    if (stats.total > 0) {
      const passRate = ((stats.passed / stats.total) * 100).toFixed(1);
      console.log(`   📊 Tests: ${colorize(stats.passed.toString(), 'green')} passed, ${stats.failed > 0 ? colorize(stats.failed.toString(), 'red') : '0'} failed, ${stats.skipped} skipped (${passRate}%)`);
    }
    
    if (result.coverage && this.options.coverage) {
      const coverage = result.coverage;
      const coverageText = `📈 Coverage: ${coverage.statements.percentage.toFixed(1)}% statements, ${coverage.branches.percentage.toFixed(1)}% branches, ${coverage.functions.percentage.toFixed(1)}% functions, ${coverage.lines.percentage.toFixed(1)}% lines`;
      
      const meetsThreshold = Object.entries(CONFIG.coverageThresholds).every(([key, threshold]) => {
        return coverage[key] && coverage[key].percentage >= threshold;
      });
      
      console.log(`   ${meetsThreshold ? colorize(coverageText, 'green') : colorize(coverageText, 'yellow')}`);
    }
    
    if (!result.success && result.errors && result.errors.length > 0) {
      console.log(`   💥 Errors: ${result.errors.length}`);
      if (this.options.verbose) {
        result.errors.forEach(error => {
          console.log(colorize(`      ${error.file || 'Unknown'}: ${error.message}`, 'red'));
        });
      }
    }

    if (result.attempts && result.attempts > 1) {
      console.log(`   🔄 Attempts: ${result.attempts}`);
    }
  }

  checkCoverageThresholds() {
    if (!this.options.coverage || !this.totalStats.coverage) {
      return { passed: true, violations: [] };
    }

    const violations = [];
    const coverage = this.totalStats.coverage;

    Object.entries(CONFIG.coverageThresholds).forEach(([metric, threshold]) => {
      if (coverage[metric] && coverage[metric].percentage < threshold) {
        violations.push({
          metric,
          current: coverage[metric].percentage.toFixed(1),
          threshold,
          covered: coverage[metric].covered,
          total: coverage[metric].total
        });
      }
    });

    return {
      passed: violations.length === 0,
      violations
    };
  }

  generateSummaryReport() {
    const totalDuration = Date.now() - this.startTime;
    const successfulSuites = Object.values(this.results).filter(r => r.success).length;
    const totalSuites = Object.keys(this.results).length;
    
    const coverageCheck = this.checkCoverageThresholds();
    
    const report = {
      summary: {
        timestamp: new Date().toISOString(),
        duration: totalDuration,
        systemInfo: this.systemInfo,
        options: this.options,
        overall: {
          success: this.totalStats.failed === 0 && coverageCheck.passed,
          suites: {
            passed: successfulSuites,
            failed: totalSuites - successfulSuites,
            total: totalSuites
          },
          tests: this.totalStats
        },
        coverage: this.totalStats.coverage,
        coverageThresholds: coverageCheck
      },
      results: this.results,
      performance: {
        totalTime: formatTime(totalDuration),
        avgTimePerSuite: formatTime(totalDuration / Math.max(totalSuites, 1)),
        fastestSuite: this.getFastestSuite(),
        slowestSuite: this.getSlowestSuite()
      }
    };

    return report;
  }

  getFastestSuite() {
    const suites = Object.values(this.results);
    if (suites.length === 0) return null;
    
    return suites.reduce((fastest, current) => {
      return (!fastest || (current.duration && current.duration < fastest.duration)) ? current : fastest;
    });
  }

  getSlowestSuite() {
    const suites = Object.values(this.results);
    if (suites.length === 0) return null;
    
    return suites.reduce((slowest, current) => {
      return (!slowest || (current.duration && current.duration > slowest.duration)) ? current : slowest;
    });
  }

  async saveTestHistory(report) {
    if (!this.options.saveHistory) return;

    try {
      let history = { runs: [] };
      
      try {
        const historyData = await fs.readFile(CONFIG.historyFile, 'utf-8');
        history = JSON.parse(historyData);
      } catch (error) {
        // File doesn't exist or is invalid, start fresh
      }

      history.runs = history.runs || [];
      history.runs.push(report.summary);
      
      // Keep only last 50 runs to prevent file bloat
      if (history.runs.length > 50) {
        history.runs = history.runs.slice(-50);
      }
      
      await fs.writeFile(CONFIG.historyFile, JSON.stringify(history, null, 2));
      console.log(colorize(`📊 Test history saved to: ${CONFIG.historyFile}`, 'dim'));
    } catch (error) {
      console.warn(colorize(`⚠️  Failed to save test history: ${error.message}`, 'yellow'));
    }
  }

  async saveReport(report) {
    if (!this.options.generateReport) return;

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const reportFile = path.join(CONFIG.outputDir, `test-report-${timestamp}.json`);
    
    try {
      await fs.writeFile(reportFile, JSON.stringify(report, null, 2));
      console.log(colorize(`📋 Detailed report saved to: ${reportFile}`, 'dim'));
    } catch (error) {
      console.warn(colorize(`⚠️  Failed to save report: ${error.message}`, 'yellow'));
    }
  }

  printFinalSummary(report) {
    console.log('\n' + '='.repeat(80));
    console.log(colorize('📊 FINAL TEST SUMMARY', 'bright'));
    console.log('='.repeat(80));
    
    const { overall, coverage, coverageThresholds } = report.summary;
    const { performance } = report;
    
    // Overall status
    const statusIcon = overall.success ? '✅' : '❌';
    const statusColor = overall.success ? 'green' : 'red';
    const statusText = overall.success ? 'ALL TESTS PASSED' : 'TESTS FAILED';
    console.log(`${statusIcon} ${colorize(statusText, statusColor)}`);
    
    // Execution summary
    console.log(`\n🕒 Execution Time: ${performance.totalTime}`);
    console.log(`📦 Test Suites: ${colorize(overall.suites.passed.toString(), 'green')} passed, ${overall.suites.failed > 0 ? colorize(overall.suites.failed.toString(), 'red') : '0'} failed, ${overall.suites.total} total`);
    console.log(`🧪 Tests: ${colorize(overall.tests.passed.toString(), 'green')} passed, ${overall.tests.failed > 0 ? colorize(overall.tests.failed.toString(), 'red') : '0'} failed, ${overall.tests.skipped} skipped, ${overall.tests.total} total`);
    
    // Coverage summary
    if (coverage && this.options.coverage) {
      console.log('\n📈 Coverage Summary:');
      Object.entries(coverage).forEach(([metric, data]) => {
        const percentage = data.percentage.toFixed(1);
        const threshold = CONFIG.coverageThresholds[metric];
        const meetsThreshold = data.percentage >= threshold;
        const color = meetsThreshold ? 'green' : 'red';
        
        console.log(`   ${metric.padEnd(12)}: ${colorize(`${percentage}%`, color)} (${data.covered}/${data.total}) [threshold: ${threshold}%]`);
      });
      
      if (!coverageThresholds.passed) {
        console.log(colorize('\n⚠️  Coverage thresholds not met:', 'yellow'));
        coverageThresholds.violations.forEach(violation => {
          console.log(colorize(`   ${violation.metric}: ${violation.current}% < ${violation.threshold}%`, 'red'));
        });
      }
    }
    
    // Performance insights
    if (performance.fastestSuite && performance.slowestSuite) {
      console.log('\n⚡ Performance:');
      console.log(`   Fastest Suite: ${performance.fastestSuite.name} (${formatTime(performance.fastestSuite.duration)})`);
      console.log(`   Slowest Suite: ${performance.slowestSuite.name} (${formatTime(performance.slowestSuite.duration)})`);
    }
    
    // Error summary
    const failedSuites = Object.values(this.results).filter(r => !r.success);
    if (failedSuites.length > 0) {
      console.log(colorize('\n💥 Failed Suites:', 'red'));
      failedSuites.forEach(suite => {
        console.log(`   ${suite.name}: ${suite.error || 'Unknown error'}`);
      });
    }
    
    console.log('\n' + '='.repeat(80));
    console.log(colorize(`Test run completed at ${new Date().toLocaleString()}`, 'dim'));
  }

  async run() {
    this.systemInfo = await this.collectSystemInfo();
    this.printHeader();
    await this.setupOutputDirectory();
    
    // Validate and filter test suites
    const validSuites = this.options.suites.filter(suite => {
      if (!TEST_SUITES[suite]) {
        console.warn(colorize(`⚠️  Unknown test suite: ${suite}`, 'yellow'));
        return false;
      }
      return true;
    });

    if (validSuites.length === 0) {
      console.error(colorize('❌ No valid test suites specified', 'red'));
      return false;
    }

    // Sort suites by execution order
    const suitesToRun = validSuites
      .map(key => ({ key, config: TEST_SUITES[key] }))
      .sort((a, b) => a.config.order - b.config.order);

    console.log(colorize(`🚀 Running ${suitesToRun.length} test suite(s): ${suitesToRun.map(s => s.key).join(', ')}`, 'blue'));

    // Run each test suite
    for (const { key, config } of suitesToRun) {
      const result = await this.runSuite(key, config);
      this.results[key] = result;
      this.printSuiteResult(result);
      
      if (!result.success && this.options.failFast) {
        console.log(colorize('\n🛑 Stopping execution due to --fail-fast option', 'yellow'));
        break;
      }
    }

    // Generate and save reports
    const report = this.generateSummaryReport();
    await this.saveReport(report);
    await this.saveTestHistory(report);
    
    // Print final summary
    this.printFinalSummary(report);
    
    return report.summary.overall.success;
  }
}

// CLI argument parsing
function parseCliArgs() {
  const args = process.argv.slice(2);
  const options = {
    suites: Object.keys(TEST_SUITES),
    parallel: true,
    coverage: true,
    verbose: false,
    failFast: false,
    retry: true,
    generateReport: true,
    saveHistory: true
  };

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--suites':
        options.suites = args[++i].split(',').map(s => s.trim());
        break;
      case '--parallel':
        options.parallel = true;
        break;
      case '--no-parallel':
        options.parallel = false;
        break;
      case '--coverage':
        options.coverage = true;
        break;
      case '--no-coverage':
        options.coverage = false;
        break;
      case '--verbose':
        options.verbose = true;
        break;
      case '--fail-fast':
        options.failFast = true;
        break;
      case '--no-retry':
        options.retry = false;
        break;
      case '--no-report':
        options.generateReport = false;
        break;
      case '--no-history':
        options.saveHistory = false;
        break;
      case '--help':
      case '-h':
        const runner = new TestRunner();
        runner.printUsage();
        process.exit(0);
        break;
    }
  }

  return options;
}

// Export for programmatic usage
export { TestRunner, TEST_SUITES, CONFIG };

// CLI execution
if (import.meta.url === `file://${process.argv[1]}`) {
  const options = parseCliArgs();
  const runner = new TestRunner(options);
  
  runner.run()
    .then((success) => {
      process.exit(success ? 0 : 1);
    })
    .catch((error) => {
      console.error(colorize(`💥 Fatal error: ${error.message}`, 'red'));
      if (runner.options.verbose) {
        console.error(error.stack);
      }
      process.exit(1);
    });
}