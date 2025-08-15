#!/bin/bash

# Version B - Master Setup Script
# Runs all steps in sequence to create custom ISR with Vite

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
MAGENTA='\033[0;35m'
NC='\033[0m'

echo -e "${MAGENTA}╔═══════════════════════════════════════════════════════════╗${NC}"
echo -e "${MAGENTA}║     Version B: Custom ISR Implementation                  ║${NC}"
echo -e "${MAGENTA}║     Magic Patterns + Vite SSR + Node.js                   ║${NC}"
echo -e "${MAGENTA}╚═══════════════════════════════════════════════════════════╝${NC}"
echo ""

# Check for Magic Patterns directory
MAGIC_PATTERNS_DIR="${1:-${MAGIC_PATTERNS_DIR:-../magic}}"

if [ ! -d "$MAGIC_PATTERNS_DIR" ]; then
    echo -e "${RED}❌ Magic Patterns directory not found: $MAGIC_PATTERNS_DIR${NC}"
    echo -e "${YELLOW}Usage: $0 <path-to-magic-patterns>${NC}"
    echo -e "${YELLOW}Or set MAGIC_PATTERNS_DIR environment variable${NC}"
    exit 1
fi

echo -e "${BLUE}Using Magic Patterns from: $MAGIC_PATTERNS_DIR${NC}\n"

# Track start time
START_TIME=$(date +%s)

# Function to run a step
run_step() {
    local step_number=$1
    local step_name=$2
    local script=$3
    
    echo -e "\n${YELLOW}═══ Step $step_number: $step_name ═══${NC}"
    
    if [ -f "$script" ]; then
        chmod +x "$script"
        if $script "$MAGIC_PATTERNS_DIR"; then
            echo -e "${GREEN}✓ Step $step_number complete${NC}"
        else
            echo -e "${RED}✗ Step $step_number failed${NC}"
            exit 1
        fi
    else
        echo -e "${RED}✗ Script not found: $script${NC}"
        exit 1
    fi
}

# Create backup
echo -e "${YELLOW}Creating backup...${NC}"
if [ ! -d "backup-version-b" ]; then
    if [ -d "src" ]; then
        cp -r src backup-version-b
        echo -e "${GREEN}✓ Backup created${NC}"
    fi
fi

# Run all steps
run_step 1 "Setup Vite SSR" "./scripts/version-b/01-setup-vite-ssr.sh"
run_step 2 "Create ISR Engine" "./scripts/version-b/02-create-isr-engine.sh"
run_step 3 "Extract Page Metadata" "./scripts/version-b/03-extract-page-metadata.sh"
run_step 4 "Setup Data Layer" "./scripts/version-b/04-setup-data-layer.sh"
run_step 5 "Build and Configure" "./scripts/version-b/05-build-and-run.sh"

# Calculate duration
END_TIME=$(date +%s)
DURATION=$((END_TIME - START_TIME))
MINUTES=$((DURATION / 60))
SECONDS=$((DURATION % 60))

# Summary
echo -e "\n${GREEN}═══ Version B Setup Complete! ═══${NC}"
echo -e "
${BLUE}What was created:${NC}
✅ Vite SSR configuration
✅ Custom ISR engine with file caching
✅ Route extraction from Magic Patterns (ISRCSR comments)
✅ Data layer with Supabase/mock support
✅ Production-ready server setup

${BLUE}Architecture:${NC}
┌─────────────────┐     ┌──────────────┐     ┌──────────────┐
│ Magic Patterns  │────▶│ React SSR    │────▶│ ISR Cache    │
│ (Components)    │     │ (Vite)       │     │ (File System)│
└─────────────────┘     └──────────────┘     └──────────────┘
         ↓                      ↓                     ↓
┌─────────────────┐     ┌──────────────┐     ┌──────────────┐
│ ISRCSR=ISR/CSR  │     │ Node.js      │     │ Background   │
│ (Metadata)      │     │ Express      │     │ Revalidation │
└─────────────────┘     └──────────────┘     └──────────────┘

${BLUE}Key differences from Version A (Next.js):${NC}
• You control the ISR logic
• Custom caching strategies
• Direct Magic Patterns integration
• Lighter weight (no Next.js overhead)
• More complex but fully customizable

${BLUE}Time taken:${NC} ${MINUTES}m ${SECONDS}s

${BLUE}Next steps:${NC}
1. Copy Magic Patterns components to src/components
2. Start development: ${YELLOW}./dev.sh${NC}
3. Build for production: ${YELLOW}./build-prod.sh${NC}
4. Monitor cache: ${YELLOW}./monitor-cache.sh${NC}

${BLUE}Quick test:${NC}
${YELLOW}cp -r $MAGIC_PATTERNS_DIR/src/components/* src/components/${NC}
${YELLOW}./dev.sh${NC}
"

# Create README for Version B
cat > VERSION_B_README.md << EOF
# Version B: Custom ISR Implementation

## Overview

Version B implements a custom ISR (Incremental Static Regeneration) system using:
- **Vite** for React SSR and development
- **Node.js/Express** for the server
- **Custom ISR engine** with file-based caching
- **Magic Patterns** components with ISRCSR metadata

## Quick Start

\`\`\`bash
# Development
./dev.sh

# Production
./build-prod.sh
NODE_ENV=production npm run serve:ssr
\`\`\`

## How It Works

1. **Page Detection**: Reads ISRCSR=ISR/CSR comments from Magic Patterns
2. **ISR Pages**: Cached with TTL, regenerated in background
3. **CSR Pages**: Rendered on each request, no caching
4. **Revalidation**: On-demand via API or automatic on TTL expiry

## API Endpoints

- \`GET /api/articles\` - Fetch articles
- \`GET /api/events\` - Fetch events  
- \`POST /api/revalidate\` - Trigger revalidation
- \`GET /api/health\` - Server health and cache stats

## Configuration

Edit \`route-config.json\` to adjust:
- Routes and their rendering modes
- TTL values for ISR pages
- Component mappings

## Cache Management

\`\`\`bash
# Revalidate specific page
./revalidate.sh /article/my-article

# Monitor cache
./monitor-cache.sh

# Clear cache
rm -rf cache/*.json
\`\`\`

## Deployment

1. Build: \`./build-prod.sh\`
2. Set environment variables
3. Run: \`NODE_ENV=production npm run serve:ssr\`
4. Use PM2/systemd for process management

## Advantages

- Full control over caching logic
- Custom TTL per route
- Stale-while-revalidate support
- Direct Magic Patterns integration
- No framework lock-in

## Trade-offs

- More code to maintain
- No built-in optimizations
- Manual error handling
- Custom deployment setup
EOF

echo -e "${GREEN}📝 Created VERSION_B_README.md for reference${NC}"