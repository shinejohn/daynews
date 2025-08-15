// Simple cache manager test to verify functionality
import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { CacheManager } from '../../server/isr/cache-manager.js';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';

describe('CacheManager Simple Tests', () => {
  let cacheManager;
  let testDir;

  beforeEach(async () => {
    // Create a temp directory
    testDir = path.join(os.tmpdir(), 'cache-test-' + Date.now());
    await fs.mkdir(testDir, { recursive: true });
    cacheManager = new CacheManager(testDir);
  });

  afterEach(async () => {
    // Clean up
    try {
      await fs.rm(testDir, { recursive: true, force: true });
    } catch (error) {
      // Ignore
    }
  });

  it('should create cache manager instance', () => {
    expect(cacheManager).toBeDefined();
    expect(cacheManager.cacheDir).toBe(testDir);
  });

  it('should generate cache keys', () => {
    const key1 = cacheManager.getCacheKey('/test');
    const key2 = cacheManager.getCacheKey('/test');
    const key3 = cacheManager.getCacheKey('/different');
    
    expect(key1).toBe(key2); // Same route = same key
    expect(key1).not.toBe(key3); // Different route = different key
  });

  it('should set and get cache', async () => {
    const testData = {
      html: '<html>Test</html>',
      context: { test: true }
    };
    
    await cacheManager.set('/test', testData, 300);
    const cached = await cacheManager.get('/test');
    
    expect(cached).toBeDefined();
    expect(cached.html).toBe(testData.html);
    expect(cached.context).toEqual(testData.context);
  });

  it('should handle cache miss', async () => {
    const cached = await cacheManager.get('/non-existent');
    expect(cached).toBeNull();
  });

  it('should detect stale cache', async () => {
    // Set with very short TTL
    await cacheManager.set('/test', { html: 'test' }, 0.001); // 1ms
    
    // Wait a bit to ensure it's stale
    await new Promise(resolve => setTimeout(resolve, 10));
    
    const cached = await cacheManager.get('/test');
    expect(cacheManager.isStale(cached)).toBe(true);
  });
});