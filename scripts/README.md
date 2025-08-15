# Magic Patterns to Next.js Conversion Scripts

A comprehensive set of scripts for converting Magic Patterns components to production-ready Next.js applications with SSR, ISR, and CSR rendering strategies.

## 🚀 Quick Start

### For Any Project

1. **Copy the scripts folder** to your Next.js project
2. **Create configuration** (optional):
   ```bash
   cp scripts/conversion-config.template.js conversion-config.js
   # Edit conversion-config.js for your project needs
   ```
3. **Run the conversion**:
   ```bash
   # Full automated conversion
   bash scripts/full-conversion-suite.sh
   
   # Or specify Magic Patterns source path
   MAGIC_PATTERNS_DIR="/path/to/magic/components" bash scripts/full-conversion-suite.sh
   ```

### Individual Script Usage

```bash
# 1. Convert components with custom source path
node scripts/smart-magic-patterns-converter.js /path/to/magic/components

# 2. Generate Next.js pages from route mapping
node scripts/create-route-pages.js

# 3. Validate build quality (run before building)
node scripts/build-quality-validator.js

# 4. Clean up any wrapper patterns
node scripts/clean-migration-fix.js
```

## 📁 Project Structure Requirements

Your Next.js project should have:
```
your-project/
├── src/
│   ├── app/          # Next.js App Router pages (will be created)
│   ├── components/   # Target for converted components
│   └── lib/
│       └── supabase/ # Database integration (optional)
├── scripts/          # Conversion scripts (copy these)
├── route-mapping.json # Generated or provided route mapping
└── conversion-config.js # Optional project configuration
```

## ⚙️ Configuration Options

### Environment Variables
```bash
# Required: Path to Magic Patterns components
MAGIC_PATTERNS_DIR="/path/to/magic/src/components"

# Optional: Override target directory
TARGET_DIR="./src/components"
```

### Configuration File (`conversion-config.js`)
```javascript
module.exports = {
  paths: {
    magicPatternsDir: '../magic/src/components',
    targetDir: './src/components'
  },
  database: {
    type: 'supabase', // 'supabase', 'prisma', 'custom'
    dataPatterns: [
      { keywords: ['product'], table: 'products' },
      { keywords: ['user'], table: 'users' }
    ]
  },
  rendering: {
    routeConfigs: {
      '/': { type: 'isr', revalidate: 60 },
      '/admin': { type: 'csr' }
    }
  }
};
```

## 🛠️ Script Functions

### `smart-magic-patterns-converter.js`
- Converts React Router to Next.js navigation
- Adds proper 'use client' directives
- Integrates database queries
- Ensures export consistency

### `create-route-pages.js`
- Generates Next.js App Router pages
- Dynamically discovers component paths
- Applies appropriate rendering strategies (SSR/ISR/CSR)
- Validates import/export compatibility

### `build-quality-validator.js`
- Validates component exports consistency
- Checks page-component import compatibility  
- Validates route mapping accuracy
- Prevents build failures before deployment

### `clean-migration-fix.js`
- Eliminates wrapper component patterns
- Adds direct database integration
- Cleans up broken imports
- Ensures clean codebase architecture

### `full-conversion-suite.sh`
- Orchestrates complete conversion process
- Includes quality validation steps
- Provides automatic error recovery
- Generates comprehensive reports

## 📊 Rendering Strategies

The scripts automatically apply optimal rendering strategies:

- **ISR** (Incremental Static Regeneration): Content pages, product pages
- **SSR** (Server-Side Rendering): Dynamic content, real-time data
- **CSR** (Client-Side Rendering): User dashboards, interactive forms
- **SSG** (Static Site Generation): About pages, terms, privacy

## 🔧 Customization for Different Project Types

### E-commerce Projects
```javascript
// conversion-config.js
dataPatterns: [
  { keywords: ['product', 'item'], table: 'products' },
  { keywords: ['cart', 'basket'], table: 'cart_items' },
  { keywords: ['order'], table: 'orders' }
]
```

### Blog/CMS Projects  
```javascript
dataPatterns: [
  { keywords: ['post', 'article'], table: 'posts' },
  { keywords: ['page', 'content'], table: 'pages' },
  { keywords: ['media', 'upload'], table: 'media' }
]
```

### News Sites
```javascript
dataPatterns: [
  { keywords: ['news', 'article'], table: 'news' },
  { keywords: ['event'], table: 'events' },
  { keywords: ['classified'], table: 'marketplace_items' }
]
```

## 🚨 Troubleshooting

### Build Failures
1. **Run quality validator first**: `node scripts/build-quality-validator.js`
2. **Check component paths**: Ensure components exist in expected locations
3. **Verify route mapping**: Check `route-mapping.json` accuracy
4. **Run clean migration**: `node scripts/clean-migration-fix.js`

### Import/Export Errors
- Scripts automatically detect and fix most import/export mismatches
- For persistent issues, check component export patterns
- Ensure components have proper named or default exports

### Missing Components
- Scripts dynamically discover components in subdirectories
- Verify Magic Patterns source path is correct
- Check that component names in route mapping match actual files

## 📈 Quality Assurance

The scripts include multiple quality checks:

- ✅ Export consistency validation
- ✅ Import/export compatibility
- ✅ Component path verification  
- ✅ Route mapping accuracy
- ✅ Database integration validation
- ✅ Build compatibility testing

## 🎯 Best Practices

1. **Always run quality validation** before building
2. **Use configuration files** for project-specific settings
3. **Test converted components** individually
4. **Review rendering strategies** for your use case
5. **Keep original files** as `.original.tsx` for reference
6. **Run full conversion suite** for complete projects

## 📝 Generated Files

The conversion creates:
- **Converted components** in `/src/components/`
- **Next.js pages** in `/src/app/`
- **Original backups** with `.original.tsx` extension
- **Conversion reports** with detailed logs
- **Quality validation** results

## 🤝 Contributing

To improve these scripts:
1. Test with different Magic Patterns projects
2. Add new data pattern recognition
3. Enhance rendering strategy detection
4. Improve error handling and recovery
5. Add support for additional database types

---

*These scripts provide a complete, production-ready solution for migrating Magic Patterns projects to Next.js with optimal performance and SEO.*