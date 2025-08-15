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
