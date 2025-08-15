import express from 'express'
import { ISRMiddleware } from './isr/isr-middleware.js'

const app = express()
const isProduction = process.env.NODE_ENV === 'production'

// Initialize ISR
const isr = new ISRMiddleware({
  cacheDir: './cache',
  defaultTTL: 300,
  maxWorkers: 2
})

// Serve static files in production
if (isProduction) {
  app.use(express.static('dist/client'))
}

// API endpoint for on-demand revalidation
app.post('/api/revalidate', express.json(), async (req, res) => {
  const { route } = req.body
  
  if (!route) {
    return res.status(400).json({ error: 'Route is required' })
  }
  
  const result = await isr.revalidate(route)
  res.json(result)
})

// ISR middleware for all routes
app.get('*', (req, res, next) => isr.handle(req, res, next))

const port = process.env.PORT || 3000
app.listen(port, () => {
  console.log(`ISR Server running at http://localhost:${port}`)
})
