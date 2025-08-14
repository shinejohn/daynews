import { supabase } from '../client';

const businessesData = [
  {
    name: 'Harbor Cafe',
    slug: 'harbor-cafe',
    description: 'Cozy waterfront cafe serving fresh coffee, pastries, and light meals with a beautiful view of the harbor.',
    short_description: 'Waterfront cafe with fresh coffee and harbor views',
    address: '123 Harbor Drive',
    city: 'Clearwater',
    state: 'FL',
    zip_code: '33755',
    country: 'USA',
    phone: '(727) 555-1234',
    email: 'info@harborcafe.com',
    website: 'https://harborcafe.com',
    latitude: 27.9659,
    longitude: -82.8001,
    price_range: 'MODERATE' as const,
    average_rating: 4.7,
    review_count: 128,
    is_active: true,
    is_claimed: true,
    verification_status: 'VERIFIED' as const,
    features: ['outdoor_seating', 'wifi', 'takeout', 'special_offers'],
    cover_image_url: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
    logo_url: 'https://images.unsplash.com/photo-1513639776629-7b61b0ac49cb?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80',
    social_links: {
      facebook: 'https://facebook.com/harborcafe',
      instagram: 'https://instagram.com/harborcafe'
    }
  },
  {
    name: 'Coastal Boutique',
    slug: 'coastal-boutique',
    description: 'Beautiful selection of beach-inspired clothing and accessories for the modern coastal lifestyle.',
    short_description: 'Beach-inspired clothing and accessories',
    address: '456 Beach Blvd',
    city: 'Clearwater',
    state: 'FL',
    zip_code: '33756',
    country: 'USA',
    phone: '(727) 555-5678',
    email: 'shop@coastalboutique.com',
    website: 'https://coastalboutique.com',
    latitude: 27.9671,
    longitude: -82.7998,
    price_range: 'EXPENSIVE' as const,
    average_rating: 4.5,
    review_count: 86,
    is_active: true,
    is_claimed: true,
    verification_status: 'VERIFIED' as const,
    features: ['personal_shopping', 'gift_wrapping', 'returns'],
    cover_image_url: 'https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
    logo_url: 'https://images.unsplash.com/photo-1551232864-3f0890e580d9?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80'
  },
  {
    name: 'Bayside Medical Center',
    slug: 'bayside-medical-center',
    description: 'Full-service medical center providing comprehensive healthcare services to the Clearwater community.',
    short_description: 'Comprehensive healthcare services',
    address: '789 Bayside Dr',
    city: 'Clearwater',
    state: 'FL',
    zip_code: '33757',
    country: 'USA',
    phone: '(727) 555-9012',
    email: 'contact@baysidemedical.com',
    website: 'https://baysidemedical.com',
    latitude: 27.9683,
    longitude: -82.8012,
    price_range: 'LUXURY' as const,
    average_rating: 4.8,
    review_count: 214,
    is_active: true,
    is_claimed: true,
    verification_status: 'VERIFIED' as const,
    features: ['emergency_services', 'parking', 'wheelchair_accessible', 'special_offers'],
    cover_image_url: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
    logo_url: 'https://images.unsplash.com/photo-1538108149393-fbbd81895907?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80'
  },
  {
    name: 'Sunshine Home Services',
    slug: 'sunshine-home-services',
    description: 'Professional home cleaning and maintenance services to keep your home spotless and well-maintained.',
    short_description: 'Professional home cleaning services',
    address: '321 Sunshine Way',
    city: 'Clearwater',
    state: 'FL',
    zip_code: '33758',
    country: 'USA',
    phone: '(727) 555-3456',
    email: 'hello@sunshinehomeservices.com',
    website: 'https://sunshinehomeservices.com',
    latitude: 27.9645,
    longitude: -82.799,
    price_range: 'MODERATE' as const,
    average_rating: 4.6,
    review_count: 95,
    is_active: true,
    is_claimed: true,
    verification_status: 'VERIFIED' as const,
    features: ['bonded_insured', 'eco_friendly', 'flexible_scheduling', 'special_offers'],
    cover_image_url: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
    logo_url: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80'
  },
  {
    name: 'Gulf Coast Auto Repair',
    slug: 'gulf-coast-auto-repair',
    description: 'Honest, reliable auto repair services with certified mechanics and quality parts for all vehicle makes and models.',
    short_description: 'Honest auto repair with certified mechanics',
    address: '555 Mechanics Ave',
    city: 'Clearwater',
    state: 'FL',
    zip_code: '33759',
    country: 'USA',
    phone: '(727) 555-7890',
    email: 'service@gulfcoastauto.com',
    website: 'https://gulfcoastauto.com',
    latitude: 27.9635,
    longitude: -82.802,
    price_range: 'EXPENSIVE' as const,
    average_rating: 4.9,
    review_count: 172,
    is_active: true,
    is_claimed: true,
    verification_status: 'VERIFIED' as const,
    features: ['warranty', 'loaner_cars', 'certified_mechanics', 'free_estimates'],
    cover_image_url: 'https://images.unsplash.com/photo-1625047509248-ec889cbff17f?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
    logo_url: 'https://images.unsplash.com/photo-1486006920555-c77dcf18193c?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80'
  },
  {
    name: 'Clearwater Credit Union',
    slug: 'clearwater-credit-union',
    description: 'Community-focused credit union offering competitive rates and personalized financial services.',
    short_description: 'Community credit union with competitive rates',
    address: '777 Financial Pkwy',
    city: 'Clearwater',
    state: 'FL',
    zip_code: '33760',
    country: 'USA',
    phone: '(727) 555-2345',
    email: 'info@clearwatercu.com',
    website: 'https://clearwatercu.com',
    latitude: 27.9668,
    longitude: -82.803,
    price_range: 'BUDGET' as const,
    average_rating: 4.4,
    review_count: 68,
    is_active: true,
    is_claimed: true,
    verification_status: 'VERIFIED' as const,
    features: ['online_banking', 'mobile_app', 'atm_access', 'special_offers'],
    cover_image_url: 'https://images.unsplash.com/photo-1556742031-c6961e8560b0?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80',
    logo_url: 'https://images.unsplash.com/photo-1601597111158-2fceff292cdc?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80'
  }
];

const categoriesData = [
  {
    name: 'Food & Dining',
    slug: 'food-dining',
    category_type: 'business',
    icon: '🍔',
    description: 'Restaurants, cafes, bars, and food services',
    is_active: true,
    display_order: 1
  },
  {
    name: 'Shopping',
    slug: 'shopping',
    category_type: 'business',
    icon: '🛒',
    description: 'Retail stores, boutiques, and shopping centers',
    is_active: true,
    display_order: 2
  },
  {
    name: 'Health & Medical',
    slug: 'health-medical',
    category_type: 'business',
    icon: '🏥',
    description: 'Healthcare providers, medical services, and wellness',
    is_active: true,
    display_order: 3
  },
  {
    name: 'Home Services',
    slug: 'home-services',
    category_type: 'business',
    icon: '🏠',
    description: 'Cleaning, maintenance, repair, and home improvement',
    is_active: true,
    display_order: 4
  },
  {
    name: 'Automotive',
    slug: 'automotive',
    category_type: 'business',
    icon: '🚗',
    description: 'Auto repair, dealerships, and automotive services',
    is_active: true,
    display_order: 5
  },
  {
    name: 'Financial Services',
    slug: 'financial-services',
    category_type: 'business',
    icon: '💰',
    description: 'Banks, credit unions, insurance, and financial planning',
    is_active: true,
    display_order: 6
  }
];

export async function seedBusinessCategories() {
  try {
    console.log('Starting to seed business categories...');
    
    // Insert categories first
    const { data: insertedCategories, error } = await (supabase as any).from('categories')
      .upsert(categoriesData, { onConflict: 'slug' })
      .select()
    if (error) {
      console.error('Error seeding categories:', error);
      throw error;
    }

    console.log(`Successfully seeded ${insertedCategories?.length || 0} categories`);
    return insertedCategories;
  } catch (error) {
    console.error('Failed to seed categories:', error);
    throw error;
  }
}

export async function seedBusinesses() {
  try {
    console.log('Starting to seed businesses...');
    
    // First, get the category IDs
    const { data: categories, error: categoriesError } = await (supabase as any).from('categories')
      .select('id, slug')
      .eq('category_type' as any, 'business'  as any)

    if (categoriesError) {
      console.error('Error fetching categories:', categoriesError);
      throw categoriesError;
    }

    // Create a mapping of slug to ID
    const categoryMap = categories?.reduce((acc: any, cat: any) => {
      acc[cat.slug] = cat.id;
      return acc;
    }, {} as Record<string, string>) || {};

    // Map businesses to categories
    const businessesWithCategories = businessesData.map((business, index) => {
      const categoryMappings = [
        'food-dining',      // Harbor Cafe
        'shopping',         // Coastal Boutique  
        'health-medical',   // Bayside Medical Center
        'home-services',    // Sunshine Home Services
        'automotive',       // Gulf Coast Auto Repair
        'financial-services' // Clearwater Credit Union
      ];
      
      const categorySlug = categoryMappings[index];
      return {
        ...business,
        category_id: categoryMap[categorySlug] || null,
        owner_id: 'system' // placeholder - in real app this would be actual user IDs
      };
    });

    // Insert businesses
    const { data: insertedBusinesses, error } = await (supabase as any).from('businesses')
      .upsert(businessesWithCategories, { onConflict: 'slug' })
      .select()
    if (error) {
      console.error('Error seeding businesses:', error);
      throw error;
    }

    console.log(`Successfully seeded ${insertedBusinesses?.length || 0} businesses`);
    return insertedBusinesses;
  } catch (error) {
    console.error('Failed to seed businesses:', error);
    throw error;
  }
}

export async function seedBusinessData() {
  try {
    const categories = await seedBusinessCategories();
    const businesses = await seedBusinesses();
    
    console.log('Business data seeding completed successfully!');
    return { categories, businesses };
  } catch (error) {
    console.error('Business data seeding failed:', error);
    throw error;
  }
}