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
