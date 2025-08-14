-- Seed data for Day News application (Fixed for actual schema)

-- Insert sample news articles
INSERT INTO news (
  title, 
  slug,
  content,
  category, 
  city,
  featured_image,
  excerpt,
  is_published,
  tags,
  created_at,
  published_at
) VALUES 
  (
    'Clearwater City Council Approves $89.2M Budget for 2025 Fiscal Year',
    'clearwater-city-council-approves-budget-2025',
    'The Clearwater City Council unanimously approved a $89.2 million budget for the 2025 fiscal year during Thursday night''s meeting. The budget maintains the current millage rate of 5.95 mills while allocating increased funding for critical infrastructure improvements and public safety initiatives. Mayor Frank Hibbard praised the collaborative effort, noting that the budget reflects community priorities identified during public input sessions held throughout the summer.',
    'Government',
    'Clearwater',
    'https://images.unsplash.com/photo-1577495508326-19a1b3cf65b7?ixlib=rb-4.0.3&auto=format&fit=crop&w=1280&q=80',
    'The budget maintains the current millage rate while increasing funding for infrastructure and public safety initiatives.',
    true,
    ARRAY['budget', 'city-council', 'government', 'clearwater'],
    NOW() - INTERVAL '2 hours',
    NOW() - INTERVAL '2 hours'
  ),
  (
    'New Waterfront Development Project Breaks Ground in Downtown Clearwater',
    'waterfront-development-downtown-clearwater',
    'Construction began Monday on Clearwater''s highly anticipated waterfront development project, marking a significant milestone in the city''s downtown revitalization efforts. The $120 million mixed-use development, known as "Clearwater Bay Walk," will transform 12 acres of underutilized waterfront property into a vibrant destination featuring retail shops, restaurants, public spaces, and 200 luxury condominium units.',
    'Development',
    'Clearwater',
    'https://images.unsplash.com/photo-1545127398-14699f92334b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1280&q=80',
    'The $120 million mixed-use development will feature retail, restaurants, and luxury condominiums along the waterfront.',
    true,
    ARRAY['development', 'real-estate', 'waterfront', 'clearwater'],
    NOW() - INTERVAL '1 day',
    NOW() - INTERVAL '1 day'
  ),
  (
    'Clearwater Beach Ranked #1 in USA Today''s Best Beach Towns',
    'clearwater-beach-ranked-best-beach-town',
    'Clearwater Beach has once again been crowned America''s best beach town by USA Today''s 10Best Readers'' Choice Awards. This marks the third consecutive year the pristine white-sand destination has claimed the top spot, beating out competitors from Hawaii, California, and the East Coast.',
    'Tourism',
    'Clearwater',
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1280&q=80',
    'For the third consecutive year, Clearwater Beach tops the list of America''s best beach destinations.',
    true,
    ARRAY['tourism', 'beach', 'awards', 'clearwater-beach'],
    NOW() - INTERVAL '3 days',
    NOW() - INTERVAL '3 days'
  ),
  (
    'Local High School Robotics Team Advances to State Championship',
    'clearwater-high-robotics-state-championship',
    'The Clearwater High School Hurricanes robotics team is heading to the state championship after a commanding victory at the regional FIRST Robotics Competition held in Tampa last weekend. The team''s innovative robot design and flawless execution earned them the top spot among 32 competing schools.',
    'Education',
    'Clearwater',
    'https://images.unsplash.com/photo-1581092160562-40aa08e78837?ixlib=rb-4.0.3&auto=format&fit=crop&w=1280&q=80',
    'Clearwater High School''s robotics team secured their spot at the state championship after winning the regional competition.',
    true,
    ARRAY['education', 'robotics', 'stem', 'students'],
    NOW() - INTERVAL '4 days',
    NOW() - INTERVAL '4 days'
  ),
  (
    'Tampa Bay Lightning Announce Community Hockey Program',
    'lightning-community-hockey-program',
    'The Tampa Bay Lightning announced a new community outreach initiative that will provide free hockey clinics to youth throughout the region. The "Lightning the Way" program will offer equipment, coaching, and ice time at no cost to participants ages 6-14.',
    'Sports',
    'Tampa',
    'https://images.unsplash.com/photo-1518611012118-696072aa579a?ixlib=rb-4.0.3&auto=format&fit=crop&w=1280&q=80',
    'Free youth hockey clinics will be offered at local rinks throughout the Tampa Bay area.',
    true,
    ARRAY['sports', 'hockey', 'community', 'youth-programs'],
    NOW() - INTERVAL '5 days',
    NOW() - INTERVAL '5 days'
  ),
  (
    'St. Petersburg Museum of Fine Arts Unveils Major Expansion',
    'mfa-st-pete-expansion',
    'The Museum of Fine Arts in St. Petersburg celebrated the opening of its long-awaited expansion with a ribbon-cutting ceremony attended by city officials and major donors. The $42 million project adds 40,000 square feet of gallery space, state-of-the-art conservation labs, and expanded educational facilities.',
    'Arts & Culture',
    'St. Petersburg',
    'https://images.unsplash.com/photo-1554907984-15263bfd63bd?ixlib=rb-4.0.3&auto=format&fit=crop&w=1280&q=80',
    'The $42 million expansion adds 40,000 square feet of gallery space and new educational facilities.',
    true,
    ARRAY['arts', 'culture', 'museum', 'st-petersburg'],
    NOW() - INTERVAL '6 days',
    NOW() - INTERVAL '6 days'
  );

-- Insert sample events
INSERT INTO events (
  title,
  description,
  category,
  start_date,
  end_date,
  location,
  created_at
) VALUES
  (
    'Clearwater Jazz Holiday',
    'Four days of world-class jazz performances in Coachman Park featuring Grammy-winning artists.',
    'Music Festival',
    '2024-10-17',
    '2024-10-20',
    'Coachman Park, 301 Drew St, Clearwater, FL 33755',
    NOW()
  ),
  (
    'Saturday Morning Market',
    'Weekly farmers market featuring local produce, crafts, and live music in downtown St. Petersburg.',
    'Farmers Market',
    '2024-08-17',
    '2024-08-17',
    'Al Lang Stadium Parking Lot, 230 1st St SE, St. Petersburg, FL 33701',
    NOW()
  );

-- Insert sample announcements
INSERT INTO announcements (
  title,
  content,
  type,
  created_at
) VALUES
  (
    'Water Main Replacement on Gulf-to-Bay Boulevard',
    'The City of Clearwater will begin water main replacement work on Gulf-to-Bay Boulevard between Belcher Road and McMullen Booth Road starting Monday, August 19. The project is expected to last approximately 8 weeks. One lane in each direction will remain open during construction hours (9 AM - 4 PM weekdays). Residents and businesses in the area may experience brief water service interruptions.',
    'Public Notice',
    NOW()
  ),
  (
    'Community Meeting: Downtown Development Plan',
    'The City of Clearwater invites all residents to attend a community meeting to review and provide feedback on the proposed Downtown Development Master Plan. The meeting will include a presentation by city planners, followed by a Q&A session. Light refreshments will be provided.',
    'Meeting',
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
  phone,
  email,
  website,
  hours,
  is_active,
  created_at
) VALUES
  (
    'Frenchy''s Original Cafe',
    'frenchys-original-cafe',
    'Iconic beachfront restaurant serving fresh Florida grouper sandwiches and seafood since 1981.',
    'Restaurant',
    '41 Baymont St',
    'Clearwater Beach',
    '(727) 446-3607',
    'info@frenchysonline.com',
    'https://frenchysonline.com',
    '{"monday": "11:00-23:00", "tuesday": "11:00-23:00", "wednesday": "11:00-23:00", "thursday": "11:00-23:00", "friday": "11:00-00:00", "saturday": "11:00-00:00", "sunday": "11:00-23:00"}',
    true,
    NOW()
  ),
  (
    'Clearwater Marine Aquarium',
    'clearwater-marine-aquarium',
    'Marine life rescue center and aquarium, home to Winter the Dolphin from the movie Dolphin Tale.',
    'Attraction',
    '249 Windward Passage',
    'Clearwater',
    '(727) 441-1790',
    'info@cmaquarium.org',
    'https://cmaquarium.org',
    '{"monday": "09:00-18:00", "tuesday": "09:00-18:00", "wednesday": "09:00-18:00", "thursday": "09:00-18:00", "friday": "09:00-18:00", "saturday": "09:00-18:00", "sunday": "09:00-18:00"}',
    true,
    NOW()
  );

-- Insert sample marketplace items (classifieds)
INSERT INTO marketplace_items (
  title,
  description,
  price,
  category,
  created_at
) VALUES
  (
    '2015 Honda Civic - Excellent Condition',
    'One owner, low mileage (45,000 miles), regularly maintained. Silver exterior, black interior. All service records available.',
    12500,
    'Vehicles',
    NOW()
  ),
  (
    'Beach Condo for Rent - 2BR/2BA',
    'Beautiful beachfront condo available for seasonal rental. Fully furnished, stunning Gulf views, walk to restaurants and shops.',
    3500,
    'Real Estate',
    NOW()
  ),
  (
    'Vintage Surfboard Collection',
    'Selling collection of 5 vintage surfboards from the 1960s-1980s. Great for collectors or beach-themed decor.',
    800,
    'For Sale',
    NOW()
  );