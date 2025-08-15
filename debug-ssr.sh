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
