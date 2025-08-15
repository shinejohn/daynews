#!/bin/bash

# Version B - Enhanced Master Setup Script
# Runs all steps including the new split scripts

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
MAGENTA='\033[0;35m'
NC='\033[0m'

echo -e "${MAGENTA}╔═══════════════════════════════════════════════════════════╗${NC}"
echo -e "${MAGENTA}║     Version B: Enhanced Custom ISR Implementation         ║${NC}"
echo -e "${MAGENTA}║     Magic Patterns + Vite SSR + Supabase + Node.js       ║${NC}"
echo -e "${MAGENTA}╚═══════════════════════════════════════════════════════════╝${NC}"
echo ""

# Check for Magic Patterns directory
MAGIC_PATTERNS_DIR="${1:-${MAGIC_PATTERNS_DIR:-/Users/johnshine/Dropbox/Fibonacco/Day-News/Code/magic}}"

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
if [ ! -d "backup-version-b-enhanced" ]; then
    if [ -d "src" ]; then
        cp -r src backup-version-b-enhanced
        echo -e "${GREEN}✓ Backup created${NC}"
    fi
fi

# Run all steps
run_step 1 "Setup Vite SSR" "./scripts/version-b/01-setup-vite-ssr.sh"
run_step 2 "Create ISR Engine" "./scripts/version-b/02-create-isr-engine.sh"
run_step 3 "Extract Enhanced Page Metadata" "./scripts/version-b/03-extract-page-metadata-enhanced.sh"
run_step 4 "Setup Enhanced Data Layer" "./scripts/version-b/04-setup-data-layer-enhanced.sh"

# Run the new split scripts
echo -e "\n${BLUE}Running enhanced setup scripts...${NC}"
run_step "5a" "Enhanced Server Setup" "./scripts/version-b/05a-enhanced-server.sh"
run_step "5b" "Build Scripts" "./scripts/version-b/05b-build-scripts.sh"
run_step "5c" "Monitoring Tools" "./scripts/version-b/05c-monitoring-tools.sh"
run_step "5d" "Deployment Config" "./scripts/version-b/05d-deployment-config.sh"
run_step "5e" "Webhook Setup" "./scripts/version-b/05e-webhook-setup.sh"

# Calculate duration
END_TIME=$(date +%s)
DURATION=$((END_TIME - START_TIME))
MINUTES=$((DURATION / 60))
SECONDS=$((DURATION % 60))

# Summary
echo -e "\n${GREEN}═══ Enhanced Version B Setup Complete! ═══${NC}"
echo -e "
${BLUE}What was created:${NC}
✅ Vite SSR configuration
✅ Custom ISR engine with file caching
✅ Enhanced route extraction with TTL configuration
✅ Supabase data layer with real queries
✅ Production-ready server with security features
✅ Build and development scripts
✅ Monitoring and debugging tools
✅ Deployment configurations (PM2, Docker, Nginx)
✅ Webhook integration for cache invalidation

${BLUE}Architecture:${NC}
┌─────────────────┐     ┌──────────────┐     ┌──────────────┐
│ Magic Patterns  │────▶│ React SSR    │────▶│ ISR Cache    │
│ (ISRCSR=ISR/CSR)│     │ (Vite)       │     │ (TTL-based)  │
└─────────────────┘     └──────────────┘     └──────────────┘
         ↓                      ↓                     ↓
┌─────────────────┐     ┌──────────────┐     ┌──────────────┐
│ Supabase Data   │     │ Express      │     │ Webhook      │
│ (Real Queries)  │     │ Server       │     │ Invalidation │
└─────────────────┘     └──────────────┘     └──────────────┘

${BLUE}Key enhancements:${NC}
• Real Supabase integration with proper queries
• Community-based routing support
• Smart TTL configuration per page type
• Production security (Helmet, CORS, rate limiting)
• Comprehensive monitoring tools
• Automated deployment setup
• Webhook-based cache invalidation

${BLUE}Time taken:${NC} ${MINUTES}m ${SECONDS}s

${BLUE}Quick start:${NC}
1. Configure environment: ${YELLOW}cp .env.example .env${NC}
2. Add Supabase credentials to .env
3. Copy Magic Patterns: ${YELLOW}cp -r $MAGIC_PATTERNS_DIR/src/components/* src/components/${NC}
4. Start development: ${YELLOW}./dev.sh${NC}

${BLUE}Or use the quick start script:${NC}
${YELLOW}./quick-start.sh $MAGIC_PATTERNS_DIR${NC}

${BLUE}Monitoring commands:${NC}
• Health check: ${YELLOW}./check-health.sh${NC}
• Cache monitor: ${YELLOW}./monitor-cache.sh${NC}
• Debug route: ${YELLOW}./debug-ssr.sh /article/test${NC}
• Revalidate: ${YELLOW}./revalidate.sh /news downtown${NC}

${BLUE}Production deployment:${NC}
• Build: ${YELLOW}./build-prod.sh${NC}
• Deploy: ${YELLOW}pm2 start pm2/ecosystem.config.js${NC}
• Docker: ${YELLOW}docker-compose up -d${NC}
"

# Create a comprehensive README
cat > VERSION_B_ENHANCED_README.md << EOF
# Version B Enhanced: Custom ISR with Supabase Integration

## Overview

Enhanced Version B implements a production-ready custom ISR system with:
- **Vite** for React SSR and fast development
- **Supabase** integration with real database queries
- **Smart caching** with TTL based on content type
- **Multi-community** routing support
- **Webhook invalidation** for real-time updates
- **Production tooling** for deployment and monitoring

## Quick Start

\`\`\`bash
# Quick setup with Magic Patterns
./quick-start.sh /path/to/magic-patterns

# Or manual setup
cp .env.example .env
# Edit .env with your Supabase credentials
cp -r ../magic/src/components/* src/components/
./dev.sh
\`\`\`

## Key Features

### 1. Smart ISR Caching
- Automatic TTL based on page type (5min for news, 6hr for businesses)
- Stale-while-revalidate pattern
- Background regeneration with worker threads

### 2. Supabase Integration
- Real queries for all entities (news, events, businesses, etc.)
- Relationship loading with proper joins
- Community-scoped data fetching

### 3. Cache Invalidation
- Webhook endpoints for real-time updates
- Database triggers for automatic invalidation
- Manual revalidation tools

### 4. Production Ready
- Security headers (Helmet)
- Rate limiting
- CORS configuration
- Health monitoring
- Graceful shutdown

### 5. Developer Tools
- Real-time cache monitoring
- SSR debugging utilities
- Route testing tools
- Performance metrics

## Architecture

\`\`\`
User Request → Nginx → Express Server → ISR Middleware
                                              ↓
                                    Cache Hit? → Return Cached
                                         ↓ No
                                    Fetch Data → Supabase
                                         ↓
                                    SSR Render → Cache → Return
\`\`\`

## Monitoring

\`\`\`bash
# System health
./check-health.sh

# Cache performance
./monitor-cache.sh

# Debug specific route
./debug-ssr.sh /article/breaking-news

# Manual revalidation
./revalidate.sh /events downtown
\`\`\`

## Deployment

### PM2
\`\`\`bash
npm run build:prod
pm2 start pm2/ecosystem.config.js
\`\`\`

### Docker
\`\`\`bash
docker-compose up -d
\`\`\`

### Systemd
\`\`\`bash
sudo cp deployment/systemd/daynews.service /etc/systemd/system/
sudo systemctl enable daynews
sudo systemctl start daynews
\`\`\`

## Cache Invalidation

### Automatic (Database Triggers)
1. Install triggers: \`psql < webhooks/supabase-triggers.sql\`
2. Configure webhook secret in .env
3. Cache automatically invalidates on content changes

### Manual
\`\`\`bash
# Via script
./revalidate.sh /article/my-article

# Via API
curl -X POST http://localhost:3000/api/revalidate \\
  -H "Content-Type: application/json" \\
  -d '{"route": "/news"}'
\`\`\`

## Performance Tuning

1. **TTL Configuration**: Edit \`scripts/extract-metadata-enhanced.js\`
2. **Worker Threads**: Set \`MAX_WORKERS\` in .env
3. **Cache Size**: Configure max entries in ISR engine
4. **Database Queries**: Optimize in \`server/data/provider.js\`

## Troubleshooting

### Cache not updating
1. Check webhook configuration
2. Verify database triggers
3. Test manual revalidation
4. Check server logs

### Performance issues
1. Monitor cache hit rate
2. Adjust TTL values
3. Enable query caching
4. Scale worker threads

### Database connection
1. Verify Supabase credentials
2. Check network connectivity
3. Enable mock data fallback
EOF

echo -e "${GREEN}📝 Created VERSION_B_ENHANCED_README.md${NC}"
echo -e "\n${GREEN}🎉 Enhanced Version B setup complete!${NC}"