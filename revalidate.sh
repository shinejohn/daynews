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
