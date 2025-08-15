// Enhanced Data Provider with Supabase and database knowledge
import { createClient } from '@supabase/supabase-js'

const USE_SUPABASE = process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY

let supabase
if (USE_SUPABASE) {
  supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
  )
}

export class DataProvider {
  constructor() {
    this.supabase = supabase
  }

  // News queries based on database schema
  async getLatestNews(communityId, limit = 10) {
    if (!USE_SUPABASE) return this.getMockNews(limit)
    
    const { data, error } = await supabase
      .from('news')
      .select(`
        id, slug, title, content, publication_date, 
        view_count, status, community_id,
        author:users!author_id(id, name, avatar_url)
      `)
      .eq('community_id', communityId)
      .eq('status', 'published')
      .lte('publication_date', new Date().toISOString())
      .order('publication_date', { ascending: false })
      .limit(limit)
    
    if (error) throw error
    return data
  }

  async getNewsArticle(slug) {
    if (!USE_SUPABASE) return this.getMockArticle(slug)
    
    const { data, error } = await supabase
      .from('news')
      .select(`
        *, 
        author:users!author_id(id, name, avatar_url, bio),
        community:communities!community_id(id, name, slug)
      `)
      .eq('slug', slug)
      .eq('status', 'published')
      .single()
    
    if (error) throw error
    
    // Increment view count (fire and forget)
    supabase
      .from('news')
      .update({ view_count: data.view_count + 1 })
      .eq('id', data.id)
      .then(() => {})
    
    return data
  }

  // Events with RSVP counts
  async getUpcomingEvents(communityId, days = 7) {
    if (!USE_SUPABASE) return this.getMockEvents()
    
    const endDate = new Date()
    endDate.setDate(endDate.getDate() + days)
    
    const { data, error } = await supabase
      .from('events')
      .select(`
        *,
        category:event_categories!category_id(*),
        rsvp_count:event_rsvps(count)
      `)
      .eq('community_id', communityId)
      .gte('start_date', new Date().toISOString())
      .lte('start_date', endDate.toISOString())
      .order('start_date', { ascending: true })
    
    if (error) throw error
    
    // Transform RSVP count
    return data.map(event => ({
      ...event,
      rsvp_count: event.rsvp_count?.[0]?.count || 0
    }))
  }

  async getTodaysEvents(communityId) {
    if (!USE_SUPABASE) return this.getMockEvents()
    
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    
    const { data, error } = await supabase
      .from('events')
      .select(`
        *,
        category:event_categories!category_id(name, slug),
        rsvp_count:event_rsvps(count)
      `)
      .eq('community_id', communityId)
      .gte('start_date', today.toISOString())
      .lt('start_date', tomorrow.toISOString())
      .order('start_time')
    
    if (error) throw error
    
    return data.map(event => ({
      ...event,
      rsvp_count: event.rsvp_count?.[0]?.count || 0
    }))
  }

  async getEvent(slug) {
    if (!USE_SUPABASE) return this.getMockEvent(slug)
    
    const { data, error } = await supabase
      .from('events')
      .select(`
        *,
        category:event_categories!category_id(*),
        rsvps:event_rsvps(
          user:users!user_id(id, name, avatar_url)
        ),
        hub_associations:event_hub_associations(
          hub:interest_hubs!hub_id(id, name, slug)
        )
      `)
      .eq('slug', slug)
      .single()
    
    if (error) throw error
    return data
  }

  // Business directory with ratings
  async getBusinesses(communityId, category = null, limit = 20) {
    if (!USE_SUPABASE) return this.getMockBusinesses()
    
    let query = supabase
      .from('businesses')
      .select(`
        *,
        category:categories!category_id(name, slug),
        reviews(rating)
      `)
      .eq('community_id', communityId)
      .eq('is_active', true)
    
    if (category) {
      query = query.eq('category_id', category)
    }
    
    const { data, error } = await query.limit(limit)
    
    if (error) throw error
    
    // Calculate average ratings
    return data.map(business => {
      const ratings = business.reviews?.map(r => r.rating) || []
      const avgRating = ratings.length > 0 
        ? ratings.reduce((a, b) => a + b, 0) / ratings.length 
        : null
      
      return {
        ...business,
        average_rating: avgRating,
        review_count: ratings.length,
        reviews: undefined // Remove individual reviews
      }
    })
  }

  async getBusiness(slug) {
    if (!USE_SUPABASE) return this.getMockBusiness(slug)
    
    const { data, error } = await supabase
      .from('businesses')
      .select(`
        *,
        category:categories!category_id(*),
        business_hours(*),
        business_photos(*),
        owner:users!owner_id(id, name),
        reviews(
          *,
          user:users!user_id(id, name, avatar_url),
          photos:review_photos(*),
          votes:review_votes(vote)
        ),
        deals(*)
      `)
      .eq('slug', slug)
      .single()
    
    if (error) throw error
    
    // Calculate ratings and organize hours
    const ratings = data.reviews?.map(r => r.rating) || []
    data.average_rating = ratings.length > 0 
      ? ratings.reduce((a, b) => a + b, 0) / ratings.length 
      : null
    data.review_count = ratings.length
    
    // Group business hours by day
    data.hours_by_day = data.business_hours?.reduce((acc, hour) => {
      acc[hour.day_of_week] = hour
      return acc
    }, {})
    
    return data
  }

  // Active deals
  async getActiveDeals(communityId) {
    if (!USE_SUPABASE) return this.getMockDeals()
    
    const { data, error } = await supabase
      .from('deals')
      .select(`
        *,
        business:businesses!business_id(
          id, name, slug, 
          category:categories!category_id(name)
        )
      `)
      .eq('is_active', true)
      .lte('valid_from', new Date().toISOString())
      .gte('valid_until', new Date().toISOString())
      .eq('business.community_id', communityId)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  }

  // Marketplace/Classifieds
  async getClassifieds(communityId, category = null, limit = 20) {
    if (!USE_SUPABASE) return this.getMockClassifieds()
    
    let query = supabase
      .from('marketplace_listings')
      .select(`
        *,
        user:users!user_id(id, name, avatar_url)
      `)
      .eq('community_id', communityId)
      .eq('status', 'active')
    
    if (category) {
      query = query.eq('category', category)
    }
    
    const { data, error } = await query
      .order('created_at', { ascending: false })
      .limit(limit)
    
    if (error) throw error
    return data
  }

  // Announcements
  async getAnnouncements(communityId, type = null) {
    if (!USE_SUPABASE) return this.getMockAnnouncements()
    
    let query = supabase
      .from('announcements')
      .select(`
        *,
        author:users!author_id(id, name)
      `)
      .eq('community_id', communityId)
      .eq('status', 'published')
    
    if (type) {
      query = query.eq('type', type)
    }
    
    const { data, error } = await query
      .order('priority', { ascending: false })
      .order('publication_date', { ascending: false })
      .limit(10)
    
    if (error) throw error
    return data
  }

  // Interest Hubs
  async getHubs(communityId) {
    if (!USE_SUPABASE) return this.getMockHubs()
    
    const { data, error } = await supabase
      .from('interest_hubs')
      .select(`
        *,
        member_count:hub_members(count),
        recent_posts:hub_posts(
          id, title, created_at,
          author:users!author_id(name)
        )
      `)
      .eq('community_id', communityId)
      .eq('is_active', true)
      .order('member_count', { ascending: false })
      .limit(3, { referencedTable: 'hub_posts' })
    
    if (error) throw error
    
    return data.map(hub => ({
      ...hub,
      member_count: hub.member_count?.[0]?.count || 0
    }))
  }

  async getHub(slug) {
    if (!USE_SUPABASE) return this.getMockHub(slug)
    
    const { data, error } = await supabase
      .from('interest_hubs')
      .select(`
        *,
        members:hub_members(
          user:users!user_id(id, name, avatar_url),
          role
        ),
        posts:hub_posts(
          *,
          author:users!author_id(id, name, avatar_url),
          comment_count:hub_comments(count)
        )
      `)
      .eq('slug', slug)
      .single()
    
    if (error) throw error
    
    // Transform comment counts
    data.posts = data.posts?.map(post => ({
      ...post,
      comment_count: post.comment_count?.[0]?.count || 0
    }))
    
    return data
  }

  // Memorials
  async getMemorials(communityId, limit = 20) {
    if (!USE_SUPABASE) return []
    
    const { data, error } = await supabase
      .from('memorials')
      .select(`
        *,
        guestbook_count:memorial_guestbook(count)
      `)
      .eq('community_id', communityId)
      .order('death_date', { ascending: false })
      .limit(limit)
    
    if (error) throw error
    
    return data.map(memorial => ({
      ...memorial,
      guestbook_count: memorial.guestbook_count?.[0]?.count || 0
    }))
  }

  // Authors with article counts
  async getAuthors(communityId) {
    if (!USE_SUPABASE) return []
    
    const { data, error } = await supabase
      .from('users')
      .select(`
        id, name, username, avatar_url, bio,
        articles:news!author_id(count)
      `)
      .eq('role', 'author')
      .eq('articles.community_id', communityId)
      .order('articles.count', { ascending: false })
    
    if (error) throw error
    
    return data.map(author => ({
      ...author,
      article_count: author.articles?.[0]?.count || 0
    }))
  }

  // Search functionality
  async searchContent(communityId, query, type = 'all') {
    if (!USE_SUPABASE) return { news: [], businesses: [], events: [] }
    
    const results = {}
    
    if (type === 'all' || type === 'news') {
      const { data } = await supabase
        .from('news')
        .select('id, slug, title, excerpt, publication_date')
        .eq('community_id', communityId)
        .textSearch('title', query)
        .limit(10)
      
      results.news = data || []
    }
    
    if (type === 'all' || type === 'businesses') {
      const { data } = await supabase
        .from('businesses')
        .select('id, slug, name, description')
        .eq('community_id', communityId)
        .textSearch('name', query)
        .limit(10)
      
      results.businesses = data || []
    }
    
    if (type === 'all' || type === 'events') {
      const { data } = await supabase
        .from('events')
        .select('id, slug, title, start_date')
        .eq('community_id', communityId)
        .textSearch('title', query)
        .limit(10)
      
      results.events = data || []
    }
    
    return results
  }

  // Homepage aggregates
  async getHomepageData(communityId) {
    if (!USE_SUPABASE) return this.getMockHomepageData()
    
    const [news, events, announcements, businesses] = await Promise.all([
      this.getLatestNews(communityId, 5),
      this.getTodaysEvents(communityId),
      this.getAnnouncements(communityId),
      this.getBusinesses(communityId, null, 6)
    ])
    
    return {
      featuredNews: news[0],
      latestNews: news.slice(1),
      todaysEvents: events,
      announcements: announcements.slice(0, 3),
      featuredBusinesses: businesses
    }
  }

  // Mock data methods (fallbacks)
  getMockNews(limit) {
    return Array.from({ length: limit }, (_, i) => ({
      id: i + 1,
      slug: `news-article-${i + 1}`,
      title: `News Article ${i + 1}`,
      excerpt: 'Lorem ipsum dolor sit amet...',
      content: '<p>Full article content...</p>',
      publication_date: new Date(Date.now() - i * 86400000).toISOString(),
      author: { name: 'John Doe', avatar_url: null },
      view_count: Math.floor(Math.random() * 1000)
    }))
  }

  getMockArticle(slug) {
    return {
      id: 1,
      slug,
      title: 'Sample Article',
      content: '<p>Article content here...</p>',
      publication_date: new Date().toISOString(),
      author: { id: 1, name: 'John Doe', bio: 'Staff writer' },
      community: { id: 1, name: 'Downtown', slug: 'downtown' }
    }
  }

  getMockEvents() {
    return Array.from({ length: 5 }, (_, i) => ({
      id: i + 1,
      slug: `event-${i + 1}`,
      title: `Community Event ${i + 1}`,
      start_date: new Date(Date.now() + i * 86400000).toISOString(),
      venue: 'Community Center',
      rsvp_count: Math.floor(Math.random() * 50)
    }))
  }

  getMockBusinesses() {
    return Array.from({ length: 10 }, (_, i) => ({
      id: i + 1,
      slug: `business-${i + 1}`,
      name: `Local Business ${i + 1}`,
      category: { name: 'Restaurant' },
      average_rating: 3 + Math.random() * 2,
      review_count: Math.floor(Math.random() * 100)
    }))
  }

  getMockHomepageData() {
    return {
      featuredNews: this.getMockNews(1)[0],
      latestNews: this.getMockNews(4),
      todaysEvents: this.getMockEvents(),
      announcements: [],
      featuredBusinesses: this.getMockBusinesses()
    }
  }
}

// Singleton instance
export const dataProvider = new DataProvider()
