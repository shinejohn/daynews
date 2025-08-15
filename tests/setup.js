// Test setup file for Version B ISR system
import { jest } from '@jest/globals';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import os from 'os';

// Get directory path for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Basic environment setup
process.env.NODE_ENV = 'test';
process.env.SUPABASE_URL = process.env.SUPABASE_URL || 'http://localhost:54321';
process.env.SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'test-key';

// Test configuration
global.TEST_CONFIG = {
  cacheDir: path.join(os.tmpdir(), 'daynews-test-cache'),
  testDir: path.join(os.tmpdir(), 'daynews-test'),
  timeouts: {
    short: 1000,
    medium: 5000,
    long: 30000
  }
};

// Helper to create temporary directories
global.createTempDir = async (name) => {
  const tempDir = path.join(global.TEST_CONFIG.testDir, name, Date.now().toString());
  await fs.mkdir(tempDir, { recursive: true });
  return tempDir;
};

// Helper to clean up temp directories
global.cleanupTempDir = async (dir) => {
  if (dir && dir.startsWith(global.TEST_CONFIG.testDir)) {
    try {
      await fs.rm(dir, { recursive: true, force: true });
    } catch (error) {
      console.warn('Could not clean up temp directory:', error.message);
    }
  }
};

// Mock console methods
const originalConsole = {
  log: console.log,
  error: console.error,
  warn: console.warn
};

global.mockConsole = () => {
  console.log = jest.fn();
  console.error = jest.fn();
  console.warn = jest.fn();
};

global.restoreConsole = () => {
  console.log = originalConsole.log;
  console.error = originalConsole.error;
  console.warn = originalConsole.warn;
};

// Clean up after all tests
afterAll(async () => {
  try {
    await fs.rm(global.TEST_CONFIG.testDir, { recursive: true, force: true });
  } catch (error) {
    // Ignore cleanup errors
  }
});

console.log('✓ Test environment initialized');