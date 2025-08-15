#!/bin/bash

# Version B - Step 5c: Monitoring & Debug Tools
# Creates tools for monitoring cache, debugging SSR, and system health

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}╔═══════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║     Step 5c: Monitoring & Debug Tools                     ║${NC}"
echo -e "${BLUE}╚═══════════════════════════════════════════════════════════╝${NC}"
echo ""

# Create cache monitoring script
echo -e "${YELLOW}Creating cache monitoring script...${NC}"
cat > monitor-cache.sh << 'EOF'
#!/bin/bash

echo "📊 Cache Monitor"
echo "==============="

# Check if jq is installed
if ! command -v jq &> /dev/null; then
    echo "⚠️  jq is required. Install with: brew install jq (Mac) or apt-get install jq (Linux)"
    exit 1
fi

while true; do
  clear
  echo "📊 Cache Statistics - $(date)"
  echo "================================"
  
  # Show cache stats via API
  STATS=$(curl -s http://localhost:3000/health 2>/dev/null)
  
  if [ $? -eq 0 ]; then
    echo "Cache Performance:"
    echo "$STATS" | jq -r '.cache | "  Hit Rate: \(.hitRate * 100 | floor)%"'
    echo "$STATS" | jq -r '.cache | "  Total Hits: \(.hits)"'
    echo "$STATS" | jq -r '.cache | "  Total Misses: \(.misses)"'
    echo "$STATS" | jq -r '.cache | "  Entries: \(.entries)"'
    echo ""
    echo "System Info:"
    echo "$STATS" | jq -r '"  Database: \(.database)"'
    echo "$STATS" | jq -r '"  Uptime: \(.uptime | floor)s"'
    echo "$STATS" | jq -r '.memory | "  Memory: \(.heapUsed / 1024 / 1024 | floor)MB / \(.heapTotal / 1024 / 1024 | floor)MB"'
  else
    echo "❌ Server not responding"
  fi
  
  echo ""
  echo "📁 Recent Cache Files:"
  echo "---------------------"
  ls -lat cache/*.json 2>/dev/null | head -10 | while read line; do
    echo "  $line"
  done || echo "  No cache files found"
  
  echo ""
  echo "💾 Cache Size: $(du -sh cache 2>/dev/null | cut -f1 || echo '0')"
  echo ""
  echo "Press Ctrl+C to exit | Refreshing in 5s..."
  
  sleep 5
done
EOF

chmod +x monitor-cache.sh

# Create revalidation script
echo -e "${YELLOW}Creating revalidation script...${NC}"
cat > revalidate.sh << 'EOF'
#!/bin/bash

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

if [ -z "$1" ]; then
  echo "Usage: $0 <route> [community]"
  echo ""
  echo "Examples:"
  echo "  $0 /article/my-article"
  echo "  $0 /events downtown"
  echo "  $0 /business/joes-coffee northbeach"
  exit 1
fi

ROUTE="$1"
COMMUNITY="${2:-}"

echo -e "${YELLOW}🔄 Revalidating: $ROUTE${NC}"
if [ -n "$COMMUNITY" ]; then
  echo -e "${YELLOW}   Community: $COMMUNITY${NC}"
fi

# Build the request
if [ -n "$COMMUNITY" ]; then
  DATA="{\"route\": \"$ROUTE\", \"community\": \"$COMMUNITY\"}"
else
  DATA="{\"route\": \"$ROUTE\"}"
fi

# Send revalidation request
RESPONSE=$(curl -s -X POST http://localhost:3000/api/revalidate \
  -H "Content-Type: application/json" \
  -d "$DATA" \
  -w "\n%{http_code}")

HTTP_CODE=$(echo "$RESPONSE" | tail -n 1)
BODY=$(echo "$RESPONSE" | head -n -1)

if [ "$HTTP_CODE" = "200" ]; then
  echo -e "${GREEN}✅ Revalidation successful${NC}"
  echo "$BODY" | jq . 2>/dev/null || echo "$BODY"
else
  echo -e "${RED}❌ Revalidation failed (HTTP $HTTP_CODE)${NC}"
  echo "$BODY"
fi
EOF

chmod +x revalidate.sh

# Create SSR debug script
echo -e "${YELLOW}Creating SSR debug script...${NC}"
cat > debug-ssr.sh << 'EOF'
#!/bin/bash

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🔍 SSR Debug Tool${NC}"
echo "================="

if [ -z "$1" ]; then
  echo "Usage: $0 <route>"
  echo ""
  echo "Examples:"
  echo "  $0 /"
  echo "  $0 /article/test-article"
  echo "  $0 /downtown/events"
  exit 1
fi

ROUTE="$1"
echo -e "${YELLOW}Testing route: $ROUTE${NC}"
echo ""

# Test 1: Check if route exists in config
echo -e "${BLUE}1. Checking route configuration...${NC}"
if [ -f "route-config.json" ]; then
  ROUTE_INFO=$(node -e "
    const config = require('./route-config.json');
    const route = '$ROUTE';
    const info = config.routes[route];
    if (info) {
      console.log('Found:', JSON.stringify(info, null, 2));
    } else {
      // Try pattern matching
      for (const [pattern, cfg] of Object.entries(config.routes)) {
        if (pattern.includes(':')) {
          const regex = new RegExp('^' + pattern.replace(/:[^/]+/g, '[^/]+') + '$');
          if (regex.test(route)) {
            console.log('Matched pattern:', pattern);
            console.log(JSON.stringify(cfg, null, 2));
            break;
          }
        }
      }
    }
  " 2>&1)
  
  if [ -n "$ROUTE_INFO" ]; then
    echo -e "${GREEN}✓ Route configuration:${NC}"
    echo "$ROUTE_INFO"
  else
    echo -e "${RED}✗ Route not found in configuration${NC}"
  fi
else
  echo -e "${RED}✗ route-config.json not found${NC}"
fi

echo ""

# Test 2: Direct SSR request
echo -e "${BLUE}2. Testing SSR response...${NC}"
START_TIME=$(date +%s%N)
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}\n%{time_total}\n%{size_download}" http://localhost:3000$ROUTE)
END_TIME=$(date +%s%N)

HTTP_CODE=$(echo "$RESPONSE" | sed -n '1p')
TIME_TOTAL=$(echo "$RESPONSE" | sed -n '2p')
SIZE=$(echo "$RESPONSE" | sed -n '3p')

if [ "$HTTP_CODE" = "200" ]; then
  echo -e "${GREEN}✓ HTTP Status: $HTTP_CODE${NC}"
  echo -e "  Response time: ${TIME_TOTAL}s"
  echo -e "  Response size: $(echo "scale=2; $SIZE/1024" | bc)KB"
else
  echo -e "${RED}✗ HTTP Status: $HTTP_CODE${NC}"
fi

echo ""

# Test 3: Check cache status
echo -e "${BLUE}3. Checking cache status...${NC}"
CACHE_FILE="cache/$(echo -n "$ROUTE" | md5sum | cut -d' ' -f1).json"
if [ -f "$CACHE_FILE" ]; then
  echo -e "${GREEN}✓ Cache file exists${NC}"
  CACHE_INFO=$(node -e "
    const fs = require('fs');
    const cache = JSON.parse(fs.readFileSync('$CACHE_FILE', 'utf8'));
    const now = Date.now();
    const age = Math.floor((now - cache.createdAt) / 1000);
    const ttl = Math.floor((cache.expiresAt - now) / 1000);
    console.log('  Created:', new Date(cache.createdAt).toLocaleString());
    console.log('  Age:', age + 's');
    console.log('  TTL remaining:', ttl > 0 ? ttl + 's' : 'EXPIRED');
    console.log('  Size:', (Buffer.byteLength(cache.html) / 1024).toFixed(2) + 'KB');
  " 2>&1)
  echo "$CACHE_INFO"
else
  echo -e "${YELLOW}⚠ No cache file found${NC}"
fi

echo ""

# Test 4: Data fetching
echo -e "${BLUE}4. Testing data layer...${NC}"
DATA_TEST=$(curl -s http://localhost:3000/api/health | jq -r '.database' 2>/dev/null)
if [ "$DATA_TEST" = "connected" ] || [ "$DATA_TEST" = "supabase" ]; then
  echo -e "${GREEN}✓ Database connected: Supabase${NC}"
elif [ "$DATA_TEST" = "mock" ]; then
  echo -e "${YELLOW}⚠ Using mock data (no Supabase connection)${NC}"
else
  echo -e "${RED}✗ Cannot determine database status${NC}"
fi

echo ""
echo -e "${BLUE}Debug complete!${NC}"
EOF

chmod +x debug-ssr.sh

# Create health check script
echo -e "${YELLOW}Creating health check script...${NC}"
cat > check-health.sh << 'EOF'
#!/bin/bash

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🏥 System Health Check${NC}"
echo "====================="

# Function to check service
check_service() {
  local name=$1
  local url=$2
  local expected=$3
  
  RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "$url" 2>/dev/null)
  
  if [ "$RESPONSE" = "$expected" ]; then
    echo -e "${GREEN}✓ $name${NC}"
    return 0
  else
    echo -e "${RED}✗ $name (HTTP $RESPONSE)${NC}"
    return 1
  fi
}

# Check main services
echo -e "${YELLOW}Services:${NC}"
check_service "Web Server" "http://localhost:3000/" "200"
check_service "Health API" "http://localhost:3000/health" "200"
check_service "API Endpoint" "http://localhost:3000/api/health" "200"

echo ""

# Get detailed health info
HEALTH=$(curl -s http://localhost:3000/health 2>/dev/null)

if [ $? -eq 0 ]; then
  echo -e "${YELLOW}System Status:${NC}"
  echo "$HEALTH" | jq -r '"  Environment: \(.environment)"'
  echo "$HEALTH" | jq -r '"  Database: \(.database)"'
  echo "$HEALTH" | jq -r '"  Uptime: \(.uptime | floor)s (\(.uptime / 60 | floor)m)"'
  
  echo ""
  echo -e "${YELLOW}Cache Performance:${NC}"
  echo "$HEALTH" | jq -r '.cache | "  Hit Rate: \((.hitRate * 100) | floor)%"'
  echo "$HEALTH" | jq -r '.cache | "  Entries: \(.entries)"'
  echo "$HEALTH" | jq -r '.cache | "  Total Requests: \(.hits + .misses)"'
  
  echo ""
  echo -e "${YELLOW}Memory Usage:${NC}"
  echo "$HEALTH" | jq -r '.memory | "  Heap Used: \(.heapUsed / 1024 / 1024 | floor)MB"'
  echo "$HEALTH" | jq -r '.memory | "  Heap Total: \(.heapTotal / 1024 / 1024 | floor)MB"'
  echo "$HEALTH" | jq -r '.memory | "  External: \(.external / 1024 / 1024 | floor)MB"'
  
  # Check cache directory
  echo ""
  echo -e "${YELLOW}Cache Storage:${NC}"
  if [ -d "cache" ]; then
    CACHE_COUNT=$(ls -1 cache/*.json 2>/dev/null | wc -l)
    CACHE_SIZE=$(du -sh cache 2>/dev/null | cut -f1)
    echo "  Files: $CACHE_COUNT"
    echo "  Size: $CACHE_SIZE"
  else
    echo -e "  ${RED}Cache directory not found${NC}"
  fi
else
  echo -e "${RED}❌ Cannot fetch health data${NC}"
fi

echo ""
echo -e "${BLUE}Health check complete!${NC}"
EOF

chmod +x check-health.sh

# Install jq if needed
echo -e "${YELLOW}Checking for jq installation...${NC}"
if ! command -v jq &> /dev/null; then
    echo -e "${YELLOW}Installing jq for JSON parsing...${NC}"
    npm install -g jq-cli-wrapper
fi

echo -e "${GREEN}✅ Monitoring tools created!${NC}"
echo ""
echo -e "${BLUE}Available tools:${NC}"
echo "   ${YELLOW}./monitor-cache.sh${NC} - Real-time cache monitoring"
echo "   ${YELLOW}./revalidate.sh <route>${NC} - Manual cache revalidation"
echo "   ${YELLOW}./debug-ssr.sh <route>${NC} - Debug SSR rendering"
echo "   ${YELLOW}./check-health.sh${NC} - System health check"
echo ""
echo -e "${BLUE}Examples:${NC}"
echo "   ${YELLOW}./revalidate.sh /article/breaking-news${NC}"
echo "   ${YELLOW}./debug-ssr.sh /downtown/events${NC}"
echo ""
echo -e "${BLUE}Next: Run ./05d-deployment-config.sh${NC}"