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
