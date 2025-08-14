-- Seed data for Day News application

-- Insert communities (if not exists)
INSERT INTO communities (id, name, description, member_count, is_active, created_at) 
VALUES 
  ('clearwater-fl', 'Clearwater, FL', 'Local news and events for Clearwater, Florida', 125000, true, NOW()),
  ('tampa-bay', 'Tampa Bay Area', 'Regional news for the Tampa Bay metropolitan area', 450000, true, NOW()),
  ('st-pete', 'St. Petersburg, FL', 'Local news and events for St. Petersburg', 95000, true, NOW())
ON CONFLICT (id) DO NOTHING;

-- Insert sample news articles
INSERT INTO news (
  title, 
  slug,
  description, 
  content,
  category, 
  author_name,
  author_id,
  community_id,
  image_url,
  is_featured,
  is_published,
  read_time,
  location,
  tags,
  created_at,
  published_at
) VALUES 
  (
    'Clearwater City Council Approves $89.2M Budget for 2025 Fiscal Year',
    'clearwater-city-council-approves-budget-2025',
    'The budget maintains the current millage rate while increasing funding for infrastructure and public safety initiatives.',
    'The Clearwater City Council unanimously approved a $89.2 million budget for the 2025 fiscal year during Thursday night''s meeting. The budget maintains the current millage rate of 5.95 mills while allocating increased funding for critical infrastructure improvements and public safety initiatives. Mayor Frank Hibbard praised the collaborative effort, noting that the budget reflects community priorities identified during public input sessions held throughout the summer.',
    'Government',
    'Sarah Johnson',
    null,
    'clearwater-fl',
    'https://images.unsplash.com/photo-1577495508326-19a1b3cf65b7?ixlib=rb-4.0.3&auto=format&fit=crop&w=1280&q=80',
    true,
    true,
    5,
    'City Hall',
    ARRAY['budget', 'city-council', 'government', 'clearwater'],
    NOW() - INTERVAL '2 hours',
    NOW() - INTERVAL '2 hours'
  ),
  (
    'New Waterfront Development Project Breaks Ground in Downtown Clearwater',
    'waterfront-development-downtown-clearwater',
    'The $120 million mixed-use development will feature retail, restaurants, and luxury condominiums along the waterfront.',
    'Construction began Monday on Clearwater''s highly anticipated waterfront development project, marking a significant milestone in the city''s downtown revitalization efforts. The $120 million mixed-use development, known as "Clearwater Bay Walk," will transform 12 acres of underutilized waterfront property into a vibrant destination featuring retail shops, restaurants, public spaces, and 200 luxury condominium units.',
    'Development',
    'Michael Chen',
    null,
    'clearwater-fl',
    'https://images.unsplash.com/photo-1545127398-14699f92334b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1280&q=80',
    true,
    true,
    4,
    'Downtown',
    ARRAY['development', 'real-estate', 'waterfront', 'clearwater'],
    NOW() - INTERVAL '1 day',
    NOW() - INTERVAL '1 day'
  ),
  (
    'Clearwater Beach Ranked #1 in USA Today''s Best Beach Towns',
    'clearwater-beach-ranked-best-beach-town',
    'For the third consecutive year, Clearwater Beach tops the list of America''s best beach destinations.',
    'Clearwater Beach has once again been crowned America''s best beach town by USA Today''s 10Best Readers'' Choice Awards. This marks the third consecutive year the pristine white-sand destination has claimed the top spot, beating out competitors from Hawaii, California, and the East Coast.',
    'Tourism',
    'Jennifer Martinez',
    null,
    'clearwater-fl',
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1280&q=80',
    true,
    true,
    3,
    'Clearwater Beach',
    ARRAY['tourism', 'beach', 'awards', 'clearwater-beach'],
    NOW() - INTERVAL '3 days',
    NOW() - INTERVAL '3 days'
  ),
  (
    'Local High School Robotics Team Advances to State Championship',
    'clearwater-high-robotics-state-championship',
    'Clearwater High School''s robotics team secured their spot at the state championship after winning the regional competition.',
    'The Clearwater High School Hurricanes robotics team is heading to the state championship after a commanding victory at the regional FIRST Robotics Competition held in Tampa last weekend. The team''s innovative robot design and flawless execution earned them the top spot among 32 competing schools.',
    'Education',
    'David Wilson',
    null,
    'clearwater-fl',
    'https://images.unsplash.com/photo-1581092160562-40aa08e78837?ixlib=rb-4.0.3&auto=format&fit=crop&w=1280&q=80',
    false,
    true,
    4,
    'Clearwater High School',
    ARRAY['education', 'robotics', 'stem', 'students'],
    NOW() - INTERVAL '4 days',
    NOW() - INTERVAL '4 days'
  ),
  (
    'Tampa Bay Lightning Announce Community Hockey Program',
    'lightning-community-hockey-program',
    'Free youth hockey clinics will be offered at local rinks throughout the Tampa Bay area.',
    'The Tampa Bay Lightning announced a new community outreach initiative that will provide free hockey clinics to youth throughout the region. The "Lightning the Way" program will offer equipment, coaching, and ice time at no cost to participants ages 6-14.',
    'Sports',
    'Robert Thompson',
    null,
    'tampa-bay',
    'https://images.unsplash.com/photo-1518611012118-696072aa579a?ixlib=rb-4.0.3&auto=format&fit=crop&w=1280&q=80',
    false,
    true,
    3,
    'Amalie Arena',
    ARRAY['sports', 'hockey', 'community', 'youth-programs'],
    NOW() - INTERVAL '5 days',
    NOW() - INTERVAL '5 days'
  ),
  (
    'St. Petersburg Museum of Fine Arts Unveils Major Expansion',
    'mfa-st-pete-expansion',
    'The $42 million expansion adds 40,000 square feet of gallery space and new educational facilities.',
    'The Museum of Fine Arts in St. Petersburg celebrated the opening of its long-awaited expansion with a ribbon-cutting ceremony attended by city officials and major donors. The $42 million project adds 40,000 square feet of gallery space, state-of-the-art conservation labs, and expanded educational facilities.',
    'Arts & Culture',
    'Emily Rodriguez',
    null,
    'st-pete',
    'https://images.unsplash.com/photo-1554907984-15263bfd63bd?ixlib=rb-4.0.3&auto=format&fit=crop&w=1280&q=80',
    false,
    true,
    4,
    'Downtown St. Pete',
    ARRAY['arts', 'culture', 'museum', 'st-petersburg'],
    NOW() - INTERVAL '6 days',
    NOW() - INTERVAL '6 days'
  );

-- Insert sample events
INSERT INTO events (
  title,
  slug,
  description,
  event_type,
  start_date,
  end_date,
  location,
  venue_name,
  address,
  city,
  state,
  zip_code,
  image_url,
  ticket_url,
  price,
  community_id,
  organizer_name,
  is_featured,
  is_published,
  created_at
) VALUES
  (
    'Clearwater Jazz Holiday',
    'clearwater-jazz-holiday-2024',
    'Four days of world-class jazz performances in Coachman Park featuring Grammy-winning artists.',
    'Music Festival',
    '2024-10-17',
    '2024-10-20',
    '{"lat": 27.9659, "lng": -82.8001}',
    'Coachman Park',
    '301 Drew St',
    'Clearwater',
    'FL',
    '33755',
    'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1280&q=80',
    'https://clearwaterjazz.com',
    'Free',
    'clearwater-fl',
    'Clearwater Jazz Holiday Foundation',
    true,
    true,
    NOW()
  ),
  (
    'Saturday Morning Market',
    'saturday-morning-market-st-pete',
    'Weekly farmers market featuring local produce, crafts, and live music in downtown St. Petersburg.',
    'Farmers Market',
    '2024-08-17',
    '2024-08-17',
    '{"lat": 27.7710, "lng": -82.6335}',
    'Al Lang Stadium Parking Lot',
    '230 1st St SE',
    'St. Petersburg',
    'FL',
    '33701',
    'https://images.unsplash.com/photo-1488459716781-31db52582fe9?ixlib=rb-4.0.3&auto=format&fit=crop&w=1280&q=80',
    null,
    'Free',
    'st-pete',
    'St. Pete Market Co.',
    false,
    true,
    NOW()
  );

-- Insert sample announcements
INSERT INTO announcements (
  title,
  slug,
  announcement_type,
  short_description,
  full_description,
  created_by,
  community_id,
  image_url,
  is_featured,
  is_published,
  visibility_start_date,
  visibility_end_date,
  created_at
) VALUES
  (
    'Water Main Replacement on Gulf-to-Bay Boulevard',
    'water-main-replacement-gulf-to-bay',
    'Public Notice',
    'Expect traffic delays on Gulf-to-Bay Boulevard between Belcher and McMullen Booth roads starting Monday.',
    'The City of Clearwater will begin water main replacement work on Gulf-to-Bay Boulevard between Belcher Road and McMullen Booth Road starting Monday, August 19. The project is expected to last approximately 8 weeks. One lane in each direction will remain open during construction hours (9 AM - 4 PM weekdays). Residents and businesses in the area may experience brief water service interruptions.',
    null,
    'clearwater-fl',
    'https://images.unsplash.com/photo-1581093458791-9d42e3c7e117?ixlib=rb-4.0.3&auto=format&fit=crop&w=1280&q=80',
    true,
    true,
    NOW(),
    NOW() + INTERVAL '2 months',
    NOW()
  ),
  (
    'Community Meeting: Downtown Development Plan',
    'community-meeting-downtown-development',
    'Meeting',
    'Join us for a public meeting to discuss the proposed downtown development master plan.',
    'The City of Clearwater invites all residents to attend a community meeting to review and provide feedback on the proposed Downtown Development Master Plan. The meeting will include a presentation by city planners, followed by a Q&A session. Light refreshments will be provided.',
    null,
    'clearwater-fl',
    null,
    false,
    true,
    NOW(),
    NOW() + INTERVAL '1 month',
    NOW()
  );

-- Insert sample businesses
INSERT INTO businesses (
  name,
  slug,
  description,
  category,
  address,
  city,
  state,
  zip_code,
  phone,
  email,
  website,
  hours,
  community_id,
  owner_id,
  is_verified,
  is_featured,
  rating,
  review_count,
  price_range,
  amenities,
  created_at
) VALUES
  (
    'Frenchy''s Original Cafe',
    'frenchys-original-cafe',
    'Iconic beachfront restaurant serving fresh Florida grouper sandwiches and seafood since 1981.',
    'Restaurant',
    '41 Baymont St',
    'Clearwater Beach',
    'FL',
    '33767',
    '(727) 446-3607',
    'info@frenchysonline.com',
    'https://frenchysonline.com',
    '{"monday": "11:00-23:00", "tuesday": "11:00-23:00", "wednesday": "11:00-23:00", "thursday": "11:00-23:00", "friday": "11:00-00:00", "saturday": "11:00-00:00", "sunday": "11:00-23:00"}',
    'clearwater-fl',
    null,
    true,
    true,
    4.5,
    2847,
    '$$',
    ARRAY['outdoor-seating', 'waterfront', 'live-music', 'parking'],
    NOW()
  ),
  (
    'Clearwater Marine Aquarium',
    'clearwater-marine-aquarium',
    'Marine life rescue center and aquarium, home to Winter the Dolphin from the movie Dolphin Tale.',
    'Attraction',
    '249 Windward Passage',
    'Clearwater',
    'FL',
    '33767',
    '(727) 441-1790',
    'info@cmaquarium.org',
    'https://cmaquarium.org',
    '{"monday": "09:00-18:00", "tuesday": "09:00-18:00", "wednesday": "09:00-18:00", "thursday": "09:00-18:00", "friday": "09:00-18:00", "saturday": "09:00-18:00", "sunday": "09:00-18:00"}',
    'clearwater-fl',
    null,
    true,
    true,
    4.7,
    5432,
    '$$$',
    ARRAY['family-friendly', 'educational', 'wheelchair-accessible', 'parking'],
    NOW()
  );

-- Insert sample deals
INSERT INTO deals (
  title,
  slug,
  description,
  business_id,
  discount_type,
  discount_value,
  original_price,
  discounted_price,
  start_date,
  end_date,
  terms_conditions,
  redemption_limit,
  is_featured,
  is_published,
  created_at
) VALUES
  (
    'Summer Special: 20% Off All Grouper Sandwiches',
    'frenchys-summer-special',
    'Enjoy 20% off our famous grouper sandwiches all summer long!',
    (SELECT id FROM businesses WHERE slug = 'frenchys-original-cafe' LIMIT 1),
    'percentage',
    20,
    15.99,
    12.79,
    NOW(),
    NOW() + INTERVAL '3 months',
    'Valid for dine-in only. Cannot be combined with other offers.',
    1000,
    true,
    true,
    NOW()
  );

-- Insert sample reviews
INSERT INTO reviews (
  business_id,
  user_id,
  rating,
  title,
  content,
  is_verified_purchase,
  helpful_count,
  created_at
) VALUES
  (
    (SELECT id FROM businesses WHERE slug = 'frenchys-original-cafe' LIMIT 1),
    null,
    5,
    'Best grouper sandwich on the beach!',
    'We''ve been coming to Frenchy''s for years and it never disappoints. The grouper is always fresh, the atmosphere is perfect, and you can''t beat the beachfront location. Highly recommend!',
    true,
    45,
    NOW() - INTERVAL '1 week'
  );

-- Insert sample users (for testing - passwords should be properly hashed in production)
INSERT INTO users (
  email,
  username,
  full_name,
  role,
  is_active,
  email_verified,
  created_at
) VALUES
  ('editor@daynews.com', 'editor', 'Jane Editor', 'editor', true, true, NOW()),
  ('reader@example.com', 'reader123', 'John Reader', 'user', true, true, NOW())
ON CONFLICT (email) DO NOTHING;

-- Update news articles with actual user IDs if needed
UPDATE news 
SET author_id = (SELECT id FROM users WHERE email = 'editor@daynews.com' LIMIT 1)
WHERE author_id IS NULL;