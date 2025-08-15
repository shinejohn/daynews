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
