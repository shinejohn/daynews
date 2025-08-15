#!/usr/bin/env node
// Test runner for Version B ISR system
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.join(__dirname, '..');

// Test configuration
const TEST_SUITES = {
  unit: {
    pattern: 'tests/unit/**/*.test.js',
    description: 'Unit tests for individual components'
  },
  integration: {
    pattern: 'tests/integration/**/*.test.js',
    description: 'Integration tests for system components'
  },
  all: {
    pattern: 'tests/**/*.test.js',
    description: 'All tests'
  }
};

// Color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function colorize(text, color) {
  return `${colors[color]}${text}${colors.reset}`;
}

function printHeader() {
  console.log(colorize('🧪 Version B ISR Test Suite', 'cyan'));
  console.log(colorize('=====================================', 'cyan'));
  console.log();
}

function printUsage() {
  console.log(colorize('Usage:', 'bright'));
  console.log('  npm run test [suite] [-- jest-options]');
  console.log();
  console.log(colorize('Available test suites:', 'bright'));
  Object.entries(TEST_SUITES).forEach(([name, config]) => {
    console.log(`  ${colorize(name.padEnd(12), 'yellow')} ${config.description}`);
  });
  console.log();
  console.log(colorize('Examples:', 'bright'));
  console.log('  npm run test unit              # Run unit tests only');
  console.log('  npm run test integration       # Run integration tests only');
  console.log('  npm run test all               # Run all tests');
  console.log('  npm run test -- --watch        # Run in watch mode');
  console.log('  npm run test -- --coverage     # Run with coverage report');
  console.log();
}

function runJest(pattern, additionalArgs = []) {
  return new Promise((resolve, reject) => {
    const jestArgs = [
      '--testPathPattern', pattern,
      '--verbose',
      '--detectOpenHandles',
      '--forceExit',
      ...additionalArgs
    ];

    console.log(colorize(`Running: jest ${jestArgs.join(' ')}`, 'blue'));
    console.log();

    const jest = spawn('npx', ['jest', ...jestArgs], {
      cwd: projectRoot,
      stdio: 'inherit',
      env: {
        ...process.env,
        NODE_ENV: 'test',
        FORCE_COLOR: '1'
      }
    });

    jest.on('close', (code) => {
      if (code === 0) {
        resolve(code);
      } else {
        reject(new Error(`Jest exited with code ${code}`));
      }
    });

    jest.on('error', (error) => {
      reject(error);
    });
  });
}

async function main() {
  const args = process.argv.slice(2);
  const suite = args[0] || 'all';
  const jestArgs = args.slice(1);

  printHeader();

  // Handle help
  if (suite === 'help' || suite === '--help' || suite === '-h') {
    printUsage();
    return;
  }

  // Validate suite
  if (!TEST_SUITES[suite]) {
    console.error(colorize(`❌ Unknown test suite: ${suite}`, 'red'));
    console.log();
    printUsage();
    process.exit(1);
  }

  const config = TEST_SUITES[suite];
  
  console.log(colorize(`📋 Running: ${config.description}`, 'bright'));
  console.log(colorize(`📁 Pattern: ${config.pattern}`, 'magenta'));
  console.log();

  try {
    const startTime = Date.now();
    await runJest(config.pattern, jestArgs);
    const duration = Date.now() - startTime;
    
    console.log();
    console.log(colorize(`✅ Tests completed successfully in ${duration}ms`, 'green'));
    
    if (jestArgs.includes('--coverage')) {
      console.log();
      console.log(colorize('📊 Coverage report generated in ./coverage/', 'cyan'));
    }
    
  } catch (error) {
    console.log();
    console.error(colorize(`❌ Tests failed: ${error.message}`, 'red'));
    process.exit(1);
  }
}

// Handle uncaught errors
process.on('uncaughtException', (error) => {
  console.error(colorize(`💥 Uncaught exception: ${error.message}`, 'red'));
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error(colorize(`💥 Unhandled rejection at: ${promise}`, 'red'));
  console.error(colorize(`Reason: ${reason}`, 'red'));
  process.exit(1);
});

main().catch((error) => {
  console.error(colorize(`💥 Fatal error: ${error.message}`, 'red'));
  process.exit(1);
});