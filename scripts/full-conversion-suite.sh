#!/bin/bash

# Full Magic Patterns to Next.js Conversion Suite
# This master script orchestrates the entire conversion process

set -e  # Exit on error

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Paths - Make configurable via environment variables
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
MAGIC_DIR="${MAGIC_PATTERNS_DIR:-${PROJECT_ROOT}/../magic}"

echo -e "${GREEN}🚀 Magic Patterns to Next.js Full Conversion Suite${NC}"
echo "=================================================="
echo ""

# Step 1: Basic routing conversion
echo -e "${YELLOW}Step 1: Converting React Router to Next.js routing...${NC}"
node "$SCRIPT_DIR/smart-magic-patterns-converter.js"

# Step 2: Fix common patterns
echo -e "\n${YELLOW}Step 2: Fixing common patterns...${NC}"
bash "$SCRIPT_DIR/fix-common-patterns.sh"

# Step 3: Generate Supabase integrations
echo -e "\n${YELLOW}Step 3: Generating Supabase integrations...${NC}"
node "$SCRIPT_DIR/generate-supabase-integrations.js"

# Step 4: Update page routes
echo -e "\n${YELLOW}Step 4: Updating page routes...${NC}"
node "$SCRIPT_DIR/update-page-routes.js"

# Step 5: Fix TypeScript issues
echo -e "\n${YELLOW}Step 5: Fixing TypeScript issues...${NC}"
bash "$SCRIPT_DIR/fix-typescript-issues.sh"

# Step 6: Run quality validation
echo -e "\n${YELLOW}Step 6: Running build quality validation...${NC}"
node "$SCRIPT_DIR/build-quality-validator.js"

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Quality validation failed - fix issues before proceeding${NC}"
    exit 1
fi

# Step 7: Run build test
echo -e "\n${YELLOW}Step 7: Running build test...${NC}"
cd "$PROJECT_ROOT"
npm run build

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Build failed - running emergency fixes...${NC}"
    node "$SCRIPT_DIR/clean-migration-fix.js"
    echo -e "\n${YELLOW}Retrying build after fixes...${NC}"
    npm run build || echo -e "${RED}Build still failing - manual intervention needed${NC}"
else
    echo -e "${GREEN}✅ Build successful!${NC}"
fi

echo -e "\n${GREEN}✅ Conversion complete!${NC}"
echo ""
echo "Next steps:"
echo "1. Review the conversion log at: $PROJECT_ROOT/conversion-report.md"
echo "2. Test individual pages"
echo "3. Fix any remaining build errors"