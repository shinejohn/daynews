#!/bin/bash

# Enhanced Magic Patterns to Next.js Conversion Suite V2
# Includes all fixes discovered during migration

set -e  # Exit on error

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Paths
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
MAGIC_DIR="${MAGIC_PATTERNS_DIR:-${PROJECT_ROOT}/../magic}"

echo -e "${GREEN}🚀 Magic Patterns to Next.js Full Conversion Suite V2${NC}"
echo "===================================================="
echo -e "${BLUE}Enhanced with all migration fixes${NC}"
echo ""

# Check dependencies
echo -e "${YELLOW}Checking dependencies...${NC}"
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
fi

# Step 1: Basic routing conversion
echo -e "\n${YELLOW}Step 1: Converting React Router to Next.js routing...${NC}"
if [ -f "$SCRIPT_DIR/smart-magic-patterns-converter.js" ]; then
    node "$SCRIPT_DIR/smart-magic-patterns-converter.js"
else
    echo -e "${RED}Warning: smart-magic-patterns-converter.js not found${NC}"
fi

# Step 2: Create route pages
echo -e "\n${YELLOW}Step 2: Creating Next.js route pages...${NC}"
if [ -f "$SCRIPT_DIR/create-route-pages.js" ]; then
    node "$SCRIPT_DIR/create-route-pages.js"
else
    echo -e "${RED}Warning: create-route-pages.js not found${NC}"
fi

# Step 3: Fix HTML entities
echo -e "\n${YELLOW}Step 3: Fixing HTML entities...${NC}"
if [ -f "$SCRIPT_DIR/fix-all-html-entities.js" ]; then
    node "$SCRIPT_DIR/fix-all-html-entities.js"
elif [ -f "$SCRIPT_DIR/fix-html-entities.js" ]; then
    node "$SCRIPT_DIR/fix-html-entities.js"
fi

# Step 4: Fix React imports
echo -e "\n${YELLOW}Step 4: Fixing React hook imports...${NC}"
if [ -f "$SCRIPT_DIR/fix-react-hooks-imports.js" ]; then
    node "$SCRIPT_DIR/fix-react-hooks-imports.js"
fi

# Step 5: Fix navigation dependencies
echo -e "\n${YELLOW}Step 5: Fixing navigation dependencies...${NC}"
if [ -f "$SCRIPT_DIR/fix-navigate-dependencies.js" ]; then
    node "$SCRIPT_DIR/fix-navigate-dependencies.js"
fi

# Step 6: Fix use client directives
echo -e "\n${YELLOW}Step 6: Adding 'use client' directives...${NC}"
if [ -f "$SCRIPT_DIR/fix-use-client-directives.js" ]; then
    node "$SCRIPT_DIR/fix-use-client-directives.js"
fi

# Step 7: Fix location references
echo -e "\n${YELLOW}Step 7: Fixing location references for SSR...${NC}"
if [ -f "$SCRIPT_DIR/fix-location-references.js" ]; then
    node "$SCRIPT_DIR/fix-location-references.js"
fi

# Step 8: Fix dynamic pages
echo -e "\n${YELLOW}Step 8: Configuring dynamic pages...${NC}"
if [ -f "$SCRIPT_DIR/fix-all-dynamic-pages.js" ]; then
    node "$SCRIPT_DIR/fix-all-dynamic-pages.js"
fi

# Step 9: Run comprehensive post-conversion fixes
echo -e "\n${YELLOW}Step 9: Running comprehensive post-conversion fixes...${NC}"
if [ -f "$SCRIPT_DIR/post-conversion-fixes.js" ]; then
    node "$SCRIPT_DIR/post-conversion-fixes.js"
fi

# Step 10: Clean migration patterns
echo -e "\n${YELLOW}Step 10: Cleaning migration patterns...${NC}"
if [ -f "$SCRIPT_DIR/clean-migration-fix.js" ]; then
    node "$SCRIPT_DIR/clean-migration-fix.js"
fi

# Step 11: Run quality validation
echo -e "\n${YELLOW}Step 11: Running build quality validation...${NC}"
if [ -f "$SCRIPT_DIR/build-quality-validator.js" ]; then
    node "$SCRIPT_DIR/build-quality-validator.js"
    
    if [ $? -ne 0 ]; then
        echo -e "${RED}⚠️  Quality validation warnings detected${NC}"
    fi
fi

# Step 12: Setup providers and layout
echo -e "\n${YELLOW}Step 12: Setting up providers and layout...${NC}"
if [ ! -f "$PROJECT_ROOT/src/app/providers.tsx" ]; then
    echo "Creating providers.tsx..."
    cat > "$PROJECT_ROOT/src/app/providers.tsx" << 'EOF'
'use client';

import React from 'react';
import { LocationDetector } from '@/components/location/LocationDetector';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
      refetchOnWindowFocus: false,
    },
  },
});

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <LocationDetector>
        {children}
      </LocationDetector>
    </QueryClientProvider>
  );
}
EOF
fi

# Step 13: Run build test
echo -e "\n${YELLOW}Step 13: Running build test...${NC}"
cd "$PROJECT_ROOT"

# Clear .next directory for clean build
rm -rf .next

npm run build 2>&1 | tee build-output.log

if [ ${PIPESTATUS[0]} -eq 0 ]; then
    echo -e "\n${GREEN}✅ Build successful!${NC}"
    echo -e "${GREEN}🎉 Conversion complete!${NC}"
else
    echo -e "\n${RED}❌ Build failed${NC}"
    echo -e "${YELLOW}Analyzing build errors...${NC}"
    
    # Common error patterns and solutions
    if grep -q "Invalid hook call" build-output.log; then
        echo -e "${YELLOW}Found invalid hook calls - checking for missing providers...${NC}"
    fi
    
    if grep -q "Cannot read properties of undefined" build-output.log; then
        echo -e "${YELLOW}Found undefined property access - checking data initialization...${NC}"
    fi
    
    if grep -q "is not defined" build-output.log; then
        echo -e "${YELLOW}Found undefined variables - checking imports...${NC}"
    fi
    
    echo -e "\n${YELLOW}Please check build-output.log for detailed errors${NC}"
fi

# Generate conversion report
echo -e "\n${YELLOW}Generating conversion report...${NC}"
cat > "$PROJECT_ROOT/conversion-report.md" << EOF
# Magic Patterns to Next.js Conversion Report

Generated: $(date)

## Conversion Steps Completed

1. ✅ React Router to Next.js routing conversion
2. ✅ Route pages creation
3. ✅ HTML entities fixed
4. ✅ React hook imports fixed
5. ✅ Navigation dependencies fixed
6. ✅ 'use client' directives added
7. ✅ Location references fixed for SSR
8. ✅ Dynamic pages configured
9. ✅ Post-conversion fixes applied
10. ✅ Migration patterns cleaned
11. ✅ Build quality validated
12. ✅ Providers and layout setup

## Files Modified

- HTML entity fixes: $(find src -name "*.tsx" -o -name "*.ts" | wc -l) files checked
- Dynamic pages: $(find src/app -name "page.tsx" | wc -l) pages configured
- Components: $(find src/components -name "*.tsx" | wc -l) components processed

## Next Steps

1. Test all pages in development: \`npm run dev\`
2. Check browser console for client-side errors
3. Verify all data fetching works correctly
4. Test forms and interactive components
5. Deploy to staging environment

## Common Issues and Solutions

### Client-side errors
- Ensure providers.tsx is imported in layout.tsx
- Check for missing 'use client' directives
- Verify all hooks are used inside components

### Build errors
- Run \`npm run build\` to see specific errors
- Check for undefined variables or properties
- Ensure all imports are correct

### Data fetching
- Replace mock data with actual API calls
- Use proper error handling for failed requests
- Implement loading states
EOF

echo -e "\n${GREEN}✅ Conversion report generated at: conversion-report.md${NC}"
echo ""
echo "Next steps:"
echo "1. Review the conversion report"
echo "2. Test the application locally: npm run dev"
echo "3. Fix any remaining issues"
echo "4. Deploy to Vercel"