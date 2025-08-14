import { unstable_cache } from 'next/cache'

// Cache tags for different content types
export const CACHE_TAGS = {
  NEWS: 'news',
  EVENTS: 'events',
  CLASSIFIEDS: 'classifieds',
  ANNOUNCEMENTS: 'announcements',
  DEALS: 'deals',
  PHOTOS: 'photos',
  BUSINESSES: 'businesses',
  AUTHORS: 'authors',
  ALL: 'all-content'
} as const

export type CacheTag = typeof CACHE_TAGS[keyof typeof CACHE_TAGS]

// Default revalidation times in seconds
export const REVALIDATION_TIMES = {
  FREQUENT: 3600,      // 1 hour - for highly dynamic content
  NORMAL: 7200,        // 2 hours - for regular content
  INFREQUENT: 21600,   // 6 hours - for semi-static content
  DAILY: 86400,        // 24 hours - for static content
} as const

// Fetch with Next.js caching
export async function fetchWithCache<T>(
  url: string,
  options: {
    tags?: CacheTag[]
    revalidate?: number
    headers?: HeadersInit
  } = {}
) {
  const {
    tags = [CACHE_TAGS.ALL],
    revalidate = REVALIDATION_TIMES.NORMAL,
    headers = {}
  } = options

  try {
    const response = await fetch(url, {
      next: {
        revalidate,
        tags
      },
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    return data as T
  } catch (error) {
    console.error('Fetch error:', error)
    throw error
  }
}

// Cached database query wrapper
export function cachedQuery<T extends (...args: any[]) => Promise<any>>(
  queryFn: T,
  options: {
    tags?: CacheTag[]
    revalidate?: number
    keyParts?: string[]
  } = {}
) {
  const {
    tags = [CACHE_TAGS.ALL],
    revalidate = REVALIDATION_TIMES.NORMAL,
    keyParts = []
  } = options

  return unstable_cache(
    queryFn,
    keyParts,
    {
      tags,
      revalidate
    }
  ) as T
}

// Example usage for different content types
export const fetchNews = (category?: string) => 
  fetchWithCache('/api/news', {
    tags: [CACHE_TAGS.NEWS],
    revalidate: REVALIDATION_TIMES.NORMAL
  })

export const fetchEvents = () => 
  fetchWithCache('/api/events', {
    tags: [CACHE_TAGS.EVENTS],
    revalidate: REVALIDATION_TIMES.NORMAL
  })

export const fetchBusinesses = () => 
  fetchWithCache('/api/businesses', {
    tags: [CACHE_TAGS.BUSINESSES],
    revalidate: REVALIDATION_TIMES.INFREQUENT
  })