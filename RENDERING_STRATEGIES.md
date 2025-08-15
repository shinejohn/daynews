# Rendering Strategies for DayNews

## Overview
This news website uses different rendering strategies optimized for content type:

### ISR (Incremental Static Regeneration) - 5 minutes
Used for frequently updated content:
- Homepage
- News sections (national, sports, life, opinion)
- Community content (announcements, events, memorials)
- Photo galleries
- Trending content

### SSG (Static Site Generation) - 24 hours
Used for rarely changing content:
- About pages
- Legal pages (privacy, terms, cookies)
- Contact information
- Career pages

### Dynamic (Server-Side Rendering)
Used for personalized or real-time content:
- Search results
- User profiles
- Admin dashboards
- Settings pages

### Dynamic with Params
Used for content with dynamic routes:
- Individual articles
- Author profiles
- Business pages

## Benefits
- **SEO**: All content pages are pre-rendered for search engines
- **Performance**: Static content loads instantly
- **Freshness**: News content updates every 5 minutes
- **Scalability**: Most pages are served from CDN

## Customization
Edit `scripts/fix-rendering-strategies.js` to adjust revalidation times or strategies.
