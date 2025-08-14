import { createServerClient } from '@/lib/supabase/server';
import { supabase } from '@/lib/supabase/client';
import type { Database } from '@/types/database.types';

// Use announcements table for marketplace items until marketplace_items table is created
type MarketplaceItem = Database['public']['Tables']['announcements']['Row'];
type MarketplaceItemInsert = Database['public']['Tables']['announcements']['Insert'];
type MarketplaceItemUpdate = Database['public']['Tables']['announcements']['Update'];

// Transform announcement to classified item structure
export function transformAnnouncementToClassified(announcement: MarketplaceItem) {
  return {
    id: announcement.id,
    title: announcement.short_description || 'Untitled',
    category: announcement.announcement_type || 'general',
    subcategory: announcement.event_type || 'miscellaneous',
    price: 0, // Price would need to be stored in additional_locations or other field
    location: announcement.location ?
    typeof announcement.location === 'string' ? announcement.location :
    (announcement.location as any)?.address || 'Location not specified' :
    'Location not specified',
    postedDate: announcement.created_at || new Date().toISOString(),
    description: announcement.full_description || announcement.short_description || '',
    images: announcement.main_image ? [announcement.main_image] : [],
    featured: false,
    condition: 'Good', // Default condition
    seller: {
      name: 'Anonymous',
      rating: 4.5,
      memberSince: announcement.created_at || new Date().toISOString(),
      responseRate: 95,
      responseTime: 'Within a day'
    }
  };
}

// Server-side queries (for SSR)
export async function getMarketplaceItems() {
  const supabase = await createServerClient();
  // Filter announcements that could be marketplace items
  const result = await (supabase as any).from('announcements').
  select('*').
  eq('announcement_type', 'marketplace').
  order('created_at', { ascending: false });
  if (result.error) return { data: null, error: result.error };

  return {
    data: result.data.map(transformAnnouncementToClassified),
    error: null
  };
}

export async function getMarketplaceItemById(id: string) {
  const supabase = await createServerClient();
  const result = await (supabase as any).from('announcements').
  select('*').
  eq('id', id).
  eq('announcement_type', 'marketplace').
  single();
  if (result.error) return { data: null, error: result.error };

  return {
    data: transformAnnouncementToClassified(result.data),
    error: null
  };
}

export async function getMarketplaceItemsByUser(userId: string) {
  const supabase = await createServerClient();
  const result = await (supabase as any).from('announcements').
  select('*').
  eq('created_by', userId).
  eq('announcement_type', 'marketplace').
  order('created_at', { ascending: false });
  if (result.error) return { data: null, error: result.error };

  return {
    data: result.data.map(transformAnnouncementToClassified),
    error: null
  };
}

// Client-side queries (for React Query hooks)
export const marketplaceItemQueries = {
  all: async () => {
    const { data, error } = await (supabase as any).from('announcements').
    select('*').
    eq('announcement_type', 'marketplace').
    order('created_at', { ascending: false });
    if (error) throw error;
    return data.map(transformAnnouncementToClassified);
  },

  byId: async (id: string) => {
    const { data, error } = await (supabase as any).from('announcements').
    select('*').
    eq('id', id).
    eq('announcement_type', 'marketplace').
    single();
    if (error) throw error;
    return transformAnnouncementToClassified(data);
  },

  byUser: async (userId: string) => {
    const { data, error } = await (supabase as any).from('announcements').
    select('*').
    eq('created_by', userId).
    eq('announcement_type', 'marketplace').
    order('created_at', { ascending: false });
    if (error) throw error;
    return data.map(transformAnnouncementToClassified);
  }
};

// Mutations
export const marketplaceItemMutations = {
  create: async (data: MarketplaceItemInsert) => {
    const itemData = {
      ...data,
      announcement_type: 'marketplace'
    };
    const { data: result, error } = await (supabase as any).from('announcements').
    insert(itemData).
    select().
    single();
    if (error) throw error;
    return transformAnnouncementToClassified(result);
  },

  update: async (id: string, data: MarketplaceItemUpdate) => {
    const { data: result, error } = await (supabase as any).from('announcements').
    update(data).
    eq('id', id).
    eq('announcement_type', 'marketplace').
    select().
    single();
    if (error) throw error;
    return transformAnnouncementToClassified(result);
  },

  delete: async (id: string) => {
    const { error } = await (supabase as any).from('announcements').
    delete().
    eq('id', id).
    eq('announcement_type', 'marketplace');
    if (error) throw error;
  }
};