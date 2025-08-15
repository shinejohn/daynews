#!/usr/bin/env node

/**
 * DEPRECATED: This script blindly adds 'use client' to components
 * Use smart-use-client-analyzer.js instead for SSR-first approach
 */

console.log('⚠️  WARNING: This script is deprecated!');
console.log('Use smart-use-client-analyzer.js instead for proper SSR/CSR differentiation.');
console.log('');
console.log('The old script added "use client" to everything with hooks,');
console.log('which breaks SSR for news sites that need SEO.');
console.log('');
console.log('Run: node scripts/smart-use-client-analyzer.js');
process.exit(1);