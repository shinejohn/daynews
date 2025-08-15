// Jest configuration for ES modules
export default {
  // Use Node environment for server-side tests
  testEnvironment: 'node',
  
  // Module name mapper for aliases
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@components/(.*)$': '<rootDir>/src/components/$1',
    '^@lib/(.*)$': '<rootDir>/src/lib/$1'
  },
  
  // Transform files - use native ES modules
  transform: {},
  
  // Test match patterns
  testMatch: [
    '<rootDir>/tests/**/*.test.js',
    '<rootDir>/tests/**/*.spec.js'
  ],

  // Setup files
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],

  // Coverage configuration
  collectCoverage: false,
  collectCoverageFrom: [
    'server/**/*.js',
    '!**/*.config.js',
    '!**/node_modules/**',
    '!**/dist/**',
    '!**/cache/**'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],

  // Ignore patterns
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '/cache/',
    '/.next/'
  ],

  // Module file extensions
  moduleFileExtensions: ['js', 'jsx', 'json'],

  // Timers
  testTimeout: 30000,

  // Clear mocks between tests
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true
}