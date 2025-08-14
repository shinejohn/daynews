#!/usr/bin/env node

/**
 * Generate Supabase integrations for components with mock data
 */

const fs = require('fs');
const path = require('path');

const COMPONENTS_DIR = path.join(__dirname, '../src/components');

// Supabase query templates
const QUERY_TEMPLATES = {
  classifieds: `
// Fetch marketplace items from Supabase
const fetchClassifieds = async () => {
  try {
    const { data, error } = await supabase
      .from('marketplace_items')
      .select(\`
        *,
        seller:profiles(*)
      \`)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching classifieds:', error);
    return [];
  }
};`,

  events: `
// Fetch events from Supabase
const fetchEvents = async () => {
  try {
    const { data, error } = await supabase
      .from('events')
      .select(\`
        *,
        venue:venues(*),
        organizer:profiles(*)
      \`)
      .gte('start_date', new Date().toISOString())
      .order('start_date', { ascending: true });
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching events:', error);
    return [];
  }
};`,

  news: `
// Fetch news articles from Supabase
const fetchNews = async (category?: string) => {
  try {
    let query = supabase
      .from('news')
      .select(\`
        *,
        author:virtual_journalists(*),
        category:categories(*)
      \`)
      .eq('is_published', true)
      .order('published_at', { ascending: false });
    
    if (category) {
      query = query.eq('category', category);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching news:', error);
    return [];
  }
};`,

  businesses: `
// Fetch businesses from Supabase  
const fetchBusinesses = async (filters?: any) => {
  try {
    let query = supabase
      .from('businesses')
      .select(\`
        *,
        category:business_categories(*),
        reviews:business_reviews(count)
      \`)
      .eq('is_active', true);
    
    if (filters?.category) {
      query = query.eq('category_id', filters.category);
    }
    
    if (filters?.search) {
      query = query.or(\`name.ilike.%\${filters.search}%,description.ilike.%\${filters.search}%\`);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching businesses:', error);
    return [];
  }
};`
};

// Data transformation templates
const TRANSFORM_TEMPLATES = {
  classifieds: `
// Transform database data to component format
const transformClassifieds = (data) => {
  return data.map(item => ({
    id: item.id,
    title: item.title,
    category: item.category || 'general',
    subcategory: item.subcategory || 'other',
    price: item.price || 0,
    location: item.location || 'Local',
    postedDate: item.created_at,
    description: item.description,
    images: item.images || [],
    featured: item.is_featured || false,
    condition: item.condition || 'Good',
    seller: {
      name: item.seller?.name || 'Anonymous',
      rating: item.seller?.rating || 4.5,
      memberSince: item.seller?.created_at || item.created_at,
      responseRate: 95,
      responseTime: 'Within a day'
    }
  }));
};`,

  events: `
// Transform database data to component format
const transformEvents = (data) => {
  return data.map(event => ({
    id: event.id,
    title: event.title,
    description: event.description,
    startDate: event.start_date,
    endDate: event.end_date,
    location: event.venue?.name || event.location,
    address: event.venue?.address || event.address,
    category: event.category,
    image: event.image_url,
    price: event.price || 0,
    organizer: event.organizer?.name || event.organizer_name,
    attendees: event.attendee_count || 0,
    maxAttendees: event.max_attendees,
    featured: event.is_featured || false
  }));
};`,

  news: `
// Transform database data to component format
const transformNews = (data) => {
  return data.map(article => ({
    id: article.id,
    title: article.title,
    slug: article.slug,
    excerpt: article.excerpt || article.content?.substring(0, 200) + '...',
    content: article.content,
    author: article.author?.name || article.author_name,
    authorImage: article.author?.avatar_url,
    publishedAt: article.published_at,
    category: article.category?.name || article.category,
    image: article.featured_image,
    readTime: article.read_time || '5 min',
    tags: article.tags || [],
    featured: article.is_featured || false
  }));
};`,

  businesses: `
// Transform database data to component format
const transformBusinesses = (data) => {
  return data.map(business => ({
    id: business.id,
    name: business.name,
    description: business.description,
    category: business.category?.name || business.category,
    address: business.address,
    phone: business.phone,
    website: business.website,
    hours: business.hours || {},
    image: business.logo_url || business.image_url,
    rating: business.rating || 4.0,
    reviewCount: business.reviews?.[0]?.count || 0,
    featured: business.is_featured || false,
    verified: business.is_verified || false
  }));
};`
};

// Process components to add Supabase integrations
function processComponent(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const fileName = path.basename(filePath);
  
  // Detect data type
  let dataType = null;
  if (content.includes('classifieds') || content.includes('Classified')) dataType = 'classifieds';
  else if (content.includes('events') || content.includes('Event')) dataType = 'events';
  else if (content.includes('news') || content.includes('News')) dataType = 'news';
  else if (content.includes('businesses') || content.includes('Business')) dataType = 'businesses';
  
  if (!dataType) return;
  
  // Check if already has Supabase integration
  if (content.includes('supabase') || content.includes('fetch')) return;
  
  console.log(`Adding Supabase integration to ${fileName} (${dataType})...`);
  
  // Create integration file
  const integrationContent = `
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

const supabase = createClientComponentClient();

${QUERY_TEMPLATES[dataType]}

${TRANSFORM_TEMPLATES[dataType]}

export { ${dataType === 'classifieds' ? 'fetchClassifieds' : 
         dataType === 'events' ? 'fetchEvents' :
         dataType === 'news' ? 'fetchNews' : 'fetchBusinesses'}, 
         ${dataType === 'classifieds' ? 'transformClassifieds' : 
         dataType === 'events' ? 'transformEvents' :
         dataType === 'news' ? 'transformNews' : 'transformBusinesses'} };
`;
  
  const integrationPath = filePath.replace('.tsx', '.queries.ts');
  fs.writeFileSync(integrationPath, integrationContent);
  
  console.log(`  ✓ Created ${path.basename(integrationPath)}`);
}

// Process all components
function processDirectory(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  
  entries.forEach(entry => {
    const fullPath = path.join(dir, entry.name);
    
    if (entry.isDirectory()) {
      processDirectory(fullPath);
    } else if (entry.name.endsWith('.tsx')) {
      processComponent(fullPath);
    }
  });
}

console.log('🔌 Generating Supabase integrations...\n');
processDirectory(COMPONENTS_DIR);
console.log('\n✅ Supabase integrations generated');