#!/usr/bin/env node
/**
 * Test Summary Report Generator
 * 
 * Features:
 * - Generates comprehensive HTML and Markdown reports
 * - Shows total tests run, pass/fail counts
 * - Performance metrics and timing analysis
 * - Coverage statistics with visualizations
 * - Historical trend analysis
 * - Test stability metrics
 * - CI/CD integration reports
 * - Interactive charts and graphs
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.join(__dirname, '..');

// Report configuration
const REPORT_CONFIG = {
  outputDir: path.join(projectRoot, 'test-results'),
  templatesDir: path.join(__dirname, 'templates'),
  historyFile: path.join(projectRoot, 'test-results', 'test-history.json'),
  maxHistoryEntries: 30,
  charts: {
    enabled: true,
    library: 'chart.js' // Could be extended to support other libraries
  }
};

class TestSummaryGenerator {
  constructor(options = {}) {
    this.options = {
      format: options.format || 'html', // 'html', 'markdown', 'json', 'all'
      includeCharts: options.includeCharts !== false,
      includeHistory: options.includeHistory !== false,
      includeDetails: options.includeDetails !== false,
      theme: options.theme || 'modern', // 'modern', 'classic', 'dark'
      ...options
    };
  }

  async loadTestHistory() {
    try {
      const historyData = await fs.readFile(REPORT_CONFIG.historyFile, 'utf-8');
      const history = JSON.parse(historyData);
      return history.runs || [];
    } catch (error) {
      console.warn('No test history found, generating report from current run only');
      return [];
    }
  }

  async loadLatestReport() {
    const reportFiles = await fs.readdir(REPORT_CONFIG.outputDir);
    const testReports = reportFiles
      .filter(file => file.startsWith('test-report-') && file.endsWith('.json'))
      .sort()
      .reverse();

    if (testReports.length === 0) {
      throw new Error('No test reports found. Please run tests first.');
    }

    const latestReportFile = path.join(REPORT_CONFIG.outputDir, testReports[0]);
    const reportData = await fs.readFile(latestReportFile, 'utf-8');
    return JSON.parse(reportData);
  }

  calculateTrendMetrics(history, currentRun) {
    if (history.length === 0) {
      return {
        testCountTrend: 0,
        passRateTrend: 0,
        durationTrend: 0,
        coverageTrend: 0
      };
    }

    const previousRun = history[history.length - 1];
    
    const testCountTrend = currentRun.tests.total - previousRun.tests.total;
    const currentPassRate = (currentRun.tests.passed / currentRun.tests.total) * 100;
    const previousPassRate = (previousRun.tests.passed / previousRun.tests.total) * 100;
    const passRateTrend = currentPassRate - previousPassRate;
    
    const durationTrend = currentRun.duration - previousRun.duration;
    
    let coverageTrend = 0;
    if (currentRun.coverage && previousRun.coverage) {
      const currentAvgCoverage = Object.values(currentRun.coverage)
        .reduce((acc, metric) => acc + metric.percentage, 0) / 4;
      const previousAvgCoverage = Object.values(previousRun.coverage)
        .reduce((acc, metric) => acc + metric.percentage, 0) / 4;
      coverageTrend = currentAvgCoverage - previousAvgCoverage;
    }

    return {
      testCountTrend: Math.round(testCountTrend),
      passRateTrend: Math.round(passRateTrend * 100) / 100,
      durationTrend: Math.round(durationTrend),
      coverageTrend: Math.round(coverageTrend * 100) / 100
    };
  }

  calculateStabilityMetrics(history) {
    if (history.length < 5) {
      return {
        averagePassRate: 0,
        passRateStability: 0,
        averageDuration: 0,
        durationStability: 0,
        flakySuites: []
      };
    }

    const recentRuns = history.slice(-10); // Last 10 runs
    
    // Calculate pass rate stability
    const passRates = recentRuns.map(run => (run.tests.passed / run.tests.total) * 100);
    const averagePassRate = passRates.reduce((acc, rate) => acc + rate, 0) / passRates.length;
    const passRateVariance = passRates.reduce((acc, rate) => acc + Math.pow(rate - averagePassRate, 2), 0) / passRates.length;
    const passRateStability = 100 - Math.sqrt(passRateVariance); // Higher is more stable
    
    // Calculate duration stability
    const durations = recentRuns.map(run => run.duration);
    const averageDuration = durations.reduce((acc, dur) => acc + dur, 0) / durations.length;
    const durationVariance = durations.reduce((acc, dur) => acc + Math.pow(dur - averageDuration, 2), 0) / durations.length;
    const durationStability = 100 - (Math.sqrt(durationVariance) / averageDuration) * 100;
    
    // Identify flaky suites (suites that fail inconsistently)
    const suiteStats = {};
    recentRuns.forEach(run => {
      if (run.results) {
        Object.entries(run.results).forEach(([suite, result]) => {
          if (!suiteStats[suite]) {
            suiteStats[suite] = { runs: 0, failures: 0 };
          }
          suiteStats[suite].runs++;
          if (!result.success) {
            suiteStats[suite].failures++;
          }
        });
      }
    });
    
    const flakySuites = Object.entries(suiteStats)
      .filter(([suite, stats]) => {
        const failureRate = stats.failures / stats.runs;
        return failureRate > 0.1 && failureRate < 0.9; // Between 10% and 90% failure rate
      })
      .map(([suite, stats]) => ({
        suite,
        failureRate: Math.round((stats.failures / stats.runs) * 100),
        runs: stats.runs,
        failures: stats.failures
      }));

    return {
      averagePassRate: Math.round(averagePassRate * 100) / 100,
      passRateStability: Math.max(0, Math.round(passRateStability * 100) / 100),
      averageDuration: Math.round(averageDuration),
      durationStability: Math.max(0, Math.round(durationStability * 100) / 100),
      flakySuites
    };
  }

  generateChartData(history, currentRun) {
    const allRuns = [...history, currentRun].slice(-20); // Last 20 runs
    
    return {
      passRateChart: {
        labels: allRuns.map((run, index) => `Run ${index + 1}`),
        datasets: [{
          label: 'Pass Rate (%)',
          data: allRuns.map(run => (run.tests.passed / run.tests.total) * 100),
          borderColor: '#28a745',
          backgroundColor: 'rgba(40, 167, 69, 0.1)',
          tension: 0.4
        }]
      },
      durationChart: {
        labels: allRuns.map((run, index) => `Run ${index + 1}`),
        datasets: [{
          label: 'Duration (ms)',
          data: allRuns.map(run => run.duration),
          borderColor: '#007bff',
          backgroundColor: 'rgba(0, 123, 255, 0.1)',
          tension: 0.4
        }]
      },
      coverageChart: {
        labels: ['Statements', 'Branches', 'Functions', 'Lines'],
        datasets: [{
          label: 'Coverage (%)',
          data: currentRun.coverage ? [
            currentRun.coverage.statements.percentage,
            currentRun.coverage.branches.percentage,
            currentRun.coverage.functions.percentage,
            currentRun.coverage.lines.percentage
          ] : [0, 0, 0, 0],
          backgroundColor: [
            'rgba(255, 99, 132, 0.5)',
            'rgba(54, 162, 235, 0.5)',
            'rgba(255, 205, 86, 0.5)',
            'rgba(75, 192, 192, 0.5)'
          ]
        }]
      },
      testDistributionChart: {
        labels: Object.keys(currentRun.results || {}),
        datasets: [{
          label: 'Tests per Suite',
          data: Object.values(currentRun.results || {}).map(result => result.stats?.total || 0),
          backgroundColor: [
            '#FF6384',
            '#36A2EB',
            '#FFCE56',
            '#4BC0C0',
            '#9966FF',
            '#FF9F40'
          ]
        }]
      }
    };
  }

  generateHTMLReport(data) {
    const { currentRun, history, trends, stability, charts } = data;
    const timestamp = new Date().toLocaleString();
    
    // Calculate summary stats
    const totalTests = currentRun.tests.total;
    const passedTests = currentRun.tests.passed;
    const failedTests = currentRun.tests.failed;
    const skippedTests = currentRun.tests.skipped;
    const passRate = totalTests > 0 ? ((passedTests / totalTests) * 100).toFixed(1) : 0;
    const duration = (currentRun.duration / 1000).toFixed(2);
    
    // Coverage stats
    const coverage = currentRun.coverage || {};
    const avgCoverage = coverage.statements ? 
      ((coverage.statements.percentage + coverage.branches.percentage + 
        coverage.functions.percentage + coverage.lines.percentage) / 4).toFixed(1) : 0;

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Test Summary Report</title>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            color: #333;
        }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
        }
        
        .header {
            text-align: center;
            margin-bottom: 40px;
            color: white;
        }
        
        .header h1 {
            font-size: 2.5rem;
            margin-bottom: 10px;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
        }
        
        .header .subtitle {
            font-size: 1.1rem;
            opacity: 0.9;
        }
        
        .card {
            background: white;
            border-radius: 12px;
            padding: 24px;
            margin-bottom: 20px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.1);
            transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        
        .card:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(0,0,0,0.15);
        }
        
        .grid {
            display: grid;
            gap: 20px;
        }
        
        .grid-2 {
            grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
        }
        
        .grid-4 {
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        }
        
        .stat-card {
            text-align: center;
            padding: 20px;
            border-radius: 8px;
            color: white;
        }
        
        .stat-card.success {
            background: linear-gradient(135deg, #28a745, #20c997);
        }
        
        .stat-card.danger {
            background: linear-gradient(135deg, #dc3545, #fd7e14);
        }
        
        .stat-card.warning {
            background: linear-gradient(135deg, #ffc107, #fd7e14);
        }
        
        .stat-card.info {
            background: linear-gradient(135deg, #17a2b8, #007bff);
        }
        
        .stat-number {
            font-size: 2.5rem;
            font-weight: bold;
            margin-bottom: 8px;
        }
        
        .stat-label {
            font-size: 0.9rem;
            opacity: 0.9;
        }
        
        .trend-indicator {
            display: inline-flex;
            align-items: center;
            margin-left: 8px;
            font-size: 0.8rem;
        }
        
        .trend-up {
            color: #28a745;
        }
        
        .trend-down {
            color: #dc3545;
        }
        
        .trend-neutral {
            color: #6c757d;
        }
        
        .chart-container {
            position: relative;
            height: 400px;
            margin: 20px 0;
        }
        
        .suite-results {
            margin-top: 20px;
        }
        
        .suite-item {
            display: flex;
            justify-content: between;
            align-items: center;
            padding: 12px 16px;
            border-left: 4px solid;
            margin-bottom: 8px;
            border-radius: 4px;
            background: #f8f9fa;
        }
        
        .suite-item.success {
            border-left-color: #28a745;
            background: rgba(40, 167, 69, 0.05);
        }
        
        .suite-item.failure {
            border-left-color: #dc3545;
            background: rgba(220, 53, 69, 0.05);
        }
        
        .suite-name {
            font-weight: 600;
            flex-grow: 1;
        }
        
        .suite-stats {
            display: flex;
            gap: 16px;
            font-size: 0.9rem;
            color: #666;
        }
        
        .coverage-bar {
            height: 20px;
            background: #e9ecef;
            border-radius: 10px;
            overflow: hidden;
            margin: 8px 0;
        }
        
        .coverage-fill {
            height: 100%;
            background: linear-gradient(90deg, #28a745, #20c997);
            transition: width 0.3s ease;
        }
        
        .coverage-text {
            text-align: center;
            font-size: 0.8rem;
            margin-top: 4px;
        }
        
        .flaky-suite {
            background: rgba(255, 193, 7, 0.1);
            border: 1px solid rgba(255, 193, 7, 0.3);
            border-radius: 4px;
            padding: 8px 12px;
            margin: 4px 0;
        }
        
        .timestamp {
            text-align: center;
            color: #666;
            font-size: 0.9rem;
            margin-top: 40px;
        }
        
        @media (max-width: 768px) {
            .container {
                padding: 10px;
            }
            
            .header h1 {
                font-size: 2rem;
            }
            
            .grid-4 {
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            }
            
            .chart-container {
                height: 300px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🧪 Test Summary Report</h1>
            <div class="subtitle">Generated on ${timestamp}</div>
        </div>
        
        <!-- Overview Stats -->
        <div class="grid grid-4">
            <div class="card stat-card ${totalTests === passedTests ? 'success' : (failedTests > 0 ? 'danger' : 'warning')}">
                <div class="stat-number">${totalTests}</div>
                <div class="stat-label">Total Tests
                    ${trends.testCountTrend !== 0 ? 
                      `<span class="trend-indicator ${trends.testCountTrend > 0 ? 'trend-up' : 'trend-down'}">
                        ${trends.testCountTrend > 0 ? '↗' : '↘'} ${Math.abs(trends.testCountTrend)}
                      </span>` : ''}
                </div>
            </div>
            
            <div class="card stat-card success">
                <div class="stat-number">${passRate}%</div>
                <div class="stat-label">Pass Rate
                    ${trends.passRateTrend !== 0 ? 
                      `<span class="trend-indicator ${trends.passRateTrend > 0 ? 'trend-up' : 'trend-down'}">
                        ${trends.passRateTrend > 0 ? '↗' : '↘'} ${Math.abs(trends.passRateTrend)}%
                      </span>` : ''}
                </div>
            </div>
            
            <div class="card stat-card info">
                <div class="stat-number">${duration}s</div>
                <div class="stat-label">Duration
                    ${trends.durationTrend !== 0 ? 
                      `<span class="trend-indicator ${trends.durationTrend < 0 ? 'trend-up' : 'trend-down'}">
                        ${trends.durationTrend < 0 ? '↗' : '↘'} ${Math.abs((trends.durationTrend / 1000).toFixed(1))}s
                      </span>` : ''}
                </div>
            </div>
            
            <div class="card stat-card ${avgCoverage >= 80 ? 'success' : (avgCoverage >= 60 ? 'warning' : 'danger')}">
                <div class="stat-number">${avgCoverage}%</div>
                <div class="stat-label">Avg Coverage
                    ${trends.coverageTrend !== 0 ? 
                      `<span class="trend-indicator ${trends.coverageTrend > 0 ? 'trend-up' : 'trend-down'}">
                        ${trends.coverageTrend > 0 ? '↗' : '↘'} ${Math.abs(trends.coverageTrend)}%
                      </span>` : ''}
                </div>
            </div>
        </div>
        
        <!-- Test Results Breakdown -->
        <div class="grid grid-2">
            <div class="card">
                <h3>📊 Test Results Breakdown</h3>
                <div style="margin: 20px 0;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                        <span>Passed: <strong style="color: #28a745">${passedTests}</strong></span>
                        <span>Failed: <strong style="color: #dc3545">${failedTests}</strong></span>
                        <span>Skipped: <strong style="color: #ffc107">${skippedTests}</strong></span>
                    </div>
                    <div class="coverage-bar">
                        <div class="coverage-fill" style="width: ${passRate}%"></div>
                    </div>
                    <div class="coverage-text">${passedTests}/${totalTests} tests passed</div>
                </div>
            </div>
            
            <div class="card">
                <h3>🎯 Coverage Overview</h3>
                ${Object.entries(coverage).map(([metric, data]) => `
                    <div style="margin: 12px 0;">
                        <div style="display: flex; justify-content: space-between;">
                            <span style="text-transform: capitalize;">${metric}:</span>
                            <span><strong>${data.percentage.toFixed(1)}%</strong> (${data.covered}/${data.total})</span>
                        </div>
                        <div class="coverage-bar">
                            <div class="coverage-fill" style="width: ${data.percentage}%"></div>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
        
        <!-- Performance Charts -->
        ${this.options.includeCharts ? `
        <div class="grid grid-2">
            <div class="card">
                <h3>📈 Pass Rate Trend</h3>
                <div class="chart-container">
                    <canvas id="passRateChart"></canvas>
                </div>
            </div>
            
            <div class="card">
                <h3>⏱️ Duration Trend</h3>
                <div class="chart-container">
                    <canvas id="durationChart"></canvas>
                </div>
            </div>
        </div>
        
        <div class="grid grid-2">
            <div class="card">
                <h3>📊 Current Coverage</h3>
                <div class="chart-container">
                    <canvas id="coverageChart"></canvas>
                </div>
            </div>
            
            <div class="card">
                <h3>🧪 Test Distribution</h3>
                <div class="chart-container">
                    <canvas id="testDistributionChart"></canvas>
                </div>
            </div>
        </div>
        ` : ''}
        
        <!-- Suite Results -->
        <div class="card">
            <h3>📦 Test Suite Results</h3>
            <div class="suite-results">
                ${Object.entries(currentRun.results || {}).map(([suite, result]) => `
                    <div class="suite-item ${result.success ? 'success' : 'failure'}">
                        <div class="suite-name">${result.name || suite}</div>
                        <div class="suite-stats">
                            <span>Tests: ${result.stats?.total || 0}</span>
                            <span>Duration: ${((result.duration || 0) / 1000).toFixed(2)}s</span>
                            ${result.stats ? 
                              `<span>Pass Rate: ${((result.stats.passed / result.stats.total) * 100).toFixed(1)}%</span>` : ''}
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
        
        <!-- Stability Metrics -->
        ${stability.flakySuites.length > 0 ? `
        <div class="card">
            <h3>⚠️ Test Stability Issues</h3>
            <p style="margin-bottom: 16px;">The following test suites show inconsistent behavior:</p>
            ${stability.flakySuites.map(suite => `
                <div class="flaky-suite">
                    <strong>${suite.suite}</strong> - ${suite.failureRate}% failure rate 
                    (${suite.failures}/${suite.runs} runs failed)
                </div>
            `).join('')}
        </div>
        ` : ''}
        
        <div class="timestamp">
            Report generated at ${timestamp} | 
            System: ${currentRun.systemInfo?.platform} ${currentRun.systemInfo?.arch} | 
            Node.js: ${currentRun.systemInfo?.nodeVersion}
        </div>
    </div>
    
    ${this.options.includeCharts ? `
    <script>
        // Chart.js configuration
        Chart.defaults.responsive = true;
        Chart.defaults.maintainAspectRatio = false;
        
        // Pass Rate Chart
        new Chart(document.getElementById('passRateChart'), {
            type: 'line',
            data: ${JSON.stringify(charts.passRateChart)},
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    }
                }
            }
        });
        
        // Duration Chart
        new Chart(document.getElementById('durationChart'), {
            type: 'line',
            data: ${JSON.stringify(charts.durationChart)},
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                }
            }
        });
        
        // Coverage Chart
        new Chart(document.getElementById('coverageChart'), {
            type: 'bar',
            data: ${JSON.stringify(charts.coverageChart)},
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100
                    }
                },
                plugins: {
                    legend: {
                        display: false
                    }
                }
            }
        });
        
        // Test Distribution Chart
        new Chart(document.getElementById('testDistributionChart'), {
            type: 'doughnut',
            data: ${JSON.stringify(charts.testDistributionChart)},
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    </script>
    ` : ''}
</body>
</html>`;

    return html;
  }

  generateMarkdownReport(data) {
    const { currentRun, history, trends, stability } = data;
    const timestamp = new Date().toLocaleString();
    
    const totalTests = currentRun.tests.total;
    const passedTests = currentRun.tests.passed;
    const failedTests = currentRun.tests.failed;
    const skippedTests = currentRun.tests.skipped;
    const passRate = totalTests > 0 ? ((passedTests / totalTests) * 100).toFixed(1) : 0;
    const duration = (currentRun.duration / 1000).toFixed(2);
    
    const coverage = currentRun.coverage || {};

    let markdown = `# 🧪 Test Summary Report

Generated on: **${timestamp}**

## 📊 Overview

| Metric | Value | Trend |
|--------|-------|-------|
| **Total Tests** | ${totalTests} | ${trends.testCountTrend > 0 ? '↗️' : trends.testCountTrend < 0 ? '↘️' : '➡️'} ${trends.testCountTrend !== 0 ? Math.abs(trends.testCountTrend) : 'No change'} |
| **Pass Rate** | ${passRate}% | ${trends.passRateTrend > 0 ? '↗️' : trends.passRateTrend < 0 ? '↘️' : '➡️'} ${trends.passRateTrend !== 0 ? Math.abs(trends.passRateTrend) + '%' : 'No change'} |
| **Duration** | ${duration}s | ${trends.durationTrend < 0 ? '↗️ Faster' : trends.durationTrend > 0 ? '↘️ Slower' : '➡️ Same'} ${trends.durationTrend !== 0 ? Math.abs((trends.durationTrend / 1000).toFixed(1)) + 's' : ''} |
| **Avg Coverage** | ${Object.keys(coverage).length > 0 ? ((Object.values(coverage).reduce((acc, metric) => acc + metric.percentage, 0) / Object.keys(coverage).length).toFixed(1)) + '%' : 'N/A'} | ${trends.coverageTrend > 0 ? '↗️' : trends.coverageTrend < 0 ? '↘️' : '➡️'} ${trends.coverageTrend !== 0 ? Math.abs(trends.coverageTrend) + '%' : 'No change'} |

## 🎯 Test Results

- **✅ Passed:** ${passedTests}
- **❌ Failed:** ${failedTests}
- **⏭️ Skipped:** ${skippedTests}
- **📈 Success Rate:** ${passRate}%

## 📋 Coverage Details

${Object.entries(coverage).map(([metric, data]) => 
  `- **${metric.charAt(0).toUpperCase() + metric.slice(1)}:** ${data.percentage.toFixed(1)}% (${data.covered}/${data.total})`
).join('\n')}

## 📦 Suite Results

${Object.entries(currentRun.results || {}).map(([suite, result]) => {
  const status = result.success ? '✅' : '❌';
  const suitePassRate = result.stats ? ((result.stats.passed / result.stats.total) * 100).toFixed(1) : 'N/A';
  const suiteDuration = ((result.duration || 0) / 1000).toFixed(2);
  
  return `### ${status} ${result.name || suite}

- **Tests:** ${result.stats?.total || 0}
- **Pass Rate:** ${suitePassRate}%
- **Duration:** ${suiteDuration}s
${result.error ? `- **Error:** ${result.error}` : ''}`;
}).join('\n\n')}

## 📈 Historical Performance

${history.length > 0 ? `
**Recent Performance (Last ${Math.min(history.length, 10)} Runs):**

- **Average Pass Rate:** ${stability.averagePassRate}%
- **Pass Rate Stability:** ${stability.passRateStability}% (higher is better)
- **Average Duration:** ${(stability.averageDuration / 1000).toFixed(2)}s
- **Duration Stability:** ${stability.durationStability}% (higher is better)
` : 'No historical data available.'}

${stability.flakySuites.length > 0 ? `
## ⚠️ Test Stability Issues

The following test suites show inconsistent behavior:

${stability.flakySuites.map(suite => 
  `- **${suite.suite}:** ${suite.failureRate}% failure rate (${suite.failures}/${suite.runs} runs failed)`
).join('\n')}
` : ''}

## 🖥️ System Information

- **Platform:** ${currentRun.systemInfo?.platform} ${currentRun.systemInfo?.arch}
- **Node.js:** ${currentRun.systemInfo?.nodeVersion}
- **Environment:** ${currentRun.systemInfo?.environment?.NODE_ENV}
- **CI:** ${currentRun.systemInfo?.environment?.CI ? 'Yes' : 'No'}

---

*Report generated by Test Summary Generator at ${timestamp}*
`;

    return markdown;
  }

  async generateReport(reportPath = null) {
    try {
      console.log('🔍 Loading test data...');
      
      // Load current test report and history
      const currentReport = reportPath ? 
        JSON.parse(await fs.readFile(reportPath, 'utf-8')) :
        await this.loadLatestReport();
        
      const history = this.options.includeHistory ? await this.loadTestHistory() : [];
      
      console.log('📊 Calculating metrics...');
      
      // Calculate trends and stability
      const trends = this.calculateTrendMetrics(history, currentReport.summary);
      const stability = this.calculateStabilityMetrics(history);
      
      // Generate chart data if needed
      const charts = this.options.includeCharts ? 
        this.generateChartData(history, currentReport.summary) : null;
      
      const data = {
        currentRun: currentReport.summary,
        history,
        trends,
        stability,
        charts
      };
      
      console.log('📝 Generating reports...');
      
      // Generate reports in requested formats
      const results = {};
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      
      if (this.options.format === 'html' || this.options.format === 'all') {
        const htmlContent = this.generateHTMLReport(data);
        const htmlPath = path.join(REPORT_CONFIG.outputDir, `test-summary-${timestamp}.html`);
        await fs.writeFile(htmlPath, htmlContent);
        results.html = htmlPath;
        console.log(`✅ HTML report saved: ${htmlPath}`);
      }
      
      if (this.options.format === 'markdown' || this.options.format === 'all') {
        const markdownContent = this.generateMarkdownReport(data);
        const markdownPath = path.join(REPORT_CONFIG.outputDir, `test-summary-${timestamp}.md`);
        await fs.writeFile(markdownPath, markdownContent);
        results.markdown = markdownPath;
        console.log(`✅ Markdown report saved: ${markdownPath}`);
      }
      
      if (this.options.format === 'json' || this.options.format === 'all') {
        const jsonPath = path.join(REPORT_CONFIG.outputDir, `test-summary-${timestamp}.json`);
        await fs.writeFile(jsonPath, JSON.stringify(data, null, 2));
        results.json = jsonPath;
        console.log(`✅ JSON report saved: ${jsonPath}`);
      }
      
      return results;
      
    } catch (error) {
      console.error('❌ Failed to generate report:', error.message);
      throw error;
    }
  }
}

// CLI argument parsing
function parseCliArgs() {
  const args = process.argv.slice(2);
  const options = {
    format: 'html',
    includeCharts: true,
    includeHistory: true,
    includeDetails: true,
    theme: 'modern'
  };

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--format':
        options.format = args[++i];
        break;
      case '--no-charts':
        options.includeCharts = false;
        break;
      case '--no-history':
        options.includeHistory = false;
        break;
      case '--no-details':
        options.includeDetails = false;
        break;
      case '--theme':
        options.theme = args[++i];
        break;
      case '--report':
        options.reportPath = args[++i];
        break;
      case '--help':
        console.log(`
Test Summary Report Generator

Usage: node test-summary-generator.js [options]

Options:
  --format <type>      Report format: html, markdown, json, all (default: html)
  --no-charts          Disable chart generation
  --no-history         Disable historical analysis
  --no-details         Generate compact report
  --theme <name>       UI theme: modern, classic, dark (default: modern)
  --report <path>      Path to specific test report JSON file
  --help               Show this help message

Examples:
  node test-summary-generator.js                          # Generate HTML report
  node test-summary-generator.js --format all             # Generate all formats
  node test-summary-generator.js --format markdown        # Generate markdown only
  node test-summary-generator.js --no-charts --no-history # Minimal report
`);
        process.exit(0);
        break;
    }
  }

  return options;
}

// Export for programmatic usage
export { TestSummaryGenerator, REPORT_CONFIG };

// CLI execution
if (import.meta.url === `file://${process.argv[1]}`) {
  const options = parseCliArgs();
  const generator = new TestSummaryGenerator(options);
  
  generator.generateReport(options.reportPath)
    .then((results) => {
      console.log('\n✅ Report generation completed successfully!');
      console.log('\nGenerated files:');
      Object.entries(results).forEach(([format, path]) => {
        console.log(`  ${format.toUpperCase()}: ${path}`);
      });
    })
    .catch((error) => {
      console.error('❌ Report generation failed:', error.message);
      process.exit(1);
    });
}