#!/bin/bash

# Version B - Step 4: Setup Data Layer
# Integrates with existing Supabase or creates mock data

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}╔═══════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║     Step 4: Setting Up Data Layer                         ║${NC}"
echo -e "${BLUE}╚═══════════════════════════════════════════════════════════╝${NC}"
echo ""

# Create data directory
echo -e "${YELLOW}Creating data layer structure...${NC}"
mkdir -p server/data

# Check if Supabase exists
if [ -f "src/lib/supabase.ts" ] || [ -f "lib/supabase.js" ]; then
  echo -e "${GREEN}✓ Found existing Supabase configuration${NC}"
  USING_SUPABASE=true
else
  echo -e "${YELLOW}No Supabase found, creating mock data layer${NC}"
  USING_SUPABASE=false
fi

# Create data provider
echo -e "${YELLOW}Creating data provider...${NC}"
cat > server/data/provider.js << 'EOF'
// Data provider abstraction
import { createClient } from '@supabase/supabase-js'

const USE_SUPABASE = process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY

let supabase
if (USE_SUPABASE) {
  supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_ANON_KEY
  )
}

// Mock data fallback
const mockData = {
  articles: [
    {
      id: 1,
      slug: 'breaking-news-story',
      title: 'Breaking: Major Development in Local Community',
      excerpt: 'Important news affecting our community...',
      content: '<p>Full article content here...</p>',
      author: { name: 'Jane Smith', id: 1 },
      publishedAt: new Date().toISOString(),
      category: 'news',
      imageUrl: 'https://source.unsplash.com/800x600/?news'
    }
  ],
  
  events: [
    {
      id: 1,
      title: 'Community Festival',
      date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      location: 'Central Park',
      description: 'Annual community festival with food, music, and activities'
    }
  ],
  
  classifieds: [
    {
      id: 1,
      title: 'Used Car for Sale',
      price: 5000,
      category: 'automotive',
      description: 'Well-maintained vehicle, low mileage'
    }
  ]
}

export class DataProvider {
  async getArticles(limit = 10) {
    if (USE_SUPABASE) {
      const { data, error } = await supabase
        .from('articles')
        .select('*')
        .order('publishedAt', { ascending: false })
        .limit(limit)
      
      if (error) throw error
      return data
    }
    
    return mockData.articles.slice(0, limit)
  }
  
  async getArticle(slug) {
    if (USE_SUPABASE) {
      const { data, error } = await supabase
        .from('articles')
        .select('*')
        .eq('slug', slug)
        .single()
      
      if (error) throw error
      return data
    }
    
    return mockData.articles.find(a => a.slug === slug)
  }
  
  async getEvents(limit = 10) {
    if (USE_SUPABASE) {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .gte('date', new Date().toISOString())
        .order('date', { ascending: true })
        .limit(limit)
      
      if (error) throw error
      return data
    }
    
    return mockData.events.slice(0, limit)
  }
  
  async getEvent(id) {
    if (USE_SUPABASE) {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('id', id)
        .single()
      
      if (error) throw error
      return data
    }
    
    return mockData.events.find(e => e.id === parseInt(id))
  }
  
  async getClassifieds(category, limit = 20) {
    if (USE_SUPABASE) {
      let query = supabase.from('classifieds').select('*')
      
      if (category) {
        query = query.eq('category', category)
      }
      
      const { data, error } = await query
        .order('createdAt', { ascending: false })
        .limit(limit)
      
      if (error) throw error
      return data
    }
    
    return category 
      ? mockData.classifieds.filter(c => c.category === category)
      : mockData.classifieds.slice(0, limit)
  }
  
  // Add more methods as needed
  async getAuthors() {
    // Implementation
  }
  
  async getAuthor(id) {
    // Implementation
  }
  
  async getMemorials() {
    // Implementation
  }
}

// Singleton instance
export const dataProvider = new DataProvider()
EOF

# Create data context for SSR
echo -e "${YELLOW}Creating SSR data context...${NC}"
cat > server/data/context.js << 'EOF'
// SSR Data Context
import { dataProvider } from './provider.js'
import { getRouteConfig } from '../route-config.js'

export async function getDataForRoute(route, params = {}) {
  const config = getRouteConfig(route)
  if (!config || !config.hasDataFetch) {
    return {}
  }
  
  // Route-specific data fetching
  const dataLoaders = {
    '/': async () => ({
      articles: await dataProvider.getArticles(10),
      events: await dataProvider.getEvents(5)
    }),
    
    '/article/:slug': async ({ slug }) => ({
      article: await dataProvider.getArticle(slug)
    }),
    
    '/authors': async () => ({
      authors: await dataProvider.getAuthors()
    }),
    
    '/author/:id': async ({ id }) => ({
      author: await dataProvider.getAuthor(id),
      articles: await dataProvider.getArticlesByAuthor(id)
    }),
    
    '/events': async () => ({
      events: await dataProvider.getEvents(20)
    }),
    
    '/event/:id': async ({ id }) => ({
      event: await dataProvider.getEvent(id)
    }),
    
    '/classifieds': async () => ({
      classifieds: await dataProvider.getClassifieds()
    }),
    
    '/memorials': async () => ({
      memorials: await dataProvider.getMemorials()
    })
  }
  
  // Find matching loader
  for (const [pattern, loader] of Object.entries(dataLoaders)) {
    if (matchRoute(route, pattern)) {
      try {
        return await loader(params)
      } catch (error) {
        console.error(`Error loading data for ${route}:`, error)
        return { error: error.message }
      }
    }
  }
  
  return {}
}

function matchRoute(route, pattern) {
  if (pattern === route) return true
  
  if (pattern.includes(':')) {
    const regex = new RegExp('^' + pattern.replace(/:[^/]+/g, '[^/]+') + '$')
    return regex.test(route)
  }
  
  return false
}
EOF

# Update render function to include data
echo -e "${YELLOW}Updating render function with data layer...${NC}"
cat >> server/render.js << 'EOF'

// Import data context
import { getDataForRoute } from './data/context.js'

// Update renderRoute to fetch data
export async function renderRouteWithData(route, params = {}) {
  // Fetch data for the route
  const data = await getDataForRoute(route, params)
  
  let template, render
  
  if (!isProduction) {
    template = fs.readFileSync(
      path.resolve(__dirname, '../index.html'),
      'utf-8'
    )
    template = await vite.transformIndexHtml(route, template)
    render = (await vite.ssrLoadModule('/src/entry/entry-server.jsx')).render
  } else {
    template = fs.readFileSync(
      path.resolve(__dirname, '../dist/client/index.html'),
      'utf-8'
    )
    render = (await import('../dist/server/entry-server.js')).render
  }
  
  // Pass data to render
  const context = { ...data, route, params }
  const { html } = render(route, context)
  
  // Replace placeholders
  const finalHtml = template
    .replace('<!--ssr-html-->', html)
    .replace('<!--ssr-title-->', context.title || 'DayNews')
    .replace('<!--ssr-description-->', context.description || '')
    .replace('<!--ssr-data-->', JSON.stringify(context))
  
  return { html: finalHtml, context }
}

// Keep original for backward compatibility
export { renderRouteWithData as renderRoute }
EOF

# Create API routes
echo -e "${YELLOW}Creating API routes...${NC}"
cat > server/api.js << 'EOF'
import express from 'express'
import { dataProvider } from './data/provider.js'

const router = express.Router()

// Articles
router.get('/articles', async (req, res) => {
  try {
    const { limit = 10, category } = req.query
    const articles = await dataProvider.getArticles(parseInt(limit))
    res.json(articles)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

router.get('/articles/:slug', async (req, res) => {
  try {
    const article = await dataProvider.getArticle(req.params.slug)
    if (!article) {
      return res.status(404).json({ error: 'Article not found' })
    }
    res.json(article)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Events
router.get('/events', async (req, res) => {
  try {
    const { limit = 10 } = req.query
    const events = await dataProvider.getEvents(parseInt(limit))
    res.json(events)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Add more endpoints as needed

export default router
EOF

# Create .env template if it doesn't exist
if [ ! -f ".env" ] && [ ! -f ".env.local" ]; then
  echo -e "${YELLOW}Creating .env template...${NC}"
  cat > .env.example << 'EOF'
# Supabase (optional - will use mock data if not provided)
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key

# Server
PORT=3000
NODE_ENV=development
EOF
  echo -e "${YELLOW}Created .env.example - copy to .env and add your credentials${NC}"
fi

echo -e "${GREEN}✅ Data layer setup complete!${NC}"
echo -e "${BLUE}Next: Run ./05-build-and-run.sh${NC}"