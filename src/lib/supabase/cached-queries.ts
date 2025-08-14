import { cachedQuery, CACHE_TAGS, REVALIDATION_TIMES } from '@/lib/fetch-with-cache'
import { createServerClient } from '@/lib/supabase/server'
import type { Database } from '@/types/database.types'

// Type aliases for better readability
type News = Database['public']['Tables']['news']['Row']
type Event = Database['public']['Tables']['events']['Row']
type Business = Database['public']['Tables']['businesses']['Row']
type Announcement = Database['public']['Tables']['announcements']['Row']

// Cached news queries
export const getCachedNews = cachedQuery(
  async (category?: string) => {
    const supabase = await createServerClient()
    if (!supabase) throw new Error('Supabase client not initialized');

    
    

    
    let query = (supabase as any)
      .from('news')
      .select('*')
      .order('created_at' as any, { ascending: false } as any)
      .limit(50)
    if (category) {
      query = query.eq('category' as any, category as any) as any
    }
    
    const { data, error } = await (query as any)
    if (error) throw error
    return data
  },
  {
    tags: [CACHE_TAGS.NEWS],
    revalidate: REVALIDATION_TIMES.NORMAL, // 2 hours
    keyParts: ['news']
  }
)

// Cached events queries
export const getCachedEvents = cachedQuery(
  async (upcoming: boolean = true) => {
    const supabase = await createServerClient()
    if (!supabase) throw new Error('Supabase client not initialized');

    
    

    
    let query = (supabase as any)
      .from('events')
      .select('*')
      .order('start_date' as any, { ascending: true } as any)
      .limit(20)
    if (upcoming) {
      query = query.gte('start_date' as any, new Date().toISOString() as any as any as any)
    }
    
    const { data, error } = await (query as any)
    if (error) throw error
    return data
  },
  {
    tags: [CACHE_TAGS.EVENTS],
    revalidate: REVALIDATION_TIMES.NORMAL, // 2 hours
    keyParts: ['events']
  }
)

// Cached business directory
export const getCachedBusinesses = cachedQuery(
  async (category?: string) => {
    const supabase = await createServerClient()
    if (!supabase) throw new Error('Supabase client not initialized');

    
    

    
    let query = (supabase as any)
      .from('businesses')
      .select('*')
      .eq('is_active' as any, true as any) as any
      .order('name' as any, { ascending: true } as any)
    if (category) {
      query = query.eq('category' as any, category as any) as any
    }
    
    const { data, error } = await (query as any)
    if (error) throw error
    return data
  },
  {
    tags: [CACHE_TAGS.BUSINESSES],
    revalidate: REVALIDATION_TIMES.INFREQUENT, // 6 hours
    keyParts: ['businesses']
  }
)

// Cached announcements
export const getCachedAnnouncements = cachedQuery(
  async (type?: string) => {
    const supabase = await createServerClient()
    if (!supabase) throw new Error('Supabase client not initialized');

    
    

    
    let query = (supabase as any)
      .from('announcements')
      .select('*')
      .order('created_at' as any, { ascending: false } as any)
      .limit(30)
    if (type) {
      query = query.eq('type' as any, type as any) as any
    }
    
    const { data, error } = await (query as any)
    if (error) throw error
    return data
  },
  {
    tags: [CACHE_TAGS.ANNOUNCEMENTS],
    revalidate: REVALIDATION_TIMES.NORMAL, // 2 hours
    keyParts: ['announcements']
  }
)

// Get trending content (cached for 1 hour)
export const getCachedTrendingContent = cachedQuery(
  async () => {
    const supabase = await createServerClient()
    
    // Get most viewed news from last 24 hours
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    
    const { data: news, error: newsError } = await (supabase as any).from('news')
      .select('*')
      .gte('created_at', yesterday.toISOString() as any)
      .order('view_count' as any, { ascending: false } as any)
      .limit(10)
    if (newsError) throw newsError
    
    const { data: events, error: eventsError } = await (supabase as any).from('events')
      .select('*')
      .gte('start_date' as any, new Date().toISOString() as any as any as any)
      .order('attendee_count' as any, { ascending: false } as any)
      .limit(5)
    if (eventsError) throw eventsError
    
    return { news, events }
  },
  {
    tags: [CACHE_TAGS.NEWS, CACHE_TAGS.EVENTS],
    revalidate: REVALIDATION_TIMES.FREQUENT, // 1 hour
    keyParts: ['trending']
  }
)

// Helper to revalidate specific content types
export async function revalidateContent(type: keyof typeof CACHE_TAGS) {
  const response = await fetch('/api/revalidate?secret=' + process.env.NEXT_PUBLIC_REVALIDATION_SECRET, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      type: 'tag',
      tag: CACHE_TAGS[type]
    })
  })
    if (!response.ok) {
    throw new Error('Failed to revalidate content')
  }
  
  return response.json()
}