const fs = require('fs');

// Map components to actual database tables
const TABLE_MAPPINGS = {
  // News
  'news': ['HomePage', 'NewsContent', 'ArticleDetailPage', 'CreateNewsPage'],
  'virtual_journalists': ['JournalistsAdminPage', 'EditJournalistModal'],
  
  // Events
  'events': ['EventsPage', 'EventDetailPage', 'EventCreatorPage', 'EventsCalendarPage'],
  
  // Announcements
  'announcements': ['AnnouncementsPage', 'AnnouncementDetailPage', 'AnnouncementCreatorPage'],
  
  // Business
  'businesses': ['BusinessDirectoryPage', 'BusinessProfile'],
  'deals': ['CouponsPage', 'CouponDetailPage', 'CouponCreatorPage'],
  'reviews': ['BusinessProfile'],
  
  // Communities
  'communities': ['CitySelectionPage', 'CommunitySwitcher'],
  
  // Users
  'users': ['UserProfilePage', 'UserSettingsPage', 'UserRegistrationPage'],
  'messages': ['Messaging components'],
  'notifications': ['NotificationCenter']
};

// Generate queries for each table
Object.entries(TABLE_MAPPINGS).forEach(([table, components]) => {
  const queryContent = `import { createServerClient } from '@/lib/supabase/server'
import { supabase } from '@/lib/supabase/client'
import type { Database } from '@/types/database.types'

type ${table.charAt(0).toUpperCase() + table.slice(1).slice(0, -1)} = Database['public']['Tables']['${table}']['Row']

// Server queries
export async function get${table.charAt(0).toUpperCase() + table.slice(1)}() {
  const supabase = await createServerClient()
  
  const query = supabase.from('${table}').select('*')
  
  // Add specific logic per table
  ${table === 'news' ? `query.eq('status', 'published').order('published_at', { ascending: false })` : ''}
  ${table === 'events' ? `query.gte('start_date', new Date().toISOString()).order('start_date')` : ''}
  ${table === 'businesses' ? `query.eq('is_active', true).order('name')` : ''}
  ${table === 'deals' ? `query.eq('is_active', true).gte('valid_until', new Date().toISOString())` : ''}
  
  return query
}

// Client queries
export const ${table}Queries = {
  all: async () => {
    const { data, error } = await supabase
      .from('${table}')
      .select('*')
      ${table === 'news' ? `.eq('status', 'published')` : ''}
      ${table === 'events' ? `.gte('start_date', new Date().toISOString())` : ''}
      .order('created_at', { ascending: false })
    if (error) throw error
    return data
  },
  
  byId: async (id: string) => {
    const { data, error } = await supabase
      .from('${table}')
      .select('*')
      .eq('id', id)
      .single()
    if (error) throw error
    return data
  },
  
  byCommunity: async (communityId: string) => {
    const { data, error } = await supabase
      .from('${table}')
      .select('*')
      ${table === 'news' || table === 'events' ? `.eq('community_id', communityId)` : ''}
      .order('created_at', { ascending: false })
    if (error) throw error
    return data
  }
}
`;

  fs.mkdirSync('./src/lib/supabase/queries', { recursive: true });
  fs.writeFileSync(`./src/lib/supabase/queries/${table}.queries.ts`, queryContent);
  console.log(`✅ Created queries for ${table}`);
});

console.log('\n📝 Real queries created based on actual database schema!');
