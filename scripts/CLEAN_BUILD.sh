#!/bin/bash

# Clean Build Script - Builds Day News from scratch with proper order

set -e  # Exit on error

echo "🚀 Day News Clean Build Script"
echo "=============================="
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Function to run a step
run_step() {
    local step_name=$1
    local command=$2
    
    echo -e "\n${BLUE}▶ ${step_name}${NC}"
    if eval "$command"; then
        echo -e "${GREEN}✓ ${step_name} completed${NC}"
    else
        echo -e "${RED}✗ ${step_name} failed${NC}"
        exit 1
    fi
}

echo -e "${GREEN}Starting clean build...${NC}\n"

# 1. Extract routes from Magic Patterns
run_step "Extracting routes" "node scripts/extract-routes-from-magic.js"

# 2. Create all route pages
run_step "Creating route pages" "node scripts/create-all-routes.js"

# 3. Convert Magic Patterns components
run_step "Converting components" "node scripts/convert-magic-patterns.js"

# 4. Generate queries (skip if errors)
echo -e "\n${BLUE}▶ Generating queries (optional)${NC}"
node scripts/generate-queries.js 2>/dev/null || echo -e "${YELLOW}⚠ Queries generation skipped${NC}"

# 5. Fix TypeScript issues
run_step "Fixing TypeScript" "node scripts/fix-all-type-errors.js"

# 6. Fix syntax errors
run_step "Fixing syntax" "node scripts/fix-all-syntax-errors.js"

# 7. Make it build
run_step "Force build fixes" "node scripts/make-it-build.js"

# 8. Test build
echo -e "\n${BLUE}▶ Testing build...${NC}"
if npm run build; then
    echo -e "${GREEN}✅ BUILD SUCCESSFUL!${NC}\n"
else
    echo -e "${YELLOW}⚠ Build failed, running emergency fixes...${NC}"
    run_step "Emergency fixes" "node scripts/force-build-fix.js"
    
    if npm run build; then
        echo -e "${GREEN}✅ BUILD SUCCESSFUL after fixes!${NC}\n"
    else
        echo -e "${RED}❌ Build still failing.${NC}"
        echo "Try running: node scripts/quick-build.js"
        exit 1
    fi
fi

echo -e "${GREEN}🎉 Clean build complete!${NC}\n"
echo "Next steps:"
echo "1. npm run dev"
echo "2. Visit http://localhost:3000"