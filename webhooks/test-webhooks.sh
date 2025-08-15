#!/bin/bash

# Webhook Testing Script
# Tests various cache invalidation scenarios

API_URL="${API_URL:-http://localhost:3000/webhook/invalidate}"
SECRET="${WEBHOOK_SECRET:-test-secret}"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}Testing Cache Invalidation Webhooks${NC}"
echo "==================================="

# Function to send webhook
send_webhook() {
  local name=$1
  local payload=$2
  
  echo -e "${YELLOW}Testing: $name${NC}"
  
  RESPONSE=$(curl -s -X POST "$API_URL" \
    -H "Content-Type: application/json" \
    -H "X-Webhook-Secret: $SECRET" \
    -d "$payload" \
    -w "\n%{http_code}")
  
  HTTP_CODE=$(echo "$RESPONSE" | tail -n 1)
  BODY=$(echo "$RESPONSE" | head -n -1)
  
  if [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✓ Success${NC}"
    echo "$BODY" | jq . 2>/dev/null || echo "$BODY"
  else
    echo -e "${RED}✗ Failed (HTTP $HTTP_CODE)${NC}"
    echo "$BODY"
  fi
  echo ""
}

# Test cases
echo -e "${BLUE}1. News Article Published${NC}"
send_webhook "Article Published" '{
  "type": "news",
  "action": "publish",
  "data": {
    "slug": "breaking-news-2024",
    "author_id": "123",
    "community_id": "downtown"
  }
}'

echo -e "${BLUE}2. Event Updated${NC}"
send_webhook "Event Updated" '{
  "type": "event",
  "action": "update",
  "data": {
    "slug": "summer-concert",
    "community_id": "downtown",
    "start_date": "2024-07-01T18:00:00Z"
  }
}'

echo -e "${BLUE}3. Business Review Posted${NC}"
send_webhook "Review Posted" '{
  "type": "business",
  "action": "review",
  "data": {
    "business_slug": "joes-coffee",
    "community_id": "downtown",
    "rating": 5
  }
}'

echo -e "${BLUE}4. Deal Activated${NC}"
send_webhook "Deal Activated" '{
  "type": "deal",
  "action": "activate",
  "data": {
    "business_slug": "pizza-palace",
    "community_id": "northbeach"
  }
}'

echo -e "${BLUE}5. Announcement Published${NC}"
send_webhook "Announcement Published" '{
  "type": "announcement",
  "action": "publish",
  "data": {
    "slug": "community-meeting",
    "community_id": "downtown",
    "priority": "high"
  }
}'

echo -e "${BLUE}Webhook tests complete!${NC}"
