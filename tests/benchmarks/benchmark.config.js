/**
 * Benchmark Configuration
 * 
 * Customize benchmark behavior, thresholds, and settings
 */

export const benchmarkConfig = {
  // Performance thresholds for different environments
  thresholds: {
    development: {
      cache: {
        avgWriteTime: 100,    // ms - more lenient for dev
        avgReadTime: 20,      // ms
        hitRatio: 0.8,        // 80%
        throughput: 500       // ops/sec
      },
      rendering: {
        simpleComponentTime: 10,   // ms
        complexComponentTime: 200, // ms
        homepageRenderTime: 1000,  // ms
        throughput: 25            // renders/sec
      },
      dataLayer: {
        simpleQueryTime: 200,     // ms
        filteredQueryTime: 400,   // ms
        paginationTime: 300,      // ms per page
        throughput: 50            // queries/sec
      }
    },
    
    production: {
      cache: {
        avgWriteTime: 50,     // ms - stricter for prod
        avgReadTime: 10,      // ms
        hitRatio: 0.95,       // 95%
        throughput: 2000      // ops/sec
      },
      rendering: {
        simpleComponentTime: 5,    // ms
        complexComponentTime: 100, // ms
        homepageRenderTime: 500,   // ms
        throughput: 100           // renders/sec
      },
      dataLayer: {
        simpleQueryTime: 100,     // ms
        filteredQueryTime: 200,   // ms
        paginationTime: 150,      // ms per page
        throughput: 200           // queries/sec
      }
    },
    
    ci: {
      cache: {
        avgWriteTime: 75,     // ms - reasonable for CI
        avgReadTime: 15,      // ms
        hitRatio: 0.85,       // 85%
        throughput: 750       // ops/sec
      },
      rendering: {
        simpleComponentTime: 8,    // ms
        complexComponentTime: 150, // ms
        homepageRenderTime: 750,   // ms
        throughput: 40            // renders/sec
      },
      dataLayer: {
        simpleQueryTime: 150,     // ms
        filteredQueryTime: 300,   // ms
        paginationTime: 200,      // ms per page
        throughput: 75            // queries/sec
      }
    }
  },

  // Test data sizes for different benchmark types
  dataSizes: {
    cache: {
      small: [1, 5, 10],        // KB
      medium: [1, 10, 100],     // KB
      large: [1, 10, 100, 1000] // KB
    },
    rendering: {
      itemCounts: [10, 50, 100, 500],
      depthLevels: [5, 10, 15, 20],
      concurrencyLevels: [1, 5, 10, 25]
    },
    dataLayer: {
      querySizes: [10, 50, 100, 500],
      concurrencyLevels: [1, 5, 10, 25],
      pageSize: 20
    }
  },

  // Regression detection settings
  regression: {
    threshold: 0.2,           // 20% degradation threshold
    lookbackRuns: 5,          // Compare against last 5 runs
    improvementThreshold: 0.1 // 10% improvement threshold
  },

  // Output settings
  output: {
    saveResults: true,
    generateReports: true,
    keepHistoryRuns: 50,      // Number of historical runs to keep
    formats: ['json', 'markdown'],
    includeSystemInfo: true
  },

  // Environment-specific overrides
  environments: {
    test: {
      iterations: 1,
      warmup: false,
      dataSizes: {
        cache: { small: [1, 5] },
        rendering: { itemCounts: [10, 50] },
        dataLayer: { querySizes: [10, 50] }
      }
    },
    ci: {
      iterations: 1,
      warmup: true,
      alertOnRegression: true,
      saveResults: true
    },
    development: {
      iterations: 1,
      warmup: true,
      verbose: false
    },
    production: {
      iterations: 3,
      warmup: true,
      compareWithHistory: true,
      alertOnRegression: true
    }
  }
};

// Get configuration for current environment
export function getConfig(environment = process.env.NODE_ENV || 'development') {
  const baseConfig = benchmarkConfig;
  const envOverrides = benchmarkConfig.environments[environment] || {};
  const thresholds = benchmarkConfig.thresholds[environment] || benchmarkConfig.thresholds.development;
  
  return {
    ...baseConfig,
    ...envOverrides,
    thresholds
  };
}

export default benchmarkConfig;