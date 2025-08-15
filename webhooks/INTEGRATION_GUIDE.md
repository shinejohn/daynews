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
