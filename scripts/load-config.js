/**
 * Configuration loader for Magic Patterns conversion scripts
 * 
 * This module loads project-specific configuration, falling back to defaults.
 */

const fs = require('fs');
const path = require('path');

// Default configuration
const defaultConfig = {
  paths: {
    magicPatternsDir: process.env.MAGIC_PATTERNS_DIR || '../magic/src/components',
    targetDir: './src/components',
    appDir: './src/app'
  },
  database: {
    type: 'supabase',
    dataPatterns: [
      { keywords: ['classified', 'marketplace', 'listing'], table: 'marketplace_items' },
      { keywords: ['event'], table: 'events' },
      { keywords: ['news', 'article', 'story'], table: 'news' },
      { keywords: ['business', 'company', 'vendor'], table: 'businesses' },
      { keywords: ['announcement', 'notice'], table: 'announcements' },
      { keywords: ['user', 'profile', 'member'], table: 'profiles' }
    ]
  },
  rendering: {
    routeConfigs: {
      '/': { type: 'isr', revalidate: 60 },
      '/profile': { type: 'csr' },
      '/settings': { type: 'csr' },
      '/admin': { type: 'csr' },
      '/about': { type: 'ssg' },
      '/privacy': { type: 'ssg' },
      '/terms': { type: 'ssg' },
      '/contact': { type: 'ssg' }
    }
  },
  conversion: {
    skipComponents: ['Unknown', 'EmergencyFallback'],
    forceClientComponents: ['Modal', 'Dropdown', 'Calendar', 'Upload', 'Payment'],
    fileExtensions: ['.tsx', '.jsx'],
    originalSuffix: '.original'
  }
};

function loadConfig() {
  const configPath = path.join(__dirname, '..', 'conversion-config.js');
  
  if (fs.existsSync(configPath)) {
    try {
      const userConfig = require(configPath);
      return mergeConfig(defaultConfig, userConfig);
    } catch (error) {
      console.warn(`⚠️  Warning: Could not load conversion-config.js: ${error.message}`);
      console.warn('   Using default configuration...');
    }
  }
  
  return defaultConfig;
}

function mergeConfig(defaultConfig, userConfig) {
  const merged = JSON.parse(JSON.stringify(defaultConfig));
  
  for (const [key, value] of Object.entries(userConfig)) {
    if (typeof value === 'object' && !Array.isArray(value)) {
      merged[key] = { ...merged[key], ...value };
    } else {
      merged[key] = value;
    }
  }
  
  return merged;
}

module.exports = { loadConfig };