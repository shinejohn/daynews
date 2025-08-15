/**
 * Magic Patterns to Next.js Conversion Configuration Template
 * 
 * Copy this file to 'conversion-config.js' and customize for your project.
 * All scripts will automatically use this configuration if present.
 */

module.exports = {
  // Paths Configuration
  paths: {
    // Path to your Magic Patterns source components
    magicPatternsDir: process.env.MAGIC_PATTERNS_DIR || '../magic/src/components',
    
    // Target directory for Next.js components  
    targetDir: './src/components',
    
    // App directory for Next.js pages
    appDir: './src/app'
  },

  // Data Integration Configuration
  database: {
    // Database client type ('supabase', 'prisma', 'custom')
    type: 'supabase',
    
    // Common data entity mappings for different project types
    dataPatterns: [
      // E-commerce patterns
      { keywords: ['product', 'item', 'catalog'], table: 'products' },
      { keywords: ['cart', 'basket', 'checkout'], table: 'cart_items' },
      { keywords: ['order', 'purchase', 'transaction'], table: 'orders' },
      
      // Content management patterns  
      { keywords: ['post', 'article', 'blog'], table: 'posts' },
      { keywords: ['page', 'content'], table: 'pages' },
      { keywords: ['media', 'upload', 'file'], table: 'media' },
      
      // News site patterns (default for this template)
      { keywords: ['classified', 'marketplace', 'listing'], table: 'marketplace_items' },
      { keywords: ['event'], table: 'events' },
      { keywords: ['news', 'article', 'story'], table: 'news' },
      { keywords: ['business', 'company', 'vendor'], table: 'businesses' },
      { keywords: ['announcement', 'notice'], table: 'announcements' },
      
      // Common patterns across all project types
      { keywords: ['user', 'profile', 'member'], table: 'profiles' },
      { keywords: ['comment', 'review', 'feedback'], table: 'comments' },
      { keywords: ['category', 'tag', 'label'], table: 'categories' }
    ]
  },

  // Rendering Strategy Configuration
  rendering: {
    // Default rendering modes for different route patterns
    routeConfigs: {
      '/': { type: 'isr', revalidate: 60 },
      '/api/*': { type: 'ssr' },
      
      // Content pages (good for SEO)
      '/blog/*': { type: 'isr', revalidate: 300 },
      '/news/*': { type: 'isr', revalidate: 300 },
      '/products/*': { type: 'isr', revalidate: 900 },
      '/articles/*': { type: 'isr', revalidate: 3600 },
      
      // Dynamic content
      '/events': { type: 'ssr' },
      '/search': { type: 'csr' },
      '/cart': { type: 'csr' },
      
      // User-specific pages
      '/profile': { type: 'csr' },
      '/dashboard': { type: 'csr' },
      '/settings': { type: 'csr' },
      '/admin': { type: 'csr' },
      
      // Static pages
      '/about': { type: 'ssg' },
      '/privacy': { type: 'ssg' },
      '/terms': { type: 'ssg' },
      '/contact': { type: 'ssg' }
    }
  },

  // Conversion Rules
  conversion: {
    // Skip these components during conversion
    skipComponents: ['Unknown', 'EmergencyFallback', 'TestComponent'],
    
    // Force these components to be client-side
    forceClientComponents: [
      'Modal', 'Dropdown', 'Calendar', 'Upload', 'Payment', 'Chart', 'Editor'
    ],
    
    // File extensions to process
    fileExtensions: ['.tsx', '.jsx', '.ts', '.js'],
    
    // Preserve original files with this suffix
    originalSuffix: '.original'
  },

  // Quality Validation Rules
  validation: {
    // Fail build on these error types
    criticalErrors: [
      'MISSING_EXPORT',
      'COMPONENT_NOT_FOUND', 
      'IMPORT_EXPORT_MISMATCH',
      'BROKEN_IMPORT'
    ],
    
    // Warn but don't fail on these
    warnings: [
      'WRAPPER_PATTERN',
      'ROUTE_PAGE_MISSING',
      'ROUTE_MAPPING_MISSING'
    ]
  }
};