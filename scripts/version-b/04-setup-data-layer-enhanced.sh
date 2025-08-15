#!/bin/bash

# Version B - Step 4 Enhanced: Setup Data Layer with Supabase Integration
# Uses database knowledge to create proper queries

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}╔═══════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║     Step 4: Enhanced Data Layer with Supabase             ║${NC}"
echo -e "${BLUE}╚═══════════════════════════════════════════════════════════╝${NC}"
echo ""

# Create data directory
echo -e "${YELLOW}Creating enhanced data layer structure...${NC}"
mkdir -p server/data

# Create Supabase-aware data provider
echo -e "${YELLOW}Creating Supabase data provider...${NC}"
cat > server/data/provider.js << 'EOF'
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
EOF

# Create enhanced data context
echo -e "${YELLOW}Creating enhanced SSR data context...${NC}"
cat > server/data/context.js << 'EOF'
// Enhanced SSR Data Context with community support
import { dataProvider } from './provider.js'
import { getRouteConfig } from '../route-config.js'

export async function getDataForRoute(route, params = {}) {
  const config = getRouteConfig(route)
  if (!config || !config.hasDataFetch) {
    return {}
  }
  
  // Extract community from params or use default
  const communityId = params.community || process.env.DEFAULT_COMMUNITY_ID || 'downtown'
  
  // Route-specific data fetching with actual database queries
  const dataLoaders = {
    '/': async () => await dataProvider.getHomepageData(communityId),
    
    '/news': async () => ({
      articles: await dataProvider.getLatestNews(communityId, 20)
    }),
    
    '/article/:slug': async ({ slug }) => ({
      article: await dataProvider.getNewsArticle(slug),
      relatedArticles: await dataProvider.getLatestNews(communityId, 5)
    }),
    
    '/authors': async () => ({
      authors: await dataProvider.getAuthors(communityId)
    }),
    
    '/events': async () => ({
      todaysEvents: await dataProvider.getTodaysEvents(communityId),
      upcomingEvents: await dataProvider.getUpcomingEvents(communityId, 30)
    }),
    
    '/events/calendar': async () => ({
      events: await dataProvider.getUpcomingEvents(communityId, 60)
    }),
    
    '/event/:slug': async ({ slug }) => ({
      event: await dataProvider.getEvent(slug)
    }),
    
    '/businesses': async () => ({
      businesses: await dataProvider.getBusinesses(communityId),
      categories: await dataProvider.getCategories()
    }),
    
    '/business/:slug': async ({ slug }) => ({
      business: await dataProvider.getBusiness(slug),
      nearbyBusinesses: await dataProvider.getBusinesses(communityId, null, 6)
    }),
    
    '/deals': async () => ({
      deals: await dataProvider.getActiveDeals(communityId)
    }),
    
    '/classifieds': async () => ({
      listings: await dataProvider.getClassifieds(communityId)
    }),
    
    '/announcements': async () => ({
      announcements: await dataProvider.getAnnouncements(communityId)
    }),
    
    '/memorials': async () => ({
      memorials: await dataProvider.getMemorials(communityId)
    }),
    
    '/search': async ({ q }) => ({
      results: await dataProvider.searchContent(communityId, q)
    }),
    
    '/hub/:slug': async ({ slug }) => ({
      hub: await dataProvider.getHub(slug),
      popularHubs: await dataProvider.getHubs(communityId)
    })
  }
  
  // Handle community-scoped routes
  const normalizedRoute = route.replace(/^\/[^/]+/, '') || '/'
  
  // Find matching loader
  for (const [pattern, loader] of Object.entries(dataLoaders)) {
    if (matchRoute(normalizedRoute, pattern) || matchRoute(route, pattern)) {
      try {
        const data = await loader(params)
        return {
          ...data,
          community: { id: communityId }
        }
      } catch (error) {
        console.error(`Error loading data for ${route}:`, error)
        return { error: error.message, community: { id: communityId } }
      }
    }
  }
  
  return { community: { id: communityId } }
}

function matchRoute(route, pattern) {
  if (pattern === route) return true
  
  if (pattern.includes(':')) {
    const regex = new RegExp('^' + pattern.replace(/:[^/]+/g, '([^/]+)') + '$')
    const match = route.match(regex)
    
    if (match) {
      // Extract params
      const paramNames = pattern.match(/:([^/]+)/g)?.map(p => p.slice(1)) || []
      const params = {}
      paramNames.forEach((name, i) => {
        params[name] = match[i + 1]
      })
      return params
    }
  }
  
  return false
}

// Helper to extract route params
export function extractRouteParams(route, pattern) {
  const params = matchRoute(route, pattern)
  return typeof params === 'object' ? params : {}
}
EOF

# Create cache invalidation handlers
echo -e "${YELLOW}Creating cache invalidation system...${NC}"
cat > server/data/invalidation.js << 'EOF'
// Cache invalidation based on database webhooks
import { getInvalidationTargets } from '../route-config.js'

export class InvalidationHandler {
  constructor(isrEngine) {
    this.isr = isrEngine
  }

  async handleWebhook(req, res) {
    const { type, action, data } = req.body
    
    if (!type || !action) {
      return res.status(400).json({ error: 'Type and action required' })
    }
    
    try {
      const routes = getInvalidationTargets(type, action, data)
      
      // Add community-scoped versions
      const communityRoutes = []
      if (data.community_id) {
        routes.forEach(route => {
          if (!route.startsWith('/admin')) {
            communityRoutes.push(`/${data.community_id}${route}`)
          }
        })
      }
      
      const allRoutes = [...routes, ...communityRoutes]
      
      // Trigger revalidation for all affected routes
      const results = await Promise.all(
        allRoutes.map(route => this.isr.revalidate(route))
      )
      
      res.json({
        success: true,
        revalidated: allRoutes,
        results
      })
    } catch (error) {
      console.error('Invalidation error:', error)
      res.status(500).json({ error: error.message })
    }
  }

  // Specific invalidation methods
  async invalidateNews(articleSlug, authorId, communityId) {
    const routes = [
      `/article/${articleSlug}`,
      '/news',
      '/',
      `/author/${authorId}`,
      `/${communityId}/article/${articleSlug}`,
      `/${communityId}/news`,
      `/${communityId}`
    ]
    
    return Promise.all(routes.map(r => this.isr.revalidate(r)))
  }

  async invalidateEvent(eventSlug, communityId) {
    const routes = [
      `/event/${eventSlug}`,
      '/events',
      '/events/calendar',
      '/',
      `/${communityId}/event/${eventSlug}`,
      `/${communityId}/events`
    ]
    
    return Promise.all(routes.map(r => this.isr.revalidate(r)))
  }

  async invalidateBusiness(businessSlug, communityId) {
    const routes = [
      `/business/${businessSlug}`,
      '/businesses',
      '/deals',
      `/${communityId}/business/${businessSlug}`,
      `/${communityId}/businesses`
    ]
    
    return Promise.all(routes.map(r => this.isr.revalidate(r)))
  }
}
EOF

# Create API routes with Supabase integration
echo -e "${YELLOW}Creating API routes...${NC}"
cat > server/api.js << 'EOF'
import express from 'express'
import { dataProvider } from './data/provider.js'
import { InvalidationHandler } from './data/invalidation.js'

const router = express.Router()

// Health check with cache stats
router.get('/health', async (req, res) => {
  const stats = await req.app.locals.isr?.cache.stats()
  res.json({ 
    status: 'ok',
    cache: stats,
    database: USE_SUPABASE ? 'supabase' : 'mock',
    timestamp: new Date().toISOString()
  })
})

// News endpoints
router.get('/news', async (req, res) => {
  try {
    const { community = 'downtown', limit = 20 } = req.query
    const articles = await dataProvider.getLatestNews(community, parseInt(limit))
    res.json(articles)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

router.get('/news/:slug', async (req, res) => {
  try {
    const article = await dataProvider.getNewsArticle(req.params.slug)
    if (!article) {
      return res.status(404).json({ error: 'Article not found' })
    }
    res.json(article)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Events endpoints
router.get('/events', async (req, res) => {
  try {
    const { community = 'downtown', days = 7 } = req.query
    const events = await dataProvider.getUpcomingEvents(community, parseInt(days))
    res.json(events)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

router.get('/events/today', async (req, res) => {
  try {
    const { community = 'downtown' } = req.query
    const events = await dataProvider.getTodaysEvents(community)
    res.json(events)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Business endpoints
router.get('/businesses', async (req, res) => {
  try {
    const { community = 'downtown', category, limit = 20 } = req.query
    const businesses = await dataProvider.getBusinesses(community, category, parseInt(limit))
    res.json(businesses)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

router.get('/businesses/:slug', async (req, res) => {
  try {
    const business = await dataProvider.getBusiness(req.params.slug)
    if (!business) {
      return res.status(404).json({ error: 'Business not found' })
    }
    res.json(business)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Deals endpoint
router.get('/deals', async (req, res) => {
  try {
    const { community = 'downtown' } = req.query
    const deals = await dataProvider.getActiveDeals(community)
    res.json(deals)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Search endpoint
router.get('/search', async (req, res) => {
  try {
    const { q, community = 'downtown', type = 'all' } = req.query
    if (!q) {
      return res.status(400).json({ error: 'Query parameter required' })
    }
    const results = await dataProvider.searchContent(community, q, type)
    res.json(results)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Webhook for cache invalidation
router.post('/webhook/invalidate', (req, res) => {
  const handler = new InvalidationHandler(req.app.locals.isr)
  handler.handleWebhook(req, res)
})

// Community list endpoint
router.get('/communities', async (req, res) => {
  try {
    const { data } = await dataProvider.supabase
      .from('communities')
      .select('id, name, slug')
      .eq('is_active', true)
    
    res.json(data || [])
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

export default router
EOF

# Update .env template with database knowledge
echo -e "${YELLOW}Updating .env template...${NC}"
cat > .env.example << 'EOF'
# Supabase Configuration
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key

# Default Community (for non-scoped routes)
DEFAULT_COMMUNITY_ID=downtown

# Server Configuration
PORT=3000
NODE_ENV=development

# Cache Configuration
CACHE_DIR=./cache
DEFAULT_TTL=300
MAX_WORKERS=2

# Feature Flags
ENABLE_COMMUNITY_ROUTES=true
ENABLE_SEARCH=true
ENABLE_REAL_TIME=false
EOF

echo -e "${GREEN}✅ Enhanced data layer setup complete!${NC}"
echo -e "${BLUE}Database integration ready with:${NC}"
echo "   - Supabase queries for all major entities"
echo "   - Community-scoped routing support"
echo "   - Cache invalidation webhooks"
echo "   - Search functionality"
echo "   - Proper relationships and joins"
echo -e "${BLUE}Next: Run ./05-build-and-run-enhanced.sh${NC}"