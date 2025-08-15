#!/bin/bash

# Version B - Step 5e: Webhook Setup & Examples
# Creates webhook configurations for cache invalidation

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
NC='\033[0m'

echo -e "${BLUE}╔═══════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║     Step 5e: Webhook Setup & Cache Invalidation           ║${NC}"
echo -e "${BLUE}╚═══════════════════════════════════════════════════════════╝${NC}"
echo ""

# Create webhook examples directory
echo -e "${YELLOW}Creating webhook examples...${NC}"
mkdir -p webhooks

# Create Supabase webhook functions
cat > webhooks/supabase-triggers.sql << 'EOF'
-- Supabase Database Webhook Triggers for Cache Invalidation
-- Install these triggers in your Supabase SQL editor

-- 1. News Article Published/Updated
CREATE OR REPLACE FUNCTION notify_article_changed()
RETURNS trigger AS $$
BEGIN
  -- Only notify if article is published
  IF NEW.status = 'published' THEN
    PERFORM pg_notify(
      'cache_invalidation',
      json_build_object(
        'type', 'news',
        'action', CASE 
          WHEN OLD.status != 'published' THEN 'publish'
          ELSE 'update'
        END,
        'data', json_build_object(
          'slug', NEW.slug,
          'author_id', NEW.author_id,
          'community_id', NEW.community_id,
          'old_slug', OLD.slug
        )
      )::text
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER article_changed_trigger
AFTER INSERT OR UPDATE ON news
FOR EACH ROW
EXECUTE FUNCTION notify_article_changed();

-- 2. Event Created/Updated
CREATE OR REPLACE FUNCTION notify_event_changed()
RETURNS trigger AS $$
BEGIN
  PERFORM pg_notify(
    'cache_invalidation',
    json_build_object(
      'type', 'event',
      'action', CASE 
        WHEN TG_OP = 'INSERT' THEN 'create'
        ELSE 'update'
      END,
      'data', json_build_object(
        'slug', NEW.slug,
        'community_id', NEW.community_id,
        'start_date', NEW.start_date,
        'category_id', NEW.category_id
      )
    )::text
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER event_changed_trigger
AFTER INSERT OR UPDATE ON events
FOR EACH ROW
EXECUTE FUNCTION notify_event_changed();

-- 3. Business Review Posted
CREATE OR REPLACE FUNCTION notify_review_posted()
RETURNS trigger AS $$
DECLARE
  business_record RECORD;
BEGIN
  -- Get business details
  SELECT slug, community_id, name 
  INTO business_record
  FROM businesses 
  WHERE id = NEW.business_id;
  
  PERFORM pg_notify(
    'cache_invalidation',
    json_build_object(
      'type', 'business',
      'action', 'review',
      'data', json_build_object(
        'business_id', NEW.business_id,
        'business_slug', business_record.slug,
        'community_id', business_record.community_id,
        'rating', NEW.rating
      )
    )::text
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER review_posted_trigger
AFTER INSERT ON reviews
FOR EACH ROW
EXECUTE FUNCTION notify_review_posted();

-- 4. Deal Activated/Deactivated
CREATE OR REPLACE FUNCTION notify_deal_changed()
RETURNS trigger AS $$
DECLARE
  business_record RECORD;
BEGIN
  SELECT b.slug, b.community_id 
  INTO business_record
  FROM businesses b
  WHERE b.id = NEW.business_id;
  
  IF NEW.is_active != OLD.is_active OR TG_OP = 'INSERT' THEN
    PERFORM pg_notify(
      'cache_invalidation',
      json_build_object(
        'type', 'deal',
        'action', CASE 
          WHEN NEW.is_active THEN 'activate'
          ELSE 'deactivate'
        END,
        'data', json_build_object(
          'deal_id', NEW.id,
          'business_slug', business_record.slug,
          'community_id', business_record.community_id
        )
      )::text
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER deal_changed_trigger
AFTER INSERT OR UPDATE ON deals
FOR EACH ROW
EXECUTE FUNCTION notify_deal_changed();

-- 5. Announcement Published
CREATE OR REPLACE FUNCTION notify_announcement_published()
RETURNS trigger AS $$
BEGIN
  IF NEW.status = 'published' AND (OLD.status IS NULL OR OLD.status != 'published') THEN
    PERFORM pg_notify(
      'cache_invalidation',
      json_build_object(
        'type', 'announcement',
        'action', 'publish',
        'data', json_build_object(
          'slug', NEW.slug,
          'community_id', NEW.community_id,
          'type', NEW.type,
          'priority', NEW.priority
        )
      )::text
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER announcement_published_trigger
AFTER INSERT OR UPDATE ON announcements
FOR EACH ROW
EXECUTE FUNCTION notify_announcement_published();

-- 6. Hub Post Created/Updated
CREATE OR REPLACE FUNCTION notify_hub_activity()
RETURNS trigger AS $$
DECLARE
  hub_record RECORD;
BEGIN
  SELECT slug, community_id 
  INTO hub_record
  FROM interest_hubs 
  WHERE id = NEW.hub_id;
  
  PERFORM pg_notify(
    'cache_invalidation',
    json_build_object(
      'type', 'hub',
      'action', TG_OP,
      'data', json_build_object(
        'hub_slug', hub_record.slug,
        'community_id', hub_record.community_id,
        'post_id', NEW.id
      )
    )::text
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER hub_activity_trigger
AFTER INSERT OR UPDATE ON hub_posts
FOR EACH ROW
EXECUTE FUNCTION notify_hub_activity();
EOF

# Create Supabase Edge Function
cat > webhooks/supabase-edge-function.ts << 'EOF'
// supabase/functions/cache-invalidation/index.ts
// Deploy with: supabase functions deploy cache-invalidation

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const WEBHOOK_URL = Deno.env.get('ISR_WEBHOOK_URL')!
const WEBHOOK_SECRET = Deno.env.get('WEBHOOK_SECRET')!

serve(async (req) => {
  try {
    // Verify webhook secret
    const authHeader = req.headers.get('x-webhook-secret')
    if (authHeader !== WEBHOOK_SECRET) {
      return new Response('Unauthorized', { status: 401 })
    }

    const { type, action, data } = await req.json()

    // Forward to ISR server
    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Webhook-Secret': WEBHOOK_SECRET
      },
      body: JSON.stringify({ type, action, data })
    })

    // Log for debugging
    console.log(`Cache invalidation: ${type}:${action}`, data)

    return new Response(
      JSON.stringify({ 
        success: response.ok,
        invalidated: `${type}:${action}`
      }),
      { 
        headers: { 'Content-Type': 'application/json' },
        status: response.ok ? 200 : 500
      }
    )
  } catch (error) {
    console.error('Webhook error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})
EOF

# Create webhook testing script
cat > webhooks/test-webhooks.sh << 'EOF'
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
EOF

chmod +x webhooks/test-webhooks.sh

# Create webhook integration guide
cat > webhooks/INTEGRATION_GUIDE.md << 'EOF'
# Webhook Integration Guide

## Overview

The ISR system uses webhooks to trigger cache invalidation when content changes in the database. This ensures users always see the latest content while maintaining excellent performance.

## Setup Steps

### 1. Database Triggers (Supabase)

1. Open your Supabase dashboard
2. Go to SQL Editor
3. Copy and run the contents of `supabase-triggers.sql`
4. Verify triggers are created in Database > Triggers

### 2. Edge Function (Optional)

If you want to process webhooks through Supabase Edge Functions:

```bash
# Install Supabase CLI
npm install -g supabase

# Login
supabase login

# Create function
supabase functions new cache-invalidation

# Copy the TypeScript code
cp supabase-edge-function.ts supabase/functions/cache-invalidation/index.ts

# Deploy
supabase functions deploy cache-invalidation

# Set secrets
supabase secrets set ISR_WEBHOOK_URL=https://your-server.com/webhook/invalidate
supabase secrets set WEBHOOK_SECRET=your-secret-key
```

### 3. Direct Database Webhooks

For direct PostgreSQL to server communication:

1. Install pg_net extension in Supabase
2. Create webhook endpoints:

```sql
SELECT net.http_post(
  url := 'https://your-server.com/webhook/invalidate',
  headers := jsonb_build_object(
    'Content-Type', 'application/json',
    'X-Webhook-Secret', 'your-secret'
  ),
  body := jsonb_build_object(
    'type', 'news',
    'action', 'publish',
    'data', jsonb_build_object(
      'slug', 'article-slug',
      'community_id', 'downtown'
    )
  )
);
```

### 4. Server Configuration

Update your `.env` file:

```env
# Webhook Security
WEBHOOK_SECRET=your-secret-key
ALLOWED_WEBHOOK_IPS=supabase-ip-range

# Cache Invalidation
INVALIDATE_ON_PUBLISH=true
INVALIDATE_RELATED_ROUTES=true
```

## Webhook Payload Format

All webhooks should send JSON payloads in this format:

```json
{
  "type": "entity_type",
  "action": "action_name",
  "data": {
    "field1": "value1",
    "field2": "value2"
  }
}
```

### Entity Types

- `news` - News articles
- `event` - Events
- `business` - Business listings
- `deal` - Business deals
- `announcement` - Community announcements
- `hub` - Interest hub posts

### Actions

- `publish` - Content published
- `update` - Content updated
- `delete` - Content deleted
- `review` - New review posted
- `activate` - Deal/feature activated
- `deactivate` - Deal/feature deactivated

## Testing Webhooks

Use the provided test script:

```bash
# Test all webhook types
./test-webhooks.sh

# Test specific webhook
API_URL=https://your-server.com/webhook/invalidate \
WEBHOOK_SECRET=your-secret \
./test-webhooks.sh
```

## Cache Invalidation Rules

When a webhook is received, the following routes are invalidated:

### News Article Published
- `/article/{slug}`
- `/news`
- `/`
- `/author/{author_id}`
- `/{community}/article/{slug}`
- `/{community}/news`
- `/{community}`

### Event Updated
- `/event/{slug}`
- `/events`
- `/events/calendar`
- `/`
- `/{community}/event/{slug}`
- `/{community}/events`

### Business Review
- `/business/{slug}`
- `/businesses`
- `/reviews`
- `/{community}/business/{slug}`

### Deal Change
- `/deals`
- `/business/{slug}`
- `/{community}/deals`

### Announcement
- `/announcements`
- `/`
- `/{community}/announcements`

## Monitoring

Check webhook processing:

```bash
# View webhook logs
tail -f logs/webhooks.log

# Check invalidation stats
curl http://localhost:3000/api/health | jq '.webhooks'

# Monitor cache invalidations
./monitor-cache.sh
```

## Security Best Practices

1. **Always verify webhook secret**
2. **Validate payload structure**
3. **Rate limit webhook endpoints**
4. **Log all webhook activity**
5. **Use HTTPS for webhook URLs**
6. **Whitelist Supabase IPs**

## Troubleshooting

### Webhooks not triggering
- Check database triggers exist
- Verify pg_notify is working
- Check Edge Function logs

### Cache not invalidating
- Verify webhook secret matches
- Check server logs for errors
- Test manual invalidation

### Performance issues
- Batch invalidations
- Use async processing
- Implement webhook queue
EOF

# Create example webhook server middleware
cat > webhooks/webhook-middleware.js << 'EOF'
// Example Express middleware for webhook authentication

export function webhookAuth(req, res, next) {
  const secret = req.headers['x-webhook-secret']
  
  if (!secret || secret !== process.env.WEBHOOK_SECRET) {
    return res.status(401).json({ error: 'Invalid webhook secret' })
  }
  
  // Optional: Verify source IP
  const sourceIP = req.ip || req.connection.remoteAddress
  const allowedIPs = process.env.ALLOWED_WEBHOOK_IPS?.split(',') || []
  
  if (allowedIPs.length > 0 && !allowedIPs.includes(sourceIP)) {
    console.warn(`Webhook from unauthorized IP: ${sourceIP}`)
    // You might want to allow in dev but block in production
  }
  
  // Log webhook
  console.log(`Webhook received: ${req.body.type}:${req.body.action}`)
  
  next()
}

// Example webhook handler with validation
export async function handleWebhook(req, res) {
  const { type, action, data } = req.body
  
  // Validate payload
  if (!type || !action || !data) {
    return res.status(400).json({ 
      error: 'Invalid payload: type, action, and data required' 
    })
  }
  
  // Validate entity type
  const validTypes = ['news', 'event', 'business', 'deal', 'announcement', 'hub']
  if (!validTypes.includes(type)) {
    return res.status(400).json({ 
      error: `Invalid type: ${type}` 
    })
  }
  
  try {
    // Process webhook based on type and action
    const routes = getInvalidationTargets(type, action, data)
    
    // Queue invalidations
    const results = await Promise.allSettled(
      routes.map(route => isrEngine.revalidate(route))
    )
    
    // Log results
    const succeeded = results.filter(r => r.status === 'fulfilled').length
    const failed = results.filter(r => r.status === 'rejected').length
    
    console.log(`Invalidation complete: ${succeeded} succeeded, ${failed} failed`)
    
    res.json({
      success: true,
      invalidated: routes.length,
      succeeded,
      failed
    })
  } catch (error) {
    console.error('Webhook processing error:', error)
    res.status(500).json({ 
      error: 'Failed to process webhook' 
    })
  }
}
EOF

echo -e "${GREEN}✅ Webhook setup complete!${NC}"
echo ""
echo -e "${BLUE}Created files:${NC}"
echo "   ${YELLOW}webhooks/supabase-triggers.sql${NC} - Database triggers"
echo "   ${YELLOW}webhooks/supabase-edge-function.ts${NC} - Edge function"
echo "   ${YELLOW}webhooks/test-webhooks.sh${NC} - Testing script"
echo "   ${YELLOW}webhooks/INTEGRATION_GUIDE.md${NC} - Setup guide"
echo "   ${YELLOW}webhooks/webhook-middleware.js${NC} - Server middleware"
echo ""
echo -e "${BLUE}Next steps:${NC}"
echo "1. Install database triggers in Supabase"
echo "2. Configure webhook secret in .env"
echo "3. Test webhooks: ${YELLOW}./webhooks/test-webhooks.sh${NC}"
echo ""
echo -e "${GREEN}All Version B scripts complete! 🎉${NC}"