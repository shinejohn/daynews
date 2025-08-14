import { supabase } from '@/lib/supabase/client';
import type { Database } from '@/types/database.types';

type News = Database['public']['Tables']['news']['Row'];
type Event = Database['public']['Tables']['events']['Row'];
type Business = Database['public']['Tables']['businesses']['Row'];
type Announcement = Database['public']['Tables']['announcements']['Row'];

export interface SearchResult {
  id: string;
  type: 'news' | 'event' | 'business' | 'announcement';
  title: string;
  snippet: string;
  image?: string;
  date: string;
  author?: string;
  source?: string;
  category?: string;
  location?: string;
  engagement?: {
    views?: number;
    comments?: number;
    shares?: number;
  };
  tags?: string[];
  // Type-specific fields
  organizer?: string;
  rating?: number;
  reviewCount?: number;
  hours?: string;
  business?: string;
  validUntil?: string;
  redemption?: string;
  discount?: string;
  position?: string;
  organization?: string;
  contact?: {
    email?: string;
    phone?: string;
  };
}

export interface SearchParams {
  query: string;
  filter: 'all' | 'news' | 'events' | 'businesses' | 'announcements';
  timeFilter: 'any' | 'today' | 'week' | 'month' | 'year';
  sortBy: 'relevance' | 'recent' | 'popular';
  page: number;
  limit: number;
  communityId?: string;
}

export interface SearchResponse {
  results: SearchResult[];
  total: number;
  page: number;
  hasMore: boolean;
}

// Helper function to calculate time filter date
const getTimeFilterDate = (timeFilter: string): string | null => {
  const now = new Date();
  switch (timeFilter) {
    case 'today':
      return new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
    case 'week':
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      return weekAgo.toISOString();
    case 'month':
      const monthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
      return monthAgo.toISOString();
    case 'year':
      const yearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
      return yearAgo.toISOString();
    default:
      return null;
  }
};

// Search news articles
const searchNews = async (params: SearchParams): Promise<SearchResult[]> => {
  if (!supabase) throw new Error('Supabase client not initialized');



  let query = (supabase as any.
  from('news').
  select('*').
  order('created_at', { ascending: false });

  // Add text search
  if (params.query) {
    query = query.or(`title.ilike.%${params.query}%,content.ilike.%${params.query}%,summary.ilike.%${params.query}%`);
  }

  // Add time filter
  const timeFilterDate = getTimeFilterDate(params.timeFilter);
  if (timeFilterDate) {
    query = query.gte('created_at' as any, timeFilterDate as any as any;
  }

  // Add community filter if provided
  if (params.communityId) as any {
    query = query.eq('community_id' as any, params.communityId as any as any;
  }

  // Add pagination
  const offset = (params.page - 1) as any * params.limit;
  query = query.range(offset, offset + params.limit - 1);
  const { data, error } = await (query as any;
  if (error) throw error;

  return (data || []).map((item: News): SearchResult => ({
    id: item.id,
    type: 'news',
    title: item.title || '',
    snippet: item.excerpt || item.content?.substring(0, 200) || '',
    image: item.featured_image || undefined,
    date: new Date(item.created_at || '').toLocaleDateString(),
    author: item.author_id || undefined,
    source: 'Local News',
    category: item.category || undefined,
    engagement: {
      views: item.view_count || Math.floor(Math.random() * 1000),
      comments: Math.floor(Math.random() * 50),
      shares: Math.floor(Math.random() * 25)
    },
    tags: item.tags || undefined
  }));
};

// Search events
const searchEvents = async (params: SearchParams): Promise<SearchResult[]> => {
  if (!supabase) throw new Error('Supabase client not initialized');
  let query = (supabase as any.
  from('events').
  select('*').
  order('start_date', { ascending: true });

  // Add text search
  if (params.query) {
    query = query.or(`title.ilike.%${params.query}%,description.ilike.%${params.query}%`);
  }

  // Add time filter
  const timeFilterDate = getTimeFilterDate(params.timeFilter);
  if (timeFilterDate) {
    query = query.gte('created_at' as any, timeFilterDate as any as any;
  }

  // Add community filter if provided
  if (params.communityId) as any {
    query = query.eq('community_id' as any, params.communityId as any as any;
  }

  // Add pagination
  const offset = (params.page - 1) as any * params.limit;
  query = query.range(offset, offset + params.limit - 1);
  const { data, error } = await (query as any;
  if (error) throw error;

  return (data || []).map((item: Event): SearchResult => ({
    id: item.id,
    type: 'event',
    title: item.title || '',
    snippet: item.description || '',
    image: item.featured_image || undefined,
    date: new Date(item.start_date || '').toLocaleDateString(),
    organizer: item.venue_name || undefined,
    location: item.location || '',
    tags: undefined
  }));
};

// Search businesses
const searchBusinesses = async (params: SearchParams): Promise<SearchResult[]> => {
  if (!supabase) throw new Error('Supabase client not initialized');
  let query = (supabase as any.
  from('businesses').
  select('*').
  order('created_at', { ascending: false });

  // Add text search
  if (params.query) {
    query = query.or(`name.ilike.%${params.query}%,description.ilike.%${params.query}%,category.ilike.%${params.query}%`);
  }

  // Add time filter
  const timeFilterDate = getTimeFilterDate(params.timeFilter);
  if (timeFilterDate) {
    query = query.gte('created_at' as any, timeFilterDate as any as any;
  }

  // Add community filter if provided
  if (params.communityId) as any {
    query = query.eq('community_id' as any, params.communityId as any as any;
  }

  // Add pagination
  const offset = (params.page - 1) as any * params.limit;
  query = query.range(offset, offset + params.limit - 1);
  const { data, error } = await (query as any;
  if (error) throw error;

  return (data || []).map((item: Business): SearchResult => ({
    id: item.id,
    type: 'business',
    title: item.name || '',
    snippet: item.description || '',
    image: item.logo_url || item.featured_image || undefined,
    date: new Date(item.created_at || '').toLocaleDateString(),
    location: `${item.address}, ${item.city}`,
    rating: item.rating || undefined,
    reviewCount: item.review_count || undefined,
    hours: 'Contact for hours' // Remove hours field since it doesn't exist
  }));
};

// Search announcements
const searchAnnouncements = async (params: SearchParams): Promise<SearchResult[]> => {
  if (!supabase) throw new Error('Supabase client not initialized');
  let query = (supabase as any.
  from('announcements').
  select('*').
  eq('ai_moderation_passed', true).
  order('created_at', { ascending: false });

  // Add text search
  if (params.query) {
    query = query.or(`full_description.ilike.%${params.query}%,short_description.ilike.%${params.query}%`);
  }

  // Add time filter
  const timeFilterDate = getTimeFilterDate(params.timeFilter);
  if (timeFilterDate) {
    query = query.gte('created_at' as any, timeFilterDate as any as any;
  }

  // Add community filter if provided
  if (params.communityId) as any {
    query = query.eq('community_id' as any, params.communityId as any as any;
  }

  // Add pagination
  const offset = (params.page - 1) as any * params.limit;
  query = query.range(offset, offset + params.limit - 1);
  const { data, error } = await (query as any;
  if (error) throw error;

  return (data || []).map((item: Announcement): SearchResult => ({
    id: item.id,
    type: 'announcement',
    title: 'Announcement', // No title field in announcements table
    snippet: item.full_description || item.short_description || '',
    date: new Date(item.created_at || '').toLocaleDateString(),
    category: item.announcement_type || undefined
  }));
};

// Main search function
export const searchQueries = {
  search: async (params: SearchParams): Promise<SearchResponse> => {
    try {
      let results: SearchResult[] = [];

      // Search based on filter
      if (params.filter === 'all') {
        // Search all content types in parallel
        const [newsResults, eventResults, businessResults, announcementResults] = await Promise.all([
        searchNews(params),
        searchEvents(params),
        searchBusinesses(params),
        searchAnnouncements(params)]
        );

        results = [
        ...newsResults,
        ...eventResults,
        ...businessResults,
        ...announcementResults];

      } else {
        // Search specific content type
        switch (params.filter) {
          case 'news':
            results = await searchNews(params);
            break;
          case 'events':
            results = await searchEvents(params);
            break;
          case 'businesses':
            results = await searchBusinesses(params);
            break;
          case 'announcements':
            results = await searchAnnouncements(params);
            break;
        }
      }

      // Sort results based on sortBy parameter
      if (params.sortBy === 'recent') {
        results.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      } else if (params.sortBy === 'popular' && results.some((r) => r.engagement?.views)) {
        results.sort((a, b) => (b.engagement?.views || 0) - (a.engagement?.views || 0));
      }
      // For 'relevance', keep the database order

      // Calculate pagination info
      const total = results.length;
      const hasMore = total >= params.limit;

      return {
        results,
        total,
        page: params.page,
        hasMore
      };
    } catch (error) {
      console.error('Search error:', error);
      throw error;
    }
  }
};