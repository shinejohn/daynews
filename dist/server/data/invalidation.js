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
